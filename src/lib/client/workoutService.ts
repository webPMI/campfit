import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Unsubscribe, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';
import type { ExerciseExecutionLog, WorkoutSessionLog } from '@/lib/trainer/types';

export type { ExerciseExecutionLog, WorkoutSessionLog };

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
  difficulty: string;
  description: string;
  exercises: Exercise[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function subscribeToWorkouts(
  clientId: string,
  callback: (workouts: Workout[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!clientId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'workouts'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout)));
    },
    (error) => {
      logger.error('Workout', 'Error al suscribirse a workouts:', error);
      if (onError) onError(error);
      callback([]);
    }
  );
}

/**
 * Registra el resultado de la sesión de entrenamiento completada o parcial por el cliente.
 */
export async function logWorkoutSession(
  data: Omit<WorkoutSessionLog, 'id' | 'createdAt'>
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'workoutLogs'), {
      ...data,
      date: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    logger.info('WorkoutService', `Sesión de entrenamiento registrada: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logger.error('WorkoutService', 'Error al registrar sesión de entrenamiento:', error);
    return null;
  }
}

/**
 * Se suscribe a los registros históricos de sesiones de entrenamiento del cliente.
 */
export function subscribeToClientWorkoutLogs(
  clientId: string,
  callback: (logs: WorkoutSessionLog[]) => void
): Unsubscribe {
  if (!clientId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'workoutLogs'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
    limit(30)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as WorkoutSessionLog));
    },
    (error) => {
      logger.error('WorkoutService', 'Error al cargar historial de entrenamientos:', error);
      callback([]);
    }
  );
}
