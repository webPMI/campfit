# 🔬 Análisis de Brechas Clínicas y Seguimiento - CampFit 2.0

> **Fecha:** 26/07/2026
> **Propósito:** Documentar lo implementado vs lo que falta en tracking clínico, intolerancias alimentarias y seguimiento médico del cliente.

---

## ✅ Implementado (en esta sesión)

### 1. Tipos enriquecidos (`src/types/index.ts`)
- **`MedicalProfile`** ahora incluye:
  - `bloodType`: A+, A-, B+, B-, AB+, AB-, O+, O-
  - `dietaryRestrictions`: glutenFree, lactoseFree, vegan, vegetarian, nutFree, shellfishFree, other[]
  - `intolerances`: IntoleranceEntry[] (substance, severity mild/moderate/severe, symptoms)
  - `emergencyName`, `emergencyPhone`
  - `medications: string[]` (antes era un textarea genérico)
  - `gender`, `age` añadidos
- **`IntoleranceEntry`** y **`DietaryRestrictions`** exportados como interfaces públicas

### 2. Dietas con alérgenos (`src/lib/client/dietService.ts`)
- **`Meal`** ahora incluye `allergens: string[]` para etiquetar cada comida con alérgenos (gluten, lactose, nuts, shellfish, etc.)
- Esto permite cruzar referencias entre las intolerancias del cliente y las comidas de su dieta

### 3. Páginas admin de supervisión (4 nuevas)
- `admin/workouts.astro`, `admin/diets.astro`, `admin/chat.astro`, `admin/progress.astro`
- Todas con estados loading/empty/error/success y auto-refresh 60s

---

## ❌ Pendiente

### CRÍTICO — Implementar ahora

| ID | Brecha | Impacto | Archivos afectados |
|----|--------|---------|-------------------|
| B1 | **Medical-profile no guarda dietaryRestrictions ni intolerances** | El formulario recoge condiciones/alergias/surgery pero no los nuevos campos enriquecidos | `src/pages/client/medical-profile.astro` |
| B2 | **console.error en medical-profile.astro** | Violación regla #7 | `src/pages/client/medical-profile.astro:300` |
| B3 | **Onboarding no refleja nuevos campos** | Nuevos tipos existen pero el flujo de onboarding no los recoge | `src/pages/onboarding.astro` |
| B4 | **Trainer clients view no muestra datos clínicos** | El entrenador ve `subscribeToClientProgress` pero no ve alergias/intolerancias/condiciones médicas del cliente | `src/pages/trainer/clients.astro`, `src/lib/trainer/trainerClients.ts` |

### ALTO — Próximo sprint

| ID | Brecha | Impacto | Acción |
|----|--------|---------|--------|
| B5 | **Sin validación cruzada meal allergens ↔ client intolerances** | Una comida etiquetada `["lactose"]` debería alertar si el cliente tiene `lactoseFree: false` y `intolerances` con `substance: "lactose"` | Crear `src/lib/client/intoleranceChecker.ts` |
| B6 | **Diet templates sin campo allergens** | Las plantillas de dieta no pueden heredar información de alérgenos | `nuevo_proyecto/04_modelo_datos_firestore.md` (colección `diet_templates`) |
| B7 | **Sin página dedicada de seguimiento clínico** | Ni admin ni trainer tienen vista consolidada de datos médicos. Cada cliente tiene ~15 campos clínicos que no se muestran en ningún dashboard | Crear `src/pages/trainer/clinical.astro` y `src/pages/admin/clinical.astro` |
| B8 | **i18n sin keys para nuevos campos** | `bloodType`, `intolerances`, `dietaryRestrictions`, `severity`, `substance` no tienen traducciones | `src/i18n/translations.ts`, `src/i18n/client.ts` |

### MEDIO — Backlog

