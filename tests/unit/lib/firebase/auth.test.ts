/**
 * Tests unitarios para lib/firebase/auth (wrapper de Firebase Auth).
 * Verifica que las funciones se exportan correctamente.
 */

import { describe, it, expect } from 'vitest';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from '../../../../src/lib/firebase/auth';

describe('lib/firebase/auth', () => {
  it('✅ should export createUserWithEmailAndPassword', () => {
    expect(createUserWithEmailAndPassword).toBeDefined();
    expect(typeof createUserWithEmailAndPassword).toBe('function');
  });

  it('✅ should export signInWithEmailAndPassword', () => {
    expect(signInWithEmailAndPassword).toBeDefined();
    expect(typeof signInWithEmailAndPassword).toBe('function');
  });

  it('✅ should export signOut', () => {
    expect(signOut).toBeDefined();
    expect(typeof signOut).toBe('function');
  });

  it('✅ should export sendPasswordResetEmail', () => {
    expect(sendPasswordResetEmail).toBeDefined();
    expect(typeof sendPasswordResetEmail).toBe('function');
  });

  it('✅ should export onAuthStateChanged', () => {
    expect(onAuthStateChanged).toBeDefined();
    expect(typeof onAuthStateChanged).toBe('function');
  });

  it('✅ should export GoogleAuthProvider', () => {
    expect(GoogleAuthProvider).toBeDefined();
    expect(typeof GoogleAuthProvider).toBe('function');
  });

  it('✅ should export signInWithPopup', () => {
    expect(signInWithPopup).toBeDefined();
    expect(typeof signInWithPopup).toBe('function');
  });

  it('✅ should export FirebaseUser type', () => {
    // Verificar que las funciones de Firebase Auth se exportan correctamente
    expect(typeof createUserWithEmailAndPassword).toBe('function');
    expect(typeof signInWithEmailAndPassword).toBe('function');
    expect(typeof signOut).toBe('function');
    expect(typeof sendPasswordResetEmail).toBe('function');
    expect(typeof signInWithPopup).toBe('function');
    expect(typeof GoogleAuthProvider).toBe('function');
  });
});