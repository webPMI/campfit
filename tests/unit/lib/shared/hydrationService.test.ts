/**
 * Tests Unitarios para el Motor de Hidratación Dinámica — CampFit
 *
 * @module tests/unit/lib/shared/hydrationService.test
 */

import { describe, it, expect } from 'vitest';
import {
  hydrateMeal,
  hydrateDiet,
  hydrateWorkoutExercise,
  hydrateWorkout,
  createDietSnapshot,
  createWorkoutSnapshot,
} from '@/lib/shared/hydrationService';
import { FOODS_MAP } from '@/lib/data/foodsCatalog';
import { EXERCISES_MAP } from '@/lib/data/exercisesCatalog';
import type { Diet } from '@/lib/trainer/types';
import type { Workout } from '@/lib/client/workoutService';

describe('hydrationService', () => {
  describe('hydrateMeal', () => {
    it('debe hidratar correctamente una comida vinculada a un alimento del catálogo', () => {
      const rawMeal = {
        foodId: 'food-chicken-breast',
        portionGrams: 200,
        calories: 330,
        protein: 62,
        carbs: 0,
        fat: 7.2,
      };

      const hydrated = hydrateMeal(rawMeal, FOODS_MAP, 'es');
      expect(hydrated.displayName).toBe('Pechuga de pollo');
      expect(hydrated.foodDetails).toBeDefined();
      expect(hydrated.suggestedSubstitutes.length).toBeGreaterThan(0);
      expect(hydrated.isCustomMeal).toBe(false);
    });

    it('debe traducir el nombre al idioma solicitado', () => {
      const rawMeal = { foodId: 'food-chicken-breast' };
      const hydratedEn = hydrateMeal(rawMeal, FOODS_MAP, 'en');
      const hydratedCa = hydrateMeal(rawMeal, FOODS_MAP, 'ca');

      expect(hydratedEn.displayName).toBe('Chicken breast');
      expect(hydratedCa.displayName).toBe('Pit de pollastre');
    });

    it('debe manejar comidas personalizadas (sin foodId en catálogo) de forma segura', () => {
      const customMeal = {
        description: 'Batido casero de plátano con avena',
        portionGrams: 300,
        calories: 400,
        protein: 25,
        allergens: ['gluten'],
      };

      const hydrated = hydrateMeal(customMeal, FOODS_MAP, 'es');
      expect(hydrated.displayName).toBe('Batido casero de plátano con avena');
      expect(hydrated.isCustomMeal).toBe(true);
      expect(hydrated.resolvedAllergens).toContain('gluten');
    });
  });

  describe('hydrateDiet & Day Hydration Strategy', () => {
    const mockDiet: Diet = {
      id: 'diet-test-1',
      clientId: 'client-1',
      trainerId: 'trainer-1',
      name: 'Dieta de Definición',
      type: 'normal',
      totalCalories: 2000,
      createdAt: { seconds: 1700000000, nanoseconds: 0 } as any,
      updatedAt: { seconds: 1700000000, nanoseconds: 0 } as any,
      meals: [
        {
          id: 'm1',
          name: 'breakfast',
          description: 'Avena',
          foodId: 'food-oats',
          portionGrams: 50,
          dayOfWeek: 1,
          calories: 200,
          protein: 8,
          carbs: 34,
          fat: 3,
          order: 0,
          estimatedTime: null,
          isCompleted: false,
          completionTime: null,
          allergens: ['gluten'],
        },
        {
          id: 'm2',
          name: 'lunch',
          description: 'Pollo',
          foodId: 'food-chicken-breast',
          portionGrams: 200,
          dayOfWeek: 1,
          calories: 330,
          protein: 62,
          carbs: 0,
          fat: 7,
          order: 1,
          estimatedTime: null,
          isCompleted: false,
          completionTime: null,
          allergens: [],
        },
        {
          id: 'm3',
          name: 'dinner',
          description: 'Salmón',
          foodId: 'food-salmon',
          portionGrams: 150,
          dayOfWeek: 2,
          calories: 400,
          protein: 40,
          carbs: 0,
          fat: 26,
          order: 2,
          estimatedTime: null,
          isCompleted: false,
          completionTime: null,
          allergens: ['fish'],
        },
      ],
    };

    it('debe hidratar la dieta completa y calcular totales consolidados', () => {
      const hydrated = hydrateDiet(mockDiet, 'es');
      expect(hydrated.meals).toHaveLength(3);
      expect(hydrated.totalHydratedCalories).toBe(930);
      expect(hydrated.dayMeals?.[1]).toHaveLength(2);
      expect(hydrated.dayMeals?.[2]).toHaveLength(1);
    });

    it('debe aplicar la estrategia de Day Hydration filtrando sólo el día solicitado', () => {
      const day1Only = hydrateDiet(mockDiet, 'es', { targetDayIndex: 1 });
      expect(day1Only.meals).toHaveLength(2);
      expect(day1Only.totalHydratedCalories).toBe(530);
    });
  });

  describe('hydrateWorkoutExercise & hydrateWorkout', () => {
    it('debe hidratar un ejercicio con músculos, equipamiento y vídeo explicativo', () => {
      const rawExercise = {
        exerciseId: 'bench_press_barbell',
        sets: 4,
        reps: 8,
      };

      const hydrated = hydrateWorkoutExercise(rawExercise, EXERCISES_MAP, 'es');
      expect(hydrated.displayName).toBe('Press de banca con barra');
      expect(hydrated.muscleGroups).toContain('chest');
      expect(hydrated.equipment).toContain('barbell');
      expect(hydrated.isCustomExercise).toBe(false);
    });

    it('debe soportar Day Hydration en rutinas semanales', () => {
      const mockWorkout: Workout = {
        id: 'w1',
        clientId: 'client-1',
        trainerId: 'trainer-1',
        name: 'Rutina Torso/Pierna',
        difficulty: 'intermediate',
        exercises: [
          { exerciseId: 'bench_press_barbell', sets: 4, reps: 8, day: 1 },
          { exerciseId: 'barbell_back_squat', sets: 4, reps: 6, day: 2 },
        ] as any,
      };

      const day1Only = hydrateWorkout(mockWorkout, 'es', { targetDayIndex: 1 });
      expect(day1Only.exercises).toHaveLength(1);
      expect(day1Only.exercises[0].displayName).toBe('Press de banca con barra');
    });
  });

  describe('Snapshots Inmutables de Asignación', () => {
    it('createDietSnapshot debe congelar los nombres y macros calculados', () => {
      const rawDiet: Diet = {
        id: 'diet-snap-1',
        clientId: 'c1',
        trainerId: 't1',
        name: 'Plan Mensual',
        type: 'normal',
        totalCalories: 0,
        createdAt: { seconds: 1700000000, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1700000000, nanoseconds: 0 } as any,
        meals: [
          {
            id: 'm1',
            foodId: 'food-white-rice',
            portionGrams: 150,
            name: 'lunch',
            description: 'Arroz blanco',
            calories: 195,
            protein: 4,
            carbs: 42,
            fat: 0.5,
            order: 0,
            estimatedTime: null,
            isCompleted: false,
            completionTime: null,
            allergens: [],
          },
        ],
      };

      const snapshot = createDietSnapshot(rawDiet);
      expect(snapshot.totalCalories).toBeGreaterThan(0);
      expect(snapshot.meals[0].description).toBe('Arroz blanco');
      expect(snapshot.meals[0].foodId).toBe('food-white-rice');
    });

    it('createWorkoutSnapshot debe congelar el nombre resuelto y parámetros', () => {
      const rawWorkout: Workout = {
        id: 'w-snap-1',
        clientId: 'c1',
        trainerId: 't1',
        name: 'Rutina Fuerza',
        difficulty: 'intermediate',
        exercises: [{ exerciseId: 'deadlift', sets: 5, reps: 5 }] as any,
      };

      const snapshot = createWorkoutSnapshot(rawWorkout);
      expect(snapshot.exercises[0].name).toBe('Peso muerto tradicional');
      expect(snapshot.exercises[0].exerciseId).toBe('deadlift');
    });
  });
});
