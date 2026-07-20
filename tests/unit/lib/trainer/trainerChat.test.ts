/**
 * Tests unitarios para trainerChat.ts
 *
 * @module tests/unit/lib/trainer/trainerChat.test
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

describe('trainerChat', () => {
  describe('subscribeToConversations', () => {
    it('debería suscribirse a las conversaciones de un usuario', async () => {
      const mockMessages = [
        { id: 'msg-1', data: () => ({ senderId: 'user-1', content: 'Hola', participants: ['user-1', 'user-2'] }) },
        { id: 'msg-2', data: () => ({ senderId: 'user-2', content: 'Adiós', participants: ['user-1', 'user-2'] }) },
      ];

      mockOnSnapshot.mockImplementation((_q: unknown, callback: (s: unknown) => void) => {
        callback({ docs: mockMessages });
        return vi.fn();
      });

      const { subscribeToConversations } = await import('@/lib/trainer/trainerChat');
      const callback = vi.fn();
      subscribeToConversations('user-1', callback);

      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'msg-1' }),
          expect.objectContaining({ id: 'msg-2' }),
        ]),
      );
    });
  });

  describe('subscribeToConversation', () => {
    it('debería filtrar mensajes entre dos usuarios', async () => {
      const mockMessages = [
        { id: 'msg-1', data: () => ({ senderId: 'user-1', content: 'Hola', participants: ['user-1', 'user-2'] }) },
        { id: 'msg-2', data: () => ({ senderId: 'user-3', content: 'Otro chat', participants: ['user-1', 'user-3'] }) },
      ];

      mockOnSnapshot.mockImplementation((_q: unknown, callback: (s: unknown) => void) => {
        callback({ docs: mockMessages });
        return vi.fn();
      });

      const { subscribeToConversation } = await import('@/lib/trainer/trainerChat');
      const callback = vi.fn();
      subscribeToConversation('user-1', 'user-2', callback);

      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 'msg-1' })]),
      );
    });
  });

  describe('sendMessage', () => {
    it('debería enviar un mensaje de texto', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-msg-123' });

      const { sendMessage } = await import('@/lib/trainer/trainerChat');
      const id = await sendMessage('user-1', 'user-2', 'Hola mundo');

      expect(id).toBe('new-msg-123');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          senderId: 'user-1',
          receiverId: 'user-2',
          content: 'Hola mundo',
          type: 'text',
          isRead: false,
        }),
      );
    });

    it('debería enviar un mensaje de alerta', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-alert-123' });

      const { sendMessage } = await import('@/lib/trainer/trainerChat');
      const id = await sendMessage('user-1', 'user-2', 'ALERTA', 'alert');

      expect(id).toBe('new-alert-123');
    });

    it('debería retornar null si falla el envío', async () => {
      mockAddDoc.mockRejectedValue(new Error('Error'));

      const { sendMessage } = await import('@/lib/trainer/trainerChat');
      const id = await sendMessage('user-1', 'user-2', 'Hola');

      expect(id).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('debería marcar un mensaje como leído', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const { markAsRead } = await import('@/lib/trainer/trainerChat');
      const result = await markAsRead('msg-123');

      expect(result).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ isRead: true }),
      );
    });

    it('debería retornar false si falla', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Error'));

      const { markAsRead } = await import('@/lib/trainer/trainerChat');
      const result = await markAsRead('msg-123');

      expect(result).toBe(false);
    });
  });
});
