# 🔍 Auditoría: Sección de Dietas del Trainer

> **Fecha:** 2026-08-02  
> **Alcance:** `/trainer/diets`, `src/lib/trainer/trainerDiets.ts`, `src/lib/trainer/types.ts`, `src/pages/client/diets.astro`, `src/lib/client/dietService.ts`, `firestore.rules`, `tests/unit/lib/trainer/trainerDiets.test.ts`  
> **Estado:** ⚠️ Requiere acciones correctivas  
> **Nota:** Re-auditoría tras cambios recientes en `src/pages/trainer/diets.astro` (573 líneas) y `src/lib/trainer/types.ts`

---

## 📊 Resumen Ejecutivo

| Área | Estado | Prioridad |
|------|--------|-----------|
| 🔴 Seguridad (Firestore Rules) | ❌ **CRÍTICO** | P0 |
| 🔴 Autorización de rutas | ❌ **CRÍTICO** | P0 |
| 🟠 Editor de dietas (funcionalidad) | ⚠️ **Mejorado pero incompleto** | P1 |
| 🟠 Tipos y modelo de datos | ⚠️ **Relajado, sin allergens** | P1 |
| 🟠 Bug crítico en cliente | ❌ **Bug** | P1 |
| 🟡 Tests unitarios | ⚠️ **Parcial + desactualizados** | P2 |
| 🟡 Tests E2E | ⚠️ **Insuficientes** | P2 |
| 🟡 i18n | ⚠️ **Strings hardcodeados + claves huérfanas** | P2 |
| 🟢 Documentación | ✅ Alineada | - |

---

## 🚨 Hallazgos CRÍTICOS (P0)

### 1. 🔴 Reglas de Firestore: Cualquier staff puede modificar CUALQUIER dieta

**Archivo:** `firestore.rules` (líneas 77-86)

```javascript
match /diets/{dietId} {
  allow read: if isAuth() && (
    resource.data.clientId == '' ||
    resource.data.clientId == request.auth.uid ||
    resource.data.trainerId == request.auth.uid ||
    isAdmin()
  );
  allow create, update, delete: if isStaff();  // ❌ NO verifica ownership
}
```

**Problema:** `isStaff()` = `isAdmin() || isTrainer()`. Un trainer puede **crear, editar y eliminar** dietas de **cualquier otro trainer** sin verificar que `trainerId == request.auth.uid`.

**También:** `create` no valida que el documento creado tenga `trainerId == request.auth.uid`.

**Corrección sugerida:**
```javascript
match /diets/{dietId} {
  allow read: if isAuth() && (
    resource.data.clientId == request.auth.uid ||
    resource.data.trainerId == request.auth.uid ||
    isAdmin()
  );
  allow create: if isTrainer() &&
    request.resource.data.trainerId == request.auth.uid &&
    request.resource.data.clientId != null;
  allow update, delete: if (isTrainer() && resource.data.trainerId == request.auth.uid) || isAdmin();
}
```

> ⚠️ Mismo problema existe en la colección `workouts` (líneas 66-75).

---

### 2. 🔴 `/trainer/diets` NO verifica rol - Cualquier usuario autenticado puede acceder

**Archivo:** `src/pages/trainer/diets.astro` (línea 82)

```javascript
requireAuth(async (user) => { initDiets(user.uid); });
```

**Problema:** `requireAuth` solo verifica autenticación, NO el rol. Un usuario **client** o cualquier usuario autenticado puede acceder a `/trainer/diets` y gestionar dietas.

**Corrección sugerida:**
```javascript
import { requireTrainer } from '@/lib/shared/authGuard'; // o crear guard específico
requireTrainer(async (user) => { initDiets(user.uid); });
```

O crear un `requireRole(['trainer', 'admin'])` que verifique el rol desde Firestore (similar a `requireAdmin`).

---

### 3. 🐛 BUG: `registerMealComplete` se llama con `clientId` vacío

**Archivo:** `src/pages/client/diets.astro` (líneas 287-292)

```javascript
const result = await registerMealComplete(
  '', // clientId se obtiene del auth  ← ❌ VACÍO
  currentDietId,
  mealId,
  mealName || '',
);
```

