import type { Language } from './types';
import { es } from './locales/es';
import { en } from './locales/en';

export type { Language };

export const translations: Record<Language, Record<string, string>> = {
  es,
  en,
};

export function t(key: string, lang: Language): string {
  return translations[lang]?.[key] || translations['es']?.[key] || key;
}
