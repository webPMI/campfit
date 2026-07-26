/**
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
