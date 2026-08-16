/**
 * Biblioteca de Alimentos — CampFit
 *
 * Tipos, helpers y servicios para la colección `foods_library` de Firestore.
 * Es la fuente centralizada de alimentos multilenguaje (ES/EN/CA) con macros,
 * alérgenos, propiedades dietéticas y sistema de sustitución.
 *
 * 🔒 CRÍTICO: Ver docs/DISENO_LISTA_COMIDAS_MULTILENGUAJE.md antes de modificar.
 *
 * @module shared/foodLibrary
 */

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';

// ── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Categorías de alimentos disponibles en la biblioteca.
 * 🔒 CRÍTICO: Union estricta. NUNCA cambiar a `string`.
 * Si se añade una categoría nueva, actualizar también las claves i18n `food.category.*`.
 */
export type FoodCategory =
  | 'protein'      // Proteínas: carne, pescado, huevos, legumbres
  | 'carbs'        // Carbohidratos: arroz, pasta, pan, patata
  | 'fats'         // Grasas: aceite, aguacate, frutos secos
  | 'vegetables'   // Verduras
  | 'fruits'       // Frutas
  | 'dairy'        // Lácteos
  | 'beverages'    // Bebidas
  | 'supplements'  // Suplementos: proteína en polvo, creatina, etc.
  | 'sauces'       // Salsas y condimentos
  | 'other';       // Otros

/**
 * Documento de la colección `foods_library`.
 *
 * 🔒 CRÍTICO: Los campos `translations` y `searchIndex` son obligatorios y nunca
 * deben reducirse. Los campos `isVegan`, `isVegetarian` son críticos para la
 * detección de conflictos vegan/vegetariano en `checkDietConflicts()`.
 */
export interface FoodItem {
  id: string;

  category: FoodCategory;

  // 🔒 CRÍTICO: Mapa de traducciones con los 3 idiomas soportados.
  // NUNCA eliminar un idioma. Si se añade uno nuevo, añadirlo en TODOS los documentos.
  translations: {
    es: string; // Nombre en español (fuente principal)
    en: string; // Nombre en inglés
    ca: string; // Nombre en catalán
  };

  // 🔒 CRÍTICO: Índice pre-computado para búsqueda eficiente con `array-contains`.
  // Se genera automáticamente con generateSearchIndex(). NUNCA escribir manualmente.
  searchIndex: string[];

  // Propiedades dietéticas booleanas — críticas para checkDietConflicts()
  // 🔒 CRÍTICO: Si están mal, la detección de conflictos vegan/vegetariano falla silenciosamente.
  isVegan: boolean;       // No contiene ningún producto animal
  isVegetarian: boolean;  // No contiene carne/pescado (puede tener huevo/lácteos)
  isGlutenFree: boolean;  // Sin gluten
  isLactoseFree: boolean; // Sin lactosa
  isNutFree: boolean;     // Sin frutos secos
  isShellfishFree: boolean;

  // Alérgenos según Reglamento UE 1169/2011 (los 14 alérgenos de declaración obligatoria)
  // 🔒 CRÍTICO: Los usamos en checkMealAllergens(). NUNCA eliminar.
  allergens: string[]; // 'gluten' | 'lactose' | 'nuts' | 'shellfish' | 'egg' | 'soy' | 'fish'
                       // | 'peanut' | 'sesame' | 'mustard' | 'celery' | 'sulphites' | 'lupin' | 'molluscs'

  // Macronutrientes por 100g (para recalcular al ajustar la porción)
  calories100g: number;
  protein100g: number;
  carbs100g: number;
  fat100g: number;
  fiber100g?: number;

  // Micronutrientes opcionales (para clientes avanzados)
  sodium100mg?: number;   // Sodio en mg por 100g
  glycemicIndex?: number; // Índice glucémico (0-100)
  glycemicLoad?: number;  // Carga glucémica

  // Porción por defecto pre-calculada (evita re-calcular en cada render)
  defaultPortion: number;   // Gramos de la porción estándar
  defaultCalories: number;  // kcal para la porción por defecto
  defaultProtein: number;   // Proteína (g) para la porción por defecto
  defaultCarbs: number;     // Carbohidratos (g) para la porción por defecto
  defaultFat: number;       // Grasa (g) para la porción por defecto

  // 🔒 CRÍTICO: IDs de alimentos sustitutivos compatibles.
  // Se usa en suggestSubstitutes(). NUNCA eliminar sin revisar intoleranceChecker.ts.
  substitutes?: string[]; // Refs a foods_library/{foodId}

  tags: string[]; // Tags para búsqueda: "high-protein", "low-carb", "whole-grain", etc.

