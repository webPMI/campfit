/**
 * Tests de la Matriz de Sustitución e Integridad de Catálogos
 *
 * @module tests/unit/lib/data/substitutionMatrix.test
 */

import { describe, it, expect } from 'vitest';
import { FOODS_CATALOG, FOODS_MAP } from '@/lib/data/foodsCatalog';
import { EXERCISES_CATALOG } from '@/lib/data/exercisesCatalog';
import { suggestSubstitutes } from '@/lib/client/intoleranceChecker';
import type { MedicalProfile } from '@/types';

describe('Matriz de Sustitución y Catálogos Canónicos', () => {
  describe('Integridad Relacional del Catálogo de Alimentos', () => {
    it('todos los IDs de sustitutos configurados deben existir en el catálogo maestro', () => {
      for (const food of FOODS_CATALOG) {
        if (food.substitutes && food.substitutes.length > 0) {
          for (const subId of food.substitutes) {
            const exists = FOODS_MAP.has(subId);
            expect(exists, `Alimento ${food.id} referencia un sustituto inexistente: ${subId}`).toBe(true);
          }
        }
      }
    });

    it('los alimentos sin alérgenos deben poder sustituir a los alimentos con alérgenos comunes', () => {
      // 1. Maní / Frutos secos
      const peanutButter = FOODS_MAP.get('food-peanut-butter')!;
      expect(peanutButter.substitutes).toBeDefined();
      expect(peanutButter.substitutes!.includes('food-sunflower-butter')).toBe(true);

      const sunflowerButter = FOODS_MAP.get('food-sunflower-butter')!;
      expect(sunflowerButter.isNutFree).toBe(true);

      // 2. Lactosa
      const cowMilk = FOODS_MAP.get('food-milk-cow')!;
      expect(cowMilk.substitutes!.includes('food-milk-lactose-free')).toBe(true);
      expect(cowMilk.substitutes!.includes('food-soy-milk')).toBe(true);

      // 3. Gluten
      const wheatOats = FOODS_MAP.get('food-oats')!;
      expect(wheatOats.substitutes!.includes('food-oats-gf')).toBe(true);
      expect(wheatOats.substitutes!.includes('food-buckwheat')).toBe(true);
    });
  });

  describe('Sugerencia Dinámica de Sustitutos frente a Perfiles Médicos', () => {
    it('debe filtrar sustitutos que entren en conflicto con la alergia al maní del cliente', () => {
      const peanutButter = FOODS_MAP.get('food-peanut-butter')!;
      const profile: MedicalProfile = {
        allergies: ['nuts', 'peanut'],
        dietaryRestrictions: {
          nutFree: true,
        },
      };

      const suggestions = suggestSubstitutes(peanutButter, FOODS_CATALOG, profile, 'es', 3);
      expect(suggestions.length).toBeGreaterThan(0);
      // Ningún sustituto sugerido debe contener frutos secos o cacahuetes
      for (const s of suggestions) {
        expect(s.allergens.includes('peanut')).toBe(false);
        expect(s.allergens.includes('nuts')).toBe(false);
      }
    });

    it('debe sugerir alternativas veganas para un cliente con restricción vegana', () => {
      const chicken = FOODS_MAP.get('food-chicken-breast')!;
      const profile: MedicalProfile = {
        dietaryRestrictions: {
          vegan: true,
        },
      };

      const suggestions = suggestSubstitutes(chicken, FOODS_CATALOG, profile, 'es', 3);
      expect(suggestions.length).toBeGreaterThan(0);
      for (const s of suggestions) {
        expect(s.isVegan).toBe(true);
      }
    });
  });

  describe('Catálogo de Ejercicios', () => {
    it('todos los ejercicios deben tener grupos musculares válidos y nivel de dificultad 1-5', () => {
      expect(EXERCISES_CATALOG.length).toBeGreaterThan(20);
      for (const ex of EXERCISES_CATALOG) {
        expect(ex.muscleGroups.length).toBeGreaterThan(0);
        expect(ex.difficultyLevel).toBeDefined();
        expect(ex.difficultyLevel).toBeGreaterThanOrEqual(1);
        expect(ex.difficultyLevel).toBeLessThanOrEqual(5);
      }
    });
  });
});
