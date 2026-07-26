# Auth Agent — Rules

## 1. Firebase Client SDK solo en cliente

- Usar firebase/auth solo en scripts de Astro, nunca en SSR

## 2. Store Nanostores para estado auth

- Estados base: $user, $authLoading, $authError
- Computados: $isAuthenticated, $userRole, $isAdmin, $isTrainer, $isClient
- Acciones: setUser, setAuthLoading, setAuthError, clearAuth

## 3. 4 estados de autenticacion

loading | authenticated | unauthenticated | error

## 4. Role-based redirect

admin -> /admin/dashboard
trainer -> /trainer/dashboard
client (existente) -> /client/dashboard
client (nuevo) -> /onboarding

## 5. AuthGuard en layouts protegidos

AdminLayout, ClientLayout, TrainerLayout usan onAuthStateChanged

## 6. Manejo tipado AuthError

Usar AuthError { code, message } de src/types/index.ts