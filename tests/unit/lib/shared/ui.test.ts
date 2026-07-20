/**
 * Tests para shared/ui.ts
 *
 * @module tests/unit/lib/shared/ui.test
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
      expect(badge.class).toContain('purple');
    });

    it('debería devolver badge para trainer', () => {
      const badge = getRoleBadge('trainer');
      expect(badge.label).toBe('Trainer');
      expect(badge.class).toContain('blue');
    });

    it('debería devolver badge para client', () => {
      const badge = getRoleBadge('client');
      expect(badge.label).toBe('Client');
      expect(badge.class).toContain('emerald');
    });

    it('debería devolver badge genérico para roles desconocidos', () => {
      const badge = getRoleBadge('unknown');
      expect(badge.label).toBe('unknown');
      expect(badge.class).toContain('zinc');
    });
  });

  describe('renderEmptyState', () => {
    it('debería renderizar HTML con el icono y mensaje', () => {
      const html = renderEmptyState(ICONS.users, 'No hay usuarios');
      expect(html).toContain(ICONS.users);
      expect(html).toContain('No hay usuarios');
      expect(html).toContain('rounded-xl');
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
      expect(toast?.textContent).toBe('Guardado exitoso');
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
      expect(toasts[0]?.textContent).toBe('Segundo');
    });

    it('debería aplicar la clase de color correcta según el tipo', () => {
      showToast({ message: 'Error', type: 'error' });
      const toast = document.getElementById('app-toast');
      expect(toast?.className).toContain('border-red-500');
    });

    it('debería aplicar position top cuando se especifica', () => {
      showToast({ message: 'Top toast', type: 'info', position: 'top' });
      const toast = document.getElementById('app-toast');
      expect(toast?.className).toContain('top-24');
    });

    it('debería aplicar position bottom por defecto', () => {
      showToast({ message: 'Bottom toast', type: 'info' });
      const toast = document.getElementById('app-toast');
      expect(toast?.className).toContain('bottom-24');
    });
  });
});
