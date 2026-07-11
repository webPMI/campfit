/**
 * Componentes de UI compartidos para toda la aplicación.
 * Proporciona iconos SVG, utilidades de renderizado, toast y formateo.
 * Reemplaza las implementaciones duplicadas en adminUtils.ts y trainerUtils.ts.
 *
 * @module shared/ui
 */

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
  chat: '<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />',
  progress: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />',
} as const;

// ============================================================
// Tipos
// ============================================================

export interface ToastOptions {
  message: string;
  type: 'success' | 'error' | 'info';
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
  const amp = String.fromCharCode(38, 97, 109, 112, 59); // &
  const lt = String.fromCharCode(38, 108, 116, 59);   // <
  const gt = String.fromCharCode(38, 103, 116, 59);   // >
  const quot = String.fromCharCode(38, 113, 117, 111, 116, 59); // "
  const apos = String.fromCharCode(38, 35, 120, 50, 55, 59); // &#x27;
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
 * @param role - Rol del usuario
 * @returns Objeto con label y clases CSS
 */
export function getRoleBadge(role: string): RoleBadge {
  switch (role) {
    case 'admin':
      return { label: 'Admin', class: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
    case 'trainer':
      return { label: 'Trainer', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    case 'client':
      return { label: 'Client', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    default:
      return { label: role, class: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' };
  }
}

// ============================================================
// Toast de notificación
// ============================================================

/**
 * Muestra un toast de notificación en la interfaz.
 * @param options - Opciones del toast
 */
export function showToast({ message, type, id = 'app-toast', duration = 3000, position = 'bottom' }: ToastOptions): void {
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const colors = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    error: 'border-red-500/30 bg-red-500/10 text-red-400',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  };

  const positionClass = position === 'top' ? 'top-24' : 'bottom-24';

  const toast = document.createElement('div');
  toast.id = id;
  toast.className = `fixed ${positionClass} left-1/2 z-50 -translate-x-1/2 rounded-xl border px-6 py-3 text-sm font-medium backdrop-blur-xl shadow-2xl animate-slide-up ${colors[type]}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================
// Estados de UI
// ============================================================

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
 * @param message - Mensaje opcional (default: 'Cargando...')
 * @returns HTML del estado de carga
 */
export function renderLoadingState(message: string = 'Cargando...'): string {
  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-8 text-center backdrop-blur-sm">
      <div class="flex items-center justify-center gap-3">
        <svg class="h-5 w-5 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-sm text-zinc-500">${message}</p>
      </div>
    </div>
  `;
}
