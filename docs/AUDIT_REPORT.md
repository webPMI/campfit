# 🔍 CampFit Multi-Agent Audit Report

> **Fecha:** 2026-08-19T19:34:47.504Z  
> **Agentes desplegados:** 6  
> **Archivos escaneados:** 738  
> **Duración total:** 1.93s  

---

## 📊 Resumen Consolidado

| Severidad | Cantidad |
|-----------|----------|
| 🔴 CRÍTICO | 23 |
| 🟡 MEDIO | 151 |
| 🟢 BAJO | 576 |
| **TOTAL** | **750** |

### Por Agente

| Agente | Findings | Críticos | Medios | Bajos | Archivos | Duración |
|--------|---------|----------|--------|-------|----------|----------|
| audit-security | 10 | 0 | 0 | 10 | 202 | 0.45s |
| audit-quality | 145 | 23 | 118 | 4 | 198 | 0.29s |
| audit-performance | 25 | 0 | 25 | 0 | 101 | 0.18s |
| audit-uiux | 279 | 0 | 1 | 278 | 98 | 0.18s |
| audit-testing | 205 | 0 | 7 | 198 | 95 | 0.72s |
| audit-i18n | 86 | 0 | 0 | 86 | 44 | 0.10s |

---

## 🤖 Security (audit-security)

**Archivos escaneados:** 202 | **Duración:** 0.45s

### 🟢 BAJO (10)

#### SEC-001: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:358
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

#### SEC-002: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\lib\devtools\detector.ts`:107
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

#### SEC-003: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\pages\api\admin\logs\token.ts`:52
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

#### SEC-004: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\pages\api\admin\logs\token.ts`:52
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

#### SEC-005: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\pages\api\ia\logs.ts`:95
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

#### SEC-006: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\pages\api\support\create.ts`:135
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

#### SEC-007: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\pages\api\support\create.ts`:135
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

#### SEC-008: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\pages\api\support\update.ts`:209
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

#### SEC-009: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\pages\client\chat.astro`:291
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

#### SEC-010: Catch genérico con console.* en lugar de logger
- **Archivo:** `src\pages\client\chat.astro`:291
- **Descripción:** Bloque catch usa console.* en lugar del logger estructurado.
- **Recomendación:** Usar logger.error con contexto tipado

---

## 🤖 Code Quality (audit-quality)

**Archivos escaneados:** 198 | **Duración:** 0.29s

### 🔴 CRÍTICO (23)

#### QUAL-001: Archivo > 300 líneas (821 líneas)
- **Archivo:** `src\components\calendar\TimeGrid.astro`:821
- **Descripción:** El archivo tiene 821 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-011: Archivo > 300 líneas (597 líneas)
- **Archivo:** `src\components\settings\UnifiedSettingsView.astro`:597
- **Descripción:** El archivo tiene 597 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-013: Archivo > 300 líneas (736 líneas)
- **Archivo:** `src\i18n\locales\ca.ts`:736
- **Descripción:** El archivo tiene 736 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-014: Archivo > 300 líneas (948 líneas)
- **Archivo:** `src\i18n\locales\en.ts`:948
- **Descripción:** El archivo tiene 948 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-015: Archivo > 300 líneas (985 líneas)
- **Archivo:** `src\i18n\locales\es.ts`:985
- **Descripción:** El archivo tiene 985 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-016: Archivo > 300 líneas (649 líneas)
- **Archivo:** `src\layouts\AdminLayout.astro`:649
- **Descripción:** El archivo tiene 649 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-017: Archivo > 300 líneas (787 líneas)
- **Archivo:** `src\layouts\BaseLayout.astro`:787
- **Descripción:** El archivo tiene 787 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-029: Archivo > 300 líneas (515 líneas)
- **Archivo:** `src\lib\data\foodsCatalog.ts`:515
- **Descripción:** El archivo tiene 515 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-042: Archivo > 300 líneas (1264 líneas)
- **Archivo:** `src\lib\devtools\seedData.ts`:1264
- **Descripción:** El archivo tiene 1264 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-063: Archivo > 300 líneas (756 líneas)
- **Archivo:** `src\lib\shared\logService.ts`:756
- **Descripción:** El archivo tiene 756 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-083: Archivo > 300 líneas (656 líneas)
- **Archivo:** `src\pages\admin\exercises.astro`:656
- **Descripción:** El archivo tiene 656 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-084: Archivo > 300 líneas (739 líneas)
- **Archivo:** `src\pages\admin\foods.astro`:739
- **Descripción:** El archivo tiene 739 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-085: Archivo > 300 líneas (520 líneas)
- **Archivo:** `src\pages\admin\logs.astro`:520
- **Descripción:** El archivo tiene 520 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-087: Archivo > 300 líneas (792 líneas)
- **Archivo:** `src\pages\admin\seeds.astro`:792
- **Descripción:** El archivo tiene 792 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-093: Archivo > 300 líneas (1050 líneas)
- **Archivo:** `src\pages\admin\users.astro`:1050
- **Descripción:** El archivo tiene 1050 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-110: Archivo > 300 líneas (777 líneas)
- **Archivo:** `src\pages\client\diets.astro`:777
- **Descripción:** El archivo tiene 777 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-112: Archivo > 300 líneas (737 líneas)
- **Archivo:** `src\pages\client\progress.astro`:737
- **Descripción:** El archivo tiene 737 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-118: Archivo > 300 líneas (1104 líneas)
- **Archivo:** `src\pages\client\workouts.astro`:1104
- **Descripción:** El archivo tiene 1104 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-122: Archivo > 300 líneas (750 líneas)
- **Archivo:** `src\pages\onboarding.astro`:750
- **Descripción:** El archivo tiene 750 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-123: Archivo > 300 líneas (520 líneas)
- **Archivo:** `src\pages\register.astro`:520
- **Descripción:** El archivo tiene 520 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-124: Archivo > 300 líneas (588 líneas)
- **Archivo:** `src\pages\trainer\chat.astro`:588
- **Descripción:** El archivo tiene 588 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-126: Archivo > 300 líneas (1324 líneas)
- **Archivo:** `src\pages\trainer\diets.astro`:1324
- **Descripción:** El archivo tiene 1324 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-128: Archivo > 300 líneas (1269 líneas)
- **Archivo:** `src\pages\trainer\workouts.astro`:1269
- **Descripción:** El archivo tiene 1269 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

### 🟡 MEDIO (118)

