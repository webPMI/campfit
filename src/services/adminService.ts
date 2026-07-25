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
import { mapDocToUser } from '@/lib/helpers/userMappers';

export const adminService = {
  /**
    * Obtiene todos los usuarios registrados en la base de datos.
    * 
    * @param maxResults - Número máximo de usuarios a obtener (por defecto 100)
    * @returns Promise que resuelve con un array de usuarios
    * 
    * @example
    * const users = await adminService.getAllUsers(50);
    */
  async getAllUsers(maxResults = 100): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(maxResults),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapDocToUser(d.data(), 'Sin nombre'));
  },

  /**
   * Obtiene usuarios filtrados por su rol.
   * 
   * @param role - Rol del usuario a filtrar ('admin', 'trainer', o 'client')
   * @param maxResults - Número máximo de usuarios a obtener (por defecto 100)
   * @returns Promise que resuelve con un array de usuarios del rol especificado
   * 
   * @example
   * const trainers = await adminService.getUsersByRole('trainer', 20);
   */
  async getUsersByRole(role: User['role'], maxResults = 100): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', role),
      orderBy('createdAt', 'desc'),
      limit(maxResults),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapDocToUser(d.data(), 'Sin nombre'));
  },

  /**
   * Actualiza el rol de un usuario existente.
   * 
   * @param uid - ID único del usuario a actualizar
   * @param newRole - Nuevo rol a asignar ('admin', 'trainer', o 'client')
   * @returns Promise que resuelve cuando la actualización se completa
   * 
   * @example
   * await adminService.updateUserRole('user-123', 'trainer');
   */
  async updateUserRole(uid: string, newRole: User['role']): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
      role: newRole,
      updatedAt: new Date(),
    });
  },

  /**
   * Deshabilita un usuario marcándolo con alerta activa.
   * No elimina el usuario, solo actualiza su estado.
   * 
   * @param uid - ID único del usuario a deshabilitar
   * @returns Promise que resuelve cuando la actualización se completa
   * 
   * @example
   * await adminService.disableUser('user-123');
   */
  async disableUser(uid: string): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
      hasActiveAlert: true,
      updatedAt: new Date(),
    });
  },

  /**
   * Obtiene estadísticas generales del dashboard de administración.
   * 
   * @returns Promise que resuelve con un objeto con estadísticas de usuarios
   *   - totalUsers: Total de usuarios registrados
   *   - totalTrainers: Total de entrenadores
   *   - totalClients: Total de clientes
   *   - activeAlerts: Total de usuarios con alerta activa
   * 
   * @example
   * const stats = await adminService.getStats();
   * console.log(stats.totalUsers, stats.totalTrainers);
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
