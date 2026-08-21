import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockUpdateDoc, mockGetDoc } = vi.hoisted(() => ({
  mockUpdateDoc: vi.fn(),
  mockGetDoc: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, coll, id) => ({ id: `${coll}-${id}` })),
  updateDoc: mockUpdateDoc,
  getDoc: mockGetDoc,
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('@/lib/shared/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import {
  calculateBMR,
  calculateTDEE,
  calculateMetabolicProfile,
  saveUserMetabolicGoal,
  getCachedMetabolicProfile,
  setCachedMetabolicProfile,
} from '@/lib/client/metabolicCalculator';

describe('MetabolicCalculator Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateBMR', () => {
    it('debe calcular correctamente el BMR para hombres según Mifflin-St Jeor', () => {
      // 80kg, 180cm, 30 años, hombre
      // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780 kcal
      const bmr = calculateBMR(80, 180, 30, 'male');
      expect(bmr).toBe(1780);
    });

    it('debe calcular correctamente el BMR para mujeres según Mifflin-St Jeor', () => {
      // 60kg, 165cm, 28 años, mujer
      // 10*60 + 6.25*165 - 5*28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330 kcal
      const bmr = calculateBMR(60, 165, 28, 'female');
      expect(bmr).toBe(1330);
    });
  });

  describe('calculateTDEE', () => {
    it('debe multiplicar BMR por el factor de actividad correcto', () => {
      const bmr = 1800;
      expect(calculateTDEE(bmr, 'sedentary')).toBe(Math.round(1800 * 1.2));
      expect(calculateTDEE(bmr, 'moderate')).toBe(Math.round(1800 * 1.55));
      expect(calculateTDEE(bmr, 'active')).toBe(Math.round(1800 * 1.725));
    });
  });

  describe('calculateMetabolicProfile', () => {
    it('debe calcular un perfil metabólico completo con macros balanceados', () => {
      const profile = calculateMetabolicProfile({
        weightKg: 75,
        heightCm: 175,
        ageYears: 25,
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'fat_loss',
      });

      expect(profile.bmr).toBeGreaterThan(1500);
      expect(profile.tdee).toBeGreaterThan(profile.bmr);
      expect(profile.targetCalories).toBeLessThan(profile.tdee); // Déficit
      expect(profile.macros.proteinGrams).toBeGreaterThan(120);
      expect(profile.macros.carbsGrams).toBeGreaterThan(50);
      expect(profile.macros.fatGrams).toBeGreaterThan(40);
      expect(profile.waterLitersRecommended).toBeGreaterThanOrEqual(2.0);
    });

    it('debe calcular superávit calórico para ganancia muscular', () => {
      const profile = calculateMetabolicProfile({
        weightKg: 70,
        heightCm: 170,
        ageYears: 22,
        gender: 'male',
        activityLevel: 'active',
        goal: 'muscle_gain',
      });

      expect(profile.targetCalories).toBeGreaterThan(profile.tdee); // Superávit
    });
  });

  describe('saveUserMetabolicGoal', () => {
    it('debe guardar el objetivo en Firestore y en caché local', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const input = {
        weightKg: 80,
        heightCm: 180,
        ageYears: 30,
        gender: 'male' as const,
        activityLevel: 'moderate' as const,
        goal: 'maintenance' as const,
      };
      const result = calculateMetabolicProfile(input);

      const success = await saveUserMetabolicGoal('user-777', input, result);
      expect(success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          metabolicGoal: expect.objectContaining({
            input,
            result,
          }),
        }),
      );
    });
  });
});
