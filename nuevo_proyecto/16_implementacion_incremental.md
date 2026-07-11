# 📋 Estrategia de Implementación Incremental - CampFit 2.0

## Principios

1. **Micro-pasos seguros**: Cada paso es pequeño, testeable y desplegable
2. **Sin regresión**: Tests antes y después de cada cambio
3. **Revertible**: Cada paso puede revertirse sin afectar otros
4. **Documentado**: Cada paso actualiza la documentación relevante

---

## Fase 0: Fundación (Semana 1)

### Paso 0.1: Setup del Proyecto
- [x] Inicializar proyecto Astro 5 con `@astrojs/node`
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

### Paso 1.4: Páginas de Auth
- [x] `pages/login.astro` - Formulario de login
- [x] `pages/register.astro` - Formulario de registro
- [x] `pages/recover.astro` - Formulario de recuperación
- [x] `pages/dashboard.astro` - Dashboard post-login (redirección por rol)

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
- [x] Sidebar para admin (7 items)
- [x] Bottom nav para cliente (5 items)
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

### Paso 3.3: Gestión de Contenido
- [ ] `pages/admin/workouts.astro` - Listado de rutinas
- [ ] `pages/admin/diets.astro` - Listado de dietas
- [ ] CRUD de rutinas y dietas

### Paso 3.4: Bandeja de Chat
- [ ] `pages/admin/chat.astro`
- [ ] Lista de conversaciones
- [ ] Chat en tiempo real
- [ ] Envío de alertas desde chat

### Paso 3.5: Visor de Progreso
- [ ] `pages/admin/progress.astro`
- [ ] Selector de cliente
- [ ] Gráfico de evolución de peso
- [ ] Adherencia (rutina + dieta)

### Paso 3.6: Configuración
- [x] `pages/admin/settings.astro`
- [x] Perfil de administrador
- [x] Preferencias del sistema

---

## Fase 4: Módulo Cliente (Semana 3-4)

### Paso 4.1: Dashboard Cliente
- [ ] `pages/client/dashboard.astro`
- [ ] StatCards: progreso rutina, adherencia dieta
- [ ] Quick actions
- [ ] Stats rápidas

### Paso 4.2: Visualizador de Rutinas
- [ ] `pages/client/workouts.astro`
- [ ] TabBar con días de la semana
- [ ] Lista de ejercicios con series, reps, descanso
- [ ] Modal RPE al completar

### Paso 4.3: Visualizador de Dietas
- [ ] `pages/client/diets.astro`
- [ ] TabBar con comidas del día
- [ ] Detalle de cada comida (calorías, macros)
- [ ] Checkbox de completado

### Paso 4.4: Progreso
- [ ] `pages/client/progress.astro`
- [ ] Tabs: Peso | Fotos
- [ ] LineChart de evolución de peso
- [ ] Registro de nuevo peso
- [ ] Galería de fotos
- [ ] Subida de fotos a R2

### Paso 4.5: Chat 1:1
- [ ] `pages/client/chat.astro`
- [ ] Stream de mensajes en tiempo real
- [ ] Envío de mensajes
- [ ] Visualización de alertas

### Paso 4.6: Chatbot de Soporte
- [ ] `pages/client/support.astro`
- [ ] FAQs predefinidas
- [ ] Redirección a chat si no es FAQ

---

## Fase 5: Testing (Paralelo)

### Paso 5.1: Setup de Tests
- [x] `tests/setup/setup.ts` - Setup global
- [x] `tests/mocks/factories.ts` - Factories de datos
- [x] `tests/mocks/firebase.ts` - Mocks de Firebase

### Paso 5.2: Tests Unitarios
- [x] Tests de `authService.ts`
- [x] Tests de `authStore.ts`
- [x] Tests de `validators.ts`
- [x] Tests de `routeGuards.ts`
- [x] Tests de `adminService.ts`
- [x] Tests de `adminUtils.ts`
- [x] Tests de `profileService.ts`

### Paso 5.3: Tests E2E
- [ ] Tests de flujo de registro
- [ ] Tests de flujo de login
- [ ] Tests de flujo de admin
- [ ] Tests de flujo de cliente

---

## Fase 6: Integraciones (Semana 4-5)

### Paso 6.1: Cloudflare R2
- [ ] Configurar bucket R2
- [ ] Implementar Worker para URLs prefirmadas
- [ ] Integrar subida de fotos en progreso

### Paso 6.2: CI/CD
- [ ] GitHub Actions: lint + test + build
- [ ] GitHub Actions: deploy a producción

### Paso 6.3: Monitoreo
- [ ] Configurar Sentry (errores)
- [ ] Configurar PostHog (analítica)

---

## Prioridades para Próximo Sprint

1. **CRUD de rutinas y dietas** (admin)
2. **Bandeja de chat** (admin)
3. **Dashboard de cliente** (client)
4. **Visualizador de rutinas** (client)
5. **Visualizador de dietas** (client)
6. **Módulo de progreso** (client)
7. **Chat 1:1** (client)
8. **Chatbot de soporte** (client)
9. **Visor de progreso** (admin)
10. **Tests E2E**

---

> **� Documentación de referencia:** Ver `00_indice.md` para el índice completo.
> **📌 API Contracts:** Ver `15_api_contracts.md` para índices y streams de Firestore.
> **📌 Guía de testing:** Ver `12_guia_desarrollo_testing.md` para convenciones de tests.
