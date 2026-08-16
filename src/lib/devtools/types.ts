export interface AutofillProfile {
  name: string;
  fields: Record<string, string>;
}

export interface PageHandler {
  pathPattern: string | RegExp;
  label: string;
  autofillProfiles?: AutofillProfile[];
  actions?: DevToolsAction[];
}

export interface DevToolsAction {
  label: string;
  icon?: string;
  handler: () => void;
}

export type PageId =
  | 'login'
  | 'register'
  | 'recover'
  | 'onboarding'
  | 'index'
  | 'client-dashboard'
  | 'client-workouts'
  | 'client-diets'
  | 'client-progress'
  | 'client-chat'
  | 'client-settings'
  | 'client-support'
  | 'client-medical'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-clients'
  | 'admin-trainers'
  | 'admin-settings'
  | 'admin-workouts'
  | 'admin-diets'
  | 'admin-exercises'
  | 'admin-foods'
  | 'admin-logs'
  | 'admin-devtools'
  | 'admin-seeds'
  | 'admin-progress'
  | 'admin-chat'
  | 'admin-clinical'
  | 'trainer-dashboard'
  | 'trainer-clients'
  | 'trainer-workouts'
  | 'trainer-diets'
  | 'trainer-chat'
  | 'trainer-settings'
  | 'trainer-clinical'
  | 'unknown';

export interface ExerciseTemplate {
  id?: string;
  name: string;
  category: string;
  sets?: number;
  reps?: number;
  restTime?: string;
  order?: number;
  dayOfWeek?: number;
  defaultSets?: number;
  defaultReps?: number;
  defaultRestTime?: string;
  description?: string;
  videoUrl?: string;
  isPreset?: boolean;
  source?: string;
}

export interface MealTemplate {
  id?: string;
  name: string;
  category?: string;
  type?: string;
  order?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  description?: string;
  ingredients?: string[];
  isPreset?: boolean;
  source?: string;
}

export interface DietTemplate {
  id?: string;
  name: string;
  type: string;
  somatotype?: 'ectomorph' | 'mesomorph' | 'endomorph' | string;
  totalCalories?: number;
  description?: string;
  meals?: MealTemplate[];
  calorie?: number;
  isPreset?: boolean;
  version?: number;
  source?: string;
}

export interface WorkoutTemplate {
  id?: string;
  name: string;
  category: string;
  exercises?: ExerciseTemplate[];
  description?: string;
  duration?: string;
  difficulty?: string;
  isPreset?: boolean;
  version?: number;
  source?: string;
}

export interface SeedDeploymentRecord {
  id?: string;
  version: number;
  deployedAt?: number | unknown;
  status: 'pending' | 'success' | 'failed';
  counts?: {
    exercises: number;
    meals: number;
    diets: number;
    workouts: number;
  };
}

export interface DevToolsStats {
  totalUsers?: number;
  totalTrainers?: number;
  totalClients?: number;
  totalWorkouts?: number;
  totalDiets?: number;
  exerciseTemplatesCount?: number;
  mealTemplatesCount?: number;
  dietTemplatesCount?: number;
  workoutTemplatesCount?: number;
  lastSeededAt?: number;
  [key: string]: number | undefined;
}
