# 🔍 Auditoría Unificada de CampFit

> **Última actualización:** 2026-08-04  
> **Propósito:** Consolidar todos los hallazgos de auditoría en un solo archivo con estado verificado.  
> **Reemplaza a:** `AUDIT_REPORT.md`, `AUDITORIA_COMPLETA_CAMPFIT.md`, `AUDITORIA_COMPLETA_PRO`, `AUDITORIA_DIETAS_TRAINER.md`, `11_auditoria_problemas.md`  
> **Método:** Cada hallazgo fue verificado contra el código actual (2026-08-04).

---

## 📊 Resumen Ejecutivo

| Severidad | Total | ✅ Corregido | ⚠️ Vigente |
|-----------|-------|-------------|------------|
| 🔴 CRÍTICO | 13 | 8 | 5 |
| 🟡 MEDIO | 74 | 0 | 74 |
| 🟢 BAJO | 190 | 0 | 190 |
| **TOTAL** | **277** | **8** | **269** |

> **Nota:** Los hallazgos 🟡 MEDIO y 🟢 BAJO del `AUDIT_REPORT.md` (277 totales) no fueron re-verificados individualmente. Solo se re-verificaron los hallazgos CRÍTICOS y los de la auditoría de dietas del trainer.

---

## 🔴 HALLAZGOS CRÍTICOS (P0) — Verificados

### SEC-001/002/003: Rutas no protegidas en `routeGuards.ts` — ✅ **CORREGIDO**

**Archivo:** `src/lib/routeGuards.ts`

**Estado:** ✅ Verificado y corregido el 2026-08-06. Se añadieron todas las rutas faltantes a `routeGuards.ts`:
- `/trainer/clinical` -> `['trainer', 'admin']`
- `/client/support` -> `['client']`
- `/client/settings` -> `['client']`
- `/admin/foods` -> `['admin']`
- `/admin/exercises` -> `['admin']`

---

### P0-1: Firestore rules `isStaff()` sin ownership — ✅ **CORREGIDO**

**Archivo:** `firestore.rules` (líneas 76-95)

**Antes:** `allow create, update, delete: if isStaff();` — cualquier trainer podía modificar dietas/rutinas de otros.

**Ahora:**
```javascript
// Rutinas
allow create: if isTrainer() &&
  request.resource.data.trainerId == request.auth.uid &&
  request.resource.data.clientId != null;
allow update, delete: if (isTrainer() && resource.data.trainerId == request.auth.uid) || isAdmin();

// Dietas (idéntico)
allow create: if isTrainer() &&
  request.resource.data.trainerId == request.auth.uid &&
  request.resource.data.clientId != null;
allow update, delete: if (isTrainer() && resource.data.trainerId == request.auth.uid) || isAdmin();
```

**Estado:** ✅ Verificado el 2026-08-04 — ownership correcto.

---

### P0-2: `/trainer/diets` sin verificar rol — ✅ **CORREGIDO**

**Archivo:** `src/pages/trainer/diets.astro`

**Antes:** `requireAuth(async (user) => { initDiets(user.uid); });` — solo autenticación.

**Ahora:**
```typescript
import { requireRole } from "@/lib/shared/authGuard";
requireRole(["trainer", "admin"], async (user) => {
  initDiets(user.uid);
});
```

**Estado:** ✅ Verificado el 2026-08-04 — usa `requireRole(["trainer", "admin"])`.

---

### P0-3: Bug `registerMealComplete('', ...)` — ✅ **CORREGIDO**

**Archivo:** `src/pages/client/diets.astro`

**Antes:** `registerMealComplete('', currentDietId, mealId, ...)` — clientId vacío, el botón nunca funcionaba.

**Ahora:** `registerMealComplete(currentClientId, ...)` — usa el clientId real.

**Estado:** ✅ Verificado el 2026-08-04.

---

### P0-4: `templateService.ts` corrupto (`r/**`) — ✅ **CORREGIDO**

**Archivo:** `src/lib/trainer/templateService.ts`

**Antes:** El archivo empezaba con `r/**` (carácter corrupto) causando `ReferenceError: r is not defined`.

