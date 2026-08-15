/**
 * 🚀 Servicio de logging avanzado para CampFit
 *
 * Responsabilidades:
 * - Enriquecer logs con contexto automático (usuario, URL, entorno)
 * - Deduplicación cliente-side para evitar inundación de escrituras
 * - Escritura fire-and-forget a Firestore colección `app_logs`
 * - Cola offline con IndexedDB cuando no hay conexión
 * - Sanitización de campos sensibles antes de enviar
 * - Integración no invasiva con el logger existente (subscriber)
 *
 * @module shared/logService
 */

import { logger, type LogLevel } from './logger';

// ============================================================
// Tipos locales
// ============================================================

export interface AppLog {
  timestamp: unknown;
  hash: string;
  occurrenceCount: number;
  userId: string;
  userEmailHash: string;
  userRole: 'client' | 'trainer' | 'admin' | 'unknown';
  activity: string;
  action: string;
  feature: string;
  relatedUserId?: string;
  relatedUserRole?: string;
  relationType?: string;
  url: string;
  userAgent: string;
  language: string;
  viewport: string;
  level: 'warn' | 'error' | 'critical';
  message: string;
  errorName?: string;
  errorStack?: string;
  errorCode?: string;
  payload?: Record<string, unknown>;
  sessionId: string;
  breadcrumb: string[];
  environment: 'development' | 'staging' | 'production';
}

export interface LogContext {
  activity?: string;
  action?: string;
  feature?: string;
  relatedUserId?: string;
  relatedUserRole?: string;
  relationType?: string;
  payload?: Record<string, unknown>;
  error?: Error | unknown;
}

// ============================================================
// Configuración
// ============================================================

const DEDUP_WINDOW_ERROR_CRITICAL = 5 * 60 * 1000; // 5 minutos
const DEDUP_WINDOW_WARN = 15 * 60 * 1000;           // 15 minutos
const MAX_STACK_BYTES = 2 * 1024;                   // 2KB
const MAX_MESSAGE_CHARS = 500;
const MAX_USERAGENT_CHARS = 200;
const MAX_BREADCRUMBS = 5;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 50;           // 50 logs por minuto por usuario

// ============================================================
// Estado del servicio
// ============================================================

let sessionId: string | null = null;
const recentErrors = new Map<string, number>();
let offlineQueue: Array<{ entry: unknown; context: Partial<AppLog>; hash: string }> = [];
let isOnline = false;
let currentUser: { uid: string; email?: string; role?: string } | null = null;

// ============================================================
// Rate limiting
// ============================================================

const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(identifier);

  if (!limit || now > limit.resetAt) {
    rateLimits.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limit.count++;
  return true;
}

// ============================================================
// Utilidades
// ============================================================

function hashEmail(email: string | undefined): string {
  if (!email) return 'unknown';
  let hash = 0;
  const normalized = email.toLowerCase().trim();
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

function truncate(str: string | undefined, maxLength: number): string {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) : str;
}

function truncateStack(stack: string | undefined): string | undefined {
  if (!stack) return undefined;
  const bytes = new TextEncoder().encode(stack);
  if (bytes.length <= MAX_STACK_BYTES) return stack;
  const truncated = new TextDecoder().decode(bytes.slice(0, MAX_STACK_BYTES));
  return truncated + '\n... [truncated]';
}

/**
 * Hash determinista para deduplicación.
 * Combina: usuario, feature, actividad, acción, nombre del error.
 * Incluye un "bucket" de 1 minuto para agrupar errores cercanos en el tiempo.
 */
function computeErrorHash(context: Partial<AppLog>, errorName: string): string {
  const parts = [
    context.userId || 'anonymous',
    context.feature || 'unknown',
    context.activity || 'unknown',
    context.action || 'unknown',
    errorName,
  ];

  let hash = 0;
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      hash = ((hash << 5) - hash) + part.charCodeAt(i);
      hash |= 0;
    }
  }

  const timeBucket = Math.floor(Date.now() / 60000); // 1 minuto
  return `${Math.abs(hash).toString(16)}-${timeBucket}`;
}

/**
 * Ventana de deduplicación adaptativa según el nivel.
 */
