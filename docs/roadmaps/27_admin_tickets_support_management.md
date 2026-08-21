# Roadmap 27: Admin Support Tickets (`/admin/tickets`)

## 🎯 Objetivo General
Auditar la bandeja de gestión de tickets de soporte y solicitudes de clientes para administradores: filtrado por estado, asignación de responsable, notas internas y respuesta directa.

---

## 📋 Lista de Tareas

### 🟢 Tarea 27.1: Bandeja de Tickets Reactiva
- **Estado:** `[COMPLETADO]`
- **Descripción:** Suscripción en tiempo real a tickets de soporte con filtros por estado (`open`, `in_progress`, `resolved`, `closed`).
- **Archivos:** `src/pages/admin/tickets.astro`, `src/lib/support/supportTicketService.ts`.

### 🟢 Tarea 27.2: Modales de Gestión Sin Diálogos Nativos
- **Estado:** `[COMPLETADO]`
- **Descripción:** Modales estilizados para añadir notas internas o contactar al usuario sin utilizar `prompt()` ni `alert()`.
- **Archivos:** `src/pages/admin/tickets.astro`.
