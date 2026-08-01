/**
 * Servicio de Despliegue y Purga de Plantillas Semilla (DevTools).
 * Permite a los administradores generar y limpiar colecciones semilla en Firestore.
 *
 * @module devtools/seedService
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SEED_EXERCISES, SEED_MEALS, SEED_DIETS, SEED_WORKOUTS } from './seedData';
import type { DevToolsStats } from './types';

const COLLECTIONS = {
  EXERCISES: 'exercise_templates',
  MEALS: 'meal_templates',
  DIETS: 'diet_templates',
  WORKOUTS: 'workout_templates',
};

/**
 * Despliega las plantillas de ejercicios en Firestore.
 */
export async function seedExerciseTemplates(): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;

  for (const item of SEED_EXERCISES) {
    const docRef = doc(collection(db, COLLECTIONS.EXERCISES));
    batch.set(docRef, {
      ...item,
      id: docRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    count++;
  }

  await batch.commit();
  return count;
}

/**
 * Despliega las plantillas de comidas en Firestore.
 */
export async function seedMealTemplates(): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;

  for (const item of SEED_MEALS) {
    const docRef = doc(collection(db, COLLECTIONS.MEALS));
    batch.set(docRef, {
      ...item,
      id: docRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    count++;
  }

  await batch.commit();
  return count;
}

/**
 * Despliega las plantillas de dietas en Firestore.
 */
export async function seedDietTemplates(): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;

  for (const item of SEED_DIETS) {
    const docRef = doc(collection(db, COLLECTIONS.DIETS));
    batch.set(docRef, {
      ...item,
      id: docRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    count++;
  }

  await batch.commit();
  return count;
}

/**
 * Despliega las plantillas de rutinas en Firestore.
 */
export async function seedWorkoutTemplates(): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;

  for (const item of SEED_WORKOUTS) {
    const docRef = doc(collection(db, COLLECTIONS.WORKOUTS));
    batch.set(docRef, {
      ...item,
      id: docRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    count++;
  }

  await batch.commit();
  return count;
}

/**
 * Despliega TODAS las plantillas semilla (Ejercicios, Comidas, Dietas y Rutinas).
 */
export async function seedAllTemplates(): Promise<{
  exercises: number;
  meals: number;
  diets: number;
  workouts: number;
  total: number;
}> {
  const [exercises, meals, diets, workouts] = await Promise.all([
    seedExerciseTemplates(),
    seedMealTemplates(),
    seedDietTemplates(),
    seedWorkoutTemplates(),
  ]);

  return {
    exercises,
    meals,
    diets,
    workouts,
    total: exercises + meals + diets + workouts,
  };
}

/**
 * Elimina de Firestore todas las plantillas marcadas con isPreset: true.
 */
export async function purgeTemplates(): Promise<number> {
  let deletedCount = 0;

  for (const collName of Object.values(COLLECTIONS)) {
    const q = query(collection(db, collName), where('isPreset', '==', true));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => {
        batch.delete(d.ref);
        deletedCount++;
      });
      await batch.commit();
    }
  }

  return deletedCount;
}

/**
 * Obtiene las estadísticas actuales de plantillas desplegadas.
 */
export async function getTemplateStats(): Promise<DevToolsStats> {
  try {
    const [exSnap, mealSnap, dietSnap, workSnap] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.EXERCISES)),
      getDocs(collection(db, COLLECTIONS.MEALS)),
      getDocs(collection(db, COLLECTIONS.DIETS)),
      getDocs(collection(db, COLLECTIONS.WORKOUTS)),
    ]);

    return {
      exerciseTemplatesCount: exSnap.size,
      mealTemplatesCount: mealSnap.size,
      dietTemplatesCount: dietSnap.size,
      workoutTemplatesCount: workSnap.size,
      lastSeededAt: Date.now(),
    };
  } catch (error) {
    throw new Error(`Permisos insuficientes o error de Firestore: ${(error as Error).message}`);
  }
}
