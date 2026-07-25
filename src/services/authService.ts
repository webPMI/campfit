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
  signInWithPopup,
} from '@/lib/firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from '@/lib/firebase/firestore';
import { auth, db } from '@/lib/firebase';
<<<<<<< HEAD
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
=======
import type { User, AuthError } from '@/types';
import { mapFirebaseUserToUser } from '@/lib/helpers/userMappers';
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a

export const authService = {
  /**
   * Iniciar sesión con email y contraseña.
<<<<<<< HEAD
   *
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Datos del usuario desde Firestore
   * @throws {AuthError} Si el perfil no existe o hay error de autenticación
=======
   * Retorna los datos del usuario desde Firestore.
   * 
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Promise que resuelve con los datos del usuario
   * @throws {AuthError} Si el perfil de usuario no existe
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
   */
  async loginUser(email: string, password: string): Promise<User> {
    logger.info('Auth', `Intento de login con email: ${email}`);

<<<<<<< HEAD
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
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
=======
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      const error: AuthError = {
        code: 'user-not-found',
        message: 'Perfil de usuario no encontrado',
      };
      throw error;
    }

    return mapFirebaseUserToUser(credential.user, userDoc.data());
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
  },

  /**
   * Registra un nuevo usuario en el sistema.
   * Crea el usuario en Firebase Auth y su perfil en Firestore.
<<<<<<< HEAD
   *
   * @param name - Nombre completo del usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Datos del usuario creado
   * @throws {AuthError} Si hay error en el registro
=======
   * 
   * @param name - Nombre completo del usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Promise que resuelve con los datos del usuario creado
   * 
   * @example
   * const user = await authService.registerUser('Juan Pérez', 'juan@email.com', 'password123');
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
   */
  async registerUser(name: string, email: string, password: string): Promise<User> {
    logger.info('Auth', `Intento de registro para email: ${email}, nombre: ${name}`);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      logger.info('Auth', `Usuario creado en Firebase Auth: ${uid}`);

      const profile = {
        name,
        email,
        role: 'client' as const,
        hasActiveAlert: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

<<<<<<< HEAD
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
=======
    return mapFirebaseUserToUser(credential.user, profile);
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
  },

  /**
   * Cierra la sesión del usuario actual.
   * 
   * @returns Promise que resuelve cuando la sesión se cierra
   * 
   * @example
   * await authService.logoutUser();
   */
  async logoutUser(): Promise<void> {
    logger.info('Auth', 'Iniciando cierre de sesión');
    try {
      await signOut(auth);
      logger.info('Auth', 'Sesión cerrada exitosamente');
    } catch (err) {
      const authErr = toAuthError(err);
      logger.error('Auth', 'Error al cerrar sesión', { code: authErr.code, message: authErr.message });
      throw authErr;
    }
  },

  /**
<<<<<<< HEAD
   * Enviar email de recuperación de contraseña.
   *
   * @param email - Email del usuario
   * @throws {AuthError} Si hay error al enviar el email
=======
   * Envía un email de recuperación de contraseña al usuario.
   * 
   * @param email - Email del usuario que solicita recuperación
   * @returns Promise que resuelve cuando el email se envía
   * 
   * @example
   * await authService.recoverPassword('usuario@email.com');
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
   */
  async recoverPassword(email: string): Promise<void> {
    logger.info('Auth', `Solicitud de recuperación de contraseña para: ${email}`);

    try {
      await sendPasswordResetEmail(auth, email);
      logger.info('Auth', `Email de recuperación enviado a: ${email}`);
    } catch (err) {
      const authErr = toAuthError(err);
      logger.error('Auth', `Error al enviar email de recuperación a: ${email}`, { code: authErr.code, message: authErr.message });
      throw authErr;
    }
  },

  /**
<<<<<<< HEAD
   * Iniciar sesión con Google (popup).
   * Si es primera vez, crea el perfil en Firestore.
   *
   * @returns Datos del usuario autenticado
   * @throws {AuthError} Si hay error en la autenticación con Google
=======
   * Inicia sesión con Google usando popup.
   * Si es la primera vez que el usuario accede, crea su perfil en Firestore.
   * 
   * @returns Promise que resuelve con los datos del usuario autenticado
   * 
   * @example
   * const user = await authService.loginWithGoogle();
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
   */
  async loginWithGoogle(): Promise<User> {
    logger.info('Auth', 'Iniciando login con Google');

    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const { user: firebaseUser } = credential;
      const uid = firebaseUser.uid;
      logger.info('Auth', `Login con Google exitoso para uid: ${uid}, email: ${firebaseUser.email}`);

      let profileData: any = null;
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (!userDoc.exists()) {
          logger.info('Auth', `Perfil no existe, creando nuevo perfil para uid: ${uid}`);
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
          profileData = profile;
          logger.info('Auth', `Perfil creado en Firestore para uid: ${uid}`);
        } else {
          profileData = userDoc.data();
          logger.info('Auth', `Perfil existente encontrado para uid: ${uid}, rol: ${profileData.role}`);
        }
      } catch (firestoreErr) {
        logger.error('Auth', 'Error al obtener/crear perfil en Firestore', firestoreErr);
      }

      return {
        uid,
        email: firebaseUser.email || '',
        name: profileData?.name || firebaseUser.displayName || 'Usuario',
        role: profileData?.role || 'client',
        hasActiveAlert: profileData?.hasActiveAlert ?? false,
        assignedTrainerId: profileData?.assignedTrainerId,
        medicalProfile: profileData?.medicalProfile,
        lastActivityAt: profileData?.lastActivityAt,
        createdAt: profileData?.createdAt,
        updatedAt: profileData?.updatedAt,
      };
<<<<<<< HEAD
    } catch (err) {
      const authErr = toAuthError(err);
      logger.error('Auth', 'Error en login con Google', { code: authErr.code, message: authErr.message });
      throw authErr;
    }
  },

  /**
   * Observer de estado de autenticación.
   *
   * @param callback - Función a ejecutar cuando cambia el estado de auth
   * @returns Función unsubscribe para limpiar el observer
=======
      await setDoc(doc(db, 'users', uid), profile);
      return mapFirebaseUserToUser(firebaseUser, profile);
    }

    return mapFirebaseUserToUser(firebaseUser, userDoc.data());
  },

  /**
   * Suscribe un callback al cambio de estado de autenticación.
   * 
   * @param callback - Función a ejecutar cuando cambie el estado de autenticación
   * @returns Función unsubscribe para cancelar la suscripción
   * 
   * @example
   * const unsubscribe = authService.onAuthChange((user) => {
   *   if (user) console.log('Usuario autenticado:', user.uid);
   * });
   * // Para cancelar: unsubscribe();
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
   */
  onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
    logger.info('Auth', 'Registrando observer de estado de autenticación');
    return onAuthStateChanged(auth, callback);
  },
};
