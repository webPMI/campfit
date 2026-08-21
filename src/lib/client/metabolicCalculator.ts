/**
 * Calculadora Metabólica, TDEE, BMR y Macros Autónomos — CampFit
 * Provee fórmulas científicas basadas en la ecuación Mifflin-St Jeor para estimar
 * el gasto energético total diario y la distribución óptima de macronutrientes.
 *
 * @module client/metabolicCalculator
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type NutritionalGoal = 'fat_loss' | 'maintenance' | 'muscle_gain';
export type BiologicalGender = 'male' | 'female';

export interface UserMetabolicInput {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  gender: BiologicalGender;
  activityLevel: ActivityLevel;
  goal: NutritionalGoal;
}

export interface MetabolicCalculationResult {
  bmr: number; // Tasa Metabólica Basal en kcal
  tdee: number; // Gasto Energético Total Diario en kcal
  targetCalories: number; // Calorías diarias objetivo
  macros: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    proteinKcal: number;
    carbsKcal: number;
    fatKcal: number;
    percentages: {
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  waterLitersRecommended: number;
}

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,     // Poco o ningún ejercicio (trabajo de oficina)
  light: 1.375,       // Ejercicio ligero (1-3 días a la semana)
  moderate: 1.55,     // Ejercicio moderado (3-5 días a la semana)
  active: 1.725,      // Ejercicio intenso (6-7 días a la semana)
  very_active: 1.9,   // Entrenamiento muy intenso / doble sesión
};

/**
 * 🔒 CRÍTICO: Calcula el BMR según la fórmula Mifflin-St Jeor.
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: BiologicalGender,
): number {
  if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) return 1500;

  // Mifflin-St Jeor: 10*peso(kg) + 6.25*altura(cm) - 5*edad(años) + (5 para hombres, -161 para mujeres)
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  const bmr = gender === 'female' ? base - 161 : base + 5;
  return Math.round(Math.max(800, bmr));
}

/**
 * 🔒 CRÍTICO: Calcula el TDEE multiplicando el BMR por el factor de actividad física.
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const mult = ACTIVITY_MULTIPLIERS[activityLevel] || 1.375;
  return Math.round(bmr * mult);
}

/**
 * 🔒 CRÍTICO: Calcula las calorías objetivo y la distribución de macronutrientes.
 */
export function calculateMetabolicProfile(input: UserMetabolicInput): MetabolicCalculationResult {
  const bmr = calculateBMR(input.weightKg, input.heightCm, input.ageYears, input.gender);
  const tdee = calculateTDEE(bmr, input.activityLevel);

  let targetCalories = tdee;
  if (input.goal === 'fat_loss') {
    // Déficit controlado del 18-20%
    targetCalories = Math.round(tdee * 0.82);
  } else if (input.goal === 'muscle_gain') {
    // Superávit moderado de +10-12%
    targetCalories = Math.round(tdee * 1.12);
  }

  // Garantizar un mínimo saludable
  targetCalories = Math.max(1200, targetCalories);

  // Proteína: 2.0g por kg de peso corporal (4 kcal/g)
  let proteinGrams = Math.round(input.weightKg * 2.0);
  let proteinKcal = proteinGrams * 4;

  // Si la proteína supera el 40% de las calorías totales, limitar a 2.2g/kg
  if (proteinKcal > targetCalories * 0.4) {
    proteinGrams = Math.round(input.weightKg * 1.8);
    proteinKcal = proteinGrams * 4;
  }

  // Grasas: 0.9g por kg de peso corporal (9 kcal/g)
  let fatGrams = Math.round(input.weightKg * 0.9);
  let fatKcal = fatGrams * 9;

  // Carbohidratos: el restante de calorías divididas entre 4 kcal/g
  let remainingKcal = targetCalories - (proteinKcal + fatKcal);
  if (remainingKcal < targetCalories * 0.2) {
    // Si queda muy poco para carbohidratos, ajustar grasas a 0.7g/kg
    fatGrams = Math.round(input.weightKg * 0.7);
    fatKcal = fatGrams * 9;
    remainingKcal = targetCalories - (proteinKcal + fatKcal);
  }

  const carbsGrams = Math.max(50, Math.round(remainingKcal / 4));
  const carbsKcal = carbsGrams * 4;

  // Recalcular calorías totales exactas sumando los macros
  const exactTotalKcal = proteinKcal + fatKcal + carbsKcal;

  const percentages = {
    protein: Math.round((proteinKcal / exactTotalKcal) * 100),
    fat: Math.round((fatKcal / exactTotalKcal) * 100),
    carbs: Math.round((carbsKcal / exactTotalKcal) * 100),
  };

  // Recomendación de agua: ~35ml por kg de peso corporal
  const waterLitersRecommended = Math.round((input.weightKg * 0.035) * 10) / 10;

  return {
    bmr,
    tdee,
    targetCalories: exactTotalKcal,
    macros: {
      proteinGrams,
      carbsGrams,
      fatGrams,
      proteinKcal,
      carbsKcal,
      fatKcal,
      percentages,
    },
    waterLitersRecommended: Math.max(2.0, waterLitersRecommended),
  };
}

const LOCAL_METABOLIC_KEY = 'cf_metabolic_profile_';

export function getCachedMetabolicProfile(uid: string): MetabolicCalculationResult | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_METABOLIC_KEY}${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

export function setCachedMetabolicProfile(uid: string, result: MetabolicCalculationResult): void {
  try {
    localStorage.setItem(`${LOCAL_METABOLIC_KEY}${uid}`, JSON.stringify(result));
  } catch {
    /* ignore */
  }
}

/**
 * 🔒 CRÍTICO: Guarda el objetivo nutricional calculado en el perfil del usuario en Firestore.
 */
export async function saveUserMetabolicGoal(
  uid: string,
  input: UserMetabolicInput,
  result: MetabolicCalculationResult,
): Promise<boolean> {
  setCachedMetabolicProfile(uid, result);

  if (!uid) return true;

  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      metabolicGoal: {
        input,
        result,
        updatedAt: new Date().toISOString(),
      },
    });
    logger.info('MetabolicCalculator', `Objetivo metabólico guardado con éxito para ${uid}`);
    return true;
  } catch (err) {
    logger.warn('MetabolicCalculator', 'Error guardando en Firestore, guardado en caché local:', err);
    return true;
  }
}
