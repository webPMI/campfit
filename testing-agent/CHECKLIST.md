# ✅ Testing Agent Checklist

> **Checklist paso a paso para el Agente de Testing IA** - Versión actualizada con patrones reales del proyecto.

---

## 📋 Pre-Task Setup

- [ ] Leer `GUIDE.md` para refresh de golden rules y patrones del proyecto
- [ ] Identificar módulo a testear (ej: `src/services/authService.ts` → `tests/unit/services/authService.test.ts`)
- [ ] Verificar que no hay otro agente trabajando: `bash scripts/agent-lock.sh check`
- [ ] Adquirir lock: `bash scripts/agent-lock.sh acquire "testing-agent" "module-name"`
- [ ] Hacer pull: `git pull origin master --allow-unrelated-histories --no-edit`
- [ ] Verificar estado del proyecto: `npm run doctor`

---

## 🔍 Análisis del Código

- [ ] Leer código fuente del módulo
- [ ] Identificar todas las funciones públicas
- [ ] Identificar dependencias externas (Firebase, localStorage, etc.)
- [ ] Identificar edge cases posibles
- [ ] Identificar todos los paths de error
- [ ] Crear checklist de tests por función (3 escenarios: éxito, error, edge case)
- [ ] Verificar si el módulo usa Firestore (necesitará `createFirestoreMock`)

---

## 📝 Creación de Tests

### Estructura del Archivo
- [ ] Crear archivo en ubicación correcta: `tests/unit/services/authService.test.ts`
- [ ] Importar dependencias necesarias: `describe, it, expect, vi, beforeEach, afterEach`
- [ ] Si usa Firestore: importar `createFirestoreMock` desde `@tests/mocks/firestore`
- [ ] Si usa datos mock: importar factories desde `@tests/mocks/firebase`
- [ ] Usar `vi.hoisted()` para crear mocks de Firestore (vitest 3+)
- [ ] Configurar `deps.inline` en `vitest.config.ts` si es necesario

### Por Cada Función Pública
- [ ] **Test de éxito** - Happy path con datos válidos
- [ ] **Test de error** - Error handling con datos inválidos
- [ ] **Test de edge case** - Casos límite (boundary conditions)

### Por Cada Test
- [ ] Seguir AAA Pattern (Arrange, Act, Assert)
- [ ] Nombre descriptivo: `should return user when credentials are valid`
- [ ] Usar `beforeEach` para limpiar mocks: `vi.clearAllMocks()`
- [ ] Assertions específicas (no triviales)
- [ ] Probar comportamiento, no implementación
- [ ] Timeout apropiado si es async

### Para mocks de onSnapshot
- [ ] Usar `// @ts-expect-error` antes de `mockImplementation`
- [ ] Verificar que el mock retorna `vi.fn()` (unsubscribe)
- [ ] Verificar que el callback recibe los datos correctos

### Cleanup
- [ ] Usar `afterEach` para limpiar estado compartido
- [ ] Verificar que no hay leaks de suscripciones
- [ ] Verificar que no hay leaks de timers

---

## 🧪 Ejecución y Validación

### Tests Unitarios
- [ ] Ejecutar test específico: `npm test -- authService.test.ts`
- [ ] Verificar que todos los tests pasan
- [ ] Si fallan, investigar causa raíz

### Coverage
- [ ] Ejecutar coverage: `npm run test:coverage -- --reporter=text`
- [ ] Verificar statements >80%, branches >75%
- [ ] Revisar líneas no cubiertas en reporte HTML
- [ ] Evaluar si líneas no cubiertas son significativas
- [ ] Agregar tests si faltan líneas importantes

### Integración
- [ ] Ejecutar todos los unitarios: `npm test`
- [ ] Ejecutar integración si aplica: `npm run test:integration`
- [ ] Ejecutar E2E si aplica: `npm run test:e2e`

### Validación Completa
- [ ] Ejecutar validación: `bash scripts/validate.sh --quick`
- [ ] Verificar type-check
- [ ] Verificar lint
- [ ] Verificar build

---

## 📊 Verificación de Calidad

### Sin Falsos Positivos
- [ ] Revisar que no hay assertions triviales
- [ ] Revisar que mocks tienen escenarios variados
- [ ] Revisar que tests no dependen del orden
- [ ] Revisar que tests son independientes

### Sin Falsos Negativos
- [ ] Revisar que mocks no siempre retornan éxito
- [ ] Revisar que se testean todos los error paths
- [ ] Revisar que se testean edge cases
- [ ] Revisar que timeouts son apropiados

