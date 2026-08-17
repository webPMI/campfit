# 📋 Registro de Actualizaciones a la Documentación

> **Propósito:** Registrar de forma compacta cada mejora estructural, de consolidación o depuración
> aplicada a la documentación del proyecto por Documentator Agent.

## 2026-08-17 — Camino a la Calidad Pro (v2.5.0)

- **Observabilidad & Trazabilidad**: Integración de logging remoto en `app_logs` con `logService.ts` (`sessionId`, `userId`, `url`, `stack_trace`, rate limiting y deduplicación inteligente).
- **Cruce Médico de Lesiones**: Módulo `src/lib/client/injuryChecker.ts` con advertencias automáticas en `/client/workouts`.
- **Suite de Pruebas Crítica**: Nuevos tests en `macroCalculations.test.ts`, `trainerAssignment.test.ts` y `injuryChecker.test.ts` (185/185 tests aprobados).
- **Escalabilidad & Paginación**: Paginación de 20 items/página en `/admin/users.astro` y verificación de `firestore.indexes.json`.
- **Changelog**: Actualizado `docs/CHANGELOG.md` con la versión 2.5.0.

---

## 2026-08-16 — Sistema de Tickets de Soporte (Fase 1: Esqueleto)

- **T-1.1 completado:** Colección `support_tickets` creada en `firestore.rules` (reglas de seguridad: solo autenticados pueden crear, solo reporter y admins leen, solo admins actualizan, sin borrado físico) y documentada en `docs/architecture/FIRESTORE_SCHEMA.md`.
- **T-1.2 completado:** API `POST /api/support/tickets` creada (`src/pages/api/support/tickets.ts`) — cualquier usuario autenticado puede reportar, con validación de título/descripción/categoría/severidad, soporte para anonimato opcional, hash de deduplicación.
- **T-1.3 completado:** API `GET /api/support/tickets` (listado admin) integrada en mismo archivo — filtros por status/category/severity/search, paginación cursor-based, solo accesible por admins.
- **Backend listo para T-1.6 (formulario cliente) y T-1.8 (panel admin).**

### Archivos modificados/creados:
- `src/pages/api/support/tickets.ts` — nuevo (POST + GET)
- `docs/architecture/FIRESTORE_SCHEMA.md` — actualizado (colección support_tickets documentada)
- `firestore.rules` — actualizado (reglas de support_tickets)
- `docs/BACKLOG.md` — actualizado (T-1.1, T-1.2, T-1.3 marcados como ✅)

## 2026-08-16 — Sistema de Tickets: T-1.6 y T-1.7 completados

- **T-1.6 completado (Página de reporte):** `src/pages/client/support/report.astro` creada — formulario completo con título, descripción, categoría, severidad, optional relatedEmail, toggle de anonimato, validación client-side, submit a POST /api/support/create, mensaje de éxito con redirección a /my-tickets.
- **T-1.7 completado (Mis tickets):** `src/pages/client/support/my-tickets.astro` creada — lista de tickets del usuario autenticado con GET /api/support/create?statusFilter=..., detalle expandible por ticket, navegación a /report para crear nuevo.
- **APIs clave:** create.ts (POST + GET listado), update.ts (PATCH con 5 acciones: status_change, add_note, contact, assign, resolve).
- **Notas:** El test de translations falla por falta de keys report.* en translations.ts — eso se corrige en T-1.10 (i18n). El build y el resto de tests están verdes (749/754, 1 falla de i18n conocida).
