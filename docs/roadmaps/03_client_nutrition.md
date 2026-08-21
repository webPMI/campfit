# Roadmap 03: Client Nutrition Hub (`/client/diets`)

## 🎯 Objetivo General
Proveer una experiencia de nutrición integral para el alumno, permitiendo tracking de adherencia por comida, sustitución inteligente por intolerancias/alérgenos y cálculo metabólico autónomo.

---

## 📋 Lista de Tareas

### 🟢 Tarea 3.1: Calculadora Metabólica Mifflin-St Jeor & Macros
- **Estado:** `[COMPLETADO]`
- **Descripción:** Cálculo de BMR, TDEE, distribución de macronutrientes (Proteínas, Carbohidratos, Grasas) y recomendación hídrica interactiva con guardado en perfil.
- **Archivos:** `src/lib/client/metabolicCalculator.ts`, `src/pages/client/diets.astro`.

### 🟢 Tarea 3.2: Explorador de Alimentos & Alérgenos
- **Estado:** `[COMPLETADO]`
- **Descripción:** Búsqueda en catálogo de alimentos con filtros por categoría y badges de intolerancias (vegano, sin gluten, sin lactosa).
- **Archivos:** `src/pages/client/diets.astro`, `src/lib/data/foodsCatalog.ts`.

### 🟢 Tarea 3.3: Sustituciones Inteligentes de Comidas
- **Estado:** `[COMPLETADO]`
- **Descripción:** Motor de recomendación de alternativas equivalentes en macronutrientes respetando restricciones médicas del alumno.
- **Archivos:** `src/lib/client/intoleranceChecker.ts`, `src/pages/client/diets.astro`.