| ID | Brecha | Impacto | Acción |
|----|--------|---------|--------|
| B9 | **Modelo de datos Firestore desactualizado** | `04_modelo_datos_firestore.md` no documenta `dietaryRestrictions`, `intolerances`, `bloodType`, `emergencyName/Phone`, `allergens` en meals | Actualizar documentación |
| B10 | **Sin validación de tipos en medical-profile** | `height` debe ser 100-250, `weight` 30-300, `birthDate` > 14 años, `bloodType` debe ser valor enum | Agregar validators |
| B11 | **Sin historial de cambios en perfil médico** | Si un cliente actualiza sus alergias/intolerancias, no queda registro de quién/cuándo/por qué | Agregar subcolección `medical_history` en Firestore |
| B12 | **Sin tests para IntoleranceEntry/DietaryRestrictions** | Los nuevos tipos no tienen cobertura | Crear `tests/unit/types/medicalProfile.test.ts` |

---

## Flujo de Datos Actual vs Deseado

### Actual
```
Client → medical-profile.astro → Firestore users/{uid}.medicalProfile
Trainer → NO VE datos clínicos del cliente
Admin → NO VE datos clínicos agregados
Diet → meals[] sin allergens
```

### Deseado
```
Client → medical-profile.astro (enriquecido) → Firestore users/{uid}.medicalProfile
         ↓ incluye dietaryRestrictions, intolerances, bloodType, emergencyContact

Trainer → trainer/clinical.astro → Ve alergias, intolerancias, condiciones, medicación
          → Al crear dietas, recibe warning si comida contiene alérgeno del cliente

Admin → admin/clinical.astro → Dashboard agregado de condiciones médicas
       → Estadísticas: % clientes con intolerancias, alergias más comunes

Diet → meals[] con allergens[]
     → intoleranceChecker.ts cruza allergens con client intolerances
```

---

## Plan de Implementación (Fase Clínica)

### Semana 1 — Crítico
1. **Actualizar medical-profile.astro** — Agregar campos de dietaryRestrictions (checkboxes), intolerances (lista dinámica con severity), bloodType (select)
2. **Reemplazar console.error por logger.error** en medical-profile.astro
3. **Actualizar onboarding.astro** — Reflejar nuevos campos de MedicalProfile
4. **Mostrar datos clínicos en trainer/clients.astro** — Al expandir un cliente, mostrar alergias, condiciones, medicación

### Semana 2 — Alto
5. **Crear intoleranceChecker.ts** — `checkMealAllergens(meal, medicalProfile): string[]` que retorna alérgenos conflictivos
6. **Actualizar diet templates** — Agregar `allergens` a MealTemplate
7. **Crear trainer/clinical.astro** — Vista de panel clínico por cliente
8. **Agregar keys i18n** para bloodType, intolerances, dietaryRestrictions, severity

### Semana 3 — Medio
9. **Actualizar documentación** — `04_modelo_datos_firestore.md`, `09_modulo_cliente.md`
10. **Agregar validators** para rangos numéricos y enums
11. **Crear subcolección `medical_history`** para auditoría de cambios

---

## Métricas de Tipos

| Interfaz | Campos antes | Campos ahora | Delta |
|----------|-------------|-------------|-------|
| `MedicalProfile` | 8 | 18 | +10 |
| `Meal` | 8 | 9 | +1 (allergens) |
| **Nuevos tipos** | 0 | 3 | DietaryRestrictions, IntoleranceEntry, AuthError |

---

## Cobertura de Tests Afectados

| Módulo | Tests antes | Necesita | Gap |
|--------|-----------|----------|-----|
| `src/types/index.ts` | 0 | ≥ 5 (validación de tipos) | 🔴 |
| `src/pages/client/medical-profile.astro` | 0 | ≥ 8 (form submit, estados) | 🔴 |
| `src/lib/client/dietService.ts` | 21 | 21 (sin cambios) | ✅ |
| `src/lib/client/intoleranceChecker.ts` | No existe | ≥ 10 (cruzar allergens) | 🔴 |

---

> **📌 Convenciones de código, Git workflow, testing y comandos:** Ver `12_guia_desarrollo_testing.md`
> **📌 Golden Rules:** Ver `.clinerules`