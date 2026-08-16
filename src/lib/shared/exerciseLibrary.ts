/**
 * Biblioteca de Ejercicios — CampFit
 *
 * Tipos, helpers y servicios para la colección `exercises_library` de Firestore.
 * Es la fuente centralizada de ejercicios multilenguaje (ES/EN/CA) con metadatos
 * de músculos, equipamiento, dificultad y sistema de preferencias del cliente.
 *
 * 🔒 CRÍTICO: Ver docs relacionados en diseno_biblioteca_ejercicios.md antes de modificar.
 *
 * @module shared/exerciseLibrary
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  getDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';

// ── Tipos de clasificación ────────────────────────────────────────────────────

/**
 * Grupos musculares principales.
 * 🔒 CRÍTICO: Union estricta. NUNCA cambiar a `string`.
 * Si se añade un grupo nuevo, actualizar también seed-exercises.mjs y los filtros de UI.
 */
export type MuscleGroup =
  | 'chest'        // Pecho
  | 'back'         // Espalda
  | 'shoulders'    // Hombros
  | 'biceps'       // Bíceps
  | 'triceps'      // Tríceps
  | 'forearms'     // Antebrazos
  | 'core'         // Core / abdomen
  | 'quadriceps'   // Cuádriceps
  | 'hamstrings'   // Isquiotibiales
  | 'glutes'       // Glúteos
  | 'calves'       // Gemelos
  | 'full_body'    // Cuerpo completo
  | 'cardio';      // Cardiovascular (sin músculo específico)

/**
 * Categorías de ejercicio.
 * 🔒 CRÍTICO: Union estricta. NUNCA cambiar a `string`.
 */
export type ExerciseCategory =
  | 'strength'        // Fuerza (peso libre, máquinas)
  | 'cardio'          // Cardio (HIIT, LISS, running)
  | 'flexibility'     // Flexibilidad / movilidad
  | 'balance'         // Equilibrio / propiocepción
  | 'plyometric'      // Pliométrico / explosivo
  | 'functional'      // Funcional / movimientos compuestos
  | 'rehabilitation'  // Rehabilitación / bajo impacto
  | 'sport_specific'; // Específico de deporte

/**
 * Tipos de equipamiento.
 * 🔒 CRÍTICO: Union estricta. NUNCA cambiar a `string`.
 */
export type EquipmentType =
  | 'barbell'          // Barra
  | 'dumbbell'         // Mancuernas
  | 'kettlebell'       // Kettlebell
  | 'cable'            // Polea / cable
  | 'machine'          // Máquina guiada
  | 'bodyweight'       // Peso corporal
  | 'resistance_band'  // Banda elástica
  | 'pull_up_bar'      // Barra de dominadas
  | 'bench'            // Banco
  | 'rack'             // Rack / jaula
  | 'trx'              // TRX / suspensión
  | 'other';           // Otro

// ── Tipos principales ─────────────────────────────────────────────────────────

/**
 * Documento de la colección `exercises_library`.
 *
 * 🔒 CRÍTICO: Los campos `translations` y `searchIndex` son obligatorios y nunca
 * deben reducirse. Son la base del sistema de búsqueda multilenguaje.
 */
export interface ExerciseItem {
  id: string;

  // 🔒 CRÍTICO: Mapa de traducciones con los 3 idiomas soportados.
  // NUNCA eliminar un idioma. Si se añade uno nuevo, añadirlo en TODOS los documentos.
  translations: {
    es: string; // Nombre en español (fuente principal)
    en: string; // Nombre en inglés
    ca: string; // Nombre en catalán
  };

  // 🔒 CRÍTICO: Índice pre-computado para búsqueda eficiente con `array-contains`.
  // Se genera automáticamente con generateExerciseSearchIndex(). NUNCA escribir manualmente.
  searchIndex: string[];

  // Clasificación
  muscleGroups: MuscleGroup[];         // Músculos primarios trabajados
  secondaryMuscles?: MuscleGroup[];    // Músculos secundarios / estabilizadores
  category: ExerciseCategory;          // Categoría principal del ejercicio
  equipment: EquipmentType[];          // Equipamiento necesario
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  difficultyLevel?: 1 | 2 | 3 | 4 | 5; // Nivel granular del 1 al 5

