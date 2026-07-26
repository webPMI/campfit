/**
 * 🛡️ Guardias de autenticación unificados para todos los roles.
 *
 * Uso:
 *   requireAuth(user => { ... });   // cualquier usuario autenticado
 *   requireAdmin(user => { ... });  // solo admins
 *
 * 🔒 Protección anti-bucle infinito:
 *   1. Salta la primera llamada de Firebase (inicialización)
 *   2. Nunca redirige desde páginas públicas (/login, /register, /recover, /)
 *   3. Solo ejecuta el callback una vez (evita re-fires de Firebase)
 *
 * @module shared/authGuard
 */

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, type Unsubscribe } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';

// 🚫 Rutas que nunca deben ser redirigidas (páginas públicas)
const PUBLIC_PATHS = ['/login', '/register', '/recover', '/', '/onboarding'];

/** Verifica si la ruta actual es pública (no necesita autenticación) */
function isPublicPath(): boolean {
  const path = window.location?.pathname || window.location?.href || '';
  return PUBLIC_PATHS.some(p => path === p || (p !== '/' && path.startsWith(p)));
}

/**
 * 🔐 Escucha cambios de autenticación y ejecuta callback cuando hay usuario.
 * Si no hay sesión, redirige a /login (excepto en páginas públicas).
 *
 * @param callback - Función a ejecutar con el usuario autenticado
 * @returns Función para cancelar la suscripción
 */
export function requireAuth(callback: (user: FirebaseUser) => void): Unsubscribe {
  let initialized = false; // 🔑 clave: evita redirigir durante inicialización de Firebase
  return onAuthStateChanged(auth, (user) => {
    // Primera llamada: Firebase está inicializando — no tomar acción
    if (!initialized) { initialized = true; return; }

    // Usuario cerró sesión o expiró
    if (!user) {
      if (!isPublicPath()) {
        logger.warn('AuthGuard', 'Usuario no autenticado, redirigiendo a login');
        window.location.replace('/login');
      }
      return;
    }

    // ✅ Sesión válida — ejecutar callback
    callback(user);
  });
}

/**
 * 👑 Verifica que el usuario autenticado tenga rol 'admin'.
 * Redirige al dashboard correcto según el rol si no es admin.
 *
 * Soporta bootstrap admins: usuarios sin documento en Firestore
 * pero con email de administrador conocido.
 */
export function requireAdmin(callback: (user: FirebaseUser) => void): Unsubscribe {
  let initialized = false;
  let callbackFired = false; // evita ejecutar el callback más de una vez

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (!isPublicPath()) window.location.replace('/login');
      return;
    }

    // Ya procesamos este usuario — evitar re-fires de Firebase
    if (callbackFired) return;

    try {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const role = docSnap.data()?.role;
      const email = (user.email || '').toLowerCase();

      // Bootstrap admins: correos de administrador conocidos
      const isBootstrapAdmin =
        email === 'servicioweb.pmi@gmail.com' ||
        email === 'sevicioweb.pmi@gmail.com';

      const effectiveRole = role || (isBootstrapAdmin ? 'admin' : null);

      if (effectiveRole !== 'admin') {
        logger.warn('AuthGuard', `Acceso denegado: ${user.uid} rol=${effectiveRole}`);
        // Redirigir al dashboard correcto según el rol real
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

/**
 * 🚪 Cierra la sesión del usuario actual y redirige a /login.
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