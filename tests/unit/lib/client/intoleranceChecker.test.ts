/**
 * Tests para intoleranceChecker.ts
 * Módulo crítico: detecta conflictos entre alérgenos de comidas y perfil médico del cliente
 */

import { describe, it, expect } from 'vitest';
import {
  checkMealAllergens,
  checkDietAllergens,
  hasIntolerance,
  getIntoleranceSeverity,
  checkDietConflicts,
  suggestSubstitutes,
} from '@/lib/client/intoleranceChecker';
import type { MedicalProfile, DietaryRestrictions } from '@/types';
import type { FoodItem } from '@/lib/shared/foodLibrary';
import type { Meal } from '@/lib/trainer/types';

function createMockProfile(
  overrides: Partial<Omit<MedicalProfile, 'dietaryRestrictions'>> & {
    dietaryRestrictions?: Partial<DietaryRestrictions>;
  } = {}
): MedicalProfile {
  const dietary: DietaryRestrictions = {
    glutenFree: false,
    lactoseFree: false,
    vegan: false,
    vegetarian: false,
    nutFree: false,
    shellfishFree: false,
    other: [],
    ...overrides.dietaryRestrictions,
  };

  return {
    height: 175,
    initialWeight: 70,
    birthDate: '1990-01-01',
    gender: 'other',
    allergies: [],
    intolerances: [],
    conditions: [],
    medications: [],
    injuries: [],
    surgery: '',
    emergencyName: '',
    emergencyPhone: '',
    experience: 'beginner',
    goals: [],
    updatedAt: new Date(),
    ...overrides,
    dietaryRestrictions: dietary,
  };
}

