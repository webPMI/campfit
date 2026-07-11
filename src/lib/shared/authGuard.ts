/**
 * Guards de autenticación unificados para todos los roles.
 * Proporciona requireAuth (cualquier usuario autenticado) y requireAdmin (solo admins).
 *
 * @module shared/authGuard
 */

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, type Unsubscribe } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';

// ============================================================
// Auth guards
// ============================================================

/**
 * Escucha cambios de autenticación y ejecuta un callback cuando
 * un usuario inicia sesión. Redirige a /login si no hay sesión.
 *
 * @param callback - Función a ejecutar con el usuario autenticado
 * @returns Función para cancelar la suscripción
 *
 * @example
 * requireAuth(async (user) => {
 *   await initPage(user);
 * });
 */
export function requireAuth(callback: (user: FirebaseUser) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      logger.warn('AuthGuard', 'Usuario no autenticado, redirigiendo a login');
      window.location.href = '/login';
      return;
    }
    callback(user);
  });
}

/**
 * Escucha cambios de autenticación y verifica que el usuario sea admin.
 * Redirige a /login si no hay sesión, o a /dashboard si no es admin.
 *
 * @param callback - Función a ejecutar con el usuario admin autenticado
 * @returns Función para cancelar la suscripción
 *
 * @example
 * requireAdmin(async (user) => {
 *   await initDashboard(user);
 * });
 */
export function requireAdmin(callback: (user: FirebaseUser) => void): Unsubscribe {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      logger.warn('AuthGuard', 'Usuario no autenticado, redirigiendo a login');
      window.location.href = '/login';
      return;
    }

    try {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const role = docSnap.data()?.role;

      if (role !== 'admin') {
        logger.warn('AuthGuard', `Usuario ${user.uid} con rol ${role} intentó acceder a ruta de admin`);
        window.location.href = '/dashboard';
        return;
      }

      callback(user);
    } catch (error) {
      logger.error('AuthGuard', 'Error al verificar rol de admin:', error);
      showToast({ message: 'Error al verificar permisos', type: 'error' });
      window.location.href = '/login';
    }
  });
}

// ============================================================
// Auth helpers
// ============================================================

/**
 * Cierra la sesión del usuario actual y redirige a /login.
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
    window.location.href = '/login';
  } catch (error) {
    logger.error('AuthGuard', 'Error al cerrar sesión:', error);
    showToast({ message: 'Error al cerrar sesión', type: 'error' });
  }
}
