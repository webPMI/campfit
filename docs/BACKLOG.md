# 📝 BACKLOG MAESTRO - CampFit

> **Fuente Única de Verdad de tareas pendientes del proyecto.**
> Estado del proyecto actualizado: 2026-08-19.
> Tests: 768 passed / 4 skipped · Type-Check: 0 errores · Build: 43 páginas · Deploy: live ✅
>
> **Regla de oro:** Todo cambio en esta lista debe ser registrado en `docs/DOCUMENTATION_UPDATE_LOG.md`.
> Tareas completadas → marcar ✅ y registrar. Tareas nuevas → añadir aquí.

---

## 🔴 P0 — Seguridad y Estabilidad (bloquean nuevas funcionalidades)

- [x] **Admin UX: Unificar vista de usuarios y clientes** — `/admin/clients` redirige a `/admin/users`, chips de estado, filtros, contadores y modal de planes. ✅ 2026-08-16 (commit `e9a1654`)
- [x] **Admin UX: Radar Visual de estado en lista de usuarios** — entrenador asignado, rutinas, dietas, perfil médico, estado de cuenta. ✅ 2026-08-16
- [x] **System logging: Fase 2 completa** — panel `/admin/logs`, APIs admin/ia, token rotativo IA, i18n paridad, firestore.rules tokens. ✅ 2026-08-15 (commit `518ea15`)
- [x] **Soporte: Sistema de Tickets & Reportes — Auditoría completa** — Documentación del estado actual, arquitectura propuesta, desglose de tareas en 3 fases, decisión de anonimato, casos límite. ✅ 2026-08-16 (`docs/_audit/SUPPORT_TICKET_SYSTEM.md`)
- [x] **SEC-001/002/003**: Verificar que `routeGuards.ts` cubre todas las rutas nuevas (calendario, soporte, clinical, devtools). ✅ 2026-08-19
- [x] **P0-1**: `firestore.rules` — `isStaff()` y `isTrainer()` verifican ownership entrenadores sobre dietas/rutinas. ✅ 2026-08-19
- [x] **P0-3**: `registerMealComplete(clientId, ...)` en `client/diets.astro` — usa `clientId` correcto. ✅ 2026-08-19
- [x] **P0-4**: Revisar `templateService.ts` por corrupción de caracteres — archivo limpio con `isClientAssignedToTrainer()`. ✅ 2026-08-19
- [x] **P0-5**: Tipado y estabilidad en Auth / Rutinas — corrección de template literals y tipado estricto en `authService.ts` y `workouts.astro`. ✅ 2026-08-19

---

## 🟡 P1 — Rendimiento y Calidad de Código

- [ ] **Refactorización archivos > 300 líneas**: `admin/users.astro`, `admin/diets.astro`, `devtools/seedData.ts`.
- [ ] **Manejo de memoria**: Revisar `onSnapshot` sin `unsubscribe` en servicios secundarios tras auditorías recientes.
- [x] **Paridad i18n**: Completar claves faltantes en `ca.ts`, `en.ts` y `es.ts` (tickets, reportes, rutinas, admin). ✅ 2026-08-19
- [ ] **Tipado estricto**: Eliminar `any` restantes en `src/types/index.ts`.

---

## 🔵 P2 — Funcionalidad (R2 y calendario)

- [ ] **Cloudflare R2 — endpoint POST /api/upload** — crear API route que genere presigned URL para subida de fotos de evolución y chat media. Ver tarea R2 detallada abajo.
- [ ] **Cloudflare R2 — r2Service.ts con fetch real** — actualizar para usar PUBLIC_R2_UPLOAD_URL cuando esté configurado.
- [ ] **Cloudflare R2 — Workers fallback** — si no hay Worker, fallback a Firebase Storage o local preview.
- [ ] **Calendario**: Componentes atómicos `TimeGrid`, `MealBlock`, `WorkoutBlock`, `TimePicker`.
- [ ] **Calendario**: Lógica de actualización optimista en `dailyScheduleStore`.
- [ ] **Calendario**: Página `/client/calendar` con integración datos en tiempo real.
- [ ] **Calendario**: Visualización "Bloques Huérfanos" sin hora asignada.

