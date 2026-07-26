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
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
  onSnapshot,
  type Unsubscribe,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';
import type { AdminUser } from './types';

function getTime(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return new Date(val).getTime() || 0;
  if (val && typeof val.toDate === 'function') return val.toDate().getTime();
  if (val && typeof val.seconds === 'number') return val.seconds * 1000;
  return 0;
}

function mapDocToAdminUser(doc: { id: string; data: () => Record<string, any> }): AdminUser {
  const data = doc.data();
  const nameParts = [data.firstName, data.lastName].filter(Boolean).join(' ');
  const name = data.name || nameParts || 'Sin nombre';
  const createdAt = data.createdAt || data.memberSince || null;

  return {
    uid: doc.id,
    name,
    email: data.email || '',
    role: data.role || 'client',
    assignedTrainerId: data.assignedTrainerId,
    hasActiveAlert: data.hasActiveAlert ?? false,
    isBlocked: data.isBlocked ?? false,
    blockedAt: data.blockedAt,
    createdAt,
    updatedAt: data.updatedAt,
  } as AdminUser;
}

/**
 * Se suscribe a todos los usuarios, ordenados por fecha de creación descendente.
 */
export function subscribeToUsers(
  callback: (users: AdminUser[]) => void,
): Unsubscribe {
  const q = query(collection(db, 'users'));
  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map(mapDocToAdminUser);
      users.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
      callback(users);
    },
    (error) => {
      logger.error('Admin', 'Error al suscribirse a usuarios:', error);
      showToast({ message: 'Error al cargar usuarios', type: 'error' });
    },
  );
}

/**
 * Se suscribe a usuarios filtrados por rol.
 */
export function subscribeToUsersByRole(
  role: string,
  callback: (users: AdminUser[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'users'),
    where('role', '==', role),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map(mapDocToAdminUser);
      users.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
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
export function subscribeToCollectionCount(
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
  const q = query(collection(db, 'users'));
  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map(mapDocToAdminUser);
      users.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
      callback(users.slice(0, limitCount));
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
    const countSnap = await getCountFromServer(q);
    return countSnap.data().count;
  } catch (error) {
    logger.error('Admin', 'Error al contar clientes del trainer:', error);
    return 0;
  }
}

export interface PaginatedResult<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot | null;
  firstDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
  totalCount: number;
}

/**
 * Obtiene usuarios paginados con soporte para filtro por rol y conteo eficiente en servidor.
 */
export async function getPaginatedUsers(options: {
  pageSize?: number;
  role?: string;
  lastDoc?: QueryDocumentSnapshot | null;
}): Promise<PaginatedResult<AdminUser>> {
  const pageSize = options.pageSize || 20;
  const constraints: QueryConstraint[] = [];

  if (options.role && options.role !== 'all') {
    constraints.push(where('role', '==', options.role));
  }

  if (options.lastDoc) {
    constraints.push(startAfter(options.lastDoc));
  }

  constraints.push(limit(pageSize));

  const q = query(collection(db, 'users'), ...constraints);

  let totalCount = 0;
  try {
    const countQuery = options.role && options.role !== 'all'
      ? query(collection(db, 'users'), where('role', '==', options.role))
      : query(collection(db, 'users'));
    const countSnap = await getCountFromServer(countQuery);
    totalCount = countSnap.data().count;
  } catch (err) {
    logger.warn('Admin', 'Error al obtener conteo de usuarios desde servidor:', err);
  }

  const snapshot = await getDocs(q);
  const items = snapshot.docs.map(mapDocToAdminUser);
  items.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));

  const lastVisible = snapshot.docs.length > 0 ? (snapshot.docs[snapshot.docs.length - 1] ?? null) : null;
  const firstVisible = snapshot.docs.length > 0 ? (snapshot.docs[0] ?? null) : null;

  return {
    items,
    lastDoc: lastVisible,
    firstDoc: firstVisible,
    hasMore: snapshot.docs.length === pageSize,
    totalCount,
  };
}
