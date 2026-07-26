# 🧪 Testing Agent Guide

> **Guía optimizada para el Agente de Testing IA** - Golden rules, proceso, estrategias y patrones reales del proyecto CampFit.

---

## 🎯 Rol y Objetivos

**Responsabilidades:**
- Crear tests unitarios, integración y E2E
- Mantener cobertura >80% statements, >75% branches
- Evitar falsos positivos/negativos
- Tests rápidos (<100ms unitarios, <1s integración, <10s E2E)

**Objetivos de Calidad:**
- Cero falsos positivos
- Cero falsos negativos
- Cobertura significativa (no solo porcentaje)
- Tests mantenibles

---

## 🥇 Golden Rules de Testing

### ❌ NUNCA
1. Tests sin propósito claro
2. Tests que dependen del orden
3. Hardcoding de datos (usar factories)
4. Mocks excesivos
5. Probar el framework
6. Assertions triviales
7. Tests con múltiples responsabilidades
8. Ignorar errores en tests
9. Tests frágiles (dependen de implementación)
10. Tests sin cleanup

### ✅ SIEMPRE
1. **AAA Pattern** - Arrange, Act, Assert
2. **3 escenarios por función** - Éxito, error, edge case
3. Nombres descriptivos - `should return user when credentials are valid`
4. Usar factories para datos
5. Mockear dependencias externas
6. Probar comportamiento, no implementación
7. Timeouts apropiados
8. Verificar coverage real
9. Documentar edge cases complejos
10. Mantener tests actualizados

---

## 🏗️ Estructura de Tests del Proyecto

```
tests/
├── setup/
│   ├── vitest.ts          # Setup global (variables de entorno mock)
│   └── e2e.ts             # Setup E2E (fixtures, authenticatedPage)
├── mocks/
│   ├── firebase.ts        # Factories de datos mock (createMockUserCredential, createMockUserProfile)
│   └── firestore.ts       # Mock centralizado de Firestore (createFirestoreMock)
├── unit/
│   ├── services/          # authService, adminService, profileService
│   ├── stores/            # authStore
│   ├── lib/               # Módulos del proyecto
│   │   ├── admin/         # adminAuth, adminInit, adminRender, adminSubscriptions, adminUsers
│   │   ├── auth/          # roleRedirect
│   │   ├── client/        # dietService, progressService, workoutService
│   │   ├── helpers/       # userMappers
│   │   ├── shared/        # chat, i18n, logger, ui
│   │   └── trainer/       # trainerAuth, trainerChat, trainerClients, trainerDiets, trainerInit, trainerProgress, trainerRender, trainerUtils, trainerWorkouts
│   └── utils/             # adminUtils, translations, validators
├── integration/           # Tests con Firebase Emulator (skipped si no disponible)
└── e2e/                   # Tests E2E con Playwright
    └── auth.e2e.ts        # Login, Register, Recover, Access Control
```

### Archivo de progreso
- `tests/TASK_PROGRESS.md` - Actualizar después de cada sesión de testing

---

## 🔌 Configuración de Vitest (vitest.config.ts)

### Aliases de módulos disponibles
```typescript
alias: {
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@features': path.resolve(__dirname, 'src/features'),
  '@core': path.resolve(__dirname, 'src/core'),
  '@layouts': path.resolve(__dirname, 'src/layouts'),
  '@mockData': path.resolve(__dirname, 'src/mockData'),
  '@tests': path.resolve(__dirname, 'tests'),
}
```

### Firebase como dependencias inline
```typescript
server: {
  deps: {
    inline: [
      '@firebase/firestore',
      '@firebase/auth',
      '@firebase/app',
      '@firebase/util',
      '@firebase/logger',
      'firebase',
    ],
  },
},
```
> ⚠️ **IMPORTANTE**: Sin `deps.inline`, `vi.mock('firebase/firestore')` NO funciona porque vitest no procesa los re-exports de `firebase/*` → `@firebase/*`.

### Variables de entorno mock
Todas las variables `import.meta.env.PUBLIC_*` están mockeadas en `vitest.config.ts` y `tests/setup/vitest.ts`.

