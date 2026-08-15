# 📋 Diseño: Sistema de Logging en Firebase — CampFit

> **Objetivo:** Registrar todos los errores automáticamente en Firestore con contexto rico, deduplicación estricta, panel admin para gestión y acceso seguro para agentes IA.
> **Última actualización:** 2026-08-14
> **Estado:** 📐 Aprobado para implementación

---

## 1. Principios de Diseño

| Principio | Regla |
|-----------|-------|
| **Privacidad first** | Solo se registran errores de usuarios autenticados. No se envía información sensible de salud sin anonimización opcional. |
| **Contexto rico** | Cada log incluye usuario, actividad, relación con otros usuarios, y entorno técnico. |
| **Admin-only delete** | Solo usuarios con rol `admin` pueden eliminar logs. Los logs son inmutables para trainers y clients. |
| **IA-friendly** | Los logs se consultan con queries simples y tienen campos estructurados para análisis automático. |
| **Costo controlado** | Solo se escriben `warn`, `error` y `critical`. Retención automática y deduplicación por defecto. |
| **No bloqueo** | El logger nunca bloquea la UI. Los writes a Firestore son fire-and-forget con fallback a memoria. |
| **Deduplicación estricta** | Mismo error en ventana corta → 1 log con contador, no N logs idénticos. Previene inundación. |
| **Clasificación por nivel** | `warn`/`error`/`critical` con semántica clara. `debug`/`info` no se guardan en Firestore. |
| **Notificación admin** | `error`: badge en panel. `critical`: badge + email inmediato a admins. |
| **Acceso IA seguro** | API route con token rotativo de 24h o cookie de admin existente. Sin acceso directo a Firestore. |

---

## 2. Colección Firestore: `app_logs`

### 2.1 Estructura del documento

```typescript
interface AppLog {
  // === Identificación ===
  timestamp: FirebaseTimestamp;     // serverTimestamp() — hora real del servidor
  hash: string;                    // Hash del error para deduplicación
  occurrenceCount: number;         // Cuántas veces se repitió este error en la ventana

  // === Usuario principal ===
  userId: string;                  // UID del usuario autenticado
  userEmailHash: string;           // Hash SHA-256 del email (para búsqueda sin exponer PII)
  userRole: 'client' | 'trainer' | 'admin' | 'unknown';

  // === Actividad / Contexto funcional ===
  activity: string;                // Ej: "client/diets", "trainer/workouts", "admin/users"
  action: string;                  // Ej: "registerMealComplete", "sendMessage", "updateUserProfile"
  feature: string;                 // Ej: "diet", "workout", "chat", "clinical", "progress", "auth", "system"

  // === Relaciones (si aplica) ===
  relatedUserId?: string;          // Ej: trainerId cuando es un cliente, clientId cuando es un trainer
  relatedUserRole?: string;        // Ej: "trainer" o "client"
  relationType?: string;           // Ej: "trainer-client", "admin-user"

  // === Entorno técnico ===
  url: string;                     // window.location.pathname
  userAgent: string;               // navigator.userAgent (truncado a 200 chars)
  language: string;                // navigator.language
  viewport: string;                // `${window.innerWidth}x${window.innerHeight}`

  // === Error detallado ===
  level: 'warn' | 'error' | 'critical';  // Solo estos niveles se guardan en Firestore
  message: string;                 // Mensaje principal del log (truncado a 500 chars)
  errorName?: string;              // Nombre del error (ej: "TypeError", "FirestoreError")
  errorStack?: string;             // Stack trace truncado a 2KB
  errorCode?: string;              // Código de error de Firebase (ej: "permission-denied")

  // === Payload extendido (sanitizado) ===
  payload?: Record<string, unknown>;

  // === Metadatos de tracing ===
  sessionId: string;               // ID de sesión anónimo (UUID v4)
  breadcrumb: string[];            // Últimas 5 actividades antes del error
  environment: 'development' | 'staging' | 'production';  // Para filtrar por entorno
}
```

### 2.2 Ejemplo de documento

