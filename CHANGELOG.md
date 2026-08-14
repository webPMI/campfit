# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto usa [Semantic Versioning](https://semver.org/lang/es/).

## [Sin versión] - 2026-08-14

### 💬 Notificaciones y Soporte Multimedia en Chat (Cloudflare R2 + Web Push)
- **Fase 4.1 (`r2Service.ts` & `trainerChat.ts`)**: Añadido método `uploadChatMedia` para fotos y vídeos de corrección postural/técnica y soporte extendido en `sendMessage()` con `mediaUrl` y `mediaType`.
- **Fase 4.2 (`trainerRender.ts`)**: Soporte de renderizado para adjuntos de imagen con vista ampliada y reproductores de vídeo en las burbujas de mensaje.
- **Fase 4.3 (`client/chat.astro` & `trainer/chat.astro`)**: Botón interactivo de adjunto (`📎`), barra de previsualización antes de enviar y notificaciones del navegador (`showLocalNotification`) al recibir mensajes con la pestaña en segundo plano.
- **Fase 4.4 (`i18n`)**: Claves de traducción completas añadidas a `es.ts`, `en.ts` y `ca.ts`.

### 🏋️ Integración de la Biblioteca de Ejercicios y Preferencias (`exercises_library` + `user_exercise_prefs`)
- **Fase 3.1 (`exercisePreferencesService.ts`)**: Creado servicio y suite de pruebas unitarias (10 tests) para ratings (1-5 ⭐), favoritos, solicitudes de exclusión estructuradas y confirmaciones (acknowledgements) de entrenador.
- **Fase 3.2 (`client/workouts.astro`)**: Integración de estrellas de valoración interactiva, selector de favoritos y modal de solicitud de exclusión con checklist de motivos (dolor, lesión, equipamiento, dificultad) y notificación automática vía chat al entrenador.
- **Fase 3.3 (`trainer/workouts.astro`)**: Creador de rutinas con catálogo central de ejercicios, autocompletado de métricas (series, reps, descanso), badges de favoritos/exclusiones del cliente seleccionado y banner de confirmación de solicitudes pendientes.
- **Documentación**: Actualizados `docs/features/BIBLIOTECA_EJERCICIOS.md`, `CHANGELOG.md` y `walkthrough.md`.

### 🍎 Integración Integral de la Biblioteca de Alimentos (`foods_library`)
- **Fase 1 (Estabilización)**: Eliminación de marcadores de conflicto de merge, sincronización de claves i18n entre ES/EN/CA y corrección de tests unitarios (658 passed, 0 errores de type-check).
- **Fase 2.1 (`client/medical-profile.astro`)**: Integración de selector interactivo de exclusión de categorías y alimentos específicos conectado a `foods_library`.
- **Fase 2.2 (`trainer/diets.astro`)**: Creador y editor de dietas con catálogo de alimentos, autocompletado de macros proporcional a la porción (`calcMacrosForPortion`) y detección en tiempo real de alérgenos y conflictos contra el perfil del cliente (`checkDietConflicts`).
- **Fase 2.3 (`client/diets.astro`)**: Visualización de dietas con traducciones automáticas de alimentos, tags de alérgenos y modal interactivo de sustitutos sugeridos (`suggestSubstitutes`).
- **Documentación**: Actualizados `docs/features/BIBLIOTECA_ALIMENTOS.md`, `CHANGELOG.md`, `TASK.md` y planes de trabajo.

---

## [Sin versión] - 2026-08-12

### 🧪 Testing Aumentado (14:47 - 15:00, Europe/Madrid)

- **tests/unit/lib/client/intoleranceChecker.test.ts** — ✅ Creado: 46 tests para módulo crítico de detección de alérgenos e intolerancias
- **tests/unit/lib/client/adherenceService.test.ts** — ✅ Creado: 26 tests para cálculo de adherencia semanal
- **tests/unit/lib/client/onboardingService.test.ts** — ✅ Creado: 36 tests para flujo de onboarding del cliente
- **Resultado suite completa**: 720 passed, 4 skipped (59 archivos) — ↑108 tests (+17% coverage)

---

## [Sin versión] - 2026-08-10

