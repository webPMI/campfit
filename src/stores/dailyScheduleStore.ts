import { map } from 'nanostores';
import type { Meal } from '@/lib/client/dietService';
import type { Workout } from '@/lib/trainer/types';

export interface ScheduleItem {
  id: string;
  type: 'meal' | 'workout';
  name: string;
  description?: string;
  time: string; // HH:mm
  isCompleted: boolean;
  rawItem: Meal | Workout;
}

export interface DailyScheduleState {
  meals: Meal[];
  workouts: Workout[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  activeFilter: 'all' | 'meals' | 'workouts';
}

/**
 * Store para gestionar la agenda diaria del cliente en el cliente.
 * Permite actualizaciones optimistas y manejo de estado reactivo.
 */
export const dailyScheduleStore = map<DailyScheduleState>({
  meals: [] as Meal[],
  workouts: [] as Workout[],
  isLoading: true,
  error: null,
  lastUpdated: null,
  activeFilter: 'all',
});

/**
 * Actualiza la agenda con datos del servidor.
 */
export const setDailySchedule = (meals: Meal[], workouts: Workout[]) => {
  dailyScheduleStore.set({
    meals,
    workouts,
    isLoading: false,
    error: null,
    lastUpdated: Date.now(),
    activeFilter: dailyScheduleStore.get().activeFilter || 'all',
  });
};

/**
 * Actualiza una comida específica (ej: cambiar hora estimada o marcar como completado).
 * Realiza una actualización optimista en la UI.
 */
export const updateMeal = (mealId: string, updates: Partial<Meal>) => {
  const current = dailyScheduleStore.get();
  const index = current.meals.findIndex((m) => m.id === mealId);
  if (index !== -1) {
    const newMeals = [...current.meals];
    newMeals[index] = { ...newMeals[index], ...updates } as Meal;
    dailyScheduleStore.set({ ...current, meals: newMeals, lastUpdated: Date.now() });
  }
};

/**
 * Cambia la hora estimada de una comida de forma optimista con detección de solapamiento.
 */
export const rescheduleMeal = (
  mealId: string,
  newTime: string
): { success: boolean; conflictWith?: string } => {
  const current = dailyScheduleStore.get();
  const meal = current.meals.find((m) => m.id === mealId);
  if (!meal) return { success: false };

  // Verificar si hay conflicto con entrenamientos en la misma hora (ej: "18:00")
  const hour = newTime.substring(0, 2);
  const conflictWorkout = current.workouts.find(
    (w: any) => w.estimatedTime && w.estimatedTime.startsWith(hour)
  );

  updateMeal(mealId, { estimatedTime: newTime });

  if (conflictWorkout) {
    return { success: true, conflictWith: conflictWorkout.name };
  }
  return { success: true };
};

/**
 * Alterna el estado de completado de una comida de forma optimista.
 */
export const toggleMealCompleted = (mealId: string): boolean => {
  const current = dailyScheduleStore.get();
  const meal = current.meals.find((m) => m.id === mealId);
  if (!meal) return false;
  const newStatus = !meal.isCompleted;
  updateMeal(mealId, { isCompleted: newStatus });
  return newStatus;
};

/**
 * Cambia la hora estimada de un entrenamiento de forma optimista con detección de solapamiento.
 */
export const rescheduleWorkout = (
  workoutId: string,
  newTime: string
): { success: boolean; conflictWith?: string } => {
  const current = dailyScheduleStore.get();
  const workout = current.workouts.find((w) => w.id === workoutId);
  if (!workout) return { success: false };

  // Verificar si hay conflicto con comidas en la misma hora (ej: "18:00")
  const hour = newTime.substring(0, 2);
  const conflictMeal = current.meals.find(
    (m: any) => m.estimatedTime && m.estimatedTime.startsWith(hour)
  );

  updateWorkout(workoutId, { estimatedTime: newTime } as any);

  if (conflictMeal) {
    return { success: true, conflictWith: conflictMeal.name };
  }
  return { success: true };
};

/**
 * Alterna el estado de completado de un ejercicio individual dentro de un entrenamiento.
 */
export const toggleExerciseCompleted = (workoutId: string, exerciseId: string): boolean => {
  const current = dailyScheduleStore.get();
  const workoutIndex = current.workouts.findIndex((w) => w.id === workoutId);
  if (workoutIndex === -1) return false;

  const workout = current.workouts[workoutIndex];
  const exercises = [...((workout as any).exercises || [])];
  const exIndex = exercises.findIndex((e: any) => e.id === exerciseId || e.exerciseId === exerciseId);
  if (exIndex === -1) return false;

  const newCompleted = !exercises[exIndex].completed;
  exercises[exIndex] = { ...exercises[exIndex], completed: newCompleted };

  const newWorkouts = [...current.workouts];
  newWorkouts[workoutIndex] = { ...workout, exercises } as any;
  dailyScheduleStore.set({ ...current, workouts: newWorkouts, lastUpdated: Date.now() });

  return newCompleted;
};

/**
 * Actualiza un entrenamiento específico.
 */
export const updateWorkout = (workoutId: string, updates: Partial<Workout>) => {
  const current = dailyScheduleStore.get();
  const index = current.workouts.findIndex((w) => w.id === workoutId);
  if (index !== -1) {
    const newWorkouts = [...current.workouts];
    newWorkouts[index] = { ...newWorkouts[index], ...updates } as Workout;
    dailyScheduleStore.set({ ...current, workouts: newWorkouts, lastUpdated: Date.now() });
  }
};

/**
 * Calcula estadísticas de adherencia combinadas en tiempo real.
 */
export const getScheduleAdherenceStats = () => {
  const { meals, workouts } = dailyScheduleStore.get();
  const totalMeals = meals.length;
  const completedMeals = meals.filter((m) => m.isCompleted).length;

  let totalExercises = 0;
  let completedExercises = 0;
  workouts.forEach((w) => {
    const exercises = (w as any).exercises || [];
    totalExercises += exercises.length;
    completedExercises += exercises.filter((e: any) => e.completed).length;
  });

  const totalItems = totalMeals + (totalExercises > 0 ? 1 : 0);
  const completedItems = completedMeals + (totalExercises > 0 && completedExercises === totalExercises ? 1 : 0);
  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const mealPercentage = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;
  const workoutPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  return {
    totalMeals,
    completedMeals,
    mealPercentage,
    totalExercises,
    completedExercises,
    workoutPercentage,
    overallPercentage: percentage,
  };
};

