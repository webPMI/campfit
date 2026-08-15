/**
 * Detecta la página actual y los formularios disponibles.
 *
 * @module devtools/detector
 */

import type { PageId, PageHandler, AutofillProfile } from './types';

/**
 * Detecta el PageId según el path actual.
 */
export function detectPageId(): PageId {
  const path = window.location.pathname;

  // Páginas públicas
  if (path === '/' || path === '/index') return 'index';
  if (path.startsWith('/login')) return 'login';
  if (path.startsWith('/register')) return 'register';
  if (path.startsWith('/recover')) return 'recover';
  if (path.startsWith('/onboarding')) return 'onboarding';

  // Cliente
  if (path.startsWith('/client/dashboard')) return 'client-dashboard';
  if (path.startsWith('/client/workouts')) return 'client-workouts';
  if (path.startsWith('/client/diets')) return 'client-diets';
  if (path.startsWith('/client/progress')) return 'client-progress';
  if (path.startsWith('/client/chat')) return 'client-chat';
  if (path.startsWith('/client/settings')) return 'client-settings';
  if (path.startsWith('/client/support')) return 'client-support';
  if (path.startsWith('/client/medical-profile')) return 'client-medical';

  // Admin
  if (path.startsWith('/admin/dashboard')) return 'admin-dashboard';
  if (path.startsWith('/admin/users')) return 'admin-users';
  // /admin/clients ahora redirige a /admin/users (fusión Users/Clients)
  if (path.startsWith('/admin/clients')) return 'admin-users';
  if (path.startsWith('/admin/trainers')) return 'admin-trainers';
  if (path.startsWith('/admin/settings')) return 'admin-settings';
  if (path.startsWith('/admin/workouts')) return 'admin-workouts';
  if (path.startsWith('/admin/diets')) return 'admin-diets';
  if (path.startsWith('/admin/progress')) return 'admin-progress';
  if (path.startsWith('/admin/chat')) return 'admin-chat';
  if (path.startsWith('/admin/clinical')) return 'admin-clinical';

  // Trainer
  if (path.startsWith('/trainer/dashboard')) return 'trainer-dashboard';
  if (path.startsWith('/trainer/clients')) return 'trainer-clients';
  if (path.startsWith('/trainer/workouts')) return 'trainer-workouts';
  if (path.startsWith('/trainer/diets')) return 'trainer-diets';
  if (path.startsWith('/trainer/chat')) return 'trainer-chat';
  if (path.startsWith('/trainer/settings')) return 'trainer-settings';
  if (path.startsWith('/trainer/clinical')) return 'trainer-clinical';

  return 'unknown';
}

/**
 * Rellena campos de un formulario usando los selectores y valores dados.
 * Soporta inputs, selects, textareas y checkboxes.
 */
export function autofillFields(fields: Record<string, string>): void {
  for (const [selector, value] of Object.entries(fields)) {
    try {
      const el = document.querySelector(selector);
      if (!el) {
        console.warn(`[DevTools] Selector no encontrado: ${selector}`);
        continue;
      }

      if (el instanceof HTMLInputElement) {
        if (el.type === 'checkbox') {
          el.checked = value === 'true';
        } else {
          // Desactivar temporalmente el autocompletado del navegador
          const prevAutocomplete = el.getAttribute('autocomplete');
          el.setAttribute('autocomplete', 'off');
          
          // Usar el setter nativo del prototipo para evitar la interceptación de Chrome
          const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          )?.set;
          try {
            if (nativeSetter) {
              nativeSetter.call(el, value);
            }
          } catch {
            // Fallback: setter directo
            try { el.value = value; } catch { /* ignorar */ }
          }
          
          // Restaurar autocomplete
          if (prevAutocomplete) {
            el.setAttribute('autocomplete', prevAutocomplete);
          } else {
            el.removeAttribute('autocomplete');
          }
          
          // Solo disparamos un evento custom (no 'input' ni 'change' — Chrome los intercepta)
          el.dispatchEvent(new CustomEvent('devtools:autofill', { bubbles: true, composed: true, detail: { field: selector } }));
        }
      } else if (el instanceof HTMLSelectElement) {
        el.value = value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (el instanceof HTMLTextAreaElement) {
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch (e) {
      console.warn(`[DevTools] Error rellenando ${selector}:`, e);
    }
  }

  // Guardar el último email/contraseña SOLO desde el registro
  if (window.location.pathname.startsWith('/register')) {
    const email = fields['#email'] ?? fields['email'];
    if (email) {
      sessionStorage.setItem('__cf_last_email', email);
    }
    const pwd = fields['#password'] ?? fields['password'];
    if (pwd) {
      sessionStorage.setItem('__cf_last_password', pwd);
    }
  }
}

/**
 * Obtiene el último email usado en autocompletar.
 */
export function getLastAutofillEmail(): string | null {
  return sessionStorage.getItem('__cf_last_email');
}

/**
 * Obtiene la última contraseña usada en autocompletar.
 */
export function getLastAutofillPassword(): string | null {
  return sessionStorage.getItem('__cf_last_password');
}

/**
 * Limpia sessionStorage y localStorage.
 */
export function clearAllStorage(): void {
  sessionStorage.clear();
  localStorage.clear();
  console.log('[DevTools] sessionStorage y localStorage limpiados');
}

/**
 * Cierra sesión y vuelve a /login.
 */
export function forceLogout(): void {
  clearAllStorage();
  window.location.href = '/login';
}