**Problema:** `registerMealComplete` en `dietService.ts` (línea 111) valida `if (!clientId || !dietId || !mealId)` y retorna `null`. **El botón "marcar comida completada" nunca funciona.**

**Corrección sugerida:** Pasar `firebaseUser.uid` (el `clientId` obtenido en `onReady`).

---

## 🚨 Hallazgos de FUNCIONALIDAD (P1)

### 4. 🟠 Editor de dietas: MÁS de 300 líneas (regla de oro) y strings hardcodeados

**Archivo:** `src/pages/trainer/diets.astro` → **573 líneas**

**Problema 1:** El archivo excede ampliamente la regla de oro "No archivos > 300 líneas".

**Problema 2:** El nuevo editor usa **strings hardcodeados en español** en lugar de las claves i18n existentes:

```javascript
// Ejemplos de strings hardcodeados:
'Nueva Dieta'                          // → debería ser t('trainer.diets.new')
'Buscar dietas...'                     // → no es t()
'Todos los clientes'                   // → no es t()
'Nuevo Plan Nutricional'               // → debería ser t('diet.editor.title.new')
'Nombre de la Dieta *'                 // → debería ser t('diet.editor.name.label')
'Tipo de Dieta'                        // → debería ser t('diet.editor.type.label')
'Somatotipo Recomendado'               // → debería ser t('diet.editor.somatotype.label')
'+ Añadir Comida'                      // → debería ser t('diet.editor.meals.addBtn')
'Guardar Cambios' / 'Crear Plan Nutricional'  // → t('diet.editor.save.edit') / t('diet.editor.save.new')
'Desayuno', 'Almuerzo', 'Merienda'...  // → t('diet.editor.meal.breakfast') etc.
'Eliminar'                             // → t('diet.editor.meal.remove')
```

**Impacto:** La página de dietas del trainer **no pasa al idioma inglés/catalán**, rompiendo el i18n. Existen ~30 claves de traducción `diet.editor.*` sin usar en los 3 idiomas.

**Corrección:** Reemplazar todos los strings hardcodeados por `t('...')` y usar las claves `diet.editor.*` existentes.

---

### 5. 🟠 Tipos relajados e inconsistentes en `types.ts`

**Archivo:** `src/lib/trainer/types.ts`

```typescript
export interface TrainerDiet {
  type: string;   // ❌ Antes: type: 'normal' | 'advanced'  — union fuertemente tipada
  somatotype?: 'ectomorph' | 'mesomorph' | 'endomorph' | string;  // ❌ `| string` anula la union
  ...
}

export interface Meal {
  name: string;   // ❌ Antes: name: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other'
}
```

**Problemas:**
1. `type: string` y `somatotype: ... | string` anulan el type-safety (regla de oro: "No usar any - siempre tipar")
2. `Meal.name: string` rompe la consistencia con `dietService.ts` del cliente que tiene union estricta
3. `Meal` del trainer **NO tiene campo `allergens`** mientras que `Meal` del cliente SÍ lo tiene:

| Archivo | Campo `allergens` |
|---------|-------------------|
| `src/lib/trainer/types.ts` (Meal) | ❌ NO tiene |
| `src/lib/client/dietService.ts` (Meal) | ✅ SÍ tiene |

**Consecuencia:** `intoleranceChecker.ts` espera `meal.allergens` pero el editor del trainer no los captura ni guarda.

**Corrección:**
- Mantener unions estrictas: `type: 'normal' | 'definition' | 'volume' | 'keto' | 'vegan' | 'custom'`
- Añadir `allergens?: string[]` a `Meal`
- Usar `Meal['name']` type para no duplicar

---

### 6. 🟠 El editor NO captura alérgenos por comida

**Impacto:** El trainer no puede marcar alérgenos (gluten, lactose, nuts, etc.) en cada comida. El sistema de detección de alergias del cliente (`intoleranceChecker.ts`) no recibe datos.

**Corrección:** Añadir campo `allergens` (multi-select o tags) a cada `meal-card` en `renderMealsEditor()`.

---

### 7. 🟠 Sin estado de error visible en `trainer/diets.astro`

