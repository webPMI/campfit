/**
 * Tests unitarios para shared/ui (escapeHtml, formatDate, formatTime,
 * getUserInitial, getRoleBadge, renderEmptyState, renderLoadingState).
 *
 * Funciones puras de utilidades UI. No requieren mocks de Firebase.
 * showToast depende del DOM → se testea con jsdom/happy-dom.
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