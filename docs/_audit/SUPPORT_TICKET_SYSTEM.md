# 🔍 Auditoría: Sistema de Tickets & Reportes de Soporte — CampFit

> **Fecha:** 2026-08-16  
> **Estado:** Pendiente de implementación (hoy se documenta la brecha y se diseña la arquitectura)  
> **Auditor:** Documentator Agent  
> **Scope:** Permitir que **cualquier usuario** (cliente, entrenador, admin) report
> errores, incidentes, conducta indebida o posibles vulnerabilidades; **admins** gestionan los tickets,
> contactan usuarios, analizan reportes y generan reportesResúmenes/estadísticas.

---

## 1. Estado Actual del Sistema

### 1.1 Página de Soporte Existente

Ruta: [`/client/support.astro`](../src/pages/client/support.astro)

- **Tipo:** Página estática con FAQ.
- **Contenido:** 5 preguntas frecuentes sobre workouts, diets, progress, chat, perfil médico.
- **Interacción:** Solo lectura — no hay formulario de reporte, ni envío, ni guardado en backend.
- **Integración:** None. La página redirige al chat (`/client/chat`) pero no recoge reportes.

**Evaluación:** La página existe como punto de entrada visible para el usuario, pero **no funciona como canal de reporte**. Es un hueco funcional, no un feature.

### 1.2 Backend / Firestore

**Colecciones de tickets/reportes:** **Ninguna.** El schema de Firestore tiene 11 colecciones definidas (ver [FIRESTORE_SCHEMA.md](docs/architecture/FIRESTORE_SCHEMA.md)):

```
users/{userId}
workouts/{workoutId}
diets/{dietId}
messages/{messageId}
progress_logs/{logId}
foods_library/{foodId}
exercises_library/{exerciseId}
user_exercise_prefs/{userId}
workout_templates/{templateId}
diet_templates/{templateId}
exercise_templates/{templateId}
```

**Ninguna es `tickets`, `support_tickets`, `reports`, `incidents` o similar.**

**APIs de tickets/reportes:** **Ninguna.** Los endpoints de API existentes son:

- `/api/admin/logs/query.ts` — consulta logs de auditoría
- `/api/admin/logs/token.ts` — gestión tokens IA
- `/api/ia/logs.ts` — logs de uso IA
- `/api/onboarding.ts` — onboarding de usuarios
- `/api/storage/health.ts`, `/api/storage/presigned-url.ts`, `/api/storage/upload.ts` — subida de media

**Ninguno es un endpoint de tickets.**

### 1.3 Panel de Administración

**Navegación del admin (AdminLayout.astro):**
- General: Dashboard, Usuarios & Atletas
- Catálogos: Ejercicios, Base Nutricional
- Sistema: Logs & Auditoría, DevTools & Seed, Configuración

**No existe:** Sección "Tickets / Reportes" ni "Support" en el navbar.

**Admin no tiene** vista para:
- Ver tickets abiertos
- Contactar a un usuario que reportó algo
- Marcar tickets como resueltos
- Ver estadísticas de tickets
- Generar reportesResúmenes/exportaciones

### 1.4 i18n

Existen keys de soporte para el FAQ (`client.support.*`) en es/en/ca, pero **no existen keys para:**
- Formulario de reporte (`report.title`, `report.submit`, etc.)
- Panel de tickets de admin (`admin.tickets.*`, `admin.reports.*`)
- Estatus de ticket (`ticket.status.open`, `ticket.status.in_review`, etc.)
- Acciones de admin sobre tickets

### 1.5 Reglas de Seguridad (firestore.rules)

El archivo `firestore.rules` **no referencia ninguna colección de tickets**. Las reglas existentes cubren solo las 11 colecciones actuales. Cualquier nueva colección de tickets necesitará reglas nuevas (ver sección 5 de esta auditoría).

---

## 2. Requisitos del Sistema (lo que el usuario pidió)

### 2.1 Como usuario cualquiera (cliente, entrenador, admin)

Puedo abrir un reporte/ticket describiendo:
- Un **error** de la aplicación (bug, pantalla rota, flujo que no funciona)
- Un **hecho indebido** (conducta de un entrenador, cliente, o admin)
- Una **posible vulnerabilidad** (seguridad, privacidad, datos expuestos)
- **Cualquier otra situación** que necesite atención del equipo

