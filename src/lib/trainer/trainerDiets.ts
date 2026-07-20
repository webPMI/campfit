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
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';
import type { TrainerDiet } from './types';

/**
 * Se suscribe a las dietas de un entrenador.
 */
export function subscribeToDietsByTrainer(
  trainerId: string,
  callback: (diets: TrainerDiet[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'diets'),
    where('trainerId', '==', trainerId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const diets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerDiet[];
      callback(diets);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a dietas:', error);
      showToast({ message: 'Error al cargar dietas', type: 'error' });
    },
  );
}

/**
 * Se suscribe a las dietas de un cliente específico.
 */
export function subscribeToDietsByClient(
  clientId: string,
  callback: (diets: TrainerDiet[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'diets'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const diets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerDiet[];
      callback(diets);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a dietas del cliente:', error);
    },
  );
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
