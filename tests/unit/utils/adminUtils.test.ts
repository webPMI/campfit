/**
 * Tests unitarios para adminUtils (funciones puras de renderizado y utilidades).
 *
 * adminUtils ahora delega funciones de UI en @/lib/shared/ui y usa @/lib/shared/logger.
 * Estas funciones son síncronas y no requieren mocks de Firebase.
 * Cubrir: casos normales, edge cases, valores nulos/undefined.
 */

import { describe, it, expect, vi } from 'vitest';

// ─── Mocks con vi.hoisted() para vitest 4.x ──────────────────────────────────

const { uiMock, loggerMock } = vi.hoisted(() => ({
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
    ICONS: {
      users: '<path d="M15 19.128..." />',
      trainers: '<path d="M15.59 14.37..." />',
      clients: '<path d="M12 8.25..." />',
      workouts: '<path d="M4.26 10.147..." />',
      diets: '<path d="M12 8.25..." />',
      alert: '<path d="M12 9v3.75..." />',
      check: '<path d="M9 12.75..." />',
      chat: '<path d="M20.25 8.511..." />',
      progress: '<path d="M3 13.125..." />',
    },
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
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
}));

// Mock shared modules that adminUtils imports
vi.mock('@/lib/shared/logger', () => loggerMock);
vi.mock('@/lib/shared/ui', () => uiMock);

// ─── Funciones a testear ─────────────────────────────────────────────────────

import {
  renderUserRow,
  renderUserDetail,
  renderUserForm,
  initAdminActions,
} from '../../../src/lib/admin/adminUtils';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('adminUtils', () => {
  // ── renderUserRow ────────────────────────────────────────────────────────

  describe('renderUserRow', () => {
    const baseUser = {
      uid: 'user123',
      name: 'Juan Perez',
      email: 'juan@test.com',
      role: 'client' as const,
      hasActiveAlert: false,
      createdAt: { toDate: () => new Date('2024-01-15') },
    };

    it('should render user row with name and email', () => {
      const html = renderUserRow(baseUser);
      expect(html).toContain('Juan Perez');
      expect(html).toContain('juan@test.com');
      expect(html).toContain('client');
    });

    it('should show alert indicator when hasActiveAlert is true', () => {
      const userWithAlert = { ...baseUser, hasActiveAlert: true };
      const html = renderUserRow(userWithAlert);
      expect(html).toContain('bg-red-500');
      expect(html).toContain('animate-pulse');
    });

    it('should not show alert indicator when hasActiveAlert is false', () => {
      const html = renderUserRow(baseUser);
      expect(html).not.toContain('bg-red-500');
    });

    it('should handle missing name gracefully', () => {
      const userNoName = { ...baseUser, name: '' };
      const html = renderUserRow(userNoName);
      expect(html).toContain('Sin nombre');
    });

    it('should handle missing email gracefully', () => {
      const userNoEmail = { ...baseUser, email: '' };
      const html = renderUserRow(userNoEmail);
      expect(html).toContain('Juan Perez');
      expect(html).not.toContain('juan@test.com');
    });

    it('should include onclick handler when provided', () => {
      const html = renderUserRow(baseUser, "alert('click')");
      expect(html).toContain('onclick');
      expect(html).toContain('cursor-pointer');
    });

    it('should render admin role with purple color', () => {
      const adminUser = { ...baseUser, role: 'admin' as const };
      const html = renderUserRow(adminUser);
      expect(html).toContain('admin');
      expect(html).toContain('purple');
    });

    it('should render trainer role with blue color', () => {
      const trainerUser = { ...baseUser, role: 'trainer' as const };
      const html = renderUserRow(trainerUser);
      expect(html).toContain('trainer');
      expect(html).toContain('blue');
    });
  });

  // ── renderUserDetail ─────────────────────────────────────────────────────

  describe('renderUserDetail', () => {
    const baseUser = {
      uid: 'user123',
      name: 'Juan Perez',
      email: 'juan@test.com',
      role: 'client' as const,
      hasActiveAlert: false,
      createdAt: { toDate: () => new Date('2024-01-15') },
    };

    it('should render user detail with name and email', () => {
      const html = renderUserDetail(baseUser);
      expect(html).toContain('Juan Perez');
      expect(html).toContain('juan@test.com');
      expect(html).toContain('client');
    });

    it('should handle missing name gracefully', () => {
      const userNoName = { ...baseUser, name: '' };
      const html = renderUserDetail(userNoName);
      expect(html).toContain('Sin nombre');
    });

    it('should handle missing email gracefully', () => {
      const userNoEmail = { ...baseUser, email: '' };
      const html = renderUserDetail(userNoEmail);
      expect(html).toContain('Juan Perez');
      expect(html).not.toContain('juan@test.com');
    });

    it('should show created date', () => {
      const html = renderUserDetail(baseUser);
      expect(html).toContain('Creado:');
      expect(html).toContain('2024');
    });
  });

  // ── renderUserForm ───────────────────────────────────────────────────────

  describe('renderUserForm', () => {
    const trainers = [
      { uid: 't1', name: 'Trainer Uno', email: 't1@test.com', role: 'trainer' as const, hasActiveAlert: false },
      { uid: 't2', name: 'Trainer Dos', email: 't2@test.com', role: 'trainer' as const, hasActiveAlert: false },
    ];

    it('should render form with all fields', () => {
      const html = renderUserForm(trainers);
      expect(html).toContain('user-name');
      expect(html).toContain('user-email');
      expect(html).toContain('user-password');
      expect(html).toContain('user-role');
    });

    it('should include trainer options for client role', () => {
      const html = renderUserForm(trainers);
      expect(html).toContain('Trainer Uno');
      expect(html).toContain('Trainer Dos');
    });

    it('should preselect the given role', () => {
      const html = renderUserForm(trainers, 'trainer');
      expect(html).toContain('value="trainer" selected');
    });

    it('should preselect the given trainer', () => {
      const html = renderUserForm(trainers, 'client', 't2');
      expect(html).toContain('value="t2" selected');
    });

    it('should hide trainer assign container for non-client roles', () => {
      const html = renderUserForm(trainers, 'admin');
      expect(html).toContain('display:none');
    });

    it('should show trainer assign container for client role', () => {
      const html = renderUserForm(trainers, 'client');
      expect(html).not.toContain('display:none');
    });
  });

  // ── initAdminActions ────────────────────────────────────────────────────

  describe('initAdminActions', () => {
    it('should set __adminId on window', () => {
      // Guardar referencia original
      const originalWindow = globalThis.window;

      // Mockear globalThis.window si no existe (happy-dom debería tenerlo)
      if (typeof globalThis.window === 'undefined') {
        (globalThis as any).window = {} as Window & typeof globalThis;
      }

      initAdminActions('admin-123');
      expect((globalThis.window as unknown as Record<string, unknown>).__adminId).toBe('admin-123');

      // Restaurar
      if (originalWindow === undefined) {
        delete (globalThis as any).window;
      }
    });
  });
});