El reporte debe:
- Ser anónimo u opcionalmente identificable (el usuario elige)
- Tener un título breve, una descripción, y una categoría
- Permitirme adjuntar capturas/progress photos si aplica (integración con R2 existente)
- Conservar mi UID para que el admin pueda contactarme (si no es anónimo)

### 2.2 Como admin

Puedo:
- Ver todos los tickets en un panel (tabla/filtros por estado, prioridad, categoría, fecha)
- Abrir un ticket individual y ver el detalle completo
- **Contactar al usuario** que abrió el ticket (mensaje interno del sistema o notificación push)
- **Analizar** el reporte (leer descripción, adjuntos, contexto del usuario)
- Cambiar el estado del ticket (abierto, en revisión, resuelto, cerrado, escalado)
- **Generar reportesResúmenes:** estadísticas de tickets por período, por categoría, por estado, exportable

### 2.3 Casos límite a considerar

| Caso | Comportamiento deseado |
|---|---|
| Usuario anónimo reporta vulnerabilidad | El ticket queda pero el admin no puede contactarlo directamente; el sistema avisa "reportante anónimo" |
| Usuario reporta a un entrenador específico | El ticket puede etiquetarse con el entrenador involucrado (lookup por email/name) |
| Múltiples reportes sobre el mismo incidente | El sistema debe permitir dedup o agrupación manual por admin |
| Ticket de gravedad crítica (vulnerabilidad) | Alerta inmediata al admin (email push o badge en admin) |
| Admin reporta sobre otro admin | El sistema debe permitirlo pero quizás con visibilidad restringida o escalado a superadmin |
| Spam de reportes | Rate limiting básico por UID (ej. 1 ticket/hora) |

---

## 3. Arquitectura Propuesta

### 3.1 Colección Firestore: `support_tickets`

```
support_tickets/{ticketId}
```

**Campos:**

```typescript
interface SupportTicket {
  // Identidad
  ticketId: string;              // documento ID (generado por Firestore o deterministico)
  reporterUid: string;           // UID del usuario que reporta (puede ser vacío si anónimo)
  reporterEmail?: string;        // email copiado al momento del reporte (para contacto)
  reporterName?: string;         // nombre copiado al momento del reporte
  
  // Contenido
  title: string;                 // título breve (max ~100 chars)
  description: string;           // descripción libre (puede ser larga)
  category: TicketCategory;      // ver enums abajo
  severity: TicketSeverity;      // gravedad percibida
  
  // Contexto adicional (opcional)
  relatedUserId?: string;        // si el reporte es sobre un usuario específico (entrenador/cliente/admin)
  relatedEntityType?: string;    // 'trainer' | 'client' | 'admin' | 'system'
  relatedEntityName?: string;    // nombre del sujeto para contexto del admin
  
  // Adjuntos (opcional)
  attachments: AttachmentInfo[]; // URLs de imágenes subidas vía R2 (si aplica)
  
  // Flujo de estado
  status: TicketStatus;
  adminNotes?: AdminNote[];      // notas internas del admin (no visibles al reporter)
  adminContactMessages?: ContactMessage[]; // mensajes del admin al reporter
  
  // Auditoría
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActivityAt: Timestamp;
  assignedAdminId?: string;      // admin que está encargado del ticket
  resolvedAt?: Timestamp;
  
  // Versión para dedup/consulta
  reportHash?: string;           // hash de title+description+reporterUid para detectar duplicados
}
```

**Enums:**

```typescript
type TicketCategory =
  | 'bug'            // error de la aplicación
  | 'misconduct'     // hecho indebido de un usuario
  | 'vulnerability'  // posible vulnerabilidad de seguridad
  | 'inquiry'        // pregunta/duda que no entra en FAQ
  | 'suggestion'     // sugerencia de mejora
  | 'other';         // cualquier otra cosa

type TicketSeverity =
  | 'low'     // molestia minor
  | 'medium'  // afecta flujo pero no bloquea
  | 'high'    // bloquea funcionalidad o es conducta grave
  | 'critical'; // posible vulnerabilidad de seguridad o riesgo legal/ética

type TicketStatus =
  | 'open'        // recién creado, no analizado
  | 'in_review'   // admin lo está analizando
  | 'awaiting_response' // admin necesita info del reporter
  | 'resolved'    // se tomó acción, se avisó al reporter
  | 'closed';     // ticket finalizado

interface AttachmentInfo {
  url: string;       // URL pública R2 o local preview
  filename: string;
  uploadedBy: string; // UID del reporter
  uploadedAt: Timestamp;
}

interface AdminNote {
  adminId: string;
  adminName: string;
  content: string;
  createdAt: Timestamp;
  isInternal: boolean; // si es true, solo visible para admins
}

interface ContactMessage {
  adminId: string;
  adminName: string;
  content: string;
  sentAt: Timestamp;
  // El sistema debería notificar al reporter (push/email) cuando llega un mensaje
}
```

