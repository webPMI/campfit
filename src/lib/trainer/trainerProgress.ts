/**
 * Servicios de datos para progreso de clientes del entrenador.
 *
 * @module trainerProgress
 */

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import type { ProgressLog } from './types';

/**
 * Se suscribe a los registros de progreso de un cliente.
 */
export function subscribeToClientProgress(
  clientId: string,
  callback: (logs: ProgressLog[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'progress_logs'),
    where('clientId', '==', clientId),
    orderBy('date', 'desc'),
    limit(30),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const logs: ProgressLog[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          clientId: data.clientId || '',
          date: data.date || null,
          weight: data.weight,
          calories: data.calories,
          rpe: data.rpe,
          notes: data.notes,
          createdAt: data.createdAt,
        } as ProgressLog;
      });
      callback(logs);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a progreso:', error);
    },
  );
}
