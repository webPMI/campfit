/**
 * Utilidad para cruzar alérgenos de comidas con intolerancias del cliente.
 * Detecta conflictos potenciales entre lo que el cliente NO puede comer
 * y lo que contiene una comida.
 *
 * @module client/intoleranceChecker
 */

import type { MedicalProfile, IntoleranceEntry } from '@/types';
import type { FoodItem } from '@/lib/shared/foodLibrary';
import { getFoodName } from '@/lib/shared/foodLibrary';
import type { Meal } from '@/lib/trainer/types';

export interface AllergenConflict {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  mealName: string;
  message: string;
}

/**
 * Mapa de alérgenos normalizados a sus formas comunes.
 * Ej: "lactose" / "lactosa" / "lácteos" → "lactose"
 */
const ALLERGEN_ALIASES: Record<string, string> = {
  lactose: 'lactose',
  lactosa: 'lactose',
  lácteos: 'lactose',
  dairy: 'lactose',
  gluten: 'gluten',
  trigo: 'gluten',
  wheat: 'gluten',
  nuts: 'nuts',
  frutos_secos: 'nuts',
  nueces: 'nuts',
  shellfish: 'shellfish',
  mariscos: 'shellfish',
  marisco: 'shellfish',
  egg: 'egg',
  huevo: 'egg',
  huevos: 'egg',
  soy: 'soy',
  soja: 'soy',
  fish: 'fish',
  pescado: 'fish',
};

function normalizeAllergen(raw: string): string {
  const key = raw.toLowerCase().replace(/\s+/g, '_').replace(/[áéíóú]/g, m =>
    ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }[m] || m)
  );
  return ALLERGEN_ALIASES[key] || key;
}

/**
 * Construye una lista plana de sustancias a las que el cliente es intolerante,
 * combinando `dietaryRestrictions` (flags booleanos) y `intolerances` (entradas detalladas).
 */
function getIntolerantSubstances(profile: MedicalProfile): Map<string, IntoleranceEntry> {
  const map = new Map<string, IntoleranceEntry>();

  // Restricciones dietéticas como pseudo-intolerancias
  const { dietaryRestrictions } = profile;
  if (dietaryRestrictions?.glutenFree) {
    map.set('gluten', { substance: 'gluten', severity: 'severe', symptoms: 'Restricción dietética' });
  }
  if (dietaryRestrictions?.lactoseFree) {
    map.set('lactose', { substance: 'lactose', severity: 'severe', symptoms: 'Restricción dietética' });
  }
  if (dietaryRestrictions?.nutFree) {
    map.set('nuts', { substance: 'nuts', severity: 'severe', symptoms: 'Restricción dietética' });
  }
  if (dietaryRestrictions?.shellfishFree) {
    map.set('shellfish', { substance: 'shellfish', severity: 'severe', symptoms: 'Restricción dietética' });
  }
  // other[] restricciones adicionales
  if (dietaryRestrictions?.other) {
    for (const r of dietaryRestrictions.other) {
      const normal = normalizeAllergen(r);
      if (!map.has(normal)) {
        map.set(normal, { substance: r, severity: 'moderate', symptoms: 'Restricción adicional' });
      }
    }
  }

  // Intolerancias detalladas
  if (profile.intolerances) {
    for (const entry of profile.intolerances) {
      const normal = normalizeAllergen(entry.substance);
      // Si ya existe con severity 'severe', no sobreescribir con mild/moderate
      const existing = map.get(normal);
      if (!existing || (entry.severity === 'severe' && existing.severity !== 'severe')) {
        map.set(normal, entry);
      }
    }
  }

  return map;
}

/**
 * Verifica si una comida contiene alérgenos conflictivos con el perfil médico del cliente.
 *
 * @param mealAllergens - Array de alérgenos etiquetados en la comida (ej: ["gluten", "lactose"])
 * @param mealName - Nombre de la comida para el mensaje de error
 * @param medicalProfile - Perfil médico del cliente
 * @returns Lista de conflictos encontrados (vacío si no hay conflictos)
 */
export function checkMealAllergens(
  mealAllergens: string[],
  mealName: string,
  medicalProfile: MedicalProfile
): AllergenConflict[] {
  if (!mealAllergens || mealAllergens.length === 0) return [];
  if (!medicalProfile) return [];

  const conflicts: AllergenConflict[] = [];
  const intolerances = getIntolerantSubstances(medicalProfile);

  for (const allergen of mealAllergens) {
    const normal = normalizeAllergen(allergen);
    const intolerance = intolerances.get(normal);
    if (intolerance) {
      conflicts.push({
        allergen: intolerance.substance,
        severity: intolerance.severity,
        mealName,
        message: `⚠️ ${mealName} contiene ${intolerance.substance}. Cliente tiene intolerancia ${intolerance.severity === 'severe' ? 'severa' : intolerance.severity === 'moderate' ? 'moderada' : 'leve'}.${intolerance.symptoms ? ` Síntomas: ${intolerance.symptoms}` : ''}`,
      });
    }
  }

  return conflicts;
}