### 3.2 Reglas de Seguridad (firestore.rules) — propuesta

```firestore
// Anyone authenticated can create a ticket
match /support_tickets/{ticketId} {
  allow create: if request.auth != null
                && request.resource.data.reporterUid == request.auth.uid
                && request.resource.data.title is string
                && request.resource.data.title.size() <= 100
                && request.resource.data.description is string
                && request.resource.data.description.size() > 0
                && request.resource.data.category in ['bug', 'misconduct', 'vulnerability', 'inquiry', 'suggestion', 'other'];
  
  // Only the reporter can read their own ticket (or admins can read all)
  allow read: if request.auth != null
              && (resource.data.reporterUid == request.auth.uid
                  || isAdmin());
  
  // Only admins can update status, add notes, contact messages
  allow update: if isAdmin();
  
  // No one can delete tickets (auditable — si se necesita, admin con purge separado)
  allow delete: if false;
}

// Helpers (a definir en funciones)
function isAdmin() {
  // El admin uid tiene role == 'admin' en /users/{uid}
  let adminProfile = get(/databases/$(database)/documents/users/$(request.auth.uid));
  return adminProfile.data.role == 'admin';
}
```

**Nota:** Las reglas de `isAdmin()` necesitan verificar el documento `users/{uid}` del admin que hace la operación. Esto es consistente con el patrón existente del proyecto.

### 3.3 API Routes (Astro SSR)

```
POST /api/support/tickets
  → Crea un ticket. Auth obligatoria. Body: { title, description, category, severity?, relatedUserId?, attachments? }
  → Response: { ticketId, status: 'open', createdAt }

GET /api/support/tickets
  → Lista tickets. Requiere role admin. Query params: status, category, page, limit
  → Response: { tickets: SupportTicket[], hasMore, total }

GET /api/support/tickets/{ticketId}
  → Detalle de un ticket. El reporter ve su propio; los admins ven todos.
  → Response: SupportTicket completo

PATCH /api/support/tickets/{ticketId}
  → Actualización de estado, notas, mensajes de contacto. Solo admin.
  → Body: { status?, adminNotes?, adminContactMessages?, assignedAdminId? }

GET /api/support/reports/overview
  → Estadísticas para generar reportesResúmenes. Solo admin.
  → Response: { total, byStatus, byCategory, bySeverity, byDate (array de counts por día/semana) }
```

**Auth:** Todas las rutas requieren usuario autenticado vía Firebase Auth (cookies de sesión o token). El admin check se hace en `routeGuards` o en cada handler.

### 3.4 UI — Cliente (formulario de reporte)

Página: `/client/support` (o sub-página `/client/support/report`).

**Flujo:**

1. Usuario abre `/client/support`
2. Ve el FAQ (actual) + un botón "Reportar un problema / Solicitar atención"
3. Abre modal o página de formulario:
   - Título (input)
   - Categoría (select: bug, misconduct, vulnerability, inquiry, suggestion, other)
   - Severidad (select: low, medium, high, critical)
   - Descripción (textarea)
   - ¿Es anónimo? (toggle — si no, se copia email+name automáticamente)
   - ¿El reporte es sobre alguien? (opcional: buscar por nombre/email)
   - Adjuntar capturas (botón de上传文件 con integración R2 existente)
4. Submit → POST /api/support/tickets → confirmación visual
5. El usuario puede ver el estado de sus tickets en `/client/support/my-tickets` (opcional)

**Consideración UX:** El formulario debe ser claro que el reporte puede ser anónimo, y que si no lo es, el admin podrá contactarlo.

### 3.5 UI — Admin (panel de tickets)

Página: `/admin/tickets`

**Componentes:**