### Auditoría Técnica (11:36 - 12:08, Europe/Madrid)
- **docs/AUDITORIA_2026-08-10.md**: Nuevo archivo de auditoría con fecha/hora, verificación del trabajo del agente activo, y errores de type-check documentados con priorización. Progreso del agente: 29 → 13 errores.
- **agents/audit-orchestrator/GUIDE.md**: Añadido flujo de pre-auditoría y post-auditoría con registro de fecha/hora. Corregida referencia de `AUDIT_REPORT.md` → `AUDITORIA_UNIFICADA.md`.
- **agents/audit-security/GUIDE.md**: Añadidos subpasos y comandos de verificación (grep) para cada área de auditoría.
- **agents/fix-i18n/GUIDE.md**: Añadidos subpasos con comandos de comparación de claves ES/EN.
- **agents/fix-types/GUIDE.md**: Añadidos subpasos y sección de casos límite (parámetros, retornos, arrays, objetos, eventos DOM, Firestore, JSON.parse).
- **agents/__master.md**: Corregidas referencias a `TODO.md` y `TASK.md` inexistentes. Añadidos `PROTOCOLO_AGENTES_PRO.md`, `AUDITORIA_UNIFICADA.md` y `AUDITORIA_2026-08-10.md` a referencias rápidas.
- **agents/fix-logger/GUIDE.md**: Añadidos subpasos con comandos grep y casos límite (devtools/debug/logger.ts excluidos).
- **agents/fix-colors/GUIDE.md**: Añadidos subpasos con comandos grep y verificación final de tokens.
- **agents/fix-testing/GUIDE.md**: Añadidos subpasos con comandos de detección de placeholders y casos límite.
- **agents/fix-performance/GUIDE.md**: Añadidos subpasos con comandos de detección de onSnapshot sin cleanup y casos límite.
- **agents/fix-theme/GUIDE.md**: Añadidos subpasos con comandos de conteo de variables CSS y casos límite.
- **agents/fix-csp/GUIDE.md**: Añadidos subpasos con comandos de detección de `<style>` y casos límite.
- **agents/audit-quality/GUIDE.md**: Añadidos subpasos con comandos grep para tipado, tamaño, logging, estado global y CSP.
- **agents/audit-performance/GUIDE.md**: Añadidos subpasos con comandos de detección de queries sin limit y onSnapshot sin cleanup.
- **agents/audit-testing/GUIDE.md**: Añadidos subpasos con comandos de detección de placeholders y cobertura.
- **agents/audit-i18n/GUIDE.md**: Añadidos subpasos con comandos de comparación de claves ES/EN y cobertura por módulo.
- **agents/audit-uiux/GUIDE.md**: Añadidos subpasos con comandos de detección de colores hardcodeados y accesibilidad.
- **docs/PROTOCOLO_AGENTES_PRO.md**: Añadida sección de Registro de Auditorías con formato obligatorio de fecha/hora y checklist de auditoría.

### Verificado (trabajo del agente activo)
- ✅ **CORREGIDO**: `src/layouts/AdminLayout.astro` — eliminada duplicación de frontmatter (281→184 líneas), navegación preservada
- ✅ **CORREGIDO**: `src/lib/trainer/trainerChat.ts` — comentarios 🔒 CRÍTICO añadidos, queries preservadas
- ✅ **CORREGIDO**: `src/lib/trainer/trainerWorkouts.ts` — comentarios 🔒 CRÍTICO añadidos, queries preservadas
- ✅ **CORREGIDO**: `src/lib/client/adherenceService.ts` — tipado `as MealProgressLog`/`as WorkoutProgressLog`
- ✅ **CREADO**: `docs/PROTOCOLO_AGENTES_PRO.md` — protocolo profesional de 405 líneas

### ✅ Type-check corregido (29 → 0 errores, verificado 13:11)
- **Commit `d0f0e0e`** — `fix: type-check, translations parity, trainer libs and pages typing`
- ✅ **CORREGIDO**: `src/pages/admin/devtools.astro` — tipado completo de `log`, `rs`, `init` (8 errores)
- ✅ **CORREGIDO**: `src/pages/admin/exercises.astro` — `class` → `className`, guard para `muscleGroups[0]` (4 errores)
- ✅ **CORREGIDO**: `src/pages/client/diets.astro` — importado `escapeHtml` (2 errores)
- ✅ **CORREGIDO**: `src/pages/client/workouts.astro` — guard para `dayKeys`, corregido `rpe` → `overallRpe` + `status` + `workoutName` (3 errores)
- ✅ **CORREGIDO**: `src/pages/trainer/clients.astro` — tipado completo de `unsubClients`, `allClients`, `initClients`, `renderDetailView` (6 errores)
- ✅ **CORREGIDO**: `src/pages/trainer/workouts.astro` — eliminado `w.clientName` inexistente, añadido `videoUrl`/`description` (2 errores)
- ✅ **CORREGIDO**: `src/i18n/locales/en.ts` — añadida clave `admin.modal.resetPwd` (paridad i18n P0-5)
- ✅ **CORREGIDO**: `src/lib/trainer/types.ts` — `date` opcional en `WorkoutSessionLog`

