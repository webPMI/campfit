/**
 * 🔒 CRÍTICO: Motor de Análisis Biométrico y Fisiológico de Rendimiento (CampFit Analytics Engine).
 * Procesa tendencias biológicas, readiness diario, correlación cortisol/sueño y validación de seguridad de inputs.
 */

import type { ProgressLog, BioFeedback } from './progressService';

export interface DataPoint {
  date: Date;
  value: number;
}

export interface MovingAveragePoint {
  date: Date;
  rawValue: number;
  movingAverage: number;
}

export interface ReadinessEvaluation {
  score: number; // 0 - 100
  level: 'optimal' | 'good' | 'moderate' | 'recovery_needed';
  label: string;
  colorClass: string;
  recommendation: string;
}

export interface CortisolAlertResult {
  hasAlert: boolean;
  message?: string;
  avgStress?: number;
  avgSleep?: number;
}

export interface WeightValidationResult {
  isValid: boolean;
  percentageDiff: number;
  isSignificantChange: boolean;
  warning?: string;
}

/**
 * Normaliza cualquier tipo de fecha Firestore/Date/String a objeto Date nativo.
 */
export function normalizeLogDate(logDate: any): Date {
  if (logDate && typeof logDate.toDate === 'function') return logDate.toDate();
  if (logDate instanceof Date) return logDate;
  if (typeof logDate === 'string' || typeof logDate === 'number') return new Date(logDate);
  return new Date();
}

/**
 * 🔒 CRÍTICO: Calcula el promedio móvil de N días para filtrar la retención de líquidos y ruido biológico.
 */
export function calculateMovingAverage(
  points: DataPoint[],
  windowDays: number = 7
): MovingAveragePoint[] {
  if (!points || points.length === 0) return [];

  // Ordenar cronológicamente ascendente
  const sorted = [...points].sort((a, b) => a.date.getTime() - b.date.getTime());
  const result: MovingAveragePoint[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    if (!current) continue;

    const windowStart = new Date(current.date.getTime() - (windowDays - 1) * 24 * 60 * 60 * 1000);

    // Filtrar puntos que caen dentro de la ventana de tiempo
    const windowPoints = sorted.filter(
      p => p.date.getTime() >= windowStart.getTime() && p.date.getTime() <= current.date.getTime()
    );

    const sum = windowPoints.reduce((acc, p) => acc + p.value, 0);
    const avg = windowPoints.length > 0 ? sum / windowPoints.length : current.value;

    result.push({
      date: current.date,
      rawValue: Math.round(current.value * 10) / 10,
      movingAverage: Math.round(avg * 10) / 10,
    });
  }

  return result;
}

/**
 * 🔒 CRÍTICO: Algoritmo de Daily Readiness Score (0-100) basado en biometría y bio-feedback.
 * Evalúa Sueño (35%), Energía (25%), Nivel de Estrés (20%), Agujetas/DOMS (10%) e Hidratación (10%).
 */