```json
{
  "timestamp": "2026-08-14T17:42:00.000Z",
  "hash": "a3f2b8c1d4e5f6...",
  "occurrenceCount": 23,
  "userId": "uid-cliente-123",
  "userEmailHash": "e3b0c44298fc1c149afbf4c8996fb924...",
  "userRole": "client",
  "activity": "client/diets",
  "action": "registerMealComplete",
  "feature": "diet",
  "relatedUserId": "uid-trainer-456",
  "relatedUserRole": "trainer",
  "relationType": "trainer-client",
  "url": "/client/diets",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "language": "es-ES",
  "viewport": "1366x768",
  "level": "error",
  "message": "Error al registrar comida completada",
  "errorName": "FirestoreError",
  "errorStack": "Error: Missing or insufficient permissions.\n    at ...",
  "errorCode": "permission-denied",
  "payload": {
    "dietId": "diet-789",
    "mealId": "meal-321",
    "clientId": "uid-cliente-123"
  },
  "sessionId": "session-abc123",
  "breadcrumb": [
    "client/diets:loadDiets",
    "client/diets:renderMeals",
    "client/diets:registerMealComplete"
  ],
  "environment": "production"
}
```

---

## 3. Reglas de Seguridad Firestore

```javascript
match /app_logs/{logId} {
  // === LECTURA ===
  // Solo admins pueden leer logs.
  allow read: if isAdmin();

  // === ESCRITURA ===
  // Solo usuarios autenticados pueden CREAR logs.
  // Se valida que los campos críticos estén presentes y sean coherentes.
  allow create: if isAuth()
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.userRole in ['client', 'trainer', 'admin', 'unknown']
    && request.resource.data.level in ['warn', 'error', 'critical']
    && request.resource.data.timestamp is timestamp
    && request.resource.data.activity is string
    && request.resource.data.action is string
    && request.resource.data.hash is string
    && request.resource.data.sessionId is string
    && request.resource.data.environment is string
    // Sanitización forzada: no se permiten campos sensibles en payload
    && !('password' in request.resource.data.payload)
    && !('token' in request.resource.data.payload)
    && !('secret' in request.resource.data.payload)
    && !('medicalRecord' in request.resource.data.payload)
    && !('diagnosis' in request.resource.data.payload)
    && !('medication' in request.resource.data.payload)
    && !('allergies' in request.resource.data.payload)
    && !('dietaryRestrictions' in request.resource.data.payload);

  // Solo admins pueden ELIMINAR logs.
  // NO se permiten updates (inmutabilidad de logs).
  allow update: if false;
  allow delete: if isAdmin();
}

// Colección auxiliar para deduplicación (solo backend / Cloud Functions)
match /app_logs_dedup/{dedupId} {
  allow read: if false;
  allow create: if isAuth() && request.auth.uid == request.resource.data.createdBy;
  allow update: if false;
  allow delete: if isAdmin();
}
```

### Explicación de las reglas

| Operación | Quién | Justificación |
|-----------|-------|---------------|
| `read` | Solo `admin` | Los logs contienen información sensible (rutas, emails, errores técnicos). |
| `create` | Usuario autenticado | Permitimos write de logs para capturar errores automáticamente, con validación estricta. |
| `update` | **Nadie** | Los logs son inmutables. |
| `delete` | Solo `admin` | Eliminación controlada desde el panel admin. |
| `app_logs_dedup` | Solo backend | Colección interna para deduplicación. No accesible desde cliente. |

---

## 4. Servicio de Logging: `src/lib/shared/logService.ts`

### 4.1 Responsabilidades

- Interceptar llamadas a `logger.error()` y `logger.warn()`
- Enriquecer el log con contexto automático (usuario, URL, userAgent, etc.)
- Implementar deduplicación cliente-side antes de escribir
- Escribir a Firestore en background (fire-and-forget)
- Gestionar cola offline para cuando no hay conexión
- Gestionar breadcrumbs (rastro de actividades recientes)

### 4.2 API pública

```typescript
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

export const logService = {
  // Inicializar el servicio (llamar una vez al cargar la app)
  init(): void;

  // Registrar un log (wrapper de logger con envío a Firestore)
  log(level: 'warn' | 'error' | 'critical', message: string, context?: LogContext): void;

  // Registrar un error con contexto automático
  error(module: string, message: string, error?: unknown, context?: LogContext): void;

  // Registrar un warning con contexto
  warn(module: string, message: string, context?: LogContext): void;

  // Obtener logs desde memoria (para DevTools)
  getLocalHistory(options?: LogFilterOptions): LogEntry[];

  // Limpiar historial local
  clearLocalHistory(): void;

  // Forzar flush de la cola offline
  flushQueue(): Promise<void>;
};
```

