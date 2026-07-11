/**
 * Mocks de Firebase para tests unitarios.
 *
 * Estos mocks se pueden importar directamente en tests específicos
 * cuando se necesita un control más granular que el setup global.
 *
 * Uso:
 * ```ts
 * import { mockUserCredential, mockUserProfile } from '@tests/mocks/firebase';
 * ```
 */

import { vi } from 'vitest';

// ─── Factories de datos mock ─────────────────────────────────────────────────

export interface MockUserCredential {
  user: { uid: string; email: string; emailVerified: boolean; displayName?: string | null };
}

export interface MockUserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Crea un objeto de credencial mock para Firebase Auth.
 */
export function createMockUserCredential(
  overrides: Partial<MockUserCredential['user']> = {},
): MockUserCredential {
  return {
    user: {
      uid: 'test-uid-123',
      email: 'test@campfit.app',
      emailVerified: true,
      ...overrides,
    },
  };
}

/**
 * Crea un perfil de usuario mock para Firestore.
 */
export function createMockUserProfile(
  overrides: Partial<MockUserProfile> = {},
): MockUserProfile {
  return {
    id: 'test-uid-123',
    name: 'Usuario Test',
    email: 'test@campfit.app',
    role: 'client',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    ...overrides,
  };
}

/**
 * Crea un snapshot mock de Firestore (para getDoc).
 */
export function createMockDocSnapshot(
  data: Record<string, unknown> | null = null,
  exists = true,
) {
  return {
    exists: () => exists,
    data: () => data,
    id: data?.id ?? 'mock-doc-id',
  };
}

/**
 * Crea una colección mock de Firestore (para getDocs).
 */
export function createMockCollectionSnapshot(
  docs: Array<{ id: string; data: () => Record<string, unknown> }> = [],
) {
  return {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach: (callback: (doc: unknown) => void) => docs.forEach(callback),
  };
}

// ─── Constantes de prueba ────────────────────────────────────────────────────

export const TEST_CREDENTIALS = {
  email: 'test@campfit.app',
  password: 'Test1234!',
  wrongPassword: 'WrongPassword1',
  invalidEmail: 'not-an-email',
} as const;

export const TEST_ERRORS = {
  invalidCredential: new Error('auth/invalid-credential'),
  userNotFound: new Error('auth/user-not-found'),
  wrongPassword: new Error('auth/wrong-password'),
  emailAlreadyInUse: new Error('auth/email-already-in-use'),
  weakPassword: new Error('auth/weak-password'),
  networkError: new Error('auth/network-request-failed'),
  tooManyRequests: new Error('auth/too-many-requests'),
  popupClosed: new Error('auth/popup-closed-by-user'),
} as const;
