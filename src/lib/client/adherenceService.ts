/**
 * Servicio de adherencia semanal para el cliente.
 * Calcula el % de comidas y entrenamientos completados en los últimos 7 días.
 *
 * @module adherenceService
 */

import {
  collection,
  query,
  where,
  limit,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';

export interface AdherenceStats {
  /** Número de comidas completadas esta semana */
  mealsCompleted: number;
  /** Número de entrenamientos marcados como completados esta semana */
  workoutsCompleted: number;
  /** % de adherencia de comidas (0–100) — requiere pasar totalMealsExpected */
  mealAdherencePercent: number;
  /** Días únicos con al menos 1 comida completada */
  daysWithMeals: number;
  /** Días únicos con un entrenamiento completado */
  daysWithWorkouts: number;
  /** Racha de días consecutivos completando al menos 1 comida o entrenamiento */
  streakDays: number;
}

/**
 * Se suscribe a los stats de adherencia semanal de un cliente.
 * Combina progress_logs (comidas) y workouts (completados) en tiempo real.
 *
 * @param clientId - UID del cliente
 * @param totalMealsPerDay - Número de comidas esperadas por día (para calcular %)
 * @param callback - Recibe las estadísticas actualizadas
 */
export function subscribeToWeeklyAdherence(
  clientId: string,
  totalMealsPerDay: number,
  callback: (stats: AdherenceStats) => void,
): Unsubscribe {
  if (!clientId) {
    callback(emptyStats());
    return () => { };
  }

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  // ─── Subscribe to meal completions ───────────────────────────────────────────
  let mealsData: any[] = [];
  let workoutsData: any[] = [];

  const computeAndEmit = () => {
    const stats = computeStats(mealsData, workoutsData, totalMealsPerDay);
    callback(stats);
  };

  // TODO: PERF - Store unsubscribe return and call in cleanup


  const unsubMeals = onSnapshot(
    query(
      collection(db, 'progress_logs'),
      where('clientId', '==', clientId),
      where('type', '==', 'meal'),
      where('date', '>=', weekAgo),
      limit(100),
    ),
    (snapshot) => {
      try {
        mealsData = snapshot.docs
          .map((d) => d.data())
          .filter((d) => {
            const date = d.date instanceof Date ? d.date : d.date?.toDate?.();
            return date && date >= weekAgo;
          });
        computeAndEmit();
      } catch (err) {
        logger.error('Adherence', 'Error procesando comidas de adherencia:', err);
        callback(emptyStats());
      }
    },
    (error) => {
      logger.error('Adherence', 'Error al suscribirse a comidas de adherencia:', error);
      callback(emptyStats());
    },
  );

  // TODO: PERF - Store unsubscribe return and call in cleanup


  const unsubWorkouts = onSnapshot(
    query(
      collection(db, 'workouts'),
      where('clientId', '==', clientId),
      where('completed', '==', true),
      limit(100),
    ),
    (snapshot) => {
      try {
        workoutsData = snapshot.docs
          .map((d) => d.data())
          .filter((d) => {
            const date = d.completedAt instanceof Date ? d.completedAt : d.completedAt?.toDate?.();
            return date && date >= weekAgo;
          });
        computeAndEmit();
      } catch (err) {
        logger.error('Adherence', 'Error procesando entrenamientos de adherencia:', err);
      }
    },
    (error) => {
      logger.error('Adherence', 'Error al suscribirse a entrenamientos de adherencia:', error);
    },
  );

  return () => {
    unsubMeals();
    unsubWorkouts();
  };
}

function emptyStats(): AdherenceStats {
  return {
    mealsCompleted: 0,
    workoutsCompleted: 0,
    mealAdherencePercent: 0,
    daysWithMeals: 0,
    daysWithWorkouts: 0,
    streakDays: 0,
  };
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0] ?? date.toISOString().substring(0, 10);
}

function computeStats(
  mealsData: any[],
  workoutsData: any[],
  totalMealsPerDay: number,
): AdherenceStats {
  const mealDays = new Set<string>();
  for (const d of mealsData) {
    if (d.value?.completed) {
      const rawDate = d.date instanceof Date ? d.date : d.date?.toDate?.();
      if (rawDate) mealDays.add(toDateString(rawDate));
    }
  }

  const workoutDays = new Set<string>();
  for (const d of workoutsData) {
    const rawDate = d.completedAt instanceof Date ? d.completedAt : d.completedAt?.toDate?.();
    if (rawDate) workoutDays.add(toDateString(rawDate));
  }

  // Compute streak — consecutive days (from today backwards) with activity
  let streakDays = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dayStr = toDateString(day);
    if (mealDays.has(dayStr) || workoutDays.has(dayStr)) {
      streakDays++;
    } else {
      break;
    }
  }

  const mealsCompleted = mealsData.filter((d) => d.value?.completed).length;
  const workoutsCompleted = workoutsData.length;
  const expectedMealsWeek = totalMealsPerDay > 0 ? totalMealsPerDay * 7 : 0;
  const mealAdherencePercent =
    expectedMealsWeek > 0
      ? Math.min(100, Math.round((mealsCompleted / expectedMealsWeek) * 100))
      : mealDays.size > 0
        ? Math.min(100, Math.round((mealDays.size / 7) * 100))
        : 0;

  return {
    mealsCompleted,
    workoutsCompleted,
    mealAdherencePercent,
    daysWithMeals: mealDays.size,
    daysWithWorkouts: workoutDays.size,
    streakDays,
  };
}