#### QUAL-002: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\components\calendar\TimeGrid.astro`:208
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-003: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\components\calendar\TimeGrid.astro`:303
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-004: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\components\calendar\TimeGrid.astro`:306
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-005: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\components\calendar\TimeGrid.astro`:325
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-006: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\components\calendar\TimeGrid.astro`:500
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-007: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\components\calendar\TimeGrid.astro`:509
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-008: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\components\calendar\TimeGrid.astro`:605
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-009: Archivo > 300 líneas (481 líneas)
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:481
- **Descripción:** El archivo tiene 481 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-010: console.log en lugar de logger
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:359
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-012: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\components\settings\UnifiedSettingsView.astro`:333
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-018: console.error en lugar de logger
- **Archivo:** `src\layouts\BaseLayout.astro`:44
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-020: Archivo > 300 líneas (336 líneas)
- **Archivo:** `src\lib\admin\adminRender.ts`:336
- **Descripción:** El archivo tiene 336 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-021: Archivo > 300 líneas (312 líneas)
- **Archivo:** `src\lib\admin\adminSubscriptions.ts`:312
- **Descripción:** El archivo tiene 312 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-022: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\admin\adminSubscriptions.ts`:218
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-023: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\admin\adminSubscriptions.ts`:219
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-024: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\client\achievementsService.ts`:38
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-025: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\client\clientInit.ts`:26
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-026: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\client\clientInit.ts`:26
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-027: Archivo > 300 líneas (301 líneas)
- **Archivo:** `src\lib\client\exercisePreferencesService.ts`:301
- **Descripción:** El archivo tiene 301 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-028: Archivo > 300 líneas (368 líneas)
- **Archivo:** `src\lib\client\intoleranceChecker.ts`:368
- **Descripción:** El archivo tiene 368 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-030: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\debug\debugDataLogger.ts`:96
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-031: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\debug\debugDataLogger.ts`:127
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-032: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\debug\debugDataLogger.ts`:145
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-033: Archivo > 300 líneas (485 líneas)
- **Archivo:** `src\lib\debug\firestoreDebug.ts`:485
- **Descripción:** El archivo tiene 485 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-034: Archivo > 300 líneas (345 líneas)
- **Archivo:** `src\lib\debug\logViewer.ts`:345
- **Descripción:** El archivo tiene 345 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-035: console.warn en lugar de logger
- **Archivo:** `src\lib\devtools\detector.ts`:65
- **Descripción:** Usa console.warn() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-036: console.warn en lugar de logger
- **Archivo:** `src\lib\devtools\detector.ts`:108
- **Descripción:** Usa console.warn() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-037: console.log en lugar de logger
- **Archivo:** `src\lib\devtools\detector.ts`:145
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-038: console.info en lugar de logger
- **Archivo:** `src\lib\devtools\logStore.ts`:71
- **Descripción:** Usa console.info() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-039: console.log en lugar de logger
- **Archivo:** `src\lib\devtools\panel.ts`:175
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-040: console.log en lugar de logger
- **Archivo:** `src\lib\devtools\panel.ts`:189
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-041: console.log en lugar de logger
- **Archivo:** `src\lib\devtools\panel.ts`:200
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-043: Archivo > 300 líneas (337 líneas)
- **Archivo:** `src\lib\devtools\seedParser.ts`:337
- **Descripción:** El archivo tiene 337 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-044: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\devtools\seedParser.ts`:87
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-045: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\devtools\seedParser.ts`:220
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-046: Archivo > 300 líneas (318 líneas)
- **Archivo:** `src\lib\devtools\seedService.ts`:318
- **Descripción:** El archivo tiene 318 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-047: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\notifications\notificationService.ts`:127
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-048: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\notifications\notificationService.ts`:145
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-049: Archivo > 300 líneas (306 líneas)
- **Archivo:** `src\lib\server\r2Client.ts`:306
- **Descripción:** El archivo tiene 306 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-050: Archivo > 300 líneas (400 líneas)
- **Archivo:** `src\lib\shared\chat.ts`:400
- **Descripción:** El archivo tiene 400 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-051: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\chat.ts`:27
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-052: Archivo > 300 líneas (472 líneas)
- **Archivo:** `src\lib\shared\exerciseLibrary.ts`:472
- **Descripción:** El archivo tiene 472 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-053: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\exerciseLibrary.ts`:136
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-054: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\exerciseLibrary.ts`:137
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-055: Archivo > 300 líneas (438 líneas)
- **Archivo:** `src\lib\shared\foodLibrary.ts`:438
- **Descripción:** El archivo tiene 438 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-056: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\foodLibrary.ts`:115
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-057: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\foodLibrary.ts`:116
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-058: Archivo > 300 líneas (309 líneas)
- **Archivo:** `src\lib\shared\hydrationService.ts`:309
- **Descripción:** El archivo tiene 309 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-059: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\initPage.ts`:24
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-060: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\initPage.ts`:24
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-061: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\initPage.ts`:37
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-062: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\shared\initPage.ts`:49
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-064: Archivo > 300 líneas (417 líneas)
- **Archivo:** `src\lib\shared\profileService.ts`:417
- **Descripción:** El archivo tiene 417 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-065: console.log en lugar de logger
- **Archivo:** `src\lib\shared\techniqueCorrectionService.ts`:68
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-066: console.log en lugar de logger
- **Archivo:** `src\lib\shared\techniqueCorrectionService.ts`:86
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-067: console.log en lugar de logger
- **Archivo:** `src\lib\shared\techniqueCorrectionService.ts`:107
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-068: Archivo > 300 líneas (442 líneas)
- **Archivo:** `src\lib\shared\ui.ts`:442
- **Descripción:** El archivo tiene 442 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-069: Archivo > 300 líneas (393 líneas)
- **Archivo:** `src\lib\storage\r2Service.ts`:393
- **Descripción:** El archivo tiene 393 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-070: console.log en lugar de logger
- **Archivo:** `src\lib\storage\r2Service.ts`:150
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-071: console.log en lugar de logger
- **Archivo:** `src\lib\storage\r2Service.ts`:161
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-072: console.log en lugar de logger
- **Archivo:** `src\lib\storage\r2Service.ts`:181
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-073: console.warn en lugar de logger
- **Archivo:** `src\lib\storage\r2Service.ts`:191
- **Descripción:** Usa console.warn() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-074: console.warn en lugar de logger
- **Archivo:** `src\lib\storage\r2Service.ts`:194
- **Descripción:** Usa console.warn() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-075: console.log en lugar de logger
- **Archivo:** `src\lib\storage\r2Service.ts`:204
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-076: console.warn en lugar de logger
- **Archivo:** `src\lib\storage\r2Service.ts`:213
- **Descripción:** Usa console.warn() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-077: Archivo > 300 líneas (492 líneas)
- **Archivo:** `src\lib\trainer\templateService.ts`:492
- **Descripción:** El archivo tiene 492 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-078: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\trainer\templateService.ts`:398
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-079: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\lib\trainer\templateService.ts`:459
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-080: Archivo > 300 líneas (367 líneas)
- **Archivo:** `src\pages\admin\clinical.astro`:367
- **Descripción:** El archivo tiene 367 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-081: Archivo > 300 líneas (411 líneas)
- **Archivo:** `src\pages\admin\dashboard.astro`:411
- **Descripción:** El archivo tiene 411 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-082: Archivo > 300 líneas (338 líneas)
- **Archivo:** `src\pages\admin\diets.astro`:338
- **Descripción:** El archivo tiene 338 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-086: Archivo > 300 líneas (317 líneas)
- **Archivo:** `src\pages\admin\progress.astro`:317
- **Descripción:** El archivo tiene 317 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-088: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\pages\admin\seeds.astro`:353
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-090: Archivo > 300 líneas (469 líneas)
- **Archivo:** `src\pages\admin\tickets.astro`:469
- **Descripción:** El archivo tiene 469 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-091: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\pages\admin\tickets.astro`:463
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-092: console.error en lugar de logger
- **Archivo:** `src\pages\admin\tickets.astro`:431
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-094: Archivo > 300 líneas (318 líneas)
- **Archivo:** `src\pages\admin\workouts.astro`:318
- **Descripción:** El archivo tiene 318 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-095: console.error en lugar de logger
- **Archivo:** `src\pages\api\admin\logs\query.ts`:188
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-096: console.error en lugar de logger
- **Archivo:** `src\pages\api\admin\logs\token.ts`:53
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-097: console.error en lugar de logger
- **Archivo:** `src\pages\api\ia\logs.ts`:96
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-098: console.error en lugar de logger
- **Archivo:** `src\pages\api\support\create.ts`:136
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-099: console.error en lugar de logger
- **Archivo:** `src\pages\api\support\create.ts`:282
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-100: console.error en lugar de logger
- **Archivo:** `src\pages\api\support\update.ts`:210
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-101: Archivo > 300 líneas (346 líneas)
- **Archivo:** `src\pages\client\chat.astro`:346
- **Descripción:** El archivo tiene 346 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-102: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\pages\client\chat.astro`:123
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-103: console.error en lugar de logger
- **Archivo:** `src\pages\client\chat.astro`:283
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-104: console.error en lugar de logger
- **Archivo:** `src\pages\client\chat.astro`:292
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-105: console.error en lugar de logger
- **Archivo:** `src\pages\client\chat.astro`:334
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-106: Archivo > 300 líneas (476 líneas)
- **Archivo:** `src\pages\client\dashboard.astro`:476
- **Descripción:** El archivo tiene 476 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-107: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\pages\client\dashboard.astro`:376
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-108: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\pages\client\dashboard.astro`:384
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-109: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\pages\client\dashboard.astro`:426
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-111: Archivo > 300 líneas (480 líneas)
- **Archivo:** `src\pages\client\medical-profile.astro`:480
- **Descripción:** El archivo tiene 480 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-113: console.log en lugar de logger
- **Archivo:** `src\pages\client\progress.astro`:521
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-114: console.log en lugar de logger
- **Archivo:** `src\pages\client\progress.astro`:534
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-115: console.error en lugar de logger
- **Archivo:** `src\pages\client\progress.astro`:545
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-116: Archivo > 300 líneas (338 líneas)
- **Archivo:** `src\pages\client\support\my-tickets.astro`:338
- **Descripción:** El archivo tiene 338 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-117: Archivo > 300 líneas (383 líneas)
- **Archivo:** `src\pages\client\support\report.astro`:383
- **Descripción:** El archivo tiene 383 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-119: console.log en lugar de logger
- **Archivo:** `src\pages\client\workouts.astro`:453
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-120: console.log en lugar de logger
- **Archivo:** `src\pages\client\workouts.astro`:472
- **Descripción:** Usa console.log() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-121: console.error en lugar de logger
- **Archivo:** `src\pages\client\workouts.astro`:476
- **Descripción:** Usa console.error() en lugar del sistema de logging estructurado.
- **Recomendación:** Usar logger.info/warn/error con contexto

#### QUAL-125: Archivo > 300 líneas (344 líneas)
- **Archivo:** `src\pages\trainer\clinical.astro`:344
- **Descripción:** El archivo tiene 344 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-130: Archivo > 300 líneas (325 líneas)
- **Archivo:** `src\services\authService.ts`:325
- **Descripción:** El archivo tiene 325 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-131: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\stores\dailyScheduleStore.ts`:79
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-132: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\stores\dailyScheduleStore.ts`:116
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-133: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\stores\dailyScheduleStore.ts`:137
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-134: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\stores\dailyScheduleStore.ts`:176
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-135: Archivo > 300 líneas (396 líneas)
- **Archivo:** `src\stores\themeStore.ts`:396
- **Descripción:** El archivo tiene 396 líneas, violando Golden Rule #9 (máximo 300).
- **Recomendación:** Refactorizar en componentes/archivos más pequeños

#### QUAL-136: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:18
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-137: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:22
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-138: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:24
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-139: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:25
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-140: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:26
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-141: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:55
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-142: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:80
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-143: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:117
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-144: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:118
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

#### QUAL-145: Uso de `any` (Golden Rule #1 violada)
- **Archivo:** `src\types\index.ts`:149
- **Descripción:** Tipo `any` detectado. Debe tiparse explícitamente.
- **Recomendación:** Crear una interface o usar un tipo específico

### 🟢 BAJO (4)

#### QUAL-019: Bloque <style> inline (CSP)
- **Archivo:** `src\layouts\BaseLayout.astro`
- **Descripción:** El bloque <style> inline puede romper la política CSP.
- **Recomendación:** Mover estilos a archivos CSS externos o usar Tailwind

#### QUAL-089: Bloque <style> inline (CSP)
- **Archivo:** `src\pages\admin\seeds.astro`
- **Descripción:** El bloque <style> inline puede romper la política CSP.
- **Recomendación:** Mover estilos a archivos CSS externos o usar Tailwind

#### QUAL-127: Bloque <style> inline (CSP)
- **Archivo:** `src\pages\trainer\diets.astro`
- **Descripción:** El bloque <style> inline puede romper la política CSP.
- **Recomendación:** Mover estilos a archivos CSS externos o usar Tailwind

#### QUAL-129: Bloque <style> inline (CSP)
- **Archivo:** `src\pages\trainer\workouts.astro`
- **Descripción:** El bloque <style> inline puede romper la política CSP.
- **Recomendación:** Mover estilos a archivos CSS externos o usar Tailwind

---

## 🤖 Performance (audit-performance)

**Archivos escaneados:** 101 | **Duración:** 0.18s

### 🟡 MEDIO (25)

#### PERF-001: subscribeToCollectionCount (anti-pattern)
- **Archivo:** `src\lib\admin\adminSubscriptions.ts`
- **Descripción:** Usa subscribeToCollectionCount que es ineficiente. Debe usar count() aggregation.
- **Recomendación:** Reemplazar con firestore().collection().count().get()

#### PERF-002: subscribeToCollectionCount (anti-pattern)
- **Archivo:** `src\lib\admin\adminUtils.ts`
- **Descripción:** Usa subscribeToCollectionCount que es ineficiente. Debe usar count() aggregation.
- **Recomendación:** Reemplazar con firestore().collection().count().get()

