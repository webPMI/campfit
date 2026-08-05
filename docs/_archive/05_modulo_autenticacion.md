# 🔐 Módulo de Autenticación - CampFit

> **Última actualización:** 2026-07-31  
> **Estado:** Consolidado en `docs/MASTER.md` (sección 7)

---

## 📑 Índice

1. [Descripción General](#1-descripción-general)
2. [Estructura del Módulo](#2-estructura-del-módulo)
3. [Flujos de Autenticación](#3-flujos-de-autenticación)
4. [Store de Autenticación](#4-store-de-autenticación)
5. [Servicios](#5-servicios)
6. [Tipos](#6-tipos)
7. [Guardias de Ruta](#7-guardias-de-ruta)

---

## 1. Descripción General

Módulo responsable del registro, inicio de sesión, recuperación de contraseña y gestión de sesiones.

### 1.1 Características Principales

- **Registro:** Creación de cuentas con email/contraseña
- **Login:** Autenticación con email/contraseña o Google
- **Recuperación:** Reset de contraseña por email
- **Persistencia:** Sesión mantenida con IndexedDB
- **Roles:** Tres roles (client, trainer, admin)
- **Redirección:** Automática según rol y estado

### 1.2 Consideraciones de Seguridad

**Importante:** El registro e inicio de sesión se realizan desde el **Client SDK de Firebase directamente**, NO a través de API Routes. Las API Routes con Admin SDK se reservan para operaciones administrativas (cambio de roles, gestión de usuarios).

**Razones:**
- ✅ Mejor rendimiento (sin round-trip al servidor)
- ✅ Menos complejidad arquitectónica
- ✅ Firebase Auth maneja la seguridad
- ❌ No exponer credenciales en el cliente

---

## 2. Estructura del Módulo

### 2.1 Organización de Archivos

```
src/
├── pages/
│   ├── login.astro              # Inicio de sesión
│   ├── register.astro           # Registro
│   ├── recover.astro            # Recuperación de contraseña
│   ├── onboarding.astro         # Onboarding post-registro
│   └── dashboard.astro          # Dashboard post-login (redirección por rol)
├── services/
│   └── authService.ts           # login, register, recover, logout
├── stores/
│   └── authStore.ts             # $user, $authLoading, $authError
├── lib/
│   ├── firebase.ts              # Configuración Firebase
│   ├── firebase/
│   │   ├── auth.ts              # Wrapper de firebase/auth para testing
│   │   └── firestore.ts         # Wrapper de firebase/firestore para testing
│   ├── routeGuards.ts           # RouteGuard[], checkRouteAccess
│   ├── shared/
│   │   └── authGuard.ts         # requireAuth(), requireAdmin()
│   ├── auth/
│   │   └── roleRedirect.ts      # redirectByRole(), getDashboardPath()
│   └── validators.ts            # Validación de formularios
└── types/
    └── index.ts                 # User, LoginForm, RegisterForm, AuthError
```

### 2.2 Responsabilidades por Capa

**Páginas (pages/):**
- Renderizado de formularios
- Captura de eventos de usuario
- Validación visual
- Redirecciones

**Servicios (services/):**
- Lógica de autenticación
- Comunicación con Firebase
- Manejo de errores
- Transformación de datos

**Stores (stores/):**
- Estado global de autenticación
- Persistencia en memoria
- Estados derivados

**Librerías (lib/):**
- Configuración de Firebase
- Guards de ruta
- Validadores
- Redirección por rol

---

## 3. Flujos de Autenticación

### 3.1 Flujo de Registro

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
   {
     name: string,
     email: string,
     role: 'client',           // Por defecto, admin se asigna manualmente
     hasActiveAlert: false,
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   }
   ↓
5. Redirigir a /onboarding
   - Mensaje de éxito
   ↓
6. Usuario completa perfil médico
   - /client/medical-profile
   ↓
7. Redirigir a /client/dashboard
```

**Código del servicio:**
```typescript
// services/authService.ts
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<void> {
  // 1. Crear usuario en Firebase Auth
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;
  
  // 2. Crear perfil en Firestore
  await setDoc(doc(db, 'users', uid), {
    name,
    email,
    role: 'client',
    hasActiveAlert: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
```

### 3.2 Flujo de Inicio de Sesión

```
1. Usuario ingresa email y password (o Google signInWithPopup)
   ↓
2. Firebase Auth (Client SDK)
   - signInWithEmailAndPassword(email, password)
   ↓
3. Obtener documento de Firestore
   - getDoc(users/{uid})
   ↓
4. Evaluar rol y estado
   ↓
5. Redirigir según rol
   - admin → /admin/dashboard
   - client + medicalProfile → /client/dashboard
   - client + sin medicalProfile → /client/medical-profile
   - trainer → /trainer/dashboard
   ↓
6. Inicializar authStore con datos del usuario
```

**Código del servicio:**
```typescript
// services/authService.ts
export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  // 1. Autenticar con Firebase
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;
  
  // 2. Obtener perfil de Firestore
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    throw new Error('Perfil de usuario no encontrado');
  }
  
  // 3. Retornar datos del usuario
  return { uid, ...userDoc.data() } as User;
}

// Login con Google
export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const uid = credential.user.uid;
  
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    throw new Error('Perfil de usuario no encontrado');
  }
  
  return { uid, ...userDoc.data() } as User;
}
```

### 3.3 Flujo de Recuperación de Contraseña

```
1. Usuario ingresa su email
   ↓
2. Validar email
   ↓
3. Firebase Auth (Client SDK)
   - sendPasswordResetEmail(email)
   ↓
4. Mostrar mensaje de éxito
   "Revisa tu correo para restablecer tu contraseña"
   ↓
5. Redirigir a /login
```

**Código del servicio:**
```typescript
// services/authService.ts
export async function recoverPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}
```

### 3.4 Flujo de Cierre de Sesión

```
1. Usuario hace clic en "Cerrar Sesión"
   ↓
2. Llamar a logout()
   ↓
3. Firebase Auth signOut()
   ↓
4. Limpiar authStore
   - $user.set(null)
   - $authLoading.set(true)
   ↓
5. Limpiar localStorage
   - Eliminar campfit_theme
   ↓
6. Redirigir a /login
```

**Código del servicio:**
```typescript
// services/authService.ts
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// stores/authStore.ts
export function logout() {
  setUser(null);
  setAuthLoading(true);
  // localStorage se limpia en el componente
}
```

---

## 4. Store de Autenticación

### 4.1 Implementación

```typescript
// stores/authStore.ts
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

// Estado derivado: ¿es entrenador?
export const $isTrainer = computed($userRole, (role) => role === 'trainer');

// Acciones
export function setUser(user: User | null) {
  $user.set(user);
}

export function setAuthLoading(loading: boolean) {
  $authLoading.set(loading);
}

export function logout() {
  setUser(null);
  setAuthLoading(true);
}
```

### 4.2 Uso en Componentes

```astro
<script>
  import { $user, $isAuthenticated, $isAdmin, logout } from '@/stores/authStore';
  
  // Suscribirse a cambios
  $user.subscribe((user) => {
    console.log('Usuario:', user);
  });
  
  // Verificar estado
  $isAuthenticated.subscribe((isAuth) => {
    if (!isAuth) {
      window.location.href = '/login';
    }
  });
  
  // Verificar rol
  $isAdmin.subscribe((isAdmin) => {
    if (isAdmin) {
      console.log('Usuario es admin');
    }
  });
</script>
```

---

## 5. Servicios

### 5.1 Auth Service

**Ubicación:** `src/services/authService.ts`

**Funciones:**

| Función | Descripción | Retorno |
|---------|-------------|---------|
| `registerUser(name, email, password)` | Registra nuevo usuario | `Promise<void>` |
| `loginUser(email, password)` | Login con email/password | `Promise<User>` |
| `loginWithGoogle()` | Login con Google | `Promise<User>` |
| `logoutUser()` | Cierra sesión | `Promise<void>` |
| `recoverPassword(email)` | Envía email de recuperación | `Promise<void>` |
| `onAuthChange(callback)` | Observer de cambios de auth | `Unsubscribe` |

**Ejemplo de uso:**
```typescript
import { loginUser, logoutUser } from '@/services/authService';

// Login
const user = await loginUser('user@example.com', 'password123');
setUser(user);

// Logout
await logoutUser();
setUser(null);
```

### 5.2 Role Redirect

**Ubicación:** `src/lib/auth/roleRedirect.ts`

**Funciones:**

```typescript
// Obtener dashboard según rol
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'trainer': return '/trainer/dashboard';
    case 'admin': return '/admin/dashboard';
    case 'client': default: return '/client/dashboard';
  }
}

// Redirigir según rol
export async function redirectByRole(uid: string): Promise<void> {
  const role = await getUserRole(uid);
  if (role) {
    window.location.href = getDashboardPath(role);
  } else {
    window.location.href = '/client/dashboard';
  }
}
```

---

## 6. Tipos

### 6.1 User

```typescript
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
```

### 6.2 MedicalProfile

```typescript
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
```

### 6.3 Formularios

```typescript
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
```

### 6.4 Errores

```typescript
export interface AuthError {
  code: string;
  message: string;
}
```

---

## 7. Guardias de Ruta

### 7.1 Route Guards

**Ubicación:** `src/lib/routeGuards.ts`

```typescript
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

### 7.2 Auth Guard (Client-side)

**Ubicación:** `src/lib/shared/authGuard.ts`

```typescript
// Para páginas que requieren autenticación
export function requireAuth(callback: (user: FirebaseUser) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    callback(user);
  });
}

// Para páginas que requieren rol admin
export function requireAdmin(callback: (user: FirebaseUser) => void): Unsubscribe {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    const docSnap = await getDoc(doc(db, 'users', user.uid));
    const role = docSnap.data()?.role;
    if (role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    callback(user);
  });
}
```

---

## 8. Páginas del Módulo

### 8.1 /login.astro

**Características:**
- Formulario de email y password
- Botón de login con Google
- Link a registro y recuperación
- Validación en tiempo real
- Manejo de errores

**Estados:**
- `idle` - Formulario vacío
- `loading` - Autenticando...
- `error` - Error de credenciales
- `success` - Redirigiendo...

### 8.2 /register.astro

**Características:**
- Formulario: name, email, password, confirmPassword
- Validación de password (8+ chars, 1 mayúscula, 1 número)
- Validación de email
- Botón de registro con Google
- Link a login

**Validaciones:**
- Name: requerido, mínimo 2 caracteres
- Email: formato válido
- Password: mínimo 8 caracteres, 1 mayúscula, 1 número
- ConfirmPassword: debe coincidir con password

### 8.3 /recover.astro

**Características:**
- Formulario de email
- Validación de email
- Envío de email de recuperación
- Mensaje de confirmación
- Link a login

### 8.4 /onboarding.astro

**Características:**
- Pantalla de bienvenida
- Explicación de siguientes pasos
- Botón para ir a /client/medical-profile
- Animación de entrada

### 8.5 /client/medical-profile.astro

**Características:**
- Formulario de perfil médico
- Campos: alergias, lesiones, condiciones, objetivos, experiencia, fecha nacimiento, altura, peso inicial
- Validaciones:
  - Fecha de nacimiento: mayor de 14 años
  - Altura: 100-250 cm
  - Peso: 30-300 kg
  - Alergias/Lesiones/Condiciones: máximo 20 items
  - Experiencia: requerido
  - Objetivos: al menos 1
- Guardado en Firestore: users/{uid}/medicalProfile
- Redirección a /client/dashboard

---

## 🔗 Referencias

- **Documentación Maestra:** `docs/MASTER.md` (sección 7)
- **Flujos de Navegación:** `docs/04_flujos_navegacion.md`
- **Guardias de Ruta:** `src/lib/routeGuards.ts`
- **Firebase Auth:** https://firebase.google.com/docs/auth

---

**Documento creado:** 2026-06-13  
**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit