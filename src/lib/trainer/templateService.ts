/**
 * Servicio de consumo de plantillas para Entrenadores.
 * Permite a los entrenadores consultar plantillas de dietas/rutinas y asignarlas a sus clientes
 * con detección inteligente de alérgenos, motor de sustitución, filtros avanzados, validación de salud
 * de semillas y versionado inmutable.
 *
 * @module trainer/templateService
 */

import { logger } from '@/lib/shared/logger';
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DietTemplate, WorkoutTemplate } from '@/lib/devtools/types';
import type { MedicalProfile } from '@/types';
import { checkDietConflicts, suggestSubstitutes, type DietConflict } from '@/lib/client/intoleranceChecker';
import { FOODS_CATALOG } from '@/lib/data/foodsCatalog';
import { EXERCISES_CATALOG } from '@/lib/data/exercisesCatalog';
import { seedDietTemplates, seedWorkoutTemplates } from '@/lib/devtools/seedService';

/**
 * 🔒 CRÍTICO: Verifica que un cliente esté asignado al trainer o disponible para asignación.
 * Sin esta verificación, cualquier trainer podría asignar plantillas a clientes de otros trainers.
 * @param clientId - UID del cliente
 * @param trainerId - UID del trainer
 * @returns true si el cliente está asignado al trainer, disponible sin asignar, o si quien llama es admin
 */
async function isClientAssignedToTrainer(clientId: string, trainerId: string): Promise<boolean> {
  try {
    const callerSnap = await getDoc(doc(db, 'users', trainerId));
    if (callerSnap.exists() && callerSnap.data().role === 'admin') return true;

    const clientSnap = await getDoc(doc(db, 'users', clientId));
    if (!clientSnap.exists()) return false;
    const data = clientSnap.data();
    // 🔒 CRÍTICO: Permite la asignación si el cliente ya está asignado a este trainer o si aún no tiene trainer asignado
    return data.assignedTrainerId === trainerId || !data.assignedTrainerId;
  } catch (err) {
    logger.error('templateService', `Error verificando asignación de cliente ${clientId}:`, err);
    return false;
  }
}

export interface TemplateFilterOptions {
  type?: string;
  difficulty?: string;
  category?: string;
  search?: string;
  minCalories?: number;
  maxCalories?: number;
  tags?: string[];
  limitCount?: number;
}

export interface TemplateHealthReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingIds: string[];
  conflicts: DietConflict[];
  verifiedCount: number;
  customCount: number;
}

const TEMPLATE_CACHE_TTL_MS = 5 * 60 * 1000;
let _cachedDietTemplates: { data: DietTemplate[]; timestamp: number } | null = null;
let _cachedWorkoutTemplates: { data: WorkoutTemplate[]; timestamp: number } | null = null;

// 🔒 Locks de concurrencia para evitar auto-seeding simultáneo en múltiples clientes
let _isSeedingDiets = false;
let _isSeedingWorkouts = false;

/**
 * Invalida manualmente la caché en memoria de plantillas.
 */
export function invalidateTemplateCache(type?: 'diets' | 'workouts' | 'all'): void {
  if (!type || type === 'all' || type === 'diets') {
    _cachedDietTemplates = null;
  }
  if (!type || type === 'all' || type === 'workouts') {
    _cachedWorkoutTemplates = null;
  }
}

/**
 * Aplica los filtros de búsqueda y rangos a las plantillas de dietas.
 */
function filterDietTemplates(templates: DietTemplate[], options?: TemplateFilterOptions): DietTemplate[] {
  if (!options) return templates;
  let res = templates;

  if (options.type) {
    res = res.filter((t) => t.type === options.type);
  }
  if (options.minCalories !== undefined) {
    res = res.filter((t) => (t.totalCalories || 0) >= options.minCalories!);
  }
  if (options.maxCalories !== undefined) {
    res = res.filter((t) => (t.totalCalories || 0) <= options.maxCalories!);
  }
  if (options.search) {
    const q = options.search.toLowerCase();
    res = res.filter((t) => t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
  }
  if (options.limitCount) {
    res = res.slice(0, options.limitCount);
  }

  return res;
}

/**
 * Aplica los filtros de búsqueda y dificultad a las plantillas de rutinas.
 */
function filterWorkoutTemplates(templates: WorkoutTemplate[], options?: TemplateFilterOptions): WorkoutTemplate[] {
  if (!options) return templates;
  let res = templates;

  if (options.difficulty) {
    res = res.filter((t) => t.difficulty === options.difficulty);
  }
  if (options.category) {
    res = res.filter((t) => t.category === options.category);
  }
  if (options.search) {
    const q = options.search.toLowerCase();
    res = res.filter((t) => t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
  }
  if (options.limitCount) {
    res = res.slice(0, options.limitCount);
  }

  return res;
}

/**
 * Suscribirse a la lista de plantillas de dietas disponibles con soporte para filtros y caché.
 */
export function subscribeToDietTemplates(
  callback: (templates: DietTemplate[]) => void,
  options?: TemplateFilterOptions,
): () => void {
  // Emitir desde caché si sigue vigente
  if (_cachedDietTemplates && Date.now() - _cachedDietTemplates.timestamp < TEMPLATE_CACHE_TTL_MS) {
    callback(filterDietTemplates(_cachedDietTemplates.data, options));
  }

  const q = collection(db, 'diet_templates');
  return onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty && !_isSeedingDiets) {
        _isSeedingDiets = true;
        try {
          await seedDietTemplates();
        } catch (e) {
          logger.warn('templateService', 'Auto-seed diet templates error', e);
        } finally {
          _isSeedingDiets = false;
        }
      }
      const templates = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as DietTemplate[];

      _cachedDietTemplates = { data: templates, timestamp: Date.now() };
      callback(filterDietTemplates(templates, options));
    },
    (err) => {
      logger.warn('templateService', `subscribeToDietTemplates error: ${err.message}`);
      if (!_cachedDietTemplates) {
        callback([]);
      }
    },
  );
}

