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

import {
  subscribeToDietTemplates,
  applyDietTemplateToClient,
  applyWorkoutTemplateToClient,
  auditDietTemplateForClient,
  validateDietTemplateHealth,
  validateWorkoutTemplateHealth,
  invalidateTemplateCache,
} from '@/lib/trainer/templateService';

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

  describe('auditDietTemplateForClient', () => {
    it('✅ debe detectar alérgenos conflictivos y generar sugerencias', () => {
      const template = {
        id: 'tpl-peanut',
        name: 'Dieta con Cacahuete',
        type: 'normal' as const,
        somatotype: 'mesomorph' as const,
        totalCalories: 2000,
        meals: [
          {
            id: 'm-1',
            name: 'Desayuno',
            description: 'Tostada con crema de cacahuete',
            foodId: 'food-peanut-butter',
            allergens: ['nuts', 'peanut'],
            portionGrams: 30,
            calories: 180,
            protein: 8,
            carbs: 6,
            fat: 15,
            order: 1,
          },
        ],
      };

      const medicalProfile = {
        allergies: ['peanut', 'nuts'],
        intolerances: [{ substance: 'nuts', severity: 'severe' as const, symptoms: 'Anafilaxia' }],
        injuries: [],
        medicalConditions: [],
        dietaryRestrictions: {
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          lactoseFree: false,
          nutFree: true,
          shellfishFree: false,
        },
      };

      const audit = auditDietTemplateForClient(template, medicalProfile as any, 'es');
      expect(audit.hasConflicts).toBe(true);
      expect(audit.conflicts.length).toBeGreaterThan(0);
      expect(audit.conflicts[0].severity).toBe('severe');
    });
  });

  describe('validateTemplateHealth', () => {
    it('✅ validateDietTemplateHealth debe reportar advertencias en IDs inexistentes', () => {
      const template = {
        name: 'Dieta Test IDs',
        type: 'normal',
        meals: [
          { name: 'lunch', description: 'Plato raro', foodId: 'id-inexistente-12345' },
        ],
      };

      const report = validateDietTemplateHealth(template as any);
      expect(report.missingIds).toContain('id-inexistente-12345');
      expect(report.warnings.length).toBeGreaterThan(0);
    });

    it('✅ validateWorkoutTemplateHealth debe reportar advertencias en IDs inexistentes', () => {
      const template = {
        name: 'Rutina Test IDs',
        category: 'strength',
        exercises: [
          { name: 'Ejercicio Raro', exerciseId: 'id-ejercicio-fantasma-999' },
        ],
      };

      const report = validateWorkoutTemplateHealth(template as any);
      expect(report.missingIds).toContain('id-ejercicio-fantasma-999');
      expect(report.warnings.length).toBeGreaterThan(0);
    });
  });
});