---

## 🔄 Proceso (6 Fases)

### 1. Análisis
```bash
# Identificar módulo: src/services/authService.ts → tests/unit/services/authService.test.ts
# Leer código, identificar funciones públicas, dependencias, edge cases
# Crear checklist: Función A (3 escenarios), Función B (3 escenarios)
```

### 2. Preparación
```bash
bash scripts/agent-lock.sh check
bash scripts/agent-lock.sh acquire "testing-agent" "module-name"
git pull origin master --allow-unrelated-histories --no-edit
npm run doctor
```

### 3. Creación - Patrón REAL del proyecto

#### Para módulos con Firestore (el patrón más común):
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFirestoreMock } from '@tests/mocks/firestore';

describe('moduleName.functionName', () => {
  let mocks: ReturnType<typeof createFirestoreMock>['mocks'];
  let firestoreInstance: ReturnType<typeof createFirestoreMock>['firestoreInstance'];
  let exports: ReturnType<typeof createFirestoreMock>['exports'];

  beforeEach(() => {
    const mock = vi.hoisted(() => createFirestoreMock());
    mocks = mock.mocks;
    firestoreInstance = mock.firestoreInstance;
    exports = mock.exports;

    vi.mock('firebase/firestore', () => exports);
    vi.mock('@/lib/firebase', () => ({ db: firestoreInstance, auth: {} }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return data on success', async () => {
    // Arrange
    const mockData = { id: '123', name: 'Test' };
    mocks.mockGetDocs.mockResolvedValueOnce({
      docs: [{ id: '123', data: () => mockData }],
      empty: false,
      size: 1,
    });

    // Act
    const result = await getData();

    // Assert
    expect(result).toEqual([mockData]);
    expect(mocks.mockGetDocs).toHaveBeenCalledTimes(1);
  });
});
```

#### Para mocks de onSnapshot (usar @ts-expect-error):
```typescript
it('should subscribe to realtime updates', () => {
  const callback = vi.fn();
  const mockData = { id: '123', name: 'Test' };

  // @ts-expect-error - mock simplificado para testing
  mocks.mockOnSnapshot.mockImplementation((_query, onNext) => {
    onNext({
      docs: [{ id: '123', data: () => mockData }],
      empty: false,
      size: 1,
    });
    return vi.fn(); // unsubscribe
  });

  const unsubscribe = subscribeToData('userId', callback);
  expect(callback).toHaveBeenCalledWith([mockData]);
});
```

#### Para módulos sin Firestore (utils, helpers):
```typescript
import { describe, it, expect } from 'vitest';
import { createMockUserProfile } from '@tests/mocks/firebase';

describe('utility function', () => {
  it('should handle valid input', () => {
    const user = createMockUserProfile({ role: 'client' });
    const result = getRoleBadge(user.role);
    expect(result).toBe('bg-blue-100 text-blue-800');
  });

  it('should handle edge case', () => {
    const result = getRoleBadge('unknown');
    expect(result).toBe('bg-gray-100 text-gray-800');
  });
});
```

### 4. Ejecución
```bash
npm test -- authService.test.ts
npm run test:coverage -- --reporter=text
# Revisar reporte, agregar tests si faltan líneas significativas
```

### 5. Integración
```bash
npm test
npm run test:integration    # Solo si Firebase Emulator está disponible
npm run test:e2e            # Solo si dev server está corriendo
bash scripts/validate.sh --quick
```

### 6. Commit
```bash
git add tests/unit/services/authService.test.ts
git commit -m "test: add comprehensive tests for authService

- Added login tests (success, error, edge case)
- Added register tests (success, error, edge case)
- Coverage: 95% statements, 90% branches"
git push origin master
bash scripts/agent-lock.sh release

# Actualizar progreso
# Editar tests/TASK_PROGRESS.md con nuevos tests y cobertura
```

---

## 🛡️ Evitar Falsos Positivos

### Tests Independientes
```typescript
// ❌ MAL - Estado compartido
let globalUser: User;

// ✅ BIEN - Cada test independiente
it('should create user', () => {
  const user = createUser('test@example.com');
  expect(user).toBeDefined();
});
```

### Mocks Controlados
```typescript
// ❌ MAL - Mock siempre exitoso
vi.mock('@/lib/firebase', () => ({
  auth: { signIn: vi.fn().mockResolvedValue({ user: {} }) },
}));

// ✅ BIEN - Mock con escenarios
const mockSignIn = vi.fn();
vi.mock('@/lib/firebase', () => ({ auth: { signIn: mockSignIn } }));

it('should handle success', async () => {
  mockSignIn.mockResolvedValueOnce({ user: { uid: '123' } });
});

it('should handle error', async () => {
  mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));
});
```

### Assertions Significativas
```typescript
// ❌ MAL - Trivial
expect(result).toBeTruthy();

