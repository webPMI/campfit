/**
 * Wrapper de Firebase Firestore para facilitar el testing.
 *
 * Este archivo re-exporta las funciones de firebase/firestore que necesita authService.
 * Al importar desde aquí en lugar de directamente de firebase/firestore,
 * podemos mockear fácilmente este archivo en los tests.
 */

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

export {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
};
