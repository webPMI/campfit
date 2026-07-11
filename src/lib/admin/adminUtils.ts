/**
 * Utilidades compartidas para el panel de administración.
 * Proporciona funciones de gestión de usuarios, roles y datos del sistema.
 *
 * @module adminUtils
 */

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { logger } from '@/lib/shared/logger';
import { ICONS, escapeHtml, formatDate, formatTime, getUserInitial, showToast, renderEmptyState, renderLoadingState, getRoleBadge } from '@/lib/shared/ui';

// ============================================================
// Tipos
// ============================================================

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

// ============================================================
// Auth guard
// ============================================================

export function requireAdmin(callback: (user: FirebaseUser) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      logger.warn('Admin', 'Usuario no autenticado, redirigiendo a login');
      window.location.href = '/login';
      return;
    }
    callback(user);
  });
}

// ============================================================
// Servicios de datos - Usuarios
// ============================================================

export function subscribeToUsers(
  callback: (users: AdminUser[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc'),
  );
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
      logger.error('Admin', 'Error al suscribirse a usuarios:', error);
      showToast({ message: 'Error al cargar usuarios', type: 'error' });
    },
  );
}

export function subscribeToUsersByRole(
  role: string,
  callback: (users: AdminUser[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'users'),
    where('role', '==', role),
    orderBy('createdAt', 'desc'),
  );
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
      logger.error('Admin', `Error al suscribirse a usuarios con rol ${role}:`, error);
      showToast({ message: 'Error al cargar usuarios', type: 'error' });
    },
  );
}

export async function getUserProfile(userId: string): Promise<AdminUser | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        name: data.name || 'Sin nombre',
        email: data.email || '',
        role: data.role || 'client',
        assignedTrainerId: data.assignedTrainerId,
        hasActiveAlert: data.hasActiveAlert ?? false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as AdminUser;
    }
    return null;
  } catch (error) {
    logger.error('Admin', 'Error al cargar perfil de usuario:', error);
    return null;
  }
}

// ============================================================
// Gestión de usuarios
// ============================================================

export async function createUser(data: CreateUserPayload): Promise<{ success: boolean; message: string; uid?: string }> {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const uid = userCredential.user.uid;

    // Crear documento en Firestore
    const userData: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      role: data.role,
      hasActiveAlert: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (data.assignedTrainerId) {
      userData.assignedTrainerId = data.assignedTrainerId;
    }

    await setDoc(doc(db, 'users', uid), userData);

    logger.info('Admin', `Usuario creado: ${uid} (${data.email})`);
    return { success: true, message: 'Usuario creado correctamente', uid };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'auth/email-already-in-use') {
      return { success: false, message: 'El email ya está registrado' };
    }
    if (err.code === 'auth/weak-password') {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    logger.error('Admin', 'Error al crear usuario:', error);
    return { success: false, message: 'Error al crear el usuario' };
  }
}

export async function updateUserRole(uid: string, newRole: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      role: newRole,
      updatedAt: serverTimestamp(),
    });
    logger.info('Admin', `Rol actualizado para ${uid}: ${newRole}`);
    return true;
  } catch (error) {
    logger.error('Admin', 'Error al actualizar rol:', error);
    showToast({ message: 'Error al actualizar el rol', type: 'error' });
    return false;
  }
}

export async function assignTrainer(clientId: string, trainerId: string | null): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'users', clientId), {
      assignedTrainerId: trainerId || null,
      updatedAt: serverTimestamp(),
    });
    logger.info('Admin', `Trainer ${trainerId || 'ninguno'} asignado a cliente ${clientId}`);
    return true;
  } catch (error) {
    logger.error('Admin', 'Error al asignar trainer:', error);
    showToast({ message: 'Error al asignar trainer', type: 'error' });
    return false;
  }
}

export async function deleteUser(uid: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'users', uid));
    logger.info('Admin', `Usuario eliminado: ${uid}`);
    return true;
  } catch (error) {
    logger.error('Admin', 'Error al eliminar usuario:', error);
    showToast({ message: 'Error al eliminar el usuario', type: 'error' });
    return false;
  }
}

// ============================================================
// Renderizado de componentes HTML
// ============================================================

