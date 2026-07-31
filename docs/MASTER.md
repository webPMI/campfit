# 📚 CampFit - Documentación Maestra Unificada

> **Stack:** Astro 7 + Tailwind CSS 4 + Firebase 11 + Nanostores  
> **Arquitectura:** Vanilla JS (sin React). Compilación y enrutado estático.  
> **Estado:** En desarrollo activo.  
> **Última actualización:** 2026-07-30

---

## 📑 Índice

1. [Visión y Objetivos](#1-visión-y-objetivos)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Modelo de Datos](#3-modelo-de-datos)
4. [Design System](#4-design-system)
5. [Estructura del Proyecto](#5-estructura-del-proyecto)
6. [Flujos de Navegación](#6-flujos-de-navegación)
7. [Módulo de Autenticación](#7-módulo-de-autenticación)
8. [Módulo del Cliente](#8-módulo-del-cliente)
9. [Módulo del Entrenador](#9-módulo-del-entrenador)
10. [Módulo de Administración](#10-módulo-de-administración)
11. [Reglas de Desarrollo](#11-reglas-de-desarrollo)
12. [Problemas Conocidos y TODO](#12-problemas-conocidos-y-todo)

---

## 1. Visión y Objetivos

### 1.1 Visión del Producto
CampFit es una plataforma fitness todo-en-uno que conecta de manera directa a clientes con entrenadores personales. Facilita la asignación, seguimiento y optimización de planes de entrenamiento y nutrición inteligente en tiempo real, mejorando la adherencia y los resultados mediante una interfaz limpia, interactiva y reactiva.

### 1.2 Objetivos Estratégicos
- **Adherencia:** Facilitar que el cliente registre su peso, comidas y rutinas con pocos clics para mantener la consistencia.
- **Eficiencia:** Permitir que un solo entrenador funcione con decenas de clientes mediante plantillas de dietas y rutinas.
- **Seguimiento:** Alertar al administrador y al entrenador de forma proactiva si hay inactividad o desvíos del plan de un cliente.

### 1.3 Requisitos Funcionales por Rol

#### A. Cliente (`client`)
- **Onboarding:** Formulario obligatorio al registrarse para crear su perfil médico básico (edad, altura, peso inicial, experiencia, objetivos, alergias, lesiones).
- **Dashboard:** Visualización del progreso de la rutina semanal, adherencia a la dieta diaria, estadísticas rápidas (último peso, calorías, RPE promedio, días activos) y accesos rápidos.
- **Rutinas:** Visualizar la rutina actual asignada por su entrenador y marcar cada ejercicio como completado.
- **Nutrición:** Visualizar su plan de comidas diario con macros y marcar comidas individuales como ingeridas.
- **Progreso:** Historial de registros de peso diario.
- **Chat:** Canal de comunicación directa con su entrenador asignado.

#### B. Entrenador (`trainer`)
- **Gestión de Clientes:** Listado de clientes asignados con estado de alertas y accesos rápidos a sus perfiles.
- **Creador de Planes:** Interfaces para crear y asignar rutinas de ejercicios detalladas y planes de alimentación por comidas.
- **Chat de Clientes:** Bandeja de mensajería con soporte de "Llamados de atención" (alertas manuales).

#### C. Administrador (`admin`)
- **Dashboard Global:** Estadísticas consolidadas de usuarios, rutinas, dietas y alertas activas en el sistema.
- **Control de Usuarios:** DataTable para buscar, filtrar por rol, editar perfiles, enviar emails de recuperación, bloquear/desbloquear accesos y eliminar cuentas.
- **Asignación de Roles:** Permisos únicos para promover usuarios a entrenadores o administradores.

---

## 2. Stack Tecnológico

### 2.1 Tecnologías Principales
- **Frontend:** Astro 7.x (Compilación y enrutado estático, renderizado de layouts base en servidor, lógica de negocio client-side).
- **Estilos:** Tailwind CSS 4.x mediante `@tailwindcss/vite`.
- **Base de Datos / Realtime:** Firebase 11.x (Firestore) para persistencia de datos y sincronizaciones en tiempo real mediante streams (`onSnapshot`).
- **Autenticación:** Firebase Auth (Email/Contraseña + Google Sign-In con IndexedDB para persistencia).
- **Estado Reactivo:** Nanostores 1.x (`authStore.ts`) para sincronizar el estado del usuario en el navegador de manera liviana.

### 2.2 Herramientas de Desarrollo
- **Testing:** Vitest (unitarios) + Playwright (E2E)
- **Linting:** ESLint + Prettier
- **TypeScript:** Modo estricto
- **CI/CD:** GitHub Actions

---

## 3. Modelo de Datos

### 3.1 Colección `users`
Contiene los perfiles de todos los usuarios registrados (administradores, entrenadores y clientes).

```typescript
{
  uid: string;                    // ID de documento
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
  assignedTrainerId?: string;     // Para clientes
  hasActiveAlert: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  medicalProfile?: {              // Solo para clientes
    height: number;
    initialWeight: number;
    birthDate: Timestamp | Date | string | null;
    experience: 'beginner' | 'intermediate' | 'advanced';
    goals: string[];
    allergies: string[];
    injuries: string[];
    conditions: string[];
  }
}
```

### 3.2 Colección `workouts`
Almacena las rutinas de entrenamiento activas y las plantillas.

```typescript
{
  id: string;                     // ID de documento
  clientId: string;               // Vacío si es plantilla global
  trainerId: string;              // Creador de la rutina
  name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    restTime: string;
    completed: boolean;           // Control local de sesión
  }>
}
```

### 3.3 Colección `diets`
Contiene los planes alimenticios y plantillas.

```typescript
{
  id: string;                     // ID de documento
  clientId: string;               // Vacío si es plantilla global
  trainerId: string;
  name: string;
  totalCalories: number;
  somatotype: 'ectomorph' | 'mesomorph' | 'endomorph';
  meals: Array<{
    id: string;
    name: string;
    time: string;                 // Hora de ingesta
    calories: number;
    macros: { protein: number, carbs: number, fat: number };
  }>
}
```

### 3.4 Colección `messages`
Mensajes individuales de los chats del sistema.

```typescript
{
  id: string;                     // ID de documento
  senderId: string;
  receiverId: string;
  participants: string[];         // [clientId, trainerId]
  content: string;
  type: 'text' | 'alert';
  isRead: boolean;
  createdAt: Timestamp;
}
```

### 3.5 Colección `progress_logs`
Historial de medidas y pesos de los clientes.

```typescript
{
  id: string;                     // ID de documento
  clientId: string;
  type: 'weight' | 'photo';
  value: {                        // { weight: 75.5 } o { photoUrl: '...', type: 'front' }
    [key: string]: any;
  };
  date: Timestamp;
}
```

### 3.6 Reglas de Seguridad Firestore
- Un usuario de rol `client` solo puede leer las colecciones de `workouts`, `diets` y `progress_logs` que tengan su propio `clientId`.
- La colección `users` es de solo lectura y escritura propia. **El campo `role` solo es escribible por administradores.**
- Los entrenadores y administradores tienen acceso de escritura para asignar planes, crear rutinas/dietas y enviar mensajes.

---

## 4. Design System

### 4.1 Principios de Diseño
1. **Mobile-First:** Todos los componentes se diseñan primero para móvil
2. **Modo Oscuro por Defecto:** La UI principal es dark theme
3. **Consistencia:** Sistema de tokens (colores, tipografía, espaciado)
4. **Accesibilidad:** WCAG 2.1 AA (contrastes, tamaños, roles ARIA)
5. **Animaciones Suaves:** Micro-interacciones para feedback

### 4.2 Tokens de Diseño

#### Colores (Modo Oscuro)
```css
@theme {
  --color-primary: #00E676;        /* Verde neón - acción principal */
  --color-primary-hover: #00C853;
  --color-primary-dim: #1B5E20;
  
  --color-secondary: #2979FF;      /* Azul - links, información */
  --color-secondary-hover: #2962FF;
  
  --color-bg-primary: #0A0A0A;     /* Fondo principal */
  --color-bg-secondary: #1A1A1A;   /* Tarjetas, paneles */
  --color-bg-tertiary: #2A2A2A;    /* Hover, elementos elevados */
  
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #B0B0B0;
  --color-text-disabled: #666666;
  
  --color-border: #333333;
  --color-border-light: #444444;
  
  --color-success: #00E676;
  --color-warning: #FFD600;
  --color-danger: #FF1744;
  --color-info: #2979FF;
  
  --color-alert-bg: #4A0000;       /* Fondo de alerta */
  --color-alert-border: #FF1744;
  
  --color-green: #00E676;          /* > 90% adherencia */
  --color-yellow: #FFD600;         /* 70-90% adherencia */
  --color-red: #FF1744;            /* < 70% adherencia */
}
```

#### Tipografía
```css
:root {
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

#### Espaciado
```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
}
```

#### Bordes y Sombras
```css
:root {
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-full: 9999px;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 10px rgba(0,230,118,0.3);  /* Glow verde neón */
}
```

### 4.3 Responsive Breakpoints
```css
/* Tailwind defaults */
sm: 640px    /* Móvil grande */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop pequeño */
xl: 1280px   /* Desktop */
2xl: 1536px  /* Desktop grande */

/* Estrategia: Mobile-First */
/* Por defecto: diseño móvil */
/* md: layout tablet con sidebar colapsable */
/* lg: layout desktop con sidebar permanente */
```

### 4.4 Iconos
Usar **Lucide** como librería de iconos principal (versión standalone, sin React).

Iconos clave del proyecto:
- `Dumbbell` - Rutinas/ejercicios
- `Apple` - Dietas/nutrición
- `TrendingUp` - Progreso
- `MessageCircle` - Chat
- `Bell` - Alertas/notificaciones
- `User` - Perfil
- `Settings` - Configuración
- `Shield` - Seguridad/Admin
- `Camera` - Fotos de progreso
- `Play` - Video
- `Check` - Completado
- `AlertTriangle` - Llamados de atención

---

## 5. Estructura del Proyecto

```
campfit-astro/
├── src/               # 📁 Código fuente (sin tests)
│   ├── components/    # Componentes .astro
│   ├── layouts/       # Layouts .astro
│   │   ├── BaseLayout.astro
│   │   ├── AdminLayout.astro
│   │   ├── ClientLayout.astro
│   │   └── TrainerLayout.astro
│   ├── pages/         # Páginas y API routes
│   │   ├── login.astro
│   │   ├── register.astro
│   │   ├── recover.astro
│   │   ├── dashboard.astro
│   │   ├── index.astro
│   │   ├── admin/
│   │   │   ├── dashboard.astro
│   │   │   ├── users.astro
│   │   │   ├── trainers.astro
│   │   │   ├── clients.astro
│   │   │   └── settings.astro
│   │   ├── client/
│   │   │   ├── dashboard.astro
│   │   │   ├── workouts.astro
│   │   │   ├── diets.astro
│   │   │   ├── progress.astro
│   │   │   ├── chat.astro
│   │   │   └── support.astro
│   │   └── trainer/
│   │       ├── dashboard.astro
│   │       ├── clients.astro
│   │       ├── workouts.astro
│   │       ├── diets.astro
│   │       ├── chat.astro
│   │       └── settings.astro
│   ├── lib/           # Utilidades y helpers
│   │   ├── firebase.ts
│   │   ├── validators.ts      # Validación de formularios (pure functions)
│   │   ├── routeGuards.ts     # Protección de rutas por rol
│   │   ├── admin/             # Utilidades de admin
│   │   ├── auth/              # Utilidades de auth
│   │   ├── client/            # Servicios del lado cliente
│   │   ├── debug/             # Herramientas de debug
│   │   ├── firebase/          # Configuración Firebase
│   │   ├── shared/            # Utilidades compartidas
│   │   └── trainer/           # Utilidades de trainer
│   ├── services/      # Servicios (Firebase, etc.)
│   │   ├── authService.ts     # Auth centralizado
│   │   └── adminService.ts    # Admin: CRUD usuarios, estadísticas
│   ├── stores/        # Nanostores
│   │   └── authStore.ts       # $user, $authLoading, $authError, $isAuthenticated
│   ├── types/         # Tipos globales
│   │   └── index.ts           # User, MedicalProfile, LoginForm, RegisterForm, AuthError
│   └── i18n/          # Internacionalización
│       ├── translations.ts    # ES/EN traducciones
│       └── client.ts          # Cliente i18n con persistencia localStorage
├── tests/             # 📁 TESTS CENTRALIZADOS
│   ├── setup/         # Setup global (mocks Firebase)
│   ├── mocks/         # Factories de datos mock
│   ├── unit/          # Tests unitarios (Vitest)
│   ├── integration/   # Tests de integración (Vitest + Firebase Emulator)
│   └── e2e/           # Tests E2E (Playwright)
├── docs/              # 📁 Documentación
├── vitest.config.ts   # ⚙️ Apunta a tests/
├── playwright.config.ts # ⚙️ Apunta a tests/e2e/
└── package.json
```

---

## 6. Flujos de Navegación

### 6.1 Estructura de Rutas

```
/                              # Landing / Redirección según auth
│
├── /login                     # 🔐 Inicio de sesión
├── /register                  # Registro de nuevo usuario
├── /recover                   # Recuperación de contraseña
│
├── /client/                   # 👤 Panel del Cliente
│   ├── /client/dashboard      # Resumen diario del cliente
│   ├── /client/medical-profile # Perfil médico (onboarding obligatorio)
│   ├── /client/workouts       # Visualizador de rutinas
│   ├── /client/diets          # Visualizador de dietas
│   ├── /client/progress       # Progreso (peso + fotos)
│   ├── /client/chat           # Chat 1:1 con entrenador
│   └── /client/support        # Chatbot de soporte
│
├── /admin/                    # ⚙️ Panel del Administrador
│   ├── /admin/dashboard       # Dashboard de administración
│   ├── /admin/users           # Gestión de usuarios
│   ├── /admin/workouts        # Listado de rutinas
│   ├── /admin/diets           # Listado de dietas
│   ├── /admin/chat            # Bandeja de entrada de chats
│   ├── /admin/progress        # Visor de progreso de alumnos
│   ├── /admin/settings        # Configuración del sistema
│   ├── /admin/clients         # Listado de clientes
│   └── /admin/trainers        # Listado de entrenadores
│
└── /trainer/                  # 🏋️ Panel del Entrenador
    ├── /trainer/dashboard     # Dashboard del entrenador
    ├── /trainer/clients       # Gestión de clientes
    ├── /trainer/workouts      # Creador de rutinas
    ├── /trainer/diets         # Planificador de dietas
    ├── /trainer/chat          # Bandeja de mensajes
    └── /trainer/settings      # Configuración del entrenador
```

### 6.2 Flujo de Autenticación

```
                    ┌─────────────┐
                    │  Visitante  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  /login     │
                    │  /register  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  ¿Auth OK?  │
                    └──┬──────┬───┘
                  No   │      │  Sí
              ┌────────┘      └──────────┐
              │                           │
     ┌────────▼────────┐       ┌─────────▼──────────┐
     │ Redirigir a     │       │  Obtener rol desde  │
     │ /login          │       │  Firestore (users)  │
     └─────────────────┘       └─────────┬───────────┘
                                           │
                               ┌───────────▼───────────┐
                               │   Evaluar rol del     │
                               │   usuario             │
                               └───┬───────┬───────┬───┘
                                   │       │       │
                           admin   │  client│       │ trainer
                           ┌───────┘       │       └────────┐
                           │               │                │
                    ┌──────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐
                    │  /admin/*   │  │ ¿Tiene     │  │  /trainer/*│
                    │             │  │ perfil     │  │            │
                    │             │  │ médico?    │  │            │
                    └─────────────┘  └──┬──────┬──┘  └────────────┘
                                      No│      │Sí
                               ┌────────┘      └──────────┐
                               │                           │
                        ┌──────▼──────┐           ┌───────▼──────┐
                        │  /client/   │           │  /client/    │
                        │  medical-   │           │  dashboard   │
                        │  profile    │           │              │
                        └─────────────┘           └──────────────┘
```

### 6.3 Bottom Navigation (Cliente)

| Icono | Ruta | Label |
|-------|------|-------|
| 🏠 | `/client/dashboard` | Inicio |
| 💪 | `/client/workouts` | Rutinas |
| 🥗 | `/client/diets` | Dietas |
| 📈 | `/client/progress` | Progreso |
| 💬 | `/client/chat` | Chat |

### 6.4 Sidebar Navigation (Admin)

| Icono | Ruta | Label |
|-------|------|-------|
| 📊 | `/admin/dashboard` | Dashboard |
| 👥 | `/admin/users` | Usuarios |
| 💪 | `/admin/workouts` | Rutinas |
| 🥗 | `/admin/diets` | Dietas |
| 💬 | `/admin/chat` | Chat |
| 📈 | `/admin/progress` | Progreso |
| ⚙️ | `/admin/settings` | Configuración |

---

## 7. Módulo de Autenticación

### 7.1 Descripción General
Módulo responsable del registro, inicio de sesión, recuperación de contraseña y gestión de sesiones.

**Importante:** El registro e inicio de sesión se realizan desde el Client SDK de Firebase directamente, NO a través de API Routes. Las API Routes con Admin SDK se reservan para operaciones administrativas (cambio de roles, gestión de usuarios).

### 7.2 Estructura

```
src/
├── pages/
│   ├── login.astro              # Inicio de sesión
│   ├── register.astro           # Registro
│   └── recover.astro            # Recuperación de contraseña
├── services/
│   └── authService.ts           # login, register, recover, logout
├── stores/
│   └── authStore.ts             # $user, $authLoading, $authError
├── lib/
│   ├── firebase.ts              # Configuración Firebase
│   ├── routeGuards.ts           # AuthGuard, RoleGuard, checkRouteAccess
│   └── validators.ts            # Validación de formularios
└── types/
    └── index.ts                 # User, LoginForm, RegisterForm, AuthError
```

### 7.3 Flujo de Registro

```
1. Usuario completa formulario (name, email, password)
2. Validación en cliente:
   - Email: formato válido
   - Password: mínimo 8 caracteres, 1 mayúscula, 1 número
   - Name: requerido, mínimo 2 caracteres
3. Firebase Auth (Client SDK): createUserWithEmailAndPassword(email, password)
4. Firestore (Client SDK): Crear documento en users/{uid}
   {
     name: string,
     email: string,
     role: 'client',           // Por defecto, admin se asigna manualmente
     hasActiveAlert: false,
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   }
5. Redirigir a /login con mensaje de éxito
```

### 7.4 Flujo de Inicio de Sesión

```
1. Usuario ingresa email y password
2. Firebase Auth (Client SDK): signInWithEmailAndPassword(email, password)
3. Obtener documento de Firestore: users/{uid}
4. Evaluar:
   - Si role == 'admin' → /admin/dashboard
   - Si role == 'client' y medicalProfile existe → /client/dashboard
   - Si role == 'client' y sin medicalProfile → /client/medical-profile
   - Si role == 'trainer' → /trainer/settings (futuro)
5. Inicializar authStore con datos del usuario
```

### 7.5 Flujo de Recuperación de Contraseña

```
1. Usuario ingresa su email
2. Firebase Auth (Client SDK): sendPasswordResetEmail(email)
3. Mostrar mensaje de éxito: "Revisa tu correo para restablecer tu contraseña"
4. Redirigir a /login
```

### 7.6 Store de Autenticación (Nanostores)

```typescript
// src/stores/authStore.ts
import { atom, computed } from 'nanostores';
import type { User } from '../types';

// Estado del usuario autenticado (null si no hay sesión)
export const $user = atom<User | null>(null);

// Estado de carga inicial
export const $authLoading = atom<boolean>(true);

// Estado derivado: ¿está autenticado?
export const $isAuthenticated = computed($user, (user) => user !== null);

// Estado derivado: rol del usuario
export const $userRole = computed($user, (user) => user?.role ?? null);

// Estado derivado: ¿es admin?
export const $isAdmin = computed($userRole, (role) => role === 'admin');

// Estado derivado: ¿es cliente?
export const $isClient = computed($userRole, (role) => role === 'client');

// Acciones
export function setUser(user: User | null) {
  $user.set(user);
}

export function setAuthLoading(loading: boolean) {
  $authLoading.set(loading);
}

export function logout() {
  setUser(null);
  // Firebase Auth signOut se maneja en el servicio
}
```

### 7.7 Tipos

```typescript
// src/types/index.ts
export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
  medicalProfile?: MedicalProfile;
  assignedTrainerId?: string;
  hasActiveAlert: boolean;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
  lastActivityAt?: Timestamp | Date | null;
}

export interface MedicalProfile {
  allergies: string[];
  injuries: string[];
  conditions: string[];
  goals: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  birthDate: Timestamp | Date | string | null;
  height: number;
  initialWeight: number;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export interface AuthError {
  code: string;
  message: string;
}
```

### 7.8 Guardias de Ruta

```typescript
// src/lib/routeGuards.ts
import { $user, $authLoading } from '../stores/authStore';
import type { User } from '../types';

export type RouteGuard = {
  path: string;
  allowedRoles: ('admin' | 'trainer' | 'client')[];
  requiresMedicalProfile?: boolean;
};

export const routeGuards: RouteGuard[] = [
  // Públicas
  { path: '/login', allowedRoles: [] },
  { path: '/register', allowedRoles: [] },
  { path: '/recover', allowedRoles: [] },
  
  // Cliente
  { path: '/client/medical-profile', allowedRoles: ['client'] },
  { path: '/client/dashboard', allowedRoles: ['client'], requiresMedicalProfile: true },
  { path: '/client/workouts', allowedRoles: ['client'], requiresMedicalProfile: true },
  { path: '/client/diets', allowedRoles: ['client'], requiresMedicalProfile: true },
  { path: '/client/progress', allowedRoles: ['client'], requiresMedicalProfile: true },
  { path: '/client/chat', allowedRoles: ['client'], requiresMedicalProfile: true },
  { path: '/client/support', allowedRoles: ['client'], requiresMedicalProfile: true },
  
  // Admin
  { path: '/admin/dashboard', allowedRoles: ['admin'] },
  { path: '/admin/users', allowedRoles: ['admin'] },
  { path: '/admin/workouts', allowedRoles: ['admin'] },
  { path: '/admin/diets', allowedRoles: ['admin'] },
  { path: '/admin/chat', allowedRoles: ['admin'] },
  { path: '/admin/progress', allowedRoles: ['admin'] },
  { path: '/admin/settings', allowedRoles: ['admin'] },
  { path: '/admin/clients', allowedRoles: ['admin'] },
  { path: '/admin/trainers', allowedRoles: ['admin'] },
  
  // Trainer
  { path: '/trainer/dashboard', allowedRoles: ['trainer'] },
  { path: '/trainer/clients', allowedRoles: ['trainer'] },
  { path: '/trainer/workouts', allowedRoles: ['trainer'] },
  { path: '/trainer/diets', allowedRoles: ['trainer'] },
  { path: '/trainer/chat', allowedRoles: ['trainer'] },
  { path: '/trainer/settings', allowedRoles: ['trainer'] },
];

export function checkRouteAccess(path: string, user: User | null): {
  allowed: boolean;
  redirectTo?: string;
} {
  const guard = routeGuards.find(g => path.startsWith(g.path));
  
  if (!guard) {
    return { allowed: true }; // Ruta sin guardia definida
  }
  
  // No autenticado
  if (!user) {
    return { allowed: false, redirectTo: '/login' };
  }
  
  // Rol no permitido
  if (!guard.allowedRoles.includes(user.role)) {
    const redirectMap: Record<string, string> = {
      admin: '/admin/dashboard',
      client: '/client/dashboard',
      trainer: '/trainer/dashboard',
    };
    return { allowed: false, redirectTo: redirectMap[user.role] ?? '/login' };
  }
  
  // Perfil médico requerido pero no completado
  if (guard.requiresMedicalProfile && !user.medicalProfile) {
    return { allowed: false, redirectTo: '/client/medical-profile' };
  }
  
  return { allowed: true };
}
```

---

## 8. Módulo del Cliente

### 8.1 Estructura

```
src/
├── pages/client/
│   ├── dashboard.astro          # /client/dashboard
│   ├── medical-profile.astro    # /client/medical-profile (onboarding)
│   ├── workouts.astro           # /client/workouts
│   ├── diets.astro              # /client/diets
│   ├── progress.astro           # /client/progress
│   ├── chat.astro               # /client/chat
│   └── support.astro            # /client/support
├── layouts/
│   └── ClientLayout.astro       # Layout con Bottom Navigation
└── lib/
    └── client/                  # Servicios del lado cliente
        ├── workoutService.ts
        ├── dietService.ts
        ├── progressService.ts
        ├── chatService.ts
        └── supportService.ts
```

### 8.2 Dashboard del Cliente

**Ruta:** `/client/dashboard`  
**Layout:** `ClientLayout.astro` (con Bottom Navigation)

**Componentes:**
- Header con saludo personalizado
- AlertBanner si `hasActiveAlert` está activo
- StatCard: Progreso Rutina (porcentaje semanal)
- StatCard: Adherencia Dieta (porcentaje diario)
- Quick Actions: Accesos directos a rutinas y próximas comidas
- Stats Rápidas: Peso, calorías, RPE promedio, días activos

**Datos (Firestore streams):**
```typescript
// src/lib/client/workoutService.ts
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function subscribeToWorkouts(clientId: string, callback: (workouts: any[]) => void) {
  const q = query(
    collection(db, 'workouts'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}
```

### 8.3 Visualizador de Rutinas

**Ruta:** `/client/workouts`  
**Layout:** `ClientLayout.astro`

**Componentes:**
- TabBar: Días de la semana
- Lista de ejercicios con series, reps, descanso
- Botón "Ver demostración" (video)
- Botón "Marcar rutina completada" → Modal RPE (1-10)

**Flujo de Finalización:**
```
1. Usuario presiona "Marcar rutina completada"
2. Se abre Modal con Slider RPE (1-10)
3. Usuario selecciona esfuerzo percibido
4. Se crea progress_log:
   {
     clientId: uid,
     type: 'workout',
     date: today,
     value: { workoutId, completed: true, rpe: 7 }
   }
5. Se actualiza dashboard en tiempo real
```

### 8.4 Visualizador de Dietas

**Ruta:** `/client/diets`  
**Layout:** `ClientLayout.astro`

**Componentes:**
- Header con tipo de dieta y calorías totales
- TabBar: Comidas del día (Desayuno, Almuerzo, Merienda, Cena)
- Cards de comidas con macros
- Totales del día con barra de progreso

**Flujo de Marcado de Comida:**
```
1. Usuario presiona checkbox de una comida
2. Se crea progress_log:
   {
     clientId: uid,
     type: 'meal',
     date: today,
     value: { mealId, completed: true }
   }
3. Se actualiza el progreso del día en tiempo real
```

### 8.5 Módulo de Progreso

**Ruta:** `/client/progress`  
**Layout:** `ClientLayout.astro`

**Componentes:**
- Tabs: Peso | Fotos
- LineChart: Evolución del peso (SVG interactivo)
- Input para registrar nuevo peso
- Galería de fotos con drag-and-drop

**Subida de Fotos a R2:**
```
1. Usuario selecciona foto (cámara o galería)
2. Se solicita URL pre-firmada a Cloudflare Worker
3. Se sube la foto directamente a R2
4. Se crea progress_log:
   {
     clientId: uid,
     type: 'photo',
     date: today,
     value: { photoUrl: 'https://r2.url/foto.jpg', type: 'front' }
   }
5. La foto aparece en la galería
```

### 8.6 Chat 1:1

**Ruta:** `/client/chat`  
**Layout:** `ClientLayout.astro`

**Componentes:**
- Header: Chat con [nombre del entrenador]
- Lista de mensajes (burbujas)
- ChatInput para escribir mensajes
- Soporte de alertas (llamados de atención)

**Stream de Mensajes:**
```typescript
// src/lib/client/chatService.ts
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function subscribeToMessages(userId: string, callback: (messages: any[]) => void) {
  const chatQuery = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(chatQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
}
```

### 8.7 Chatbot de Soporte

**Ruta:** `/client/support`  
**Layout:** `ClientLayout.astro`

**Funcionamiento:**
```
1. Usuario escribe pregunta en el chat
2. Se evalúa si es una FAQ conocida:
   - "¿Cómo registro mi peso?" → Respuesta automática
   - "¿Cómo veo mi rutina?" → Respuesta automática
   - "No encuentro mi dieta" → Respuesta automática
3. Si no es FAQ → "No pude resolver tu consulta. ¿Quieres hablar con Seba?"
4. Si usuario acepta → Redirigir a /client/chat
```

**FAQs Predefinidas:**

| Pregunta | Respuesta |
|----------|-----------|
| "Cómo registro mi peso" | "Ve a la sección Progreso, presiona 'Registrar peso' e ingresa tu peso actual." |
| "Cómo veo mi rutina" | "Ve a la sección Rutinas. Allí encontrarás tus ejercicios organizados por día." |
| "No veo mi dieta" | "Si no ves tu dieta, contacta a Seba a través del chat." |
| "Cómo subo fotos" | "En la sección Progreso, pestaña Fotos, presiona 'Subir nuevas fotos'." |
| "Qué es RPE" | "RPE es tu esfuerzo percibido del 1 al 10. 1=muy fácil, 10=máximo esfuerzo." |
| "Horario de Seba" | "Seba está disponible en horario de atención. Si es urgente, envía un llamado de atención." |

---

## 9. Módulo del Entrenador

### 9.1 Descripción General
El panel del Entrenador (`/trainer/`) optimiza la gestión del coach deportivo. Le permite monitorear a sus alumnos asignados, crear y administrar sus entrenamientos y dietas en tiempo real, enviar llamados de atención mediante el chat, y auditar el progreso diario de cada cliente.

### 9.2 Estructura de Archivos

```
src/
├── pages/trainer/
│   ├── dashboard.astro          # /trainer/dashboard (Resumen del coach)
│   ├── clients.astro            # /trainer/clients (Buscador y visor de alumnos)
│   ├── workouts.astro           # /trainer/workouts (Diseño y CRUD de rutinas)
│   ├── diets.astro              # /trainer/diets (Diseño y CRUD de dietas por somatotipo)
│   ├── chat.astro               # /trainer/chat (Bandeja de mensajería bidireccional)
│   └── settings.astro           # /trainer/settings (Configuración de perfil)
├── layouts/
│   └── TrainerLayout.astro      # Layout base con navegación inferior responsiva
└── lib/
    └── trainer/
        └── trainerUtils.ts      # Utilidades, servicios Firestore, tipos y renderizadores
```

### 9.3 Vistas y Componentes

#### A. Dashboard del Entrenador
**Ruta:** `/trainer/dashboard`

**Tarjetas de Estadísticas:**
- Total de Alumnos: Cantidad de usuarios `client` vinculados al ID del entrenador
- Rutinas Creadas: Total de entrenamientos registrados por el entrenador
- Dietas Creadas: Total de planes nutricionales registrados por el entrenador
- Chats Activos / Mensajes No Leídos: Notificación visual de conversaciones pendientes

**Alertas Activas:** Lista prioritaria de clientes con estados de inactividad o llamados de atención activos.

#### B. Gestión de Clientes
**Ruta:** `/trainer/clients`

- Buscador: Filtrado en tiempo real por el nombre del cliente
- Visualización de Ficha Médica: Al hacer clic en un alumno, se expande su información clínica: objetivos, experiencia (principiante, intermedio, avanzado), alergias, lesiones y peso inicial.

#### C. Gestor de Rutinas (Workouts)
**Ruta:** `/trainer/workouts`

- Formulario de Ejercicios: Permite añadir ejercicios indicando el nombre, series, repeticiones, tiempo de descanso (ej. `90s`), y un enlace a video demostrativo.

#### D. Planificador Nutricional (Diets)
**Ruta:** `/trainer/diets`

- Filtro por Somatotipo: Clasifica y asiste la asignación basándose en el tipo de cuerpo del cliente (`ectomorph`, `mesomorph`, `endomorph`).
- Macros por Comida: Desglose interactivo para desayuno, almuerzo, merienda y cena con cálculo calórico automático.

### 9.4 Servicios de Datos y Utilidades (`trainerUtils.ts`)

| Método | Tipo | Descripción |
|--------|------|-------------|
| `subscribeToClients(trainerId, callback)` | Stream | Sincroniza la lista de alumnos asignados al `trainerId` en tiempo real. |
| `getClientProfile(clientId)` | One-off | Obtiene el perfil médico y datos de contacto de un alumno. |
| `subscribeToWorkoutsByTrainer(trainerId, callback)` | Stream | Escucha todas las rutinas creadas por el entrenador. |
| `createWorkout(data)` / `updateWorkout(id, data)` | Escritura | Registra o modifica una rutina en la colección `workouts`. |
| `subscribeToDietsByTrainer(trainerId, callback)` | Stream | Escucha todos los planes de alimentación creados por el entrenador. |
| `createDiet(data)` / `updateDiet(id, data)` | Escritura | Registra o modifica un plan alimenticio en la colección `diets`. |
| `subscribeToClientProgress(clientId, callback)` | Stream | Descarga el historial de progreso de peso y RPE de un alumno. |

### 9.5 Seguridad y Reglas de Firestore

El acceso del rol `trainer` está configurado en `firestore.rules`:
- Un entrenador **solo puede leer** los documentos de la colección `users` que tengan `assignedTrainerId` igual a su UID.
- Un entrenador **puede crear y modificar** las rutinas (`workouts`) y dietas (`diets`) donde el campo `trainerId` coincida con su propio identificador.
- Un entrenador **no puede** cambiar su rol a `admin` ni modificar datos de otros entrenadores.

---

## 10. Módulo de Administración

### 10.1 Estructura

```
src/
├── pages/admin/
│   ├── dashboard.astro          # /admin/dashboard
│   ├── users.astro              # /admin/users
│   ├── workouts.astro           # /admin/workouts
│   ├── diets.astro              # /admin/diets
│   ├── chat.astro               # /admin/chat
│   ├── progress.astro           # /admin/progress
│   ├── settings.astro           # /admin/settings
│   ├── clients.astro            # /admin/clients
│   └── trainers.astro           # /admin/trainers
├── layouts/
│   └── AdminLayout.astro        # Layout con Sidebar Navigation
├── lib/
│   └── admin/
│       └── adminUtils.ts        # Utilidades de admin (iconos, tipos, renderizado, servicios)
├── services/
│   └── adminService.ts          # CRUD usuarios, estadísticas
└── types/
    └── index.ts                 # User, AdminStats, Alert
```

### 10.2 Dashboard de Administración

**Ruta:** `/admin/dashboard`  
**Layout:** `AdminLayout.astro` (con Sidebar Navigation)

**Componentes:**
- Header: Panel de Administración
- StatCards: Usuarios (45), Rutinas (12), Dietas (8), Mensajes (23), Progreso (78%), Alertas (3)
- Últimos Mensajes: Lista de mensajes recientes
- Alertas Activas: Lista de clientes con alertas

**Datos (Firestore streams):**
```typescript
// src/services/adminService.ts
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function subscribeToUsers(callback: (users: any[]) => void) {
  const q = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
  });
}

export function subscribeToAlerts(callback: (alerts: any[]) => void) {
  const q = query(
    collection(db, 'users'),
    where('hasActiveAlert', '==', true)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
  });
}
```

### 10.3 Gestión de Usuarios

**Ruta:** `/admin/users`  
**Layout:** `AdminLayout.astro`

**Componentes:**
- Header: Gestión de Usuarios
- Buscador y filtro por rol
- DataTable con columnas: Nombre, Email, Rol, Alertas, Acciones
- Paginación

**Acciones por Usuario:**

| Acción | Descripción |
|--------|-------------|
| ✏️ Editar | Abre modal para editar nombre, email, rol |
| ⚠️ Alerta | Enviar llamado de atención al cliente |
| 🔄 Reset | Enviar email de restablecimiento de contraseña |
| ❌ Eliminar | Eliminar usuario (requiere confirmación) |

### 10.4 Gestión de Rutinas

**Ruta:** `/admin/workouts`  
**Layout:** `AdminLayout.astro`

- Lista de rutinas con filtros
- CRUD completo de rutinas
- Visualización de ejercicios por rutina

### 10.5 Gestión de Dietas

**Ruta:** `/admin/diets`  
**Layout:** `AdminLayout.astro`

- Lista de dietas con filtros
- CRUD completo de dietas
- Visualización de macros por comida

### 10.6 Bandeja de Chat

**Ruta:** `/admin/chat`  
**Layout:** `AdminLayout.astro`

- Lista de conversaciones ordenadas por último mensaje
- Indicador de mensajes no leídos
- Envío de llamados de atención (alertas)
- Búsqueda de conversaciones por nombre de cliente

### 10.7 Visor de Progreso

**Ruta:** `/admin/progress`  
**Layout:** `AdminLayout.astro`

- Seleccionar cliente
- LineChart: Evolución del peso
- Adherencia: Rutina y Dieta (porcentajes)
- Últimos Registros: Lista de actividades recientes

### 10.8 Configuración del Sistema

**Ruta:** `/admin/settings`  
**Layout:** `AdminLayout.astro`

- Sección: Perfil de Administrador
- Sección: Preferencias del Sistema (idioma, tema, notificaciones)
- Sección: Gestión de la Aplicación (versión, exportar datos, limpiar caché)

### 10.9 Listado de Clientes

**Ruta:** `/admin/clients`  
**Layout:** `AdminLayout.astro`

Visualiza todos los alumnos/clientes registrados en la plataforma y sus respectivos entrenadores asignados, resolviendo dinámicamente los nombres de los entrenadores en tiempo real.

### 10.10 Listado de Entrenadores

**Ruta:** `/admin/trainers`  
**Layout:** `AdminLayout.astro`

Muestra el listado de todos los entrenadores del sistema junto con la cantidad total de clientes reales que tienen bajo su supervisión.

---

## 11. Reglas de Desarrollo

### 11.1 Golden Rules (NUNCA VIOLAR)

#### ❌ NUNCA HACER ESTO
1. **No usar `any`** - Siempre tipar explícitamente. Si no sabes el tipo, crea una interface.
2. **No lógica de negocio en UI** - Los componentes SOLO renderizan. Services hacen lógica.
3. **No hardcodear URLs/keys** - Todo por `import.meta.env` o variables de entorno.
4. **No ignorar estados** - Toda página/componente maneja: loading, empty, error, success.
5. **No Firebase Client SDK para ops sensibles** - Usar API Routes (Astro endpoints) con Admin SDK.
6. **No mutar stores directamente** - Siempre usar funciones setter exportadas.
7. **No console.log en producción** - Usar sistema de logging.
8. **No try/catch genéricos** - Siempre tipar el error y mostrar mensaje al usuario.
9. **No archivos > 300 líneas** - Refactorizar en componentes más pequeños.
10. **No commits sin formato** - Seguir conventional commits.

#### ✅ SIEMPRE HACER ESTO
1. **Tipar todo** - Props, returns, variables, eventos. Sin excepciones.
2. **4 estados por página** - loading skeleton → empty state → error toast → success data.
3. **Tests unitarios** - Para servicios y stores. Mínimo 1 test por función pública.
4. **JSDoc en funciones públicas** - @param y @returns.
5. **Componentes atómicos** - Un componente = una responsabilidad.
6. **Error boundaries** - Wrap cada feature con ErrorBoundary.
7. **Logging estructurado** - Usar logger.info/warn/error con contexto.
8. **Validación de props** - Props requeridas marcadas, opcionales con defaults.
9. **Cleanup de suscripciones** - onSnapshot unsubscribe en useEffect return.
10. **Manejo de concurrencia** - AbortController para fetch, race conditions en stores.

### 11.2 Convenciones de Código

- **Páginas Astro Limpias:** No incluyas lógica de bases de datos pesada o validaciones directamente en el frontmatter de las páginas `.astro`. Delega esta lógica a servicios o módulos de utilidad de TypeScript en `src/lib/` o `src/services/`.
- **Gestión de Suscripciones Firestore:** Siempre que inicies una suscripción en tiempo real (`onSnapshot` o servicios similares de suscripción) en scripts del lado del cliente, **debes capturar la función de desuscripción** (`Unsubscribe`) y llamarla en el evento de desmontaje (`astro:before-swap` o `beforeunload`) para prevenir fugas de memoria.
- **Traducciones (i18n):** Todo texto visible en el frontend debe estar localizado. Usa la función `t('key')` para traducciones SSR (`src/i18n/translations.ts`) o cliente (`src/i18n/client.ts`).
- **Logger Centralizado:** No utilices `console.log` o `console.error` en producción de manera indiscriminada. Usa el logger de `@/lib/shared/logger`.

### 11.3 Comandos Útiles

| Comando | Acción |
|---------|--------|
| `npm run dev` | Iniciar servidor de desarrollo local (`http://localhost:4321`) |
| `npm run build` | Compilar la aplicación estática para producción (en `/dist`) |
| `npm run preview` | Previsualizar localmente la compilación de producción |
| `npm run test` | Ejecutar la suite de pruebas unitarias (Vitest) |
| `npm run test:e2e` | Ejecutar pruebas de integración/E2E (Playwright) |

### 11.4 Testing

- **Tests centralizados** - Todo en `tests/`, nada en `src/__tests__/`
- **Un archivo de test por módulo** - Misma estructura que `src/`
- **Sin React** - No usar React Testing Library, jsdom solo si es estrictamente necesario

---

## 12. Problemas Conocidos y TODO

### 12.1 Problemas y Deuda Técnica Detectada

#### A. Rendimiento y Escalabilidad en Firestore
- **Lectura masiva sin límites:** Funciones de tiempo real como `subscribeToUsers` escuchan toda la colección `users` sin límites ni paginación, lo que resultará costoso cuando el número de usuarios crezca.
- **Recuentos globales ineficientes:** La función `subscribeToCollectionCount` lee todos los documentos de una colección solo para contarlos en la interfaz del panel de administración. Se debe migrar al uso de funciones de agregación como `count()` de Firestore.
- **Falta de cleanup en listeners:** [Resuelto] Se identificó que varios paneles no limpiaban sus escuchadores al navegar, provocando fugas de memoria. Esto fue solucionado implementando desuscripciones en los eventos `beforeunload` y `astro:before-swap` (SPA).

#### B. Seguridad y Calidad de Código
- **Exposición en el objeto global:** Vistas como `admin/users.astro` y `trainer/diets.astro` exponen funciones al objeto `window` (ej. `window.__toggleBlockUser`). Esto puede acarrear problemas de XSS o colisiones de scripts. Se debe migrar al uso de delegación de eventos (`data-*` attributes).
- **Mensajes de consola en producción:** Se detectaron múltiples llamadas a `console.error` en archivos de UI en producción. Deben reemplazarse con el logger unificado.
- **Duplicidad de Código en Vistas de Configuración:** Las páginas de settings (`admin/settings.astro`, `trainer/settings.astro`, `client/settings.astro`) tienen un 80% de lógica y maquetación idéntica. Deberían unificarse mediante un componente base o shell.
- **Abuso de tipos `any` en TypeScript:** [Resuelto] Campos críticos de fechas y marcas de tiempo (`createdAt`, `updatedAt`, `birthDate`, `lastActivityAt`) en `src/types/index.ts` y utilidades de entrenadores fueron tipados correctamente, aprovechando las validaciones de tipo estricto de TypeScript.
- **Claves de traducción no utilizadas (i18n):** [Resuelto] Depuramos y redujimos las claves huérfanas en `translations.ts` y `client.ts` para silenciar las advertencias de la suite de pruebas unitarias.
- **Archivos de componentes sobredimensionados:** Varias páginas de Astro superan el límite óptimo de líneas (ej. `admin/users.astro` tiene ~600 líneas) debido a scripts JS inline muy complejos mezclados con la maquetación HTML.
- **Ausencia de Metadatos SEO Profesionales (`BaseLayout.astro`):** [Resuelto] La plantilla base de HTML ahora cuenta con etiquetas meta SEO dinámicas (`description`, `keywords`, `robots`) y etiquetas Open Graph/Twitter para que el sitio se visualice de forma profesional en motores de búsqueda y redes sociales.

#### C. Brechas Funcionales en el Módulo de Cliente
- **Falta de Gráficos de Evolución (`client/progress.astro`):** [Resuelto] Implementamos un gráfico LineChart nativo vectorial SVG interactivo y auto-escala cronológica de peso en tiempo real.
- **Subida de Fotos Inexistente:** [Resuelto] Implementamos el mosaico y soporte completo de drag-and-drop para almacenar y previsualizar imágenes evolutivas en formato Base64 en Firestore.
- **Botón de Completado Inoperativo y RPE Desactivado (`client/workouts.astro`):** [Resuelto] Activamos el botón para registrar el completado del entrenamiento e integramos el modal interactivo de RPE (esfuerzo percibido del 1 al 10) y guardado seguro en Firestore.

### 12.2 Checklist de Tareas por Perfil de Agente (Roadmap para Multi-Agentes)

#### 🎨 Perfil 1: Agente Frontend (Especialista en UI/UX, Layouts y Componentes)
- [x] **Astro Layout SEO:** Inyectar en `BaseLayout.astro` los metadatos SEO profesionales y etiquetas Open Graph/Twitter.
- [x] **Admin Page - Workouts UI:** Diseñar la maquetación responsiva para `src/pages/admin/workouts.astro` (CRUD de rutinas).
- [x] **Admin Page - Diets UI:** Diseñar la maquetación responsiva para `src/pages/admin/diets.astro` (CRUD de dietas).
- [x] **Admin Page - Chat UI:** Diseñar la bandeja de mensajes interactiva para `src/pages/admin/chat.astro`.
- [x] **Admin Page - Progress UI:** Diseñar la vista de progreso `src/pages/admin/progress.astro` con gráfico vectorial interactivo SVG.
- [x] **Client - RPE Modal:** Crear el modal interactivo de feedback RPE (Rate of Perceived Exertion) en `client/workouts.astro`.
- [x] **Client - LineChart Peso:** Reemplazar el listado de texto plano en `client/progress.astro` por un componente de gráfico interactivo.
- [x] **Client - Photo Gallery:** Diseñar el cargador de imágenes y visor de fotos en la pestaña correspondiente de `client/progress.astro`.
- [ ] **Shared - Shell de Configuración:** Crear un componente unificado para las vistas de settings de admin, entrenador y cliente, reduciendo la duplicación.

#### ⚙️ Perfil 2: Agente Integración y Datos (Especialista en Firebase, Firestore y Lógica de Negocio)
- [x] **Client - Persistencia de Rutina completada:** Programar la lógica del botón en `client/workouts.astro` para guardar la rutina finalizada y el valor RPE en Firestore.
- [x] **Client - Photo Upload Lógica:** Implementar el servicio de subida y almacenamiento de imágenes para fotos de progreso.
- [x] **Client - Support Service:** Crear `src/lib/client/supportService.ts` para gestionar FAQs y búsqueda de soporte dinámicamente.
- [x] **TS Strict Types:** Reemplazar los tipos `any` en `src/types/index.ts` por marcas de tiempo estrictas (`Timestamp`) o `Date`.
- [ ] **Clean Global Context:** Refactorizar la exposición al objeto `window` en `admin/users.astro` y `trainer/diets.astro` mediante data attributes y event listeners locales.
- [ ] **Admin - DB Pagination:** Implementar límites y paginación en consultas en tiempo real y síncronas en `adminUtils.ts`.
- [ ] **Admin - Firestore Count:** Migrar los recuentos totales de colecciones a la función de agregación `count()` de Firestore para reducir costos de lectura.
- [ ] **Refactor - Modularizar Vistas:** Extraer los controladores de JavaScript inline pesados de `admin/users.astro` y `trainer/diets.astro` a archivos TS independientes.

#### 🧪 Perfil 3: Agente Calidad y Mantenimiento (Especialista en QA, i18n y Testing)
- [x] **i18n Cleanup:** Depurar y eliminar del código las claves de traducción sin utilizar en `translations.ts` y `client.ts` detectadas en los tests.
- [ ] **Logger Production:** Eliminar llamadas directas a `console.error` y configurar el logger centralizado en todas las vistas de UI.
- [x] **Unit Testing:** Corregir y expandir las pruebas unitarias en Vitest para que la cobertura sea del 100% en éxito.
- [ ] **E2E Playwright Flows:** Habilitar y codificar las pruebas de integración en Playwright para flujos críticos (Onboarding, Login y registro de peso).

---

## 📚 Referencias

- **Documentación de Astro:** https://docs.astro.build
- **Firebase Documentation:** https://firebase.google.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Nanostores:** https://github.com/nanostores/nanostores

---

**Documento unificado creado:** 2026-06-13  
**Basado en:** docs/00_indice.md, docs/01_vision_y_requisitos.md, docs/02_arquitectura_y_datos.md, docs/03_design_system.md, docs/04_flujos_navegacion.md, docs/05_modulo_autenticacion.md, docs/06_modulo_cliente.md, docs/07_modulo_trainer.md, docs/08_modulo_administracion.md, docs/09_desarrollo_y_workflow.md, docs/10_todo_y_problemas.md

## 📋 Archivos de Tareas y Seguimiento

### TODO Centralizado
**👉 `TODO.md` - Lista única de tareas y optimizaciones**

Este archivo reemplaza a:
- ❌ `TODO_OPTIMIZACIONES.md` (obsoleto)
- ❌ `TASK_PROGRESS.md` (obsoleto)
- ❌ `tests/TASK_PROGRESS.md` (obsoleto)

**Contenido:**
- ✅ Todas las optimizaciones de código pendientes
- ✅ Seguimiento de tests y cobertura
- ✅ Plan de acción por fases
- ✅ Estado de cada tarea (pendiente/completada)

**Para agentes IA:** Consulta `TODO.md` para ver qué tareas están pendientes y su prioridad.
