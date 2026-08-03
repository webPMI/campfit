# 🔍 CampFit Multi-Agent Audit Report

> **Fecha:** 2026-08-02T20:16:31.118Z  
> **Agentes desplegados:** 6  
> **Archivos escaneados:** 571  
> **Duración total:** 0.38s  

---

## 📊 Resumen Consolidado

| Severidad | Cantidad |
|-----------|----------|
| 🔴 CRÍTICO | 13 |
| 🟡 MEDIO | 74 |
| 🟢 BAJO | 190 |
| **TOTAL** | **277** |

### Por Agente

| Agente | Findings | Críticos | Medios | Bajos | Archivos | Duración |
|--------|---------|----------|--------|-------|----------|----------|
| audit-security | 7 | 3 | 0 | 4 | 154 | 0.09s |
| audit-quality | 66 | 10 | 55 | 1 | 150 | 0.06s |
| audit-performance | 5 | 0 | 5 | 0 | 74 | 0.03s |
| audit-uiux | 14 | 0 | 1 | 13 | 77 | 0.04s |
| audit-testing | 168 | 0 | 13 | 155 | 80 | 0.15s |
| audit-i18n | 17 | 0 | 0 | 17 | 36 | 0.02s |

---

## 🤖 Security (audit-security)

**Archivos escaneados:** 154 | **Duración:** 0.09s

### 🔴 CRÍTICO (3)

#### SEC-001: Ruta no protegida: /trainer/clinical
- **Archivo:** `src/lib/routeGuards.ts`
- **Descripción:** La ruta /trainer/clinical no aparece en routeGuards.ts. Cualquier usuario autenticado podría acceder.
- **Recomendación:** Agregar /trainer/clinical a las rutas protegidas en routeGuards.ts

#### SEC-002: Ruta no protegida: /client/support
- **Archivo:** `src/lib/routeGuards.ts`
- **Descripción:** La ruta /client/support no aparece en routeGuards.ts. Cualquier usuario autenticado podría acceder.
- **Recomendación:** Agregar /client/support a las rutas protegidas en routeGuards.ts

#### SEC-003: Ruta no protegida: /client/settings
- **Archivo:** `src/lib/routeGuards.ts`
- **Descripción:** La ruta /client/settings no aparece en routeGuards.ts. Cualquier usuario autenticado podría acceder.
- **Recomendación:** Agregar /client/settings a las rutas protegidas en routeGuards.ts

### 🟢 BAJO (4)

#### SEC-004: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\lib\devtools\detector.ts`:107
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

#### SEC-005: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\pages\client\chat.astro`:132
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

#### SEC-006: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\pages\client\chat.astro`:222
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

#### SEC-007: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\pages\client\chat.astro`:222
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

---

## 🤖 Code Quality (audit-quality)

**Archivos escaneados:** 150 | **Duración:** 0.06s

### 🔴 CRÍTICO (10)

#### QUAL-001: Archivo > 300 líneas (591 líneas)
- **Archivo:** `src\components\settings\UnifiedSettingsView.astro`:591
- **Descripción:** El archivo tiene 591 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-003: Archivo > 300 líneas (504 líneas)
- **Archivo:** `src\i18n\locales\ca.ts`:504
- **Descripción:** El archivo tiene 504 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-004: Archivo > 300 líneas (752 líneas)
- **Archivo:** `src\i18n\locales\en.ts`:752
- **Descripción:** El archivo tiene 752 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-005: Archivo > 300 líneas (979 líneas)
- **Archivo:** `src\i18n\locales\es.ts`:979
- **Descripción:** El archivo tiene 979 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-006: Archivo > 300 líneas (771 líneas)
- **Archivo:** `src\layouts\BaseLayout.astro`:771
- **Descripción:** El archivo tiene 771 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-025: Archivo > 300 líneas (924 líneas)
- **Archivo:** `src\lib\devtools\seedData.ts`:924
- **Descripción:** El archivo tiene 924 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-039: Archivo > 300 líneas (822 líneas)
- **Archivo:** `src\pages\admin\users.astro`:822
- **Descripción:** El archivo tiene 822 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-047: Archivo > 300 líneas (678 líneas)
- **Archivo:** `src\pages\client\diets.astro`:678
- **Descripción:** El archivo tiene 678 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-052: Archivo > 300 líneas (513 líneas)
- **Archivo:** `src\pages\trainer\chat.astro`:513
- **Descripción:** El archivo tiene 513 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-054: Archivo > 300 líneas (772 líneas)
- **Archivo:** `src\pages\trainer\diets.astro`:772
- **Descripción:** El archivo tiene 772 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

### 🟡 MEDIO (55)