// ✅ BIEN - Específico
expect(result).toEqual({
  id: expect.any(String),
  email: expect.stringMatching(/^[^@]+@[^@]+\.[^@]+$/),
});
```

### Probar Comportamiento
```typescript
// ❌ MAL - Implementación interna
expect(spy).toHaveBeenCalledWith('token', 'abc123');

// ✅ BIEN - Comportamiento observable
const retrieved = getToken();
expect(retrieved).toBe('abc123');
```

### Cleanup
```typescript
describe('list operations', () => {
  afterEach(() => list.clear());
  
  it('should add item', () => {
    list.addItem('item1');
    expect(list.items).toHaveLength(1);
  });
});
```

---

## 📊 Alta Cobertura

### Por Tipo de Código
| Tipo | Objetivo | Estrategia |
|------|----------|------------|
| Servicios | 95%+ statements, 90%+ branches | Todos los paths de error y éxito |
| Stores | 100% acciones | set, clear, update, computed |
| Utilidades | 100% | Múltiples inputs variados |
| Páginas Astro | 0% unitario | Testear en E2E |

### Branch Coverage
```typescript
function getUserStatus(user: User): 'active' | 'inactive' | 'pending' {
  if (!user.emailVerified) return 'pending';
  if (user.isBlocked) return 'inactive';
  if (user.lastLogin > 30 days ago) return 'inactive';
  return 'active';
}

// Tests para cada branch
it('should return pending when email not verified', () => {
  expect(getUserStatus(createUser({ emailVerified: false }))).toBe('pending');
});
```

### Edge Cases
```typescript
function validateAge(age: number): boolean {
  return age >= 18 && age <= 120;
}

it('should reject below minimum', () => expect(validateAge(17)).toBe(false));
it('should accept minimum', () => expect(validateAge(18)).toBe(true));
it('should accept maximum', () => expect(validateAge(120)).toBe(true));
it('should reject above maximum', () => expect(validateAge(121)).toBe(false));
```

### Error Paths
```typescript
async function createUser(data: UserData): Promise<User> {
  if (!data.email) throw new Error('Email required');
  if (!data.password) throw new Error('Password required');
  if (await emailExists(data.email)) throw new Error('Email already exists');
  return await db.users.create(data);
}

// Tests para cada error
it('should throw when email missing', async () => {
  await expect(createUser({ password: '123' })).rejects.toThrow('Email required');
});
```

---

## 🧩 Patrones Útiles

### Factory Pattern (usar las de @tests/mocks/firebase)
```typescript
import { createMockUserProfile, createMockUserCredential } from '@tests/mocks/firebase';

it('should filter by role', () => {
  const users = [
    createMockUserProfile({ role: 'client' }),
    createMockUserProfile({ role: 'trainer' }),
  ];
  expect(filterByRole(users, 'client')).toHaveLength(1);
});
```

### Parameterized Tests
```typescript
describe('password validation', () => {
  const testCases = [
    { password: 'weak', expected: false },
    { password: 'Strong123!', expected: true },
  ];

  test.each(testCases)('$password should be $expected', ({ password, expected }) => {
    expect(isStrongPassword(password)).toBe(expected);
  });
});
```

### Mock de onSnapshot con Firestore Mock centralizado
```typescript
import { createFirestoreMock, mockOnSnapshotImpl } from '@tests/mocks/firestore';

