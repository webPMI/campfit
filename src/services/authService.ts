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
import type { User } from '@/types';
import { logger } from '@/lib/shared/logger';

/**
 * Convierte un error de Firebase en un Error con el code como mensaje.
 * Los tests y el UI esperan el code string (ej: 'auth/invalid-credential').
 */
function toAuthError(err: unknown): Error {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (typeof e.code === 'string') {
      const error = new Error(e.code);
      (error as unknown as { code: string }).code = e.code;
      return error;
    }
    if (typeof e.message === 'string' && e.message.startsWith('auth/')) {
      const error = new Error(e.message);
      (error as unknown as { code: string }).code = e.message;
      return error;
    }
  }
  const unknownError = new Error('auth/unknown');
  (unknownError as unknown as { code: string }).code = 'auth/unknown';
  return unknownError;
}

export const authService = {
  /**
   * Iniciar sesión con email y contraseña.
   */
  async loginUser(email: string, password: string): Promise<User> {
    logger.info('AuthService', `Intentando login: ${email}`);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      logger.info('AuthService', `Login exitoso UID:${uid.slice(0, 8)}... rol:${credential.user.email}`);

      const userDoc = await getDoc(doc(db, 'users', uid));
      const userEmail = (credential.user.email || '').toLowerCase();
      const isBootstrapAdmin =
        userEmail === 'servicioweb.pmi@gmail.com' || userEmail === 'sevicioweb.pmi@gmail.com';

      if (!userDoc.exists()) {
        if (isBootstrapAdmin) {
          logger.info('AuthService', 'Bootstrap admin detectado, sin documento Firestore');
          return {
            uid: credential.user.uid,
            email: credential.user.email || '',
            name: credential.user.displayName || 'Administrador',
            role: 'admin',
            hasActiveAlert: false,
          };
        }

        logger.warn('AuthService', `Documento Firestore no encontrado para UID:${uid.slice(0, 8)}..., auto-creando perfil`);
        const profile = {
          name: credential.user.displayName || credential.user.email?.split('@')[0] || 'Usuario',
          email: credential.user.email || '',
          role: 'client' as const,
          hasActiveAlert: false,
          onboardingCompleted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', uid), profile);
        logger.info('AuthService', `Perfil Firestore auto-creado para ${profile.email}`);
        return {
          uid,
          email: credential.user.email || '',
          name: profile.name,
          role: 'client',
          hasActiveAlert: false,
        };
      }

      const role = userDoc.data().role || 'client';
      logger.info('AuthService', `Usuario cargado de Firestore: ${role} - ${userDoc.data().name}`);
      return {
        uid: credential.user.uid,
        email: credential.user.email || '',
        name: userDoc.data().name || credential.user.displayName || 'Usuario',
        role,
        hasActiveAlert: userDoc.data().hasActiveAlert ?? false,
        assignedTrainerId: userDoc.data().assignedTrainerId,
        medicalProfile: userDoc.data().medicalProfile,
        lastActivityAt: userDoc.data().lastActivityAt,
        createdAt: userDoc.data().createdAt,
        updatedAt: userDoc.data().updatedAt,
      };
    } catch (err) {
      logger.error('AuthService', `Error en login: ${String(err)}`, err);
      throw toAuthError(err);
    }
  },

  /**
   * Registrar nuevo usuario.
   */
  async registerUser(name: string, email: string, password: string): Promise<User> {
    logger.info('AuthService', `Registrando: ${email} (${name})`);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      logger.info('AuthService', `Firebase Auth creado UID:${uid.slice(0, 8)}...`);

      const profile = {
        name,
        email,
        role: 'client' as const,
        hasActiveAlert: false,
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', uid), profile);
      logger.info('AuthService', `Documento Firestore creado para ${email}`);

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
      logger.error('AuthService', `Error en registro: ${String(err)}`, err);
      throw toAuthError(err);
    }
  },

  /**
   * Cerrar sesión.
   */
  async logoutUser(): Promise<void> {
    logger.info('AuthService', 'Cerrando sesión...');
    await signOut(auth);
    logger.info('AuthService', 'Sesión cerrada');
  },

  /**
   * Enviar email de recuperación de contraseña.
   */
  async recoverPassword(email: string): Promise<void> {
    logger.info('AuthService', `Enviando email de recuperación a: ${email}`);
    try {
      await sendPasswordResetEmail(auth, email);
      logger.info('AuthService', `Email de recuperación enviado a ${email}`);
    } catch (err) {
      logger.error('AuthService', `Error al enviar recuperación a ${email}: ${String(err)}`, err);
      throw toAuthError(err);
    }
  },

  /**
   * Iniciar sesión con Google (popup).
   * Si es primera vez, crea el perfil en Firestore.
   */
  async loginWithGoogle(): Promise<User> {
    logger.info('AuthService', 'Iniciando login con Google...');
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const { user: firebaseUser } = credential;
      const uid = firebaseUser.uid;
      logger.info('AuthService', `Google login exitoso UID:${uid.slice(0, 8)}... (${firebaseUser.email})`);

      const userDoc = await getDoc(doc(db, 'users', uid));

      if (!userDoc.exists()) {
        logger.info('AuthService', `Primer login con Google, creando perfil para ${firebaseUser.email}`);
        const profile = {
          name: firebaseUser.displayName || 'Usuario',
          email: firebaseUser.email || '',
          role: 'client' as const,
          photoURL: firebaseUser.photoURL || '',
          hasActiveAlert: false,
          onboardingCompleted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', uid), profile);
        logger.info('AuthService', `Perfil Google creado con photoURL: ${firebaseUser.photoURL ? 'Sí' : 'No'}`);
        return {
          uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Usuario',
          photoURL: firebaseUser.photoURL || '',
          role: 'client',
          hasActiveAlert: false,
          assignedTrainerId: undefined,
          medicalProfile: undefined,
          lastActivityAt: undefined,
          createdAt: undefined,
          updatedAt: undefined,
        };
      }

      logger.info('AuthService', `Usuario Google existente: ${userDoc.data().role || 'client'}`);
      return {
        uid,
        email: firebaseUser.email || '',
        name: userDoc.data().name || firebaseUser.displayName || 'Usuario',
        photoURL: userDoc.data().photoURL || firebaseUser.photoURL || '',
        role: userDoc.data().role || 'client',
        hasActiveAlert: userDoc.data().hasActiveAlert ?? false,
        assignedTrainerId: userDoc.data().assignedTrainerId,
        medicalProfile: userDoc.data().medicalProfile,
        lastActivityAt: userDoc.data().lastActivityAt,
        createdAt: userDoc.data().createdAt,
        updatedAt: userDoc.data().updatedAt,
      };
    } catch (err) {
      logger.error('AuthService', `Error en login Google: ${String(err)}`, err);
      throw toAuthError(err);
    }
  },

  /**
   * Observer de estado de autenticación.
   */
  onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },
};