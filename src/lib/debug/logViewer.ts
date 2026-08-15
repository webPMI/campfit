/**
 * 📊 In-App Log Viewer Console for CampFit
 *
 * Visor interactivo flotante accesible mediante Ctrl+Shift+L
 * Permite filtrar, buscar, inspeccionar payloads en JSON y exportar logs en vivo.
 *
 * @module debug/logViewer
 */

import { logger, type LogEntry, type LogLevel } from '@/lib/shared/logger';

const VIEWER_ID = '__cf_log_viewer_modal';

let isOpen = false;
let isPaused = false;
let autoScroll = true;
let activeFilterLevel: LogLevel | 'all' = 'all';
let activeFilterModule = 'all';
let searchQuery = '';

export function initLogViewer(): void {
  if (typeof window === 'undefined') return;

  // Registrar atajo de teclado global Ctrl+Shift+L
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
      e.preventDefault();
      toggleLogViewer();
    }
  });

  // Suscribirse a nuevos logs para actualización reactiva
  logger.subscribe(() => {
    if (isOpen && !isPaused) {
      renderLogRows();
    }
  });

  // Exponer API en window para depuración en consola
  (window as any).__campfitLogger = {
    open: openLogViewer,
    close: closeLogViewer,
    toggle: toggleLogViewer,
    getHistory: logger.getHistory,
    clear: logger.clearHistory,
    exportJSON: logger.exportAsJSON,
    exportTXT: logger.exportAsText,
  };
}