#### QUAL-002: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\components\settings\UnifiedSettingsView.astro`:333
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-007: console.error en lugar de logger
- **Archivo:** `src\layouts\BaseLayout.astro`:44
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-009: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\admin\adminSubscriptions.ts`:215
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-010: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\admin\adminSubscriptions.ts`:216
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-011: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\client\achievementsService.ts`:38
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-012: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\client\clientInit.ts`:26
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-013: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\client\clientInit.ts`:26
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-014: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\debug\debugDataLogger.ts`:96
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-015: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\debug\debugDataLogger.ts`:127
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-016: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\debug\debugDataLogger.ts`:145
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-017: Archivo > 300 líneas (485 líneas)
- **Archivo:** `src\lib\debug\firestoreDebug.ts`:485
- **Descripción:** El archivo tiene 485 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-018: console.warn en lugar de logger
- **Archivo:** `src\lib\devtools\detector.ts`:65
- **Descripción:** Usa console.warn() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-019: console.warn en lugar de logger
- **Archivo:** `src\lib\devtools\detector.ts`:108
- **Descripción:** Usa console.warn() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-020: console.log en lugar de logger
- **Archivo:** `src\lib\devtools\detector.ts`:145
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-021: console.info en lugar de logger
- **Archivo:** `src\lib\devtools\logStore.ts`:71
- **Descripción:** Usa console.info() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-022: console.log en lugar de logger
- **Archivo:** `src\lib\devtools\panel.ts`:174
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-023: console.log en lugar de logger
- **Archivo:** `src\lib\devtools\panel.ts`:188
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-024: console.log en lugar de logger
- **Archivo:** `src\lib\devtools\panel.ts`:199
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-026: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\notifications\notificationService.ts`:127
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-027: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\notifications\notificationService.ts`:145
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-028: Archivo > 300 líneas (350 líneas)
- **Archivo:** `src\lib\shared\chat.ts`:350
- **Descripción:** El archivo tiene 350 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-029: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\chat.ts`:27
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-030: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\initPage.ts`:24
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-031: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\initPage.ts`:24
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-032: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\initPage.ts`:37
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-033: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\initPage.ts`:49
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-034: Archivo > 300 líneas (380 líneas)
- **Archivo:** `src\lib\shared\profileService.ts`:380
- **Descripción:** El archivo tiene 380 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-035: Archivo > 300 líneas (367 líneas)
- **Archivo:** `src\pages\admin\clinical.astro`:367
- **Descripción:** El archivo tiene 367 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-036: Archivo > 300 líneas (424 líneas)
- **Archivo:** `src\pages\admin\dashboard.astro`:424
- **Descripción:** El archivo tiene 424 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-037: Archivo > 300 líneas (339 líneas)
- **Archivo:** `src\pages\admin\diets.astro`:339
- **Descripción:** El archivo tiene 339 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-038: Archivo > 300 líneas (317 líneas)
- **Archivo:** `src\pages\admin\progress.astro`:317
- **Descripción:** El archivo tiene 317 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-040: Archivo > 300 líneas (318 líneas)
- **Archivo:** `src\pages\admin\workouts.astro`:318
- **Descripción:** El archivo tiene 318 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-041: console.warn en lugar de logger
- **Archivo:** `src\pages\client\chat.astro`:133
- **Descripción:** Usa console.warn() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-042: console.error en lugar de logger
- **Archivo:** `src\pages\client\chat.astro`:214
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-043: console.error en lugar de logger
- **Archivo:** `src\pages\client\chat.astro`:223
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-044: console.error en lugar de logger
- **Archivo:** `src\pages\client\chat.astro`:251
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-045: Archivo > 300 líneas (417 líneas)
- **Archivo:** `src\pages\client\dashboard.astro`:417
- **Descripción:** El archivo tiene 417 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-046: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\pages\client\dashboard.astro`:353
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-048: Archivo > 300 líneas (403 líneas)
- **Archivo:** `src\pages\client\workouts.astro`:403
- **Descripción:** El archivo tiene 403 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-049: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\pages\client\workouts.astro`:397
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-050: Archivo > 300 líneas (424 líneas)
- **Archivo:** `src\pages\onboarding.astro`:424
- **Descripción:** El archivo tiene 424 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-051: Archivo > 300 líneas (499 líneas)
- **Archivo:** `src\pages\register.astro`:499
- **Descripción:** El archivo tiene 499 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-053: Archivo > 300 líneas (358 líneas)
- **Archivo:** `src\pages\trainer\clinical.astro`:358
- **Descripción:** El archivo tiene 358 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-055: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\pages\trainer\diets.astro`:192
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-056: Archivo > 300 líneas (342 líneas)
- **Archivo:** `src\pages\trainer\workouts.astro`:342
- **Descripción:** El archivo tiene 342 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-057: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\pages\trainer\workouts.astro`:152
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-058: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\pages\trainer\workouts.astro`:319
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-059: Archivo > 300 líneas (396 líneas)
- **Archivo:** `src\stores\themeStore.ts`:396
- **Descripción:** El archivo tiene 396 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-060: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:15
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-061: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:19
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-062: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:21
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-063: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:22
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-064: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:23
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-065: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:46
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-066: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:71
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

### 🟢 BAJO (1)

#### QUAL-008: Bloque <style> inline (CSP)
- **Archivo:** `src\layouts\BaseLayout.astro`
- **Descripción:** El bloque <style> inline puede romper la política CSP.
- **Recomendación:** Mover estilos a archivos CSS externos o usar Tailwind

---

## 🤖 Performance (audit-performance)

**Archivos escaneados:** 74 | **Duración:** 0.03s

### 🟡 MEDIO (5)

#### PERF-001: subscribeToCollectionCount (anti-pattern)
- **Archivo:** `src\lib\admin\adminSubscriptions.ts`
- **Descripción:** Usa subscribeToCollectionCount que es ineficiente. Debe usar count() aggregation.
- **Recomendación:** Reemplazar con firestore().collection().count().get()

#### PERF-002: subscribeToCollectionCount (anti-pattern)
- **Archivo:** `src\lib\admin\adminUtils.ts`
- **Descripción:** Usa subscribeToCollectionCount que es ineficiente. Debe usar count() aggregation.
- **Recomendación:** Reemplazar con firestore().collection().count().get()

#### PERF-003: onSnapshot sin unsubscribe visible
- **Archivo:** `src\lib\client\dietService.ts`:169
- **Descripción:** Suscripción onSnapshot sin unsubscribe explícito puede causar memory leaks.
- **Recomendación:** Guardar el return de onSnapshot y llamar unsubscribe en cleanup

