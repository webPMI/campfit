# Roadmap 09: Client Metabolic Calculator & Diets Hub (`/client/diets`)

## 🎯 Objetivo General
Auditar el hub de nutrición y calculadora metabólica interactiva, cálculo de gasto calórico diario (TDEE/BMR), distribución de macros y explorador de alimentos con alérgenos.

---

## 📋 Lista de Tareas

### 🟢 Tarea 9.1: Calculadora Metabólica Mifflin-St Jeor
- **Estado:** `[COMPLETADO]`
- **Descripción:** Cálculo científico reactivo de BMR, TDEE, distribución de macronutrientes (Proteínas, Carbos, Grasas) y agua recomendada.
- **Archivos:** `src/lib/client/metabolicCalculator.ts`, `src/pages/client/diets.astro`.

### 🟢 Tarea 9.2: Persistencia de Objetivos Nutricionales
- **Estado:** `[COMPLETADO]`
- **Descripción:** Guardado de parámetros y calorías objetivo en el perfil del usuario en Firestore.
- **Archivos:** `src/pages/client/diets.astro`, `src/lib/client/metabolicCalculator.ts`.

### 🟢 Tarea 9.3: Base de Datos de Alimentos & Filtros de Intolerancias
- **Estado:** `[COMPLETADO]`
- **Descripción:** Explorador con filtros por categoría de alimento y badges (vegano, sin gluten, sin lactosa).
- **Archivos:** `src/pages/client/diets.astro`, `src/lib/data/foodsCatalog.ts`.
