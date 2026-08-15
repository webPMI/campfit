/**
 * Calculadora Metabólica y Planificador de Macros para Entrenadores.
 * Utiliza la ecuación estándar de Mifflin-St Jeor para TDEE y distribución de macronutrientes.
 *
 * @module trainer/metabolicCalculator
 */

export interface MacroPlan {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  proteinCalories: number;
  proteinPercent: number;
  carbsGrams: number;
  carbsCalories: number;
  carbsPercent: number;
  fatGrams: number;
  fatCalories: number;
  fatPercent: number;
  goal: 'fat_loss' | 'maintenance' | 'muscle_gain';
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Poco o ningún ejercicio
  light: 1.375, // 1-3 días/semana
  moderate: 1.55, // 3-5 días/semana
  very_active: 1.725, // 6-7 días/semana
  extra_active: 1.9, // Entrenamiento doble o trabajo físico muy intenso
};

/**
 * Calcula el TDEE y genera la distribución óptima de macronutrientes.
 */
export function calculateMetabolicPlan(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' = 'male',
  activity: ActivityLevel = 'moderate',
  goal: 'fat_loss' | 'maintenance' | 'muscle_gain' = 'maintenance',
): MacroPlan {
  // Fórmula de Mifflin-St Jeor
  // Hombre: BMR = (10 × peso en kg) + (6.25 × altura en cm) - (5 × edad en años) + 5
  // Mujer:  BMR = (10 × peso en kg) + (6.25 × altura en cm) - (5 × edad en años) - 161
  const bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = Math.round(gender === 'male' ? bmrBase + 5 : bmrBase - 161);

  const multiplier = ACTIVITY_MULTIPLIERS[activity] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  let targetCalories = tdee;
  let proteinRatio = 2.0; // g/kg
  let fatRatio = 0.9; // g/kg

  if (goal === 'fat_loss') {
    targetCalories = Math.round(tdee - 400); // Déficit moderado
    proteinRatio = 2.2; // Mayor proteína para preservar masa muscular
    fatRatio = 0.8;
  } else if (goal === 'muscle_gain') {
    targetCalories = Math.round(tdee + 300); // Superávit controlado
    proteinRatio = 2.0;
    fatRatio = 1.0;
  }

  const proteinGrams = Math.round(weightKg * proteinRatio);
  const proteinCalories = proteinGrams * 4;

  const fatGrams = Math.round(weightKg * fatRatio);
  const fatCalories = fatGrams * 9;

  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const carbsGrams = Math.round(remainingCalories / 4);
  const carbsCalories = carbsGrams * 4;

  const totalCalculated = proteinCalories + fatCalories + carbsCalories;

  return {
    bmr,
    tdee,
    targetCalories,
    proteinGrams,
    proteinCalories,
    proteinPercent: Math.round((proteinCalories / totalCalculated) * 100),
    carbsGrams,
    carbsCalories,
    carbsPercent: Math.round((carbsCalories / totalCalculated) * 100),
    fatGrams,
    fatCalories,
    fatPercent: Math.round((fatCalories / totalCalculated) * 100),
    goal,
  };
}