  // Valores por defecto para la rutina (para pre-rellenar el formulario)
  defaultSets: number;
  defaultReps: number;
  defaultRestSeconds: number;
  defaultDurationSeconds?: number; // Para ejercicios de tiempo (plancha, etc.)

  // Multimedia
  videoUrl?: string;         // YouTube embed o Firebase Storage
  thumbnailUrl?: string;     // Imagen estática para la lista
  instructionsUrl?: string;  // PDF o URL externa con instrucciones

  // Seguridad
  // 🔒 CRÍTICO: El trainer debe ver estas contraindicaciones al asignar ejercicios a
  // clientes con lesiones/condiciones médicas registradas en su MedicalProfile.
  contraindications?: string[]; // Ej: 'lumbar_herniation', 'knee_replacement'

  tags: string[]; // 'compound', 'isolation', 'powerlifting', 'core', 'unilateral', etc.

  // Metadatos de gestión
  // 🔒 CRÍTICO: Soft delete — NUNCA eliminar documentos de exercises_library.
  // Las rutinas históricas pueden referenciar el ejercicio vía exerciseId.
  isActive: boolean;
  createdBy: string; // uid o 'system' (seed)
  createdAt: any;    // Firestore Timestamp
  updatedAt: any;    // Firestore Timestamp
}

// ── Opciones de motivo de exclusión ──────────────────────────────────────────

/**
 * Claves de motivos rápidos para excluir un ejercicio.
 * 🔒 CRÍTICO: Union derivada de la constante. NUNCA cambiar a `string`.
 * Se usan en el checklist del cliente en client/workouts.astro.
 */
export const EXCLUSION_REASON_KEYS = [
  'pain',            // Dolor / incomodidad
  'injury',          // Lesión activa o pasada
  'no_equipment',    // No tengo el equipamiento
  'too_difficult',   // Demasiado difícil para mi nivel
  'dislike',         // No me gusta / no lo disfruto
  'contraindicated', // Contraindicado por médico
  'other',           // Otro (requiere texto libre)
] as const;

export type ExclusionReason = typeof EXCLUSION_REASON_KEYS[number];

// ── Helpers de idioma ─────────────────────────────────────────────────────────

/**
 * Obtiene el nombre de un ejercicio en el idioma solicitado.
 * Fallback chain: idioma → español → inglés → 'Unknown'.
 *
 * 🔒 CRÍTICO: NUNCA lanzar excepción si falta una traducción.
 */
export function getExerciseName(exercise: ExerciseItem, lang: 'es' | 'en' | 'ca'): string {
  return (
    exercise.translations[lang] ||
    exercise.translations.es ||
    exercise.translations.en ||
    'Unknown'
  );
}

// ── Búsqueda ──────────────────────────────────────────────────────────────────

/**
 * Genera el índice de búsqueda pre-computado para un ejercicio.
 * Combina tokens normalizados de las 3 traducciones, tags y grupos musculares.
 *
 * Debe llamarse antes de guardar/actualizar un ejercicio en Firestore.
 */
export function generateExerciseSearchIndex(
  translations: ExerciseItem['translations'],
  tags: string[],
  muscleGroups: MuscleGroup[],
): string[] {
  const normalize = (s: string): string[] =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 1); // descartar tokens de 1 char

  const tokens = new Set<string>();
  [translations.es, translations.en, translations.ca, ...tags, ...muscleGroups].forEach((s) => {
    normalize(s).forEach((t) => tokens.add(t));
  });
  return Array.from(tokens);
}

/**
 * Filtra una lista de ejercicios en memoria por una query de texto.
 * Para búsqueda multi-token: requiere que TODOS los tokens estén en searchIndex.
 */
export function searchExercisesLocal(query: string, exercises: ExerciseItem[]): ExerciseItem[] {
  if (!query.trim()) return exercises;

  const tokens = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (tokens.length === 0) return exercises;

  return exercises.filter((ex) =>
    tokens.every((token) => ex.searchIndex.some((idx) => idx.startsWith(token))),
  );
}

