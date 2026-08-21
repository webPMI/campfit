# Roadmap 08: Client Starter Workouts & Autonomy Hub (`/client/workouts`)

## 🎯 Objetivo General
Auditar el Hub de Autonomía para alumnos sin coach asignado, incluyendo los 3 programas de inicio, explorador interactivo de técnica con vídeos y sistema de preferencias (⭐ Favoritos / 🚫 Exclusiones).

---

## 📋 Lista de Tareas

### 🟢 Tarea 8.1: Programas Base de Inicio (Full Body, Torso/Pierna, Movilidad)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Activación y ejecución autónoma de las 3 rutinas canónicas predeterminadas.
- **Archivos:** `src/lib/client/starterWorkouts.ts`, `src/pages/client/workouts.astro`.

### 🟢 Tarea 8.2: Explorador de Técnica & Filtros Musculares
- **Estado:** `[COMPLETADO]`
- **Descripción:** Búsqueda en tiempo real por grupo muscular y reproductor modal de técnica.
- **Archivos:** `src/pages/client/workouts.astro`, `src/lib/data/exercisesCatalog.ts`.

### 🟢 Tarea 8.3: Marcado de Favoritos & Solicitudes de Exclusión
- **Estado:** `[COMPLETADO]`
- **Descripción:** Sincronización de preferencias en Firestore `user_exercise_prefs/{uid}` para uso por futuros entrenadores.
- **Archivos:** `src/lib/client/exercisePreferencesService.ts`, `src/pages/client/workouts.astro`.