/**
 * Suscribirse a la lista de plantillas de rutinas disponibles con soporte para filtros y caché.
 */
export function subscribeToWorkoutTemplates(
  callback: (templates: WorkoutTemplate[]) => void,
  options?: TemplateFilterOptions,
): () => void {
  // Emitir desde caché si sigue vigente
  if (_cachedWorkoutTemplates && Date.now() - _cachedWorkoutTemplates.timestamp < TEMPLATE_CACHE_TTL_MS) {
    callback(filterWorkoutTemplates(_cachedWorkoutTemplates.data, options));
  }

  const q = collection(db, 'workout_templates');
  return onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty && !_isSeedingWorkouts) {
        _isSeedingWorkouts = true;
        try {
          await seedWorkoutTemplates();
        } catch (e) {
          logger.warn('templateService', 'Auto-seed workout templates error', e);
        } finally {
          _isSeedingWorkouts = false;
        }
      }
      const templates = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as WorkoutTemplate[];

      _cachedWorkoutTemplates = { data: templates, timestamp: Date.now() };
      callback(filterWorkoutTemplates(templates, options));
    },
    (err) => {
      logger.warn('templateService', `subscribeToWorkoutTemplates error: ${err.message}`);
      if (!_cachedWorkoutTemplates) {
        callback([]);
      }
    },
  );
}

/**
 * Valida la salud integral de una plantilla de dieta antes de asignarla a un cliente.
 * Verifica existencia de IDs de semillas en el catálogo y cruza alérgenos con el perfil médico.
 */
