/**
 * 📝 Sistema de logging global avanzado para CampFit
 *
 * Proporciona:
 * - Niveles: debug, info, warn, error, success
 * - Colores y formato distintivo en consola
 * - Almacenamiento circular en memoria (historial de 1000 logs)
 * - Suscripciones en tiempo real para visores y DevTools
 * - Métodos de exportación (JSON / TXT) y filtrado
 * - Atajo de teclado global Ctrl+Shift+L para el visor en pantalla
 *
 * @module shared/logger
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  module: string;
  message: string;
  payload?: unknown;
  url: string;
}

export interface LogFilterOptions {
  level?: LogLevel | 'all';
  module?: string;
  search?: string;
  limit?: number;
}

const MAX_LOG_HISTORY = 1000;
const history: LogEntry[] = [];
const subscribers = new Set<(entry: LogEntry) => void>();

function shouldLogToConsole(level: LogLevel): boolean {
  if (level === 'error') return true;
  return import.meta.env.DEV === true;
}

const MODULE_COLORS: Record<string, string> = {
  Auth: '#8b5cf6',
  Trainer: '#f59e0b',
  Client: '#10b981',
  Admin: '#3b82f6',
  Chat: '#ec4899',
  Firestore: '#f97316',
  Diets: '#14b8a6',
  Workouts: '#6366f1',
  Storage: '#06b6d4',
  PWA: '#84cc16',
};

function getModuleColor(module: string): string {
  return MODULE_COLORS[module] || '#eab308';
}

function recordLog(level: LogLevel, module: string, message: string, payload?: unknown): LogEntry {
  const entry: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date(),
    level,
    module,
    message,
    payload,
    url: typeof window !== 'undefined' ? window.location.pathname : '',
  };

  history.push(entry);
  if (history.length > MAX_LOG_HISTORY) {
    history.shift();
  }

  for (const callback of subscribers) {
    try {
      callback(entry);
    } catch {
      // Ignorar errores de suscriptores
    }
  }

  return entry;
}

function formatMessage(module: string, message: string): string {
  return `[${module}] ${message}`;
}

export const logger = {
  /**
   * Log de depuración detallada (solo en desarrollo).
   */
  debug: (module: string, message: string, ...args: unknown[]): void => {
    const payload = args.length === 1 ? args[0] : args.length > 1 ? args : undefined;
    recordLog('debug', module, message, payload);

    if (shouldLogToConsole('debug')) {
      // eslint-disable-next-line no-console
      console.debug(
        `%c[${module}]%c ${message}`,
        `color:${getModuleColor(module)};font-weight:bold;`,
        'color:inherit;',
        ...args,
      );
    }
  },

  /**
   * Log de información (solo en desarrollo).
   * Mantiene compatibilidad exacta con llamada console.info('[Module] message', ...args).
   */
  info: (module: string, message: string, ...args: unknown[]): void => {
    const payload = args.length === 1 ? args[0] : args.length > 1 ? args : undefined;
    recordLog('info', module, message, payload);

    if (shouldLogToConsole('info')) {
      // eslint-disable-next-line no-console
      console.info(formatMessage(module, message), ...args);
    }
  },

  /**
   * Log de advertencia (solo en desarrollo).
   * Mantiene compatibilidad exacta con llamada console.warn('[Module] message', ...args).
   */
  warn: (module: string, message: string, ...args: unknown[]): void => {
    const payload = args.length === 1 ? args[0] : args.length > 1 ? args : undefined;
    recordLog('warn', module, message, payload);

    if (shouldLogToConsole('warn')) {
      // eslint-disable-next-line no-console
      console.warn(formatMessage(module, message), ...args);
    }
  },

  /**
   * Log de éxito visual.
   */
  success: (module: string, message: string, ...args: unknown[]): void => {
    const payload = args.length === 1 ? args[0] : args.length > 1 ? args : undefined;
    recordLog('success', module, message, payload);

    if (shouldLogToConsole('info')) {
      // eslint-disable-next-line no-console
      console.info(
        `%c[${module}] ✅ ${message}`,
        `color:#10b981;font-weight:bold;`,
        ...args,
      );
    }
  },

  /**
   * Log de error (siempre se registra, incluso en producción).
   * Mantiene compatibilidad exacta con llamada console.error('[Module] message', error || '').
   */
  error: (module: string, message: string, error?: unknown): void => {
    recordLog('error', module, message, error);
    // eslint-disable-next-line no-console
    console.error(formatMessage(module, message), error || '');
  },

  /**
   * Obtiene la copia del historial de logs con filtros opcionales.
   */
  getHistory: (options?: LogFilterOptions): LogEntry[] => {
    let result = [...history];

    if (options?.level && options.level !== 'all') {
      result = result.filter((l) => l.level === options.level);
    }

    if (options?.module) {
      const mod = options.module.toLowerCase();
      result = result.filter((l) => l.module.toLowerCase() === mod);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.message.toLowerCase().includes(q) ||
          l.module.toLowerCase().includes(q) ||
          JSON.stringify(l.payload || '').toLowerCase().includes(q),
      );
    }

    if (options?.limit && options.limit > 0) {
      result = result.slice(-options.limit);
    }

    return result;
  },

  /**
   * Lista todos los nombres de módulos registrados en el historial.
   */
  getModules: (): string[] => {
    const set = new Set<string>();
    for (const log of history) {
      set.add(log.module);
    }
    return Array.from(set).sort();
  },

  /**
   * Limpia el buffer de logs en memoria.
   */
  clearHistory: (): void => {
    history.length = 0;
  },

  /**
   * Suscribe una función para recibir nuevos logs en tiempo real.
   * Retorna una función para cancelar la suscripción.
   */
  subscribe: (callback: (entry: LogEntry) => void): (() => void) => {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  },

  /**
   * Exporta los logs en formato JSON serializado.
   */
  exportAsJSON: (): string => {
    return JSON.stringify(history, null, 2);
  },

  /**
   * Exporta los logs en formato de texto plano con formato timestamp.
   */
  exportAsText: (): string => {
    return history
      .map((l) => {
        const time = l.timestamp.toISOString();
        const level = l.level.toUpperCase().padEnd(7);
        const payloadStr = l.payload !== undefined ? ` | ${JSON.stringify(l.payload)}` : '';
        return `[${time}] ${level} [${l.module}] ${l.message}${payloadStr}`;
      })
      .join('\n');
  },
};
