/**
 * Theme Store — Centralized theme state management using Nanostores.
 *
 * Architecture:
 * - `$theme` atom stores the current theme: 'light' | 'dark'
 * - `$resolvedTheme` computed atom that respects system preference when theme is 'auto'
 * - Actions provide a clean API for theme manipulation
 *
 * Persistence: theme preference is stored in localStorage under 'campfit_theme'
 * SSR Safety: all browser-only APIs are guarded with typeof window checks
 *
 * @module stores/themeStore
 */

import { atom, computed } from 'nanostores';
import { logger } from '@/lib/shared/logger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Available theme modes */
export type Theme = 'light' | 'dark';

/** Key used for localStorage persistence */
const STORAGE_KEY = 'campfit_theme';

/** CSS attribute set on <html> element */
const THEME_ATTR = 'data-theme';

// ---------------------------------------------------------------------------
// SSR-safe helpers
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readStoredTheme(): Theme {
  if (!isBrowser()) return 'dark';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage might be unavailable (private browsing, etc.)
  }
  return 'dark';
}

function persistTheme(theme: Theme): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Silently fail — theme still works in-memory
  }
}

// ---------------------------------------------------------------------------
// Atom: current theme
// ---------------------------------------------------------------------------

/** The current theme persisted across sessions. Defaults to 'dark'. */
export const $theme = atom<Theme>(readStoredTheme());

// ---------------------------------------------------------------------------
// Computed: resolved theme (always 'light' | 'dark', never 'auto')
// ---------------------------------------------------------------------------

/**
 * Resolved theme value.
 * Currently always matches $theme since we only support explicit 'light' | 'dark'.
 * Kept as a computed for future extensibility (system preference, time-based, etc.).
 */
export const $resolvedTheme = computed($theme, (t) => t);

/** Convenience boolean computed stores */
export const $isDark = computed($theme, (t) => t === 'dark');
export const $isLight = computed($theme, (t) => t === 'light');

// ---------------------------------------------------------------------------
// CSS variable application
// ---------------------------------------------------------------------------

/**
 * Applies the theme to the DOM by setting `data-theme` on <html>.
 * This triggers CSS variable changes defined with `[data-theme="dark"]` selectors.
 * Also updates <meta name="theme-color"> for browser chrome theming.
 */
export function applyThemeToDom(theme: Theme): void {
  if (!isBrowser()) return;

  const root = document.documentElement;
  root.setAttribute(THEME_ATTR, theme);

  // Update meta theme-color for mobile browser chrome
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#09090b' : '#fafafa');
  }

  // Update body class for Tailwind dark/light compatibility
  // Note: CSS variables are the primary mechanism; body classes are a fallback
  if (document.body) {
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Sets the theme to the specified value.
 * Persists to localStorage and applies to DOM.
 */
export function setTheme(theme: Theme): void {
  $theme.set(theme);
  persistTheme(theme);
  applyThemeToDom(theme);
}

/** Toggles between 'light' and 'dark'. */
export function toggleTheme(): void {
  const current = $theme.get();
  setTheme(current === 'dark' ? 'light' : 'dark');
}

/**
 * Initializes the theme system.
 * Must be called once on app startup (client-side only).
 * Reads stored preference and applies it to the DOM.
 */
export function initTheme(): void {
  const theme = readStoredTheme();
  applyThemeToDom(theme);
  $theme.set(theme);
}