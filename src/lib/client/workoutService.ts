import { collection, query, where, orderBy, limit, startAfter, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: string;
  videoUrl: string;
  description: string;
  order: number;
  dayOfWeek: number;
}

export interface Workout {
  id: string;
  clientId: string;
  trainerId: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'custom';
  description: string;
  exercises: Exercise[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completed?: boolean;
  completedAt?: Timestamp;
}

export function subscribeToWorkouts(
  clientId: string,
  callback: (workouts: Workout[]) => void,
  optionsOrOnError?: { limit?: number; startAfter?: any } | ((error: Error) => void),
  onError?: (error: Error) => void
): Unsubscribe {
  if (!clientId) {
    callback([]);
    return () => { };
  }

  let options: { limit?: number; startAfter?: any } | undefined;
  let errCb = onError;

  if (typeof optionsOrOnError === 'function') {
    errCb = optionsOrOnError;
  } else if (optionsOrOnError) {
    options = optionsOrOnError;
  }

  const constraints: any[] = [
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  ];

  if (options?.startAfter) {
    constraints.push(startAfter(options.startAfter));
  }

  const limitCount = Math.min(options?.limit || 1, 100);
  constraints.push(limit(limitCount));

  const q = query(collection(db, 'workouts'), ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout)));
    },
    (error) => {
      logger.error('Workout', 'Error al suscribirse a workouts:', error);
      if (errCb) errCb(error);
      callback([]);
    }
  );
}

/**
 * Marca un entrenamiento como completado.
 * @param workoutId - ID del entrenamiento
 * @returns true si se actualizó correctamente
 */
export async function completeWorkout(workoutId: string): Promise<boolean> {
  try {
    const workoutRef = doc(db, 'workouts', workoutId);
    await updateDoc(workoutRef, {
      completed: true,
      completedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    logger.error('Workout', 'Error al marcar entrenamiento como completado:', error);
    return false;
  }
}
