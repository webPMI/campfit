/**
 * Funciones de renderizado de componentes HTML para el panel de administración.
 * Theme-aware: utiliza CSS variables para adaptarse automáticamente a dark/light mode.
 *
 * @module adminRender
 */

import { escapeHtml, getUserInitial, formatDate } from '@/lib/shared/ui';
import type { AdminUser } from './types';

/**
 * Renderiza una fila de usuario en la lista.
 */
export function renderUserRow(user: AdminUser, extraActionsOrOnClick?: string): string {
  const name = user.name || 'Sin nombre';
  const email = user.email || '';
  const initial = getUserInitial(name);
  const roleColors: Record<string, string> = {
    admin: 'bg-[var(--accent-purple-dim)] bg-purple-500/10 text-[var(--accent-purple)] text-purple-400 border-[var(--accent-purple)] border-purple-500/20',
    trainer: 'bg-[var(--info-dim)] bg-blue-500/10 text-[var(--info)] text-blue-400 border-[var(--info)] border-blue-500/20',
    client: 'bg-[var(--brand-dim)] bg-emerald-500/10 text-[var(--brand)] text-emerald-400 border-[var(--brand)] border-emerald-500/20',
  };
  const roleColor = roleColors[user.role] || 'bg-[var(--surface-3)] text-[var(--text-secondary)] border-[var(--border-default)]';

  const isHtml = extraActionsOrOnClick && extraActionsOrOnClick.trim().startsWith('<');
  const onClickAttr = extraActionsOrOnClick && !isHtml ? `onclick="${extraActionsOrOnClick}"` : '';
  const cursorClass = extraActionsOrOnClick && !isHtml ? 'cursor-pointer hover:border-[var(--border-strong)]' : '';
  const extraHtml = isHtml ? extraActionsOrOnClick : '';

  return `
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 backdrop-blur-sm transition-all hover:border-[var(--border-strong)] ${cursorClass}" ${onClickAttr}>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium bg-[var(--surface-3)] text-[var(--text-primary)]">
            ${initial}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-[var(--text-primary)] truncate">${escapeHtml(name)}</p>
              ${user.hasActiveAlert ? '<span class="h-2 w-2 rounded-full bg-[var(--danger)] bg-red-500 animate-pulse" title="Alerta activa"></span>' : ''}
            </div>
            <p class="text-xs text-[var(--text-tertiary)] truncate">${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="rounded-full px-2 py-0.5 text-[10px] font-medium border border-opacity-30 ${roleColor}">${user.role}</span>
          ${extraHtml}
          <svg class="h-4 w-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-6 backdrop-blur-sm">
      <div class="flex items-center gap-4">
        <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold bg-gradient-to-br from-[var(--brand-hover)] to-[var(--brand)] text-[var(--text-on-brand)] shadow-[var(--shadow-glow-sm)]">
          ${initial}
        </div>
        <div>
          <h3 class="text-lg font-bold text-[var(--text-primary)]">${escapeHtml(name)}</h3>
          <p class="text-sm text-[var(--text-tertiary)]">${escapeHtml(email)}</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--accent-purple-dim)] text-[var(--accent-purple)] border border-[var(--accent-purple)] border-opacity-30">${user.role}</span>
            <span class="text-xs text-[var(--text-tertiary)]">Creado: ${date}</span>
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
        <label for="user-name" class="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Nombre completo</label>
        <input id="user-name" type="text" required
          class="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all focus:border-[var(--brand)] focus:bg-[var(--surface-3)] focus:shadow-[0_0_0_3px_var(--brand-dim)]"
          placeholder="Ej: Juan Pérez" />
      </div>
      <div>
        <label for="user-email" class="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
        <input id="user-email" type="email" required
          class="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all focus:border-[var(--brand)] focus:bg-[var(--surface-3)] focus:shadow-[0_0_0_3px_var(--brand-dim)]"
          placeholder="ejemplo@correo.com" />
      </div>
      <div>
        <label for="user-password" class="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Contraseña</label>
        <input id="user-password" type="password" required minlength="6"
          class="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all focus:border-[var(--brand)] focus:bg-[var(--surface-3)] focus:shadow-[0_0_0_3px_var(--brand-dim)]"
          placeholder="Mínimo 6 caracteres" />
      </div>
      <div>
        <label for="user-role" class="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Rol</label>
        <select id="user-role"
          class="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--brand)] focus:bg-[var(--surface-3)] focus:shadow-[0_0_0_3px_var(--brand-dim)]">
          <option value="client" ${selectedRole === 'client' ? 'selected' : ''}>Cliente</option>
          <option value="trainer" ${selectedRole === 'trainer' ? 'selected' : ''}>Entrenador</option>
          <option value="admin" ${selectedRole === 'admin' ? 'selected' : ''}>Administrador</option>
        </select>
      </div>
      <div id="trainer-assign-container" style="${selectedRole === 'client' ? '' : 'display:none'}">
        <label for="user-trainer" class="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Trainer asignado (opcional)</label>
        <select id="user-trainer"
          class="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--brand)] focus:bg-[var(--surface-3)] focus:shadow-[0_0_0_3px_var(--brand-dim)]">
          <option value="">Sin trainer</option>
          ${trainerOptions}
        </select>
      </div>
    </div>
  `;
}

