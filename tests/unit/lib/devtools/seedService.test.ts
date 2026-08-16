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
    empty: true,
    size: 0,
    docs: [],
  }),
  query: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(() => mockWriteBatch),
  serverTimestamp: vi.fn(() => new Date()),
  Timestamp: {
    now: vi.fn(() => ({ toMillis: () => Date.now(), toDate: () => new Date() })),
  },
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('seedService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ seedExerciseTemplates debería escribir lote de ejercicios', async () => {
    const { seedExerciseTemplates } = await import('@/lib/devtools/seedService');
    const result = await seedExerciseTemplates();

    expect(result.created).toBeGreaterThan(0);
    expect(mockWriteBatch.set).toHaveBeenCalled();
    expect(mockWriteBatch.commit).toHaveBeenCalled();
  });

  it('✅ seedMealTemplates debería escribir lote de comidas', async () => {
    const { seedMealTemplates } = await import('@/lib/devtools/seedService');
    const result = await seedMealTemplates();

    expect(result.created).toBeGreaterThan(0);
    expect(mockWriteBatch.set).toHaveBeenCalled();
    expect(mockWriteBatch.commit).toHaveBeenCalled();
  });

  it('✅ seedDietTemplates debería escribir lote de dietas', async () => {
    const { seedDietTemplates } = await import('@/lib/devtools/seedService');
    const result = await seedDietTemplates();

    expect(result.created).toBeGreaterThan(0);
    expect(mockWriteBatch.set).toHaveBeenCalled();
    expect(mockWriteBatch.commit).toHaveBeenCalled();
  });

  it('✅ seedWorkoutTemplates debería escribir lote de rutinas', async () => {
    const { seedWorkoutTemplates } = await import('@/lib/devtools/seedService');
    const result = await seedWorkoutTemplates();

    expect(result.created).toBeGreaterThan(0);
    expect(mockWriteBatch.set).toHaveBeenCalled();
    expect(mockWriteBatch.commit).toHaveBeenCalled();
  });

  it('✅ seedAllTemplates debería ejecutar todas las semillas', async () => {
    const { seedAllTemplates } = await import('@/lib/devtools/seedService');
    const result = await seedAllTemplates();

    expect(result.exercises.created).toBeGreaterThan(0);
    expect(result.meals.created).toBeGreaterThan(0);
    expect(result.diets.created).toBeGreaterThan(0);
    expect(result.workouts.created).toBeGreaterThan(0);
    expect(result.totalCreated).toBeGreaterThan(0);
  });

  it('🧹 purgeTemplates debería eliminar documentos isPreset: true', async () => {
    const { purgeTemplates } = await import('@/lib/devtools/seedService');
    const deleted = await purgeTemplates();

    expect(deleted).toBeGreaterThanOrEqual(0);
  });
});
