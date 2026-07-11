import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe, Timestamp } from 'firebase/firestore';
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
