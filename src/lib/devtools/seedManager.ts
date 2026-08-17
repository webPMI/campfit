/**
 * Gestor Inteligente de Sincronización y Semillas — CampFit
 *
 * @module devtools/seedManager
 */

import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FOODS_CATALOG } from '@/lib/data/foodsCatalog';
import { EXERCISES_CATALOG } from '@/lib/data/exercisesCatalog';
import { validateFoodItem, validateExerciseItem, type ValidationIssue } from '@/lib/data/foodValidators';
import type { FoodItem } from '@/lib/shared/foodLibrary';
import type { ExerciseItem } from '@/lib/shared/exerciseLibrary';

export interface SeedManagerConfig {
  collectionName: string;
  itemNameField: string;
  hashField: string;
}

export function computeItemHash<T extends object>(
  item: T,
  fields: (keyof T)[] = Object.keys(item as object) as (keyof T)[],
): string {
  const values = fields
    .map((f) => {
      const val = (item as any)[f];
      return typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '');
    })
    .join('|');
  return `h_${Buffer.from(values).toString('base64')}`;
}

export interface SyncResult {
  created: number;
  updated: number;
  total: number;
  skipped: number;
}

export interface GlobalSyncReport {
  durationMs: number;
  foodsReport: SyncResult;
  exercisesReport: SyncResult;
}

export interface BatchValidationResult<T> {
  total: number;
  validCount: number;
  invalidCount: number;
  errors: Array<{ id: string; name?: string; issues: ValidationIssue[] }>;
}

/**
 * Valida un lote de alimentos para el área de staging.
 */
export function validateFoodsBatch(items: FoodItem[]): BatchValidationResult<FoodItem> {
  let validCount = 0;
  let invalidCount = 0;
  const errors: Array<{ id: string; name?: string; issues: ValidationIssue[] }> = [];

  for (const food of items) {
    const val = validateFoodItem(food);
    if (val.isValid) {
      validCount++;
    } else {
      invalidCount++;
      errors.push({
        id: food.id || 'unknown',
        name: food.translations?.es || food.id,
        issues: val.issues,
      });
    }
  }

  return {
    total: items.length,
    validCount,
    invalidCount,
    errors,
  };
}

/**
 * Valida un lote de ejercicios para el área de staging.
 */
export function validateExercisesBatch(items: ExerciseItem[]): BatchValidationResult<ExerciseItem> {
  let validCount = 0;
  let invalidCount = 0;
  const errors: Array<{ id: string; name?: string; issues: ValidationIssue[] }> = [];

  for (const ex of items) {
    const val = validateExerciseItem(ex);
    if (val.isValid) {
      validCount++;
    } else {
      invalidCount++;
      errors.push({
        id: ex.id || 'unknown',
        name: ex.translations?.es || ex.id,
        issues: val.issues,
      });
    }
  }

  return {
    total: items.length,
    validCount,
    invalidCount,
    errors,
  };
}

/**
 * Upsert idempotente de biblioteca de alimentos.
 */
export async function upsertFoodsLibrary(
  items: FoodItem[] = FOODS_CATALOG,
  opts?: { force?: boolean },
): Promise<SyncResult> {
  const collRef = collection(db, 'foods_library');
  const snap = await getDocs(collRef);
  const existingIds = new Set(snap.docs.map((d) => d.id));

  const batch = writeBatch(db);
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of items) {
    const docRef = doc(db, 'foods_library', item.id);
    if (existingIds.has(item.id)) {
      if (opts?.force !== false) {
        updated++;
        batch.set(docRef, { ...item, isActive: true }, { merge: true });
      } else {
        skipped++;
      }
    } else {
      created++;
      batch.set(docRef, { ...item, isActive: true }, { merge: true });
    }
  }

  await batch.commit();
  return { created, updated, total: items.length, skipped };
}

/**
 * Upsert idempotente de biblioteca de ejercicios.
 */
export async function upsertExercisesLibrary(
  items: ExerciseItem[] = EXERCISES_CATALOG,
  opts?: { force?: boolean },
): Promise<SyncResult> {
  const collRef = collection(db, 'exercises_library');
  const snap = await getDocs(collRef);
  const existingIds = new Set(snap.docs.map((d) => d.id));

  const batch = writeBatch(db);
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of items) {
    const docRef = doc(db, 'exercises_library', item.id);
    if (existingIds.has(item.id)) {
      if (opts?.force !== false) {
        updated++;
        batch.set(docRef, { ...item, isActive: true }, { merge: true });
      } else {
        skipped++;
      }
    } else {
      created++;
      batch.set(docRef, { ...item, isActive: true }, { merge: true });
    }
  }

  await batch.commit();
  return { created, updated, total: items.length, skipped };
}

/**
 * Sincroniza todas las bibliotecas canónicas maestras a Firestore.
 */
export async function syncAllLibraries(): Promise<GlobalSyncReport> {
  const startTime = Date.now();
  const foodsReport = await upsertFoodsLibrary();
  const exercisesReport = await upsertExercisesLibrary();
  const durationMs = Date.now() - startTime;
  return { durationMs, foodsReport, exercisesReport };
}