### 4.3 Flujo de escritura con deduplicación

```
logger.error('Auth', 'Login failed', error)
    │
    ▼
logService.error('Auth', 'Login failed', error, { activity: 'login', action: 'loginUser' })
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Capturar contexto automático                             │
│    - userId, userEmailHash, userRole                        │
│    - url, userAgent, language, viewport                     │
│    - sessionId, breadcrumbs, environment                    │
│                                                             │
│ 2. Extraer info del error                                   │
│    - errorName, errorStack (truncado 2KB), errorCode        │
│                                                             │
│ 3. Sanitizar payload                                        │
│    - Eliminar campos sensibles                              │
│                                                             │
│ 4. Calcular hash                                            │
│    - userId + feature + activity + action + errorName       │
│                                                             │
│ 5. Deduplicación cliente-side (5-15 min)                    │
│    - Si hash reciente → NO escribir                         │
│    - Si es nuevo → continuar                                │
│                                                             │
│ 6. Escribir a Firestore (background)                        │
│    - addDoc(collection(db, 'app_logs'))                     │
│    - Fire-and-forget (no await)                             │
│                                                             │
│ 7. Fallback: cola en memoria/IndexedDB                      │
│    - Si falla Firestore, encolar                            │
│    - Reintentar cuando haya conexión                        │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Deduplicación

**Cliente-side:**
```typescript
const recentErrors = new Map<string, number>();
const DEDUP_WINDOW_ERROR = 5 * 60 * 1000;   // 5 min para error/critical
const DEDUP_WINDOW_WARN = 15 * 60 * 1000;   // 15 min para warn

function shouldLog(hash: string, level: LogLevel): boolean {
  const windowMs = level === 'warn' ? DEDUP_WINDOW_WARN : DEDUP_WINDOW_ERROR;
  const last = recentErrors.get(hash);
  if (last && Date.now() - last < windowMs) {
    return false;
  }
  recentErrors.set(hash, Date.now());
  return true;
}
```

**Server-side (Cloud Function opcional):**
- Consultar `app_logs` por `hash` + `timestamp > now - window`
- Si existe, incrementar `occurrenceCount` en vez de crear nuevo doc
- Limpiar entradas viejas de `app_logs_dedup` periódicamente

### 4.5 Hash del error

```typescript
function computeErrorHash(context: LogContext, errorName: string): string {
  const parts = [
    context.userId || 'anonymous',
    context.feature || 'unknown',
    context.activity || 'unknown',
    context.action || 'unknown',
    errorName,
  ];
  // Simple hash determinista (no criptográfico, solo para dedup)
  let hash = 0;
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      hash = ((hash << 5) - hash) + part.charCodeAt(i);
      hash |= 0;
    }
  }
  return Math.abs(hash).toString(16) + '-' + (Date.now() / 60000 | 0); // 1-minuto bucket
}
```

---

## 5. Integración con el Logger Existente

### 5.1 Estrategia: Wrapper no invasivo

No reemplazamos el logger actual. Lo extendemos con un **subscriber** que escucha cada log y lo envía a Firestore cuando corresponde.

```typescript
// En src/lib/shared/logService.ts

export function initLogService(): void {
  // 1. Generar session ID anónimo (UUID v4)
  const sessionId = crypto.randomUUID();

  // 2. Inicializar cola offline (IndexedDB o memoria)
  initOfflineQueue();

  // 3. Suscribirse al logger existente
  const unsubscribe = logger.subscribe((entry) => {
    // Solo enviar a Firestore errores y warnings en producción
    if (entry.level === 'error' || entry.level === 'warn') {
      const context = enrichLogEntry(entry, sessionId);
      const hash = computeErrorHash(context, entry.payload?.errorName || 'Error');

      // Deduplicación cliente-side
      if (!shouldLog(hash, entry.level)) {
        return;
      }

      sendLogToFirestore(entry, context, hash);
    }
  });

  // 4. Guardar unsubscribe para cleanup (opcional)
  // (desuscribir al cerrar la app)
}
```

### 5.2 Inicialización SSG-safe

```typescript
// En BaseLayout.astro o App.astro
<script>
  // Solo en navegador
  if (typeof window !== 'undefined') {
    import('@/lib/shared/logService').then(({ initLogService }) => {
      initLogService();
    });
  }
