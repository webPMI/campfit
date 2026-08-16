/**
 * Funciones de renderizado de componentes HTML para el panel de entrenador.
 * Theme-aware: utiliza CSS variables para adaptarse a dark/light mode.
 *
 * @module trainerRender
 */

import { escapeHtml, getUserInitial, formatTime } from '@/lib/shared/ui';
import { t } from '@/i18n/client';
import type { TrainerClient, TrainerWorkout, TrainerDiet, TrainerMessage } from './types';

/**
 * Renderiza una tarjeta de cliente con Radar de Alertas alimentarias/clínicas.
 */
export function renderClientCard(client: TrainerClient, onclick?: string): string {
  const name = client.name || t('common.unnamed') || 'Sin nombre';
  const email = client.email || '';
  const hasAlert = client.hasActiveAlert;
  const initial = getUserInitial(name);
  const isAdmin = client.role === 'admin';
  const avatarBg = isAdmin
    ? 'bg-[var(--accent-purple-dim)] bg-purple-500/10 text-[var(--accent-purple)]'
    : 'bg-[var(--brand-dim)] bg-emerald-500/10 text-[var(--brand)]';

  const hasAllergies = (client.medicalProfile?.allergies && client.medicalProfile.allergies.length > 0) ||
    (client.medicalProfile?.intolerances && client.medicalProfile.intolerances.length > 0);

  return `
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 backdrop-blur-sm transition-all hover:border-[var(--border-strong)] ${onclick ? 'cursor-pointer hover:bg-[var(--surface-2)]' : ''}"
         ${onclick ? `onclick="${onclick}"` : ''}>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium ${avatarBg}">
            ${initial}
            ${hasAlert ? `<span class="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-[var(--surface-1)] animate-ping" title="Alerta activa"></span><span class="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-[var(--surface-1)]" title="Alerta activa"></span>` : ''}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm font-medium text-[var(--text-primary)] truncate">${escapeHtml(name)}</p>
              ${hasAlert ? `<span class="px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30 flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>Alerta activa</span>` : ''}
              ${hasAllergies ? `<span class="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30" title="Cliente con alergias o intolerancias">⚠️ Alergias</span>` : ''}
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
 * Renderiza una tarjeta de rutina con verificación de semillas.
 */
export function renderWorkoutCard(workout: TrainerWorkout): string {
  const exercisesText = t('workout.exercises') || 'ejercicios';
  const exAbbrText = t('workout.exAbbr') || 'ej.';
  const hasSeeds = workout.exercises?.some((e) => e.seedVerified || e.exerciseId);

  return `
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 backdrop-blur-sm transition-all hover:border-[var(--border-strong)]">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-[var(--text-primary)]">${escapeHtml(workout.name)}</p>
            ${hasSeeds ? `<span class="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">🌱 Semilla</span>` : `<span class="px-1.5 py-0.5 rounded bg-zinc-700/30 text-zinc-400 text-[10px] font-medium border border-zinc-700">✏️ Personalizado</span>`}
          </div>
          <p class="text-xs text-[var(--text-tertiary)] mt-0.5">${workout.exercises?.length || 0} ${exercisesText} · ${workout.difficulty || 'custom'}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-[var(--info-dim)] px-2 py-0.5 text-xs font-medium text-[var(--info)] border border-[var(--info)] border-opacity-30">${workout.exercises?.length || 0} ${exAbbrText}</span>
        </div>
      </div>
      <div class="mt-2 text-xs text-[var(--text-secondary)]">${workout.description ? escapeHtml(workout.description.substring(0, 80)) + (workout.description.length > 80 ? '...' : '') : ''}</div>
    </div>
  `;
}

/**
 * Renderiza una tarjeta de dieta con badges de Semillas y Advertencias de Alérgenos.
 */
export function renderDietCard(diet: TrainerDiet): string {
  const mealsText = t('diet.meals') || 'comidas';
  const typeText = t('common.type') || 'Tipo';
  const hasSeeds = diet.meals?.some((m) => m.seedVerified || m.foodId);
  const hasWarnings = diet.hasValidationWarnings || (diet.validationReport?.hasWarnings);

  return `
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 backdrop-blur-sm transition-all hover:border-[var(--border-strong)]">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <p class="text-sm font-medium text-[var(--text-primary)]">${escapeHtml(diet.name)}</p>
            ${hasSeeds ? `<span class="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">🌱 Semilla</span>` : `<span class="px-1.5 py-0.5 rounded bg-zinc-700/30 text-zinc-400 text-[10px] font-medium border border-zinc-700">✏️ Personalizado</span>`}
            ${hasWarnings ? `<span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">⚠️ Revisar Alérgenos</span>` : ''}
          </div>
          <p class="text-xs text-[var(--text-tertiary)] mt-0.5">${diet.meals?.length || 0} ${mealsText} · ${diet.totalCalories || 0} kcal</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-[var(--warning-dim)] px-2 py-0.5 text-xs font-medium text-[var(--warning)] border border-[var(--warning)] border-opacity-30">${diet.totalCalories || 0} kcal</span>
        </div>
      </div>
      <div class="mt-2 text-xs text-[var(--text-secondary)]">${typeText}: ${diet.type || 'normal'}</div>
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
           ${escapeHtml(t('trainer.attentionAlert') || 'Llamado de atención')}
         </div>`
      : '';

  const mediaContent =
    message.mediaUrl
      ? message.mediaType === 'image'
        ? `<img src="${escapeHtml(message.mediaUrl)}" alt="Adjunto" class="mt-2 max-w-full rounded-lg max-h-48 object-cover" loading="lazy" />`
        : message.mediaType === 'video'
          ? `<video src="${escapeHtml(message.mediaUrl)}" controls class="mt-2 max-w-full rounded-lg max-h-48"></video>`
          : ''
      : '';

  return `
    <div class="flex flex-col ${align} max-w-[80%] ${isFirstOfBlock ? 'mt-3' : 'mt-1'}">
      ${!isOwn && isFirstOfBlock && showSenderName ? `<span class="mb-1 text-xs text-[var(--text-tertiary)]">${escapeHtml(showSenderName)}</span>` : ''}
      <div class="rounded-2xl border p-3 ${bg} ${rounded}">
        <p class="text-sm leading-relaxed">${escapeHtml(message.content)}</p>
        ${alertBadge}
        ${mediaContent}
        <span class="mt-1 block text-right text-[10px] text-[var(--text-tertiary)]">${time}</span>
      </div>
    </div>
  `;
}
