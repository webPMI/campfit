import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';
import type { Diet } from './dietService';
import type { Workout } from '../trainer/types';
import { hydrateDiet, hydrateWorkout } from '@/lib/shared/hydrationService';

/**
 * Servicio para obtener la agenda diaria combinada del cliente.
 * Combina la dieta y la rutina más reciente hidratadas dinámicamente con el catálogo central.
 */
export function subscribeToDailySchedule(
  clientId: string,
  callback: (schedule: { diets: Diet[]; workouts: Workout[] }) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!clientId) {
    callback({ diets: [], workouts: [] });
    return () => {};
  }

  let diets: Diet[] = [];
  let workouts: Workout[] = [];

  const emitSchedule = () => {
    // Determinar día de la semana (1 = Lunes, ..., 7 = Domingo)
    const currentDayOfWeek = new Date().getDay() || 7;

    const hydratedDiets = diets.map((d) => hydrateDiet(d, 'es', { targetDayIndex: currentDayOfWeek }) as any);
    const hydratedWorkouts = workouts.map(
      (w) => hydrateWorkout(w as any, 'es', { targetDayIndex: currentDayOfWeek }) as any,
    );

    callback({ diets: hydratedDiets, workouts: hydratedWorkouts });
  };

  // Suscripción a la dieta más reciente
  const unsubDiets = onSnapshot(
    query(collection(db, 'diets'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'), limit(1)),
    (snapshot) => {
      diets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Diet);
      emitSchedule();
    },
    (error) => {
      logger.error('DailySchedule', 'Error suscripción dietas:', error);
      if (onError) onError(error);
    },
  );

  // Suscripción a la rutina más reciente
  const unsubWorkouts = onSnapshot(
    query(collection(db, 'workouts'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'), limit(1)),
    (snapshot) => {
      workouts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Workout);
      emitSchedule();
    },
    (error) => {
      logger.error('DailySchedule', 'Error suscripción rutinas:', error);
      if (onError) onError(error);
    },
  );

  return () => {
    unsubDiets();
    unsubWorkouts();
  };
}