</script>
```

### 5.3 Enriquecimiento automático de contexto

```typescript
function enrichLogEntry(entry: LogEntry, sessionId: string): Partial<AppLog> {
  const user = getCurrentUser(); // Desde authStore
  const relation = detectUserRelation(user?.uid);

  return {
    userId: user?.uid || 'anonymous',
    userEmailHash: hashEmail(user?.email || ''),
    userRole: user?.role || 'unknown',
    activity: detectActivity(window.location.pathname),
    action: entry.module.toLowerCase().replace(/\s+/g, '_'),
    feature: mapActivityToFeature(window.location.pathname),
    relatedUserId: relation?.relatedUserId,
    relatedUserRole: relation?.relatedUserRole,
    relationType: relation?.type,
    url: window.location.pathname,
    userAgent: navigator.userAgent.slice(0, 200),
    language: navigator.language,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    sessionId,
    breadcrumb: getBreadcrumbs(), // últimas 5 actividades
    environment: import.meta.env.MODE as AppLog['environment'],
  };
}
```

---

## 6. Panel Admin: Gestión de Logs

### 6.1 Ubicación

Ruta: `/admin/logs` — módulo de operaciones, separado de `/admin/devtools` (solo desarrollo).

### 6.2 Funcionalidades

| Sección | Descripción |
|---------|-------------|
| **Filtros** | Por nivel (`critical`/`error`/`warn`), módulo, usuario, fecha, feature |
| **Lista de logs** | Tabla con columnas: timestamp, usuario, actividad, acción, nivel, mensaje, ocurrencias |
| **Detalle del log** | Modal con información completa: stack trace, payload, breadcrumbs, entorno |
| **Acciones** | Solo admin: eliminar logs seleccionados (con confirmación) |
| **Estadísticas** | Resumen: total logs, logs por nivel, logs por feature, usuarios con más errores |
| **Notificaciones** | Badge con cantidad de `error`/`critical` no leídos |

### 6.3 Estructura

```
/admin/logs
├── <AdminLayout>
│   ├── Filtros (top bar)
│   │   ├── Select: nivel (critical, error, warn, all)
│   │   ├── Input: buscar por mensaje o usuario
│   │   ├── Select: feature (diet, workout, chat, clinical, progress, auth, system)
│   │   └── Date range picker
│   │
│   ├── Estadísticas (cards)
│   │   ├── Total logs
│   │   ├── Logs por nivel
│   │   ├── Top 5 usuarios con más errores
│   │   └── Top 5 features con más errores
│   │
│   ├── Tabla de logs
│   │   ├── Columnas: timestamp | usuario | actividad | acción | nivel | ocurrencias | mensaje
│   │   ├── Paginación (50 logs por página)
│   │   └── Click → modal de detalle
│   │
│   └── Modal de detalle
│       ├── Información básica
│       ├── Stack trace completo
│       ├── Payload JSON sanitizado
│       ├── Breadcrumbs (flujo de actividades)
│       └── Botón "Eliminar" (solo admin)
```

---

## 7. Acceso para Agentes IA

### 7.1 Estrategia: Token rotativo o cookie de admin

**Prioridad:** Usar cookie de sesión de admin existente. Si no existe, generar token rotativo.

#### Opción A: Cookie de sesión admin (preferida)

```typescript
// src/pages/api/admin/logs.ts
import { requireAdmin } from '@/lib/shared/authGuard';

export const GET = async (request: Request) => {
  // requireAdmin() valida la cookie de sesión de Firebase Auth
  const user = await requireAdmin();

  // ... construir query y retornar logs
};
```

**Ventaja:** No requiere flujo adicional. El admin ya está autenticado.

#### Opción B: Token rotativo (fallback)

```typescript
// src/pages/api/admin/logs/ia.ts
// Endpoint específico para agentes IA con token

interface IALogToken {
  token: string;
  scope: 'logs:read';
  createdAt: number;
  expiresAt: number;
  createdBy: string; // UID del admin que lo generó
  userAgent?: string;
}

