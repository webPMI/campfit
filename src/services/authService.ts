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
import type { User, AuthError } from '@/types';
import { mapFirebaseUserToUser } from '@/lib/helpers/userMappers';
import { logger } from '@/lib/shared/logger';

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
    return mapFirebaseUserToUser(firebaseUser, profile);
  }

  logger.step('Auth:Google', 3, 4, 'Perfil existente encontrado en Firestore', 'success', {
    role: userDoc.data()?.role,
  });
  return mapFirebaseUserToUser(firebaseUser, userDoc.data());
}

export const authService = {
  /**
   * Iniciar sesión con email y contraseña.
   */
  async loginUser(email: string, password: string): Promise<User> {
    logger.group('loginUser');
    logger.step('Auth', 1, 3, 'Autenticando con email y password', 'pending', { email });

    const credential = await signInWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;
    logger.step('Auth', 2, 3, 'Usuario autenticado en Firebase Auth', 'success', { uid });

    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      logger.step('Auth', 3, 3, 'Perfil no encontrado en Firestore', 'error');
      logger.groupEnd();
      const error: AuthError = {
        code: 'user-not-found',
        message: 'Perfil de usuario no encontrado',
      };
      throw error;
    }

    logger.step('Auth', 3, 3, 'Perfil encontrado en Firestore', 'success', { role: userDoc.data()?.role });
    logger.groupEnd();
    return mapFirebaseUserToUser(credential.user, userDoc.data());
  },

  /**
   * Registra un nuevo usuario en el sistema.
   */
  async registerUser(name: string, email: string, password: string): Promise<User> {
    logger.group('registerUser');
    logger.step('Auth', 1, 3, 'Creando usuario en Firebase Auth', 'pending', { email });

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;
    logger.step('Auth', 2, 3, 'Usuario creado en Firebase Auth', 'success', { uid });

    const profile = {
      name,
      email,
      role: 'client' as const,
      hasActiveAlert: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', uid), profile);
    logger.step('Auth', 3, 3, 'Perfil creado en Firestore', 'success', { role: 'client' });
    logger.groupEnd();

    return mapFirebaseUserToUser(credential.user, profile);
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
        // Solo procesamos si el usuario no existía previamente en la sesión.
        // Esto evita procesar usuarios ya logueados que navegan a login.
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