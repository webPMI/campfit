# Roadmap 13: Client Medical Profile (`/client/medical-profile`)

## 🎯 Objetivo General
Auditar la ficha clínica y de salud del alumno: historial de lesiones articulares, alergias, intolerancias alimentarias y sincronización con el semáforo médico del entrenador.

---

## 📋 Lista de Tareas

### 🟢 Tarea 13.1: Formulario Clínico de Lesiones & Molestias
- **Estado:** `[COMPLETADO]`
- **Descripción:** Registro detallado de zonas afectadas (hombro, rodilla, lumbar, muñeca) y nivel de limitación.
- **Archivos:** `src/pages/client/medical-profile.astro`, `src/lib/client/injuryChecker.ts`.

### 🟢 Tarea 13.2: Registro de Alergias & Intolerancias Alimentarias
- **Estado:** `[COMPLETADO]`
- **Descripción:** Selección de alérgenos comunes (gluten, lactosa, frutos secos, mariscos) que retroalimentan el motor de sustitución de recetas.
- **Archivos:** `src/pages/client/medical-profile.astro`.

### 🟢 Tarea 13.3: Guardado Seguro & Notificación al Entrenador
- **Estado:** `[COMPLETADO]`
- **Descripción:** Actualización en `users/{uid}.medicalProfile` y reflejo en el panel `/trainer/clinical`.
- **Archivos:** `src/pages/client/medical-profile.astro`.
