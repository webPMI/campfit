/**
<<<<<<< HEAD
 * Tests para shared/ui.ts
 *
 * @module tests/unit/lib/shared/ui.test
=======
 * Tests unitarios para shared/ui (escapeHtml, formatDate, formatTime,
 * getUserInitial, getRoleBadge, renderEmptyState, renderLoadingState).
 *
 * Funciones puras de utilidades UI. No requieren mocks de Firebase.
 * showToast depende del DOM → se testea con jsdom/happy-dom.
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  escapeHtml,
  formatDate,
  formatTime,
  getUserInitial,
  getRoleBadge,
  renderEmptyState,
  renderLoadingState,
  showToast,
<<<<<<< HEAD
  ICONS,
} from '@/lib/shared/ui';

const AMP = String.fromCharCode(38, 97, 109, 112, 59); // &
const LT = String.fromCharCode(38, 108, 116, 59);       // <
const GT = String.fromCharCode(38, 103, 116, 59);       // >
const QUOT = String.fromCharCode(38, 113, 117, 111, 116, 59); // "
const APOS = String.fromCharCode(38, 35, 120, 50, 55, 59);    // &#x27;

describe('shared/ui', () => {
  describe('ICONS', () => {
    it('debería tener todos los iconos definidos', () => {
      expect(ICONS.users).toBeDefined();
      expect(ICONS.trainers).toBeDefined();
      expect(ICONS.clients).toBeDefined();
      expect(ICONS.workouts).toBeDefined();
      expect(ICONS.diets).toBeDefined();
      expect(ICONS.alert).toBeDefined();
      expect(ICONS.check).toBeDefined();
      expect(ICONS.chat).toBeDefined();
      expect(ICONS.progress).toBeDefined();
    });

    it('cada icono debería ser un string SVG path', () => {
      Object.values(ICONS).forEach((icon) => {
        expect(typeof icon).toBe('string');
        expect(icon.length).toBeGreaterThan(50);
      });
    });
  });

  describe('escapeHtml', () => {
    it('debería escapar & a ' + AMP, () => {
      expect(escapeHtml('&')).toBe(AMP);
    });

    it('debería escapar < a ' + LT, () => {
      expect(escapeHtml('<')).toBe(LT);
    });

    it('debería escapar > a ' + GT, () => {
      expect(escapeHtml('>')).toBe(GT);
    });

    it('debería escapar " a ' + QUOT, () => {
      expect(escapeHtml('"')).toBe(QUOT);
    });

    it('debería escapar \' a ' + APOS, () => {
      expect(escapeHtml("'")).toBe(APOS);
    });

    it('debería escapar texto mixto', () => {
      const input = '<script>alert("xss")</script>';
      const expected = LT + 'script' + GT + 'alert(' + QUOT + 'xss' + QUOT + ')' + LT + '/script' + GT;
      expect(escapeHtml(input)).toBe(expected);
    });

    it('debería devolver string vacío para input vacío', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('debería devolver el mismo texto si no hay caracteres especiales', () => {
      expect(escapeHtml('Hola Mundo')).toBe('Hola Mundo');
    });
  });

  describe('formatDate', () => {
    it('debería formatear un timestamp válido', () => {
      const timestamp = { toDate: () => new Date('2024-03-15T10:30:00') };
      const result = formatDate(timestamp);
      expect(result).toContain('2024');
      expect(result).toContain('mar');
    });

    it('debería devolver "-" para null', () => {
      expect(formatDate(null)).toBe('-');
    });

    it('debería devolver "-" para undefined', () => {
      expect(formatDate(undefined)).toBe('-');
    });

    it('debería devolver "-" si no tiene toDate', () => {
      expect(formatDate({} as any)).toBe('-');
    });

    it('debería devolver "-" si toDate lanza error', () => {
      const badTimestamp = { toDate: () => { throw new Error('invalid'); } };
      expect(formatDate(badTimestamp)).toBe('-');
    });
  });

  describe('formatTime', () => {
    it('debería formatear un timestamp válido', () => {
      const timestamp = { toDate: () => new Date('2024-03-15T10:30:00') };
      const result = formatTime(timestamp);
      expect(result).toContain('10');
      expect(result).toContain('30');
    });

    it('debería devolver "" para null', () => {
      expect(formatTime(null)).toBe('');
    });

    it('debería devolver "" para undefined', () => {
      expect(formatTime(undefined)).toBe('');
    });

    it('debería devolver "" si no tiene toDate', () => {
      expect(formatTime({} as any)).toBe('');
    });
  });

  describe('getUserInitial', () => {
    it('debería devolver la inicial en mayúscula', () => {
      expect(getUserInitial('juan')).toBe('J');
    });

    it('debería devolver la inicial de un nombre completo', () => {
      expect(getUserInitial('María García')).toBe('M');
    });

    it('debería devolver "?" para string vacío', () => {
      expect(getUserInitial('')).toBe('?');
    });

    it('debería manejar caracteres acentuados', () => {
      expect(getUserInitial('Ángel')).toBe('Á');
    });
  });

  describe('getRoleBadge', () => {
    it('debería devolver badge para admin', () => {
      const badge = getRoleBadge('admin');
      expect(badge.label).toBe('Admin');
      expect(badge.class).toContain('accent-purple');
    });

    it('debería devolver badge para trainer', () => {
      const badge = getRoleBadge('trainer');
      expect(badge.label).toBe('Trainer');
      expect(badge.class).toContain('info');
    });

    it('debería devolver badge para client', () => {
      const badge = getRoleBadge('client');
      expect(badge.label).toBe('Client');
      expect(badge.class).toContain('brand');
    });

    it('debería devolver badge genérico para roles desconocidos', () => {
      const badge = getRoleBadge('unknown');
      expect(badge.label).toBe('unknown');
      expect(badge.class).toContain('surface-3');
    });
  });

  describe('renderEmptyState', () => {
    it('debería renderizar HTML con el icono y mensaje', () => {
      const html = renderEmptyState(ICONS.users, 'No hay usuarios');
      expect(html).toContain(ICONS.users);
      expect(html).toContain('No hay usuarios');
      expect(html).toContain('rounded-2xl');
    });
  });

  describe('renderLoadingState', () => {
    it('debería renderizar HTML con mensaje por defecto', () => {
      const html = renderLoadingState();
      expect(html).toContain('Cargando...');
      expect(html).toContain('animate-spin');
    });

    it('debería renderizar HTML con mensaje personalizado', () => {
      const html = renderLoadingState('Obteniendo datos...');
      expect(html).toContain('Obteniendo datos...');
    });
  });

  describe('showToast', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('debería crear un elemento toast en el DOM', () => {
      showToast({ message: 'Guardado exitoso', type: 'success' });
      const toast = document.getElementById('app-toast');
      expect(toast).not.toBeNull();
      expect(toast?.textContent?.trim()).toBe('Guardado exitoso');
    });

    it('debería usar el id personalizado', () => {
      showToast({ message: 'Error', type: 'error', id: 'custom-toast' });
      expect(document.getElementById('custom-toast')).not.toBeNull();
    });

    it('debería reemplazar un toast existente con el mismo id', () => {
      showToast({ message: 'Primero', type: 'info' });
      showToast({ message: 'Segundo', type: 'info' });
      const toasts = document.querySelectorAll('#app-toast');
      expect(toasts.length).toBe(1);
      expect(toasts[0]?.textContent?.trim()).toBe('Segundo');
    });

    it('debería aplicar la clase de color correcta según el tipo', () => {
      showToast({ message: 'Error', type: 'error' });
      const toast = document.getElementById('app-toast');
      expect(toast).not.toBeNull();
      const innerSpan = toast?.querySelector('span');
      expect(innerSpan?.className).toContain('danger');
    });

    it('debería aplicar position top cuando se especifica', () => {
      showToast({ message: 'Top toast', type: 'info', position: 'top' });
      const toast = document.getElementById('app-toast');
      expect(toast).not.toBeNull();
      expect(toast?.style.cssText).toContain('top');
    });

    it('debería aplicar position bottom por defecto', () => {
      showToast({ message: 'Bottom toast', type: 'info' });
      const toast = document.getElementById('app-toast');
      expect(toast).not.toBeNull();
      expect(toast?.style.cssText).toContain('bottom');
    });
  });
});
=======
} from '../../../../src/lib/shared/ui';

// ─── Tests: escapeHtml ─────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('✅ should escape < and >', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
  });

  it('✅ should escape ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('✅ should escape double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
    expect(escapeHtml('say "hello"')).not.toContain('"');
  });

  it('✅ should escape single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#x27;s');
  });

  it('✅ should return empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('✅ should return same string for plain text', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  it('✅ should escape all special characters together', () => {
    const result = escapeHtml('<a href="test" onclick=\'alert(1)\'>&</a>');
    expect(result).toBe('&lt;a href=&quot;test&quot; onclick=&#x27;alert(1)&#x27;&gt;&amp;&lt;/a&gt;');
  });
});

// ─── Tests: formatDate ─────────────────────────────────────────────────────

describe('formatDate', () => {
  it('✅ should format a valid timestamp', () => {
    const date = new Date(2024, 0, 15);
    const timestamp = { toDate: () => date };
    const result = formatDate(timestamp);
    expect(result).toContain('2024');
    expect(result).toContain('ene');
  });

  it('✅ should return "-" for null timestamp', () => {
    expect(formatDate(null)).toBe('-');
  });

  it('✅ should return "-" for undefined timestamp', () => {
    expect(formatDate(undefined)).toBe('-');
  });

  it('✅ should return "-" for timestamp without toDate', () => {
    expect(formatDate({} as any)).toBe('-');
  });

  it('⚠️ should return "-" when toDate throws', () => {
    const badTimestamp = { toDate: () => { throw new Error('invalid'); } };
    expect(formatDate(badTimestamp)).toBe('-');
  });
});

// ─── Tests: formatTime ─────────────────────────────────────────────────────

describe('formatTime', () => {
  it('✅ should format a valid timestamp', () => {
    const date = new Date(2024, 0, 15, 14, 30);
    const timestamp = { toDate: () => date };
    const result = formatTime(timestamp);
    expect(result).toContain('14');
    expect(result).toContain('30');
  });

  it('✅ should return empty string for null timestamp', () => {
    expect(formatTime(null)).toBe('');
  });

  it('✅ should return empty string for undefined timestamp', () => {
    expect(formatTime(undefined)).toBe('');
  });

  it('⚠️ should return "" when toDate throws', () => {
    const badTimestamp = { toDate: () => { throw new Error('invalid'); } };
    expect(formatTime(badTimestamp)).toBe('');
  });
});

// ─── Tests: getUserInitial ──────────────────────────────────────────────────

describe('getUserInitial', () => {
  it('✅ should return first letter uppercase', () => {
    expect(getUserInitial('juan')).toBe('J');
  });

  it('✅ should return first letter for full name', () => {
    expect(getUserInitial('Maria Jose')).toBe('M');
  });

  it('✅ should return "?" for empty string', () => {
    expect(getUserInitial('')).toBe('?');
  });

  it('✅ should return "?" for null/undefined', () => {
    expect(getUserInitial(null as any)).toBe('?');
    expect(getUserInitial(undefined as any)).toBe('?');
  });
});

// ─── Tests: getRoleBadge ───────────────────────────────────────────────────

describe('getRoleBadge', () => {
  it('✅ should return admin badge', () => {
    const badge = getRoleBadge('admin');
    expect(badge.label).toBe('Admin');
    expect(badge.class).toContain('purple');
  });

  it('✅ should return trainer badge', () => {
    const badge = getRoleBadge('trainer');
    expect(badge.label).toBe('Trainer');
    expect(badge.class).toContain('blue');
  });

  it('✅ should return client badge', () => {
    const badge = getRoleBadge('client');
    expect(badge.label).toBe('Client');
    expect(badge.class).toContain('emerald');
  });

  it('⚠️ should return default badge for unknown role', () => {
    const badge = getRoleBadge('unknown');
    expect(badge.label).toBe('unknown');
    expect(badge.class).toContain('zinc');
  });
});

// ─── Tests: renderEmptyState ───────────────────────────────────────────────

describe('renderEmptyState', () => {
  it('✅ should render HTML with icon and message', () => {
    const result = renderEmptyState('<svg></svg>', 'No hay datos');
    expect(result).toContain('<svg');
    expect(result).toContain('No hay datos');
    expect(result).toContain('rounded-xl');
  });

  it('✅ should handle empty icon', () => {
    const result = renderEmptyState('', 'Vacío');
    expect(result).toContain('Vacío');
  });
});

// ─── Tests: renderLoadingState ─────────────────────────────────────────────

describe('renderLoadingState', () => {
  it('✅ should render loading HTML with spinner', () => {
    const result = renderLoadingState();
    expect(result).toContain('animate-spin');
    expect(result).toContain('Cargando...');
    expect(result).toContain('rounded-xl');
  });

  it('✅ should use custom message', () => {
    const result = renderLoadingState('Procesando...');
    expect(result).toContain('Procesando...');
    expect(result).not.toContain('Cargando...');
  });
});

// ─── Tests: showToast ──────────────────────────────────────────────────────

describe('showToast', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('✅ should create toast element in the DOM', () => {
    showToast({ message: 'Test toast', type: 'success' });
    const toast = document.getElementById('app-toast');
    expect(toast).not.toBeNull();
    expect(toast?.textContent).toBe('Test toast');
  });

  it('✅ should use custom id', () => {
    showToast({ message: 'Custom', type: 'info', id: 'my-toast' });
    expect(document.getElementById('my-toast')).not.toBeNull();
  });

  it('✅ should remove existing toast with same id', () => {
    showToast({ message: 'First', type: 'info' });
    showToast({ message: 'Second', type: 'info' });
    const toasts = document.querySelectorAll('#app-toast');
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.textContent).toBe('Second');
  });

  it('✅ should apply success color classes', () => {
    showToast({ message: 'OK', type: 'success' });
    const toast = document.getElementById('app-toast');
    expect(toast?.className).toContain('emerald');
  });

  it('✅ should apply error color classes', () => {
    showToast({ message: 'Error', type: 'error' });
    const toast = document.getElementById('app-toast');
    expect(toast?.className).toContain('red');
  });

  it('✅ should apply top position class', () => {
    showToast({ message: 'Top', type: 'info', position: 'top' });
    const toast = document.getElementById('app-toast');
    expect(toast?.className).toContain('top-24');
  });

  it('✅ should apply bottom position class by default', () => {
    showToast({ message: 'Bottom', type: 'info' });
    const toast = document.getElementById('app-toast');
    expect(toast?.className).toContain('bottom-24');
  });
});
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
