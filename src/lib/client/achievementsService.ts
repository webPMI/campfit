/**
 * Servicio de logros y badges para el cliente.
 * Comprueba automáticamente si el cliente ha desbloqueado nuevos logros
 * al completar entrenamientos, mantener rachas y seguir la dieta.
 *
 * @module achievementsService
 */

import {
  collection,
  query,
  where,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';

export type AchievementType =
  | 'first_workout'
  | 'first_meal'
  | 'streak_3_days'
  | 'streak_7_days'
  | 'streak_14_days'
  | 'workouts_5'
  | 'workouts_10'
  | 'diet_adherence_week'
  | 'meals_50';

export interface Achievement {
  id: string;
  clientId: string;
  type: AchievementType;
  unlockedAt: any; // Firestore Timestamp
  metadata?: Record<string, any>;
}

export interface AchievementDefinition {
  type: AchievementType;
  title: string;
  description: string;
  emoji: string;
  color: string; // Tailwind color hint
}

export const ACHIEVEMENT_DEFINITIONS: Record<AchievementType, AchievementDefinition> = {
  first_workout: {
    type: 'first_workout',
    title: '¡Primer Entrenamiento!',
    description: 'Completaste tu primer entrenamiento.',
    emoji: '🏋️',
    color: 'emerald',
  },
  first_meal: {
    type: 'first_meal',
    title: '¡Primera Comida!',
    description: 'Registraste tu primera comida completada.',
    emoji: '🍽️',
    color: 'orange',
  },
  streak_3_days: {
    type: 'streak_3_days',
    title: '3 Días Seguidos',
    description: 'Mantuviste actividad 3 días consecutivos.',
    emoji: '🔥',
    color: 'amber',
  },
  streak_7_days: {
    type: 'streak_7_days',
    title: '¡Racha Semanal!',
    description: 'Completaste actividad 7 días seguidos.',
    emoji: '⚡',
    color: 'yellow',
  },
  streak_14_days: {
    type: 'streak_14_days',
    title: '2 Semanas Imparable',
    description: '14 días consecutivos de actividad. ¡Increíble!',
    emoji: '🌟',
    color: 'purple',
  },
  workouts_5: {
    type: 'workouts_5',
    title: '5 Entrenamientos',
    description: 'Completaste 5 entrenamientos en total.',
    emoji: '💪',
    color: 'blue',
  },
  workouts_10: {
    type: 'workouts_10',
    title: '10 Entrenamientos',
    description: 'Completaste 10 entrenamientos. ¡Dedicación máxima!',
    emoji: '🏆',
    color: 'gold',
  },
  diet_adherence_week: {
    type: 'diet_adherence_week',
    title: 'Semana Perfecta de Dieta',
    description: 'Completaste comidas todos los días de la semana.',
    emoji: '🥗',
    color: 'green',
  },
  meals_50: {
    type: 'meals_50',
    title: '50 Comidas',
    description: 'Registraste 50 comidas completadas.',
    emoji: '🎖️',
    color: 'rose',
  },
};

/**
 * Comprueba y otorga logros al cliente basándose en su actividad.
 * Debe llamarse después de completar un workout o marcar una comida.
 *
 * @param clientId - UID del cliente
 * @param stats - Estadísticas de adherencia actuales
 */
export async function checkAndGrantAchievements(
  clientId: string,
  stats: {
    streakDays: number;
    workoutsCompleted: number;
    mealsCompleted: number;
    daysWithMeals: number;
  },
): Promise<AchievementType[]> {
  if (!clientId) return [];

  try {
    // Get already-unlocked achievements
    const existing = await getDocs(
      query(collection(db, 'achievements'), where('clientId', '==', clientId)),
    );
    const unlocked = new Set(existing.docs.map((d) => d.data().type as AchievementType));
    const newlyGranted: AchievementType[] = [];

    const grant = async (type: AchievementType, metadata?: Record<string, any>) => {
      if (unlocked.has(type)) return;
      const id = `${clientId}_${type}`;
      await setDoc(doc(db, 'achievements', id), {
        id,
        clientId,
        type,
        unlockedAt: serverTimestamp(),
        metadata: metadata || {},
      });
      newlyGranted.push(type);
      logger.info('Achievements', `Logro desbloqueado: ${type}`);
    };

    // Check conditions
    if (stats.workoutsCompleted >= 1) await grant('first_workout');
    if (stats.mealsCompleted >= 1) await grant('first_meal');
    if (stats.streakDays >= 3) await grant('streak_3_days');
    if (stats.streakDays >= 7) await grant('streak_7_days');
    if (stats.streakDays >= 14) await grant('streak_14_days');
    if (stats.workoutsCompleted >= 5) await grant('workouts_5');
    if (stats.workoutsCompleted >= 10) await grant('workouts_10');
    if (stats.daysWithMeals >= 7) await grant('diet_adherence_week');
    if (stats.mealsCompleted >= 50) await grant('meals_50');

    return newlyGranted;
  } catch (error) {
    logger.error('Achievements', 'Error al comprobar logros:', error);
    return [];
  }
}

/**
 * Se suscribe a los logros de un cliente en tiempo real.
 */
export function subscribeToAchievements(
  clientId: string,
  callback: (achievements: Achievement[]) => void,
): Unsubscribe {
  if (!clientId) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, 'achievements'), where('clientId', '==', clientId));
  return onSnapshot(
    q,
    (snapshot) => {
      const achievements = snapshot.docs.map((d) => d.data() as Achievement);
      achievements.sort((a, b) => {
        const tA = a.unlockedAt?.toMillis?.() || 0;
        const tB = b.unlockedAt?.toMillis?.() || 0;
        return tB - tA;
      });
      callback(achievements);
    },
    (error) => {
      logger.error('Achievements', 'Error al suscribirse a logros:', error);
      callback([]);
    },
  );
}
