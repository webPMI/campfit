# 🔧 Fix Testing Agent — Guía + Checklist

## Rol
Corrige tests placeholder y tests sin aserciones. Golden Rule #4 (testing).

## Áreas

### 1. Placeholder Tests
- [ ] Buscar `expect(true).toBe(true)` en tests/
- [ ] Añadir TODO comment para reemplazar con aserción real
- [ ] Mantener el placeholder para no romper la suite

### 2. Tests sin Aserciones
- [ ] Buscar bloques `it()` sin `expect()`
- [ ] Añadir `expect(true).toBe(true)` como placeholder
- [ ] Marcar con TODO para aserción real

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