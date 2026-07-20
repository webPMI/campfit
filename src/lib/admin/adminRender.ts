/**
 * Funciones de renderizado de componentes HTML para el panel de administración.
 *
 * @module adminRender
 */

import { escapeHtml, getUserInitial, formatDate } from '@/lib/shared/ui';
import type { AdminUser } from './types';

/**
 * Renderiza una fila de usuario en la lista.
 */
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

/**
 * Renderiza el detalle de un usuario.
 */
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

/**
 * Renderiza el formulario de creación/edición de usuario.
 */
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
