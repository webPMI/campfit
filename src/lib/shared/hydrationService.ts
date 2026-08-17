/**
 * Motor de Hidratación Dinámica y Snapshots Inmutables — CampFit
 *
 * Resuelve y fusiona referencias de `foodId` y `exerciseId` con los catálogos
 * canónicos / Firestore. Provee estrategia de carga por día (Day Hydration)
 * y congelación de snapshots para asignaciones inmutables de clientes.
 *
 * @module shared/hydrationService
 */

import type { FoodItem } from '@/lib/shared/foodLibrary';
import { getFoodName } from '@/lib/shared/foodLibrary';
import { FOODS_MAP } from '@/lib/data/foodsCatalog';
import type { ExerciseItem } from '@/lib/shared/exerciseLibrary';
import { getExerciseName } from '@/lib/shared/exerciseLibrary';
import { EXERCISES_MAP } from '@/lib/data/exercisesCatalog';
import type { Meal, Diet } from '@/lib/client/dietService';
import type { Workout } from '@/lib/client/workoutService';

export type SupportedLanguage = 'es' | 'en' | 'ca';

export interface HydratedMeal extends Meal {
  displayName: string;
  foodDetails?: FoodItem;
  resolvedAllergens: string[];
  suggestedSubstitutes: string[];
  imageUrl?: string;
  isCustomMeal: boolean;
  dayOfWeek?: number;
}

export interface HydratedDiet extends Omit<Diet, 'meals'> {
  meals: HydratedMeal[];
  dayMeals?: Record<number, HydratedMeal[]>;
  totalHydratedCalories: number;
  totalHydratedProtein: number;
  totalHydratedCarbs: number;
  totalHydratedFat: number;
}

export interface HydratedExercise {
  id?: string;
  exerciseId?: string;
  name: string;
  displayName: string;
  sets: number;
  reps: number;
  restTime: string;
  duration?: number;
  day?: number;
  dayOfWeek?: number;
  order?: number;
  notes?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  instructionsUrl?: string;
  muscleGroups: string[];
  secondaryMuscles: string[];
  equipment: string[];
  difficulty?: string;
  difficultyLevel?: number;
  contraindications: string[];
  isCustomExercise: boolean;
}

export interface HydratedWorkout extends Omit<Workout, 'exercises'> {
  exercises: HydratedExercise[];
  dayExercises?: Record<number, HydratedExercise[]>;
}

/**
 * Hidrata una comida individual vinculándola a su FoodItem correspondiente.
 */
export function hydrateMeal(
  meal: Partial<Meal>,
  foodsMap: Map<string, FoodItem> = FOODS_MAP,
  lang: SupportedLanguage = 'es',
): HydratedMeal {
  const foodId = meal.foodId || meal.id || '';
  const food = foodsMap.get(foodId);

  const isCustomMeal = !food;
  const displayName = food ? getFoodName(food, lang) : (meal.description || meal.name || 'Comida');
  const resolvedAllergens = Array.from(new Set([...(meal.allergens || []), ...(food?.allergens || [])]));
  const suggestedSubstitutes = food?.substitutes || [];

  return {
    id: meal.id || foodId || `meal-${Math.random().toString(36).substring(2, 8)}`,
    name: meal.name || 'other',
    description: displayName,
    displayName,
    foodId: food?.id || meal.foodId,
    portionGrams: meal.portionGrams || food?.defaultPortion || 100,
    calories: meal.calories !== undefined ? meal.calories : (food?.defaultCalories || 0),
    protein: meal.protein !== undefined ? meal.protein : (food?.defaultProtein || 0),
    carbs: meal.carbs !== undefined ? meal.carbs : (food?.defaultCarbs || 0),
    fat: meal.fat !== undefined ? meal.fat : (food?.defaultFat || 0),
    order: meal.order || 0,
    allergens: resolvedAllergens,
    resolvedAllergens,
    suggestedSubstitutes,
    foodDetails: food,
    imageUrl: food?.imageUrl || (meal as any)?.imageUrl,
    isCustomMeal,
    dayOfWeek: (meal as any)?.dayOfWeek,
    estimatedTime: meal.estimatedTime ?? null,
    isCompleted: meal.isCompleted ?? false,
    completionTime: meal.completionTime ?? null,
  };
}

/**
 * Hidrata una dieta completa o únicamente un día específico (Day Hydration Strategy).
 */
export function hydrateDiet(
  diet: Diet,
  lang: SupportedLanguage = 'es',
  options?: { targetDayIndex?: number; foodsMap?: Map<string, FoodItem> },
): HydratedDiet {
  const foodsMap = options?.foodsMap || FOODS_MAP;
  let rawMeals = diet.meals || [];

  // Filtrado por día si se especifica targetDayIndex
  if (options?.targetDayIndex !== undefined) {
    rawMeals = rawMeals.filter(
      (m) => (m as any).dayOfWeek === options.targetDayIndex || (m as any).dayOfWeek === undefined,
    );
  }

  const hydratedMeals = rawMeals.map((m) => hydrateMeal(m, foodsMap, lang));

  let totalCal = 0;
  let totalPro = 0;
  let totalCarb = 0;
  let totalFat = 0;

  const dayMeals: Record<number, HydratedMeal[]> = {};

  for (const m of hydratedMeals) {
    totalCal += m.calories || 0;
    totalPro += m.protein || 0;
    totalCarb += m.carbs || 0;
    totalFat += m.fat || 0;

    const dayKey = m.dayOfWeek ?? 1;
    if (!dayMeals[dayKey]) dayMeals[dayKey] = [];
    dayMeals[dayKey].push(m);
  }

  return {
    ...diet,
    meals: hydratedMeals,
    dayMeals,
    totalHydratedCalories: Math.round(totalCal),
    totalHydratedProtein: Math.round(totalPro * 10) / 10,
    totalHydratedCarbs: Math.round(totalCarb * 10) / 10,
    totalHydratedFat: Math.round(totalFat * 10) / 10,
  };
}

