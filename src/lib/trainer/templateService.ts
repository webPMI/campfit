/**
 * Servicio de consumo de plantillas para Entrenadores.
 * Permite a los entrenadores consultar plantillas de dietas/rutinas y asignarlas a sus clientes.
 *
 * @module trainer/templateService
 */

import { logger } from '@/lib/shared/logger';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DietTemplate, WorkoutTemplate } from '@/lib/devtools/types';

/**
 * Suscribirse a la lista de plantillas de dietas disponibles.
 */
export function subscribeToDietTemplates(
  callback: (templates: DietTemplate[]) => void,
): () => void {
  const q = collection(db, 'diet_templates');
  return onSnapshot(
    q,
    (snapshot) => {
      const templates = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as DietTemplate[];
      callback(templates);
    },
    (err) => {
      logger.warn('templateService', `subscribeToDietTemplates error: ${err.message}`);
      callback([]);
    },
  );
}

/**
 * Suscribirse a la lista de plantillas de rutinas disponibles.
 */
export function subscribeToWorkoutTemplates(
  callback: (templates: WorkoutTemplate[]) => void,
): () => void {
  const q = collection(db, 'workout_templates');
  return onSnapshot(
    q,
    (snapshot) => {
      const templates = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as WorkoutTemplate[];
      callback(templates);
    },
    (err) => {
      logger.warn('templateService', `subscribeToWorkoutTemplates error: ${err.message}`);
      callback([]);
    },
  );
}

/**
 * Aplica / Clona una dieta plantilla para un cliente específico.
 */
export async function applyDietTemplateToClient(
  templateId: string,
  clientId: string,
  trainerId: string,
): Promise<string> {
  const templateRef = doc(db, 'diet_templates', templateId);
  const templateSnap = await getDoc(templateRef);

  if (!templateSnap.exists()) {
    throw new Error('La plantilla de dieta especificada no existe.');
  }

  const data = templateSnap.data() as DietTemplate;

  const newDiet = {
    clientId,
    trainerId,
    name: data.name,
    type: data.type || 'normal',
    somatotype: data.somatotype || 'mesomorph',
    totalCalories: data.totalCalories || 2000,
    meals: data.meals || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const dietRef = await addDoc(collection(db, 'diets'), newDiet);
  return dietRef.id;
}

/**
 * Aplica / Clona una rutina plantilla para un cliente específico.
 */
export async function applyWorkoutTemplateToClient(
  templateId: string,
  clientId: string,
  trainerId: string,
): Promise<string> {
  const templateRef = doc(db, 'workout_templates', templateId);
  const templateSnap = await getDoc(templateRef);

  if (!templateSnap.exists()) {
    throw new Error('La plantilla de rutina especificada no existe.');
  }

  const data = templateSnap.data() as WorkoutTemplate;

  const newWorkout = {
    clientId,
    trainerId,
    name: data.name,
    difficulty: data.difficulty || 'beginner',
    description: data.description || '',
    exercises: data.exercises || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const workoutRef = await addDoc(collection(db, 'workouts'), newWorkout);
  return workoutRef.id;
}
