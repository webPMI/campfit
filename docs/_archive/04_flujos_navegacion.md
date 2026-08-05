# 🌐 Flujos de Navegación - CampFit

> **Última actualización:** 2026-07-31  
> **Estado:** Consolidado en `docs/MASTER.md` (sección 6)

---

## 📑 Índice

1. [Estructura de Rutas](#1-estructura-de-rutas)
2. [Flujo de Autenticación](#2-flujo-de-autenticación)
3. [Flujos por Rol](#3-flujos-por-rol)
4. [Navegación](#4-navegación)
5. [Guardias de Ruta](#5-guardias-de-ruta)

---

## 1. Estructura de Rutas

### 1.1 Mapa Completo de Rutas

```
/                              # Landing / Redirección según auth
│
├── /login                     # 🔐 Inicio de sesión
├── /register                  # Registro de nuevo usuario
├── /recover                   # Recuperación de contraseña
├── /onboarding                # Onboarding post-registro
│
├── /client/                   # 👤 Panel del Cliente
│   ├── /client/dashboard      # Resumen diario del cliente
│   ├── /client/medical-profile # Perfil médico (onboarding obligatorio)
│   ├── /client/workouts       # Visualizador de rutinas
│   ├── /client/diets          # Visualizador de dietas
│   ├── /client/progress       # Progreso (peso + fotos)
│   ├── /client/chat           # Chat 1:1 con entrenador
│   ├── /client/support        # Chatbot de soporte
│   └── /client/settings       # Configuración del cliente
│
├── /admin/                    # ⚙️ Panel del Administrador
│   ├── /admin/dashboard       # Dashboard de administración
│   ├── /admin/users           # Gestión de usuarios
│   ├── /admin/clients         # Lista de clientes
│   ├── /admin/trainers        # Lista de entrenadores
│   ├── /admin/clinical        # Fichas clínicas
│   ├── /admin/workouts        # Supervisión de rutinas
│   ├── /admin/diets           # Supervisión de dietas
│   ├── /admin/progress        # Visor de progreso
│   ├── /admin/chat            # Centro de mensajes
│   └── /admin/settings        # Configuración del sistema
│
└── /trainer/                  # 🏋️ Panel del Entrenador
    ├── /trainer/dashboard     # Dashboard del entrenador
    ├── /trainer/clients       # Gestión de clientes asignados
    ├── /trainer/workouts      # Gestión de rutinas
    ├── /trainer/diets         # Gestión de dietas
    ├── /trainer/chat          # Chat con clientes
    └── /trainer/settings      # Configuración del entrenador
```

### 1.2 Rutas Públicas

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Landing page | Público |
| `/login` | Inicio de sesión | Público |
| `/register` | Registro de usuario | Público |
| `/recover` | Recuperación de contraseña | Público |
| `/onboarding` | Bienvenida post-registro | Autenticado (client) |

### 1.3 Rutas Protegidas

#### Cliente
| Ruta | Descripción | Requisitos |
|------|-------------|-----------|
| `/client/dashboard` | Dashboard principal | Auth + medicalProfile |
| `/client/medical-profile` | Perfil médico | Auth (solo client) |
| `/client/workouts` | Rutinas asignadas | Auth + medicalProfile |
| `/client/diets` | Dietas asignadas | Auth + medicalProfile |
| `/client/progress` | Progreso (peso/fotos) | Auth + medicalProfile |
| `/client/chat` | Chat con entrenador | Auth + medicalProfile |
| `/client/support` | Chatbot de soporte | Auth + medicalProfile |
| `/client/settings` | Configuración | Auth (solo client) |

#### Entrenador
| Ruta | Descripción | Requisitos |
|------|-------------|-----------|
| `/trainer/dashboard` | Dashboard del coach | Auth (solo trainer) |
| `/trainer/clients` | Gestión de clientes | Auth (solo trainer) |
| `/trainer/workouts` | Creador de rutinas | Auth (solo trainer) |
| `/trainer/diets` | Planificador de dietas | Auth (solo trainer) |
| `/trainer/chat` | Bandeja de mensajes | Auth (solo trainer) |
| `/trainer/settings` | Configuración | Auth (solo trainer) |

#### Administrador
| Ruta | Descripción | Requisitos |
|------|-------------|-----------|
| `/admin/dashboard` | Dashboard global | Auth (solo admin) |
| `/admin/users` | Gestión de usuarios | Auth (solo admin) |
| `/admin/clients` | Lista de clientes | Auth (solo admin) |
| `/admin/trainers` | Lista de entrenadores | Auth (solo admin) |
| `/admin/clinical` | Fichas clínicas | Auth (solo admin) |
| `/admin/workouts` | Supervisión de rutinas | Auth (solo admin) |
| `/admin/diets` | Supervisión de dietas | Auth (solo admin) |
| `/admin/progress` | Visor de progreso | Auth (solo admin) |
| `/admin/chat` | Centro de mensajes | Auth (solo admin) |
| `/admin/settings` | Configuración del sistema | Auth (solo admin) |

---

## 2. Flujo de Autenticación

### 2.1 Diagrama de Flujo

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

### 2.2 Flujo de Registro

```
1. Usuario completa formulario (name, email, password)
   ↓
2. Validación en cliente
   - Email: formato válido
   - Password: mínimo 8 caracteres, 1 mayúscula, 1 número
   - Name: requerido, mínimo 2 caracteres
   ↓
3. Firebase Auth (Client SDK)
   - createUserWithEmailAndPassword(email, password)
   ↓
4. Firestore (Client SDK)
   - Crear documento en users/{uid}
   - role: 'client' (por defecto)
   - hasActiveAlert: false
   ↓
5. Redirigir a /onboarding
   - Mensaje de éxito
   ↓
6. Usuario completa perfil médico
   - /client/medical-profile
   ↓
7. Redirigir a /client/dashboard
```

### 2.3 Flujo de Inicio de Sesión

```
1. Usuario ingresa credenciales
   - Email/Password o Google Sign-In
   ↓
2. Firebase Auth (Client SDK)
   - signInWithEmailAndPassword() o signInWithPopup()
   ↓
3. Obtener perfil de Firestore
   - getDoc(users/{uid})
   ↓
4. Evaluar rol y estado
   ↓
5. Redirigir según rol
   - admin → /admin/dashboard
   - client + medicalProfile → /client/dashboard
   - client + sin medicalProfile → /client/medical-profile
   - trainer → /trainer/dashboard
```

### 2.4 Flujo de Recuperación de Contraseña

```
1. Usuario ingresa email
   ↓
2. Validar email
   ↓
3. Firebase Auth
   - sendPasswordResetEmail(email)
   ↓
4. Mostrar mensaje de éxito
   "Revisa tu correo para restablecer tu contraseña"
   ↓
5. Redirigir a /login
```

---

## 3. Flujos por Rol

### 3.1 Flujo del Cliente

```
                    ┌─────────────────┐
                    │  /client/       │
                    │  dashboard      │
                    └────────┬────────┘
                             │
               ┌──────────────┼──────────────┐
               │              │              │
      ┌────────▼───┐  ┌──────▼──────┐  ┌────▼──────┐
      │ "Entrenar  │  │ "Próxima    │  │ Estadíst. │
      │  hoy"      │  │  comida"    │  │ rápidas   │
      └────────┬───┘  └──────┬──────┘  └────┬──────┘
               │             │              │
      ┌────────▼───┐  ┌──────▼──────┐       │
      │ /client/   │  │ /client/    │       │
      │ workouts   │  │ diets       │       │
      └────────┬───┘  └──────┬──────┘       │
               │             │              │
               └──────┬──────┘              │
                      │                     │
             ┌────────▼────────┐            │
             │  Navegación     │            │
             │  Inferior       │            │
             │  (Bottom Nav)   │            │
             └──┬────┬────┬───┘            │
                │    │    │                │
       ┌────────┘    │    └────────┐       │
       │             │             │       │
 ┌─────▼─────┐ ┌─────▼─────┐ ┌────▼──────┐│
 │ /client/  │ │ /client/  │ │ /client/  ││
 │ workouts  │ │ progress  │ │ chat      ││
 └───────────┘ └───────────┘ └───────────┘│
                                           │
                               ┌───────────▼───────────┐
                               │  /client/support       │
                               │  (Chatbot FAQ)         │
                               └───────────────────────┘
```

**Bottom Navigation (Cliente):**

| Icono | Ruta | Label |
|-------|------|-------|
| 🏠 | `/client/dashboard` | Inicio |
| 💪 | `/client/workouts` | Rutinas |
| 🥗 | `/client/diets` | Dietas |
| 📈 | `/client/progress` | Progreso |
| 💬 | `/client/chat` | Chat |

### 3.2 Flujo del Administrador

```
                    ┌─────────────────┐
                    │  /admin/        │
                    │  dashboard      │
                    └────────┬────────┘
                             │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
 ┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
 │  /admin/users  │  │  /admin/       │  │  /admin/       │
 │  Gestión       │  │  clients       │  │  trainers      │
 │  usuarios      │  │  (clientes)    │  │  (entrenadores)│
 └───────┬────────┘  └───────┬────────┘  └───────┬────────┘
         │                   │                    │
         └───────────────────┼────────────────────┘
                             │
                     ┌───────▼────────┐
                     │  /admin/       │
                     │  settings      │
                     │  Configuración │
                     └────────────────┘
```

**Sidebar Navigation (Admin):**

| Icono | Ruta | Label |
|-------|------|-------|
| 📊 | `/admin/dashboard` | Dashboard |
| 👥 | `/admin/users` | Usuarios |
| 👤 | `/admin/clients` | Clientes |
| 🏋️ | `/admin/trainers` | Entrenadores |
| ⚙️ | `/admin/settings` | Configuración |

### 3.3 Flujo del Entrenador

```
                    ┌─────────────────┐
                    │  /trainer/      │
                    │  dashboard      │
                    └────────┬────────┘
                             │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
 ┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
 │  /trainer/     │  │  /trainer/     │  │  /trainer/     │
 │  clients       │  │  workouts      │  │  diets         │
 │  (clientes)    │  │  (rutinas)     │  │  (dietas)      │
 └───────┬────────┘  └───────┬────────┘  └───────┬────────┘
         │                   │                    │
         └───────────────────┼────────────────────┘
                             │
                     ┌───────▼────────┐
                     │  /trainer/     │
                     │  chat          │
                     │  (bandeja)     │
                     └───────┬────────┘
                             │
                     ┌───────▼────────┐
                     │  /trainer/     │
                     │  settings      │
                     └────────────────┘
```

**Sidebar Navigation (Trainer):**

| Icono | Ruta | Label |
|-------|------|-------|
| 📊 | `/trainer/dashboard` | Dashboard |
| 👥 | `/trainer/clients` | Clientes |
| 💪 | `/trainer/workouts` | Rutinas |
| 🥗 | `/trainer/diets` | Dietas |
| 💬 | `/trainer/chat` | Chat |
| ⚙️ | `/trainer/settings` | Configuración |

---

## 4. Navegación

### 4.1 Componentes de Navegación

#### Bottom Navigation (Cliente)

**Características:**
- 5 items: Dashboard, Rutinas, Dietas, Progreso, Chat
- Icono + label
- Active state con color primario
- Safe area para dispositivos con notch
- Oculto en páginas de auth

**Implementación:**
```astro
<nav class="fixed bottom-0 left-0 right-0 theme-bg-secondary theme-border">
  <div class="flex justify-around items-center h-16">
    <a href="/client/dashboard" class="nav-item">
      <Home size={24} />
      <span>Inicio</span>
    </a>
    <!-- ... más items ... -->
  </div>
</nav>
```

#### Sidebar Navigation (Admin/Trainer)

**Características:**
- Colapsable en móvil/tablet
- permanente en desktop
- Logo + nombre de usuario
- Items con icono y label
- Active state con highlight
- Logout button al final

**Implementación:**
```astro
<aside class="sidebar">
  <div class="logo">
    <img src="/logo.png" alt="CampFit" />
  </div>
  <nav>
    <a href="/admin/dashboard" class="nav-item">
      <BarChart3 size={20} />
      <span>Dashboard</span>
    </a>
    <!-- ... más items ... -->
  </nav>
  <button class="logout">
    <LogOut size={20} />
    <span>Cerrar Sesión</span>
  </button>
</aside>
```

### 4.2 Patrones de Navegación

#### Navegación por Breadcrumbs

**Uso:** Páginas con subniveles (admin, trainer)

**Ejemplo:**
```
Admin / Usuarios / Editar
```

**Implementación:**
```astro
<nav class="breadcrumbs">
  <a href="/admin/dashboard">Admin</a>
  <ChevronRight size={16} />
  <a href="/admin/users">Usuarios</a>
  <ChevronRight size={16} />
  <span>Editar</span>
</nav>
```

#### Navegación por Tabs

**Uso:** Contenido relacionado en la misma página

**Ejemplo:**
- Peso | Fotos (en /client/progress)
- Desayuno | Almuerzo | Merienda | Cena (en /client/diets)

**Implementación:**
```astro
<TabBar 
  tabs={[
    { id: 'weight', label: 'Peso' },
    { id: 'photos', label: 'Fotos' }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

#### Navegación por Stepper

**Uso:** Procesos multi-paso (onboarding, wizard)

**Ejemplo:**
- Onboarding: Datos personales → Objetivos → Preferencias

**Implementación:**
```astro
<div class="stepper">
  <div class="step active">
    <span>1</span>
    <label>Datos</label>
  </div>
  <div class="step">
    <span>2</span>
    <label>Objetivos</label>
  </div>
  <div class="step">
    <span>3</span>
    <label>Preferencias</label>
  </div>
</div>
```

---

## 5. Guardias de Ruta

### 5.1 Implementación

Los guardias de ruta se implementan en dos niveles:

#### Nivel 1: Server-side (Astro Middleware)

```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { checkRouteAccess } from '@/lib/routeGuards';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const user = context.locals.user; // Del session/cookie
  
  const { allowed, redirectTo } = checkRouteAccess(pathname, user);
  
  if (!allowed) {
    return context.redirect(redirectTo || '/login');
  }
  
  return next();
});
```

#### Nivel 2: Client-side (Nanostores)

```typescript
// src/lib/shared/authGuard.ts
export function requireAuth(callback: (user: User) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    callback(user);
  });
}
```

### 5.2 Matriz de Acceso

| Ruta | Público | Client | Trainer | Admin |
|------|---------|--------|---------|-------|
| `/login` | ✅ | ✅ | ✅ | ✅ |
| `/register` | ✅ | ✅ | ✅ | ✅ |
| `/recover` | ✅ | ✅ | ✅ | ✅ |
| `/onboarding` | ❌ | ✅ | ❌ | ❌ |
| `/client/dashboard` | ❌ | ✅ | ❌ | ❌ |
| `/client/medical-profile` | ❌ | ✅ | ❌ | ❌ |
| `/client/workouts` | ❌ | ✅ | ❌ | ❌ |
| `/client/diets` | ❌ | ✅ | ❌ | ❌ |
| `/client/progress` | ❌ | ✅ | ❌ | ❌ |
| `/client/chat` | ❌ | ✅ | ❌ | ❌ |
| `/client/support` | ❌ | ✅ | ❌ | ❌ |
| `/client/settings` | ❌ | ✅ | ❌ | ❌ |
| `/trainer/dashboard` | ❌ | ❌ | ✅ | ❌ |
| `/trainer/clients` | ❌ | ❌ | ✅ | ❌ |
| `/trainer/workouts` | ❌ | ❌ | ✅ | ❌ |
| `/trainer/diets` | ❌ | ❌ | ✅ | ❌ |
| `/trainer/chat` | ❌ | ❌ | ✅ | ❌ |
| `/trainer/settings` | ❌ | ❌ | ✅ | ❌ |
| `/admin/dashboard` | ❌ | ❌ | ❌ | ✅ |
| `/admin/users` | ❌ | ❌ | ❌ | ✅ |
| `/admin/clients` | ❌ | ❌ | ❌ | ✅ |
| `/admin/trainers` | ❌ | ❌ | ❌ | ✅ |
| `/admin/clinical` | ❌ | ❌ | ❌ | ✅ |
| `/admin/workouts` | ❌ | ❌ | ❌ | ✅ |
| `/admin/diets` | ❌ | ❌ | ❌ | ✅ |
| `/admin/progress` | ❌ | ❌ | ❌ | ✅ |
| `/admin/chat` | ❌ | ❌ | ❌ | ✅ |
| `/admin/settings` | ❌ | ❌ | ❌ | ✅ |

### 5.3 Redirecciones Post-Auth

Después de login exitoso, el sistema redirige según:

1. **Rol del usuario:**
   - `admin` → `/admin/dashboard`
   - `trainer` → `/trainer/dashboard`
   - `client` → Siguiente paso

2. **Estado del cliente:**
   - Tiene `medicalProfile` → `/client/dashboard`
   - No tiene `medicalProfile` → `/client/medical-profile`

3. **URL de retorno:**
   - Si hay `?redirect=/client/progress` en la URL
   - Redirigir a esa URL después del login

---

## 🔗 Referencias

- **Documentación Maestra:** `docs/MASTER.md` (sección 6)
- **Flujos de Navegación:** `docs/MASTER.md` (sección 6)
- **Módulo de Autenticación:** `docs/05_modulo_autenticacion.md`
- **Guardias de Ruta:** `src/lib/routeGuards.ts`

---

**Documento creado:** 2026-06-13  
**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit