/**
 * Theme Store — Centralized multi-flavor theme state management using Nanostores.
 *
 * ## Architecture
 *
 * The store manages three concerns:
 * - **Mode**: `'light' | 'dark' | 'auto'` — the user's brightness preference.
 * - **Flavor**: `'emerald' | 'ocean' | 'sunset'` — the accent colour palette.
 * - **Resolved mode**: `'light' | 'dark'` — always a concrete value (`'auto'`
 *   is resolved against `$systemPreference`).
 *
 * Persistence uses two `localStorage` keys (`campfit_theme_mode` and
 * `campfit_theme_flavor`). Legacy single-key (`campfit_theme`) data is migrated
 * automatically on first init.
 *
 * SSR Safety: all browser-only APIs (`localStorage`, `matchMedia`, DOM
 * manipulation) are guarded by `typeof window` checks.
 *
 * @module stores/themeStore
 */

import { atom, computed } from 'nanostores';
import { logger } from '@/lib/shared/logger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Theme brightness mode */
export type ThemeMode = 'light' | 'dark' | 'auto';

/** Theme color flavor (accent palette) */
export type ThemeFlavor = 'emerald' | 'ocean' | 'sunset' | 'onyx';

/** Human-readable names for each flavor */
export const FLAVOR_NAMES: Record<ThemeFlavor, string> = {
  emerald: 'Esmeralda',
  ocean: 'Océano',
  sunset: 'Atardecer',
  onyx: 'Fénix Dorado',
};

/** Display colors for each flavor indicator dot */
export const FLAVOR_COLORS: Record<ThemeFlavor, string> = {
  emerald: '#10b981',
  ocean: '#0284c7',
  sunset: '#ea580c',
  onyx: '#fbbf24',
};

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

const MODE_KEY = 'campfit_theme_mode';
const FLAVOR_KEY = 'campfit_theme_flavor';
const OLD_KEY = 'campfit_theme'; // Legacy single-key (v1)

/** CSS attributes set on <html> element */
const THEME_MODE_ATTR = 'data-theme-mode';
const THEME_FLAVOR_ATTR = 'data-theme-flavor';

// ---------------------------------------------------------------------------
// SSR-safe helpers
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getSystemPreference(): 'light' | 'dark' {
  if (!isBrowser()) return 'dark';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

function readStoredMode(): ThemeMode {
  if (!isBrowser()) return 'dark';
  try {
    // Migrate from old single key if it exists
    const oldVal = localStorage.getItem(OLD_KEY);
    if (oldVal !== null && (oldVal === 'light' || oldVal === 'dark' || oldVal === 'auto')) {
      localStorage.setItem(MODE_KEY, oldVal);
      localStorage.setItem(FLAVOR_KEY, 'emerald');
      localStorage.removeItem(OLD_KEY);
      return oldVal;
    }

    const stored = localStorage.getItem(MODE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
  } catch {
    // localStorage might be unavailable (private browsing, etc.)
  }
  return 'dark';
}

function readStoredFlavor(): ThemeFlavor {
  if (!isBrowser()) return 'onyx';
  try {
    const stored = localStorage.getItem(FLAVOR_KEY);
    if (stored === 'emerald' || stored === 'ocean' || stored === 'sunset' || stored === 'onyx') return stored;
  } catch {
    // Silently fail
  }
  return 'onyx';
}

function persistMode(mode: ThemeMode): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // Silently fail — theme still works in-memory
  }
}

function persistFlavor(flavor: ThemeFlavor): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(FLAVOR_KEY, flavor);
  } catch {
    // Silently fail
  }
}

// ---------------------------------------------------------------------------
// Atoms
// ---------------------------------------------------------------------------

/** Current theme mode persisted across sessions. Defaults to 'dark'. */
export const $themeMode = atom<ThemeMode>(readStoredMode());

