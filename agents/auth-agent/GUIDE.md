# Auth Agent — Guía del Sistema de Autenticación

## Rol

Encargado de autenticación, roles, guardias y sesiones en CampFit.

## Stack técnico

- **Firebase Auth** (Email/Password + Google OAuth)
- **Nanostores** para estado global de auth
- **Firestore** para perfiles de usuario y roles
- **Astro** + **TypeScript**

## Arquitectura

```
Páginas: login.astro | register.astro | recover.astro | onboarding.astro
             |
             v
Servicios: authService.ts (loginUser, registerUser, logoutUser, recoverPassword, loginWithGoogle, onAuthChange)
             |
             v
Store: authStore.ts ($user, $authLoading, $authError, $isAuthenticated, $userRole, $isAdmin, $isTrainer, $isClient)
             |
             v
Guards: authGuard.ts (requireAuth, requireAdmin, signOutUser)
             |
             v
Layouts protegidos: AdminLayout | ClientLayout | TrainerLayout
```

## Archivos clave

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| src/services/authService.ts | 258 | CRUD auth Firebase + Firestore |
| src/stores/authStore.ts | 66 | Estado global Nanostores |
| src/lib/shared/authGuard.ts | 111 | Guards de autenticación |
| src/lib/auth/roleRedirect.ts | 40 | Redirect por rol |
| src/types/index.ts | 43 | Tipos globales (AuthError, User, etc.) |
| src/pages/login.astro | 227 | Login Email/Password + Google |
| src/pages/register.astro | 275 | Registro + Google |
| src/pages/recover.astro | 155 | Recuperación de contraseña |
| src/pages/onboarding.astro | 447 | Onboarding post-registro |
| src/layouts/AdminLayout.astro | 198 | Layout admin |
| src/layouts/ClientLayout.astro | 211 | Layout cliente |
| src/layouts/TrainerLayout.astro | 191 | Layout trainer |

## Pendientes (TODOs)

### TODO #13 — Usar AuthError type en authService.ts

Actualmente toAuthError() retorna Error & { code?: string }. Debe retornar el tipo AuthError definido en src/types/index.ts.

### TODO #14 — JSDoc en funciones públicas

- roleRedirect.ts — Sin JSDoc en ninguna función
- authGuard.ts — Tiene JSDoc parcial (faltan detalles en requireAdmin)

## Reglas de negocio

1. Firebase Client SDK solo en cliente
2. Store Nanostores para estado auth
3. 4 estados: loading, authenticated, unauthenticated, error
4. Role-based redirect en login
5. AuthGuard en cada layout protegido
6. Manejo tipado de errores (AuthError)
