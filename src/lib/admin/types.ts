/**
 * Tipos compartidos para el panel de administración.
 *
 * @module adminTypes
 */

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
  assignedTrainerId?: string;
  hasActiveAlert?: boolean;
  isBlocked?: boolean;
  blockedAt?: { toDate: () => Date } | null;
  createdAt?: { toDate: () => Date } | null;
  updatedAt?: { toDate: () => Date } | null;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'trainer' | 'client';
  assignedTrainerId?: string;
}