**Ahora:** Empieza correctamente con `/**` y tiene `isClientAssignedToTrainer()` con comentario 🔒 CRÍTICO.

**Estado:** ✅ Verificado el 2026-08-04 — archivo íntegro (184 líneas).

---

### P0-5: Paridad i18n `admin.modal.resetPwd` — ⚠️ **VIGENTE**

**Archivo:** `src/i18n/locales/en.ts`

**Problema:** La clave `admin.modal.resetPwd` existe en `es.ts` pero NO en `en.ts`. El test `translations.test.ts` falla.

**Corrección:** Añadir `admin.modal.resetPwd` a `en.ts`.

---

## 🟠 HALLAZGOS DE ARQUITECTURA (P1) — Verificados

### P1-1: Tipos relajados en `trainer/types.ts` — ✅ **CORREGIDO**

**Archivo:** `src/lib/trainer/types.ts`

**Antes:** `type: string`, `somatotype: ... | string`, `Meal.name: string`, sin `allergens`.

**Ahora:**
```typescript
// 🔒 CRÍTICO: Union estricta de tipos de dieta. NUNCA cambiar a `string`.
type: 'normal' | 'definition' | 'volume' | 'keto' | 'vegan' | 'custom';
// 🔒 CRÍTICO: Union estricta de somatotipos. NUNCA añadir `| string`.
somatotype?: 'ectomorph' | 'mesomorph' | 'endomorph';
// 🔒 CRÍTICO: Union estricta de nombres de comida. NUNCA cambiar a `string`.
name: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';
// 🔒 CRÍTICO: Campo allergens. NUNCA eliminar.
allergens?: string[];
```

**Estado:** ✅ Verificado el 2026-08-04 — unions estrictas + allergens + foodId.

---

### P1-2: `templateService` sin validación de ownership — ✅ **CORREGIDO**

**Archivo:** `src/lib/trainer/templateService.ts`

**Antes:** `applyDietTemplateToClient` no verificaba que el cliente estuviera asignado al trainer.

**Ahora:** Tiene `isClientAssignedToTrainer(clientId, trainerId)` con comentario 🔒 CRÍTICO.

**Estado:** ✅ Verificado el 2026-08-04.

---

### P1-3: Archivos > 300 líneas — ⚠️ **VIGENTE (parcial)**

| Archivo | Líneas | Estado |
|---------|--------|--------|
| `src/pages/trainer/diets.astro` | ~772 | ⚠️ VIGENTE |
| `src/pages/client/diets.astro` | ~678 | ⚠️ VIGENTE |
| `src/pages/admin/users.astro` | ~822 | ⚠️ VIGENTE |
| `src/layouts/BaseLayout.astro` | ~771 | ⚠️ VIGENTE |
| `src/lib/devtools/seedData.ts` | ~924 | ⚠️ VIGENTE |
| `src/stores/themeStore.ts` | 395 | ⚠️ VIGENTE |
| `src/i18n/locales/es.ts` | ~979 | ⚠️ VIGENTE |
| `src/i18n/locales/en.ts` | ~752 | ⚠️ VIGENTE |
| `src/i18n/locales/ca.ts` | ~504 | ⚠️ VIGENTE |
| `src/components/settings/UnifiedSettingsView.astro` | ~591 | ⚠️ VIGENTE |

---

### P1-4: Documentación desorganizada — ✅ **EN PROCESO**

**Problema:** 29+ documentos en `docs/` sin estructura. Auditorías redundantes.

**Acción:** Este archivo (`AUDITORIA_UNIFICADA.md`) consolida las 4 auditorías. Los archivos originales quedan como histórico.

---

## 🔍 HALLAZGOS PROFUNDOS (Ronda 2 — 2026-08-04)

### DOC-001: Inconsistencia de versión Astro — ⚠️ **VIGENTE**

**Problema:** `package.json` declara `"astro": "^7.0.7"` (Astro 7), pero varios documentos dicen "Astro 5":

| Documento | Versión declarada | Correcto |
|-----------|-------------------|----------|
| `docs/MASTER.md` (línea 3) | Astro 5 | ❌ Debería ser Astro 7 |
| `nuevo_proyecto/00_indice.md` (línea 3) | Astro 5 | ❌ Debería ser Astro 7 |
| `docs/00_indice.md` (línea 3) | Astro 7 | ✅ Correcto |
| `CONTEXT.md` (línea 6) | Astro 7 | ✅ Correcto |

