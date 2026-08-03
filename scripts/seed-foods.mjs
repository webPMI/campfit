/**
 * CampFit — Seed: Biblioteca de Alimentos (foods_library)
 * =========================================================
 * Pobla la colección `foods_library` con ~80 alimentos iniciales.
 * Usa IDs fijos semánticos para que el campo `substitutes[]` funcione correctamente.
 *
 * Fuentes de datos nutricionales: USDA FoodData Central + Open Food Facts
 * Macros expresados por 100g.
 *
 * Uso:
 *   node scripts/seed-foods.mjs
 *   FIREBASE_EMULATOR=true node scripts/seed-foods.mjs
 *
 * Para limpiar y re-sembrar:
 *   FORCE_CLEAN=true node scripts/seed-foods.mjs
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Config ────────────────────────────────────────────────────────────────────

const USE_EMULATOR = process.env.FIREBASE_EMULATOR === 'true';
const FORCE_CLEAN = process.env.FORCE_CLEAN === 'true';

if (USE_EMULATOR) {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIREBASE_EMULATOR_HOST || 'localhost:8080';
  console.log('🔧 Usando Firebase Emulator:', process.env.FIRESTORE_EMULATOR_HOST);
}

if (!getApps().length) {
  try {
    const serviceAccountPath = resolve(process.cwd(), 'service-account.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
    console.log('✅ Firebase Admin inicializado con service-account.json');
  } catch {
    initializeApp();
    console.log('✅ Firebase Admin inicializado con credenciales de entorno');
  }
}

const db = getFirestore();
const COLLECTION = 'foods_library';

// ── Helper: generar searchIndex ───────────────────────────────────────────────

function generateSearchIndex(translations, tags = []) {
  const normalize = (s) =>
    s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 1);

  const tokens = new Set();
  [translations.es, translations.en, translations.ca, ...tags].forEach(s => {
    normalize(s).forEach(t => tokens.add(t));
  });
  return Array.from(tokens);
}

function calcDefaults(calories100g, protein100g, carbs100g, fat100g, portion) {
  const f = portion / 100;
  return {
    defaultPortion: portion,
    defaultCalories: Math.round(calories100g * f),
    defaultProtein: Math.round(protein100g * f * 10) / 10,
    defaultCarbs: Math.round(carbs100g * f * 10) / 10,
    defaultFat: Math.round(fat100g * f * 10) / 10,
  };
}

function food(id, es, en, ca, category, cal, pro, carb, fat, portion, {
  isVegan = true, isVegetarian = true, isGlutenFree = true, isLactoseFree = true,
  isNutFree = true, isShellfishFree = true, allergens = [], tags = [], substitutes = [],
  fiber100g, sodium100mg, glycemicIndex,
} = {}) {
  return {
    id,
    category,
    translations: { es, en, ca },
    searchIndex: generateSearchIndex({ es, en, ca }, tags),
    isVegan, isVegetarian, isGlutenFree, isLactoseFree,
    isNutFree, isShellfishFree, allergens, tags, substitutes,
    calories100g: cal, protein100g: pro, carbs100g: carb, fat100g: fat,
    ...(fiber100g !== undefined && { fiber100g }),
    ...(sodium100mg !== undefined && { sodium100mg }),
    ...(glycemicIndex !== undefined && { glycemicIndex }),
    ...calcDefaults(cal, pro, carb, fat, portion),
    isActive: true,
    createdBy: 'system',
  };
}

// ── Catálogo de alimentos ─────────────────────────────────────────────────────

const FOODS = [

  // ═══ PROTEÍNAS ═══════════════════════════════════════════════════════════════

  food('food-chicken-breast', 'Pechuga de pollo', 'Chicken breast', 'Pit de pollastre',
    'protein', 110, 23.1, 0, 2.4, 150, {
      isVegan: false, isVegetarian: false,
      tags: ['high-protein', 'low-fat'],
      substitutes: ['food-turkey-breast', 'food-tuna', 'food-tofu'],
  }),

  food('food-turkey-breast', 'Pechuga de pavo', 'Turkey breast', 'Pit de gall dindi',
    'protein', 104, 22.3, 0, 1.6, 150, {
      isVegan: false, isVegetarian: false,
      tags: ['high-protein', 'low-fat'],
      substitutes: ['food-chicken-breast', 'food-tuna', 'food-tofu'],
  }),

  food('food-beef-lean', 'Carne magra de res', 'Lean beef', 'Carn magra de vedella',
    'protein', 135, 26.1, 0, 3.1, 150, {
      isVegan: false, isVegetarian: false,
      tags: ['high-protein'],
      substitutes: ['food-chicken-breast', 'food-turkey-breast', 'food-tempeh'],
  }),

  food('food-salmon', 'Salmón', 'Salmon', 'Salmó',
    'protein', 142, 19.8, 0, 6.9, 150, {
      isVegan: false, isVegetarian: false,
      allergens: ['fish'], isShellfishFree: true,
      tags: ['high-protein', 'omega3'],
      substitutes: ['food-tuna', 'food-hake', 'food-tofu'],
      glycemicIndex: 0,
  }),

  food('food-tuna', 'Atún al natural', 'Canned tuna', 'Tonyina al natural',
    'protein', 90, 21.0, 0, 0.5, 120, {
      isVegan: false, isVegetarian: false,
      allergens: ['fish'], isShellfishFree: true,
      tags: ['high-protein', 'low-fat'],
      substitutes: ['food-salmon', 'food-hake', 'food-tofu'],
  }),

  food('food-hake', 'Merluza', 'Hake', 'Lluç',
    'protein', 80, 17.5, 0, 1.1, 150, {
      isVegan: false, isVegetarian: false,
      allergens: ['fish'], isShellfishFree: true,
      tags: ['high-protein', 'low-fat'],
      substitutes: ['food-salmon', 'food-tuna', 'food-tofu'],
  }),

  food('food-eggs', 'Huevos', 'Eggs', 'Ous',
    'protein', 155, 12.6, 1.1, 10.6, 60, {
      isVegan: false, isVegetarian: true,
      allergens: ['egg'],
      tags: ['high-protein'],
      substitutes: ['food-tofu', 'food-tempeh', 'food-chickpeas'],
  }),

  food('food-egg-whites', 'Claras de huevo', 'Egg whites', 'Clares d\'ou',
    'protein', 52, 10.9, 0.7, 0.2, 150, {
      isVegan: false, isVegetarian: true,
      allergens: ['egg'],
      tags: ['high-protein', 'low-fat'],
      substitutes: ['food-tofu', 'food-whey-protein'],
  }),

  food('food-tofu', 'Tofu firme', 'Firm tofu', 'Tofu ferm',
    'protein', 76, 8.0, 1.9, 4.5, 150, {
      isVegan: true, isVegetarian: true,
      allergens: ['soy'],
      tags: ['vegan', 'high-protein'],
      substitutes: ['food-tempeh', 'food-chicken-breast', 'food-eggs'],
  }),

  food('food-tempeh', 'Tempeh', 'Tempeh', 'Tempeh',
    'protein', 193, 18.5, 9.4, 10.8, 100, {
      isVegan: true, isVegetarian: true,
      allergens: ['soy'],
      tags: ['vegan', 'high-protein', 'fermented'],
      substitutes: ['food-tofu', 'food-chickpeas', 'food-lentils'],
  }),

  food('food-lentils', 'Lentejas cocidas', 'Cooked lentils', 'Llenties cuites',
    'protein', 116, 9.0, 20.1, 0.4, 200, {
      isVegan: true, isVegetarian: true,
      tags: ['vegan', 'high-protein', 'high-fiber'],
      fiber100g: 7.9, glycemicIndex: 32,
      substitutes: ['food-chickpeas', 'food-black-beans', 'food-tofu'],
  }),

  food('food-chickpeas', 'Garbanzos cocidos', 'Cooked chickpeas', 'Cigrons cuits',
    'protein', 164, 8.9, 27.4, 2.6, 200, {
      isVegan: true, isVegetarian: true,
      tags: ['vegan', 'high-protein', 'high-fiber'],
      fiber100g: 7.6, glycemicIndex: 28,
      substitutes: ['food-lentils', 'food-black-beans', 'food-tofu'],
  }),

  food('food-black-beans', 'Alubias negras', 'Black beans', 'Mongetes negres',
    'protein', 132, 8.9, 23.7, 0.5, 200, {
      isVegan: true, isVegetarian: true,
      tags: ['vegan', 'high-protein', 'high-fiber'],
      fiber100g: 8.7, glycemicIndex: 30,
      substitutes: ['food-lentils', 'food-chickpeas', 'food-tofu'],
  }),

  food('food-edamame', 'Edamame', 'Edamame', 'Edamame',
    'protein', 121, 11.0, 8.9, 5.0, 150, {
      isVegan: true, isVegetarian: true,
      allergens: ['soy'],
      tags: ['vegan', 'high-protein'],
      substitutes: ['food-tofu', 'food-chickpeas'],
  }),

  food('food-whey-protein', 'Proteína whey', 'Whey protein', 'Proteïna whey',
    'supplements', 380, 75.0, 7.0, 5.0, 30, {
      isVegan: false, isVegetarian: true,
      allergens: ['lactose'],
      tags: ['high-protein', 'supplement'],
      substitutes: ['food-vegan-protein'],
  }),

  food('food-vegan-protein', 'Proteína vegana', 'Vegan protein', 'Proteïna vegana',
    'supplements', 370, 72.0, 8.0, 4.0, 30, {
      isVegan: true, isVegetarian: true,
      tags: ['vegan', 'high-protein', 'supplement'],
      substitutes: ['food-whey-protein', 'food-tofu'],
  }),

  // ═══ CARBOHIDRATOS ════════════════════════════════════════════════════════════

  food('food-white-rice', 'Arroz blanco cocido', 'Cooked white rice', 'Arròs blanc cuit',
    'carbs', 130, 2.7, 28.2, 0.3, 200, {
      isVegan: true, isVegetarian: true,
      tags: ['carbs', 'low-fat'],
      glycemicIndex: 72, fiber100g: 0.4,
      substitutes: ['food-brown-rice', 'food-quinoa', 'food-pasta'],
  }),

  food('food-brown-rice', 'Arroz integral cocido', 'Cooked brown rice', 'Arròs integral cuit',
    'carbs', 112, 2.6, 23.5, 0.9, 200, {
      isVegan: true, isVegetarian: true,
      tags: ['carbs', 'whole-grain', 'high-fiber'],
      glycemicIndex: 50, fiber100g: 1.8,
      substitutes: ['food-white-rice', 'food-quinoa', 'food-pasta'],
  }),

  food('food-oat', 'Avena', 'Oats', 'Civada',
    'carbs', 389, 16.9, 66.3, 6.9, 80, {
      isVegan: true, isVegetarian: true,
      allergens: ['gluten'],
      tags: ['carbs', 'whole-grain', 'high-fiber'],
      glycemicIndex: 55, fiber100g: 10.6,
      substitutes: ['food-quinoa', 'food-gluten-free-oat', 'food-brown-rice'],
  }),

  food('food-gluten-free-oat', 'Avena sin gluten', 'Gluten-free oats', 'Civada sense gluten',
    'carbs', 385, 16.5, 65.0, 7.0, 80, {
      isVegan: true, isVegetarian: true,
      isGlutenFree: true,
      tags: ['carbs', 'gluten-free', 'whole-grain'],
      glycemicIndex: 55, fiber100g: 10.0,
      substitutes: ['food-oat', 'food-quinoa'],
  }),

  food('food-pasta', 'Pasta integral cocida', 'Cooked whole wheat pasta', 'Pasta integral cuita',
    'carbs', 124, 5.3, 26.5, 0.8, 200, {
      isVegan: true, isVegetarian: true,
      allergens: ['gluten'],
      tags: ['carbs', 'whole-grain'],
      glycemicIndex: 50,
      substitutes: ['food-rice-pasta', 'food-brown-rice', 'food-quinoa'],
  }),

  food('food-rice-pasta', 'Pasta de arroz', 'Rice pasta', 'Pasta d\'arròs',
    'carbs', 135, 3.0, 29.0, 1.0, 200, {
      isVegan: true, isVegetarian: true,
      isGlutenFree: true,
      tags: ['carbs', 'gluten-free'],
      substitutes: ['food-pasta', 'food-white-rice', 'food-quinoa'],
  }),

  food('food-whole-bread', 'Pan integral', 'Whole wheat bread', 'Pa integral',
    'carbs', 247, 9.0, 47.6, 3.4, 50, {
      isVegan: true, isVegetarian: true,
      allergens: ['gluten'],
      tags: ['carbs', 'whole-grain'],
      glycemicIndex: 51,
      substitutes: ['food-rye-bread', 'food-rice-bread', 'food-potato'],
  }),

  food('food-rye-bread', 'Pan de centeno', 'Rye bread', 'Pa de sègol',
    'carbs', 259, 8.5, 48.3, 3.3, 50, {
      isVegan: true, isVegetarian: true,
      allergens: ['gluten'],
      tags: ['carbs', 'whole-grain'],
      glycemicIndex: 58,
      substitutes: ['food-whole-bread', 'food-rice-bread'],
  }),

  food('food-rice-bread', 'Pan de arroz (sin gluten)', 'Rice bread (gluten-free)', 'Pa d\'arròs (sense gluten)',
    'carbs', 265, 5.0, 55.0, 3.0, 50, {
      isVegan: true, isVegetarian: true,
      isGlutenFree: true,
      tags: ['carbs', 'gluten-free'],
      substitutes: ['food-whole-bread', 'food-rice-pasta'],
  }),

  food('food-potato', 'Patata cocida', 'Boiled potato', 'Patata bullida',
    'carbs', 77, 2.0, 17.0, 0.1, 200, {
      isVegan: true, isVegetarian: true,
      tags: ['carbs', 'low-fat'],
      glycemicIndex: 65, fiber100g: 1.8,
      substitutes: ['food-sweet-potato', 'food-white-rice'],
  }),

  food('food-sweet-potato', 'Batata / Boniato', 'Sweet potato', 'Moniato',
    'carbs', 86, 1.6, 20.1, 0.1, 200, {
      isVegan: true, isVegetarian: true,
      tags: ['carbs', 'low-fat'],
      glycemicIndex: 44, fiber100g: 3.0,
      substitutes: ['food-potato', 'food-brown-rice'],
  }),

  food('food-quinoa', 'Quinoa cocida', 'Cooked quinoa', 'Quinoa cuita',
    'carbs', 120, 4.1, 21.3, 1.9, 200, {
      isVegan: true, isVegetarian: true,
      isGlutenFree: true,
      tags: ['carbs', 'complete-protein', 'gluten-free'],
      glycemicIndex: 53, fiber100g: 2.8,
      substitutes: ['food-brown-rice', 'food-oat', 'food-buckwheat'],
  }),

  food('food-buckwheat', 'Trigo sarraceno cocido', 'Cooked buckwheat', 'Fajol cuit',
    'carbs', 92, 3.4, 19.9, 0.6, 200, {
      isVegan: true, isVegetarian: true,
      isGlutenFree: true,
      tags: ['carbs', 'gluten-free'],
      glycemicIndex: 40,
      substitutes: ['food-quinoa', 'food-brown-rice'],
  }),

  food('food-couscous', 'Cuscús cocido', 'Cooked couscous', 'Cuscús cuit',
    'carbs', 112, 3.8, 23.2, 0.2, 200, {
      isVegan: true, isVegetarian: true,
      allergens: ['gluten'],
      tags: ['carbs'],
      glycemicIndex: 65,
      substitutes: ['food-quinoa', 'food-brown-rice'],
  }),

  // ═══ GRASAS ════════════════════════════════════════════════════════════════════

  food('food-avocado', 'Aguacate', 'Avocado', 'Alvocat',
    'fats', 160, 2.0, 8.5, 14.7, 100, {
      isVegan: true, isVegetarian: true,
      tags: ['healthy-fats', 'monounsaturated'],
      fiber100g: 6.7,
      substitutes: ['food-olive-oil', 'food-almonds'],
  }),

  food('food-olive-oil', 'Aceite de oliva virgen extra', 'Extra virgin olive oil', 'Oli d\'oliva verge extra',
    'fats', 884, 0, 0, 100, 10, {
      isVegan: true, isVegetarian: true,
      tags: ['healthy-fats', 'monounsaturated'],
      substitutes: ['food-avocado'],
  }),

  food('food-almonds', 'Almendras', 'Almonds', 'Ametlles',
    'fats', 579, 21.2, 21.7, 49.9, 25, {
      isVegan: true, isVegetarian: true,
      allergens: ['nuts'], isNutFree: false,
      tags: ['healthy-fats', 'high-protein', 'nuts'],
      substitutes: ['food-walnuts', 'food-avocado'],
  }),

  food('food-walnuts', 'Nueces', 'Walnuts', 'Nous',
    'fats', 654, 15.2, 13.7, 65.2, 25, {
      isVegan: true, isVegetarian: true,
      allergens: ['nuts'], isNutFree: false,
      tags: ['healthy-fats', 'omega3', 'nuts'],
      substitutes: ['food-almonds', 'food-chia-seeds'],
  }),

  food('food-peanut-butter', 'Mantequilla de cacahuete', 'Peanut butter', 'Mantequilla de cacauet',
    'fats', 588, 25.1, 20.1, 50.4, 30, {
      isVegan: true, isVegetarian: true,
      allergens: ['peanut'], isNutFree: false,
      tags: ['healthy-fats', 'high-protein'],
      substitutes: ['food-almonds', 'food-avocado'],
  }),

  food('food-chia-seeds', 'Semillas de chía', 'Chia seeds', 'Llavors de xia',
    'fats', 486, 16.5, 42.1, 30.7, 20, {
      isVegan: true, isVegetarian: true,
      tags: ['healthy-fats', 'omega3', 'high-fiber'],
      fiber100g: 34.4,
      substitutes: ['food-flax-seeds', 'food-walnuts'],
  }),

  food('food-flax-seeds', 'Semillas de lino', 'Flax seeds', 'Llavors de lli',
    'fats', 534, 18.3, 28.9, 42.2, 15, {
      isVegan: true, isVegetarian: true,
      tags: ['healthy-fats', 'omega3', 'high-fiber'],
      fiber100g: 27.3,
      substitutes: ['food-chia-seeds', 'food-walnuts'],
  }),

  food('food-coconut-dried', 'Coco rallado', 'Shredded coconut', 'Coco ratllat',
    'fats', 660, 6.9, 15.2, 64.5, 20, {
      isVegan: true, isVegetarian: true,
      tags: ['healthy-fats'],
      substitutes: ['food-almonds'],
  }),

  // ═══ VERDURAS ════════════════════════════════════════════════════════════════

  food('food-broccoli', 'Brócoli', 'Broccoli', 'Bròquil',
    'vegetables', 34, 2.8, 6.6, 0.4, 200, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'low-calorie', 'high-fiber'],
      fiber100g: 2.6,
      substitutes: ['food-cauliflower', 'food-spinach'],
  }),

  food('food-spinach', 'Espinacas', 'Spinach', 'Espinacs',
    'vegetables', 23, 2.9, 3.6, 0.4, 150, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'low-calorie'],
      fiber100g: 2.2,
      substitutes: ['food-broccoli', 'food-lettuce', 'food-kale'],
  }),

  food('food-carrot', 'Zanahoria', 'Carrot', 'Pastanaga',
    'vegetables', 41, 0.9, 9.6, 0.2, 150, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'low-calorie'],
      glycemicIndex: 35, fiber100g: 2.8,
      substitutes: ['food-tomato', 'food-cucumber'],
  }),

  food('food-tomato', 'Tomate', 'Tomato', 'Tomàquet',
    'vegetables', 18, 0.9, 3.9, 0.2, 150, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'low-calorie'],
      substitutes: ['food-carrot', 'food-cucumber'],
  }),

  food('food-red-pepper', 'Pimiento rojo', 'Red pepper', 'Pebre vermell',
    'vegetables', 31, 1.0, 6.0, 0.3, 150, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'low-calorie'],
      substitutes: ['food-tomato', 'food-carrot'],
  }),

  food('food-zucchini', 'Calabacín', 'Zucchini', 'Carbassó',
    'vegetables', 17, 1.2, 3.1, 0.3, 200, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'low-calorie'],
      substitutes: ['food-broccoli', 'food-cauliflower'],
  }),

  food('food-cauliflower', 'Coliflor', 'Cauliflower', 'Coliflor',
    'vegetables', 25, 1.9, 5.0, 0.3, 200, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'low-calorie', 'low-carb'],
      substitutes: ['food-broccoli', 'food-zucchini'],
  }),

  food('food-lettuce', 'Lechuga romana', 'Romaine lettuce', 'Enciam romà',
    'vegetables', 17, 1.2, 3.3, 0.3, 100, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'low-calorie'],
      substitutes: ['food-spinach'],
  }),

  food('food-cucumber', 'Pepino', 'Cucumber', 'Cogombre',
    'vegetables', 16, 0.7, 3.6, 0.1, 150, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'low-calorie'],
      substitutes: ['food-tomato', 'food-zucchini'],
  }),

  food('food-onion', 'Cebolla', 'Onion', 'Ceba',
    'vegetables', 40, 1.1, 9.3, 0.1, 80, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'condiment'],
      substitutes: ['food-garlic'],
  }),

  food('food-garlic', 'Ajo', 'Garlic', 'All',
    'vegetables', 149, 6.4, 33.1, 0.5, 5, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'condiment'],
      substitutes: ['food-onion'],
  }),

  food('food-mushrooms', 'Champiñones', 'Mushrooms', 'Xampinyons',
    'vegetables', 22, 3.1, 3.3, 0.3, 150, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'low-calorie'],
      substitutes: ['food-zucchini', 'food-broccoli'],
  }),

  food('food-green-beans', 'Judías verdes', 'Green beans', 'Mongeta tendra',
    'vegetables', 31, 1.8, 7.0, 0.1, 200, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'low-calorie', 'high-fiber'],
      fiber100g: 2.7,
      substitutes: ['food-broccoli', 'food-zucchini'],
  }),

  food('food-kale', 'Kale', 'Kale', 'Kale',
    'vegetables', 49, 4.3, 8.8, 0.9, 100, {
      isVegan: true, isVegetarian: true,
      tags: ['vegetables', 'superfood', 'high-fiber'],
      fiber100g: 3.6,
      substitutes: ['food-spinach', 'food-broccoli'],
  }),

  // ═══ FRUTAS ═══════════════════════════════════════════════════════════════════

  food('food-banana', 'Plátano', 'Banana', 'Plàtan',
    'fruits', 89, 1.1, 22.8, 0.3, 120, {
      isVegan: true, isVegetarian: true,
      tags: ['fruits', 'high-carb'],
      glycemicIndex: 51, fiber100g: 2.6,
      substitutes: ['food-mango', 'food-apple'],
  }),

  food('food-apple', 'Manzana', 'Apple', 'Poma',
    'fruits', 52, 0.3, 13.8, 0.2, 150, {
      isVegan: true, isVegetarian: true,
      tags: ['fruits', 'low-calorie'],
      glycemicIndex: 36, fiber100g: 2.4,
      substitutes: ['food-pear', 'food-banana'],
  }),

  food('food-orange', 'Naranja', 'Orange', 'Taronja',
    'fruits', 47, 0.9, 11.8, 0.1, 200, {
      isVegan: true, isVegetarian: true,
      tags: ['fruits', 'vitamin-c'],
      glycemicIndex: 43, fiber100g: 2.4,
      substitutes: ['food-strawberries', 'food-apple'],
  }),

  food('food-strawberries', 'Fresas', 'Strawberries', 'Maduixes',
    'fruits', 32, 0.7, 7.7, 0.3, 150, {
      isVegan: true, isVegetarian: true,
      tags: ['fruits', 'low-calorie', 'vitamin-c'],
      glycemicIndex: 40, fiber100g: 2.0,
      substitutes: ['food-blueberries', 'food-orange'],
  }),

  food('food-blueberries', 'Arándanos', 'Blueberries', 'Nabius',
    'fruits', 57, 0.7, 14.5, 0.3, 100, {
      isVegan: true, isVegetarian: true,
      tags: ['fruits', 'antioxidant', 'superfood'],
      glycemicIndex: 40, fiber100g: 2.4,
      substitutes: ['food-strawberries', 'food-apple'],
  }),

  food('food-pear', 'Pera', 'Pear', 'Pera',
    'fruits', 57, 0.4, 15.2, 0.1, 150, {
      isVegan: true, isVegetarian: true,
      tags: ['fruits'],
      glycemicIndex: 38, fiber100g: 3.1,
      substitutes: ['food-apple', 'food-banana'],
  }),

  food('food-mango', 'Mango', 'Mango', 'Mango',
    'fruits', 60, 0.8, 15.0, 0.4, 150, {
      isVegan: true, isVegetarian: true,
      tags: ['fruits', 'vitamin-c'],
      glycemicIndex: 51, fiber100g: 1.6,
      substitutes: ['food-banana', 'food-pineapple'],
  }),

  food('food-pineapple', 'Piña', 'Pineapple', 'Pinya',
    'fruits', 50, 0.5, 13.1, 0.1, 150, {
      isVegan: true, isVegetarian: true,
      tags: ['fruits'],
      glycemicIndex: 59, fiber100g: 1.4,
      substitutes: ['food-mango', 'food-banana'],
  }),

  food('food-kiwi', 'Kiwi', 'Kiwi', 'Kiwi',
    'fruits', 61, 1.1, 14.7, 0.5, 100, {
      isVegan: true, isVegetarian: true,
      tags: ['fruits', 'vitamin-c'],
      glycemicIndex: 52, fiber100g: 3.0,
      substitutes: ['food-orange', 'food-strawberries'],
  }),

  food('food-grapes', 'Uvas', 'Grapes', 'Raïm',
    'fruits', 69, 0.7, 18.1, 0.2, 150, {
      isVegan: true, isVegetarian: true,
      tags: ['fruits', 'high-sugar'],
      glycemicIndex: 59,
      substitutes: ['food-apple', 'food-strawberries'],
  }),

  // ═══ LÁCTEOS ══════════════════════════════════════════════════════════════════

  food('food-whole-milk', 'Leche entera', 'Whole milk', 'Llet sencera',
    'dairy', 61, 3.2, 4.8, 3.3, 250, {
      isVegan: false, isVegetarian: true,
      allergens: ['lactose'], isLactoseFree: false,
      tags: ['dairy'],
      substitutes: ['food-oat-milk', 'food-almond-milk', 'food-soy-milk'],
  }),

  food('food-greek-yogurt', 'Yogur griego natural', 'Plain Greek yogurt', 'Iogurt grec natural',
    'dairy', 97, 9.0, 3.6, 5.0, 150, {
      isVegan: false, isVegetarian: true,
      allergens: ['lactose'], isLactoseFree: false,
      tags: ['dairy', 'high-protein'],
      substitutes: ['food-soy-yogurt', 'food-cottage-cheese'],
  }),

  food('food-cottage-cheese', 'Queso fresco / Requesón', 'Cottage cheese', 'Mató / Requesó',
    'dairy', 98, 11.1, 3.4, 4.5, 150, {
      isVegan: false, isVegetarian: true,
      allergens: ['lactose'], isLactoseFree: false,
      tags: ['dairy', 'high-protein', 'low-fat'],
      substitutes: ['food-tofu', 'food-soy-yogurt'],
  }),

  food('food-mozzarella', 'Mozzarella', 'Mozzarella', 'Mozzarella',
    'dairy', 280, 17.9, 2.2, 22.4, 80, {
      isVegan: false, isVegetarian: true,
      allergens: ['lactose'], isLactoseFree: false,
      tags: ['dairy'],
      substitutes: ['food-tofu'],
  }),

  food('food-oat-milk', 'Bebida de avena', 'Oat milk', 'Beguda d\'avena',
    'beverages', 45, 1.0, 9.0, 0.7, 250, {
      isVegan: true, isVegetarian: true,
      allergens: ['gluten'],
      tags: ['vegan', 'dairy-free'],
      substitutes: ['food-almond-milk', 'food-soy-milk', 'food-whole-milk'],
  }),

  food('food-almond-milk', 'Bebida de almendra', 'Almond milk', 'Beguda d\'ametlla',
    'beverages', 17, 0.5, 2.1, 0.8, 250, {
      isVegan: true, isVegetarian: true,
      allergens: ['nuts'], isNutFree: false,
      tags: ['vegan', 'dairy-free', 'low-calorie'],
      substitutes: ['food-oat-milk', 'food-soy-milk', 'food-whole-milk'],
  }),

  food('food-soy-milk', 'Bebida de soja', 'Soy milk', 'Beguda de soja',
    'beverages', 33, 3.3, 2.4, 1.0, 250, {
      isVegan: true, isVegetarian: true,
      allergens: ['soy'],
      tags: ['vegan', 'dairy-free', 'high-protein'],
      substitutes: ['food-oat-milk', 'food-almond-milk', 'food-whole-milk'],
  }),

  food('food-soy-yogurt', 'Yogur de soja', 'Soy yogurt', 'Iogurt de soja',
    'dairy', 62, 3.8, 5.0, 2.3, 150, {
      isVegan: true, isVegetarian: true,
      allergens: ['soy'],
      tags: ['vegan', 'dairy-free'],
      substitutes: ['food-greek-yogurt', 'food-tofu'],
  }),

  // ═══ SALSAS Y CONDIMENTOS ═════════════════════════════════════════════════════

  food('food-crushed-tomato', 'Tomate triturado', 'Crushed tomatoes', 'Tomàquet triturat',
    'sauces', 24, 1.2, 5.0, 0.2, 100, {
      isVegan: true, isVegetarian: true,
      tags: ['sauce', 'low-calorie'],
  }),

  food('food-mustard', 'Mostaza', 'Mustard', 'Mostassa',
    'sauces', 66, 4.4, 5.8, 3.7, 10, {
      isVegan: true, isVegetarian: true,
      allergens: ['mustard'],
      tags: ['sauce', 'condiment'],
  }),

  food('food-tahini', 'Tahini', 'Tahini', 'Tahini',
    'sauces', 595, 17.0, 21.2, 53.8, 20, {
      isVegan: true, isVegetarian: true,
      allergens: ['sesame'],
      tags: ['sauce', 'healthy-fats'],
      substitutes: ['food-peanut-butter'],
  }),

  food('food-hummus', 'Hummus', 'Hummus', 'Hummus',
    'sauces', 166, 8.0, 14.3, 9.6, 50, {
      isVegan: true, isVegetarian: true,
      allergens: ['sesame'],
      tags: ['vegan', 'high-protein'],
      substitutes: ['food-tahini', 'food-chickpeas'],
  }),

  // ═══ SUPLEMENTOS ══════════════════════════════════════════════════════════════

  food('food-creatine', 'Creatina monohidrato', 'Creatine monohydrate', 'Creatina monohidrat',
    'supplements', 0, 0, 0, 0, 5, {
      isVegan: true, isVegetarian: true,
      tags: ['supplement'],
  }),

  food('food-bcaa', 'BCAA', 'BCAA', 'BCAA',
    'supplements', 0, 0, 0, 0, 10, {
      isVegan: true, isVegetarian: true,
      tags: ['supplement', 'high-protein'],
  }),

  food('food-maltodextrin', 'Maltodextrina', 'Maltodextrin', 'Maltodextrina',
    'supplements', 380, 0, 95.0, 0, 30, {
      isVegan: true, isVegetarian: true,
      tags: ['supplement', 'carbs'],
      glycemicIndex: 85,
  }),
];

// ── Ejecución del seed ───────────────────────────────────────────────────────

async function seedFoods() {
  console.log(`\n🌱 CampFit — Seed: Biblioteca de Alimentos`);
  console.log(`📦 Total de alimentos a sembrar: ${FOODS.length}`);

  if (FORCE_CLEAN) {
    console.log('🗑️  FORCE_CLEAN: eliminando alimentos existentes...');
    const existing = await db.collection(COLLECTION).get();
    const batch = db.batch();
    existing.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`   Eliminados: ${existing.size} documentos`);
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const foodData of FOODS) {
    const { id, ...data } = foodData;
    try {
      const ref = db.collection(COLLECTION).doc(id);
      const existing = await ref.get();

      if (existing.exists && !FORCE_CLEAN) {
        skipped++;
        continue;
      }

      await ref.set({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      created++;
      process.stdout.write('.');
    } catch (err) {
      errors++;
      console.error(`\n❌ Error con ${id}:`, err.message);
    }
  }

  console.log(`\n\n✅ Resultado:`);
  console.log(`   Creados:  ${created}`);
  console.log(`   Omitidos: ${skipped} (ya existían)`);
  console.log(`   Errores:  ${errors}`);
  console.log(`\n🎉 Seed completado. Colección: ${COLLECTION}`);
}

seedFoods().catch(err => {
  console.error('❌ Error fatal en seed:', err);
  process.exit(1);
});
