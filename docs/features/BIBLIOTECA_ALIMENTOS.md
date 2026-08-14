# 🍎 Feature Doc: Biblioteca de Alimentos (`foods_library`)

> **Módulo:** `src/lib/shared/foodLibrary.ts`  
> **UI Admin:** `src/pages/admin/foods.astro`  
> **Chequeo de Intolerancias:** `src/lib/client/intoleranceChecker.ts`  
> **Seed Script:** `scripts/seed-foods.mjs`

---

## 1. Visión General

La **Biblioteca de Alimentos** proporciona un catálogo centralizado de alimentos multilenguaje (Español, Inglés, Catalán) con información nutricional completa (macronutrientes por 100g y por porción por defecto), clasificación por categorías y etiquetado estricto de alérgenos de la Unión Europea (14 alérgenos estándar).

Permite a los entrenadores seleccionar alimentos precisos al crear dietas y a los clientes recibir alertas automáticas si una comida asignada entra en conflicto con sus alergias, intolerancias o restricciones dietéticas.

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

  // Alérgenos UE
  allergens: string[]; // Ej: ['gluten', 'lactose', 'nuts', 'eggs', 'soya']

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

  // Sustitutos sugeridos
  substitutes?: string[]; // Array de foodItem IDs

  // Metadatos
  isActive: boolean; // Soft delete mandatory
  createdBy: 'system' | string;
  createdAt: any;
  updatedAt: any;
}
```

---

## 3. Seguridad y Permisos (`firestore.rules`)

```javascript
match /foods_library/{foodId} {
  allow read: if isAuth();          // Cualquier usuario autenticado puede consultar
  allow create, update: if isStaff(); // Solo admin y trainer pueden crear/editar
  allow delete: if false;           // Soft delete obligatorio (isActive: false)
}
```

---

## 4. Búsqueda y Normalización

1. **Índice de búsqueda:** Se genera mediante `generateSearchIndex(translations, tags)`, tokenizando las palabras en minúsculas y sin tildes.
2. **Filtrado local:** La función `searchFoodsLocal(query, foods)` utiliza la coincidencia `startsWith` para filtrar en memoria de forma inmediata en la interfaz.

---

## 5. Detección de Conflictos (`intoleranceChecker.ts`)

La función `checkDietConflicts()` valida una dieta frente al `MedicalProfile` del cliente evaluando 5 reglas:
1. **Alérgenos explícitos** (`allergens`)
2. **Alimentos excluidos por ID** (`excludedFoods`)
3. **Categorías excluidas** (`excludedFoodCategories`)
4. **Requisito Vegano** (`isVegan`)
5. **Requisito Vegetariano** (`isVegetarian`)

---

## 6. Integración en Interfaces

1. **Perfil Médico del Cliente (`src/pages/client/medical-profile.astro`)**:
   - Checkboxes de restricciones dietéticas (Gluten-free, Lactose-free, Vegan, etc.).
   - Selector de chips de exclusión por categoría (`excludedFoodCategories`).
   - Selector interactivo en tiempo real de exclusión de alimentos específicos por ID (`excludedFoods`).
2. **Creador y Editor de Dietas del Entrenador (`src/pages/trainer/diets.astro`)**:
   - Selector de alimentos del catálogo central `foods_library`.
   - Cálculo automático de macros proporcionales al modificar la cantidad en gramos (`calcMacrosForPortion`).
   - Detección preventiva en tiempo real de conflictos y alérgenos frente al perfil del cliente (`checkDietConflicts`).
   - Alerta visual y confirmación obligatoria previa al guardado si se detectan incompatibilidades.
3. **Visualizador de Dietas del Cliente (`src/pages/client/diets.astro`)**:
   - Nombres de alimentos traducidos en tiempo real.
   - Píldoras de alérgenos identificadas visualmente.
   - Modal interactivo de sugerencia y exploración de sustitutos compatibles (`suggestSubstitutes`).
