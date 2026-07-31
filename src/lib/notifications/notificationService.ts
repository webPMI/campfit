/**
 * Módulo de servicio de notificaciones escalable (Web Push & Browser Notifications).
 * Gestiona permisos del navegador, preferencias granulares en Firestore y suscripciones de notificaciones.
 *
 * @module notificationService
 */

import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';

export type NotificationCategory =
  // Cliente
  | 'clientChat'
  | 'newWorkoutAssigned'
  | 'newDietAssigned'
  | 'workoutReminders'
  // Entrenador
  | 'trainerChat'
  | 'clientMedicalAlerts'
  | 'clientProgressLogs'
  // Administrador
  | 'systemAlerts'
  | 'newUserRegistrations';

export interface NotificationPreferences {
  enabled: boolean;
  categories: Record<NotificationCategory, boolean>;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  categories: {
    // Cliente
    clientChat: true,
    newWorkoutAssigned: true,
    newDietAssigned: true,
    workoutReminders: true,
    // Entrenador
    trainerChat: true,
    clientMedicalAlerts: true,
    clientProgressLogs: true,
    // Admin
    systemAlerts: true,
    newUserRegistrations: true,
  },
};

/**
 * Comprueba si las notificaciones de navegador son soportadas en el entorno actual.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Solicita permisos de notificación al navegador.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) {
    logger.warn('NotificationService', 'Las notificaciones no son soportadas en este navegador.');
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    logger.info('NotificationService', `Permiso de notificaciones: ${permission}`);
    return permission;
  } catch (err) {
    logger.error('NotificationService', 'Error al solicitar permiso de notificaciones:', err);
    return 'denied';
  }
}

/**
 * Actualiza la preferencia global o granular de notificaciones del usuario en Firestore.
 *
 * @param uid - ID del usuario
 * @param preferences - Preferencias completas o parciales
 * @returns boolean indicando éxito o fracaso
 */
export async function updateNotificationPreferences(
  uid: string,
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  if (!uid) return false;

  try {
    if (preferences.enabled && isNotificationSupported()) {
      const permission = await requestNotificationPermission();
      if (permission === 'denied') {
        logger.warn('NotificationService', 'El usuario denegó los permisos en el navegador.');
      }
    }

    const payload: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (typeof preferences.enabled === 'boolean') {
      payload.notificationsEnabled = preferences.enabled;
    }

    if (preferences.categories) {
      for (const [key, value] of Object.entries(preferences.categories)) {
        payload[`notificationPreferences.${key}`] = value;
      }
    }

    await updateDoc(doc(db, 'users', uid), payload);

    const { clearUserCache } = await import('@/lib/shared/initPage');
    clearUserCache();

    logger.info('NotificationService', `Preferencias de notificaciones actualizadas para UID ${uid}`);
    return true;
  } catch (err) {
    logger.error('NotificationService', 'Error al actualizar preferencias de notificaciones:', err);
    return false;
  }
}

/**
 * Comprueba si se debe enviar/mostrar una notificación según las preferencias del usuario y la categoría.
 */
export function isCategoryEnabled(
  userData: any,
  category: NotificationCategory
): boolean {
  if (!userData) return false;
  if (userData.notificationsEnabled === false) return false;

  const prefs = userData.notificationPreferences;
  if (!prefs) return true; // Por defecto activado si no hay preferencia granular guardada

  return prefs[category] ?? true;
}

/**
 * Muestra una notificación del navegador si está permitido y la categoría está activa.
 */
export function showLocalNotification(
  title: string,
  options?: NotificationOptions & { category?: NotificationCategory },
  userData?: any
): boolean {
  if (!isNotificationSupported() || typeof Notification === 'undefined' || Notification?.permission !== 'granted') {
    return false;
  }

  if (options?.category && userData && !isCategoryEnabled(userData, options.category)) {
    logger.info('NotificationService', `Notificación para la categoría ${options.category} omitida por preferencia del usuario.`);
    return false;
  }

  try {
    new Notification(title, {
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-192.png',
      ...options,
    });
    return true;
  } catch (err) {
    logger.error('NotificationService', 'Error mostrando notificación local:', err);
    return false;
  }
}
