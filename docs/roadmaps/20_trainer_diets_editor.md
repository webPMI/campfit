# Roadmap 20: Trainer Diets Editor (`/trainer/diets`)

## 🎯 Objetivo General
Auditar el editor de planes nutricionales del entrenador: estructuración de comidas, cálculo de calorías y macros totales, comprobación de alérgenos/intolerancias y asignación.

---

## 📋 Lista de Tareas

### 🟢 Tarea 20.1: Constructor de Comidas & Alimentos
- **Estado:** `[COMPLETADO]`
- **Descripción:** Creación de tomas (desayuno, almuerzo, etc.) con selección de alimentos de `FOODS_CATALOG` y cálculo dinámico de macros.
- **Archivos:** `src/pages/trainer/diets.astro`, `src/lib/data/macroCalculations.ts`.

### 🟢 Tarea 20.2: Verificación de Conflictos Clínicos
- **Estado:** `[COMPLETADO]`
- **Descripción:** Detección automática de alimentos incompatibles con las alergias del cliente mediante `checkDietConflicts()`.
- **Archivos:** `src/pages/trainer/diets.astro`, `src/lib/client/intoleranceChecker.ts`.
