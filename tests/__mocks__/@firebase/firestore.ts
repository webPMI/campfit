/**
 * Mock de @firebase/firestore para vitest.
 *
 * vitest 4.x tiene un bug con el hoisting de vi.mock() para módulos que son
 * re-exportados a través de export *. firebase/firestore hace:
 *   export * from '@firebase/firestore'
 *
 * Al crear un __mocks__/@firebase/firestore.ts, vitest 4.x puede interceptar
 * correctamente el módulo @firebase/firestore cuando se usa vi.mock('@firebase/firestore').
 *
 * Firebase v11 valida que el primer argumento de collection() sea un objeto
 * Firestore real. Este mock crea objetos que pasan todas las validaciones internas.
 *
 * Los tests pueden importar estas funciones mock para hacer assertions:
 *   import { collection, getDoc, setDoc } from '@firebase/firestore';
 *   expect(collection).toHaveBeenCalledWith(...)
 */

import { vi } from 'vitest';

// Instancia de Firestore mock que pasa validaciones de Firebase v11
const createFirestoreInstance = () => ({
  type: 'firestore',
  app: { name: '[DEFAULT]', options: {} },
  _initialized: true,
  _settings: {},
  _settingsFrozen: false,
  _terminated: false,
  _terminateTask: Promise.resolve(),
  _getSettings: vi.fn(() => ({
    host: 'firestore.googleapis.com',
    ssl: true,
    ignoreUndefinedProperties: false,
  })),
  _setSettings: vi.fn(),
  _setLanguageCode: vi.fn(),
  _getLanguageCode: vi.fn(() => 'es'),
  _getDatabaseId: vi.fn(() => '(default)'),
  _getAppCheckToken: vi.fn().mockResolvedValue(undefined),
  _getCredentials: vi.fn().mockResolvedValue(undefined),
  toJSON: vi.fn(() => ({})),
});

const firestoreInstance = createFirestoreInstance();

// Funciones mock que pueden ser importadas y espiadas desde los tests
export const getFirestore = vi.fn(() => firestoreInstance);
export const collection = vi.fn(() => ({
  id: 'unknown',
  path: 'firestore/unknown',
  firestore: firestoreInstance,
  type: 'collection',
  withConverter: vi.fn(() => ({})),
}));
export const doc = vi.fn(() => ({
  id: 'mock-doc-ref',
  path: 'users/mock-doc-ref',
  firestore: firestoreInstance,
  type: 'document',
  withConverter: vi.fn(() => ({})),
}));
export const getDoc = vi.fn();
export const setDoc = vi.fn();
export const serverTimestamp = vi.fn(() => new Date('2024-01-01'));
export const addDoc = vi.fn();
export const updateDoc = vi.fn();
export const deleteDoc = vi.fn();
export const query = vi.fn(() => ({
  type: 'query',
  firestore: firestoreInstance,
  withConverter: vi.fn(() => ({})),
}));
export const where = vi.fn(() => ({}));
export const orderBy = vi.fn(() => ({}));
export const limit = vi.fn(() => ({}));
export const getDocs = vi.fn();
export const onSnapshot = vi.fn(() => () => {});