export function calculateReadinessScore(feedback: BioFeedback): ReadinessEvaluation {
  let score = 0;

  // 1. Sueño (Horas y Calidad) - Max 35 pts
  const sleepHours = feedback.sleepHours ?? 7.5;
  const sleepQuality = feedback.sleepQuality ?? 4;

  let sleepScore = 0;
  if (sleepHours >= 7 && sleepHours <= 9) sleepScore += 20;
  else if (sleepHours >= 6) sleepScore += 14;
  else if (sleepHours >= 5) sleepScore += 8;
  else sleepScore += 4;

  sleepScore += (sleepQuality / 5) * 15;
  score += Math.min(35, sleepScore);

  // 2. Nivel de Energía (1-10) - Max 25 pts
  const energy = feedback.energyLevel ?? 7;
  score += (Math.max(1, Math.min(10, energy)) / 10) * 25;

  // 3. Nivel de Estrés Percibido (1-10, invertido) - Max 20 pts
  const stress = feedback.stressLevel ?? 3;
  const stressInverted = 11 - Math.max(1, Math.min(10, stress));
  score += (stressInverted / 10) * 20;

  // 4. Agujetas / DOMS - Max 10 pts
  const doms = feedback.doms ?? 'mild';
  if (doms === 'none') score += 10;
  else if (doms === 'mild') score += 8;
  else if (doms === 'moderate') score += 5;
  else score += 2; // severe

  // 5. Hidratación - Max 10 pts
  const water = feedback.waterLitres ?? 2.5;
  if (water >= 2.5) score += 10;
  else if (water >= 1.8) score += 7;
  else if (water >= 1.0) score += 4;
  else score += 2;

  const finalScore = Math.round(Math.max(0, Math.min(100, score)));

  if (finalScore >= 85) {
    return {
      score: finalScore,
      level: 'optimal',
      label: 'Óptimo (High Performance)',
      colorClass: 'text-emerald-400',
      recommendation: 'Sistema nervioso totalmente recuperado. Excelente día para máxima intensidad o récord personal (PR).',
    };
  } else if (finalScore >= 70) {
    return {
      score: finalScore,
      level: 'good',
      label: 'Bueno (Ready to Train)',
      colorClass: 'text-cyan-400',
      recommendation: 'Capacidad de rendimiento óptima para completar la sesión programada según lo previsto.',
    };
  } else if (finalScore >= 50) {
    return {
      score: finalScore,
      level: 'moderate',
      label: 'Moderado (Manage Volume)',
      colorClass: 'text-amber-400',
      recommendation: 'Ligera fatiga acumulada. Concéntrate en técnica y evita llegar al fallo muscular absoluto.',
    };
  } else {
    return {
      score: finalScore,
      level: 'recovery_needed',
      label: 'Recuperación Requerida (Deload / Rest)',
      colorClass: 'text-rose-400',
      recommendation: 'Marcadores de estrés o déficit de sueño elevados. Se recomienda sesión regenerativa o descanso activo.',
    };
  }
}

/**
 * 🔒 CRÍTICO: Detecta si un estancamiento en el peso se debe a cortisol elevado (estrés alto y mal descanso).
 */
export function detectCortisolRetentionAlert(
  weightLogs: ProgressLog[],
  bioLogs: ProgressLog[]
): CortisolAlertResult {
  if (!bioLogs || bioLogs.length < 3) return { hasAlert: false };

  // Analizar los últimos 3-5 registros de bio-feedback
  const recentBio = [...bioLogs]
    .sort((a, b) => normalizeLogDate(b.date).getTime() - normalizeLogDate(a.date).getTime())
    .slice(0, 5);

  const avgStress = recentBio.reduce((acc, l) => acc + (Number((l.value as any)?.stressLevel) || 5), 0) / recentBio.length;
  const avgSleep = recentBio.reduce((acc, l) => acc + (Number((l.value as any)?.sleepHours) || 7), 0) / recentBio.length;

  if (avgStress >= 7.5 || (avgStress >= 6.5 && avgSleep < 6.0)) {
    return {
      hasAlert: true,
      avgStress: Math.round(avgStress * 10) / 10,
      avgSleep: Math.round(avgSleep * 10) / 10,
      message: 'Alerta de Cortisol: Tus niveles recientes de estrés o déficit de sueño pueden causar retención temporal de líquidos, enmascarando tu progreso real de grasa.',
    };
  }

  return { hasAlert: false, avgStress, avgSleep };
}

/**
 * 🔒 CRÍTICO: Valida si una variación de peso es fisiológicamente sospechosa (>5% en 24h) para prevenir errores de input.
 */
export function validateWeightChangeSafety(
  previousWeight: number,
  currentWeight: number
): WeightValidationResult {
  if (!previousWeight || previousWeight <= 0 || !currentWeight || currentWeight <= 0) {
    return { isValid: true, percentageDiff: 0, isSignificantChange: false };
  }

  const diff = Math.abs(currentWeight - previousWeight);
  const percentageDiff = Math.round((diff / previousWeight) * 1000) / 10;

  if (percentageDiff > 5.0) {
    return {
      isValid: true,
      percentageDiff,
      isSignificantChange: true,
      warning: `Variación de peso de ${currentWeight > previousWeight ? '+' : '-'}${diff.toFixed(1)}kg (${percentageDiff}%). Por favor, confirma que el valor es correcto y no un error tipográfico.`,
    };
  }

  return { isValid: true, percentageDiff, isSignificantChange: false };
}
