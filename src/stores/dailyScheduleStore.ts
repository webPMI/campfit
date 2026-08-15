import { map } from 'nanostores';
import type { Meal } from '@/lib/trainer/types';
import type { Workout } from '@/lib/trainer/types';

/**
 * Store para gestionar la agenda diaria del cliente en el cliente.
 * Permite actualizaciones optimistas y manejo de estado reactivo.
 */
export const dailyScheduleStore = map({
  meals: [] as Meal[],
  workouts: [] as Workout[],
  isLoading: true,
  error: null as string | null,
  lastUpdated: null as number | null
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
    lastUpdated: Date.now()
  });
};

/**
 * Actualiza una comida específica (ej: cambiar hora estimada o marcar como completado).
 * Realiza una actualización optimista en la UI.
 */
export const updateMeal = (mealId: string, updates: Partial<Meal>) => {
  const current = dailyScheduleStore.get();
  const index = current.meals.findIndex(m => m.id === mealId);
  if (index !== -1) {
    const newMeals = [...current.meals];
    newMeals[index] = { ...newMeals[index], ...updates };
    dailyScheduleStore.set({ ...current, meals: newMeals });
  }
};

/**
 * Actualiza un entrenamiento específico.
 */
export const updateWorkout = (workoutId: string, updates: Partial<Workout>) => {
  const current = dailyScheduleStore.get();
  const index = current.workouts.findIndex(w => w.id === workoutId);
  if (index !== -1) {
    const newWorkouts = [...current.workouts];
    newWorkouts[index] = { ...newWorkouts[index], ...updates };
    dailyScheduleStore.set({ ...current, workouts: newWorkouts });
  }
};
