# 🔧 Fix Logger Agent — Guía + Checklist

## Rol
Reemplaza `console.*` con logger estructurado. Golden Rule #7.

## Áreas

### 1. console.error → logger.error
- [ ] Buscar `console.error(` en .ts y .astro
  - [ ] Subpaso: `grep -rn "console\.error(" src/ --include="*.ts" --include="*.astro"`
  - [ ] Subpaso: Excluir `src/lib/debug/` y `src/lib/devtools/` (aceptables en DEV)
- [ ] Reemplazar con `logger.error(`
  - [ ] Subpaso: Añadir contexto al mensaje: `logger.error('Contexto', error)`
  - [ ] Subpaso: Si el error es `unknown`, tipar: `logger.error('Contexto', e instanceof Error ? e.message : String(e))`
- [ ] Añadir import si no existe
  - [ ] Subpaso: `import { logger } from '@/lib/shared/logger';`
  - [ ] Subpaso: Verificar: `grep -n "import.*logger" archivo_modificado`

### 2. console.warn → logger.warn
- [ ] Buscar `console.warn(` en .ts y .astro
  - [ ] Subpaso: `grep -rn "console\.warn(" src/ --include="*.ts" --include="*.astro"`
  - [ ] Subpaso: Excluir `src/lib/debug/` y `src/lib/devtools/`
- [ ] Reemplazar con `logger.warn(`
  - [ ] Subpaso: Añadir contexto: `logger.warn('Contexto', detalle)`
  - [ ] Subpaso: Verificar: `npm run type-check` — no debe introducir errores

### 3. console.log → logger.info (solo .ts)
- [ ] Buscar `console.log(` en .ts
  - [ ] Subpaso: `grep -rn "console\.log(" src/ --include="*.ts"`
  - [ ] Subpaso: Excluir `src/lib/debug/`, `src/lib/devtools/` y `src/lib/shared/logger.ts` (es el propio logger)
- [ ] Reemplazar con `logger.info(`
  - [ ] Subpaso: Añadir contexto: `logger.info('Contexto', dato)`
  - [ ] Subpaso: Verificar: `npm run type-check` — no debe introducir errores

### 4. Casos límite (⬅️ NUEVO)
- [ ] **console.log en .astro**: NO reemplazar en templates — solo en scripts `<script>` con `is:inline`
- [ ] **console.log en devtools**: Dejar intacto si está en `src/lib/devtools/` (solo DEV)
- [ ] **console.log en debug**: Dejar intacto si está en `src/lib/debug/` (solo DEV)
- [ ] **logger.ts**: NO modificar — es el propio sistema de logging
- [ ] **Verificación final**: `grep -rn "console\.\(log\|error\|warn\)" src/ --include="*.ts" --include="*.astro" | grep -v "src/lib/debug\|src/lib/devtools\|src/lib/shared/logger"`

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