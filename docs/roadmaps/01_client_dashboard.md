# Roadmap 01: Client Dashboard (`/client/dashboard`)

## 🎯 Objetivo General
Blindar y perfeccionar el Dashboard del Cliente para ofrecer una visión 360° instantánea de su día: adherencia a rutinas, estado nutricional, tracking de agua, peso y accesos rápidos de autonomía y contacto.

---

## 📋 Lista de Tareas

### 🟢 Tarea 1.1: Sincronización Reactiva de Starter Workouts en Dashboard
- **Estado:** `[COMPLETADO]`
- **Descripción:** Cuando el alumno no tiene entrenador asignado, el widget de rutina diaria en el Dashboard debe reflejar el Starter Workout activo (`starter-fullbody-3d`, `starter-torsopierna-4d` o `starter-movilidad-core`), permitiendo iniciar la sesión con 1 clic.
- **Archivos:** `src/pages/client/dashboard.astro`, `src/lib/client/starterWorkouts.ts`.

### 🟢 Tarea 1.2: Sincronización de Meta Nutricional & Macros en Dashboard
- **Estado:** `[COMPLETADO]`
- **Descripción:** Mostrar la meta calórica calculada por la Calculadora Metabólica si el alumno no tiene dieta asignada, manteniendo coherencia entre `/client/diets` y el Dashboard.
- **Archivos:** `src/pages/client/dashboard.astro`, `src/lib/client/metabolicCalculator.ts`.

### 🟢 Tarea 1.3: Quick Actions y Accesos Rápidos de Soporte & Chat
- **Estado:** `[COMPLETADO]`
- **Descripción:** Verificar que los accesos rápidos a Chat y Reportes de Soporte dirijan correctamente a `/client/support` y `/client/chat` sin pantallas vacías.
- **Archivos:** `src/pages/client/dashboard.astro`.

### 🟢 Tarea 1.4: Tests Unitarios & Validación de Rendimiento
- **Estado:** `[COMPLETADO]`
- **Descripción:** Validar que los cálculos de racha, hidratación y estado de carga no rompan `npm run type-check`, `npx vitest run` y `npm run build`.
- **Archivos:** `tests/unit/lib/client/clientInit.test.ts`.
