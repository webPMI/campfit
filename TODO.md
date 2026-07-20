# 📋 CampFit - TODO Centralizado

> **Última actualización:** 2026-07-18  
> **Propósito:** Lista única de todas las tareas, optimizaciones y seguimiento del proyecto  
> **Para agentes IA:** Este es el archivo de referencia para ver qué hacer y qué está pendiente  
> **IMPORTANTE:** Este archivo reemplaza a `TODO_OPTIMIZACIONES.md`, `TASK_PROGRESS.md` y `tests/TASK_PROGRESS.md`  
> **Documentación:** Ver `docs/MASTER.md` para la documentación completa del proyecto
>
> 📌 **IMPORTANTE:** Antes de empezar cualquier tarea, leer `GIT_WORKFLOW.md` para entender el flujo de git/deploy.

---

## 📊 Resumen Ejecutivo

| Categoría | Total | Completadas | Pendientes |
|-----------|-------|-------------|------------|
| 🔴 CRÍTICO - Código Repetido | 9 | 3 | 6 |
| 🟡 MEDIO - Código Muerto/No Utilizado | 2 | 1 | 1 |
| 🟢 BAJO - Mejoras de Código | 3 | 0 | 3 |
| 🧪 Tests y Calidad | 8 | 4 | 4 |
| **TOTAL** | **22** | **8** | **14** |

---

## 🔴 CRÍTICO - Código Repetido (Duplicación)

### 1. Layouts - Código i18n duplicado
**Archivos afectados:**
- `src/layouts/AdminLayout.astro` (líneas 5-8)
- `src/layouts/ClientLayout.astro` (líneas 5-8)
- `src/layouts/TrainerLayout.astro` (líneas 5-8)

**Problema:** Los 3 layouts repiten exactamente el mismo bloque de código:
```typescript
const lang = (Astro.url.searchParams.get('lang') as Language) || 'es';
const t = (key: string) => translations[lang]?.[key] || translations['es']?.[key] || key;
const altLang = lang === 'es' ? 'en' : 'es';
const currentPath = Astro.url.pathname;
```

**Solución propuesta:** 
- Crear componente `PublicPageLayout.astro` en `src/layouts/`
- Mover toda la lógica i18n + fondo + language switcher ahí
- Las páginas públicas solo necesitan extender este layout

**Prioridad:** ⚠️ ALTA - Violación DRY, dificulta mantenimiento  
**Estado:** ✅ Completado (componentes creados y usados)

---

### 2. Layouts - Fondo decorativo duplicado
**Archivos afectados:**
- `src/layouts/AdminLayout.astro` (líneas 13-16)
- `src/layouts/ClientLayout.astro` (líneas 13-16)
- `src/layouts/TrainerLayout.astro` (líneas 13-16)

**Problema:** Bloque HTML idéntico repetido 3 veces:
```html
<div class="pointer-events-none fixed inset-0 overflow-hidden">
  <div class="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl"></div>
  <div class="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl"></div>
</div>
```

**Solución propuesta:**
- Crear componente `DecorativeBackground.astro` en `src/components/`
- Importar en los 3 layouts

**Prioridad:** ⚠️ MEDIA - Código visual, pero viola DRY  
**Estado:** ✅ Completado

---

### 3. Layouts - Language Switcher duplicado
**Archivos afectados:**
- `src/layouts/AdminLayout.astro` (líneas 19-29)
- `src/layouts/ClientLayout.astro` (líneas 19-29)
- `src/layouts/TrainerLayout.astro` (líneas 19-29)

**Problema:** Componente de cambio de idioma idéntico en los 3 layouts

**Solución propuesta:**
- Crear componente `LanguageSwitcher.astro` en `src/components/`
- Aceptar props: `currentPath`, `altLang`, `lang`
- Importar en los 3 layouts

**Prioridad:** ⚠️ MEDIA - Violación DRY  
**Estado:** ✅ Completado

---

### 4. Layouts - Wrapper con padding duplicado
**Archivos afectados:**
- `src/layouts/AdminLayout.astro`
- `src/layouts/ClientLayout.astro`
- `src/layouts/TrainerLayout.astro`

**Problema:** Código idéntico `<div class="pb-20"><slot /></div>` repetido 3 veces.

**Solución aplicada:**
- Movido a `BaseLayout.astro` — ahora los 3 layouts hijos solo tienen `<slot />` sin wrapper

**Prioridad:** ⚠️ BAJA  
**Estado:** ✅ Completado

---

### 5. Layouts - Firestore Debug Script duplicado
**Archivos afectados:**
- `src/layouts/AdminLayout.astro` (líneas 127-130)
- `src/layouts/ClientLayout.astro` (líneas 126-129)
- `src/layouts/TrainerLayout.astro` (líneas 126-129)

