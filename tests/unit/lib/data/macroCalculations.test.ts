import { describe, it, expect } from 'vitest';
import {
  calculateTheoreticalCalories,
  isCalorieConsistent,
  validateFoodItem,
  validateMealMacros,
} from '@/lib/data/foodValidators';
import { FOODS_CATALOG } from '@/lib/data/foodsCatalog';

describe('Macro & Nutrition Calculations — Sistema de Precisión CampFit', () => {
  function calculateMacroRatios(protein: number, carbs: number, fat: number): {
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
    totalKcal: number;
  } {
    const protKcal = protein * 4;
    const carbsKcal = carbs * 4;
    const fatKcal = fat * 9;
    const total = protKcal + carbsKcal + fatKcal;

    if (total === 0) {
      return { proteinPct: 0, carbsPct: 0, fatPct: 0, totalKcal: 0 };
    }

    return {
      proteinPct: Math.round((protKcal / total) * 100),
      carbsPct: Math.round((carbsKcal / total) * 100),
      fatPct: Math.round((fatKcal / total) * 100),
      totalKcal: total,
    };
  }

  it('debe calcular correctamente las calorías teóricas de Atwater (4P + 4C + 9G)', () => {
    // 30g proteína (120 kcal) + 40g carbohidratos (160 kcal) + 10g grasa (90 kcal) = 370 kcal
    const calories = calculateTheoreticalCalories(30, 40, 10);
    expect(calories).toBe(370);
  });

  it('isCalorieConsistent debe verificar coherencia calórica con margen de tolerancia', () => {
    expect(isCalorieConsistent(370, 30, 40, 10)).toBe(true);
    expect(isCalorieConsistent(360, 30, 40, 10)).toBe(true); // dentro del margen
    expect(isCalorieConsistent(800, 30, 40, 10)).toBe(false); // fuera del margen
    expect(isCalorieConsistent(-50, 30, 40, 10)).toBe(false);
  });

  it('debe calcular los porcentajes de distribución de macronutrientes de forma exacta', () => {
    // 25g P (100 kcal) + 25g C (100 kcal) + 0g F (0 kcal) = 200 kcal -> 50% P, 50% C, 0% F
    const ratios = calculateMacroRatios(25, 25, 0);
    expect(ratios.proteinPct).toBe(50);
    expect(ratios.carbsPct).toBe(50);
    expect(ratios.fatPct).toBe(0);
    expect(ratios.totalKcal).toBe(200);
  });

  it('debe manejar macros en cero sin divisiones por cero ni valores NaN', () => {
    const ratios = calculateMacroRatios(0, 0, 0);
    expect(ratios.proteinPct).toBe(0);
    expect(ratios.carbsPct).toBe(0);
    expect(ratios.fatPct).toBe(0);
    expect(ratios.totalKcal).toBe(0);
    expect(Number.isNaN(ratios.proteinPct)).toBe(false);
  });

  it('todos los alimentos del catálogo canónico deben ser válidos y tener macros coherentes', () => {
    FOODS_CATALOG.forEach((food) => {
      const validation = validateFoodItem(food);
      expect(validation.isValid).toBe(true);
      expect(food.calories100g).toBeGreaterThan(0);
      expect(food.protein100g).toBeGreaterThanOrEqual(0);
      expect(food.carbs100g).toBeGreaterThanOrEqual(0);
      expect(food.fat100g).toBeGreaterThanOrEqual(0);
    });
  });

  it('debe rechazar alimentos con valores negativos o ilógicos', () => {
    const invalidFoodNegative = {
      id: 'bad-1',
      category: 'proteins' as any,
      calories100g: -50,
      protein100g: 20,
      carbs100g: 0,
      fat100g: 0,
      defaultPortion: 100,
      allergens: [],
      isActive: true,
      translations: { es: 'Comida', en: 'Food', ca: 'Menjar' },
    };
    const resultNeg = validateFoodItem(invalidFoodNegative);
    expect(resultNeg.isValid).toBe(false);
    expect(resultNeg.issues.length).toBeGreaterThan(0);

    const invalidFoodOverflow = {
      id: 'bad-2',
      category: 'proteins' as any,
      calories100g: 1500,
      protein100g: 150,
      carbs100g: 0,
      fat100g: 0,
      defaultPortion: 100,
      allergens: [],
      isActive: true,
      translations: { es: 'Comida', en: 'Food', ca: 'Menjar' },
    };
    const resultOver = validateFoodItem(invalidFoodOverflow);
    expect(resultOver.isValid).toBe(false);
  });

  it('validateMealMacros debe validar correctamente porciones y no permitir valores negativos', () => {
    expect(validateMealMacros({ portionGrams: 150, calories: 250, protein: 20, carbs: 30, fat: 5 }).isValid).toBe(true);
    expect(validateMealMacros({ portionGrams: 0, calories: 250, protein: 20, carbs: 30, fat: 5 }).isValid).toBe(false);
    expect(validateMealMacros({ portionGrams: -20, calories: 250, protein: 20, carbs: 30, fat: 5 }).isValid).toBe(false);
    expect(validateMealMacros({ portionGrams: 150, calories: -250, protein: 20, carbs: 30, fat: 5 }).isValid).toBe(false);
  });
});
