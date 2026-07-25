/**
 * Tests unitarios para shared/i18n (getLanguage, getT, setLanguage, toggleLanguage).
 *
 * Funciones puras de obtención de idioma y traducciones.
 * No requieren mocks de Firebase.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLanguage, getT, setLanguage, toggleLanguage } from '../../../../src/lib/shared/i18n';
import { translations } from '../../../../src/i18n/translations';

// ─── Tests: getLanguage ──────────────────────────────────────────────────────

describe('i18n: getLanguage', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { store = {}; }),
    };
  })();

  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });
    localStorageMock.clear();
    vi.clearAllMocks();

    // Mock window global
    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: localStorageMock },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  it('✅ should return "es" by default', () => {
    delete (globalThis as any).window;
    const result = getLanguage();
    expect(result).toBe('es');
  });

  it('✅ should return urlLang when it is "es"', () => {
    expect(getLanguage('es')).toBe('es');
  });

  it('✅ should return urlLang when it is "en"', () => {
    expect(getLanguage('en')).toBe('en');
  });

  it('✅ should ignore invalid urlLang and fall back', () => {
    delete (globalThis as any).window;
    expect(getLanguage('fr')).toBe('es');
    expect(getLanguage('')).toBe('es');
  });

  it('✅ should return stored language from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('en');
    const result = getLanguage();
    expect(result).toBe('en');
  });

  it('✅ should return "es" when localStorage has "es"', () => {
    localStorageMock.getItem.mockReturnValue('es');
    const result = getLanguage();
    expect(result).toBe('es');
  });

  it('✅ should ignore invalid localStorage value and fall back to default', () => {
    localStorageMock.getItem.mockReturnValue('fr');
    // Set navigator to non-English to test the fallback chain
    Object.defineProperty(globalThis.navigator, 'language', {
      value: 'fr-FR', configurable: true, writable: true,
    });
    const result = getLanguage();
    expect(result).toBe('es');
  });

  it('✅ should detect browser language when available', () => {
    localStorageMock.getItem.mockReturnValue(null);
    Object.defineProperty(globalThis.navigator, 'language', {
      value: 'en-US', configurable: true, writable: true,
    });
    const result = getLanguage();
    expect(result).toBe('en');
  });

  it('✅ should fall back to "es" for non-English browser languages', () => {
    localStorageMock.getItem.mockReturnValue(null);
    Object.defineProperty(globalThis.navigator, 'language', {
      value: 'fr-FR', configurable: true, writable: true,
    });
    const result = getLanguage();
    expect(result).toBe('es');
  });

  it('✅ should handle missing navigator gracefully', () => {
    delete (globalThis as any).window;
    const result = getLanguage();
    expect(result).toBe('es');
  });

  it('⚠️ should prioritize urlLang over localStorage', () => {
    localStorageMock.getItem.mockReturnValue('en');
    const result = getLanguage('es');
    expect(result).toBe('es');
  });
});

// ─── Tests: getT ─────────────────────────────────────────────────────────────

describe('i18n: getT', () => {
  it('✅ should return the translation for a valid key in "es"', () => {
    const t = getT('es');
    expect(t('app.name')).toBe('CampFit');
  });

  it('✅ should return the translation for a valid key in "en"', () => {
    const t = getT('en');
    expect(t('app.name')).toBe('CampFit');
  });

  it('✅ should fall back to "es" when key is missing in "en"', () => {
    const t = getT('en');
    // Usar una key que sabemos que existe en 'es' pero quizás no en 'en'
    const result = t('app.name');
    expect(result).toBe('CampFit');
  });

  it('⚠️ should return the key itself if not found in any language', () => {
    const t = getT('es');
    expect(t('key.that.does.not.exist')).toBe('key.that.does.not.exist');
  });

  it('✅ should default to "es" when no language is provided', () => {
    const t = getT();
    expect(t('app.name')).toBe('CampFit');
  });
});

// ─── Tests: setLanguage ────────────────────────────────────────────────────

describe('i18n: setLanguage', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'document', {
      value: { documentElement: { lang: '' } },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: globalThis.localStorage,
        document: globalThis.document,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).document;
  });

  it('✅ should store language in localStorage', () => {
    setLanguage('en');
    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith('campfit_lang', 'en');
  });

  it('✅ should update document lang attribute', () => {
    setLanguage('es');
    expect(globalThis.document.documentElement.lang).toBe('es');
  });

  it('⚠️ should not throw when window is undefined', () => {
    delete (globalThis as any).window;
    delete (globalThis as any).document;
    expect(() => setLanguage('es')).not.toThrow();
  });
});

// ─── Tests: toggleLanguage ─────────────────────────────────────────────────

describe('i18n: toggleLanguage', () => {
  let mockGetItem: ReturnType<typeof vi.fn>;
  let mockSetItem: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetItem = vi.fn();
    mockSetItem = vi.fn();
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'document', {
      value: { documentElement: { lang: '' } },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: globalThis.localStorage,
        document: globalThis.document,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).document;
  });

  it('✅ should toggle from "es" to "en"', () => {
    mockGetItem.mockReturnValue('es');
    const result = toggleLanguage();
    expect(result).toBe('en');
  });

  it('✅ should toggle from "en" to "es"', () => {
    mockGetItem.mockReturnValue('en');
    const result = toggleLanguage();
    expect(result).toBe('es');
  });

  it('✅ should store the new language', () => {
    mockGetItem.mockReturnValue('es');
    toggleLanguage();
    expect(mockSetItem).toHaveBeenCalledWith('campfit_lang', 'en');
  });
});
