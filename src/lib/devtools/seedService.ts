import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SEED_EXERCISES, SEED_MEALS, SEED_DIETS, SEED_WORKOUTS } from './seedData';
import type { DevToolsStats, SeedDeploymentRecord } from './types';

const COLLECTIONS = {
  EXERCISES: 'exercise_templates',
  MEALS: 'meal_templates',
  DIETS: 'diet_templates',
  WORKOUTS: 'workout_templates',
};

const SEED_DEPLOYMENTS_COLL = 'seed_deployments';
const SEED_VERSION = 1;

/**
 * Genera un ID determinista a partir del nombre del item.
 * Así cada nombre único tiene su propio documento y no se crean duplicados
 * al volver a "desplegar" — se reemplaza el existente.
 */
function itemDocId(name: string): string {
  // Hash simple: primeros 20 chars del nombre en minúsculas (los nombres son descriptivos y únicos)
  return name.toLowerCase().slice(0, 48).replace(/\s+/g, '-');
}

/**
 * Despliega las plantillas de ejercicios en Firestore.
 * Idempotente: cada ejercicio se guarda bajo su nombre como ID.
 */
export async function seedExerciseTemplates(): Promise<{ created: number; skipped: number }> {
  const collRef = collection(db, COLLECTIONS.EXERCISES);
  const snap = await getDocs(collRef);
  const existingMap = new Set(snap.docs.map((d) => d.id));

  const batch = writeBatch(db);
  let created = 0;
  let skipped = 0;

  for (const item of SEED_EXERCISES) {
    const docId = itemDocId(item.name);
    const docRef = doc(db, COLLECTIONS.EXERCISES, docId);

    if (existingMap.has(docId)) {
      skipped++;
      batch.set(docRef, {
        ...item,
        id: docId,
        isPreset: true,
        version: 1,
        source: 'system',
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } else {
      batch.set(docRef, {
        ...item,
        id: docId,
        isPreset: true,
        version: 1,
        source: 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      created++;
    }
  }

  await batch.commit();
  return { created, skipped };
}

export async function seedMealTemplates(): Promise<{ created: number; skipped: number }> {
  const collRef = collection(db, COLLECTIONS.MEALS);
  const snap = await getDocs(collRef);
  const existingMap = new Set(snap.docs.map((d) => d.id));

  const batch = writeBatch(db);
  let created = 0;
  let skipped = 0;

  for (const item of SEED_MEALS) {
    const docId = itemDocId(item.name);
    const docRef = doc(db, COLLECTIONS.MEALS, docId);

    if (existingMap.has(docId)) {
      skipped++;
      batch.set(docRef, {
        ...item,
        id: docId,
        isPreset: true,
        version: 1,
        source: 'system',
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } else {
      batch.set(docRef, {
        ...item,
        id: docId,
        isPreset: true,
        version: 1,
        source: 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      created++;
    }
  }

  await batch.commit();
  return { created, skipped };
}

export async function seedDietTemplates(): Promise<{ created: number; skipped: number }> {
  const collRef = collection(db, COLLECTIONS.DIETS);
  const snap = await getDocs(collRef);
  const existingMap = new Set(snap.docs.map((d) => d.id));

  const batch = writeBatch(db);
  let created = 0;
  let skipped = 0;

  for (const item of SEED_DIETS) {
    const docId = itemDocId(item.name);
    const docRef = doc(db, COLLECTIONS.DIETS, docId);

    if (existingMap.has(docId)) {
      skipped++;
      batch.set(docRef, {
        ...item,
        id: docId,
        isPreset: true,
        version: 1,
        source: 'system',
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } else {
      batch.set(docRef, {
        ...item,
        id: docId,
        isPreset: true,
        version: 1,
        source: 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      created++;
    }
  }

  await batch.commit();
  return { created, skipped };
}

export async function seedWorkoutTemplates(): Promise<{ created: number; skipped: number }> {
  const collRef = collection(db, COLLECTIONS.WORKOUTS);
  const snap = await getDocs(collRef);
  const existingMap = new Set(snap.docs.map((d) => d.id));

  const batch = writeBatch(db);
  let created = 0;
  let skipped = 0;

  for (const item of SEED_WORKOUTS) {
    const docId = itemDocId(item.name);
    const docRef = doc(db, COLLECTIONS.WORKOUTS, docId);

    if (existingMap.has(docId)) {
      skipped++;
      batch.set(docRef, {
        ...item,
        id: docId,
        isPreset: true,
        version: 1,
        source: 'system',
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } else {
      batch.set(docRef, {
        ...item,
        id: docId,
        isPreset: true,
        version: 1,
        source: 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      created++;
    }
  }

  await batch.commit();
  return { created, skipped };
}

/**
 * Despliega TODAS las plantillas semilla.
 * Registra el despliegue en seed_deployments para auditoría.
 */
export async function seedAllTemplates(): Promise<{
  exercises: { created: number; skipped: number };
  meals: { created: number; skipped: number };
  diets: { created: number; skipped: number };
  workouts: { created: number; skipped: number };
  totalCreated: number;
  totalSkipped: number;
}> {
  const [exercises, meals, diets, workouts] = await Promise.all([
    seedExerciseTemplates(),
    seedMealTemplates(),
    seedDietTemplates(),
    seedWorkoutTemplates(),
  ]);

  const totalCreated = exercises.created + meals.created + diets.created + workouts.created;
  const totalSkipped = exercises.skipped + meals.skipped + diets.skipped + workouts.skipped;

  // Registrar este despliegue para auditoría
  await recordSeedDeployment({
    version: SEED_VERSION,
    exercises: exercises.created + exercises.skipped,
    meals: meals.created + meals.skipped,
    diets: diets.created + diets.skipped,
    workouts: workouts.created + workouts.skipped,
    total: totalCreated + totalSkipped,
    created: totalCreated,
    skipped: totalSkipped,
  });

  return {
    exercises,
    meals,
    diets,
    workouts,
    totalCreated,
    totalSkipped,
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
 * Obtiene las estadísticas actuales de plantillas desplegadas (solo presets).
 */
export async function getTemplateStats(): Promise<DevToolsStats> {
  try {
    const [exSnap, mealSnap, dietSnap, workSnap] = await Promise.all([
      getDocs(query(collection(db, COLLECTIONS.EXERCISES), where('isPreset', '==', true))),
      getDocs(query(collection(db, COLLECTIONS.MEALS), where('isPreset', '==', true))),
      getDocs(query(collection(db, COLLECTIONS.DIETS), where('isPreset', '==', true))),
      getDocs(query(collection(db, COLLECTIONS.WORKOUTS), where('isPreset', '==', true))),
    ]);

    return {
      exerciseTemplatesCount: exSnap.size,
      mealTemplatesCount: mealSnap.size,
      dietTemplatesCount: dietSnap.size,
      workoutTemplatesCount: workSnap.size,
      lastSeededAt: Date.now(),
      seedVersion: SEED_VERSION,
    };
  } catch (error) {
    throw new Error(`Permisos insuficientes o error de Firestore: ${(error as Error).message}`);
  }
}

/**
 * Registra un despliegue de seed en la colección seed_deployments.
 * Sirve para auditoría: saber cuándo se desplegó, cuántos items, y ver histórico.
 */
async function recordSeedDeployment(record: {
  version: number;
  exercises: number;
  meals: number;
  diets: number;
  workouts: number;
  total: number;
  created: number;
  skipped: number;
}): Promise<void> {
  const deploymentsRef = collection(db, SEED_DEPLOYMENTS_COLL);
  const docRef = doc(deploymentsRef);
  await setDoc(docRef, {
    ...record,
    deployedAt: serverTimestamp(),
    timestamp: Timestamp.now(),
  });
}
