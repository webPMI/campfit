/**
 * Tests unitarios para progressService.
 *
 * progressService depende de Firestore (onSnapshot, addDoc).
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

import { subscribeToProgress, registerWeight } from '../../../../src/lib/client/progressService';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('progressService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('subscribeToProgress', () => {
    it('should call onSnapshot with correct query for client progress', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({ docs: [] });
        return () => {};
      });

      const unsubscribe = subscribeToProgress('client-123', 'weight', callback);

      expect(mockFns.collection).toHaveBeenCalledWith(expect.anything(), 'progress_logs');
      expect(mockFns.where).toHaveBeenCalledWith('clientId', '==', 'client-123');
      expect(mockFns.where).toHaveBeenCalledWith('type', '==', 'weight');
      expect(mockFns.orderBy).toHaveBeenCalledWith('date', 'desc');
      expect(mockFns.limit).toHaveBeenCalledWith(30);
      expect(mockFns.onSnapshot).toHaveBeenCalledTimes(1);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should invoke callback with mapped progress logs on snapshot', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({
          docs: [
            { id: 'log-1', data: () => ({ type: 'weight', value: { weight: 75 }, date: { toDate: () => new Date('2024-01-01') } }) },
          ],
        });
        return () => {};
      });

      subscribeToProgress('client-123', 'weight', callback);

      expect(callback).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'log-1', type: 'weight' }),
      ]);
    });

    it('should invoke callback with empty array when no progress logs', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb({ docs: [] });
        return () => {};
      });

      subscribeToProgress('client-123', 'weight', callback);

      expect(callback).toHaveBeenCalledWith([]);
    });

    it('should return unsubscribe function', () => {
      const unsubscribeMock = vi.fn();
      mockFns.onSnapshot.mockReturnValue(unsubscribeMock);

      const callback = vi.fn();
      const unsubscribe = subscribeToProgress('client-123', 'weight', callback);

      unsubscribe();
      expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    });

    it('should call callback with empty array and return noop when clientId is empty', () => {
      const callback = vi.fn();

      const unsubscribe = subscribeToProgress('', 'weight', callback);

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

      subscribeToProgress('client-123', 'weight', callback, 30, onError);

      expect(onError).toHaveBeenCalledWith(testError);
      expect(callback).toHaveBeenCalledWith([]);
    });
  });

  describe('registerWeight', () => {
    it('should add a weight log to Firestore', async () => {
      mockFns.addDoc.mockResolvedValue({ id: 'log-1' });

      const result = await registerWeight('client-123', 75);

      expect(mockFns.collection).toHaveBeenCalledWith(expect.anything(), 'progress_logs');
      expect(mockFns.addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          clientId: 'client-123',
          type: 'weight',
          value: expect.objectContaining({ weight: 75 }),
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw when clientId is empty', async () => {
      await expect(registerWeight('', 75)).rejects.toThrow('clientId y weight (positivo) son requeridos');
      expect(mockFns.addDoc).not.toHaveBeenCalled();
    });

    it('should throw when weight is null', async () => {
      await expect(registerWeight('client-123', null as unknown as number)).rejects.toThrow('clientId y weight (positivo) son requeridos');
      expect(mockFns.addDoc).not.toHaveBeenCalled();
    });

    it('should throw when weight is zero', async () => {
      await expect(registerWeight('client-123', 0)).rejects.toThrow('clientId y weight (positivo) son requeridos');
      expect(mockFns.addDoc).not.toHaveBeenCalled();
    });

    it('should throw when weight is negative', async () => {
      await expect(registerWeight('client-123', -10)).rejects.toThrow('clientId y weight (positivo) son requeridos');
      expect(mockFns.addDoc).not.toHaveBeenCalled();
    });

    it('should include notes when provided', async () => {
      mockFns.addDoc.mockResolvedValue({ id: 'log-2' });

      await registerWeight('client-123', 75, 'Progresando bien');

      const callArg = mockFns.addDoc.mock.calls[0]?.[1];
      expect(callArg.value).toEqual({ weight: 75, notes: 'Progresando bien' });
    });

    it('should trim notes', async () => {
      mockFns.addDoc.mockResolvedValue({ id: 'log-3' });

      await registerWeight('client-123', 75, '  Nota con espacios  ');

      const callArg = mockFns.addDoc.mock.calls[0]?.[1];
      expect(callArg.value).toEqual({ weight: 75, notes: 'Nota con espacios' });
    });

    it('should include serverTimestamp in createdAt', async () => {
      mockFns.addDoc.mockResolvedValue({ id: 'log-4' });

      await registerWeight('client-123', 75);

      const callArg = mockFns.addDoc.mock.calls[0]?.[1];
      expect(callArg.createdAt).toBeInstanceOf(Date);
    });
  });
});
