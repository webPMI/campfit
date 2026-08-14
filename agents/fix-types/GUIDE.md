# 🔧 Fix Types Agent — Guía + Checklist

## Rol
Corrige tipos `any` reemplazándolos con `unknown` o tipos específicos. Golden Rule #1.

## Áreas

### 1. TypeScript (.ts)
- [ ] Reemplazar `: any` → `: unknown`
  - [ ] Subpaso: Buscar: `grep -rn ": any" src/ --include="*.ts" | grep -v "\.test\.ts" | grep -v "\.d\.ts"`
  - [ ] Subpaso: Para cada match, evaluar si se puede usar un tipo específico en lugar de `unknown`
  - [ ] Subpaso: Si el tipo es desconocido, usar `unknown` y añadir type guard donde se use
- [ ] Reemplazar `as any` → `as unknown`
  - [ ] Subpaso: Buscar: `grep -rn "as any" src/ --include="*.ts" | grep -v "\.test\.ts"`
  - [ ] Subpaso: Evaluar si el cast es necesario o si se puede tipar correctamente
  - [ ] Subpaso: Si el cast es necesario, usar `as unknown as TipoEspecifico` (doble cast)
- [ ] No modificar tests, mocks, .d.ts
  - [ ] Subpaso: Excluir `tests/`, `src/**/*.test.ts`, `src/**/*.d.ts` de los cambios
  - [ ] Subpaso: Verificar: `git diff --stat` — solo archivos de src/ modificados

### 2. Astro (.astro)
- [ ] Reemplazar `: any` → `: unknown` en frontmatter
  - [ ] Subpaso: Buscar: `grep -rn ": any" src/ --include="*.astro"`
  - [ ] Subpaso: Evaluar si el tipo se puede inferir de `Astro.props` o `Astro.url`
  - [ ] Subpaso: Si no se puede inferir, usar `unknown` y añadir type guard
- [ ] Reemplazar `as any` → `as unknown` en template
  - [ ] Subpaso: Buscar: `grep -rn "as any" src/ --include="*.astro"`
  - [ ] Subpaso: Evaluar si el cast es necesario
  - [ ] Subpaso: Verificar: `npm run type-check` — no debe introducir errores nuevos

### 3. Casos límite (⬅️ NUEVO)
- [ ] **Parámetros de funciones**: `function foo(x: any)` → `function foo(x: unknown)` + type guard
- [ ] **Retornos de funciones**: `: Promise<any>` → `: Promise<unknown>` o tipo específico
- [ ] **Arrays**: `any[]` → `unknown[]` o `TipoEspecifico[]`
- [ ] **Objetos**: `Record<string, any>` → `Record<string, unknown>` o interface
- [ ] **Eventos DOM**: `(e: any)` → `(e: Event)` o `(e: MouseEvent)` según el evento
- [ ] **Firestore**: `doc.data() as any` → `doc.data() as TipoEspecifico` (usar el tipo real)
- [ ] **JSON.parse**: `JSON.parse(x) as any` → `JSON.parse(x) as unknown as TipoEspecifico`

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