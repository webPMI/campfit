import { collection, query, where, orderBy, limit, onSnapshot, type Timestamp } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';
import type { Diet } from './dietService';
import type { Workout } from '../trainer/types';

/**
 * Servicio para obtener la agenda diaria combinada del cliente.
 * Combina la dieta y la rutina más reciente.
 */
export function subscribeToDailySchedule(
  clientId: string,
  callback: (schedule: { diets: Diet[]; workouts: Workout[] }) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!clientId) {
    callback({ diets: [], workouts: [] });
    return () => {};
  }

  let diets: Diet[] = [];
  let workouts: Workout[] = [];

  // Suscripción a la dieta más reciente
  const unsubDiets = onSnapshot(
    query(collection(db, 'diets'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'), limit(1)),
    (snapshot) => {
      diets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diet));
      callback({ diets, workouts });
    },
    (error) => {
      logger.error('DailySchedule', 'Error suscripción dietas:', error);
      if (onError) onError(error);
    }
  );

  // Suscripción a la rutina más reciente
  const unsubWorkouts = onSnapshot(
    query(collection(db, 'workouts'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'), limit(1)),
    (snapshot) => {
      workouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout));
      callback({ diets, workouts });
    },
    (error) => {
      logger.error('DailySchedule', 'Error suscripción rutinas:', error);
      if (onError) onError(error);
    }
  );

  return () => {
    unsubDiets();
    unsubWorkouts();
  };
}
