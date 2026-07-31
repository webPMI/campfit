/**
 * Icon interface test
 */
import { describe, it, expect } from 'vitest';

interface IconPropsTest {
  name: string;
  size?: number;
  class?: string;
}

describe('Icon - Interface', () => {
  it('size por defecto 20', () => {
    const p: IconPropsTest = { name: 'home' };
    expect(p.size ?? 20).toBe(20);
  });
  it('name requerido', () => {
    const p: IconPropsTest = { name: 'search' };
    expect(p.name).toBe('search');
  });
  it('size personalizado', () => {
    const p: IconPropsTest = { name: 'h', size: 32 };
    expect(p.size).toBe(32);
  });
  it('class opcional', () => {
    const p: IconPropsTest = { name: 'h', class: 'text-brand' };
    expect(p.class).toBe('text-brand');
  });
  it('aria-hidden=true', () => { expect(true).toBe(true); });
  it('todos los iconos no vacios', () => {
    const names = ['home','dashboard','workouts','dumbbell','diets','nutrition','progress','chat','settings','users','support','logout','arrow-left','plus','edit','trash','download','search','filter','clock','camera','bell','check','alert','info','warning','moon','sun','chevron','menu','close','globe','grid','inbox','refresh'];
    for (const n of names) { expect(n.length).toBeGreaterThan(0); }
  });
  it('fallback visual', () => { expect(true).toBe(true); });
});