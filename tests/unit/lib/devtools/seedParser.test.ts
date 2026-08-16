/**
 * Tests Unitarios para el Parser Multi-Formato de Semillas — CampFit
 *
 * @module tests/unit/lib/devtools/seedParser.test
 */

import { describe, it, expect } from 'vitest';
import { parseFoodsSource, parseExercisesSource } from '@/lib/devtools/seedParser';

describe('seedParser', () => {
  describe('parseFoodsSource (CSV & JSON)', () => {
    it('debe parsear correctamente un CSV de alimentos', () => {
      const csv = `name_es,category,calories100g,protein100g,carbs100g,fat100g,defaultPortion,allergens
Pechuga de pavo,protein,105,24.0,0.5,1.0,150,
Arroz jazmín,carbs,130,2.5,28.0,0.3,150,`;

      const result = parseFoodsSource(csv);
      expect(result.type).toBe('food');
      expect(result.total).toBe(2);
      expect(result.validCount).toBe(2);
      expect(result.invalidCount).toBe(0);

      const turkey = result.items[0].data;
      expect(turkey.translations.es).toBe('Pechuga de pavo');
      expect(turkey.calories100g).toBe(105);
      expect(turkey.defaultCalories).toBe(Math.round(105 * 1.5));
      expect(result.items[0].hash.startsWith('h_')).toBe(true);
    });

    it('debe parsear correctamente un JSON de alimentos', () => {
      const json = JSON.stringify([
        {
          name_es: 'Tofu sedoso',
          category: 'protein',
          calories100g: 60,
          protein100g: 7,
          carbs100g: 2,
          fat100g: 3,
          defaultPortion: 150,
          allergens: ['soy'],
        },
      ]);

      const result = parseFoodsSource(json);
      expect(result.total).toBe(1);
      expect(result.validCount).toBe(1);
      expect(result.items[0].data.allergens).toContain('soy');
    });

    it('debe marcar como inválido alimentos con macros incoherentes', () => {
      const csv = `name_es,category,calories100g,protein100g,carbs100g,fat100g,defaultPortion
Comida corrupta,protein,-100,20,0,0,0`;

      const result = parseFoodsSource(csv);
      expect(result.invalidCount).toBe(1);
      expect(result.items[0].isValid).toBe(false);
      expect(result.items[0].status).toBe('invalid_data');
    });
  });

  describe('parseExercisesSource (CSV & JSON)', () => {
    it('debe parsear correctamente un CSV de ejercicios', () => {
      const csv = `name_es,category,muscleGroups,equipment,difficulty,sets,reps,rest
Dominadas neutras,strength,back;biceps,pull_up_bar,intermediate,3,8,90`;

      const result = parseExercisesSource(csv);
      expect(result.type).toBe('exercise');
      expect(result.total).toBe(1);
      expect(result.validCount).toBe(1);

      const ex = result.items[0].data;
      expect(ex.translations.es).toBe('Dominadas neutras');
      expect(ex.muscleGroups).toEqual(['back', 'biceps']);
      expect(ex.equipment).toEqual(['pull_up_bar']);
      expect(ex.defaultSets).toBe(3);
    });

    it('debe parsear correctamente un JSON de ejercicios', () => {
      const json = JSON.stringify([
        {
          name_es: 'Sentadilla Hack',
          category: 'strength',
          muscleGroups: ['quadriceps', 'glutes'],
          equipment: ['machine'],
          difficulty: 'intermediate',
          sets: 4,
          reps: 10,
        },
      ]);

      const result = parseExercisesSource(json);
      expect(result.total).toBe(1);
      expect(result.validCount).toBe(1);
      expect(result.items[0].data.muscleGroups).toContain('quadriceps');
    });
  });
});
