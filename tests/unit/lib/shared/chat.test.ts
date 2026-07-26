/**
 * Tests unitarios para chatService (shared/chat).
 *
 * chatService depende de Firestore (onSnapshot, addDoc).
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
  },
}));

// ─── Servicio REAL a testear ─────────────────────────────────────────────────
// chatService.ts re-exporta desde @/lib/shared/chat, así que importamos
// directamente desde shared/chat para evitar problemas con re-exports mockeados.

import { subscribeToUserMessages, sendMessage } from '../../../../src/lib/shared/chat';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('chatService (shared)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── subscribeToUserMessages ──────────────────────────────────────────────

  describe('subscribeToUserMessages', () => {
    const mockMessageSnapshot = (messages: Record<string, unknown>[]) => ({
      docs: messages.map((msg) => ({
        id: msg.id as string || 'msg-1',
        data: () => msg,
      })),
      forEach: (fn: (doc: unknown) => void) => messages.forEach((msg) => fn({ id: msg.id || 'msg-1', data: () => msg })),
      size: messages.length,
      empty: messages.length === 0,
    });

    it('should call onSnapshot with correct query', () => {
      const callback = vi.fn();
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb(mockMessageSnapshot([]));
        return () => {};
      });

      subscribeToUserMessages('user-123', callback);

      expect(mockFns.collection).toHaveBeenCalledWith(expect.anything(), 'messages');
      expect(mockFns.query).toHaveBeenCalled();
      expect(mockFns.where).toHaveBeenCalledWith('participants', 'array-contains', 'user-123');
      expect(mockFns.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    it('should invoke callback with mapped messages on snapshot', () => {
      const callback = vi.fn();
      const mockMessages = [
        { id: 'msg-1', senderId: 'user-1', receiverId: 'user-2', content: 'Hello', createdAt: { toDate: () => new Date('2024-01-01') } },
        { id: 'msg-2', senderId: 'user-2', receiverId: 'user-1', content: 'Hi', createdAt: { toDate: () => new Date('2024-01-02') } },
      ];
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, cb: (snapshot: unknown) => void) => {
        cb(mockMessageSnapshot(mockMessages));
        return () => {};
      });

      subscribeToUserMessages('user-123', callback);

      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'msg-1', content: 'Hello' }),
          expect.objectContaining({ id: 'msg-2', content: 'Hi' }),
        ]),
      );
    });

    it('should return unsubscribe function that stops listening', () => {
      const unsubscribe = vi.fn();
      mockFns.onSnapshot.mockReturnValue(unsubscribe);

      const result = subscribeToUserMessages('user-123', vi.fn());

      result();
      expect(unsubscribe).toHaveBeenCalled();
    });

    it('should call callback with empty array and return noop when userId is empty', () => {
      const callback = vi.fn();

      const result = subscribeToUserMessages('', callback);

      expect(callback).toHaveBeenCalledWith([]);
      expect(typeof result).toBe('function');
    });

    it('should call onError and callback with empty array on snapshot error', () => {
      const callback = vi.fn();
      const onError = vi.fn();
      const testError = new Error('Snapshot error');
      // @ts-expect-error - mockImplementation con firma simplificada para tests
      mockFns.onSnapshot.mockImplementation((_query: unknown, _cb: unknown, errCb: (err: Error) => void) => {
        errCb(testError);
        return () => {};
      });

      subscribeToUserMessages('user-123', callback, onError);

      expect(onError).toHaveBeenCalledWith(testError);
      expect(callback).toHaveBeenCalledWith([]);
    });
  });

  // ── sendMessage ──────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('should add a message document to Firestore', async () => {
      mockFns.addDoc.mockResolvedValue({ id: 'new-msg-1' });

      const result = await sendMessage('user-1', 'user-2', 'Hello!');

      expect(mockFns.collection).toHaveBeenCalledWith(expect.anything(), 'messages');
      expect(mockFns.addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          senderId: 'user-1',
          receiverId: 'user-2',
          content: 'Hello!',
          participants: ['user-1', 'user-2'],
        }),
      );
      expect(result).toBe('new-msg-1');
    });

    it('should trim content before sending', async () => {
      mockFns.addDoc.mockResolvedValue({ id: 'new-msg-2' });

      await sendMessage('user-1', 'user-2', '  Hello!   ');

      expect(mockFns.addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ content: 'Hello!' }),
      );
    });

    it('should return null if senderId is empty', async () => {
      const result = await sendMessage('', 'user-2', 'Hello');
      expect(result).toBeNull();
    });

    it('should return null if receiverId is empty', async () => {
      const result = await sendMessage('user-1', '', 'Hello');
      expect(result).toBeNull();
    });

    it('should return null if content is empty', async () => {
      const result = await sendMessage('user-1', 'user-2', '');
      expect(result).toBeNull();
    });

    it('should return null if content is only whitespace', async () => {
      const result = await sendMessage('user-1', 'user-2', '   ');
      expect(result).toBeNull();
    });

    it('should return null on Firestore errors', async () => {
      mockFns.addDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await sendMessage('user-1', 'user-2', 'Hello');
      expect(result).toBeNull();
    });
  });
});
