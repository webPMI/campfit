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
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';
import type { TrainerWorkout } from './types';

/**
 * Se suscribe a las rutinas de un entrenador.
 */
export function subscribeToWorkoutsByTrainer(
  trainerId: string,
  callback: (workouts: TrainerWorkout[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'workouts'),
    where('trainerId', '==', trainerId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const workouts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerWorkout[];
      callback(workouts);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a rutinas:', error);
      showToast({ message: 'Error al cargar rutinas', type: 'error' });
    },
  );
}

/**
 * Se suscribe a las rutinas de un cliente específico.
 */
export function subscribeToWorkoutsByClient(
  clientId: string,
  callback: (workouts: TrainerWorkout[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'workouts'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const workouts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerWorkout[];
      callback(workouts);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a rutinas del cliente:', error);
    },
  );
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
