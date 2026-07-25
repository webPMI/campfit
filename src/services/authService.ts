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
import { mapFirebaseUserToUser } from '@/lib/helpers/userMappers';

export const authService = {
  /**
   * Iniciar sesión con email y contraseña.
   * Retorna los datos del usuario desde Firestore.
   * 
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Promise que resuelve con los datos del usuario
   * @throws {AuthError} Si el perfil de usuario no existe
   */
  async loginUser(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      const error: AuthError = {
        code: 'user-not-found',
        message: 'Perfil de usuario no encontrado',
      };
      throw error;
    }

    return mapFirebaseUserToUser(credential.user, userDoc.data());
  },

  /**
   * Registra un nuevo usuario en el sistema.
   * Crea el usuario en Firebase Auth y su perfil en Firestore.
   * 
   * @param name - Nombre completo del usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Promise que resuelve con los datos del usuario creado
   * 
   * @example
   * const user = await authService.registerUser('Juan Pérez', 'juan@email.com', 'password123');
   */
  async registerUser(name: string, email: string, password: string): Promise<User> {
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

    return mapFirebaseUserToUser(credential.user, profile);
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
    await signOut(auth);
  },

  /**
   * Envía un email de recuperación de contraseña al usuario.
   * 
   * @param email - Email del usuario que solicita recuperación
   * @returns Promise que resuelve cuando el email se envía
   * 
   * @example
   * await authService.recoverPassword('usuario@email.com');
   */
  async recoverPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Inicia sesión con Google usando popup.
   * Si es la primera vez que el usuario accede, crea su perfil en Firestore.
   * 
   * @returns Promise que resuelve con los datos del usuario autenticado
   * 
   * @example
   * const user = await authService.loginWithGoogle();
   */
  async loginWithGoogle(): Promise<User> {
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
   */
  onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },
};
