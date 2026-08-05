# ⚡ CampFit — Referencia Rápida Técnica (Cheatsheet)

> **Resumen Técnico Operativo**  
> **Última actualización:** 2026-08-05

---

## 🛠️ Comandos de Desarrollo

```bash
# Servidor de desarrollo
npm run dev                  # Servidor local Astro
astro dev --background       # Modo background para agentes

# Verificación y Calidad
npm run type-check           # Verificación estricta de TypeScript
npm test                     # Tests unitarios con Vitest
npm run test:e2e             # Tests de integración E2E con Playwright
bash scripts/validate.sh     # Validación completa pré-commit (TS + Lint + Tests + Build)

# Scripts de Datos (Seeders)
node scripts/seed-foods.mjs      # Poblado inicial de foods_library (80 alimentos)
node scripts/seed-exercises.mjs  # Poblado inicial de exercises_library (70 ejercicios)
```

---

## 🗄️ Colecciones Firestore y Módulos

| Colección | Modulo / Helper | Propósito | Permisos Lectura | Permisos Escritura |
|-----------|------------------|-----------|------------------|-------------------|
| `users` | `authService.ts`, `adminUsers.ts` | Usuarios y roles | Dueño / Trainer / Admin | Dueño (sin rol) / Admin |
| `workouts` | `workoutService.ts`, `trainerWorkouts.ts` | Rutinas activas por cliente | Dueño / Trainer / Admin | Trainer asignado / Admin |
| `diets` | `dietService.ts`, `trainerDiets.ts` | Dietas activas por cliente | Dueño / Trainer / Admin | Trainer asignado / Admin |
| `messages` | `chat.ts`, `trainerChat.ts` | Chat directo cliente-entrenador | Participantes / Admin | Participantes |
| `progress_logs` | `progressService.ts` | Registros de peso y evolución | Dueño / Trainer / Admin | Cliente / Admin |
| `foods_library` | `foodLibrary.ts` | Catálogo central de alimentos | Autenticados | Staff (Admin/Trainer) |
| `exercises_library` | `exerciseLibrary.ts` | Catálogo central de ejercicios | Autenticados | Staff (Admin/Trainer) |
| `user_exercise_prefs` | `index.ts` (`UserExercisePreferences`) | Rating, favoritos y exclusiones | Dueño / Trainer / Admin | Cliente / Trainer / Admin |
| `workout_templates` | `templateService.ts` | Plantillas de rutinas | Autenticados | Staff (Admin/Trainer) |
| `diet_templates` | `templateService.ts` | Plantillas de dietas | Autenticados | Staff (Admin/Trainer) |
| `exercise_templates` | `templateService.ts` | Plantillas de ejercicios | Autenticados | Staff (Admin/Trainer) |

---

## 🔒 Reglas Inviolables de Anti-Regresión

1. **Jamás borrar cláusulas Firestore:** `where`, `orderBy`, `limit` no se deben eliminar.
2. **Soft Delete Mandatorio:** En `foods_library` y `exercises_library`, usar `isActive: false`.
3. **Strict Unions:** Tipos como `FoodCategory`, `MuscleGroup`, `Meal.name` deben ser unions estrictas (`'protein' | 'carbs'`, etc.), **nunca `string`**.
4. **Sanitización HTML:** Usar `escapeHtml()` en todos los renderizados dinámicos por template literal en `.astro` o `.ts`.
