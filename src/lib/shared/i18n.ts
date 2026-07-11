/**
 * Utilidades compartidas de internacionalización (i18n).
 * Unifica la obtención del idioma tanto en server-side (Astro) como client-side (navegador).
 *
 * @module shared/i18n
 */

import { translations, type Language } from '@/i18n/translations';

const STORAGE_KEY = 'campfit_lang';

/**
 * Obtiene el idioma desde los parámetros de URL (server-side) o localStorage (client-side).
 * Server-side: Lee de `Astro.url.searchParams.get('lang')`.
 * Client-side: Lee de `localStorage`.
 *
 * @param urlLang - Idioma extraído de la URL (opcional, para server-side)
 * @returns Idioma detectado ('es' por defecto)
 *
 * @example
 * // En Astro frontmatter (server-side):
 * const lang = getLanguage(Astro.url.searchParams.get('lang'));
 *
 * @example
 * // En script client-side:
 * const lang = getLanguage();
 */
export function getLanguage(urlLang?: string | null): Language {
  // Prioridad 1: Parámetro de URL (server-side)
  if (urlLang === 'es' || urlLang === 'en') {
    return urlLang;
  }

  // Prioridad 2: localStorage (client-side)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored === 'es' || stored === 'en') {
      return stored;
    }
  }

  // Prioridad 3: Idioma del navegador (client-side)
  if (typeof window !== 'undefined' && navigator.language) {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'en') {
      return 'en';
    }
  }

  // Default: español
  return 'es';
}

/**
 * Obtiene la función de traducción para el idioma actual.
 * Versión server-side (Astro frontmatter).
 *
 * @param urlLang - Idioma extraído de la URL
 * @returns Función de traducción (key: string) => string
 *
 * @example
 * // En Astro frontmatter:
 * const t = getT(Astro.url.searchParams.get('lang'));
 * // Uso: t('app.name')
 */
export function getT(urlLang?: string | null): (key: string) => string {
  const lang = getLanguage(urlLang);
  return (key: string) => translations[lang]?.[key] || translations['es']?.[key] || key;
}

/**
 * Guarda el idioma seleccionado en localStorage.
 * @param lang - Idioma a guardar
 */
export function setLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }
}

/**
 * Alterna entre español e inglés.
 * @returns Nuevo idioma
 */
export function toggleLanguage(): Language {
  const current = getLanguage();
  const next: Language = current === 'es' ? 'en' : 'es';
  setLanguage(next);
  return next;
}
