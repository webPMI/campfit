# 🧪 Audit Testing Agent — Guía + Checklist

## Rol
Auditor de testing. Escanea cobertura, placeholders, tests vacíos, archivos sin test.

## Áreas de Auditoría

### 1. Placeholders y Tests Vacíos
- [ ] Buscar `expect(true).toBe(true)` en tests/
- [ ] Buscar bloques `it()` vacíos en tests/
- [ ] Buscar tests `.skip` en tests/
- [ ] Buscar tests sin aserciones (`expect`/`assert`)

### 2. Cobertura
- [ ] Verificar que servicios tienen tests (authService, adminService)
- [ ] Verificar que stores tienen tests (authStore)
- [ ] Verificar que utilidades tienen tests
- [ ] Buscar archivos src/ sin test correspondiente

### 3. Estructura
- [ ] Verificar que tests están centralizados en tests/
- [ ] Verificar que un archivo de test por módulo
- [ ] Verificar que no hay tests en src/__tests__/
- [ ] Verificar que mocks de Firebase están centralizados

### 4. Calidad de Tests
- [ ] Verificar 3 escenarios por función (éxito, error, edge case)
- [ ] Verificar que no se llama a Firebase real en unitarios
- [ ] Verificar que no se usa React Testing Library

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