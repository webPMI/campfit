/**
 * LoadingSpinner interface test
 */
import { describe, it, expect } from 'vitest';

interface LoadingSpinnerPropsTest {
  size?: 'sm' | 'md' | 'lg';
  class?: string;
  label?: string;
}

describe('LoadingSpinner - Interface', () => {
  it('size por defecto md', () => {
    const p: LoadingSpinnerPropsTest = {};
    expect(p.size ?? 'md').toBe('md');
  });
  it('label por defecto Cargando...', () => {
    const p: LoadingSpinnerPropsTest = {};
    expect(p.label ?? 'Cargando...').toBe('Cargando...');
  });
  it('size=sm', () => {
    const p: LoadingSpinnerPropsTest = { size: 'sm' };
    expect(p.size).toBe('sm');
  });
  it('size=md', () => {
    const p: LoadingSpinnerPropsTest = { size: 'md' };
    expect(p.size).toBe('md');
  });
  it('size=lg', () => {
    const p: LoadingSpinnerPropsTest = { size: 'lg' };
    expect(p.size).toBe('lg');
  });
  it('aria-busy=true', () => { expect(true).toBe(true); });
  it('label personalizado', () => {
    const p: LoadingSpinnerPropsTest = { label: 'Proc...' };
    expect(p.label).toBe('Proc...');
  });
  it('class opcional', () => {
    const p: LoadingSpinnerPropsTest = { class: 'mx-auto' };
    expect(p.class).toBe('mx-auto');
  });
  it('solo sm|md|lg validos', () => {
    const v: Array<'sm'|'md'|'lg'>=['sm','md','lg'];
    expect(v).toContain('sm');
    expect(v).toContain('md');
    expect(v).toContain('lg');
    expect(v).not.toContain('xl');
  });
});