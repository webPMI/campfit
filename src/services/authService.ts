/**
 * Servicio de autenticación.
 * Centraliza toda la lógica de Firebase Auth + Firestore.
 *
 * Uso:
 *   import { authService } from '@/services/authService';
 *   const user = await authService.loginUser(email, password);
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type FirebaseUser,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from '@/lib/firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from '@/lib/firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AuthError, type User } from '@/types';
import { logger } from '@/lib/shared/logger';

/**
 * Convierte un error de Firebase en un Error con el code como mensaje.
 * Los tests y el UI esperan el code string (ej: 'auth/invalid-credential').
 *
 * Firebase Auth real lanza errores con `error.code` (ej: 'auth/invalid-credential').
 * Los mocks pueden tener el code en `message` (new Error('auth/...')).
 *
 * @param err - Error capturado (puede tener code y/o message)
 * @returns Error con el code de Firebase como mensaje
 */
function toAuthError(err: unknown): AuthError {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    let codeStr = 'auth/unknown';
    if (typeof e.code === 'string') {
      codeStr = e.code;
    } else if (typeof e.message === 'string') {
      codeStr = e.message;
    }
    return new AuthError(codeStr, codeStr);
  }
  return new AuthError('auth/unknown', 'auth/unknown');
}

/**
 * Procesa un FirebaseUser para obtener/crear su perfil en Firestore.
 */
