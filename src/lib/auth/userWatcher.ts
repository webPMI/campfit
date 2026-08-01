/**
 * 🔔 Watcher en tiempo real del estado del usuario.
 *
 * Escucha cambios en el documento de Firestore del usuario autenticado
 * y detecta:
 * - Bloqueo (isBlocked: true) → fuerza logout inmediato
 * - Cambio de rol (role) → actualiza el store y redirige
 * - Eliminación (isDeleted: true) → fuerza logout inmediato
 *
 * Esto resuelve el problema crítico: si un admin bloquea/cambia el rol
 * a un usuario con sesión activa, el cambio se detecta en tiempo real.
 *
 * @module userWatcher
 */

import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';
import { setUser, clearAuth } from '@/stores/authStore';
import type { User } from '@/types';

/** Callback cuando el usuario es bloqueado */
export type OnBlockedCallback = (reason?: string) => void;

/** Callback cuando el rol del usuario cambia */
export type OnRoleChangedCallback = (newRole: User['role'], oldRole: User['role']) => void;

/** Callback cuando el usuario es eliminado */
export type OnDeletedCallback = () => void;

/** Configuración del watcher */
export interface UserWatcherConfig {
  onBlocked?: OnBlockedCallback;
  onRoleChanged?: OnRoleChangedCallback;
  onDeleted?: OnDeletedCallback;
}

let watcherUnsubscribe: Unsubscribe | null = null;
let lastKnownRole: User['role'] | null = null;

/**
 * Inicia el watcher en tiempo real del documento del usuario.
 *
 * @param uid - UID del usuario a monitorizar
 * @param currentUser - Datos actuales del usuario (para comparar)
 * @param config - Callbacks para cada tipo de cambio
 * @returns Función para detener el watcher
 */
export function startUserWatcher(
  uid: string,
  currentUser: User,
  config: UserWatcherConfig,
): Unsubscribe {
  // Si ya hay un watcher activo, detenerlo primero
  stopUserWatcher();

  lastKnownRole = currentUser.role;

  logger.info('UserWatcher', `Iniciando watcher para usuario ${uid}`);

  watcherUnsubscribe = onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        logger.warn('UserWatcher', 'Documento de usuario no existe - posible eliminación');
        handleUserDeleted(config);
        return;
      }

      const data = snapshot.data();

      // ── Verificar bloqueo ──
      if (data.isBlocked === true) {
        const reason = (data.blockedReason as string) || undefined;
        logger.warn('UserWatcher', `Usuario bloqueado${reason ? `: ${reason}` : ''}`);
        handleUserBlocked(reason, config);
        return;
      }

      // ── Verificar eliminación (soft delete) ──
      if (data.isDeleted === true) {
        logger.warn('UserWatcher', 'Usuario eliminado (soft delete)');
        handleUserDeleted(config);
        return;
      }

      // ── Verificar cambio de rol ──
      const newRole = (data.role as User['role']) || 'client';
      if (lastKnownRole !== null && newRole !== lastKnownRole) {
        const oldRole = lastKnownRole;
        logger.info('UserWatcher', `Cambio de rol detectado: ${oldRole} → ${newRole}`);
        handleRoleChanged(newRole, oldRole, uid, data, config);
        lastKnownRole = newRole;
        return;
      }

      // ── Actualizar store con datos frescos ──
      const updatedUser: User = {
        uid,
        name: (data.name as string) || currentUser.name,
        email: (data.email as string) || currentUser.email,
        role: newRole,
        hasActiveAlert: (data.hasActiveAlert as boolean) ?? false,
        assignedTrainerId: data.assignedTrainerId as string | undefined,
        medicalProfile: data.medicalProfile as User['medicalProfile'],
        lastActivityAt: data.lastActivityAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        isBlocked: false,
        blockedAt: undefined,
        blockedReason: undefined,
        blockedBy: undefined,
        isDeleted: false,
        deletedAt: undefined,
        deletedBy: undefined,
      };
      setUser(updatedUser);
    },
    (error) => {
      // Si hay error de permisos, puede ser que el usuario fue bloqueado
      // y las Firestore rules le impiden leer su propio documento
      logger.error('UserWatcher', 'Error en watcher (posible bloqueo):', error);
      if (error.code === 'permission-denied') {
        handleUserBlocked('Permisos denegados - posible bloqueo', config);
      }
    },
  );

  return watcherUnsubscribe;
}

/**
 * Detiene el watcher activo.
 */
export function stopUserWatcher(): void {
  if (watcherUnsubscribe) {
    logger.info('UserWatcher', 'Deteniendo watcher');
    watcherUnsubscribe();
    watcherUnsubscribe = null;
  }
  lastKnownRole = null;
}

// ─── Handlers internos ──────────────────────────────────────────────────────

/**
 * Maneja el bloqueo del usuario: fuerza logout y muestra mensaje.
 */
async function handleUserBlocked(reason: string | undefined, config: UserWatcherConfig): Promise<void> {
  if (config.onBlocked) {
    config.onBlocked(reason);
  } else {
    // Comportamiento por defecto: logout + toast
    showToast({
      message: reason ? `Tu cuenta ha sido bloqueada: ${reason}` : 'Tu cuenta ha sido bloqueada',
      type: 'error',
    });
    await forceLogout();
  }
  stopUserWatcher();
}

/**
 * Maneja la eliminación del usuario: fuerza logout y muestra mensaje.
 */
async function handleUserDeleted(config: UserWatcherConfig): Promise<void> {
  if (config.onDeleted) {
    config.onDeleted();
  } else {
    // Comportamiento por defecto: logout + toast
    showToast({
      message: 'Tu cuenta ha sido eliminada',
      type: 'error',
    });
    await forceLogout();
  }
  stopUserWatcher();
}

/**
 * Maneja el cambio de rol: actualiza store y redirige al dashboard correcto.
 */
function handleRoleChanged(
  newRole: User['role'],
  oldRole: User['role'],
  uid: string,
  data: Record<string, unknown>,
  config: UserWatcherConfig,
): void {
  if (config.onRoleChanged) {
    config.onRoleChanged(newRole, oldRole);
  } else {
    // Comportamiento por defecto: actualizar store + toast + redirigir
    const updatedUser: User = {
      uid,
      name: (data.name as string) || '',
      email: (data.email as string) || '',
      role: newRole,
      hasActiveAlert: (data.hasActiveAlert as boolean) ?? false,
      assignedTrainerId: data.assignedTrainerId as string | undefined,
      medicalProfile: data.medicalProfile as User['medicalProfile'],
      isBlocked: false,
      isDeleted: false,
    };
    setUser(updatedUser);

    showToast({
      message: `Tu rol ha cambiado de ${oldRole} a ${newRole}. Redirigiendo...`,
      type: 'info',
    });

    // Redirigir al dashboard del nuevo rol
    const dashboardMap: Record<User['role'], string> = {
      admin: '/admin/dashboard',
      trainer: '/trainer/dashboard',
      client: '/client/dashboard',
    };
    setTimeout(() => {
      window.location.href = dashboardMap[newRole];
    }, 1500);
  }
}

/**
 * Fuerza el cierre de sesión y limpia el estado.
 */
async function forceLogout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    logger.error('UserWatcher', 'Error al cerrar sesión forzada:', error);
  }
  clearAuth();
  setTimeout(() => {
    window.location.href = '/login';
  }, 500);
}