// ── Capa de Caché en Cliente (Memoria & SessionStorage) ───────────────────────

const EXERCISES_CACHE_KEY = 'campfit_exercises_library_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

let _memoryExercisesCache: { data: ExerciseItem[]; timestamp: number } | null = null;

/**
 * Obtiene los ejercicios cacheados si siguen siendo válidos.
 */
function getCachedExercises(): ExerciseItem[] | null {
  const now = Date.now();
  if (_memoryExercisesCache && now - _memoryExercisesCache.timestamp < CACHE_TTL_MS) {
    return _memoryExercisesCache.data;
  }

  try {
    const raw = sessionStorage.getItem(EXERCISES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { data: ExerciseItem[]; timestamp: number };
      if (now - parsed.timestamp < CACHE_TTL_MS) {
        _memoryExercisesCache = parsed;
        return parsed.data;
      }
    }
  } catch {
    // Ignorar fallos de sessionStorage
  }

  return null;
}

/**
 * Guarda los ejercicios en caché local.
 */
function setCachedExercises(exercises: ExerciseItem[]): void {
  const record = { data: exercises, timestamp: Date.now() };
  _memoryExercisesCache = record;
  try {
    sessionStorage.setItem(EXERCISES_CACHE_KEY, JSON.stringify(record));
  } catch {
    // Silencioso
  }
}

/**
 * Invalida manualmente la caché de ejercicios.
 */
export function invalidateExercisesCache(): void {
  _memoryExercisesCache = null;
  try {
    sessionStorage.removeItem(EXERCISES_CACHE_KEY);
  } catch {
    // Silencioso
  }
}

// ── Servicios de Firestore ───────────────────────────────────────────────────

/**
 * Suscripción reactiva al catálogo de ejercicios activos con caché Stale-While-Revalidate.
 * Filtra por isActive == true, ordenados por categoría.
 *
 * Para uso en trainer/workouts.astro y client/workouts.astro.
 *
 * 🔒 CRÍTICO: SIEMPRE cancelar la suscripción en `beforeunload` o `onDestroy`.
 */
export function subscribeToExercises(
  callback: (exercises: ExerciseItem[]) => void,
): Unsubscribe {
  // 1. Emitir inmediatamente datos en caché si existen
  const cached = getCachedExercises();
  if (cached && cached.length > 0) {
    callback(cached);
  }

  const q = query(
    collection(db, 'exercises_library'),
    where('isActive', '==', true),
    orderBy('category', 'asc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const exercises = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ExerciseItem[];
      setCachedExercises(exercises);
      callback(exercises);
    },
    (error) => {
      logger.error('exerciseLibrary', 'Error al suscribirse a exercises_library:', error);
      if (!cached || cached.length === 0) {
        callback([]);
      }
    },
  );
}

/**
 * Suscripción reactiva al catálogo COMPLETO (activos e inactivos).
 *
 * 🔒 CRÍTICO: Solo para uso en admin/exercises.astro.
 * NUNCA usar en páginas de trainer o cliente.
 */
export function subscribeToAllExercises(
  callback: (exercises: ExerciseItem[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'exercises_library'),
    orderBy('category', 'asc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const exercises = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ExerciseItem[];
      callback(exercises);
    },
    (error) => {
      logger.error('exerciseLibrary', 'Error al suscribirse a exercises_library (admin):', error);
      callback([]);
    },
  );
}

/**
 * Obtiene los ejercicios de un músculo específico (una sola vez, no reactivo).
 * Útil para poblar un selector filtrado por grupo muscular.
 */
