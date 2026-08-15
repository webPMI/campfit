/**
 * Componentes de UI compartidos para toda la aplicación.
 * Proporciona iconos SVG, utilidades de renderizado, toast y formateo.
 * Theme-aware: utiliza CSS custom properties para adaptarse a dark/light.
 * Reemplaza las implementaciones duplicadas en adminUtils.ts y trainerUtils.ts.
 *
 * @module shared/ui
 */

// ============================================================
// Iconos SVG compartidos (Lucide-style)
// ============================================================

export const ICONS = {
  users: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />',
  trainers: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />',
  clients: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.38a48.474 48.474 0 0 0-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />',
  workouts: '<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />',
  diets: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.38a48.474 48.474 0 0 0-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />',
  alert: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />',
  check: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />',
  chat: '<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />',
  progress: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />',
  settings: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />',
  plus: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />',
  search: '<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />',
  arrowLeft: '<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />',
  x: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />',
} as const;

// ============================================================
// Tipos
// ============================================================

export interface ToastOptions {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id?: string;
  duration?: number;
  position?: 'bottom' | 'top';
}

export interface RoleBadge {
  label: string;
  class: string;
}

// ============================================================
// Utilidades de texto
// ============================================================

/**
 * Escapa texto HTML para prevenir XSS.
 * Usa reemplazos directos de strings en lugar de DOM para ser compatible
 * con entornos sin navegador (Node, Vitest, etc.).
 * @param text - Texto a escapar
 * @returns Texto escapado
 */