/** Current theme flavor persisted across sessions. Defaults to 'onyx' (Fénix Dorado). */
export const $themeFlavor = atom<ThemeFlavor>(readStoredFlavor());

/** Current system color scheme preference (dark/light). Updated reactively. */
export const $systemPreference = atom<'light' | 'dark'>('dark');

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------

/**
 * Resolved theme mode — always `'light'` | `'dark'`, never `'auto'`.
 * When `$themeMode` is `'auto'`, resolves via `$systemPreference`.
 */
export const $resolvedMode = computed(
  [$themeMode, $systemPreference],
  (m, sp) => (m === 'auto' ? sp : m),
);

/** `true` when the resolved mode is `'dark'` */
export const $isDark = computed($resolvedMode, (m) => m === 'dark');

/** `true` when the resolved mode is `'light'` */
export const $isLight = computed($resolvedMode, (m) => m === 'light');

/** Human-readable name for the current flavor (e.g., "Esmeralda") */
export const $flavorName = computed($themeFlavor, (f) => FLAVOR_NAMES[f]);

/** Display name combining flavor and mode (e.g., "Océano (Oscuro)") */
export const $themeDisplayName = computed(
  [$flavorName, $resolvedMode],
  (name, mode) => `${name} (${mode === 'dark' ? 'Oscuro' : 'Claro'})`,
);

// ---------------------------------------------------------------------------
// DOM Application
// ---------------------------------------------------------------------------

/**
 * Applies the theme to the DOM by setting `data-theme-mode` and
 * `data-theme-flavor` on `<html>`. Also updates `<meta name="theme-color">`
 * and body class.
 */
export function applyThemeToDom(mode: ThemeMode, flavor: ThemeFlavor): void {
  if (!isBrowser()) return;

  const resolvedMode = mode === 'auto' ? getSystemPreference() : mode;

  const root = document.documentElement;
  root.setAttribute(THEME_MODE_ATTR, resolvedMode);
  root.setAttribute(THEME_FLAVOR_ATTR, flavor);
  root.setAttribute('data-theme', resolvedMode);

  // Flavor-aware meta theme-color for browser chrome
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const darkColor: Record<ThemeFlavor, string> = {
      emerald: '#09090b',
      ocean: '#0f172a',
      sunset: '#1c1917',
      onyx: '#000000',
    };
    const lightColor: Record<ThemeFlavor, string> = {
      emerald: '#fafafa',
      ocean: '#f0f9ff',
      sunset: '#fff7ed',
      onyx: '#fafafa',
    };
    meta.setAttribute(
      'content',
      resolvedMode === 'dark' ? darkColor[flavor] : lightColor[flavor],
    );
  }

  // Update body class for Tailwind compatibility
  if (document.body) {
    document.body.classList.toggle('dark', resolvedMode === 'dark');
    document.body.classList.toggle('light', resolvedMode === 'light');
  }
}

// ---------------------------------------------------------------------------
// Mode Actions
// ---------------------------------------------------------------------------

/**
 * Sets the theme mode to the specified value.
 * Persists to localStorage and applies to DOM.
 */
export function setThemeMode(mode: ThemeMode): void {
  $themeMode.set(mode);
  persistMode(mode);
  applyThemeToDom(mode, $themeFlavor.get());
}

/**
 * Toggles between `'light'`, `'dark'`, and `'auto'`.
 * Cycling order: auto → light → dark → light → ...
 */
export function toggleThemeMode(): void {
  const current = $themeMode.get();
  if (current === 'auto') {
    setThemeMode('light');
  } else {
    setThemeMode(current === 'dark' ? 'light' : 'dark');
  }
}

/**
 * Sets the theme mode to the system preference.
 * Equivalent to `setThemeMode('auto')`.
 */
export function followSystemTheme(): void {
  setThemeMode('auto');
}

// ---------------------------------------------------------------------------
// Flavor Actions
// ---------------------------------------------------------------------------

