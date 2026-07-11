/**
 * Mock centralizado de Firestore para tests unitarios.
 *
 * Crea un objeto firestoreInstance que es compartido entre:
 * - El mock de 'firebase/firestore' (getFirestore, collection, query, etc.)
 * - El mock de '@/lib/firebase' (db)
 *
 * Esto asegura que collection(db, ...) funcione correctamente porque
 * db es el mismo objeto que getFirestore() devuelve.
 *
 * IMPORTANTE: En vitest 4.x, vi.mock() se hoistea al principio del archivo.
 * Por eso esta función devuelve un objeto con todo lo necesario para usarse
 * dentro de vi.hoisted().
 *
 * Uso en tests:
 * ```ts
 * const { mocks, firestoreInstance, exports } = vi.hoisted(() => createFirestoreMock());
 *
 * vi.mock('firebase/firestore', () => exports);
 * vi.mock('@/lib/firebase', () => ({ db: firestoreInstance, auth: {} }));
 * ```
 */

import { vi } from 'vitest';

export interface FirestoreMocks {
  mockCollection: ReturnType<typeof vi.fn>;
  mockDoc: ReturnType<typeof vi.fn>;
  mockAddDoc: ReturnType<typeof vi.fn>;
  mockGetDoc: ReturnType<typeof vi.fn>;
  mockGetDocs: ReturnType<typeof vi.fn>;
  mockSetDoc: ReturnType<typeof vi.fn>;
  mockUpdateDoc: ReturnType<typeof vi.fn>;
  mockDeleteDoc: ReturnType<typeof vi.fn>;
  mockOnSnapshot: ReturnType<typeof vi.fn>;
  mockQuery: ReturnType<typeof vi.fn>;
  mockWhere: ReturnType<typeof vi.fn>;
  mockOrderBy: ReturnType<typeof vi.fn>;
  mockLimit: ReturnType<typeof vi.fn>;
  mockServerTimestamp: ReturnType<typeof vi.fn>;
}

export function createFirestoreMock() {
  const mocks: FirestoreMocks = {
    mockCollection: vi.fn(),
    mockDoc: vi.fn(),
    mockAddDoc: vi.fn(),
    mockGetDoc: vi.fn(),
    mockGetDocs: vi.fn(),
    mockSetDoc: vi.fn(),
    mockUpdateDoc: vi.fn(),
    mockDeleteDoc: vi.fn(),
    mockOnSnapshot: vi.fn(() => vi.fn()),
    mockQuery: vi.fn(),
    mockWhere: vi.fn(),
    mockOrderBy: vi.fn(),
    mockLimit: vi.fn(),
    mockServerTimestamp: vi.fn(() => new Date('2024-01-01')),
  };

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

  const exports = {
    getFirestore: vi.fn(() => firestoreInstance),
    collection: vi.fn((...args: unknown[]) => {
      mocks.mockCollection(...args);
      return {
        id: typeof args[1] === 'string' ? args[1] : 'unknown',
        path: `firestore/${args[1] || 'unknown'}`,
        firestore: firestoreInstance,
        type: 'collection',
        withConverter: vi.fn(() => ({})),
      };
    }),
    doc: vi.fn((...args: unknown[]) => {
      mocks.mockDoc(...args);
      return {
        id: typeof args[2] === 'string' ? args[2] : 'mock-doc-ref',
        path: `firestore/${args[1] || 'unknown'}/${args[2] || 'mock-doc-ref'}`,
        firestore: firestoreInstance,
        type: 'document',
        withConverter: vi.fn(() => ({})),
      };
    }),
    addDoc: mocks.mockAddDoc,
    getDoc: mocks.mockGetDoc,
    getDocs: mocks.mockGetDocs,
    setDoc: mocks.mockSetDoc,
    updateDoc: mocks.mockUpdateDoc,
    deleteDoc: mocks.mockDeleteDoc,
    onSnapshot: mocks.mockOnSnapshot,
    query: vi.fn((...args: unknown[]) => {
      mocks.mockQuery(...args);
      return { type: 'query', firestore: firestoreInstance, withConverter: vi.fn(() => ({})) };
    }),
    where: vi.fn((...args: unknown[]) => {
      mocks.mockWhere(...args);
      return { field: args[0], op: args[1], value: args[2] };
    }),
    orderBy: vi.fn((...args: unknown[]) => {
      mocks.mockOrderBy(...args);
      return { field: args[0], direction: args[1] };
    }),
    limit: vi.fn((...args: unknown[]) => {
      mocks.mockLimit(...args);
      return { type: 'limit', value: args[0] };
    }),
    serverTimestamp: mocks.mockServerTimestamp,
    Timestamp: class {
      static now() { return new Date('2024-01-01'); }
      static fromDate(date: Date) { return date; }
      toDate() { return new Date('2024-01-01'); }
      toMillis() { return 1704067200000; }
    },
  };

  return { mocks, firestoreInstance, exports };
}
