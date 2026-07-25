/**
 * Tests unitarios para i18n/client.ts
 * Verifica las funciones de gestión de idioma del cliente.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getStoredLanguage, setStoredLanguage, toggleLanguage } from '../../../src/i18n/client';

describe('i18n/client', () => {
  let localStorageMock: Record<string, string>;
  let documentMock: { documentElement: { lang: string } };

  beforeEach(() => {
    localStorageMock = {};
    documentMock = { documentElement: { lang: 'es' } };

    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { localStorageMock[key] = value; }),
      },
      writable: true,
    });

    Object.defineProperty(globalThis, 'document', {
      value: documentMock,
      writable: true,
    });

    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: globalThis.localStorage },
      writable: true,
    });
  });

  afterEach(() => {
    // No need to delete window as it's provided by happy-dom
  });

  describe('getStoredLanguage', () => {
    it('✅ should return stored language from localStorage when set to "en"', () => {
      localStorageMock['campfit_lang'] = 'en';
      const result = getStoredLanguage();
      expect(result).toBe('en');
    });

    it('✅ should return stored language from localStorage when set to "es"', () => {
      localStorageMock['campfit_lang'] = 'es';
      const result = getStoredLanguage();
      expect(result).toBe('es');
    });

    it('✅ should return "es" when localStorage returns null', () => {
      const result = getStoredLanguage();
      expect(result).toBe('es');
    });
  });

  describe('setStoredLanguage', () => {
    it('✅ should store language in localStorage', () => {
      setStoredLanguage('en');
      expect(localStorage.setItem).toHaveBeenCalledWith('campfit_lang', 'en');
    });

    it('✅ should update document.documentElement.lang', () => {
      setStoredLanguage('en');
      expect(documentMock.documentElement.lang).toBe('en');
    });

    it('✅ should work with "es" language', () => {
      setStoredLanguage('es');
      expect(localStorage.setItem).toHaveBeenCalledWith('campfit_lang', 'es');
      expect(documentMock.documentElement.lang).toBe('es');
    });
  });

  describe('toggleLanguage', () => {
    it('✅ should toggle from "es" to "en"', () => {
      localStorageMock['campfit_lang'] = 'es';
      const result = toggleLanguage();
      expect(result).toBe('en');
      expect(localStorage.setItem).toHaveBeenCalledWith('campfit_lang', 'en');
    });

    it('✅ should toggle from "en" to "es"', () => {
      localStorageMock['campfit_lang'] = 'en';
      const result = toggleLanguage();
      expect(result).toBe('es');
      expect(localStorage.setItem).toHaveBeenCalledWith('campfit_lang', 'es');
    });

    it('✅ should toggle from undefined to "en"', () => {
      const result = toggleLanguage();
      expect(result).toBe('en');
      expect(localStorage.setItem).toHaveBeenCalledWith('campfit_lang', 'en');
    });

    it('✅ should update document.documentElement.lang when toggling', () => {
      localStorageMock['campfit_lang'] = 'es';
      toggleLanguage();
      expect(documentMock.documentElement.lang).toBe('en');
    });
  });
});