/**
 * Sets the theme flavor (colour palette).
 * Persists to localStorage and applies to DOM.
 */
export function setThemeFlavor(flavor: ThemeFlavor): void {
  $themeFlavor.set(flavor);
  persistFlavor(flavor);
  applyThemeToDom($themeMode.get(), flavor);
}

/**
 * Cycles to the next theme flavor.
 * Order: emerald → ocean → sunset → emerald → ...
 */
export function cycleThemeFlavor(): void {
  const current = $themeFlavor.get() as ThemeFlavor;
  const flavors: ThemeFlavor[] = ['emerald', 'ocean', 'sunset', 'onyx'];
  const nextIndex = (flavors.indexOf(current) + 1) % flavors.length;
  if (flavors[nextIndex]) {
    setThemeFlavor(flavors[nextIndex]!);
  }
}

// ---------------------------------------------------------------------------
// System Theme Watcher
// ---------------------------------------------------------------------------

/** Media query change listener reference for cleanup. */
let mediaQueryListener: (() => void) | null = null;

/**
 * Starts listening for system color scheme changes.
 * When `$themeMode` is `'auto'`, automatically applies the new preference.
 */
export function watchSystemTheme(): void {
  if (!isBrowser()) return;

  unwatchSystemTheme();

  let mediaQuery: MediaQueryList;
  try {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  } catch {
    return;
  }

  const handler = (e: MediaQueryListEvent) => {
    $systemPreference.set(e.matches ? 'dark' : 'light');
    if ($themeMode.get() === 'auto') {
      applyThemeToDom('auto', $themeFlavor.get());
    }
  };

  try {
    mediaQuery.addEventListener('change', handler);
    mediaQueryListener = () => mediaQuery.removeEventListener('change', handler);
  } catch {
    // matchMedia not available in this environment
  }
}

/** Stops listening for system color scheme changes. */
export function unwatchSystemTheme(): void {
  if (mediaQueryListener) {
    mediaQueryListener();
    mediaQueryListener = null;
  }
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

/**
 * Initializes the theme system.
 * Must be called once on app startup (client-side only).
 * Reads stored preferences and applies them to the DOM.
 */
export function initTheme(): void {
  const mode = readStoredMode();
  const flavor = readStoredFlavor();

  // Set system preference before resolving
  if (isBrowser()) {
    $systemPreference.set(getSystemPreference());
  }

  applyThemeToDom(mode, flavor);
  $themeMode.set(mode);
  $themeFlavor.set(flavor);

  // Start watching for system preference changes
  watchSystemTheme();

  // Register global keyboard shortcut for flavor cycling
  registerFlavorShortcut();
}

// ---------------------------------------------------------------------------
// Keyboard Shortcut
// ---------------------------------------------------------------------------

/**
 * Registers a global keyboard shortcut (Ctrl+Shift+F) to cycle through flavors.
 * Call once on app startup.
 */
export function registerFlavorShortcut(): void {
  if (!isBrowser()) return;

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
      e.preventDefault();
      cycleThemeFlavor();
      logger.info('ThemeSwitcher', `Flavor cambiado a: ${FLAVOR_NAMES[$themeFlavor.get()]}`);
    }
  });
}

// ---------------------------------------------------------------------------
// Backward-compatible aliases (for gradual migration)
// ---------------------------------------------------------------------------

/** @deprecated Use `$themeMode` instead */
export const $theme = $themeMode;

/** @deprecated Use `$resolvedMode` instead */
export const $resolvedTheme = $resolvedMode;

/** @deprecated Use `setThemeMode()` instead */
export const setTheme = setThemeMode;

/** @deprecated Use `toggleThemeMode()` instead */
export const toggleTheme = toggleThemeMode;

// ---------------------------------------------------------------------------
// (Re-export types for convenience)
// ---------------------------------------------------------------------------

/** @deprecated Use `ThemeMode` instead */
export type Theme = ThemeMode;
