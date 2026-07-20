/**
 * Tests unitarios para trainerProgress.ts
 *
 * @module tests/unit/lib/trainer/trainerProgress.test
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

describe('trainerProgress', () => {
  describe('subscribeToClientProgress', () => {
    it('debería suscribirse al progreso de un cliente', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          data: () => ({
            clientId: 'client-123',
            date: { toDate: () => new Date('2024-01-15') },
            weight: 75,
            calories: 2200,
            rpe: 7,
            notes: 'Buena sesión',
          }),
        },
        {
          id: 'log-2',
          data: () => ({
            clientId: 'client-123',
            date: { toDate: () => new Date('2024-01-10') },
            weight: 76,
            calories: 2100,
            rpe: 6,
            notes: 'Sesión normal',
          }),
        },
      ];

      mockOnSnapshot.mockImplementation((_q: unknown, callback: (s: unknown) => void) => {
        callback({ docs: mockLogs });
        return vi.fn();
      });

      const { subscribeToClientProgress } = await import('@/lib/trainer/trainerProgress');
      const callback = vi.fn();
      subscribeToClientProgress('client-123', callback);

      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'log-1', weight: 75 }),
          expect.objectContaining({ id: 'log-2', weight: 76 }),
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

      const { subscribeToClientProgress } = await import('@/lib/trainer/trainerProgress');
      const callback = vi.fn();
      subscribeToClientProgress('client-123', callback);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
