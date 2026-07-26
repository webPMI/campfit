/**
 * 📝 Console File Logger (Debug Mode Only)
 *
 * Intercepta las llamadas a console.log, console.warn, console.error, etc.
 * y las envía al servidor dev para registrarlas en un archivo físico (`logs/debug-console.log`).
 *
 * Se activa únicamente en modo desarrollo (`import.meta.env.DEV`).
 */

interface LogPayload {
  timestamp: string;
  level: 'LOG' | 'INFO' | 'WARN' | 'ERROR';
  messages: string[];
  url: string;
}

let isInitialized = false;
const queue: LogPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

// Preservar referencias originales a console para no perder el output normal del navegador
const originalConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

function formatArg(arg: unknown): string {
  if (arg === null) return 'null';
  if (arg === undefined) return 'undefined';
  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
  }
  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

function enqueueLog(level: 'LOG' | 'INFO' | 'WARN' | 'ERROR', args: unknown[]): void {
  try {
    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      messages: args.map(formatArg),
      url: typeof window !== 'undefined' ? window.location.pathname : '',
    };

    queue.push(payload);

    if (!flushTimer) {
      flushTimer = setTimeout(flushLogs, 400);
    }
  } catch {
    // Ignorar errores en el formateador para no romper la ejecución
  }
}

async function flushLogs(): Promise<void> {
  flushTimer = null;
  if (queue.length === 0) return;

  const logsToSend = queue.splice(0, queue.length);

  try {
    const body = JSON.stringify({ logs: logsToSend });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/debug/log', blob);
      if (sent) return;
    }

    await fetch('/api/debug/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch {
    // Fallback silencioso sin recurrir a console.error para evitar loops de logging
  }
}

export function initConsoleFileLogger(): void {
  if (isInitialized) return;
  if (typeof window === 'undefined') return;
  if (!import.meta.env.DEV) return;

  isInitialized = true;

  // Sobrescribir métodos de console
  console.log = (...args: unknown[]) => {
    originalConsole.log(...args);
    enqueueLog('LOG', args);
  };

  console.info = (...args: unknown[]) => {
    originalConsole.info(...args);
    enqueueLog('INFO', args);
  };

  console.warn = (...args: unknown[]) => {
    originalConsole.warn(...args);
    enqueueLog('WARN', args);
  };

  console.error = (...args: unknown[]) => {
    originalConsole.error(...args);
    enqueueLog('ERROR', args);
  };

  // Capturar errores no controlados en la ventana
  window.addEventListener('error', (event) => {
    enqueueLog('ERROR', [
      `[Uncaught Exception] ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
      event.error,
    ]);
  });

  // Capturar promesas rechazadas no manejadas
  window.addEventListener('unhandledrejection', (event) => {
    enqueueLog('ERROR', ['[Unhandled Promise Rejection]', event.reason]);
  });

  // Asegurar vaciado de cola al cerrar o navegar
  window.addEventListener('beforeunload', () => {
    flushLogs();
  });

  originalConsole.info('[DebugLogger] 📝 Logging en archivo físico activado (logs/debug-console.log)');
}

// Auto-inicializar si estamos en navegador y desarrollo
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initConsoleFileLogger());
  } else {
    initConsoleFileLogger();
  }
}
