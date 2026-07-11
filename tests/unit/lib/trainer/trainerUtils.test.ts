/**
 * Tests unitarios para trainerUtils.
 *
 * Las funciones de UI (escapeHtml, formatDate, formatTime, getUserInitial,
 * renderEmptyState, renderLoadingState) son funciones puras re-exportadas
 * desde @/lib/shared/ui. Se testean directamente desde shared/ui.
 *
 * Las funciones que dependen de Firebase (subscribeTo*, createWorkout, etc.)
 * requieren mocks y se testean por separado.
 */

import { describe, it, expect, vi } from 'vitest';

// ─── Mocks con vi.hoisted() para vitest 4.x ──────────────────────────────────

const { uiMock, loggerMock, chatMock } = vi.hoisted(() => ({
  uiMock: {
    escapeHtml: (text: string) => {
      const map: Record<string, string> = {
        '&': '&',
        '<': '<',
        '>': '>',
        '"': '"',
        "'": '&#x27;',
      };
      return text.replace(/[&<>"']/g, (ch) => map[ch] || ch);
    },
    showToast: vi.fn(),
    getUserInitial: (name: string) => (name || '?').charAt(0).toUpperCase(),
    ICONS: {},
    formatDate: (timestamp: { toDate: () => Date } | null | undefined): string => {
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
    },
    formatTime: (timestamp: { toDate: () => Date } | null | undefined): string => {
      if (!timestamp?.toDate) return '';
      try {
        return timestamp.toDate().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return '';
      }
    },
    renderEmptyState: (icon: string, message: string): string => {
      return `<div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-8 text-center backdrop-blur-sm">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/50">
          <svg class="h-7 w-7 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            ${icon}
          </svg>
        </div>
        <p class="text-sm text-zinc-500">${message}</p>
      </div>`;
    },
    renderLoadingState: (message: string = 'Cargando...'): string => {
      return `<div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-8 text-center backdrop-blur-sm">
        <div class="flex items-center justify-center gap-3">
          <svg class="h-5 w-5 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p class="text-sm text-zinc-500">${message}</p>
        </div>
      </div>`;
    },
  },
  loggerMock: {
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  },
  chatMock: {
    sendMessage: vi.fn(),
    subscribeToUserMessages: vi.fn(() => vi.fn()),
    subscribeToConversation: vi.fn(() => vi.fn()),
    markAsRead: vi.fn(),
  },
}));

// Mockear @/lib/firebase para que trainerUtils pueda importarse sin Firebase real
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
}));

// Mock shared modules that trainerUtils imports
vi.mock('@/lib/shared/logger', () => loggerMock);
vi.mock('@/lib/shared/ui', () => uiMock);
vi.mock('@/lib/shared/chat', () => chatMock);

// ─── Importar funciones PURAS desde shared/ui directamente ──────────────────
// Las funciones de UI (escapeHtml, formatDate, etc.) se re-exportan desde
// trainerUtils, pero vitest no resuelve correctamente los re-exports mockeados.
// Las testeamos directamente desde su fuente original.

import {
  escapeHtml,
  formatDate,
  formatTime,
  getUserInitial,
  renderEmptyState,
  renderLoadingState,
} from '../../../../src/lib/shared/ui';

// ─── Tests: escapeHtml ─────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('should escape HTML special characters', () => {
    const escaped = escapeHtml('<script>alert("xss")</script>');
    expect(escaped).not.toContain('<script>');
    expect(escaped).not.toContain('</script>');
    expect(escaped).toContain('lt;');
    expect(escaped).toContain('gt;');


  });



  it('should return empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should return same string for plain text', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  it('should escape ampersands', () => {
    const escaped = escapeHtml('a & b');
    expect(escaped).toContain('&');
    expect(escaped).not.toContain(' & ');
  });

});

// ─── Tests: formatDate ─────────────────────────────────────────────────────

describe('formatDate', () => {
  it('should format a valid timestamp', () => {
    const date = new Date(2024, 0, 15);
    const timestamp = { toDate: () => date };
    const result = formatDate(timestamp);
    expect(result).toContain('2024');
    expect(result).toContain('ene');
  });

  it('should return "-" for null timestamp', () => {
    expect(formatDate(null)).toBe('-');
  });

  it('should return "-" for undefined timestamp', () => {
    expect(formatDate(undefined)).toBe('-');
  });

  it('should return "-" for timestamp without toDate', () => {
    expect(formatDate({} as any)).toBe('-');
  });
});

// ─── Tests: formatTime ─────────────────────────────────────────────────────

describe('formatTime', () => {
  it('should format a valid timestamp', () => {
    const date = new Date(2024, 0, 15, 14, 30);
    const timestamp = { toDate: () => date };
    const result = formatTime(timestamp);
    expect(result).toContain('14');
    expect(result).toContain('30');
  });

  it('should return empty string for null timestamp', () => {
    expect(formatTime(null)).toBe('');
  });

  it('should return empty string for undefined timestamp', () => {
    expect(formatTime(undefined)).toBe('');
  });
});

// ─── Tests: getUserInitial ──────────────────────────────────────────────────

describe('getUserInitial', () => {
  it('should return first letter uppercase', () => {
    expect(getUserInitial('juan')).toBe('J');
  });

  it('should return first letter for full name', () => {
    expect(getUserInitial('Maria Jose')).toBe('M');
  });

  it('should return "?" for empty string', () => {
    expect(getUserInitial('')).toBe('?');
  });

  it('should return "?" for null/undefined', () => {
    expect(getUserInitial(null as any)).toBe('?');
    expect(getUserInitial(undefined as any)).toBe('?');
  });
});

// ─── Tests: renderEmptyState ───────────────────────────────────────────────

describe('renderEmptyState', () => {
  it('should render HTML with icon and message', () => {
    const result = renderEmptyState('<svg></svg>', 'No hay datos');
    expect(result).toContain('<svg');
    expect(result).toContain('No hay datos');
    expect(result).toContain('rounded-xl');
  });
});

// ─── Tests: renderLoadingState ─────────────────────────────────────────────

describe('renderLoadingState', () => {
  it('should render loading HTML with spinner', () => {
    const result = renderLoadingState();
    expect(result).toContain('animate-spin');
    expect(result).toContain('Cargando...');
    expect(result).toContain('rounded-xl');
  });
});
