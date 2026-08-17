/**
 * Detector de Conflictos y Riesgos de Lesión Médica — CampFit
 *
 * Cruza las lesiones y condiciones registradas en el MedicalProfile del alumno
 * con los grupos musculares y contraindicaciones de cada ejercicio.
 *
 * @module client/injuryChecker
 */

import type { MedicalProfile } from '@/types';
import type { ExerciseItem, MuscleGroup } from '@/lib/shared/exerciseLibrary';

export interface InjuryConflict {
  injuryOrCondition: string;
  affectedZone: string;
  severity: 'high' | 'moderate' | 'warning';
  exerciseName: string;
  warningMessage: string;
  recommendation: string;
}

export interface InjuryAuditResult {
  hasConflict: boolean;
  conflicts: InjuryConflict[];
}

/** Mapa de normalización de lesiones/condiciones a zonas anatómicas estándar */
const INJURY_ZONE_MAP: Record<string, { zone: string; relatedMuscles: MuscleGroup[]; contraKeys: string[] }> = {
  // Hombro
  hombro: { zone: 'Hombro', relatedMuscles: ['shoulders'], contraKeys: ['shoulder_impingement', 'shoulder', 'shoulder_pain', 'rotator_cuff'] },
  manguito_rotador: { zone: 'Hombro', relatedMuscles: ['shoulders'], contraKeys: ['shoulder_impingement', 'shoulder', 'rotator_cuff'] },
  shoulder: { zone: 'Hombro', relatedMuscles: ['shoulders'], contraKeys: ['shoulder_impingement', 'shoulder', 'rotator_cuff'] },
  tendinitis_hombro: { zone: 'Hombro', relatedMuscles: ['shoulders'], contraKeys: ['shoulder_impingement', 'shoulder'] },

  // Rodilla
  rodilla: { zone: 'Rodilla', relatedMuscles: ['quadriceps', 'hamstrings', 'calves'], contraKeys: ['knee_pain', 'knee', 'patellar_tendinitis', 'acl'] },
  knee: { zone: 'Rodilla', relatedMuscles: ['quadriceps', 'hamstrings', 'calves'], contraKeys: ['knee_pain', 'knee', 'patellar_tendinitis'] },
  menisco: { zone: 'Rodilla', relatedMuscles: ['quadriceps', 'hamstrings'], contraKeys: ['knee_pain', 'knee'] },
  tendinitis_rotuliana: { zone: 'Rodilla', relatedMuscles: ['quadriceps'], contraKeys: ['patellar_tendinitis', 'knee_pain', 'knee'] },

  // Lumbar / Espalda baja
  lumbar: { zone: 'Espalda Baja / Lumbar', relatedMuscles: ['back', 'core'], contraKeys: ['lumbar_pain', 'lumbar_herniation', 'lower_back'] },
  espalda_baja: { zone: 'Espalda Baja / Lumbar', relatedMuscles: ['back', 'core'], contraKeys: ['lumbar_pain', 'lumbar_herniation', 'lower_back'] },
  hernia_discal: { zone: 'Columna / Hernia', relatedMuscles: ['back', 'core'], contraKeys: ['lumbar_herniation', 'lumbar_pain', 'lower_back'] },
  lower_back: { zone: 'Espalda Baja / Lumbar', relatedMuscles: ['back', 'core'], contraKeys: ['lumbar_pain', 'lumbar_herniation', 'lower_back'] },
  sciatica: { zone: 'Ciática / Lumbar', relatedMuscles: ['back', 'glutes', 'hamstrings'], contraKeys: ['lumbar_pain', 'lumbar_herniation', 'lower_back'] },

  // Muñeca / Codo
  muñeca: { zone: 'Muñeca', relatedMuscles: ['biceps', 'triceps', 'forearms'], contraKeys: ['wrist_pain', 'wrist'] },
  wrist: { zone: 'Muñeca', relatedMuscles: ['biceps', 'triceps', 'forearms'], contraKeys: ['wrist_pain', 'wrist'] },
  codo: { zone: 'Codo', relatedMuscles: ['biceps', 'triceps', 'forearms'], contraKeys: ['elbow_pain', 'epicondylitis'] },
  elbow: { zone: 'Codo', relatedMuscles: ['biceps', 'triceps', 'forearms'], contraKeys: ['elbow_pain', 'epicondylitis'] },

  // Cuello / Cervical
  cuello: { zone: 'Cervical / Cuello', relatedMuscles: ['shoulders', 'back'], contraKeys: ['cervical_pain', 'neck'] },
  cervical: { zone: 'Cervical / Cuello', relatedMuscles: ['shoulders', 'back'], contraKeys: ['cervical_pain', 'neck'] },
};

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[áéíóú]/g, (m) => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }[m] || m))
    .replace(/[\s-]+/g, '_');
}

