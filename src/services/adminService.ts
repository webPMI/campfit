/**
 * Servicio de administración.
 * Centraliza las operaciones de gestión de usuarios para el panel admin.
 *
 * Uso:
 *   import { adminService } from '@/services/adminService';
 *   const users = await adminService.getAllUsers();
 */

import { collection, getDocs, query, orderBy, limit, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';
import { mapDocToUser } from '@/lib/helpers/userMappers';

export const adminService = {
  /**
   * Obtener todos los usuarios registrados.
   *
   * @param maxResults - Número máximo de usuarios a obtener (default: 100)
   * @returns Lista de usuarios ordenados por fecha de creación descendente
   */
  async getAllUsers(maxResults = 100): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(maxResults),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapDocToUser(d));
  },

  /**
   * Obtener usuarios por rol.
   *
   * @param role - Rol a filtrar ('admin' | 'trainer' | 'client')
   * @param maxResults - Número máximo de usuarios a obtener (default: 100)
   * @returns Lista de usuarios del rol especificado
   */
  async getUsersByRole(role: User['role'], maxResults = 100): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', role),
      orderBy('createdAt', 'desc'),
      limit(maxResults),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapDocToUser(d));
  },

  /**
   * Actualizar el rol de un usuario.
   *
   * @param uid - ID del usuario
   * @param newRole - Nuevo rol a asignar
   */
  async updateUserRole(uid: string, newRole: User['role']): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
      role: newRole,
      updatedAt: new Date(),
    });
  },

  /**
   * Deshabilitar un usuario (marca hasActiveAlert como true).
   *
   * @param uid - ID del usuario a deshabilitar
   */
  async disableUser(uid: string): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
      hasActiveAlert: true,
      updatedAt: new Date(),
    });
  },

  /**
   * Obtener estadísticas del dashboard admin.
   *
   * @returns Objeto con totales de usuarios, trainers, clients y alertas activas
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
