# Roadmap 10: Client Diet Tracking & Food Substitutes (`/client/diets`)

## 🎯 Objetivo General
Auditar el registro de comidas consumidas para cálculo de adherencia nutricional, desglose de macronutrientes consumidos vs objetivo y sugerencia inteligente de sustitutos de alimentos.

---

## 📋 Lista de Tareas

### 🟢 Tarea 10.1: Marcado de Comidas Completadas & Adherencia
- **Estado:** `[COMPLETADO]`
- **Descripción:** Botón de check en cada ingesta (Desayuno, Almuerzo, Merienda, Cena) con actualización de barra de adherencia.
- **Archivos:** `src/pages/client/diets.astro`, `src/lib/client/dietService.ts`.

### 🟢 Tarea 10.2: Motor de Sustitución Inteligente de Alimentos
- **Estado:** `[COMPLETADO]`
- **Descripción:** Modal de sustitutos equivalentes en macronutrientes adaptado al perfil médico del alumno.
- **Archivos:** `src/lib/client/intoleranceChecker.ts`, `src/pages/client/diets.astro`.

### 🟢 Tarea 10.3: Histórico de Dietas Previas
- **Estado:** `[COMPLETADO]`
- **Descripción:** Consulta del historial de planes nutricionales asignados con fechas y totales calóricos.
- **Archivos:** `src/pages/client/diets.astro`, `src/lib/client/dietService.ts`.
