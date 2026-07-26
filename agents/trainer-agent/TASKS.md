# 📋 Trainer Agent — Backlog de Tareas

> Backlog priorizado para el módulo de Entrenadores. Actualizado: 2026-07-25

---

## 🔴 Prioridad Alta

### #1 Tests unitarios trainerUtils.ts (0% → 80%+)
- **Descripción:** Aumentar cobertura del barrel y submódulos trainer
- **Archivos afectados:** `tests/unit/lib/trainer/`, `src/lib/trainer/*.ts`
- **Criterios:** Cobertura >80% statements, >75% branches, 3 escenarios por función

### #2 Tests E2E flujo trainer completo
- **Descripción:** Crear tests E2E para flujo completo trainer
- **Archivos afectados:** `tests/e2e/trainer.spec.ts`
- **Criterios:** Dashboard carga, clientes visibles, CRUD workouts/diets funciona, chat funcional

---

## 🟡 Prioridad Media

### #3-#8 Tests unitarios por submódulo
- `trainerClients.ts`, `trainerWorkouts.ts`, `trainerDiets.ts`, `trainerProgress.ts`, `trainerChat.ts`
- **Criterios:** 3 escenarios por función, cobertura >80%

### #9 Verificar paginación en lista de clientes
- **Descripción:** Asegurar que listas de clientes tienen paginación o lazy loading
- **Archivos afectados:** `src/pages/trainer/clients.astro`, `trainerClients.ts`

---

> **Ver también:** `TODO.md` para contexto global del proyecto