export function openLogViewer(): void {
  isOpen = true;
  let modal = document.getElementById(VIEWER_ID);
  if (!modal) {
    modal = createModalElement();
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  renderLogRows();
}

export function closeLogViewer(): void {
  isOpen = false;
  const modal = document.getElementById(VIEWER_ID);
  if (modal) {
    modal.style.display = 'none';
  }
}

export function toggleLogViewer(): void {
  if (isOpen) {
    closeLogViewer();
  } else {
    openLogViewer();
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createModalElement(): HTMLElement {
  const modal = document.createElement('div');
  modal.id = VIEWER_ID;
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 999999;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
  `;

  modal.innerHTML = `
    <div style="
      width: 92vw; max-width: 1000px; height: 85vh;
      background: #09090b; border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 16px; box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(245,158,11,0.2);
      display: flex; flex-direction: column; overflow: hidden; color: #f4f4f5;
    ">
      <!-- Top Bar -->
      <div style="
        padding: 14px 20px; border-bottom: 1px solid #27272a;
        display: flex; items-center; justify-content: space-between;
        background: #111114;
      ">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 18px;">📋</span>
          <div>
            <h3 style="font-size: 15px; font-weight: 700; color: #fbbf24; margin: 0;">CampFit System Logs</h3>
            <span style="font-size: 11px; color: #a1a1aa;">Atajo: Ctrl+Shift+L • Monitoreo en tiempo real</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="__cf_log_copy_btn" style="
            background: #27272a; border: 1px solid #3f3f46; color: #e4e4e7;
            padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; font-weight: 600;
          ">📋 Copiar</button>
          <button id="__cf_log_export_txt_btn" style="
            background: #27272a; border: 1px solid #3f3f46; color: #e4e4e7;
            padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; font-weight: 600;
          ">⬇️ .log</button>
          <button id="__cf_log_export_json_btn" style="
            background: #27272a; border: 1px solid #3f3f46; color: #e4e4e7;
            padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; font-weight: 600;
          ">⬇️ .json</button>
          <button id="__cf_log_clear_btn" style="
            background: #3f1d1d; border: 1px solid #7f1d1d; color: #fca5a5;
            padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; font-weight: 600;
          ">🗑️ Limpiar</button>
          <button id="__cf_log_close_btn" style="
            background: #27272a; border: none; color: #a1a1aa;
            width: 32px; height: 32px; border-radius: 8px; font-size: 18px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
          ">✕</button>
        </div>
      </div>

      <!-- Controls & Filter Strip -->
      <div style="
        padding: 10px 20px; border-bottom: 1px solid #1f1f23;
        display: flex; flex-wrap: wrap; items-center; justify-content: space-between; gap: 10px;
        background: #0d0d10;
      ">
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span style="font-size: 11px; font-weight: 700; color: #71717a; text-transform: uppercase;">Nivel:</span>
          <button class="__cf_level_btn" data-level="all" style="padding: 4px 10px; font-size: 11px; border-radius: 6px; font-weight: 600; cursor: pointer; border: 1px solid #f59e0b; background: rgba(245,158,11,0.2); color: #fbbf24;">Todos</button>
          <button class="__cf_level_btn" data-level="error" style="padding: 4px 10px; font-size: 11px; border-radius: 6px; font-weight: 600; cursor: pointer; border: 1px solid #27272a; background: transparent; color: #f87171;">Error</button>
          <button class="__cf_level_btn" data-level="warn" style="padding: 4px 10px; font-size: 11px; border-radius: 6px; font-weight: 600; cursor: pointer; border: 1px solid #27272a; background: transparent; color: #fbbf24;">Warn</button>
          <button class="__cf_level_btn" data-level="info" style="padding: 4px 10px; font-size: 11px; border-radius: 6px; font-weight: 600; cursor: pointer; border: 1px solid #27272a; background: transparent; color: #60a5fa;">Info</button>
          <button class="__cf_level_btn" data-level="success" style="padding: 4px 10px; font-size: 11px; border-radius: 6px; font-weight: 600; cursor: pointer; border: 1px solid #27272a; background: transparent; color: #4ade80;">Success</button>
          <button class="__cf_level_btn" data-level="debug" style="padding: 4px 10px; font-size: 11px; border-radius: 6px; font-weight: 600; cursor: pointer; border: 1px solid #27272a; background: transparent; color: #a1a1aa;">Debug</button>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <input id="__cf_log_search_input" type="text" placeholder="Buscar en logs..." style="
            background: #18181b; border: 1px solid #27272a; color: white;
            padding: 5px 10px; border-radius: 6px; font-size: 12px; width: 160px; outline: none;
          "/>
          <button id="__cf_log_pause_btn" style="
            background: #18181b; border: 1px solid #27272a; color: #a1a1aa;
            padding: 5px 10px; border-radius: 6px; font-size: 11px; cursor: pointer; font-weight: 600;
          ">⏸️ Pausar</button>
        </div>
      </div>

      <!-- Logs Container -->
      <div id="__cf_log_list" style="
        flex: 1; overflow-y: auto; padding: 8px 12px; font-family: 'JetBrains Mono', Consolas, monospace;
        font-size: 12px; line-height: 1.5; background: #050507;
      ">
        <div style="padding: 20px; text-align: center; color: #71717a;">Cargando registros...</div>
      </div>

      <!-- Footer Info -->
      <div style="
        padding: 8px 20px; border-top: 1px solid #1f1f23; background: #0c0c0e;
        display: flex; items-center; justify-content: space-between; font-size: 11px; color: #71717a;
      ">
        <span id="__cf_log_count_info">0 registros</span>
        <span>Haz clic en un log para ver detalles y payload</span>
      </div>
    </div>
  `;

  // Attach event listeners
  modal.querySelector('#__cf_log_close_btn')?.addEventListener('click', closeLogViewer);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLogViewer();
  });

  modal.querySelector('#__cf_log_clear_btn')?.addEventListener('click', () => {
    logger.clearHistory();
    renderLogRows();
  });

  modal.querySelector('#__cf_log_copy_btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(logger.exportAsText());
    const btn = modal.querySelector('#__cf_log_copy_btn') as HTMLButtonElement;
    if (btn) {
      btn.textContent = '✅ Copiado';
      setTimeout(() => { btn.textContent = '📋 Copiar'; }, 1500);
    }
  });

  modal.querySelector('#__cf_log_export_txt_btn')?.addEventListener('click', () => {
    downloadFile(`campfit-logs-${new Date().toISOString().slice(0, 19)}.log`, logger.exportAsText(), 'text/plain');
  });

  modal.querySelector('#__cf_log_export_json_btn')?.addEventListener('click', () => {
    downloadFile(`campfit-logs-${new Date().toISOString().slice(0, 19)}.json`, logger.exportAsJSON(), 'application/json');
  });

  modal.querySelector('#__cf_log_pause_btn')?.addEventListener('click', () => {
    isPaused = !isPaused;
    const btn = modal.querySelector('#__cf_log_pause_btn') as HTMLButtonElement;
    if (btn) {
      btn.textContent = isPaused ? '▶️ Reanudar' : '⏸️ Pausar';
      btn.style.color = isPaused ? '#f59e0b' : '#a1a1aa';
    }
  });

  modal.querySelector('#__cf_log_search_input')?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value;
    renderLogRows();
  });

  modal.querySelectorAll('.__cf_level_btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilterLevel = btn.getAttribute('data-level') as LogLevel | 'all';
      modal.querySelectorAll('.__cf_level_btn').forEach((b) => {
        (b as HTMLElement).style.background = 'transparent';
        (b as HTMLElement).style.borderColor = '#27272a';
      });
      (btn as HTMLElement).style.background = 'rgba(245,158,11,0.2)';
      (btn as HTMLElement).style.borderColor = '#f59e0b';
      renderLogRows();
    });
  });

  return modal;
}

function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const LEVEL_CONFIG: Record<LogLevel, { label: string; color: string; bg: string }> = {
  error: { label: 'ERROR', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)' },
  warn: { label: 'WARN ', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' },
  info: { label: 'INFO ', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)' },
  success: { label: 'OK   ', color: '#4ade80', bg: 'rgba(16, 185, 129, 0.15)' },
  debug: { label: 'DEBUG', color: '#a1a1aa', bg: 'rgba(113, 113, 122, 0.15)' },
};

function renderLogRows(): void {
  const list = document.getElementById('__cf_log_list');
  const countInfo = document.getElementById('__cf_log_count_info');
  if (!list) return;

  const logs = logger.getHistory({
    level: activeFilterLevel,
    module: activeFilterModule === 'all' ? undefined : activeFilterModule,
    search: searchQuery,
  });

  if (countInfo) {
    countInfo.textContent = `${logs.length} registros mostrados (total: ${logger.getHistory().length})`;
  }

  if (logs.length === 0) {
    list.innerHTML = `
      <div style="padding: 40px 20px; text-align: center; color: #71717a;">
        <span style="font-size: 24px; display: block; margin-bottom: 8px;">🔍</span>
        No se encontraron registros con los filtros seleccionados.
      </div>
    `;
    return;
  }

  list.innerHTML = logs
    .map((log) => {
      const cfg = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
      const time = log.timestamp.toTimeString().split(' ')[0] + '.' + String(log.timestamp.getMilliseconds()).padStart(3, '0');
      const hasPayload = log.payload !== undefined && log.payload !== null && log.payload !== '';

      return `
        <div class="__cf_log_entry" data-id="${log.id}" style="
          padding: 6px 10px; margin-bottom: 4px; border-radius: 6px;
          background: rgba(24, 24, 27, 0.4); border-left: 3px solid ${cfg.color};
          cursor: pointer; transition: background 0.15s;
        ">
          <div style="display: flex; items-center; justify-content: space-between; gap: 8px;">
            <div style="display: flex; items-center; gap: 8px; flex: 1; min-width: 0;">
              <span style="color: #71717a; font-size: 11px; shrink-0;">${time}</span>
              <span style="color: ${cfg.color}; background: ${cfg.bg}; padding: 1px 5px; border-radius: 4px; font-size: 10px; font-weight: 700;">${cfg.label}</span>
              <span style="color: #fbbf24; font-weight: 600; font-size: 11px; shrink-0;">[${escapeHtml(log.module)}]</span>
              <span style="color: #e4e4e7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(log.message)}</span>
            </div>
            ${hasPayload ? '<span style="color: #a1a1aa; font-size: 11px;">🔍 json</span>' : ''}
          </div>

          ${
            hasPayload
              ? `
            <div class="__cf_log_payload" style="
              display: none; margin-top: 8px; padding: 8px; background: #000000; border-radius: 6px;
              border: 1px solid #27272a; overflow-x: auto; color: #a1a1aa; font-size: 11px;
            ">
              <pre style="margin: 0;">${escapeHtml(typeof log.payload === 'object' ? JSON.stringify(log.payload, null, 2) : String(log.payload))}</pre>
            </div>
          `
              : ''
          }
        </div>
      `;
    })
    .join('');

  // Expand payload details on click
  list.querySelectorAll('.__cf_log_entry').forEach((entry) => {
    entry.addEventListener('click', () => {
      const payloadEl = entry.querySelector('.__cf_log_payload') as HTMLElement | null;
      if (payloadEl) {
        const isHidden = payloadEl.style.display === 'none' || !payloadEl.style.display;
        payloadEl.style.display = isHidden ? 'block' : 'none';
      }
    });
  });

  if (autoScroll) {
    list.scrollTop = list.scrollHeight;
  }
}
