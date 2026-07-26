/**
 * Funciones de renderizado de componentes HTML para el panel de entrenador.
 * Theme-aware: utiliza CSS variables para adaptarse a dark/light mode.
 *
 * @module trainerRender
 */

import { escapeHtml, getUserInitial, formatTime } from '@/lib/shared/ui';
import type { TrainerClient, TrainerWorkout, TrainerDiet, TrainerMessage } from './types';

/**
 * Renderiza una tarjeta de cliente.
 */
export function renderClientCard(client: TrainerClient, onclick?: string): string {
  const name = client.name || 'Sin nombre';
  const email = client.email || '';
  const hasAlert = client.hasActiveAlert;
  const initial = getUserInitial(name);
  const isAdmin = client.role === 'admin';
  const avatarBg = isAdmin
    ? 'bg-[var(--accent-purple-dim)] bg-purple-500/10 text-[var(--accent-purple)]'
    : 'bg-[var(--brand-dim)] bg-emerald-500/10 text-[var(--brand)]';

  return `
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 backdrop-blur-sm transition-all hover:border-[var(--border-strong)] ${onclick ? 'cursor-pointer hover:bg-[var(--surface-2)]' : ''}"
         ${onclick ? `onclick="${onclick}"` : ''}>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium ${avatarBg}">
            ${initial}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-[var(--text-primary)] truncate">${escapeHtml(name)}</p>
              ${hasAlert ? '<span class="h-2 w-2 rounded-full bg-[var(--danger)] bg-red-500 animate-pulse" title="Alerta activa"></span>' : ''}
              ${isAdmin ? '<span class="rounded-full bg-[var(--accent-purple-dim)] bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent-purple)] border border-[var(--accent-purple)] border-opacity-30">Admin</span>' : ''}
            </div>
            <p class="text-xs text-[var(--text-tertiary)] truncate">${escapeHtml(email)}</p>
          </div>
        </div>
        <svg class="h-4 w-4 text-[var(--text-tertiary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </div>
  `;
}

/**
 * Renderiza una tarjeta de rutina.
 */
export function renderWorkoutCard(workout: TrainerWorkout): string {
  const isTemplate = workout.isTemplate || workout.clientId === 'template';
  const templateBadge = isTemplate
    ? `<span class="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-400 border border-purple-500/20">✨ Plantilla</span>`
    : '';

  return `
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 backdrop-blur-sm transition-all hover:border-[var(--border-strong)]">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-[var(--text-primary)]">${escapeHtml(workout.name)}</p>
          <p class="text-xs text-[var(--text-tertiary)]">${workout.exercises?.length || 0} ejercicios · ${workout.difficulty || 'custom'}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-[var(--info-dim)] px-2 py-0.5 text-xs font-medium text-[var(--info)] border border-[var(--info)] border-opacity-30">${workout.exercises?.length || 0} ej.</span>
        </div>
      </div>
      <div class="mt-2 text-xs text-[var(--text-secondary)]">${workout.description ? escapeHtml(workout.description.substring(0, 80)) + (workout.description.length > 80 ? '...' : '') : ''}</div>
    </div>
  `;
}

/**
 * Renderiza una tarjeta de dieta.
 */
export function renderDietCard(diet: TrainerDiet): string {
  const isTemplate = diet.isTemplate || diet.clientId === 'template';
  const templateBadge = isTemplate
    ? `<span class="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-400 border border-purple-500/20">✨ Plantilla</span>`
    : '';

  return `
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 backdrop-blur-sm transition-all hover:border-[var(--border-strong)]">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-[var(--text-primary)]">${escapeHtml(diet.name)}</p>
          <p class="text-xs text-[var(--text-tertiary)]">${diet.meals?.length || 0} comidas · ${diet.totalCalories || 0} kcal</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-[var(--warning-dim)] px-2 py-0.5 text-xs font-medium text-[var(--warning)] border border-[var(--warning)] border-opacity-30">${diet.totalCalories || 0} kcal</span>
        </div>
      </div>
      <div class="mt-2 text-xs text-[var(--text-secondary)]">Tipo: ${diet.type || 'normal'}</div>
    </div>
  `;
}

/**
 * Renderiza una burbuja de mensaje.
 */
export function renderMessageBubble(
  message: TrainerMessage,
  isOwn: boolean,
  showSenderName: string,
  isFirstOfBlock: boolean,
): string {
  const align = isOwn ? 'ml-auto' : 'mr-auto';
  const bg = isOwn
    ? 'bg-[var(--brand-dim)] bg-emerald-500/20 border-[var(--border-brand)] text-[var(--text-primary)]'
    : 'bg-[var(--surface-2)] bg-zinc-800/60 border-[var(--border-subtle)] text-[var(--text-primary)]';
  const rounded = isOwn
    ? 'rounded-2xl rounded-br-sm'
    : 'rounded-2xl rounded-bl-sm';
  const time = formatTime(message.createdAt);

  const alertBadge =
    message.type === 'alert'
      ? `<div class="mt-1 flex items-center gap-1 text-xs text-[var(--danger)] text-red-400">
           <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
           </svg>
           Llamado de atención
         </div>`
      : '';

  return `
    <div class="max-w-[80%] ${align}">
      ${isFirstOfBlock && !isOwn ? `<p class="mb-1 text-xs text-[var(--text-tertiary)]">${escapeHtml(showSenderName)}</p>` : ''}
      <div class="border px-4 py-2.5 ${bg} ${rounded}">
        <p class="text-sm text-[var(--text-primary)]">${escapeHtml(message.content)}</p>
        ${alertBadge}
        <p class="mt-1 text-right text-[10px] text-[var(--text-tertiary)]">${time}</p>
      </div>
    </div>
  `;
}
