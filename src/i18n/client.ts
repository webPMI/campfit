import { type Language } from './types';
import { translations } from './translations';

const STORAGE_KEY = 'campfit_lang';

/**
 * Obtiene el idioma almacenado en localStorage.
 * @returns Idioma detectado ('es' por defecto)
 */
export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'es';
  return (localStorage.getItem(STORAGE_KEY) as Language) || 'es';
}

/**
 * Guarda el idioma en localStorage y actualiza el atributo lang del HTML.
 * @param lang - Idioma a guardar
 */
export function setStoredLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

/**
 * Alterna entre español e inglés.
 * @returns Nuevo idioma
 */
export function toggleLanguage(): Language {
  const current = getStoredLanguage();
  const next = current === 'es' ? 'en' : 'es';
  setStoredLanguage(next);
  return next;
}

/**
 * Función de traducción para client-side.
 * Usa el idioma almacenado en localStorage.
 * @param key - Clave de traducción
 * @returns Texto traducido o la key si no existe
 */
export function t(key: string): string {
  const lang = getStoredLanguage();
  return translations[lang]?.[key] || translations['es']?.[key] || key;
}
