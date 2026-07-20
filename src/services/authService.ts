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
import type { User, AuthError } from '@/types';

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
function toAuthError(err: unknown): Error {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    // Firebase real: error.code
    if (typeof e.code === 'string') {
      return new Error(e.code);
    }
    // Mock: new Error('auth/...') -> message contiene el code
    if (typeof e.message === 'string' && e.message.startsWith('auth/')) {
      return new Error(e.message);
    }
  }
  return new Error('auth/unknown');
}

export const authService = {
  /**
   * Iniciar sesión con email y contraseña.
   *
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Datos del usuario desde Firestore
   * @throws {AuthError} Si el perfil no existe o hay error de autenticación
   */
  async loginUser(email: string, password: string): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        throw { code: 'profile/not-found', message: 'Perfil de usuario no encontrado' };
      }

      return {
        uid: credential.user.uid,
        email: credential.user.email || '',
        name: userDoc.data().name || credential.user.displayName || 'Usuario',
        role: userDoc.data().role || 'client',
        hasActiveAlert: userDoc.data().hasActiveAlert ?? false,
        assignedTrainerId: userDoc.data().assignedTrainerId,
        medicalProfile: userDoc.data().medicalProfile,
        lastActivityAt: userDoc.data().lastActivityAt,
        createdAt: userDoc.data().createdAt,
        updatedAt: userDoc.data().updatedAt,
      };
    } catch (err) {
      throw toAuthError(err);
    }
  },

  /**
   * Registrar nuevo usuario.
   * Crea el usuario en Firebase Auth y su perfil en Firestore.
   *
   * @param name - Nombre completo del usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Datos del usuario creado
   * @throws {AuthError} Si hay error en el registro
   */
  async registerUser(name: string, email: string, password: string): Promise<User> {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;

      const profile = {
        name,
        email,
        role: 'client' as const,
        hasActiveAlert: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', uid), profile);

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
      throw toAuthError(err);
    }
  },

  /**
   * Cerrar sesión.
   */
  async logoutUser(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Enviar email de recuperación de contraseña.
   *
   * @param email - Email del usuario
   * @throws {AuthError} Si hay error al enviar el email
   */
  async recoverPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      throw toAuthError(err);
    }
  },

  /**
   * Iniciar sesión con Google (popup).
   * Si es primera vez, crea el perfil en Firestore.
   *
   * @returns Datos del usuario autenticado
   * @throws {AuthError} Si hay error en la autenticación con Google
   */
  async loginWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const { user: firebaseUser } = credential;
      const uid = firebaseUser.uid;

      const userDoc = await getDoc(doc(db, 'users', uid));

      if (!userDoc.exists()) {
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
        return {
          uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Usuario',
          role: 'client',
          hasActiveAlert: false,
          assignedTrainerId: undefined,
          medicalProfile: undefined,
          lastActivityAt: undefined,
          createdAt: undefined,
          updatedAt: undefined,
        };
      }

      return {
        uid,
        email: firebaseUser.email || '',
        name: userDoc.data().name || firebaseUser.displayName || 'Usuario',
        role: userDoc.data().role || 'client',
        hasActiveAlert: userDoc.data().hasActiveAlert ?? false,
        assignedTrainerId: userDoc.data().assignedTrainerId,
        medicalProfile: userDoc.data().medicalProfile,
        lastActivityAt: userDoc.data().lastActivityAt,
        createdAt: userDoc.data().createdAt,
        updatedAt: userDoc.data().updatedAt,
      };
    } catch (err) {
      throw toAuthError(err);
    }
  },

  /**
   * Observer de estado de autenticación.
   *
   * @param callback - Función a ejecutar cuando cambia el estado de auth
   * @returns Función unsubscribe para limpiar el observer
   */
  onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },
};
