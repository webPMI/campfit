# CampFit - Contexto del Proyecto

> **Contexto comprimido para agentes de IA.** Última actualización: 2026-07-26

## Stack
- **Framework:** Astro 7 (SSR con `@astrojs/node`)
- **UI:** Vanilla JS (sin React)
- **Estilos:** Tailwind CSS 4 (Theme System, dark & light mode tokens)
- **Estado:** Nanostores
- **DB:** Cloud Firestore (NoSQL, 7 colecciones)
- **Storage:** Cloudflare R2
- **Testing:** Vitest + Playwright
- **Mobile:** Capacitor 6

## Estructura src/
```
src/
├── components/     # Componentes .astro (UIButton, UIInput, UICard, UILogoIcon, UIProgress, UIAvatar, UIEmptyState)
├── layouts/        # Layouts por rol (BaseLayout, AdminLayout, ClientLayout, TrainerLayout, PublicPageLayout)
├── pages/          # Páginas + API routes (33 rutas estáticas)
│   ├── admin/      # dashboard, users, trainers, clients, clinical, diets, workouts, progress, chat, settings
│   ├── client/     # dashboard, workouts, diets, progress, medical-profile, chat, support, settings
│   └── trainer/    # dashboard, clients, clinical, workouts, diets, chat, settings
├── lib/
│   ├── shared/     # ui.ts, chat.ts, logger.ts, authGuard.ts, i18n.ts, profileService.ts, settingsService.ts
│   ├── admin/      # Módulo admin modularizado (7 archivos: types, adminAuth, adminUsers, adminSubscriptions, adminRender, adminInit, adminUtils)
│   ├── trainer/    # Módulo trainer modularizado (10 archivos: types, trainerAuth, trainerClients, trainerWorkouts, trainerDiets, trainerProgress, trainerChat, trainerRender, trainerInit, trainerUtils)
│   ├── client/     # chatService.ts, dietService.ts, progressService.ts, workoutService.ts
│   ├── helpers/    # userMappers.ts
│   ├── firebase/   # auth.ts, firestore.ts (wrappers testing)
│   └── debug/      # firestoreDebug.ts
├── services/       # authService.ts, adminService.ts
├── stores/         # authStore.ts (Nanostores)
├── types/          # index.ts (User, MedicalProfile, etc.)
└── i18n/           # translations.ts (286 keys 1:1 ES/EN), client.ts
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
- `/admin/progress` - Monitoreo de progreso del sistema
- `/admin/chat` - Supervisión de mensajes
- `/admin/settings` - Configuración de cuenta admin

### 🏋️ Rutas de Entrenador (Trainer Routes - `/trainer/*`)
- `/trainer/dashboard` - Panel principal de entrenador
- `/trainer/clients` - Clientes asignados al trainer
- `/trainer/clinical` - Historial médico de clientes
- `/trainer/workouts` - Creación y asignación de rutinas
- `/trainer/diets` - Creación y asignación de dietas
- `/trainer/chat` - Mensajería directa con clientes
- `/trainer/settings` - Configuración de cuenta de entrenador

### 👤 Rutas de Cliente (Client Routes - `/client/*`)
- `/client/dashboard` - Resumen diario de entrenamiento y dieta
- `/client/workouts` - Rutinas activas y progreso semanal
- `/client/diets` - Plan nutricional y macros diarios
- `/client/progress` - Registro de peso y evolución
- `/client/medical-profile` - Edición de perfil médico y emergencia
- `/client/chat` - Chat con el entrenador asignado
- `/client/support` - Preguntas frecuentes y centro de ayuda
- `/client/settings` - Configuración de tema, idioma y contraseña

---

## Roles y Permisos
- `admin` - Acceso total a `/admin/*` y dashboard global
- `trainer` - Acceso a clientes asignados en `/trainer/*`
- `client` - Acceso a sus rutinas y métricas personales en `/client/*`

## Colecciones Firestore
- `users` - Perfiles de usuario
- `workouts` - Rutinas de entrenamiento
- `diets` - Planes nutricionales
- `messages` - Mensajes del chat
- `progress_logs` - Registros de progreso
- `exercises_library` - Biblioteca de ejercicios
- `diet_templates` - Plantillas de dietas

## Estado de Calidad y Tests
- **Tests Centralizados en `tests/`**
- **Pruebas Unitarias:** 426+ tests pasados (Vitest)
- **TypeScript:** 100% libre de errores (`npm run type-check`)
- **Compilaciones Estáticas:** 34 páginas estáticas generadas correctamente
- **WCAG AA Compliance:** Contraste de colores $\ge 4.5:1$ en modo claro y oscuro, indicadores de foco visibles
- **i18n:** Paridad 1:1 completa entre Español e Inglés (286 claves globales)
