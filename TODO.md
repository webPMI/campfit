# CampFit 2.0 — Análisis de Optimización y Patrones

> **Propósito:** Documentar patrones, problemas encontrados y mejoras necesarias para que otros agentes puedan abordar tareas específicas de refactorización y optimización.

---

## 📋 Estado Actual de Bugs Corregidos

### ✅ Corregidos

| # | Archivo | Problema | Fix |
|---|---------|----------|-----|
| 1 | `src/pages/admin/clients.astro` | Usaba `requireAuth` en vez de `requireAdmin` | Cambiado a `requireAdmin` |
| 2 | `src/pages/admin/trainers.astro` | Usaba `requireAuth` en vez de `requireAdmin` | Cambiado a `requireAdmin` |
| 3 | `src/pages/trainer/settings.astro` | Importaba `requireAuth`, `signOutUser`, `showToast` desde `@/lib/admin/adminUtils` | Cambiado a `@/lib/trainer/trainerUtils` |
| 4 | `src/lib/trainer/trainerUtils.ts` | Faltaba `getRoleBadge` en import de `@/lib/shared/ui` | Añadido al import |
| 5 | `src/lib/trainer/trainerUtils.ts` | Faltaban re-exports de `ICONS`, `escapeHtml`, `formatDate`, `formatTime`, `getUserInitial`, `showToast`, `renderEmptyState`, `renderLoadingState`, `getRoleBadge` | Añadido bloque de re-export |
| 6 | `src/lib/trainer/trainerUtils.ts` | Faltaba función `signOutUser` | Implementada |

---

## 🔍 Patrones Detectados

### 1. Duplicación de Código entre `adminUtils.ts` y `trainerUtils.ts`

Ambos archivos tienen implementaciones casi idénticas de:
- `requireAuth` / `requireAdmin` (auth guards)
- `renderClientCard`, `renderEmptyState`, `renderLoadingState` (render functions)
- `subscribeToUsers`, `subscribeToClients` (Firestore subscriptions)
- `signOutUser` (logout)
- Re-exports de `@/lib/shared/ui`

**Propuesta:** Crear un `@/lib/shared/authGuard.ts` que unifique `requireAuth` y `requireAdmin`.

### 2. Funciones Deprecadas en `profileService.ts`

- `getProfileInitial()` → usar `getUserInitial` de `@/lib/shared/ui`
- `getRoleBadgeClass()` → usar `getRoleBadge` de `@/lib/shared/ui`
- `showToast()` → usar `showToast` de `@/lib/shared/ui`

**Impacto:** `client/settings.astro` importa `showToast` desde `profileService` (deprecated).

### 3. Patrón de i18n Inconsistente

Todas las páginas usan:
```astro
const lang = (Astro.url.searchParams.get('lang') as Language) || 'es';
const t = (key: string) => translations[lang]?.[key] || translations['es']?.[key] || key;
```

Pero las páginas de trainer/client en el script también hacen:
```js
const lang = new URLSearchParams(window.location.search).get('lang') || 'es';
```

**Propuesta:** Crear un helper `getLanguage()` en `@/lib/shared/i18n.ts` que unifique esto.

### 4. Manejo de Suscripciones Firestore sin Cleanup

Varias páginas usan `onSnapshot` pero **no guardan la referencia `Unsubscribe`** para hacer cleanup. Esto puede causar memory leaks y cargas fantasma.

**Archivos afectados:** `admin/dashboard.astro`, `admin/users.astro`, `trainer/dashboard.astro`, `trainer/clients.astro`, `trainer/diets.astro`, `trainer/chat.astro`

**Propuesta:** Implementar patrón de cleanup con `AbortController` o almacenar `Unsubscribe` en `window.__unsubscribers`.

### 5. Inline Scripts en Páginas Astro

Todas las páginas tienen `<script>` con lógica de negocio directamente en la página. Esto viola la regla de "No lógica de negocio en UI".

**Propuesta:** Migrar lógica a archivos `.ts` separados en `src/lib/client/` o `src/lib/trainer/`.

### 6. Traducciones Hardcodeadas

Varios componentes tienen strings en español hardcodeados en lugar de usar el sistema de traducción:
- `admin/clients.astro`: `'Sin clientes registrados'`
- `admin/trainers.astro`: `'Sin entrenadores registrados'`
- `trainer/settings.astro`: `'Cambiar Contraseña'`, `'Nueva Contraseña'`, `'Confirmar Contraseña'`, `'Mi Perfil'`, `'El nombre es obligatorio'`, `'Mínimo 6 caracteres'`, `'Las contraseñas no coinciden'`, `'Error al cerrar sesión'`

### 7. Tipos `any` en `trainerUtils.ts`

Las interfaces `TrainerWorkout`, `TrainerDiet`, `TrainerMessage` usan `createdAt?: any` y `updatedAt?: any`.

**Propuesta:** Usar `Timestamp` de Firestore o `Date`.

### 8. Falta de Estados en Componentes

