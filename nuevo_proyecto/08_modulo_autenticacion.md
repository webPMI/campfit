# 🔐 Módulo de Autenticación - CampFit 2.0

> **Monolito:** `packages/auth/` — Dependencia: solo `@campfit/shared`

## Descripción General

Módulo responsable del registro, inicio de sesión, recuperación de contraseña y gestión de sesiones. Es un monolito independiente en `packages/auth/` que solo depende de `@campfit/shared` para componentes UI, Firebase config y tipos base.

**Importante:** El registro e inicio de sesión se realizan desde el Client SDK de Firebase directamente, NO a través de API Routes. Las API Routes con Admin SDK se reservan para operaciones administrativas (cambio de roles, gestión de usuarios).

---

## Estructura del Monolito

```
packages/auth/
├── src/
│   ├── components/
│   │   ├── LoginForm.tsx        # Formulario de inicio de sesión
│   │   ├── RegisterForm.tsx     # Formulario de registro
│   │   └── RecoverForm.tsx      # Formulario de recuperación
│   ├── services/
│   │   └── authService.ts       # login, register, recover, logout
│   ├── stores/
│   │   └── authStore.ts         # $user, $authLoading, $authError
│   ├── guards/
│   │   └── routeGuards.ts       # AuthGuard, RoleGuard, checkRouteAccess
│   ├── pages/
│   │   ├── login.astro          # /auth/login
│   │   ├── register.astro       # /auth/register
│   │   └── recover.astro        # /auth/recover
│   └── types.ts                 # LoginForm, RegisterForm, AuthError
├── package.json                 # name: "@campfit/auth"
└── tsconfig.json
```

### Reglas de Importación
- ✅ `import { Button } from '@campfit/shared'` → Componentes UI
- ✅ `import { auth } from '@campfit/shared'` → Firebase config
- ✅ `import { $user } from '@campfit/shared'` → Stores base
- ✅ `import { User } from '@campfit/shared'` → Tipos base
- ✅ `import { authService } from '../services/authService'` → Local
- ❌ `import { something } from '@campfit/client'` → Prohibido

---

## Funcionalidades

| # | Funcionalidad | Prioridad |
|---|---------------|-----------|
| 1 | Registro con email y contraseña | Alta |
| 2 | Inicio de sesión con email/contraseña | Alta |
| 3 | Recuperación de contraseña | Alta |
| 4 | Persistencia de sesión (onAuthStateChanged + token refresh automático) | Alta |
| 5 | Redirección post-login según rol | Alta |
| 6 | Redirección a perfil médico en primer login (clientes) | Alta |
| 7 | Cierre de sesión con limpieza de estado | Alta |

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
5. Redirigir a /auth/login con mensaje de éxito
```

## Flujo de Inicio de Sesión

```
1. Usuario ingresa email y password
2. Firebase Auth (Client SDK): signInWithEmailAndPassword(email, password)
3. Obtener documento de Firestore: users/{uid}
4. Evaluar:
   - Si role == 'admin' → /admin/panel
   - Si role == 'client' y medicalProfile existe → /client/dashboard
   - Si role == 'client' y sin medicalProfile → /client/medical-profile
   - Si role == 'trainer' → /admin/panel (futuro)
5. Inicializar authStore con datos del usuario
```

## Flujo de Recuperación de Contraseña

```
1. Usuario ingresa su email
2. Firebase Auth (Client SDK): sendPasswordResetEmail(email)
3. Mostrar mensaje de éxito: "Revisa tu correo para restablecer tu contraseña"
4. Redirigir a /auth/login
```

---

## Store de Autenticación (Nanostores)

```typescript
// packages/auth/src/stores/authStore.ts
import { atom, computed } from 'nanostores';
import type { User } from '@campfit/shared';

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
// packages/auth/src/services/authService.ts
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@campfit/shared';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@campfit/shared';
import type { User } from '@campfit/shared';

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

// Iniciar sesión
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
// packages/auth/src/types.ts
import type { User } from '@campfit/shared';

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

