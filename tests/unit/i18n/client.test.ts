/**
<<<<<<< HEAD
 * Tests para i18n/client.ts
 *
 * @module tests/unit/i18n/client.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getStoredLanguage, setStoredLanguage, toggleLanguage, t } from '@/i18n/client';

const STORAGE_KEY = 'campfit_lang';

describe('i18n/client', () => {
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
    vi.stubGlobal('document', { documentElement: { lang: '' } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getStoredLanguage', () => {
    it('debería devolver "es" por defecto', () => {
      expect(getStoredLanguage()).toBe('es');
    });

    it('debería devolver el idioma guardado en localStorage', () => {
      localStorageMock[STORAGE_KEY] = 'en';
      expect(getStoredLanguage()).toBe('en');
    });

    it('debería devolver "es" si no hay window (SSR)', () => {
      vi.stubGlobal('window', undefined);
      expect(getStoredLanguage()).toBe('es');
=======
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
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
    });
  });

  describe('setStoredLanguage', () => {
<<<<<<< HEAD
    it('debería guardar el idioma en localStorage', () => {
      setStoredLanguage('en');
      expect(localStorageMock[STORAGE_KEY]).toBe('en');
    });

    it('debería actualizar document.documentElement.lang', () => {
      setStoredLanguage('en');
      expect(document.documentElement.lang).toBe('en');
    });

    it('debería guardar español correctamente', () => {
      setStoredLanguage('es');
      expect(localStorageMock[STORAGE_KEY]).toBe('es');
=======
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
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
    });
  });

  describe('toggleLanguage', () => {
<<<<<<< HEAD
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

  describe('t', () => {
    it('debería traducir keys existentes en español', () => {
      localStorageMock[STORAGE_KEY] = 'es';
      expect(t('auth.login.btn')).toBe('Iniciar Sesión');
    });

    it('debería traducir keys existentes en inglés', () => {
      localStorageMock[STORAGE_KEY] = 'en';
      expect(t('auth.login.btn')).toBe('Sign In');
    });

    it('debería devolver la key si no encuentra traducción', () => {
      expect(t('key.inexistente')).toBe('key.inexistente');
    });

    it('debería devolver la key si no existe en ningún idioma (sin fallback)', () => {
      localStorageMock[STORAGE_KEY] = 'en';
      // Todas las keys en client.ts existen en ambos idiomas,
      // así que una key inexistente debe devolver la key misma
      expect(t('key.inexistente')).toBe('key.inexistente');
    });

    it('debería traducir errores de Firebase', () => {
      localStorageMock[STORAGE_KEY] = 'es';
      expect(t('error.invalid-credential')).toBe('Email o contraseña incorrectos');
      expect(t('error.email-in-use')).toBe('Este email ya está registrado');
      expect(t('error.too-many-requests')).toBe('Demasiados intentos. Intenta más tarde');
    });

    it('debería traducir textos del dashboard', () => {
      localStorageMock[STORAGE_KEY] = 'es';
      expect(t('dashboard.loading')).toBe('Verificando sesión...');
      expect(t('dashboard.logout')).toBe('Cerrar Sesión');
    });

    it('debería traducir textos del cliente', () => {
      localStorageMock[STORAGE_KEY] = 'es';
      expect(t('client.greeting')).toBe('¡Hola');
      expect(t('app.name')).toBe('CampFit');
    });

    it('debería traducir textos de onboarding', () => {
      localStorageMock[STORAGE_KEY] = 'es';
      expect(t('onboarding.next')).toBe('Continuar');
      expect(t('onboarding.finish')).toBe('Finalizar');
    });
  });
});
=======
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
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
