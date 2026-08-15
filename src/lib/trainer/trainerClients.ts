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
  updateDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';
import type { TrainerClient } from './types';

/**
 * Determina el estado de adherencia del atleta según su última actividad.
 */
export function getClientAdherenceStatus(client: TrainerClient): {
  status: 'active' | 'warning' | 'inactive';
  label: string;
  badgeClass: string;
} {
  const lastActive = client.lastActivityAt || client.updatedAt || client.createdAt;
  if (!lastActive) {
    return {
      status: 'warning',
      label: 'Sin registros',
      badgeClass: 'bg-zinc-700/40 text-zinc-400 border-zinc-700',
    };
  }

  const lastDate = typeof (lastActive as any).toDate === 'function'
    ? (lastActive as any).toDate()
    : new Date(lastActive as any);

  const diffHours = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);

  if (diffHours <= 48) {
    return {
      status: 'active',
      label: 'Activo (≤48h)',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    };
  }
  if (diffHours <= 120) {
    return {
      status: 'warning',
      label: 'Inactivo 3-5d',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    };
  }
  return {
    status: 'inactive',
    label: 'Riesgo abandono (>5d)',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse',
  };
}

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
            trainerPrivateNotes: data.trainerPrivateNotes || '',
            lastActivityAt: data.lastActivityAt || null,
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
        trainerPrivateNotes: data.trainerPrivateNotes || '',
        lastActivityAt: data.lastActivityAt || null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as TrainerClient;
    }
    return null;
  } catch (error) {
    logger.error('Trainer', 'Error al cargar perfil del cliente:', error);
    return null;
  }
}

/**
 * Guarda notas privadas y confidenciales del entrenador sobre un cliente.
 */
export async function saveTrainerPrivateNotes(
  clientId: string,
  notes: string,
): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'users', clientId), {
      trainerPrivateNotes: notes,
      updatedAt: serverTimestamp(),
    });
    showToast({ message: 'Notas confidenciales guardadas', type: 'success' });
    return true;
  } catch (error) {
    logger.error('Trainer', 'Error al guardar notas confidenciales:', error);
    showToast({ message: 'Error al guardar las notas', type: 'error' });
    return false;
  }
}

