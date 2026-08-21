# Roadmap 19: Trainer Workouts Editor (`/trainer/workouts`)

## 🎯 Objetivo General
Auditar el creador y editor de rutinas para entrenadores: asignación de ejercicios, series, repeticiones, descansos, soporte de plantillas y publicación fluida a los clientes.

---

## 📋 Lista de Tareas

### 🟢 Tarea 19.1: Selector de Cliente & Carga de Rutinas
- **Estado:** `[COMPLETADO]`
- **Descripción:** Dropdown de alumnos del coach con carga reactiva de la rutina activa y borradores.
- **Archivos:** `src/pages/trainer/workouts.astro`.

### 🟢 Tarea 19.2: Constructor de Ejercicios por Día (1-7)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Añadir ejercicios desde el catálogo (`EXERCISES_CATALOG`), configurar series, reps objetivo, descanso (segundos) y notas técnicas.
- **Archivos:** `src/pages/trainer/workouts.astro`, `src/lib/trainer/types.ts`.

### 🟢 Tarea 19.3: Bandeja de Solicitudes de Exclusión de Alumnos
- **Estado:** `[COMPLETADO]`
- **Descripción:** Banner interactivo que lista los ejercicios que el alumno ha pedido no realizar por dolor o lesión, con botón para marcar como revisado.
- **Archivos:** `src/pages/trainer/workouts.astro`, `src/lib/client/exercisePreferencesService.ts`.
