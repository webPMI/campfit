/**
 * Tests para shared/i18n.ts
 *
 * @module tests/unit/lib/shared/i18n.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLanguage, getT, setLanguage, toggleLanguage } from '@/lib/shared/i18n';

const STORAGE_KEY = 'campfit_lang';

describe('shared/i18n', () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    localStorageMock = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => localStorageMock[key] ?? null,
      setItem: (key: string, value: string) => { localStorageMock[key] = value; },
      removeItem: (key: string) => { delete localStorageMock[key]; },
      clear: () => { localStorageMock = {}; },
      length: 0,
      key: (_: number) => null,
    });
    vi.stubGlobal('navigator', { language: 'es-ES' });
    vi.stubGlobal('document', { documentElement: { lang: '' } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getLanguage', () => {
    it('debería devolver "es" cuando urlLang es "es"', () => {
      expect(getLanguage('es')).toBe('es');
    });

    it('debería devolver "en" cuando urlLang es "en"', () => {
      expect(getLanguage('en')).toBe('en');
    });

    it('debería ignorar urlLang inválido y usar localStorage', () => {
      localStorageMock[STORAGE_KEY] = 'en';
      expect(getLanguage('fr')).toBe('en');
    });

    it('debería leer de localStorage cuando no hay urlLang', () => {
      localStorageMock[STORAGE_KEY] = 'en';
      expect(getLanguage()).toBe('en');
    });

    it('debería devolver "es" por defecto cuando no hay nada', () => {
      expect(getLanguage()).toBe('es');
    });

    it('debería detectar idioma del navegador cuando es "en"', () => {
      vi.stubGlobal('navigator', { language: 'en-US' });
      expect(getLanguage()).toBe('en');
    });

    it('debería devolver "es" cuando el navegador no es inglés', () => {
      vi.stubGlobal('navigator', { language: 'fr-FR' });
      expect(getLanguage()).toBe('es');
    });

    it('debería dar prioridad a urlLang sobre localStorage', () => {
      localStorageMock[STORAGE_KEY] = 'en';
      expect(getLanguage('es')).toBe('es');
    });

    it('debería dar prioridad a localStorage sobre navegador', () => {
      localStorageMock[STORAGE_KEY] = 'es';
      vi.stubGlobal('navigator', { language: 'en-US' });
      expect(getLanguage()).toBe('es');
    });
  });

  describe('getT', () => {
    it('debería devolver una función de traducción', () => {
      const t = getT();
      expect(typeof t).toBe('function');
    });

    it('debería traducir keys existentes en español', () => {
      const t = getT('es');
      expect(t('app.name')).toBe('CampFit');
    });

    it('debería traducir keys existentes en inglés', () => {
      const t = getT('en');
      expect(t('app.name')).toBe('CampFit');
    });

    it('debería devolver la key si no encuentra traducción', () => {
      const t = getT('es');
      expect(t('key.inexistente')).toBe('key.inexistente');
    });

    it('debería hacer fallback a español si el idioma no tiene la key', () => {
      const t = getT('en');
      // 'onboarding.finish' existe en español pero no en inglés en translations.ts
      expect(t('onboarding.finish')).toBe('Finalizar');
    });
  });

  describe('setLanguage', () => {
    it('debería guardar el idioma en localStorage', () => {
      setLanguage('en');
      expect(localStorageMock[STORAGE_KEY]).toBe('en');
    });

    it('debería actualizar document.documentElement.lang', () => {
      const docElem = document.documentElement;
      setLanguage('en');
      expect(docElem.lang).toBe('en');
    });
  });

  describe('toggleLanguage', () => {
    it('debería cambiar de español a inglés', () => {
      localStorageMock[STORAGE_KEY] = 'es';
      const result = toggleLanguage();
      expect(result).toBe('en');
      expect(localStorageMock[STORAGE_KEY]).toBe('en');
    });

    it('debería cambiar de inglés a español', () => {
      localStorageMock[STORAGE_KEY] = 'en';
      const result = toggleLanguage();
      expect(result).toBe('es');
      expect(localStorageMock[STORAGE_KEY]).toBe('es');
    });

    it('debería cambiar de español a inglés por defecto', () => {
      const result = toggleLanguage();
      expect(result).toBe('en');
    });
  });
});
