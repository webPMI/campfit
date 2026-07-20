/**
 * Tests unitarios para trainerWorkouts.ts
 *
 * @module tests/unit/lib/trainer/trainerWorkouts.test
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

const mockWorkout = {
  clientId: 'client-123',
  trainerId: 'trainer-123',
  name: 'Rutina de fuerza',
  difficulty: 'intermediate',
  description: 'Rutina de fuerza para principiantes',
  exercises: [
    { id: 'ex-1', name: 'Press banca', sets: 4, reps: 8, restTime: '90s', videoUrl: '', description: '', order: 1, dayOfWeek: 1 },
  ],
};

describe('trainerWorkouts', () => {
  describe('subscribeToWorkoutsByTrainer', () => {
    it('debería suscribirse a las rutinas del entrenador', async () => {
      const mockWorkouts = [
        { id: 'w-1', data: () => ({ ...mockWorkout, name: 'Rutina 1' }) },
        { id: 'w-2', data: () => ({ ...mockWorkout, name: 'Rutina 2' }) },
      ];

      mockOnSnapshot.mockImplementation((_q: unknown, callback: (s: unknown) => void) => {
        callback({ docs: mockWorkouts });
        return vi.fn();
      });

      const { subscribeToWorkoutsByTrainer } = await import('@/lib/trainer/trainerWorkouts');
      const callback = vi.fn();
      subscribeToWorkoutsByTrainer('trainer-123', callback);

      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'w-1', name: 'Rutina 1' }),
        ]),
      );
    });
  });

  describe('subscribeToWorkoutsByClient', () => {
    it('debería suscribirse a las rutinas de un cliente', async () => {
      mockOnSnapshot.mockImplementation((_q: unknown, callback: (s: unknown) => void) => {
        callback({ docs: [{ id: 'w-1', data: () => mockWorkout }] });
        return vi.fn();
      });

      const { subscribeToWorkoutsByClient } = await import('@/lib/trainer/trainerWorkouts');
      const callback = vi.fn();
      subscribeToWorkoutsByClient('client-123', callback);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('createWorkout', () => {
    it('debería crear una rutina exitosamente', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-workout-123' });

      const { createWorkout } = await import('@/lib/trainer/trainerWorkouts');
      const id = await createWorkout(mockWorkout);

      expect(id).toBe('new-workout-123');
      expect(mockAddDoc).toHaveBeenCalled();
    });

    it('debería retornar null si falla la creación', async () => {
      mockAddDoc.mockRejectedValue(new Error('Error'));

      const { createWorkout } = await import('@/lib/trainer/trainerWorkouts');
      const id = await createWorkout(mockWorkout);

      expect(id).toBeNull();
    });
  });

  describe('updateWorkout', () => {
    it('debería actualizar una rutina exitosamente', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const { updateWorkout } = await import('@/lib/trainer/trainerWorkouts');
      const result = await updateWorkout('w-123', { name: 'Nuevo nombre' });

      expect(result).toBe(true);
    });

    it('debería retornar false si falla la actualización', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Error'));

      const { updateWorkout } = await import('@/lib/trainer/trainerWorkouts');
      const result = await updateWorkout('w-123', { name: 'Nuevo nombre' });

      expect(result).toBe(false);
    });
  });

  describe('deleteWorkout', () => {
    it('debería eliminar una rutina exitosamente', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      const { deleteWorkout } = await import('@/lib/trainer/trainerWorkouts');
      const result = await deleteWorkout('w-123');

      expect(result).toBe(true);
    });

    it('debería retornar false si falla la eliminación', async () => {
      mockDeleteDoc.mockRejectedValue(new Error('Error'));

      const { deleteWorkout } = await import('@/lib/trainer/trainerWorkouts');
      const result = await deleteWorkout('w-123');

      expect(result).toBe(false);
    });
  });
});
