/**
 * Suscripciones en tiempo real a datos de Firestore para el panel de administración.
 *
 * @module adminSubscriptions
 */

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';
import type { AdminUser } from './types';

/** Tipo simplificado para uso en dropdowns de asignación */
export type TrainerOption = { uid: string; name: string; role: string };


/**
 * Se suscribe a los usuarios más recientes, ordenados por fecha de creación descendente.
 * Limitado a 50 documentos para evitar lecturas masivas de Firestore.
 */
export function subscribeToUsers(
  callback: (users: AdminUser[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name || 'Sin nombre',
          email: data.email || '',
          role: data.role || 'client',
          assignedTrainerId: data.assignedTrainerId,
          hasActiveAlert: data.hasActiveAlert ?? false,
          isBlocked: data.isBlocked ?? false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          medicalProfileComplete: !!data.medicalProfile,
        } as AdminUser;
      });
      callback(users);
    },
    (error) => {
      logger.error('Admin', 'Error al suscribirse a usuarios:', error);
      showToast({ message: 'Error al cargar usuarios', type: 'error' });
    },
  );
}

/**
 * Se suscribe a usuarios filtrados por rol, limitado a 50 documentos.
 * @param role - Rol a filtrar ('admin' | 'trainer' | 'client')
 * @param callback - Función que recibe los usuarios filtrados
 */
export function subscribeToUsersByRole(
  role: string,
  callback: (users: AdminUser[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'users'),
    where('role', '==', role),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name || 'Sin nombre',
          email: data.email || '',
          role: data.role || 'client',
          assignedTrainerId: data.assignedTrainerId,
          hasActiveAlert: data.hasActiveAlert ?? false,
          isBlocked: data.isBlocked ?? false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          medicalProfileComplete: !!data.medicalProfile,
        } as AdminUser;
      });
      callback(users);
    },
    (error) => {
      logger.error('Admin', `Error al suscribirse a usuarios con rol ${role}:`, error);
      showToast({ message: 'Error al cargar usuarios', type: 'error' });
    },
  );
}

/**
 * Se suscribe al conteo de documentos en una colección.
 */
export function // TODO: PERF - Replace with firestore count() aggregation
  subscribeToCollectionCount(
    collectionName: string,
    callback: (count: number) => void,
  ): Unsubscribe {
  const q = query(collection(db, collectionName));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      logger.error('Admin', `Error al contar ${collectionName}:`, error);
    },
  );
}

/**
 * Se suscribe a los usuarios más recientes.
 */
export function subscribeToRecentUsers(
  limitCount: number,
  callback: (users: AdminUser[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name || 'Sin nombre',
          email: data.email || '',
          role: data.role || 'client',
          assignedTrainerId: data.assignedTrainerId,
          hasActiveAlert: data.hasActiveAlert ?? false,
          isBlocked: data.isBlocked ?? false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          medicalProfileComplete: !!data.medicalProfile,
        } as AdminUser;
      });
      callback(users);
    },
    (error) => {
      logger.error('Admin', 'Error al suscribirse a usuarios recientes:', error);
    },
  );
}

/**
 * Obtiene el número de clientes asignados a un entrenador.
 */
export async function getTrainerClientCount(trainerId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'users'),
      where('assignedTrainerId', '==', trainerId),
      where('role', '==', 'client'),
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    logger.error('Admin', 'Error al contar clientes del trainer:', error);
    return 0;
  }
}

/**
 * 🚨 CRITICAL: Esta función alimenta el dropdown de asignación de trainers en admin/users.astro
 * Se suscribe a todos los usuarios que pueden actuar como entrenadores:
 * usuarios con rol 'trainer' y usuarios con rol 'admin'.
 *
 * Firestore no soporta OR en where(), así que se usan dos queries en paralelo
 * cuyos resultados se fusionan y ordenan por nombre.
 *
 * @param callback - Función que recibe la lista combinada de trainers + admins
 * @returns Función de limpieza que cancela ambas suscripciones
 *
 * @protection NO ELIMINAR orderBy('name', 'asc') - Es crítico para el ordenamiento del dropdown.
 * @protection NO ELIMINAR el fallback sin orderBy - Maneja el caso donde el índice compuesto está en creación.
 */
export function subscribeToTrainers(
  callback: (trainers: TrainerOption[]) => void,
): Unsubscribe {
  const map = new Map<string, TrainerOption>();

  function emit(): void {
    const sorted = Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'es'),
    );
    callback(sorted);
  }

  function makeQuery(role: 'trainer' | 'admin'): Unsubscribe {
    const qWithOrder = query(
      collection(db, 'users'),
      where('role', '==', role),
      orderBy('name', 'asc'),
    );

    let unsub: Unsubscribe = () => { };

    const handleSnapshot = (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === 'removed') {
          map.delete(change.doc.id);
        } else {
          const data = change.doc.data();
          map.set(change.doc.id, {
            uid: change.doc.id,
            name: data.name || 'Sin nombre',
            role,
          });
        }
      });
      emit();
    };

    unsub = onSnapshot(
      qWithOrder,
      handleSnapshot,
      (error) => {
        // Fallback si el índice compuesto está en proceso de creación en Firebase Console
        logger.warn('Admin', `Índice compuesto en proceso para ${role}s, usando fallback sin ordenar en Firestore:`, error.message);
        const qFallback = query(
          collection(db, 'users'),
          where('role', '==', role),
        );
        unsub = onSnapshot(qFallback, handleSnapshot, (err) => {
          logger.error('Admin', `Error al suscribirse a ${role}s:`, err);
        });
      },
    );

    return () => unsub();
  }

  const unsubTrainers = makeQuery('trainer');
  const unsubAdmins = makeQuery('admin');

  return () => {
    unsubTrainers();
    unsubAdmins();
  };
}

/**
 * Se suscribe a la colección `workouts` y emite un mapa de clientId -> número de rutinas.
 * Permite pintar el chip de "Rutinas" en la vista unificada de usuarios sin lecturas por cliente.
 */
export function subscribeToWorkoutCounts(
  callback: (counts: Map<string, number>) => void,
): Unsubscribe {
  const q = query(collection(db, 'workouts'));
  return onSnapshot(
    q,
    (snapshot) => {
      const counts = new Map<string, number>();
      snapshot.forEach((doc) => {
        const data = doc.data() as { clientId?: string };
        if (!data.clientId) return;
        counts.set(data.clientId, (counts.get(data.clientId) ?? 0) + 1);
      });
      callback(counts);
    },
    (error) => {
      logger.error('Admin', 'Error al contar workouts:', error);
    },
  );
}

/**
 * Se suscribe a la colección `diets` y emite un mapa de clientId -> número de dietas.
 * Permite pintar el chip de "Dietas" en la vista unificada de usuarios sin lecturas por cliente.
 */
export function subscribeToDietCounts(
  callback: (counts: Map<string, number>) => void,
): Unsubscribe {
  const q = query(collection(db, 'diets'));
  return onSnapshot(
    q,
    (snapshot) => {
      const counts = new Map<string, number>();
      snapshot.forEach((doc) => {
        const data = doc.data() as { clientId?: string };
        if (!data.clientId) return;
        counts.set(data.clientId, (counts.get(data.clientId) ?? 0) + 1);
      });
      callback(counts);
    },
    (error) => {
      logger.error('Admin', 'Error al contar diets:', error);
    },
  );
}

