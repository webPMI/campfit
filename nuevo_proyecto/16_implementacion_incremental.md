# 📋 Estrategia de Implementación Incremental - CampFit 2.0

## Principios

1. **Micro-pasos seguros**: Cada paso es pequeño, testeable y desplegable
2. **Sin regresión**: Tests antes y después de cada cambio
3. **Revertible**: Cada paso puede revertirse sin afectar otros
4. **Documentado**: Cada paso actualiza la documentación relevante

---

## Fase 0: Fundación (Semana 1)

### Paso 0.1: Setup del Proyecto
- [x] Inicializar proyecto Astro 7 con `@astrojs/node`
- [x] Configurar Tailwind CSS 4 con `@tailwindcss/vite`
- [x] Configurar TypeScript estricto
- [x] Configurar ESLint + Prettier
- [x] Configurar Vitest + Playwright
- [x] Configurar Nanostores
- [x] Configurar Firebase (Client SDK)
- [x] Crear `.env.example`
- [x] Crear estructura de directorios

### Paso 0.2: Tipos Base
- [x] Definir `User` (con role, medicalProfile, etc.)
- [x] Definir `MedicalProfile`
- [x] Definir `LoginForm`, `RegisterForm`, `AuthError`
- [x] Definir tipos para workouts, diets, messages, progress_logs

### Paso 0.3: Firebase Config
- [x] Configurar `lib/firebase.ts` (auth + firestore)
- [x] Configurar reglas de seguridad de Firestore
- [x] Crear índices compuestos necesarios

---

## Fase 1: Autenticación (Semana 1-2)

### Paso 1.1: Auth Store
- [x] Crear `stores/authStore.ts` con Nanostores
- [x] Stores: `$user`, `$authLoading`, `$authError`
- [x] Stores computados: `$isAuthenticated`, `$userRole`, `$isAdmin`, `$isClient`
- [x] Funciones setter: `setUser`, `setAuthLoading`, `logout`

### Paso 1.2: Auth Service
- [x] Crear `services/authService.ts`
- [x] `registerUser(name, email, password)` - Firebase Auth + Firestore
- [x] `loginUser(email, password)` - Firebase Auth + Firestore
- [x] `logoutUser()` - Firebase Auth signOut
- [x] `recoverPassword(email)` - Firebase Auth reset
- [x] `onAuthChange(callback)` - Observer de estado

### Paso 1.3: Route Guards
- [x] Crear `lib/routeGuards.ts`
- [x] `checkRouteAccess(path, user)` - Verifica acceso por rol
- [x] Redirección a login si no autenticado
- [x] Redirección a perfil médico si onboarding pendiente
- [x] Crear `lib/shared/authGuard.ts` - Guards unificados (`requireAuth`, `requireAdmin`)
- [x] Crear `lib/auth/roleRedirect.ts` - Redirección post-login por rol

### Paso 1.4: Páginas de Auth
- [x] `pages/login.astro` - Formulario de login
- [x] `pages/register.astro` - Formulario de registro
- [x] `pages/recover.astro` - Formulario de recuperación
- [x] `pages/dashboard.astro` - Dashboard post-login (redirección por rol)
- [x] `pages/onboarding.astro` - Onboarding post-registro

### Paso 1.5: Onboarding
- [x] `pages/client/medical-profile.astro` - Perfil médico
- [x] Guardado en Firestore: `users/{uid}/medicalProfile`
- [x] Redirección a `/client/dashboard` tras completar

---

## Fase 2: Layouts y Navegación (Semana 2)

### Paso 2.1: Layouts Base
- [x] `layouts/BaseLayout.astro` - Layout base (head, scripts, meta)
- [x] `layouts/AdminLayout.astro` - Sidebar + header
- [x] `layouts/ClientLayout.astro` - Bottom navigation
- [x] `layouts/TrainerLayout.astro` - Layout entrenador

