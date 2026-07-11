/**
 * Tests unitarios para dietService.
 *
 * dietService depende de Firestore (onSnapshot, addDoc).
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

import {
  subscribeToDiets,
  subscribeToDietHistory,
  registerMealComplete,
  subscribeToTodayMeals,
} from '../../../../src/lib/client/dietService';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('dietService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('subscribeToDiets', () => {
    it('should call onSnapshot with correct query for client diets', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({ docs: [] });
        return () => {};
      });

      const unsubscribe = subscribeToDiets('client-123', callback);

      expect(mockFns.collection).toHaveBeenCalledWith(expect.anything(), 'diets');
      expect(mockFns.where).toHaveBeenCalledWith('clientId', '==', 'client-123');
      expect(mockFns.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockFns.limit).toHaveBeenCalledWith(1);
      expect(mockFns.onSnapshot).toHaveBeenCalledTimes(1);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should invoke callback with mapped diets on snapshot', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({
          docs: [
            { id: 'diet-1', data: () => ({ name: 'Dieta Cetogenica', type: 'normal', totalCalories: 2000, somatotype: 'ectomorph', meals: [] }) },
          ],
        });
        return () => {};
      });

      subscribeToDiets('client-123', callback);

      expect(callback).toHaveBeenCalledWith([
        { id: 'diet-1', name: 'Dieta Cetogenica', type: 'normal', totalCalories: 2000, somatotype: 'ectomorph', meals: [] },
      ]);
    });

    it('should invoke callback with empty array when no diets', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({ docs: [] });
        return () => {};
      });

      subscribeToDiets('client-123', callback);

      expect(callback).toHaveBeenCalledWith([]);
    });

    it('should return unsubscribe function', () => {
      const unsubscribeMock = vi.fn();
      mockFns.onSnapshot.mockReturnValue(unsubscribeMock);

      const callback = vi.fn();
      const unsubscribe = subscribeToDiets('client-123', callback);

      unsubscribe();
      expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    });

    it('should call callback with empty array and return noop when clientId is empty', () => {
      const callback = vi.fn();

      const unsubscribe = subscribeToDiets('', callback);

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

      subscribeToDiets('client-123', callback, onError);

      expect(onError).toHaveBeenCalledWith(testError);
      expect(callback).toHaveBeenCalledWith([]);
    });
  });

  describe('subscribeToDietHistory', () => {
    it('should call onSnapshot without limit for full history', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({ docs: [] });
        return () => {};
      });

      subscribeToDietHistory('client-123', callback);

      expect(mockFns.collection).toHaveBeenCalledWith(expect.anything(), 'diets');
      expect(mockFns.where).toHaveBeenCalledWith('clientId', '==', 'client-123');
      expect(mockFns.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockFns.limit).not.toHaveBeenCalled();
      expect(mockFns.onSnapshot).toHaveBeenCalledTimes(1);
    });

    it('should invoke callback with all diets', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({
          docs: [
            { id: 'diet-1', data: () => ({ name: 'Dieta 1', meals: [] }) },
            { id: 'diet-2', data: () => ({ name: 'Dieta 2', meals: [] }) },
          ],
        });
        return () => {};
      });

      subscribeToDietHistory('client-123', callback);

      expect(callback).toHaveBeenCalledWith([
        { id: 'diet-1', name: 'Dieta 1', meals: [] },
        { id: 'diet-2', name: 'Dieta 2', meals: [] },
      ]);
    });

    it('should return noop when clientId is empty', () => {
      const callback = vi.fn();

      const unsubscribe = subscribeToDietHistory('', callback);

      expect(callback).toHaveBeenCalledWith([]);
      expect(mockFns.onSnapshot).not.toHaveBeenCalled();
      unsubscribe();
    });

    it('should call onError on snapshot error', () => {
      const callback = vi.fn();
      const onError = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, _cb: unknown, errCb: (err: Error) => void) => {
        errCb(new Error('Error'));
        return () => {};
      });

      subscribeToDietHistory('client-123', callback, onError);

      expect(onError).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith([]);
    });
  });

  describe('registerMealComplete', () => {
    it('should add a meal completion log to Firestore', async () => {
      mockFns.addDoc.mockResolvedValue({ id: 'meal-log-1' });

      const result = await registerMealComplete('client-123', 'diet-1', 'meal-1', 'breakfast');

      expect(mockFns.collection).toHaveBeenCalledWith(expect.anything(), 'progress_logs');
      expect(mockFns.addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          clientId: 'client-123',
          dietId: 'diet-1',
          mealId: 'meal-1',
          type: 'meal',
          value: expect.objectContaining({
            mealName: 'breakfast',
            completed: true,
          }),
        }),
      );
      expect(result).toEqual({ id: 'meal-log-1' });
    });

    it('should return null when clientId is empty', async () => {
      const result = await registerMealComplete('', 'diet-1', 'meal-1', 'breakfast');
      expect(result).toBeNull();
      expect(mockFns.addDoc).not.toHaveBeenCalled();
    });

    it('should return null when dietId is empty', async () => {
      const result = await registerMealComplete('client-123', '', 'meal-1', 'breakfast');
      expect(result).toBeNull();
      expect(mockFns.addDoc).not.toHaveBeenCalled();
    });

    it('should return null when mealId is empty', async () => {
      const result = await registerMealComplete('client-123', 'diet-1', '', 'breakfast');
      expect(result).toBeNull();
      expect(mockFns.addDoc).not.toHaveBeenCalled();
    });

    it('should throw on Firestore error', async () => {
      mockFns.addDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(
        registerMealComplete('client-123', 'diet-1', 'meal-1', 'breakfast')
      ).rejects.toThrow('Firestore error');
    });

    it('should include serverTimestamp in createdAt', async () => {
      mockFns.addDoc.mockResolvedValue({ id: 'meal-log-2' });

      await registerMealComplete('client-123', 'diet-1', 'meal-1', 'lunch');

      const callArg = mockFns.addDoc.mock.calls[0]?.[1];
      expect(callArg.createdAt).toBeInstanceOf(Date);
      expect(callArg.date).toBeInstanceOf(Date);
    });
  });

  describe('subscribeToTodayMeals', () => {
    it('should call onSnapshot with date range for today', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({ docs: [] });
        return () => {};
      });

      subscribeToTodayMeals('client-123', callback);

      expect(mockFns.collection).toHaveBeenCalledWith(expect.anything(), 'progress_logs');
      expect(mockFns.where).toHaveBeenCalledWith('clientId', '==', 'client-123');
      expect(mockFns.where).toHaveBeenCalledWith('type', '==', 'meal');
      expect(mockFns.where).toHaveBeenCalledWith('date', '>=', expect.any(Date));
      expect(mockFns.where).toHaveBeenCalledWith('date', '<=', expect.any(Date));
      expect(mockFns.orderBy).toHaveBeenCalledWith('date', 'desc');
      expect(mockFns.onSnapshot).toHaveBeenCalledTimes(1);
    });

    it('should invoke callback with completed meal IDs', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({
          docs: [
            { id: 'log-1', data: () => ({ mealId: 'meal-1', value: { completed: true } }) },
            { id: 'log-2', data: () => ({ mealId: 'meal-2', value: { completed: true } }) },
            { id: 'log-3', data: () => ({ mealId: 'meal-3', value: { completed: false } }) },
          ],
        });
        return () => {};
      });

      subscribeToTodayMeals('client-123', callback);

      expect(callback).toHaveBeenCalledWith(['meal-1', 'meal-2']);
    });

    it('should invoke callback with empty array when no meals completed', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({ docs: [] });
        return () => {};
      });

      subscribeToTodayMeals('client-123', callback);

      expect(callback).toHaveBeenCalledWith([]);
    });

    it('should return noop when clientId is empty', () => {
      const callback = vi.fn();

      const unsubscribe = subscribeToTodayMeals('', callback);

      expect(callback).toHaveBeenCalledWith([]);
      expect(mockFns.onSnapshot).not.toHaveBeenCalled();
      unsubscribe();
    });

    it('should call onError on snapshot error', () => {
      const callback = vi.fn();
      const onError = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, _cb: unknown, errCb: (err: Error) => void) => {
        errCb(new Error('Error'));
        return () => {};
      });

      subscribeToTodayMeals('client-123', callback, onError);

      expect(onError).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith([]);
    });
  });
});