La página maneja:
- ✅ Loading (spinner inicial)
- ✅ Empty (`renderEmptyState`)
- ⚠️ Error (**solo toast**, sin UI de error con retry)
- ✅ Success (lista)

Falta usar `renderErrorState` de `shared/ui.ts` con opción de reintento.

---

### 8. 🟠 Renderizado inseguro: `innerHTML` con interpolación de valores numéricos no sanitizados

**Archivo:** `src/pages/trainer/diets.astro`

En `renderMealsEditor()`, los valores numéricos de las comidas se interpola directamente en el HTML:

```javascript
value="${meal.calories || 0}"
value="${meal.protein || 0}"
```

**Problema:** Si `meal.calories` contiene un string malicioso (por ejemplo, desde datos de Firestore manipulados), se inyectaría HTML sin escapar. Aunque `diet.name`, `clientName` y `meal.description` usan `escapeHtml()`, los campos numéricos no están protegidos.

**Nota:** Los listener de botones del editor no se acumulan porque `editor.innerHTML = ""` en `closeEditor()` destruye los elementos y sus listeners; al re-crear el editor, se crean listeners nuevos en elementos nuevos.

**Corrección:** Usar `Number(meal.calories) || 0` o `escapeHtml(String(meal.calories || 0))` para campos numéricos.

---

## 🟡 Hallazgos de CALIDAD (P2)

### 9. 🟡 Tests unitarios desactualizados tras el cambio del editor

**Archivo:** `tests/unit/lib/trainer/trainerDiets.test.ts`

Los tests cubren solo las funciones de servicio (subscribe/create/update/delete) pero:
- ❌ No cubren la nueva lógica del editor (meals, macros, tipo, somatotipo)
- ❌ No verifican que `createDiet`/`updateDiet` persisten `meals`, `totalProtein`, `totalCarbs`, `totalFat`
- ❌ No hay tests para `renderMealsEditor`, `saveMealsFromDOM`, `updateMacroTotals`
- ❌ `mockDiet` en el test no incluye los nuevos campos o `allergens`

**Corrección:** Ampliar tests para cubrir nuevas funciones y campos.

---

### 10. 🟡 No hay tests E2E de funcionalidad de dietas del trainer

**Archivo:** `tests/e2e/trainer-pages.e2e.ts` (líneas 31-37)

```typescript
test(`${path} renders`, async ({ page }) => {
  await page.goto(path);
  await page.waitForTimeout(800);
  await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
});
```

Solo verifica que la página renderiza `body`. **No hay tests E2E para:**
- ❌ Crear una dieta con comidas
- ❌ Editar una dieta
- ❌ Eliminar una dieta
- ❌ Verificar que la dieta aparece en el cliente
- ❌ Verificación de permisos (cliente no puede acceder a `/trainer/diets`)

---

### 11. 🟡 `client/diets.astro` usa `any` (viola regla de oro) y excede 300 líneas

**Archivo:** `src/pages/client/diets.astro` → **412 líneas**

```typescript
let allDiets: any[] = [];
function renderCurrentDiet(d: any): void { ... }
d.meals.forEach((meal: any) => { ... });
```

**Corrección:** Usar `import type { Diet, Meal } from '@/lib/client/dietService'` y refactorizar <300 líneas.

---

## 🟢 Hallazgos de i18n (P3)

### 12. 🟢 Claves `diet.editor.*` huérfanas

Existen **~30 claves de traducción** en `es.ts`, `en.ts`, `ca.ts` para el editor granular de dietas, pero el nuevo editor de 573 líneas **no las usa** (usa strings hardcodeados). Estas claves deberían utilizarse en lugar de los strings.

---

## ✅ Aspectos Correctos

