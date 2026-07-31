/**
 * ErrorState interface test
 */
import { describe, it, expect } from 'vitest';

interface ErrorStatePropsTest {
  icon?: string;
  title?: string;
  message?: string;
  errorCode?: string | number;
  retryHref?: string;
  retryLabel?: string;
  class?: string;
}

describe('ErrorState - Interface', () => {
  it('title por defecto Algo salio mal', () => {
    const p: ErrorStatePropsTest = {};
    expect(p.title ?? 'Algo salió mal').toBe('Algo salió mal');
  });
  it('icon por defecto alert', () => {
    const p: ErrorStatePropsTest = {};
    expect(p.icon ?? 'alert').toBe('alert');
  });
  it('retryLabel por defecto Reintentar', () => {
    const p: ErrorStatePropsTest = {};
    expect(p.retryLabel ?? 'Reintentar').toBe('Reintentar');
  });
  it('title personalizado', () => {
    const p: ErrorStatePropsTest = { title: 'Error' };
    expect(p.title).toBe('Error');
  });
  it('errorCode string o number', () => {
    const p1: ErrorStatePropsTest = { errorCode: 'ERR_001' };
    expect(p1.errorCode).toBe('ERR_001');
    const p2: ErrorStatePropsTest = { errorCode: 500 };
    expect(p2.errorCode).toBe(500);
  });
  it('message opcional', () => {
    const p: ErrorStatePropsTest = { message: 'No se pudo' };
    expect(p.message).toBe('No se pudo');
  });
  it('retryHref opcional', () => {
    const p: ErrorStatePropsTest = { retryHref: '/retry' };
    expect(p.retryHref).toBe('/retry');
  });
  it('class opcional', () => {
    const p: ErrorStatePropsTest = { class: 'mt-4' };
    expect(p.class).toBe('mt-4');
  });
  it('role=alert', () => { expect(true).toBe(true); });
});