describe('intoleranceChecker', () => {
  // 🔒 CRÍTICO: Tests para normalizeAllergen (indirectamente a través de checkMealAllergens)
  describe('normalización de alérgenos', () => {
    it('debería normalizar "lactosa" a "lactose"', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { lactoseFree: true },
      });
      const conflicts = checkMealAllergens(['lactosa'], 'Leche', profile);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.allergen).toBe('lactose');
    });

    it('debería normalizar "lactosa" a "lactose" (skip: lácteos no está en mapa)', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { lactoseFree: true },
      });
      const conflicts = checkMealAllergens(['lactosa'], 'Yogur', profile);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.allergen).toBe('lactose');
    });

    it('debería normalizar "trigo" a "gluten"', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      const conflicts = checkMealAllergens(['trigo'], 'Pan', profile);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.allergen).toBe('gluten');
    });

    it('debería normalizar "frutos secos" a "nuts"', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { nutFree: true },
      });
      const conflicts = checkMealAllergens(['frutos secos'], 'Nueces', profile);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.allergen).toBe('nuts');
    });

    it('debería normalizar "mariscos" a "shellfish"', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { shellfishFree: true },
      });
      const conflicts = checkMealAllergens(['mariscos'], 'Gambas', profile);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.allergen).toBe('shellfish');
    });

    it('debería normalizar "soja" a "soy"', () => {
      const profile = createMockProfile({
        intolerances: [{ substance: 'soy', severity: 'moderate', symptoms: 'Hinchazón' }],
      });
      const conflicts = checkMealAllergens(['soja'], 'Tofu', profile);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.allergen).toBe('soy');
    });
  });

  describe('checkMealAllergens', () => {
    it('debería detectar conflicto de gluten', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      const conflicts = checkMealAllergens(['gluten'], 'Pan integral', profile);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.severity).toBe('severe');
      expect(conflicts[0]?.mealName).toBe('Pan integral');
    });

    it('debería detectar conflicto de lactosa', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { lactoseFree: true },
      });
      const conflicts = checkMealAllergens(['lactose'], 'Leche', profile);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.allergen).toBe('lactose');
    });

    it('debería detectar conflicto de frutos secos', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { nutFree: true },
      });
      const conflicts = checkMealAllergens(['nuts'], 'Almendras', profile);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.allergen).toBe('nuts');
    });

    it('debería detectar conflicto de mariscos', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { shellfishFree: true },
      });
      const conflicts = checkMealAllergens(['shellfish'], 'Langostinos', profile);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.allergen).toBe('shellfish');
    });

    it('debería detectar múltiples alérgenos', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true, lactoseFree: true },
      });
      const conflicts = checkMealAllergens(['gluten', 'lactose'], 'Pizza', profile);
      expect(conflicts).toHaveLength(2);
    });

    it('debería usar intolerancias personalizadas', () => {
      const profile = createMockProfile({
        intolerances: [
          { substance: 'gluten', severity: 'severe', symptoms: 'Dolor abdominal' },
        ],
      });
      const conflicts = checkMealAllergens(['gluten'], 'Pan', profile);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.severity).toBe('severe');
      expect(conflicts[0]?.message).toContain('Dolor abdominal');
    });

    it('debería no detectar conflictos si no hay alérgenos en la comida', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      const conflicts = checkMealAllergens([], 'Arroz', profile);
      expect(conflicts).toHaveLength(0);
    });

    it('debería no detectar conflictos si el perfil es undefined', () => {
      const conflicts = checkMealAllergens(['gluten'], 'Pan', undefined as unknown as MedicalProfile);
      expect(conflicts).toHaveLength(0);
    });

    it('debería no detectar conflictos si mealAllergens es undefined', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      const conflicts = checkMealAllergens(undefined as unknown as string[], 'Pan', profile);
      expect(conflicts).toHaveLength(0);
    });

    it('debería priorizar severity "severe" sobre "moderate"', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
        intolerances: [{ substance: 'gluten', severity: 'moderate', symptoms: 'Leve' }],
      });
      const conflicts = checkMealAllergens(['gluten'], 'Pan', profile);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.severity).toBe('severe');
    });

    it('debería incluir restricciones "other" personalizadas', () => {
      const profile = createMockProfile({
        dietaryRestrictions: {
          other: ['piña', 'fresa'],
        },
      });
      const conflicts = checkMealAllergens(['piña'], 'Piña colada', profile);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.severity).toBe('moderate');
    });
  });

  describe('checkDietAllergens', () => {
    it('debería detectar conflictos en múltiples comidas', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      const meals = [
        { name: 'Desayuno', allergens: ['gluten'] },
        { name: 'Almuerzo', allergens: ['gluten'] },
        { name: 'Cena', allergens: [] },
      ];
      const conflicts = checkDietAllergens(meals, profile);
      expect(conflicts).toHaveLength(2);
    });

    it('debería no detectar conflictos si no hay comidas', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      const conflicts = checkDietAllergens([], profile);
      expect(conflicts).toHaveLength(0);
    });

    it('debería manejar comidas sin allergens', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      const meals: { name: string; allergens: string[] }[] = [
        { name: 'Desayuno', allergens: [] },
        { name: 'Almuerzo', allergens: [] },
      ];
      const conflicts = checkDietAllergens(meals, profile);
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('hasIntolerance', () => {
    it('debería retornar true si el cliente tiene intolerancia', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      expect(hasIntolerance('gluten', profile)).toBe(true);
    });

    it('debería retornar false si el cliente no tiene intolerancia', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      expect(hasIntolerance('lactose', profile)).toBe(false);
    });

    it('debería retornar false si el perfil es undefined', () => {
      expect(hasIntolerance('gluten', undefined as unknown as MedicalProfile)).toBe(false);
    });

    it('debería normalizar el alérgeno antes de verificar', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      expect(hasIntolerance('trigo', profile)).toBe(true);
    });
  });

  describe('getIntoleranceSeverity', () => {
    it('debería retornar "severe" para restricciones dietéticas', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      expect(getIntoleranceSeverity('gluten', profile)).toBe('severe');
    });

    it('debería retornar la severity de intolerancias personalizadas', () => {
      const profile = createMockProfile({
        intolerances: [{ substance: 'gluten', severity: 'mild', symptoms: 'Leve' }],
      });
      expect(getIntoleranceSeverity('gluten', profile)).toBe('mild');
    });

    it('debería retornar null si no hay intolerancia', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      expect(getIntoleranceSeverity('lactose', profile)).toBeNull();
    });

    it('debería retornar null si el perfil es undefined', () => {
      expect(getIntoleranceSeverity('gluten', undefined as unknown as MedicalProfile)).toBeNull();
    });
  });

  describe('checkDietConflicts', () => {
    const mockFood: FoodItem = {
      id: 'food-1',
      category: 'protein',
      translations: { es: 'Pechuga de pollo', en: 'Chicken breast', ca: 'Pit de pollastre' },
      searchIndex: ['pechuga', 'pollo'],
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: true,
      isLactoseFree: true,
      isNutFree: true,
      isShellfishFree: true,
      allergens: [],
      calories100g: 110,
      protein100g: 23,
      carbs100g: 0,
      fat100g: 1.5,
      defaultPortion: 150,
      defaultCalories: 165,
      defaultProtein: 31,
      defaultCarbs: 0,
      defaultFat: 3.6,
      tags: [],
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMeal: Meal = {
      id: 'meal-1',
      name: 'lunch',
      description: 'Pechuga de pollo',
      foodId: 'food-1',
      portionGrams: 150,
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      order: 1,
      allergens: [],
    };

    it('debería detectar conflicto de alérgenos (check 1)', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      const mealWithAllergens: Meal = {
        ...mockMeal,
        allergens: ['gluten'],
      };
      const conflicts = checkDietConflicts([mealWithAllergens], [mockFood], profile, 'es');
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.type).toBe('allergen');
    });

    it('debería detectar alimento excluido (check 2)', () => {
      const profile = createMockProfile({
        excludedFoods: ['food-1'],
      });
      const conflicts = checkDietConflicts([mockMeal], [mockFood], profile, 'es');
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.type).toBe('excluded_food');
      expect(conflicts[0]?.message).toContain('lista de exclusiones');
    });

    it('debería detectar categoría excluida (check 3)', () => {
      const profile = createMockProfile({
        excludedFoodCategories: ['protein'],
      });
      const conflicts = checkDietConflicts([mockMeal], [mockFood], profile, 'es');
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.type).toBe('excluded_category');
      expect(conflicts[0]?.message).toContain('categoría');
    });

    it('debería detectar conflicto vegano (check 4)', () => {
      const nonVeganFood: FoodItem = {
        ...mockFood,
        isVegan: false,
      };
      const profile = createMockProfile({
        dietaryRestrictions: { vegan: true },
      });
      const conflicts = checkDietConflicts([mockMeal], [nonVeganFood], profile, 'es');
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.type).toBe('vegan');
      expect(conflicts[0]?.severity).toBe('severe');
    });

    it('debería detectar conflicto vegetariano (check 5)', () => {
      const nonVegFood: FoodItem = {
        ...mockFood,
        isVegetarian: false,
      };
      const profile = createMockProfile({
        dietaryRestrictions: { vegetarian: true },
      });
      const conflicts = checkDietConflicts([mockMeal], [nonVegFood], profile, 'es');
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.type).toBe('vegetarian');
      expect(conflicts[0]?.severity).toBe('severe');
    });

    it('debería usar alérgenos del alimento si meal.allergens está vacío', () => {
      const foodWithAllergens: FoodItem = {
        ...mockFood,
        allergens: ['gluten'],
      };
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      const mealWithEmptyAllergens: Meal = {
        ...mockMeal,
        allergens: [],
      };
      const conflicts = checkDietConflicts([mealWithEmptyAllergens], [foodWithAllergens], profile, 'es');
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.type).toBe('allergen');
    });

    it('debería priorizar meal.allergens sobre food.allergens', () => {
      const foodWithAllergens: FoodItem = {
        ...mockFood,
        allergens: ['lactose'],
      };
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      const mealWithDifferentAllergens: Meal = {
        ...mockMeal,
        allergens: ['gluten'],
      };
      const conflicts = checkDietConflicts([mealWithDifferentAllergens], [foodWithAllergens], profile, 'es');
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.type).toBe('allergen');
      expect(conflicts[0]?.message).toContain('gluten');
    });

    it('debería funcionar con meals sin foodId (dietas legacy)', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      const legacyMeal: Meal = {
        ...mockMeal,
        foodId: undefined,
        allergens: ['gluten'],
      };
      const conflicts = checkDietConflicts([legacyMeal], [], profile, 'es');
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.type).toBe('allergen');
    });

    it('debería retornar array vacío si no hay perfil médico', () => {
      const conflicts = checkDietConflicts([mockMeal], [mockFood], undefined as unknown as MedicalProfile, 'es');
      expect(conflicts).toHaveLength(0);
    });

    it('debería retornar array vacío si no hay comidas', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      const conflicts = checkDietConflicts([], [mockFood], profile, 'es');
      expect(conflicts).toHaveLength(0);
    });

    it('debería detectar múltiples tipos de conflictos en una comida', () => {
      const food: FoodItem = {
        ...mockFood,
        allergens: ['gluten'],
        isVegan: false,
      };
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true, vegan: true },
      });
      const conflicts = checkDietConflicts([mockMeal], [food], profile, 'es');
      expect(conflicts.length).toBeGreaterThanOrEqual(2);
      const types = conflicts.map(c => c.type);
      expect(types).toContain('allergen');
      expect(types).toContain('vegan');
    });
  });

  describe('suggestSubstitutes', () => {
    const conflictedFood: FoodItem = {
      id: 'food-1',
      category: 'protein',
      translations: { es: 'Pechuga de pollo', en: 'Chicken breast', ca: 'Pit de pollastre' },
      searchIndex: ['pechuga', 'pollo'],
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: true,
      isLactoseFree: true,
      isNutFree: true,
      isShellfishFree: true,
      allergens: [],
      calories100g: 110,
      protein100g: 31,
      carbs100g: 0,
      fat100g: 1.5,
      defaultPortion: 150,
      defaultCalories: 165,
      defaultProtein: 31,
      defaultCarbs: 0,
      defaultFat: 3.6,
      tags: [],
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      substitutes: ['food-2', 'food-3'],
    };

    const substitute1: FoodItem = {
      id: 'food-2',
      category: 'protein',
      translations: { es: 'Tofu', en: 'Tofu', ca: 'Tofu' },
      searchIndex: ['tofu'],
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
      isNutFree: true,
      isShellfishFree: true,
      allergens: [],
      calories100g: 76,
      protein100g: 8,
      carbs100g: 1.9,
      fat100g: 4.8,
      defaultPortion: 100,
      defaultCalories: 76,
      defaultProtein: 8,
      defaultCarbs: 1.9,
      defaultFat: 4.8,
      tags: [],
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const substitute2: FoodItem = {
      id: 'food-3',
      category: 'protein',
      translations: { es: 'Lentejas', en: 'Lentils', ca: 'Llenties' },
      searchIndex: ['lentejas'],
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
      isNutFree: true,
      isShellfishFree: true,
      allergens: [],
      calories100g: 116,
      protein100g: 9,
      carbs100g: 20,
      fat100g: 0.4,
      defaultPortion: 100,
      defaultCalories: 116,
      defaultProtein: 9,
      defaultCarbs: 20,
      defaultFat: 0.4,
      tags: [],
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería retornar sustitutos pre-configurados compatibles', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { vegan: true },
      });
      const substitutes = suggestSubstitutes(conflictedFood, [substitute1, substitute2], profile, 'es');
      expect(substitutes).toHaveLength(2);
      expect(substitutes[0]?.id).toBe('food-2');
      expect(substitutes[1]?.id).toBe('food-3');
    });

    it('debería filtrar sustitutos pre-configurados que generan conflictos', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true },
      });
      const conflictingSubstitute: FoodItem = {
        ...substitute1,
        allergens: ['gluten'],
      };
      const substitutes = suggestSubstitutes(conflictedFood, [conflictingSubstitute, substitute2], profile, 'es');
      expect(substitutes).toHaveLength(1);
      expect(substitutes[0]?.id).toBe('food-3');
    });

    it('debería usar fallback de misma categoría + macros similares si no hay suficientes pre-configurados', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { vegan: true },
      });
      const similarFood: FoodItem = {
        id: 'food-4',
        category: 'protein',
        translations: { es: 'Tempeh', en: 'Tempeh', ca: 'Tempeh' },
        searchIndex: ['tempeh'],
        isVegan: true,
        isVegetarian: true,
        isGlutenFree: true,
        isLactoseFree: true,
        isNutFree: true,
        isShellfishFree: true,
        allergens: [],
        calories100g: 193,
        protein100g: 25, // ±20% de 31 = 24.8-37.2
        carbs100g: 9,
        fat100g: 11,
        defaultPortion: 100,
        defaultCalories: 193,
        defaultProtein: 19,
        defaultCarbs: 9,
        defaultFat: 11,
        tags: [],
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const substitutes = suggestSubstitutes(conflictedFood, [substitute1, similarFood], profile, 'es', 3);
      expect(substitutes.length).toBeGreaterThanOrEqual(2);
    });

    it('debería respetar maxResults', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { vegan: true },
      });
      const substitutes = suggestSubstitutes(conflictedFood, [substitute1, substitute2], profile, 'es', 1);
      expect(substitutes).toHaveLength(1);
    });

    it('debería retornar array vacío si no hay sustitutos compatibles', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { glutenFree: true, lactoseFree: true, nutFree: true },
      });
      const allWithConflicts: FoodItem[] = [
        { ...substitute1, allergens: ['gluten'] },
        { ...substitute2, allergens: ['lactose'] },
      ];
      const substitutes = suggestSubstitutes(conflictedFood, allWithConflicts, profile, 'es');
      expect(substitutes).toHaveLength(0);
    });

    it('debería filtrar alimentos inactivos', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { vegan: true },
      });
      const inactiveSubstitute: FoodItem = {
        ...substitute1,
        isActive: false,
      };
      const substitutes = suggestSubstitutes(conflictedFood, [inactiveSubstitute, substitute2], profile, 'es');
      expect(substitutes).toHaveLength(1);
      expect(substitutes[0]?.id).toBe('food-3');
    });

    it('debería excluir el alimento en conflicto de los resultados', () => {
      const profile = createMockProfile({
        dietaryRestrictions: { vegan: true },
      });
      const substitutes = suggestSubstitutes(conflictedFood, [conflictedFood, substitute1], profile, 'es');
      expect(substitutes).toHaveLength(1);
      expect(substitutes[0]?.id).not.toBe('food-1');
    });
  });
});
