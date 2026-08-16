/**
 * Panel UI del DevTools con Shadow DOM para aislamiento total.
 *
 * @module devtools/panel
 */

import { detectPageId, autofillFields, clearAllStorage, forceLogout, getLastAutofillEmail, getLastAutofillPassword } from './detector';
import { pageRegistry } from './autofillers';
import { getLogs, clearLogs, logsToText } from './logStore';
import { showToast, showConfirm } from '@/lib/shared/ui';
import type { AutofillProfile, DevToolsAction } from './types';

const DEVTOOLS_STORAGE_KEY = 'cf_devtools_open';

/**
 * Crea e inyecta el panel de DevTools en la página.
 * Usa Shadow DOM para aislamiento de estilos.
 */
export function initDevToolsPanel(): void {
  if (!import.meta.env.DEV) return;
  if (document.getElementById('__cf_devtools_host')) return;

  const host = document.createElement('div');
  host.id = '__cf_devtools_host';
  host.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;font-family:system-ui;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  render(shadow);

  const wasOpen = sessionStorage.getItem(DEVTOOLS_STORAGE_KEY) === 'true';
  if (wasOpen) {
    setTimeout(() => togglePanel(shadow, true), 500);
  }
}

function render(shadow: ShadowRoot): void {
  const pageId = detectPageId();
  const registry = pageRegistry[pageId] || { label: pageId, profiles: [], actions: [] };
  const profiles = registry.profiles || [];
  const actions = registry.actions || [];
  const logCount = getLogs().length;

  const lastRegisterHTML = pageId === 'login' ? buildLastRegisterProfile() : '';

  shadow.innerHTML = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .toggle-btn {
        width: 48px; height: 48px; border-radius: 50%;
        background: linear-gradient(135deg, #06b6d4, #3b82f6);
        border: none; color: white; font-size: 22px; cursor: pointer;
        box-shadow: 0 4px 15px rgba(6,182,212,0.4);
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex; align-items: center; justify-content: center; position: relative;
      }
      .toggle-btn:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(6,182,212,0.5); }
      .toggle-btn.open { transform: rotate(45deg); background: linear-gradient(135deg, #ef4444, #f97316); }
      .panel {
        position: absolute; bottom: 60px; right: 0; width: 340px; max-height: 520px;
        overflow-y: auto; background: #111827; border: 1px solid #1f2937;
        border-radius: 16px; padding: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        display: none; animation: slideUp 0.2s ease-out;
      }
      .panel.open { display: block; }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .panel-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #1f2937;
      }
      .panel-title { font-size: 14px; font-weight: 600; color: #e5e7eb; }
      .page-label { font-size: 10px; padding: 2px 8px; border-radius: 6px; background: #374151; color: #9ca3af; }
      .section-label {
        font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
        color: #6b7280; margin: 12px 0 6px;
      }
      .section-label:first-of-type { margin-top: 0; }
      .profile-btn, .action-btn, .util-btn {
        display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 12px;
        border: 1px solid #1f2937; border-radius: 10px; background: #1f2937;
        color: #d1d5db; font-size: 13px; cursor: pointer; transition: all 0.15s;
        text-align: left; margin-bottom: 6px;
      }
      .profile-btn:hover, .action-btn:hover, .util-btn:hover { background: #374151; border-color: #4b5563; color: #f3f4f6; }
      .profile-btn:active, .action-btn:active, .util-btn:active { transform: scale(0.98); }
      .util-btn.danger { border-color: #7f1d1d; background: #1f1111; color: #fca5a5; }
      .util-btn.danger:hover { background: #2d1515; border-color: #991b1b; color: #fecaca; }
      .util-btn.warn { border-color: #78350f; background: #1f160a; color: #fbbf24; }
      .util-btn.warn:hover { background: #2d1f0e; border-color: #92400e; color: #fcd34d; }
      .log-preview {
        max-height: 120px; overflow-y: auto; background: #0a0a0a;
        border: 1px solid #1f2937; border-radius: 8px; padding: 8px; margin-bottom: 6px;
        font-family: monospace; font-size: 10px; line-height: 1.5;
        color: #9ca3af; white-space: pre-wrap; word-break: break-all;
      }
      .log-info { color: #6b7280; }
      .log-warn { color: #fbbf24; }
      .log-error { color: #fca5a5; }
      .footer { margin-top: 12px; padding-top: 10px; border-top: 1px solid #1f2937; font-size: 10px; color: #4b5563; text-align: center; }
    </style>

    <button class="toggle-btn" id="__cf_toggle" title="DevTools">⚙</button>
    <div class="panel" id="__cf_panel">
      <div class="panel-header">
        <span class="panel-title">🛠 DevTools</span>
        <span class="page-label">${registry.label}</span>
      </div>

      ${profiles.length > 0 || lastRegisterHTML ? `
        <div class="section-label">🤖 Autocompletar</div>
        ${profiles.map((p, i) => `<button class="profile-btn" data-profile="${i}">${p.name}</button>`).join('')}
        ${lastRegisterHTML}
      ` : (lastRegisterHTML ? `
        <div class="section-label">🤖 Autocompletar</div>
        ${lastRegisterHTML}
      ` : '')}

      ${actions.length > 0 ? `
        <div class="section-label">⚡ Acciones</div>
        ${actions.map((a, i) => `<button class="action-btn" data-action="${i}">${a.icon || '▶️'} ${a.label}</button>`).join('')}
      ` : ''}

      <div class="section-label">📋 Logs (${logCount})</div>
      <div id="__cf_log_preview" class="log-preview"></div>
      <button class="util-btn" id="__cf_copy_logs">📋 Copiar Logs al Portapapeles</button>
      <button class="util-btn" id="__cf_clear_logs">🗑 Limpiar Logs</button>

      <div class="section-label">🔧 Utilidades</div>
      <button class="util-btn warn" id="__cf_clear_storage">🗑 Limpiar Storage</button>
      <button class="util-btn danger" id="__cf_force_logout">🚪 Forzar Logout</button>
      <button class="util-btn" id="__cf_reload">🔄 Recargar Página</button>

      <div class="footer">v1.1 · Solo visible en DEV</div>
    </div>
  `;

  bindEvents(shadow, profiles, actions);
  updateLogPreview(shadow);
}

/** Construye un botón dinámico con el último email registrado */
function buildLastRegisterProfile(): string {
  const lastEmail = getLastAutofillEmail();
  const lastPwd = getLastAutofillPassword();
  if (!lastEmail) return '';
  return `<button class="profile-btn" id="__cf_last_login" data-email="${lastEmail}" data-pwd="${lastPwd || ''}">🔄 Último Registro: ${lastEmail}</button>`;
}

function togglePanel(shadow: ShadowRoot, forceOpen?: boolean): void {
  const panel = shadow.getElementById('__cf_panel');
  const toggle = shadow.getElementById('__cf_toggle');
  if (!panel || !toggle) return;
  const isOpen = forceOpen ?? !panel.classList.contains('open');
  panel.classList.toggle('open', isOpen);
  toggle.classList.toggle('open', isOpen);
  sessionStorage.setItem(DEVTOOLS_STORAGE_KEY, isOpen ? 'true' : 'false');
  if (isOpen) updateLogPreview(shadow);
}

function bindEvents(shadow: ShadowRoot, profiles: AutofillProfile[], actions: DevToolsAction[]): void {
  shadow.getElementById('__cf_toggle')?.addEventListener('click', () => togglePanel(shadow));

  // Botón dinámico "Último Registro" en login (DEBE registrarse antes que los perfiles)
  const lastLoginBtn = shadow.getElementById('__cf_last_login');
  if (lastLoginBtn) {
    lastLoginBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const email = lastLoginBtn.getAttribute('data-email') || '';
      const pwd = lastLoginBtn.getAttribute('data-pwd') || '';
      autofillFields({ '#email': email, '#password': pwd });
      console.log(`[DevTools] Último registro cargado: ${email}`);
    });
  }

  shadow.querySelectorAll('.profile-btn').forEach((btn) => {
    // Saltar el botón de último registro (no tiene data-profile)
    const dataProfile = btn.getAttribute('data-profile');
    if (!dataProfile) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(dataProfile, 10);
      const profile = profiles[idx];
      if (profile) {
        autofillFields(profile.fields);
        console.log(`[DevTools] Campos rellenados con perfil: ${profile.name}`);
      }
    });
  });

  shadow.querySelectorAll('.action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-action') || '0', 10);
      const action = actions[idx];
      if (action) {
        action.handler();
        console.log(`[DevTools] Acción ejecutada: ${action.label}`);
      }
    });
  });

  shadow.getElementById('__cf_clear_storage')?.addEventListener('click', () => {
    clearAllStorage();
    showToast({ message: 'sessionStorage y localStorage limpiados. Recarga la página.', type: 'success' });
  });

  shadow.getElementById('__cf_force_logout')?.addEventListener('click', async () => {
    const confirmed = await showConfirm({
      title: 'Forzar Cierre de Sesión',
      message: '¿Seguro? Se cerrará la sesión actual y se limpiará todo el storage de la aplicación.',
      confirmText: 'Cerrar Sesión',
      variant: 'danger',
    });
    if (confirmed) {
      forceLogout();
    }
  });

  shadow.getElementById('__cf_reload')?.addEventListener('click', () => {
    window.location.reload();
  });

  // Logs: Copiar al portapapeles
  shadow.getElementById('__cf_copy_logs')?.addEventListener('click', async () => {
    const text = logsToText();
    if (!text) {
      showToast({ message: 'No hay logs para copiar.', type: 'info' });
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast({ message: `${getLogs().length} logs copiados al portapapeles.`, type: 'success' });
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast({ message: `${getLogs().length} logs copiados (fallback).`, type: 'success' });
    }
  });

  // Logs: Limpiar
  shadow.getElementById('__cf_clear_logs')?.addEventListener('click', () => {
    clearLogs();
    updateLogPreview(shadow);
  });
}

function updateLogPreview(shadow: ShadowRoot): void {
  const preview = shadow.getElementById('__cf_log_preview');
  if (!preview) return;

  const allLogs = getLogs();
  const lastLogs = allLogs.slice(-10);

  // Actualizar contador
  shadow.querySelectorAll('.section-label').forEach((label) => {
    if (label.textContent?.startsWith('📋 Logs')) {
      (label as HTMLElement).textContent = `📋 Logs (${allLogs.length})`;
    }
  });

  if (lastLogs.length === 0) {
    preview.innerHTML = '<span class="log-info">Sin logs aún. Navega por la app para generarlos.</span>';
    return;
  }

  preview.innerHTML = lastLogs
    .map((l) => {
      const time = l.timestamp.toTimeString().slice(0, 8);
      const levelClass = `log-${l.level}`;
      const mod = l.module.length > 14 ? l.module.slice(0, 13) + '…' : l.module.padEnd(14);
      const msg = l.message.length > 55 ? l.message.slice(0, 54) + '…' : l.message;
      return `<span class="${levelClass}">[${time}] [${mod}] ${msg}</span>`;
    })
    .join('\n');
}