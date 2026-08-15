# 🏗️ Arquitectura de Datos y Schemas Firestore — CampFit

> **Documentación Oficial de Modelo NoSQL y Reglas de Seguridad**  
> **Última actualización:** 2026-08-05

---

## 📊 Visión General del Modelo NoSQL

CampFit utiliza Google Cloud Firestore como base de datos principal orientada a documentos. Se organiza en **11 colecciones principales**:

```
cloud.firestore/
├── users/{userId}                  # Perfiles de usuario y asignaciones de rol
├── workouts/{workoutId}            # Rutinas de entrenamiento activas por cliente
├── diets/{dietId}                  # Planes nutricionales activos por cliente
├── messages/{messageId}            # Mensajes del chat cliente-entrenador
├── progress_logs/{logId}           # Registros de peso, adherencia y rpe
├── foods_library/{foodId}          # Catálogo central de alimentos (multilenguaje, macros, alérgenos)
├── exercises_library/{exerciseId}  # Catálogo central de ejercicios (multilenguaje, músculos, equipamiento)
├── user_exercise_prefs/{userId}    # Preferencias de cliente (ratings 1-5, favoritos, exclusiones, solicitudes)
├── workout_templates/{templateId}  # Plantillas de rutinas predeterminadas
├── diet_templates/{templateId}     # Plantillas de dietas predeterminadas
└── exercise_templates/{templateId} # Plantillas auxiliares de ejercicios
```

---

## 📑 Especificaciones de Colecciones y Schemas

### 1. `users/{userId}`
- **Descripción:** Perfil de usuario, rol y ficha médica.
- **Campos principales:**
  - `uid: string`
  - `email: string`
  - `name: string`
  - `role: 'admin' | 'trainer' | 'client'`
  - `assignedTrainerId?: string` (si es cliente)
  - `isBlocked?: boolean`
  - `medicalProfile?: MedicalProfile` (alergias, intolerancias, lesíón, dietaryRestrictions, excludedFoods, excludedFoodCategories)

### 2. `workouts/{workoutId}`
- **Descripción:** Rutina de entrenamiento asignada a un cliente.
- **Campos principales:**
  - `clientId: string`
  - `trainerId: string`
  - `name: string`
  - `difficulty: string`
  - `exercises: Exercise[]` (`id`, `exerciseId?`, `name`, `sets`, `reps`, `restTime`, `videoUrl`, `description`, `order`, `dayOfWeek`, `estimatedTime?: string | null`, `isCompleted?: boolean`, `completionTime?: Timestamp | null`)

### 3. `diets/{dietId}`
- **Descripción:** Plan nutricional asignado a un cliente.
- **Campos principales:**
  - `clientId: string`
  - `trainerId: string`
  - `name: string`
  - `type: 'normal' | 'definition' | 'volume' | 'keto' | 'vegan' | 'custom'`
  - `totalCalories: number`, `totalProtein: number`, `totalCarbs: number`, `totalFat: number`
  - `meals: Meal[]` (`id`, `name`, `foodId?`, `portionGrams?`, `calories`, `protein`, `carbs`, `fat`, `allergens?`, `order`, `estimatedTime?: string | null`, `isCompleted?: boolean`, `completionTime?: Timestamp | null`)

### 4. `messages/{messageId}`
- **Descripción:** Mensajes del sistema de chat directo.
- **Campos principales:**
  - `senderId: string`
  - `receiverId: string`
  - `participants: string[]` (array de uids)
  - `content: string`
  - `type: 'text' | 'alert'`
  - `isRead: boolean`
  - `createdAt: Timestamp`

### 5. `foods_library/{foodId}`
- **Descripción:** Catálogo central de alimentos.
- **Ver detalle completo:** [`BIBLIOTECA_ALIMENTOS.md`](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/features/BIBLIOTECA_ALIMENTOS.md)

### 6. `exercises_library/{exerciseId}`
- **Descripción:** Catálogo central de ejercicios.
- **Ver detalle completo:** [`BIBLIOTECA_EJERCICIOS.md`](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/features/BIBLIOTECA_EJERCICIOS.md)

### 7. `user_exercise_prefs/{userId}`
- **Descripción:** Ratings (1-5), favoritos, exclusiones y solicitudes enviadas al entrenador.
- **Ver detalle completo:** [`BIBLIOTECA_EJERCICIOS.md`](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/features/BIBLIOTECA_EJERCICIOS.md)

---

## 🛡️ Resumen de Reglas de Seguridad (`firestore.rules`)

1. **Usuarios (`/users/{userId}`):** Cada usuario lee y actualiza su documento. Admins editan cualquier campo (incluyendo `role` e `isBlocked`). Al crear, el rol debe ser `'client'`.
2. **Rutinas y Dietas (`/workouts`, `/diets`):** El cliente asignado lee su rutina/dieta. Solo el entrenador propietario (`trainerId == auth.uid`) o un admin pueden crear/editar/eliminar.
3. **Chat (`/messages`):** Los mensajes requieren que el `auth.uid` sea emisor, receptor o pertenezca al array `participants`.
4. **Librerías (`/foods_library`, `/exercises_library`):** Lectura para todo usuario autenticado. Creación y edición restrictiva solo para Staff (`isStaff()`). Eliminación física denegada (`delete: if false`).
5. **Preferencias Ejercicios (`/user_exercise_prefs`):** El cliente edita su propio documento. El entrenador asignado puede leer y marcar solicitudes como leídas (`acknowledged`).
