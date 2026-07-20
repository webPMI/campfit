/**
 * Funciones de gestión de usuarios para el panel de administración.
 * CRUD de usuarios: crear, actualizar rol, asignar trainer, eliminar, bloquear.
 *
 * @module adminUsers
 */

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';
import type { AdminUser, CreateUserPayload } from './types';

/**
 * Crea un nuevo usuario (Auth + Firestore).
 */
export async function createUser(data: CreateUserPayload): Promise<{ success: boolean; message: string; uid?: string }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const uid = userCredential.user.uid;

    const userData: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      role: data.role,
      hasActiveAlert: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (data.assignedTrainerId) {
      userData.assignedTrainerId = data.assignedTrainerId;
    }

    await setDoc(doc(db, 'users', uid), userData);

    logger.info('Admin', `Usuario creado: ${uid} (${data.email})`);
    return { success: true, message: 'Usuario creado correctamente', uid };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'auth/email-already-in-use') {
      return { success: false, message: 'El email ya está registrado' };
    }
    if (err.code === 'auth/weak-password') {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    logger.error('Admin', 'Error al crear usuario:', error);
    return { success: false, message: 'Error al crear el usuario' };
  }
}

/**
 * Actualiza el rol de un usuario.
 */
export async function updateUserRole(uid: string, newRole: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      role: newRole,
      updatedAt: serverTimestamp(),
    });
    logger.info('Admin', `Rol actualizado para ${uid}: ${newRole}`);
    return true;
  } catch (error) {
    logger.error('Admin', 'Error al actualizar rol:', error);
    showToast({ message: 'Error al actualizar el rol', type: 'error' });
    return false;
  }
}

/**
 * Asigna o desasigna un trainer a un cliente.
 */
export async function assignTrainer(clientId: string, trainerId: string | null): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'users', clientId), {
      assignedTrainerId: trainerId || null,
      updatedAt: serverTimestamp(),
    });
    logger.info('Admin', `Trainer ${trainerId || 'ninguno'} asignado a cliente ${clientId}`);
    return true;
  } catch (error) {
    logger.error('Admin', 'Error al asignar trainer:', error);
    showToast({ message: 'Error al asignar trainer', type: 'error' });
    return false;
  }
}

/**
 * Elimina un usuario de Firestore.
 */
export async function deleteUser(uid: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'users', uid));
    logger.info('Admin', `Usuario eliminado: ${uid}`);
    return true;
  } catch (error) {
    logger.error('Admin', 'Error al eliminar usuario:', error);
    showToast({ message: 'Error al eliminar el usuario', type: 'error' });
    return false;
  }
}

/**
 * Bloquea o desbloquea un usuario.
 */
export async function toggleUserBlock(uid: string, isBlocked: boolean): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      isBlocked,
      blockedAt: isBlocked ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    });
    logger.info('Admin', `Usuario ${uid} ${isBlocked ? 'bloqueado' : 'desbloqueado'}`);
    return true;
  } catch (error) {
    logger.error('Admin', 'Error al cambiar estado de bloqueo:', error);
    showToast({ message: 'Error al cambiar estado de bloqueo', type: 'error' });
    return false;
  }
}

/**
 * Obtiene el nombre de un usuario por su UID.
 */
export async function getUserName(userId: string): Promise<string> {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data().name || 'Sin nombre';
    }
    return 'Usuario desconocido';
  } catch (error) {
    logger.error('Admin', 'Error al obtener nombre de usuario:', error);
    return 'Error';
  }
}

/**
 * Obtiene el perfil completo de un usuario.
 */
export async function getUserProfile(userId: string): Promise<AdminUser | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        name: data.name || 'Sin nombre',
        email: data.email || '',
        role: data.role || 'client',
        assignedTrainerId: data.assignedTrainerId,
        hasActiveAlert: data.hasActiveAlert ?? false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as AdminUser;
    }
    return null;
  } catch (error) {
    logger.error('Admin', 'Error al cargar perfil de usuario:', error);
    return null;
  }
}