### ✅ Tests verificados (13:12 - 13:20)
- **Suite completa**: 612 passed, 4 skipped, 56 test files (55 passed, 1 skipped)
- Error 0 en la suite de tests tras la corrección del type-check
- Se mantienen los avisos de i18n de keys no usadas (warnings informativos, no errores)

---

## [Sin versión] - 2026-08-04

### Agregado
- **docs/AUDITORIA_UNIFICADA.md**: Nuevo archivo que consolida las 4 auditorías previas (`AUDIT_REPORT.md`, `AUDITORIA_COMPLETA_CAMPFIT.md`, `AUDITORIA_COMPLETA_PRO`, `AUDITORIA_DIETAS_TRAINER.md`) en una sola fuente de verdad con estado verificado. Se re-verificaron los hallazgos CRÍTICOS (P0) y de la auditoría de dietas contra el código actual.

### Verificado (hallazgos re-chequeados 2026-08-04)
- ✅ **CORREGIDO**: `firestore.rules` — ownership `trainerId == request.auth.uid` en diets/workouts (antes `isStaff()` sin verificación)
- ✅ **CORREGIDO**: `trainer/diets.astro` — usa `requireRole(["trainer", "admin"])` (antes solo `requireAuth`)
- ✅ **CORREGIDO**: `client/diets.astro` — `registerMealComplete(currentClientId, ...)` (antes clientId vacío)
- ✅ **CORREGIDO**: `templateService.ts` — archivo íntegro + `isClientAssignedToTrainer()` (antes corrupto con `r/**`)
- ✅ **CORREGIDO**: `trainer/types.ts` — unions estrictas + `allergens` + `foodId` (antes `type: string` sin allergens)
- ⚠️ **VIGENTE**: `routeGuards.ts` — faltan `/trainer/clinical`, `/client/support`, `/client/settings`
- ⚠️ **VIGENTE**: `en.ts` — falta clave `admin.modal.resetPwd` (paridad i18n)

### Ronda 2 — Hallazgos profundos (2026-08-04)
- ✅ **CORREGIDO**: `onSnapshot` en `dietService`, `workoutService`, `progressService`, `achievementsService`, `adherenceService`, `templateService` — todos retornan unsubscribe correctamente (PERF-003/004/005)

## [Sin versión] - 2026-08-05

### Documentación
- **Consolidación de la Base de Documentación**:
  - Actualizados `CONTEXT.md`, `.clinerules` y `docs/FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md` reflejando Astro 7, SSG mode y 11 colecciones Firestore.
  - Creado `docs/README.md` como índice maestro navegable.
  - Creadas especificaciones técnicas completas de módulos: `docs/features/BIBLIOTECA_ALIMENTOS.md` y `docs/features/BIBLIOTECA_EJERCICIOS.md`.
  - Creada guía operacional `docs/REFERENCIA_RAPIDA.md`.
  - Archivados documentos obsoletos (`MASTER.md`, `AUDIT_REPORT.md`, etc.) en `docs/_archive/`.
- ✅ **CORREGIDO**: `docs/MASTER.md` y `nuevo_proyecto/00_indice.md` actualizados de "Astro 5" a "Astro 7" (DOC-001)
- ✅ **CORREGIDO**: `nuevo_proyecto/00_indice.md` ahora lista `19_plan_refactor_optimizacion.md` (DOC-002)
- ✅ **CORREGIDO**: `nuevo_proyecto/00_indice.md` alineado a SSG estático (eliminada referencia a SSR con @astrojs/node) (DOC-003)
- ⚠️ **PARCIAL**: `console.*` en producción — `BaseLayout.astro:44` y `client/chat.astro` (los de debug/devtools son aceptables)

---

## [Sin versión] - 2026-08-03

### Actualizado
- **docs/THEME.md**: Reescrito completamente para reflejar el Theme v2.0 real. Se documentaron: modos `'light' | 'dark' | 'auto'`, flavors (`emerald/ocean/sunset/onyx`), `$systemPreference`, `$resolvedMode`, `$flavorName`, `$themeDisplayName`, acciones nuevas (`setThemeMode`, `toggleThemeMode`, `followSystemTheme`, `setThemeFlavor`, `cycleThemeFlavor`, `watchSystemTheme`, `unwatchSystemTheme`, `registerFlavorShortcut`), persistencia con keys `campfit_theme_mode`/`campfit_theme_flavor` + migración legacy, tokens v2 (`--brand`, `--surface-*`, `--accent-*`, motion system), atajos de teclado (Ctrl+Shift+T/F), y aliases backward-compatibles deprecados.