- **Header:** Filtros (estado, categoría, severidad, período), búsqueda por título/usuario, botón "Nuevo ticket de prueba" (para debug)
- **Lista:** Tabla con columns: ID, Título (truncado), Reporter (nombre/email o "anónimo"), Categoría, Severidad, Estado, Fecha creación, Última actividad, Acciones
- **Detalle (modal o página separada):** Título, descripción, categorize/severity, contexto (si reporta sobre alguien — mostrar nombre/email del related), adjuntos (imágenes renderizadas), historial de estado, notas internas del admin, mensajes de contacto enviados al reporter
- **Acciones:** Cambiar estado (dropdown), Agregar nota interna, Enviar mensaje al reporter (muestra email del reporter + botón de "enviar vía sistema"), Asignar a admin, Exportar ticket (JSON/copia)

**Generación de reportesResúmenes:**

- Pestaña "Reportes" en `/admin/tickets` o página separada `/admin/tickets/reports`
- Filtros por período (últimos 7 días, 30 días, personalizado)
- Métricas: total de tickets, por estado, por categoría, por severidad, tickets abiertos vs resueltos, promedio de resolución
- Botón "Exportar CSV" / "Copiar reporte" para externalizar

### 3.6 Notificaciones al reporter

Cuando el admin envía un mensaje de contacto o cambia el estado a "resolved", el sistema debe notificar al reporter. Opciones:

- **Opción simple (MVP):** Push notification vía Firebase Cloud Messaging (si el cliente tiene la app)
- **Opción media:** Email al reporter (si proporcionó email) vía Firebase Extensions o función cloud
- **Opción manual:** El admin copia el email del reporter y lo contacta fuera del sistema (no ideal pero funcional)

Para MVP, la opción más rápida es: el admin ve el email del reporter en el panel y puede contactarlo externamente, mientras que el estado del ticket se actualiza en la UI del usuario.

---

## 4. Desglose de Tareas para Implementación

### Fase 1: Esqueleto (P0 — funcionalidad mínima viable)

| Tarea | Descripción | Estimación |
|---|---|---|
| **T-1.1** Crear collection `support_tickets` en schema y reglas de seguridad | Definir modelo, agregar a FIRESTORE_SCHEMA.md, agregar reglas a firestore.rules | 1h |
| **T-1.2** Crear POST /api/support/tickets | API route Astro SSR con auth check + creación de documento | 1h |
| **T-1.3** Crear GET /api/support/tickets (admin list) | API route con query/filtros básicos | 1h |
| **T-1.4** Crear GET /api/support/tickets/{id} (detalle) | API route para detalle | 30min |
| **T-1.5** Crear PATCH /api/support/tickets/{id} (actualización admin) | API route para cambios de estado, notas, contacto | 1h |
| **T-1.6** Página de reporte `/client/support/report` | Formulario con validación + submit | 2h |
| **T-1.7** Página de lista de tickets del usuario `/client/support/my-tickets` | Ver propios tickets | 1.5h |
| **T-1.8** Panel de admin `/admin/tickets` | Tabla con filtros + vista de detalle | 3h |
| **T-1.9** Integración R2 para adjuntos en tickets | Reusar `r2Service.ts` para subir capturas | 1h |
| **T-1.10** i18n: keys de tickets/reporte en es/en/ca | Todas las strings necesarias | 1h |

### Fase 2: Mejoras (P1 — calidad y casos límite)

| Tarea | Descripción |
|---|---|
| **T-2.1** Generación de reportesResúmenes en admin | `/admin/tickets/reports` con métricas y export CSV |
| **T-2.2** Rate limiting básico por UID | Evitar spam de reportes |
| **T-2.3** Detección de tickets duplicados | Hash de title+description+reporterUid para sugerir dedup |
| **T-2.4** Notificaciones al reporter | Push/email cuando admin contacta o resuelve |
| **T-2.5** Búsqueda de usuario relacionado | Lookup por nombre/email en formulario de reporte |
| **T-2.6** Historial completo de cambios de estado | Cada cambio de estado queda en un array de `statusHistory` |

### Fase 3: Documentación y hardening (P2)

| Tarea | Descripción |
|---|---|
| **T-3.1** Actualizar FIRESTORE_SCHEMA.md con `support_tickets` | Documentar nueva colección |
| **T-3.2** Actualizar MATRIZ_FIRESTORE_QUERIES_Y_REGLAS.md | Agregar queries de tickets y reglas asociadas |
| **T-3.3** Actualizar DOCUMENTATION_MAP.md | Añadir referencia al sistema de tickets |
| **T-3.4** Pruebas unitarias para APIs de tickets | Tests para creación, filtrado, actualización |
| **T-3.5** Pruebas de reglas de seguridad | Verificar que admin puede leer todos, usuarios solo los suyos |

