# Roadmap 17: Trainer Dashboard Overview (`/trainer/dashboard`)

## 🎯 Objetivo General
Auditar el panel de control del entrenador: métricas globales de adherencia de sus alumnos, solicitudes de personalización pendientes y accesos directos a fichas de clientes.

---

## 📋 Lista de Tareas

### 🟢 Tarea 17.1: KPIs de Adherencia y Clientes Activos
- **Estado:** `[COMPLETADO]`
- **Descripción:** Visualización del total de alumnos asignados, entrenamientos completados en la semana y tasa de cumplimiento.
- **Archivos:** `src/pages/trainer/dashboard.astro`.

### 🟢 Tarea 17.2: Notificaciones de Propuestas Pendientes
- **Estado:** `[COMPLETADO]`
- **Descripción:** Alerta visual de cambios de rutina o dieta solicitados por los alumnos con enlace directo para aprobar o sugerir modificaciones.
- **Archivos:** `src/pages/trainer/dashboard.astro`, `src/lib/shared/planProposalService.ts`.
