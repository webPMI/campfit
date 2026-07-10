# 🏗️ Arquitectura Técnica - CampFit

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **Framework** | Astro 7 | SSR, routing, server output con `@astrojs/node` standalone |
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
│   ├── i18n/                # Internacionalización (es/en)
│   │   ├── client.ts        # Traducciones para el cliente JS
│   │   └── translations.ts  # Traducciones completas (SSR)
│   ├── layouts/             # Layouts por rol
│   │   ├── BaseLayout.astro
│   │   ├── AdminLayout.astro
│   │   ├── ClientLayout.astro
│   │   └── TrainerLayout.astro
│   ├── lib/                 # Utilidades compartidas
│   │   ├── admin/           # adminUtils.ts (iconos, tipos, renderizado, servicios)
│   │   ├── firebase.ts      # Configuración de Firebase
│   │   ├── routeGuards.ts   # Guardias de ruta por rol
│   │   └── validators.ts    # Validación de formularios
│   ├── pages/               # Páginas (rutas)
│   │   ├── index.astro      # Landing page
│   │   ├── login.astro      # Inicio de sesión
│   │   ├── register.astro   # Registro
│   │   ├── recover.astro    # Recuperar contraseña
│   │   ├── dashboard.astro  # Dashboard post-login
│   │   ├── admin/           # Panel de administración
│   │   ├── client/          # Panel de cliente
│   │   ├── trainer/         # Panel de entrenador
│   │   └── api/             # Endpoints API
│   ├── services/            # Servicios (Firebase)
│   │   ├── authService.ts   # Autenticación
│   │   └── adminService.ts  # Administración
│   ├── stores/              # Stores reactivos
│   │   └── authStore.ts     # Estado de autenticación (Nanostores)
│   └── types/               # Tipos TypeScript
│       └── index.ts
├── tests/                   # Tests
├── astro.config.mjs         # Configuración de Astro
├── tsconfig.json            # Configuración de TypeScript
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

---

## Roles y Rutas

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/` | Público | Landing page |
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Registro |
| `/recover` | Público | Recuperar contraseña |
| `/dashboard` | Autenticado | Dashboard post-login |
| `/client/*` | client | Panel de cliente |
| `/trainer/*` | trainer | Panel de entrenador |
| `/admin/*` | admin | Panel de administración |

---

> **📌 Variables de entorno:** Ver `13_setup_guide.md` para la lista completa.
> **📌 Setup inicial:** Ver `13_setup_guide.md` para la guía paso a paso.
