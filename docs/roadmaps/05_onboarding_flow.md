# Roadmap 05: Onboarding & Medical Profile (`/onboarding`, `/client/medical-profile`)

## 🎯 Objetivo General
Garantizar que el flujo de registro inicial de datos antropométricos, metas de salud y perfil médico se complete sin fricciones, dejando al alumno listo para entrenar y registrar progresos desde el minuto 1.

---

## 📋 Lista de Tareas

### 🟢 Tarea 5.1: Flujo de Onboarding Inicial
- **Estado:** `[COMPLETADO]`
- **Descripción:** Captura de datos básicos (peso, altura, objetivo deportivo, nivel de actividad) y redirección al dashboard o selección de rutina base.
- **Archivos:** `src/pages/onboarding/index.astro`, `src/pages/api/onboarding.ts`.

### 🟢 Tarea 5.2: Perfil Médico & Restricciones
- **Estado:** `[COMPLETADO]`
- **Descripción:** Registro detallado de alergias, intolerancias alimentarias y lesiones articulares para auto-filtrado de ejercicios y recetas.
- **Archivos:** `src/pages/client/medical-profile.astro`, `src/lib/client/injuryChecker.ts`.
