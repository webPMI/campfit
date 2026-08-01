/**
 * Barrel exports del módulo i18n.
 *
 * @module i18n
 */

// Tipos
export type { Language, TranslationMap, Translations, TranslateFunction, LanguageDetectionOptions, TranslationStats } from './types';

// Traducciones
export { translations, t } from './translations';

// Cliente i18n
export {
  getStoredLanguage,
  setStoredLanguage,
  toggleLanguage,
  translateDOM,
  t as clientT,
} from './client';

// Utilidades compartidas
export { getLanguage, getT, setLanguage } from '@/lib/shared/i18n';