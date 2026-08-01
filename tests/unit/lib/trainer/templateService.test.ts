/**
 * Unit tests para trainer/templateService.ts
 *
 * @module tests/unit/lib/trainer/templateService.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ id: name })),
  doc: vi.fn((_db, coll, id) => ({ id: `${coll}-${id}` })),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn((_q, callback) => {
    callback({
      docs: [
        { id: 't-1', data: () => ({ name: 'Dieta Semilla', isPreset: true }) },
      ],
    });
    return vi.fn();
  }),
  getDoc: vi.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({
      name: 'Plantilla Test',
      type: 'normal',
      somatotype: 'ectomorph',
      totalCalories: 2200,
      meals: [],
      difficulty: 'beginner',
      exercises: [],
    }),
  }),
  addDoc: vi.fn().mockResolvedValue({ id: 'new-cloned-id' }),
  serverTimestamp: vi.fn(() => new Date()),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

import { subscribeToDietTemplates, applyDietTemplateToClient, applyWorkoutTemplateToClient } from '@/lib/trainer/templateService';

import { addDoc } from 'firebase/firestore';

describe('templateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ subscribeToDietTemplates debería notificar plantillas', () => {
    const cb = vi.fn();
    const unsub = subscribeToDietTemplates(cb);

    expect(cb).toHaveBeenCalledWith([
      expect.objectContaining({ id: 't-1', name: 'Dieta Semilla' }),
    ]);
    expect(unsub).toBeInstanceOf(Function);
  });

  it('✅ applyDietTemplateToClient debería clonar dieta para cliente', async () => {
    const newId = await applyDietTemplateToClient('temp-1', 'client-123', 'trainer-999');

    expect(newId).toBe('new-cloned-id');
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        clientId: 'client-123',
        trainerId: 'trainer-999',
        name: 'Plantilla Test',
      }),
    );
  });

  it('✅ applyWorkoutTemplateToClient debería clonar rutina para cliente', async () => {
    const newId = await applyWorkoutTemplateToClient('temp-2', 'client-123', 'trainer-999');

    expect(newId).toBe('new-cloned-id');
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        clientId: 'client-123',
        trainerId: 'trainer-999',
        difficulty: 'beginner',
      }),
    );
  });
});
