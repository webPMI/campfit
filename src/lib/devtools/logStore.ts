/**
 * Almacén de logs en memoria para el DevTools.
 * Captura todos los logs del logger de la aplicación y los almacena.
 *
 * @module devtools/logStore
 */

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  module: string;
  message: string;
  args: string;
}

const MAX_LOGS = 500;
const logs: LogEntry[] = [];

/**
 * Agrega un log al almacén.
 */
export function addLog(entry: Omit<LogEntry, 'timestamp'>): void {
  logs.push({ ...entry, timestamp: new Date() });
  if (logs.length > MAX_LOGS) {
    logs.shift(); // Eliminar el más antiguo
  }
}

/**
 * Retorna todos los logs almacenados (copia).
 */
export function getLogs(): LogEntry[] {
  return [...logs];
}

/**
 * Limpia todos los logs.
 */
export function clearLogs(): void {
  logs.length = 0;
}

/**
 * Serializa los logs a texto plano (para copiar).
 */
export function logsToText(): string {
  return logs
    .map((l) => {
      const time = l.timestamp.toISOString().replace('T', ' ').slice(0, 19);
      const level = l.level.toUpperCase().padEnd(5);
      return `[${time}] ${level} [${l.module}] ${l.message} ${l.args || ''}`;
    })
    .join('\n');
}

/**
 * Intercepta el logger global para almacenar todos los logs.
 */
let patched = false;

export function patchLogger(): void {
  if (patched) return;
  patched = true;

  const originalConsole = {
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  // Interceptar console.info (captura logger.info + otros)
  console.info = function (...args: unknown[]) {
    const moduleMatch = extractModule(args);
    addLog({
      level: 'info',
      module: moduleMatch,
      message: formatArgs(args),
      args: '',
    });
    originalConsole.info(...args);
  };

  // Interceptar console.warn
  console.warn = function (...args: unknown[]) {
    const moduleMatch = extractModule(args);
    addLog({
      level: 'warn',
      module: moduleMatch,
      message: formatArgs(args),
      args: '',
    });
    originalConsole.warn(...args);
  };

  // Interceptar console.error
  console.error = function (...args: unknown[]) {
    const moduleMatch = extractModule(args);
    addLog({
      level: 'error',
      module: moduleMatch,
      message: formatArgs(args),
      args: '',
    });
    originalConsole.error(...args);
  };

  // También interceptar errores no capturados
  window.addEventListener('error', (event) => {
    addLog({
      level: 'error',
      module: 'Uncaught',
      message: event.message,
      args: `${event.filename}:${event.lineno}`,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    addLog({
      level: 'error',
      module: 'Promise',
      message: String(event.reason ?? ''),
      args: '',
    });
  });
}

function extractModule(args: unknown[]): string {
  // Buscar patrón "[Modulo] mensaje" en el primer argumento
  const first = args[0];
  if (typeof first === 'string') {
    const match = first.match(/^\[([^\]]+)\]/);
    if (match?.[1]) return match[1];
  }
  return 'Console';
}

function formatArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (a instanceof Error) return a.message;
      if (typeof a === 'object') return JSON.stringify(a).slice(0, 200);
      return String(a);
    })
    .join(' ');
}