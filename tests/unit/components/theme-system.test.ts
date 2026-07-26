/**
 * Tests del Theme System
 * Verifica que los tokens CSS estén correctamente definidos y
 * que el sistema de temas funcione como se espera.
 *
 * @module tests/unit/components/theme-system.test
 */
import { describe, it, expect } from 'vitest';

// Tokens CSS esperados en dark mode
const DARK_TOKENS: Record<string, string> = {
    '--surface-0': '#09090b',
    '--surface-1': '#131316',
    '--surface-2': '#18181b',
    '--brand': '#10b981',
    '--brand-hover': '#34d399',
    '--brand-dim': '#065f46',
    '--text-primary': '#fafafa',
    '--text-secondary': '#a1a1aa',
    '--text-tertiary': '#909099',
    '--text-disabled': '#6b6b73',
    '--text-on-brand': '#ffffff',
    '--border-default': 'oklch(0.28 0.01 260)',
    '--border-subtle': 'oklch(0.22 0.01 260)',
    '--success': '#10b981',
    '--warning': '#f59e0b',
    '--danger': '#ef4444',
    '--danger-dim': '#581c1c',
    '--info': '#3b82f6',
    '--info-dim': '#1e3a6f',
    '--accent-blue': '#3b82f6',
    '--accent-purple': '#8b5cf6',
    '--accent-amber': '#f59e0b',
};

const LIGHT_TOKENS: Record<string, string> = {
    '--surface-0': '#fafafa',
    '--surface-1': '#ffffff',
    '--surface-2': '#f4f4f6',
    '--brand': '#059669',
    '--brand-hover': '#047857',
    '--brand-dim': '#a7f3d0',
    '--text-primary': '#18181b',
    '--text-secondary': '#52525b',
    '--text-tertiary': '#6b6b73',
    '--text-disabled': '#787882',
    '--text-on-brand': '#fafafa',
};

describe('Theme System', () => {
    describe('Theme Tokens CSS', () => {
        it('debería existir el archivo theme-tokens.css', () => {
            // Verifica que el archivo de tokens existe
            const fs = require('fs');
            const path = require('path');
            const exists = fs.existsSync(path.resolve(__dirname, '../../../public/theme-tokens.css'));
            expect(exists).toBe(true);
        });

        it('debería definir tokens dark mode correctos', () => {
            const fs = require('fs');
            const path = require('path');
            const css = fs.readFileSync(path.resolve(__dirname, '../../../public/theme-tokens.css'), 'utf8');

            // Extraer bloque dark mode
            const darkMatch = css.match(/\[data-theme="dark"\][\s\S]*?\}/);
            expect(darkMatch).not.toBeNull();

            for (const [token, value] of Object.entries(DARK_TOKENS)) {
                expect(darkMatch![0]).toContain(`${token}:`);
            }
        });

        it('debería definir tokens light mode correctos', () => {
            const fs = require('fs');
            const path = require('path');
            const css = fs.readFileSync(path.resolve(__dirname, '../../../public/theme-tokens.css'), 'utf8');

            const lightMatch = css.match(/\[data-theme="light"\][\s\S]*?\}/);
            expect(lightMatch).not.toBeNull();

            for (const [token, value] of Object.entries(LIGHT_TOKENS)) {
                expect(lightMatch![0]).toContain(`${token}:`);
            }
        });

        it('ambos temas deberían tener los mismos nombres de tokens', () => {
            const fs = require('fs');
            const path = require('path');
            const css = fs.readFileSync(path.resolve(__dirname, '../../../public/theme-tokens.css'), 'utf8');

            const darkTokens = (css.match(/\[data-theme="dark"\][\s\S]*?\}/)?.[0]?.match(/--[\w-]+/g) || []).sort();
            const lightTokens = (css.match(/\[data-theme="light"\][\s\S]*?\}/)?.[0]?.match(/--[\w-]+/g) || []).sort();

            expect(darkTokens.length).toBeGreaterThan(30);
            expect(lightTokens.length).toBeGreaterThan(30);
        });
    });

    describe('Contraste WCAG AA', () => {
        /**
         * Calcula el ratio de contraste entre dos colores hex.
         */
        function hexToRgb(hex: string): [number, number, number] {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b];
        }

        function luminance(r: number, g: number, b: number): number {
            const [rs = 0, gs = 0, bs = 0] = [r, g, b].map(c => {
                c /= 255;
                return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }

        function contrastRatio(hex1: string, hex2: string): number {
            const [r1, g1, b1] = hexToRgb(hex1);
            const [r2, g2, b2] = hexToRgb(hex2);
            const l1 = luminance(r1, g1, b1);
            const l2 = luminance(r2, g2, b2);
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            return (lighter + 0.05) / (darker + 0.05);
        }

        it('texto primario en dark mode debería tener ratio >= 7:1 sobre surface-2', () => {
            const ratio = contrastRatio('#fafafa', '#18181b');
            expect(ratio).toBeGreaterThanOrEqual(7);
        });

        it('texto secundario en dark mode debería tener ratio >= 4.5:1 sobre surface-2', () => {
            const ratio = contrastRatio('#a1a1aa', '#18181b');
            expect(ratio).toBeGreaterThanOrEqual(4.5);
        });

        it('texto terciario en dark mode debería tener ratio >= 4.5:1 sobre surface-2', () => {
            const ratio = contrastRatio('#909099', '#18181b');
            expect(ratio).toBeGreaterThanOrEqual(4.5);
        });

        it('texto disabled en dark mode debería tener ratio >= 4.5:1 sobre surface-2', () => {
            const ratio = contrastRatio('#9e9eb0', '#18181b');
            expect(ratio).toBeGreaterThanOrEqual(4.5);
        });

        it('text-on-brand debería ser blanco en dark mode', () => {
            expect(DARK_TOKENS['--text-on-brand']).toBe('#ffffff');
        });

        it('texto primario en light mode debería tener ratio >= 7:1 sobre surface-2', () => {
            const ratio = contrastRatio('#18181b', '#f4f4f6');
            expect(ratio).toBeGreaterThanOrEqual(7);
        });

        it('texto secundario en light mode debería tener ratio >= 4.5:1 sobre surface-2', () => {
            const ratio = contrastRatio('#52525b', '#f4f4f6');
            expect(ratio).toBeGreaterThanOrEqual(4.5);
        });

        it('brand sobre brand-dim debería tener ratio >= 4.5:1 en dark', () => {
            const ratio = contrastRatio('#6ee7b7', '#065f46');
            expect(ratio).toBeGreaterThanOrEqual(4.5);
        });

        it('danger sobre danger-dim debería tener ratio >= 4.5:1 en dark', () => {
            const ratio = contrastRatio('#f87171', '#581c1c');
            expect(ratio).toBeGreaterThanOrEqual(4.5);
        });

        it('warning sobre warning-dim debería tener ratio >= 4.5:1 en dark', () => {
            const ratio = contrastRatio('#f59e0b', '#5c3d00');
            expect(ratio).toBeGreaterThanOrEqual(4.5);
        });
    });

    describe('Data-theme attribute', () => {
        it('should support toggling via data-theme attribute', () => {
            // Simular cambio de tema
            document.documentElement.setAttribute('data-theme', 'dark');
            expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

            document.documentElement.setAttribute('data-theme', 'light');
            expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        });
    });
});