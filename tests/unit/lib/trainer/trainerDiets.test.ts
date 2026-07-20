/**
 * Tests unitarios para trainerDiets.ts
 *
 * @module tests/unit/lib/trainer/trainerDiets.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCollection = vi.fn();
const mockDoc = vi.fn();
const mockAddDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockOnSnapshot = vi.fn(() => vi.fn());
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockServerTimestamp = vi.fn(() => new Date('2024-01-01'));

const firestoreInstance = {
  type: 'firestore',
  app: { name: '[DEFAULT]', options: {} },
  _initialized: true,
  _settings: {},
  _settingsFrozen: false,
  _terminated: false,
  _terminateTask: Promise.resolve(),
  _getSettings: vi.fn(() => ({ host: 'firestore.googleapis.com', ssl: true, ignoreUndefinedProperties: false })),
  _setSettings: vi.fn(),
  _setLanguageCode: vi.fn(),
  _getLanguageCode: vi.fn(() => 'es'),
  _getDatabaseId: vi.fn(() => '(default)'),
  _getAppCheckToken: vi.fn().mockResolvedValue(undefined),
  _getCredentials: vi.fn().mockResolvedValue(undefined),
  toJSON: vi.fn(() => ({})),
};

const firestoreExports = {
  getFirestore: vi.fn(() => firestoreInstance),
  collection: vi.fn((...args: unknown[]) => {
    mockCollection(...args);
    return { id: typeof args[1] === 'string' ? args[1] : 'unknown', path: `firestore/${args[1] || 'unknown'}`, firestore: firestoreInstance, type: 'collection', withConverter: vi.fn(() => ({})) };
  }),
  doc: vi.fn((...args: unknown[]) => {
    mockDoc(...args);
    return { id: typeof args[2] === 'string' ? args[2] : 'mock-doc-ref', path: `firestore/${args[1] || 'unknown'}/${args[2] || 'mock-doc-ref'}`, firestore: firestoreInstance, type: 'document', withConverter: vi.fn(() => ({})) };
  }),
  addDoc: mockAddDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  onSnapshot: mockOnSnapshot,
  query: vi.fn((...args: unknown[]) => { mockQuery(...args); return { type: 'query', firestore: firestoreInstance, withConverter: vi.fn(() => ({})) }; }),
  where: vi.fn((...args: unknown[]) => { mockWhere(...args); return { field: args[0], op: args[1], value: args[2] }; }),
  orderBy: vi.fn((...args: unknown[]) => { mockOrderBy(...args); return { field: args[0], direction: args[1] }; }),
  limit: vi.fn((...args: unknown[]) => { mockLimit(...args); return { type: 'limit', value: args[0] }; }),
  serverTimestamp: mockServerTimestamp,
  Timestamp: class {
    static now() { return new Date('2024-01-01'); }
    static fromDate(date: Date) { return date; }
    toDate() { return new Date('2024-01-01'); }
    toMillis() { return 1704067200000; }
  },
};

vi.mock('firebase/firestore', () => firestoreExports);

vi.mock('@/lib/firebase', () => ({
  db: firestoreInstance,
}));

vi.mock('@/lib/shared/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/shared/ui', () => ({
  showToast: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockDiet = {
  clientId: 'client-123',
  trainerId: 'trainer-123',
  name: 'Dieta definición',
  type: 'normal' as const,
  totalCalories: 2200,
  meals: [
    { id: 'm-1', name: 'breakfast' as const, description: 'Avena con proteína', calories: 500, protein: 30, carbs: 60, fat: 10, order: 1 },
  ],
};

describe('trainerDiets', () => {
  describe('subscribeToDietsByTrainer', () => {
    it('debería suscribirse a las dietas del entrenador', async () => {
      mockOnSnapshot.mockImplementation((_q: unknown, callback: (s: unknown) => void) => {
        callback({ docs: [{ id: 'd-1', data: () => mockDiet }] });
        return vi.fn();
      });

      const { subscribeToDietsByTrainer } = await import('@/lib/trainer/trainerDiets');
      const callback = vi.fn();
      subscribeToDietsByTrainer('trainer-123', callback);

      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 'd-1' })]),
      );
    });
  });

  describe('subscribeToDietsByClient', () => {
    it('debería suscribirse a las dietas de un cliente', async () => {
      mockOnSnapshot.mockImplementation((_q: unknown, callback: (s: unknown) => void) => {
        callback({ docs: [{ id: 'd-1', data: () => mockDiet }] });
        return vi.fn();
      });

      const { subscribeToDietsByClient } = await import('@/lib/trainer/trainerDiets');
      const callback = vi.fn();
      subscribeToDietsByClient('client-123', callback);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('createDiet', () => {
    it('debería crear una dieta exitosamente', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-diet-123' });

      const { createDiet } = await import('@/lib/trainer/trainerDiets');
      const id = await createDiet(mockDiet);

      expect(id).toBe('new-diet-123');
    });

    it('debería retornar null si falla la creación', async () => {
      mockAddDoc.mockRejectedValue(new Error('Error'));

      const { createDiet } = await import('@/lib/trainer/trainerDiets');
      const id = await createDiet(mockDiet);

      expect(id).toBeNull();
    });
  });

  describe('updateDiet', () => {
    it('debería actualizar una dieta exitosamente', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const { updateDiet } = await import('@/lib/trainer/trainerDiets');
      const result = await updateDiet('d-123', { name: 'Nueva dieta' });

      expect(result).toBe(true);
    });

    it('debería retornar false si falla', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Error'));

      const { updateDiet } = await import('@/lib/trainer/trainerDiets');
      const result = await updateDiet('d-123', { name: 'Nueva dieta' });

      expect(result).toBe(false);
    });
  });

  describe('deleteDiet', () => {
    it('debería eliminar una dieta exitosamente', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      const { deleteDiet } = await import('@/lib/trainer/trainerDiets');
      const result = await deleteDiet('d-123');

      expect(result).toBe(true);
    });

    it('debería retornar false si falla', async () => {
      mockDeleteDoc.mockRejectedValue(new Error('Error'));

      const { deleteDiet } = await import('@/lib/trainer/trainerDiets');
      const result = await deleteDiet('d-123');

      expect(result).toBe(false);
    });
  });
});
