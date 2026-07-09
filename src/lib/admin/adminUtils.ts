import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, where, getDoc, type Unsubscribe } from 'firebase/firestore';

// ============================================================
// Iconos SVG compartidos
// ============================================================

export const ICONS = {
  users: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />',
  trainers: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />',
  clients: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.38a48.474 48.474 0 0 0-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />',
  workouts: '<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />',
  diets: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.38a48.474 48.474 0 0 0-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />',
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
  createdAt?: any;
  updatedAt?: any;
}

export interface RoleBadge {
  label: string;
  class: string;
}

// ============================================================
// Utilidades de UI
// ============================================================

export function getRoleBadge(role: string): RoleBadge {
  switch (role) {
    case 'admin':
      return { label: 'Admin', class: 'bg-purple-500/10 text-purple-400' };
    case 'trainer':
      return { label: 'Trainer', class: 'bg-blue-500/10 text-blue-400' };
    default:
      return { label: 'Client', class: 'bg-emerald-500/10 text-emerald-400' };
  }
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function formatDate(timestamp: any): string {
  if (!timestamp?.toDate) return '-';
  return timestamp.toDate().toLocaleDateString();
}

export function getUserInitial(name: string): string {
  return (name || '?').charAt(0).toUpperCase();
}

// ============================================================
// Auth guard - protege páginas admin
// ============================================================

export function requireAuth(callback: (user: User) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    callback(user);
  });
}

// ============================================================
// Servicios de datos
// ============================================================

export function subscribeToUsers(callback: (users: AdminUser[]) => void): Unsubscribe {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    })) as AdminUser[];
    callback(users);
  });
}

export function subscribeToUsersByRole(role: 'trainer' | 'client', callback: (users: AdminUser[]) => void): Unsubscribe {
  const q = query(collection(db, 'users'), where('role', '==', role), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    })) as AdminUser[];
    callback(users);
  });
}

export function subscribeToRecentUsers(max: number, callback: (users: AdminUser[]) => void): Unsubscribe {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(max));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    })) as AdminUser[];
    callback(users);
  });
}

export function subscribeToCollectionCount(collectionName: string, callback: (count: number) => void): Unsubscribe {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    callback(snapshot.size);
  });
}

export async function updateUserRole(uid: string, role: 'admin' | 'trainer' | 'client'): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() });
}

export async function deleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
  window.location.href = '/login';
}

export async function loadUserProfile(uid: string): Promise<{ role: string } | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return { role: docSnap.data().role || 'admin' };
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================
// Renderizado de componentes HTML
// ============================================================

export function renderUserCard(user: AdminUser, showActions: boolean = false): string {
  const badge = getRoleBadge(user.role);
  const name = user.name || 'Sin nombre';
  const email = user.email || '';
  const createdAt = formatDate(user.createdAt);

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-medium text-emerald-400">
            ${getUserInitial(name)}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-zinc-200 truncate">${escapeHtml(name)}</p>
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

export function renderUserCardExtended(user: AdminUser, showActions: boolean = false): string {
  const card = renderUserCard(user, showActions);
  const trainerName = user.assignedTrainerId || '-';
  const createdAt = formatDate(user.createdAt);

  // Replace the closing date line with extended info
  const dateLine = `<div class="mt-2 text-xs text-zinc-600">Registrado: ${createdAt}</div>`;
  const extendedInfo = `
    <div class="mt-2 flex items-center gap-4 text-xs text-zinc-600">
      <span>Registrado: ${createdAt}</span>
      <span>Trainer: ${trainerName}</span>
    </div>
  `;
  return card.replace(dateLine, extendedInfo);
}

export function renderUserActions(uid: string): string {
  return `
    <div class="relative inline-block">
      <button onclick="window.__toggleRoleMenu('${uid}')" class="rounded-lg border border-zinc-700/50 bg-zinc-800/80 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
        Cambiar Rol
      </button>
      <div id="role-menu-${uid}" class="absolute right-0 top-full mt-1 z-50 hidden w-36 rounded-xl border border-zinc-700/50 bg-zinc-900 p-1 shadow-xl backdrop-blur-xl">
        <button onclick="window.__changeRole('${uid}', 'admin')" class="w-full rounded-lg px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">Admin</button>
        <button onclick="window.__changeRole('${uid}', 'trainer')" class="w-full rounded-lg px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">Trainer</button>
        <button onclick="window.__changeRole('${uid}', 'client')" class="w-full rounded-lg px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">Client</button>
      </div>
    </div>
    <button onclick="window.__deleteUser('${uid}')" class="rounded-lg border border-red-900/30 bg-red-500/10 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
      Eliminar
    </button>
  `;
}

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

export function renderLoadingState(): string {
  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-8 text-center backdrop-blur-sm">
      <p class="text-sm text-zinc-500">Cargando...</p>
    </div>
  `;
}

export function renderTrainerCard(trainer: AdminUser): string {
  const name = trainer.name || 'Sin nombre';
  const email = trainer.email || '';
  const createdAt = formatDate(trainer.createdAt);
  const clientCount = (trainer as any).clientCount || 0;

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm">
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
          <span class="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">Trainer</span>
        </div>
      </div>
      <div class="mt-2 text-xs text-zinc-600">Registrado: ${createdAt}</div>
    </div>
  `;
}

export function renderClientCard(client: AdminUser): string {
  const name = client.name || 'Sin nombre';
  const email = client.email || '';
  const createdAt = formatDate(client.createdAt);
  const trainerId = client.assignedTrainerId || null;

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-medium text-emerald-400">
            ${getUserInitial(name)}
          </div>
          <div>
            <p class="text-sm font-medium text-zinc-200">${escapeHtml(name)}</p>
            <p class="text-xs text-zinc-500">${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">Client</span>
          ${trainerId
            ? '<span class="text-xs text-zinc-600">Con trainer</span>'
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

export function initGlobalActions(): void {
  (window as any).__toggleRoleMenu = function(uid: string) {
    const menu = document.getElementById(`role-menu-${uid}`);
    if (menu) menu.classList.toggle('hidden');
  };

  (window as any).__changeRole = async function(uid: string, role: 'admin' | 'trainer' | 'client') {
    try {
      await updateUserRole(uid, role);
      document.querySelectorAll('[id^="role-menu-"]').forEach(el => el.classList.add('hidden'));
    } catch (err) {
      console.error('Error changing role:', err);
      alert('Error al cambiar el rol');
    }
  };

  (window as any).__deleteUser = async function(uid: string) {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;
    try {
      await deleteUser(uid);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Error al eliminar el usuario');
    }
  };
}
