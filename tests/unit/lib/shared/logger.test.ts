/**
 * Tests unitarios para shared/logger.
 *
 * logger es un wrapper de console que respeta import.meta.env.DEV.
 * Solo error() loguea siempre; info() y warn() solo en desarrollo.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../../../src/lib/shared/logger';

// ─── Tests: logger.info ──────────────────────────────────────────────────────

describe('logger.info', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('✅ should log info message in development', () => {
    // En vitest, import.meta.env.DEV es true por defecto
    logger.info('TestModule', 'mensaje de info');
    expect(console.info).toHaveBeenCalledWith('[TestModule] mensaje de info');
  });

  it('✅ should include additional arguments', () => {
    logger.info('TestModule', 'con datos', { id: 1 }, 'extra');
    expect(console.info).toHaveBeenCalledWith(
      '[TestModule] con datos',
      { id: 1 },
      'extra',
    );
  });

  it('✅ should handle empty module name', () => {
    logger.info('', 'solo mensaje');
    expect(console.info).toHaveBeenCalledWith('[] solo mensaje');
  });
});

// ─── Tests: logger.warn ──────────────────────────────────────────────────────

describe('logger.warn', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('✅ should log warn message in development', () => {
    logger.warn('Auth', 'advertencia');
    expect(console.warn).toHaveBeenCalledWith('[Auth] advertencia');
  });

  it('✅ should include additional arguments', () => {
    logger.warn('Auth', 'fallo', new Error('test'));
    expect(console.warn).toHaveBeenCalledWith(
      '[Auth] fallo',
      new Error('test'),
    );
  });
});

// ─── Tests: logger.error ─────────────────────────────────────────────────────

describe('logger.error', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('✅ should always log error messages (even outside dev)', () => {
    logger.error('Firebase', 'error de conexión');
    expect(console.error).toHaveBeenCalledWith('[Firebase] error de conexión', '');
  });

  it('✅ should include error object when provided', () => {
    const err = new Error('Network failure');
    logger.error('Firebase', 'fallo', err);
    expect(console.error).toHaveBeenCalledWith('[Firebase] fallo', err);
  });

  it('✅ should handle undefined error gracefully', () => {
    logger.error('Test', 'algo falló', undefined);
    expect(console.error).toHaveBeenCalledWith('[Test] algo falló', '');
  });

  it('✅ should handle null error gracefully (coerces to empty string)', () => {
    logger.error('Test', 'algo falló', null);
    expect(console.error).toHaveBeenCalledWith('[Test] algo falló', '');
  });
});