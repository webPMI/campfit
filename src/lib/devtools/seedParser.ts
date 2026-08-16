/**
 * Parser Multi-Formato de Semillas (CSV / JSON) — CampFit
 *
 * Convierte archivos o cadenas CSV/JSON en objetos normalizados y validados
 * de FoodItem o ExerciseItem listos para el área de Staging y Despliegue.
 *
 * @module devtools/seedParser
 */

import type { FoodItem, FoodCategory } from '@/lib/shared/foodLibrary';
import { generateSearchIndex } from '@/lib/shared/foodLibrary';
import type { ExerciseItem, MuscleGroup, ExerciseCategory, EquipmentType } from '@/lib/shared/exerciseLibrary';
import { generateExerciseSearchIndex } from '@/lib/shared/exerciseLibrary';
import { validateFoodItem, validateExerciseItem } from '@/lib/data/foodValidators';
import { computeItemHash } from '@/lib/devtools/seedManager';

export interface StagingItem<T> {
  id: string;
  data: T;
  hash: string;
  isValid: boolean;
  issues: string[];
  status: 'valid' | 'duplicate_warning' | 'invalid_data';
}

export interface ParsedSeedBatch<T> {
  type: 'food' | 'exercise';
  total: number;
  validCount: number;
  invalidCount: number;
  items: StagingItem<T>[];
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

/**
 * Parsea un archivo o texto CSV simple en una matriz de objetos clave-valor.
 */
function parseCsvRows(csvText: string): Record<string, string>[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const firstLine = lines[0] || '';
  const headers = splitCsvLine(firstLine).map((h) => h.toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i] || '';
    const values = splitCsvLine(line);

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Parsea CSV o JSON a lote de alimentos (`FoodItem`).
 */
export function parseFoodsSource(source: string | object[]): ParsedSeedBatch<FoodItem> {
  let rawItems: any[] = [];

  if (typeof source === 'string') {
    const trimmed = source.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        rawItems = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        throw new Error(`JSON de alimentos inválido: ${(e as Error).message}`);
      }
    } else {
      rawItems = parseCsvRows(trimmed);
    }
  } else if (Array.isArray(source)) {
    rawItems = source;
  }

