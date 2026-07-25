/**
 * Tipos compartidos del sistema de internacionalización (i18n).
 *
 * @module i18n/types
 */

/**
 * Idiomas soportados por la aplicación.
 * - 'es': Español
 * - 'en': Inglés
 */
export type Language = 'es' | 'en';

/**
 * Mapa de traducciones para un idioma específico.
 * Clave: string (ruta de traducción)
 * Valor: string (texto traducido)
 */
export type TranslationMap = Record<string, string>;

/**
 * Mapa de traducciones completo (todos los idiomas).
 * Clave: Language ('es' | 'en')
 * Valor: TranslationMap
 */
export type Translations = Record<Language, TranslationMap>;

/**
 * Función de traducción.
 * @param key - Clave de traducción (ej: 'auth.login.title')
 * @returns Texto traducido o la key si no existe
 */
export type TranslateFunction = (key: string) => string;

/**
 * Opciones para detección de idioma.
 */
export interface LanguageDetectionOptions {
  /** Idioma desde URL param (server-side) */
  urlLang?: string | null;
  /** Forzar idioma específico */
  force?: Language;
}

/**
 * Estadísticas de traducciones.
 */
export interface TranslationStats {
  /** Total de claves por idioma */
  totalKeys: {
    es: number;
    en: number;
  };
  /** Claves sincronizadas (existen en ambos idiomas) */
  synchronized: number;
  /** Claves faltantes por idioma */
  missing: {
    es: string[];
    en: string[];
  };
  /** Porcentaje de cobertura por idioma */
  coverage: {
    es: number;
    en: number;
  };
}