  imageUrl?: string; // URL de imagen (Firebase Storage o Cloudflare R2)

  // Metadatos de gestión
  // 🔒 CRÍTICO: Soft delete — NUNCA eliminar documentos de foods_library.
  // Las dietas históricas pueden referenciar el alimento. Usar isActive: false.
  isActive: boolean;
  createdBy: 'system' | string; // 'system' = seed, uid = creado por staff
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

// ── Helpers de idioma ────────────────────────────────────────────────────────

/**
 * Obtiene el nombre de un alimento en el idioma solicitado.
 * Fallback chain: idioma → español → inglés → 'Unknown'.
 *
 * 🔒 CRÍTICO: NUNCA lanzar excepción si falta una traducción.
 * Usar el fallback para mantener la UI siempre funcional.
 */
export function getFoodName(food: FoodItem, lang: 'es' | 'en' | 'ca'): string {
  return (
    food.translations[lang] ||
    food.translations.es ||
    food.translations.en ||
    'Unknown'
  );
}

// ── Búsqueda ──────────────────────────────────────────────────────────────────

/**
 * Genera el índice de búsqueda pre-computado para un alimento.
 * Combina tokens normalizados de las 3 traducciones y los tags.
 *
 * Debe llamarse antes de guardar/actualizar un alimento en Firestore.
 * El resultado se almacena en `FoodItem.searchIndex`.
 */
export function generateSearchIndex(
  translations: FoodItem['translations'],
  tags: string[],
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
  [translations.es, translations.en, translations.ca, ...tags].forEach((s) => {
    normalize(s).forEach((t) => tokens.add(t));
  });
  return Array.from(tokens);
}

/**
 * Filtra una lista de alimentos en memoria por una query de texto.
 * Para búsqueda multi-token: requiere que TODOS los tokens estén en searchIndex.
 *
 * @param query - Texto de búsqueda del usuario
 * @param foods - Lista de alimentos ya cargada en memoria
 */
export function searchFoodsLocal(query: string, foods: FoodItem[]): FoodItem[] {
  if (!query.trim()) return foods;

  const tokens = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (tokens.length === 0) return foods;

  return foods.filter((f) =>
    tokens.every((token) => f.searchIndex.some((idx) => idx.startsWith(token))),
  );
}

/**
 * Calcula macronutrientes de un alimento para una porción dada en gramos.
 */
export function calcMacrosForPortion(
  food: FoodItem,
  portionGrams: number,
): { calories: number; protein: number; carbs: number; fat: number } {
  const factor = portionGrams / 100;
  return {
    calories: Math.round(food.calories100g * factor),
    protein: Math.round(food.protein100g * factor * 10) / 10,
    carbs: Math.round(food.carbs100g * factor * 10) / 10,
    fat: Math.round(food.fat100g * factor * 10) / 10,
  };
}

// ── Capa de Caché en Cliente (Memoria & SessionStorage) ───────────────────────

const FOODS_CACHE_KEY = 'campfit_foods_library_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

let _memoryFoodsCache: { data: FoodItem[]; timestamp: number } | null = null;

/**
 * Obtiene los alimentos cacheados si siguen siendo válidos.
 */
function getCachedFoods(): FoodItem[] | null {
  const now = Date.now();
  if (_memoryFoodsCache && now - _memoryFoodsCache.timestamp < CACHE_TTL_MS) {
    return _memoryFoodsCache.data;
  }

  try {
    const raw = sessionStorage.getItem(FOODS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { data: FoodItem[]; timestamp: number };
      if (now - parsed.timestamp < CACHE_TTL_MS) {
        _memoryFoodsCache = parsed;
        return parsed.data;
      }
    }
  } catch {
    // Ignorar fallos de sessionStorage (modo incógnito/cuota)
  }

  return null;
}

/**
 * Guarda los alimentos en caché local.
 */
function setCachedFoods(foods: FoodItem[]): void {
  const record = { data: foods, timestamp: Date.now() };
  _memoryFoodsCache = record;
  try {
    sessionStorage.setItem(FOODS_CACHE_KEY, JSON.stringify(record));
  } catch {
    // Silencioso
  }
}

/**
 * Invalida manualmente la caché de alimentos (útil tras crear/editar un alimento).
 */
export function invalidateFoodsCache(): void {
  _memoryFoodsCache = null;
  try {
    sessionStorage.removeItem(FOODS_CACHE_KEY);
  } catch {
    // Silencioso
  }
}

// ── Servicios de Firestore ───────────────────────────────────────────────────

/**
 * Suscripción reactiva al catálogo de alimentos activos con caché Stale-While-Revalidate.
 * Carga todos los alimentos con `isActive == true`, ordenados por categoría.
 *
 * Úsalo en trainer/diets.astro y client/medical-profile.astro.
 *
 * 🔒 CRÍTICO: SIEMPRE cancelar la suscripción en `beforeunload` o `onDestroy`.
 */
export function subscribeToFoods(
  callback: (foods: FoodItem[]) => void,
): Unsubscribe {
  // 1. Emitir datos en caché inmediatamente si existen (render instantáneo)
  const cached = getCachedFoods();
  if (cached && cached.length > 0) {
    callback(cached);
  }

  const q = query(
    collection(db, 'foods_library'),
    where('isActive', '==', true),
    orderBy('category', 'asc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const foods = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FoodItem[];
      setCachedFoods(foods);
      callback(foods);
    },
    (error) => {
      logger.error('foodLibrary', 'Error al suscribirse a foods_library:', error);
      if (!cached || cached.length === 0) {
        callback([]);
      }
    },
  );
}

/**
 * Suscripción reactiva al catálogo COMPLETO de alimentos (activos e inactivos).
 * 
 * 🔒 CRÍTICO: Solo para uso en el panel de administración.
 * NUNCA usar en páginas de trainer o cliente — descargaría alimentos retirados.
 * Para trainer/cliente: usar subscribeToFoods() que filtra isActive == true.
 */
export function subscribeToAllFoods(
  callback: (foods: FoodItem[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'foods_library'),
    orderBy('category', 'asc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const foods = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FoodItem[];
      callback(foods);
    },
    (error) => {
      logger.error('foodLibrary', 'Error al suscribirse a foods_library (admin):', error);
      callback([]);
    },
  );
}

/**
 * Obtiene los alimentos de una categoría específica (una sola vez, no reactivo).
 * Útil para poblar un selector filtrado por categoría.
 */
export async function getFoodsByCategory(category: FoodCategory): Promise<FoodItem[]> {
  try {
    const q = query(
      collection(db, 'foods_library'),
      where('isActive', '==', true),
      where('category', '==', category),
      orderBy('translations.es', 'asc'),
      limit(100),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FoodItem[];
  } catch (error) {
    logger.error('foodLibrary', `Error al cargar alimentos de categoría ${category}:`, error);
    return [];
  }
}

/**
 * Busca alimentos en Firestore usando el índice `searchIndex` pre-computado.
 * Usa `array-contains` para el primer token y filtra localmente para el resto.
 *
 * @param query - Texto de búsqueda
 * @param maxResults - Límite de resultados (default: 30)
 */
export async function searchFoodsFirestore(
  searchQuery: string,
  maxResults = 30,
): Promise<FoodItem[]> {
  if (!searchQuery.trim()) return [];

  const firstToken = searchQuery
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .find((t) => t.length > 1);

  if (!firstToken) return [];

  try {
    const q = query(
      collection(db, 'foods_library'),
      where('isActive', '==', true),
      where('searchIndex', 'array-contains', firstToken),
      limit(maxResults),
    );
    const snapshot = await getDocs(q);
    const foods = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FoodItem[];
    return searchFoodsLocal(searchQuery, foods);
  } catch (error) {
    logger.error('foodLibrary', 'Error al buscar alimentos en Firestore:', error);
    return [];
  }
}

/**
 * Construye un Map de foodId → FoodItem para acceso O(1) por ID.
 * Úsalo para lookups eficientes en checkDietConflicts() y en la UI.
 */
export function buildFoodsMap(foods: FoodItem[]): Map<string, FoodItem> {
  return new Map(foods.map((f) => [f.id, f]));
}

// ── Gestión de alimentos recientes (localStorage) ────────────────────────────

const RECENT_FOODS_KEY = 'campfit_trainer_recent_foods';
const MAX_RECENT = 10;

/**
 * Obtiene los IDs de los últimos alimentos usados por un trainer.
 */
export function getRecentFoodIds(trainerId: string): string[] {
  try {
    const key = `${RECENT_FOODS_KEY}_${trainerId}`;
    return JSON.parse(localStorage.getItem(key) || '[]') as string[];
  } catch {
    return [];
  }
}

/**
 * Registra un alimento como usado recientemente por un trainer.
 * Mantiene los últimos MAX_RECENT IDs únicos.
 */
export function addToRecentFoods(trainerId: string, foodId: string): void {
  try {
    const key = `${RECENT_FOODS_KEY}_${trainerId}`;
    const recent = getRecentFoodIds(trainerId).filter((id) => id !== foodId);
    recent.unshift(foodId);
    localStorage.setItem(key, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // SSR safety o cuota excedida — ignorar
  }
}