/**
 * Verifica todos los alérgenos de todas las comidas de una dieta.
 *
 * @param meals - Array de comidas con sus alergenos
 * @param medicalProfile - Perfil médico del cliente
 * @returns Lista de conflictos encontrados (vacío si no hay conflictos)
 */
export function checkDietAllergens(
  meals: Array<{ name: string; allergens: string[] }>,
  medicalProfile: MedicalProfile
): AllergenConflict[] {
  const allConflicts: AllergenConflict[] = [];
  for (const meal of meals) {
    allConflicts.push(...checkMealAllergens(meal.allergens || [], meal.name, medicalProfile));
  }
  return allConflicts;
}

/**
 * Retorna si el cliente tiene intolerANCIA a una sustancia específica.
 * Útil para mostrar badges/warnings en la UI.
 *
 * @param substance - Sustancia a verificar (ej: "gluten", "lactose")
 * @param medicalProfile - Perfil médico del cliente
 */
export function hasIntolerance(substance: string, medicalProfile: MedicalProfile): boolean {
  if (!medicalProfile) return false;
  const normal = normalizeAllergen(substance);
  const intolerances = getIntolerantSubstances(medicalProfile);
  return intolerances.has(normal);
}

/**
 * Obtiene la severidad de una intolerancia.
 *
 * @returns 'mild' | 'moderate' | 'severe' | null si no tiene intolerancia
 */
export function getIntoleranceSeverity(
  substance: string,
  medicalProfile: MedicalProfile
): 'mild' | 'moderate' | 'severe' | null {
  if (!medicalProfile) return null;
  const normal = normalizeAllergen(substance);
  const intolerances = getIntolerantSubstances(medicalProfile);
  return intolerances.get(normal)?.severity || null;
}

// ── Detección extendida con foods_library ───────────────────────────────
// Los tipos FoodItem, getFoodName y Meal se importan al inicio del archivo.

/**
 * Tipo de conflicto dietético.
 * 🔒 CRÍTICO: NUNCA reducir los tipos sin revisar todos los consumidores.
 * Se usa en trainer/diets.astro para mostrar el modal de conflictos.
 */
export interface DietConflict {
  type: 'allergen' | 'excluded_food' | 'excluded_category' | 'vegan' | 'vegetarian';
  severity: 'severe' | 'moderate' | 'mild';
  mealName: string;      // Nombre de la comida donde ocurre el conflicto
  foodName: string;      // Nombre del alimento (en el idioma del cliente)
  foodId?: string;       // ID del alimento en foods_library (si aplica)
  message: string;       // Mensaje legible para mostrar al trainer
  suggestion?: string;   // Nombre del sustituto sugerido
  suggestionId?: string; // ID del sustituto en foods_library
}

/**
 * Verifica todos los conflictos de una dieta contra el perfil médico del cliente.
 * Cubre 5 tipos: alérgenos, alimento excluido, categoría excluida, vegano, vegetariano.
 *
 * 🔒 CRÍTICO: NUNCA eliminar ninguno de los 5 checks sin revisar el sistema completo.
 * El check de alérgenos (1) funciona incluso sin foodId — cubre dietas legacy.
 * Los checks 2-5 solo aplican si la comida tiene foodId (alimento del catálogo).
 *
 * @param meals - Comidas de la dieta a verificar
 * @param foods - Catálogo completo ya cargado en memoria (de subscribeToFoods)
 * @param medicalProfile - Perfil médico del cliente
 * @param lang - Idioma para los nombres de alimentos y mensajes
 */
export function checkDietConflicts(
  meals: Meal[],
  foods: FoodItem[],
  medicalProfile: MedicalProfile,
  lang: 'es' | 'en' | 'ca' = 'es'
): DietConflict[] {
  if (!medicalProfile) return [];

  const conflicts: DietConflict[] = [];
  const getFoodById = (id: string) => foods.find((f) => f.id === id);

  for (const meal of meals) {
    const food = meal.foodId ? getFoodById(meal.foodId) : undefined;
    const mealLabel = meal.name;

    // ── Check 1: Alérgenos (sistema existente, funciona con y sin foodId) ────
    // Fuente de alérgenos: meal.allergens si tiene elementos (entrada manual del trainer),
    // sino los alérgenos del alimento del catálogo (copiados al seleccionar).
    // 🔒 CRÍTICO: Comprobar length, NO usar ??, porque [] (array vacío) no activa el fallback
    // de ?? pero sí significa "sin alérgenos", ignorando los del alimento.
    const allergenSrc = (meal.allergens && meal.allergens.length > 0)
      ? meal.allergens
      : (food?.allergens ?? []);
    const allergenConflicts = checkMealAllergens(allergenSrc, mealLabel, medicalProfile);
    conflicts.push(
      ...allergenConflicts.map((c) => ({
        type: 'allergen' as const,
        severity: c.severity,
        mealName: mealLabel,
        foodName: food ? getFoodName(food, lang) : meal.description,
        foodId: meal.foodId,
        message: c.message,
      }))
    );

    // Los checks 2–5 requieren alimento del catálogo
    if (!food) continue;

    // ── Check 2: Alimento excluido explícitamente por el cliente ─────────────
    const excludedFoods = medicalProfile.excludedFoods ?? [];
    if (excludedFoods.includes(food.id)) {
      conflicts.push({
        type: 'excluded_food',
        severity: 'moderate',
        mealName: mealLabel,
        foodName: getFoodName(food, lang),
        foodId: food.id,
        message: `⚠️ ${getFoodName(food, lang)} está en la lista de exclusiones del cliente.`,
      });
    }

    // ── Check 3: Categoría excluida ───────────────────────────────────────────
    const excludedCategories = medicalProfile.excludedFoodCategories ?? [];
    if (excludedCategories.includes(food.category as any)) {
      conflicts.push({
        type: 'excluded_category',
        severity: 'moderate',
        mealName: mealLabel,
        foodName: getFoodName(food, lang),
        foodId: food.id,
        message: `⚠️ ${getFoodName(food, lang)} pertenece a la categoría "${food.category}" que el cliente ha excluido.`,
      });
    }

    // ── Check 4: Cliente vegano → alimento no vegano ─────────────────────────
    // 🔒 CRÍTICO: Cubre el GAP del sistema anterior que no detectaba esto.
    if (medicalProfile.dietaryRestrictions?.vegan && !food.isVegan) {
      conflicts.push({
        type: 'vegan',
        severity: 'severe',
        mealName: mealLabel,
        foodName: getFoodName(food, lang),
        foodId: food.id,
        message: `🔴 ${getFoodName(food, lang)} no es vegano. El cliente sigue una dieta vegana.`,
      });
    }

    // ── Check 5: Cliente vegetariano → alimento no vegetariano ───────────────
    if (medicalProfile.dietaryRestrictions?.vegetarian && !food.isVegetarian) {
      conflicts.push({
        type: 'vegetarian',
        severity: 'severe',
        mealName: mealLabel,
        foodName: getFoodName(food, lang),
        foodId: food.id,
        message: `🔴 ${getFoodName(food, lang)} no es vegetariano. El cliente sigue una dieta vegetariana.`,
      });
    }
  }

  return conflicts;
}

/**
 * Sugiere sustitutos para un alimento en conflicto, compatibles con el perfil del cliente.
 *
 * Orden de prioridad:
 * 1. Sustitutos pre-configurados en food.substitutes[] que no generen conflictos.
 * 2. Si ninguno es válido: alimentos de la misma categoría con macros similares (±20% proteína).
 *
 * @param conflictedFood - El alimento que generó el conflicto
 * @param allFoods - Catálogo completo de alimentos activos
 * @param medicalProfile - Perfil médico del cliente
 * @param lang - Idioma para nombres de alimentos
 * @param maxResults - Máximo de sustitutos a devolver (default: 3)
 */
export function suggestSubstitutes(
  conflictedFood: FoodItem,
  allFoods: FoodItem[],
  medicalProfile: MedicalProfile,
  lang: 'es' | 'en' | 'ca' = 'es',
  maxResults = 3
): FoodItem[] {
  // Helper interno: construye un Meal mínimo para testear conflictos
  const makeMockMeal = (f: FoodItem): Meal => ({
    id: f.id,
    name: 'other',
    description: getFoodName(f, lang),
    foodId: f.id,
    portionGrams: f.defaultPortion,
    calories: f.defaultCalories,
    protein: f.defaultProtein,
    carbs: f.defaultCarbs,
    fat: f.defaultFat,
    order: 0,
    allergens: f.allergens,
  });

  const isCompatible = (f: FoodItem): boolean =>
    f.isActive &&
    f.id !== conflictedFood.id &&
    checkDietConflicts([makeMockMeal(f)], allFoods, medicalProfile, lang).length === 0;

  // 1. Intentar sustitutos pre-configurados
  const preconfigured = (conflictedFood.substitutes ?? [])
    .map((id) => allFoods.find((f) => f.id === id))
    .filter((f): f is FoodItem => f !== undefined)
    .filter(isCompatible);

  if (preconfigured.length >= maxResults) return preconfigured.slice(0, maxResults);

  // 2. Fallback: misma categoría + perfil nutricional similar (±20% proteína)
  const baseProtein = conflictedFood.protein100g || 1;
  const fallback = allFoods
    .filter(
      (f) =>
        f.category === conflictedFood.category &&
        Math.abs(f.protein100g - conflictedFood.protein100g) / baseProtein <= 0.2 &&
        isCompatible(f)
    )
    .slice(0, maxResults - preconfigured.length);

  return [...preconfigured, ...fallback].slice(0, maxResults);
}