```typescript
// packages/auth/src/guards/routeGuards.ts
import { $user, $authLoading } from '../stores/authStore';
import type { User } from '@campfit/shared';

export type RouteGuard = {
  path: string;
  allowedRoles: ('admin' | 'trainer' | 'client')[];
  requiresMedicalProfile?: boolean;
};

export const routeGuards: RouteGuard[] = [
  // Públicas
  { path: '/auth/login', allowedRoles: [] },
  { path: '/auth/register', allowedRoles: [] },
  { path: '/auth/recover', allowedRoles: [] },
  
  // Cliente
  { path: '/client/medical-profile', allowedRoles: ['client'] },
  { path: '/client/dashboard', allowedRoles: ['client'], requiresMedicalProfile: true },
  { path: '/client/workouts', allowedRoles: ['client'], requiresMedicalProfile: true },
  { path: '/client/diets', allowedRoles: ['client'], requiresMedicalProfile: true },
  { path: '/client/progress', allowedRoles: ['client'], requiresMedicalProfile: true },
  { path: '/client/chat', allowedRoles: ['client'], requiresMedicalProfile: true },
  { path: '/client/support', allowedRoles: ['client'], requiresMedicalProfile: true },
  
  // Admin
  { path: '/admin/panel', allowedRoles: ['admin'] },
  { path: '/admin/users', allowedRoles: ['admin'] },
  { path: '/admin/workouts', allowedRoles: ['admin'] },
  { path: '/admin/diets', allowedRoles: ['admin'] },
  { path: '/admin/chat', allowedRoles: ['admin'] },
  { path: '/admin/progress', allowedRoles: ['admin'] },
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
    return { allowed: false, redirectTo: '/auth/login' };
  }
  
  // Rol no permitido
  if (!guard.allowedRoles.includes(user.role)) {
    const redirectMap: Record<string, string> = {
      admin: '/admin/panel',
      client: '/client/dashboard',
      trainer: '/admin/panel',
    };
    return { allowed: false, redirectTo: redirectMap[user.role] ?? '/auth/login' };
  }
  
  // Perfil médico requerido pero no completado
  if (guard.requiresMedicalProfile && !user.medicalProfile) {
    return { allowed: false, redirectTo: '/client/medical-profile' };
  }
  
  return { allowed: true };
}
```

---

## Páginas del Módulo

### `/auth/login.astro`
- Formulario de inicio de sesión
- Link a registro y recuperación
- Manejo de errores (credenciales inválidas, usuario no encontrado)
- Redirección post-login

### `/auth/register.astro`
- Formulario de registro (name, email, password, confirm password)
- Validación en cliente
- Creación de usuario en Firebase Auth + Firestore
- Redirección a login con mensaje de éxito

### `/auth/recover.astro`
- Formulario de email
- Envío de email de recuperación
- Mensaje de confirmación

### `/client/medical-profile.astro`
- Formulario de perfil médico (onboarding)
- Campos: alergias, lesiones, condiciones, objetivos, experiencia, fecha nacimiento, altura, peso inicial
- Guardado en Firestore: users/{uid}/medicalProfile
- Redirección a /client/dashboard tras completar

---

## Tests

```typescript
// packages/auth/src/__tests__/services/authService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser } from '../services/authService';

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

describe('authService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return user data on successful login', async () => {
    const mockUser = { uid: '123', email: 'test@test.com' };
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: mockUser });
    const result = await loginUser('test@test.com', 'password123');
    expect(result).toEqual(mockUser);
  });

  it('should throw on invalid credentials', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
      new Error('auth/invalid-credential')
    );
    await expect(loginUser('wrong@test.com', 'wrong')).rejects.toThrow();
  });
});
```

---

> **📌 Convenciones de código:** Ver `12_guia_desarrollo_testing.md`
> **📌 Golden Rules:** Ver `.clinerules`
> **📌 Componentes UI:** Ver `06_design_system.md` (implementados en `@campfit/shared`)