---

## 5. Dependencias y Puntos de Integración

### 5.1 Dependencias del sistema

- **Firebase Auth:** Ya existe. Usado para identificar al reporter y validar admin.
- **Firestore:** Ya existe. Nueva colección `support_tickets`.
- **R2:** Ya existe. Puede usarse para adjuntos de tickets (reutilizar `r2Service.ts`).
- **i18n:** Ya existe. Necesita nuevas keys.
- **UI components:** Ya existen (modal, select, textarea, toast). Reutilizables.

### 5.2 Puntos de integración existentes

- **Chat:** El sistema de chat existente (`messages`) podría extenderse para que los admins envíen mensajes de contacto a los reporters, pero es más limpio tener un sistema separado de notas de ticket.
- **Notifications:** El sistema de notificaciones existente (si lo hay) podría usarse para alertar al reporter.
- **Logging:** Los eventos de creación/resolución de tickets podrían loggerse en `app_logs` para auditoría.

### 5.3 Riesgos y consideraciones

- **Anonimato vs traceback:** Si el reporte es anónimo, el admin no puede contactar. Esto está bien para vulnerabilidades que quieren proteger al reporter.
- **Reporte de admin sobre admin:** Si un admin reporta a otro admin, el sistema debe permitirlo pero quizás con visibilidad restringida (solo superadmin ve). Esto requiere un rol "superadmin" o lógica especial.
- **Escalas:** El sistema no debe permitir que un admin cierre un ticket de vulnerabilidad crítica sin revisión de otro admin o superadmin.
- **Persistencia de adjuntos:** Los adjuntos subidos vía R2 deben permanecer accesibles mientras el ticket exista. Si el ticket se borra (si se permite), los adjuntos deberían purgarse o quedar huérfanos.

---

## 6. Lo que YA existe que podemos reutilizar

| Componente | Estado | Reutilizable para tickets |
|---|---|---|
| Firebase Auth | ✅ Funcional | Identidad del reporter y validación de admin |
| Firestore + reglas | ✅ Funcional | Nueva colección support_tickets |
| r2Service.ts | ✅ 80% funcional | Adjuntos de tickets (capturas de pantalla) |
| AdminLayout.astro | ✅ Funcional | Base para panel de tickets |
| ChatNotificationListener | ✅ Funcional | Posible base para notificar al reporter |
| showToast / showConfirm / showSelectModal | ✅ Funcionales | UI del formulario de reporte |
| Página /client/support existente | ✅ FAQ | Base para añadir formulario de reporte |
| API routes existentes | ✅ Patrones establecidos | Reusar patrones para nuevas rutas /api/support/* |
| i18n system | ✅ Funcional | Nuevas keys de tickets/reporte |

---

## 7. Decisión de Diseño: Anonimato

**Decisión:** El formulario de reporte tiene un toggle "Reportar anónimamente". Si está desactivado (por defecto), el sistema copia `reporterUid`, `reporterEmail`, `reporterName` del usuario autenticado. Si está activado, solo se guarda `reporterUid` (para dedup) pero el email/name no se copian — el admin ve "Reportante anónimo" y no puede contactar.

Esto da flexibilidad:
- Reportes de bugs → generalmente no anónimos (el admin puede preguntar más detalles)
- Reportes de vulnerabilidad → a menudo anónimos (el reporter quiere protección)
- Hechos indebidos → puede ser anónimo o no, según prefiera el reporter

---

## 8. Próximos Pasos

Esta auditoría documenta el **estado actual (ausencia total de sistema de tickets)** y diseña la arquitectura completa. El siguiente paso es:

1. **Decisión de scope:** ¿Empezamos con Fase 1 completa (MVP funcional) o priorizamos alguna tarea en particular?
2. **Registro en BACKLOG.md:** Las tareas T-1.1 a T-1.10 se agregan como P0/P1 en el backlog maestro.
3. **Implementación:** Se crea el esqueleto (colección + reglas + APIs + formulario + panel admin) en una sola fusión o en iteraciones.

¿Querés que registre las tareas en BACKLOG.md ahora, o priorizamos alguna parte específica del sistema antes de empezar a implementar?
