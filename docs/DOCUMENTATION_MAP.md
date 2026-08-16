# 🗺️ Mapa de Documentación de CampFit

> **Punto de entrada central.** Si buscas "qué falta por hacer", ve a 👉
> **[docs/BACKLOG.md](./BACKLOG.md)** (lista maestra de tareas pendientes, única fuente de verdad).
>
> Este mapa está organizado por tema. Los archivos históricos viven en `docs/_archive/`
> y se listan al final para no entorpecer el día a día.

---

## 🎯 Tareas & Estado
- [docs/BACKLOG.md](./BACKLOG.md) — **Lista maestra de tareas pendientes** (formato checkbox P0–P3, con detalle).
- [TASK.md](../TASK.md) — Registro de agentes activos e historial (índice ligero).
- [CHANGELOG.md](../CHANGELOG.md) — Registro de cambios del repositorio (tanto código como documentación).

## 🏗️ Arquitectura & Contexto
- [CONTEXT.md](../CONTEXT.md) — Stack, mapa de rutas, convenciones.
- [AGENTS.md](../AGENTS.md) — Instrucciones y reglas de oro para agentes.
- [docs/AGENT_ROLES.md](./AGENT_ROLES.md) — Responsabilidades por rol.
- [docs/architecture/FIRESTORE_SCHEMA.md](./architecture/FIRESTORE_SCHEMA.md) — Esquema de datos Firestore.

## 🛡️ Seguridad & Reglas Críticas
- [docs/FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md](./FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md) — Funciones que NUNCA se eliminan.
- [docs/MATRIZ_FIRESTORE_QUERIES_Y_REGLAS.md](./MATRIZ_FIRESTORE_QUERIES_Y_REGLAS.md) — Matriz de consultas y reglas.
- [firestore.rules](../firestore.rules) — Reglas de seguridad (fuente).

## ☁️ Cloudflare R2 (Object Storage)
- **[docs/CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md)** — Estado de la integración: arquitectura, qué existe y funciona, flujo de subida, testing, limitaciones, alternativas futuras.

## 📞 Sistema de Soporte & Tickets
- **[docs/_audit/SUPPORT_TICKET_SYSTEM.md](./_audit/SUPPORT_TICKET_SYSTEM.md)** — Auditoría completa: estado actual, requisitos, arquitectura propuesta (colección `support_tickets`, APIs, UI cliente + admin), desglose por fases (P0/P1/P2), decisión de anonimato, casos límite, integraciones y riesgos.

## 📝 Logging & Observabilidad
- [docs/DESIGN_logging_firebase.md](./DESIGN_logging_firebase.md) — Diseño del sistema de logs.

## 🎨 UI & Diseño
- [docs/THEME.md](./THEME.md) — Sistema de temas y tokens.
- [docs/REFERENCIA_RAPIDA.md](./REFERENCIA_RAPIDA.md) — Guía rápida de componentes.
- [docs/UX_DESIGN_CALENDAR.md](./UX_DESIGN_CALENDAR.md) — Diseño UX de calendario.

## 📝 Features
- [docs/features/BIBLIOTECA_ALIMENTOS.md](./features/BIBLIOTECA_ALIMENTOS.md)
- [docs/features/BIBLIOTECA_EJERCICIOS.md](./features/BIBLIOTECA_EJERCICIOS.md)
- [docs/features/CALENDAR_IMPLEMENTATION.md](./features/CALENDAR_IMPLEMENTATION.md)
- [docs/features/CHAT_MULTIMEDIA_NOTIFICACIONES.md](./features/CHAT_MULTIMEDIA_NOTIFICACIONES.md)
- [docs/features/DISENO_LISTA_COMIDAS_MULTILENGUAJE.md](./features/DISENO_LISTA_COMIDAS_MULTILENGUAJE.md)

## 📦 Archivos Históricos (`docs/_archive/`)
> Solo consulta de contexto. No editar. Más de 40 auditorías previas
> (`AUDITORIA_*.md`, `TODO*.md`, `MASTER.md`, etc.) residen allí.

---

## 🔧 Mantenimiento
- Toda tarea nueva → `docs/BACKLOG.md` (checkboxes, P0–P3).
- Cambio en documentación o código → entrada en `CHANGELOG.md`.
