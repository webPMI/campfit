# 🗺️ Mapa de Documentación de CampFit

> **Punto de entrada central.** Si buscas "qué falta por hacer", ve a 👉
> **[docs/TASKS_MASTER.md](./TASKS_MASTER.md)** (lista maestra de tareas pendientes, única fuente de verdad).
>
> Este mapa está organizado por tema. Los archivos históricos viven en `docs/_archive/`
> y se listan al final para no entorpecer el día a día.

---

## 🎯 Tareas & Estado
- [docs/TASKS_MASTER.md](./TASKS_MASTER.md) — **Lista maestra de tareas pendientes** (P0–P4, estados verificables).
- [TASK.md](../TASK.md) — Registro de agentes activos e historial (índice ligero).
- [CHANGELOG.md](../CHANGELOG.md) — Registro de cambios del repositorio.

## 🏗️ Arquitectura & Contexto
- [CONTEXT.md](../CONTEXT.md) — Stack, mapa de rutas, convenciones.
- [AGENTS.md](../AGENTS.md) — Instrucciones y reglas de oro para agentes.
- [docs/AGENT_ROLES.md](./AGENT_ROLES.md) — Responsabilidades por rol.
- [docs/architecture/FIRESTORE_SCHEMA.md](./architecture/FIRESTORE_SCHEMA.md) — Esquema de datos Firestore.

## 🛡️ Seguridad & Reglas Críticas
- [docs/FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md](./FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md) — Funciones que NUNCA se eliminan.
- [docs/MATRIZ_FIRESTORE_QUERIES_Y_REGLAS.md](./MATRIZ_FIRESTORE_QUERIES_Y_REGLAS.md) — Matriz de consultas y reglas.
- [firestore.rules](../firestore.rules) — Reglas de seguridad (fuente).

## 🔍 Auditorías & Calidad
- [docs/AUDITORIA_UNIFICADA.md](./AUDITORIA_UNIFICADA.md) — Consolidado de hallazgos críticos.

## 🎨 UI & Diseño
- [docs/THEME.md](./THEME.md) — Sistema de temas y tokens.
- [docs/REFERENCIA_RAPIDA.md](./REFERENCIA_RAPIDA.md) — Guía rápida de componentes.
- [docs/UX_DESIGN_CALENDAR.md](./UX_DESIGN_CALENDAR.md) — Diseño UX de calendario.

## 📝 Logging & Observabilidad
- [docs/DESIGN_logging_firebase.md](./DESIGN_logging_firebase.md) — Diseño del sistema de logs.

## 🍱 Features
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
- Toda tarea nueva → `docs/TASKS_MASTER.md` (con `#` y estado).
- Todo agente → registro en `TASK.md`.
- Cambio fusionado → entrada en `CHANGELOG.md`.
