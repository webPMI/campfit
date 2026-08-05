# CampFit - Contexto del Proyecto

> **Contexto comprimido para agentes de IA.** Última actualización: 2026-08-05

## Stack
- **Framework:** Astro 7 (SSG mode - static HTML output + client hydration)
- **UI:** Vanilla JS (sin React) + Astro components
- **Estilos:** Tailwind CSS 4 (Theme System, dark & light mode tokens, flavors)
- **Estado:** Nanostores
- **DB:** Cloud Firestore (NoSQL, 11 colecciones)
- **Storage:** Cloudflare R2
- **Testing:** Vitest + Playwright
- **Mobile:** Capacitor 6

## Estructura src/
```
src/
├── components/     # Componentes .astro (UIButton, UIInput, UICard, UILogoIcon, UIProgress, UIAvatar, UIEmptyState)
├── layouts/        # Layouts por rol (BaseLayout, AdminLayout, ClientLayout, TrainerLayout, PublicPageLayout)
├── pages/          # Páginas + API routes (34+ rutas estáticas)
│   ├── admin/      # dashboard, users, trainers, clients, clinical, diets, workouts, progress, chat, settings, foods, exercises
│   ├── client/     # dashboard, workouts, diets, progress, medical-profile, chat, support, settings
│   └── trainer/    # dashboard, clients, clinical, workouts, diets, chat, settings
├── lib/
│   ├── shared/     # ui.ts, chat.ts, logger.ts, authGuard.ts, i18n.ts, profileService.ts, settingsService.ts, foodLibrary.ts, exerciseLibrary.ts
│   ├── admin/      # Módulo admin modularizado (types, adminAuth, adminUsers, adminSubscriptions, adminRender, adminInit, adminUtils)
│   ├── trainer/    # Módulo trainer modularizado (types, trainerAuth, trainerClients, trainerWorkouts, trainerDiets, trainerProgress, trainerChat, trainerRender, trainerInit, trainerUtils, templateService)
│   ├── client/     # chatService.ts, dietService.ts, progressService.ts, workoutService.ts, intoleranceChecker.ts
│   ├── helpers/    # userMappers.ts
│   ├── firebase/   # auth.ts, firestore.ts (wrappers testing)
│   └── debug/      # firestoreDebug.ts
├── services/       # authService.ts, adminService.ts
├── stores/         # authStore.ts, themeStore.ts (Nanostores)
├── types/          # index.ts (User, MedicalProfile, FoodItem, ExerciseItem, UserExercisePreferences, etc.)
└── i18n/           # translations.ts (286+ keys 1:1 ES/EN), client.ts
```

## Mapa de Rutas de la Aplicación (Agent Routes Map)

### 🔓 Rutas Públicas (Public Routes)
- `/` - Landing page pública
- `/login` - Iniciar sesión (Google / Email)
- `/register` - Registro de usuario
- `/recover` - Recuperación de contraseña
- `/onboarding` - Flujo inicial de perfil médico y objetivos

### 🛡️ Rutas de Administrador (Admin Routes - `/admin/*`)
- `/admin/dashboard` - Panel de resumen del sistema y métricas globales
- `/admin/users` - Gestión y asignación de roles de usuarios
- `/admin/trainers` - Administración de entrenadores
- `/admin/clients` - Listado y detalle de todos los clientes
- `/admin/clinical` - Fichas clínicas y perfiles médicos
- `/admin/workouts` - Vista global de rutinas asignadas
- `/admin/diets` - Vista global de planes nutricionales
- `/admin/foods` - Gestión del catálogo central de alimentos
- `/admin/exercises` - Gestión del catálogo central de ejercicios
- `/admin/progress` - Monitoreo de progreso del sistema
- `/admin/chat` - Supervisión de mensajes
- `/admin/settings` - Configuración de cuenta admin

### 🏋️ Rutas de Entrenador (Trainer Routes - `/trainer/*`)
- `/trainer/dashboard` - Panel principal de entrenador
- `/trainer/clients` - Clientes asignados al trainer
- `/trainer/clinical` - Historial médico de clientes
- `/trainer/workouts` - Creación y asignación de rutinas (con plantillas y catálogo)
- `/trainer/diets` - Creación y asignación de dietas (con chequeo automático de intolerancias/conflictos)
- `/trainer/chat` - Mensajería directa con clientes
- `/trainer/settings` - Configuración de cuenta de entrenador

### 👤 Rutas de Cliente (Client Routes - `/client/*`)
- `/client/dashboard` - Resumen diario de entrenamiento y dieta
- `/client/workouts` - Rutinas activas, registro de sesión y preferencias de ejercicios (ratings/exclusiones)
- `/client/diets` - Plan nutricional, macros diarios y registro de comidas
- `/client/progress` - Registro de peso y evolución
- `/client/medical-profile` - Edición de perfil médico, alergias, intolerancias y alimentos excluidos
- `/client/chat` - Chat con el entrenador asignado
- `/client/support` - Preguntas frecuentes y centro de ayuda
- `/client/settings` - Configuración de tema, idioma y contraseña

---

## Roles y Permisos
- `admin` - Acceso total a `/admin/*` y catálogo central
- `trainer` - Acceso a clientes asignados en `/trainer/*`
- `client` - Acceso a sus rutinas y métricas personales en `/client/*`

## Colecciones Firestore (11 Colecciones)
- `users` - Perfiles de usuario y roles
- `workouts` - Rutinas de entrenamiento por cliente
- `diets` - Planes nutricionales por cliente
- `messages` - Mensajes del chat
- `progress_logs` - Registros de progreso (peso, rpe, etc.)
- `foods_library` - Catálogo central de alimentos (multilenguaje, macros, alérgenos, soft delete)
- `exercises_library` - Catálogo central de ejercicios (multilenguaje, músculos, equipamiento, contraindicaciones)
- `user_exercise_prefs` - Preferencias de ejercicios por cliente (ratings 1-5, favoritos, exclusiones, solicitudes)
- `workout_templates` - Plantillas de rutinas predeterminadas
- `diet_templates` - Plantillas de dietas predeterminadas
- `exercise_templates` / `meal_templates` - Auxiliares de plantillas