#### PERF-003: onSnapshot sin unsubscribe visible
- **Archivo:** `src\lib\client\dietService.ts`:178
- **Descripción:** Suscripción onSnapshot sin unsubscribe explícito puede causar memory leaks.
- **Recomendación:** Guardar el return de onSnapshot y llamar unsubscribe en cleanup

#### PERF-004: onSnapshot sin unsubscribe visible
- **Archivo:** `src\lib\client\exercisePreferencesService.ts`:49
- **Descripción:** Suscripción onSnapshot sin unsubscribe explícito puede causar memory leaks.
- **Recomendación:** Guardar el return de onSnapshot y llamar unsubscribe en cleanup

#### PERF-005: onSnapshot sin unsubscribe visible
- **Archivo:** `src\lib\client\workoutService.ts`:124
- **Descripción:** Suscripción onSnapshot sin unsubscribe explícito puede causar memory leaks.
- **Recomendación:** Guardar el return de onSnapshot y llamar unsubscribe en cleanup

#### PERF-006: onSnapshot sin unsubscribe visible
- **Archivo:** `src\lib\shared\techniqueCorrectionService.ts`:157
- **Descripción:** Suscripción onSnapshot sin unsubscribe explícito puede causar memory leaks.
- **Recomendación:** Guardar el return de onSnapshot y llamar unsubscribe en cleanup

#### PERF-007: onSnapshot sin unsubscribe visible
- **Archivo:** `src\lib\trainer\templateService.ts`:154
- **Descripción:** Suscripción onSnapshot sin unsubscribe explícito puede causar memory leaks.
- **Recomendación:** Guardar el return de onSnapshot y llamar unsubscribe en cleanup

#### PERF-008: onSnapshot sin unsubscribe visible
- **Archivo:** `src\lib\trainer\templateService.ts`:197
- **Descripción:** Suscripción onSnapshot sin unsubscribe explícito puede causar memory leaks.
- **Recomendación:** Guardar el return de onSnapshot y llamar unsubscribe en cleanup

#### PERF-009: onSnapshot sin unsubscribe visible
- **Archivo:** `src\lib\trainer\trainerChat.ts`:68
- **Descripción:** Suscripción onSnapshot sin unsubscribe explícito puede causar memory leaks.
- **Recomendación:** Guardar el return de onSnapshot y llamar unsubscribe en cleanup

#### PERF-010: onSnapshot sin unsubscribe visible
- **Archivo:** `src\lib\trainer\trainerWorkouts.ts`:40
- **Descripción:** Suscripción onSnapshot sin unsubscribe explícito puede causar memory leaks.
- **Recomendación:** Guardar el return de onSnapshot y llamar unsubscribe en cleanup

#### PERF-011: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\admin\logs\query.ts`:26
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-012: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\admin\logs\query.ts`:27
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-013: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\admin\logs\query.ts`:28
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-014: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\admin\logs\query.ts`:29
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-015: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\admin\logs\query.ts`:30
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-016: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\admin\logs\token.ts`:69
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-017: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\ia\logs.ts`:17
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-018: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\ia\logs.ts`:39
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-019: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\ia\logs.ts`:40
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-020: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\ia\logs.ts`:41
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-021: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\ia\logs.ts`:42
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-022: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\support\create.ts`:180
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-023: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\support\create.ts`:181
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-024: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\support\create.ts`:182
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

#### PERF-025: Consulta Firestore sin .limit()
- **Archivo:** `src\pages\api\support\create.ts`:183
- **Descripción:** Consulta a colección sin límite. Puede traer documentos excesivos.
- **Recomendación:** Agregar .limit(50) o implementar paginación

---

## 🤖 UI/UX (audit-uiux)

**Archivos escaneados:** 98 | **Duración:** 0.18s

### 🟡 MEDIO (1)

#### UIUX-279: Variables light/dark asimétricas
- **Archivo:** `public/theme-tokens.css`
- **Descripción:** :root tiene 95 variables, .dark tiene 0. Falta sincronización.
- **Recomendación:** Sincronizar variables entre light y dark mode

### 🟢 BAJO (278)

#### UIUX-001: Color hardcodeado: bg-zinc-100
- **Archivo:** `src\components\calendar\MealBlock.astro`:16
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-002: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\calendar\MealBlock.astro`:16
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-003: Color hardcodeado: text-zinc-500
- **Archivo:** `src\components\calendar\MealBlock.astro`:20
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-004: Color hardcodeado: text-zinc-500
- **Archivo:** `src\components\calendar\MealBlock.astro`:25
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-005: Color hardcodeado: bg-zinc-100
- **Archivo:** `src\components\calendar\WorkoutBlock.astro`:16
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-006: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\calendar\WorkoutBlock.astro`:16
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-007: Color hardcodeado: text-zinc-500
- **Archivo:** `src\components\calendar\WorkoutBlock.astro`:20
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-008: Color hardcodeado: text-zinc-500
- **Archivo:** `src\components\calendar\WorkoutBlock.astro`:25
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-009: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:57
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-010: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:66
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-011: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:67
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-012: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:68
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-013: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:163
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-014: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:168
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-015: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:27
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-016: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:51
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-017: Color hardcodeado: text-zinc-200
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:61
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-018: Color hardcodeado: text-zinc-500
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:66
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-019: Color hardcodeado: text-zinc-500
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:67
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-020: Color hardcodeado: text-zinc-500
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:68
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-021: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:90
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-022: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:124
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-023: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:157
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-024: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:165
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-025: Color hardcodeado: text-zinc-200
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:168
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-026: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\FeatureBentoGrid.astro`:173
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-027: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\HeroGold.astro`:57
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-028: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\landing\HeroGold.astro`:57
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-029: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\HeroGold.astro`:93
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-030: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\HeroGold.astro`:108
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-031: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\HeroGold.astro`:117
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-032: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\landing\HeroGold.astro`:122
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-033: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\HeroGold.astro`:37
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-034: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\HeroGold.astro`:45
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-035: Color hardcodeado: text-zinc-200
- **Archivo:** `src\components\landing\HeroGold.astro`:57
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-036: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\HeroGold.astro`:72
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-037: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\HeroGold.astro`:76
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-038: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\HeroGold.astro`:80
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-039: Color hardcodeado: text-zinc-200
- **Archivo:** `src\components\landing\HeroGold.astro`:113
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-040: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\HeroGold.astro`:125
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-041: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:33
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-042: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:58
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-043: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:87
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-044: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:96
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-045: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:106
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-046: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:116
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-047: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:157
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-048: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:163
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-049: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:173
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-050: Color hardcodeado: bg-zinc-700
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:175
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-051: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:181
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-052: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:214
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-053: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:220
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-054: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:225
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-055: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:230
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-056: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:27
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-057: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:36
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-058: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:43
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-059: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:50
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-060: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:69
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-061: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:72
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-062: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:90
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-063: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:101
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-064: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:111
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-065: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:121
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-066: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:139
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-067: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:142
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-068: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:165
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-069: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:181
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-070: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:196
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-071: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:199
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-072: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:221
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-073: Color hardcodeado: text-zinc-500
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:223
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-074: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:226
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-075: Color hardcodeado: text-zinc-500
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:228
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-076: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:231
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-077: Color hardcodeado: text-zinc-500
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:233
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-078: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:254
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-079: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:255
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-080: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:258
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-081: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\InteractivePreviewTabs.astro`:259
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-082: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\PublicFooter.astro`:14
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-083: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\PublicFooter.astro`:14
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-084: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\PublicFooter.astro`:22
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-085: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\PublicFooter.astro`:29
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-086: Color hardcodeado: text-zinc-500
- **Archivo:** `src\components\landing\PublicFooter.astro`:71
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-087: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\PublicFooter.astro`:73
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-088: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:39
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-089: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:41
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-090: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:130
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-091: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:131
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-092: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:132
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-093: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:169
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-094: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:251
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-095: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:251
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-096: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:257
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-097: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:269
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-098: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:269
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-099: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:275
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-100: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:287
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-101: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:287
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-102: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:293
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-103: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:414
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-104: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:417
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-105: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:422
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-106: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:33
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-107: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:70
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-108: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:72
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-109: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:89
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-110: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:91
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-111: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:108
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-112: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:110
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-113: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:127
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-114: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:130
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-115: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:131
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-116: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:132
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-117: Color hardcodeado: text-zinc-200
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:146
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-118: Color hardcodeado: text-zinc-100
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:186
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-119: Color hardcodeado: text-zinc-200
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:201
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-120: Color hardcodeado: text-zinc-200
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:217
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-121: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:239
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-122: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:257
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-123: Color hardcodeado: text-zinc-200
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:261
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-124: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:262
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-125: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:275
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-126: Color hardcodeado: text-zinc-200
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:279
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-127: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:280
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-128: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:293
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-129: Color hardcodeado: text-zinc-200
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:297
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-130: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:298
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-131: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:417
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-132: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\ScrollingVideoShowcase.astro`:425
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-133: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\TestimonialsGold.astro`:36
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-134: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\components\landing\TestimonialsGold.astro`:94
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-135: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\TestimonialsGold.astro`:27
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-136: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\TestimonialsGold.astro`:42
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-137: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\TestimonialsGold.astro`:49
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-138: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\TestimonialsGold.astro`:54
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-139: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\TestimonialsGold.astro`:65
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-140: Color hardcodeado: text-zinc-200
- **Archivo:** `src\components\landing\TestimonialsGold.astro`:72
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-141: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\TestimonialsGold.astro`:79
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-142: Color hardcodeado: text-zinc-300
- **Archivo:** `src\components\landing\TestimonialsGold.astro`:99
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-143: Color hardcodeado: text-zinc-950
- **Archivo:** `src\components\landing\TestimonialsGold.astro`:106
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-144: Color hardcodeado: text-zinc-400
- **Archivo:** `src\components\landing\TestimonialsGold.astro`:111
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-145: Color hardcodeado: text-zinc-400
- **Archivo:** `src\layouts\AdminLayout.astro`:561
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-146: Color hardcodeado: bg-zinc-500
- **Archivo:** `src\pages\admin\dashboard.astro`:254
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-147: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\admin\dashboard.astro`:254
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-148: Color hardcodeado: text-zinc-200
- **Archivo:** `src\pages\admin\dashboard.astro`:258
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-149: Color hardcodeado: text-gray-500
- **Archivo:** `src\pages\admin\devtools.astro`:55
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-150: Color hardcodeado: text-gray-300
- **Archivo:** `src\pages\admin\devtools.astro`:80
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-151: Color hardcodeado: text-gray-500
- **Archivo:** `src\pages\admin\devtools.astro`:179
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-152: Color hardcodeado: bg-zinc-500
- **Archivo:** `src\pages\admin\logs.astro`:332
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-153: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\pages\admin\logs.astro`:404
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-154: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\admin\logs.astro`:51
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-155: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\admin\logs.astro`:53
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-156: Color hardcodeado: text-zinc-500
- **Archivo:** `src\pages\admin\logs.astro`:62
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-157: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\admin\logs.astro`:332
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-158: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\admin\logs.astro`:394
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-159: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\admin\logs.astro`:395
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-160: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\admin\logs.astro`:397
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-161: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\admin\logs.astro`:398
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-162: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\admin\logs.astro`:399
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-163: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\admin\logs.astro`:401
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-164: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\admin\logs.astro`:402
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-165: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\admin\logs.astro`:403
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-166: Color hardcodeado: bg-gray-500
- **Archivo:** `src\pages\admin\tickets.astro`:163
- **Descripción:** Usa bg-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-167: Color hardcodeado: bg-gray-500
- **Archivo:** `src\pages\admin\tickets.astro`:193
- **Descripción:** Usa bg-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-168: Color hardcodeado: bg-gray-500
- **Archivo:** `src\pages\admin\tickets.astro`:205
- **Descripción:** Usa bg-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-169: Color hardcodeado: bg-gray-500
- **Archivo:** `src\pages\admin\tickets.astro`:253
- **Descripción:** Usa bg-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-170: Color hardcodeado: text-gray-400
- **Archivo:** `src\pages\admin\tickets.astro`:163
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-171: Color hardcodeado: text-gray-400
- **Archivo:** `src\pages\admin\tickets.astro`:179
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-172: Color hardcodeado: text-gray-400
- **Archivo:** `src\pages\admin\tickets.astro`:193
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-173: Color hardcodeado: text-gray-400
- **Archivo:** `src\pages\admin\tickets.astro`:202
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-174: Color hardcodeado: text-gray-400
- **Archivo:** `src\pages\admin\tickets.astro`:205
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-175: Color hardcodeado: text-gray-400
- **Archivo:** `src\pages\admin\tickets.astro`:253
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-176: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\pages\client\progress.astro`:579
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-177: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\client\progress.astro`:247
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-178: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\client\progress.astro`:252
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-179: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\client\progress.astro`:579
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-180: Imagen sin atributo alt
- **Archivo:** `src\pages\client\progress.astro`:179
- **Descripción:** Imagen sin atributo alt viola WCAG 2.1 AA.
- **Recomendación:** Agregar alt descriptivo o alt="" si es decorativa

