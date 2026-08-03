# 🍽️ Diseño: Biblioteca de Alimentos Multilenguaje — CampFit

> **Estado:** 📝 Documento de diseño v2.0 (pendiente de implementación)
> **Fecha:** 2026-08-03
> **Revisado por:** Análisis de sistema completo

---

## 📋 Índice

1. [Visión General](#1-visión-general)
2. [Problema Actual](#2-problema-actual)
3. [Modelo de Datos](#3-modelo-de-datos)
4. [Estructura Multilenguaje](#4-estructura-multilenguaje)
5. [Búsqueda Optimizada](#5-búsqueda-optimizada)
6. [Sistema de Sustitución Automática](#6-sistema-de-sustitución-automática)
7. [Detección de Conflictos (Extendida)](#7-detección-de-conflictos-extendida)
8. [Flujo del Trainer](#8-flujo-del-trainer)
9. [Flujo del Cliente](#9-flujo-del-cliente)
10. [Gestión del Catálogo (Admin/Staff)](#10-gestión-del-catálogo-adminstaff)
11. [Integración con Sistema Existente](#11-integración-con-sistema-existente)
12. [Reglas de Firestore](#12-reglas-de-firestore)
13. [Índices Compuestos](#13-índices-compuestos)
14. [Plan de Implementación](#14-plan-de-implementación)
15. [Claves i18n Necesarias](#15-claves-i18n-necesarias)
16. [Alimentos Iniciales (Seed)](#16-alimentos-iniciales-seed)
17. [Preguntas de Diseño Resueltas](#17-preguntas-de-diseño-resueltas)

---

## 1. Visión General

### 🎯 Objetivo

Crear un catálogo centralizado de alimentos (`foods_library`) multilenguaje (ES/EN/CA) que permita:

1. **Al trainer:** Seleccionar alimentos rápidamente al crear dietas, con macros auto-completados y detección de conflictos en tiempo real.
2. **Al cliente:** Marcar alimentos individuales como "excluidos" en su perfil médico.
3. **Al asignar una dieta:** Detectar automáticamente conflictos entre los alimentos de la dieta y las restricciones/exclusiones del cliente — incluyendo vegan/vegetariano.
4. **Al resolver conflictos:** Sugerir sustituciones automáticas compatibles con el perfil del cliente.
5. **Al admin/staff:** Gestionar el catálogo centralizado (añadir, editar, activar/desactivar alimentos).

### 🔄 Flujo Actual vs Propuesto

| Aspecto | Actual | Propuesto |
|---------|--------|-----------|
| Descripción de comidas | Texto libre (ej: "150g pechuga de pollo") | Selección de alimento + cantidad |
| Alérgenos | Checkbox manual (7 alérgenos fijos) | Automáticos según el alimento |
| Exclusiones del cliente | Solo `dietaryRestrictions` (6 flags booleanos) | Lista granular de alimentos + categorías excluidas |
| Detección de conflictos | Solo alérgenos (`intoleranceChecker`) | Alérgenos + alimentos excluidos + categorías + vegan/vegetariano |
| Sustitución | No existe | Sustitutos pre-configurados por alimento |
| Idioma en dieta | Texto del trainer (sin traducir) | Nombre del alimento traducido según idioma del cliente |
| Búsqueda | No existe | Búsqueda en 3 idiomas + tags, con índice pre-computado |
| Catálogo | No existe | Gestionado por admin/staff + trainers pueden proponer |

---

## 2. Problema Actual

### ❌ Limitaciones del sistema actual

1. **Texto libre en comidas:** El trainer escribe "150g pechuga de pollo" en `meal.description`. No hay estructura, categorización ni datos nutricionales verificados.

2. **Alérgenos manuales:** El trainer marca checkboxes de 7 alérgenos fijos. Propenso a errores y omisiones (olvida marcar "gluten" en avena, etc.).

3. **Exclusiones limitadas:** El cliente solo tiene `dietaryRestrictions` con 6 flags booleanos + `other: string[]`. No puede excluir alimentos específicos ni categorías enteras.

4. **Sin detección granular:** `intoleranceChecker` solo verifica alérgenos. No detecta:
   - Cliente vegano → dieta con pollo (**GAP CRÍTICO**)
   - Cliente vegetariano → dieta con carne
   - Alimento excluido explícitamente (ej: "no me gusta el brócoli")

5. **Sin multilenguaje:** Las descripciones están en el idioma en que el trainer las escribe. Un cliente con idioma inglés ve español.

6. **Sin sustitución:** Si se detecta un conflicto, el trainer debe buscar manualmente un sustituto compatible.

---

## 3. Modelo de Datos

### 🗄️ Nueva colección: `foods_library`

```typescript
interface FoodItem {
  id: string;                          // Auto-generado por Firestore

  category: FoodCategory;              // Categoría principal del alimento

  // 🔒 CRÍTICO: translations es un mapa con los 3 idiomas soportados.
  // NUNCA eliminar un idioma. Si se añade uno nuevo, añadirlo AQUÍ y en TODOS los documentos.
  translations: {
    es: string;                        // Nombre en español (fuente principal)
    en: string;                        // Nombre en inglés
    ca: string;                        // Nombre en catalán
  };

  // 🔒 CRÍTICO: searchIndex facilita búsqueda eficiente en Firestore.
  // Se genera automáticamente al crear/actualizar con la función generateSearchIndex().
  // NUNCA escribir manualmente — se calcula desde translations + tags.
  searchIndex: string[];               // Tokens normalizados de búsqueda (lowercase, sin tildes)

  // Propiedades dietéticas booleanas (más eficiente que tags para filtros)
  isVegan: boolean;                    // No contiene ningún producto animal
  isVegetarian: boolean;               // No contiene carne/pescado (puede tener huevo/lácteos)
  isGlutenFree: boolean;               // Sin gluten
  isLactoseFree: boolean;              // Sin lactosa
  isNutFree: boolean;                  // Sin frutos secos
  isShellfishFree: boolean;            // Sin marisco

  allergens: string[];                 // Alérgenos según Reglamento UE 1169/2011
                                       // Valores: 'gluten' | 'lactose' | 'nuts' | 'shellfish'
                                       //          | 'egg' | 'soy' | 'fish' | 'peanut'
                                       //          | 'sesame' | 'mustard' | 'celery' | 'sulphites'
                                       //          | 'lupin' | 'molluscs'

  // Macronutrientes por 100g
  calories100g: number;                // kcal por 100g
  protein100g: number;                 // Proteína (g) por 100g
  carbs100g: number;                   // Carbohidratos (g) por 100g
  fat100g: number;                     // Grasa (g) por 100g
  fiber100g?: number;                  // Fibra (g) por 100g

  // Micronutrientes por 100g (opcionales, para clientes avanzados)
  sodium100mg?: number;                // Sodio (mg) por 100g
  glycemicIndex?: number;              // Índice glucémico (0-100)
  glycemicLoad?: number;               // Carga glucémica

  // Porción por defecto
  defaultPortion: number;              // Gramos de la porción estándar
  defaultCalories: number;             // kcal para la porción por defecto
  defaultProtein: number;              // Proteína (g) para la porción por defecto
  defaultCarbs: number;                // Carbohidratos (g) para la porción por defecto
  defaultFat: number;                  // Grasa (g) para la porción por defecto

  // Sistema de sustitución (🔒 CRÍTICO: no eliminar)
  // IDs de alimentos sustitutivos de la misma categoría y perfil nutricional similar
  substitutes?: string[];              // Refs a foods_library/{foodId}

  tags: string[];                      // Tags para búsqueda y filtros
                                       // Ej: "high-protein", "low-carb", "low-fat", "whole-grain"

  // Imagen del alimento (Firebase Storage o Cloudflare R2)
  imageUrl?: string;                   // URL de la imagen (opcional)

  // Metadatos de gestión
  // 🔒 CRÍTICO: Soft delete. NUNCA eliminar documentos de foods_library.
  isActive: boolean;                   // false = no aparece en buscadores (soft delete)
  createdBy: 'system' | string;        // 'system' = pre-cargado con seed, uid = creado por staff
  createdAt: Timestamp;                // 🔒 CRÍTICO: serverTimestamp()
  updatedAt: Timestamp;                // 🔒 CRÍTICO: serverTimestamp()
}

type FoodCategory =
  | 'protein'          // Proteínas (carne, pescado, huevos, legumbres)
  | 'carbs'            // Carbohidratos (arroz, pasta, pan, patata)
  | 'fats'             // Grasas (aceite, aguacate, frutos secos)
  | 'vegetables'       // Verduras
  | 'fruits'           // Frutas
  | 'dairy'            // Lácteos
  | 'beverages'        // Bebidas
  | 'supplements'      // Suplementos (proteína en polvo, creatina, etc.)
  | 'sauces'           // Salsas y condimentos
  | 'other';           // Otros
```

### 🗄️ Modificación: `users/{userId}.medicalProfile`

Añadir campos `excludedFoods` y `excludedFoodCategories` a `MedicalProfile` en `src/types/index.ts`:

```typescript
interface MedicalProfile {
  // ... campos existentes (NO ELIMINAR) ...

  // 🔒 CRÍTICO: Alimentos excluidos granularmente por el cliente.
  // Referencia al ID del alimento en foods_library.
  // NUNCA eliminar — se usa en checkDietConflicts() al asignar dietas.
  excludedFoods?: string[];            // Array de foodItem IDs

  // 🔒 CRÍTICO: Categorías de alimentos excluidas por el cliente.
  // Complementa (no reemplaza) los flags existentes en dietaryRestrictions.
  excludedFoodCategories?: FoodCategory[];
}
```

> **⚠️ Compatibilidad:** Los campos existentes `dietaryRestrictions` (con `vegan`, `vegetarian`, `glutenFree`, etc.) se mantienen intactos. `excludedFoods` los complementa con granularidad extra.

### 🗄️ Modificación: `diets/{dietId}.meals[]`

Añadir campos opcionales en `Meal` en `src/lib/trainer/types.ts`:

```typescript
interface Meal {
  id: string;
  // 🔒 CRÍTICO: Union estricta — NUNCA cambiar a `string`.
  name: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';
  description: string;                  // Texto libre complementario (ej: "con canela")

  // 🔒 CRÍTICO: Referencia al alimento en foods_library.
  // Si se seleccionó de la lista → foodId apunta al documento.
  // Si es texto libre → foodId es undefined.
  // NUNCA eliminar — se usa en checkDietConflicts() y en la vista del cliente.
  foodId?: string;                     // Ref a foods_library/{foodId}
  portionGrams?: number;               // Cantidad en gramos (si se seleccionó de la lista)

  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  order: number;

  // 🔒 CRÍTICO: Campo allergens. NUNCA eliminar.
  // Si foodId existe: se copia automáticamente de FoodItem.allergens al seleccionar.
  // Si no hay foodId: el trainer los marca manualmente.
  allergens?: string[];
}
```

---

## 4. Estructura Multilenguaje

### 🌐 Estrategia de traducción

Los alimentos almacenan las 3 traducciones directamente en el documento de Firestore (sin queries adicionales):

```javascript
// Ejemplo de documento en foods_library
{
  id: "food-chicken-breast",
  category: "protein",
  translations: {
    es: "Pechuga de pollo",
    en: "Chicken breast",
    ca: "Pit de pollastre"
  },
  searchIndex: [
    // ES tokens
    "pechuga", "pollo",
    // EN tokens
    "chicken", "breast",
    // CA tokens
    "pit", "pollastre",
    // Tags
    "high-protein", "low-fat"
  ],
  isVegan: false,
  isVegetarian: false,
  isGlutenFree: true,
  isLactoseFree: true,
  isNutFree: true,
  isShellfishFree: true,
  allergens: [],
  calories100g: 110,
  protein100g: 23.1,
  carbs100g: 0,
  fat100g: 2.4,
  defaultPortion: 150,
  defaultCalories: 165,
  defaultProtein: 34.7,
  defaultCarbs: 0,
  defaultFat: 3.6,
  substitutes: ["food-turkey-breast", "food-tuna", "food-tofu"],
  tags: ["high-protein", "low-fat"],
  isActive: true,
  createdBy: "system",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### 🌐 Helper de resolución de idioma

```typescript
// src/lib/shared/foodLibrary.ts

// 🔒 CRÍTICO: Fallback chain: idioma solicitado → español → inglés → 'Unknown'
function getFoodName(food: FoodItem, lang: 'es' | 'en' | 'ca'): string {
  return food.translations[lang]
    || food.translations.es
    || food.translations.en
    || 'Unknown';
}
```

---

## 5. Búsqueda Optimizada

### 🔍 Problema con búsqueda naive en Firestore

Firestore no tiene búsqueda full-text nativa. La estrategia naive de traer todos los documentos y filtrar en cliente escala mal con 500+ alimentos.

### ✅ Solución: `searchIndex` pre-computado

El campo `searchIndex: string[]` contiene tokens normalizados (lowercase, sin tildes, sin espacios extras). Se genera automáticamente al crear/actualizar un alimento.

```typescript
// src/lib/shared/foodLibrary.ts

/**
 * Genera el índice de búsqueda pre-computado para un alimento.
 * Se llama antes de guardar en Firestore.
 */
export function generateSearchIndex(
  translations: FoodItem['translations'],
  tags: string[]
): string[] {
  const normalize = (s: string) =>
    s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 1); // descartar tokens de 1 char

  const tokens = new Set<string>();
  [translations.es, translations.en, translations.ca, ...tags].forEach(s => {
    normalize(s).forEach(t => tokens.add(t));
  });
  return Array.from(tokens);
}

/**
 * Búsqueda en el índice pre-computado.
 * Para Firestore: usar query `array-contains` con un token.
 * Para búsqueda multi-token: filtrar localmente los resultados del primer token.
 */
export function searchFoodsLocal(query: string, foods: FoodItem[]): FoodItem[] {
  const tokens = query.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 1);

  if (tokens.length === 0) return foods;

  return foods.filter(f =>
    tokens.every(token =>
      f.searchIndex.some(idx => idx.includes(token))
    )
  );
}
```

### Estrategia de query en Firestore

```typescript
// Para el primer token: Firestore array-contains query
const q = query(
  collection(db, 'foods_library'),
  where('isActive', '==', true),
  where('searchIndex', 'array-contains', firstToken),
  orderBy('category'),
  limit(50)
);

// Para tokens adicionales: filtrar localmente el resultado
const results = await getDocs(q);
const foods = results.docs.map(d => d.data() as FoodItem);
return searchFoodsLocal(query, foods); // filtra por todos los tokens
```

---

## 6. Sistema de Sustitución Automática

### 🔄 Objetivo

Cuando se detecta un conflicto (alérgeno, alimento excluido, categoría excluida, vegano/vegetariano), el sistema puede sugerir sustitutos automáticamente. Esto ahorra tiempo al trainer.

### Modelo

Cada `FoodItem` tiene un campo `substitutes?: string[]` con IDs de alimentos de reemplazo. Se pre-configura en el seed y puede editarse desde la UI de admin.

```typescript
// Ejemplo en foods_library
{ id: "food-salmon",      substitutes: ["food-tuna", "food-hake", "food-tofu"] }
{ id: "food-milk",        substitutes: ["food-oat-milk", "food-almond-milk", "food-soy-milk"] }
{ id: "food-wheat-bread", substitutes: ["food-rice-bread", "food-corn-bread"] }
```

### Algoritmo de sustitución

```typescript
// src/lib/client/intoleranceChecker.ts

/**
 * Sugiere sustitutos para un alimento en conflicto, compatibles con el perfil del cliente.
 *
 * Orden de prioridad:
 * 1. Sustitutos pre-configurados en food.substitutes[] que pasen el checker de conflictos.
 * 2. Si ninguno de los pre-configurados es válido: buscar en la misma categoría
 *    con perfil nutricional similar (±20% en proteína/calorías).
 */
export function suggestSubstitutes(
  conflictedFood: FoodItem,
  allFoods: FoodItem[],
  medicalProfile: MedicalProfile,
  lang: 'es' | 'en' | 'ca' = 'es'
): FoodItem[] {
  const candidateIds = conflictedFood.substitutes || [];

  // 1. Intentar sustitutos pre-configurados
  const preconfigured = candidateIds
    .map(id => allFoods.find(f => f.id === id && f.isActive))
    .filter((f): f is FoodItem => f !== undefined)
    .filter(f => checkDietConflicts([{ foodId: f.id, name: 'other', allergens: f.allergens, calories: f.defaultCalories, protein: f.defaultProtein, carbs: f.defaultCarbs, fat: f.defaultFat, id: f.id, description: '', order: 0 }], allFoods, medicalProfile, lang).length === 0);

  if (preconfigured.length > 0) return preconfigured.slice(0, 3);

  // 2. Fallback: misma categoría + perfil nutricional similar
  return allFoods
    .filter(f =>
      f.isActive &&
      f.id !== conflictedFood.id &&
      f.category === conflictedFood.category &&
      Math.abs(f.protein100g - conflictedFood.protein100g) / (conflictedFood.protein100g || 1) <= 0.2 &&
      checkDietConflicts([{ foodId: f.id, name: 'other', allergens: f.allergens, calories: f.defaultCalories, protein: f.defaultProtein, carbs: f.defaultCarbs, fat: f.defaultFat, id: f.id, description: '', order: 0 }], allFoods, medicalProfile, lang).length === 0
    )
    .slice(0, 3);
}
```

---

## 7. Detección de Conflictos (Extendida)

### ⚠️ Tipos de conflicto

```typescript
// 🔒 CRÍTICO: Extender — NUNCA reducir los tipos sin revisar todos los consumidores.
interface DietConflict {
  type: 'allergen' | 'excluded_food' | 'excluded_category' | 'vegan' | 'vegetarian';
  severity: 'severe' | 'moderate' | 'mild';
  mealName: string;        // Nombre de la comida donde ocurre el conflicto
  foodName: string;        // Nombre del alimento (en el idioma del cliente)
  foodId?: string;         // ID del alimento en foods_library
  message: string;         // Mensaje legible para mostrar al trainer
  suggestion?: string;     // Sustituto sugerido (nombre en idioma del cliente)
  suggestionId?: string;   // ID del sustituto en foods_library
}
```

### Función principal

```typescript
// src/lib/client/intoleranceChecker.ts

/**
 * Verifica todos los conflictos de una dieta contra el perfil médico del cliente.
 * Cubre: alérgenos, alimentos excluidos, categorías excluidas,
 *        restricciones vegan/vegetariano y otras dietaryRestrictions.
 *
 * 🔒 CRÍTICO: NUNCA eliminar ninguno de los 5 checks sin revisar el resto del sistema.
 *
 * @param meals - Comidas de la dieta
 * @param foods - Catálogo completo de foods_library (ya cargado en memoria)
 * @param medicalProfile - Perfil médico del cliente
 * @param lang - Idioma para los mensajes y nombres de alimentos
 */
export function checkDietConflicts(
  meals: Meal[],
  foods: FoodItem[],
  medicalProfile: MedicalProfile,
  lang: 'es' | 'en' | 'ca' = 'es'
): DietConflict[] {
  const conflicts: DietConflict[] = [];
  const getFoodById = (id: string) => foods.find(f => f.id === id);

  for (const meal of meals) {
    const food = meal.foodId ? getFoodById(meal.foodId) : undefined;
    const mealLabel = meal.name; // se traducirá con i18n en la UI

    // ── Check 1: Alérgenos (sistema existente, extendido) ─────────────────────
    const allergenConflicts = checkMealAllergens(
      meal.allergens || (food?.allergens ?? []),
      mealLabel,
      medicalProfile
    );
    conflicts.push(...allergenConflicts.map(c => ({
      type: 'allergen' as const,
      severity: c.severity,
      mealName: mealLabel,
      foodName: food ? getFoodName(food, lang) : meal.description,
      foodId: meal.foodId,
      message: c.message,
    })));

    if (!food) continue; // Si no hay foodId, los checks 2-5 no aplican

    // ── Check 2: Alimento excluido explícitamente ──────────────────────────────
    const excludedFoods = medicalProfile.excludedFoods || [];
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

    // ── Check 3: Categoría excluida ────────────────────────────────────────────
    const excludedCategories = medicalProfile.excludedFoodCategories || [];
    if (excludedCategories.includes(food.category)) {
      conflicts.push({
        type: 'excluded_category',
        severity: 'moderate',
        mealName: mealLabel,
        foodName: getFoodName(food, lang),
        foodId: food.id,
        message: `⚠️ ${getFoodName(food, lang)} pertenece a la categoría "${food.category}" que el cliente ha excluido.`,
      });
    }

    // ── Check 4: Cliente vegano → alimento no vegano ──────────────────────────
    // 🔒 CRÍTICO: Este check cubre el GAP del sistema anterior que no detectaba
    // alimentos no veganos para clientes veganos.
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
```

### UI de conflictos al asignar dieta

```
┌─────────────────────────────────────────┐
│  Asignar Dieta a Juan Pérez             │
├─────────────────────────────────────────┤
│  ⚠️ CONFLICTOS DETECTADOS (3):          │
│                                         │
│  🔴 SEVERO — Vegano                     │
│     Pechuga de pollo (Comida: Almuerzo) │
│     → El cliente es vegano              │
│     [🔄 Sustituir por Tofu]             │
│                                         │
│  🔴 SEVERO — Alérgeno: Gluten           │
│     Avena (Comida: Desayuno)            │
│     → Intolerancia severa               │
│     [🔄 Sustituir por Arroz inflado]    │
│                                         │
│  🟡 MODERADO — Alimento excluido        │
│     Plátano (Comida: Snack)             │
│     → Juan lo ha excluido manualmente  │
│     [🔄 Sustituir por Pera]             │
│                                         │
│  [✅ Aplicar todas las sustituciones]   │
│  [⚠️ Ignorar conflictos y asignar]     │
└─────────────────────────────────────────┘
```

---

## 8. Flujo del Trainer

### 📝 Editor de dieta con selector de alimentos

```
┌─────────────────────────────────────────────────┐
│  Editor de Dieta                                 │
├─────────────────────────────────────────────────┤
│  Desayuno                                       │
│  ┌───────────────────────────────────────────┐  │
│  │ [🥣 Proteínas] [🍞 Carbos] [🥦 Verduras]│  │  ← Tabs de categoría
│  │ [🍎 Frutas] [🧀 Lácteos] [🔍 Buscar]   │  │
│  │                                           │  │
│  │ 🥣 Avena          150g  |  572kcal 🔍   │  │  ← Alimento añadido
│  │    P: 21g | C: 88g | F: 10g   [✕]      │  │
│  │                                           │  │
│  │ [Buscar o filtrar alimento...]            │  │
│  │                                           │  │
│  │ 💡 Recientes: Pollo | Arroz | Salmón     │  │  ← Últimos 5 usados
│  └───────────────────────────────────────────┘  │
│  Descripción extra: "con canela"                 │
│  Total desayuno: 572kcal | P:21g C:88g F:10g    │
└─────────────────────────────────────────────────┘
```

### Pasos de selección:

1. Trainer abre el editor de una comida (desayuno, almuerzo, etc.)
2. Puede filtrar por categoría (tabs) o buscar por texto en los 3 idiomas
3. Selecciona un alimento → se auto-completan macros según porción por defecto
4. Puede ajustar la porción en gramos → macros se recalculan en tiempo real
5. Puede añadir texto libre en `description` (ej: "con aceite de oliva")
6. Los alérgenos se asignan automáticamente desde `food.allergens`

### Alimentos recientes

```typescript
// Guardar en localStorage del trainer los últimos 10 foodIds usados
const RECENT_FOODS_KEY = 'campfit_trainer_recent_foods';

function getRecentFoods(trainerId: string): string[] {
  const key = `${RECENT_FOODS_KEY}_${trainerId}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function addToRecentFoods(trainerId: string, foodId: string): void {
  const key = `${RECENT_FOODS_KEY}_${trainerId}`;
  const recent = getRecentFoods(trainerId).filter(id => id !== foodId);
  recent.unshift(foodId); // más reciente primero
  localStorage.setItem(key, JSON.stringify(recent.slice(0, 10)));
}
```

---

## 9. Flujo del Cliente

### 🚫 Marcar alimentos como excluidos (en `/client/medical-profile`)

```
┌─────────────────────────────────────────┐
│  Preferencias Alimentarias              │
├─────────────────────────────────────────┤
│  Restricciones generales:               │
│  ☐ Sin gluten  ☐ Sin lactosa           │
│  ☐ Vegano      ☐ Vegetariano           │
│  ☐ Sin frutos secos  ☐ Sin marisco     │
│                                         │
│  Alimentos que NO como:                 │
│  [Buscar alimento para excluir...] 🔍  │
│                                         │
│  ❌ Cerdo         [Quitar exclusión]   │
│  ❌ Brócoli       [Quitar exclusión]   │
│  ❌ Leche de soja [Quitar exclusión]   │
│                                         │
│  Categorías excluidas:                  │
│  ☑ Lácteos                             │
│                                         │
│  [Guardar]                              │
└─────────────────────────────────────────┘
```

### Vista de dieta del cliente (con nombres traducidos)

El cliente ve su dieta asignada con el nombre del alimento en **su idioma**, no el del trainer:

```
Desayuno
  🥣 Oat flakes — 150g — 572kcal
     P: 21g | C: 88g | F: 10g
     ℹ️ Contains: gluten
  🍌 Banana — 100g — 89kcal
```

Implementación en `client/diets.astro`:

```typescript
// Si la comida tiene foodId, mostrar el nombre traducido
const lang = getCurrentLang(); // 'es' | 'en' | 'ca'
const displayName = meal.foodId
  ? getFoodName(foodsMap[meal.foodId], lang)
  : meal.description; // Fallback a texto libre
```

---

## 10. Gestión del Catálogo (Admin/Staff)

### 🎯 Decisión de diseño: ¿quién puede editar el catálogo?

**Decisión:** El catálogo es gestionado **exclusivamente por admin/staff**. Los trainers NO pueden añadir alimentos directamente.

**Razón:** Mantiene la consistencia y calidad de los datos nutricionales. Los trainers pueden usar texto libre en `meal.description` si el alimento no está en el catálogo.

**Extensión futura:** Se puede añadir un flujo de "propuesta de alimento" donde el trainer propone y el admin aprueba.

### UI de Admin (`/admin/foods` — nueva página)

```
┌──────────────────────────────────────────────────┐
│  Biblioteca de Alimentos                          │
│  [🔍 Buscar] [+ Añadir alimento] [📊 Exportar]   │
├──────────────────────────────────────────────────┤
│  Filtros: [Categoría ▾] [Activo ▾] [Idioma ▾]   │
├──────────────────────────────────────────────────┤
│  Pechuga de pollo  | Proteínas | Activo | ✏️ 🗑️  │
│  Arroz blanco      | Carbos    | Activo | ✏️ 🗑️  │
│  Aguacate          | Grasas    | Activo | ✏️ 🗑️  │
└──────────────────────────────────────────────────┘
```

---

## 11. Integración con Sistema Existente

### 🔗 Archivos a modificar/crear

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/lib/shared/foodLibrary.ts` | **CREAR** | Tipos `FoodItem`/`FoodCategory`, `getFoodName()`, `generateSearchIndex()`, `searchFoodsLocal()`, `subscribeToFoods()` |
| `src/lib/client/intoleranceChecker.ts` | **MODIFICAR** | Añadir `checkDietConflicts()` y `suggestSubstitutes()` |
| `src/lib/trainer/types.ts` | **MODIFICAR** | Añadir `foodId?`, `portionGrams?` a `Meal` |
| `src/types/index.ts` | **MODIFICAR** | Añadir `excludedFoods?`, `excludedFoodCategories?` a `MedicalProfile` |
| `src/pages/trainer/diets.astro` | **MODIFICAR** | Selector de alimentos en el editor de dietas |
| `src/pages/client/medical-profile.astro` | **MODIFICAR** | Selector de exclusiones de alimentos |
| `src/pages/client/diets.astro` | **MODIFICAR** | Mostrar nombre traducido del alimento si tiene `foodId` |
| `src/pages/admin/foods.astro` | **CREAR** | Página de gestión del catálogo (admin/staff) |
| `src/lib/admin/foodsAdmin.ts` | **CREAR** | CRUD de alimentos para admin |
| `firestore.rules` | **MODIFICAR** | Añadir reglas para `foods_library` |
| `firestore.indexes.json` | **MODIFICAR** | Añadir índice compuesto |
| `src/i18n/locales/es.ts` | **MODIFICAR** | Añadir claves `food.*` |
| `src/i18n/locales/en.ts` | **MODIFICAR** | Añadir claves `food.*` |
| `src/i18n/locales/ca.ts` | **MODIFICAR** | Añadir claves `food.*` |
| `scripts/seed-foods.mjs` | **CREAR** | Poblar `foods_library` con ~80 alimentos iniciales |
| `tests/unit/lib/foodLibrary.test.ts` | **CREAR** | Tests unitarios: `generateSearchIndex`, `searchFoodsLocal`, `getFoodName` |
| `tests/unit/lib/intoleranceChecker.test.ts` | **MODIFICAR** | Tests para `checkDietConflicts` (5 checks) y `suggestSubstitutes` |

### 🔗 Compatibilidad con datos existentes

- Las dietas existentes con `description` en texto libre seguirán funcionando — `foodId` es opcional.
- `excludedFoods` es opcional en `MedicalProfile` — si no está, no hay exclusiones granulares.
- `intoleranceChecker.checkDietAllergens()` sigue funcionando sin cambios para dietas sin `foodId`.
- `checkDietConflicts()` es **nueva función** que reemplaza `checkDietAllergens` en el flujo de asignación.

---

## 12. Reglas de Firestore

```javascript
// ── Biblioteca de Alimentos ──────────────────────────────────────────────────
// 🔒 CRÍTICO: Cualquier usuario autenticado puede leer foods_library.
// Solo staff (admin/trainer con rol staff) puede crear/editar/desactivar.
// NUNCA permitir delete físico — usar isActive: false.
match /foods_library/{foodId} {
  allow read: if isAuth();
  allow create, update: if isStaff();
  allow delete: if false; // 🔒 CRÍTICO: Soft delete only. NUNCA delete físico.
}
```

---

## 13. Índices Compuestos

```json
{
  "indexes": [
    {
      "collectionGroup": "foods_library",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "foods_library",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "searchIndex", "arrayConfig": "CONTAINS" }
      ]
    }
  ]
}
```

---

## 14. Plan de Implementación

### Fase 1 — Infraestructura de datos (sin UI)
- [ ] Crear `src/lib/shared/foodLibrary.ts` con tipos, helpers y funciones de búsqueda
- [ ] Modificar `src/lib/trainer/types.ts` — añadir `foodId?`, `portionGrams?` a `Meal`
- [ ] Modificar `src/types/index.ts` — añadir `excludedFoods?`, `excludedFoodCategories?` a `MedicalProfile`
- [ ] Añadir reglas de Firestore para `foods_library`
- [ ] Añadir índices compuestos en `firestore.indexes.json`
- [ ] Crear `scripts/seed-foods.mjs` con 80 alimentos iniciales (con macros reales, sustitutos, booleans)
- [ ] Ejecutar seed y verificar datos en Firestore

### Fase 2 — Tests y detección de conflictos
- [ ] Crear `tests/unit/lib/foodLibrary.test.ts`
- [ ] Añadir `checkDietConflicts()` a `intoleranceChecker.ts`
- [ ] Añadir `suggestSubstitutes()` a `intoleranceChecker.ts`
- [ ] Actualizar tests de `intoleranceChecker.test.ts` con los 5 nuevos checks
- [ ] Integrar `checkDietConflicts()` en `templateService.applyDietTemplateToClient()`

### Fase 3 — UI del Trainer (selector de alimentos en `trainer/diets.astro`)
- [ ] Carga de `foods_library` con `subscribeToFoods()`
- [ ] Tabs de categoría + campo de búsqueda en tiempo real
- [ ] Selección de alimento → autocompletado de macros
- [ ] Ajuste de porción → recalculo de macros en vivo
- [ ] Alimentos recientes (localStorage por trainer)
- [ ] Alérgenos automáticos al seleccionar alimento

### Fase 4 — UI del Cliente (perfil médico)
- [ ] Selector de exclusiones en `client/medical-profile.astro`
- [ ] Guardar en `medicalProfile.excludedFoods` y `excludedFoodCategories`
- [ ] Vista de dieta del cliente con nombres traducidos (`client/diets.astro`)

### Fase 5 — Detección al asignar dieta
- [ ] Modal de conflictos al asignar desde plantilla
- [ ] Botón "Sustituir automáticamente" usando `suggestSubstitutes()`
- [ ] Botón "Ignorar conflictos y asignar" con confirmación
- [ ] Aplicar sustituciones en lote

### Fase 6 — Gestión del catálogo (Admin)
- [ ] Crear página `src/pages/admin/foods.astro`
- [ ] Crear `src/lib/admin/foodsAdmin.ts` (CRUD)
- [ ] Lista de alimentos con búsqueda + filtros
- [ ] Formulario de alta/edición de alimento
- [ ] Toggle de `isActive` (soft delete)

### Fase 7 — i18n y pulido
- [ ] Añadir claves `food.*` en `es.ts`, `en.ts`, `ca.ts`
- [ ] Traducir nombres de categorías
- [ ] Añadir `data-i18n` attributes para hydratación client-side

---

## 15. Claves i18n Necesarias

```typescript
// Añadir a src/i18n/locales/es.ts | en.ts | ca.ts

food: {
  search: {
    placeholder: "Buscar alimento..." | "Search food..." | "Cercar aliment...",
    noResults: "No se encontraron alimentos" | "No foods found" | "No s'han trobat aliments",
  },
  category: {
    protein:     "Proteínas"     | "Proteins"     | "Proteïnes",
    carbs:       "Carbohidratos" | "Carbohydrates" | "Hidrats de carboni",
    fats:        "Grasas"        | "Fats"          | "Greixos",
    vegetables:  "Verduras"      | "Vegetables"    | "Verdures",
    fruits:      "Frutas"        | "Fruits"        | "Fruites",
    dairy:       "Lácteos"       | "Dairy"         | "Lactis",
    beverages:   "Bebidas"       | "Beverages"     | "Begudes",
    supplements: "Suplementos"   | "Supplements"   | "Suplements",
    sauces:      "Salsas"        | "Sauces"        | "Salses",
    other:       "Otros"         | "Other"         | "Altres",
  },
  portion: {
    grams:  "Porción (g)"   | "Portion (g)"   | "Porció (g)",
    adjust: "Ajustar porción" | "Adjust portion" | "Ajustar porció",
  },
  excluded: {
    title:   "Alimentos que no como"  | "Foods I don't eat"   | "Aliments que no menjo",
    add:     "Excluir alimento"       | "Exclude food"        | "Excloure aliment",
    remove:  "Quitar exclusión"       | "Remove exclusion"    | "Treure exclusió",
    categories: "Categorías excluidas" | "Excluded categories" | "Categories excloses",
  },
  conflict: {
    title:       "Conflictos detectados"          | "Detected conflicts"          | "Conflictes detectats",
    allergen:    "Alérgeno"                        | "Allergen"                    | "Al·lergogen",
    excluded:    "Alimento excluido por el cliente" | "Food excluded by client"   | "Aliment exclos pel client",
    category:    "Categoría excluida"              | "Excluded category"           | "Categoria exclosa",
    vegan:       "No vegano"                       | "Not vegan"                   | "No vegà",
    vegetarian:  "No vegetariano"                  | "Not vegetarian"             | "No vegetarià",
    suggest:     "Sugerir sustitución"             | "Suggest replacement"         | "Suggerir substitució",
    substituteAll: "Aplicar todas las sustituciones" | "Apply all substitutions"  | "Aplicar totes les substitucions",
    ignore:      "Ignorar y asignar igualmente"   | "Ignore and assign anyway"    | "Ignorar i assignar igualment",
  },
  badge: {
    vegan:       "Vegano"       | "Vegan"       | "Vegà",
    vegetarian:  "Vegetariano"  | "Vegetarian"  | "Vegetarià",
    glutenFree:  "Sin gluten"   | "Gluten-free" | "Sense gluten",
    lactoseFree: "Sin lactosa"  | "Lactose-free"| "Sense lactosa",
  },
  recent: "Recientes"   | "Recent"   | "Recents",
  macros: {
    calories: "Calorías"   | "Calories"   | "Calories",
    protein:  "Proteína"   | "Protein"    | "Proteïna",
    carbs:    "Carbos"     | "Carbs"      | "Carbohidrats",
    fat:      "Grasa"      | "Fat"        | "Greix",
    fiber:    "Fibra"      | "Fiber"      | "Fibra",
  }
}
```

---

## 16. Alimentos Iniciales (Seed ~80)

### Proteínas (15)
| Alimento | kcal/100g | P | C | F | Vegano | Alérgenos |
|----------|-----------|---|---|---|--------|-----------|
| Pechuga de pollo | 110 | 23 | 0 | 2.4 | ❌ | — |
| Pechuga de pavo | 104 | 22 | 0 | 2 | ❌ | — |
| Carne magra de res | 135 | 26 | 0 | 3 | ❌ | — |
| Salmón | 142 | 20 | 0 | 7 | ❌ | fish |
| Atún (en agua) | 90 | 21 | 0 | 0.5 | ❌ | fish |
| Merluza | 80 | 18 | 0 | 1 | ❌ | fish |
| Huevos | 155 | 13 | 1 | 11 | ❌ | egg |
| Claras de huevo | 52 | 11 | 0.7 | 0.2 | ❌ | egg |
| Tofu firme | 76 | 8 | 2 | 4.5 | ✅ | soy |
| Tempeh | 193 | 19 | 9 | 11 | ✅ | soy |
| Lentejas (cocidas) | 116 | 9 | 20 | 0.4 | ✅ | — |
| Garbanzos (cocidos) | 164 | 9 | 27 | 3 | ✅ | — |
| Proteína whey | 380 | 75 | 7 | 5 | ❌ | lactose |
| Proteína vegana | 370 | 72 | 8 | 4 | ✅ | — |
| Edamame | 121 | 11 | 9 | 5 | ✅ | soy |

### Carbohidratos (12)
Arroz blanco, Arroz integral, Avena, Pasta integral, Pan integral, Pan de centeno, Patata, Batata, Quinoa, Cuscús, Pan de arroz (sin gluten), Yuca

### Grasas (8)
Aguacate, Aceite de oliva (15ml), Almendras, Nueces, Mantequilla de cacahuete, Semillas de chía, Semillas de lino, Coco rallado

### Verduras (15)
Brócoli, Espinacas, Zanahoria, Tomate, Pimiento rojo, Calabacín, Coliflor, Lechuga romana, Pepino, Cebolla, Ajo, Setas, Judías verdes, Rúcula, Apio

### Frutas (10)
Plátano, Manzana, Naranja, Fresas, Arándanos, Pera, Uva, Piña, Mango, Kiwi

### Lácteos (8)
Leche entera, Leche semidesnatada, Yogur griego, Queso fresco, Requesón, Mozzarella, Bebida de avena, Bebida de almendra

### Salsas y Condimentos (4)
Aceite de oliva virgen extra, Tomate triturado, Mostaza, Tahini

### Suplementos (4)
Creatina monohidrato, BCAA, Maltodextrina, Beta-alanina

---

## 17. Preguntas de Diseño Resueltas

| Pregunta | Decisión | Razón |
|----------|----------|-------|
| ¿Quién gestiona el catálogo? | Solo admin/staff | Garantiza calidad de datos nutricionales |
| ¿Los trainers pueden añadir alimentos? | No (por ahora) | Mantiene consistencia; se puede añadir flujo de "propuesta" |
| ¿Cómo buscar en Firestore? | `searchIndex array-contains` + filtro local | Más eficiente que traer todo; no requiere Algolia |
| ¿Macros por 100g o por porción? | Ambos: `*100g` y `default*` | `default*` para mostrar, `*100g` para recalcular al ajustar porción |
| ¿Delete físico de alimentos? | Nunca — soft delete con `isActive` | Integridad referencial (dietas históricas pueden apuntar al alimento) |
| ¿Cuántos idiomas? | 3 (ES/EN/CA) | Los 3 idiomas soportados de la app; el código está preparado para añadir más |
| ¿Búsqueda Algolia? | No — overkill para <500 alimentos | El índice pre-computado con Firestore `array-contains` es suficiente |
| ¿Imágenes de alimentos? | Opcional — campo `imageUrl?` | Mejora UX pero no es bloqueante; se puede añadir sin migración |

---

> **Este documento v2.0 incorpora todas las mejoras identificadas en el análisis del sistema.**
> **Debe revisarse con el equipo antes de comenzar la implementación.**
> **Leer este documento ANTES de tocar `intoleranceChecker.ts`, `types.ts` o `trainer/diets.astro`.**