# 🧭 Matriz Maestra de Consultas Firestore, Permisos y Reglas de Seguridad — CampFit

> **🔒 GOLDEN RULE DE FIRESTORE (OBLIGATORIA PARA TODOS LOS AGENTES IA):**
> Este documento es la **fuente única de verdad y persistente** sobre todas las consultas, escrituras, suscripciones, reglas de seguridad (`firestore.rules`) e índices (`firestore.indexes.json`) de CampFit.
>
> **⚠️ ANTES DE CREAR O MODIFICAR CUALQUIER CONSULTA O REGLA:**
> 1. Debes consultar esta matriz para verificar los requisitos de permisos y de índices compuestos.
> 2. Si agregas o modificas una consulta (`where`, `orderBy`, etc.), **debes actualizar obligatoriamente este documento** y sincronizar `firestore.rules` y `firestore.indexes.json`.
> 3. NUNCA introduzcas llamadas `get()` dentro de la evaluación de queries de colección en `firestore.rules`.
> 4. NUNCA elimines cláusulas de ownership (`trainerId == request.auth.uid`, `clientId == request.auth.uid`) ni `serverTimestamp()`.

---

## 📋 Índice de Sectores

1. [Sector 1: 👤 Autenticación y Gestión de Usuarios (`users`)](#1-sector-autenticación-y-usuarios-users)
2. [Sector 2: 🏋️‍♂️ Rutinas y Ejercicios (`workouts`, `workout_templates`, `exercises_library`, `user_exercise_prefs`)](#2-sector-rutinas-y-ejercicios)
3. [Sector 3: 🥗 Dietas y Nutrición (`diets`, `diet_templates`, `foods_library`)](#3-sector-dietas-y-nutrición)
4. [Sector 4: 📊 Progreso, Biometría y Adherencia (`progress_logs`)](#4-sector-progreso-y-adherencia-progress_logs)
5. [Sector 5: 💬 Chat y Mensajería en Tiempo Real (`messages`, `conversations`)](#5-sector-chat-y-mensajería)
6. [Sector 6: 👑 Administración y Gestión Global (`users`, `stats`, `library_admin`)](#6-sector-administración-y-staff)
7. [Matriz Cruzada de Reglas vs Consultas (Checklist de Seguridad)](#7-matriz-cruzada-de-seguridad)
8. [Protocolo de Adición de Nuevas Consultas](#8-protocolo-de-adición-de-nuevas-consultas)

---

## 1. Sector: Autenticación y Usuarios (`users`)

### Mapeo de Operaciones

| Archivo Fuente | Función / Operación | Tipo | Cláusulas Firestore / Payload | Regla Firestore Asociada | Índice Requerido |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `src/lib/shared/authGuard.ts` | `requireAuth()`, `requireRole()` | `getDoc` | `doc(db, 'users', uid)` | `allow read: if isAuth() && (request.auth.uid == userId \|\| isStaff() \|\| ...)` | N/A (Doc directo) |
| `src/lib/shared/profileService.ts` | `loadProfile(uid)` | `getDoc` | `doc(db, 'users', uid)` | `allow read: if isAuth() && (request.auth.uid == userId \|\| isStaff())` | N/A |
| `src/lib/shared/profileService.ts` | `updateProfile(uid, data)` | `updateDoc` | `doc(db, 'users', uid), { name, phone, ... }` | `allow update: if request.auth.uid == userId && role unchanged && isBlocked unchanged` | N/A |
| `src/lib/auth/userWatcher.ts` | `watchCurrentUser(uid)` | `onSnapshot` | `doc(db, 'users', uid)` | `allow read: if isAuth() && request.auth.uid == userId` | N/A |
| `src/lib/client/onboardingService.ts`| `saveOnboardingStep(uid, data)` | `updateDoc` | `doc(db, 'users', uid), { medicalProfile, ... }`| `allow update: if request.auth.uid == userId` | N/A |
| `src/lib/trainer/trainerClients.ts` | `subscribeToClients(trainerId)` | `onSnapshot` (Query) | `collection('users'), where('assignedTrainerId', '==', trainerId), where('role', '==', 'client')` | `allow read: if isAuth() && (isStaff() \|\| resource.data.assignedTrainerId == request.auth.uid)` | `users: assignedTrainerId (ASC) + role (ASC) + createdAt (DESC)` |
| `src/lib/admin/adminUsers.ts` | `subscribeToAllUsers()` | `onSnapshot` (Query) | `collection('users'), orderBy('createdAt', 'desc')` | `allow read: if isAuth() && isStaff()` | `users: createdAt (DESC)` |
| `src/lib/admin/adminUsers.ts` | `subscribeToUsersByRole(role)` | `onSnapshot` (Query) | `collection('users'), where('role', '==', role), orderBy('createdAt', 'desc')` | `allow read: if isAuth() && isStaff()` | `users: role (ASC) + createdAt (DESC)` |
| `src/lib/admin/adminUsers.ts` | `setUserRole(uid, role)` | `updateDoc` | `doc(db, 'users', uid), { role, updatedAt }` | `allow update: if isAdmin()` | N/A |
| `src/lib/admin/adminUsers.ts` | `toggleUserBlock(uid, blocked)` | `updateDoc` | `doc(db, 'users', uid), { isBlocked, updatedAt }` | `allow update: if isAdmin()` | N/A |
| `src/lib/admin/adminUsers.ts` | `assignTrainerToClient(cId, tId)`| `updateDoc` | `doc(db, 'users', cId), { assignedTrainerId, updatedAt }` | `allow update: if isStaff()` | N/A |

---

## 2. Sector: Rutinas y Ejercicios

### Mapeo de Operaciones

| Archivo Fuente | Función / Operación | Tipo | Cláusulas Firestore / Payload | Regla Firestore Asociada | Índice Requerido |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `src/lib/client/workoutService.ts` | `subscribeToTodayWorkout(cId)` | `onSnapshot` (Query) | `collection('workouts'), where('clientId', '==', cId), orderBy('createdAt', 'desc'), limit(1)` | `allow read: if resource.data.clientId == request.auth.uid \|\| isStaff()` | `workouts: clientId (ASC) + createdAt (DESC)` |
| `src/lib/client/workoutService.ts` | `subscribeToClientWorkouts(cId)`| `onSnapshot` (Query) | `collection('workouts'), where('clientId', '==', cId), orderBy('createdAt', 'desc')` | `allow read: if resource.data.clientId == request.auth.uid \|\| isStaff()` | `workouts: clientId (ASC) + createdAt (DESC)` |
| `src/lib/trainer/trainerWorkouts.ts` | `subscribeToWorkoutsByTrainer(tId)`| `onSnapshot` (Query) | `collection('workouts'), where('trainerId', '==', tId), orderBy('createdAt', 'desc')` | `allow read: if resource.data.trainerId == request.auth.uid \|\| isStaff()` | `workouts: trainerId (ASC) + createdAt (DESC)` |
| `src/lib/trainer/trainerWorkouts.ts` | `createWorkout(data)` | `addDoc` | `collection('workouts'), { ...data, trainerId, clientId, createdAt, updatedAt }` | `allow create: if isStaff() && (request.resource.data.trainerId == request.auth.uid \|\| isAdmin())` | N/A |
| `src/lib/trainer/trainerWorkouts.ts` | `updateWorkout(id, data)` | `updateDoc` | `doc(db, 'workouts', id), { ...data, updatedAt }` | `allow update: if (isTrainer() && resource.data.trainerId == request.auth.uid) \|\| isAdmin()` | N/A |
| `src/lib/trainer/trainerWorkouts.ts` | `deleteWorkout(id)` | `deleteDoc` | `doc(db, 'workouts', id)` | `allow delete: if (isTrainer() && resource.data.trainerId == request.auth.uid) \|\| isAdmin()` | N/A |
| `src/lib/trainer/templateService.ts` | `subscribeToWorkoutTemplates()` | `onSnapshot` (Collection) | `collection('workout_templates')` | `allow read: if isAuth()` | N/A |
| `src/lib/trainer/templateService.ts` | `applyWorkoutTemplateToClient(...)`| `addDoc` | `collection('workouts'), newWorkout` | `allow create: if isStaff()` | N/A |
| `src/lib/shared/exerciseLibrary.ts` | `subscribeToExercises()` | `onSnapshot` (Query) | `collection('exercises_library'), where('isActive', '==', true), orderBy('translations.es', 'asc')` | `allow read: if isAuth()` | `exercises_library: isActive (ASC) + translations.es (ASC)` |
| `src/lib/shared/exerciseLibrary.ts` | `subscribeToExercisesByCategory(cat)`| `onSnapshot` (Query) | `collection('exercises_library'), where('isActive', '==', true), where('category', '==', cat)` | `allow read: if isAuth()` | `exercises_library: isActive (ASC) + category (ASC)` |
| `src/lib/shared/exerciseLibrary.ts` | `subscribeToExercisesByMuscle(m)` | `onSnapshot` (Query) | `collection('exercises_library'), where('isActive', '==', true), where('muscleGroups', 'array-contains', m)` | `allow read: if isAuth()` | `exercises_library: isActive (ASC) + muscleGroups (CONTAINS)` |
| `src/lib/client/exercisePreferencesService.ts` | `getUserExercisePreferences(uId)` | `getDoc` / `onSnapshot` | `doc(db, 'user_exercise_prefs', uId)` | `allow read: if request.auth.uid == userId \|\| isStaff()` | N/A |
| `src/lib/client/exercisePreferencesService.ts` | `requestExerciseAlternative(...)` | `updateDoc` / `setDoc` | `doc(db, 'user_exercise_prefs', uId), { ... }` | `allow create, update: if request.auth.uid == userId \|\| isStaff()` | N/A |

---

## 3. Sector: Dietas y Nutrición

### Mapeo de Operaciones

| Archivo Fuente | Función / Operación | Tipo | Cláusulas Firestore / Payload | Regla Firestore Asociada | Índice Requerido |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `src/lib/client/dietService.ts` | `subscribeToActiveDiet(cId)` | `onSnapshot` (Query) | `collection('diets'), where('clientId', '==', cId), orderBy('createdAt', 'desc'), limit(1)` | `allow read: if resource.data.clientId == request.auth.uid \|\| isStaff()` | `diets: clientId (ASC) + createdAt (DESC)` |
| `src/lib/trainer/trainerDiets.ts` | `subscribeToDietsByTrainer(tId)` | `onSnapshot` (Query) | `collection('diets'), where('trainerId', '==', tId), orderBy('createdAt', 'desc')` | `allow read: if resource.data.trainerId == request.auth.uid \|\| isStaff()` | `diets: trainerId (ASC) + createdAt (DESC)` |
| `src/lib/trainer/trainerDiets.ts` | `createDiet(data)` | `addDoc` | `collection('diets'), { ...data, trainerId, clientId, createdAt, updatedAt }` | `allow create: if isStaff() && (request.resource.data.trainerId == request.auth.uid \|\| isAdmin())` | N/A |
| `src/lib/trainer/trainerDiets.ts` | `updateDiet(id, data)` | `updateDoc` | `doc(db, 'diets', id), { ...data, updatedAt }` | `allow update: if (isTrainer() && resource.data.trainerId == request.auth.uid) \|\| isAdmin()` | N/A |
| `src/lib/trainer/trainerDiets.ts` | `deleteDiet(id)` | `deleteDoc` | `doc(db, 'diets', id)` | `allow delete: if (isTrainer() && resource.data.trainerId == request.auth.uid) \|\| isAdmin()` | N/A |
| `src/lib/trainer/templateService.ts` | `subscribeToDietTemplates()` | `onSnapshot` (Collection) | `collection('diet_templates')` | `allow read: if isAuth()` | N/A |
| `src/lib/shared/foodLibrary.ts` | `subscribeToFoods()` | `onSnapshot` (Query) | `collection('foods_library'), where('isActive', '==', true), orderBy('translations.es', 'asc')` | `allow read: if isAuth()` | `foods_library: isActive (ASC) + translations.es (ASC)` |
| `src/lib/shared/foodLibrary.ts` | `subscribeToFoodsByCategory(cat)`| `onSnapshot` (Query) | `collection('foods_library'), where('isActive', '==', true), where('category', '==', cat)` | `allow read: if isAuth()` | `foods_library: isActive (ASC) + category (ASC)` |

---

## 4. Sector: Progreso y Adherencia (`progress_logs`)

### Mapeo de Operaciones

| Archivo Fuente | Función / Operación | Tipo | Cláusulas Firestore / Payload | Regla Firestore Asociada | Índice Requerido |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `src/lib/client/progressService.ts` | `subscribeToProgressLogs(cId)` | `onSnapshot` (Query) | `collection('progress_logs'), where('clientId', '==', cId), orderBy('date', 'desc')` | `allow read: if resource.data.clientId == request.auth.uid \|\| isStaff()` | `progress_logs: clientId (ASC) + date (DESC)` |
| `src/lib/client/progressService.ts` | `subscribeToProgressLogsByType(cId, type)`| `onSnapshot` (Query) | `collection('progress_logs'), where('clientId', '==', cId), where('type', '==', type), orderBy('date', 'desc')` | `allow read: if resource.data.clientId == request.auth.uid \|\| isStaff()` | `progress_logs: clientId (ASC) + type (ASC) + date (DESC)` |
| `src/lib/client/progressService.ts` | `addProgressLog(data)` | `addDoc` | `collection('progress_logs'), { ...data, createdAt: serverTimestamp() }` | `allow create: if request.resource.data.clientId == request.auth.uid \|\| isStaff()` | N/A |
| `src/lib/trainer/trainerProgress.ts` | `subscribeToClientProgress(cId)` | `onSnapshot` (Query) | `collection('progress_logs'), where('clientId', '==', cId), orderBy('date', 'desc')` | `allow read: if isStaff() \|\| resource.data.clientId == request.auth.uid` | `progress_logs: clientId (ASC) + date (DESC)` |

---

## 5. Sector: Chat y Mensajería (`messages`, `conversations`)

### Mapeo de Operaciones

| Archivo Fuente | Función / Operación | Tipo | Cláusulas Firestore / Payload | Regla Firestore Asociada | Índice Requerido |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `src/lib/shared/chat.ts` / `trainerChat.ts` | `subscribeToConversations(uId)` | `onSnapshot` (Query) | `collection('messages'), where('participants', 'array-contains', uId), orderBy('createdAt', 'desc')` | `allow read: if resource.data.participants.hasAny([request.auth.uid]) \|\| isStaff()` | `messages: participants (CONTAINS) + createdAt (DESC)` |
| `src/lib/shared/chat.ts` / `trainerChat.ts` | `subscribeToConversation(u1, u2)`| `onSnapshot` (Query) | `collection('messages'), where('participants', 'array-contains', u1), orderBy('createdAt', 'asc')` | `allow read: if resource.data.participants.hasAny([request.auth.uid]) \|\| isStaff()` | `messages: participants (CONTAINS) + createdAt (ASC)` |
| `src/lib/shared/chat.ts` / `trainerChat.ts` | `sendMessage(...)` | `addDoc` | `collection('messages'), { senderId, receiverId, participants, content, isRead: false, createdAt }` | `allow create: if request.resource.data.senderId == request.auth.uid \|\| participants.hasAny([auth.uid])` | N/A |
| `src/lib/shared/chat.ts` / `trainerChat.ts` | `markAsRead(mId)` | `updateDoc` | `doc(db, 'messages', mId), { isRead: true }` | `allow update: if resource.data.receiverId == request.auth.uid \|\| isStaff()` | N/A |

---

## 6. Sector: Administración y Staff

### Mapeo de Operaciones

| Archivo Fuente | Función / Operación | Tipo | Cláusulas Firestore / Payload | Regla Firestore Asociada | Índice Requerido |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `src/services/adminService.ts` | `getUsers()` | `getDocs` (Query) | `collection('users'), orderBy('createdAt', 'desc'), limit(100)` | `allow read: if isStaff()` | `users: createdAt (DESC)` |
| `src/pages/admin/workouts.astro` | Listado Global | `getDocs` | `collection('workouts')` | `allow read: if isStaff()` | N/A |
| `src/pages/admin/diets.astro` | Listado Global | `getDocs` | `collection('diets')` | `allow read: if isStaff()` | N/A |
| `src/pages/admin/clinical.astro` | Listado Pacientes | `getDocs` (Query) | `collection('users'), where('role', '==', 'client')` | `allow read: if isStaff()` | `users: role (ASC)` |
| `src/pages/admin/foods.astro` | Catálogo de Alimentos | `addDoc` / `updateDoc` | `collection('foods_library')` | `allow create, update: if isStaff()`, `allow delete: if false` (Soft delete) | N/A |
| `src/pages/admin/exercises.astro` | Catálogo Ejercicios | `addDoc` / `updateDoc` | `collection('exercises_library')` | `allow create, update: if isStaff()`, `allow delete: if isAdmin()` | N/A |

---

## 7. Matriz Cruzada de Seguridad (Reglas vs Roles)

```
                       ┌─────────┬─────────┬─────────┬──────────────┐
                       │ CLIENT  │ TRAINER │  ADMIN  │ UNAUTHENTIC. │
┌──────────────────────┼─────────┼─────────┼─────────┼──────────────┤
│ /users (propio)      │ R / W*  │ R / W*  │ R / W   │     ⛔       │
│ /users (otros)       │ ⛔ (1)  │ R (2)   │ R / W   │     ⛔       │
│ /workouts            │ R (3)   │ R/W/D(4)│ R/W/D   │     ⛔       │
│ /diets               │ R (3)   │ R/W/D(4)│ R/W/D   │     ⛔       │
│ /messages            │ R/W(5)  │ R/W(5)  │ R/W/D   │     ⛔       │
│ /progress_logs       │ R/W (3) │ R/W (2) │ R/W/D   │     ⛔       │
│ /workout_templates   │ R       │ R/W/D   │ R/W/D   │     ⛔       │
│ /diet_templates      │ R       │ R/W/D   │ R/W/D   │     ⛔       │
│ /exercises_library   │ R       │ R / W   │ R/W/D   │     ⛔       │
│ /foods_library       │ R       │ R / W   │ R / W   │     ⛔       │
│ /user_exercise_prefs │ R/W (3) │ R / W   │ R/W/D   │     ⛔       │
│ /app_logs            │ ⛔      │ W*      │ R / D   │     ⛔       │
│ /app_logs_dedup      │ ⛔      │ W*      │ D       │     ⛔       │
└──────────────────────┴─────────┴─────────┴─────────┴──────────────┘
```
- **W\***: Solo datos permitidos por reglas de inmutabilidad y sanitización estricta.
- **(1)**: Los clientes solo pueden leer perfiles de usuarios con rol `trainer` o `admin` (para chat).
- **(2)**: Los trainers pueden leer clientes asignados y clientes para asignarles rutinas/dietas.
- **(3)**: Solo documentos donde `clientId == request.auth.uid`.
- **(4)**: Solo documentos donde `trainerId == request.auth.uid`.
- **(5)**: Solo mensajes donde `participants.hasAny([request.auth.uid])`.

---

## 8. Protocolo de Adición de Nuevas Consultas

Si vas a agregar una nueva consulta en el código:

1. **Paso 1:** Revisa si la colección ya tiene una regla que soporte tu query (recuerda: las reglas deben evaluar campos que el query filtra).
2. **Paso 2:** Si tu query combina 2 o más `where`, o `where` + `orderBy`, añade la definición en `firestore.indexes.json`:
   ```json
   {
     "collectionGroup": "nombre_coleccion",
     "queryScope": "COLLECTION",
     "fields": [
       { "fieldPath": "campo1", "order": "ASCENDING" },
       { "fieldPath": "campo2", "order": "DESCENDING" }
     ]
   }
   ```
3. **Paso 3:** Despliega los índices a Firebase: `npx firebase deploy --only firestore:indexes`.
4. **Paso 4:** Actualiza este documento `docs/MATRIZ_FIRESTORE_QUERIES_Y_REGLAS.md` con la nueva fila en la tabla del sector correspondiente.
5. **Paso 5:** Registra la tarea en `TASK.md` y valida con `npm test` y `npm run type-check`.