#### UIUX-181: Color hardcodeado: bg-gray-500
- **Archivo:** `src\pages\client\support\my-tickets.astro`:185
- **Descripción:** Usa bg-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-182: Color hardcodeado: bg-gray-500
- **Archivo:** `src\pages\client\support\my-tickets.astro`:216
- **Descripción:** Usa bg-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-183: Color hardcodeado: text-gray-400
- **Archivo:** `src\pages\client\support\my-tickets.astro`:185
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-184: Color hardcodeado: text-gray-400
- **Archivo:** `src\pages\client\support\my-tickets.astro`:197
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-185: Color hardcodeado: text-gray-400
- **Archivo:** `src\pages\client\support\my-tickets.astro`:216
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-186: Color hardcodeado: text-gray-400
- **Archivo:** `src\pages\client\support\my-tickets.astro`:219
- **Descripción:** Usa text-gray-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-187: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\pages\client\workouts.astro`:199
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-188: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\client\workouts.astro`:202
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-189: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\client\workouts.astro`:673
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-190: Color hardcodeado: #4285F4
- **Archivo:** `src\pages\login.astro`:35
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-191: Color hardcodeado: #34A853
- **Archivo:** `src\pages\login.astro`:36
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-192: Color hardcodeado: #FBBC05
- **Archivo:** `src\pages\login.astro`:37
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-193: Color hardcodeado: #EA4335
- **Archivo:** `src\pages\login.astro`:38
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-194: Color hardcodeado: #4285F4
- **Archivo:** `src\pages\login.astro`:290
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-195: Color hardcodeado: #34A853
- **Archivo:** `src\pages\login.astro`:291
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-196: Color hardcodeado: #FBBC05
- **Archivo:** `src\pages\login.astro`:292
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-197: Color hardcodeado: #EA4335
- **Archivo:** `src\pages\login.astro`:293
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-198: Color hardcodeado: #4285F4
- **Archivo:** `src\pages\register.astro`:33
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-199: Color hardcodeado: #34A853
- **Archivo:** `src\pages\register.astro`:34
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-200: Color hardcodeado: #FBBC05
- **Archivo:** `src\pages\register.astro`:35
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-201: Color hardcodeado: #EA4335
- **Archivo:** `src\pages\register.astro`:36
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-202: Color hardcodeado: #4285F4
- **Archivo:** `src\pages\register.astro`:511
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-203: Color hardcodeado: #34A853
- **Archivo:** `src\pages\register.astro`:512
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-204: Color hardcodeado: #FBBC05
- **Archivo:** `src\pages\register.astro`:513
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-205: Color hardcodeado: #EA4335
- **Archivo:** `src\pages\register.astro`:514
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-206: Color hardcodeado: bg-zinc-500
- **Archivo:** `src\pages\trainer\chat.astro`:217
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-207: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\trainer\chat.astro`:217
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-208: Color hardcodeado: text-zinc-500
- **Archivo:** `src\pages\trainer\clients.astro`:199
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-209: Color hardcodeado: text-zinc-500
- **Archivo:** `src\pages\trainer\clients.astro`:226
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-210: Color hardcodeado: text-zinc-200
- **Archivo:** `src\pages\trainer\clients.astro`:235
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-211: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\trainer\clients.astro`:236
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-212: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\pages\trainer\clinical.astro`:278
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-213: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\trainer\clinical.astro`:206
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-214: Color hardcodeado: text-zinc-200
- **Archivo:** `src\pages\trainer\clinical.astro`:278
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-215: Color hardcodeado: text-zinc-600
- **Archivo:** `src\pages\trainer\clinical.astro`:278
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-216: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\pages\trainer\diets.astro`:38
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-217: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\pages\trainer\diets.astro`:72
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-218: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\pages\trainer\diets.astro`:84
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-219: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\pages\trainer\diets.astro`:299
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-220: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\trainer\diets.astro`:57
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-221: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\trainer\diets.astro`:69
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-222: Color hardcodeado: text-zinc-100
- **Archivo:** `src\pages\trainer\diets.astro`:72
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-223: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\trainer\diets.astro`:81
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-224: Color hardcodeado: text-zinc-100
- **Archivo:** `src\pages\trainer\diets.astro`:84
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-225: Color hardcodeado: text-zinc-950
- **Archivo:** `src\pages\trainer\diets.astro`:95
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-226: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\trainer\diets.astro`:109
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-227: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\trainer\diets.astro`:299
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-228: Color hardcodeado: text-zinc-500
- **Archivo:** `src\pages\trainer\diets.astro`:305
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-229: Color hardcodeado: text-zinc-200
- **Archivo:** `src\pages\trainer\diets.astro`:309
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-230: Color hardcodeado: #111
- **Archivo:** `src\pages\trainer\diets.astro`:466
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-231: Color hardcodeado: #d97706
- **Archivo:** `src\pages\trainer\diets.astro`:467
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-232: Color hardcodeado: #b45309
- **Archivo:** `src\pages\trainer\diets.astro`:468
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-233: Color hardcodeado: #555
- **Archivo:** `src\pages\trainer\diets.astro`:469
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-234: Color hardcodeado: #fef3c7
- **Archivo:** `src\pages\trainer\diets.astro`:471
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-235: Color hardcodeado: #fcd34d
- **Archivo:** `src\pages\trainer\diets.astro`:471
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-236: Color hardcodeado: #92400e
- **Archivo:** `src\pages\trainer\diets.astro`:471
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-237: Color hardcodeado: #e5e7eb
- **Archivo:** `src\pages\trainer\diets.astro`:472
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-238: Color hardcodeado: #fafafa
- **Archivo:** `src\pages\trainer\diets.astro`:472
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-239: Color hardcodeado: #1f2937
- **Archivo:** `src\pages\trainer\diets.astro`:473
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-240: Color hardcodeado: #4b5563
- **Archivo:** `src\pages\trainer\diets.astro`:474
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-241: Color hardcodeado: #6b7280
- **Archivo:** `src\pages\trainer\diets.astro`:475
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-242: Color hardcodeado: #888
- **Archivo:** `src\pages\trainer\diets.astro`:476
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-243: Color hardcodeado: #e5e7eb
- **Archivo:** `src\pages\trainer\diets.astro`:476
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-244: Color hardcodeado: #b45309
- **Archivo:** `src\pages\trainer\diets.astro`:505
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-245: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\pages\trainer\workouts.astro`:42
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-246: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\pages\trainer\workouts.astro`:61
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-247: Color hardcodeado: bg-zinc-950
- **Archivo:** `src\pages\trainer\workouts.astro`:68
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-248: Color hardcodeado: bg-zinc-900
- **Archivo:** `src\pages\trainer\workouts.astro`:139
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-249: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\pages\trainer\workouts.astro`:150
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-250: Color hardcodeado: bg-zinc-700
- **Archivo:** `src\pages\trainer\workouts.astro`:150
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-251: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\pages\trainer\workouts.astro`:151
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-252: Color hardcodeado: bg-zinc-700
- **Archivo:** `src\pages\trainer\workouts.astro`:151
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-253: Color hardcodeado: bg-zinc-800
- **Archivo:** `src\pages\trainer\workouts.astro`:506
- **Descripción:** Usa bg-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-254: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\trainer\workouts.astro`:53
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-255: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\trainer\workouts.astro`:60
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-256: Color hardcodeado: text-zinc-100
- **Archivo:** `src\pages\trainer\workouts.astro`:61
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-257: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\trainer\workouts.astro`:67
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-258: Color hardcodeado: text-zinc-100
- **Archivo:** `src\pages\trainer\workouts.astro`:68
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-259: Color hardcodeado: text-zinc-950
- **Archivo:** `src\pages\trainer\workouts.astro`:74
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-260: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\trainer\workouts.astro`:87
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-261: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\trainer\workouts.astro`:142
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-262: Color hardcodeado: text-zinc-400
- **Archivo:** `src\pages\trainer\workouts.astro`:147
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-263: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\trainer\workouts.astro`:343
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-264: Color hardcodeado: text-zinc-300
- **Archivo:** `src\pages\trainer\workouts.astro`:506
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-265: Color hardcodeado: text-zinc-500
- **Archivo:** `src\pages\trainer\workouts.astro`:512
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-266: Color hardcodeado: text-zinc-200
- **Archivo:** `src\pages\trainer\workouts.astro`:516
- **Descripción:** Usa text-zinc-* en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-267: Color hardcodeado: #111
- **Archivo:** `src\pages\trainer\workouts.astro`:622
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-268: Color hardcodeado: #d97706
- **Archivo:** `src\pages\trainer\workouts.astro`:623
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-269: Color hardcodeado: #b45309
- **Archivo:** `src\pages\trainer\workouts.astro`:624
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-270: Color hardcodeado: #555
- **Archivo:** `src\pages\trainer\workouts.astro`:625
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-271: Color hardcodeado: #fef3c7
- **Archivo:** `src\pages\trainer\workouts.astro`:628
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-272: Color hardcodeado: #92400e
- **Archivo:** `src\pages\trainer\workouts.astro`:628
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-273: Color hardcodeado: #fcd34d
- **Archivo:** `src\pages\trainer\workouts.astro`:628
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-274: Color hardcodeado: #e5e7eb
- **Archivo:** `src\pages\trainer\workouts.astro`:629
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-275: Color hardcodeado: #f9fafb
- **Archivo:** `src\pages\trainer\workouts.astro`:630
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-276: Color hardcodeado: #888
- **Archivo:** `src\pages\trainer\workouts.astro`:631
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-277: Color hardcodeado: #e5e7eb
- **Archivo:** `src\pages\trainer\workouts.astro`:631
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

