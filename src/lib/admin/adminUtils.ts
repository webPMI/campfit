/**
 * Utilidades compartidas para el panel de administración.
 * Proporciona funciones de renderizado, autenticación y datos en tiempo real.
 *
 * @module adminUtils
 */

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  where,
  getDoc,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';

// ============================================================
// Logger interno (evita console.log en producción)
// ============================================================

const LOG_PREFIX = '[Admin]';

const logger = {
  info: (message: string, ...args: unknown[]): void => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info(`${LOG_PREFIX} ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]): void => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`${LOG_PREFIX} ${message}`, ...args);
    }
  },
  error: (message: string, error?: unknown): void => {
    // En producción también registramos errores
    console.error(`${LOG_PREFIX} ${message}`, error || '');
  },
};

// ============================================================
// Iconos SVG compartidos
// ============================================================

export const ICONS = {
  users: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />',
  trainers: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />',
  clients: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.38a48.474 48.474 0 0 0-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />',
  workouts: '<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />',
  diets: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.38a48.474 48.474 0 0 0-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />',
  alert: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />',
  check: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />',
} as const;

// ============================================================
// Tipos compartidos
// ============================================================

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
  assignedTrainerId?: string;
  hasActiveAlert?: boolean;
  createdAt?: { toDate: () => Date } | null;
  updatedAt?: { toDate: () => Date } | null;
}

export interface RoleBadge {
  label: string;
  class: string;
}

export interface ToastOptions {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

// ============================================================
// Utilidades de UI
// ============================================================

/**
 * Obtiene la badge visual para un rol de usuario.
 * @param role - Rol del usuario
 * @returns Objeto con label y clases CSS
 */
export function getRoleBadge(role: string): RoleBadge {
  switch (role) {
    case 'admin':
      return { label: 'Admin', class: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
    case 'trainer':
      return { label: 'Trainer', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    default:
      return { label: 'Client', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
  }
}

/**
 * Escapa texto HTML para prevenir XSS.
 * @param text - Texto a escapar
 * @returns Texto escapado
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Formatea un timestamp de Firestore a fecha local.
 * @param timestamp - Timestamp de Firestore
 * @returns Fecha formateada o '-'
 */
export function formatDate(timestamp: { toDate: () => Date } | null | undefined): string {
  if (!timestamp?.toDate) return '-';
  try {
    return timestamp.toDate().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '-';
  }
}

/**
 * Obtiene la inicial de un nombre para el avatar.
 * @param name - Nombre del usuario
 * @returns Inicial en mayúscula
 */
export function getUserInitial(name: string): string {
  return (name || '?').charAt(0).toUpperCase();
}

/**
 * Muestra un toast de notificación en la interfaz.
 * @param options - Opciones del toast
 */
export function showToast({ message, type, duration = 3000 }: ToastOptions): void {
  const existing = document.getElementById('admin-toast');
  if (existing) existing.remove();

  const colors = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    error: 'border-red-500/30 bg-red-500/10 text-red-400',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  };

  const toast = document.createElement('div');
  toast.id = 'admin-toast';
  toast.className = `fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-6 py-3 text-sm font-medium backdrop-blur-xl shadow-2xl animate-slide-up ${colors[type]}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================
// Auth guard - protege páginas admin
// ============================================================

/**
 * Guardia de autenticación para páginas admin.
 * Redirige a /login si no hay sesión activa.
 * @param callback - Función a ejecutar con el usuario autenticado
 * @returns Función para cancelar la suscripción
 */
export function requireAuth(callback: (user: FirebaseUser) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      logger.warn('Usuario no autenticado, redirigiendo a login');
      window.location.href = '/login';
      return;
    }
    callback(user);
  });
}

// ============================================================
// Servicios de datos
// ============================================================

/**
 * Se suscribe a todos los usuarios en tiempo real.
 * @param callback - Función que recibe la lista de usuarios
 * @returns Función para cancelar la suscripción
 */
