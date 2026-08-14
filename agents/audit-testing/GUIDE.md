# 🧪 Audit Testing Agent — Guía + Checklist

## Rol
Auditor de testing. Escanea cobertura, placeholders, tests vacíos, archivos sin test.

## Áreas de Auditoría

### 1. Placeholders y Tests Vacíos
- [ ] Buscar `expect(true).toBe(true)` en tests/
  - [ ] Subpaso: `grep -rn "expect(true).toBe(true)" tests/ --include="*.test.ts"`
  - [ ] Subpaso: Anotar archivo y línea de cada placeholder
- [ ] Buscar bloques `it()` vacíos en tests/
  - [ ] Subpaso: `grep -rn "it('.*', () => {}" tests/ --include="*.test.ts"` — buscar bloques vacíos
  - [ ] Subpaso: Anotar archivo y línea
- [ ] Buscar tests `.skip` en tests/
  - [ ] Subpaso: `grep -rn "\.skip" tests/ --include="*.test.ts"`
  - [ ] Subpaso: Anotar archivo y línea de cada skip
- [ ] Buscar tests sin aserciones (`expect`/`assert`)
  - [ ] Subpaso: `grep -rn "it(" tests/ --include="*.test.ts" | while read line; do file=$(echo $line | cut -d: -f1); num=$(echo $line | cut -d: -f2); sed -n "$((num+1)),$((num+15))p" "$file" | grep -q "expect(" || echo "SIN ASSERT: $file:$num"; done`
  - [ ] Subpaso: Anotar cada test sin aserción

### 2. Cobertura
- [ ] Verificar que servicios tienen tests (authService, adminService)
  - [ ] Subpaso: `ls tests/unit/services/` — verificar archivos
  - [ ] Subpaso: Comparar con `ls src/services/` — cada servicio debe tener test
- [ ] Verificar que stores tienen tests (authStore)
  - [ ] Subpaso: `ls tests/unit/stores/`
  - [ ] Subpaso: Comparar con `ls src/stores/`
- [ ] Verificar que utilidades tienen tests
  - [ ] Subpaso: `ls tests/unit/lib/`
  - [ ] Subpaso: Comparar con `ls src/lib/ --recursive`
- [ ] Buscar archivos src/ sin test correspondiente
  - [ ] Subpaso: Para cada `.ts` en `src/`, verificar si existe `tests/unit/**/*.test.ts` correspondiente
  - [ ] Subpaso: Anotar archivos sin test

### 3. Estructura
- [ ] Verificar que tests están centralizados en tests/
  - [ ] Subpaso: `find src/ -name "*.test.ts" -o -name "*.spec.ts"` — debe estar vacío
- [ ] Verificar que un archivo de test por módulo
  - [ ] Subpaso: Verificar que la estructura de `tests/` refleja `src/`
- [ ] Verificar que no hay tests en src/__tests__/
  - [ ] Subpaso: `ls src/__tests__/` — debe fallar (no existe)
- [ ] Verificar que mocks de Firebase están centralizados
  - [ ] Subpaso: `ls tests/mocks/`
  - [ ] Subpaso: Verificar que no hay mocks dispersos en tests/unit/

### 4. Calidad de Tests
- [ ] Verificar 3 escenarios por función (éxito, error, edge case)
  - [ ] Subpaso: Para cada función con test, verificar que hay ≥ 3 casos (`it()` blocks)
  - [ ] Subpaso: Anotar funciones con < 3 casos
- [ ] Verificar que no se llama a Firebase real en unitarios
  - [ ] Subpaso: `grep -rn "firebase" tests/unit/ --include="*.test.ts" | grep -v "mock\|vi.mock\|from '@/lib/firebase'"`
  - [ ] Subpaso: Verificar que todos los imports de Firebase están mockeados
- [ ] Verificar que no se usa React Testing Library
  - [ ] Subpaso: `grep -rn "react-testing-library\|@testing-library/react" tests/ --include="*.test.ts"`
  - [ ] Subpaso: Verificar que el resultado está vacío

## Script
```bash
node scripts/audit.mjs --area=testing
```

## Archivos Clave
- `tests/unit/` - Todos los tests unitarios
- `tests/setup/` - Setup global
- `tests/mocks/` - Mocks de Firebase
- `src/services/` - Servicios a testear
- `src/lib/` - Librerías a testear