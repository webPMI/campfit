# 🔧 Fix Testing Agent — Guía + Checklist

## Rol
Corrige tests placeholder y tests sin aserciones. Golden Rule #4 (testing).

## Áreas

### 1. Placeholder Tests
- [ ] Buscar `expect(true).toBe(true)` en tests/
  - [ ] Subpaso: `grep -rn "expect(true).toBe(true)" tests/ --include="*.test.ts"`
  - [ ] Subpaso: Anotar archivo y línea de cada placeholder
- [ ] Añadir TODO comment para reemplazar con aserción real
  - [ ] Subpaso: Añadir `// TODO: Reemplazar con aserción real` encima del placeholder
  - [ ] Subpaso: Documentar qué debería verificar el test (contexto del módulo)
- [ ] Mantener el placeholder para no romper la suite
  - [ ] Subpaso: NO eliminar el placeholder — solo marcar con TODO
  - [ ] Subpaso: Verificar: `npm test -- --run` — la suite debe seguir pasando

### 2. Tests sin Aserciones
- [ ] Buscar bloques `it()` sin `expect()`
  - [ ] Subpaso: `grep -rn "it(" tests/ --include="*.test.ts" | while read line; do file=$(echo $line | cut -d: -f1); num=$(echo $line | cut -d: -f2); sed -n "$((num+1)),$((num+15))p" "$file" | grep -q "expect(" || echo "SIN ASSERT: $file:$num"; done`
  - [ ] Subpaso: Anotar cada test sin aserción
- [ ] Añadir `expect(true).toBe(true)` como placeholder
  - [ ] Subpaso: Añadir al final del bloque `it()`
  - [ ] Subpaso: Marcar con `// TODO: Reemplazar con aserción real`
- [ ] Marcar con TODO para aserción real
  - [ ] Subpaso: Verificar: `npm test -- --run` — la suite debe seguir pasando

### 3. Casos límite (⬅️ NUEVO)
- [ ] **Tests que solo verifican `vi.fn()`**: Añadir `expect(mock).toHaveBeenCalled()` en lugar de placeholder
- [ ] **Tests que llaman función sin verificar resultado**: Añadir `expect(resultado).toBeDefined()`
- [ ] **Tests de render**: Añadir `expect(html).toContain('...')` con el contenido esperado
- [ ] **Tests de stores**: Verificar el estado con `expect(store.get()).toBe(...)` en lugar de placeholder
- [ ] **NO modificar mocks**: Los archivos en `tests/mocks/` no son tests — no añadir aserciones
- [ ] **NO modificar setup**: Los archivos en `tests/setup/` no son tests — no añadir aserciones

## Golden Rules
- ❌ No dejar tests vacíos sin marcar
- ✅ Tests deben tener al menos 1 aserción
- ✅ Marcar placeholders con TODO explícito

## Script
```bash
npm run fix:tests
```

## Archivos Clave
- `tests/unit/**/*.test.ts` — Tests unitarios
- `tests/integration/**/*.test.ts` — Tests integración