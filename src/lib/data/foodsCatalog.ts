/**
 * Catálogo Canónico Maestro de Alimentos — CampFit
 *
 * Fuente de Verdad Única (Single Source of Truth) para alimentos.
 * Provee datos tipados para seeds, tests, validación, fallback offline y matriz de sustitución.
 *
 * @module data/foodsCatalog
 */

import type { FoodItem, FoodCategory } from '@/lib/shared/foodLibrary';
import { generateSearchIndex } from '@/lib/shared/foodLibrary';

function calcDefaults(cal: number, pro: number, carb: number, fat: number, portion: number) {
  const f = portion / 100;
  return {
    defaultPortion: portion,
    defaultCalories: Math.round(cal * f),
    defaultProtein: Math.round(pro * f * 10) / 10,
    defaultCarbs: Math.round(carb * f * 10) / 10,
    defaultFat: Math.round(fat * f * 10) / 10,
  };
}

function food(
  id: string,
  es: string,
  en: string,
  ca: string,
  category: FoodCategory,
  cal: number,
  pro: number,
  carb: number,
  fat: number,
  portion: number,
  opts: {
    isVegan?: boolean;
    isVegetarian?: boolean;
    isGlutenFree?: boolean;
    isLactoseFree?: boolean;
    isNutFree?: boolean;
    isShellfishFree?: boolean;
    allergens?: string[];
    tags?: string[];
    substitutes?: string[];
    fiber100g?: number;
    sodium100mg?: number;
    glycemicIndex?: number;
  } = {},
): FoodItem {
  const {
    isVegan = true,
    isVegetarian = true,
    isGlutenFree = true,
    isLactoseFree = true,
    isNutFree = true,
    isShellfishFree = true,
    allergens = [],
    tags = [],
    substitutes = [],
    fiber100g,
    sodium100mg,
    glycemicIndex,
  } = opts;

  return {
    id,
    category,
    translations: { es, en, ca },
    searchIndex: generateSearchIndex({ es, en, ca }, tags),
    isVegan,
    isVegetarian,
    isGlutenFree,
    isLactoseFree,
    isNutFree,
    isShellfishFree,
    allergens,
    tags,
    substitutes,
    calories100g: cal,
    protein100g: pro,
    carbs100g: carb,
    fat100g: fat,
    ...(fiber100g !== undefined && { fiber100g }),
    ...(sodium100mg !== undefined && { sodium100mg }),
    ...(glycemicIndex !== undefined && { glycemicIndex }),
    ...calcDefaults(cal, pro, carb, fat, portion),
    isActive: true,
    createdBy: 'system',
    createdAt: null,
    updatedAt: null,
  };
}