export function subscribeToUsers(callback: (users: AdminUser[]) => void): Unsubscribe {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name || 'Sin nombre',
          email: data.email || '',
          role: data.role || 'client',
          assignedTrainerId: data.assignedTrainerId,
          hasActiveAlert: data.hasActiveAlert ?? false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as AdminUser;
      });
      callback(users);
    },
    (error) => {
      logger.error('Error al suscribirse a usuarios:', error);
      showToast({ message: 'Error al cargar usuarios', type: 'error' });
    },
  );
}

/**
 * Se suscribe a usuarios filtrados por rol en tiempo real.
 * @param role - Rol a filtrar ('trainer' | 'client')
 * @param callback - Función que recibe la lista de usuarios filtrados
 * @returns Función para cancelar la suscripción
 */
export function subscribeToUsersByRole(
  role: 'trainer' | 'client',
  callback: (users: AdminUser[]) => void,
): Unsubscribe {
  const q = query(collection(db, 'users'), where('role', '==', role), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name || 'Sin nombre',
          email: data.email || '',
          role: data.role || role,
          assignedTrainerId: data.assignedTrainerId,
          hasActiveAlert: data.hasActiveAlert ?? false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as AdminUser;
      });
      callback(users);
    },
    (error) => {
      logger.error(`Error al suscribirse a usuarios con rol ${role}:`, error);
      showToast({ message: 'Error al cargar datos', type: 'error' });
    },
  );
}

/**
 * Se suscribe a los usuarios más recientes.
 * @param max - Número máximo de usuarios
 * @param callback - Función que recibe la lista de usuarios recientes
 * @returns Función para cancelar la suscripción
 */
export function subscribeToRecentUsers(max: number, callback: (users: AdminUser[]) => void): Unsubscribe {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(max));
  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name || 'Sin nombre',
          email: data.email || '',
          role: data.role || 'client',
          assignedTrainerId: data.assignedTrainerId,
          hasActiveAlert: data.hasActiveAlert ?? false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as AdminUser;
      });
      callback(users);
    },
    (error) => {
      logger.error('Error al suscribirse a usuarios recientes:', error);
    },
  );
}

/**
 * Se suscribe al conteo de documentos de una colección.
 * @param collectionName - Nombre de la colección
 * @param callback - Función que recibe el conteo
 * @returns Función para cancelar la suscripción
 */
export function subscribeToCollectionCount(
  collectionName: string,
  callback: (count: number) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, collectionName),
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      logger.error(`Error al obtener conteo de ${collectionName}:`, error);
    },
  );
}

/**
 * Actualiza el rol de un usuario.
 * @param uid - ID del usuario
 * @param role - Nuevo rol
 */
export async function updateUserRole(uid: string, role: 'admin' | 'trainer' | 'client'): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() });
  logger.info(`Rol actualizado para usuario ${uid}: ${role}`);
}

/**
 * Elimina un usuario de Firestore.
 * @param uid - ID del usuario a eliminar
 */
export async function deleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
  logger.info(`Usuario eliminado: ${uid}`);
}

/**
 * Cierra la sesión del usuario y redirige al login.
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
  window.location.href = '/login';
}

/**
 * Carga el perfil de un usuario desde Firestore.
 * @param uid - ID del usuario
 * @returns Datos del perfil o null
 */
export async function loadUserProfile(
  uid: string,
): Promise<{ role: string; name?: string; email?: string } | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        role: data.role || 'admin',
        name: data.name,
        email: data.email,
      };
    }
    return null;
  } catch (error) {
    logger.error('Error al cargar perfil:', error);
    return null;
  }
}

/**
 * Obtiene el conteo real de clientes asignados a un trainer.
 * @param trainerId - ID del trainer
 * @returns Número de clientes asignados
 */
export async function getTrainerClientCount(trainerId: string): Promise<number> {
  try {
    const q = query(collection(db, 'users'), where('assignedTrainerId', '==', trainerId));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    logger.error(`Error al obtener conteo de clientes para trainer ${trainerId}:`, error);
    return 0;
  }
}

/**
 * Obtiene el nombre de un usuario por su ID.
 * @param uid - ID del usuario
 * @returns Nombre del usuario o el UID
 */
export async function getUserName(uid: string): Promise<string> {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data().name || uid;
    }
    return uid;
  } catch {
    return uid;
  }
}