### Paso 2.2: Componentes de Navegación
- [x] Sidebar para admin (5 items: Dashboard, Usuarios, Clientes, Entrenadores, Configuración)
- [x] Bottom nav para cliente (5 items: Inicio, Rutinas, Dietas, Progreso, Chat)
- [x] Sidebar para trainer (6 items: Dashboard, Clientes, Rutinas, Dietas, Chat, Configuración)
- [x] Active state según ruta actual
- [x] Responsive (sidebar colapsable en móvil)

---

## Fase 3: Módulo Admin (Semana 2-3)

### Paso 3.1: Admin Dashboard
- [x] `pages/admin/dashboard.astro`
- [x] StatCards con datos en tiempo real
- [x] Últimos mensajes
- [x] Alertas activas

### Paso 3.2: Gestión de Usuarios
- [x] `pages/admin/users.astro`
- [x] DataTable con usuarios
- [x] Búsqueda y filtros
- [x] Modal de edición
- [x] Envío de alertas
- [x] Eliminación de usuarios

### Paso 3.3: Listas de Clientes y Entrenadores
- [x] `pages/admin/clients.astro` - Lista filtrada de clientes
- [x] `pages/admin/trainers.astro` - Lista filtrada de entrenadores

### Paso 3.4: Gestión de Contenido (Pendiente)
- [ ] `pages/admin/workouts.astro` - Listado de rutinas
- [ ] `pages/admin/diets.astro` - Listado de dietas
- [ ] CRUD de rutinas y dietas

### Paso 3.5: Bandeja de Chat (Pendiente)
- [ ] `pages/admin/chat.astro`
- [ ] Lista de conversaciones
- [ ] Chat en tiempo real
- [ ] Envío de alertas desde chat

### Paso 3.6: Visor de Progreso (Pendiente)
- [ ] `pages/admin/progress.astro`
- [ ] Selector de cliente
- [ ] Gráfico de evolución de peso
- [ ] Adherencia (rutina + dieta)

### Paso 3.7: Configuración
- [x] `pages/admin/settings.astro`
- [x] Perfil de administrador
- [x] Preferencias del sistema

---

## Fase 4: Módulo Cliente (Semana 3-4)

### Paso 4.1: Dashboard Cliente
- [x] `pages/client/dashboard.astro`
- [x] StatCards: progreso rutina, adherencia dieta
- [x] Quick actions
- [x] Stats rápidas

### Paso 4.2: Visualizador de Rutinas
- [x] `pages/client/workouts.astro`
- [x] TabBar con días de la semana
- [x] Lista de ejercicios con series, reps, descanso
- [x] Modal RPE al completar

### Paso 4.3: Visualizador de Dietas
- [x] `pages/client/diets.astro`
- [x] TabBar con comidas del día
- [x] Detalle de cada comida (calorías, macros)
- [x] Checkbox de completado

### Paso 4.4: Progreso
- [x] `pages/client/progress.astro`
- [x] Tabs: Peso | Fotos
- [x] LineChart de evolución de peso
- [x] Registro de nuevo peso
- [x] Galería de fotos
- [ ] Subida de fotos a R2 (pendiente)

### Paso 4.5: Chat 1:1
- [x] `pages/client/chat.astro`
- [x] Stream de mensajes en tiempo real
- [x] Envío de mensajes
- [x] Visualización de alertas

### Paso 4.6: Chatbot de Soporte
- [x] `pages/client/support.astro`
- [x] FAQs predefinidas
- [x] Redirección a chat si no es FAQ

### Paso 4.7: Configuración del Cliente
- [x] `pages/client/settings.astro`
- [x] Perfil del cliente
- [x] Preferencias

---

## Fase 5: Módulo Trainer (Semana 4)

### Paso 5.1: Dashboard Trainer
- [x] `pages/trainer/dashboard.astro`
- [x] Resumen de clientes asignados
- [x] Estadísticas rápidas

### Paso 5.2: Gestión de Clientes
- [x] `pages/trainer/clients.astro`
- [x] Lista de clientes asignados
- [x] Perfiles de clientes

