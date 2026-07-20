# Tarea Actual

> **Instrucciones:** Actualizar este archivo con la tarea que el agente debe realizar.
> **Formato:** Una línea de título + descripción breve.

---

## Tarea: Refactorización completa de adminUtils y trainerUtils

**Prioridad:** 🔴 Alta
**Estado:** ✅ Completado

### Descripción
Refactorización completa de los archivos monolíticos `adminUtils.ts` (629 líneas) y `trainerUtils.ts` (570 líneas) en módulos pequeños y especializados. Cada módulo tiene una única responsabilidad: tipos, auth, servicios de datos, renderizado o init.

### Archivos creados (admin)
- [x] `src/lib/admin/types.ts` — Tipos AdminUser, CreateUserPayload
- [x] `src/lib/admin/adminAuth.ts` — requireAdmin, signOutUser
- [x] `src/lib/admin/adminUsers.ts` — CRUD usuarios
- [x] `src/lib/admin/adminSubscriptions.ts` — Suscripciones Firestore
- [x] `src/lib/admin/adminRender.ts` — Renderizado HTML
- [x] `src/lib/admin/adminInit.ts` — initGlobalActions
- [x] `src/lib/admin/adminUtils.ts` → Barrel (re-exporta todo)

### Archivos creados (trainer)
- [x] `src/lib/trainer/types.ts` — TrainerClient, Workout, Diet, etc.
- [x] `src/lib/trainer/trainerAuth.ts` — requireAuth, signOutUser
- [x] `src/lib/trainer/trainerClients.ts` — Clientes del trainer
- [x] `src/lib/trainer/trainerWorkouts.ts` — CRUD rutinas
- [x] `src/lib/trainer/trainerDiets.ts` — CRUD dietas
- [x] `src/lib/trainer/trainerProgress.ts` — Progreso de clientes
- [x] `src/lib/trainer/trainerChat.ts` — Mensajería
- [x] `src/lib/trainer/trainerRender.ts` — Renderizado HTML
- [x] `src/lib/trainer/trainerInit.ts` — initGlobalActions
- [x] `src/lib/trainer/trainerUtils.ts` → Barrel (re-exporta todo)

### Criterios de aceptación
- [x] Todos los tests existentes pasan (38 tests en adminUtils + trainerUtils)
- [x] Los barrels mantienen compatibilidad hacia atrás
- [x] Cada archivo < 300 líneas
- [x] JSDoc en todas las funciones públicas
- [x] Sin `any` - tipos explícitos en todas partes
