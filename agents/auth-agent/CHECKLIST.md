# Auth Agent — Checklist

## Estado
- [x] Firebase Auth Email/Password + Google
- [x] Nanostores con 4 estados
- [x] authService.ts (6 operaciones)
- [x] requireAuth + requireAdmin guards
- [x] roleRedirect.ts
- [x] login.astro, register.astro, recover.astro
- [x] onboarding.astro (3 pasos)
- [x] AdminLayout, ClientLayout, TrainerLayout
- [x] Tests unitarios authStore

## Pendientes
- [ ] #13 AuthError type en authService
- [ ] #14 JSDoc roleRedirect + authGuard
- [ ] Tests unitarios authStore (mejorar)
- [ ] Tests E2E flujo auth completo
- [ ] Tests E2E control acceso rutas
- [ ] Refactor requireAdmin (bootstrap hardcode)