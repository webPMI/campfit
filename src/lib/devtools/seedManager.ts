/**
 * Gestor Inteligente de Semillas y Gestión de Activos — CampFit
 *
 * Provee:
 * 1. Idempotencia y prevención de duplicidad con hash determinista de contenido.
 * 2. Área de Staging & Pre-Validación para evitar despliegues con errores.
 * 3. Upsert Inteligente (Update or Insert) en Firestore.
 * 4. Trazabilidad con versionado y Soft Delete seguro.
 *
 * @module devtools/seedManager
 */

import {
  collection,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';
import { FOODS_CATALOG } from '@/lib/data/foodsCatalog';
import { EXERCISES_CATALOG } from '@/lib/data/exercisesCatalog';
import { validateFoodItem, validateExerciseItem } from '@/lib/data/foodValidators';
import type { FoodItem } from '@/lib/shared/foodLibrary';
import type { ExerciseItem } from '@/lib/shared/exerciseLibrary';
import { invalidateFoodsCache } from '@/lib/shared/foodLibrary';
import { invalidateExercisesCache } from '@/lib/shared/exerciseLibrary';

export interface BatchValidationResult {
  total: number;
  validCount: number;
  invalidCount: number;
  errors: Array<{ id: string; name: string; issues: string[] }>;
}

export interface SyncReport {
  collection: string;
  totalCandidates: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  timestamp: number;
}

export interface GlobalSyncResult {
  success: boolean;
  foodsReport: SyncReport;
  exercisesReport: SyncReport;
  durationMs: number;
}

/**
 * Calcula un Hash determinista de contenido para un alimento o ejercicio.
 */
export function computeItemHash(item: Record<string, any>): string {
  // Extraer claves significativas ignorando timestamps y flags transitorios
  const payload = {
    id: item.id,
    translations: item.translations,
    category: item.category,
    // Macros si es alimento
    cal100: item.calories100g,
    p100: item.protein100g,
    c100: item.carbs100g,
    f100: item.fat100g,
    portion: item.defaultPortion,
    allergens: Array.isArray(item.allergens) ? [...item.allergens].sort() : [],
    substitutes: Array.isArray(item.substitutes) ? [...item.substitutes].sort() : [],
    // Metadatos si es ejercicio
    muscles: Array.isArray(item.muscleGroups) ? [...item.muscleGroups].sort() : [],
    equipment: Array.isArray(item.equipment) ? [...item.equipment].sort() : [],
    difficulty: item.difficulty,
    difficultyLevel: item.difficultyLevel,
    video: item.videoUrl || '',
    contra: Array.isArray(item.contraindications) ? [...item.contraindications].sort() : [],
  };

  const str = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

/**
 * Pre-Valida un lote de alimentos en staging antes de escribir en Firestore.
 */
export function validateFoodsBatch(items: FoodItem[] = FOODS_CATALOG): BatchValidationResult {
  const errors: BatchValidationResult['errors'] = [];
  let validCount = 0;

  for (const item of items) {
    const res = validateFoodItem(item);
    if (!res.isValid) {
      errors.push({
        id: item.id,
        name: item.translations?.es || item.id,
        issues: res.issues.map((i) => `[${i.field}] ${i.message}`),
      });
    } else {
      validCount++;
    }
  }

  return {
    total: items.length,
    validCount,
    invalidCount: errors.length,
    errors,
  };
}

/**
 * Pre-Valida un lote de ejercicios en staging antes de escribir en Firestore.
 */
export function validateExercisesBatch(items: ExerciseItem[] = EXERCISES_CATALOG): BatchValidationResult {
  const errors: BatchValidationResult['errors'] = [];
  let validCount = 0;

  for (const item of items) {
    const res = validateExerciseItem(item);
    if (!res.isValid) {
      errors.push({
        id: item.id,
        name: item.translations?.es || item.id,
        issues: res.issues.map((i) => `[${i.field}] ${i.message}`),
      });
    } else {
      validCount++;
    }
  }

  return {
    total: items.length,
    validCount,
    invalidCount: errors.length,
    errors,
  };
}

/**
 * Realiza un Upsert Inteligente en la colección `foods_library`.
 * Compara los hashes de contenido para evitar escrituras redundantes.
 */
export async function upsertFoodsLibrary(
  items: FoodItem[] = FOODS_CATALOG,
  options: { force?: boolean } = {},
): Promise<SyncReport> {
  const validation = validateFoodsBatch(items);
  if (validation.invalidCount > 0 && !options.force) {
    throw new Error(
      `No se puede desplegar: ${validation.invalidCount} alimentos contienen errores de datos críticos.`,
    );
  }

  const collRef = collection(db, 'foods_library');
  const existingSnapshot = await getDocs(collRef);
  const existingMap = new Map<string, { hash?: string; version?: number }>();

  existingSnapshot.forEach((d) => {
    const data = d.data();
    existingMap.set(d.id, { hash: data._hash, version: data._version || 1 });
  });

  const batch = writeBatch(db);
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let batchCount = 0;
  const MAX_BATCH_OPS = 400;

  for (const item of items) {
    const itemHash = computeItemHash(item);
    const existing = existingMap.get(item.id);
    const docRef = doc(collRef, item.id);

    if (!existing) {
      // Documento Nuevo -> Insert
      batch.set(docRef, {
        ...item,
        isActive: true,
        _hash: itemHash,
        _version: 1,
        createdBy: 'system_catalog',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      created++;
      batchCount++;
    } else if (existing.hash !== itemHash || options.force) {
      // Documento Modificado -> Update inteligente
      batch.set(
        docRef,
        {
          ...item,
          isActive: true,
          _hash: itemHash,
          _version: (existing.version || 1) + 1,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      updated++;
      batchCount++;
    } else {
      // Idéntico -> Omitir escritura para ahorrar cuotas
      skipped++;
    }

    if (batchCount >= MAX_BATCH_OPS) {
      await batch.commit();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  invalidateFoodsCache();

  return {
    collection: 'foods_library',
    totalCandidates: items.length,
    created,
    updated,
    skipped,
    errors: 0,
    timestamp: Date.now(),
  };
}

/**
 * Realiza un Upsert Inteligente en la colección `exercises_library`.
 */
export async function upsertExercisesLibrary(
  items: ExerciseItem[] = EXERCISES_CATALOG,
  options: { force?: boolean } = {},
): Promise<SyncReport> {
  const validation = validateExercisesBatch(items);
  if (validation.invalidCount > 0 && !options.force) {
    throw new Error(
      `No se puede desplegar: ${validation.invalidCount} ejercicios contienen errores de validación.`,
    );
  }

  const collRef = collection(db, 'exercises_library');
  const existingSnapshot = await getDocs(collRef);
  const existingMap = new Map<string, { hash?: string; version?: number }>();

  existingSnapshot.forEach((d) => {
    const data = d.data();
    existingMap.set(d.id, { hash: data._hash, version: data._version || 1 });
  });

  const batch = writeBatch(db);
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let batchCount = 0;
  const MAX_BATCH_OPS = 400;

  for (const item of items) {
    const itemHash = computeItemHash(item);
    const existing = existingMap.get(item.id);
    const docRef = doc(collRef, item.id);

    if (!existing) {
      batch.set(docRef, {
        ...item,
        isActive: true,
        _hash: itemHash,
        _version: 1,
        createdBy: 'system_catalog',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      created++;
      batchCount++;
    } else if (existing.hash !== itemHash || options.force) {
      batch.set(
        docRef,
        {
          ...item,
          isActive: true,
          _hash: itemHash,
          _version: (existing.version || 1) + 1,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      updated++;
      batchCount++;
    } else {
      skipped++;
    }

    if (batchCount >= MAX_BATCH_OPS) {
      await batch.commit();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  invalidateExercisesCache();

  return {
    collection: 'exercises_library',
    totalCandidates: items.length,
    created,
    updated,
    skipped,
    errors: 0,
    timestamp: Date.now(),
  };
}

// ── Gestión de Lotes de Staging y Metadata de Semillas (metadata_seeds) ───────

export interface MetadataSeedBatch {
  id: string;
  type: 'food' | 'exercise';
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'deployed';
  items: any[];
  totalItems: number;
  validItems: number;
  invalidItems: number;
  duplicateCount: number;
  createdAt: any;
  approvedAt?: any;
  deployedAt?: any;
  executedBy: string;
}

/**
 * Crea un lote de semillas en el área de Staging (`metadata_seeds`) para revisión administrativa.
 */
export async function createStagingBatch(
  batch: { type: 'food' | 'exercise'; total: number; validCount: number; invalidCount: number; items: any[] },
  name: string = 'Lote de Importación',
  userId: string = 'admin',
): Promise<string> {
  const batchRef = doc(collection(db, 'metadata_seeds'));

  const payload: Omit<MetadataSeedBatch, 'id'> = {
    type: batch.type,
    name,
    status: 'pending',
    items: batch.items,
    totalItems: batch.total,
    validItems: batch.validCount,
    invalidItems: batch.invalidCount,
    duplicateCount: 0,
    createdAt: serverTimestamp(),
    executedBy: userId,
  };

  await setDoc(batchRef, payload);
  return batchRef.id;
}

/**
 * Obtiene los lotes pendientes de revisión en `metadata_seeds`.
 */
export async function getPendingBatches(): Promise<MetadataSeedBatch[]> {
  try {
    const q = query(
      collection(db, 'metadata_seeds'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as MetadataSeedBatch[];
  } catch (e) {
    logger.warn('seedManager', 'Error al consultar metadata_seeds pendientes:', e);
    return [];
  }
}

/**
 * Aprueba y despliega un lote de Staging a la base de datos de producción.
 */
export async function approveAndDeployStagingBatch(
  batchId: string,
  options: { updateDuplicates?: boolean; force?: boolean } = {},
): Promise<SyncReport> {
  const batchRef = doc(db, 'metadata_seeds', batchId);
  const snap = await getDoc(batchRef);

  if (!snap.exists()) {
    throw new Error(`El lote de semillas ${batchId} no existe.`);
  }

  const batchData = snap.data() as MetadataSeedBatch;
  const rawItems = batchData.items.map((i: any) => i.data || i);

  let report: SyncReport;

  if (batchData.type === 'food') {
    report = await upsertFoodsLibrary(rawItems as FoodItem[], { force: options.force });
  } else {
    report = await upsertExercisesLibrary(rawItems as ExerciseItem[], { force: options.force });
  }

  await setDoc(
    batchRef,
    {
      status: 'deployed',
      deployedAt: serverTimestamp(),
      deploymentReport: report,
    },
    { merge: true },
  );

  return report;
}

/**
 * Sincroniza todas las bibliotecas maestras de forma coordinada con registro de auditoría.
 */
export async function syncAllLibraries(options: { force?: boolean } = {}): Promise<GlobalSyncResult> {
  const start = Date.now();
  logger.info('seedManager', 'Iniciando sincronización global de bibliotecas...');

  const foodsReport = await upsertFoodsLibrary(FOODS_CATALOG, options);
  const exercisesReport = await upsertExercisesLibrary(EXERCISES_CATALOG, options);

  const durationMs = Date.now() - start;

  // Registrar auditoría de despliegue
  try {
    const auditRef = doc(collection(db, 'seed_deployments'));
    await setDoc(auditRef, {
      type: 'libraries_upsert_sync',
      foods: foodsReport,
      exercises: exercisesReport,
      durationMs,
      executedAt: serverTimestamp(),
    });
  } catch (err) {
    logger.warn('seedManager', 'No se pudo registrar la auditoría de despliegue en Firestore', err);
  }

  return {
    success: true,
    foodsReport,
    exercisesReport,
    durationMs,
  };
}