### Tests Rápidos
- [ ] Verificar que unitarios <100ms por test
- [ ] Verificar que integración <1s por test
- [ ] Verificar que E2E <10s por test
- [ ] Optimizar si hay tests lentos

### Tests Mantenibles
- [ ] Revisar que nombres son descriptivos
- [ ] Revisar que hay comentarios en edge cases complejos
- [ ] Revisar que factories son reutilizables
- [ ] Revisar que no hay código duplicado

---

## 🚀 Commit y Push

### Commit
- [ ] Verificar cambios: `git status`
- [ ] Staging solo archivos de test: `git add tests/...`
- [ ] Commit con formato:
  ```bash
  git commit -m "test: add comprehensive tests for authService
  
  - Added login tests (success, error, edge case)
  - Added register tests (success, error, edge case)
  - Coverage: 95% statements, 90% branches"
  ```
- [ ] Push: `git push origin master`

### Cleanup
- [ ] Liberar lock: `bash scripts/agent-lock.sh release`
- [ ] Actualizar `tests/TASK_PROGRESS.md` con nuevos tests y cobertura
- [ ] Documentar módulo testeados y coverage logrado

---

## 📈 Post-Task

### Monitoreo
- [ ] Verificar que CI/CD pasa
- [ ] Verificar que no hay tests rotos en siguientes commits
- [ ] Monitorear coverage en siguientes cambios

### Mejora Continua
- [ ] Identificar patrones que se repiten
- [ ] Crear factories reutilizables si es necesario
- [ ] Actualizar `GUIDE.md` si se encontraron mejores prácticas

---

## 🎯 Métricas de Éxito

### Cobertura
- [ ] Statements >80%
- [ ] Branches >75%
- [ ] Functions >85%

### Calidad
- [ ] 0 falsos positivos
- [ ] 0 falsos negativos
- [ ] 0 tests frágiles
- [ ] 0 tests intermitentes

### Performance
- [ ] Unitarios <100ms
- [ ] Integración <1s
- [ ] E2E <10s

---

## ⚠️ Troubleshooting

### Tests Fallan
- [ ] Verificar que mocks están configurados correctamente
- [ ] Verificar que imports son correctos (usar `@tests/mocks/`)
- [ ] Verificar que `vi.mock` está después de `vi.hoisted()`
- [ ] Verificar que `deps.inline` incluye `@firebase/firestore`, `@firebase/auth`
- [ ] Verificar que `@ts-expect-error` está presente en mocks de `onSnapshot`

### Coverage Bajo
- [ ] Identificar líneas no cubiertas
- [ ] Agregar tests para paths faltantes
- [ ] Verificar que error paths están cubiertos
- [ ] Verificar que edge cases están cubiertos

### Tests Lentos
- [ ] Verificar que no hay operaciones innecesarias
- [ ] Usar mocks en lugar de implementaciones reales
- [ ] Verificar que no hay waits innecesarios
- [ ] Paralelizar tests si es posible

### Tests Intermitentes
- [ ] Agregar cleanup en afterEach
- [ ] Usar fake timers para time-dependent code
- [ ] Verificar que no hay estado compartido
- [ ] Verificar que tests son independientes

### Error: "vi.hoisted is not a function"
- [ ] Verificar versión de vitest (requiere 3+)
- [ ] Alternativa: declarar mocks fuera del describe

### Error: "Cannot find module '@firebase/firestore'"
- [ ] Agregar a `deps.inline` en `vitest.config.ts`

---

## 📚 Referencias Rápidas

```bash
# Comandos útiles
npm test -- file.test.ts              # Test específico
npm run test:coverage -- --reporter=text  # Coverage rápido
npm run test:watch                    # Watch mode
npm run test:e2e:ui                   # E2E con UI
bash scripts/validate.sh --quick      # Validación rápida
bash scripts/agent-lock.sh status     # Ver lock
```

```typescript
// Patrones útiles
beforeEach(() => vi.clearAllMocks());           // Limpiar mocks
afterEach(() => cleanup());                      // Cleanup
vi.useFakeTimers();                              // Fake timers

// Mock de Firestore (patrón estándar del proyecto)
const { mocks, firestoreInstance, exports } = vi.hoisted(() => createFirestoreMock());
vi.mock('firebase/firestore', () => exports);
vi.mock('@/lib/firebase', () => ({ db: firestoreInstance, auth: {} }));

// @ts-expect-error - necesario para mockImplementation de onSnapshot
mocks.mockOnSnapshot.mockImplementation((_q, cb) => { cb(data); return vi.fn(); });

// Assert específico
expect(result).toEqual({ ... });
```

---

> **Última actualización:** 2026-07-25  
> **Versión:** 2.0 - Actualizada con patrones reales del proyecto