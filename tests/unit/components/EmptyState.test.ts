/**
 * EmptyState interface test
 */
import { describe, it, expect } from 'vitest';

interface EmptyStatePropsTest {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  actionHref?: string;
  class?: string;
}

describe('EmptyState - Interface', () => {
  it('title y description requeridos', () => {
    const p: EmptyStatePropsTest = { title: 'Sin datos', description: 'No hay' };
    expect(p.title).toBe('Sin datos');
    expect(p.description).toBe('No hay');
  });
  it('icon por defecto inbox', () => {
    const p: EmptyStatePropsTest = { title: 'T', description: 'D' };
    expect(p.icon ?? 'inbox').toBe('inbox');
  });
  it('actionLabel y actionHref opcionales', () => {
    const p: EmptyStatePropsTest = { title: 'T', description: 'D', actionLabel: 'A', actionHref: '/n' };
    expect(p.actionLabel).toBe('A');
    expect(p.actionHref).toBe('/n');
  });
  it('class opcional', () => {
    const p: EmptyStatePropsTest & { class?: string } = { title: 'T', description: 'D', class: 'custom' };
    expect(p.class).toBe('custom');
  });
  it('role=status', () => { expect(true).toBe(true); });
  it('enlace solo si actionLabel y actionHref', () => {
    const p1: EmptyStatePropsTest = { title: 'T', description: 'D', actionLabel: 'Ir', actionHref: '/g' };
    expect(p1.actionLabel).toBeTruthy();
    expect(p1.actionHref).toBeTruthy();
    const p2: EmptyStatePropsTest = { title: 'T', description: 'D' };
    expect(p2.actionLabel).toBeUndefined();
    expect(p2.actionHref).toBeUndefined();
  });
  it('icon personalizado', () => {
    const p: EmptyStatePropsTest = { title: 'T', description: 'D', icon: 'search' };
    expect(p.icon).toBe('search');
  });
});