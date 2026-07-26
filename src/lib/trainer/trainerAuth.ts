/**
 * Funciones de autenticación y guard para el panel de entrenador.
 *
 * @module trainerAuth
 */

import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import type { Unsubscribe } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';

/**
 * Guard de autenticación para páginas de entrenador.
 * Redirige a /login si el usuario no está autenticado.
 */
export function requireAuth(callback: (user: FirebaseUser) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      logger.warn('Trainer', 'Usuario no autenticado, redirigiendo a login');
      window.location.href = '/login';
      return;
    }
    callback(user);
  });
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
    window.location.href = '/login';
  } catch (error) {
    logger.error('Trainer', 'Error al cerrar sesión:', error);
    showToast({ message: 'Error al cerrar sesión', type: 'error' });
  }
}
