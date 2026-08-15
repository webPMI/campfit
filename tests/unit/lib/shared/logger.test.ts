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
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logger.clearHistory();
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('en desarrollo (DEV=true)', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', true as any);
    });

    afterEach(() => {
      vi.unstubAllEnvs();
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
      const err = new Error('fallo grave');
      logger.error('TestModule', 'error crítico', err);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestModule] error crítico', err);
    });

    it('logger.debug debería registrar y mostrar mensaje con estilos en consola', () => {
      logger.debug('Auth', 'verificando token', { uid: '123' });

      expect(consoleDebugSpy).toHaveBeenCalled();
      const history = logger.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].level).toBe('debug');
      expect(history[0].module).toBe('Auth');
    });

    it('logger.success debería registrar y mostrar mensaje con icono de éxito', () => {
      logger.success('Trainer', 'rutina guardada');

      expect(consoleInfoSpy).toHaveBeenCalled();
      const history = logger.getHistory();
      expect(history[0].level).toBe('success');
      expect(history[0].message).toBe('rutina guardada');
    });
  });

  describe('en producción (DEV=false)', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', false as any);
    });

    afterEach(() => {
      vi.unstubAllEnvs();
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

  describe('historial, filtros y exportación', () => {
    it('debería almacenar y filtrar logs por nivel, módulo y búsqueda', () => {
      logger.info('Auth', 'Usuario inició sesión');
      logger.warn('Trainer', 'Cliente sin rutina activa');
      logger.error('Firestore', 'Error de red en sincronización');

      const all = logger.getHistory();
      expect(all.length).toBe(3);

      const onlyErrors = logger.getHistory({ level: 'error' });
      expect(onlyErrors.length).toBe(1);
      expect(onlyErrors[0].module).toBe('Firestore');

      const byModule = logger.getHistory({ module: 'Trainer' });
      expect(byModule.length).toBe(1);
      expect(byModule[0].message).toBe('Cliente sin rutina activa');

      const bySearch = logger.getHistory({ search: 'sesión' });
      expect(bySearch.length).toBe(1);
      expect(bySearch[0].module).toBe('Auth');
    });

    it('debería notificar a los suscriptores en tiempo real', () => {
      const listener = vi.fn();
      const unsub = logger.subscribe(listener);

      logger.info('Chat', 'Nuevo mensaje');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].module).toBe('Chat');

      unsub();
      logger.info('Chat', 'Segundo mensaje');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('debería exportar logs a formato JSON y texto plano', () => {
      logger.info('System', 'Inicio de app');
      const json = logger.exportAsJSON();
      const txt = logger.exportAsText();

      expect(JSON.parse(json)).toBeInstanceOf(Array);
      expect(txt).toContain('[System] Inicio de app');
    });

    it('debería limpiar el historial con clearHistory', () => {
      logger.info('System', 'Prueba');
      expect(logger.getHistory().length).toBe(1);

      logger.clearHistory();
      expect(logger.getHistory().length).toBe(0);
    });
  });
});
