# 🗄️ Modelo de Datos Firestore - CampFit 2.0

## Principios de Diseño NoSQL

1. **Desnormalización controlada**: Los datos de lectura frecuente se embeben en el documento padre
2. **Consultas por cliente**: La mayoría de consultas se filtran por `clientId`
3. **Streams en tiempo real**: Firestore `onSnapshot` para datos que cambian frecuentemente
4. **Índices compuestos**: Ver `15_api_contracts.md` para la lista completa de índices

---

## Colección: `users`

Documento clave: `{userId}` (mismo UID que Firebase Auth)

```typescript
interface User {
  // Información básica
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
  
  // Perfil médico (solo para clientes)
  medicalProfile?: {
    allergies: string[];
    injuries: string[];
    conditions: string[];
    goals: string[];
    experience: 'beginner' | 'intermediate' | 'advanced';
    birthDate: Timestamp;
    height: number;                // cm
    initialWeight: number;         // kg
  };
  
  // Asignación (para clientes)
  assignedTrainerId?: string;      // Ref a users/{trainerId}
  
  // Estado de alertas
  hasActiveAlert: boolean;
  
  // Metadatos
  lastActivityAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Colección: `workouts`

Documento: `{workoutId}` (auto-generado)

```typescript
interface Workout {
  clientId: string;                // Ref a users/{clientId}
  trainerId: string;               // Ref a users/{trainerId}
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'custom';
  description: string;
  exercises: Exercise[];           // Embebidos - desnormalizados
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Exercise {
  id: string;                      // Ref a exercises_library/{exId}
  name: string;
  sets: number;
  reps: number;
  restTime: string;                // Ej: "90s", "2min"
  videoUrl: string;                // URL de Cloudflare R2
  description: string;
  order: number;
  dayOfWeek: number;               // 1=Lunes, ..., 7=Domingo
}
```

---

## Colección: `diets`

Documento: `{dietId}` (auto-generado)

```typescript
interface Diet {
  clientId: string;
  trainerId: string;
  name: string;
  type: 'normal' | 'advanced';
  somatotype: 'ectomorph' | 'mesomorph' | 'endomorph';
  totalCalories: number;
  meals: Meal[];                   // Embebidas - desnormalizadas
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Meal {
  id: string;
  name: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';
  description: string;
  calories: number;
  protein: number;                 // gramos
  carbs: number;                   // gramos
  fat: number;                     // gramos
  order: number;
}
```

---

## Colección: `messages`

Documento: `{messageId}` (auto-generado)

```typescript
interface Message {
  senderId: string;
  receiverId: string;
  participants: string[];          // [senderId, receiverId] - para array-contains
  content: string;
  type: 'text' | 'alert';
  isRead: boolean;                 // También usado como `read` en algunos servicios
  read?: boolean;                  // Variante usada en trainerUtils
  createdAt: Timestamp;
}
```

> **Nota:** La colección `messages` es plana (no es subcolección de `chat_rooms`).  
> El campo `isRead` y `read` coexisten como variantes según el servicio que lo use.

---

## Colección: `progress_logs`

Documento: `{logId}` (auto-generado)

```typescript
interface ProgressLog {
  clientId: string;
  type: 'workout' | 'meal' | 'weight' | 'photo';
  date: Timestamp;                 // Fecha del registro (no de creación)
  value: WorkoutValue | MealValue | WeightValue | PhotoValue;
  createdAt: Timestamp;
}

interface WorkoutValue {
  workoutId: string;
  completed: boolean;
  rpe: number;                     // 1-10
  notes?: string;
}

interface MealValue {
  mealId: string;
  completed: boolean;
}

interface WeightValue {
  weight: number;                  // kg
  notes?: string;
}

interface PhotoValue {
  photoUrl: string;                // URL de Cloudflare R2
  type: 'front' | 'side' | 'back';
}
```

---

## Colección: `exercises_library`

Documento: `{exerciseId}` (auto-generado)

```typescript
interface ExerciseLibrary {
  name: string;
  description: string;
  videoUrl: string;
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  thumbnailUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Colección: `diet_templates`

Documento: `{templateId}` (auto-generado)

```typescript
interface DietTemplate {
  name: string;
  type: 'normal' | 'advanced';
  somatotype: 'ectomorph' | 'mesomorph' | 'endomorph';
  totalCalories: number;
  meals: MealTemplate[];
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Diagrama de Relaciones

```
users/{userId}
  ├── assignedTrainerId ──────────────> users/{trainerId}
  │
  ├── workouts/{workoutId}.clientId ──> users/{clientId}
  ├── workouts/{workoutId}.trainerId ──> users/{trainerId}
  │
  ├── diets/{dietId}.clientId ────────> users/{clientId}
  ├── diets/{dietId}.trainerId ────────> users/{trainerId}
  │
  ├── messages/{msgId}.senderId ──────> users/{senderId}
  ├── messages/{msgId}.receiverId ────> users/{receiverId}
  │
  ├── progress_logs/{logId}.clientId ──> users/{clientId}
  │
  ├── exercises_library/{exId} (independiente)
  └── diet_templates/{templateId} (independiente)
```

---

## Estrategia de Consultas

| Consulta | Colección | Filtro | Orden |
|----------|-----------|--------|-------|
| Rutinas del cliente | `workouts` | `clientId == uid` | `createdAt desc` |
| Dietas del cliente | `diets` | `clientId == uid` | `createdAt desc` |
| Chat con entrenador | `messages` | `participants array-contains uid` | `createdAt asc` |
| Bandeja de entrada (admin) | `messages` | `participants array-contains adminUid` | `createdAt desc` |
| Progreso de peso | `progress_logs` | `clientId == uid && type == 'weight'` | `date asc` |
| Fotos de progreso | `progress_logs` | `clientId == uid && type == 'photo'` | `date desc` |
| Biblioteca ejercicios | `exercises_library` | (todos) | `name asc` |
| Plantillas de dieta | `diet_templates` | (todos) | `name asc` |

> **📌 Reglas de acceso:** Ver `05_reglas_seguridad.md` para políticas de acceso por rol.
> **📌 Índices compuestos:** Ver `15_api_contracts.md` para la configuración de índices de Firestore.
