# 🔒 Audit Security Agent — Guía + Checklist

## Rol
Auditor de seguridad. Escanea auth, route guards, firestore rules, env vars, secrets.

## Áreas de Auditoría

### 1. Route Guards (CRÍTICO)
- [ ] Verificar que todas las rutas `/admin/*` están protegidas en `authGuard.ts`
  - [ ] Subpaso: Listar todas las rutas en `src/pages/admin/` con `ls src/pages/admin/`
  - [ ] Subpaso: Verificar que cada ruta usa `requireRole(['admin'])` o `requireAdmin()`
  - [ ] Subpaso: Comando: `grep -r "requireRole\|requireAdmin" src/pages/admin/`
- [ ] Verificar que todas las rutas `/trainer/*` están protegidas
  - [ ] Subpaso: Listar rutas en `src/pages/trainer/`
  - [ ] Subpaso: Verificar `requireRole(['trainer', 'admin'])` en cada una
- [ ] Verificar que todas las rutas `/client/*` están protegidas
  - [ ] Subpaso: Listar rutas en `src/pages/client/`
  - [ ] Subpaso: Verificar `requireRole(['client', 'admin', 'trainer'])` en cada una
- [ ] Verificar que `admin/clinical.astro` tiene guard (conocido issue N-C4)
  - [ ] Subpaso: `grep -n "requireRole\|requireAdmin" src/pages/admin/clinical.astro`

### 2. Firestore Rules (CRÍTICO)
- [ ] Verificar que emails bootstrap del código están en `firestore.rules`
  - [ ] Subpaso: `grep -n "servicioweb.pmi\|sevicioweb.pmi" firestore.rules`
  - [ ] Subpaso: Verificar que ambos emails existen en `isBootstrapAdminEmail()`
- [ ] Verificar que `isBlocked()` no hace doble lectura (issue C1)
  - [ ] Subpaso: `grep -n "isBlocked" firestore.rules`
  - [ ] Subpaso: Verificar que usa `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.blocked`
- [ ] Verificar que `myRole()` está optimizado
  - [ ] Subpaso: `grep -n "function myRole" firestore.rules`
  - [ ] Subpaso: Verificar que no hace múltiples `get()` por llamada

### 3. Variables de Entorno (CRÍTICO)
- [ ] Verificar que `.env.example` no tiene credenciales reales (issue N-C2)
  - [ ] Subpaso: `cat .env.example` — verificar que solo tiene placeholders `tu_...`
- [ ] Verificar que `firebase.ts` valida variables de entorno (issue C2)
  - [ ] Subpaso: `grep -n "import.meta.env" src/lib/firebase/*.ts`
  - [ ] Subpaso: Verificar que hay validación con error claro si falta
- [ ] Verificar que no hay API keys hardcodeadas en src/
  - [ ] Subpaso: `grep -rn "AIza\|apiKey.*=.*['\"]" src/ --include="*.ts" --include="*.astro"`

### 4. Manejo de Errores
- [ ] Verificar que try/catch usa tipos específicos (no genéricos)
  - [ ] Subpaso: `grep -rn "catch (e)" src/ --include="*.ts" --include="*.astro"`
  - [ ] Subpaso: Verificar que cada catch tipa `(e: unknown)` y usa `instanceof` o `as Error`
- [ ] Verificar que catch blocks usan logger, no console.*
  - [ ] Subpaso: `grep -rn "console\.\(log\|error\|warn\)" src/ --include="*.ts" --include="*.astro"`
  - [ ] Subpaso: Excluir `src/lib/debug/` y `src/lib/devtools/` (aceptables en DEV)
- [ ] Verificar que AuthError type se usa en authService
  - [ ] Subpaso: `grep -n "AuthError" src/services/authService.ts`
  - [ ] Subpaso: Verificar que `toAuthError()` retorna `AuthError` tipado

### 5. Secrets en Código
- [ ] Buscar patrones de passwords/tokens/keys en src/
  - [ ] Subpaso: `grep -rn "password\|secret\|token\|api_key\|apikey" src/ --include="*.ts" --include="*.astro" -i`
  - [ ] Subpaso: Verificar que ninguno contiene valores reales
- [ ] Verificar que no hay `window.__` con datos sensibles
  - [ ] Subpaso: `grep -rn "window\.__" src/ --include="*.ts" --include="*.astro"`
- [ ] Verificar que CSP no se rompe con `<style>` inline
  - [ ] Subpaso: `grep -rn "<style" src/ --include="*.astro"`
  - [ ] Subpaso: Verificar que no hay estilos inline en páginas de producción

## Script
```bash
node scripts/audit.mjs --area=security
```

## Archivos Clave
- `src/lib/shared/authGuard.ts`
- `firestore.rules`
- `.env.example`
- `src/services/authService.ts`
- `src/lib/firebase.ts`