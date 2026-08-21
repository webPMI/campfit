# Roadmap 15: Client Support Hub & Tickets (`/client/support/*`)

## 🎯 Objetivo General
Auditar el centro de ayuda, reporte de incidencias/solicitudes de coach y seguimiento del estado de tickets del cliente sin depender de asignación previa de entrenador.

---

## 📋 Lista de Tareas

### 🟢 Tarea 15.1: Centro de Soporte (`/client/support`)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Hub con opciones claras para contactar al entrenador, reportar un problema técnico o consultar FAQs.
- **Archivos:** `src/pages/client/support.astro`.

### 🟢 Tarea 15.2: Creación de Tickets (`/client/support/report`)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Formulario reactivo para registrar tickets en Firestore con título, categoría, descripción y severidad.
- **Archivos:** `src/pages/client/support/report.astro`, `src/lib/support/supportTicketService.ts`.

### 🟢 Tarea 15.3: Seguimiento de Mis Tickets (`/client/support/my-tickets`)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Bandeja personal con estados (abierto, en progreso, resuelto, cerrado) y respuestas del staff.
- **Archivos:** `src/pages/client/support/my-tickets.astro`.