const { mocks, firestoreInstance, exports } = vi.hoisted(() => createFirestoreMock());

vi.mock('firebase/firestore', () => exports);
vi.mock('@/lib/firebase', () => ({ db: firestoreInstance, auth: {} }));

it('should handle realtime updates', () => {
  const callback = vi.fn();
  const mockData = { id: '123', value: 75 };

  // @ts-expect-error - mock simplificado para testing
  mocks.mockOnSnapshot.mockImplementation((_query, onNext) => {
    onNext({
      docs: [{ id: '123', data: () => mockData }],
      empty: false,
      size: 1,
    });
    return vi.fn();
  });

  subscribeToProgress('userId', 'weight', callback);
  expect(callback).toHaveBeenCalledWith([{ id: '123', value: 75 }]);
});
```

---

## 🛠️ Comandos

```bash
npm test                              # Unitarios
npm test -- authService.test.ts       # Test específico
npm run test:watch                    # Watch mode
npm run test:coverage                 # Coverage (text + json + html)
npm run test:coverage -- --reporter=text  # Solo texto (más rápido)
npm run test:integration              # Firebase Emulator
npm run test:e2e                      # Playwright (headless)
npm run test:e2e:ui                   # Playwright con UI
npm run test:e2e:headed               # Playwright con navegador visible
npm run test:all                      # Unit + E2E
npm run test:ci                       # Para CI/CD (coverage + E2E)
bash scripts/validate.sh --quick      # Type-check + tests + lint
```

---

## 📈 Métricas Objetivo

| Métrica | Objetivo |
|---------|----------|
| Statements | >80% |
| Branches | >75% |
| Functions | >85% |
| Tests por función | ≥3 |
| Tiempo unitarios | <100ms |
| Tiempo integración | <1s |
| Tiempo E2E | <10s |

---

## 🔍 Troubleshooting

### Tests intermitentes
- Usar `beforeEach` para limpiar estado
- Usar fake timers: `vi.useFakeTimers()`
- Mockear dependencias de tiempo

### Coverage alto pero tests triviales
- Revisar cada test: "¿Qué está probando realmente?"
- Eliminar assertions triviales
- Agregar tests de error paths

### Tests lentos
- Mover lógica a unitarios con mocks
- Usar timeouts apropiados
- Paralelizar tests con `describe.concurrent`

### Mocks no funcionan
- Verificar `deps.inline` en `vitest.config.ts` (especialmente `@firebase/firestore`, `@firebase/auth`)
- Usar `vi.hoisted()` para crear mocks antes de los imports
- Verificar path del mock (usar `@tests/mocks/` en lugar de rutas relativas)
- Si usas `mockImplementation` en `onSnapshot`, agregar `// @ts-expect-error`

### E2E fallan en CI
- Usar `waitFor` en lugar de timeouts fijos
- Agregar retries en `playwright.config.ts`
- Verificar variables de entorno

### Error: "Cannot find module '@firebase/firestore'"
**Solución:** Agregar `@firebase/firestore` a `deps.inline` en `vitest.config.ts`

### Error: "vi.hoisted is not a function"
**Solución:** Estás usando vitest < 3.x. `vi.hoisted()` requiere vitest 3+. Alternativa: declarar mocks fuera del `describe`.

---

## 📚 Referencias

- `CHECKLIST.md` - Checklist paso a paso para cada sesión
- `.clinerules` - Golden rules generales del proyecto
- `AGENTS_GUIDE.md` - Guía general para agentes
- `tests/TASK_PROGRESS.md` - Progreso de tests
- `tests/mocks/firestore.ts` - Mock centralizado de Firestore
- `tests/mocks/firebase.ts` - Factories de datos mock
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)

---

> **Última actualización:** 2026-07-25  
> **Versión:** 2.0 - Actualizada con patrones reales del proyecto