# 🏗️ Arquitectura Técnica - CampFit

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **Framework** | Astro 7 | SSR, routing, server output |
| **UI** | Vanilla JS | Sin React. Componentes HTML renderizados desde JS puro |
| **Estilos** | Tailwind CSS 4 | Utility-first con `@tailwindcss/vite`, modo oscuro |
| **Estado** | Nanostores | Stores reactivos ligeros (auth store) |
| **Auth + DB** | Firebase Auth + Firestore | Autenticación y base de datos NoSQL en tiempo real |
| **Testing** | Vitest + Playwright | Tests unitarios y E2E |

---

## 🏛️ Estructura del Proyecto

```
campfit-astro/
├── public/                  # Archivos estáticos
├── src/
│   ├── components/          # Componentes .astro reutilizables
│   │   └── Skeleton.astro   # Componente skeleton para loading
│   ├── i18n/                # Internacionalización (es/en)
│   │   ├── client.ts        # Traducciones para el cliente JS
│   │   └── translations.ts  # Traducciones completas (SSR)
│   ├── layouts/             # Layouts por rol
│   │   ├── BaseLayout.astro
│   │   ├── AdminLayout.astro
│   │   ├── ClientLayout.astro
│   │   └── TrainerLayout.astro
│   ├── lib/                 # Utilidades y servicios
│   │   ├── admin/           # adminUtils.ts — Lógica específica de admin
│   │   ├── auth/            # roleRedirect.ts — Redirección por rol post-login
│   │   ├── client/          # Servicios del lado cliente
│   │   │   ├── chatService.ts      # Chat (legacy, migrar a shared/chat)
│   │   │   ├── dietService.ts      # Dietas del cliente
│   │   │   ├── progressService.ts  # Progreso del cliente
│   │   │   └── workoutService.ts   # Rutinas del cliente
│   │   ├── debug/           # firestoreDebug.ts — Utilidades de debugging
│   │   ├── firebase/        # Wrappers de Firebase para testing
│   │   │   ├── auth.ts      # Re-export de firebase/auth
│   │   │   └── firestore.ts # Re-export de firebase/firestore
│   │   ├── shared/          # Código compartido (sin duplicación)
│   │   │   ├── authGuard.ts       # Guards unificados (requireAuth, requireAdmin)
│   │   │   ├── chat.ts            # ChatService unificado
│   │   │   ├── i18n.ts            # Utilidades i18n compartidas
│   │   │   ├── logger.ts          # Sistema de logging global
│   │   │   ├── profileService.ts  # Servicio de perfiles
│   │   │   └── ui.ts              # Iconos, toast, estados UI
│   │   ├── trainer/         # trainerUtils.ts — Lógica específica de trainer
│   │   ├── firebase.ts      # Configuración e inicialización de Firebase
│   │   ├── routeGuards.ts   # Guardias de ruta por rol
│   │   └── validators.ts    # Validación de formularios
│   ├── pages/               # Páginas (rutas)
│   │   ├── index.astro      # Landing page
│   │   ├── login.astro      # Inicio de sesión
│   │   ├── register.astro   # Registro
│   │   ├── recover.astro    # Recuperar contraseña
│   │   ├── dashboard.astro  # Dashboard post-login (redirección por rol)
│   │   ├── onboarding.astro # Onboarding post-registro
│   │   ├── 404.astro        # Página no encontrada
│   │   ├── 500.astro        # Error del servidor
│   │   ├── admin/           # Panel de administración
│   │   │   ├── dashboard.astro
│   │   │   ├── users.astro
│   │   │   ├── clients.astro
│   │   │   ├── trainers.astro
│   │   │   └── settings.astro
│   │   ├── client/          # Panel de cliente
│   │   │   ├── dashboard.astro
│   │   │   ├── medical-profile.astro
│   │   │   ├── workouts.astro
│   │   │   ├── diets.astro
│   │   │   ├── progress.astro
│   │   │   ├── chat.astro
│   │   │   ├── support.astro
│   │   │   └── settings.astro
│   │   └── trainer/         # Panel de entrenador
│   │       ├── dashboard.astro
│   │       ├── clients.astro
│   │       ├── workouts.astro
│   │       ├── diets.astro
│   │       ├── chat.astro
│   │       └── settings.astro
│   ├── services/            # Servicios (Firebase)
│   │   ├── authService.ts   # Autenticación
│   │   └── adminService.ts  # Administración
│   ├── stores/              # Stores reactivos
│   │   └── authStore.ts     # Estado de autenticación (Nanostores)
│   └── types/               # Tipos TypeScript
│       └── index.ts
├── tests/                   # Tests centralizados
│   ├── setup/               # Setup global (mocks Firebase)
│   ├── mocks/               # Factories de datos mock
│   ├── unit/                # Tests unitarios (Vitest)
│   ├── integration/         # Tests de integración
│   └── e2e/                 # Tests E2E (Playwright)
├── astro.config.mjs         # Configuración de Astro
├── tsconfig.json            # Configuración de TypeScript
├── vitest.config.ts         # Configuración de Vitest
├── playwright.config.ts     # Configuración de Playwright
└── package.json
```

---

## Patrón: Páginas Astro + Scripts Cliente

### Capas de Componentes

```
Páginas (Astro .astro)
  └── Layouts (Astro .astro)
       └── Scripts cliente (JS/TS en <script>)
            └── Utilidades compartidas (lib/)
                 └── Servicios Firebase (services/)
```

- **Páginas Astro**: Renderizan HTML inicial (SSR) con i18n
- **Scripts cliente**: Lógica interactiva (auth, streams Firestore, renderizado dinámico)
- **Utilidades compartidas**: Funciones puras de validación, guardias de ruta, renderizado HTML
- **Servicios**: Abstracción sobre Firebase Auth y Firestore

### Flujo de Datos

```
[Página Astro SSR] → HTML inicial con traducciones
       ↓
[Script cliente] → [Servicio Firebase] → [Firebase Auth / Firestore]
       ↓                          ↓
[Store Nanostores] ← [onSnapshot / onAuthStateChanged]
       ↓
[Renderizado dinámico] → innerHTML con componentes HTML
```

---

## Decisiones Técnicas Clave

### 1. SSR (Server-Side Rendering)
- **Output mode:** `server` con adaptador `@astrojs/node` standalone
- Páginas públicas y layouts se renderizan en servidor
- La interactividad se maneja con scripts cliente (sin islands de React)

### 2. Client SDK vs API Routes
- **Client SDK (Firebase):** Operaciones que respetan reglas de seguridad de Firestore
- **API Routes (`pages/api/`):** Operaciones que requieren Admin SDK (privilegios elevados)

### 3. Nanostores para estado global
- **$user, $authLoading, $authError**: Estado de autenticación global
- **Stores computados**: $isAuthenticated, $userRole, $isAdmin, $isTrainer, $isClient
- Suscripciones reactivas desde scripts cliente

### 4. Firestore onSnapshot vs REST polling
- **onSnapshot:** Chat, dashboard admin, listas de usuarios (datos en tiempo real)
- **Lectura única (getDoc/getDocs):** Perfiles, datos estáticos

### 5. Vanilla JS (sin React)
- Los componentes se renderizan como strings HTML desde funciones JS
- Las interacciones se manejan con event listeners directos
- Ventajas: Sin bundle de React, sin JSX, sin virtual DOM, carga inicial más rápida

### 6. Wrappers de Firebase para testing
- `src/lib/firebase/auth.ts` y `src/lib/firebase/firestore.ts` re-exportan funciones de Firebase
- Permiten mockear fácilmente en tests sin tocar firebase/large modules

---

## Roles y Rutas

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/` | Público | Landing page |
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Registro |
| `/recover` | Público | Recuperar contraseña |
| `/onboarding` | Autenticado | Onboarding post-registro |
| `/dashboard` | Autenticado | Dashboard post-login (redirección por rol) |
| `/client/*` | client | Panel de cliente |
| `/trainer/*` | trainer | Panel de entrenador |
| `/admin/*` | admin | Panel de administración |

---

> **📌 Variables de entorno:** Ver `13_setup_guide.md` para la lista completa.
> **📌 Setup inicial:** Ver `13_setup_guide.md` para la guía paso a paso.