export function renderUserRow(user: AdminUser, onclick?: string): string {
  const name = user.name || 'Sin nombre';
  const email = user.email || '';
  const initial = getUserInitial(name);
  const roleColors: Record<string, string> = {
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    trainer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    client: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  const roleColor = roleColors[user.role] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60 ${onclick ? 'cursor-pointer hover:bg-zinc-800/40' : ''}"
         ${onclick ? `onclick="${onclick}"` : ''}>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium bg-zinc-700/50 text-zinc-300">
            ${initial}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-zinc-200 truncate">${escapeHtml(name)}</p>
              ${user.hasActiveAlert ? '<span class="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Alerta activa"></span>' : ''}
            </div>
            <p class="text-xs text-zinc-500 truncate">${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="rounded-full px-2 py-0.5 text-[10px] font-medium border ${roleColor}">${user.role}</span>
          <svg class="h-4 w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </div>
  `;
}

export function renderUserDetail(user: AdminUser): string {
  const name = user.name || 'Sin nombre';
  const email = user.email || '';
  const initial = getUserInitial(name);
  const date = formatDate(user.createdAt);

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-6 backdrop-blur-sm">
      <div class="flex items-center gap-4">
        <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          ${initial}
        </div>
        <div>
          <h3 class="text-lg font-bold text-zinc-100">${escapeHtml(name)}</h3>
          <p class="text-sm text-zinc-500">${escapeHtml(email)}</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">${user.role}</span>
            <span class="text-xs text-zinc-500">Creado: ${date}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderUserForm(
  trainers: AdminUser[],
  selectedRole: string = 'client',
  selectedTrainerId: string = '',
): string {
  const trainerOptions = trainers
    .filter((t) => t.role === 'trainer')
    .map(
      (t) =>
        `<option value="${t.uid}" ${t.uid === selectedTrainerId ? 'selected' : ''}>${escapeHtml(t.name)} (${escapeHtml(t.email)})</option>`,
    )
    .join('');

  return `
    <div class="space-y-4">
      <div>
        <label for="user-name" class="block text-xs font-medium text-zinc-400 mb-1.5">Nombre completo</label>
        <input id="user-name" type="text" required
          class="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 backdrop-blur-sm transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
          placeholder="Ej: Juan Pérez" />
      </div>
      <div>
        <label for="user-email" class="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
        <input id="user-email" type="email" required
          class="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 backdrop-blur-sm transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
          placeholder="ejemplo@correo.com" />
      </div>
      <div>
        <label for="user-password" class="block text-xs font-medium text-zinc-400 mb-1.5">Contraseña</label>
        <input id="user-password" type="password" required minlength="6"
          class="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 backdrop-blur-sm transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
          placeholder="Mínimo 6 caracteres" />
      </div>
      <div>
        <label for="user-role" class="block text-xs font-medium text-zinc-400 mb-1.5">Rol</label>
        <select id="user-role"
          class="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-200 backdrop-blur-sm transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20">
          <option value="client" ${selectedRole === 'client' ? 'selected' : ''}>Cliente</option>
          <option value="trainer" ${selectedRole === 'trainer' ? 'selected' : ''}>Entrenador</option>
          <option value="admin" ${selectedRole === 'admin' ? 'selected' : ''}>Administrador</option>
        </select>
      </div>
      <div id="trainer-assign-container" style="${selectedRole === 'client' ? '' : 'display:none'}">
        <label for="user-trainer" class="block text-xs font-medium text-zinc-400 mb-1.5">Trainer asignado (opcional)</label>
        <select id="user-trainer"
          class="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-200 backdrop-blur-sm transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20">
          <option value="">Sin trainer</option>
          ${trainerOptions}
        </select>
      </div>
    </div>
  `;
}

// ============================================================
// Re-export desde shared/ui
// ============================================================

export { ICONS, escapeHtml, formatDate, formatTime, getUserInitial, showToast, renderEmptyState, renderLoadingState, getRoleBadge };

// ============================================================
// Auth helpers
// ============================================================

/**
 * Cierra la sesión del usuario actual.
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
    window.location.href = '/login';
  } catch (error) {
    logger.error('Admin', 'Error al cerrar sesión:', error);
    showToast({ message: 'Error al cerrar sesión', type: 'error' });
  }
}

/**
 * Obtiene el nombre de un usuario por su UID.
 */
export async function getUserName(userId: string): Promise<string> {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data().name || 'Sin nombre';
    }
    return 'Usuario desconocido';
  } catch (error) {
    logger.error('Admin', 'Error al obtener nombre de usuario:', error);
    return 'Error';
  }
}

/**
 * Bloquea o desbloquea un usuario.
 */
export async function toggleUserBlock(uid: string, isBlocked: boolean): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      isBlocked,
      blockedAt: isBlocked ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    });
    logger.info('Admin', `Usuario ${uid} ${isBlocked ? 'bloqueado' : 'desbloqueado'}`);
    return true;
  } catch (error) {
    logger.error('Admin', 'Error al cambiar estado de bloqueo:', error);
    showToast({ message: 'Error al cambiar estado de bloqueo', type: 'error' });
    return false;
  }
}

// ============================================================
// Suscripciones adicionales
// ============================================================

/**
 * Se suscribe al conteo de documentos en una colección.
 */
export function subscribeToCollectionCount(
  collectionName: string,
  callback: (count: number) => void,
): Unsubscribe {
  const q = query(collection(db, collectionName));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      logger.error('Admin', `Error al contar ${collectionName}:`, error);
    },
  );
}

/**
 * Se suscribe a los usuarios más recientes.
 */
export function subscribeToRecentUsers(
  limitCount: number,
  callback: (users: AdminUser[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );
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
      logger.error('Admin', 'Error al suscribirse a usuarios recientes:', error);
    },
  );
}

// ============================================================
// Renderizado adicional
// ============================================================

/**
 * Renderiza una tarjeta de usuario (alias de renderUserRow para dashboard).
 */
export function renderUserCard(user: AdminUser): string {
  return renderUserRow(user);
}

/**
 * Renderiza una tarjeta de usuario extendida con botón de editar.
 */
export function renderUserCardExtended(user: AdminUser, showEdit: boolean = false): string {
  const name = user.name || 'Sin nombre';
  const email = user.email || '';
  const initial = getUserInitial(name);
  const roleColors: Record<string, string> = {
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    trainer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    client: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  const roleColor = roleColors[user.role] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium bg-zinc-700/50 text-zinc-300">
            ${initial}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-zinc-200 truncate">${escapeHtml(name)}</p>
              ${user.hasActiveAlert ? '<span class="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Alerta activa"></span>' : ''}
            </div>
            <p class="text-xs text-zinc-500 truncate">${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="rounded-full px-2 py-0.5 text-[10px] font-medium border ${roleColor}">${user.role}</span>
          ${showEdit ? `<button data-edit-user data-uid="${user.uid}" class="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Inicializa acciones globales (compatible con trainerUtils.initGlobalActions).
 */
export function initGlobalActions(adminId: string): void {
  (window as unknown as Record<string, unknown>).__adminId = adminId;
}

/**
 * Renderiza una tarjeta de cliente (para la página de clientes del admin).
 */
export function renderClientCard(client: AdminUser): string {
  const name = client.name || 'Sin nombre';
  const email = client.email || '';
  const initial = getUserInitial(name);
  const trainerName = client.assignedTrainerId || 'Sin trainer';

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400">
            ${initial}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-zinc-200 truncate">${escapeHtml(name)}</p>
            <p class="text-xs text-zinc-500 truncate">${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p class="text-xs text-zinc-500">Trainer: <span class="text-zinc-400">${escapeHtml(trainerName)}</span></p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza una tarjeta de entrenador (para la página de trainers del admin).
 */
export function renderTrainerCard(trainer: AdminUser & { clientCount?: number }): string {
  const name = trainer.name || 'Sin nombre';
  const email = trainer.email || '';
  const initial = getUserInitial(name);
  const clientCount = trainer.clientCount ?? 0;

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium bg-blue-500/10 text-blue-400">
            ${initial}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-zinc-200 truncate">${escapeHtml(name)}</p>
            <p class="text-xs text-zinc-500 truncate">${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p class="text-sm font-semibold text-blue-400">${clientCount}</p>
          <p class="text-xs text-zinc-500">clientes</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Obtiene el número de clientes asignados a un entrenador.
 */
export async function getTrainerClientCount(trainerId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'users'),
      where('assignedTrainerId', '==', trainerId),
      where('role', '==', 'client'),
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    logger.error('Admin', 'Error al contar clientes del trainer:', error);
    return 0;
  }
}

// ============================================================
// Inicialización global
// ============================================================

export function initAdminActions(adminId: string): void {
  (window as unknown as Record<string, unknown>).__adminId = adminId;
}
