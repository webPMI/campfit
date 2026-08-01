import { translations as fullTranslations } from './translations';

export type Language = 'es' | 'en';

const STORAGE_KEY = 'campfit_lang';

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'es';
  return (localStorage.getItem(STORAGE_KEY) as Language) || 'es';
}

export function setStoredLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  translateDOM();
}

export function toggleLanguage(): Language {
  const current = getStoredLanguage();
  const next = current === 'es' ? 'en' : 'es';
  setStoredLanguage(next);
  return next;
}

export function t(key: string, overrideLang?: Language): string {
  const lang = overrideLang || getStoredLanguage();
  return fullTranslations[lang]?.[key] || fullTranslations['es']?.[key] || key;
}

let isObserverInitialized = false;

export function translateDOM(container: ParentNode = typeof document !== 'undefined' ? document : ({} as ParentNode)): void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !container || typeof container.querySelectorAll !== 'function') return;
  const lang = getStoredLanguage();

  const elements = container.querySelectorAll<HTMLElement>('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const translated = t(key, lang);
      if (translated && translated !== key) {
        el.textContent = translated;
      }
    }
  });

  const placeholders = container.querySelectorAll<HTMLElement>('[data-i18n-placeholder]');
  placeholders.forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
      const translated = t(key, lang);
      if (translated && translated !== key) {
        el.placeholder = translated;
      }
    }
  });

  const titles = container.querySelectorAll<HTMLElement>('[data-i18n-title]');
  titles.forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) {
      const translated = t(key, lang);
      if (translated && translated !== key) {
        el.title = translated;
      }
    }
  });

  // Activar observador de mutaciones para traducir automáticamente contenido dinámico JS
  if (!isObserverInitialized && typeof MutationObserver !== 'undefined' && document.body) {
    isObserverInitialized = true;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            translateDOM(node as HTMLElement);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}