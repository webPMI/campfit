# ⚠️ ARCHIVO OBSOLETO - TODO CENTRALIZADO

> **Este archivo ha sido reemplazado por `TODO.md`**  
> **Fecha de obsolescencia:** 2026-06-13  
> **Motivo:** Centralización de toda la información de tareas y optimizaciones

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
- Crear un componente `LanguageProvider.astro` en `src/components/`
- O mover esta lógica a `BaseLayout.astro` y pasar `lang`, `t`, `altLang`, `currentPath` como props
- Extraer a función helper en `src/lib/i18n/helpers.ts`

**Prioridad:** ⚠️ ALTA - Violación DRY, dificulta mantenimiento

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

---

### 4. Layouts - Wrapper con padding duplicado
**Archivos afectados:**
- `src/layouts/AdminLayout.astro` (líneas 31-33)
- `src/layouts/ClientLayout.astro` (líneas 31-33)
- `src/layouts/TrainerLayout.astro` (líneas 31-33)

**Problema:** Código idéntico:
```html
<div class="pb-20">
  <slot />
</div>
```

**Solución propuesta:**
- Mover a `BaseLayout.astro` si todos los layouts lo usan
- O crear componente `ContentWrapper.astro`

**Prioridad:** ⚠️ BAJA - Solo 3 líneas, pero acumula

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
- Crear componente `PublicPageLayout.astro` en `src/layouts/`
- Mover toda la lógica i18n + fondo + language switcher ahí
- Las páginas públicas solo necesitan extender este layout

**Prioridad:** ⚠️ ALTA - 4 archivos duplicados

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

---

## 🟢 BAJO - Mejoras de Código

### 12. Normalizar nombres de iconos SVG
**Problema:** Los iconos SVG están hardcodeados en cada layout/página

**Solución propuesta:**
- Crear componente `Icon.astro` en `src/components/`
- Aceptar props: `name`, `size`
- Centralizar todos los SVGs en un diccionario

**Prioridad:** 🟢 BAJA - Mejora de mantenibilidad a largo plazo

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

---

## 📊 Resumen de Prioridades

| Prioridad | Cantidad | Acción Requerida |
|-----------|----------|------------------|
| 🔴 CRÍTICA | 1 | Refactorizar mapeo de usuarios (hallazgo #9) |
| ⚠️ ALTA | 2 | Crear componentes compartidos para i18n (hallazgos #1, #6) |
| ⚠️ MEDIA | 5 | Componentes para fondo, language switcher, debug script (hallazgos #2, #3, #5, #7, #8) |
| 🟡 MEDIA | 2 | Verificar código muerto y limpiar imports (hallazgos #10, #11) |
| 🟢 BAJA | 4 | Mejoras de mantenibilidad (hallazgos #12, #13, #14) |

**Total de hallazgos:** 14

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
12. ✅ **#11** - Limpiar imports no usados
13. ✅ **#12, #13, #14** - Mejoras menores (opcional)

---

## 📝 Notas para Agentes

### Reglas a respetar durante la implementación:
1. **No usar `any`** - Tipar explícitamente todo
2. **No lógica de negocio en UI** - Los componentes solo renderizan
3. **Tests unitarios** - Mínimo 1 test por función pública afectada
4. **JSDoc** - Documentar funciones públicas
5. **Componentes atómicos** - Una responsabilidad por componente

### Archivos a crear:
- `src/components/DecorativeBackground.astro`
- `src/components/LanguageSwitcher.astro`
- `src/components/PublicPageLayout.astro` (opcional, si se agrupa)
- `src/lib/helpers/userMappers.ts`

### Archivos a modificar:
- `src/layouts/AdminLayout.astro`
- `src/layouts/ClientLayout.astro`
- `src/layouts/TrainerLayout.astro`
- `src/layouts/BaseLayout.astro`
- `src/pages/login.astro`
- `src/pages/register.astro`
- `src/pages/recover.astro`
- `src/pages/index.astro`
- `src/services/authService.ts`
- `src/services/adminService.ts`

### Comandos de verificación:
```bash
# Verificar tipos
npx tsc --noEmit

# Ejecutar tests
npm run test

# Verificar lint
npm run lint

# Build de producción
npm run build
```

---

## 🔍 Cómo Verificar el Progreso

Después de cada fase, ejecutar:
```bash
npm run test && npm run build
```

Si hay errores, revisar:
1. Imports rotos
2. Tipos incorrectos
3. Props faltantes en componentes

---

**Última actualización:** 2026-06-13
**Responsable:** Equipo de desarrollo CampFit
**Revisión:** Pendiente