/**
 * Renderiza una tarjeta de usuario compacta para el dashboard (sin chevron de navegación).
 */
export function renderUserCard(user: AdminUser): string {
  const name = user.name || 'Sin nombre';
  const email = user.email || '';
  const initial = getUserInitial(name);
  const roleColors: Record<string, string> = {
    admin: 'bg-[var(--accent-purple-dim)] bg-purple-500/10 text-[var(--accent-purple)] text-purple-400 border-[var(--accent-purple)] border-purple-500/20',
    trainer: 'bg-[var(--info-dim)] bg-blue-500/10 text-[var(--info)] text-blue-400 border-[var(--info)] border-blue-500/20',
    client: 'bg-[var(--brand-dim)] bg-emerald-500/10 text-[var(--brand)] text-emerald-400 border-[var(--brand)] border-emerald-500/20',
  };
  const roleColor = roleColors[user.role] || 'bg-[var(--surface-3)] text-[var(--text-secondary)] border-[var(--border-default)]';

  return `
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 backdrop-blur-sm transition-all hover:border-[var(--border-strong)]">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium bg-[var(--surface-3)] text-[var(--text-primary)]">
            ${initial}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-[var(--text-primary)] truncate">${escapeHtml(name)}</p>
              ${user.hasActiveAlert ? '<span class="h-2 w-2 rounded-full bg-[var(--danger)] bg-red-500 animate-pulse" title="Alerta activa"></span>' : ''}
            </div>
            <p class="text-xs text-[var(--text-tertiary)] truncate">${escapeHtml(email)}</p>
          </div>
        </div>
        <span class="rounded-full px-2 py-0.5 text-[10px] font-medium border border-opacity-30 ${roleColor} shrink-0">${user.role}</span>
      </div>
    </div>
  `;
}

/**
 * 🚨 CRITICAL: Renderiza una tarjeta de usuario extendida con chips de estado y botón de editar.
 * @protection Delega en renderUserRow para evitar duplicación de código.
 * @protection NO ELIMINAR el parámetro showEdit - Es usado por admin/users.astro para mostrar/ocultar el botón de editar.
 *
 * Chips mostrados (fusión Users/Clients):
 * - 🏋️ Entrenador asignado (o ⚠️ Sin entrenador)
 * - 🏋️ Rutinas (conteo)
 * - 🥗 Dietas (conteo)
 * - 🏥 Perfil médico (🟢/⚪)
 * - 🔒 Estado de cuenta (🟢 Activo / 🔴 Bloqueado)
 */
