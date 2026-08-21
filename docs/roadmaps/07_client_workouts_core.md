# Roadmap 07: Client Workouts Core Execution (`/client/workouts`)

## 🎯 Objetivo General
Auditar la ejecución en vivo de los entrenamientos del alumno, asegurando el logging de series, repeticiones efectivas, RPE, notas técnicas por ejercicio y persistencia en Firestore `completedWorkouts`.

---

## 📋 Lista de Tareas

### 🟢 Tarea 7.1: Selector de Días de la Semana (Tabs 1-7)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Navegación por los días programados de la semana mostrando ejercicios asignados o estado de día de descanso.
- **Archivos:** `src/pages/client/workouts.astro`.

### 🟢 Tarea 7.2: Logging de Series, Reps & RPE por Ejercicio
- **Estado:** `[COMPLETADO]`
- **Descripción:** Tabla interactiva para registrar peso levantado, repeticiones completadas y RPE (esfuerzo percibido 1-10).
- **Archivos:** `src/pages/client/workouts.astro`, `src/lib/trainer/types.ts`.

### 🟢 Tarea 7.3: Finalización de Sesión & Resumen de Métricas
- **Estado:** `[COMPLETADO]`
- **Descripción:** Botón de completar entrenamiento que guarda la sesión en Firestore y actualiza el contador de adherencia del cliente.
- **Archivos:** `src/pages/client/workouts.astro`, `src/lib/client/workoutService.ts`.