export function escapeHtml(text: string): string {
  const amp = String.fromCharCode(38, 97, 109, 112, 59);
  const lt = String.fromCharCode(38, 108, 116, 59);
  const gt = String.fromCharCode(38, 103, 116, 59);
  const quot = String.fromCharCode(38, 113, 117, 111, 116, 59);
  const apos = String.fromCharCode(38, 35, 120, 50, 55, 59);
  const map: Record<string, string> = {
    '&': amp,
    '<': lt,
    '>': gt,
    '"': quot,
    "'": apos,
  };
  return text.replace(/[&<>"']/g, (ch) => map[ch] || ch);
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
 * Formatea un timestamp de Firestore a hora local.
 * @param timestamp - Timestamp de Firestore
 * @returns Hora formateada o ''
 */
export function formatTime(timestamp: { toDate: () => Date } | null | undefined): string {
  if (!timestamp?.toDate) return '';
  try {
    return timestamp.toDate().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
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

// ============================================================
// Badge de rol
// ============================================================

/**
 * Obtiene la badge visual para un rol de usuario.
 * Theme-aware: usa CSS variables para adaptarse a dark/light.
 * @param role - Rol del usuario
 * @returns Objeto con label y clases CSS
 */
export function getRoleBadge(role: string): RoleBadge {
  switch (role) {
    case 'admin':
      return {
        label: 'Admin',
        class: 'bg-[var(--accent-purple-dim)] text-[var(--accent-purple)] border border-[var(--accent-purple)] border-opacity-30',
      };
    case 'trainer':
      return {
        label: 'Trainer',
        class: 'bg-[var(--info-dim)] text-[var(--info)] border border-[var(--info)] border-opacity-30',
      };
    case 'client':
      return {
        label: 'Client',
        class: 'bg-[var(--brand-dim)] text-[var(--brand)] border border-[var(--brand)] border-opacity-30',
      };
    default:
      return {
        label: role,
        class: 'bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-default)]',
      };
  }
}

// ============================================================
// Toast de notificación (theme-aware modern)
// ============================================================

/**
 * Muestra un toast de notificación en la interfaz.
 * Theme-aware: se adapta automáticamente a dark/light.
 * @param options - Opciones del toast
 */
export function showToast({
  message,
  type,
  id = 'app-toast',
  duration = 3000,
  position = 'bottom',
}: ToastOptions): void {
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = id;
  container.className = 'fixed left-1/2 z-50 -translate-x-1/2 animate-[toastIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)_forwards]';
  container.style.cssText = position === 'top' ? 'top: 1.5rem;' : 'bottom: 6rem;';

  // SVG icons for each type
  const icons: Record<string, string> = {
    success: '<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>',
    error: '<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    warning: '<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>',
  };

  // Theme-aware toast styling using CSS variables
  const toast = document.createElement('div');
  toast.className = [
    'flex items-center gap-2.5 px-4 py-2.5',
    'rounded-2xl border shadow-[var(--shadow-lg)]',
    'text-sm font-medium',
    'backdrop-blur-xl',
  ].join(' ');

  // Use CSS variables for theme-aware colors
  const typeStyles: Record<string, string> = {
    success: 'bg-[var(--success-dim)] border-[var(--success)] text-[var(--success)]',
    error: 'bg-[var(--danger-dim)] border-[var(--danger)] text-[var(--danger)]',
    info: 'bg-[var(--info-dim)] border-[var(--info)] text-[var(--info)]',
    warning: 'bg-[var(--warning-dim)] border-[var(--warning)] text-[var(--warning)]',
  };

  toast.style.cssText = toast.className;
  // Re-apply with style for the dynamic classes
  toast.className = ''; // reset
  toast.setAttribute('style', '');

  // Build manually for reliable styling
  toast.innerHTML = `
    <span class="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shadow-[var(--shadow-lg)] text-sm font-medium backdrop-blur-xl ${typeStyles[type]}">
      ${icons[type] || icons.info}
      <span>${escapeHtml(message)}</span>
    </span>
  `;

  container.appendChild(toast.firstElementChild || toast);
  document.body.appendChild(container);

  setTimeout(() => {
    container.style.animation = 'toastOut 0.25s ease-in forwards';
    setTimeout(() => container.remove(), 260);
  }, duration);
}

// ============================================================
// Estados de UI (theme-aware)
// ============================================================

/**
 * Renderiza un estado vacío con icono y mensaje.
 * Theme-aware: se adapta a dark/light mode.
 * @param icon - SVG path del icono
 * @param message - Mensaje a mostrar
 * @returns HTML del estado vacío
 */
export function renderEmptyState(icon: string, message: string): string {
  return `
    <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-8 text-center animate-fade-in">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-4)]">
        <svg class="h-8 w-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          ${icon}
        </svg>
      </div>
      <p class="text-sm font-medium text-[var(--text-secondary)]">${message}</p>
    </div>
  `;
}

/**
 * Renderiza un estado de carga con shimmer skeleton.
 * Theme-aware: se adapta a dark/light mode.
 * @param message - Mensaje opcional (default: 'Cargando...')
 * @returns HTML del estado de carga
 */
export function renderLoadingState(message: string = 'Cargando...'): string {
  return `
    <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-6 text-center animate-fade-in">
      <div class="flex items-center justify-center gap-3">
        <svg class="h-5 w-5 animate-spin text-[var(--brand)]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-sm font-medium text-[var(--text-secondary)]">${message}</p>
      </div>
    </div>
  `;
}

/**
 * Renderiza un estado de error con opción de retry.
 * Theme-aware: se adapta a dark/light mode.
 * @param message - Mensaje de error
 * @param retryFn - Función a ejecutar en click (nombre global o inline)
 * @returns HTML del estado de error
 */
export function renderErrorState(message: string, retryFn?: string): string {
  return `
    <div class="rounded-2xl border border-[var(--danger-dim)] bg-[var(--surface-2)] p-6 text-center animate-fade-in">
      <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--danger-dim)]">
        <svg class="h-7 w-7 text-[var(--danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p class="text-sm font-medium text-[var(--danger)] mb-3">${message}</p>
      ${retryFn ? `<button onclick="${retryFn}" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--surface-4)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--surface-5)] transition-colors">Reintentar</button>` : ''}
    </div>
  `;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export interface SelectModalOptions {
  title: string;
  message?: string;
  options: Array<{ value: string; label: string; sublabel?: string }>;
  confirmText?: string;
  cancelText?: string;
}

/**
 * Muestra un modal de confirmación accesible, elegante y no bloqueante.
 * Reemplaza totalmente a window.confirm().
 */
export function showConfirm(options: ConfirmOptions): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (typeof (window as any).showConfirm === 'function') {
    return (window as any).showConfirm(options);
  }

  return new Promise((resolve) => {
    const existing = document.getElementById('campfit-confirm-dynamic-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'campfit-confirm-dynamic-modal';
    overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in';

    const variant = options.variant || 'danger';
    const isDanger = variant === 'danger';
    const isWarning = variant === 'warning';
    const accentColor = isDanger ? 'border-red-500/40 bg-red-500/10 text-red-400' : isWarning ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-blue-500/40 bg-blue-500/10 text-blue-400';
    const btnConfirmClass = isDanger ? 'bg-red-600 hover:bg-red-500 text-white' : isWarning ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white';

    overlay.innerHTML = `
      <div class="w-full max-w-md rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-6 shadow-2xl backdrop-blur-xl animate-scale-in">
        <div class="flex items-start gap-4">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${accentColor}">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div class="flex-1 space-y-1">
            <h3 class="text-base font-bold text-[var(--text-primary)]">${escapeHtml(options.title)}</h3>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed">${escapeHtml(options.message)}</p>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2.5">
          <button id="cf-modal-cancel" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-3)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer">
            ${escapeHtml(options.cancelText || 'Cancelar')}
          </button>
          <button id="cf-modal-confirm" class="rounded-xl ${btnConfirmClass} px-4 py-2 text-xs font-bold transition-all shadow-lg cursor-pointer">
            ${escapeHtml(options.confirmText || 'Confirmar')}
          </button>
        </div>
      </div>
    `;

    function cleanup(result: boolean) {
      overlay.remove();
      document.removeEventListener('keydown', handleKey);
      resolve(result);
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') cleanup(false);
      if (e.key === 'Enter') cleanup(true);
    }

    document.addEventListener('keydown', handleKey);
    overlay.querySelector('#cf-modal-cancel')?.addEventListener('click', () => cleanup(false));
    overlay.querySelector('#cf-modal-confirm')?.addEventListener('click', () => cleanup(true));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(false); });

    document.body.appendChild(overlay);
  });
}

/**
 * Muestra un modal de selección interactivo con opciones visuales.
 * Reemplaza totalmente a window.prompt().
 */
export function showSelectModal(options: SelectModalOptions): Promise<string | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);

  return new Promise((resolve) => {
    const existing = document.getElementById('campfit-select-dynamic-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'campfit-select-dynamic-modal';
    overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in';

    overlay.innerHTML = `
      <div class="w-full max-w-md rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-6 shadow-2xl backdrop-blur-xl animate-scale-in flex flex-col max-h-[80vh]">
        <div class="space-y-1 mb-4">
          <h3 class="text-base font-bold text-[var(--text-primary)]">${escapeHtml(options.title)}</h3>
          ${options.message ? `<p class="text-xs text-[var(--text-secondary)]">${escapeHtml(options.message)}</p>` : ''}
        </div>

        <div class="flex-1 overflow-y-auto space-y-2 pr-1 mb-6">
          ${options.options.map((opt) => `
            <button data-opt-value="${opt.value}" class="w-full text-left rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all flex items-center justify-between group cursor-pointer">
              <div>
                <p class="text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-400">${escapeHtml(opt.label)}</p>
                ${opt.sublabel ? `<p class="text-[11px] text-[var(--text-tertiary)] mt-0.5">${escapeHtml(opt.sublabel)}</p>` : ''}
              </div>
              <span class="text-amber-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Seleccionar →</span>
            </button>
          `).join('')}
        </div>

        <div class="flex justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
          <button id="cf-select-cancel" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-3)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer">
            ${escapeHtml(options.cancelText || 'Cancelar')}
          </button>
        </div>
      </div>
    `;

    function cleanup(result: string | null) {
      overlay.remove();
      document.removeEventListener('keydown', handleKey);
      resolve(result);
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') cleanup(null);
    }

    document.addEventListener('keydown', handleKey);
    overlay.querySelector('#cf-select-cancel')?.addEventListener('click', () => cleanup(null));
    overlay.querySelectorAll('[data-opt-value]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-opt-value');
        cleanup(val);
      });
    });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(null); });

    document.body.appendChild(overlay);
  });
}
