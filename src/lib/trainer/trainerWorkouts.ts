/**
 * Servicios de datos para rutinas (workouts) del entrenador.
 *
 * @module trainerWorkouts
 */

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  limit,
  startAfter,
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';
import type { TrainerWorkout } from './types';

/**
 * Se suscribe a las rutinas de un entrenador.
 * @param trainerId - ID del entrenador
 * @param callback - Función a ejecutar con las rutinas
 * @param options - Opciones de paginación
 * @param options.limit - Número máximo de rutinas (default: 50, max: 100)
 * @param options.startAfter - Documento desde el cual empezar (para paginación)
 */
export function subscribeToWorkoutsByTrainer(
  trainerId: string,
  callback: (workouts: TrainerWorkout[]) => void,
  options?: { limit?: number; startAfter?: any },
): Unsubscribe {
  const limitCount = Math.min(options?.limit || 50, 100);

  const constraints: any[] = [
    where('trainerId', '==', trainerId),
    orderBy('createdAt', 'desc'),
  ];

  if (options?.startAfter) {
    constraints.push(startAfter(options.startAfter));
  }

  constraints.push(limit(limitCount));

  const q = query(collection(db, 'workouts'), ...constraints);
  let fallbackUnsub: Unsubscribe | null = null;

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      const workouts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerWorkout[];
      callback(workouts);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a rutinas (fallback sin orderBy):', error);
      const fallbackQ = query(collection(db, 'workouts'), where('trainerId', '==', trainerId));
      fallbackUnsub = onSnapshot(fallbackQ, (snapshot) => {
        const workouts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TrainerWorkout[];
        workouts.sort((a, b) => {
          const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : 0;
          const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : 0;
          return tB - tA;
        });
        callback(workouts);
      });
    },
  );

  return () => {
    unsub();
    fallbackUnsub?.();
  };
}

/**
 * Se suscribe a las rutinas de un cliente específico.
 * @param clientId - ID del cliente
 * @param callback - Función a ejecutar con las rutinas
 * @param options - Opciones de paginación
 * @param options.limit - Número máximo de rutinas (default: 50, max: 100)
 * @param options.startAfter - Documento desde el cual empezar (para paginación)
 */
export function subscribeToWorkoutsByClient(
  clientId: string,
  callback: (workouts: TrainerWorkout[]) => void,
  options?: { limit?: number; startAfter?: any },
): Unsubscribe {
  const limitCount = Math.min(options?.limit || 50, 100);

  const constraints: any[] = [
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  ];

  if (options?.startAfter) {
    constraints.push(startAfter(options.startAfter));
  }

  constraints.push(limit(limitCount));

  const q = query(collection(db, 'workouts'), ...constraints);
  let fallbackUnsub: Unsubscribe | null = null;

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      const workouts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerWorkout[];
      callback(workouts);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a rutinas del cliente (fallback sin orderBy):', error);
      const fallbackQ = query(collection(db, 'workouts'), where('clientId', '==', clientId));
      fallbackUnsub = onSnapshot(fallbackQ, (snapshot) => {
        const workouts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TrainerWorkout[];
        workouts.sort((a, b) => {
          const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : 0;
          const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : 0;
          return tB - tA;
        });
        callback(workouts);
      });
    },
  );

  return () => {
    unsub();
    fallbackUnsub?.();
  };
}

/**
 * Crea una nueva rutina.
 */
export async function createWorkout(data: Omit<TrainerWorkout, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'workouts'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    logger.info('Trainer', `Rutina creada: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logger.error('Trainer', 'Error al crear rutina:', error);
    showToast({ message: 'Error al crear la rutina', type: 'error' });
    return null;
  }
}

/**
 * Actualiza una rutina existente.
 */
export async function updateWorkout(id: string, data: Partial<TrainerWorkout>): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'workouts', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    logger.error('Trainer', 'Error al actualizar rutina:', error);
    showToast({ message: 'Error al actualizar la rutina', type: 'error' });
    return false;
  }
}

/**
 * Elimina una rutina.
 */
export async function deleteWorkout(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'workouts', id));
    return true;
  } catch (error) {
    logger.error('Trainer', 'Error al eliminar rutina:', error);
    showToast({ message: 'Error al eliminar la rutina', type: 'error' });
    return false;
  }
}