export const FOODS_CATALOG: FoodItem[] = [
  // ── PROTEÍNAS ─────────────────────────────────────────────────────────────
  food('food-chicken-breast', 'Pechuga de pollo', 'Chicken breast', 'Pit de pollastre',
    'protein', 110, 23.1, 0, 2.4, 150, {
      isVegan: false, isVegetarian: false,
      tags: ['high-protein', 'low-fat'],
      substitutes: ['food-turkey-breast', 'food-tuna', 'food-tofu', 'food-egg-whites'],
  }),

  food('food-turkey-breast', 'Pechuga de pavo', 'Turkey breast', 'Pit de gall dindi',
    'protein', 104, 22.3, 0, 1.6, 150, {
      isVegan: false, isVegetarian: false,
      tags: ['high-protein', 'low-fat'],
      substitutes: ['food-chicken-breast', 'food-tuna', 'food-tofu', 'food-hake'],
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
      substitutes: ['food-tofu', 'food-tempeh', 'food-chickpeas', 'food-egg-whites'],
  }),

  food('food-egg-whites', 'Claras de huevo', 'Egg whites', 'Clares d\'ou',
    'protein', 52, 10.9, 0.7, 0.2, 150, {
      isVegan: false, isVegetarian: true,
      allergens: ['egg'],
      tags: ['high-protein', 'low-fat'],
      substitutes: ['food-tofu', 'food-whey-protein', 'food-chicken-breast'],
  }),

  food('food-tofu', 'Tofu firme', 'Firm tofu', 'Tofu ferm',
    'protein', 76, 8.0, 1.9, 4.5, 150, {
      isVegan: true, isVegetarian: true,
      allergens: ['soy'],
      tags: ['vegan', 'high-protein'],
      substitutes: ['food-tempeh', 'food-chicken-breast', 'food-eggs', 'food-seitan'],
  }),

  food('food-tempeh', 'Tempeh', 'Tempeh', 'Tempeh',
    'protein', 193, 18.5, 9.4, 10.8, 100, {
      isVegan: true, isVegetarian: true,
      allergens: ['soy'],
      tags: ['vegan', 'high-protein', 'fermented'],
      substitutes: ['food-tofu', 'food-chickpeas', 'food-lentils'],
  }),

  food('food-seitan', 'Seitán', 'Seitan', 'Seitan',
    'protein', 370, 75.0, 14.0, 1.9, 100, {
      isVegan: true, isVegetarian: true, isGlutenFree: false,
      allergens: ['gluten'],
      tags: ['vegan', 'high-protein'],
      substitutes: ['food-tofu', 'food-tempeh', 'food-textured-soy'],
  }),

  food('food-textured-soy', 'Soja texturizada', 'Textured soy protein', 'Soia texturitzada',
    'protein', 335, 50.0, 30.0, 1.2, 50, {
      isVegan: true, isVegetarian: true,
      allergens: ['soy'],
      tags: ['vegan', 'high-protein'],
      substitutes: ['food-seitan', 'food-tofu', 'food-lentils'],
  }),

  food('food-whey-protein', 'Proteína de suero (Whey)', 'Whey protein powder', 'Proteïna de sèrum',
    'supplements', 390, 80.0, 6.0, 5.0, 30, {
      isVegan: false, isVegetarian: true, isLactoseFree: false,
      allergens: ['lactose'],
      tags: ['supplement', 'high-protein'],
      substitutes: ['food-soy-protein', 'food-pea-protein', 'food-egg-whites'],
  }),

  food('food-soy-protein', 'Proteína de soja aislada', 'Soy protein isolate', 'Proteïna de soia',
    'supplements', 380, 85.0, 2.0, 3.0, 30, {
      isVegan: true, isVegetarian: true,
      allergens: ['soy'],
      tags: ['vegan', 'supplement', 'high-protein'],
      substitutes: ['food-pea-protein', 'food-whey-protein'],
  }),

  food('food-pea-protein', 'Proteína de guisante (Vegan)', 'Pea protein powder', 'Proteïna de pèsol',
    'supplements', 360, 80.0, 4.0, 3.0, 30, {
      isVegan: true, isVegetarian: true,
      allergens: [],
      tags: ['vegan', 'hypoallergenic', 'supplement', 'high-protein'],
      substitutes: ['food-soy-protein', 'food-whey-protein'],
  }),

  // ── CARBOHIDRATOS ─────────────────────────────────────────────────────────
  food('food-white-rice', 'Arroz blanco', 'White rice', 'Arròs blanc',
    'carbs', 130, 2.7, 28.2, 0.3, 150, {
      tags: ['gluten-free'],
      substitutes: ['food-brown-rice', 'food-quinoa', 'food-potatoes', 'food-sweet-potato'],
      glycemicIndex: 73,
  }),

  food('food-brown-rice', 'Arroz integral', 'Brown rice', 'Arròs integral',
    'carbs', 111, 2.6, 23.0, 0.9, 150, {
      tags: ['gluten-free', 'whole-grain'],
      substitutes: ['food-white-rice', 'food-quinoa', 'food-oats'],
      fiber100g: 1.8, glycemicIndex: 68,
  }),

  food('food-oats', 'Avena en copos', 'Rolled oats', 'Flocs de civada',
    'carbs', 389, 16.9, 66.3, 6.9, 50, {
      isGlutenFree: false, // Avena convencional puede contener trazas de trigo
      allergens: ['gluten'],
      tags: ['whole-grain', 'high-fiber'],
      substitutes: ['food-quinoa', 'food-buckwheat', 'food-oats-gf'],
      fiber100g: 10.6, glycemicIndex: 55,
  }),

  food('food-oats-gf', 'Avena sin gluten certificada', 'Gluten-free rolled oats', 'Civada sense gluten',
    'carbs', 389, 16.9, 66.3, 6.9, 50, {
      isGlutenFree: true,
      allergens: [],
      tags: ['gluten-free', 'whole-grain'],
      substitutes: ['food-buckwheat', 'food-quinoa', 'food-brown-rice'],
      fiber100g: 10.6, glycemicIndex: 55,
  }),

  food('food-buckwheat', 'Trigo sarraceno', 'Buckwheat', 'Fajol',
    'carbs', 343, 13.3, 71.5, 3.4, 60, {
      isGlutenFree: true,
      allergens: [],
      tags: ['gluten-free', 'whole-grain'],
      substitutes: ['food-oats-gf', 'food-quinoa', 'food-brown-rice'],
      fiber100g: 10.0, glycemicIndex: 45,
  }),

  food('food-quinoa', 'Quinoa cocida', 'Cooked quinoa', 'Quinoa cuita',
    'carbs', 120, 4.4, 21.3, 1.9, 150, {
      tags: ['gluten-free', 'complete-protein'],
      substitutes: ['food-brown-rice', 'food-buckwheat', 'food-lentils'],
      fiber100g: 2.8, glycemicIndex: 53,
  }),

  food('food-potatoes', 'Patata cocida', 'Boiled potato', 'Patata bullida',
    'carbs', 87, 1.9, 20.1, 0.1, 200, {
      tags: ['gluten-free', 'satiating'],
      substitutes: ['food-sweet-potato', 'food-white-rice', 'food-brown-rice'],
      fiber100g: 1.8, glycemicIndex: 78,
  }),

  food('food-sweet-potato', 'Boniato / Batata', 'Sweet potato', 'Moniato',
    'carbs', 86, 1.6, 20.1, 0.1, 200, {
      tags: ['gluten-free', 'low-gi'],
      substitutes: ['food-potatoes', 'food-brown-rice', 'food-quinoa'],
      fiber100g: 3.0, glycemicIndex: 63,
  }),

  food('food-pasta-wheat', 'Pasta de trigo', 'Wheat pasta', 'Pasta de blat',
    'carbs', 131, 5.0, 25.0, 1.1, 150, {
      isGlutenFree: false,
      allergens: ['gluten'],
      tags: ['carbs'],
      substitutes: ['food-pasta-gf', 'food-white-rice', 'food-quinoa'],
      glycemicIndex: 50,
  }),

  food('food-pasta-gf', 'Pasta sin gluten (Maíz/Arroz)', 'Gluten-free pasta', 'Pasta sense gluten',
    'carbs', 130, 3.0, 28.0, 0.6, 150, {
      isGlutenFree: true,
      allergens: [],
      tags: ['gluten-free'],
      substitutes: ['food-pasta-wheat', 'food-white-rice', 'food-quinoa'],
  }),

  food('food-lentils', 'Lentejas cocidas', 'Cooked lentils', 'Llenties cuites',
    'carbs', 116, 9.0, 20.1, 0.4, 150, {
      tags: ['high-protein', 'high-fiber', 'vegan'],
      substitutes: ['food-chickpeas', 'food-black-beans', 'food-tofu'],
      fiber100g: 7.9, glycemicIndex: 29,
  }),

  food('food-chickpeas', 'Garbanzos cocidos', 'Cooked chickpeas', 'Garbansos cuits',
    'carbs', 164, 8.9, 27.4, 2.6, 150, {
      tags: ['high-protein', 'high-fiber', 'vegan'],
      substitutes: ['food-lentils', 'food-black-beans', 'food-quinoa'],
      fiber100g: 7.6, glycemicIndex: 28,
  }),

  food('food-black-beans', 'Frijoles negros cocidos', 'Black beans', 'Mongetes negres',
    'carbs', 132, 8.9, 23.7, 0.5, 150, {
      tags: ['high-protein', 'high-fiber', 'vegan'],
      substitutes: ['food-lentils', 'food-chickpeas'],
      fiber100g: 8.7, glycemicIndex: 30,
  }),

  // ── GRASAS SALUDABLES & FRUTOS SECOS ──────────────────────────────────────
  food('food-olive-oil', 'Aceite de oliva virgen extra', 'Extra virgin olive oil', 'Oli d\'oliva verge extra',
    'fats', 884, 0, 0, 100.0, 15, {
      tags: ['healthy-fats', 'heart-healthy'],
      substitutes: ['food-avocado', 'food-almonds', 'food-walnuts'],
      glycemicIndex: 0,
  }),

  food('food-avocado', 'Aguacate', 'Avocado', 'Alvocat',
    'fats', 160, 2.0, 8.5, 14.7, 80, {
      tags: ['healthy-fats', 'fiber'],
      substitutes: ['food-olive-oil', 'food-almonds', 'food-walnuts'],
      fiber100g: 6.7, glycemicIndex: 15,
  }),

  food('food-peanut-butter', 'Crema de cacahuete', 'Peanut butter', 'Mantega de cacauet',
    'fats', 588, 25.0, 20.0, 50.0, 30, {
      isNutFree: false,
      allergens: ['nuts', 'peanut'],
      tags: ['energy-dense', 'nuts'],
      substitutes: ['food-sunflower-butter', 'food-tahini', 'food-almonds'],
      fiber100g: 6.0,
  }),

  food('food-sunflower-butter', 'Crema de semillas de girasol (Nut-Free)', 'Sunflower seed butter', 'Mantega de gira-sol',
    'fats', 617, 19.8, 17.5, 55.0, 30, {
      isNutFree: true,
      allergens: [],
      tags: ['nut-free', 'allergen-friendly', 'healthy-fats'],
      substitutes: ['food-peanut-butter', 'food-tahini', 'food-chia-seeds'],
  }),

  food('food-tahini', 'Tahini (Crema de sésamo)', 'Tahini sesame paste', 'Tahina de sèsam',
    'fats', 595, 17.0, 21.0, 53.8, 30, {
      allergens: ['sesame'],
      tags: ['healthy-fats', 'calcium'],
      substitutes: ['food-sunflower-butter', 'food-olive-oil'],
  }),

  food('food-almonds', 'Almendras crudas', 'Raw almonds', 'Ametlles crues',
    'fats', 579, 21.2, 21.6, 49.9, 30, {
      isNutFree: false,
      allergens: ['nuts'],
      tags: ['nuts', 'high-protein', 'magnesium'],
      substitutes: ['food-sunflower-butter', 'food-chia-seeds', 'food-walnuts'],
      fiber100g: 12.5, glycemicIndex: 15,
  }),

  food('food-walnuts', 'Nueces', 'Walnuts', 'Nous',
    'fats', 654, 15.2, 13.7, 65.2, 30, {
      isNutFree: false,
      allergens: ['nuts'],
      tags: ['nuts', 'omega3'],
      substitutes: ['food-chia-seeds', 'food-flax-seeds', 'food-sunflower-butter'],
      fiber100g: 6.7, glycemicIndex: 15,
  }),

  food('food-chia-seeds', 'Semillas de chía', 'Chia seeds', 'Llavors de chia',
    'fats', 486, 16.5, 42.1, 30.7, 15, {
      tags: ['superfood', 'omega3', 'fiber'],
      substitutes: ['food-flax-seeds', 'food-walnuts', 'food-sunflower-butter'],
      fiber100g: 34.4, glycemicIndex: 1,
  }),

  food('food-flax-seeds', 'Semillas de lino trituradas', 'Ground flaxseed', 'Llavors de lli',
    'fats', 534, 18.3, 28.9, 42.2, 15, {
      tags: ['superfood', 'omega3', 'fiber'],
      substitutes: ['food-chia-seeds', 'food-walnuts'],
      fiber100g: 27.3,
  }),

  // ── LÁCTEOS & ALTERNATIVAS ────────────────────────────────────────────────
  food('food-greek-yogurt', 'Yogur griego natural 0%', 'Greek yogurt 0% fat', 'Iogurt grec 0%',
    'dairy', 59, 10.0, 3.6, 0.4, 200, {
      isVegan: false, isVegetarian: true, isLactoseFree: false,
      allergens: ['lactose'],
      tags: ['high-protein', 'probiotics'],
      substitutes: ['food-cottage-cheese', 'food-soy-yogurt', 'food-milk-lactose-free'],
  }),

  food('food-cottage-cheese', 'Queso cottage bajo en grasa', 'Low fat cottage cheese', 'Formatge cottage',
    'dairy', 72, 11.0, 3.0, 1.5, 150, {
      isVegan: false, isVegetarian: true, isLactoseFree: false,
      allergens: ['lactose'],
      tags: ['high-protein', 'casein'],
      substitutes: ['food-greek-yogurt', 'food-tofu', 'food-soy-yogurt'],
  }),

  food('food-milk-cow', 'Leche entera de vaca', 'Whole cow milk', 'Llet sencera de vaca',
    'dairy', 61, 3.2, 4.8, 3.3, 250, {
      isVegan: false, isVegetarian: true, isLactoseFree: false,
      allergens: ['lactose'],
      tags: ['dairy'],
      substitutes: ['food-milk-lactose-free', 'food-almond-milk', 'food-soy-milk', 'food-oat-milk'],
  }),

  food('food-milk-lactose-free', 'Leche sin lactosa desnatada', 'Lactose-free skim milk', 'Llet sense lactosa',
    'dairy', 35, 3.3, 4.9, 0.2, 250, {
      isVegan: false, isVegetarian: true, isLactoseFree: true,
      allergens: [],
      tags: ['lactose-free', 'dairy'],
      substitutes: ['food-soy-milk', 'food-almond-milk', 'food-oat-milk'],
  }),

  food('food-soy-milk', 'Bebida de soja enriquecida (Vegan)', 'Soy milk fortified', 'Beguda de soia',
    'dairy', 45, 3.3, 2.0, 1.8, 250, {
      isVegan: true, isVegetarian: true, isLactoseFree: true,
      allergens: ['soy'],
      tags: ['vegan', 'lactose-free', 'high-protein'],
      substitutes: ['food-almond-milk', 'food-oat-milk', 'food-milk-lactose-free'],
  }),

  food('food-almond-milk', 'Bebida de almendras sin azúcar', 'Unsweetened almond milk', 'Beguda d\'ametlles',
    'dairy', 13, 0.4, 0.2, 1.1, 250, {
      isVegan: true, isVegetarian: true, isLactoseFree: true, isNutFree: false,
      allergens: ['nuts'],
      tags: ['vegan', 'low-calorie', 'lactose-free'],
      substitutes: ['food-oat-milk', 'food-soy-milk', 'food-milk-lactose-free'],
  }),

  food('food-oat-milk', 'Bebida de avena sin azúcar', 'Oat milk', 'Beguda de civada',
    'dairy', 48, 1.0, 8.5, 1.2, 250, {
      isVegan: true, isVegetarian: true, isLactoseFree: true, isNutFree: true,
      allergens: ['gluten'],
      tags: ['vegan', 'lactose-free', 'nut-free'],
      substitutes: ['food-soy-milk', 'food-almond-milk', 'food-milk-lactose-free'],
  }),

  food('food-soy-yogurt', 'Yogur de soja natural (Vegan)', 'Soy yogurt plain', 'Iogurt de soia',
    'dairy', 50, 4.0, 2.5, 2.3, 150, {
      isVegan: true, isVegetarian: true, isLactoseFree: true,
      allergens: ['soy'],
      tags: ['vegan', 'lactose-free'],
      substitutes: ['food-greek-yogurt', 'food-cottage-cheese'],
  }),

  // ── FRUTAS & VERDURAS ─────────────────────────────────────────────────────
  food('food-banana', 'Plátano', 'Banana', 'Plàtan',
    'fruits', 89, 1.1, 22.8, 0.3, 120, {
      tags: ['energy', 'potassium'],
      substitutes: ['food-apple', 'food-blueberries', 'food-strawberries'],
      glycemicIndex: 51,
  }),

  food('food-apple', 'Manzana', 'Apple', 'Poma',
    'fruits', 52, 0.3, 13.8, 0.2, 150, {
      tags: ['fiber', 'low-calorie'],
      substitutes: ['food-banana', 'food-blueberries', 'food-strawberries'],
      fiber100g: 2.4, glycemicIndex: 36,
  }),

  food('food-blueberries', 'Arándanos', 'Blueberries', 'Nabius',
    'fruits', 57, 0.7, 14.5, 0.3, 100, {
      tags: ['antioxidants', 'low-gi'],
      substitutes: ['food-strawberries', 'food-apple'],
      fiber100g: 2.4, glycemicIndex: 25,
  }),

  food('food-strawberries', 'Fresas', 'Strawberries', 'Maduixes',
    'fruits', 32, 0.7, 7.7, 0.3, 150, {
      tags: ['vitamin-c', 'low-calorie'],
      substitutes: ['food-blueberries', 'food-apple'],
      fiber100g: 2.0, glycemicIndex: 25,
  }),

  food('food-spinach', 'Espinacas frescas', 'Fresh spinach', 'Espinacs frescos',
    'vegetables', 23, 2.9, 3.6, 0.4, 100, {
      tags: ['iron', 'leafy-green', 'vitamins'],
      substitutes: ['food-broccoli', 'food-zucchini'],
      fiber100g: 2.2,
  }),

  food('food-broccoli', 'Brócoli al vapor', 'Steamed broccoli', 'Bròquil al vapor',
    'vegetables', 34, 2.8, 6.6, 0.4, 150, {
      tags: ['vitamins', 'anti-inflammatory'],
      substitutes: ['food-spinach', 'food-zucchini', 'food-green-beans'],
      fiber100g: 2.6,
  }),

  food('food-zucchini', 'Calabacín', 'Zucchini', 'Carbassó',
    'vegetables', 17, 1.2, 3.1, 0.3, 150, {
      tags: ['low-calorie', 'hydration'],
      substitutes: ['food-broccoli', 'food-spinach', 'food-green-beans'],
      fiber100g: 1.0,
  }),

  food('food-green-beans', 'Judías verdes al vapor', 'Steamed green beans', 'Mongetes tendres',
    'vegetables', 31, 1.8, 7.0, 0.2, 150, {
      tags: ['low-calorie', 'fiber', 'vitamins'],
      substitutes: ['food-broccoli', 'food-zucchini', 'food-spinach'],
      fiber100g: 2.7, glycemicIndex: 15,
  }),
];

/**
 * Mapa O(1) de ID a Alimento para búsquedas directas.
 */
export const FOODS_MAP = new Map<string, FoodItem>(
  FOODS_CATALOG.map((item) => [item.id, item]),
);