#### PERF-004: onSnapshot sin unsubscribe visible
- **Archivo:** `src\lib\client\workoutService.ts`:102
- **Descripción:** Suscripción onSnapshot sin unsubscribe explícito puede causar memory leaks.
- **Recomendación:** Guardar el return de onSnapshot y llamar unsubscribe en cleanup

#### PERF-005: onSnapshot sin unsubscribe visible
- **Archivo:** `src\lib\trainer\templateService.ts`:84
- **Descripción:** Suscripción onSnapshot sin unsubscribe explícito puede causar memory leaks.
- **Recomendación:** Guardar el return de onSnapshot y llamar unsubscribe en cleanup

---

## 🤖 UI/UX (audit-uiux)

**Archivos escaneados:** 77 | **Duración:** 0.04s

### 🟡 MEDIO (1)

#### UIUX-014: Variables light/dark asimétricas
- **Archivo:** `public/theme-tokens.css`
- **Descripción:** :root tiene 95 variables, .dark tiene 0. Falta sincronización.
- **Recomendación:** Sincronizar variables entre light y dark mode

### 🟢 BAJO (13)

#### UIUX-001: Color hardcodeado: text-gray-500
- **Archivo:** `src\pages\admin\devtools.astro`:45
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-002: Color hardcodeado: text-gray-300
- **Archivo:** `src\pages\admin\devtools.astro`:53
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-003: Color hardcodeado: text-gray-500
- **Archivo:** `src\pages\admin\devtools.astro`:62
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-004: Color hardcodeado: #4285F4
- **Archivo:** `src\pages\login.astro`:35
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-005: Color hardcodeado: #34A853
- **Archivo:** `src\pages\login.astro`:36
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-006: Color hardcodeado: #FBBC05
- **Archivo:** `src\pages\login.astro`:37
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-007: Color hardcodeado: #EA4335
- **Archivo:** `src\pages\login.astro`:38
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-008: Color hardcodeado: #4285F4
- **Archivo:** `src\pages\login.astro`:290
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-009: Color hardcodeado: #34A853
- **Archivo:** `src\pages\login.astro`:291
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-010: Color hardcodeado: #FBBC05
- **Archivo:** `src\pages\login.astro`:292
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-011: Color hardcodeado: #EA4335
- **Archivo:** `src\pages\login.astro`:293
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-012: Color hardcodeado: bg-zinc-500
- **Archivo:** `src\pages\trainer\chat.astro`:196
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-013: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\trainer\chat.astro`:196
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

---

## 🤖 Testing (audit-testing)

**Archivos escaneados:** 80 | **Duración:** 0.15s

### 🟡 MEDIO (13)

#### TEST-001: Test placeholder (expect(true).toBe(true))
- **Archivo:** `tests\integration\auth.flow.test.ts`:62
- **Descripción:** Test placeholder sin aserción real.
- **Recomendación:** Reemplazar con aserciones reales sobre el comportamiento

#### TEST-003: Test placeholder (expect(true).toBe(true))
- **Archivo:** `tests\unit\components\EmptyState.test.ts`:34
- **Descripción:** Test placeholder sin aserción real.
- **Recomendación:** Reemplazar con aserciones reales sobre el comportamiento

#### TEST-004: Test placeholder (expect(true).toBe(true))
- **Archivo:** `tests\unit\components\ErrorState.test.ts`:51
- **Descripción:** Test placeholder sin aserción real.
- **Recomendación:** Reemplazar con aserciones reales sobre el comportamiento

#### TEST-005: Test placeholder (expect(true).toBe(true))
- **Archivo:** `tests\unit\components\Icon.test.ts`:29
- **Descripción:** Test placeholder sin aserción real.
- **Recomendación:** Reemplazar con aserciones reales sobre el comportamiento

#### TEST-006: Test placeholder (expect(true).toBe(true))
- **Archivo:** `tests\unit\components\Icon.test.ts`:34
- **Descripción:** Test placeholder sin aserción real.
- **Recomendación:** Reemplazar con aserciones reales sobre el comportamiento

#### TEST-007: Test placeholder (expect(true).toBe(true))
- **Archivo:** `tests\unit\components\LoadingSpinner.test.ts`:33
- **Descripción:** Test placeholder sin aserción real.
- **Recomendación:** Reemplazar con aserciones reales sobre el comportamiento

#### TEST-008: Test placeholder (expect(true).toBe(true))
- **Archivo:** `tests\unit\components\ThemeFlavorSelector.test.ts`:26
- **Descripción:** Test placeholder sin aserción real.
- **Recomendación:** Reemplazar con aserciones reales sobre el comportamiento

#### TEST-064: Test placeholder (expect(true).toBe(true))
- **Archivo:** `tests\unit\lib\devtools\seedService.test.ts`:45
- **Descripción:** Test placeholder sin aserción real.
- **Recomendación:** Reemplazar con aserciones reales sobre el comportamiento

#### TEST-065: Test placeholder (expect(true).toBe(true))
- **Archivo:** `tests\unit\lib\devtools\seedService.test.ts`:58
- **Descripción:** Test placeholder sin aserción real.
- **Recomendación:** Reemplazar con aserciones reales sobre el comportamiento

#### TEST-066: Test placeholder (expect(true).toBe(true))
- **Archivo:** `tests\unit\lib\devtools\seedService.test.ts`:71
- **Descripción:** Test placeholder sin aserción real.
- **Recomendación:** Reemplazar con aserciones reales sobre el comportamiento

#### TEST-067: Test placeholder (expect(true).toBe(true))
- **Archivo:** `tests\unit\lib\devtools\seedService.test.ts`:84
- **Descripción:** Test placeholder sin aserción real.
- **Recomendación:** Reemplazar con aserciones reales sobre el comportamiento

#### TEST-068: Test placeholder (expect(true).toBe(true))
- **Archivo:** `tests\unit\lib\devtools\seedService.test.ts`:97
- **Descripción:** Test placeholder sin aserción real.
- **Recomendación:** Reemplazar con aserciones reales sobre el comportamiento

#### TEST-069: Test placeholder (expect(true).toBe(true))
- **Archivo:** `tests\unit\lib\devtools\seedService.test.ts`:112
- **Descripción:** Test placeholder sin aserción real.
- **Recomendación:** Reemplazar con aserciones reales sobre el comportamiento

### 🟢 BAJO (155)

#### TEST-002: Test saltado (.skip)
- **Archivo:** `tests\integration\auth.flow.test.ts`:22
- **Descripción:** Test marcado como .skip no se ejecuta.
- **Recomendación:** Revisar y arreglar o eliminar si ya no aplica

#### TEST-009: Test sin aserciones: debería llamar al callback cuando el usu
- **Archivo:** `tests\unit\lib\admin\adminAuth.test.ts`:59
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-010: Test sin aserciones: debería redirigir a /login cuando el usu
- **Archivo:** `tests\unit\lib\admin\adminAuth.test.ts`:82
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-011: Test sin aserciones: debería cerrar sesión y redirigir a /log
- **Archivo:** `tests\unit\lib\admin\adminAuth.test.ts`:104
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-012: Test sin aserciones: debería manejar errores al cerrar sesión
- **Archivo:** `tests\unit\lib\admin\adminAuth.test.ts`:114
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-013: Test sin aserciones: debería establecer __adminId en window
- **Archivo:** `tests\unit\lib\admin\adminInit.test.ts`:16
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-014: Test sin aserciones: debería establecer __adminId en window
- **Archivo:** `tests\unit\lib\admin\adminInit.test.ts`:25
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-015: Test sin aserciones: debería renderizar una fila de usuario
- **Archivo:** `tests\unit\lib\admin\adminRender.test.ts`:48
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-016: Test sin aserciones: debería incluir el onclick si se proporc
- **Archivo:** `tests\unit\lib\admin\adminRender.test.ts`:58
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-017: Test sin aserciones: debería mostrar badge de alerta activa
- **Archivo:** `tests\unit\lib\admin\adminRender.test.ts`:66
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-018: Test sin aserciones: debería manejar usuario sin nombre
- **Archivo:** `tests\unit\lib\admin\adminRender.test.ts`:74
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-019: Test sin aserciones: debería renderizar el detalle del usuari
- **Archivo:** `tests\unit\lib\admin\adminRender.test.ts`:83
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-020: Test sin aserciones: debería renderizar el formulario con opc
- **Archivo:** `tests\unit\lib\admin\adminRender.test.ts`:95
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-021: Test sin aserciones: debería preseleccionar rol y trainer
- **Archivo:** `tests\unit\lib\admin\adminRender.test.ts`:111
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-022: Test sin aserciones: debería renderizar una tarjeta de usuari
- **Archivo:** `tests\unit\lib\admin\adminRender.test.ts`:124
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-023: Test sin aserciones: debería renderizar tarjeta con botón de 
- **Archivo:** `tests\unit\lib\admin\adminRender.test.ts`:133
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-024: Test sin aserciones: debería renderizar tarjeta sin botón de 
- **Archivo:** `tests\unit\lib\admin\adminRender.test.ts`:141
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-025: Test sin aserciones: debería renderizar una tarjeta de client
- **Archivo:** `tests\unit\lib\admin\adminRender.test.ts`:150
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-026: Test sin aserciones: debería renderizar una tarjeta de entren
- **Archivo:** `tests\unit\lib\admin\adminRender.test.ts`:161
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-027: Test sin aserciones: debería mostrar 0 clientes si no se prop
- **Archivo:** `tests\unit\lib\admin\adminRender.test.ts`:171
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-028: Test sin aserciones: debería suscribirse a todos los usuarios
- **Archivo:** `tests\unit\lib\admin\adminSubscriptions.test.ts`:92
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-029: Test sin aserciones: debería manejar errores de suscripción
- **Archivo:** `tests\unit\lib\admin\adminSubscriptions.test.ts`:116
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-030: Test sin aserciones: debería suscribirse a usuarios por rol
- **Archivo:** `tests\unit\lib\admin\adminSubscriptions.test.ts`:132
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-031: Test sin aserciones: debería suscribirse al conteo de una col
- **Archivo:** `tests\unit\lib\admin\adminSubscriptions.test.ts`:148
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-032: Test sin aserciones: debería suscribirse a los usuarios más r
- **Archivo:** `tests\unit\lib\admin\adminSubscriptions.test.ts`:164
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-033: Test sin aserciones: debería retornar el conteo de clientes d
- **Archivo:** `tests\unit\lib\admin\adminSubscriptions.test.ts`:180
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-034: Test sin aserciones: debería retornar 0 si falla la consulta
- **Archivo:** `tests\unit\lib\admin\adminSubscriptions.test.ts`:189
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-035: Test sin aserciones: debería crear un usuario exitosamente
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:108
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-036: Test sin aserciones: debería crear usuario con trainer asigna
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:127
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-037: Test sin aserciones: debería fallar con email ya registrado
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:143
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-038: Test sin aserciones: debería fallar con contraseña débil
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:155
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-039: Test sin aserciones: debería manejar errores genéricos
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:167
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-040: Test sin aserciones: debería actualizar el rol exitosamente
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:181
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-041: Test sin aserciones: debería retornar false si falla la actua
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:191
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-042: Test sin aserciones: debería asignar un trainer a un cliente
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:202
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-043: Test sin aserciones: debería desasignar un trainer
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:212
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-044: Test sin aserciones: debería retornar false si falla
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:221
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-045: Test sin aserciones: debería eliminar un usuario exitosamente
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:232
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-046: Test sin aserciones: debería retornar false si falla
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:242
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-047: Test sin aserciones: debería bloquear un usuario
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:253
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-048: Test sin aserciones: debería desbloquear un usuario
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:262
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-049: Test sin aserciones: debería retornar false si falla
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:271
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-050: Test sin aserciones: debería retornar el nombre del usuario
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:282
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-051: Test sin aserciones: debería retornar el perfil completo del 
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:319
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-052: Test sin aserciones: debería retornar null si el usuario no e
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:341
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-053: Test sin aserciones: debería retornar null si falla la consul
- **Archivo:** `tests\unit\lib\admin\adminUsers.test.ts`:354
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-054: Test sin aserciones: debe ocultar loading y mostrar contenido
- **Archivo:** `tests\unit\lib\client\clientInit.test.ts`:59
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-055: Test sin aserciones: debe redirigir a /login si no hay usuari
- **Archivo:** `tests\unit\lib\client\clientInit.test.ts`:83
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-056: Test sin aserciones: debe redirigir a /dashboard si el rol no
- **Archivo:** `tests\unit\lib\client\clientInit.test.ts`:97
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-057: Test sin aserciones: debe mostrar error visual en caso de exc
- **Archivo:** `tests\unit\lib\client\clientInit.test.ts`:116
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-058: Test sin aserciones: should add a meal completion log to Fire
- **Archivo:** `tests\unit\lib\client\dietService.test.ts`:260
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-059: Test sin aserciones: should include serverTimestamp in create
- **Archivo:** `tests\unit\lib\client\dietService.test.ts`:308
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-060: Test sin aserciones: should add a weight log to Firestore
- **Archivo:** `tests\unit\lib\client\progressService.test.ts`:191
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-061: Test sin aserciones: should include notes when provided
- **Archivo:** `tests\unit\lib\client\progressService.test.ts`:228
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-062: Test sin aserciones: should trim notes
- **Archivo:** `tests\unit\lib\client\progressService.test.ts`:237
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-063: Test sin aserciones: should include serverTimestamp in create
- **Archivo:** `tests\unit\lib\client\progressService.test.ts`:246
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-070: Test sin aserciones: should query and update unread messages 
- **Archivo:** `tests\unit\lib\shared\chat.test.ts`:156
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-071: Test sin aserciones: should add a message document to Firesto
- **Archivo:** `tests\unit\lib\shared\chat.test.ts`:264
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-072: Test sin aserciones: should trim content before sending
- **Archivo:** `tests\unit\lib\shared\chat.test.ts`:282
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-073: Test sin aserciones: debe funcionar con admin
- **Archivo:** `tests\unit\lib\shared\initPage.test.ts`:31
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-074: Test sin aserciones: debe redirigir si rol no está en allowed
- **Archivo:** `tests\unit\lib\shared\initPage.test.ts`:40
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-075: Test sin aserciones: debería renderizar la vista de perfil si
- **Archivo:** `tests\unit\lib\shared\settingsService.test.ts`:63
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-076: Test sin aserciones: debería enviar el formulario de perfil c
- **Archivo:** `tests\unit\lib\shared\settingsService.test.ts`:102
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-077: Test sin aserciones: debería mostrar error si el nombre está 
- **Archivo:** `tests\unit\lib\shared\settingsService.test.ts`:143
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-078: Test sin aserciones: debería cambiar la contraseña correctame
- **Archivo:** `tests\unit\lib\shared\settingsService.test.ts`:167
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-079: Test sin aserciones: debería mostrar error si las contraseñas
- **Archivo:** `tests\unit\lib\shared\settingsService.test.ts`:195
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-080: Test sin aserciones: ✅ debería clonar dieta para cliente asig
- **Archivo:** `tests\unit\lib\trainer\templateService.test.ts`:60
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-081: Test sin aserciones: ❌ debería lanzar error si el cliente NO 
- **Archivo:** `tests\unit\lib\trainer\templateService.test.ts`:97
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-082: Test sin aserciones: ❌ debería lanzar error si el cliente no 
- **Archivo:** `tests\unit\lib\trainer\templateService.test.ts`:115
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-083: Test sin aserciones: ❌ debería lanzar error si la plantilla n
- **Archivo:** `tests\unit\lib\trainer\templateService.test.ts`:133
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-084: Test sin aserciones: ✅ debería clonar rutina para cliente asi
- **Archivo:** `tests\unit\lib\trainer\templateService.test.ts`:158
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-085: Test sin aserciones: ❌ debería lanzar error si el cliente NO 
- **Archivo:** `tests\unit\lib\trainer\templateService.test.ts`:194
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-086: Test sin aserciones: debería llamar al callback cuando el usu
- **Archivo:** `tests\unit\lib\trainer\trainerAuth.test.ts`:47
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-087: Test sin aserciones: debería cerrar sesión y redirigir a /log
- **Archivo:** `tests\unit\lib\trainer\trainerAuth.test.ts`:67
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-088: Test sin aserciones: debería manejar errores al cerrar sesión
- **Archivo:** `tests\unit\lib\trainer\trainerAuth.test.ts`:77
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-089: Test sin aserciones: debería suscribirse a las conversaciones
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:92
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-090: Test sin aserciones: debería filtrar mensajes entre dos usuar
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:118
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-091: Test sin aserciones: debería enviar un mensaje de texto
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:141
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-092: Test sin aserciones: debería enviar un mensaje de alerta
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:160
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-093: Test sin aserciones: debería retornar null si falla el envío
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:169
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-094: Test sin aserciones: debería marcar un mensaje como leído
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:180
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-095: Test sin aserciones: debería retornar false si falla
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:193
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-096: Test sin aserciones: debería suscribirse a los clientes de un
- **Archivo:** `tests\unit\lib\trainer\trainerClients.test.ts`:92
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-097: Test sin aserciones: debería manejar errores de suscripción
- **Archivo:** `tests\unit\lib\trainer\trainerClients.test.ts`:136
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-098: Test sin aserciones: debería retornar el perfil del cliente
- **Archivo:** `tests\unit\lib\trainer\trainerClients.test.ts`:152
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-099: Test sin aserciones: debería retornar null si el cliente no e
- **Archivo:** `tests\unit\lib\trainer\trainerClients.test.ts`:174
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-100: Test sin aserciones: debería retornar null si falla la consul
- **Archivo:** `tests\unit\lib\trainer\trainerClients.test.ts`:187
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-101: Test sin aserciones: debería suscribirse a las dietas del ent
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:103
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-102: Test sin aserciones: debería suscribirse a las dietas de un c
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:121
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-103: Test sin aserciones: debería crear una dieta exitosamente
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:137
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-104: Test sin aserciones: debería retornar null si falla la creaci
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:146
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-105: Test sin aserciones: debería actualizar una dieta exitosament
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:157
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-106: Test sin aserciones: debería retornar false si falla
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:166
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-107: Test sin aserciones: debería eliminar una dieta exitosamente
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:177
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-108: Test sin aserciones: debería retornar false si falla
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:186
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-109: Test sin aserciones: debería establecer __trainerId en window
- **Archivo:** `tests\unit\lib\trainer\trainerInit.test.ts`:16
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-110: Test sin aserciones: debería suscribirse al progreso de un cl
- **Archivo:** `tests\unit\lib\trainer\trainerProgress.test.ts`:92
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-111: Test sin aserciones: debería manejar errores de suscripción
- **Archivo:** `tests\unit\lib\trainer\trainerProgress.test.ts`:136
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-112: Test sin aserciones: debería renderizar una tarjeta de client
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:66
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-113: Test sin aserciones: debería incluir onclick si se proporcion
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:75
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-114: Test sin aserciones: debería mostrar badge de alerta activa
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:83
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-115: Test sin aserciones: debería mostrar badge de admin si el rol
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:91
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-116: Test sin aserciones: debería renderizar una tarjeta de rutina
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:101
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-117: Test sin aserciones: debería mostrar la descripción truncada
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:110
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-118: Test sin aserciones: debería renderizar una tarjeta de dieta
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:119
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-119: Test sin aserciones: debería renderizar un mensaje propio (al
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:131
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-120: Test sin aserciones: debería renderizar un mensaje de otro (a
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:141
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-121: Test sin aserciones: debería mostrar badge de alerta para men
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:150
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-122: Test sin aserciones: no debería mostrar nombre del remitente 
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:163
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-123: Test sin aserciones: debería suscribirse a las rutinas del en
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:103
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-124: Test sin aserciones: debería suscribirse a las rutinas de un 
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:128
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-125: Test sin aserciones: debería crear una rutina exitosamente
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:144
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-126: Test sin aserciones: debería retornar null si falla la creaci
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:154
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-127: Test sin aserciones: debería actualizar una rutina exitosamen
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:165
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-128: Test sin aserciones: debería retornar false si falla la actua
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:174
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-129: Test sin aserciones: debería eliminar una rutina exitosamente
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:185
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-130: Test sin aserciones: debería retornar false si falla la elimi
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:194
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-131: Test sin aserciones: ✅ should return all users with correct s
- **Archivo:** `tests\unit\services\adminService.test.ts`:92
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-132: Test sin aserciones: ✅ should handle missing fields gracefull
- **Archivo:** `tests\unit\services\adminService.test.ts`:108
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-133: Test sin aserciones: ✅ should return empty array when no user
- **Archivo:** `tests\unit\services\adminService.test.ts`:127
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-134: Test sin aserciones: ✅ should filter users by role
- **Archivo:** `tests\unit\services\adminService.test.ts`:143
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-135: Test sin aserciones: ✅ should return empty array when no user
- **Archivo:** `tests\unit\services\adminService.test.ts`:156
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-136: Test sin aserciones: ✅ should calculate correct stats from us
- **Archivo:** `tests\unit\services\adminService.test.ts`:218
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-137: Test sin aserciones: ✅ should return zeros when no users exis
- **Archivo:** `tests\unit\services\adminService.test.ts`:237
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-138: Test sin aserciones: ✅ should return user data on successful 
- **Archivo:** `tests\unit\services\authService.test.ts`:104
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-139: Test sin aserciones: ⚠️ should auto-create profile if user pr
- **Archivo:** `tests\unit\services\authService.test.ts`:137
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-140: Test sin aserciones: ✅ should create user in Firebase Auth an
- **Archivo:** `tests\unit\services\authService.test.ts`:163
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-141: Test sin aserciones: ✅ should login with Google and return ex
- **Archivo:** `tests\unit\services\authService.test.ts`:246
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-142: Test sin aserciones: ✅ should create new profile if user does
- **Archivo:** `tests\unit\services\authService.test.ts`:264
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-143: Test sin aserciones: ✅ should load profile successfully
- **Archivo:** `tests\unit\services\profileService.test.ts`:137
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-144: Test sin aserciones: ✅ should load profile with assigned trai
- **Archivo:** `tests\unit\services\profileService.test.ts`:161
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-145: Test sin aserciones: ✅ should return null when document does 
- **Archivo:** `tests\unit\services\profileService.test.ts`:190
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-146: Test sin aserciones: ✅ should update profile successfully
- **Archivo:** `tests\unit\services\profileService.test.ts`:211
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-147: Test sin aserciones: ⚠️ should return error result on Firesto
- **Archivo:** `tests\unit\services\profileService.test.ts`:226
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-148: Test sin aserciones: ✅ should change password successfully
- **Archivo:** `tests\unit\services\profileService.test.ts`:257
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-149: Test sin aserciones: ⚠️ should return error result on auth er
- **Archivo:** `tests\unit\services\profileService.test.ts`:267
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-150: Test sin aserciones: todas las keys en es deben existir en en
- **Archivo:** `tests\unit\utils\translations.test.ts`:233
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-151: Test sin aserciones: todas las keys en en deben existir en es
- **Archivo:** `tests\unit\utils\translations.test.ts`:241
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-152: Test sin aserciones: todas las keys en es deben existir en en
- **Archivo:** `tests\unit\utils\translations.test.ts`:249
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-153: Archivo sin test: src\lib\admin\adminTranslations.ts
- **Archivo:** `src\lib\admin\adminTranslations.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-154: Archivo sin test: src\lib\auth\sessionHelper.ts
- **Archivo:** `src\lib\auth\sessionHelper.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-155: Archivo sin test: src\lib\auth\userWatcher.ts
- **Archivo:** `src\lib\auth\userWatcher.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-156: Archivo sin test: src\lib\client\achievementsService.ts
- **Archivo:** `src\lib\client\achievementsService.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-157: Archivo sin test: src\lib\client\adherenceService.ts
- **Archivo:** `src\lib\client\adherenceService.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-158: Archivo sin test: src\lib\client\animations.ts
- **Archivo:** `src\lib\client\animations.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-159: Archivo sin test: src\lib\client\intoleranceChecker.ts
- **Archivo:** `src\lib\client\intoleranceChecker.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-160: Archivo sin test: src\lib\client\onboardingService.ts
- **Archivo:** `src\lib\client\onboardingService.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-161: Archivo sin test: src\lib\client\supportService.ts
- **Archivo:** `src\lib\client\supportService.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-162: Archivo sin test: src\lib\devtools\autofillers.ts
- **Archivo:** `src\lib\devtools\autofillers.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-163: Archivo sin test: src\lib\devtools\detector.ts
- **Archivo:** `src\lib\devtools\detector.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-164: Archivo sin test: src\lib\devtools\logStore.ts
- **Archivo:** `src\lib\devtools\logStore.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-165: Archivo sin test: src\lib\devtools\panel.ts
- **Archivo:** `src\lib\devtools\panel.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-166: Archivo sin test: src\lib\devtools\seedData.ts
- **Archivo:** `src\lib\devtools\seedData.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-167: Archivo sin test: src\lib\i18n\server.ts
- **Archivo:** `src\lib\i18n\server.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-168: Archivo sin test: src\lib\storage\r2Service.ts
- **Archivo:** `src\lib\storage\r2Service.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

---

## 🤖 i18n (audit-i18n)

**Archivos escaneados:** 36 | **Duración:** 0.02s

### 🟢 BAJO (17)

#### I18N-001: Texto hardcodeado: "No hay conversaciones..."
- **Archivo:** `src\pages\admin\chat.astro`:81
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-002: Texto hardcodeado: "Aún no se ha iniciado ninguna conversaci..."
- **Archivo:** `src\pages\admin\chat.astro`:82
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-003: Texto hardcodeado: "No hay dietas registradas..."
- **Archivo:** `src\pages\admin\diets.astro`:103
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-004: Texto hardcodeado: "No hay datos de progreso..."
- **Archivo:** `src\pages\admin\progress.astro`:100
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-005: Texto hardcodeado: "Los clientes aún no han registrado datos..."
- **Archivo:** `src\pages\admin\progress.astro`:101
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-006: Texto hardcodeado: "Usuario no encontrado..."
- **Archivo:** `src\pages\admin\users.astro`:655
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-007: Texto hardcodeado: "Este cliente no ha completado su perfil ..."
- **Archivo:** `src\pages\admin\users.astro`:665
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-008: Texto hardcodeado: "No hay alertas médicas registradas..."
- **Archivo:** `src\pages\admin\users.astro`:727
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-009: Texto hardcodeado: "Error al cargar el perfil médico..."
- **Archivo:** `src\pages\admin\users.astro`:736
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-010: Texto hardcodeado: "No hay rutinas registradas..."
- **Archivo:** `src\pages\admin\workouts.astro`:100
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-011: Texto hardcodeado: "Los entrenadores aún no han creado rutin..."
- **Archivo:** `src\pages\admin\workouts.astro`:101
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-012: Texto hardcodeado: "Próximamente..."
- **Archivo:** `src\pages\client\progress.astro`:112
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-013: Texto hardcodeado: "Tus datos personales y médicos se almace..."
- **Archivo:** `src\pages\terms.astro`:20
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-014: Texto hardcodeado: "Sin conversaciones aún..."
- **Archivo:** `src\pages\trainer\chat.astro`:333
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-015: Texto hardcodeado: "Sin resultados para el filtro selecciona..."
- **Archivo:** `src\pages\trainer\chat.astro`:341
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-016: Texto hardcodeado: "No se encontraron contactos..."
- **Archivo:** `src\pages\trainer\chat.astro`:396
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-017: Texto hardcodeado: "Personalizada..."
- **Archivo:** `src\pages\trainer\diets.astro`:395
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

---

## 🎯 Plan de Acción Priorizado

| # | ID | Severidad | Título | Archivo | Agente |
|---|-----|-----------|--------|---------|--------|
| 1 | SEC-001 | 🔴 CRITICAL | Ruta no protegida: /trainer/clinical | `src/lib/routeGuards.ts` | audit-security |
| 2 | SEC-002 | 🔴 CRITICAL | Ruta no protegida: /client/support | `src/lib/routeGuards.ts` | audit-security |
| 3 | SEC-003 | 🔴 CRITICAL | Ruta no protegida: /client/settings | `src/lib/routeGuards.ts` | audit-security |
| 4 | QUAL-001 | 🔴 CRITICAL | Archivo > 300 líneas (591 líneas) | `src\components\settings\UnifiedSettingsView.astro` | audit-quality |
| 5 | QUAL-003 | 🔴 CRITICAL | Archivo > 300 líneas (504 líneas) | `src\i18n\locales\ca.ts` | audit-quality |
| 6 | QUAL-004 | 🔴 CRITICAL | Archivo > 300 líneas (752 líneas) | `src\i18n\locales\en.ts` | audit-quality |
| 7 | QUAL-005 | 🔴 CRITICAL | Archivo > 300 líneas (979 líneas) | `src\i18n\locales\es.ts` | audit-quality |
| 8 | QUAL-006 | 🔴 CRITICAL | Archivo > 300 líneas (771 líneas) | `src\layouts\BaseLayout.astro` | audit-quality |
| 9 | QUAL-025 | 🔴 CRITICAL | Archivo > 300 líneas (924 líneas) | `src\lib\devtools\seedData.ts` | audit-quality |
| 10 | QUAL-039 | 🔴 CRITICAL | Archivo > 300 líneas (822 líneas) | `src\pages\admin\users.astro` | audit-quality |
| 11 | QUAL-047 | 🔴 CRITICAL | Archivo > 300 líneas (678 líneas) | `src\pages\client\diets.astro` | audit-quality |
| 12 | QUAL-052 | 🔴 CRITICAL | Archivo > 300 líneas (513 líneas) | `src\pages\trainer\chat.astro` | audit-quality |
| 13 | QUAL-054 | 🔴 CRITICAL | Archivo > 300 líneas (772 líneas) | `src\pages\trainer\diets.astro` | audit-quality |
| 14 | QUAL-002 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\components\settings\UnifiedSettingsView.astro` | audit-quality |
| 15 | QUAL-007 | 🟡 MEDIUM | console.error en lugar de logger | `src\layouts\BaseLayout.astro` | audit-quality |
| 16 | QUAL-009 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\lib\admin\adminSubscriptions.ts` | audit-quality |
| 17 | QUAL-010 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\lib\admin\adminSubscriptions.ts` | audit-quality |
| 18 | QUAL-011 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\lib\client\achievementsService.ts` | audit-quality |
| 19 | QUAL-012 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\lib\client\clientInit.ts` | audit-quality |
| 20 | QUAL-013 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\lib\client\clientInit.ts` | audit-quality |
| 21 | QUAL-014 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\lib\debug\debugDataLogger.ts` | audit-quality |
| 22 | QUAL-015 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\lib\debug\debugDataLogger.ts` | audit-quality |
| 23 | QUAL-016 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\lib\debug\debugDataLogger.ts` | audit-quality |
| 24 | QUAL-017 | 🟡 MEDIUM | Archivo > 300 líneas (485 líneas) | `src\lib\debug\firestoreDebug.ts` | audit-quality |
| 25 | QUAL-018 | 🟡 MEDIUM | console.warn en lugar de logger | `src\lib\devtools\detector.ts` | audit-quality |
| 26 | QUAL-019 | 🟡 MEDIUM | console.warn en lugar de logger | `src\lib\devtools\detector.ts` | audit-quality |
| 27 | QUAL-020 | 🟡 MEDIUM | console.log en lugar de logger | `src\lib\devtools\detector.ts` | audit-quality |
| 28 | QUAL-021 | 🟡 MEDIUM | console.info en lugar de logger | `src\lib\devtools\logStore.ts` | audit-quality |
| 29 | QUAL-022 | 🟡 MEDIUM | console.log en lugar de logger | `src\lib\devtools\panel.ts` | audit-quality |
| 30 | QUAL-023 | 🟡 MEDIUM | console.log en lugar de logger | `src\lib\devtools\panel.ts` | audit-quality |

> ... y 247 más (ver secciones detalladas arriba)

---

## 📎 Comandos de Verificación

```bash
# Build
npx astro build 2>&1 | findstr error

# TypeScript
npx tsc --noEmit 2>&1

# Tests
npx vitest run 2>&1 | findstr FAIL

# Buscar console.* sin logger
findstr /S "console\.(log|error|warn)" src\*.ts src\*.astro

# Buscar window.__
findstr /S "window\.__" src\

# Buscar any
findstr /S ": any" src\*.ts

# Clases hardcodeadas
findstr /S "bg-zinc-" src\*.astro
findstr /S "text-zinc-" src\*.astro
```

---

> **Generado por:** CampFit Multi-Agent Audit System v1.0
> **Agentes:** audit-security, audit-quality, audit-performance, audit-uiux, audit-testing, audit-i18n
