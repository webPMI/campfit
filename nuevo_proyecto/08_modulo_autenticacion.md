# 🔐 Módulo de Autenticación - CampFit 2.0

## Descripción General

Módulo responsable del registro, inicio de sesión, recuperación de contraseña y gestión de sesiones.

**Importante:** El registro e inicio de sesión se realizan desde el Client SDK de Firebase directamente, NO a través de API Routes. Las API Routes con Admin SDK se reservan para operaciones administrativas (cambio de roles, gestión de usuarios).

---

## Estructura

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
│   ├── firebase/auth.ts         # Wrapper de firebase/auth para testing
│   ├── firebase/firestore.ts    # Wrapper de firebase/firestore para testing
│   ├── routeGuards.ts           # RouteGuard[], checkRouteAccess
│   ├── shared/authGuard.ts      # requireAuth(), requireAdmin() — Guards unificados
│   ├── auth/roleRedirect.ts     # redirectByRole(), getDashboardPath()
│   └── validators.ts            # Validación de formularios
└── types/
    └── index.ts                 # User, LoginForm, RegisterForm, AuthError
```

---

## Funcionalidades

| # | Funcionalidad | Prioridad |
|---|---------------|-----------|
| 1 | Registro con email y contraseña | Alta |
| 2 | Inicio de sesión con email/contraseña | Alta |
| 3 | Inicio de sesión con Google (signInWithPopup) | Alta |
| 4 | Recuperación de contraseña | Alta |
| 5 | Persistencia de sesión (onAuthStateChanged + token refresh automático) | Alta |
| 6 | Redirección post-login según rol | Alta |
| 7 | Redirección a perfil médico en primer login (clientes) | Alta |
| 8 | Cierre de sesión con limpieza de estado | Alta |

---

## Flujo de Registro

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
5. Redirigir a /onboarding con mensaje de éxito
```

## Flujo de Inicio de Sesión

```
1. Usuario ingresa email y password (o Google signInWithPopup)
2. Firebase Auth (Client SDK): signInWithEmailAndPassword(email, password)
3. Obtener documento de Firestore: users/{uid}
4. Evaluar:
   - Si role == 'admin' → /admin/dashboard
   - Si role == 'client' y medicalProfile existe → /client/dashboard
   - Si role == 'client' y sin medicalProfile → /client/medical-profile
   - Si role == 'trainer' → /trainer/dashboard
5. Inicializar authStore con datos del usuario
```

## Flujo de Recuperación de Contraseña

```
1. Usuario ingresa su email
2. Firebase Auth (Client SDK): sendPasswordResetEmail(email)
3. Mostrar mensaje de éxito: "Revisa tu correo para restablecer tu contraseña"
4. Redirigir a /login
```

---

## Store de Autenticación (Nanostores)

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

---

## Servicios de Firebase Auth (Client SDK)

```typescript
// src/services/authService.ts
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User } from '../types';

// Registrar nuevo usuario
export async function registerUser(
  name: string, 
  email: string, 
  password: string
): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;
  
  // Crear perfil en Firestore
  await setDoc(doc(db, 'users', uid), {
    name,
    email,
    role: 'client',
    hasActiveAlert: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Iniciar sesión con email/contraseña
export async function loginUser(
  email: string, 
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;
  
  // Obtener perfil de Firestore
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    throw new Error('Perfil de usuario no encontrado');
  }
  
  return { uid, ...userDoc.data() } as User;
}

// Iniciar sesión con Google
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

// Cerrar sesión
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Recuperar contraseña
export async function recoverPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// Observer de estado de autenticación
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
```

---

## Tipos

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
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalProfile {
  allergies: string[];
  injuries: string[];
  conditions: string[];
  goals: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  birthDate: Date;
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
  confirmPassword: string;
}

export interface AuthError {
  code: string;
  message: string;
}
```

---

## Guardias de Ruta

### routeGuards.ts (definiciones de rutas)

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
  { path: '/client/settings', allowedRoles: ['client'] },
  
  // Admin
  { path: '/admin/dashboard', allowedRoles: ['admin'] },
  { path: '/admin/users', allowedRoles: ['admin'] },
  { path: '/admin/clients', allowedRoles: ['admin'] },
  { path: '/admin/trainers', allowedRoles: ['admin'] },
  { path: '/admin/settings', allowedRoles: ['admin'] },
  
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

### shared/authGuard.ts (guards unificados para scripts cliente)

```typescript
// src/lib/shared/authGuard.ts
// Proporciona requireAuth() y requireAdmin() para usar en páginas

export function requireAuth(callback: (user: FirebaseUser) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    callback(user);
  });
}

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

### auth/roleRedirect.ts (redirección post-login)

```typescript
// src/lib/auth/roleRedirect.ts
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'trainer': return '/trainer/dashboard';
    case 'admin': return '/admin/dashboard';
    case 'client': default: return '/client/dashboard';
  }
}

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

## Páginas del Módulo

### `/login.astro`
- Formulario de inicio de sesión (email/password + Google)
- Link a registro y recuperación
- Manejo de errores (credenciales inválidas, usuario no encontrado)
- Redirección post-login

### `/register.astro`
- Formulario de registro (name, email, password, confirm password)
- Validación en cliente
- Creación de usuario en Firebase Auth + Firestore
- Redirección a /onboarding con mensaje de éxito

### `/recover.astro`
- Formulario de email
- Envío de email de recuperación
- Mensaje de confirmación

### `/onboarding.astro`
- Pantalla de bienvenida post-registro
- Explicación de los siguientes pasos
- Botón para ir a /client/medical-profile

### `/client/medical-profile.astro`
- Formulario de perfil médico (onboarding)
- Campos: alergias, lesiones, condiciones, objetivos, experiencia, fecha nacimiento, altura, peso inicial
- Guardado en Firestore: users/{uid}/medicalProfile
- Redirección a /client/dashboard tras completar

---

> **📌 Convenciones de código:** Ver `12_guia_desarrollo_testing.md`
> **📌 Golden Rules:** Ver `.clinerules`
> **📌 Componentes UI:** Ver `06_design_system.md`
