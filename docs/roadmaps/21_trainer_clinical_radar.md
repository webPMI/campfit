# Roadmap 21: Trainer Clinical Radar (`/trainer/clinical`)

## 🎯 Objetivo General
Auditar el radar clínico y de seguridad médica del entrenador: semáforo de riesgo por cliente, lista de lesiones articulares activas y avisos de contraindicaciones.

---

## 📋 Lista de Tareas

### 🟢 Tarea 21.1: Semáforo Clínico de Clientes (Verde / Amarillo / Rojo)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Clasificación automática de alumnos según la presencia de lesiones activas o restricciones alimentarias severas.
- **Archivos:** `src/pages/trainer/clinical.astro`.

### 🟢 Tarea 21.2: Detalle Clínico por Alumno & Sugerencias
- **Estado:** `[COMPLETADO]`
- **Descripción:** Visualización de lesiones y ejercicios contraindicados recomendados por el motor de biomecánica.
- **Archivos:** `src/pages/trainer/clinical.astro`, `src/lib/client/injuryChecker.ts`.
