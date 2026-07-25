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
  limit,
  startAfter,
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';
import type { TrainerClient } from './types';

function getTime(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return new Date(val).getTime() || 0;
  if (val && typeof val.toDate === 'function') return val.toDate().getTime();
  if (val && typeof val.seconds === 'number') return val.seconds * 1000;
  return 0;
}

/**
 * Se suscribe a los clientes asignados a un entrenador.
 * @param trainerId - ID del entrenador
 * @param callback - Función a ejecutar con los clientes
 * @param options - Opciones de paginación
 * @param options.limit - Número máximo de clientes (default: 50, max: 100)
 * @param options.startAfter - Documento desde el cual empezar (para paginación)
 */
export function subscribeToClients(
  trainerId: string,
  callback: (clients: TrainerClient[]) => void,
  options?: { limit?: number; startAfter?: any },
): Unsubscribe {
  const limitCount = Math.min(options?.limit || 50, 100);

  const constraints: any[] = [
    where('assignedTrainerId', '==', trainerId),
    where('role', '==', 'client'),
    orderBy('createdAt', 'desc'),
  ];

  if (options?.startAfter) {
    constraints.push(startAfter(options.startAfter));
  }

  constraints.push(limit(limitCount));

  const q = query(collection(db, 'users'), ...constraints);
  return onSnapshot(
    q,
    (snapshot) => {
      const clients = snapshot.docs.map((doc) => {
        const data = doc.data();
        const nameParts = [data.firstName, data.lastName].filter(Boolean).join(' ');
        const name = data.name || nameParts || 'Sin nombre';
        const createdAt = data.createdAt || data.memberSince || null;

        return {
          uid: doc.id,
          name,
          email: data.email || '',
          role: 'client' as const,
          assignedTrainerId: data.assignedTrainerId,
          hasActiveAlert: data.hasActiveAlert ?? false,
          medicalProfile: data.medicalProfile,
          createdAt,
          updatedAt: data.updatedAt,
        } as TrainerClient;
      });

      clients.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
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
