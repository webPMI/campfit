/**
 * Unit tests para trainer/templateService.ts
 *
 * @module tests/unit/lib/trainer/templateService.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetDoc, mockAddDoc } = vi.hoisted(() => ({
  mockGetDoc: vi.fn(),
  mockAddDoc: vi.fn(),
}));

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
  getDoc: mockGetDoc,
  addDoc: mockAddDoc,
  serverTimestamp: vi.fn(() => new Date()),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('@/lib/shared/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
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

  describe('applyDietTemplateToClient', () => {
    it('✅ debería clonar dieta para cliente asignado', async () => {
      // 1. Trainer (callerSnap)
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ role: 'trainer' }),
      });
      // 2. Cliente asignado al trainer (clientSnap)
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ assignedTrainerId: 'trainer-999' }),
      });
      // 3. Plantilla existe (templateSnap)
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          name: 'Plantilla Test',
          type: 'normal',
          somatotype: 'ectomorph',
          totalCalories: 2200,
          meals: [],
        }),
      });
      mockAddDoc.mockResolvedValue({ id: 'new-cloned-id' });

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

    it('❌ debería lanzar error si el cliente NO está asignado al trainer', async () => {
      // 1. Trainer
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ role: 'trainer' }),
      });
      // 2. Cliente NO asignado al trainer
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ assignedTrainerId: 'otro-trainer' }),
      });

      await expect(
        applyDietTemplateToClient('temp-1', 'client-123', 'trainer-999')
      ).rejects.toThrow('El cliente no está asignado a este entrenador.');
      expect(addDoc).not.toHaveBeenCalled();
    });

    it('❌ debería lanzar error si el cliente no existe', async () => {
      // 1. Trainer
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ role: 'trainer' }),
      });
      // 2. Cliente no existe
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
        data: () => ({}),
      });

      await expect(
        applyDietTemplateToClient('temp-1', 'client-123', 'trainer-999')
      ).rejects.toThrow('El cliente no está asignado a este entrenador.');
      expect(addDoc).not.toHaveBeenCalled();
    });

    it('❌ debería lanzar error si la plantilla no existe', async () => {
      // 1. Trainer
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ role: 'trainer' }),
      });
      // 2. Cliente asignado
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ assignedTrainerId: 'trainer-999' }),
      });
      // 3. Plantilla NO existe
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
        data: () => ({}),
      });

      await expect(
        applyDietTemplateToClient('temp-inexistente', 'client-123', 'trainer-999')
      ).rejects.toThrow('La plantilla de dieta especificada no existe.');
      expect(addDoc).not.toHaveBeenCalled();
    });
  });

  describe('applyWorkoutTemplateToClient', () => {
    it('✅ debería clonar rutina para cliente asignado', async () => {
      // 1. Trainer
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ role: 'trainer' }),
      });
      // 2. Cliente asignado
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ assignedTrainerId: 'trainer-999' }),
      });
      // 3. Plantilla existe
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          name: 'Rutina Test',
          difficulty: 'beginner',
          description: 'Rutina',
          exercises: [],
        }),
      });
      mockAddDoc.mockResolvedValue({ id: 'new-cloned-id' });

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

    it('❌ debería lanzar error si el cliente NO está asignado al trainer', async () => {
      // 1. Trainer
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ role: 'trainer' }),
      });
      // 2. Cliente NO asignado
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ assignedTrainerId: 'otro-trainer' }),
      });

      await expect(
        applyWorkoutTemplateToClient('temp-2', 'client-123', 'trainer-999')
      ).rejects.toThrow('El cliente no está asignado a este entrenador.');
      expect(addDoc).not.toHaveBeenCalled();
    });
  });
});