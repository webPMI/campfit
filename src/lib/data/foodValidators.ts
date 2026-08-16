/**
 * Validadores de Alimentos, Macros y Ejercicios — CampFit
 *
 * Provee validación estricta de porciones (>0), integridad de macros,
 * coherencia calórica (4P + 4C + 9G ≈ kcal) y esquemas de biblioteca.
 *
 * @module data/foodValidators
 */

import type { FoodItem } from '@/lib/shared/foodLibrary';
import type { ExerciseItem } from '@/lib/shared/exerciseLibrary';

export interface ValidationIssue {
  field: string;
  message: string;
  code: 'REQUIRED' | 'INVALID_RANGE' | 'INCONSISTENT_MACROS' | 'INVALID_TYPE' | 'INVALID_TRANSLATION';
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

/**
 * Calcula las calorías teóricas basadas en la fórmula de Atwater:
 * Calorías = 4 * Proteína + 4 * Carbohidratos + 9 * Grasas
 */
export function calculateTheoreticalCalories(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9);
}

/**
 * Comprueba si las calorías declaradas son coherentes con los macros
 * dentro de un margen de tolerancia (por defecto 25%, para compensar fibra, alcohol y redondeo).
 */
export function isCalorieConsistent(
  declaredCalories: number,
  protein: number,
  carbs: number,
  fat: number,
  toleranceRatio = 0.25,
): boolean {
  if (declaredCalories <= 0 && protein === 0 && carbs === 0 && fat === 0) return true;
  if (declaredCalories < 0 || protein < 0 || carbs < 0 || fat < 0) return false;

  const theoretical = calculateTheoreticalCalories(protein, carbs, fat);
  if (theoretical === 0 && declaredCalories === 0) return true;
  if (theoretical === 0) return false;

  const diff = Math.abs(declaredCalories - theoretical);
  const maxDiff = Math.max(15, theoretical * toleranceRatio);

  return diff <= maxDiff;
}

/**
 * Valida un alimento antes de persistirlo o utilizarlo en cálculos.
 */
export function validateFoodItem(food: Partial<FoodItem>): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!food.id || typeof food.id !== 'string' || food.id.trim().length === 0) {
    issues.push({ field: 'id', message: 'El ID del alimento es obligatorio', code: 'REQUIRED' });
  }

  if (!food.category || typeof food.category !== 'string') {
    issues.push({ field: 'category', message: 'La categoría del alimento es obligatoria', code: 'REQUIRED' });
  }

  if (!food.translations || typeof food.translations !== 'object') {
    issues.push({ field: 'translations', message: 'El objeto de traducciones es obligatorio', code: 'REQUIRED' });
  } else {
    if (!food.translations.es?.trim()) {
      issues.push({ field: 'translations.es', message: 'La traducción en español es obligatoria', code: 'REQUIRED' });
    }
    if (!food.translations.en?.trim()) {
      issues.push({ field: 'translations.en', message: 'La traducción en inglés es obligatoria', code: 'REQUIRED' });
    }
    if (!food.translations.ca?.trim()) {
      issues.push({ field: 'translations.ca', message: 'La traducción en catalán es obligatoria', code: 'REQUIRED' });
    }
  }

  // Validación de valores numéricos de macros por 100g
  const numFields: Array<keyof Pick<FoodItem, 'calories100g' | 'protein100g' | 'carbs100g' | 'fat100g' | 'defaultPortion'>> = [
    'calories100g',
    'protein100g',
    'carbs100g',
    'fat100g',
    'defaultPortion',
  ];

  for (const field of numFields) {
    const val = food[field];
    if (val === undefined || val === null || typeof val !== 'number' || isNaN(val)) {
      issues.push({ field, message: `El campo ${field} debe ser un número válido`, code: 'REQUIRED' });
    } else if (val < 0) {
      issues.push({ field, message: `El campo ${field} no puede ser negativo (${val})`, code: 'INVALID_RANGE' });
    }
  }

  if (food.defaultPortion !== undefined && food.defaultPortion <= 0) {
    issues.push({ field: 'defaultPortion', message: 'La porción por defecto debe ser mayor a 0 gramos', code: 'INVALID_RANGE' });
  }

  // Comprobar suma de macronutrientes por 100g (no puede exceder 100g sumando P+C+G)
  if (
    typeof food.protein100g === 'number' &&
    typeof food.carbs100g === 'number' &&
    typeof food.fat100g === 'number'
  ) {
    const totalMacros100g = food.protein100g + food.carbs100g + food.fat100g;
    if (totalMacros100g > 105) {
      issues.push({
        field: 'macros100g',
        message: `La suma de proteínas, carbohidratos y grasas por 100g (${totalMacros100g}g) no puede superar 100g`,
        code: 'INCONSISTENT_MACROS',
      });
    }

    if (typeof food.calories100g === 'number' && food.calories100g >= 0) {
      if (!isCalorieConsistent(food.calories100g, food.protein100g, food.carbs100g, food.fat100g)) {
        const expected = calculateTheoreticalCalories(food.protein100g, food.carbs100g, food.fat100g);
        issues.push({
          field: 'calories100g',
          message: `Calorías declaradas (${food.calories100g} kcal) difieren de las teóricas (${expected} kcal)`,
          code: 'INCONSISTENT_MACROS',
        });
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Valida una comida asignada o porción.
 */
export function validateMealMacros(meal: {
  portionGrams?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (meal.portionGrams === undefined || meal.portionGrams === null || isNaN(meal.portionGrams) || meal.portionGrams <= 0) {
    issues.push({ field: 'portionGrams', message: 'La porción en gramos debe ser un número mayor a 0', code: 'INVALID_RANGE' });
  }

  const cal = meal.calories ?? 0;
  const pro = meal.protein ?? 0;
  const carb = meal.carbs ?? 0;
  const fat = meal.fat ?? 0;

  if (cal < 0 || pro < 0 || carb < 0 || fat < 0) {
    issues.push({ field: 'macros', message: 'Los macronutrientes y calorías no pueden ser negativos', code: 'INVALID_RANGE' });
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Valida un ejercicio del catálogo.
 */
export function validateExerciseItem(exercise: Partial<ExerciseItem>): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!exercise.id || typeof exercise.id !== 'string' || !exercise.id.trim()) {
    issues.push({ field: 'id', message: 'El ID del ejercicio es obligatorio', code: 'REQUIRED' });
  }

  if (!exercise.translations?.es?.trim()) {
    issues.push({ field: 'translations.es', message: 'El nombre en español es obligatorio', code: 'REQUIRED' });
  }

  if (!exercise.muscleGroups || !Array.isArray(exercise.muscleGroups) || exercise.muscleGroups.length === 0) {
    issues.push({ field: 'muscleGroups', message: 'Debe indicarse al menos un grupo muscular primario', code: 'REQUIRED' });
  }

  if (!exercise.category) {
    issues.push({ field: 'category', message: 'La categoría del ejercicio es obligatoria', code: 'REQUIRED' });
  }

  if (!exercise.equipment || !Array.isArray(exercise.equipment)) {
    issues.push({ field: 'equipment', message: 'La lista de equipamiento es obligatoria', code: 'REQUIRED' });
  }

  if (exercise.defaultSets !== undefined && exercise.defaultSets <= 0) {
    issues.push({ field: 'defaultSets', message: 'Las series por defecto deben ser mayores a 0', code: 'INVALID_RANGE' });
  }

  if (exercise.defaultReps !== undefined && exercise.defaultReps <= 0) {
    issues.push({ field: 'defaultReps', message: 'Las repeticiones por defecto deben ser mayores a 0', code: 'INVALID_RANGE' });
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
