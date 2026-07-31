/**
 * Tests unitarios para el Theme Store
 * ====================================
 *
 * Estrategia de testing:
 * - Se mockea localStorage para entornos Node (vitest usa happy-dom/jsdom).
 * - Se testean todos los atoms, computed stores, acciones y edge cases.
 * - Se verifica la integridad de la persistencia.
 *
 * Ejecutar: npm run theme:test
 * Coverage: npm run test:coverage -- tests/unit/stores/themeStore.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mock localStorage
// ---------------------------------------------------------------------------
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ---------------------------------------------------------------------------
// Mock matchMedia globally (before module loads)
// ---------------------------------------------------------------------------
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: false, // default: light mode
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

// ---------------------------------------------------------------------------
// Dynamic import to ensure mocks are in place before module loads
// ---------------------------------------------------------------------------
async function loadThemeStore() {
  return await import('@/stores/themeStore');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupDOM() {
  document.documentElement.removeAttribute('data-theme');
  document.body.className = '';
  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '';
    document.head.appendChild(meta);
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('themeStore', () => {
  let themeStore: Awaited<ReturnType<typeof loadThemeStore>>;

  beforeEach(async () => {
    localStorageMock.clear();
    vi.clearAllMocks();
    setupDOM();
    vi.resetModules();
    localStorageMock.setItem('campfit_theme_mode', 'dark');
    localStorageMock.setItem('campfit_theme_flavor', 'emerald');
    themeStore = await loadThemeStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // Atoms & Computed Stores
  // =========================================================================

  describe('$theme atom', () => {
    it('debe inicializarse en "dark" por defecto', () => {
      expect(themeStore.$theme.get()).toBe('dark');
    });

    it('debe leer el valor de localStorage si existe "light"', async () => {
      localStorageMock.setItem('campfit_theme_mode', 'light');
      localStorageMock.setItem('campfit_theme_flavor', 'emerald');
      vi.resetModules();
      const fresh = await import('@/stores/themeStore');
      expect(fresh.$theme.get()).toBe('light');
    });

    it('debe caer en "dark" si localStorage tiene un valor inválido', async () => {
      localStorageMock.setItem('campfit_theme_mode', 'invalid');
      localStorageMock.setItem('campfit_theme_flavor', 'emerald');
      vi.resetModules();
      const fresh = await import('@/stores/themeStore');
      expect(fresh.$theme.get()).toBe('dark');
    });

    it('debe caer en "dark" si localStorage lanza error', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      vi.resetModules();
      const fresh = await import('@/stores/themeStore');
      expect(fresh.$theme.get()).toBe('dark');
    });
  });

  describe('computed stores', () => {
    it('$isDark debe ser true cuando el tema es dark', () => {
      themeStore.$theme.set('dark');
      expect(themeStore.$isDark.get()).toBe(true);
      expect(themeStore.$isLight.get()).toBe(false);
    });

    it('$isLight debe ser true cuando el tema es light', () => {
      themeStore.$theme.set('light');
      expect(themeStore.$isLight.get()).toBe(true);
      expect(themeStore.$isDark.get()).toBe(false);
    });

    it('$resolvedTheme debe reflejar $theme', () => {
      themeStore.$theme.set('light');
      expect(themeStore.$resolvedTheme.get()).toBe('light');
      themeStore.$theme.set('dark');
      expect(themeStore.$resolvedTheme.get()).toBe('dark');
    });
  });

  // =========================================================================
  // Actions
  // =========================================================================

  describe('setTheme()', () => {
    it('debe actualizar $theme atom', () => {
      themeStore.setTheme('light');
      expect(themeStore.$theme.get()).toBe('light');
    });

    it('debe persistir en localStorage', () => {
      themeStore.setTheme('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('campfit_theme_mode', 'light');
    });

    it('debe aplicar data-theme-mode en el DOM', () => {
      themeStore.setTheme('light');
      expect(document.documentElement.getAttribute('data-theme-mode')).toBe('light');
    });

    it('debe actualizar meta theme-color para tema claro', () => {
      themeStore.setTheme('light');
      const meta = document.querySelector('meta[name="theme-color"]');
      expect(meta?.getAttribute('content')).toBe('#fafafa');
    });

    it('debe actualizar meta theme-color para tema oscuro', () => {
      themeStore.setTheme('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      expect(meta?.getAttribute('content')).toBe('#09090b');
    });
  });

  describe('toggleTheme()', () => {
    it('debe cambiar de dark a light', () => {
      themeStore.$theme.set('dark');
      themeStore.toggleTheme();
      expect(themeStore.$theme.get()).toBe('light');
    });

    it('debe cambiar de light a dark', () => {
      themeStore.$theme.set('light');
      themeStore.toggleTheme();
      expect(themeStore.$theme.get()).toBe('dark');
    });

    it('debe persistir el cambio en localStorage', () => {
      themeStore.$theme.set('dark');
      themeStore.toggleTheme();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('campfit_theme_mode', 'light');
    });

    it('toggleTheme 2 veces debe volver al tema original', () => {
      themeStore.$theme.set('dark');
      themeStore.toggleTheme();
      themeStore.toggleTheme();
      expect(themeStore.$theme.get()).toBe('dark');
    });
  });

  describe('initTheme()', () => {
    it('debe aplicar el tema almacenado al DOM', () => {
      localStorageMock.setItem('campfit_theme_mode', 'light');
      localStorageMock.setItem('campfit_theme_flavor', 'emerald');
      themeStore.initTheme();
      expect(document.documentElement.getAttribute('data-theme-mode')).toBe('light');
    });

    it('debe sincronizar $theme con localStorage', () => {
      localStorageMock.setItem('campfit_theme_mode', 'light');
      localStorageMock.setItem('campfit_theme_flavor', 'emerald');
      themeStore.initTheme();
      expect(themeStore.$theme.get()).toBe('light');
    });
  });

  // =========================================================================
  // DOM Integration
  // =========================================================================

  describe('applyThemeToDom()', () => {
    it('debe establecer data-theme-mode y data-theme-flavor en <html>', () => {
      themeStore.applyThemeToDom('dark', 'emerald');
      expect(document.documentElement.getAttribute('data-theme-mode')).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme-flavor')).toBe('emerald');
    });

    it('debe establecer data-theme-mode light con flavor ocean', () => {
      themeStore.applyThemeToDom('light', 'ocean');
      expect(document.documentElement.getAttribute('data-theme-mode')).toBe('light');
      expect(document.documentElement.getAttribute('data-theme-flavor')).toBe('ocean');
    });

    it('debe añadir clase "dark" al body para tema oscuro', () => {
      themeStore.applyThemeToDom('dark', 'emerald');
      expect(document.body.classList.contains('dark')).toBe(true);
      expect(document.body.classList.contains('light')).toBe(false);
    });

    it('debe añadir clase "light" al body para tema claro', () => {
      themeStore.applyThemeToDom('light', 'emerald');
      expect(document.body.classList.contains('light')).toBe(true);
      expect(document.body.classList.contains('dark')).toBe(false);
    });
  });

  // =========================================================================
  // Edge Cases
  // =========================================================================

  describe('edge cases', () => {
    it('no debe romperse si localStorage.setItem lanza error', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      expect(() => themeStore.setTheme('light')).not.toThrow();
      expect(themeStore.$theme.get()).toBe('light');
    });

    it('no debe romperse si no existe meta[name="theme-color"]', () => {
      document.querySelector('meta[name="theme-color"]')?.remove();
      expect(() => themeStore.applyThemeToDom('dark', 'emerald')).not.toThrow();
    });
  });

  // =========================================================================
  // Type Safety
  // =========================================================================

  describe('type safety', () => {
    it('Theme type acepta "light" | "dark" | "auto"', () => {
      const valid: typeof themeStore.$theme extends { get(): infer T }
        ? T extends 'light' | 'dark' | 'auto'
          ? true
          : never
        : never = true;
      expect(valid).toBe(true);
    });
  });
});


// =========================================================================
// Auto Theme
// =========================================================================

  describe('themeStore - Auto Theme', () => {
    let themeStore: Awaited<ReturnType<typeof loadThemeStore>>;

    beforeEach(async () => {
      localStorageMock.clear();
      vi.clearAllMocks();
      setupDOM();

      // Re-define matchMedia mock (restoreAllMocks in main describe clears it)
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })) as unknown as (query: string) => MediaQueryList;

      vi.resetModules();
      localStorageMock.setItem('campfit_theme', 'dark');
      themeStore = await loadThemeStore();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

  it('debe aceptar auto como valor de tema', () => {
    themeStore.setTheme('auto');
    expect(themeStore.$theme.get()).toBe('auto');
  });

  it('debe persistir auto en localStorage', () => {
    themeStore.setTheme('auto');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('campfit_theme_mode', 'auto');
  });

  it('$resolvedTheme debe devolver light cuando sistema es light y theme=auto', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as (query: string) => MediaQueryList;
    themeStore.$systemPreference.set('light');
    themeStore.setTheme('auto');
    expect(themeStore.$resolvedTheme.get()).toBe('light');
  });

  it('$resolvedTheme debe devolver dark cuando sistema es dark y theme=auto', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as (query: string) => MediaQueryList;
    themeStore.$systemPreference.set('dark');
    themeStore.setTheme('auto');
    expect(themeStore.$resolvedTheme.get()).toBe('dark');
  });

  it('$isDark debe ser false cuando $resolvedTheme=light', () => {
    themeStore.setTheme('light');
    expect(themeStore.$isDark.get()).toBe(false);
    expect(themeStore.$isLight.get()).toBe(true);
  });

  it('toggleTheme desde auto debe ir a light explicito', () => {
    themeStore.setTheme('auto');
    themeStore.toggleTheme();
    expect(themeStore.$theme.get()).toBe('light');
  });

  it('toggleTheme desde auto debe persistir light en localStorage', () => {
    themeStore.setTheme('auto');
    themeStore.toggleTheme();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('campfit_theme_mode', 'light');
  });
});