**Problema:** Script de debug importado en los 3 layouts

**Solución propuesta:**
- Mover a `BaseLayout.astro` para que se cargue una sola vez
- O crear un layout extendido `DebugLayout.astro` que herede de BaseLayout

**Prioridad:** ⚠️ MEDIA - Carga innecesaria de script 3 veces  
**Estado:** ✅ Completado (ya está en BaseLayout.astro con `import.meta.env.DEV`)

---

### 6. Páginas públicas - Frontmatter i18n duplicado
**Archivos afectados:**
- `src/pages/login.astro` (líneas 5-7)
- `src/pages/register.astro` (líneas 5-7)
- `src/pages/recover.astro` (líneas 5-7)
- `src/pages/index.astro` (líneas 5-7)

**Problema:** Código TypeScript idéntico en 4 páginas:
```typescript
const lang = (Astro.url.searchParams.get('lang') as Language) || 'es';
const t = (key: string) => translations[lang]?.[key] || translations['es']?.[key] || key;
const altLang = lang === 'es' ? 'en' : 'es';
```

**Solución propuesta:**
- Usar el componente `PublicPageLayout.astro` del hallazgo #1
- Las páginas públicas solo necesitan extender este layout

**Prioridad:** ⚠️ ALTA - 4 archivos duplicados  
**Estado:** ✅ Completado (páginas ya usan PublicPageLayout)

---

### 7. Páginas públicas - Fondo decorativo duplicado
**Archivos afectados:**
- `src/pages/login.astro` (líneas 13-16)
- `src/pages/register.astro` (líneas 13-16)
- `src/pages/recover.astro` (líneas 13-16)
- `src/pages/index.astro` (líneas 13-16)

**Problema:** Mismo bloque HTML que en layouts, repetido 4 veces más

**Solución propuesta:**
- Usar el componente `DecorativeBackground.astro` del hallazgo #2
- O incluirlo en `PublicPageLayout.astro`

**Prioridad:** ⚠️ MEDIA  
**Estado:** ✅ Completado

---

### 8. Páginas públicas - Language Switcher duplicado
**Archivos afectados:**
- `src/pages/login.astro` (líneas 19-29)
- `src/pages/register.astro` (líneas 19-29)
- `src/pages/recover.astro` (líneas 19-29)
- `src/pages/index.astro` (líneas 19-29)

**Problema:** Mismo componente que en layouts, repetido 4 veces más

**Solución propuesta:**
- Usar el componente `LanguageSwitcher.astro` del hallazgo #3
- O incluirlo en `PublicPageLayout.astro`

**Prioridad:** ⚠️ MEDIA  
**Estado:** ✅ Completado

---

### 9. Servicios - Función mapFirebaseUser duplicada
**Archivos afectados:**
- `src/services/authService.ts` (líneas 29-42) - `mapFirebaseUser()`
- `src/services/adminService.ts` (líneas 25-39 y 53-67) - código duplicado inline

**Problema:** 
- `authService` tiene `mapFirebaseUser(firebaseUser, profile)` 
- `adminService` repite la lógica de mapeo 2 veces con `mapFirestoreDocToUser(doc)`

**Solución propuesta:**
- Crear función pura `mapDocToUser(doc: any, fallbackName?: string): User` en `src/lib/helpers/userMappers.ts`
- Usar en ambos servicios
- Eliminar `mapFirebaseUser` y `mapFirestoreDocToUser`

**Prioridad:** 🔴 CRÍTICA - Duplicación de lógica de negocio  
**Estado:** ✅ Completado

---

## 🟡 MEDIO - Código Muerto o No Utilizado

### 10. Verificar uso de `src/lib/debug/firestoreDebug`
**Archivo:** `src/lib/debug/firestoreDebug.ts`

**Problema potencial:** 
- Se importa en 3 layouts (Admin, Client, Trainer)
- Verificar si realmente se usa en producción o es solo para desarrollo
- Si es solo para desarrollo, debería estar condicionado por `import.meta.env.DEV`

**Acción requerida:**
- Revisar el archivo `firestoreDebug.ts`
- Si es código de debug, agregar guardia: `if (import.meta.env.DEV) { ... }`
- Considerar eliminarlo en producción

**Prioridad:** 🟡 MEDIA  
**Estado:** ✅ Completado (ya está condicionado en BaseLayout.astro)

---

### 11. Verificar imports no usados en páginas
**Archivos a revisar:**
- Todas las páginas en `src/pages/`
- Todos los componentes en `src/components/`

**Problema potencial:** Imports de `translations` o `Language` que no se usan después de crear componentes compartidos

