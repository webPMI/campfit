import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';
import type { Diet } from './dietService';
import type { Workout } from '../trainer/types';
import { hydrateDiet, hydrateWorkout } from '@/lib/shared/hydrationService';
import { STARTER_WORKOUT_PROGRAMS, convertStarterToClientWorkout } from './starterWorkouts';

/**
 * 🔒 CRÍTICO: Servicio para obtener la agenda diaria combinada del cliente.
 * Combina la dieta y la rutina más reciente hidratadas dinámicamente con el catálogo central.
 * Si el cliente no tiene entrenador asignado aún, utiliza automáticamente el Starter Workout activo
 * y un plan nutricional equilibrado para garantizar una experiencia 100% activa.
 */
export function subscribeToDailySchedule(
  clientId: string,
  callback: (schedule: { diets: Diet[]; workouts: Workout[] }) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!clientId) {
    callback({ diets: [], workouts: [] });
    return () => {};
  }

  let diets: Diet[] = [];
  let workouts: Workout[] = [];

  const emitSchedule = () => {
    // Determinar día de la semana (1 = Lunes, ..., 7 = Domingo)
    const currentDayOfWeek = new Date().getDay() || 7;

    // 🔒 CRÍTICO: Modo Autonomía Fallback para Workouts si no hay entrenador asignado
    let activeWorkouts = workouts;
    if (activeWorkouts.length === 0) {
      const savedProgramId = typeof window !== 'undefined' && typeof localStorage !== 'undefined'
        ? localStorage.getItem(`cf_starter_${clientId}`)
        : null;
      const selectedProgram = STARTER_WORKOUT_PROGRAMS.find((p) => p.id === savedProgramId) || STARTER_WORKOUT_PROGRAMS[0];
      if (selectedProgram) {
        activeWorkouts = [convertStarterToClientWorkout(selectedProgram, clientId) as unknown as Workout];
      }
    }

    // 🔒 CRÍTICO: Modo Autonomía Fallback para Diets si no hay dieta asignada
    let activeDiets = diets;
    if (activeDiets.length === 0) {
      activeDiets = [
        {
          id: 'autonomous-diet-plan',
          clientId,
          trainerId: 'autonomous-system',
          name: 'Plan Nutricional Equilibrado & Saludable',
          description: 'Estructura balanceada de 4 comidas para energía constante y recuperación muscular.',
          totalCalories: 2200,
          macros: { protein: 140, carbs: 240, fat: 65 },
          meals: [
            {
              id: 'm-autonomy-1',
              name: 'Desayuno Energético',
              estimatedTime: '08:30',
              calories: 550,
              protein: 30,
              carbs: 65,
              fat: 18,
              foods: [{ name: 'Avena con leche desnatada y frutos secos', amount: '80g avena + 250ml leche', calories: 420 }],
            },
            {
              id: 'm-autonomy-2',
              name: 'Almuerzo Equilibrado',
              estimatedTime: '13:30',
              calories: 750,
              protein: 45,
              carbs: 85,
              fat: 22,
              foods: [{ name: 'Pechuga de pollo con arroz integral y verduras salteadas', amount: '180g pollo + 100g arroz', calories: 620 }],
            },
            {
              id: 'm-autonomy-3',
              name: 'Merienda Proteica',
              estimatedTime: '17:30',
              calories: 350,
              protein: 25,
              carbs: 35,
              fat: 10,
              foods: [{ name: 'Yogur griego con plátano y nueces', amount: '200g yogur + 1 plátano', calories: 310 }],
            },
            {
              id: 'm-autonomy-4',
              name: 'Cena Ligera & Reparadora',
              estimatedTime: '21:00',
              calories: 550,
              protein: 40,
              carbs: 55,
              fat: 15,
              foods: [{ name: 'Salmón o Merluza al horno con patata asada y ensalada', amount: '180g pescado + 150g patata', calories: 510 }],
            },
          ],
          createdAt: null as any,
          updatedAt: null as any,
        } as unknown as Diet,
      ];
    }

    const hydratedDiets = activeDiets.map((d) => hydrateDiet(d, 'es', { targetDayIndex: currentDayOfWeek }) as any);
    const hydratedWorkouts = activeWorkouts.map(
      (w) => hydrateWorkout(w as any, 'es', { targetDayIndex: currentDayOfWeek }) as any,
    );

    callback({ diets: hydratedDiets, workouts: hydratedWorkouts });
  };

  // Suscripción a la dieta más reciente
  const unsubDiets = onSnapshot(
    query(collection(db, 'diets'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'), limit(1)),
    (snapshot) => {
      diets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Diet);
      emitSchedule();
    },
    (error) => {
      logger.error('DailySchedule', 'Error suscripción dietas:', error);
      if (onError) onError(error);
      emitSchedule();
    },
  );

  // Suscripción a la rutina más reciente
  const unsubWorkouts = onSnapshot(
    query(collection(db, 'workouts'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'), limit(1)),
    (snapshot) => {
      workouts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Workout);
      emitSchedule();
    },
    (error) => {
      logger.error('DailySchedule', 'Error suscripción rutinas:', error);
      if (onError) onError(error);
      emitSchedule();
    },
  );

  return () => {
    unsubDiets();
    unsubWorkouts();
  };
}
