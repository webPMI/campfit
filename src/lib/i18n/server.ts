/**
 * Utilidad de idioma para SSR en Astro.
 * Lee el idioma de: cookie → URL params → default 'es'
 */
import type { Language } from '@/i18n/types';

/**
 * Obtiene el idioma desde el URL param.
 * Para static sites, Astro.url.searchParams es la única API disponible.
 */
export function getLangFromURL(url: URL): Language {
  const lang = url.searchParams.get('lang');
  if (lang === 'es' || lang === 'en') return lang;
  return 'es';
}

export function getLangFromRequest(astroContext: { url: URL }): Language {
  return getLangFromURL(astroContext.url);
}