**Acción requerida:**
- Ejecutar `npm run lint` o `tsc --noEmit` para detectar imports no usados
- Limpiar imports huérfanos

**Prioridad:** 🟡 MEDIA  
**Estado:** ✅ Completado (páginas públicas migradas a PublicPageLayout, imports limpiados)

---

## 🟢 BAJO - Mejoras de Código

### 12. Normalizar nombres de iconos SVG
**Problema:** Los iconos SVG están hardcodeados en cada layout/página

**Solución propuesta:**
- Crear componente `Icon.astro` en `src/components/`
- Aceptar props: `name`, `size`
- Centralizar todos los SVGs en un diccionario

**Prioridad:** 🟢 BAJA - Mejora de mantenibilidad a largo plazo  
**Estado:** ⏳ Pendiente

---

### 13. Estandarizar manejo de errores en servicios
**Archivos:**
- `src/services/authService.ts`
- `src/services/adminService.ts`

**Problema:** 
- `authService` lanza `Error` genérico en línea 55
- No hay tipos específicos para errores de auth

**Solución propuesta:**
- Crear tipo `AuthError` en `src/types/index.ts` (ya existe, pero no se usa)
- Usar `AuthError` en lugar de `Error` genérico
- Implementar manejo tipado de errores

**Prioridad:** 🟢 BAJA - Mejora de type safety  
**Estado:** ⏳ Pendiente

---

### 14. Agregar JSDoc a funciones exportadas
**Archivos:**
- `src/services/authService.ts` - tiene JSDoc ✓
- `src/services/adminService.ts` - revisar si todas las funciones tienen JSDoc
- `src/stores/authStore.ts` - revisar JSDoc

**Problema:** No todas las funciones públicas tienen documentación JSDoc

**Solución propuesta:**
- Agregar `@param` y `@returns` a funciones exportadas sin documentación
- Seguir regla #4 del proyecto: "JSDoc en funciones públicas"

**Prioridad:** 🟢 BAJA - Documentación  
**Estado:** ⏳ Pendiente

---

## 🧪 Tests y Calidad

### 15. Tests eliminados (fake/muertos)
- [x] `tests/integration/auth.flow.test.ts` — todo skipped, código comentado
- [x] `tests/e2e/auth.e2e.ts` — duplicado exacto de `auth.spec.ts`
- [x] 3 tests `expect(true).toBe(true)` en `translations.test.ts` reemplazados por aserciones reales

**Estado:** ✅ Completado

---

### 16. Configuración arreglada
- [x] `playwright.config.ts` ahora detecta `*.spec.ts` además de `*.e2e.ts`
- [x] `vitest.config.ts` limpiado (sin includes/excludes duplicados)

**Estado:** ✅ Completado

---

### 17. Cobertura final
- **Tests totales:** 260 (antes 185)
- **Test files:** 18 (antes 14)
- **Cobertura global:** 22.62% statements, 81.66% branches, 51.37% functions
  - Antes: 12.39% statements, 78.41% branches, 40.9% functions

**Estado:** ✅ Completado

---

### 18. Módulos nuevos con cobertura ~100%
- [x] `src/lib/shared/i18n.ts` — 100% statements/branches/functions
- [x] `src/lib/shared/logger.ts` — 100% statements/functions
- [x] `src/lib/shared/ui.ts` — 97.82% statements, 96% branches
- [x] `src/lib/shared/authGuard.ts` — 82.97% statements, 80% branches

**Estado:** ✅ Completado

---

### 19. Próximos pasos en tests
- [ ] `src/lib/admin/adminUtils.ts` (18.42%)
- [ ] `src/lib/trainer/trainerUtils.ts` (0%)
- [ ] `src/lib/shared/chat.ts` (59.8%)
- [ ] `src/lib/shared/profileService.ts` (44.38%)

**Prioridad:** 🟡 MEDIA  
**Estado:** ⏳ Pendiente

---

### 20. Implementar tests para páginas
- [ ] `client/dashboard.astro` (página principal del cliente)
- [ ] Componentes UI (Skeleton, BaseLayout)
- [ ] Tests E2E con Playwright para flujos críticos

**Prioridad:** 🟡 MEDIA  
**Estado:** ⏳ Pendiente

---

## 🎯 Plan de Acción Recomendado

### Fase 1 - Refactorización Crítica (1-2 horas)
1. ✅ **#9** - Crear `src/lib/helpers/userMappers.ts` con función `mapDocToUser()`
2. ✅ **#9** - Refactorizar `authService.ts` para usar `mapDocToUser()`
3. ✅ **#9** - Refactorizar `adminService.ts` para usar `mapDocToUser()`
4. ✅ **#1** - Crear componente `PublicPageLayout.astro` para páginas públicas
5. ✅ **#6** - Migrar páginas públicas a `PublicPageLayout`