/**
 * Hidrata un ejercicio individual vinculándolo a su ExerciseItem correspondiente.
 */
export function hydrateWorkoutExercise(
  exercise: {
    id?: string;
    exerciseId?: string;
    name?: string;
    sets?: number;
    reps?: number;
    restTime?: string;
    duration?: number;
    day?: number;
    dayOfWeek?: number;
    order?: number;
    notes?: string;
    videoUrl?: string;
  },
  exercisesMap: Map<string, ExerciseItem> = EXERCISES_MAP,
  lang: SupportedLanguage = 'es',
): HydratedExercise {
  const exId = exercise.exerciseId || exercise.id || '';
  const exItem = exercisesMap.get(exId);

  const isCustomExercise = !exItem;
  const displayName = exItem ? getExerciseName(exItem, lang) : (exercise.name || 'Ejercicio');

  return {
    id: exercise.id || exId,
    exerciseId: exItem?.id || exercise.exerciseId,
    name: exercise.name || exItem?.translations?.es || displayName,
    displayName,
    sets: exercise.sets || exItem?.defaultSets || 3,
    reps: exercise.reps || exItem?.defaultReps || 10,
    restTime: exercise.restTime || (exItem?.defaultRestSeconds ? `${exItem.defaultRestSeconds}s` : '90s'),
    duration: exercise.duration || exItem?.defaultDurationSeconds,
    day: exercise.day,
    dayOfWeek: exercise.dayOfWeek,
    order: exercise.order,
    notes: exercise.notes,
    videoUrl: exercise.videoUrl || exItem?.videoUrl || '',
    thumbnailUrl: exItem?.thumbnailUrl || '',
    instructionsUrl: exItem?.instructionsUrl || '',
    muscleGroups: exItem?.muscleGroups || [],
    secondaryMuscles: exItem?.secondaryMuscles || [],
    equipment: exItem?.equipment || [],
    difficulty: exItem?.difficulty || 'beginner',
    difficultyLevel: (exItem as any)?.difficultyLevel ?? 2,
    contraindications: exItem?.contraindications || [],
    isCustomExercise,
  };
}

/**
 * Hidrata una rutina completa o por día específico.
 */
export function hydrateWorkout(
  workout: Workout,
  lang: SupportedLanguage = 'es',
  options?: { targetDayIndex?: number; exercisesMap?: Map<string, ExerciseItem> },
): HydratedWorkout {
  const exercisesMap = options?.exercisesMap || EXERCISES_MAP;
  let rawExercises = (workout.exercises || []) as any[];

  if (options?.targetDayIndex !== undefined) {
    const hasExplicitDays = rawExercises.some((e) => e.day !== undefined || e.dayOfWeek !== undefined);
    if (hasExplicitDays) {
      const matching = rawExercises.filter((e) => e.day === options.targetDayIndex || e.dayOfWeek === options.targetDayIndex);
      if (matching.length > 0) {
        rawExercises = matching;
      }
    }
  }

  const hydratedExercises = rawExercises.map((e) => hydrateWorkoutExercise(e, exercisesMap, lang));

  const dayExercises: Record<number, HydratedExercise[]> = {};
  for (const ex of hydratedExercises) {
    const dKey = ex.day ?? ex.dayOfWeek ?? 1;
    if (!dayExercises[dKey]) dayExercises[dKey] = [];
    dayExercises[dKey].push(ex);
  }

  return {
    ...workout,
    exercises: hydratedExercises as any,
    dayExercises,
  };
}

/**
 * Genera un Snapshot inmutable de una dieta para asignación a cliente.
 * Congela los valores calculados de macros y nombres para preservar el registro histórico.
 */
export function createDietSnapshot(diet: Diet): Diet {
  const hydrated = hydrateDiet(diet, 'es');
  return {
    ...diet,
    totalCalories: hydrated.totalHydratedCalories,
    meals: hydrated.meals.map((m) => ({
      id: m.id,
      foodId: m.foodId,
      name: m.name,
      description: m.displayName,
      portionGrams: m.portionGrams,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      order: m.order,
      allergens: m.resolvedAllergens,
      dayOfWeek: m.dayOfWeek,
      imageUrl: m.imageUrl,
      estimatedTime: m.estimatedTime ?? null,
      isCompleted: m.isCompleted ?? false,
      completionTime: m.completionTime ?? null,
    })),
  };
}

/**
 * Genera un Snapshot inmutable de una rutina para asignación a cliente.
 */
export function createWorkoutSnapshot(workout: Workout): Workout {
  const hydrated = hydrateWorkout(workout, 'es');
  return {
    ...workout,
    exercises: hydrated.exercises.map((e) => ({
      id: e.id,
      exerciseId: e.exerciseId,
      name: e.displayName,
      sets: e.sets,
      reps: e.reps,
      restTime: e.restTime,
      videoUrl: e.videoUrl,
      day: e.day,
      dayOfWeek: e.dayOfWeek,
      notes: e.notes,
    })) as any,
  };
}
