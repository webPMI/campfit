# Roadmap 02: Client Workout Hub (`/client/workouts`)

## 🎯 Objetivo General
Blindar la experiencia de ejecución de entrenamientos, tanto con entrenador asignado como en Modo Autonomía, con feedback en tiempo real, logging de series/RPE y correcciones de técnica en vídeo a Cloudflare R2.

---

## 📋 Lista de Tareas

### 🟢 Tarea 2.1: Modo Autonomía & Starter Workouts 3D/4D
- **Estado:** `[COMPLETADO]`
- **Descripción:** Implementar programas base (Full Body, Torso/Pierna, Movilidad) con guardado de progreso en Firestore y selección persistida.
- **Archivos:** `src/lib/client/starterWorkouts.ts`, `src/pages/client/workouts.astro`.

### 🟢 Tarea 2.2: Biblioteca de Técnica & Preferencias de Ejercicios
- **Estado:** `[COMPLETADO]`
- **Descripción:** Catálogo de ejercicios interactivo con filtros musculares, reproductor de vídeo y botones ⭐ Favorito / 🚫 Excluir.
- **Archivos:** `src/lib/client/exercisePreferencesService.ts`, `src/pages/client/workouts.astro`.

### 🟢 Tarea 2.3: Subida de Vídeos de Técnica a Cloudflare R2
- **Estado:** `[COMPLETADO]`
- **Descripción:** Grabación o subida de clips de ejecución con validación de peso (<=50MB) y guardado reactivo en Firestore.
- **Archivos:** `src/lib/storage/techniqueCorrectionService.ts`, `src/pages/client/workouts.astro`.
