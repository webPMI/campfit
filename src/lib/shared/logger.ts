/**
 * Sistema de logging global para toda la aplicación.
 * Proporciona niveles: info, warn, error, debug, step, group.
 * Error y debug siempre se loguean; info, warn y step solo en desarrollo.
 *
 * @module shared/logger
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';
type StepStatus = 'pending' | 'success' | 'error';

function shouldLog(level: LogLevel): boolean {
  // Error y debug siempre se loguean; info y warn solo en desarrollo
  if (level === 'error' || level === 'debug') return true;
  return import.meta.env.DEV === true;
}

function formatMessage(module: string, message: string): string {
  return `[${module}] ${message}`;
}

const STEP_ICONS: Record<StepStatus, string> = {
  pending: '🔄',
  success: '✅',
  error: '❌',
};

export const logger = {
  /**
   * Log de información (solo en desarrollo).
   * @param module - Nombre del módulo (ej: 'Auth', 'Admin', 'Trainer')
   * @param message - Mensaje descriptivo
   * @param args - Argumentos adicionales para contexto
   */
  info: (module: string, message: string, ...args: unknown[]): void => {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(formatMessage(module, message), ...args);
    }
  },

  /**
   * Log de advertencia (solo en desarrollo).
   * @param module - Nombre del módulo
   * @param message - Mensaje descriptivo
   * @param args - Argumentos adicionales para contexto
   */
  warn: (module: string, message: string, ...args: unknown[]): void => {
    if (shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(formatMessage(module, message), ...args);
    }
  },

  /**
   * Log de error (siempre se registra, incluso en producción).
   * Incluye timestamp ISO y el objeto de error completo.
   * @param module - Nombre del módulo
   * @param message - Mensaje descriptivo del error
   * @param error - Objeto de error opcional (code, message, stack)
   */
  error: (module: string, message: string, error?: unknown): void => {
    console.error(formatMessage(module, message), error || '');
  },

  /**
   * Log de debug (siempre se registra, incluso en producción).
   * Incluye timestamp para trazabilidad temporal.
   * @param module - Nombre del módulo
   * @param message - Mensaje descriptivo
   * @param args - Argumentos adicionales para contexto detallado
   */
  debug: (module: string, message: string, ...args: unknown[]): void => {
    if (shouldLog('debug')) {
      const timestamp = new Date().toISOString();
      // eslint-disable-next-line no-console
      console.debug(`[${timestamp}] ${formatMessage(module, message)}`, ...args);
    }
  },

  /**
   * Log de paso numerado dentro de un flujo (solo en desarrollo).
   * Muestra un icono según el estado del paso.
   *
   * @param module - Nombre del módulo
   * @param stepNumber - Número del paso actual (1-based)
   * @param totalSteps - Número total de pasos del flujo
   * @param description - Descripción del paso
   * @param status - Estado del paso: 'pending' (🔄), 'success' (✅), 'error' (❌)
   * @param args - Argumentos adicionales para contexto
   *
   * @example
   * logger.step('Auth:Google', 1, 5, 'Creando proveedor Google', 'pending');
   * logger.step('Auth:Google', 2, 5, 'Usuario autenticado', 'success', { uid: '123' });
   */
  step: (
    module: string,
    stepNumber: number,
    totalSteps: number,
    description: string,
    status: StepStatus = 'pending',
    ...args: unknown[]
  ): void => {
    if (shouldLog('info')) {
      const icon = STEP_ICONS[status];
      // eslint-disable-next-line no-console
      console.info(`${icon} [${module}] Paso ${stepNumber}/${totalSteps} - ${description}`, ...args);
    }
  },

  /**
   * Inicia un grupo colapsado en consola para agrupar logs relacionados (solo en desarrollo).
   * @param label - Etiqueta del grupo
   */
  group: (label: string): void => {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.group(`📋 ${label}`);
    }
  },

  /**
   * Cierra el grupo de consola actual (solo en desarrollo).
   */
  groupEnd: (): void => {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  },
};