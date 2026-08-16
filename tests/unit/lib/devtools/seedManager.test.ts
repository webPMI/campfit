/**
 * Tests Unitarios para el Gestor Inteligente de Semillas — CampFit
 *
 * @module tests/unit/lib/devtools/seedManager.test
 */

import { describe, it, expect } from 'vitest';
import {
  computeItemHash,
  validateFoodsBatch,
  validateExercisesBatch,
} from '@/lib/devtools/seedManager';
import { FOODS_CATALOG } from '@/lib/data/foodsCatalog';
import { EXERCISES_CATALOG } from '@/lib/data/exercisesCatalog';
import type { FoodItem } from '@/lib/shared/foodLibrary';

describe('seedManager', () => {
  describe('computeItemHash (Idempotencia y Detección de Cambios)', () => {
    it('debe generar el mismo hash para objetos con el mismo contenido', () => {
      const foodA = FOODS_CATALOG[0];
      const foodB = { ...FOODS_CATALOG[0] };

      const hashA = computeItemHash(foodA);
      const hashB = computeItemHash(foodB);

      expect(hashA).toBe(hashB);
      expect(hashA.startsWith('h_')).toBe(true);
    });

    it('debe generar hashes diferentes si cambian los macronutrientes o traducciones', () => {
      const original = FOODS_CATALOG[0];
      const modifiedCalories = { ...original, calories100g: original.calories100g + 50 };
      const modifiedTranslation = {
        ...original,
        translations: { ...original.translations, es: 'Nombre Modificado' },
      };

      const hashOrig = computeItemHash(original);
      const hashCal = computeItemHash(modifiedCalories);
      const hashTrans = computeItemHash(modifiedTranslation);

      expect(hashOrig).not.toBe(hashCal);
      expect(hashOrig).not.toBe(hashTrans);
    });
  });

  describe('Validación de Lotes en Staging', () => {
    it('el catálogo canónico de alimentos debe pasar 100% la validación sin errores', () => {
      const result = validateFoodsBatch(FOODS_CATALOG);
      expect(result.total).toBe(FOODS_CATALOG.length);
      expect(result.validCount).toBe(FOODS_CATALOG.length);
      expect(result.invalidCount).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('el catálogo canónico de ejercicios debe pasar 100% la validación sin errores', () => {
      const result = validateExercisesBatch(EXERCISES_CATALOG);
      expect(result.total).toBe(EXERCISES_CATALOG.length);
      expect(result.validCount).toBe(EXERCISES_CATALOG.length);
      expect(result.invalidCount).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('debe detectar ítems con datos inválidos en el área de staging', () => {
      const corruptedBatch: FoodItem[] = [
        {
          id: 'bad-food',
          category: 'protein',
          translations: { es: '', en: '', ca: '' },
          calories100g: -50,
          protein100g: 20,
          carbs100g: 0,
          fat100g: 0,
          defaultPortion: -10,
          searchIndex: [],
          isVegan: false,
          isVegetarian: false,
          isGlutenFree: false,
          isLactoseFree: false,
          isNutFree: false,
          isShellfishFree: false,
          allergens: [],
          tags: [],
          defaultCalories: 0,
          defaultProtein: 0,
          defaultCarbs: 0,
          defaultFat: 0,
          isActive: true,
          createdBy: 'test',
          createdAt: null,
          updatedAt: null,
        },
      ];

      const result = validateFoodsBatch(corruptedBatch);
      expect(result.invalidCount).toBe(1);
      expect(result.errors[0].id).toBe('bad-food');
    });
  });
});