### Paso 5.3: Gestión de Rutinas
- [x] `pages/trainer/workouts.astro`
- [x] CRUD de rutinas para clientes asignados

### Paso 5.4: Gestión de Dietas
- [x] `pages/trainer/diets.astro`
- [x] CRUD de dietas para clientes asignados

### Paso 5.5: Chat con Clientes
- [x] `pages/trainer/chat.astro`
- [x] Lista de conversaciones con clientes
- [x] Chat en tiempo real

### Paso 5.6: Configuración del Trainer
- [x] `pages/trainer/settings.astro`
- [x] Perfil del entrenador

---

## Fase 6: Refactorización y Código Compartido (Paralelo)

### Paso 6.1: Módulos Compartidos
- [x] `lib/shared/logger.ts` - Sistema de logging global
- [x] `lib/shared/ui.ts` - Iconos, toast, estados UI
- [x] `lib/shared/chat.ts` - ChatService unificado
- [x] `lib/shared/authGuard.ts` - Guards unificados
- [x] `lib/shared/i18n.ts` - Utilidades i18n compartidas
- [x] `lib/shared/profileService.ts` - Servicio de perfiles
- [x] `lib/firebase/auth.ts` - Wrapper de firebase/auth para testing
- [x] `lib/firebase/firestore.ts` - Wrapper de firebase/firestore para testing

### Paso 6.2: Limpieza de Código Duplicado (Pendiente)
- [ ] Eliminar `lib/client/chatService.ts` (reemplazado por `lib/shared/chat.ts`)
- [ ] Refactorizar `adminUtils.ts` para usar `lib/shared/ui.ts`
- [ ] Refactorizar `trainerUtils.ts` para usar `lib/shared/ui.ts`

---

## Fase 7: Testing (Paralelo)

### Paso 7.1: Setup de Tests
- [x] `tests/setup/setup.ts` - Setup global
- [x] `tests/mocks/factories.ts` - Factories de datos
- [x] `tests/mocks/firebase.ts` - Mocks de Firebase

### Paso 7.2: Tests Unitarios
- [x] Tests de `authService.ts`
- [x] Tests de `authStore.ts`
- [x] Tests de `validators.ts`
- [x] Tests de `routeGuards.ts`
- [x] Tests de `adminService.ts`
- [x] Tests de `adminUtils.ts`
- [x] Tests de `profileService.ts`
- [x] Tests de `trainerUtils.ts`
- [x] Tests de `client/chatService.ts`
- [x] Tests de `client/dietService.ts`
- [x] Tests de `client/progressService.ts`
- [x] Tests de `client/workoutService.ts`

### Paso 7.3: Tests E2E
- [ ] Tests de flujo de registro
- [ ] Tests de flujo de login
- [ ] Tests de flujo de admin
- [ ] Tests de flujo de cliente

---

## Fase 8: Integraciones (Semana 5+)

### Paso 8.1: Cloudflare R2
- [ ] Configurar bucket R2
- [ ] Implementar Worker para URLs prefirmadas
- [ ] Integrar subida de fotos en progreso

### Paso 8.2: CI/CD
- [ ] GitHub Actions: lint + test + build
- [ ] GitHub Actions: deploy a producción

### Paso 8.3: Monitoreo
- [ ] Configurar Sentry (errores)
- [ ] Configurar PostHog (analítica)

---

## Prioridades para Próximo Sprint

1. **CRUD de rutinas y dietas** (admin)
2. **Bandeja de chat** (admin)
3. **Visor de progreso** (admin)
4. **Subida de fotos a R2** (client)
5. **Limpieza de código duplicado** (chatService legacy, adminUtils, trainerUtils)
6. **Tests E2E**
7. **CI/CD**
8. **Monitoreo (Sentry + PostHog)**

---

> **📌 Documentación de referencia:** Ver `00_indice.md` para el índice completo.
> **📌 API Contracts:** Ver `15_api_contracts.md` para índices y streams de Firestore.
> **📌 Guía de testing:** Ver `12_guia_desarrollo_testing.md` para convenciones de tests.