#### UIUX-278: Color hardcodeado: #666
- **Archivo:** `src\pages\trainer\workouts.astro`:667
- **Descripción:** Usa hex color en lugar de tokens del theme system.
- **Recomendación:** Usar clases del theme system (bg-surface, text-content, etc.)

---

## 🤖 Testing (audit-testing)

**Archivos escaneados:** 95 | **Duración:** 0.72s

### 🟡 MEDIO (7)

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

### 🟢 BAJO (198)

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

#### TEST-054: Test sin aserciones: updateUserProfile debe limpiar assignedT
- **Archivo:** `tests\unit\lib\admin\trainerAssignment.test.ts`:65
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-055: Test sin aserciones: updateUserProfile debe permitir asignar 
- **Archivo:** `tests\unit\lib\admin\trainerAssignment.test.ts`:82
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-056: Test sin aserciones: debe ocultar loading y mostrar contenido
- **Archivo:** `tests\unit\lib\client\clientInit.test.ts`:59
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-057: Test sin aserciones: debe redirigir a /login si no hay usuari
- **Archivo:** `tests\unit\lib\client\clientInit.test.ts`:83
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-058: Test sin aserciones: debe redirigir a /dashboard si el rol no
- **Archivo:** `tests\unit\lib\client\clientInit.test.ts`:97
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-059: Test sin aserciones: debe mostrar error visual en caso de exc
- **Archivo:** `tests\unit\lib\client\clientInit.test.ts`:116
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-060: Test sin aserciones: should add a meal completion log to Fire
- **Archivo:** `tests\unit\lib\client\dietService.test.ts`:260
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-061: Test sin aserciones: should include serverTimestamp in create
- **Archivo:** `tests\unit\lib\client\dietService.test.ts`:308
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-062: Test sin aserciones: debe retornar objeto por defecto si el d
- **Archivo:** `tests\unit\lib\client\exercisePreferencesService.test.ts`:94
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-063: Test sin aserciones: debe retornar datos si el documento exis
- **Archivo:** `tests\unit\lib\client\exercisePreferencesService.test.ts`:106
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-064: Test sin aserciones: debe actualizar rating en documento exis
- **Archivo:** `tests\unit\lib\client\exercisePreferencesService.test.ts`:124
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-065: Test sin aserciones: debe crear documento si no existe al cal
- **Archivo:** `tests\unit\lib\client\exercisePreferencesService.test.ts`:133
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-066: Test sin aserciones: debe agregar a favoritos si no estaba
- **Archivo:** `tests\unit\lib\client\exercisePreferencesService.test.ts`:151
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-067: Test sin aserciones: debe remover de favoritos si ya estaba
- **Archivo:** `tests\unit\lib\client\exercisePreferencesService.test.ts`:169
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-068: Test sin aserciones: debe registrar solicitud y enviar mensaj
- **Archivo:** `tests\unit\lib\client\exercisePreferencesService.test.ts`:207
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-069: Test sin aserciones: debe marcar una solicitud pendiente como
- **Archivo:** `tests\unit\lib\client\exercisePreferencesService.test.ts`:244
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-070: Test sin aserciones: should add a weight log to Firestore
- **Archivo:** `tests\unit\lib\client\progressService.test.ts`:191
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-071: Test sin aserciones: should include notes when provided
- **Archivo:** `tests\unit\lib\client\progressService.test.ts`:228
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-072: Test sin aserciones: should trim notes
- **Archivo:** `tests\unit\lib\client\progressService.test.ts`:237
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-073: Test sin aserciones: should include serverTimestamp in create
- **Archivo:** `tests\unit\lib\client\progressService.test.ts`:246
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-074: Test sin aserciones: ✅ seedExerciseTemplates debería escribir
- **Archivo:** `tests\unit\lib\devtools\seedService.test.ts`:42
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-075: Test sin aserciones: ✅ seedMealTemplates debería escribir lot
- **Archivo:** `tests\unit\lib\devtools\seedService.test.ts`:51
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-076: Test sin aserciones: ✅ seedDietTemplates debería escribir lot
- **Archivo:** `tests\unit\lib\devtools\seedService.test.ts`:60
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-077: Test sin aserciones: ✅ seedWorkoutTemplates debería escribir 
- **Archivo:** `tests\unit\lib\devtools\seedService.test.ts`:69
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-078: Test sin aserciones: ✅ seedAllTemplates debería ejecutar toda
- **Archivo:** `tests\unit\lib\devtools\seedService.test.ts`:78
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-079: Test sin aserciones: 🧹 purgeTemplates debería eliminar docum
- **Archivo:** `tests\unit\lib\devtools\seedService.test.ts`:89
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-080: Test sin aserciones: should query and update unread messages 
- **Archivo:** `tests\unit\lib\shared\chat.test.ts`:156
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-081: Test sin aserciones: should add a message document to Firesto
- **Archivo:** `tests\unit\lib\shared\chat.test.ts`:264
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-082: Test sin aserciones: should trim content before sending
- **Archivo:** `tests\unit\lib\shared\chat.test.ts`:282
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-083: Test sin aserciones: debe funcionar con admin
- **Archivo:** `tests\unit\lib\shared\initPage.test.ts`:31
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-084: Test sin aserciones: debe redirigir si rol no está en allowed
- **Archivo:** `tests\unit\lib\shared\initPage.test.ts`:40
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-085: Test sin aserciones: debería renderizar la vista de perfil si
- **Archivo:** `tests\unit\lib\shared\settingsService.test.ts`:63
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-086: Test sin aserciones: debería enviar el formulario de perfil c
- **Archivo:** `tests\unit\lib\shared\settingsService.test.ts`:102
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-087: Test sin aserciones: debería mostrar error si el nombre está 
- **Archivo:** `tests\unit\lib\shared\settingsService.test.ts`:143
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-088: Test sin aserciones: debería cambiar la contraseña correctame
- **Archivo:** `tests\unit\lib\shared\settingsService.test.ts`:167
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-089: Test sin aserciones: debería mostrar error si las contraseñas
- **Archivo:** `tests\unit\lib\shared\settingsService.test.ts`:195
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-090: Test sin aserciones: debería subir foto frontal a Cloudflare 
- **Archivo:** `tests\unit\lib\storage\r2FullPlatform.test.ts`:21
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-091: Test sin aserciones: debería subir vídeos de técnica y ejerci
- **Archivo:** `tests\unit\lib\storage\r2FullPlatform.test.ts`:58
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-092: Test sin aserciones: debería subir avatar a R2 y retornar URL
- **Archivo:** `tests\unit\lib\storage\r2FullPlatform.test.ts`:91
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-093: Test sin aserciones: debería subir imágenes de alimentos con 
- **Archivo:** `tests\unit\lib\storage\r2FullPlatform.test.ts`:112
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-094: Test sin aserciones: debería subir vídeos o miniaturas de eje
- **Archivo:** `tests\unit\lib\storage\r2FullPlatform.test.ts`:131
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-095: Test sin aserciones: debería activar fallback reactivo si el 
- **Archivo:** `tests\unit\lib\storage\r2FullPlatform.test.ts`:153
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-096: Test sin aserciones: debería generar previsualizaciones local
- **Archivo:** `tests\unit\lib\storage\r2FullPlatform.test.ts`:163
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-097: Test sin aserciones: debería diagnosticar la salud de Cloudfl
- **Archivo:** `tests\unit\lib\storage\r2FullPlatform.test.ts`:170
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-098: Test sin aserciones: debería generar una Data URL para un arc
- **Archivo:** `tests\unit\lib\storage\r2Service.test.ts`:81
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-099: Test sin aserciones: debería procesar la subida vía API exito
- **Archivo:** `tests\unit\lib\storage\r2Service.test.ts`:91
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-100: Test sin aserciones: debería utilizar fallback local si el en
- **Archivo:** `tests\unit\lib\storage\r2Service.test.ts`:113
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-101: Test sin aserciones: debería procesar imagen para chat
- **Archivo:** `tests\unit\lib\storage\r2Service.test.ts`:128
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-102: Test sin aserciones: debería procesar vídeo para chat
- **Archivo:** `tests\unit\lib\storage\r2Service.test.ts`:146
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-103: Test sin aserciones: debería subir avatar de usuario
- **Archivo:** `tests\unit\lib\storage\r2Service.test.ts`:166
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-104: Test sin aserciones: debería subir imagen de alimento
- **Archivo:** `tests\unit\lib\storage\r2Service.test.ts`:183
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-105: Test sin aserciones: debería subir vídeo de ejercicio
- **Archivo:** `tests\unit\lib\storage\r2Service.test.ts`:200
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-106: Test sin aserciones: debería subir el vídeo del alumno a Clou
- **Archivo:** `tests\unit\lib\storage\techniqueCorrectionService.test.ts`:31
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-107: Test sin aserciones: debería rechazar formatos no permitidos 
- **Archivo:** `tests\unit\lib\storage\techniqueCorrectionService.test.ts`:64
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-108: Test sin aserciones: ✅ debería clonar dieta para cliente asig
- **Archivo:** `tests\unit\lib\trainer\templateService.test.ts`:68
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-109: Test sin aserciones: ❌ debería lanzar error si el cliente NO 
- **Archivo:** `tests\unit\lib\trainer\templateService.test.ts`:105
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-110: Test sin aserciones: ❌ debería lanzar error si el cliente no 
- **Archivo:** `tests\unit\lib\trainer\templateService.test.ts`:123
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-111: Test sin aserciones: ❌ debería lanzar error si la plantilla n
- **Archivo:** `tests\unit\lib\trainer\templateService.test.ts`:141
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-112: Test sin aserciones: ✅ debería clonar rutina para cliente asi
- **Archivo:** `tests\unit\lib\trainer\templateService.test.ts`:166
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-113: Test sin aserciones: ❌ debería lanzar error si el cliente NO 
- **Archivo:** `tests\unit\lib\trainer\templateService.test.ts`:202
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-114: Test sin aserciones: debería llamar al callback cuando el usu
- **Archivo:** `tests\unit\lib\trainer\trainerAuth.test.ts`:47
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-115: Test sin aserciones: debería cerrar sesión y redirigir a /log
- **Archivo:** `tests\unit\lib\trainer\trainerAuth.test.ts`:67
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-116: Test sin aserciones: debería manejar errores al cerrar sesión
- **Archivo:** `tests\unit\lib\trainer\trainerAuth.test.ts`:77
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-117: Test sin aserciones: debería suscribirse a las conversaciones
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:92
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-118: Test sin aserciones: debería filtrar mensajes entre dos usuar
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:118
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-119: Test sin aserciones: debería enviar un mensaje de texto
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:141
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-120: Test sin aserciones: debería enviar un mensaje de alerta
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:160
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-121: Test sin aserciones: debería retornar null si falla el envío
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:169
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-122: Test sin aserciones: debería marcar un mensaje como leído
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:180
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-123: Test sin aserciones: debería retornar false si falla
- **Archivo:** `tests\unit\lib\trainer\trainerChat.test.ts`:193
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-124: Test sin aserciones: debería suscribirse a los clientes de un
- **Archivo:** `tests\unit\lib\trainer\trainerClients.test.ts`:92
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-125: Test sin aserciones: debería manejar errores de suscripción
- **Archivo:** `tests\unit\lib\trainer\trainerClients.test.ts`:136
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-126: Test sin aserciones: debería retornar el perfil del cliente
- **Archivo:** `tests\unit\lib\trainer\trainerClients.test.ts`:152
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-127: Test sin aserciones: debería retornar null si el cliente no e
- **Archivo:** `tests\unit\lib\trainer\trainerClients.test.ts`:174
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-128: Test sin aserciones: debería retornar null si falla la consul
- **Archivo:** `tests\unit\lib\trainer\trainerClients.test.ts`:187
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-129: Test sin aserciones: debería suscribirse a las dietas del ent
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:103
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-130: Test sin aserciones: debería suscribirse a las dietas de un c
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:121
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-131: Test sin aserciones: debería crear una dieta exitosamente
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:137
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-132: Test sin aserciones: debería retornar null si falla la creaci
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:146
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-133: Test sin aserciones: debería actualizar una dieta exitosament
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:157
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-134: Test sin aserciones: debería retornar false si falla
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:166
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-135: Test sin aserciones: debería eliminar una dieta exitosamente
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:177
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-136: Test sin aserciones: debería retornar false si falla
- **Archivo:** `tests\unit\lib\trainer\trainerDiets.test.ts`:186
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-137: Test sin aserciones: debería establecer __trainerId en window
- **Archivo:** `tests\unit\lib\trainer\trainerInit.test.ts`:16
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-138: Test sin aserciones: debería suscribirse al progreso de un cl
- **Archivo:** `tests\unit\lib\trainer\trainerProgress.test.ts`:92
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-139: Test sin aserciones: debería manejar errores de suscripción
- **Archivo:** `tests\unit\lib\trainer\trainerProgress.test.ts`:136
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-140: Test sin aserciones: debería renderizar una tarjeta de client
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:66
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-141: Test sin aserciones: debería incluir onclick si se proporcion
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:75
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-142: Test sin aserciones: debería mostrar badge de alerta activa
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:83
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-143: Test sin aserciones: debería mostrar badge de admin si el rol
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:91
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-144: Test sin aserciones: debería renderizar una tarjeta de rutina
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:101
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-145: Test sin aserciones: debería mostrar la descripción truncada
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:110
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-146: Test sin aserciones: debería renderizar una tarjeta de dieta
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:119
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-147: Test sin aserciones: debería renderizar un mensaje propio (al
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:131
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-148: Test sin aserciones: debería renderizar un mensaje de otro (a
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:141
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-149: Test sin aserciones: debería mostrar badge de alerta para men
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:150
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-150: Test sin aserciones: no debería mostrar nombre del remitente 
- **Archivo:** `tests\unit\lib\trainer\trainerRender.test.ts`:163
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-151: Test sin aserciones: ✅ should calculate correct TDEE and macr
- **Archivo:** `tests\unit\lib\trainer\trainerUtils.test.ts`:241
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-152: Test sin aserciones: ✅ should apply deficit and higher protei
- **Archivo:** `tests\unit\lib\trainer\trainerUtils.test.ts`:252
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-153: Test sin aserciones: ✅ should return active status for recent
- **Archivo:** `tests\unit\lib\trainer\trainerUtils.test.ts`:262
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-154: Test sin aserciones: ✅ should return warning for activity 4 d
- **Archivo:** `tests\unit\lib\trainer\trainerUtils.test.ts`:276
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-155: Test sin aserciones: ✅ should return inactive status for acti
- **Archivo:** `tests\unit\lib\trainer\trainerUtils.test.ts`:290
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-156: Test sin aserciones: debería suscribirse a las rutinas del en
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:103
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-157: Test sin aserciones: debería suscribirse a las rutinas de un 
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:128
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-158: Test sin aserciones: debería crear una rutina exitosamente
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:144
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-159: Test sin aserciones: debería retornar null si falla la creaci
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:154
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-160: Test sin aserciones: debería actualizar una rutina exitosamen
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:165
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-161: Test sin aserciones: debería retornar false si falla la actua
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:174
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-162: Test sin aserciones: debería eliminar una rutina exitosamente
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:185
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-163: Test sin aserciones: debería retornar false si falla la elimi
- **Archivo:** `tests\unit\lib\trainer\trainerWorkouts.test.ts`:194
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-164: Test sin aserciones: ✅ should return all users with correct s
- **Archivo:** `tests\unit\services\adminService.test.ts`:92
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-165: Test sin aserciones: ✅ should handle missing fields gracefull
- **Archivo:** `tests\unit\services\adminService.test.ts`:108
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-166: Test sin aserciones: ✅ should return empty array when no user
- **Archivo:** `tests\unit\services\adminService.test.ts`:127
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-167: Test sin aserciones: ✅ should filter users by role
- **Archivo:** `tests\unit\services\adminService.test.ts`:143
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-168: Test sin aserciones: ✅ should return empty array when no user
- **Archivo:** `tests\unit\services\adminService.test.ts`:156
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-169: Test sin aserciones: ✅ should calculate correct stats from us
- **Archivo:** `tests\unit\services\adminService.test.ts`:218
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-170: Test sin aserciones: ✅ should return zeros when no users exis
- **Archivo:** `tests\unit\services\adminService.test.ts`:237
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-171: Test sin aserciones: ✅ should return user data on successful 
- **Archivo:** `tests\unit\services\authService.test.ts`:114
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-172: Test sin aserciones: ⚠️ should auto-create profile if user pr
- **Archivo:** `tests\unit\services\authService.test.ts`:147
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-173: Test sin aserciones: ✅ should create user in Firebase Auth an
- **Archivo:** `tests\unit\services\authService.test.ts`:173
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-174: Test sin aserciones: ✅ should login with Google and return ex
- **Archivo:** `tests\unit\services\authService.test.ts`:256
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-175: Test sin aserciones: ✅ should create new profile if user does
- **Archivo:** `tests\unit\services\authService.test.ts`:274
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-176: Test sin aserciones: ✅ should load profile successfully
- **Archivo:** `tests\unit\services\profileService.test.ts`:137
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-177: Test sin aserciones: ✅ should load profile with assigned trai
- **Archivo:** `tests\unit\services\profileService.test.ts`:161
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-178: Test sin aserciones: ✅ should return null when document does 
- **Archivo:** `tests\unit\services\profileService.test.ts`:190
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-179: Test sin aserciones: ✅ should update profile successfully
- **Archivo:** `tests\unit\services\profileService.test.ts`:211
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-180: Test sin aserciones: ⚠️ should return error result on Firesto
- **Archivo:** `tests\unit\services\profileService.test.ts`:226
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-181: Test sin aserciones: ✅ should change password successfully
- **Archivo:** `tests\unit\services\profileService.test.ts`:257
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-182: Test sin aserciones: ⚠️ should return error result on auth er
- **Archivo:** `tests\unit\services\profileService.test.ts`:267
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-183: Test sin aserciones: todas las keys en es deben existir en en
- **Archivo:** `tests\unit\utils\translations.test.ts`:233
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-184: Test sin aserciones: todas las keys en en deben existir en es
- **Archivo:** `tests\unit\utils\translations.test.ts`:241
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-185: Test sin aserciones: todas las keys en es deben existir en en
- **Archivo:** `tests\unit\utils\translations.test.ts`:249
- **Descripción:** Test sin llamadas a expect() o assert().
- **Recomendación:** Agregar aserciones que validen el comportamiento

#### TEST-186: Archivo sin test: src\lib\admin\adminTranslations.ts
- **Archivo:** `src\lib\admin\adminTranslations.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-187: Archivo sin test: src\lib\auth\sessionHelper.ts
- **Archivo:** `src\lib\auth\sessionHelper.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-188: Archivo sin test: src\lib\auth\userWatcher.ts
- **Archivo:** `src\lib\auth\userWatcher.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-189: Archivo sin test: src\lib\client\achievementsService.ts
- **Archivo:** `src\lib\client\achievementsService.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-190: Archivo sin test: src\lib\client\adherenceService.ts
- **Archivo:** `src\lib\client\adherenceService.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-191: Archivo sin test: src\lib\client\animations.ts
- **Archivo:** `src\lib\client\animations.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-192: Archivo sin test: src\lib\client\dailyScheduleService.ts
- **Archivo:** `src\lib\client\dailyScheduleService.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-193: Archivo sin test: src\lib\client\onboardingService.ts
- **Archivo:** `src\lib\client\onboardingService.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-194: Archivo sin test: src\lib\client\supportService.ts
- **Archivo:** `src\lib\client\supportService.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-195: Archivo sin test: src\lib\client\workoutDayDecisionsService.ts
- **Archivo:** `src\lib\client\workoutDayDecisionsService.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-196: Archivo sin test: src\lib\data\exercisesCatalog.ts
- **Archivo:** `src\lib\data\exercisesCatalog.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-197: Archivo sin test: src\lib\data\foodsCatalog.ts
- **Archivo:** `src\lib\data\foodsCatalog.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-198: Archivo sin test: src\lib\devtools\autofillers.ts
- **Archivo:** `src\lib\devtools\autofillers.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-199: Archivo sin test: src\lib\devtools\detector.ts
- **Archivo:** `src\lib\devtools\detector.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-200: Archivo sin test: src\lib\devtools\logStore.ts
- **Archivo:** `src\lib\devtools\logStore.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-201: Archivo sin test: src\lib\devtools\panel.ts
- **Archivo:** `src\lib\devtools\panel.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-202: Archivo sin test: src\lib\devtools\seedData.ts
- **Archivo:** `src\lib\devtools\seedData.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-203: Archivo sin test: src\lib\shared\exerciseLibrary.ts
- **Archivo:** `src\lib\shared\exerciseLibrary.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-204: Archivo sin test: src\lib\shared\foodLibrary.ts
- **Archivo:** `src\lib\shared\foodLibrary.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

#### TEST-205: Archivo sin test: src\lib\trainer\metabolicCalculator.ts
- **Archivo:** `src\lib\trainer\metabolicCalculator.ts`
- **Descripción:** Archivo de código fuente sin archivo de test correspondiente.
- **Recomendación:** Crear test file en tests/unit/ con la misma estructura

---

## 🤖 i18n (audit-i18n)

**Archivos escaneados:** 44 | **Duración:** 0.10s

### 🟢 BAJO (86)

#### I18N-001: Texto hardcodeado: "No hay conversaciones..."
- **Archivo:** `src\pages\admin\chat.astro`:81
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-002: Texto hardcodeado: "Aún no se ha iniciado ninguna conversaci..."
- **Archivo:** `src\pages\admin\chat.astro`:82
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-003: Texto hardcodeado: "Cuentas activas..."
- **Archivo:** `src\pages\admin\dashboard.astro`:66
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-004: Texto hardcodeado: "En seguimiento..."
- **Archivo:** `src\pages\admin\dashboard.astro`:84
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-005: Texto hardcodeado: "Coaches asignados..."
- **Archivo:** `src\pages\admin\dashboard.astro`:103
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-006: Texto hardcodeado: "Incidencias..."
- **Archivo:** `src\pages\admin\dashboard.astro`:122
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-007: Texto hardcodeado: "Sin incidencias activas..."
- **Archivo:** `src\pages\admin\dashboard.astro`:371
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-008: Texto hardcodeado: "Todas las cuentas y servicios se encuent..."
- **Archivo:** `src\pages\admin\dashboard.astro`:372
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-009: Texto hardcodeado: "Alerta médica o de cuenta pendiente..."
- **Archivo:** `src\pages\admin\dashboard.astro`:386
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-010: Texto hardcodeado: "No hay dietas registradas..."
- **Archivo:** `src\pages\admin\diets.astro`:102
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-011: Texto hardcodeado: "Todos los músculos..."
- **Archivo:** `src\pages\admin\exercises.astro`:81
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-012: Texto hardcodeado: "Todas las categorías..."
- **Archivo:** `src\pages\admin\exercises.astro`:99
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-013: Texto hardcodeado: "No se encontraron ejercicios..."
- **Archivo:** `src\pages\admin\exercises.astro`:128
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-014: Texto hardcodeado: "Prueba cambiando los filtros de búsqueda..."
- **Archivo:** `src\pages\admin\exercises.astro`:129
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-015: Texto hardcodeado: "Se usarán para alertar al entrenador si ..."
- **Archivo:** `src\pages\admin\exercises.astro`:298
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-016: Texto hardcodeado: "Gestiona el catálogo centralizado de ali..."
- **Archivo:** `src\pages\admin\foods.astro`:14
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-017: Texto hardcodeado: "Total alimentos..."
- **Archivo:** `src\pages\admin\foods.astro`:39
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-018: Texto hardcodeado: "Todas las categorías..."
- **Archivo:** `src\pages\admin\foods.astro`:68
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-019: Texto hardcodeado: "No hay alimentos en el catálogo..."
- **Archivo:** `src\pages\admin\foods.astro`:111
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-020: Texto hardcodeado: "Añade el primer alimento o ejecuta el se..."
- **Archivo:** `src\pages\admin\foods.astro`:112
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-021: Texto hardcodeado: "Añadir alimento..."
- **Archivo:** `src\pages\admin\foods.astro`:133
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-022: Texto hardcodeado: "Seleccionar......"
- **Archivo:** `src\pages\admin\foods.astro`:174
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-023: Texto hardcodeado: "Activo en el catálogo..."
- **Archivo:** `src\pages\admin\foods.astro`:299
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-024: Texto hardcodeado: "Sin lactosa..."
- **Archivo:** `src\pages\admin\foods.astro`:539
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-025: Texto hardcodeado: "Error al cargar los logs...."
- **Archivo:** `src\pages\admin\logs.astro`:313
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-026: Texto hardcodeado: "Sin logs registrados..."
- **Archivo:** `src\pages\admin\logs.astro`:322
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-027: Texto hardcodeado: "No hay datos de progreso..."
- **Archivo:** `src\pages\admin\progress.astro`:100
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-028: Texto hardcodeado: "Los clientes aún no han registrado datos..."
- **Archivo:** `src\pages\admin\progress.astro`:101
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-029: Texto hardcodeado: "Sin desplegar..."
- **Archivo:** `src\pages\admin\seeds.astro`:91
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-030: Texto hardcodeado: "Listo para validar..."
- **Archivo:** `src\pages\admin\seeds.astro`:96
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-031: Texto hardcodeado: "Idempotencia..."
- **Archivo:** `src\pages\admin\seeds.astro`:103
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-032: Texto hardcodeado: "O haz clic para seleccionar desde tu equ..."
- **Archivo:** `src\pages\admin\seeds.astro`:179
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-033: Texto hardcodeado: "No se encontraron elementos...."
- **Archivo:** `src\pages\admin\seeds.astro`:721
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-034: Texto hardcodeado: "En revisión..."
- **Archivo:** `src\pages\admin\tickets.astro`:197
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-035: Texto hardcodeado: "Esperando respuesta..."
- **Archivo:** `src\pages\admin\tickets.astro`:198
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-036: Texto hardcodeado: "Última actividad..."
- **Archivo:** `src\pages\admin\tickets.astro`:242
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-037: Texto hardcodeado: "Descripción completa..."
- **Archivo:** `src\pages\admin\tickets.astro`:258
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-038: Texto hardcodeado: "Usuario no encontrado..."
- **Archivo:** `src\pages\admin\users.astro`:883
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-039: Texto hardcodeado: "Este cliente no ha completado su perfil ..."
- **Archivo:** `src\pages\admin\users.astro`:893
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-040: Texto hardcodeado: "No hay alertas médicas registradas..."
- **Archivo:** `src\pages\admin\users.astro`:955
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-041: Texto hardcodeado: "Error al cargar el perfil médico..."
- **Archivo:** `src\pages\admin\users.astro`:964
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-042: Texto hardcodeado: "No hay rutinas registradas..."
- **Archivo:** `src\pages\admin\workouts.astro`:100
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-043: Texto hardcodeado: "Los entrenadores aún no han creado rutin..."
- **Archivo:** `src\pages\admin\workouts.astro`:101
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-044: Texto hardcodeado: "Plan estructurado de comidas y entrenami..."
- **Archivo:** `src\pages\client\calendar.astro`:18
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-045: Texto hardcodeado: "No tienes actividades asignadas para hoy..."
- **Archivo:** `src\pages\client\calendar.astro`:41
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-046: Texto hardcodeado: "Tu entrenador aún no ha programado una r..."
- **Archivo:** `src\pages\client\calendar.astro`:42
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-047: Texto hardcodeado: "Rutina asignada..."
- **Archivo:** `src\pages\client\dashboard.astro`:127
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-048: Texto hardcodeado: "Cargando rutina......"
- **Archivo:** `src\pages\client\dashboard.astro`:138
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-049: Texto hardcodeado: "Revisando tus ejercicios programados par..."
- **Archivo:** `src\pages\client\dashboard.astro`:141
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-050: Texto hardcodeado: "Aprovecha para recuperarte, hidratarte o..."
- **Archivo:** `src\pages\client\dashboard.astro`:153
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-051: Texto hardcodeado: "Cargando plan nutricional......"
- **Archivo:** `src\pages\client\dashboard.astro`:186
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-052: Texto hardcodeado: "Consultando tu distribución de macronutr..."
- **Archivo:** `src\pages\client\dashboard.astro`:189
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-053: Texto hardcodeado: "Completa tu perfil de intolerancias o so..."
- **Archivo:** `src\pages\client\dashboard.astro`:201
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-054: Texto hardcodeado: "g..."
- **Archivo:** `src\pages\client\diets.astro`:151
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-055: Texto hardcodeado: "Carbohidratos..."
- **Archivo:** `src\pages\client\diets.astro`:159
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-056: Texto hardcodeado: "g..."
- **Archivo:** `src\pages\client\diets.astro`:162
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-057: Texto hardcodeado: "g..."
- **Archivo:** `src\pages\client\diets.astro`:173
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-058: Texto hardcodeado: "No se encontraron sustitutos compatibles..."
- **Archivo:** `src\pages\client\diets.astro`:445
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-059: Texto hardcodeado: "Ver sustitutos recomendados..."
- **Archivo:** `src\pages\client\diets.astro`:624
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-060: Texto hardcodeado: "Ningún alimento individual excluido..."
- **Archivo:** `src\pages\client\medical-profile.astro`:116
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-061: Texto hardcodeado: "No se encontraron alimentos..."
- **Archivo:** `src\pages\client\medical-profile.astro`:287
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-062: Texto hardcodeado: "Seguimiento visual de tu cambio físico..."
- **Archivo:** `src\pages\client\progress.astro`:99
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-063: Texto hardcodeado: "De frente, brazos a los costados y postu..."
- **Archivo:** `src\pages\client\progress.astro`:121
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-064: Texto hardcodeado: "De espaldas a la cámara, dorsal y hombro..."
- **Archivo:** `src\pages\client\progress.astro`:147
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-065: Texto hardcodeado: "Historial clasificado de poses..."
- **Archivo:** `src\pages\client\progress.astro`:214
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-066: Texto hardcodeado: "Sin fotos de evolución registradas aún...."
- **Archivo:** `src\pages\client\progress.astro`:236
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-067: Texto hardcodeado: "Eliminar foto..."
- **Archivo:** `src\pages\client\progress.astro`:259
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-068: Texto hardcodeado: "Sin fotos en esta pose aún...."
- **Archivo:** `src\pages\client\progress.astro`:565
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-069: Texto hardcodeado: "Descripción completa..."
- **Archivo:** `src\pages\client\support\my-tickets.astro`:241
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-070: Texto hardcodeado: "Última actividad..."
- **Archivo:** `src\pages\client\support\my-tickets.astro`:250
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-071: Texto hardcodeado: "Grabaciones enviadas a tu entrenador con..."
- **Archivo:** `src\pages\client\workouts.astro`:104
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-072: Texto hardcodeado: "Toca para seleccionar o grabar vídeo..."
- **Archivo:** `src\pages\client\workouts.astro`:157
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-073: Texto hardcodeado: "Tu entrenador ha recibido la grabación y..."
- **Archivo:** `src\pages\client\workouts.astro`:683
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-074: Texto hardcodeado: "Tus datos personales y médicos se almace..."
- **Archivo:** `src\pages\terms.astro`:20
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-075: Texto hardcodeado: "Sin conversaciones aún..."
- **Archivo:** `src\pages\trainer\chat.astro`:399
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-076: Texto hardcodeado: "Sin resultados para el filtro selecciona..."
- **Archivo:** `src\pages\trainer\chat.astro`:407
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-077: Texto hardcodeado: "No se encontraron contactos..."
- **Archivo:** `src\pages\trainer\chat.astro`:462
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-078: Texto hardcodeado: "Cargando vídeos de técnica de este alumn..."
- **Archivo:** `src\pages\trainer\clients.astro`:199
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-079: Texto hardcodeado: "Esta plantilla no contiene comidas aún...."
- **Archivo:** `src\pages\trainer\diets.astro`:305
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-080: Texto hardcodeado: "Revisa grabaciones de tus alumnos, anali..."
- **Archivo:** `src\pages\trainer\workouts.astro`:118
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-081: Texto hardcodeado: "Todas las solicitudes..."
- **Archivo:** `src\pages\trainer\workouts.astro`:122
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-082: Texto hardcodeado: "Pendientes de revisión..."
- **Archivo:** `src\pages\trainer\workouts.astro`:123
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-083: Texto hardcodeado: "Ya revisadas..."
- **Archivo:** `src\pages\trainer\workouts.astro`:124
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-084: Texto hardcodeado: "Cargando solicitudes de técnica......"
- **Archivo:** `src\pages\trainer\workouts.astro`:130
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-085: Texto hardcodeado: "No hay solicitudes de corrección en esta..."
- **Archivo:** `src\pages\trainer\workouts.astro`:317
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

#### I18N-086: Texto hardcodeado: "Esta plantilla no contiene ejercicios aú..."
- **Archivo:** `src\pages\trainer\workouts.astro`:512
- **Descripción:** Texto en español directamente en HTML sin usar i18n.
- **Recomendación:** Usar getT() y agregar clave a translations.ts

---

## 🎯 Plan de Acción Priorizado

| # | ID | Severidad | Título | Archivo | Agente |
|---|-----|-----------|--------|---------|--------|
| 1 | QUAL-001 | 🔴 CRITICAL | Archivo > 300 líneas (821 líneas) | `src\components\calendar\TimeGrid.astro` | audit-quality |
| 2 | QUAL-011 | 🔴 CRITICAL | Archivo > 300 líneas (597 líneas) | `src\components\settings\UnifiedSettingsView.astro` | audit-quality |
| 3 | QUAL-013 | 🔴 CRITICAL | Archivo > 300 líneas (736 líneas) | `src\i18n\locales\ca.ts` | audit-quality |
| 4 | QUAL-014 | 🔴 CRITICAL | Archivo > 300 líneas (948 líneas) | `src\i18n\locales\en.ts` | audit-quality |
| 5 | QUAL-015 | 🔴 CRITICAL | Archivo > 300 líneas (985 líneas) | `src\i18n\locales\es.ts` | audit-quality |
| 6 | QUAL-016 | 🔴 CRITICAL | Archivo > 300 líneas (649 líneas) | `src\layouts\AdminLayout.astro` | audit-quality |
| 7 | QUAL-017 | 🔴 CRITICAL | Archivo > 300 líneas (787 líneas) | `src\layouts\BaseLayout.astro` | audit-quality |
| 8 | QUAL-029 | 🔴 CRITICAL | Archivo > 300 líneas (515 líneas) | `src\lib\data\foodsCatalog.ts` | audit-quality |
| 9 | QUAL-042 | 🔴 CRITICAL | Archivo > 300 líneas (1264 líneas) | `src\lib\devtools\seedData.ts` | audit-quality |
| 10 | QUAL-063 | 🔴 CRITICAL | Archivo > 300 líneas (756 líneas) | `src\lib\shared\logService.ts` | audit-quality |
| 11 | QUAL-083 | 🔴 CRITICAL | Archivo > 300 líneas (656 líneas) | `src\pages\admin\exercises.astro` | audit-quality |
| 12 | QUAL-084 | 🔴 CRITICAL | Archivo > 300 líneas (739 líneas) | `src\pages\admin\foods.astro` | audit-quality |
| 13 | QUAL-085 | 🔴 CRITICAL | Archivo > 300 líneas (520 líneas) | `src\pages\admin\logs.astro` | audit-quality |
| 14 | QUAL-087 | 🔴 CRITICAL | Archivo > 300 líneas (792 líneas) | `src\pages\admin\seeds.astro` | audit-quality |
| 15 | QUAL-093 | 🔴 CRITICAL | Archivo > 300 líneas (1050 líneas) | `src\pages\admin\users.astro` | audit-quality |
| 16 | QUAL-110 | 🔴 CRITICAL | Archivo > 300 líneas (777 líneas) | `src\pages\client\diets.astro` | audit-quality |
| 17 | QUAL-112 | 🔴 CRITICAL | Archivo > 300 líneas (737 líneas) | `src\pages\client\progress.astro` | audit-quality |
| 18 | QUAL-118 | 🔴 CRITICAL | Archivo > 300 líneas (1104 líneas) | `src\pages\client\workouts.astro` | audit-quality |
| 19 | QUAL-122 | 🔴 CRITICAL | Archivo > 300 líneas (750 líneas) | `src\pages\onboarding.astro` | audit-quality |
| 20 | QUAL-123 | 🔴 CRITICAL | Archivo > 300 líneas (520 líneas) | `src\pages\register.astro` | audit-quality |
| 21 | QUAL-124 | 🔴 CRITICAL | Archivo > 300 líneas (588 líneas) | `src\pages\trainer\chat.astro` | audit-quality |
| 22 | QUAL-126 | 🔴 CRITICAL | Archivo > 300 líneas (1324 líneas) | `src\pages\trainer\diets.astro` | audit-quality |
| 23 | QUAL-128 | 🔴 CRITICAL | Archivo > 300 líneas (1269 líneas) | `src\pages\trainer\workouts.astro` | audit-quality |
| 24 | QUAL-002 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\components\calendar\TimeGrid.astro` | audit-quality |
| 25 | QUAL-003 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\components\calendar\TimeGrid.astro` | audit-quality |
| 26 | QUAL-004 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\components\calendar\TimeGrid.astro` | audit-quality |
| 27 | QUAL-005 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\components\calendar\TimeGrid.astro` | audit-quality |
| 28 | QUAL-006 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\components\calendar\TimeGrid.astro` | audit-quality |
| 29 | QUAL-007 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\components\calendar\TimeGrid.astro` | audit-quality |
| 30 | QUAL-008 | 🟡 MEDIUM | Uso de `any` (Golden Rule #1 violada) | `src\components\calendar\TimeGrid.astro` | audit-quality |

> ... y 720 más (ver secciones detalladas arriba)

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
