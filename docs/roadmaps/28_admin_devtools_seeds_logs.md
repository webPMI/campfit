# Roadmap 28: Admin DevTools, Seeds & Logs (`/admin/devtools`, `/admin/seeds`, `/admin/logs`)

## 🎯 Objetivo General
Auditar el panel de herramientas para desarrolladores: visor de logs de auditoría estructurados, sembrado seguro de datos iniciales en Firestore y diagnóstico de salud.

---

## 📋 Lista de Tareas

### 🟢 Tarea 28.1: Visor de Logs del Sistema (`/admin/logs`)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Visualizador de eventos de seguridad, errores y operaciones críticas con filtros por severidad.
- **Archivos:** `src/pages/admin/logs.astro`, `src/lib/shared/logService.ts`.

### 🟢 Tarea 28.2: DevTools & Seeding de Base de Datos (`/admin/seeds`)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Gestor de migración y siembra de catálogo de ejercicios, alimentos y usuarios de prueba.
- **Archivos:** `src/pages/admin/seeds.astro`, `src/lib/devtools/seedManager.ts`.
