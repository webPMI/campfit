/**
 * Servicio de administración.
 * Centraliza las operaciones de gestión de usuarios para el panel admin.
 *
 * Uso:
 *   import { adminService } from '@/services/adminService';
 *   const users = await adminService.getAllUsers();
 */

import { collection, getDocs, query, orderBy, limit, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';

export const adminService = {
  /**
   * Obtener todos los usuarios registrados.
   */
  async getAllUsers(maxResults = 100): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(maxResults),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        name: data.name || 'Sin nombre',
        email: data.email || '',
        role: data.role || 'client',
        hasActiveAlert: data.hasActiveAlert ?? false,
        assignedTrainerId: data.assignedTrainerId,
        medicalProfile: data.medicalProfile,
        lastActivityAt: data.lastActivityAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as User;
    });
  },

  /**
   * Obtener usuarios por rol.
   */
  async getUsersByRole(role: User['role'], maxResults = 100): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', role),
      orderBy('createdAt', 'desc'),
      limit(maxResults),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        name: data.name || 'Sin nombre',
        email: data.email || '',
        role: data.role || 'client',
        hasActiveAlert: data.hasActiveAlert ?? false,
        assignedTrainerId: data.assignedTrainerId,
        medicalProfile: data.medicalProfile,
        lastActivityAt: data.lastActivityAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as User;
    });
  },

  /**
   * Actualizar el rol de un usuario.
   */
  async updateUserRole(uid: string, newRole: User['role']): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
      role: newRole,
      updatedAt: new Date(),
    });
  },

  /**
   * Eliminar un usuario (marca como deshabilitado).
   */
  async disableUser(uid: string): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
      hasActiveAlert: true,
      updatedAt: new Date(),
    });
  },

  /**
   * Obtener estadísticas del dashboard admin.
   */
  async getStats(): Promise<{ totalUsers: number; totalTrainers: number; totalClients: number; activeAlerts: number }> {
    const snapshot = await getDocs(collection(db, 'users'));
    let totalUsers = 0;
    let totalTrainers = 0;
    let totalClients = 0;
    let activeAlerts = 0;

    snapshot.docs.forEach((d) => {
      const data = d.data();
      totalUsers++;
      if (data.role === 'trainer') totalTrainers++;
      if (data.role === 'client') totalClients++;
      if (data.hasActiveAlert) activeAlerts++;
    });

    return { totalUsers, totalTrainers, totalClients, activeAlerts };
  },
};
