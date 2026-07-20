# CampFit - Contexto del Proyecto

> **Contexto comprimido para agentes de IA.** Última actualización: 2026-07-20

## Stack
- **Framework:** Astro 7 (SSR con `@astrojs/node`)
- **UI:** Vanilla JS (sin React)
- **Estilos:** Tailwind CSS 4 (dark mode)
- **Estado:** Nanostores
- **DB:** Cloud Firestore (NoSQL, 7 colecciones)
- **Storage:** Cloudflare R2
- **Testing:** Vitest + Playwright
- **Mobile:** Capacitor 6

## Estructura src/
```
src/
├── components/     # Componentes .astro
├── layouts/        # Layouts por rol (Base, Admin, Client, Trainer, PublicPage)
├── pages/          # Páginas + API routes
│   ├── admin/      # dashboard, users, trainers, clients, settings
│   ├── client/     # dashboard, workouts, diets, progress, chat, support, settings
│   └── trainer/    # dashboard, clients, workouts, diets, chat, settings
├── lib/
│   ├── shared/     # ui.ts, chat.ts, logger.ts, authGuard.ts, i18n.ts, profileService.ts
│   ├── admin/      # adminUtils.ts (lógica admin)
│   ├── trainer/    # trainerUtils.ts (lógica trainer)
│   ├── client/     # chatService.ts, dietService.ts, progressService.ts, workoutService.ts
│   ├── helpers/    # userMappers.ts
│   ├── firebase/   # auth.ts, firestore.ts (wrappers testing)
│   └── debug/      # firestoreDebug.ts
├── services/       # authService.ts, adminService.ts
├── stores/         # authStore.ts (Nanostores)
├── types/          # index.ts (User, MedicalProfile, etc.)
└── i18n/           # translations.ts, client.ts
```

## Roles
- `admin` - Administración del sistema
- `trainer` - Entrenadores con clientes asignados
- `client` - Clientes finales

## Colecciones Firestore
- `users` - Perfiles de usuario
- `workouts` - Rutinas de entrenamiento
- `diets` - Planes nutricionales
- `messages` - Mensajes del chat
- `progress_logs` - Registros de progreso
- `exercises_library` - Biblioteca de ejercicios
- `diet_templates` - Plantillas de dietas

## Tests
- **Centralizados en `tests/`** (nada en `src/__tests__/`)
- Unitarios: Vitest (node, sin jsdom)
- E2E: Playwright
- Mocks: Firebase (auth, firestore, storage)

## Comandos Rápidos
```bash
npm run dev              # Dev server
npm test                 # Tests unitarios
npm run test:e2e         # Tests E2E
npm run astro check      # TypeScript check
npm run build            # Build producción
```

## Archivos Clave para Agentes
- `.clinerules` - Golden Rules (LEER ANTES DE CODIFICAR)
- `AGENTS_GUIDE.md` - Guía completa para agentes
- `TODO.md` - Tareas pendientes
- `GIT_WORKFLOW.md` - Flujo de git
- `nuevo_proyecto/00_indice.md` - Índice de documentación

## Estado Actual
- ✅ Refactorización Fase 1-3 completada (shared/ui, shared/chat, shared/logger)
- ✅ Tests: 260 tests, 18 archivos, 22.62% cobertura statements
- ⏳ Pendiente: adminUtils.ts refactor, trainerUtils.ts refactor, optimización Firestore
- ⏳ Pendiente: CI/CD pipeline, tests E2E, subida fotos R2
