/**
 * Utilidad para cruzar alérgenos de comidas con intolerancias del cliente.
 * Detecta conflictos potenciales entre lo que el cliente NO puede comer
 * y lo que contiene una comida.
 *
 * @module client/intoleranceChecker
 */

import type { MedicalProfile, IntoleranceEntry } from '@/types';

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