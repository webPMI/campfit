# CampFit 2.0 — Análisis de Optimización y Refactor

> **Propósito:** Documentar patrones, bugs, mejoras y deuda técnica encontrados tras revisar los módulos de **User**, **Client**, **Trainer** y **Admin**. Este documento sirve como checklist detallado para que otros agentes implementen las correcciones y optimizaciones.

---

## 📋 Índice

1. [Patrones Detectados](#1-patrones-detectados)
2. [Bugs y Problemas Críticos](#2-bugs-y-problemas-críticos)
3. [Deuda Técnica](#3-deuda-técnica)
4. [Mejoras de UI/UX](#4-mejoras-de-uiux)
5. [Optimizaciones de Rendimiento](#5-optimizaciones-de-rendimiento)
6. [Seguridad](#6-seguridad)
7. [Testing](#7-testing)
8. [Plan de Acción Priorizado — Checklist para Agentes](#8-plan-de-acción-priorizado--checklist-para-agentes)

---

## 1. Patrones Detectados

### 1.1 Duplicación de Código

#### 🔴 CRÍTICO: `escapeHtml()` duplicado en 3 archivos
- `src/lib/admin/adminUtils.ts` (línea 121)
- `src/lib/shared/profileService.ts` (línea 446)
- `src/lib/trainer/trainerUtils.ts` (duplicado)

**Solución:** Crear `src/lib/shared/escapeHtml.ts` y reutilizar.

#### 🔴 CRÍTICO: `showToast()` duplicado en 2 archivos con API diferente
- `src/lib/admin/adminUtils.ts` (línea 171) — usa `{ message, type }` como objeto
- `src/lib/shared/profileService.ts` (línea 367) — usa `(message, type, id?, duration?)` como parámetros posicionales

**Solución:** Unificar API en `src/lib/shared/toast.ts`. La firma de adminUtils es más limpia (objeto).

#### 🟡 ALTO: `getRoleBadge()` duplicado
- `src/lib/admin/adminUtils.ts` (línea 103)
- `src/lib/shared/profileService.ts` (línea 216) — como `getRoleBadgeClass()`

**Solución:** Unificar en `src/lib/shared/roleUtils.ts`.

#### 🟡 ALTO: `getUserInitial()` duplicado
- `src/lib/admin/adminUtils.ts` (línea 163)
- `src/lib/shared/profileService.ts` (línea 207) — como `getProfileInitial()`
- `src/lib/trainer/trainerUtils.ts` (duplicado)

**Solución:** Unificar en `src/lib/shared/stringUtils.ts`.

#### 🟡 ALTO: `formatDate()` duplicado
- `src/lib/admin/adminUtils.ts` (línea 145)
- `src/lib/trainer/trainerUtils.ts` (duplicado)

**Solución:** Unificar en `src/lib/shared/dateUtils.ts`.

#### 🟡 ALTO: `renderLoadingState()` / `renderProfileLoadingState()` duplicados
- `src/lib/admin/adminUtils.ts` (línea 575)
- `src/lib/shared/profileService.ts` (línea 398)

**Solución:** Unificar en `src/lib/shared/uiComponents.ts`.

#### 🟢 MEDIO: Logger manual en cada módulo
- `adminUtils.ts` — `const LOG_PREFIX = '[Admin]'`
- `profileService.ts` — `const LOG_PREFIX = '[Profile]'`
- `trainerUtils.ts` — `const LOG_PREFIX = '[Trainer]'`
- `client/` services — `console.error('[Progress]', '[Diet]', '[Workout]')`

**Solución:** Crear `src/lib/shared/logger.ts` con función `createLogger(prefix)`.

### 1.2 Inconsistencias en la Arquitectura

#### 🔴 CRÍTICO: Auth guard duplicado
- `src/lib/admin/adminUtils.ts` — `requireAuth()` (línea 203)
- `src/lib/trainer/trainerUtils.ts` — `requireAuth()` (duplicado)
- `src/pages/client/settings.astro` — usa `authService.onAuthChange()` directamente

**Solución:** Unificar en `src/lib/shared/authGuard.ts`. El `routeGuards.ts` ya existe pero no se usa en páginas individuales.

#### 🟡 ALTO: Settings pages — 3 implementaciones casi idénticas
- `src/pages/admin/settings.astro` (225 líneas)
- `src/pages/trainer/settings.astro` (193 líneas)
- `src/pages/client/settings.astro` (374 líneas)

**Problema:** ~80% del código es idéntico (profile form, password form, logout). Client tiene extras (theme toggle, language, email verification, trainer info).

**Solución:** Crear layout de settings compartido o componente `SettingsShell.astro` que acepte slots para secciones adicionales.

#### 🟢 MEDIO: Layouts casi idénticos
- `AdminLayout.astro` (130 líneas)
- `TrainerLayout.astro` (129 líneas)
- `ClientLayout.astro` (129 líneas)

**Problema:** Solo cambia la bottom navigation. El fondo decorativo, language switcher, y debug script son idénticos.

**Solución:** Extraer bottom nav a componentes separados y usar un layout base con slot para nav.

#### 🟢 MEDIO: `client/chatService.ts` es un wrapper vacío
- `src/lib/client/chatService.ts` (10 líneas) — solo re-exporta de `@/lib/shared/chat`
- Buen patrón de delegación, pero el archivo es innecesario

**Solución:** Eliminar `client/chatService.ts` y actualizar imports directamente a `@/lib/shared/chat`.

---

## 2. Bugs y Problemas Críticos

### 2.1 🐛 `console.error` en producción (violación de regla #7)

**Archivos afectados:**
- `src/lib/client/progressService.ts` — `console.error('[Progress] Error...')`
- `src/lib/client/dietService.ts` — `console.error('[Diet] Error...')`
- `src/lib/client/workoutService.ts` — `console.error('[Workout] Error...')`
- `src/pages/trainer/clients.astro` — `console.error('[TrainerClients] Error...')`
- `src/pages/admin/settings.astro` — `console.error('Error signing out:', err)`
- `src/pages/admin/users.astro` — `console.error('[Admin] Error saving user:', error)` (línea 414)
- `src/pages/admin/users.astro` — `console.error('[Admin] Error toggling block:', error)` (línea 448)
- `src/pages/admin/users.astro` — `console.error('[Admin] Error loading medical profile:', error)` (línea 527)
- `src/pages/admin/users.astro` — `console.error('[Admin] Error sending password reset:', error)` (línea 548)
- `src/pages/admin/users.astro` — `console.error('[Admin] Error deleting user:', error)` (línea 565)
- `src/pages/trainer/dashboard.astro` — `console.error('[TrainerDashboard] Error initializing:', error)` (línea 280)
- `src/pages/trainer/diets.astro` — `console.error('[TrainerDiets] Error saving:', error)` (línea 423)

**Solución:** Usar logger con `import.meta.env.DEV` check o sistema de logging centralizado.

### 2.2 🐛 `(window as any).__*` — Exposición global insegura

**Archivos afectados:**
- `src/pages/trainer/clients.astro` — `__showClientDetail` (línea 137, 358)
- `src/pages/trainer/diets.astro` — `__editDiet`, `__deleteDietConfirm`, `__closeEditor` (líneas 115-122, 431)
- `src/lib/admin/adminUtils.ts` — `__toggleRoleMenu` (línea 674)
- `src/pages/admin/users.astro` — `__closeUserModal`, `__closeMedicalModal`, `__saveUserEdit`, `__toggleBlockUser`, `__viewMedicalProfile`, `__resetUserPassword`, `__deleteCurrentUser` (líneas 368-568)

**Problema:** Múltiples funciones globales expuestas. Pueden causar conflictos si hay múltiples instancias. Posible XSS si un script externo puede llamarlas.

**Solución:** Migrar a event delegation con `data-*` attributes.

### 2.3 🐛 `subscribeToUsers()` sin filtro — Escalabilidad

**Archivo:** `src/lib/admin/adminUtils.ts` (línea 226)

**Problema:** `subscribeToUsers()` hace `onSnapshot(collection(db, 'users'))` sin filtros. Con miles de usuarios, descarga TODOS los documentos en cada cambio.

**Solución:** Implementar paginación o filtros por rol. Usar `subscribeToUsersByRole()` cuando sea posible.

### 2.4 🐛 `subscribeToCollectionCount()` — Ineficiente

**Archivo:** `src/lib/admin/adminUtils.ts` (línea 337)

**Problema:** `onSnapshot(collection(db, collectionName))` escucha TODA la colección solo para contar. Con miles de documentos, es muy costoso.

**Solución:** Usar `count()` de Firestore (agregación) o mantener un contador en un documento separado.

### 2.5 🐛 `subscribeToUsers()` ordena en cliente

**Archivo:** `src/lib/admin/adminUtils.ts` (línea 244)

**Problema:** Ordenar en cliente después de descargar todos los datos. Ineficiente y puede causar parpadeo.

**Solución:** Usar `orderBy('createdAt', 'desc')` en la query de Firestore.

### 2.6 🐛 `subscribeToTodayMeals()` — Posible race condition con fechas

**Archivo:** `src/lib/client/dietService.ts` (línea 147-150)

**Problema:** Las fechas `todayStart` y `todayEnd` se calculan en el cliente. Si el cliente está en diferente zona horaria, puede haber desfase.

**Solución:** Usar Timestamp de Firestore o normalizar a UTC.

### 2.7 🐛 `registerWeight()` usa `new Date()` en lugar de `serverTimestamp()`

**Archivo:** `src/lib/client/progressService.ts` (línea 55)

**Problema:** `date: new Date()` usa la hora del cliente, que puede ser incorrecta o manipulable.

**Solución:** Usar `serverTimestamp()` para la fecha del registro y `new Date()` solo como referencia local.

### 2.8 🐛 `registerMealComplete()` silencia errores

**Archivo:** `src/lib/client/dietService.ts` (línea 100-130)

**Problema:** La función atrapa errores y retorna `null` sin notificar al usuario. El caller no sabe si falló.

**Solución:** Propagar el error o retornar un resultado con mensaje.

### 2.9 🐛 `changePassword()` — No maneja `auth/needs-recent-login` en UI

**Archivo:** `src/lib/shared/profileService.ts` (línea 175-200)

**Problema:** El error `auth/requires-recent-login` se maneja pero la UI no fuerza un re-login. El usuario ve el mensaje pero no hay acción para resolverlo.

**Solución:** Agregar botón "Volver a iniciar sesión" en el toast/mensaje de error.

### 2.10 🐛 `client/settings.astro` — `showToast()` llamado con firma incorrecta

**Archivo:** `src/pages/client/settings.astro` (línea 264, 271, 290, 298, 315, 318, 340, 371)

**Problema:** `showToast` se importa de `profileService` que espera `(message, type, id?, duration?)` pero se llama como `showToast('mensaje', 'success')` — esto funciona porque `type` es el segundo parámetro, pero es inconsistente con `adminUtils` que usa `{ message, type }`.

**Solución:** Unificar API de toast (ver punto 1.1).

### 2.11 🐛 `client/settings.astro` — No hay cleanup de `onAuthChange`

**Archivo:** `src/pages/client/settings.astro` (línea 210)

**Problema:** `authService.onAuthChange()` retorna un `unsubscribe` pero no se llama nunca. Si el componente se "remountea" (navegación SPA), se acumulan listeners.

**Solución:** Guardar y llamar `unsubscribe` en `beforeunload`.

### 2.12 🐛 `admin/settings.astro` y `trainer/settings.astro` — Usan `requireAuth` de adminUtils

**Archivo:** `src/pages/admin/settings.astro` (línea 114), `src/pages/trainer/settings.astro` (línea 114)

**Problema:** Importan `requireAuth` de `adminUtils` aunque son páginas de trainer/admin. Si un admin ve la página de trainer settings, `requireAuth` de adminUtils no valida el rol correctamente.

**Solución:** Usar `routeGuards.ts` que ya tiene lógica de validación por rol.

### 2.13 🐛 `admin/dashboard.astro` — No hay error state para suscripciones

**Archivo:** `src/pages/admin/dashboard.astro` (línea 150-211)

**Problema:** `subscribeToUsers()`, `subscribeToCollectionCount()`, `subscribeToRecentUsers()` no tienen callback de error. Si fallan, el dashboard se queda con "-" para siempre.

**Solución:** Agregar `onError` callbacks y mostrar mensajes de error.

### 2.14 🐛 `trainer/dashboard.astro` — No hay error state para suscripciones individuales

**Archivo:** `src/pages/trainer/dashboard.astro` (línea 192-277)

**Problema:** Similar al admin dashboard. Si `subscribeToClients` falla, no hay feedback visual.

**Solución:** Agregar `onError` callbacks.

### 2.15 🐛 `trainer/diets.astro` — `renderMealRow()` usa `escapeHtml()` en inputs

**Archivo:** `src/pages/trainer/diets.astro` (línea 456)

**Problema:** `value="${escapeHtml(meal.description)}"` — escapado correctamente, pero el select de meal name (línea 443-448) NO escapa `meal.name`. Aunque `meal.name` es un enum, si viene malicioso podría inyectar HTML.

**Solución:** Escapar también en selects o validar contra el enum.

### 2.16 🐛 `admin/users.astro` — `calculateAge()` usa `any`

**Archivo:** `src/pages/admin/users.astro` (línea 586)

**Problema:** `birthDate: any` — debería ser `Timestamp | Date | string`.

**Solución:** Tipar correctamente.

---

## 3. Deuda Técnica

### 3.1 Falta de tipos en servicios cliente

**Archivos:**
- `src/lib/client/progressService.ts` — `value: any` (línea 10), `date: any` (línea 9), `createdAt: any` (línea 11)
- `src/lib/client/dietService.ts` — `createdAt: any`, `updatedAt: any` (línea 25-26)
- `src/lib/client/workoutService.ts` — `createdAt: any`, `updatedAt: any` (línea 25-26)

**Solución:** Usar `Timestamp` de Firestore o `Date` en lugar de `any`.

### 3.2 `any` en `trainer/clients.astro`

**Archivo:** `src/pages/trainer/clients.astro` (línea 333)

```typescript
logs.slice(0, 5).map((log: any) => {
```

**Solución:** Tipar como `ProgressLog`.

### 3.3 `firestoreDebug.ts` — Debug system en producción

**Archivo:** `src/lib/debug/firestoreDebug.ts`

**Problema:** Se importa en todos los layouts (Admin, Trainer, Client). Incluso si solo se activa con Ctrl+Shift+D, el código se carga en producción.

**Solución:** Usar `import.meta.env.DEV` para carga condicional.

### 3.4 `src/pages/admin/dashboard.astro` — Lógica de negocio en script

**Problema:** El dashboard tiene lógica de renderizado inline (alertas, usuarios recientes) en el script de la página. Debería estar en `adminUtils.ts`.

### 3.5 `src/pages/trainer/chat.astro` — Lógica de chat inline

**Problema:** ~240 líneas de lógica de chat en el script de la página. Debería estar en `trainerUtils.ts` o un servicio separado.

### 3.6 `src/pages/trainer/clients.astro` — ~364 líneas, viola regla #9 (< 300 líneas)

### 3.7 `src/lib/admin/adminUtils.ts` — ~789 líneas, viola regla #9 (< 300 líneas)

**Solución:** Refactorizar en módulos más pequeños:
- `adminUtils.ts` → `admin/auth.ts`, `admin/users.ts`, `admin/stats.ts`, `admin/ui.ts`

### 3.8 `src/lib/shared/profileService.ts` — ~474 líneas, viola regla #9

**Solución:** Separar en `profileService.ts` (lógica) y `profileUI.ts` (renderizado).

### 3.9 `src/pages/trainer/diets.astro` — ~477 líneas, viola regla #9

**Solución:** Extraer `renderMealRow()` y `showEditor()` a `trainerUtils.ts`.

### 3.10 `src/pages/admin/users.astro` — ~596 líneas, viola regla #9

**Solución:** Extraer lógica de modales a `adminUtils.ts` o componentes separados.

### 3.11 `src/pages/client/settings.astro` — ~374 líneas, viola regla #9

**Solución:** Extraer theme toggle, language selector, email verification a componentes.

### 3.12 `src/pages/trainer/dashboard.astro` — No hay cleanup de `beforeunload` robusto

**Archivo:** `src/pages/trainer/dashboard.astro` (línea 164-169)

**Problema:** Usa `beforeunload` para cleanup, pero en SPA (navegación con Astro View Transitions) `beforeunload` no se dispara. Las suscripciones quedan colgadas.

**Solución:** Usar `MutationObserver` o el evento `astro:before-swap` de View Transitions.

### 3.13 `src/pages/trainer/diets.astro` — Mismo problema de cleanup

**Archivo:** `src/pages/trainer/diets.astro` (línea 76-79)

**Solución:** Ídem anterior.

---

## 4. Mejoras de UI/UX

### 4.1 Estados vacíos inconsistentes

- `admin/dashboard.astro` — usa HTML inline para empty state de alertas
- `trainer/clients.astro` — usa `renderEmptyState()` de trainerUtils
- `trainer/chat.astro` — usa HTML inline

**Solución:** Unificar con componente `EmptyState.astro`.

### 4.2 Loading states inconsistentes

- `admin/dashboard.astro` — spinner inline
- `trainer/clients.astro` — spinner inline
- `client/settings.astro` — pantalla de loading completa con `loadingScreen`
- `admin/settings.astro` — spinner inline
- `trainer/settings.astro` — spinner inline

**Solución:** Crear componente `LoadingSpinner.astro` y `LoadingScreen.astro`.

### 4.3 Error states faltantes

- `admin/dashboard.astro` — no hay estado de error para las suscripciones
- `trainer/clients.astro` — solo muestra error en profile, no en workouts/diets/progress
- `trainer/chat.astro` — no hay estado de error
- `admin/users.astro` — no hay error state para la carga inicial de usuarios

**Solución:** Agregar error boundaries o estados de error en cada sección.

### 4.4 `client/settings.astro` — Tiene loading screen pero admin/trainer settings no

**Inconsistencia:** Client settings tiene una pantalla de loading completa con `loadingScreen`/`settingsContent`, mientras que admin y trainer settings usan spinners inline.

**Solución:** Unificar el patrón de loading.

### 4.5 Theme toggle en `client/settings.astro` no funcional

**Archivo:** `src/pages/client/settings.astro` (línea 322-332)

**Problema:** El theme toggle cambia `data-theme` en `<html>` pero no hay estilos CSS para `data-theme="light"`. El toggle visualmente se mueve pero no cambia nada.

**Solución:** Implementar estilos de tema claro o eliminar la funcionalidad.

### 4.6 `admin/users.astro` — Modal de edición usa `confirm()` para acciones destructivas

**Archivo:** `src/pages/admin/users.astro` (línea 429, 541, 558)

**Problema:** `confirm()` es bloqueante y feo. El modal de eliminación de dietas en `trainer/diets.astro` (línea 125-155) ya tiene un modal personalizado bonito.

**Solución:** Crear componente `ConfirmModal.astro` y usarlo en todas partes.

### 4.7 `trainer/diets.astro` — Modal de confirmación creado manualmente con `createElement`

**Archivo:** `src/pages/trainer/diets.astro` (línea 125-155)

**Problema:** El modal se crea con `document.createElement('div')` e `innerHTML`. Es frágil y difícil de mantener.

**Solución:** Crear componente `ConfirmModal.astro` reutilizable.

### 4.8 `admin/users.astro` — No hay feedback visual de carga en acciones del modal

**Problema:** Al guardar, bloquear, eliminar, el botón cambia texto pero no hay spinner. El usuario no sabe si la acción está procesando.

**Solución:** Agregar spinner en botones durante operaciones asíncronas.

### 4.9 `trainer/diets.astro` — El editor de dietas no tiene validación visual en tiempo real

**Problema:** La validación solo ocurre al hacer submit. No hay feedback visual mientras el usuario escribe.

**Solución:** Agregar validación en tiempo real con clases CSS de error.

### 4.10 Traducciones faltantes en settings

**Problema:** Las settings pages tienen textos hardcodeados en español:
- `admin/settings.astro`: "Cambiar Contraseña", "Nueva Contraseña", "Confirmar Contraseña", "Mi Perfil"
- `trainer/settings.astro`: "Cambiar Contraseña", "Mi Perfil"
- `client/settings.astro`: "Mi Entrenador", "Tu entrenador asignado", "Preferencias", "Modo oscuro", "Idioma", "Email no verificado"

**Solución:** Agregar keys de traducción en `src/i18n/translations.ts`.

---

## 5. Optimizaciones de Rendimiento

### 5.1 🔴 Firestore queries sin índices

**Archivo:** `firestore.indexes.json` — verificar que existan índices compuestos para:

| Query | ¿Index existe? |
|-------|---------------|
| `users` where `role`, `orderBy('createdAt')` | ✅ Sí |
| `users` where `assignedTrainerId`, `orderBy('createdAt')` | ✅ Sí |
| `users` where `assignedTrainerId`, `role`, `orderBy('createdAt')` | ✅ Sí |
| `workouts` where `trainerId`, `orderBy('createdAt')` | ✅ Sí |
| `workouts` where `clientId`, `orderBy('createdAt')` | ✅ Sí |
| `diets` where `trainerId`, `orderBy('createdAt')` | ✅ Sí |
| `diets` where `clientId`, `orderBy('createdAt')` | ✅ Sí |
| `messages` where `participants` CONTAINS, `orderBy('createdAt')` | ✅ Sí (ASC + DESC) |
| `progress_logs` where `clientId`, `type`, `orderBy('date')` | ✅ Sí |
| `progress_logs` where `clientId`, `orderBy('date')` | ✅ Sí |

**Conclusión:** Los índices están completos. No hay queries faltantes.

**⚠️ Nota:** `subscribeToUsers()` en `adminUtils.ts` (línea 226) NO usa `orderBy` en la query — ordena en cliente. Esto evita necesitar un índice pero es ineficiente. Si se agrega `orderBy('createdAt', 'desc')`, se necesitará un índice compuesto adicional.

### 5.2 🟡 Múltiples `onSnapshot` en una página

**Archivo:** `src/pages/trainer/clients.astro`

**Problema:** Por cada cliente que se abre en detalle, se crean 3 suscripciones (workouts, diets, progress). Si el usuario navega entre clientes rápidamente, se acumulan.

**Solución:** Ya hay `cleanupDetailSubscriptions()` pero verificar que se llame en todos los casos (incluyendo error).

### 5.3 🟡 `subscribeToConversations()` — Escucha todos los mensajes

**Archivo:** `src/pages/trainer/chat.astro` (línea 130)

**Problema:** `subscribeToConversations(trainerId, ...)` probablemente escucha TODOS los mensajes del trainer. Con muchos clientes, puede ser pesado.

**Solución:** Limitar a últimos N mensajes o usar paginación.

### 5.4 🟢 Imágenes SVG inline repetidas

**Problema:** Los mismos SVGs (home, users, trainers, clients, settings, chat) están duplicados en cada layout y página.

**Solución:** Crear componente `Icon.astro` con props `name` y `class`.

### 5.5 🟢 `admin/dashboard.astro` — 3 suscripciones separadas que podrían combinarse

**Archivo:** `src/pages/admin/dashboard.astro`

**Problema:** `subscribeToUsers()`, `subscribeToCollectionCount('workouts')`, `subscribeToCollectionCount('diets')` son 3 suscripciones separadas. `subscribeToUsers()` ya trae todos los usuarios, se podría derivar workouts/diets counts de ahí si se almacenan en el user doc.

**Solución:** Evaluar si vale la pena combinar o mantener separado.

---

## 6. Seguridad

### 6.1 🟡 `(window as any).__*` — Funciones globales

**Impacto:** Posible XSS si un script externo puede llamar `__deleteUser()`, `__changeRole()`, `__showClientDetail()`, `__saveUserEdit()`, `__toggleBlockUser()`, `__deleteCurrentUser()`, `__resetUserPassword()`, `__editDiet()`, `__deleteDietConfirm()`.

**Solución:** Migrar a event delegation con `data-*` attributes.

### 6.2 🟡 `escapeHtml()` implementado manualmente

**Problema:** La implementación manual puede tener edge cases no cubiertos.

**Solución:** Usar `DOMPurify` o una librería probada, o al menos centralizar la función.

### 6.3 🟢 `confirm()` para acciones destructivas

**Problema:** `confirm()` es bloqueante y feo. Mejor usar un modal personalizado.

**Solución:** Crear componente `ConfirmModal.astro`.

### 6.4 🟢 `admin/users.astro` — `sendPasswordResetEmail` desde el cliente

**Problema:** `sendPasswordResetEmail(auth, user.email)` se llama desde el cliente. Aunque Firebase Auth lo maneja, es mejor práctica hacerlo desde una API Route para no exponer el auth de Firebase en cliente.

**Solución:** Mover a API Route de Astro.

---

## 7. Testing

### 7.1 Tests unitarios existentes

| Archivo | Estado |
|---------|--------|
| `tests/unit/services/authService.test.ts` | ✅ 125 tests |
| `tests/unit/services/profileService.test.ts` | ✅ |
| `tests/unit/services/adminService.test.ts` | ✅ |
| `tests/unit/lib/client/progressService.test.ts` | ✅ |
| `tests/unit/lib/client/dietService.test.ts` | ✅ |
| `tests/unit/lib/client/workoutService.test.ts` | ✅ |
| `tests/unit/lib/client/chatService.test.ts` | ✅ |
| `tests/unit/lib/trainer/trainerUtils.test.ts` | ✅ |
| `tests/unit/utils/adminUtils.test.ts` | ✅ |

### 7.2 Tests faltantes

| Módulo | Archivo | Tests |
|--------|---------|-------|
| Admin Utils (completo) | `src/lib/admin/adminUtils.ts` | ⚠️ Parcial |
| Trainer Utils (completo) | `src/lib/trainer/trainerUtils.ts` | ⚠️ Parcial |
| Profile Service (completo) | `src/lib/shared/profileService.ts` | ⚠️ Parcial |
| Route Guards | `src/lib/routeGuards.ts` | ❌ No hay |
| Shared Chat | `src/lib/shared/chat.ts` | ❌ No hay |
| Validators | `src/lib/validators.ts` | ❌ No hay |

### 7.3 Tests E2E faltantes

| Página | Archivo | Tests E2E |
|--------|---------|-----------|
| Admin Dashboard | `src/pages/admin/dashboard.astro` | ❌ |
| Admin Users | `src/pages/admin/users.astro` | ❌ |
| Trainer Dashboard | `src/pages/trainer/dashboard.astro` | ❌ |
| Trainer Diets | `src/pages/trainer/diets.astro` | ❌ |
| Trainer Clients | `src/pages/trainer/clients.astro` | ❌ |
| Trainer Chat | `src/pages/trainer/chat.astro` | ❌ |
| Client Settings | `src/pages/client/settings.astro` | ❌ |
| Admin Settings | `src/pages/admin/settings.astro` | ❌ |
| Trainer Settings | `src/pages/trainer/settings.astro` | ❌ |

### 7.4 Tests de integración faltantes

- Firebase Emulator tests para operaciones CRUD
- Tests de reglas de seguridad

---

## 8. Plan de Acción Priorizado — Checklist para Agentes

### Fase 1 — 🚨 Crítico (Sprint actual)

#### Shared Utilities
- [ ] **1.1** Crear `src/lib/shared/escapeHtml.ts` y reemplazar imports en adminUtils, profileService, trainerUtils
- [ ] **1.2** Crear `src/lib/shared/toast.ts` con API unificada `{ message, type, duration? }` y reemplazar todas las implementaciones
- [ ] **1.3** Crear `src/lib/shared/authGuard.ts` con `requireAuth(role, callback)` y reemplazar en adminUtils, trainerUtils, y páginas
- [ ] **1.8** Crear `src/lib/shared/logger.ts` con `createLogger(prefix)` que checkee `import.meta.env.DEV`

#### Bugs
- [ ] **2.1** Reemplazar todos los `console.error` con logger en servicios cliente y páginas
- [ ] **2.3** Optimizar `subscribeToUsers()` con filtros Firestore (paginación o filtro por rol)
- [ ] **2.4** Optimizar `subscribeToCollectionCount()` con `count()` de Firestore
- [ ] **2.7** Corregir `registerWeight()` para usar `serverTimestamp()` en `date`
- [ ] **2.8** Mejorar `registerMealComplete()` para propagar errores en lugar de retornar `null`
- [ ] **2.11** Agregar cleanup de `onAuthChange` en `client/settings.astro`
- [ ] **2.12** Corregir `requireAuth` en admin/trainer settings para usar `routeGuards.ts`

### Fase 2 — 🟡 Alto (Siguiente sprint)

#### Shared Utilities
- [ ] **1.4** Unificar `getRoleBadge()` / `getRoleBadgeClass()` en `src/lib/shared/roleUtils.ts`
- [ ] **1.5** Unificar `getUserInitial()` / `getProfileInitial()` en `src/lib/shared/stringUtils.ts`
- [ ] **1.6** Unificar `formatDate()` en `src/lib/shared/dateUtils.ts`
- [ ] **1.7** Unificar `renderLoadingState()` en `src/lib/shared/uiComponents.ts`

#### Event Delegation
- [ ] **2.2** Migrar `__showClientDetail` en `trainer/clients.astro` a event delegation con `data-*`
- [ ] **2.3** Migrar `__toggleRoleMenu` en `adminUtils.ts` a event delegation
- [ ] **6.1** Migrar todas las funciones `window.__*` en `admin/users.astro` a event delegation
- [ ] **6.1** Migrar `__editDiet`, `__deleteDietConfirm`, `__closeEditor` en `trainer/diets.astro` a event delegation

#### Refactor >300 líneas
- [ ] **3.7** Refactorizar `adminUtils.ts` (>700 líneas) en `admin/auth.ts`, `admin/users.ts`, `admin/stats.ts`, `admin/ui.ts`
- [ ] **3.8** Refactorizar `profileService.ts` (>400 líneas) en `profileService.ts` + `profileUI.ts`
- [ ] **3.9** Refactorizar `trainer/diets.astro` (>477 líneas) extrayendo `renderMealRow()` y `showEditor()` a trainerUtils
- [ ] **3.10** Refactorizar `admin/users.astro` (>596 líneas) extrayendo lógica de modales

#### UI/UX
- [ ] **2.9** Agregar botón "Volver a iniciar sesión" en error de cambio de contraseña
- [ ] **4.6** Crear `ConfirmModal.astro` y reemplazar `confirm()` en admin/users.astro
- [ ] **4.7** Crear `ConfirmModal.astro` y reemplazar modal manual en `trainer/diets.astro`
- [ ] **4.8** Agregar spinner en botones de modal de admin/users.astro durante operaciones async
- [ ] **4.9** Agregar validación visual en tiempo real en editor de dietas
- [ ] **4.10** Agregar keys de traducción faltantes en `src/i18n/translations.ts` para settings

#### Rendimiento
- [ ] **2.5** Agregar `orderBy('createdAt', 'desc')` en `subscribeToUsers()` y crear índice compuesto
- [ ] **5.2** Verificar que `cleanupDetailSubscriptions()` se llame en todos los casos en trainer/clients.astro
- [ ] **5.3** Limitar `subscribeToConversations()` a últimos N mensajes
- [ ] **5.4** Crear componente `Icon.astro` para SVGs reutilizables

#### Seguridad
- [ ] **6.2** Centralizar `escapeHtml()` en shared y considerar DOMPurify
- [ ] **6.3** Reemplazar `confirm()` con `ConfirmModal.astro` en admin/users.astro
- [ ] **6.4** Mover `sendPasswordResetEmail` a API Route de Astro

### Fase 3 — 🟢 Medio (Backlog)

#### Refactor Settings Pages
- [ ] **1.2.1** Crear `SettingsShell.astro` con slots para secciones comunes (profile, password, danger zone)
- [ ] **1.2.2** Refactorizar `admin/settings.astro` para usar SettingsShell
- [ ] **1.2.3** Refactorizar `trainer/settings.astro` para usar SettingsShell
- [ ] **1.2.4** Refactorizar `client/settings.astro` para usar SettingsShell + secciones extra

#### Refactor Layouts
- [ ] **1.2.5** Extraer bottom nav de cada layout a componentes separados (`AdminNav.astro`, `TrainerNav.astro`, `ClientNav.astro`)
- [ ] **1.2.6** Simplificar layouts usando un layout base con slot para nav

#### UI Components
- [ ] **4.1** Crear componente `EmptyState.astro` y unificar en todas las páginas
- [ ] **4.2** Crear componente `LoadingSpinner.astro` y `LoadingScreen.astro`
- [ ] **4.3** Agregar error states en admin/dashboard, trainer/clients, trainer/chat, admin/users
- [ ] **4.4** Unificar patrón de loading entre client, admin y trainer settings
- [ ] **4.5** Implementar estilos de tema claro o eliminar theme toggle no funcional

#### Tipos y Any
- [ ] **2.16** Tipar `calculateAge()` con `Timestamp | Date | string`
- [ ] **3.1** Reemplazar `any` en servicios cliente con tipos concretos
- [ ] **3.2** Reemplazar `any` en trainer/clients.astro con `ProgressLog`

#### Debug System
- [ ] **3.3** Hacer `firestoreDebug.ts` condicional con `import.meta.env.DEV`

#### Cleanup de Suscripciones
- [ ] **3.12** Migrar cleanup de `beforeunload` a `astro:before-swap` en trainer/dashboard.astro
- [ ] **3.13** Migrar cleanup de `beforeunload` a `astro:before-swap` en trainer/diets.astro

#### Traducciones
- [ ] **4.10** Agregar todas las keys de traducción faltantes en `src/i18n/translations.ts`

#### Testing
- [ ] **7.2** Agregar tests para routeGuards, shared chat, validators
- [ ] **7.2** Completar tests para adminUtils, trainerUtils, profileService
- [ ] **7.3** Agregar tests E2E para páginas principales (admin dashboard, users, trainer dashboard, diets, clients, chat, settings)
- [ ] **7.4** Agregar tests de integración con Firebase Emulator

#### Limpieza
- [ ] **1.2.7** Eliminar `src/lib/client/chatService.ts` y actualizar imports a `@/lib/shared/chat`
- [ ] **3.4** Mover lógica de renderizado inline de admin/dashboard.astro a adminUtils
- [ ] **3.5** Mover lógica de chat inline de trainer/chat.astro a trainerUtils o servicio separado
- [ ] **2.6** Normalizar fechas en `subscribeToTodayMeals()` a UTC
- [ ] **2.15** Escapar `meal.name` en select de `renderMealRow()` o validar contra enum
- [ ] **2.13** Agregar `onError` callbacks en admin/dashboard.astro
- [ ] **2.14** Agregar `onError` callbacks en trainer/dashboard.astro
- [ ] **2.10** Unificar API de toast (ya cubierto en 1.2)

---

## 📊 Resumen de Métricas

| Categoría | 🚨 Crítico | 🟡 Alto | 🟢 Medio | Total |
|-----------|-----------|---------|---------|-------|
| Bugs | 12 | 4 | 0 | 16 |
| Deuda Técnica | 0 | 4 | 9 | 13 |
| UI/UX | 0 | 3 | 7 | 10 |
| Rendimiento | 0 | 2 | 3 | 5 |
| Seguridad | 0 | 2 | 2 | 4 |
| Testing | 0 | 0 | 4 | 4 |
| **Total** | **12** | **15** | **25** | **52** |

> **Última actualización:** 11/07/2026
> **Próximo paso:** Los agentes deben comenzar con la Fase 1 (Crítico) y marcar los items como completados a medida que se implementan.
