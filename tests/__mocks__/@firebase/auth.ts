/**
 * Mock de @firebase/auth para vitest.
 *
 * vitest 4.x tiene un bug con el hoisting de vi.mock() para módulos que son
 * re-exportados a través de export *. firebase/auth hace:
 *   export * from '@firebase/auth'
 *
 * Al crear un __mocks__/@firebase/auth.ts, vitest 4.x puede interceptar
 * correctamente el módulo @firebase/auth cuando se usa vi.mock('@firebase/auth').
 */

import { vi } from 'vitest';

export const getAuth = vi.fn(() => ({}));
export const signInWithEmailAndPassword = vi.fn();
export const createUserWithEmailAndPassword = vi.fn();
export const signOut = vi.fn();
export const sendPasswordResetEmail = vi.fn();
export const onAuthStateChanged = vi.fn(() => () => {});
export const GoogleAuthProvider = vi.fn(() => ({}));
export const signInWithPopup = vi.fn();
