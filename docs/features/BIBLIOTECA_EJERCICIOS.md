# 🏋️ Feature Doc: Biblioteca de Ejercicios y Preferencias del Cliente

> **Módulo Central:** `src/lib/shared/exerciseLibrary.ts`  
> **Preferencias Cliente:** `src/types/index.ts` (`UserExercisePreferences`, `ExerciseRequest`)  
> **Reglas de Seguridad:** `firestore.rules` (`exercises_library`, `user_exercise_prefs`)  
> **Seed Script:** `scripts/seed-exercises.mjs` (70 ejercicios)

---

## 1. Visión General

La **Biblioteca de Ejercicios** proporciona un catálogo central multilenguaje (Español, Inglés, Catalán) con 70 ejercicios clasificados por grupos musculares, categorías, tipo de equipamiento, nivel de dificultad y contraindicaciones de salud.

Permite a los clientes:
- Calificar ejercicios (rating 1 a 5 estrellas).
- Marcar ejercicios favoritos (⭐) o solicitar exclusión (🚫).
- Enviar solicitudes estructuradas al entrenador con checklist de motivos (dolor, lesión, falta de equipo, etc.) que notifican automáticamente al chat.

Permite a los entrenadores:
- Asignar ejercicios del catálogo a las rutinas de sus clientes.
- Recibir sugerencias no intrusivas basadas en los favoritos del cliente.
- Ver alertas si intentan incluir un ejercicio excluido o contraindicado para el cliente.
- Confirmar de forma silenciosa (`acknowledged`) las solicitudes recibidas.

---

## 2. Modelo de Datos del Catálogo (`ExerciseItem`)

Colección Firestore: `exercises_library/{exerciseId}`

```typescript
export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms'
  | 'core' | 'quadriceps' | 'hamstrings' | 'glutes' | 'calves'
  | 'full_body' | 'cardio';

export type ExerciseCategory =
  | 'strength' | 'cardio' | 'flexibility' | 'balance'
  | 'plyometric' | 'functional' | 'rehabilitation' | 'sport_specific';

export type EquipmentType =
  | 'barbell' | 'dumbbell' | 'kettlebell' | 'cable' | 'machine'
  | 'bodyweight' | 'resistance_band' | 'pull_up_bar' | 'bench'
  | 'rack' | 'trx' | 'other';

export interface ExerciseItem {
  id: string;
  translations: {
    es: string;
    en: string;
    ca: string;
  };
  searchIndex: string[];
  muscleGroups: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  category: ExerciseCategory;
  equipment: EquipmentType[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  defaultSets: number;
  defaultReps: number;
  defaultRestSeconds: number;
  defaultDurationSeconds?: number;

  videoUrl?: string;
  thumbnailUrl?: string;
  instructionsUrl?: string;

  contraindications?: string[]; // Ej: ['lumbar_herniation', 'knee_pain']
  tags: string[];

  isActive: boolean; // Soft delete mandatory
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}
```

---

## 3. Modelo de Preferencias del Cliente (`UserExercisePreferences`)

Colección Firestore: `user_exercise_prefs/{userId}` (un documento por cliente)

```typescript
export type ExclusionReason =
  | 'pain'            // Dolor / incomodidad
  | 'injury'          // Lesión activa o pasada
  | 'no_equipment'    // No tengo el equipamiento
  | 'too_difficult'   // Demasiado difícil
  | 'dislike'         // No me gusta
  | 'contraindicated' // Contraindicado por médico
  | 'other';          // Otro motivo

export interface ExerciseRequest {
  exerciseId: string;
  exerciseName: string;
  exerciseNameEn?: string;
  type: 'exclude' | 'un_exclude' | 'add_favorite' | 'remove_favorite';
  quickReasons?: ExclusionReason[];
  customReason?: string;
  status: 'pending' | 'acknowledged'; // 'acknowledged' es PRIVADO para el trainer
  requestedAt: any;
  acknowledgedAt?: any;
  chatMessageId?: string;
}

export interface UserExercisePreferences {
  userId: string;
  ratings: Record<string, 1 | 2 | 3 | 4 | 5>; // exerciseId -> rating
  favorites: string[]; // IDs explícitos de favoritos
  excluded: string[];  // IDs explícitos de excluidos
  pendingRequests: ExerciseRequest[];
  updatedAt: any;
}
```

---

## 4. Reglas de Seguridad (`firestore.rules`)

```javascript
match /exercises_library/{exerciseId} {
  allow read: if isAuth();
  allow create, update: if isStaff();
  allow delete: if false; // Soft delete obligatorio
}

match /user_exercise_prefs/{userId} {
  allow read: if isAuth() && (
    request.auth.uid == userId ||
    (isTrainer() && get(/databases/$(database)/documents/users/$(userId)).data.assignedTrainerId == request.auth.uid) ||
    isAdmin()
  );
  allow create, update: if isAuth() && (
    request.auth.uid == userId ||
    (isTrainer() && get(/databases/$(database)/documents/users/$(userId)).data.assignedTrainerId == request.auth.uid) ||
    isAdmin()
  );
  allow delete: if isAdmin();
}
```

---

## 5. Integración en Interfaces y Servicios

1. **Servicio Central (`src/lib/client/exercisePreferencesService.ts`)**:
   - `subscribeToUserExercisePreferences()`: escucha reactiva a `user_exercise_prefs/{userId}`.
   - `rateExercise(userId, exerciseId, rating)`: guarda calificación 1 a 5 estrellas.
   - `toggleFavorite(userId, exerciseId)`: conmuta favoritos explícitos.
   - `requestExerciseExclusion(userId, clientName, trainerId, exercise, quickReasons, customReason)`: registra solicitud y envía mensaje de alerta/chat al entrenador.
   - `acknowledgeExerciseRequest(userId, exerciseId)`: confirmación de lectura por el entrenador.
2. **Entrenamientos del Cliente (`src/pages/client/workouts.astro`)**:
   - Selector interactivo de estrellas ⭐ (1–5) en cada ejercicio.
   - Botón toggle de favoritos ⭐.
   - Modal interactivo de exclusión (`#exclusion-modal`) con checklist de motivos predefinidos y notas opcionales.
3. **Creador y Editor de Rutinas del Entrenador (`src/pages/trainer/workouts.astro`)**:
   - Selector directo desde el catálogo central `exercises_library` con autollenado de series, repeticiones y descansos recomendados.
   - Badges visuales de favoritos del cliente (⭐) y solicitudes de exclusión (🚫).
   - Banner de solicitudes pendientes con botón de confirmación ("Marcar visto").
   - Alerta interactiva de confirmación antes de guardar si se incluyen ejercicios con solicitudes de exclusión.
