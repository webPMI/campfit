import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';

export interface ProgressLog {
  id: string;
  clientId: string;
  type: 'workout' | 'meal' | 'weight' | 'photo';
  date: Timestamp | Date;
  value: Record<string, unknown>;
  createdAt: Timestamp;
}

export function subscribeToProgress(
  clientId: string,
  type: 'weight' | 'photo',
  callback: (logs: ProgressLog[]) => void,
  limitCount: number = 30,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!clientId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'progress_logs'),
    where('clientId', '==', clientId),
    where('type', '==', type),
    orderBy('date', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgressLog)));
    },
    (error) => {
      logger.error('Progress', 'Error al suscribirse a progreso:', error);
      if (onError) onError(error);
      callback([]);
    }
  );
}

export async function registerWeight(clientId: string, weight: number, notes?: string) {
  if (!clientId || weight == null || weight <= 0) {
    throw new Error('clientId y weight (positivo) son requeridos');
  }

  return addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'weight',
    date: new Date(), // Fecha real del cliente, no serverTimestamp
    value: { weight, notes: notes?.trim() || '' },
    createdAt: serverTimestamp(),
  });
}
