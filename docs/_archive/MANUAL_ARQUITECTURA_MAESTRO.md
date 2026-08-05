# 📋 CampFit — Manual Maestro de Arquitectura y Desarrollo

> **Fuente Única de Verdad de la Plataforma CampFit**  
> **Última actualización profunda:** 2026-08-06

---

## 1. Visión General del Sistema

CampFit es una plataforma web progresiva (PWA / Capacitor 6) diseñada para la gestión integral de entrenamientos, nutrición y seguimiento de clientes por parte de entrenadores personales y administradores. 

Construida con **Astro 7** en modo **SSG (estático)**, utiliza componentes nativos `.astro` e islas interactivas ligeras con Vanilla JS / Alpine.js y **Nanostores**. El estilo visual está impulsado por **Tailwind CSS 4** con un sistema semántico de temas y sabores (*flavors*).

---

## 2. Pila Tecnológica (Tech Stack)

| Capa | Tecnología | Versión / Detalle |
|------|------------|-------------------|
| **Framework Core** | Astro | `^7.0.7` (Modo SSG `output: 'static'`) |
| **Estilos & UI** | Tailwind CSS / CSS Custom Props | Tailwind 4 + Tokens de Tema v2.0 |
| **Gestión de Estado** | Nanostores | `$user`, `$themeMode`, `$themeFlavor` |
| **Base de Datos** | Cloud Firestore | NoSQL (11 colecciones declaradas) |
| **Autenticación** | Firebase Auth | Email/Password + Google OAuth |
| **Storage** | Cloudflare R2 | Fotografías de progreso y media |
| **Testing** | Vitest + Playwright | Unitarios (Vitest) + E2E (Playwright) |
| **Mobile Wrapping** | Capacitor | `^6.0.0` (Android / iOS) |

---

## 3. Mapa de Arquitectura de Archivos (`src/`)

```
src/
├── components/     # Componentes de UI atómicos (UIButton, UICard, UIInput, etc.)
├── layouts/        # Layouts por rol (BaseLayout, AdminLayout, ClientLayout, TrainerLayout, PublicPageLayout)
├── pages/          # 34+ Rutas de la aplicación (SSG estáticas)
│   ├── admin/      # dashboard, users, trainers, clients, clinical, diets, workouts, foods, exercises, progress, chat, settings
│   ├── client/     # dashboard, workouts, diets, progress, medical-profile, chat, support, settings
│   └── trainer/    # dashboard, clients, clinical, workouts, diets, chat, settings
├── lib/            # Servicios de negocio y utilidades
│   ├── shared/     # foodLibrary.ts, exerciseLibrary.ts, chat.ts, ui.ts, logger.ts, authGuard.ts, i18n.ts
│   ├── admin/      # Módulo admin (adminUsers.ts, adminSubscriptions.ts, etc.)
│   ├── trainer/    # Módulo trainer (trainerWorkouts.ts, trainerDiets.ts, templateService.ts, etc.)
│   └── client/     # Módulo cliente (dietService.ts, workoutService.ts, intoleranceChecker.ts, etc.)
├── stores/         # authStore.ts, themeStore.ts
├── types/          # index.ts (Interfaces globales User, MedicalProfile, FoodItem, ExerciseItem, etc.)
└── i18n/           # translations.ts (ES/EN 1:1), client.ts
```

---

## 4. Colecciones Firestore y Modelo de Datos (11 Colecciones)

1. **`users/{userId}`**: Perfiles de usuario, roles (`admin`, `trainer`, `client`), asignación de entrenador y `MedicalProfile`.
2. **`workouts/{workoutId}`**: Rutinas de entrenamiento por cliente (`exercises[]`).
3. **`diets/{dietId}`**: Planes nutricionales por cliente (`meals[]`).
4. **`messages/{messageId}`**: Mensajería directa (`senderId`, `receiverId`, `participants[]`, `type`).
5. **`progress_logs/{logId}`**: Registros de peso, rpe, adherencia y notas del cliente.
6. **`foods_library/{foodId}`**: Catálogo central de alimentos (multilenguaje, macros por 100g, alérgenos UE, soft delete).
7. **`exercises_library/{exerciseId}`**: Catálogo central de ejercicios (multilenguaje, músculos, equipamiento, contraindicaciones).
8. **`user_exercise_prefs/{userId}`**: Preferencias del cliente (ratings 1-5, favoritos, exclusiones, solicitudes al entrenador).
9. **`workout_templates/{templateId}`**: Plantillas de rutinas predeterminadas.
10. **`diet_templates/{templateId}`**: Plantillas de dietas predeterminadas.
11. **`exercise_templates/{templateId}`**: Plantillas auxiliares de ejercicios.

---

## 5. Reglas Inviolables de Anti-Regresión y Seguridad

1. **Protección de Queries Firestore**: NUNCA eliminar cláusulas `where`, `orderBy` o `limit`.
2. **Ownership Estricto**: Todo cambio en rutinas o dietas exige verificar `trainerId == request.auth.uid`.
3. **Soft Delete Obligatorio**: En `foods_library` y `exercises_library`, usar `isActive: false` (jamás `deleteDoc`).
4. **Protección XSS**: Escapar todo texto dinámico en HTML con `escapeHtml()`.
5. **Tipado Estricto (No `any`)**: Mantener unions estrictas (`FoodCategory`, `MuscleGroup`, `Meal.name`, `TrainerDiet.type`).
