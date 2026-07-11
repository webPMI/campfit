/**
 * Tests unitarios para workoutService.
 *
 * workoutService depende de Firestore (onSnapshot).
 * Usamos vi.mock con factory inline y objeto mockFns compartido.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mocks con vi.hoisted() para vitest 4.x ──────────────────────────────────

const { firestoreInstance, mockFns } = vi.hoisted(() => {
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

  const mockFns = {
    collection: vi.fn(() => ({
      id: 'unknown',
      path: 'firestore/unknown',
      firestore: firestoreInstance,
      type: 'collection',
      withConverter: vi.fn(() => ({})),
    })),
    doc: vi.fn(() => ({
      id: 'mock-doc-ref',
      path: 'users/mock-doc-ref',
      firestore: firestoreInstance,
      type: 'document',
      withConverter: vi.fn(() => ({})),
    })),
    addDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn(() => vi.fn()),
    query: vi.fn(() => ({
      type: 'query',
      firestore: firestoreInstance,
      withConverter: vi.fn(() => ({})),
    })),
    where: vi.fn(() => ({})),
    orderBy: vi.fn(() => ({})),
    limit: vi.fn(() => ({})),
    serverTimestamp: vi.fn(() => new Date('2024-01-01')),
    getFirestore: vi.fn(() => firestoreInstance),
  };

  return { firestoreInstance, mockFns };
});

vi.mock('firebase/firestore', () => mockFns);

vi.mock('@/lib/firebase', () => ({
  db: firestoreInstance,
  auth: {},
}));

vi.mock('@/lib/shared/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// ─── Servicio REAL a testear ─────────────────────────────────────────────────

import { subscribeToWorkouts } from '../../../../src/lib/client/workoutService';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('workoutService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('subscribeToWorkouts', () => {
    it('should call onSnapshot with correct query for client workouts', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({ docs: [] });
        return () => {};
      });

      const unsubscribe = subscribeToWorkouts('client-123', callback);

      expect(mockFns.collection).toHaveBeenCalledWith(expect.anything(), 'workouts');
      expect(mockFns.where).toHaveBeenCalledWith('clientId', '==', 'client-123');
      expect(mockFns.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockFns.limit).toHaveBeenCalledWith(1);
      expect(mockFns.onSnapshot).toHaveBeenCalledTimes(1);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should invoke callback with mapped workouts on snapshot', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({
          docs: [
            { id: 'workout-1', data: () => ({ name: 'Full Body', difficulty: 'medium', description: 'Rutina completa' }) },
          ],
        });
        return () => {};
      });

      subscribeToWorkouts('client-123', callback);

      expect(callback).toHaveBeenCalledWith([
        { id: 'workout-1', name: 'Full Body', difficulty: 'medium', description: 'Rutina completa' },
      ]);
    });

    it('should invoke callback with empty array when no workouts', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({ docs: [] });
        return () => {};
      });

      subscribeToWorkouts('client-123', callback);

      expect(callback).toHaveBeenCalledWith([]);
    });

    it('should return unsubscribe function', () => {
      const unsubscribeMock = vi.fn();
      mockFns.onSnapshot.mockReturnValue(unsubscribeMock);

      const callback = vi.fn();
      const unsubscribe = subscribeToWorkouts('client-123', callback);

      unsubscribe();
      expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    });

    it('should call callback with empty array and return noop when clientId is empty', () => {
      const callback = vi.fn();

      const unsubscribe = subscribeToWorkouts('', callback);

      expect(callback).toHaveBeenCalledWith([]);
      expect(mockFns.onSnapshot).not.toHaveBeenCalled();
      unsubscribe(); // no debe lanzar error
    });

    it('should call onError and callback with empty array on snapshot error', () => {
      const callback = vi.fn();
      const onError = vi.fn();
      const testError = new Error('Permission denied');
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, _cb: unknown, errCb: (err: Error) => void) => {
        errCb(testError);
        return () => {};
      });

      subscribeToWorkouts('client-123', callback, onError);

      expect(onError).toHaveBeenCalledWith(testError);
      expect(callback).toHaveBeenCalledWith([]);
    });
  });
});