function getDedupWindow(level: string): number {
  if (level === 'warn') return DEDUP_WINDOW_WARN;
  return DEDUP_WINDOW_ERROR_CRITICAL; // error, critical
}

// ============================================================
// Sanitización
// ============================================================

const SENSITIVE_FIELDS = new Set([
  'password', 'pass', 'pwd',
  'token', 'secret', 'apiKey', 'apikey', 'api_key',
  'creditCard', 'cc', 'cardNumber', 'cvv',
  'ssn', 'dni', 'nif', 'passport',
  'medicalRecord', 'diagnosis', 'medication', 'treatment',
  'allergies', 'conditions', 'dietaryRestrictions', 'healthData',
  'privateNotes', 'notes', 'observations',
  'accessToken', 'refreshToken', 'idToken',
]);

function sanitizePayload(payload: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!payload || typeof payload !== 'object') return payload;

  const sanitized: Record<string, unknown> = { ...payload };
  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = Array.from(SENSITIVE_FIELDS).some(sensitive =>
      lowerKey === sensitive || lowerKey.includes(sensitive)
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizePayload(sanitized[key] as Record<string, unknown>);
    }
  }

  return sanitized;
}

// ============================================================
// Contexto automático
// ============================================================

function detectActivity(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return parts[0] || 'unknown';
}

function mapActivityToFeature(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const section = parts[0] || 'unknown';
  const featureMap: Record<string, string> = {
    'client': 'client',
    'trainer': 'trainer',
    'admin': 'admin',
    'api': 'api',
    'login': 'auth',
    'register': 'auth',
    'forgot-password': 'auth',
    'reset-password': 'auth',
  };
  return featureMap[section] || section;
}

function detectUserRelation(userId: string | undefined): {
  relatedUserId?: string;
  relatedUserRole?: string;
  relationType?: string;
} | undefined {
  if (!userId || typeof window === 'undefined') return undefined;

  try {
    const pathname = window.location.pathname;

    if (pathname.startsWith('/trainer/')) {
      const clientIdMatch = pathname.match(/\/trainer\/clients\/([^/]+)/);
      if (clientIdMatch) {
        return {
          relatedUserId: clientIdMatch[1],
          relatedUserRole: 'client',
          relationType: 'trainer-client',
        };
      }
    }

    if (pathname.startsWith('/client/')) {
      const trainerIdEl = document.querySelector('[data-trainer-id]');
      if (trainerIdEl) {
        const trainerId = trainerIdEl.getAttribute('data-trainer-id');
        if (trainerId) {
          return {
            relatedUserId: trainerId,
            relatedUserRole: 'trainer',
            relationType: 'trainer-client',
          };
        }
      }
    }
  } catch {
    // Ignorar errores de detección de relación
  }

  return undefined;
}

function getBreadcrumbs(): string[] {
  try {
    if (typeof window === 'undefined') return [];
    const stored = sessionStorage.getItem('campfit:breadcrumbs');
    if (!stored) return [];

    const crumbs: string[] = JSON.parse(stored);
    return crumbs.slice(-MAX_BREADCRUMBS);
  } catch {
    return [];
  }
}

function pushBreadcrumb(activity: string, action: string): void {
  try {
    if (typeof window === 'undefined') return;

    const crumb = `${activity}:${action}`;
    const stored = sessionStorage.getItem('campfit:breadcrumbs');
    let crumbs: string[] = stored ? JSON.parse(stored) : [];

    if (crumbs.length === 0 || crumbs[crumbs.length - 1] !== crumb) {
      crumbs.push(crumb);
      if (crumbs.length > MAX_BREADCRUMBS * 2) {
        crumbs = crumbs.slice(-MAX_BREADCRUMBS);
      }
      sessionStorage.setItem('campfit:breadcrumbs', JSON.stringify(crumbs));
    }
  } catch {
    // Ignorar errores de breadcrumbs
  }
}

// ============================================================
// Auth listener
// ============================================================