| Aspecto | Estado |
|---------|--------|
| **Escape HTML:** `escapeHtml()` se usa en `name`, `clientName`, `description` de comidas | ✅ |
| **Calculo automático de macros:** `updateMacroTotals` recalcula en tiempo real | ✅ |
| **Campos nuevos del editor:** tipo, somatotipo, macros por comida, agregar/eliminar comidas | ✅ |
| **Buscador y filtro por cliente** | ✅ |
| **Toast de feedback** al crear/actualizar/eliminar | ✅ |
| **Cleanup de suscripciones:** `beforeunload` limpia `unsubClients` y `unsubDiets` | ✅ |
| **Logger tipado:** `logger.info/warn/error` con contexto | ✅ |
| **Índices compuestos:** `firestore.indexes.json` tiene índices para `diets` | ✅ |
| **`subscribeToClients` filtra `role === 'client'` y `assignedTrainerId`** | ✅ |
| **Renderizado con theme-aware CSS variables** | ✅ |
| **Barril `trainerUtils.ts` bien organizado** | ✅ |

---

## 📋 Plan de Acción Recomendado

### Fase 1 - Seguridad (URGENTE)
- [ ] **P0** Corregir `firestore.rules` para `diets` (y `workouts`) verificando `trainerId == request.auth.uid` en create/update/delete
- [ ] **P0** Crear guard `requireTrainer` o `requireRole` que verifique rol real desde Firestore
- [ ] **P0** Usar el guard correcto en las páginas `/trainer/*`
- [ ] **P0** Corregir bug de `registerMealComplete('', ...)` en `client/diets.astro`

### Fase 2 - Funcionalidad y Calidad
- [ ] **P1** Reemplazar strings hardcodeados por claves i18n (`diet.editor.*`) en `trainer/diets.astro`
- [ ] **P1** Añadir campo `allergens` al editor de comidas y a `Meal` en `types.ts`
- [ ] **P1** Restaurar unions estrictas en `TrainerDiet.type` y `Meal.name`
- [ ] **P1** Refactorizar `trainer/diets.astro` (<300 líneas) - extraer editor a componente/module
- [ ] **P1** Añadir estado de error con retry (`renderErrorState`)
- [ ] **P2** Eliminar `any` en `client/diets.astro`
- [ ] **P2** Refactorizar `client/diets.astro` (<300 líneas)
- [ ] **P2** Ampliar tests unitarios para cubrir funciones del editor
- [ ] **P2** Añadir tests E2E de CRUD de dietas del trainer

---

## 📁 Archivos Revisados

| Archivo | Líneas | Estado |
|---------|--------|--------|
| `src/pages/trainer/diets.astro` | 573 | ⚠️ Refactor + i18n + allergens |
| `src/lib/trainer/trainerDiets.ts` | 130 | ✅ OK |
| `src/lib/trainer/types.ts` | 96 | ⚠️ Tipos relajados + sin allergens |
| `src/lib/trainer/trainerUtils.ts` (barrel) | 47 | ✅ OK |
| `src/lib/trainer/trainerClients.ts` | 85 | ✅ OK |
| `src/lib/trainer/trainerRender.ts` | 132 | ✅ OK |
| `src/lib/trainer/templateService.ts` | 132 | ⚠️ Sin validación |
| `src/pages/client/diets.astro` | 412 | ⚠️ Bug + over 300 + any |
| `src/lib/client/dietService.ts` | 181 | ✅ OK |
| `src/lib/client/intoleranceChecker.ts` | 178 | ✅ OK |
| `src/pages/admin/diets.astro` | 338 | ✅ OK |
| `firestore.rules` | 152 | ❌ CRÍTICO |
| `firestore.indexes.json` | 95 | ✅ OK |
| `src/lib/shared/authGuard.ts` | 138 | ⚠️ Sin requireTrainer |
| `src/lib/routeGuards.ts` | 100 | ✅ OK |
| `src/i18n/locales/es.ts` | - | ⚠️ Claves huérfanas |
| `src/i18n/locales/en.ts` | - | ⚠️ Claves huérfanas |
| `src/i18n/locales/ca.ts` | - | ⚠️ Claves huérfanas |
| `tests/unit/lib/trainer/trainerDiets.test.ts` | 195 | ⚠️ Desactualizado |
| `tests/e2e/trainer-pages.e2e.ts` | 37 | ⚠️ Solo render |
| `docs/07_modulo_trainer.md` | 635 | ✅ Alineado |
| `nuevo_proyecto/04_modelo_datos_firestore.md` | 248 | ✅ Alineado |

---

**Siguiente paso:** Aplicar correcciones de Fase 1 (seguridad) lo antes posible.