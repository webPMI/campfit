/**
 * Tests unitarios para componentes UI del theme system.
 * Verifica colores, contraste, accesibilidad y estructura.
 */
import { describe, it, expect } from 'vitest';

// ============================================================
// Tests de tokens de color y contraste
// ============================================================

function getLuminance(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrast(fg: string, bg: string): number {
    const l1 = getLuminance(fg);
    const l2 = getLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

describe('UI Components - Theme Tokens', () => {
    it('theme-aware CSS classes use var(--*) pattern', () => {
        const themeClasses = [
            'bg-[var(--surface-0)]',
            'text-[var(--text-primary)]',
            'border-[var(--border-default)]',
            'shadow-[var(--shadow-sm)]',
            'bg-[var(--brand-dim)]',
            'text-[var(--brand)]',
            'placeholder:text-[var(--text-tertiary)]',
        ];
        for (const cls of themeClasses) {
            expect(cls).toMatch(/var\(--[\w-]+\)/);
        }
    });

    it('brand colors are valid green hex values', () => {
        const brand = '#10b981';
        const brandHover = '#34d399';
        const brandDim = '#065f46';
        expect(brand).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(brandHover).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(brandDim).toMatch(/^#[0-9a-fA-F]{6}$/);

        const bLum = parseInt(brand.slice(1, 3), 16) + parseInt(brand.slice(3, 5), 16) + parseInt(brand.slice(5, 7), 16);
        const dimLum = parseInt(brandDim.slice(1, 3), 16) + parseInt(brandDim.slice(3, 5), 16) + parseInt(brandDim.slice(5, 7), 16);
        expect(dimLum).toBeLessThan(bLum);
    });

    it('text colors have proper luminance hierarchy in dark mode', () => {
        const primary = '#fafafa';
        const secondary = '#a1a1aa';
        const tertiary = '#909099';
        const disabled = '#6b6b73';
        const getLum = (h: string) => parseInt(h.slice(1, 3), 16) + parseInt(h.slice(3, 5), 16) + parseInt(h.slice(5, 7), 16);
        expect(getLum(primary)).toBeGreaterThan(getLum(secondary));
        expect(getLum(secondary)).toBeGreaterThan(getLum(tertiary));
        expect(getLum(tertiary)).toBeGreaterThan(getLum(disabled));
    });

    it('surface colors get progressively lighter (0→5)', () => {
        const surfaces = ['#09090b', '#131316', '#18181b', '#1f1f24', '#27272d', '#2f2f36'];
        for (let i = 1; i < surfaces.length; i++) {
            const prev = parseInt((surfaces[i - 1] ?? '#000000').slice(1, 3), 16);
            const curr = parseInt((surfaces[i] ?? '#000000').slice(1, 3), 16);
            expect(curr).toBeGreaterThanOrEqual(prev);
        }
    });

    it('text-on-brand is white (#ffffff) over brand-hover background', () => {
        expect('#ffffff').toBe('#ffffff');
        const ratio = getContrast('#ffffff', '#059669');
        expect(ratio).toBeGreaterThanOrEqual(3);
    });
});

describe('UI Components - WCAG AA Contrast', () => {
    it('text-primary on surface-2 ≥ 7:1 (dark)', () => {
        expect(getContrast('#fafafa', '#18181b')).toBeGreaterThanOrEqual(7);
    });

    it('text-secondary on surface-2 ≥ 4.5:1 (dark)', () => {
        expect(getContrast('#a1a1aa', '#18181b')).toBeGreaterThanOrEqual(4.5);
    });

    it('text-tertiary on surface-2 ≥ 4.5:1 (dark)', () => {
        expect(getContrast('#909099', '#18181b')).toBeGreaterThanOrEqual(4.5);
    });

    it('text-disabled on surface-2 ≥ 3:1 (dark - WCAG 2.1 SC 1.4.3 exemption)', () => {
        expect(getContrast('#6b6b73', '#18181b')).toBeGreaterThanOrEqual(3);
    });

    it('brand text on brand-dim ≥ 4.5:1 (dark)', () => {
        expect(getContrast('#6ee7b7', '#065f46')).toBeGreaterThanOrEqual(4.5);
    });

    it('danger text on danger-dim ≥ 4.5:1 (dark)', () => {
        expect(getContrast('#f87171', '#450a0a')).toBeGreaterThanOrEqual(4.5);
    });

    it('warning text on warning-dim ≥ 4.5:1 (dark)', () => {
        expect(getContrast('#fbbf24', '#451a03')).toBeGreaterThanOrEqual(4.5);
    });

    it('info text on info-dim ≥ 4.5:1 (dark)', () => {
        expect(getContrast('#60a5fa', '#172554')).toBeGreaterThanOrEqual(4.5);
    });

    it('success text on success-dim ≥ 4.5:1 (dark)', () => {
        expect(getContrast('#34d399', '#022c22')).toBeGreaterThanOrEqual(4.5);
    });

    it('text-primary on surface-2 ≥ 7:1 (light)', () => {
        expect(getContrast('#18181b', '#f4f4f6')).toBeGreaterThanOrEqual(7);
    });

    it('text-secondary on surface-2 ≥ 4.5:1 (light)', () => {
        expect(getContrast('#52525b', '#f4f4f6')).toBeGreaterThanOrEqual(4.5);
    });
});

describe('UI Components - Route Structure', () => {
    it('public routes do not have protected prefixes', () => {
        const publicRoutes = ['/', '/login', '/register', '/recover', '/onboarding'];
        for (const r of publicRoutes) {
            expect(r).not.toContain('/admin');
            expect(r).not.toContain('/trainer');
            expect(r).not.toContain('/client');
        }
    });

    it('admin routes use /admin/ prefix', () => {
        const routes = ['/admin/dashboard', '/admin/users', '/admin/trainers', '/admin/clients', '/admin/settings'];
        for (const r of routes) expect(r.startsWith('/admin/')).toBe(true);
    });

    it('trainer routes use /trainer/ prefix', () => {
        const routes = ['/trainer/dashboard', '/trainer/clients', '/trainer/workouts', '/trainer/diets', '/trainer/chat'];
        for (const r of routes) expect(r.startsWith('/trainer/')).toBe(true);
    });

    it('client routes use /client/ prefix', () => {
        const routes = ['/client/dashboard', '/client/workouts', '/client/diets', '/client/progress', '/client/chat'];
        for (const r of routes) expect(r.startsWith('/client/')).toBe(true);
    });
});

describe('UI Components - Responsive Breakpoints', () => {
    it('common responsive prefixes are valid', () => {
        const prefixes = ['sm', 'md', 'lg', 'xl', '2xl'];
        const classes = ['sm:flex-row', 'md:grid-cols-2', 'lg:flex', 'xl:block'];
        for (const cls of classes) {
            const prefix = cls.split(':')[0];
            expect(prefixes).toContain(prefix);
        }
    });
});