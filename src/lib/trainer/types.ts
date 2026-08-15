/**
 * Tipos compartidos para el panel de entrenador.
 *
 * @module trainerTypes
 */

import type { MedicalProfile } from '@/types';

export interface TrainerClient {
  uid: string;
  name: string;
  email: string;
  // 🔒 CRÍTICO: Incluye 'trainer' porque un entrenador puede tener otro entrenador
  // asignado (assignedTrainerId) y aparecer en la lista de clientes del entrenador
  // que lo supervisa. NUNCA reducir a solo 'client' — rompería el acceso a la
  // evolución personal del entrenador como cliente.
  role: 'client' | 'trainer' | 'admin';
  assignedTrainerId?: string;
  hasActiveAlert?: boolean;
  medicalProfile?: MedicalProfile;
  trainerPrivateNotes?: string;
  lastActivityAt?: { toDate: () => Date } | string | null;
  createdAt?: { toDate: () => Date } | null;
  updatedAt?: { toDate: () => Date } | null;
}

export interface TrainerWorkout {
  id: string;
  clientId: string;
  trainerId: string;
  name: string;
  difficulty: string;
  description: string;
  exercises: Exercise[];
  createdAt?: { toDate: () => Date } | null;
  updatedAt?: { toDate: () => Date } | null;
}

export interface Exercise {
  id: string;
  // 🔒 CRÍTICO: Referencia al ejercicio en exercises_library.
  // Si el trainer seleccionó del catálogo → exerciseId apunta al documento.
  // Si es texto libre (rutinas legacy) → exerciseId es undefined.
  // NUNCA eliminar — se usa para mostrar detalles del catálogo, detectar exclusiones
  // del cliente y sugerir sustitutos en trainer/workouts.astro.
  exerciseId?: string;     // Ref a exercises_library/{exerciseId}
  name: string;
  sets: number;
  reps: number;
  restTime: string;
  videoUrl: string;
  description: string;
  order: number;
  dayOfWeek: number;
  /** Hora estimada para el ejercicio (Formato HH:mm). Opcional. */
  estimatedTime: string | null;
  /** Estado de completado por el cliente */
  isCompleted: boolean;
  /** Timestamp de cuándo se marcó como completado */
  completionTime: Timestamp | null;
}

export interface TrainerDiet {
  id: string;
  clientId: string;
  trainerId: string;
  name: string;
  // 🔒 CRÍTICO: Union estricta de tipos de dieta. NUNCA cambiar a `string`.
  // Si se relaja a string, se pierde el type-safety y el editor no validará los valores.
  type: 'normal' | 'definition' | 'volume' | 'keto' | 'vegan' | 'custom';
  // 🔒 CRÍTICO: Union estricta de somatotipos. NUNCA añadir `| string`.
  somatotype?: 'ectomorph' | 'mesomorph' | 'endomorph';
  totalCalories: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
  meals: Meal[];
  createdAt?: { toDate: () => Date } | null;
  updatedAt?: { toDate: () => Date } | null;
}

export interface Meal {
  id: string;
  // 🔒 CRÍTICO: Union estricta de nombres de comida. NUNCA cambiar a `string`.
  // El cliente (dietService.ts) usa la misma union; si se relaja, se rompe la consistencia.
  name: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';
  description: string;
  // 🔒 CRÍTICO: Referencia al alimento en foods_library.
  // Si se seleccionó de la lista → foodId apunta al documento.
  // Si es texto libre → foodId es undefined. NUNCA eliminar.
  // Lo usa checkDietConflicts() en intoleranceChecker.ts para detección granular.
  foodId?: string;          // Ref a foods_library/{foodId}
  portionGrams?: number;    // Cantidad en gramos (si se seleccionó de la lista)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  order: number;
  // 🔒 CRÍTICO: Campo allergens. NUNCA eliminar.
  // Si foodId existe: se copia automáticamente de FoodItem.allergens al seleccionar.
  // Si no hay foodId: el trainer los marca manualmente.
  // Lo usa intoleranceChecker.ts para detectar conflictos con alergias del cliente.
  allergens?: string[];
}

export interface TrainerMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'alert' | 'media';
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  participants: string[];
  isRead: boolean;
  createdAt?: { toDate: () => Date } | null;
}

export interface ProgressLog {
  id: string;
  clientId: string;
  date: { toDate: () => Date } | null;
  weight?: number;
  calories?: number;
  rpe?: number;
  notes?: string;
  createdAt?: { toDate: () => Date } | null;
}

export interface ExerciseExecutionLog {
  exerciseId: string;
  exerciseName: string;
  status: 'completed' | 'partial' | 'skipped';
  targetSets?: number;
  targetReps?: number;
  actualSets?: number;
  actualReps?: number;
  actualWeight?: number;
  rpe?: number;
  notes?: string;
}

export interface WorkoutSessionLog {
  id: string;
  clientId: string;
  workoutId: string;
  workoutName: string;
  date?: { toDate: () => Date } | null;
  dayOfWeek: number;
  status: 'completed' | 'partial' | 'skipped';
  overallRpe?: number;
  notes?: string;
  exercises: ExerciseExecutionLog[];
  createdAt?: { toDate: () => Date } | null;
}
