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
  type User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/types';

function mapFirebaseUser(firebaseUser: FirebaseUser, profile: any): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: profile.name || firebaseUser.displayName || 'Usuario',
    role: profile.role || 'client',
    hasActiveAlert: profile.hasActiveAlert ?? false,
    assignedTrainerId: profile.assignedTrainerId,
    medicalProfile: profile.medicalProfile,
    lastActivityAt: profile.lastActivityAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export const authService = {
  /**
   * Iniciar sesión con email y contraseña.
   * Retorna los datos del usuario desde Firestore.
   */
  async loginUser(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      throw new Error('Perfil de usuario no encontrado');
    }

    return mapFirebaseUser(credential.user, userDoc.data());
  },

  /**
   * Registrar nuevo usuario.
   * Crea el usuario en Firebase Auth y su perfil en Firestore.
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

    return mapFirebaseUser(credential.user, profile);
  },

  /**
   * Cerrar sesión.
   */
  async logoutUser(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Enviar email de recuperación de contraseña.
   */
  async recoverPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Iniciar sesión con Google (popup).
   * Si es primera vez, crea el perfil en Firestore.
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', uid), profile);
      return mapFirebaseUser(firebaseUser, profile);
    }

    return mapFirebaseUser(firebaseUser, userDoc.data());
  },

  /**
   * Observer de estado de autenticación.
   * Retorna la función unsubscribe.
   */
  onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },
};
