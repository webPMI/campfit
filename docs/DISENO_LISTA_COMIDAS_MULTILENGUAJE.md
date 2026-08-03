# 🍽️ Diseño: Lista de Comidas Multilenguaje - CampFit

> **Estado:** 📝 Documento de diseño (pendiente de aprobación)  
> **Fecha:** 2026-08-02  
> **Autor:** Auditoría de Dietas Trainer

---

## 📋 Índice

1. [Visión General](#1-visión-general)
2. [Problema Actual](#2-problema-actual)
3. [Modelo de Datos Propuesto](#3-modelo-de-datos-propuesto)
4. [Estructura Multilenguaje](#4-estructura-multilenguaje)
5. [Flujo del Trainer](#5-flujo-del-trainer)
6. [Flujo del Cliente](#6-flujo-del-cliente)
7. [Detección de Conflictos](#7-detección-de-conflictos)
8. [Integración con Sistema Existente](#8-integración-con-sistema-existente)
9. [Reglas de Firestore](#9-reglas-de-firestore)
10. [Índices Compuestos](#10-índices-compuestos)
11. [Plan de Implementación](#11-plan-de-implementación)
12. [Claves i18n Necesarias](#12-claves-i18n-necesarias)

---

## 1. Visión General

### 🎯 Objetivo
Crear un catálogo centralizado de alimentos multilenguaje (ES/EN/CA) que permita:
1. **Al trainer:** Seleccionar alimentos rápidamente al crear dietas (en lugar de escribir texto libre)
2. **Al cliente:** Marcar alimentos como "excluidos" en su perfil dietético
3. **Al asignar una dieta:** Detectar automáticamente conflictos entre los alimentos de la dieta y las exclusiones del cliente

### 🔄 Flujo Actual vs Propuesto

| Aspecto | Actual | Propuesto |
|---------|--------|-----------|
| Descripción de comidas | Texto libre (ej: "150g pechuga de pollo") | Selección de alimento + cantidad |
| Alérgenos | Checkbox manual (7 alérgenos fijos) | Automáticos según el alimento seleccionado |
| Exclusiones del cliente | Solo `dietaryRestrictions` (6 flags booleanos) | Lista granular de alimentos excluidos |
| Detección de conflictos | `intoleranceChecker` (solo alérgenos) | Detección de alérgenos + alimentos excluidos |
| Idioma | Texto libre sin traducir | Alimento con traducción ES/EN/CA |

---

## 2. Problema Actual

### ❌ Limitaciones del sistema actual

1. **Texto libre en comidas:** El trainer escribe "150g pechuga de pollo" en `meal.description`. No hay estructura ni categorización.

2. **Alérgenos manuales:** El trainer marca checkboxes de 7 alérgenos fijos (gluten, lactose, nuts, shellfish, egg, soy, fish). Propenso a errores y omisiones.

3. **Exclusiones limitadas:** El cliente solo tiene `dietaryRestrictions` con 6 flags booleanos (glutenFree, lactoseFree, vegan, vegetarian, nutFree, shellfishFree) + `other: string[]`. No puede excluir alimentos específicos (ej: "no me gusta el brócoli" o "no como cerdo").

4. **Sin detección granular:** `intoleranceChecker` solo verifica alérgenos, no verifica si el cliente excluyó un alimento específico que está en la dieta.

5. **Sin multilenguaje:** Las descripciones de comidas están en el idioma en que el trainer las escribe. Si el trainer escribe en español, un cliente con idioma inglés ve texto en español.

---

## 3. Modelo de Datos Propuesto

### 🗄️ Nueva colección: `foods_library`

```typescript
interface FoodItem {
  id: string;                          // Auto-generado
  category: FoodCategory;              // Categoría del alimento
  // 🔒 CRÍTICO: translations es un mapa con los 3 idiomas soportados.
  // NUNCA eliminar un idioma. Si se añade un nuevo idioma, añadirlo aquí.
  translations: {
    es: string;                        // Nombre en español
    en: string;                        // Nombre en inglés
    ca: string;                        // Nombre en catalán
  };
  allergens: string[];                 // Alérgenos automáticos (gluten, lactose, nuts, etc.)
  defaultPortion: number;              // Porción por defecto en gramos
  defaultCalories: number;             // Calorías por porción por defecto
  defaultProtein: number;              // Protein por porción (g)
  defaultCarbs: number;                // Carbs por porción (g)
  defaultFat: number;                  // Fat por porción (g)
  tags: string[];                      // Tags para búsqueda (ej: "high-protein", "low-carb")
  isActive: boolean;                   // Soft delete
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type FoodCategory =
  | 'protein'          // Proteínas (carne, pescado, huevos, legumbres)
  | 'carbs'            // Carbohidratos (arroz, pasta, pan, patata)
  | 'fats'             // Grasas (aceite, aguacate, frutos secos)
  | 'vegetables'       // Verduras
  | 'fruits'           // Frutas
  | 'dairy'            // Lácteos
  | 'beverages'        // Bebidas
  | 'supplements'      // Suplementos
  | 'other';           // Otros
```

### 🗄️ Modificación: `users/{userId}.medicalProfile`

Añadir campo `excludedFoods` al MedicalProfile:

```typescript
interface MedicalProfile {
  // ... campos existentes ...

  // 🔒 CRÍTICO: Lista de alimentos excluidos por el cliente.
  // Referencia al ID del alimento en foods_library.
  // NUNCA eliminar - se usa para detección de conflictos al asignar dietas.
  excludedFoods?: string[];            // Array de foodItem IDs
  excludedFoodCategories?: string[];    // Categorías excluidas (ej: "dairy" si no quiere lácteos)
}
```

### 🗄️ Modificación: `diets/{dietId}.meals[]`

Añadir referencia al alimento en cada meal:

```typescript
interface Meal {
  id: string;
  name: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';
  description: string;                  // Texto libre complementario (ej: "con salsa de tomate")
  // 🔒 CRÍTICO: Referencia al alimento en foods_library.
  // Si se selecciona de la lista, foodId apunta al documento.
  // Si es texto libre, foodId es null/undefined.
  foodId?: string;                     // Ref a foods_library/{foodId}
  portionGrams?: number;               // Cantidad en gramos (si se seleccionó de la lista)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  order: number;
  allergens?: string[];                // Alérgenos (automáticos si foodId, manuales si no)
}
```

---

## 4. Estructura Multilenguaje

### 🌐 Estrategia de traducción

Los alimentos se almacenan con traducciones en 3 idiomas directamente en el documento de Firestore:

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
  allergens: [],
  defaultPortion: 150,
  defaultCalories: 165,
  defaultProtein: 31,
  defaultCarbs: 0,
  defaultFat: 3.6,
  tags: ["high-protein", "low-fat"],
  isActive: true,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### 🌐 Resolución de idioma en el cliente

```typescript
// Helper para obtener el nombre del alimento según el idioma del usuario
function getFoodName(food: FoodItem, lang: 'es' | 'en' | 'ca'): string {
  return food.translations[lang] || food.translations.es || food.translations.en || 'Unknown';
}
```

### 🌐 Ventajas de este enfoque

1. **Una sola fuente de verdad:** El alimento se crea una vez con todas las traducciones
2. **Sin queries adicionales:** Las traducciones vienen embebidas en el documento
3. **Consistencia:** Si se cambia el nombre, se cambia en todos los idiomas a la vez
4. **Fallback:** Si falta una traducción, se usa español como fallback

---

## 5. Flujo del Trainer

### 📝 Crear/Editar dieta con selector de alimentos

```
┌─────────────────────────────────────────┐
│  Editor de Dieta                         │
├─────────────────────────────────────────┤
│  Comidas:                               │
│  ┌─────────────────────────────────┐   │
│  │ Desayuno                        │   │
│  │ [Buscar alimento...] 🔍        │   │
│  │ ┌─────────────────────────────┐│   │
│  │ │ 🥣 Avena          150g 150kcal││   │
│  │ │ 🍌 Plátano         100g 89kcal││   │
│  │ │ 🥚 Huevos          60g 78kcal ││   │
│  │ │ + Añadir alimento personalizado││   │
│  │ └─────────────────────────────┘│   │
│  │ Descripción: "con canela"      │   │
│  │ Macros: 250kcal | P:8g C:45g F:4g│   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Pasos:
1. Trainer busca alimento por nombre (búsqueda en tiempo real)
2. Selecciona alimento de la lista → se autocompletan macros según porción
3. Puede ajustar la porción en gramos → recalcula macros
4. Puede añadir texto libre en `description` (ej: "con canela")
5. Los alérgenos se asignan automáticamente según el alimento

### Búsqueda inteligente:
```typescript
// Busca en los 3 idiomas simultáneamente
function searchFoods(query: string, foods: FoodItem[], lang: Language): FoodItem[] {
  const q = query.toLowerCase();
  return foods.filter(f =>
    f.translations.es.toLowerCase().includes(q) ||
    f.translations.en.toLowerCase().includes(q) ||
    f.translations.ca.toLowerCase().includes(q) ||
    f.tags.some(t => t.toLowerCase().includes(q))
  );
}
```

---

## 6. Flujo del Cliente

### 🚫 Marcar alimentos como excluidos

En la página de perfil médico (`/client/medical-profile`):

```
┌─────────────────────────────────────────┐
│  Perfil Médico > Preferencias Alimentarias│
├─────────────────────────────────────────┤
│  Alimentos que NO como:                 │
│  [Buscar alimento para excluir...] 🔍  │
│                                         │
│  ❌ Cerdo           [Quitar]           │
│  ❌ Brócoli          [Quitar]           │
│  ❌ Leche de soja    [Quitar]           │
│                                         │
│  Categorías excluidas:                  │
│  ☐ Sin gluten  ☐ Sin lactosa           │
│  ☐ Vegano      ☐ Vegetariano           │
│  ☐ Sin frutos secos                     │
│  ☐ Sin marisco                          │
└─────────────────────────────────────────┘
```

### Pasos:
1. Cliente busca alimento por nombre
2. Lo añade a su lista de exclusiones
3. Se guarda `foodId` en `medicalProfile.excludedFoods[]`
4. También puede excluir categorías completas (ej: "sin lácteos")

---

## 7. Detección de Conflictos

### ⚠️ Al asignar una dieta a un cliente

```
┌─────────────────────────────────────────┐
│  Asignar Dieta a Juan Pérez             │
├─────────────────────────────────────────┤
│  ⚠️ CONFLICTOS DETECTADOS:              │
│                                         │
│  🔴 Alérgeno: Gluten                    │
│     → Avena contiene gluten             │
│     → Juan tiene intolerancia severa     │
│                                         │
│  🟡 Alimento excluido: Plátano          │
│     → Juan marcó "Plátano" como excluido│
│     → La dieta incluye plátano en snack │
│                                         │
│  [Sustituir automáticamente] [Ignorar] │
└─────────────────────────────────────────┘
```

### Lógica de detección:

```typescript
interface DietConflict {
  type: 'allergen' | 'excluded_food' | 'excluded_category';
  severity: 'severe' | 'moderate' | 'mild';
  mealName: string;
  foodName: string;
  message: string;
  suggestion?: string;  // Alimento alternativo sugerido
}

function checkDietConflicts(
  meals: Meal[],
  foods: FoodItem[],
  medicalProfile: MedicalProfile,
  lang: Language
): DietConflict[] {
  const conflicts: DietConflict[] = [];

  // 1. Verificar alérgenos (sistema existente)
  const allergenConflicts = checkDietAllergens(
    meals.map(m => ({ name: m.name, allergens: m.allergens || [] })),
    medicalProfile
  );
  conflicts.push(...allergenConflicts.map(c => ({
    type: 'allergen' as const,
    severity: c.severity,
    mealName: c.mealName,
    foodName: c.allergen,
    message: c.message,
  })));

  // 2. Verificar alimentos excluidos
  const excludedFoods = medicalProfile.excludedFoods || [];
  for (const meal of meals) {
    if (meal.foodId && excludedFoods.includes(meal.foodId)) {
      const food = foods.find(f => f.id === meal.foodId);
      const foodName = food ? getFoodName(food, lang) : 'Unknown';
      conflicts.push({
        type: 'excluded_food',
        severity: 'moderate',
        mealName: meal.name,
        foodName,
        message: `⚠️ ${foodName} está en la lista de exclusiones del cliente.`,
      });
    }
  }

  // 3. Verificar categorías excluidas
  const excludedCategories = medicalProfile.excludedFoodCategories || [];
  for (const meal of meals) {
    if (meal.foodId) {
      const food = foods.find(f => f.id === meal.foodId);
      if (food && excludedCategories.includes(food.category)) {
        conflicts.push({
          type: 'excluded_category',
          severity: 'moderate',
          mealName: meal.name,
          foodName: getFoodName(food, lang),
          message: `⚠️ ${getFoodName(food, lang)} pertenece a la categoría "${food.category}" que el cliente ha excluido.`,
        });
      }
    }
  }

  return conflicts;
}
```

---

## 8. Integración con Sistema Existente

### 🔗 Archivos a modificar/crear

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/lib/shared/foodLibrary.ts` | **CREAR** | Servicio para leer `foods_library` |
| `src/lib/client/intoleranceChecker.ts` | **MODIFICAR** | Añadir `checkDietConflicts()` |
| `src/lib/trainer/types.ts` | **MODIFICAR** | Añadir `foodId`, `portionGrams` a `Meal` |
| `src/types/index.ts` | **MODIFICAR** | Añadir `excludedFoods`, `excludedFoodCategories` a `MedicalProfile` |
| `src/pages/trainer/diets.astro` | **MODIFICAR** | Añadir selector de alimentos al editor |
| `src/pages/client/medical-profile.astro` | **MODIFICAR** | Añadir selector de exclusiones |
| `firestore.rules` | **MODIFICAR** | Añadir reglas para `foods_library` |
| `firestore.indexes.json` | **MODIFICAR** | Añadir índice para `foods_library` |
| `src/i18n/locales/es.ts` | **MODIFICAR** | Añadir claves `food.*` |
| `src/i18n/locales/en.ts` | **MODIFICAR** | Añadir claves `food.*` |
| `src/i18n/locales/ca.ts` | **MODIFICAR** | Añadir claves `food.*` |
| `scripts/seed-foods.mjs` | **CREAR** | Script para poblar `foods_library` |

### 🔗 Compatibilidad con datos existentes

- Las dietas existentes con `description` en texto libre seguirán funcionando
- `foodId` es opcional (`foodId?: string`) — si no está, se usa texto libre
- `excludedFoods` es opcional — si no está, no hay exclusiones
- `intoleranceChecker` sigue funcionando para alérgenos sin cambios

---

## 9. Reglas de Firestore

```javascript
// ── Biblioteca de Alimentos ──────────────────────────────────────────────────
// 🔒 CRÍTICO: Cualquier usuario autenticado puede leer foods_library.
// Solo staff (admin/trainer) puede crear/editar/eliminar alimentos.
match /foods_library/{foodId} {
  allow read: if isAuth();
  allow create, update, delete: if isStaff();
}
```

---

## 10. Índices Compuestos

```json
{
  "collectionGroup": "foods_library",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "category", "order": "ASCENDING" },
    { "fieldPath": "isActive", "order": "ASCENDING" }
  ]
}
```

---

## 11. Plan de Implementación

### Fase 1: Infraestructura (sin UI)
- [ ] Crear tipo `FoodItem` y `FoodCategory` en `src/lib/shared/foodLibrary.ts`
- [ ] Crear servicio `subscribeToFoods()` y `searchFoods()`
- [ ] Añadir reglas de Firestore para `foods_library`
- [ ] Crear script `scripts/seed-foods.mjs` con ~50 alimentos iniciales
- [ ] Añadir índice compuesto

### Fase 2: Tipos y Modelo
- [ ] Modificar `Meal` en `src/lib/trainer/types.ts` (añadir `foodId`, `portionGrams`)
- [ ] Modificar `MedicalProfile` en `src/types/index.ts` (añadir `excludedFoods`, `excludedFoodCategories`)
- [ ] Actualizar `docs/FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md`

### Fase 3: Detección de Conflictos
- [ ] Crear `checkDietConflicts()` en `intoleranceChecker.ts`
- [ ] Crear tests unitarios para `checkDietConflicts`
- [ ] Integrar con `templateService.applyDietTemplateToClient()`

### Fase 4: UI del Trainer
- [ ] Añadir selector de alimentos al editor de dietas en `trainer/diets.astro`
- [ ] Búsqueda en tiempo real (3 idiomas)
- [ ] Autocompletar macros al seleccionar alimento
- [ ] Recalcular macros al cambiar porción

### Fase 5: UI del Cliente
- [ ] Añadir selector de exclusiones en `client/medical-profile.astro`
- [ ] Buscar y añadir alimentos a lista de exclusiones
- [ ] Guardar en `medicalProfile.excludedFoods`

### Fase 6: Detección al Asignar
- [ ] Mostrar conflictos al asignar dieta desde plantilla
- [ ] Sugerir sustituciones automáticas
- [ ] Permitir ignorar conflictos con confirmación

### Fase 7: i18n
- [ ] Añadir claves `food.*` en `es.ts`, `en.ts`, `ca.ts`
- [ ] Traducir categorías de alimentos

---

## 12. Claves i18n Necesarias

```
food.search.placeholder: "Buscar alimento..." / "Search food..." / "Cercar aliment..."
food.category.protein: "Proteínas" / "Proteins" / "Proteïnes"
food.category.carbs: "Carbohidratos" / "Carbohydrates" / "Hidrats de carboni"
food.category.fats: "Grasas" / "Fats" / "Greixos"
food.category.vegetables: "Verduras" / "Vegetables" / "Verdures"
food.category.fruits: "Frutas" / "Fruits" / "Fruites"
food.category.dairy: "Lácteos" / "Dairy" / "Lactis"
food.category.beverages: "Bebidas" / "Beverages" / "Begudes"
food.category.supplements: "Suplementos" / "Supplements" / "Suplements"
food.category.other: "Otros" / "Other" / "Altres"
food.addCustom: "Añadir alimento personalizado" / "Add custom food" / "Afegir aliment personalitzat"
food.portion.grams: "Porción (g)" / "Portion (g)" / "Porció (g)"
food.excluded.title: "Alimentos excluidos" / "Excluded foods" / "Aliments exclosos"
food.excluded.add: "Excluir alimento" / "Exclude food" / "Excloure aliment"
food.excluded.remove: "Quitar exclusión" / "Remove exclusion" / "Treure exclusió"
food.conflict.allergen: "Alérgeno conflictivo" / "Allergen conflict" / "Al·lergogen conflictiu"
food.conflict.excluded: "Alimento excluido por el cliente" / "Food excluded by client" / "Aliment exclos pel client"
food.conflict.category: "Categoría excluida por el cliente" / "Category excluded by client" / "Categoria exclosa pel client"
food.conflict.suggest: "Sugerir sustitución" / "Suggest replacement" / "Suggerir substitució"
food.conflict.ignore: "Ignorar conflicto" / "Ignore conflict" / "Ignorar conflicte"
```

---

## 📊 Alimentos Iniciales Sugeridos (~50)

### Proteínas (12)
Pechuga de pollo, Pechuga de pavo, Carne magra de res, Salmón, Atún, Merluza, Huevos, Claras de huevo, Tofu, Tempeh, Lentejas, Garbanzos

### Carbohidratos (10)
Arroz blanco, Arroz integral, Avena, Pasta, Pan integral, Patata, Batata, Quinoa, Cuscús, Pan de centeno

### Grasas (6)
Aguacate, Aceite de oliva, Almendras, Nueces, Mantequilla de cacahuete, Semillas de chía

### Verduras (10)
Brócoli, Espinacas, Zanahoria, Tomate, Pimiento, Calabacín, Coliflor, Lechuga, Pepino, Cebolla

### Frutas (8)
Plátano, Manzana, Naranja, Fresas, Arándanos, Pera, Uva, Piña

### Lácteos (4)
Leche, Yogur griego, Queso fresco, Requesón

---

**Este documento es un diseño preliminar. Debe revisarse y aprobarse antes de implementar.**