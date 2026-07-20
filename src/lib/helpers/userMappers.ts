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
  return {
    uid: doc.id,
    name: data.name || fallbackName,
    email: data.email || '',
    role: data.role || 'client',
    hasActiveAlert: data.hasActiveAlert ?? false,
    assignedTrainerId: data.assignedTrainerId,
    medicalProfile: data.medicalProfile,
    lastActivityAt: data.lastActivityAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