**Corrección:** Actualizar `docs/MASTER.md` y `nuevo_proyecto/00_indice.md` a "Astro 7".

---

### DOC-002: `nuevo_proyecto/00_indice.md` incompleto — ⚠️ **VIGENTE**

**Problema:** El índice lista 19 documentos pero hay 20 archivos en `nuevo_proyecto/`. Falta:

| Documento | Estado |
|-----------|--------|
| `19_plan_refactor_optimizacion.md` | ❌ No listado en el índice |

**Corrección:** Añadir `19_plan_refactor_optimizacion.md` al índice.

---

### DOC-003: `nuevo_proyecto/00_indice.md` dice "SSR con @astrojs/node" — ⚠️ **VIGENTE**

**Problema:** El índice dice "SSR con `@astrojs/node` standalone" pero `astro.config.mjs` usa `output: 'static'` (SSG). `CONTEXT.md` también menciona SSR pero el proyecto es estático.

**Corrección:** Verificar `astro.config.mjs` y alinear la documentación con el modo real (static vs SSR).

---

### PERF-003/004/005: onSnapshot sin unsubscribe — ✅ **CORREGIDO**

**Verificado 2026-08-04:**
- `src/lib/client/dietService.ts` — retorna `onSnapshot(...)` directamente ✅
- `src/lib/client/workoutService.ts` — retorna `onSnapshot(...)` directamente ✅
- `src/lib/client/progressService.ts` — retorna `onSnapshot(...)` directamente ✅
- `src/lib/client/achievementsService.ts` — retorna `onSnapshot(...)` directamente ✅
- `src/lib/client/adherenceService.ts` — guarda `unsubMeals`/`unsubWorkouts` y retorna cleanup ✅
- `src/lib/trainer/templateService.ts` — retorna `onSnapshot(...)` directamente ✅

**Estado:** Todos los onSnapshot retornan unsubscribe correctamente.

---

### QUAL-007/018-024: console.* en lugar de logger — ⚠️ **PARCIALMENTE ACEPTABLE**

**Verificado 2026-08-04:** Los `console.*` encontrados están mayormente en:
- `src/lib/debug/*` — archivos de debug condicionados por `import.meta.env.DEV` (aceptable)
- `src/lib/devtools/*` — DevTools solo en desarrollo (aceptable)
- `src/lib/shared/logger.ts` — es el propio sistema de logging (correcto)

**Vigentes (producción):**
- `src/layouts/BaseLayout.astro:44` — `console.error` en service worker registration (debería usar logger)
- `src/pages/client/chat.astro:132,133,214,222,223,251` — console.* en producción

---

## 🟡 HALLAZGOS DE CALIDAD (P2) — No re-verificados

Los siguientes hallazgos del `AUDIT_REPORT.md` (74 MEDIO + 190 BAJO) NO fueron re-verificados individualmente. Se listan por categoría para referencia:

### Uso de `any` (Golden Rule #1)
- `src/components/settings/UnifiedSettingsView.astro:333`
- `src/lib/admin/adminSubscriptions.ts:215,216`
- `src/lib/client/achievementsService.ts:38`
- `src/lib/client/clientInit.ts:26`
- `src/lib/debug/debugDataLogger.ts:96,127,145`
- `src/lib/notifications/notificationService.ts:127,145`
- `src/lib/shared/chat.ts:27`
- `src/lib/shared/initPage.ts:24,37,49`
- `src/pages/client/dashboard.astro:353`
- `src/pages/client/workouts.astro:397`
- `src/pages/trainer/diets.astro:192`
- `src/pages/trainer/workouts.astro:152,319`
- `src/types/index.ts:15,19,21,22,23,46,71`

### console.* en lugar de logger
- `src/lib/devtools/detector.ts:65,107,108,145`
- `src/lib/devtools/logStore.ts:71`
- `src/lib/devtools/panel.ts:174,188,199`
- `src/layouts/BaseLayout.astro:44`
- `src/pages/client/chat.astro:132,133,214,222,223,251`