Varias páginas no manejan explícitamente los 4 estados requeridos (loading, empty, error, success):
- `admin/settings.astro`: No tiene empty state ni error state para el perfil
- `trainer/settings.astro`: No tiene empty state para el perfil
- `client/settings.astro`: No tiene error state para el perfil

### 9. Layouts sin Auth Guard Server-Side

Los layouts (`AdminLayout.astro`, `TrainerLayout.astro`, `ClientLayout.astro`) no tienen verificación de rol en el servidor. Toda la protección es client-side via `requireAuth`/`requireAdmin`.

**Propuesta:** Implementar middleware de Astro para verificar autenticación y roles server-side.

---

## 🎯 Tareas para Otros Agentes

### Prioridad Alta

- [ ] **AGENTE-REFACTOR-1:** Unificar `requireAuth` y `requireAdmin` en `@/lib/shared/authGuard.ts`
  - Archivos: `src/lib/admin/adminUtils.ts`, `src/lib/trainer/trainerUtils.ts`
  - Crear `src/lib/shared/authGuard.ts` con ambas funciones
  - Actualizar imports en todas las páginas

- [ ] **AGENTE-REFACTOR-2:** Eliminar funciones deprecadas de `profileService.ts`
  - Reemplazar `getProfileInitial()` con `getUserInitial` de `@/lib/shared/ui`
  - Reemplazar `getRoleBadgeClass()` con `getRoleBadge` de `@/lib/shared/ui`
  - Reemplazar `showToast()` con `showToast` de `@/lib/shared/ui`
  - Actualizar `client/settings.astro` para importar `showToast` desde `@/lib/shared/ui`

- [ ] **AGENTE-REFACTOR-3:** Implementar cleanup de suscripciones Firestore
  - En todas las páginas que usan `onSnapshot`, guardar el `Unsubscribe` y llamarlo en `beforeunload` o con un patrón de ciclo de vida

### Prioridad Media

- [ ] **AGENTE-I18N-1:** Crear helper `getLanguage()` en `@/lib/shared/i18n.ts`
  - Unificar la obtención del idioma (server-side y client-side)
  - Reemplazar en todas las páginas

- [ ] **AGENTE-I18N-2:** Traducir strings hardcodeados
  - Revisar `admin/clients.astro`, `admin/trainers.astro`, `trainer/settings.astro`
  - Añadir claves faltantes en `src/i18n/translations.ts`

- [ ] **AGENTE-TYPES-1:** Reemplazar `any` en tipos de `trainerUtils.ts`
  - `createdAt?: any` → `createdAt?: Timestamp`
  - `updatedAt?: any` → `updatedAt?: Timestamp`

### Prioridad Baja

- [ ] **AGENTE-UI-1:** Añadir estados faltantes en páginas de settings
  - `admin/settings.astro`: empty state + error state
  - `trainer/settings.astro`: empty state
  - `client/settings.astro`: error state

- [ ] **AGENTE-SSR-1:** Implementar middleware de Astro para auth server-side
  - Verificar rol antes de renderizar layouts
  - Redirigir a login si no autenticado
  - Redirigir a dashboard si no tiene permisos

- [ ] **AGENTE-REFACTOR-4:** Migrar lógica de scripts inline a archivos separados
  - Mover lógica de `admin/dashboard.astro` a `src/lib/admin/dashboard.ts`
  - Mover lógica de `admin/users.astro` a `src/lib/admin/users.ts`
  - Mover lógica de `trainer/dashboard.astro` a `src/lib/trainer/dashboard.ts`
  - (etc.)

---

## 📊 Resumen de Archivos Analizados

| Módulo | Archivos | Estado |
|--------|----------|--------|
| Admin pages | 5 (`dashboard`, `users`, `clients`, `trainers`, `settings`) | ✅ Bugs corregidos |
| Admin utils | `adminUtils.ts` | ✅ Correcto |
| Trainer pages | 6 (`dashboard`, `clients`, `diets`, `workouts`, `chat`, `settings`) | ⚠️ 1 bug corregido |
| Trainer utils | `trainerUtils.ts` | ✅ Bugs corregidos |
| Client pages | 1 (`settings`) | ⚠️ Usa API deprecada |
| Shared | `profileService.ts`, `ui.ts` | ⚠️ Funciones deprecadas |
| Layouts | 3 (`Admin`, `Trainer`, `Client`) | ⚠️ Sin SSR auth |

---

## 🚀 Próximos Pasos Recomendados

1. Ejecutar `AGENTE-REFACTOR-1` (unificar auth guards) — desbloquea varias mejoras
2. Ejecutar `AGENTE-REFACTOR-2` (eliminar deprecados) — limpia API surface
3. Ejecutar `AGENTE-REFACTOR-3` (cleanup suscripciones) — previene memory leaks
4. Ejecutar `AGENTE-I18N-1` y `AGENTE-I18N-2` (i18n) — mejora mantenibilidad
5. Ejecutar tareas de prioridad baja según disponibilidad
