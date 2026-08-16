/**
 * Tests Unitarios para foodValidators.ts
 *
 * @module tests/unit/lib/data/foodValidators.test
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTheoreticalCalories,
  isCalorieConsistent,
  validateFoodItem,
  validateMealMacros,
  validateExerciseItem,
} from '@/lib/data/foodValidators';
import { FOODS_CATALOG } from '@/lib/data/foodsCatalog';
import { EXERCISES_CATALOG } from '@/lib/data/exercisesCatalog';

describe('foodValidators', () => {
  describe('calculateTheoreticalCalories & isCalorieConsistent', () => {
    it('debe calcular correctamente las calorías teóricas (4P + 4C + 9G)', () => {
      // 20g P, 30g C, 10g G -> 20*4 + 30*4 + 10*9 = 80 + 120 + 90 = 290 kcal
      expect(calculateTheoreticalCalories(20, 30, 10)).toBe(290);
    });

    it('debe validar coherencia dentro de la tolerancia admitida', () => {
      expect(isCalorieConsistent(290, 20, 30, 10)).toBe(true);
      expect(isCalorieConsistent(280, 20, 30, 10)).toBe(true);
      // Desviación grosera (ej. declarar 50 kcal cuando son 290 kcal)
      expect(isCalorieConsistent(50, 20, 30, 10)).toBe(false);
    });
  });

  describe('validateFoodItem', () => {
    it('debe aceptar alimentos válidos del catálogo', () => {
      const chicken = FOODS_CATALOG.find((f) => f.id === 'food-chicken-breast')!;
      const result = validateFoodItem(chicken);
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('debe rechazar alimentos sin ID o sin traducciones obligatorias', () => {
      const invalid = {
        category: 'protein' as const,
        translations: { es: '', en: 'Chicken', ca: 'Pollastre' },
        calories100g: 100,
        protein100g: 20,
        carbs100g: 0,
        fat100g: 2,
        defaultPortion: 100,
      };
      const result = validateFoodItem(invalid);
      expect(result.isValid).toBe(false);
      expect(result.issues.some((i) => i.field === 'id')).toBe(true);
      expect(result.issues.some((i) => i.field === 'translations.es')).toBe(true);
    });

    it('debe rechazar porciones por defecto negativas o nulas', () => {
      const invalid = {
        id: 'food-test',
        category: 'carbs' as const,
        translations: { es: 'Test', en: 'Test', ca: 'Test' },
        calories100g: 100,
        protein100g: 2,
        carbs100g: 20,
        fat100g: 1,
        defaultPortion: 0,
      };
      const result = validateFoodItem(invalid);
      expect(result.isValid).toBe(false);
      expect(result.issues.some((i) => i.field === 'defaultPortion')).toBe(true);
    });
  });

  describe('validateMealMacros', () => {
    it('debe validar porciones mayores a cero', () => {
      expect(validateMealMacros({ portionGrams: 150, calories: 200, protein: 20 }).isValid).toBe(true);
      expect(validateMealMacros({ portionGrams: -10 }).isValid).toBe(false);
      expect(validateMealMacros({ portionGrams: 0 }).isValid).toBe(false);
    });
  });

  describe('validateExerciseItem', () => {
    it('debe validar ejercicios del catálogo canónico', () => {
      const bench = EXERCISES_CATALOG.find((e) => e.id === 'bench_press_barbell')!;
      const result = validateExerciseItem(bench);
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('debe requerir grupos musculares y equipamiento', () => {
      const invalid = {
        id: 'ex-invalid',
        translations: { es: 'Invalido', en: 'Invalid', ca: 'Invalid' },
        muscleGroups: [],
        category: 'strength' as const,
        equipment: [],
      };
      const result = validateExerciseItem(invalid);
      expect(result.isValid).toBe(false);
      expect(result.issues.some((i) => i.field === 'muscleGroups')).toBe(true);
    });
  });
});