### Mejorado
- **src/types/index.ts**: `AuthError` convertido de interface a clase que extiende `Error` con propiedad `code` tipada. Ahora soporta `instanceof AuthError` y mantiene compatibilidad con los consumidores que usan `.code`.
- **src/services/authService.ts**: `toAuthError()` ahora devuelve `AuthError` tipado (clase) en lugar de `Error` con cast. Se añadió JSDoc con `@param` y `@returns`.
- **tests/unit/services/authService.test.ts**: Añadido mock de `AuthError` en `vi.mock('@/types')` para que los 16 tests pasen con la nueva clase.

### Verificado
- Tests authService: 16/16 passed ✅
- Suite completa: 604 passed, 2 fallos preexistentes (templateService.ts corrupto con `r/**` al inicio, y paridad i18n `admin.modal.resetPwd` faltante en en.ts) — no relacionados con estos cambios.

---

## [Sin versión] - 2026-02-02

### Corregido
- **admin/users.astro**: Restaurado archivo completo (820 líneas) desde git después de corrupción/minificación accidental durante auditoría. Se recuperaron: modal de edición de usuario, asignación de trainer, bloquear/desbloquear, ver perfil médico, reset contraseña, eliminar usuario, filtro por rol y búsqueda.
- **adminSubscriptions.ts**: Restaurado `orderBy('name', 'asc')` en `subscribeToTrainers` que fue eliminado durante auditoría. Este orderBy es crítico para el dropdown de asignación de trainers.
- **adminRender.ts**: Refactorizado `renderUserCardExtended` para eliminar string replace frágil sobre `renderUserRow`. Ahora `renderUserRow` acepta parámetro `extraActions?: string` y `renderUserCardExtended` construye el botón de editar y lo pasa como parámetro.
- **client/dashboard.astro**: Restaurado a versión funcional anterior (`1283d58`) porque la versión actual tenía TypeScript en script inline y otros cambios no deseados. Se corrigieron también non-null assertions y type annotations en el script.
- **i18n/locales/{es,en}.ts**: Eliminadas traducciones duplicadas que causaban error de compilación TypeScript `An object literal cannot have multiple properties with the same name`. Se eliminaron 18 claves duplicadas en `es.ts` y 1 en `en.ts`. Las traducciones funcionales se preservaron.

### Agregado
- **.clinerules**: Agregadas 8 anti-regression rules (#11-#18) para prevenir destrucción de funcionalidades en futuras auditorías:
  - Nunca eliminar cláusulas `orderBy`, `where`, `limit` de queries Firestore
  - Nunca usar `replace_in_file` con SEARCH blocks genéricos
  - Nunca reescribir `.astro` sin before/after snapshot
  - Nunca delegar renderizado HTML a string replace
  - Siempre verificar `git diff` después de modificar services/libs
  - Siempre ejecutar `npm run type-check` y `npm test` después de cada cambio
  - Nunca confiar en caché del IDE
  - Documentar cada cambio en CHANGELOG.md

### Agregado
- **Comentarios de protección en código crítico**:
  - `adminSubscriptions.ts`: Comentarios `@protection` en `subscribeToTrainers` explicando por qué `orderBy('name', 'asc')` y el fallback son críticos.
  - `adminUsers.ts`: Comentario `@protection` en `updateUserProfile` explicando que es la única función de edición de usuarios.
  - `adminRender.ts`: Comentario `@protection` en `renderUserCardExtended` explicando que `showEdit` es usado por `admin/users.astro`.

### Agregado
- **Traducciones i18n faltantes** (no existían previamente en el código):
  - `es.ts` y `en.ts`: 23 claves nuevas de admin, client dashboard, trainer, diet editor y common
  - Ejemplos: `admin.mode.preview`, `client.activePlan`, `diet.editor.meal.allergens`, `trainer.templates`, `admin.no.diets`, `client.diet.noHistory`

### Verificado
- Tests unitarios admin: 53/53 passed
- Type-check: 0 errores en archivos i18n después de corrección
- Git diff confirmado: solo adiciones de traducciones, sin eliminaciones de funcionalidad
