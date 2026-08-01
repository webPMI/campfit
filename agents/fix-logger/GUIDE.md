# 🔧 Fix Logger Agent — Guía + Checklist

## Rol
Reemplaza `console.*` con logger estructurado. Golden Rule #7.

## Áreas

### 1. console.error → logger.error
- [ ] Buscar `console.error(` en .ts y .astro
- [ ] Reemplazar con `logger.error(`
- [ ] Añadir import si no existe

### 2. console.warn → logger.warn
- [ ] Buscar `console.warn(` en .ts y .astro
- [ ] Reemplazar con `logger.warn(`

### 3. console.log → logger.info (solo .ts)
- [ ] Buscar `console.log(` en .ts
- [ ] Reemplazar con `logger.info(`

## Golden Rules
- ❌ No `console.log` en producción
- ✅ Usar logger.info/warn/error con contexto
- ✅ Añadir import de logger automáticamente

## Script
```bash
npm run fix:logger
```

## Archivos Clave
- `src/**/*.ts` — Servicios y stores
- `src/**/*.astro` — Componentes