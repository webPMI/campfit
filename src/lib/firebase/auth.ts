/**
 * Wrapper de Firebase Auth para facilitar el testing.
 *
 * Este archivo re-exporta las funciones de firebase/auth que necesita authService.
 * Al importar desde aquí en lugar de directamente de firebase/auth,
 * podemos mockear fácilmente este archivo en los tests.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
};
export type { FirebaseUser };
