/**
 * Tipos compartidos para el panel de entrenador.
 *
 * @module trainerTypes
 */

export interface TrainerClient {
  uid: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
  assignedTrainerId?: string;
  hasActiveAlert?: boolean;
  medicalProfile?: {
    allergies?: string[];
    injuries?: string[];
    conditions?: string[];
    goals?: string[];
    experience?: string;
  };
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
  name: string;
  sets: number;
  reps: number;
  restTime: string;
  videoUrl: string;
  description: string;
  order: number;
  dayOfWeek: number;
}

export interface TrainerDiet {
  id: string;
  clientId: string;
  trainerId: string;
  name: string;
  type: 'normal' | 'advanced';
  somatotype?: 'ectomorph' | 'mesomorph' | 'endomorph';
  totalCalories: number;
  meals: Meal[];
  createdAt?: { toDate: () => Date } | null;
  updatedAt?: { toDate: () => Date } | null;
}

export interface Meal {
  id: string;
  name: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  order: number;
}

export interface TrainerMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'alert';
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
