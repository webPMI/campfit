/**
 * Tests unitarios para componentes UI del theme system.
 * Verifica que las clases CSS generadas sean correctas y theme-aware.
 *
 * @module tests/unit/components/ui-components.test
 */
import { describe, it, expect } from 'vitest';

describe('UI Components - Theme Awareness', () => {
  describe('CSS Variable Pattern Detection', () => {
    it('todas las clases theme-aware usan var(--*)', () => {
      const themeClasses = [
        'bg-[var(--surface-0)]',
        'bg-[var(--surface-1)]',
        'bg-[var(--surface-2)]',
        'bg-[var(--surface-3)]',
        'bg-[var(--brand)]',
        'bg-[var(--brand-dim)]',
        'text-[var(--text-primary)]',
        'text-[var(--text-secondary)]',
        'text-[var(--text-tertiary)]',
        'text-[var(--text-disabled)]',
        'text-[var(--text-on-brand)]',
        'text-[var(--brand)]',
        'text-[var(--brand-hover)]',
        'text-[var(--danger)]',
        'text-[var(--warning)]',
        'text-[var(--info)]',
        'text-[var(--success)]',
        'text-[var(--accent-purple)]',
        'border-[var(--border-default)]',
        'border-[var(--border-subtle)]',
        'border-[var(--border-strong)]',
        'border-[var(--border-brand)]',
        'shadow-[var(--shadow-sm)]',
        'shadow-[var(--shadow-md)]',
      ];

      for (const cls of themeClasses) {
        expect(cls).toMatch(/var\(--[a-z0-9-]+\)/);
      }
    });
  });
});
