/**
 * Unit tests para seedService.ts (DevTools)
 *
 * @module tests/unit/lib/devtools/seedService.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockWriteBatch = {
  set: vi.fn(),
  delete: vi.fn(),
  commit: vi.fn().mockResolvedValue(undefined),
};

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ id: name })),
  doc: vi.fn((_coll) => ({ id: `doc-${Math.random().toString(36).substring(2, 7)}` })),
  setDoc: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({
    empty: false,
    size: 5,
    docs: [
      { ref: { id: 'd-1' } },
      { ref: { id: 'd-2' } },
    ],
  }),
  query: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(() => mockWriteBatch),
  serverTimestamp: vi.fn(() => new Date()),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('seedService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ seedExerciseTemplates debería escribir lote de ejercicios', async () => {
    // TODO: Add real assertion
    // TODO: Replace with real assertion
      expect(true).toBe(true);
  
    const { seedExerciseTemplates } = await import('@/lib/devtools/seedService');
    const count = await seedExerciseTemplates();

    expect(count).toBeGreaterThan(0);
    expect(mockWriteBatch.set).toHaveBeenCalled();
    expect(mockWriteBatch.commit).toHaveBeenCalled();
  });

  it('✅ seedMealTemplates debería escribir lote de comidas', async () => {
    // TODO: Add real assertion
    // TODO: Replace with real assertion
      expect(true).toBe(true);
  
    const { seedMealTemplates } = await import('@/lib/devtools/seedService');
    const count = await seedMealTemplates();

    expect(count).toBeGreaterThan(0);
    expect(mockWriteBatch.set).toHaveBeenCalled();
    expect(mockWriteBatch.commit).toHaveBeenCalled();
  });

  it('✅ seedDietTemplates debería escribir lote de dietas', async () => {
    // TODO: Add real assertion
    // TODO: Replace with real assertion
      expect(true).toBe(true);
  
    const { seedDietTemplates } = await import('@/lib/devtools/seedService');
    const count = await seedDietTemplates();

    expect(count).toBeGreaterThan(0);
    expect(mockWriteBatch.set).toHaveBeenCalled();
    expect(mockWriteBatch.commit).toHaveBeenCalled();
  });

  it('✅ seedWorkoutTemplates debería escribir lote de rutinas', async () => {
    // TODO: Add real assertion
    // TODO: Replace with real assertion
      expect(true).toBe(true);
  
    const { seedWorkoutTemplates } = await import('@/lib/devtools/seedService');
    const count = await seedWorkoutTemplates();

    expect(count).toBeGreaterThan(0);
    expect(mockWriteBatch.set).toHaveBeenCalled();
    expect(mockWriteBatch.commit).toHaveBeenCalled();
  });

  it('✅ seedAllTemplates debería ejecutar todas las semillas', async () => {
    // TODO: Add real assertion
    // TODO: Replace with real assertion
      expect(true).toBe(true);
  
    const { seedAllTemplates } = await import('@/lib/devtools/seedService');
    const result = await seedAllTemplates();

    expect(result.exercises).toBeGreaterThan(0);
    expect(result.meals).toBeGreaterThan(0);
    expect(result.diets).toBeGreaterThan(0);
    expect(result.workouts).toBeGreaterThan(0);
    expect(result.total).toEqual(result.exercises + result.meals + result.diets + result.workouts);
  });

  it('🧹 purgeTemplates debería eliminar documentos isPreset: true', async () => {
    // TODO: Add real assertion
    // TODO: Replace with real assertion
      expect(true).toBe(true);
  
    const { purgeTemplates } = await import('@/lib/devtools/seedService');
    const deleted = await purgeTemplates();

    expect(deleted).toBe(8); // 2 docs * 4 collections
    expect(mockWriteBatch.delete).toHaveBeenCalled();
    expect(mockWriteBatch.commit).toHaveBeenCalled();
  });
});
