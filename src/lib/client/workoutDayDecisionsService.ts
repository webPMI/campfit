/**
 * Servicio de decisiones de días para rutinas del cliente.
 *
 * Permite al cliente:
 * 1. Reprogramar un día de entrenamiento a otro día libre
 * 2. Saltar un día de entrenamiento con motivo
 *
 * El entrenador puede ver estas decisiones para entender el patrón de adherencia.
 *
 * @module client/workoutDayDecisionsService
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import type { WorkoutDayDecision } from '@/lib/client/workoutService';
import { logger } from '@/lib/shared/logger';

const DECISIONS_COLLECTION = 'workout_day_decisions';

/**
 * Suscripción reactiva a las decisiones de un workout del cliente.
 */
export function subscribeToWorkoutDayDecisions(
  workoutId: string,
  clientId: string,
  callback: (decisions: WorkoutDayDecision[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, DECISIONS_COLLECTION),
    where('workoutId', '==', workoutId),
    where('clientId', '==', clientId),
    orderBy('decidedAt', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const decisions = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as WorkoutDayDecision[];
      callback(decisions);
    },
    (error) => {
      logger.error('WorkoutDayDecisions', 'Error al suscribirse:', error);
      callback([]);
    },
  );
}

/**
 * Guarda una decisión de día (reprogramar o saltar).
 */
export async function saveWorkoutDayDecision(
  data: Omit<WorkoutDayDecision, 'id' | 'decidedAt'>,
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, DECISIONS_COLLECTION), {
      ...data,
      decidedAt: serverTimestamp(),
    });
    logger.info('WorkoutDayDecisions', `Decisión guardada: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logger.error('WorkoutDayDecisions', 'Error al guardar decisión:', error);
    return null;
  }
}

/**
 * Elimina una decisión (rollback / revertir).
 */
export async function removeWorkoutDayDecision(
  decisionId: string,
): Promise<boolean> {
  try {
    await deleteDoc(doc(db, DECISIONS_COLLECTION, decisionId));
    logger.info('WorkoutDayDecisions', `Decisión eliminada: ${decisionId}`);
    return true;
  } catch (error) {
    logger.error('WorkoutDayDecisions', 'Error al eliminar decisión:', error);
    return false;
  }
}