// ============================================================
// Renderizado de componentes HTML
// ============================================================

/**
 * Renderiza una tarjeta de usuario.
 * @param user - Datos del usuario
 * @param showActions - Si debe mostrar acciones (cambiar rol, eliminar)
 * @returns HTML de la tarjeta
 */
export function renderUserCard(user: AdminUser, showActions: boolean = false): string {
  const badge = getRoleBadge(user.role);
  const name = user.name || 'Sin nombre';
  const email = user.email || '';
  const createdAt = formatDate(user.createdAt);
  const hasAlert = user.hasActiveAlert;

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-medium text-emerald-400">
            ${getUserInitial(name)}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-zinc-200 truncate">${escapeHtml(name)}</p>
              ${hasAlert ? '<span class="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Alerta activa"></span>' : ''}
            </div>
            <p class="text-xs text-zinc-500 truncate">${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.class}">${badge.label}</span>
          ${showActions ? renderUserActions(user.uid) : ''}
        </div>
      </div>
      <div class="mt-2 text-xs text-zinc-600">Registrado: ${createdAt}</div>
    </div>
  `;
}

/**
 * Renderiza una tarjeta de usuario con información extendida.
 * @param user - Datos del usuario
 * @param showActions - Si debe mostrar acciones
 * @returns HTML de la tarjeta extendida
 */
export function renderUserCardExtended(user: AdminUser, showActions: boolean = false): string {
  const badge = getRoleBadge(user.role);
  const name = user.name || 'Sin nombre';
  const email = user.email || '';
  const createdAt = formatDate(user.createdAt);
  const trainerId = user.assignedTrainerId || null;
  const hasAlert = user.hasActiveAlert;

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-medium text-emerald-400">
            ${getUserInitial(name)}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-zinc-200 truncate">${escapeHtml(name)}</p>
              ${hasAlert ? '<span class="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Alerta activa"></span>' : ''}
            </div>
            <p class="text-xs text-zinc-500 truncate">${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.class}">${badge.label}</span>
          ${showActions ? renderUserActions(user.uid) : ''}
        </div>
      </div>
      <div class="mt-2 flex items-center gap-4 text-xs text-zinc-600">
        <span>Registrado: ${createdAt}</span>
        <span>Trainer: ${trainerId || '<span class="text-amber-500">Sin asignar</span>'}</span>
      </div>
    </div>
  `;
}

/**
 * Renderiza los botones de acción para un usuario (cambiar rol, eliminar).
 * @param uid - ID del usuario
 * @returns HTML de los botones de acción
 */
export function renderUserActions(uid: string): string {
  return `
    <div class="relative inline-block">
      <button onclick="window.__toggleRoleMenu('${uid}')" class="rounded-lg border border-zinc-700/50 bg-zinc-800/80 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all">
        <svg class="h-3.5 w-3.5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
        </svg>
        Rol
      </button>
      <div id="role-menu-${uid}" class="absolute right-0 top-full mt-1 z-50 hidden w-36 rounded-xl border border-zinc-700/50 bg-zinc-900/95 p-1 shadow-xl backdrop-blur-xl">
        <button onclick="window.__changeRole('${uid}', 'admin')" class="w-full rounded-lg px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">Admin</button>
        <button onclick="window.__changeRole('${uid}', 'trainer')" class="w-full rounded-lg px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">Trainer</button>
        <button onclick="window.__changeRole('${uid}', 'client')" class="w-full rounded-lg px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">Client</button>
      </div>
    </div>
    <button onclick="window.__deleteUser('${uid}')" class="rounded-lg border border-red-900/30 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 hover:border-red-800/40 transition-all">
      <svg class="h-3.5 w-3.5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </svg>
      Eliminar
    </button>
  `;
}

/**
 * Renderiza un estado vacío con icono y mensaje.
 * @param icon - SVG path del icono
 * @param message - Mensaje a mostrar
 * @returns HTML del estado vacío
 */
