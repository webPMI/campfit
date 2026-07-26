/**
 * Servicios de datos para clientes del entrenador.
 *
 * @module trainerClients
 */

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';
import type { TrainerClient } from './types';

/**
 * Se suscribe a los clientes asignados a un entrenador.
 */
export function subscribeToClients(
  trainerId: string,
  callback: (clients: TrainerClient[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'users'),
    where('assignedTrainerId', '==', trainerId),
    where('role', '==', 'client'),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const clients = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name || 'Sin nombre',
          email: data.email || '',
          role: 'client' as const,
          assignedTrainerId: data.assignedTrainerId,
          hasActiveAlert: data.hasActiveAlert ?? false,
          medicalProfile: data.medicalProfile,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as TrainerClient;
      });
      callback(clients);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a clientes:', error);
      showToast({ message: 'Error al cargar clientes', type: 'error' });
    },
  );
}

/**
 * Obtiene el perfil de un cliente por su UID.
 */
export async function getClientProfile(clientId: string): Promise<TrainerClient | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', clientId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        name: data.name || 'Sin nombre',
        email: data.email || '',
        role: data.role as 'client' | 'admin',
        assignedTrainerId: data.assignedTrainerId,
        hasActiveAlert: data.hasActiveAlert ?? false,
        medicalProfile: data.medicalProfile,
        createdAt: data.createdAt,
      } as TrainerClient;
    }
    return null;
  } catch (error) {
    logger.error('Trainer', 'Error al cargar perfil del cliente:', error);
    return null;
  }
}
