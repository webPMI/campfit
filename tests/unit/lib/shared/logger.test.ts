/**
<<<<<<< HEAD
 * Tests para logger.ts
 *
 * @module tests/unit/lib/shared/logger.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/shared/logger';

describe('logger', () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
=======
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
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

<<<<<<< HEAD
  describe('en desarrollo (DEV=true)', () => {
    beforeEach(() => {
      import.meta.env.DEV = true;
    });

    it('logger.info debería llamar a console.info con el formato correcto', () => {
      logger.info('TestModule', 'mensaje de info');

      expect(consoleInfoSpy).toHaveBeenCalledWith('[TestModule] mensaje de info');
    });

    it('logger.info debería pasar argumentos adicionales', () => {
      logger.info('TestModule', 'mensaje', { key: 'value' });

      expect(consoleInfoSpy).toHaveBeenCalledWith('[TestModule] mensaje', { key: 'value' });
    });

    it('logger.warn debería llamar a console.warn con el formato correcto', () => {
      logger.warn('TestModule', 'mensaje de warn');

      expect(consoleWarnSpy).toHaveBeenCalledWith('[TestModule] mensaje de warn');
    });

    it('logger.warn debería pasar argumentos adicionales', () => {
      logger.warn('TestModule', 'advertencia', 42);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[TestModule] advertencia', 42);
    });

    it('logger.error debería llamar a console.error con el formato correcto', () => {
      logger.error('TestModule', 'mensaje de error');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestModule] mensaje de error', '');
    });

    it('logger.error debería pasar el objeto de error', () => {
      const err = new Error('Algo salió mal');
      logger.error('TestModule', 'error crítico', err);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestModule] error crítico', err);
    });
  });

  describe('en producción (DEV=false)', () => {
    beforeEach(() => {
      import.meta.env.DEV = false;
    });

    it('logger.info NO debería llamar a console.info en producción', () => {
      logger.info('TestModule', 'mensaje de info');

      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('logger.warn NO debería llamar a console.warn en producción', () => {
      logger.warn('TestModule', 'mensaje de warn');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('logger.error SÍ debería llamar a console.error en producción', () => {
      logger.error('TestModule', 'error en producción');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestModule] error en producción', '');
    });

    it('logger.error debería pasar el error incluso en producción', () => {
      const err = { code: 500, message: 'Server Error' };
      logger.error('ProdModule', 'fallo grave', err);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ProdModule] fallo grave', err);
    });
  });
});
=======
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
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
