import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';

export interface ProgressLog {
  id: string;
  clientId: string;
  type: 'workout' | 'meal' | 'weight' | 'photo' | 'checklist';
  date: Timestamp | Date;
  value: Record<string, unknown>;
  createdAt: Timestamp;
}

export function subscribeToProgress(
  clientId: string,
  type: 'weight' | 'photo' | 'checklist',
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
    date: new Date(),
    value: { weight, notes: notes?.trim() || '' },
    createdAt: serverTimestamp(),
  });
}

/**
 * Registra una foto de evolución corporal subida (almacenada en Cloudflare R2 o previsualización).
 */
export async function registerProgressPhoto(
  clientId: string,
  photoUrl: string,
  angle: 'front' | 'side' | 'back',
  notes?: string
) {
  if (!clientId || !photoUrl) {
    throw new Error('clientId y photoUrl son requeridos');
  }

  return addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'photo',
    date: new Date(),
    value: {
      photoUrl,
      angle,
      notes: notes?.trim() || '',
      storageProvider: 'cloudflare_r2',
    },
    createdAt: serverTimestamp(),
  });
}

/**
 * Registra el resultado del checklist diario de hábitos y estado de ánimo del cliente.
 */
export async function registerDailyChecklist(
  clientId: string,
  checklist: {
    waterMet: boolean;
    dietMet: boolean;
    workoutMet: boolean;
    sleepHours: number;
    stepsCount: number;
    mood: 'excellent' | 'good' | 'neutral' | 'tired';
    notes?: string;
  }
) {
  if (!clientId) {
    throw new Error('clientId es requerido');
  }

  return addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'checklist',
    date: new Date(),
    value: checklist,
    createdAt: serverTimestamp(),
  });
}

/**
 * Elimina un registro o foto de evolución de Firestore.
 */
export async function deleteProgressLog(logId: string): Promise<boolean> {
  if (!logId) return false;
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'progress_logs', logId));
    logger.info('Progress', `Log de progreso eliminado: ${logId}`);
    return true;
  } catch (error) {
    logger.error('Progress', `Error al eliminar log ${logId}:`, error);
    throw error;
  }
}
