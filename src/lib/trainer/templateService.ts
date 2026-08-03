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
 * 🔒 CRÍTICO: Verifica que un cliente esté asignado al trainer.
 * Sin esta verificación, cualquier trainer podría asignar plantillas a clientes de otros trainers.
 * @param clientId - UID del cliente
 * @param trainerId - UID del trainer
 * @returns true si el cliente está asignado al trainer
 */
async function isClientAssignedToTrainer(clientId: string, trainerId: string): Promise<boolean> {
  try {
    const callerSnap = await getDoc(doc(db, 'users', trainerId));
    if (callerSnap.exists() && callerSnap.data().role === 'admin') return true;

    const clientSnap = await getDoc(doc(db, 'users', clientId));
    if (!clientSnap.exists()) return false;
    const data = clientSnap.data();
    return data.assignedTrainerId === trainerId;
  } catch (err) {
    logger.error('templateService', `Error verificando asignación de cliente ${clientId}:`, err);
    return false;
  }
}

import { seedDietTemplates, seedWorkoutTemplates } from '@/lib/devtools/seedService';

/**
 * Suscribirse a la lista de plantillas de dietas disponibles.
 */
export function subscribeToDietTemplates(
  callback: (templates: DietTemplate[]) => void,
): () => void {
  const q = collection(db, 'diet_templates');
  return onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          await seedDietTemplates();
        } catch (e) {
          logger.warn('templateService', 'Auto-seed diet templates error', e);
        }
      }
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
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          await seedWorkoutTemplates();
        } catch (e) {
          logger.warn('templateService', 'Auto-seed workout templates error', e);
        }
      }
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
  // 🔒 CRÍTICO: Valida ownership antes de clonar la plantilla.
  // Sin esto, un trainer podría asignar dietas a clientes que no son suyos.
  const isAssigned = await isClientAssignedToTrainer(clientId, trainerId);
  if (!isAssigned) {
    throw new Error('El cliente no está asignado a este entrenador.');
  }

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
  // 🔒 CRÍTICO: Valida ownership antes de clonar la plantilla.
  // Sin esto, un trainer podría asignar rutinas a clientes que no son suyos.
  const isAssigned = await isClientAssignedToTrainer(clientId, trainerId);
  if (!isAssigned) {
    throw new Error('El cliente no está asignado a este entrenador.');
  }

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