---

## 🟢 P3 — Mejoras y Documentación

- [ ] **Documentación**: Mantener `docs/BACKLOG.md` como única fuente de tareas.
- [ ] **Documentación**: Actualizar `docs/DOCUMENTATION_UPDATE_LOG.md` con cada cambio fusión/reestructuración.
- [ ] **Documentación**: Documentar Cloudflare R2 en `docs/CLOUDFLARE_R2.md` (fuente viva) cuando el endpoint esté listo.
- [ ] **Accesibilidad**: Auditoría WCAG 2.1 AA en calendario (cuando esté implementado).

---

## 📦 Sistema de Soporte & Tickets — Fases de Implementación

> **Auditoría completa en:** `docs/_audit/SUPPORT_TICKET_SYSTEM.md`
> **Decisión de diseño:** Anonimato opcional (toggle en formulario). Admin puede contactar solo si el reporter no es anónimo. Tickets nunca se borran físicamente (solo cambian de estado).
> **Colección propuesta:** `support_tickets/{ticketId}` con campos: reporterUid, title, description, category, severity, relatedUserId/entity, attachments (R2), status, adminNotes, adminContactMessages, timestamps, reportHash (dedup).
> **APIs:** POST /api/support/tickets, GET /api/support/tickets (admin list), GET /api/support/tickets/{id}, PATCH /api/support/tickets/{id}, GET /api/support/reports/overview.

### 🔴 Fase 1: Esqueleto (P0 — funcionalidad mínima viable)

- [x] **T-1.1** Crear collection `support_tickets` en schema y reglas de seguridad — Definir modelo, agregar a FIRESTORE_SCHEMA.md, agregar reglas a firestore.rules. ✅ 2026-08-16 (commit `ca2296b`)
- [x] **T-1.2** Crear POST /api/support/tickets — API route Astro SSR con auth check + creación de documento. ✅ 2026-08-16 (commit `5b31c4f` + T-1.3 integrado)
- [x] **T-1.3** Crear GET /api/support/tickets (admin list) — API route con query/filtros básicos. ✅ 2026-08-16 (integrado en same file como T-1.2)
- [x] **T-1.4** Crear GET /api/support/tickets/{id} (detalle) — API route para detalle + permisos de lectura. ✅ 2026-08-16 (integrado en same file)
- [x] **T-1.5** Crear PATCH /api/support/tickets/{id} (actualización admin) — API route para cambios de estado, notas, contacto. ✅ 2026-08-16 (archivo update.ts con 5 acciones)
- [x] **T-1.6** Página de reporte `/client/support/report` — Formulario con validación + submit. ✅ 2026-08-16 (report.astro, submit a POST /api/support/create)
- [x] **T-1.7** Página de lista de tickets del usuario `/client/support/my-tickets` — Ver propios tickets. ✅ 2026-08-16 (my-tickets.astro, lista + filtros + detalle expandible)
- [ ] **T-1.8** Panel de admin `/admin/tickets` — Tabla con filtros + vista de detalle. (3h)
- [ ] **T-1.9** Integración R2 para adjuntos en tickets — Reusar `r2Service.ts` para subir capturas. (1h)
- [x] **T-1.10** i18n: keys de tickets/reporte en es/en/ca — Todas las strings añadidas y sincronizadas. ✅ 2026-08-19

### 🟡 Fase 2: Mejoras (P1 — calidad y casos límite)

- [ ] **T-2.1** Generación de reportesResúmenes en admin — `/admin/tickets/reports` con métricas y export CSV.
- [ ] **T-2.2** Rate limiting básico por UID — Evitar spam de reportes.
- [ ] **T-2.3** Detección de tickets duplicados — Hash de title+description+reporterUid para sugerir dedup.
- [ ] **T-2.4** Notificaciones al reporter — Push/email cuando admin contacta o resuelve.
- [ ] **T-2.5** Búsqueda de usuario relacionado — Lookup por nombre/email en formulario de reporte.
- [ ] **T-2.6** Historial completo de cambios de estado — Cada cambio de estado queda en un array de `statusHistory`.