export function validateDietTemplateHealth(
  template: DietTemplate,
  medicalProfile?: MedicalProfile | null,
  lang: 'es' | 'en' | 'ca' = 'es',
): TemplateHealthReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingIds: string[] = [];
  let verifiedCount = 0;
  let customCount = 0;

  const meals = (template.meals || []) as any[];

  for (const meal of meals) {
    if (meal.foodId) {
      const food = FOODS_CATALOG.find((f) => f.id === meal.foodId);
      if (!food) {
        missingIds.push(meal.foodId);
        warnings.push(`El alimento "${meal.description || meal.name}" (ID: ${meal.foodId}) no existe en el catálogo de semillas.`);
      } else if (!food.isActive) {
        warnings.push(`El alimento "${food.translations[lang] || food.id}" está marcado como inactivo en el catálogo.`);
      } else {
        verifiedCount++;
      }
    } else {
      customCount++;
    }
  }

  const conflicts = medicalProfile ? checkDietConflicts(meals, FOODS_CATALOG, medicalProfile, lang) : [];

  for (const conflict of conflicts) {
    if (conflict.severity === 'severe') {
      errors.push(`Conflicto Severo: ${conflict.message}`);
    } else {
      warnings.push(`Advertencia: ${conflict.message}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingIds,
    conflicts,
    verifiedCount,
    customCount,
  };
}

/**
 * Valida la salud integral de una plantilla de rutina antes de asignarla.
 */
export function validateWorkoutTemplateHealth(
  template: WorkoutTemplate,
): TemplateHealthReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingIds: string[] = [];
  let verifiedCount = 0;
  let customCount = 0;

  const exercises = (template.exercises || []) as any[];

  for (const ex of exercises) {
    if (ex.exerciseId) {
      const found = EXERCISES_CATALOG.find((e) => e.id === ex.exerciseId);
      if (!found) {
        missingIds.push(ex.exerciseId);
        warnings.push(`El ejercicio "${ex.name}" (ID: ${ex.exerciseId}) no existe en el catálogo de semillas.`);
      } else if (!found.isActive) {
        warnings.push(`El ejercicio "${found.translations.es || found.id}" está marcado como inactivo.`);
      } else {
        verifiedCount++;
      }
    } else {
      customCount++;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingIds,
    conflicts: [],
    verifiedCount,
    customCount,
  };
}

/**
 * Audita una plantilla de dieta contra el perfil médico de un cliente antes de asignarla.
 * Detecta alérgenos, alimentos excluidos y propone sustitutos recomendados.
 */
export function auditDietTemplateForClient(
  template: DietTemplate,
  medicalProfile: MedicalProfile,
  lang: 'es' | 'en' | 'ca' = 'es',
): {
  hasConflicts: boolean;
  conflicts: DietConflict[];
  suggestions: { conflictedFood: string; substitutes: string[] }[];
} {
  const meals = (template.meals || []) as any[];
  const conflicts = checkDietConflicts(meals, FOODS_CATALOG, medicalProfile, lang);

  const suggestions: { conflictedFood: string; substitutes: string[] }[] = [];

  for (const conflict of conflicts) {
    if (conflict.foodId) {
      const food = FOODS_CATALOG.find((f) => f.id === conflict.foodId);
      if (food) {
        const subs = suggestSubstitutes(food, FOODS_CATALOG, medicalProfile, lang);
        suggestions.push({
          conflictedFood: conflict.foodName,
          substitutes: subs.map((s) => s.translations[lang] || s.id),
        });
      }
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    suggestions,
  };
}

/**
 * Aplica / Clona una dieta plantilla para un cliente específico con trazabilidad, versionado y validación de semillas.
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

  // Cargar perfil médico del cliente para validación de salud
  let medicalProfile: MedicalProfile | null = null;
  try {
    const clientDoc = await getDoc(doc(db, 'users', clientId));
    if (clientDoc.exists()) {
      medicalProfile = clientDoc.data().medicalProfile || null;
    }
  } catch (e) {
    logger.warn('templateService', `No se pudo obtener medicalProfile para client ${clientId}`, e);
  }

  const healthReport = validateDietTemplateHealth(data, medicalProfile);

  // Hidratar comidas con badges de validación de semillas
  const meals = (data.meals || []).map((m: any) => {
    const isSeed = Boolean(m.foodId && FOODS_CATALOG.some((f) => f.id === m.foodId && f.isActive));
    return {
      ...m,
      seedVerified: isSeed,
      validationStatus: isSeed ? 'valid' : m.foodId ? 'warning' : 'custom',
    };
  });

  const newDiet = {
    clientId,
    trainerId,
    name: data.name,
    type: data.type || 'normal',
    somatotype: data.somatotype || 'mesomorph',
    totalCalories: data.totalCalories || 2000,
    meals,
    originTemplateId: templateId,
    originVersion: data.version || 1,
    assignedBy: trainerId,
    snapshotFrozen: true,
    hasValidationWarnings: healthReport.warnings.length > 0 || healthReport.conflicts.length > 0,
    validationReport: {
      hasWarnings: healthReport.warnings.length > 0 || healthReport.conflicts.length > 0,
      warnings: [...healthReport.errors, ...healthReport.warnings],
      conflictsCount: healthReport.conflicts.length,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const dietRef = await addDoc(collection(db, 'diets'), newDiet);
  return dietRef.id;
}

/**
 * Aplica / Clona una rutina plantilla para un cliente específico con trazabilidad, versionado y validación de semillas.
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
  const healthReport = validateWorkoutTemplateHealth(data);

  // Hidratar ejercicios con badges de validación de semillas
  const exercises = (data.exercises || []).map((ex: any) => {
    const isSeed = Boolean(ex.exerciseId && EXERCISES_CATALOG.some((e) => e.id === ex.exerciseId && e.isActive));
    return {
      ...ex,
      seedVerified: isSeed,
      validationStatus: isSeed ? 'valid' : ex.exerciseId ? 'warning' : 'custom',
    };
  });

  const newWorkout = {
    clientId,
    trainerId,
    name: data.name,
    difficulty: data.difficulty || 'beginner',
    description: data.description || '',
    exercises,
    originTemplateId: templateId,
    originVersion: data.version || 1,
    assignedBy: trainerId,
    snapshotFrozen: true,
    hasValidationWarnings: healthReport.warnings.length > 0,
    validationReport: {
      hasWarnings: healthReport.warnings.length > 0,
      warnings: healthReport.warnings,
      missingCount: healthReport.missingIds.length,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const workoutRef = await addDoc(collection(db, 'workouts'), newWorkout);
  return workoutRef.id;
}
