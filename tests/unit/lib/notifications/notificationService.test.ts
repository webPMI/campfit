import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isNotificationSupported,
  requestNotificationPermission,
  showLocalNotification,
  isCategoryEnabled,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '@/lib/notifications/notificationService';

describe('NotificationService Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('debe contener las categorías por defecto habilitadas', () => {
    expect(DEFAULT_NOTIFICATION_PREFERENCES.enabled).toBe(true);
    expect(DEFAULT_NOTIFICATION_PREFERENCES.categories.clientChat).toBe(true);
    expect(DEFAULT_NOTIFICATION_PREFERENCES.categories.trainerChat).toBe(true);
    expect(DEFAULT_NOTIFICATION_PREFERENCES.categories.systemAlerts).toBe(true);
  });

  it('debe comprobar si una categoría está habilitada según userData', () => {
    const activeUser = { notificationsEnabled: true, notificationPreferences: { clientChat: true, workoutReminders: false } };
    expect(isCategoryEnabled(activeUser, 'clientChat')).toBe(true);
    expect(isCategoryEnabled(activeUser, 'workoutReminders')).toBe(false);

    const disabledUser = { notificationsEnabled: false };
    expect(isCategoryEnabled(disabledUser, 'clientChat')).toBe(false);
  });

  it('debe detectar correctamente si Notification es soportado', () => {
    const supported = isNotificationSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('debe retornar unsupported en requestNotificationPermission si window.Notification no existe', async () => {
    const originalNotification = window.Notification;
    // @ts-ignore
    delete window.Notification;

    const res = await requestNotificationPermission();
    expect(res).toBe('unsupported');

    window.Notification = originalNotification;
  });

  it('debe omitir la notificación si la categoría está desactivada', () => {
    // @ts-ignore
    window.Notification = {
      permission: 'granted',
      requestPermission: vi.fn(),
    };

    const userData = { notificationsEnabled: true, notificationPreferences: { workoutReminders: false } };
    const shown = showLocalNotification('Test Title', { category: 'workoutReminders' }, userData);
    expect(shown).toBe(false);
  });
});
