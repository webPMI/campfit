/**
 * Servicios de datos para dietas del entrenador.
 *
 * @module trainerDiets
 */

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  limit,
  startAfter,
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';
import type { TrainerDiet } from './types';

/**
 * Se suscribe a las dietas de un entrenador.
 * @param trainerId - ID del entrenador
 * @param callback - Función a ejecutar con las dietas
 * @param options - Opciones de paginación
 * @param options.limit - Número máximo de dietas (default: 50, max: 100)
 * @param options.startAfter - Documento desde el cual empezar (para paginación)
 */
export function subscribeToDietsByTrainer(
  trainerId: string,
  callback: (diets: TrainerDiet[]) => void,
  options?: { limit?: number; startAfter?: any },
): Unsubscribe {
  const limitCount = Math.min(options?.limit || 50, 100);

  const constraints: any[] = [
    where('trainerId', '==', trainerId),
    orderBy('createdAt', 'desc'),
  ];

  if (options?.startAfter) {
    constraints.push(startAfter(options.startAfter));
  }

  constraints.push(limit(limitCount));

  const q = query(collection(db, 'diets'), ...constraints);
  let fallbackUnsub: Unsubscribe | null = null;

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      const diets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerDiet[];
      callback(diets);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a dietas (fallback sin orderBy):', error);
      const fallbackQ = query(collection(db, 'diets'), where('trainerId', '==', trainerId));
      fallbackUnsub = onSnapshot(fallbackQ, (snapshot) => {
        const diets = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TrainerDiet[];
        diets.sort((a, b) => {
          const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : 0;
          const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : 0;
          return tB - tA;
        });
        callback(diets);
      });
    },
  );

  return () => {
    unsub();
    fallbackUnsub?.();
  };
}

/**
 * Se suscribe a las dietas de un cliente específico.
 * @param clientId - ID del cliente
 * @param callback - Función a ejecutar con las dietas
 * @param options - Opciones de paginación
 * @param options.limit - Número máximo de dietas (default: 50, max: 100)
 * @param options.startAfter - Documento desde el cual empezar (para paginación)
 */
export function subscribeToDietsByClient(
  clientId: string,
  callback: (diets: TrainerDiet[]) => void,
  options?: { limit?: number; startAfter?: any },
): Unsubscribe {
  const limitCount = Math.min(options?.limit || 50, 100);

  const constraints: any[] = [
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  ];

  if (options?.startAfter) {
    constraints.push(startAfter(options.startAfter));
  }

  constraints.push(limit(limitCount));

  const q = query(collection(db, 'diets'), ...constraints);
  let fallbackUnsub: Unsubscribe | null = null;

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      const diets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerDiet[];
      callback(diets);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a dietas del cliente (fallback sin orderBy):', error);
      const fallbackQ = query(collection(db, 'diets'), where('clientId', '==', clientId));
      fallbackUnsub = onSnapshot(fallbackQ, (snapshot) => {
        const diets = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TrainerDiet[];
        diets.sort((a, b) => {
          const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : 0;
          const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : 0;
          return tB - tA;
        });
        callback(diets);
      });
    },
  );

  return () => {
    unsub();
    fallbackUnsub?.();
  };
}

/**
 * Crea una nueva dieta.
 */
export async function createDiet(data: Omit<TrainerDiet, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'diets'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    logger.info('Trainer', `Dieta creada: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logger.error('Trainer', 'Error al crear dieta:', error);
    showToast({ message: 'Error al crear la dieta', type: 'error' });
    return null;
  }
}

/**
 * Actualiza una dieta existente.
 */
export async function updateDiet(id: string, data: Partial<TrainerDiet>): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'diets', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    logger.error('Trainer', 'Error al actualizar dieta:', error);
    showToast({ message: 'Error al actualizar la dieta', type: 'error' });
    return false;
  }
}

/**
 * Elimina una dieta.
 */
export async function deleteDiet(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'diets', id));
    return true;
  } catch (error) {
    logger.error('Trainer', 'Error al eliminar dieta:', error);
    showToast({ message: 'Error al eliminar la dieta', type: 'error' });
    return false;
  }
}
