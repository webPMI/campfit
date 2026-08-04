# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto usa [Semantic Versioning](https://semver.org/lang/es/).

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
