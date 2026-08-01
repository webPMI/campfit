# 🔒 Audit Security Agent — Guía + Checklist

## Rol
Auditor de seguridad. Escanea auth, route guards, firestore rules, env vars, secrets.

## Áreas de Auditoría

### 1. Route Guards (CRÍTICO)
- [ ] Verificar que todas las rutas `/admin/*` están protegidas en `authGuard.ts`
- [ ] Verificar que todas las rutas `/trainer/*` están protegidas
- [ ] Verificar que todas las rutas `/client/*` están protegidas
- [ ] Verificar que `admin/clinical.astro` tiene guard (conocido issue N-C4)

### 2. Firestore Rules (CRÍTICO)
- [ ] Verificar que emails bootstrap del código están en `firestore.rules`
- [ ] Verificar que `isBlocked()` no hace doble lectura (issue C1)
- [ ] Verificar que `myRole()` está optimizado

### 3. Variables de Entorno (CRÍTICO)
- [ ] Verificar que `.env.example` no tiene credenciales reales (issue N-C2)
- [ ] Verificar que `firebase.ts` valida variables de entorno (issue C2)
- [ ] Verificar que no hay API keys hardcodeadas en src/

### 4. Manejo de Errores
- [ ] Verificar que try/catch usa tipos específicos (no genéricos)
- [ ] Verificar que catch blocks usan logger, no console.*
- [ ] Verificar que AuthError type se usa en authService

### 5. Secrets en Código
- [ ] Buscar patrones de passwords/tokens/keys en src/
- [ ] Verificar que no hay `window.__` con datos sensibles
- [ ] Verificar que CSP no se rompe con `<style>` inline

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