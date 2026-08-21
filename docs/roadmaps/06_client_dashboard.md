# Roadmap 06: Client Dashboard (`/client/dashboard`)

## 🎯 Objetivo General
Auditar y blindar el panel principal del cliente, presentando métricas de racha diaria, widget de hidratación interactiva, progreso de la rutina de hoy y accesos rápidos a agenda y soporte.

---

## 📋 Lista de Tareas

### 🟢 Tarea 6.1: Widget de Racha Diaria & Saludo
- **Estado:** `[COMPLETADO]`
- **Descripción:** Saludo personalizado según hora del día y cálculo dinámico de días consecutivos de actividad (`streak`).
- **Archivos:** `src/pages/client/dashboard.astro`.

### 🟢 Tarea 6.2: Tracker Interactivo de Hidratación (+250ml)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Botón rápido para registrar ingesta de agua con barra de llenado en tiempo real y sincronización en `localStorage`.
- **Archivos:** `src/pages/client/dashboard.astro`.

### 🟢 Tarea 6.3: Widget de Rutina de Hoy & Adherencia
- **Estado:** `[COMPLETADO]`
- **Descripción:** Indicador del entrenamiento programado para el día o rutina base activa en Modo Autonomía.
- **Archivos:** `src/pages/client/dashboard.astro`, `src/lib/client/workoutService.ts`.