### 🔵 Fase 3: Documentación y hardening (P2)

- [ ] **T-3.1** Actualizar FIRESTORE_SCHEMA.md con `support_tickets` — Documentar nueva colección.
- [ ] **T-3.2** Actualizar MATRIZ_FIRESTORE_QUERIES_Y_REGLAS.md — Agregar queries de tickets y reglas asociadas.
- [ ] **T-3.3** Actualizar DOCUMENTATION_MAP.md — Añadir referencia al sistema de tickets.
- [ ] **T-3.4** Pruebas unitarias para APIs de tickets — Tests para creación, filtrado, actualización.
- [ ] **T-3.5** Pruebas de reglas de seguridad — Verificar que admin puede leer todos, usuarios solo los suyos.

---

## 📦 TAREAS R2 — Cloudflare R2 Object Storage (detalle)

> Estado actual: **r2Service.ts 80% implementado** (upload functions con fallback local),
> 2 páginas de chat lo usan, progressService registra 'cloudflare_r2' como storageProvider,
> `.env.example` lo marca "pendiente de configurar".
> **Falta:** endpoint POST /api/upload (presigned URL), Worker de Cloudflare, env vars reales.

### R2-1: Endpoint POST /api/upload (presigned URL)

```
POST /api/upload
Body: { type: 'progress' | 'chat', clientId?: string, filename: string, contentType: string }
Response: { uploadUrl: string, key: string, publicUrl: string }
```

- Genera presigned URL para R2 (PUT directo o POST a Worker)
- Si R2 no está configurado, fallback a Firebase Storage
- Rate limit básico + auth check (usuario autenticado)

### R2-2: r2Service.ts actualizado

- `uploadProgressPhotoToR2` y `uploadChatMedia` ya existen con fallback local
- Actualizar para usar `PUBLIC_R2_UPLOAD_URL` si configurado, haciendo fetch POST a /api/upload
- Si no configurado, fallback a local preview (actual comportamiento)

### R2-3: Cloudflare Worker (opcional, si no hay API route)

- Worker `campfit-upload-worker` que recibe multipart, guarda en bucket R2 `campfit-progress-photos`
- Devuelve `{ url: string, key: string }`
- Configuración: `bucketName`, `accountHash`, `customDomain: cdn.campfit.app`

### R2-4: Documentación

- `docs/CLOUDFLARE_R2.md` — fuente viva de configuración R2 (bucket, Workers, env vars, flujo)
- Archivar `docs/_archive/CLOUDFLARE_R2_PROGRESS_PHOTOS.md` (diseño anterior, desactualizado)

### R2-5: Env vars necesarios

```
PUBLIC_R2_UPLOAD_URL=https://worker.campfit.app/api/upload  (o endpoint API route)
# O si se usa directamente R2 API sin Worker:
# R2_ACCOUNT_HASH=...
# R2_BUCKET_NAME=campfit-progress-photos
```

### R2-6: Verificación

- [ ] Tests unitarios para `/api/upload` con mock de R2
- [ ] Test E2E de subida de foto de progreso (cuando R2 esté configurado)
- [ ] Verificar que `cdn.campfit.app` (o custom domain) sirve las imágenes

---

## 📌 Cómo actualizar este archivo

1. **Tarea completada:** Marcar `- [ ]` → `- [x]` y añadir fecha + commit hash en el comentario.
2. **Tarea nueva:** Añadir al nivel de prioridad correcto con descripción clara.
3. **Tarea obsoleta:** Eliminar o marcar como cancelada con motivo.

> **Regla:** Este archivo es la SOLA fuente de tareas. No duplicar en otros md.
