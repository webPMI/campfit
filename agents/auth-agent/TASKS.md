# 📋 Auth Agent — Backlog de Tareas

> Backlog priorizado para autenticación y roles. Actualizado: 2026-07-25

---

## 🔴 Prioridad Alta

### #13: Estandarizar manejo de errores con AuthError
- **Descripción:** Usar tipo `AuthError` de `src/types/index.ts` en lugar de `Error` genérico en authService.ts
- **Archivos afectados:** `src/services/authService.ts`, `src/types/index.ts`
- **Criterios:** Todos los errores de auth usan `AuthError`, mensajes visibles al usuario

### #14: Agregar JSDoc a funciones públicas
- **Descripción:** Añadir `@param` y `@returns` a funciones sin documentación
- **Archivos afectados:** `src/lib/auth/roleRedirect.ts`, `src/lib/shared/authGuard.ts`
- **Criterios:** JSDoc completo en todas las funciones exportadas

---

## 🟡 Prioridad Media

### Tests E2E flujo auth completo
- **Descripción:** Crear test E2E register → login → redirect por rol
- **Archivos afectados:** `tests/e2e/auth.spec.ts`
- **Criterios:** Flujo completo funciona

### Tests E2E control de acceso
- **Descripción:** Verificar que rutas protegidas redirigen sin auth
- **Archivos afectados:** `tests/e2e/auth.spec.ts`
- **Criterios:** Sin auth → redirect a login

### Refactor requireAdmin en authGuard.ts
- **Descripción:** La lógica "bootstrap admin" hardcodeada debe ser configurable
- **Archivos afectados:** `src/lib/shared/authGuard.ts`

---

> **Ver también:** `TODO.md` items #13 y #14