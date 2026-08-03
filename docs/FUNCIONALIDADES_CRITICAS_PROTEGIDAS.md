# 🛡️ Funcionalidades Críticas Protegidas - CampFit

> **⚠️ DOCUMENTO OBLIGATORIO DE LECTURA PARA TODOS LOS AGENTES IA**  
> Este documento lista las funcionalidades críticas que **NUNCA deben eliminarse, simplificarse ni omitirse**.  
> Si un agente necesita modificar alguna de estas, debe justificarlo explícitamente y obtener aprobación.  
> **Última actualización:** 2026-08-02

---

## 📋 Índice

1. [Autenticación y Autorización](#1-autenticación-y-autorización)
2. [Reglas de Seguridad Firestore](#2-reglas-de-seguridad-firestore)
3. [Sistema de Dietas](#3-sistema-de-dietas)
4. [Sistema de Rutinas](#4-sistema-de-rutinas)
5. [Sistema de Progreso y Adherencia](#5-sistema-de-progreso-y-adherencia)
6. [Chat y Mensajería](#6-chat-y-mensajería)
7. [Internacionalización (i18n)](#7-internacionalización-i18n)
8. [Sistema de Plantillas](#8-sistema-de-plantillas)
9. [Stores y Estado Global](#9-stores-y-estado-global)
10. [Validaciones de Formularios](#10-validaciones-de-formularios)

---

## 1. Autenticación y Autorización

### 🔐 `src/lib/shared/authGuard.ts`
- **`requireAuth()`** — Verifica que el usuario esté autenticado. **NUNCA eliminar** el check de `isPublicPath()` ni la redirección a `/login`.
- **`requireAdmin()`** — Verifica rol admin desde Firestore. **NUNCA eliminar** el soporte para bootstrap admins (emails `servicioweb.pmi@gmail.com` y `sevicioweb.pmi@gmail.com`).
- **`requireRole()`** — Verifica roles específicos. **NUNCA eliminar** la verificación de rol desde Firestore ni la redirección al dashboard correcto según rol.
- **`signOutUser()`** — Cierra sesión y redirige. **NUNCA eliminar** la redirección a `/login`.

### 🔐 `src/services/authService.ts`
- **`loginUser()`** — **NUNCA eliminar** el auto-creado de perfil con `role: 'client'` cuando no existe documento Firestore.
- **`loginWithGoogle()`** — **NUNCA eliminar** el auto-creado de perfil para primeros logins con Google.
- **`onAuthChange()`** — Observer de Firebase Auth. **NUNCA eliminar**.

### 🔐 `src/stores/authStore.ts`
- **`$user`, `$isAuthenticated`, `$userRole`, `$isAdmin`, `$isTrainer`, `$isClient`** — Stores computados. **NUNCA eliminar** ninguno.
- **`setUser()`, `clearAuth()`** — Setters. **NUNCA mutar stores directamente**, siempre usar estos setters.

### 🔐 `src/lib/routeGuards.ts`
- **`routeGuards[]`** — Array de guards por ruta. **NUNCA eliminar** entradas, solo añadir nuevas.
- **`checkRouteAccess()`** — Función de verificación. **NUNCA eliminar** el match por prefix más largo.

---

## 2. Reglas de Seguridad Firestore

### 🔥 `firestore.rules`
- **`isStaff()`, `isAdmin()`, `isTrainer()`** — Helpers de roles. **NUNCA eliminar ni simplificar**.
- **`isBootstrapAdminEmail()`** — Soporte para admins por email. **NUNCA eliminar** los dos emails (`servicioweb.pmi@gmail.com`, `sevicioweb.pmi@gmail.com`).
- **`isBlocked()`** — Verificación de usuarios bloqueados. **NUNCA eliminar**.
- **`match /users/{userId}`** — **NUNCA eliminar** la restricción de que `role == 'client'` en `create` (evita escalada de privilegios).
- **`match /diets/{dietId}`** — **NUNCA eliminar** la verificación de `trainerId == request.auth.uid` en create/update/delete.
- **`match /workouts/{workoutId}`** — **NUNCA eliminar** la verificación de `trainerId == request.auth.uid` en create/update/delete.
- **`match /messages/{messageId}`** — **NUNCA eliminar** la verificación de `participants.hasAny([request.auth.uid])` ni el límite de `size() == 2`.
- **`match /progress_logs/{logId}`** — **NUNCA eliminar** la verificación de que el trainer pueda leer logs de sus clientes asignados.

---

## 3. Sistema de Dietas

### 🥗 `src/lib/trainer/trainerDiets.ts`
- **`subscribeToDietsByTrainer()`** — **NUNCA eliminar** `where('trainerId', '==', trainerId)` ni `orderBy('createdAt', 'desc')`.
- **`subscribeToDietsByClient()`** — **NUNCA eliminar** `where('clientId', '==', clientId)` ni `orderBy('createdAt', 'desc')`.
- **`createDiet()`** — **NUNCA eliminar** `serverTimestamp()` en `createdAt` y `updatedAt`.
- **`updateDiet()`** — **NUNCA eliminar** `serverTimestamp()` en `updatedAt`.
- **`deleteDiet()`** — **NUNCA eliminar** el manejo de errores con `showToast`.

### 🥗 `src/lib/client/dietService.ts`
- **`subscribeToDiets()`** — **NUNCA eliminar** `limit(1)` (solo la dieta más reciente para el cliente).
- **`subscribeToDietHistory()`** — **NUNCA eliminar** (historial completo sin limit).
- **`registerMealComplete()`** — **NUNCA eliminar** la validación de `clientId`, `dietId`, `mealId`.
- **`subscribeToTodayMeals()`** — **NUNCA eliminar** la normalización a UTC para evitar problemas de zona horaria.

### 🥗 `src/lib/client/intoleranceChecker.ts`
- **`checkMealAllergens()`** — **NUNCA eliminar** (detecta conflictos de alérgenos).
- **`checkDietAllergens()`** — **NUNCA eliminar** (verifica todos los meals de una dieta).
- **`ALLERGEN_ALIASES`** — Mapa de normalización. **NUNCA eliminar** entradas, solo añadir nuevas.

### 🥗 `src/lib/trainer/types.ts`
- **`TrainerDiet.type`** — Union estricta: `'normal' | 'definition' | 'volume' | 'keto' | 'vegan' | 'custom'`. **NUNCA cambiar a `string`**.
- **`Meal.name`** — Union estricta: `'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other'`. **NUNCA cambiar a `string`**.
- **`Meal.allergens`** — Campo `allergens?: string[]`. **NUNCA eliminar** (usado por `intoleranceChecker`).

---

## 4. Sistema de Rutinas

### 🏋️ `src/lib/trainer/trainerWorkouts.ts`
- **`subscribeToWorkoutsByTrainer()`** — **NUNCA eliminar** `where('trainerId', '==', trainerId)` ni `orderBy('createdAt', 'desc')`.
- **`subscribeToWorkoutsByClient()`** — **NUNCA eliminar** `where('clientId', '==', clientId)`.
- **`createWorkout()`, `updateWorkout()`, `deleteWorkout()`** — **NUNCA eliminar** `serverTimestamp()`.

### 🏋️ `src/lib/client/workoutService.ts`
- **`subscribeToWorkouts()`** — **NUNCA eliminar** `limit(1)` (solo la rutina más reciente).

---

## 5. Sistema de Progreso y Adherencia

### 📊 `src/lib/client/adherenceService.ts`
- **`subscribeToWeeklyAdherence()`** — **NUNCA eliminar** (calcula adherencia semanal).
- **`computeStats()`** — **NUNCA eliminar** el cálculo de `streakDays` (racha de días consecutivos).
- **`emptyStats()`** — **NUNCA eliminar** (estado por defecto).

### 📊 `src/lib/client/progressService.ts`
- **`subscribeToProgress()`** — **NUNCA eliminar** `orderBy('date', 'desc')`.

### 📊 `src/lib/trainer/trainerProgress.ts`
- **`subscribeToClientProgress()`** — **NUNCA eliminar** `where('clientId', '==', clientId)`.

---

## 6. Chat y Mensajería

### 💬 `src/lib/trainer/trainerChat.ts`
- **`subscribeToConversations()`** — **NUNCA eliminar** `where('participants', 'array-contains', trainerId)`.
- **`subscribeToConversation()`** — **NUNCA eliminar** `orderBy('createdAt', 'asc')`.
- **`sendMessage()`** — **NUNCA eliminar** `serverTimestamp()` ni `isRead: false`.
- **`markAsRead()`** — **NUNCA eliminar** (marca mensajes como leídos).

---

## 7. Internacionalización (i18n)

### 🌐 `src/i18n/client.ts`
- **`t()`** — Función de traducción. **NUNCA eliminar** el fallback a `translations['es']`.
- **`translateDOM()`** — **NUNCA eliminar** el `MutationObserver` para traducir contenido dinámico.
- **`getStoredLanguage()`** — **NUNCA eliminar** el fallback a `'es'`.
- **`setStoredLanguage()`** — **NUNCA eliminar** `document.documentElement.lang = lang`.

### 🌐 `src/i18n/locales/es.ts`, `en.ts`, `ca.ts`
- **Claves `diet.editor.*`** — ~30 claves para el editor de dietas. **NUNCA eliminar** (usadas en `trainer/diets.astro`).
- **Claves `trainer.*`** — Claves del panel de entrenador. **NUNCA eliminar**.
- **Claves `client.*`** — Claves del panel de cliente. **NUNCA eliminar**.

---

## 8. Sistema de Plantillas

### 📋 `src/lib/trainer/templateService.ts`
- **`subscribeToDietTemplates()`** — **NUNCA eliminar** (lista plantillas disponibles).
- **`applyDietTemplateToClient()`** — **NUNCA eliminar** `isClientAssignedToTrainer()` (valida ownership).
- **`applyWorkoutTemplateToClient()`** — **NUNCA eliminar** `isClientAssignedToTrainer()`.

---

## 9. Stores y Estado Global

### 📦 `src/stores/authStore.ts`
- **`$authLoading`** — **NUNCA eliminar** (controla pantallas de carga).
- **`$authError`** — **NUNCA eliminar** (mensajes de error de auth).

### 📦 `src/stores/themeStore.ts`
- **`$theme`** — **NUNCA eliminar** (dark/light mode).

---

## 10. Validaciones de Formularios

### ✅ `src/lib/validators.ts`
- **`isValidEmail()`** — **NUNCA eliminar** (validación de email).
- **`isValidPassword()`** — **NUNCA eliminar** las 4 reglas (mínimo 8, mayúscula, minúscula, número).
- **`isValidName()`** — **NUNCA eliminar** (entre 2-50 caracteres, solo letras).

---

## 🚨 Protocolo de Modificación de Funcionalidades Críticas

Si un agente necesita modificar alguna funcionalidad listada aquí:

1. **Justificar el cambio** — Explicar por qué es necesario y qué problema resuelve.
2. **Verificar impacto** — Ejecutar `git diff` y revisar que no se eliminen cláusulas de query, imports, o lógica de negocio.
3. **Ejecutar tests** — `npm run type-check && npm test` después del cambio.
4. **Documentar en CHANGELOG.md** — Registrar el cambio con fecha y archivos modificados.
5. **Añadir comentario en línea** — Si la funcionalidad es crítica, añadir un comentario `// 🔒 CRÍTICO: ...` explicando qué hace y por qué es importante.

### Comentarios en línea recomendados:
```typescript
// 🔒 CRÍTICO: Verifica ownership del trainer sobre la dieta. 
// Sin esta verificación, cualquier trainer podría modificar dietas de otros.
allow create: if isTrainer() && request.resource.data.trainerId == request.auth.uid;

// 🔒 CRÍTICO: Normaliza fechas a UTC para evitar race conditions con zonas horarias.
// Si se elimina, las comidas completadas cerca de medianoche se contarán en el día equivocado.
const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

// 🔒 CRÍTICO: limit(1) obtiene solo la dieta más reciente del cliente.
// Si se elimina, el cliente descargará TODAS las dietas históricas en cada carga de página.
const q = query(collection(db, 'diets'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'), limit(1));
```

---

## 📝 Reglas Estrictas para Agentes IA

### ❌ PROHIBIDO ELIMINAR:
1. Cláusulas `where`, `orderBy`, `limit` de queries Firestore
2. Validaciones de seguridad (`isStaff`, `isAdmin`, `isTrainer`, `isBlocked`)
3. Verificaciones de ownership (`trainerId == request.auth.uid`)
4. Campos `serverTimestamp()` en `createdAt`/`updatedAt`
5. Manejo de errores con `showToast` o `logger.error`
6. Cleanup de suscripciones (`unsubClients?.()`, `unsubDiets?.()`)
7. Tipos union estrictos (`type: 'normal' | 'advanced'` en vez de `type: string`)
8. Campos opcionales críticos (`allergens?: string[]`)
9. Claves de traducción i18n
10. Funciones de validación (`isValidEmail`, `isValidPassword`)

### ✅ OBLIGATORIO ANTES DE MODIFICAR:
1. Leer este documento completo
2. Leer el archivo a modificar completamente
3. Verificar con `git diff` que no se eliminen funcionalidades
4. Ejecutar `npm run type-check && npm test` después
5. Documentar el cambio en `CHANGELOG.md`
6. Añadir comentarios `// 🔒 CRÍTICO:` en código sensible

---

**Este documento debe leerse ANTES de cualquier modificación al código fuente.**