### Fase 2 - Componentes Compartidos (2-3 horas)
6. ✅ **#2** - Crear `DecorativeBackground.astro`
7. ✅ **#3** - Crear `LanguageSwitcher.astro`
8. ✅ **#1** - Mover lógica i18n a `BaseLayout.astro` o helper
9. ✅ **#5** - Mover debug script a `BaseLayout.astro`
10. ✅ **#8** - Usar componentes en layouts

### Fase 3 - Limpieza (1 hora)
11. ✅ **#10** - Verificar y condicionar código de debug
12. ⏳ **#11** - Limpiar imports no usados
13. ⏳ **#12, #13, #14** - Mejoras menores (opcional)

---

## 🤖 Harness para Agentes IA

### Archivos del Harness (creados)
- [x] `AGENTS_GUIDE.md` — Guía completa para agentes IA
- [x] `CONTEXT.md` — Contexto comprimido del proyecto
- [x] `TASK.md` — Tarea actual del agente
- [x] `CLAUDE.md` — Instrucciones para Claude
- [x] `AGENTS.md` — Instrucciones rápidas para agentes
- [x] `scripts/agent-lock.sh` — Sistema de lock multi-agente
- [x] `scripts/validate.sh` — Validación pre-commit
- [x] `scripts/check-context.sh` — Verificador de contexto
- [x] `.github/workflows/ci.yml` — CI/CD pipeline completo
- [x] `.github/workflows/agent-checks.yml` — Validación rápida para agentes
- [x] `.eslintrc.cjs` — Config ESLint corregida (sin React)
- [x] `astro.config.mjs` — Config Astro corregida (static con SSR comentado)
- [x] `package.json` — Scripts añadidos (lint, format, type-check, validate, context)
- [x] `.gitignore` — Actualizado con agent-lock, coverage, reports

### Flujo de trabajo para agentes
1. Leer `CONTEXT.md` y `TASK.md`
2. Verificar lock: `bash scripts/agent-lock.sh check`
3. Hacer pull: `git pull origin master --allow-unrelated-histories --no-edit`
4. Adquirir lock: `bash scripts/agent-lock.sh acquire "agent-name" "feature"`
5. Implementar cambios
6. Validar: `bash scripts/validate.sh`
7. Commit y push
8. Liberar lock: `bash scripts/agent-lock.sh release`

---

## 📝 Notas para Agentes

### Reglas a respetar durante la implementación:
1. **No usar `any`** - Tipar explícitamente todo
2. **No lógica de negocio en UI** - Los componentes solo renderizan
3. **Tests unitarios** - Mínimo 1 test por función pública afectada
4. **JSDoc** - Documentar funciones públicas
5. **Componentes atómicos** - Una responsabilidad por componente

### Archivos a crear:
- `src/components/DecorativeBackground.astro` ✅
- `src/components/LanguageSwitcher.astro` ✅
- `src/components/PublicPageLayout.astro` ✅
- `src/lib/helpers/userMappers.ts` ✅

### Archivos a modificar:
- `src/layouts/AdminLayout.astro` ✅
- `src/layouts/ClientLayout.astro` ✅
- `src/layouts/TrainerLayout.astro` ✅
- `src/layouts/BaseLayout.astro` ✅
- `src/pages/login.astro` ✅
- `src/pages/register.astro` ✅
- `src/pages/recover.astro` ✅
- `src/pages/index.astro` ✅
- `src/services/authService.ts` ✅
- `src/services/adminService.ts` ✅

### Comandos de verificación:
```bash
# Verificar tipos
npm run type-check

# Ejecutar tests
npm test

# Build de producción
npm run build

# Validación completa
bash scripts/validate.sh
```

---

## 🔍 Cómo Verificar el Progreso

Después de cada fase, ejecutar:
```bash
npm test && npm run build
```

O usar el validador completo:
```bash
bash scripts/validate.sh
```

Si hay errores, revisar:
1. Imports rotos
2. Tipos incorrectos
3. Props faltantes en componentes

---

## 📚 Documentación de Referencia

- **Guía completa para agentes:** `AGENTS_GUIDE.md`
- **Contexto del proyecto:** `CONTEXT.md`
- **Tarea actual:** `TASK.md`
- **Índice de documentación:** `nuevo_proyecto/00_indice.md`
- **Reglas de desarrollo:** `.clinerules`
- **Flujo de git:** `GIT_WORKFLOW.md`

---

**Mantenido por:** Equipo CampFit  
**Versión:** 2.0


