# 🍎 Especificación Técnica Viva: Biblioteca de Alimentos (`foods_library`)

> **Fuente Canónica de Datos (Single Source of Truth):** [`src/lib/data/foodsCatalog.ts`](file:///c:/Users/ink.enzo/Desktop/p/campfit/src/lib/data/foodsCatalog.ts)  
> **Validadores & Consistencia:** [`src/lib/data/foodValidators.ts`](file:///c:/Users/ink.enzo/Desktop/p/campfit/src/lib/data/foodValidators.ts)  
> **Módulo Central & Caché:** [`src/lib/shared/foodLibrary.ts`](file:///c:/Users/ink.enzo/Desktop/p/campfit/src/lib/shared/foodLibrary.ts)  
> **Chequeo de Intolerancias & Sustitutos:** [`src/lib/client/intoleranceChecker.ts`](file:///c:/Users/ink.enzo/Desktop/p/campfit/src/lib/client/intoleranceChecker.ts)  
> **UI Admin:** [`src/pages/admin/foods.astro`](file:///c:/Users/ink.enzo/Desktop/p/campfit/src/pages/admin/foods.astro)  
> **Seed Script:** [`scripts/seed-foods.mjs`](file:///c:/Users/ink.enzo/Desktop/p/campfit/scripts/seed-foods.mjs)

---

## 1. Visión General y Arquitectura

La **Biblioteca de Alimentos** es el catálogo centralizado multilenguaje (Español, Inglés, Catalán) con información nutricional completa (macronutrientes por 100g y por porción), clasificación por categorías, matriz enriquecida de sustitutos y etiquetado estricto de los 14 alérgenos de la Unión Europea.

### 🔄 Flujo de Datos y Sincronización

1. **Fuente de Verdad Única**: Los alimentos base se definen de forma tipada en [`src/lib/data/foodsCatalog.ts`](file:///c:/Users/ink.enzo/Desktop/p/campfit/src/lib/data/foodsCatalog.ts).
2. **Capa de Caché Reactiva**: [`src/lib/shared/foodLibrary.ts`](file:///c:/Users/ink.enzo/Desktop/p/campfit/src/lib/shared/foodLibrary.ts) implementa una capa `Stale-While-Revalidate` en memoria y `sessionStorage` con TTL de 5 minutos, reduciendo lecturas a Firestore.
3. **Validación Automática**: Todas las inserciones y cálculos de porciones se validan contra [`src/lib/data/foodValidators.ts`](file:///c:/Users/ink.enzo/Desktop/p/campfit/src/lib/data/foodValidators.ts) para garantizar $4P + 4C + 9G \approx \text{kcal}$ y porciones estrictamente positivas.

---

## 2. Modelo de Datos (`FoodItem`)

Colección Firestore: `foods_library/{foodId}`

```typescript
export type FoodCategory =
  | 'protein'     // 🥩 Proteínas
  | 'carbs'       // 🌾 Carbohidratos
  | 'fats'        // 🥑 Grasas
  | 'vegetables'  // 🥦 Verduras
  | 'fruits'      // 🍎 Frutas
  | 'dairy'       // 🥛 Lácteos
  | 'beverages'   // 🧃 Bebidas
  | 'supplements' // 💊 Suplementos
  | 'sauces'      // 🫙 Salsas
  | 'other';      // 📦 Otros

export interface FoodItem {
  id: string;
  category: FoodCategory;
  translations: {
    es: string;
    en: string;
    ca: string;
  };
  searchIndex: string[]; // Generado automáticamente con generateSearchIndex()
  
  // Flags dietéticos
  isVegan: boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  isLactoseFree: boolean;
  isNutFree: boolean;
  isShellfishFree: boolean;

  // Alérgenos UE (Reglamento 1169/2011)
  allergens: string[]; // Ej: ['gluten', 'lactose', 'nuts', 'eggs', 'soy', 'fish']

  tags: string[];

  // Macros por 100g
  calories100g: number;
  protein100g: number;
  carbs100g: number;
  fat100g: number;
  fiber100g?: number;
  glycemicIndex?: number;

  // Porción por defecto
  defaultPortion: number; // en gramos (ej: 150)
  defaultCalories: number;
  defaultProtein: number;
  defaultCarbs: number;
  defaultFat: number;

  // Matriz de sustitutos sugeridos
  substitutes?: string[]; // Array de foodItem IDs compatibles

  // Metadatos
  isActive: boolean; // Soft delete obligatorio
  createdBy: 'system' | string;
  createdAt: any;
  updatedAt: any;
}
```

---

## 3. Matriz de Sustitución para Alérgenos e Intolerancias

Cada alimento del catálogo cuenta con un conjunto de IDs en `substitutes[]` configurado para resolver incompatibilidades de alérgenos comunes:

| Alimento con Alérgeno | Alérgeno Detectado | Sustitutos Sugeridos Sin Alérgenos |
| :--- | :--- | :--- |
| **Crema de cacahuete** | `peanut`, `nuts` | Crema de girasol (`food-sunflower-butter`), Tahini (`food-tahini`), Chía (`food-chia-seeds`) |
| **Leche entera de vaca** | `lactose` | Leche sin lactosa (`food-milk-lactose-free`), Bebida de soja (`food-soy-milk`), Bebida de almendras (`food-almond-milk`), Bebida de avena (`food-oat-milk`) |
| **Avena en copos convencional** | `gluten` | Avena sin gluten certificada (`food-oats-gf`), Trigo sarraceno (`food-buckwheat`), Quinoa (`food-quinoa`) |
| **Pasta de trigo** | `gluten` | Pasta sin gluten (`food-pasta-gf`), Arroz blanco (`food-white-rice`), Quinoa (`food-quinoa`) |
| **Huevos** | `egg` | Tofu firme (`food-tofu`), Tempeh (`food-tempeh`), Garbanzos (`food-chickpeas`), Claras (`food-egg-whites`) |
| **Salmón / Atún** | `fish` | Pechuga de pollo (`food-chicken-breast`), Pavo (`food-turkey-breast`), Tofu (`food-tofu`) |

---

## 4. Detección de Conflictos y Sustituciones (`intoleranceChecker.ts`)

La función `checkDietConflicts()` valida una dieta frente al `MedicalProfile` del cliente evaluando 5 reglas:
1. **Alérgenos explícitos** (`allergens`)
2. **Alimentos excluidos por ID** (`excludedFoods`)
3. **Categorías excluidas** (`excludedFoodCategories`)
4. **Requisito Vegano** (`isVegan`)
5. **Requisito Vegetariano** (`isVegetarian`)

La función `suggestSubstitutes(conflictedFood, allFoods, medicalProfile, lang)` prioriza los sustitutos de `food.substitutes[]` que no generen conflictos con el cliente y ofrece un fallback dinámico por similitud de categoría y perfil proteico ($\pm 20\%$).

---

## 5. Integración en Interfaces

1. **Perfil Médico del Cliente (`src/pages/client/medical-profile.astro`)**:
   - Checkboxes de restricciones dietéticas (Gluten-free, Lactose-free, Vegan, etc.).
   - Selector de chips de exclusión por categoría (`excludedFoodCategories`).
   - Selector interactivo de exclusión de alimentos específicos por ID (`excludedFoods`).
2. **Creador y Editor de Dietas del Entrenador (`src/pages/trainer/diets.astro`)**:
   - Selector de alimentos con autocompletado y caché instantánea.
   - Cálculo automático de macros proporcionales (`calcMacrosForPortion`).
   - Detección preventiva en tiempo real de conflictos frente al cliente (`checkDietConflicts`).
3. **Visualizador de Dietas del Cliente (`src/pages/client/diets.astro`)**:
   - Nombres de alimentos traducidos en tiempo real.
   - Píldoras de alérgenos identificadas visualmente.
   - Modal interactivo de exploración y sugerencia de sustitutos compatibles (`suggestSubstitutes`).

