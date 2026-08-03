/**
 * 🛡️ Guardias de autenticación unificados para todos los roles.
 *
 * Uso:
 *   requireAuth(user => { ... });   // cualquier usuario autenticado
 *   requireAdmin(user => { ... });  // solo admins
 *
 * 🔒 Estrategia de autenticación:
 *   1. Verifica auth.currentUser sincrónicamente al montar (caso post-login)
 *   2. Suscripción a onAuthStateChanged para detectar logout/expiración
 *   3. callbackFired evita re-ejecuciones por re-fires de Firebase
 *   4. Nunca redirige desde páginas públicas (/login, /register, /recover, /)
 *
 * @module shared/authGuard
 */

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, type Unsubscribe } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';

// 🔒 CRÍTICO: Rutas públicas que nunca deben ser redirigidas.
// Si se elimina una ruta, los usuarios no autenticados serán redirigidos a /login en bucle.
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
  let callbackFired = false;

  function checkUser(user: FirebaseUser | null): void {
    if (!user) {
      if (!isPublicPath()) {
        logger.warn('AuthGuard', 'Usuario no autenticado, redirigiendo a login');
        window.location.replace('/login');
      }
      return;
    }
    if (callbackFired) return;
    callbackFired = true;
    callback(user);
  }

  // Verificar sincrónicamente si ya hay sesión activa (caso post-login)
  if (auth.currentUser) {
    checkUser(auth.currentUser);
  }

  // Suscribirse para detectar cambios futuros (logout, expiración de token)
  return onAuthStateChanged(auth, (user) => {
    if (!callbackFired) checkUser(user);
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
  let callbackFired = false;

  async function checkAdmin(user: FirebaseUser | null): Promise<void> {
    if (!user) {
      if (!isPublicPath()) window.location.replace('/login');
      return;
    }

    // Ya procesamos este usuario — evitar re-fires de Firebase
    if (callbackFired) return;

    try {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const role = docSnap.exists() ? docSnap.data()?.role : undefined;
      const email = (user.email || '').toLowerCase();

      // 🔒 CRÍTICO: Bootstrap admins permiten acceso admin sin documento Firestore.
      // Si se elimina, los admins iniciales no podrán acceder al panel de administración.
      const isBootstrapAdmin =
        email === 'servicioweb.pmi@gmail.com' ||
        email === 'sevicioweb.pmi@gmail.com';

      const effectiveRole = role || (isBootstrapAdmin ? 'admin' : null);

      if (effectiveRole !== 'admin') {
        logger.warn('AuthGuard', `Acceso denegado: ${user.uid} rol=${effectiveRole}`);
        // Redirigir al dashboard correcto según el rol real
        const target =
          effectiveRole === 'trainer' ? '/trainer/dashboard' :
            effectiveRole === 'client' ? '/client/dashboard' : '/login';
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
  }

  // Verificar sincrónicamente si ya hay sesión activa (caso post-login)
  if (auth.currentUser) {
    checkAdmin(auth.currentUser);
  }

  // Suscribirse para detectar cambios futuros (logout, expiración de token)
  return onAuthStateChanged(auth, async (user) => {
    if (!callbackFired) await checkAdmin(user);
  });
}

/**
 * 🛡️ Verifica que el usuario autenticado tenga uno de los roles permitidos.
 * Redirige al dashboard correcto según el rol si no tiene acceso.
 *
 * @param allowedRoles - Lista de roles permitidos (ej: ['trainer', 'admin'])
 * @param callback - Función a ejecutar con el usuario autenticado
 * @returns Función para cancelar la suscripción
 */
export function requireRole(
  allowedRoles: string[],
  callback: (user: FirebaseUser) => void,
): Unsubscribe {
  let callbackFired = false;

  async function checkRole(user: FirebaseUser | null): Promise<void> {
    if (!user) {
      if (!isPublicPath()) window.location.replace('/login');
      return;
    }

    if (callbackFired) return;

    try {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const role = docSnap.exists() ? docSnap.data()?.role : undefined;
      const email = (user.email || '').toLowerCase();

      // Bootstrap admins: correos de administrador conocidos
      const isBootstrapAdmin =
        email === 'servicioweb.pmi@gmail.com' ||
        email === 'sevicioweb.pmi@gmail.com';

      const effectiveRole = role || (isBootstrapAdmin ? 'admin' : null);

      if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
        logger.warn('AuthGuard', `Acceso denegado: ${user.uid} rol=${effectiveRole}`);
        // Redirigir al dashboard correcto según el rol real
        const target =
          effectiveRole === 'trainer' ? '/trainer/dashboard' :
            effectiveRole === 'client' ? '/client/dashboard' :
              effectiveRole === 'admin' ? '/admin/dashboard' : '/login';
        window.location.replace(target);
        return;
      }

      callbackFired = true;
      callback(user);
    } catch (error) {
      logger.error('AuthGuard', 'Error al verificar rol:', error);
      showToast({ message: 'Error al verificar permisos', type: 'error' });
      window.location.replace('/login');
    }
  }

  // Verificar sincrónicamente si ya hay sesión activa (caso post-login)
  if (auth.currentUser) {
    checkRole(auth.currentUser);
  }

  // Suscribirse para detectar cambios futuros (logout, expiración de token)
  return onAuthStateChanged(auth, async (user) => {
    if (!callbackFired) await checkRole(user);
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