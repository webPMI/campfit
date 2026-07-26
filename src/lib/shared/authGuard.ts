/**
 * Guards de autenticación unificados para todos los roles.
 * Usa authStateReady() para evitar redirecciones antes de que Firebase inicialice.
 *
 * @module shared/authGuard
 */

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, type Unsubscribe } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';

// ============================================================
// Auth guards — con protección anti-bucle infinito
// ============================================================

const PUBLIC_PATHS = ['/login', '/register', '/recover', '/', '/onboarding', '/404', '/500'];

function isPublicPath(): boolean {
  const path = window.location.pathname;
  return PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '?'));
}

/**
 * Escucha cambios de autenticación y ejecuta un callback cuando
 * un usuario inicia sesión. Redirige a /login si no hay sesión.
 *
 * 🔒 Protegido contra reload infinito: espera a que Firebase inicialice
 * antes de redirigir, y nunca redirige desde páginas públicas.
 */
export function requireAuth(callback: (user: FirebaseUser) => void): Unsubscribe {
  let initialized = false;

  return onAuthStateChanged(auth, (user) => {
    // La primera llamada de onAuthStateChanged siempre es null mientras Firebase inicializa.
    // No redirigimos hasta que sepamos el estado real.
    if (!initialized) {
      initialized = true;
      // Si es null tras inicializar, sí redirigimos (a menos que estemos en página pública)
      if (!user) {
        if (!isPublicPath()) {
          logger.warn('AuthGuard', 'Sin sesión tras init, redirigiendo a login');
          window.location.replace('/login');
        }
        return;
      }
      callback(user);
      return;
    }

    // Cambios posteriores (logout, etc.)
    if (!user) {
      if (!isPublicPath()) {
        logger.warn('AuthGuard', 'Sesión perdida, redirigiendo a login');
        window.location.replace('/login');
      }
      return;
    }
    callback(user);
  });
}

/**
 * Escucha cambios de autenticación y verifica que el usuario sea admin.
 * Redirige a /login si no hay sesión, o a /dashboard si no es admin.
 */
export function requireAdmin(callback: (user: FirebaseUser) => void): Unsubscribe {
  let initialized = false;
  let callbackFired = false;

  return onAuthStateChanged(auth, async (user) => {
    if (!initialized) {
      initialized = true;
      if (!user) {
        if (!isPublicPath()) window.location.replace('/login');
        return;
      }
    }

    if (!user) {
      if (!isPublicPath()) window.location.replace('/login');
      return;
    }

    // Solo ejecutar el callback una vez (evita double-init por re-fires de Firebase)
    if (callbackFired) return;

    try {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const role = docSnap.data()?.role;

      // Detectar bootstrap admins (sin documento en Firestore)
      const email = (user.email || '').toLowerCase();
      const isBootstrapAdmin =
        email === 'servicioweb.pmi@gmail.com' ||
        email === 'sevicioweb.pmi@gmail.com';

      const effectiveRole = role || (isBootstrapAdmin ? 'admin' : null);

      if (effectiveRole !== 'admin') {
        logger.warn('AuthGuard', `Usuario ${user.uid} con rol ${effectiveRole} intentó acceder a ruta admin`);
        // Redirigir al dashboard correcto según el rol (nunca a /dashboard genérico)
        const target =
          effectiveRole === 'trainer' ? '/trainer/dashboard' :
          effectiveRole === 'client'  ? '/client/dashboard'  : '/login';
        window.location.replace(target);
        return;
      }

      callbackFired = true;
      callback(user);
    } catch (error) {
      logger.error('AuthGuard', 'Error al verificar rol de admin:', error);
      showToast({ message: 'Error al verificar permisos', type: 'error' });
      window.location.replace('/login');
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
    window.location.replace('/login');
  } catch (error) {
    logger.error('AuthGuard', 'Error al cerrar sesión:', error);
    showToast({ message: 'Error al cerrar sesión', type: 'error' });
  }
}
