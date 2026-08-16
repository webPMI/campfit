# 📋 Registro de Actualizaciones a la Documentación

> **Propósito:** Registrar de forma compacta cada mejora estructural, de consolidación o depuración
> aplicada a la documentación del proyecto por Documentator Agent.

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