/**
 * Cruza un ejercicio contra el perfil médico del cliente.
 */
export function checkExerciseInjuryConflicts(
  exercise: Partial<ExerciseItem> | { name: string; id?: string; muscleGroups?: MuscleGroup[]; contraindications?: string[] },
  medicalProfile?: MedicalProfile | null,
): InjuryAuditResult {
  if (!medicalProfile) {
    return { hasConflict: false, conflicts: [] };
  }

  const conflicts: InjuryConflict[] = [];
  const exerciseName = (exercise as any).translations?.es || (exercise as any).name || 'Ejercicio';
  const exMuscles: MuscleGroup[] = (exercise as any).muscleGroups || [];
  const exSecondary: MuscleGroup[] = (exercise as any).secondaryMuscles || [];
  const allExMuscles = [...exMuscles, ...exSecondary];
  const exContra: string[] = ((exercise as any).contraindications || []).map((c: string) => normalizeText(c));

  // Combinar lesiones y condiciones del perfil médico
  const rawInjuries = [
    ...(medicalProfile.injuries || []),
    ...(medicalProfile.conditions || []),
    ...(medicalProfile.allergies || []).filter((a) => !a.includes('gluten') && !a.includes('lactose')), // algunas UI guardan lesiones aquí
  ];

  for (const rawInj of rawInjuries) {
    if (!rawInj || typeof rawInj !== 'string') continue;
    const normalizedInj = normalizeText(rawInj);

    for (const [key, mapping] of Object.entries(INJURY_ZONE_MAP)) {
      if (normalizedInj.includes(key) || key.includes(normalizedInj)) {
        // 1. Verificar si el ejercicio tiene contraindicación explícita
        const hasExplicitContra = mapping.contraKeys.some((k) =>
          exContra.some((c) => c.includes(k) || k.includes(c))
        );

        // 2. Verificar si el grupo muscular primario está involucrado
        const hasMuscleInvolvement = mapping.relatedMuscles.some((m) =>
          allExMuscles.includes(m)
        );

        if (hasExplicitContra || hasMuscleInvolvement) {
          const severity: 'high' | 'moderate' | 'warning' = hasExplicitContra ? 'high' : 'moderate';

          conflicts.push({
            injuryOrCondition: rawInj,
            affectedZone: mapping.zone,
            severity,
            exerciseName,
            warningMessage: hasExplicitContra
              ? `⚠️ Contraindicación directa: Tienes registrada una lesión en "${mapping.zone}". Este ejercicio puede comprometer la articulación.`
              : `ℹ️ Precaución: Este ejercicio involucra la zona de "${mapping.zone}" (lesión activa en tu perfil médico).`,
            recommendation: hasExplicitContra
              ? 'Te sugerimos consultar a tu entrenador o solicitar una variante con el botón "🚫 Excluir".'
              : 'Realiza un calentamiento minucioso y evita cargas máximas si sientes molestias.',
          });
          break;
        }
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}