async function processFirebaseUser(firebaseUser: FirebaseUser): Promise<User> {
  const uid = firebaseUser.uid;
  logger.step('Auth:Google', 3, 4, 'Buscando perfil en Firestore', 'pending', { uid });
  const userDoc = await getDoc(doc(db, 'users', uid));

  if (!userDoc.exists()) {
    logger.step('Auth:Google', 4, 4, 'Perfil no existe - creando nuevo perfil', 'pending', {
      name: firebaseUser.displayName || 'Usuario',
      email: firebaseUser.email || '',
    });

    const profile = {
      name: firebaseUser.displayName || 'Usuario',
      email: firebaseUser.email || '',
      role: 'client' as const,
      hasActiveAlert: false,
      onboardingCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', uid), profile);
    logger.step('Auth:Google', 4, 4, 'Nuevo perfil creado en Firestore', 'success', { role: 'client' });
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: profile.name,
      role: profile.role,
      hasActiveAlert: profile.hasActiveAlert,
      assignedTrainerId: undefined,
      medicalProfile: undefined,
      lastActivityAt: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    };
  }

  logger.step('Auth:Google', 3, 4, 'Perfil existente encontrado en Firestore', 'success', {
    role: userDoc.data()?.role,
  });
  const data = userDoc.data();
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: data.name || firebaseUser.displayName || 'Usuario',
    role: data.role || 'client',
    hasActiveAlert: data.hasActiveAlert ?? false,
    assignedTrainerId: data.assignedTrainerId,
    medicalProfile: data.medicalProfile,
    lastActivityAt: data.lastActivityAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export const authService = {
  /**
   * Iniciar sesión con email y contraseña.
   */
  async loginUser(email: string, password: string): Promise<User> {
    logger.group('loginUser');
    logger.step('Auth', 1, 3, 'Autenticando con email y password', 'pending', { email });

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      logger.step('Auth', 2, 3, 'Usuario autenticado en Firebase Auth', 'success', { uid });
      logger.info('Auth', `Login exitoso en Firebase Auth para uid: ${uid}`);

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        logger.warn('Auth', `Perfil no encontrado en Firestore para uid: ${uid}`);
        throw new AuthError('profile/not-found', 'Perfil de usuario no encontrado');
      }

      const userData = userDoc.data();
      logger.info('Auth', `Perfil encontrado en Firestore para uid: ${uid}, rol: ${userData.role}`);

      return {
        uid: credential.user.uid,
        email: credential.user.email || '',
        name: userData.name || credential.user.displayName || 'Usuario',
        role: userData.role || 'client',
        hasActiveAlert: userData.hasActiveAlert ?? false,
        assignedTrainerId: userData.assignedTrainerId,
        medicalProfile: userData.medicalProfile,
        lastActivityAt: userData.lastActivityAt,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };
    } catch (err) {
      const authErr = toAuthError(err);
      logger.error('Auth', `Error en login para email: ${email}`, { code: authErr.code, message: authErr.message });
      throw authErr;
    }
  },

  /**
   * Registra un nuevo usuario en el sistema.
   */
  async registerUser(name: string, email: string, password: string): Promise<User> {
    logger.group('registerUser');
    logger.step('Auth', 1, 3, 'Creando usuario en Firebase Auth', 'pending', { email });

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      logger.step('Auth', 2, 3, 'Usuario creado en Firebase Auth', 'success', { uid });
      logger.info('Auth', `Usuario creado en Firebase Auth: ${uid}`);

      const profile = {
        name,
        email,
        role: 'client' as const,
        hasActiveAlert: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', uid), profile);
      logger.info('Auth', `Perfil creado en Firestore para uid: ${uid}`);

      return {
        uid: credential.user.uid,
        email: credential.user.email || '',
        name,
        role: 'client',
        hasActiveAlert: false,
        assignedTrainerId: undefined,
        medicalProfile: undefined,
        lastActivityAt: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };
    } catch (err) {
      const authErr = toAuthError(err);
      logger.error('Auth', `Error en registro para email: ${email}`, { code: authErr.code, message: authErr.message });
      throw authErr;
    }
  },

  /**
   * Cierra la sesión del usuario actual.
   */
  async logoutUser(): Promise<void> {
    logger.debug('Auth', 'Cerrando sesión');
    await signOut(auth);
    logger.debug('Auth', 'Sesión cerrada exitosamente');
  },

  /**
   * Envía un email de recuperación de contraseña.
   */
  async recoverPassword(email: string): Promise<void> {
    logger.debug('Auth', 'Enviando email de recuperación', { email });
    await sendPasswordResetEmail(auth, email);
    logger.debug('Auth', 'Email de recuperación enviado');
  },

  /**
   * Inicia sesión con Google usando redirect.
   * Redirige al usuario a la página de autenticación de Google.
   * Al volver, checkRedirectResult procesa el resultado.
   */
  async loginWithGoogle(): Promise<void> {
    logger.group('Auth:Google - loginWithGoogle');
    logger.step('Auth:Google', 1, 2, 'Creando proveedor Google', 'pending');

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    logger.step('Auth:Google', 1, 2, 'Proveedor Google creado con prompt=select_account', 'success');
    logger.step('Auth:Google', 2, 2, 'Redirigiendo a Google para autenticación...', 'pending');

    try {
      await signInWithRedirect(auth, provider);
      logger.step('Auth:Google', 2, 2, 'Redirección a Google iniciada', 'success');
      logger.groupEnd();
    } catch (error: unknown) {
      const errorObj = error as { code?: string; message?: string };
      logger.error('Auth:Google', 'Error al redirigir a Google', {
        code: errorObj?.code || 'unknown',
        message: errorObj?.message || 'Sin mensaje',
      });
      logger.step('Auth:Google', 2, 2, 'Error al redirigir a Google', 'error');
      logger.groupEnd();
      throw error;
    }
  },

  /**
   * Verifica si el usuario viene de un redirect de Google y procesa el resultado.
   * Estrategia: intenta getRedirectResult primero. Si no hay resultado pero
   * el usuario ya está autenticado (currentUser), lo procesa directamente.
   * Esto cubre los casos donde onAuthStateChanged se dispara antes.
   * 
   * @returns Promise con los datos del usuario si es redirect exitoso, null si no
   */
  async handleRedirectResult(): Promise<User | null> {
    logger.group('Auth:Google - handleRedirectResult');
    logger.step('Auth:Google', 1, 4, 'Verificando resultado de redirección...', 'pending');

    try {
      // 1. Intentar getRedirectResult (forma oficial de Firebase)
      logger.debug('Auth:Google', 'Llamando a getRedirectResult...');
      const result = await getRedirectResult(auth);

      if (result?.user) {
        logger.step('Auth:Google', 2, 4, 'Redirect detectado por getRedirectResult', 'success', {
          uid: result.user.uid,
          email: result.user.email,
        });
        const user = await processFirebaseUser(result.user);
        logger.groupEnd();
        return user;
      }

      // 2. Fallback: si currentUser ya está seteado (onAuthStateChanged se disparó antes)
      const currentUser = auth.currentUser;
      if (currentUser) {
        logger.debug('Auth:Google', 'No hay getRedirectResult, pero hay currentUser - procesando...', {
          uid: currentUser.uid,
        });
        logger.step('Auth:Google', 2, 4, 'Usuario ya autenticado (currentUser)', 'success');
        const user = await processFirebaseUser(currentUser);
        logger.groupEnd();
        return user;
      }

      // 3. No hay redirect pendiente
      logger.step('Auth:Google', 1, 4, 'No hay resultado de redirect pendiente', 'success');
      logger.groupEnd();
      return null;
    } catch (error: unknown) {
      const errorObj = error as { code?: string; message?: string; stack?: string };
      logger.error('Auth:Google', 'Error al procesar redirect de Google', {
        code: errorObj?.code || 'unknown',
        message: errorObj?.message || 'Sin mensaje',
      });
      logger.groupEnd();
      throw error;
    }
  },

  /**
   * Suscribe un callback al cambio de estado de autenticación.
   */
  onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
    logger.debug('Auth', 'Suscribiendo a cambios de autenticación');
    const unsubscribe = onAuthStateChanged(auth, callback);
    logger.debug('Auth', 'Suscripción creada');
    return unsubscribe;
  },
};