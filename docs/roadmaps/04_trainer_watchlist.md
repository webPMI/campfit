# Roadmap 04: Trainer Watchlist & Oversight (`/trainer/*`)

## 🎯 Objetivo General
Optimizar el panel del entrenador para la supervisión ágil de adherencia de clientes, resolución de propuestas de personalización, revisión de vídeos de técnica y asignación fluida de planes.

---

## 📋 Lista de Tareas

### 🟢 Tarea 4.1: Asignación y Edición de Rutinas & Dietas
- **Estado:** `[COMPLETADO]`
- **Descripción:** Asegurar que los botones de asignación rápida y guardado de borradores funcionen sin errores de permisos en Firestore.
- **Archivos:** `src/pages/trainer/workouts.astro`, `src/pages/trainer/diets.astro`, `src/lib/trainer/types.ts`.

### 🟢 Tarea 4.2: Gestión de Exclusiones y Solicitudes de Alumnos
- **Estado:** `[COMPLETADO]`
- **Descripción:** Bandeja de revisión de ejercicios marcados como molestos/dolorosos con marcado como visto/atendido.
- **Archivos:** `src/lib/client/exercisePreferencesService.ts`, `src/pages/trainer/workouts.astro`.

### 🟢 Tarea 4.3: Revisión de Vídeos de Técnica y Feedback
- **Estado:** `[COMPLETADO]`
- **Descripción:** Visualización de clips R2 de alumnos con reproductor integrado y campo de feedback/corrección técnica.
- **Archivos:** `src/lib/storage/techniqueCorrectionService.ts`, `src/pages/trainer/workouts.astro`.
