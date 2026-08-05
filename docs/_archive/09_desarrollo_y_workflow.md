# 🛠️ Desarrollo y Workflow - CampFit

> **Última actualización:** 2026-07-31  
> **Estado:** Consolidado en `docs/MASTER.md` (sección 11)

---

## 📑 Índice

1. [Setup del Proyecto](#1-setup-del-proyecto)
2. [Comandos Útiles](#2-comandos-útiles)
3. [Estructura de Carpetas](#3-estructura-de-carpetas)
4. [Convenciones de Código](#4-convenciones-de-código)
5. [Testing](#5-testing)
6. [CI/CD](#6-cicd)
7. [Guía para Agentes IA](#7-guía-para-agentes-ia)

---

## 1. Setup del Proyecto

### 1.1 Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git** >= 2.x
- **Firebase CLI** (opcional, para deploy)

### 1.2 Instalación

```bash
# Clonar repositorio
git clone https://github.com/webPMI/campfit.git
cd campfit

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase

# Iniciar servidor de desarrollo
npm run dev
```

### 1.3 Variables de Entorno

```env
# Firebase
PUBLIC_FIREBASE_API_KEY=your_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (solo en API routes)
FIREBASE_ADMIN_KEY=path/to/serviceAccountKey.json

# App
PUBLIC_APP_URL=http://localhost:4321
PUBLIC_APP_VERSION=1.0.0
```

---

## 2. Comandos Útiles

### 2.1 Desarrollo

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo (`http://localhost:4321`) |
| `npm run build` | Compilar la aplicación estática para producción (en `/dist`) |
| `npm run preview` | Previsualizar localmente la compilación de producción |
| `npm run check` | Verificar tipos de TypeScript |
| `npm run lint` | Ejecutar ESLint |
| `npm run format` | Formatear código con Prettier |

### 2.2 Testing

| Comando | Descripción |
|---------|-------------|
| `npm test` | Ejecutar tests unitarios (Vitest) |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con coverage |
| `npm run test:e2e` | Ejecutar tests E2E (Playwright) |
| `npm run test:ci` | Validación completa para CI |

### 2.3 Utilidades

| Comando | Descripción |
|---------|-------------|
| `npm run theme:validate` | Validar integridad del sistema de temas |
| `npm run theme:test` | Tests del theme store |
| `npm run theme:check` | Validación + tests de tema |

---

## 3. Estructura de Carpetas

### 3.1 Árbol Completo

```
campfit/
├── src/                           # 📁 Código fuente
│   ├── components/                # Componentes .astro
│   │   ├── atoms/                 # Componentes básicos (Button, Input, etc.)
│   │   ├── molecules/             # Componentes compuestos (StatCard, Modal, etc.)
│   │   ├── organisms/             # Componentes complejos (DataTable, Chat, etc.)
│   │   └── templates/             # Plantillas de página
│   ├── layouts/                   # Layouts .astro
│   │   ├── BaseLayout.astro       # Layout base (SEO, theme, meta)
│   │   ├── AdminLayout.astro      # Layout admin (sidebar)
│   │   ├── ClientLayout.astro     # Layout cliente (bottom nav)
│   │   └── TrainerLayout.astro    # Layout trainer (bottom nav)
│   ├── pages/                     # Páginas y API routes
│   │   ├── login.astro
│   │   ├── register.astro
│   │   ├── recover.astro
│   │   ├── onboarding.astro
│   │   ├── dashboard.astro
│   │   ├── index.astro
│   │   ├── admin/
│   │   ├── client/
│   │   ├── trainer/
│   │   └── api/                   # API routes (Admin SDK)
│   ├── lib/                       # Utilidades y helpers
│   │   ├── firebase.ts            # Configuración Firebase
│   │   ├── firebase/              # Wrappers para testing
│   │   ├── validators.ts          # Validación de formularios
│   │   ├── routeGuards.ts         # Protección de rutas
│   │   ├── shared/                # Utilidades compartidas
│   │   ├── admin/                 # Utilidades de admin
│   │   ├── auth/                  # Utilidades de auth
│   │   ├── client/                # Servicios del cliente
│   │   └── trainer/               # Utilidades de trainer
│   ├── services/                  # Servicios
│   │   ├── authService.ts         # Auth centralizado
│   │   └── adminService.ts        # Admin (legacy)
│   ├── stores/                    # Nanostores
│   │   ├── authStore.ts           # Estado de autenticación
│   │   └── themeStore.ts          # Estado de tema
│   ├── types/                     # Tipos globales
│   │   └── index.ts               # Interfaces y tipos
│   └── i18n/                      # Internacionalización
│       ├── translations.ts        # Traducciones ES/EN
│       └── client.ts              # Cliente i18n
├── tests/                         # 📁 TESTS CENTRALIZADOS
│   ├── setup/                     # Setup global
│   ├── mocks/                     # Factories de datos
│   ├── unit/                      # Tests unitarios
│   ├── integration/               # Tests de integración
│   └── e2e/                       # Tests E2E
├── docs/                          # 📁 Documentación
├── public/                        # 📁 Archivos estáticos
│   ├── images/
│   ├── fonts/
│   └── favicon.svg
├── scripts/                       # 📁 Scripts de utilidad
├── dist/                          # 📁 Build de producción (generado)
├── .env                           # Variables de entorno (no commit)
├── .env.example                   # Ejemplo de variables
├── astro.config.mjs               # Configuración de Astro
├── tailwind.config.mjs            # Configuración de Tailwind
├── tsconfig.json                  # Configuración de TypeScript
├── vitest.config.ts               # Configuración de Vitest
├── playwright.config.ts           # Configuración de Playwright
├── package.json                   # Dependencias
└── README.md                      # Documentación principal
```

### 3.2 Principios de Organización

1. **Componentes Atómicos:** Un componente = una responsabilidad
2. **Servicios Modulares:** Lógica de negocio separada de UI
3. **Stores Globales:** Estado compartido en Nanostores
4. **Tipos Centralizados:** Todas las interfaces en `types/index.ts`
5. **Tests por Módulo:** Misma estructura que `src/`

---

## 4. Convenciones de Código

### 4.1 Golden Rules (NUNCA VIOLAR)

#### ❌ NUNCA HACER ESTO
1. **No usar `any`** - Siempre tipar explícitamente
2. **No lógica de negocio en UI** - Componentes SOLO renderizan
3. **No hardcodear URLs/keys** - Todo por `import.meta.env`
4. **No ignorar estados** - Toda página maneja: loading, empty, error, success
5. **No Firebase Client SDK para ops sensibles** - Usar API Routes con Admin SDK
6. **No mutar stores directamente** - Usar funciones setter exportadas
7. **No console.log en producción** - Usar logger centralizado
8. **No try/catch genéricos** - Siempre tipar el error
9. **No archivos > 300 líneas** - Refactorizar en componentes más pequeños
10. **No commits sin formato** - Seguir conventional commits

#### ✅ SIEMPRE HACER ESTO
1. **Tipar todo** - Props, returns, variables, eventos
2. **4 estados por página** - loading → empty → error → success
3. **Tests unitarios** - Mínimo 1 test por función pública
4. **JSDoc en funciones públicas** - @param y @returns
5. **Componentes atómicos** - Una responsabilidad por componente
6. **Error boundaries** - Wrap cada feature
7. **Logging estructurado** - Usar logger.info/warn/error
8. **Validación de props** - Props requeridas marcadas
9. **Cleanup de suscripciones** - Unsubscribe en cleanup
10. **Manejo de concurrencia** - AbortController para fetch

### 4.2 Convenciones de Nombres

**Archivos:**
- Componentes: `PascalCase.astro` (ej: `Button.astro`)
- Servicios: `camelCase.service.ts` (ej: `authService.ts`)
- Stores: `camelCase.store.ts` (ej: `authStore.ts`)
- Utilidades: `camelCase.ts` (ej: `validators.ts`)
- Tipos: `index.ts` en carpeta `types/`

**Variables y Funciones:**
- Variables: `camelCase` (ej: `userName`)
- Constantes: `UPPER_SNAKE_CASE` (ej: `MAX_RETRIES`)
- Funciones: `camelCase` (ej: `getUserById`)
- Clases: `PascalCase` (ej: `AuthService`)
- Interfaces: `PascalCase` (ej: `User`, `LoginForm`)

**Componentes Astro:**
- Props: `camelCase` (ej: `variant`, `size`)
- Eventos: `on` + `PascalCase` (ej: `onClick`, `onSubmit`)

### 4.3 Estructura de Componentes

```astro
---
// 1. Imports
import { Button } from '@/components/atoms/Button.astro';
import type { User } from '@/types';

// 2. Props interface
interface Props {
  user: User;
  onEdit?: (id: string) => void;
  variant?: 'primary' | 'secondary';
}

// 3. Destructuring con defaults
const { 
  user, 
  onEdit, 
  variant = 'primary' 
}: Props = Astro.props;

// 4. Lógica (si es necesaria)
const handleEdit = () => {
  if (onEdit) {
    onEdit(user.id);
  }
};
---

<!-- 5. Template -->
<div class="user-card">
  <h2>{user.name}</h2>
  <p>{user.email}</p>
  <Button {variant} onClick={handleEdit}>
    Editar
  </Button>
</div>

<!-- 6. Styles (opcional) -->
<style>
  .user-card {
    padding: var(--space-4);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
  }
</style>
```

### 4.4 Manejo de Errores

```typescript
// ❌ MAL
try {
  await deleteUser(id);
} catch (e) {
  console.error(e);
}

// ✅ BIEN
try {
  await deleteUser(id);
} catch (error) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'Error desconocido';
  
  logger.error('Error al eliminar usuario', {
    userId: id,
    error: errorMessage,
  });
  
  showToast({
    type: 'error',
    message: 'No se pudo eliminar el usuario',
  });
}
```

### 4.5 Suscripciones Firestore

```typescript
// ✅ CORRECTO: Cleanup en useEffect
useEffect(() => {
  const unsubscribe = subscribeToUsers((users) => {
    setUsers(users);
  });
  
  return () => {
    unsubscribe(); // Cleanup al desmontar
  };
}, []);

// ✅ CORRECTO: Cleanup en beforeunload
useEffect(() => {
  const unsubscribe = subscribeToUsers((users) => {
    setUsers(users);
  });
  
  const handleBeforeUnload = () => {
    unsubscribe();
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    unsubscribe();
  };
}, []);
```

---

## 5. Testing

### 5.1 Estructura de Tests

```
tests/
├── setup/
│   └── vitest-setup.ts           # Setup global de Vitest
├── mocks/
│   ├── factories/
│   │   ├── user.factory.ts       # Factory de usuarios
│   │   ├── workout.factory.ts    # Factory de rutinas
│   │   └── diet.factory.ts       # Factory de dietas
│   └── handlers/
│       └── firestore.handler.ts  # Mock de Firestore
├── unit/
│   ├── stores/
│   │   ├── authStore.test.ts
│   │   └── themeStore.test.ts
│   ├── services/
│   │   ├── authService.test.ts
│   │   └── workoutService.test.ts
│   ├── lib/
│   │   ├── validators.test.ts
│   │   └── routeGuards.test.ts
│   └── components/
│       ├── Button.test.ts
│       └── Modal.test.ts
├── integration/
│   ├── auth.integration.test.ts
│   └── workout.integration.test.ts
└── e2e/
    ├── auth/
    │   ├── login.spec.ts
    │   ├── register.spec.ts
    │   └── recover.spec.ts
    ├── client/
    │   ├── dashboard.spec.ts
    │   ├── workouts.spec.ts
    │   └── progress.spec.ts
    └── admin/
        ├── users.spec.ts
        └── dashboard.spec.ts
```

### 5.2 Tests Unitarios

```typescript
// Ejemplo: tests/unit/services/authService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { loginUser } from '@/services/authService';

describe('authService', () => {
  describe('loginUser', () => {
    it('debe autenticar usuario con email y password', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      // Act
      const user = await loginUser(email, password);
      
      // Assert
      expect(user).toBeDefined();
      expect(user.email).toBe(email);
    });
    
    it('debe lanzar error con credenciales inválidas', async () => {
      // Arrange
      const email = 'invalid@example.com';
      const password = 'wrong';
      
      // Act & Assert
      await expect(loginUser(email, password)).rejects.toThrow();
    });
  });
});
```

### 5.3 Tests de Integración

```typescript
// Ejemplo: tests/integration/auth.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Auth Integration', () => {
  let testEnv: ReturnType<typeof initializeTestEnvironment>;
  
  beforeAll(() => {
    testEnv = initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf-8'),
      },
    });
  });
  
  afterAll(() => {
    testEnv.cleanup();
  });
  
  it('debe crear usuario y perfil en Firestore', async () => {
    // Test con Firebase Emulator
  });
});
```

### 5.4 Tests E2E (Playwright)

```typescript
// Ejemplo: tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('debe iniciar sesión correctamente', async ({ page }) => {
    // Navegar a login
    await page.goto('/login');
    
    // Llenar formulario
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Click en login
    await page.click('button[type="submit"]');
    
    // Verificar redirección
    await expect(page).toHaveURL('/client/dashboard');
  });
  
  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    // Navegar a login
    await page.goto('/login');
    
    // Llenar formulario con datos inválidos
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrong');
    
    // Click en login
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error
    await expect(page.locator('.error-message')).toBeVisible();
  });
});
```

---

## 6. CI/CD

### 6.1 GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run lint
        run: npm run lint
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Run theme validation
        run: npm run theme:check
      
      - name: Build
        run: npm run build
```

### 6.2 Deploy

```bash
# Build
npm run build

# Deploy a Firebase Hosting
firebase deploy

# O deploy manual a cualquier hosting estático
# Los archivos están en /dist
```

---

## 7. Guía para Agentes IA

### 7.1 Cuándo Trabajar en el Proyecto

**Tareas típicas para agentes IA:**
- Crear nuevos componentes
- Implementar páginas
- Escribir tests
- Refactorizar código
- Corregir bugs
- Optimizar rendimiento

### 7.2 Flujo de Trabajo Recomendado

```
1. Leer documentación
   - docs/MASTER.md (documentación completa)
   - docs/TODO.md (tareas pendientes)
   
2. Analizar el código existente
   - Buscar patrones similares
   - Entender la arquitectura
   
3. Implementar cambios
   - Seguir convenciones de código
   - Escribir tests
   - Actualizar documentación
   
4. Verificar
   - npm run lint
   - npm test
   - npm run build
   
5. Commit
   - Seguir conventional commits
   - Mensaje descriptivo
```

### 7.3 Reglas Importantes

1. **Siempre leer `docs/MASTER.md` primero** - Tiene toda la información del proyecto
2. **Consultar `docs/TODO.md`** - Para ver qué tareas están pendientes
3. **Seguir las Golden Rules** - Están en `docs/MASTER.md` sección 11
4. **No usar `any`** - Tipar todo explícitamente
5. **No lógica en UI** - Componentes solo renderizan
6. **Tests obligatorios** - Mínimo 1 test por función pública
7. **Documentar cambios** - Actualizar docs si es necesario

### 7.4 Checklist de Tareas

Antes de completar una tarea, verificar:

- [ ] ¿El código sigue las convenciones?
- [ ] ¿Está tipado correctamente (sin `any`)?
- [ ] ¿Los tests pasan?
- [ ] ¿Hay cleanup de suscripciones?
- [ ] ¿Se manejan todos los estados (loading, error, empty)?
- [ ] ¿Es accesible (WCAG 2.1 AA)?
- [ ] ¿Funciona en ambos temas (light/dark)?
- [ ] ¿Está documentado?

---

## 🔗 Referencias

- **Documentación Maestra:** `docs/MASTER.md` (sección 11)
- **Stack Tecnológico:** `docs/MASTER.md` (sección 2)
- **Reglas de Desarrollo:** `docs/MASTER.md` (sección 11)
- **Testing:** `docs/MASTER.md` (sección 11.4)

---

**Documento creado:** 2026-06-13  
**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit