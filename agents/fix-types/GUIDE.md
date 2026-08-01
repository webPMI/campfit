# 🔧 Fix Types Agent — Guía + Checklist

## Rol
Corrige tipos `any` reemplazándolos con `unknown` o tipos específicos. Golden Rule #1.

## Áreas

### 1. TypeScript (.ts)
- [ ] Reemplazar `: any` → `: unknown`
- [ ] Reemplazar `as any` → `as unknown`
- [ ] No modificar tests, mocks, .d.ts

### 2. Astro (.astro)
- [ ] Reemplazar `: any` → `: unknown` en frontmatter
- [ ] Reemplazar `as any` → `as unknown` en template

## Golden Rules
- ❌ Nunca usar `any` — Siempre tipar explícitamente
- ✅ Usar `unknown` cuando el tipo no se conoce
- ✅ Crear interfaces cuando sea posible

## Script
```bash
npm run fix:types
```

## Archivos Clave
- `src/**/*.ts` — Archivos TypeScript
- `src/**/*.astro` — Componentes Astro