export async function getExercisesByMuscle(muscle: MuscleGroup): Promise<ExerciseItem[]> {
  try {
    const q = query(
      collection(db, 'exercises_library'),
      where('isActive', '==', true),
      where('muscleGroups', 'array-contains', muscle),
      orderBy('translations.es', 'asc'),
      limit(100),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ExerciseItem[];
  } catch (error) {
    logger.error('exerciseLibrary', `Error al cargar ejercicios del músculo ${muscle}:`, error);
    return [];
  }
}

/**
 * Obtiene los ejercicios por categoría (una sola vez, no reactivo).
 */
export async function getExercisesByCategory(category: ExerciseCategory): Promise<ExerciseItem[]> {
  try {
    const q = query(
      collection(db, 'exercises_library'),
      where('isActive', '==', true),
      where('category', '==', category),
      orderBy('translations.es', 'asc'),
      limit(100),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ExerciseItem[];
  } catch (error) {
    logger.error('exerciseLibrary', `Error al cargar ejercicios de categoría ${category}:`, error);
    return [];
  }
}

/**
 * Obtiene un ejercicio por ID (una sola vez, no reactivo).
 * Útil para mostrar detalles de un ejercicio específico.
 */
export async function getExerciseById(exerciseId: string): Promise<ExerciseItem | null> {
  try {
    const docSnap = await getDoc(doc(db, 'exercises_library', exerciseId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as ExerciseItem;
  } catch (error) {
    logger.error('exerciseLibrary', `Error al cargar ejercicio ${exerciseId}:`, error);
    return null;
  }
}

/**
 * Construye un Map de exerciseId → ExerciseItem para acceso O(1) por ID.
 * Úsalo para lookups eficientes al renderizar listas de ejercicios.
 */
export function buildExercisesMap(exercises: ExerciseItem[]): Map<string, ExerciseItem> {
  return new Map(exercises.map((ex) => [ex.id, ex]));
}

/**
 * Filtra ejercicios por equipamiento disponible.
 * Útil para mostrar solo ejercicios que el cliente puede hacer con su equipamiento.
 */
export function filterByEquipment(exercises: ExerciseItem[], available: EquipmentType[]): ExerciseItem[] {
  if (available.length === 0) return exercises;
  return exercises.filter((ex) =>
    ex.equipment.every((eq) => available.includes(eq)) ||
    ex.equipment.includes('bodyweight'),
  );
}

// ── Labels y emojis para UI ───────────────────────────────────────────────────

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: '💪 Pecho', back: '🔙 Espalda', shoulders: '🏋️ Hombros',
  biceps: '💪 Bíceps', triceps: '💪 Tríceps', forearms: '💪 Antebrazos',
  core: '🎯 Core', quadriceps: '🦵 Cuádriceps', hamstrings: '🦵 Isquiotibiales',
  glutes: '🍑 Glúteos', calves: '🦵 Gemelos', full_body: '🌐 Cuerpo completo',
  cardio: '❤️ Cardio',
};

export const CATEGORY_LABELS_EX: Record<ExerciseCategory, string> = {
  strength: '🏋️ Fuerza', cardio: '🏃 Cardio', flexibility: '🧘 Flexibilidad',
  balance: '⚖️ Equilibrio', plyometric: '💥 Pliométrico', functional: '⚙️ Funcional',
  rehabilitation: '🩺 Rehabilitación', sport_specific: '⚽ Deporte específico',
};

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  barbell: '🏋️ Barra', dumbbell: '💪 Mancuernas', kettlebell: '🔔 Kettlebell',
  cable: '🪝 Polea', machine: '🤖 Máquina', bodyweight: '🧍 Peso corporal',
  resistance_band: '🎀 Banda elástica', pull_up_bar: '🪵 Barra dominadas',
  bench: '🪑 Banco', rack: '🏗️ Rack / Jaula', trx: '🪢 TRX', other: '📦 Otro',
};

export const DIFFICULTY_LABELS = {
  beginner: '🟢 Principiante',
  intermediate: '🟡 Intermedio',
  advanced: '🔴 Avanzado',
} as const;

export const EXCLUSION_REASON_LABELS: Record<ExclusionReason, string> = {
  pain: '😣 Dolor / incomodidad',
  injury: '🤕 Lesión activa o pasada',
  no_equipment: '🏋️ No tengo el equipamiento',
  too_difficult: '😅 Demasiado difícil',
  dislike: '😐 No me gusta',
  contraindicated: '🩺 Contraindicado por médico',
  other: '📝 Otro motivo',
};
