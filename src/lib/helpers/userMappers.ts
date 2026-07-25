/**
 * Helpers para mapear documentos de Firestore a objetos User.
 * Centraliza la lógica de mapeo para evitar duplicación entre servicios.
 *
 * @module userMappers
 */

import type { User } from '@/types';

/**
 * Mapea un documento de Firestore (o cualquier objeto con datos de usuario) a un objeto User.
 * 
 * @param data - Datos del documento de Firestore
 * @param fallbackName - Nombre fallback si no existe en el documento (opcional)
 * @returns Objeto User mapeado
 * 
 * @example
 * const user = mapDocToUser(doc.data(), 'Usuario');
 */
export function mapDocToUser(data: Record<string, unknown>, fallbackName = 'Sin nombre'): User {
  return {
    uid: (data.uid as string) || '',
    name: (data.name as string) || fallbackName,
    email: (data.email as string) || '',
    role: (data.role as User['role']) || 'client',
    hasActiveAlert: (data.hasActiveAlert as boolean) ?? false,
    assignedTrainerId: data.assignedTrainerId as string | undefined,
    medicalProfile: data.medicalProfile as User['medicalProfile'] | undefined,
    lastActivityAt: data.lastActivityAt as User['lastActivityAt'],
    createdAt: data.createdAt as User['createdAt'],
    updatedAt: data.updatedAt as User['updatedAt'],
  };
}

/**
 * Mapea un usuario de Firebase Auth + perfil de Firestore a un objeto User.
 * 
 * @param firebaseUser - Usuario de Firebase Auth
 * @param profile - Datos del perfil de Firestore
 * @returns Objeto User mapeado
 * 
 * @example
 * const user = mapFirebaseUserToUser(credential.user, userDoc.data());
 */
export function mapFirebaseUserToUser(
  firebaseUser: { uid: string; email?: string | null; displayName?: string | null },
  profile: Record<string, unknown>
): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: (profile.name as string) || firebaseUser.displayName || 'Usuario',
    role: (profile.role as User['role']) || 'client',
    hasActiveAlert: (profile.hasActiveAlert as boolean) ?? false,
    assignedTrainerId: profile.assignedTrainerId as string | undefined,
    medicalProfile: profile.medicalProfile as User['medicalProfile'] | undefined,
    lastActivityAt: profile.lastActivityAt as User['lastActivityAt'],
    createdAt: profile.createdAt as User['createdAt'],
    updatedAt: profile.updatedAt as User['updatedAt'],
  };
}