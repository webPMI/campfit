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
  // 🔒 CRÍTICO: where('assignedTrainerId', '==', trainerId) filtra clientes asignados al trainer
  // y cumple con las reglas de seguridad de firestore.rules.
  // 🔒 CRÍTICO: where('role', '==', 'client') asegura que solo se retornen usuarios con rol cliente.
  // 🔒 CRÍTICO: El orden se realiza en memoria sobre createdAt para resiliencia ante documentos con formato mixto/índices.
  const q = query(
    collection(db, 'users'),
    where('assignedTrainerId', '==', trainerId),
    where('role', '==', 'client'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const clients = snapshot.docs
        .map((doc) => {
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
        })
        .sort((a, b) => {
          const timeA = typeof a.createdAt?.toDate === 'function' ? a.createdAt.toDate().getTime() : (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0);
          const timeB = typeof b.createdAt?.toDate === 'function' ? b.createdAt.toDate().getTime() : (typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0);
          return timeB - timeA;
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
