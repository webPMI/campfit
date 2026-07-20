/**
 * Tests unitarios para adminSubscriptions.ts
 *
 * @module tests/unit/lib/admin/adminSubscriptions.test
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

describe('adminSubscriptions', () => {
  describe('subscribeToUsers', () => {
    it('debería suscribirse a todos los usuarios', async () => {
      const mockUsers = [
        { id: 'u-1', data: () => ({ name: 'User 1', email: 'u1@test.com', role: 'client' }) },
        { id: 'u-2', data: () => ({ name: 'User 2', email: 'u2@test.com', role: 'trainer' }) },
      ];

      mockOnSnapshot.mockImplementation((_q: unknown, callback: (s: unknown) => void) => {
        callback({ docs: mockUsers });
        return vi.fn();
      });

      const { subscribeToUsers } = await import('@/lib/admin/adminSubscriptions');
      const callback = vi.fn();
      subscribeToUsers(callback);

      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ uid: 'u-1', name: 'User 1' }),
          expect.objectContaining({ uid: 'u-2', name: 'User 2' }),
        ]),
      );
    });

    it('debería manejar errores de suscripción', async () => {
      mockOnSnapshot.mockImplementation(
        (_q: unknown, _success: unknown, error: (e: Error) => void) => {
          error(new Error('Firestore error'));
          return vi.fn();
        },
      );

      const { subscribeToUsers } = await import('@/lib/admin/adminSubscriptions');
      const callback = vi.fn();
      subscribeToUsers(callback);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('subscribeToUsersByRole', () => {
    it('debería suscribirse a usuarios por rol', async () => {
      mockOnSnapshot.mockImplementation((_q: unknown, callback: (s: unknown) => void) => {
        callback({ docs: [{ id: 'u-1', data: () => ({ name: 'Trainer 1', role: 'trainer' }) }] });
        return vi.fn();
      });

      const { subscribeToUsersByRole } = await import('@/lib/admin/adminSubscriptions');
      const callback = vi.fn();
      subscribeToUsersByRole('trainer', callback);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('subscribeToCollectionCount', () => {
    it('debería suscribirse al conteo de una colección', async () => {
      mockOnSnapshot.mockImplementation((_q: unknown, callback: (s: unknown) => void) => {
        callback({ size: 5 });
        return vi.fn();
      });

      const { subscribeToCollectionCount } = await import('@/lib/admin/adminSubscriptions');
      const callback = vi.fn();
      subscribeToCollectionCount('users', callback);

      expect(callback).toHaveBeenCalledWith(5);
    });
  });

  describe('subscribeToRecentUsers', () => {
    it('debería suscribirse a los usuarios más recientes', async () => {
      mockOnSnapshot.mockImplementation((_q: unknown, callback: (s: unknown) => void) => {
        callback({ docs: [{ id: 'u-1', data: () => ({ name: 'Recent User', role: 'client' }) }] });
        return vi.fn();
      });

      const { subscribeToRecentUsers } = await import('@/lib/admin/adminSubscriptions');
      const callback = vi.fn();
      subscribeToRecentUsers(5, callback);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('getTrainerClientCount', () => {
    it('debería retornar el conteo de clientes de un trainer', async () => {
      mockGetDocs.mockResolvedValue({ size: 3 });

      const { getTrainerClientCount } = await import('@/lib/admin/adminSubscriptions');
      const count = await getTrainerClientCount('trainer-123');

      expect(count).toBe(3);
    });

    it('debería retornar 0 si falla la consulta', async () => {
      mockGetDocs.mockRejectedValue(new Error('Error'));

      const { getTrainerClientCount } = await import('@/lib/admin/adminSubscriptions');
      const count = await getTrainerClientCount('trainer-123');

      expect(count).toBe(0);
    });
  });
});