export const GET = async (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ia-log-')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const token = authHeader.slice(7);
  const tokenDoc = await getDoc(doc(db, 'ia_log_tokens', token));

  if (!tokenDoc.exists()) {
    return new Response('Invalid token', { status: 403 });
  }

  const tokenData = tokenDoc.data() as IALogToken;
  if (Date.now() > tokenData.expiresAt) {
    return new Response('Token expired', { status: 403 });
  }

  // ... retornar logs
};
```

**Flujo de generación:**

1. Admin va a `/admin/settings`
2. Click en "Generar token para IA"
3. Sistema genera token aleatorio, lo guarda en `ia_log_tokens/{token}`
4. Token expira en 24h
5. Admin copia token y lo comparte con el agente IA
6. Agente IA usa `Authorization: Bearer ia-log-xxxx`
7. Admin puede revocar tokens en cualquier momento

### 7.2 Rate limiting

```typescript
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 30; // 30 consultas por minuto

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
```

### 7.3 Endpoints

| Endpoint | Método | Acceso | Descripción |
|----------|--------|--------|-------------|
| `/api/admin/logs` | GET | Admin cookie | Consulta completa con filtros, para panel humano |
| `/api/admin/logs` | DELETE | Admin cookie | Eliminar logs seleccionados |
| `/api/ia/logs` | GET | Token IA | Formato estructurado para agentes IA |
| `/api/admin/logs/token` | POST | Admin cookie | Generar token rotativo para IA |

---

## 8. Retención y Limpieza

### 8.1 Política de retención

| Nivel | Retención | Justificación |
|-------|-----------|---------------|
| `critical` | 90 días | Errores severos necesitan más tiempo para análisis post-mortem |
| `error` | 60 días | Errores estándar |
| `warn` | 30 días | Warnings, menos críticos |

`debug`/`info` no se guardan en Firestore.

### 8.2 Limpieza automática

**Cloud Function diaria:**

```typescript
export const cleanupOldLogs = onSchedule(async (context) => {
  const now = Date.now();
  const retention = {
    critical: now - 90 * 24 * 60 * 60 * 1000,
    error: now - 60 * 24 * 60 * 60 * 1000,
    warn: now - 30 * 24 * 60 * 60 * 1000,
  };

  for (const [level, cutoff] of Object.entries(retention)) {
    const q = query(
      collection(db, 'app_logs'),
      where('level', '==', level),
      where('timestamp', '<', new Date(cutoff))
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
});
```

**Botón manual en panel admin:**
- "Limpiar logs antiguos"
- Muestra preview: "Se eliminarán X logs"
- Confirmación requerida

---

## 9. Índices Firestore

```json
{
  "indexes": [
    {
      "collectionGroup": "app_logs",
      "fields": [
        { "fieldPath": "level", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "app_logs",
      "fields": [
        { "fieldPath": "feature", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "app_logs",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "app_logs",
      "fields": [
        { "fieldPath": "level", "order": "ASCENDING" },
        { "fieldPath": "feature", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 10. Privacidad y Cumplimiento

### 10.1 Datos que se registran

| Campo | Tipo | Sensibilidad | Justificación |
|-------|------|--------------|---------------|
| `userId` | ID | Baja | Necesario para relacionar errores con usuarios |
| `userEmailHash` | Hash SHA-256 | Baja | Para búsqueda sin exponer email en texto plano |
| `userRole` | Enum | Baja | Para filtrado y contexto |
| `activity` / `action` | String | Baja | Para identificar la funcionalidad |
| `relatedUserId` | ID | Media | Necesario para entender relaciones trainer-client |
| `url` | String | Baja | Para identificar la página donde ocurrió el error |
| `userAgent` | String | Baja | Para diagnosticar problemas de navegador |
| `errorStack` | String | Media | Truncado a 2KB; necesario para debugging |
| `payload` | Object | Variable | Sanitizado en cliente + reglas Firestore |
| `sessionId` | UUID | Baja | Anónimo, para correlacionar logs de una sesión |

### 10.2 Sanitización del payload

```typescript
const SENSITIVE_FIELDS = [
  'password', 'pass', 'pwd',
  'token', 'secret', 'apiKey', 'apikey', 'api_key',
  'creditCard', 'cc', 'cardNumber',
  'ssn', 'dni', 'nif',
  'medicalRecord', 'diagnosis', 'medication',
  'allergies', 'conditions', 'dietaryRestrictions',
  'privateNotes', 'notes'
];

function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...payload };
  for (const field of SENSITIVE_FIELDS) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return sanitized;
}
```

**Doble capa:**
1. Sanitización en el cliente (`logService.ts`)
2. Validación en reglas Firestore (rechaza escritura si contiene campos sensibles)

### 10.3 Derecho al olvido

- Los admins pueden eliminar logs de un usuario específico desde el panel
- Endpoint: `DELETE /api/admin/logs?userId=xxx`
- Cumple con GDPR: el usuario puede solicitar eliminación de sus logs

---

## 11. Implementación: Plan de Fases

### Fase 1: Infraestructura base (prioridad alta)

1. **Crear colección `app_logs`** en Firestore
2. **Actualizar `firestore.rules`** con las reglas de acceso y sanitización
3. **Actualizar `firestore.indexes.json`** con índices compuestos
4. **Crear `src/lib/shared/logService.ts`** con:
   - `initLogService()` — SSG-safe
   - `log()`, `error()`, `warn()` — solo niveles guardados en Firestore
   - Enriquecimiento automático de contexto
   - Deduplicación cliente-side con ventana adaptativa
   - Escritura a Firestore (fire-and-forget)
   - Cola offline básica (IndexedDB)
   - Sanitización de payload
5. **Integrar en `BaseLayout.astro`**: llamar `initLogService()` al cargar la app
6. **Tests unitarios** para `logService.ts`

### Fase 2: Panel admin y API (prioridad alta)

7. **Crear `src/pages/admin/logs.astro`** con:
   - Filtros por nivel, feature, usuario, fecha
   - Tabla paginada (50 logs por página)
   - Modal de detalle con stack trace, payload, breadcrumbs
   - Botón eliminar (solo admin)
   - Estadísticas básicas
   - Badge de notificaciones
8. **Crear API route** `src/pages/api/admin/logs.ts` para consultas del panel
9. **Crear API route** `src/pages/api/ia/logs.ts` para agentes IA (con token o cookie)
10. **Crear endpoint** `src/pages/api/admin/logs/token.ts` para generar tokens IA
11. **Tests E2E** del panel de logs

### Fase 3: Notificaciones y limpieza (prioridad media)

12. **Cloud Function** `notifyAdminsOnCritical` para emails a admins
13. **Cloud Function** `cleanupOldLogs` para retención automática
14. **Botón manual** "Limpiar logs antiguos" en panel admin

### Fase 4: Mejoras y pulido (prioridad baja)

15. **Breadcrumbs avanzados**: subcolección `app_logs/{logId}/breadcrumbs/{n}`
16. **Dashboard de estadísticas**: gráficos de errores por feature/usuario
17. **Alertas en tiempo real**: notificar por email/Slack en picos de errores
18. **Integración con sistema de tickets**: crear tareas automáticamente desde logs críticos

---

## 12. Consideraciones de Costo

| Aspecto | Estimación | Mitigación |
|----------|------------|------------|
| **Writes a Firestore** | ~100-500 logs/día en producción | Solo `warn`/`error`/`critical`; deduplicación reduce hasta 90% |
| **Almacenamiento** | ~1-5 MB/mes | Retención de 30-90 días |
| **Lecturas (panel admin)** | ~10-50/día | Paginación, índices compuestos |
| **Cloud Functions** | ~1-2 ejecuciones/día | Función económica |

**Costo estimado:** < $1/mes en la capa gratuita de Firebase.

---

## 13. Checklist de Aprobación

- [x] Estructura de `AppLog` aprobada
- [x] Reglas de seguridad Firestore aprobadas
- [x] Política de retención aprobada
- [x] Estrategia de sanitización aprobada
- [x] Ubicación del panel admin aprobada (`/admin/logs`)
- [x] Acceso para agentes IA aprobado (token rotativo o cookie admin)
- [x] Deduplicación cliente-side aprobada
- [x] Notificaciones admin aprobadas (badge + email para critical)

**Estado: Aprobado para implementación.**

---

> 📌 **Documento diseñado el:** 2026-08-14
> 📌 **Diseñado por:** Equipo CampFit + Análisis de estado actual
> 📌 **Próximo paso:** Implementación Fase 1