export function renderEmptyState(icon: string, message: string): string {
  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-8 text-center backdrop-blur-sm">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/50">
        <svg class="h-7 w-7 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          ${icon}
        </svg>
      </div>
      <p class="text-sm text-zinc-500">${message}</p>
    </div>
  `;
}

/**
 * Renderiza un estado de carga.
 * @returns HTML del estado de carga
 */
export function renderLoadingState(): string {
  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-8 text-center backdrop-blur-sm">
      <div class="flex items-center justify-center gap-3">
        <svg class="h-5 w-5 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-sm text-zinc-500">Cargando...</p>
      </div>
    </div>
  `;
}

/**
 * Renderiza una tarjeta de entrenador.
 * @param trainer - Datos del entrenador
 * @returns HTML de la tarjeta
 */
export function renderTrainerCard(trainer: AdminUser): string {
  const name = trainer.name || 'Sin nombre';
  const email = trainer.email || '';
  const createdAt = formatDate(trainer.createdAt);
  const clientCount = (trainer as AdminUser & { clientCount?: number }).clientCount ?? 0;

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-sm font-medium text-blue-400">
            ${getUserInitial(name)}
          </div>
          <div>
            <p class="text-sm font-medium text-zinc-200">${escapeHtml(name)}</p>
            <p class="text-xs text-zinc-500">${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-sm font-semibold text-zinc-200">${clientCount}</p>
            <p class="text-xs text-zinc-500">Clientes</p>
          </div>
          <span class="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">Trainer</span>
        </div>
      </div>
      <div class="mt-2 text-xs text-zinc-600">Registrado: ${createdAt}</div>
    </div>
  `;
}

/**
 * Renderiza una tarjeta de cliente.
 * @param client - Datos del cliente
 * @returns HTML de la tarjeta
 */
export function renderClientCard(client: AdminUser): string {
  const name = client.name || 'Sin nombre';
  const email = client.email || '';
  const createdAt = formatDate(client.createdAt);
  const trainerId = client.assignedTrainerId || null;
  const hasAlert = client.hasActiveAlert;

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-medium text-emerald-400">
            ${getUserInitial(name)}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-zinc-200">${escapeHtml(name)}</p>
              ${hasAlert ? '<span class="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Alerta activa"></span>' : ''}
            </div>
            <p class="text-xs text-zinc-500">${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">Client</span>
          ${trainerId
            ? '<span class="text-xs text-zinc-500">Con trainer</span>'
            : '<span class="text-xs text-amber-500">Sin trainer</span>'
          }
        </div>
      </div>
      <div class="mt-2 text-xs text-zinc-600">Registrado: ${createdAt}</div>
    </div>
  `;
}

// ============================================================
// Inicializadores globales para botones inline
// ============================================================

/**
 * Inicializa las acciones globales para los botones inline.
 * Configura los manejadores de eventos para cambiar rol y eliminar usuario.
 */
export function initGlobalActions(): void {
  (window as unknown as Record<string, unknown>).__toggleRoleMenu = function (uid: string) {
    const menu = document.getElementById(`role-menu-${uid}`);
    if (menu) {
      menu.classList.toggle('hidden');
    }
  };

  (window as unknown as Record<string, unknown>).__changeRole = async function (
    uid: string,
    role: 'admin' | 'trainer' | 'client',
  ) {
    try {
      await updateUserRole(uid, role);
      // Cerrar todos los menús
      document.querySelectorAll('[id^="role-menu-"]').forEach((el) => el.classList.add('hidden'));
      showToast({ message: `Rol actualizado a ${role}`, type: 'success' });
    } catch (error) {
      logger.error('Error al cambiar rol:', error);
      showToast({ message: 'Error al cambiar el rol', type: 'error' });
    }
  };

  (window as unknown as Record<string, unknown>).__deleteUser = async function (uid: string) {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;
    try {
      await deleteUser(uid);
      showToast({ message: 'Usuario eliminado correctamente', type: 'success' });
    } catch (error) {
      logger.error('Error al eliminar usuario:', error);
      showToast({ message: 'Error al eliminar el usuario', type: 'error' });
    }
  };

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', function closeMenus(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('[id^="role-menu-"]') && !target.closest('button[onclick*="toggleRoleMenu"]')) {
      document.querySelectorAll('[id^="role-menu-"]').forEach((el) => el.classList.add('hidden'));
    }
  });
}
