# 🛡️ Funcionalidades Críticas Protegidas - CampFit

> **⚠️ DOCUMENTO OBLIGATORIO DE LECTURA PARA TODOS LOS AGENTES IA**
> Este documento lista las funcionalidades críticas que **NUNCA deben eliminarse, simplificarse ni omitirse**.
> Si un agente necesita modificar alguna de estas, debe justificarlo explícitamente y obtener aprobación.
> **Última actualización:** 2026-08-15

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
11. [Gestión de Clientes del Entrenador](#11-gestión-de-clientes-del-entrenador)

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

> 🧭 **MATRIZ MAESTRA OBLIGATORIA:** Consulta [docs/MATRIZ_FIRESTORE_QUERIES_Y_REGLAS.md](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/MATRIZ_FIRESTORE_QUERIES_Y_REGLAS.md) para el catálogo exhaustivo de todas las consultas, escrituras e índices de todos los sectores de la plataforma.

### 🔥 `firestore.rules`
- **`isStaff()`, `isAdmin()`, `isTrainer()`** — Helpers de roles. **NUNCA eliminar ni simplificar**.
- **`isBootstrapAdminEmail()`** — Soporte para admins por email. **NUNCA eliminar** los dos emails (`servicioweb.pmi@gmail.com`, `sevicioweb.pmi@gmail.com`).
- **`hasRole(role)`** — Verificación segura sin llamadas `get()` frágiles en queries de lista.
- **`match /users/{userId}`** — **NUNCA eliminar** la restricción de que `role == 'client'` en `create` (evita escalada de privilegios), ni la condición de lectura para trainers y staff.
- **`match /diets/{dietId}`** — **NUNCA eliminar** la verificación de ownership de `trainerId` en create/update/delete.
- **`match /workouts/{workoutId}`** — **NUNCA eliminar** la verificación de ownership de `trainerId` en create/update/delete.
- **`match /messages/{messageId}`** — **NUNCA eliminar** la verificación de `participants` ni la privacidad de chats.
- **`match /progress_logs/{logId}`** — **NUNCA eliminar** la verificación de cliente/trainer asignado.

### 🔒 P0-1: Error "Missing or insufficient permissions" en `subscribeToClients` — ✅ **CORREGIDO (2026-08-15)**

**Problema:** Cuando los trainers intentaban suscribirse a sus clientes usando `onSnapshot` en `src/lib/trainer/trainerClients.ts`, obtenían el error: "FirebaseError: Missing or insufficient permissions".

**Causa:** Las reglas de Firestore usaban `myRole()` que llamaba a `get()` para obtener el documento del usuario. Esto funcionaba para lecturas individuales de documentos, pero fallaba en queries de colección (`onSnapshot`) porque Firestore evalúa los permisos de manera diferente.

**Solución:** Se actualizaron las reglas de Firestore para que `isTrainer()` funcione correctamente tanto en lecturas individuales como en queries de colección:

```javascript
// 🔒 FIX: isTrainer now works for both individual doc reads and collection queries
function isTrainer() {
  // Check if role is 'trainer' in the document OR if user is a bootstrap admin
  return isAuth() && (
    myRole() == 'trainer' ||
    isBootstrapAdminEmail()
  );
}

// 🔒 FIX: Updated read condition that works for both individual docs and queries
allow read: if isAuth() && (
  request.auth.uid == userId ||
  isAdmin() ||
  // 🔒 FIX: Trainer can read users assigned to them
  // Works for both individual doc reads and collection queries
  (isTrainer() && resource.data.assignedTrainerId == request.auth.uid && resource.data.isBlocked != true)
);
```

**Archivos afectados:** `firestore.rules`

**Verificación:** `npm run type-check` pasa con 0 errores.

---

### 🔒 P0-2: Propiedad de trainer en dietas/rutinas — ✅ **CORREGIDA**

**Problema:** Las reglas originales permitían a cualquier trainer modificar dietas/rutinas de otros trainers sin verificar la propiedad.

**Solución:** Las reglas ahora verifican que el trainer sea el propietario:

```javascript
// Rutinas
allow create: if isTrainer() &&
  request.resource.data.trainerId == request.auth.uid &&
  request.resource.data.clientId != null;
allow update, delete: if (isTrainer() && resource.data.trainerId == request.auth.uid) || isAdmin();

// Dietas (idéntico patrón)
allow create: if isTrainer() &&
  request.resource.data.trainerId == request.auth.uid &&
  request.resource.data.clientId != null;
allow update, delete: if (isTrainer() && resource.data.trainerId == request.auth.uid) || isAdmin();
```

**Archivos afectados:** `firestore.rules`

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

### 🥗 `src/lib/shared/foodLibrary.ts`
- **`subscribeToFoods()`** — **NUNCA eliminar** `where('isActive', '==', true)` (filtra alimentos activos para client/trainer).
- **`subscribeToAllFoods()`** — **NUNCA eliminar** (usado por el admin para ver activos e inactivos).
- **`generateSearchIndex()`** — **NUNCA eliminar** la normalización de tildes ni el split por tokens.
- **`searchFoodsLocal()`** — **NUNCA eliminar** el matching por `startsWith` de tokens.

### 🥗 `src/lib/trainer/types.ts`
- **`TrainerDiet.type`** — Union estricta: `'normal' | 'definition' | 'volume' | 'keto' | 'vegan' | 'custom'`. **NUNCA cambiar a `string`**.
- **`Meal.name`** — Union estricta: `'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other'`. **NUNCA cambiar a `string`**.
- **`Meal.allergens`** — Campo `allergens?: string[]`. **NUNCA eliminar** (usado por `intoleranceChecker`).
- **`Meal.foodId`** — Referencia a `foods_library`. **NUNCA eliminar**.

---

## 4. Sistema de Rutinas y Ejercicios

### 🏋️ `src/lib/shared/exerciseLibrary.ts`
- **`subscribeToExercises()`** — **NUNCA eliminar** `where('isActive', '==', true)`.
- **`subscribeToAllExercises()`** — **NUNCA eliminar** (usado por el admin).
- **`generateExerciseSearchIndex()`** — **NUNCA eliminar** la normalización multilenguaje.
- **`MuscleGroup`, `ExerciseCategory`, `EquipmentType`, `ExclusionReason`** — Unions estrictas. **NUNCA convertir a `string`**.

### 🏋️ `src/lib/trainer/types.ts`
- **`Exercise.exerciseId`** — Referencia opcional a `exercises_library/{exerciseId}`. **NUNCA eliminar** (mantiene compatibilidad backward con rutinas legacy de texto libre).

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

### 💬 `src/lib/shared/chat.ts`
- **`subscribeToChatContacts()`** — **NUNCA eliminar** la bifurcación de consulta segura por rol: para trainers `where('assignedTrainerId', '==', currentUserId)` (cumple con las reglas de Firestore que restringen la lectura de la colección `users`).

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

---

## 11. Gestión de Clientes del Entrenador

### 👥 `src/lib/trainer/trainerClients.ts`
- **`subscribeToClients()`** — **NUNCA eliminar** `where('assignedTrainerId', '==', trainerId)` ni `where('role', '==', 'client')`. La ordenación cronológica por `createdAt` se realiza de forma segura en memoria para evitar caídas por documentos sin índice o formato mixto.
- **`getClientProfile()`** — **NUNCA eliminar** (obtiene el perfil y datos médicos del cliente).
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

## 12. Sistema de Almacenamiento Cloudflare R2 (`src/lib/storage/r2Service.ts` & `src/lib/server/r2Client.ts`)

### 🔒 `src/lib/storage/r2Service.ts`
- **`uploadFileToR2()`** — Motor central de subida con timeout `AbortController` (15s) y fallback reactivo. **NUNCA eliminar** el manejo de fallback ni la captura de errores en consola.
- **`uploadProgressPhotoToR2()`** — Subida de fotos de evolución clasificadas por pose. **NUNCA eliminar**.
- **`validateImageFile()`, `validateMediaFile()`** — Validadores de tipo MIME y tamaño máximo. **NUNCA omitir** las validaciones previas a la subida.

---

## 13. Sistema Bidireccional de Vídeo Feedback de Técnica (`src/lib/shared/techniqueCorrectionService.ts`)

### 🔒 `src/lib/shared/techniqueCorrectionService.ts`
- **`submitTechniqueVideo()`** — Sube el vídeo del alumno a Cloudflare R2 y registra el documento en la colección `exercise_corrections`. **NUNCA omitir** el registro en Firestore tras la subida.
- **`subscribeToCorrectionsByTrainer()`** — Consulta en tiempo real (`where('trainerId', '==', trainerId)`, `orderBy('createdAt', 'desc')`). **NUNCA eliminar** las cláusulas de consulta.
- **`subscribeToCorrectionsByClient()`** — Consulta de vídeos del alumno (`where('clientId', '==', clientId)`, `orderBy('createdAt', 'desc')`). **NUNCA eliminar**.
- **`reviewTechniqueCorrection()`** — Actualiza estado a `reviewed` y guarda feedback del coach con `reviewedAt: serverTimestamp()`. **NUNCA eliminar**.
- **`deleteTechniqueCorrection()`** — Permite al alumno o entrenador eliminar grabaciones erróneas. **NUNCA omitir**.

---

## 14. Poses de Evolución Corporal y Borrado Seguro (`src/lib/client/progressService.ts`)

### 🔒 `src/lib/client/progressService.ts`
- **`registerProgressPhoto()`** — Registra la foto con su ángulo (`front`, `side`, `back`) y `storageProvider: 'cloudflare_r2'`. **NUNCA eliminar** la metadata de pose.
- **`deleteProgressLog()`** — Elimina el registro de progreso en Firestore. **NUNCA eliminar** ni omitir el diálogo de confirmación custom (`showConfirm`, Zero Native Dialogs).

---

## 📝 Reglas Estrictas para Agentes IA

### ❌ PROHIBIDO ELIMINAR:
1. Cláusulas `where`, `orderBy`, `limit` de queries Firestore
2. Validaciones de seguridad (`isStaff`, `isAdmin`, `isTrainer`, `isBlocked`)
3. Verificaciones de ownership (`trainerId == request.auth.uid`)
4. Campos `serverTimestamp()` en `createdAt`/`updatedAt`
5. Manejo de errores con `showToast` o `logger.error`
6. Cleanup de suscripciones (`unsubClients?.()`, `unsubDiets?.()`, `unsubCorrections?.()`)
7. Tipos union estrictos (`type: 'normal' | 'advanced'` en vez de `type: string`)
8. Campos opcionales críticos (`allergens?: string[]`)
9. Claves de traducción i18n
10. Funciones de validación (`isValidEmail`, `isValidPassword`)
11. **Diálogos Nativos (ZERO NATIVE DIALOGS)**: Prohibido usar `alert()`, `confirm()`, `prompt()`. Usar siempre `showToast`, `showConfirm` o modales custom.

### ✅ OBLIGATORIO ANTES DE MODIFICAR:
1. Leer este documento completo
2. Leer el archivo a modificar completamente
3. Verificar con `git diff` que no se eliminen funcionalidades
4. Ejecutar `npm run type-check && npm test` después
5. Documentar el cambio en `CHANGELOG.md`
6. Añadir comentarios `// 🔒 CRÍTICO:` en código sensible

---

**Este documento debe leerse ANTES de cualquier modificación al código fuente.**