  const items: StagingItem<FoodItem>[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let idx = 0; idx < rawItems.length; idx++) {
    const raw = rawItems[idx];
    const nameEs = raw.name_es || raw.name || raw.es || `Alimento ${idx + 1}`;
    const nameEn = raw.name_en || raw.en || nameEs;
    const nameCa = raw.name_ca || raw.ca || nameEs;

    const id = raw.id || `food-${nameEs.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    const category: FoodCategory = raw.category || 'other';

    const calories100g = Number(raw.calories100g || raw.calories || raw.cal100 || 0);
    const protein100g = Number(raw.protein100g || raw.protein || raw.p100 || 0);
    const carbs100g = Number(raw.carbs100g || raw.carbs || raw.c100 || 0);
    const fat100g = Number(raw.fat100g || raw.fat || raw.f100 || 0);
    const defaultPortion = Number(raw.defaultportion || raw.defaultPortion || raw.portion || 100);

    const allergens = Array.isArray(raw.allergens)
      ? raw.allergens
      : typeof raw.allergens === 'string' && raw.allergens.length > 0
        ? raw.allergens.split(';').map((a: string) => a.trim().toLowerCase())
        : [];

    const tags = Array.isArray(raw.tags)
      ? raw.tags
      : typeof raw.tags === 'string' && raw.tags.length > 0
        ? raw.tags.split(';').map((t: string) => t.trim())
        : [];

    const substitutes = Array.isArray(raw.substitutes)
      ? raw.substitutes
      : typeof raw.substitutes === 'string' && raw.substitutes.length > 0
        ? raw.substitutes.split(';').map((s: string) => s.trim())
        : [];

    const translations = { es: nameEs, en: nameEn, ca: nameCa };
    const searchIndex = generateSearchIndex(translations, tags);

    const ratio = defaultPortion / 100;
    const defaultCalories = Math.round(calories100g * ratio);
    const defaultProtein = Math.round(protein100g * ratio * 10) / 10;
    const defaultCarbs = Math.round(carbs100g * ratio * 10) / 10;
    const defaultFat = Math.round(fat100g * ratio * 10) / 10;

    const foodItem: FoodItem = {
      id,
      category,
      translations,
      searchIndex,
      isVegan: raw.isVegan ?? false,
      isVegetarian: raw.isVegetarian ?? true,
      isGlutenFree: raw.isGlutenFree ?? !allergens.includes('gluten'),
      isLactoseFree: raw.isLactoseFree ?? !allergens.includes('lactose'),
      isNutFree: raw.isNutFree ?? (!allergens.includes('nuts') && !allergens.includes('peanut')),
      isShellfishFree: raw.isShellfishFree ?? !allergens.includes('shellfish'),
      allergens,
      tags,
      calories100g,
      protein100g,
      carbs100g,
      fat100g,
      defaultPortion,
      defaultCalories,
      defaultProtein,
      defaultCarbs,
      defaultFat,
      substitutes,
      isActive: raw.isActive ?? true,
      imageUrl: raw.imageUrl || '',
      createdBy: raw.createdBy || 'seed_parser',
      createdAt: null,
      updatedAt: null,
    };

    const validation = validateFoodItem(foodItem);
    const hash = computeItemHash(foodItem);

    if (validation.isValid) {
      validCount++;
      items.push({
        id,
        data: foodItem,
        hash,
        isValid: true,
        issues: [],
        status: 'valid',
      });
    } else {
      invalidCount++;
      items.push({
        id,
        data: foodItem,
        hash,
        isValid: false,
        issues: validation.issues.map((i) => `[${i.field}] ${i.message}`),
        status: 'invalid_data',
      });
    }
  }

  return {
    type: 'food',
    total: items.length,
    validCount,
    invalidCount,
    items,
  };
}

/**
 * Parsea CSV o JSON a lote de ejercicios (`ExerciseItem`).
 */
export function parseExercisesSource(source: string | object[]): ParsedSeedBatch<ExerciseItem> {
  let rawItems: any[] = [];

  if (typeof source === 'string') {
    const trimmed = source.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        rawItems = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        throw new Error(`JSON de ejercicios inválido: ${(e as Error).message}`);
      }
    } else {
      rawItems = parseCsvRows(trimmed);
    }
  } else if (Array.isArray(source)) {
    rawItems = source;
  }

  const items: StagingItem<ExerciseItem>[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let idx = 0; idx < rawItems.length; idx++) {
    const raw = rawItems[idx];
    const nameEs = raw.name_es || raw.name || raw.es || `Ejercicio ${idx + 1}`;
    const nameEn = raw.name_en || raw.en || nameEs;
    const nameCa = raw.name_ca || raw.ca || nameEs;

    const id = raw.id || `ex-${nameEs.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    const category: ExerciseCategory = raw.category || 'strength';

    const rawMuscles = raw.musclegroups || raw.muscleGroups || raw.muscles;
    const muscleGroups: MuscleGroup[] = Array.isArray(rawMuscles)
      ? rawMuscles
      : typeof rawMuscles === 'string' && rawMuscles.length > 0
        ? rawMuscles.split(';').map((m: string) => m.trim().toLowerCase() as MuscleGroup)
        : ['full_body'];

    const rawEquip = raw.equipment || raw.equip;
    const equipment: EquipmentType[] = Array.isArray(rawEquip)
      ? rawEquip
      : typeof rawEquip === 'string' && rawEquip.length > 0
        ? rawEquip.split(';').map((e: string) => e.trim().toLowerCase() as EquipmentType)
        : ['bodyweight'];

    const tags = Array.isArray(raw.tags)
      ? raw.tags
      : typeof raw.tags === 'string' && raw.tags.length > 0
        ? raw.tags.split(';').map((t: string) => t.trim())
        : [];

    const translations = { es: nameEs, en: nameEn, ca: nameCa };
    const searchIndex = generateExerciseSearchIndex(translations, tags, muscleGroups);

    const exerciseItem: ExerciseItem = {
      id,
      translations,
      searchIndex,
      muscleGroups,
      secondaryMuscles: raw.secondaryMuscles || [],
      category,
      equipment,
      difficulty: raw.difficulty || 'beginner',
      difficultyLevel: raw.difficultyLevel || (raw.difficulty === 'advanced' ? 5 : raw.difficulty === 'intermediate' ? 3 : 1),
      defaultSets: Number(raw.defaultSets || raw.sets || 3),
      defaultReps: Number(raw.defaultReps || raw.reps || 10),
      defaultRestSeconds: Number(raw.defaultRestSeconds || raw.rest || 90),
      defaultDurationSeconds: raw.defaultDurationSeconds ? Number(raw.defaultDurationSeconds) : undefined,
      videoUrl: raw.videoUrl || raw.video || '',
      thumbnailUrl: raw.thumbnailUrl || raw.thumb || '',
      instructionsUrl: raw.instructionsUrl || '',
      contraindications: Array.isArray(raw.contraindications)
        ? raw.contraindications
        : typeof raw.contraindications === 'string' && raw.contraindications.length > 0
          ? raw.contraindications.split(';').map((c: string) => c.trim())
          : [],
      tags,
      isActive: raw.isActive ?? true,
      createdBy: raw.createdBy || 'seed_parser',
      createdAt: null,
      updatedAt: null,
    };

    const validation = validateExerciseItem(exerciseItem);
    const hash = computeItemHash(exerciseItem);

    if (validation.isValid) {
      validCount++;
      items.push({
        id,
        data: exerciseItem,
        hash,
        isValid: true,
        issues: [],
        status: 'valid',
      });
    } else {
      invalidCount++;
      items.push({
        id,
        data: exerciseItem,
        hash,
        isValid: false,
        issues: validation.issues.map((i) => `[${i.field}] ${i.message}`),
        status: 'invalid_data',
      });
    }
  }

  return {
    type: 'exercise',
    total: items.length,
    validCount,
    invalidCount,
    items,
  };
}