export function renderUserCardExtended(user: AdminUser, showEdit: boolean = false): string {
  const editBtn = showEdit ? `<button data-edit-user data-uid="${user.uid}" class="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-all">
    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  </button>` : '';

  // Chips de estado
  const trainerChip = user.assignedTrainerName
    ? `<span class="inline-flex items-center gap-1 rounded-full bg-[var(--info-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--info)] border border-[var(--info)] border-opacity-20">🏋️ Coach: ${escapeHtml(user.assignedTrainerName)}</span>`
    : `<span class="inline-flex items-center gap-1 rounded-full bg-[var(--warning-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--warning)] border border-[var(--warning)] border-opacity-20">⚠️ Sin entrenador</span>`;

  const workoutsChip = `<span class="inline-flex items-center gap-1 rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] border border-[var(--border-default)]">🏋️ Rutinas: ${user.workoutsCount ?? 0}</span>`;
  const dietsChip = `<span class="inline-flex items-center gap-1 rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] border border-[var(--border-default)]">🥗 Dietas: ${user.dietsCount ?? 0}</span>`;

  const medicalChip = user.medicalProfileComplete
    ? `<span class="inline-flex items-center gap-1 rounded-full bg-[var(--brand-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--brand)] border border-[var(--brand)] border-opacity-20">🟢 Perfil médico</span>`
    : `<span class="inline-flex items-center gap-1 rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-disabled)] border border-[var(--border-default)]">⚪ Perfil médico</span>`;

  const accountChip = user.isBlocked
    ? `<span class="inline-flex items-center gap-1 rounded-full bg-[var(--danger-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--danger)] border border-[var(--danger)] border-opacity-20">🔴 Bloqueado</span>`
    : `<span class="inline-flex items-center gap-1 rounded-full bg-[var(--brand-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--brand)] border border-[var(--brand)] border-opacity-20">🟢 Activo</span>`;

  const chips = `
    <div class="mt-3 flex flex-wrap gap-1.5">
      ${trainerChip}
      ${workoutsChip}
      ${dietsChip}
      ${medicalChip}
      ${accountChip}
    </div>`;

  // Inyectamos los chips dentro de la fila: renderUserRow dibuja la tarjeta base;
  // añadimos los chips envueltos en un contenedor extra.
  const base = renderUserRow(user, editBtn);
  // Insertamos los chips justo antes del cierre del div principal de la tarjeta.
  return base.replace('</div>\n    </div>', `${chips}\n    </div>\n    </div>`);
}

/**
 * Renderiza una tarjeta de cliente (para la página de clientes del admin).
 */
export function renderClientCard(client: AdminUser & { assignedTrainerName?: string }): string {
  const name = client.name || 'Sin nombre';
  const email = client.email || '';
  const initial = getUserInitial(name);
  const trainerName = client.assignedTrainerName || client.assignedTrainerId || 'Sin trainer';

  return `
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 backdrop-blur-sm transition-all hover:border-[var(--border-strong)]">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium bg-[var(--brand-dim)] bg-emerald-500/10 text-[var(--brand)] text-emerald-400">
            ${initial}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-[var(--text-primary)] truncate">${escapeHtml(name)}</p>
            <p class="text-xs text-[var(--text-tertiary)] truncate">${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p class="text-xs text-[var(--text-tertiary)]"><span data-i18n="admin.modal.field.trainer">Trainer</span>: <span class="text-[var(--text-secondary)] font-medium">${escapeHtml(trainerName)}</span></p>
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
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 backdrop-blur-sm transition-all hover:border-[var(--border-strong)]">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium bg-[var(--info-dim)] bg-blue-500/10 text-[var(--info)] text-blue-400">
            ${initial}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-[var(--text-primary)] truncate">${escapeHtml(name)}</p>
            <p class="text-xs text-[var(--text-tertiary)] truncate">${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p class="text-sm font-semibold text-[var(--info)] text-blue-400">${clientCount}</p>
          <p data-i18n="admin.totalClients" class="text-xs text-[var(--text-tertiary)]">clientes</p>
        </div>
      </div>
    </div>
  `;
}