function initAuthListener(): void {
  if (typeof window === 'undefined') return;

  try {
    // Importación dinámica para SSR safety
    const authModule = require('@/lib/firebase') as {
      auth: {
        currentUser: { uid: string; email?: string; role?: string } | null;
        onAuthStateChanged: (cb: (user: { uid: string; email?: string; role?: string } | null) => void) => () => void;
      };
    };

    const user = authModule.auth.currentUser;
    if (user) {
      currentUser = {
        uid: user.uid,
        email: user.email || undefined,
        role: user.role,
      };
    }

    if (typeof authModule.auth.onAuthStateChanged === 'function') {
      authModule.auth.onAuthStateChanged((user) => {
        if (user) {
          currentUser = {
            uid: user.uid,
            email: user.email || undefined,
            role: user.role,
          };
        } else {
          currentUser = null;
        }
      });
    }
  } catch {
    currentUser = null;
  }
}

// ============================================================
// Offline queue (IndexedDB)
// ============================================================

async function initOfflineQueue(): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    offlineQueue = [];
    return;
  }

  try {
    const request = indexedDB.open('campfit-logs', 1);

    request.onerror = () => {
      offlineQueue = [];
    };

    request.onsuccess = () => {
      const dbInstance = request.result;
      const transaction = dbInstance.transaction(['logs'], 'readonly');
      const store = transaction.objectStore('logs');
      const getAll = store.getAll();

      getAll.onsuccess = () => {
        offlineQueue = (getAll.result as Array<{ entry: unknown; context: Partial<AppLog>; hash: string }>) || [];
        if (offlineQueue.length > 0 && isOnline) {
          flushQueue();
        }
      };
    };

    request.onupgradeneeded = () => {
      const dbInstance = request.result;
      if (!dbInstance.objectStoreNames.contains('logs')) {
        const store = dbInstance.createObjectStore('logs', { keyPath: 'hash' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  } catch {
    offlineQueue = [];
  }
}

async function saveToOfflineQueue(entry: unknown, context: Partial<AppLog>, hash: string): Promise<void> {
  const item = { entry, context, hash, timestamp: Date.now() };

  if (typeof window !== 'undefined' && window.indexedDB) {
    try {
      const request = indexedDB.open('campfit-logs', 1);
      request.onsuccess = () => {
        const dbInstance = request.result;
        const transaction = dbInstance.transaction(['logs'], 'readwrite');
        const store = transaction.objectStore('logs');
        store.put(item);
      };
    } catch {
      offlineQueue.push(item);
    }
  } else {
    offlineQueue.push(item);
  }
}

async function flushQueue(): Promise<void> {
  if (!isOnline || offlineQueue.length === 0) return;

  const batch = offlineQueue.splice(0, 10); // Procesar en lotes de 10

  for (const item of batch) {
    try {
      await sendLogToFirestore(item.entry as any, item.context, item.hash, false);
    } catch {
      // Si falla, devolver al queue
      offlineQueue.push(item);
    }
  }

  if (offlineQueue.length > 0 && isOnline) {
    setTimeout(() => flushQueue(), 5000);
  }
}

// ============================================================
// Escritura a Firestore
// ============================================================

async function sendLogToFirestore(
  entry: unknown,
  context: Partial<AppLog>,
  hash: string,
  deduplicate = true,
): Promise<void> {
  if (typeof window === 'undefined') return;

  const identifier = context.userId || 'anonymous';
  if (!checkRateLimit(identifier)) {
    return;
  }

  try {
    // Importaciones dinámicas para SSR safety
    const firebaseModule = require('@/lib/firebase') as { db: unknown };
    const firestore = require('firebase/firestore') as {
      doc: (...args: unknown[]) => unknown;
      collection: (...args: unknown[]) => unknown;
      setDoc: (...args: unknown[]) => Promise<void>;
      serverTimestamp: () => unknown;
    };

    const logRef = firestore.doc(firestore.collection(firebaseModule.db, 'app_logs'));

    const appLog: AppLog = {
      timestamp: firestore.serverTimestamp() as any,
      hash,
      occurrenceCount: 1,
      userId: context.userId || 'anonymous',
      userEmailHash: context.userEmailHash || hashEmail(currentUser?.email),
      userRole: (context.userRole as AppLog['userRole']) || 'unknown',
      activity: context.activity || 'unknown',
      action: context.action || 'unknown',
      feature: context.feature || 'unknown',
      relatedUserId: context.relatedUserId,
      relatedUserRole: context.relatedUserRole,
      relationType: context.relationType,
      url: context.url || '',
      userAgent: truncate(context.userAgent, MAX_USERAGENT_CHARS),
      language: context.language || 'unknown',
      viewport: context.viewport || 'unknown',
      level: (context.level as AppLog['level']) || 'error',
      message: truncate((entry as { message?: string })?.message, MAX_MESSAGE_CHARS),
      errorName: (entry as { payload?: Record<string, unknown> })?.payload?.errorName as string | undefined,
      errorStack: truncateStack((entry as { payload?: Record<string, unknown> })?.payload?.errorStack as string | undefined),
      errorCode: (entry as { payload?: Record<string, unknown> })?.payload?.errorCode as string | undefined,
      payload: sanitizePayload(context.payload),
      sessionId: context.sessionId || 'unknown',
      breadcrumb: context.breadcrumb || [],
      environment: context.environment || detectEnvironment(),
    };

    await firestore.setDoc(logRef, appLog);

    if (deduplicate) {
      const dedupRef = firestore.doc(firestore.collection(firebaseModule.db, 'app_logs_dedup'), hash);
      await firestore.setDoc(dedupRef, {
        hash,
        userId: context.userId,
        createdAt: firestore.serverTimestamp(),
      });
    }
  } catch {
    // No propagar el error — el logger nunca debe bloquear la UI
  }
}

function detectEnvironment(): AppLog['environment'] {
  if (typeof window === 'undefined') return 'production';

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  if (hostname.includes('staging') || hostname.includes('dev.')) {
    return 'staging';
  }
  return 'production';
}

// ============================================================
// Enriquecimiento
// ============================================================

function enrichLogEntry(entry: unknown): Partial<AppLog> {
  const relation = detectUserRelation(currentUser?.uid);
  const activity = typeof window !== 'undefined' ? detectActivity(window.location.pathname) : 'unknown';

  if (typeof window !== 'undefined') {
    pushBreadcrumb(activity, (entry as { module?: string }).module || 'unknown');
  }

  return {
    userId: currentUser?.uid || 'anonymous',
    userEmailHash: hashEmail(currentUser?.email),
    userRole: (currentUser?.role as AppLog['userRole']) || 'unknown',
    activity,
    action: (entry as { module?: string }).module?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
    feature: typeof window !== 'undefined' ? mapActivityToFeature(window.location.pathname) : 'unknown',
    relatedUserId: relation?.relatedUserId,
    relatedUserRole: relation?.relatedUserRole,
    relationType: relation?.relationType,
    url: typeof window !== 'undefined' ? window.location.pathname : '',
    userAgent: typeof navigator !== 'undefined' ? truncate(navigator.userAgent, MAX_USERAGENT_CHARS) : '',
    language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
    viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
    sessionId: sessionId || 'unknown',
    breadcrumb: getBreadcrumbs(),
    environment: detectEnvironment(),
    level: (function() {
      const rawLevel = (entry as { level?: LogLevel }).level;
      return (rawLevel === 'debug' || rawLevel === 'info' || rawLevel === 'success'
        ? 'error'
        : (rawLevel as AppLog['level'])) as AppLog['level'];
    })(),
    payload: (entry as { payload?: Record<string, unknown> }).payload,
  };
}

// ============================================================
// API pública
// ============================================================

export const logService = {
  init(): void {
    if (typeof window === 'undefined') return;

    isOnline = navigator.onLine;

    sessionId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    initAuthListener();
    initOfflineQueue();

    window.addEventListener('online', () => {
      isOnline = true;
      flushQueue();
    });

    window.addEventListener('offline', () => {
      isOnline = false;
    });

    logger.subscribe((entry) => {
      if (entry.level === 'debug' || entry.level === 'info' || entry.level === 'success') {
        return;
      }

      if (entry.level !== 'warn' && entry.level !== 'error' && entry.level !== 'critical') {
        return;
      }

      const context = enrichLogEntry(entry);
      const errorName = (entry.payload as Record<string, unknown>)?.errorName as string | undefined;
      const hash = computeErrorHash(context, errorName || entry.module);

      if (recentErrors.has(hash)) {
        const lastTime = recentErrors.get(hash)!;
        const windowMs = getDedupWindow(entry.level);

        if (Date.now() - lastTime < windowMs) {
          return;
        }
      }

      recentErrors.set(hash, Date.now());

      for (const [key, time] of Array.from(recentErrors.entries())) {
        if (Date.now() - time > DEDUP_WINDOW_ERROR_CRITICAL) {
          recentErrors.delete(key);
        }
      }

      sendLogToFirestore(entry, context, hash).catch(() => {
        saveToOfflineQueue(entry, context, hash);
      });
    });
  },

  log(level: LogLevel, message: string, context?: LogContext): void {
    if (level === 'debug' || level === 'info' || level === 'success') {
      return;
    }

    if (level === 'error') {
      logger.error(context?.activity || 'System', message, context?.error);
    } else if (level === 'warn') {
      logger.warn(context?.activity || 'System', message);
    } else if (level === 'critical') {
      logger.error('CRITICAL', message, context?.error);
    }
  },

  error(module: string, message: string, error?: unknown, context?: LogContext): void {
    logger.error(module, message, error);

    if (!sessionId || typeof window === 'undefined') {
      return;
    }

    const identifier = currentUser?.uid || 'anonymous';
    if (!checkRateLimit(identifier)) {
      return;
    }

    const enrichedContext = enrichLogEntry({
      id: '',
      timestamp: new Date(),
      level: 'error',
      module,
      message,
      payload: error as Record<string, unknown>,
      url: typeof window !== 'undefined' ? window.location.pathname : '',
    }) as Partial<AppLog>;

    const errorName = error instanceof Error ? error.name : 'Error';
    const hash = computeErrorHash(enrichedContext, errorName);

    if (recentErrors.has(hash)) {
      const lastTime = recentErrors.get(hash)!;
      if (Date.now() - lastTime < DEDUP_WINDOW_ERROR_CRITICAL) {
        return;
      }
    }
    recentErrors.set(hash, Date.now());

    sendLogToFirestore(
      {
        id: '',
        timestamp: new Date(),
        level: 'error',
        module,
        message,
        payload: error as Record<string, unknown>,
        url: typeof window !== 'undefined' ? window.location.pathname : '',
      },
      enrichedContext,
      hash,
    ).catch(() => {
      saveToOfflineQueue(
        {
          id: '',
          timestamp: new Date(),
          level: 'error',
          module,
          message,
          payload: error as Record<string, unknown>,
          url: '',
        },
        enrichedContext,
        hash,
      );
    });
  },

  warn(module: string, message: string, context?: LogContext): void {
    logger.warn(module, message);

    if (!sessionId || typeof window === 'undefined') {
      return;
    }

    const enrichedContext = enrichLogEntry({
      id: '',
      timestamp: new Date(),
      level: 'warn',
      module,
      message,
      payload: {},
      url: typeof window !== 'undefined' ? window.location.pathname : '',
    }) as Partial<AppLog>;

    const hash = computeErrorHash(enrichedContext, 'Warning');

    if (recentErrors.has(hash)) {
      const lastTime = recentErrors.get(hash)!;
      if (Date.now() - lastTime < DEDUP_WINDOW_WARN) {
        return;
      }
    }
    recentErrors.set(hash, Date.now());

    sendLogToFirestore(
      {
        id: '',
        timestamp: new Date(),
        level: 'warn',
        module,
        message,
        payload: {},
        url: '',
      },
      enrichedContext,
      hash,
    ).catch(() => {
      saveToOfflineQueue(
        {
          id: '',
          timestamp: new Date(),
          level: 'warn',
          module,
          message,
          payload: {},
          url: '',
        },
        enrichedContext,
        hash,
      );
    });
  },

  getLocalHistory(): unknown[] {
    return [];
  },

  clearLocalHistory(): void {
    logger.clearHistory();
    recentErrors.clear();
  },

  async flushQueue(): Promise<void> {
    await flushQueue();
  },
};
