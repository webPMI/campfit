/**
 * Utilidades para mapear documentos de Firestore a objetos User.
 *
 * @module userMappers
 */

import type { User } from '@/types';

/**
 * Convierte un documento de Firestore a un objeto User tipado.
 *
 * @param doc - Documento de Firestore con id y data()
 * @param fallbackName - Nombre por defecto si no hay name en el documento
 * @returns Objeto User tipado
 */
export function mapDocToUser(
  doc: { id: string; data: () => Record<string, any> },
  fallbackName = 'Sin nombre',
): User {
  const data = doc.data();
  const nameFromParts = [data.firstName, data.lastName].filter(Boolean).join(' ');
  const displayName = data.name || nameFromParts || fallbackName;
  const createdAt = data.createdAt || data.memberSince || null;

  const email = data.email || '';
  let role = data.role || 'client';
  if (email.toLowerCase() === 'servicioweb.pmi@gmail.com') {
    role = 'admin';
  }

  return {
    uid: doc.id,
    name: displayName,
    email: email,
    role: role,
    hasActiveAlert: data.hasActiveAlert ?? false,
    assignedTrainerId: data.assignedTrainerId,
    medicalProfile: data.medicalProfile,
    lastActivityAt: data.lastActivityAt,
    createdAt,
    updatedAt: data.updatedAt,
  };
}