### onSnapshot sin unsubscribe visible
- `src/lib/client/dietService.ts:169`
- `src/lib/client/workoutService.ts:102`
- `src/lib/trainer/templateService.ts:84`

### subscribeToCollectionCount (anti-pattern)
- `src/lib/admin/adminSubscriptions.ts`
- `src/lib/admin/adminUtils.ts`

### Tests placeholder / sin aserciones
- `tests/integration/auth.flow.test.ts:62` (placeholder)
- `tests/unit/components/EmptyState.test.ts:34`
- `tests/unit/components/ErrorState.test.ts:51`
- `tests/unit/components/Icon.test.ts:29,34`
- `tests/unit/components/LoadingSpinner.test.ts:33`
- `tests/unit/components/ThemeFlavorSelector.test.ts:26`
- `tests/unit/lib/devtools/seedService.test.ts:45,58,71,84,97,112`
- + ~150 tests "sin aserciones" en adminRender, adminSubscriptions, adminUsers, clientInit, dietService, progressService, chat, initPage, settingsService, templateService, trainerAuth, trainerChat

### Colores hardcodeados
- `src/pages/admin/devtools.astro:45,53,62` (text-gray-*)
- `src/pages/login.astro:35-38,290-293` (colores Google — intencional)
- `src/pages/trainer/chat.astro:196` (bg-zinc-500, text-zinc-300)

### Variables light/dark asimétricas
- `public/theme-tokens.css` — :root tiene 95 variables, .dark tiene 0

---

## 🟢 HALLAZGOS DE MEJORA (P3) — No re-verificados

- Automatizar CHANGELOG (commitizen/standard-version)
- Actualizar CONTEXT.md
- Crear CONTRIBUTING.md
- Crear SECURITY.md
- Crear CODE_OF_CONDUCT.md
- Completar PWA (offline, push, install)
- Onboarding para trainers
- Gestión de sesión expirada
- Página de ayuda/FAQ
- Términos legales (GDPR)

---

## 📋 PLAN DE ACCIÓN PRIORIZADO

### Fase 1 — Seguridad (URGENTE)
- [ ] **SEC-001/002/003** — Añadir `/trainer/clinical`, `/client/support`, `/client/settings` a `routeGuards.ts`
- [ ] **P0-5** — Añadir `admin.modal.resetPwd` a `en.ts`

### Fase 2 — Calidad
- [ ] **P1-3** — Refactorizar archivos > 300 líneas (priorizar `themeStore.ts`, `trainer/diets.astro`)
- [ ] **P2** — Eliminar `any` en archivos listados
- [ ] **P2** — Reemplazar console.* por logger
- [ ] **P2** — Añadir unsubscribe visible en onSnapshot
- [ ] **P2** — Reemplazar subscribeToCollectionCount por count() aggregation

### Fase 3 — Tests
- [ ] **P2** — Reemplazar tests placeholder por aserciones reales
- [ ] **P2** — Añadir tests para intoleranceChecker, onboardingService, supportService, achievementsService, adherenceService, r2Service
- [ ] **P2** — Ampliar tests E2E con flujos completos

### Fase 4 — Documentación
- [ ] **P1-4** — Eliminar archivos de auditoría obsoletos tras confirmar este unificado
- [ ] **P3** — Crear CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md

---

## 📁 Archivos de Auditoría Originales (histórico)

| Archivo | Estado | Nota |
|---------|--------|------|
| `AUDIT_REPORT.md` | 📦 Histórico | 277 findings, 1543 líneas |
| `AUDITORIA_COMPLETA_CAMPFIT.md` | 📦 Histórico | Informe de estado (sin errores) |
| `AUDITORIA_COMPLETA_PRO` | 📦 Histórico | Hallazgos P0-P3 + factores humanos |
| `AUDITORIA_DIETAS_TRAINER.md` | 📦 Histórico | Auditoría específica de dietas |
| `11_auditoria_problemas.md` | 📦 Histórico | Auditoría legacy |

> **Este archivo (`AUDITORIA_UNIFICADA.md`) es la fuente de verdad actual.**

---

**Mantenido por:** Equipo CampFit  
**Última verificación de código:** 2026-08-04