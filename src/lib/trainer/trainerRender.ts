/**
 * Funciones de renderizado de componentes HTML para el panel de entrenador.
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
  const avatarBg = isAdmin ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400';

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60 ${onclick ? 'cursor-pointer hover:bg-zinc-800/40' : ''}"
         ${onclick ? `onclick="${onclick}"` : ''}>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium ${avatarBg}">
            ${initial}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-zinc-200 truncate">${escapeHtml(name)}</p>
              ${hasAlert ? '<span class="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Alerta activa"></span>' : ''}
              ${isAdmin ? '<span class="rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-400 border border-purple-500/20">Admin</span>' : ''}
            </div>
            <p class="text-xs text-zinc-500 truncate">${escapeHtml(email)}</p>
          </div>
        </div>
        <svg class="h-4 w-4 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-zinc-200">${escapeHtml(workout.name)}</p>
          <p class="text-xs text-zinc-500">${workout.exercises?.length || 0} ejercicios · ${workout.difficulty || 'custom'}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">${workout.exercises?.length || 0} ej.</span>
        </div>
      </div>
      <div class="mt-2 text-xs text-zinc-600">${workout.description ? escapeHtml(workout.description.substring(0, 80)) + (workout.description.length > 80 ? '...' : '') : ''}</div>
    </div>
  `;
}

/**
 * Renderiza una tarjeta de dieta.
 */
export function renderDietCard(diet: TrainerDiet): string {
  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-zinc-200">${escapeHtml(diet.name)}</p>
          <p class="text-xs text-zinc-500">${diet.meals?.length || 0} comidas · ${diet.totalCalories || 0} kcal</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400 border border-orange-500/20">${diet.totalCalories || 0} kcal</span>
        </div>
      </div>
      <div class="mt-2 text-xs text-zinc-600">Tipo: ${diet.type || 'normal'}</div>
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
    ? 'bg-emerald-500/20 border-emerald-500/20'
    : 'bg-zinc-800/60 border-zinc-700/40';
  const rounded = isOwn
    ? 'rounded-2xl rounded-br-sm'
    : 'rounded-2xl rounded-bl-sm';
  const time = formatTime(message.createdAt);

  const alertBadge =
    message.type === 'alert'
      ? `<div class="mt-1 flex items-center gap-1 text-xs text-red-400">
           <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
           </svg>
           Llamado de atención
         </div>`
      : '';

  return `
    <div class="max-w-[80%] ${align}">
      ${isFirstOfBlock && !isOwn ? `<p class="mb-1 text-xs text-zinc-500">${escapeHtml(showSenderName)}</p>` : ''}
      <div class="border px-4 py-2.5 ${bg} ${rounded}">
        <p class="text-sm text-zinc-200">${escapeHtml(message.content)}</p>
        ${alertBadge}
        <p class="mt-1 text-right text-[10px] text-zinc-500">${time}</p>
      </div>
    </div>
  `;
}
