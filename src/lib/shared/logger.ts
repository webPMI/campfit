/**
 * Sistema de logging global para toda la aplicación.
 * Respeta import.meta.env.DEV para no loguear en producción.
 * Proporciona niveles: info, warn, error.
 *
 * @module shared/logger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function shouldLog(level: LogLevel): boolean {
  // Error y warn siempre se loguean en producción
  if (level === 'error' || level === 'warn') return true;
  // Info y debug solo en desarrollo
  return import.meta.env.DEV === true;
}

function formatMessage(module: string, message: string): string {
  return `[${module}] ${message}`;
}

export const logger = {
  /**
   * Log de información (solo en desarrollo).
   * @param module - Nombre del módulo (ej: 'Admin', 'Trainer', 'Chat')
   * @param message - Mensaje descriptivo
   * @param args - Argumentos adicionales
   */
  info: (module: string, message: string, ...args: unknown[]): void => {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(formatMessage(module, message), ...args);
    }
  },

  /**
   * Log de advertencia (siempre se registra).
   * @param module - Nombre del módulo
   * @param message - Mensaje descriptivo
   * @param args - Argumentos adicionales
   */
  warn: (module: string, message: string, ...args: unknown[]): void => {
    if (shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(formatMessage(module, message), ...args);
    }
  },

  /**
   * Log de error (siempre se registra, incluso en producción).
   * @param module - Nombre del módulo
   * @param message - Mensaje descriptivo
   * @param error - Objeto de error opcional
   */
  error: (module: string, message: string, error?: unknown): void => {
    console.error(formatMessage(module, message), error || '');
  },
};
