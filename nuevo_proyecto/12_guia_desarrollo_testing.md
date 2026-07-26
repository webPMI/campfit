# 📖 Guía de Testing - CampFit 2.0

## Stack de Testing

| Tipo | Herramienta | Entorno |
|------|-------------|---------|
| **Unitarios** | Vitest | `node` (sin jsdom/React) |
| **Integración** | Vitest + Firebase Emulator | `node` |
| **E2E** | Playwright | Navegador real |

## Estructura (Tests Centralizados)

> ⚠️ **Todos los tests en `tests/`**. Prohibido tener tests dentro de `src/`.

```
campfit-astro/
├── src/                    # Código fuente (sin tests)
└── tests/                  # 📁 TESTS CENTRALIZADOS
    ├── setup/
    │   ├── vitest.ts       # Mocks globales de Firebase
    │   └── e2e.ts          # Fixtures de Playwright
    ├── mocks/
    │   └── firebase.ts     # Factories de datos mock
    ├── unit/
    │   ├── services/       # tests/unit/services/*.test.ts
    │   ├── stores/         # tests/unit/stores/*.test.ts
    │   └── utils/          # tests/unit/utils/*.test.ts
    ├── integration/        # tests/integration/*.test.ts
    └── e2e/                # tests/e2e/*.spec.ts
```

## Reglas

1. **Mockear Firebase** - Nunca llamar a Firebase real en unitarios
2. **Una función = un `describe`** - Agrupar tests por función
3. **3 escenarios por función**: éxito, error, edge case
4. **Sin React** - No usar React Testing Library ni jsdom
5. **Misma estructura que `src/`** - `tests/unit/services/` refleja `src/services/`

## Cobertura Mínima

| Tipo | Cobertura | Qué testear |
|------|-----------|-------------|
| Servicios | 100% funciones públicas | éxito, error, edge case |
| Stores | 100% acciones | set, clear, update, computed |
| Utilidades | 100% | múltiples inputs |
| Páginas Astro | 0% unitario | Se testean en E2E |

## Comandos

```bash
npm run test                 # Unitarios
npm run test:watch           # Watch mode
npm run test:coverage        # Con cobertura
npm run test:integration     # Firebase Emulator
npm run test:e2e             # Playwright headless
npm run test:e2e:ui          # Playwright UI mode
npm run test:all             # Unit + E2E
npm run test:ci              # Para CI/CD
```

## Mocks Globales

El archivo `tests/setup/vitest.ts` mockea automáticamente:
- `firebase/app` → `initializeApp`, `getApp`, `getApps`
- `firebase/auth` → `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`, `onAuthStateChanged`, etc.
- `firebase/firestore` → `getDoc`, `setDoc`, `addDoc`, `collection`, `doc`, `onSnapshot`, etc.
- `firebase/storage` → `uploadBytes`, `getDownloadURL`, etc.

Para mocks más específicos por test, usar `vi.mock()` local (los mocks locales sobrescriben los globales).

## Ejemplos Reales

Ver los tests de ejemplo ya creados en:
- `tests/unit/services/authService.test.ts` — 9 tests (login, register, logout)
- `tests/unit/stores/authStore.test.ts` — 16 tests (Nanostores)
- `tests/unit/utils/validators.test.ts` — 16 tests (email, password, name)
- `tests/integration/auth.flow.test.ts` — placeholder para Firebase Emulator
- `tests/e2e/auth.spec.ts` — 7 tests E2E con Playwright

---

> **📌 Golden Rules:** Ver `.clinerules`
> **📌 Instrucciones para agentes IA:** Ver `14_agent_instructions.md`
