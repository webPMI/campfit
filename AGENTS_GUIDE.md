# 🤖 CampFit AI Agents Guide

> **Guía completa para que agentes de IA trabajen de forma autónoma, segura y optimizada en el proyecto CampFit.**

---

## 📋 Índice

1. [Sistema de Agentes Especializados](#-sistema-de-agentes-especializados)
2. [Arquitectura del Harness](#-arquitectura-del-harness)
3. [Configuración MCP](#-configuración-mcp)
4. [Contexto del Proyecto](#-contexto-del-proyecto)
5. [Flujo de Trabajo para Agentes](#-flujo-de-trabajo-para-agentes)
6. [Comandos Disponibles](#-comandos-disponibles)
7. [Testing para Agentes](#-testing-para-agentes)
8. [Agente de Testing Especializado](#-agente-de-testing-especializado)
9. [Git Workflow Automatizado](#-git-workflow-automatizado)
10. [CI/CD Pipeline](#-cicd-pipeline)
11. [Seguridad y Límites](#-seguridad-y-límites)
12. [initClientPage()](#-initclientpage--inicialización-de-páginas-cliente)
13. [Troubleshooting](#-troubleshooting)

---

## 🎯 Sistema de Agentes Especializados

CampFit tiene **9 agentes especializados** con roles fijos, cada uno con su propio contexto, reglas, checklist y backlog de tareas.

### Registro Maestro
**`agents/__master.md`** — Punto de entrada obligatorio para cualquier agente nuevo. Ver agentes disponibles, cómo delegar tareas y estado general del proyecto.

### Agentes Disponibles

| # | Agente | Área | Prioridad Actual |
|---|--------|------|-----------------|
| 1 | **Planner** | Coordinación, roadmap, planificación | Revisar backlog general |
| 2 | **Theme** | Design System, UI, Tailwind, componentes | Normalizar iconos SVG |
| 3 | **Language** | i18n, traducciones ES/EN | Añadir ~38 claves onboarding EN |
| 4 | **Testing** | Tests, cobertura | Cubrir adminUtils, trainerUtils |
| 5 | **Client** | Módulo cliente | Tests E2E flujo cliente |
| 6 | **Admin** | Módulo admin | Tests unitarios adminUtils |
| 7 | **Trainer** | Módulo trainer | Tests unitarios trainerUtils |
| 8 | **Auth** | Autenticación, roles | AuthError type |
| 9 | **Infra** | Firebase, scripts, CI/CD | Instalar ESLint |

### Estructura de cada agente

```
agents/[rol]/
├── GUIDE.md      # Rol, contexto, estructura del módulo, flujo de trabajo
├── RULES.md      # Reglas específicas (además de Golden Rules)
├── CHECKLIST.md  # Checklist operativo para cada sesión
└── TASKS.md      # Backlog priorizado con criterios de aceptación
```

### Cómo delegar entre agentes

| Necesitas... | Llama al agente | Directorio |
|-------------|-----------------|------------|
| Traducciones | `language-agent` | `language-agent/` |
| Crear tests | `testing-agent` | `testing-agent/` |
| Diseño UI | `theme-agent` | `agents/theme-agent/` |
| Feature cliente | `client-agent` | `agents/client-agent/` |
| Feature admin | `admin-agent` | `agents/admin-agent/` |
| Feature trainer | `trainer-agent` | `agents/trainer-agent/` |
| Auth/roles | `auth-agent` | `agents/auth-agent/` |
| Infra/scripts | `infra-agent` | `agents/infra-agent/` |
| Coordinar | `planner-agent` | `agents/planner-agent/` |

---

## 🏗️ Arquitectura del Harness

```
campfit/
├── .clinerules              # Reglas GOLDEN para Cline
├── AGENTS.md                # Instrucciones para agentes (Astro)
├── AGENTS_GUIDE.md          # 👈 ESTE ARCHIVO - Guía completa
├── CLAUDE.md                # Instrucciones para Claude
├── CONTEXT.md               # Contexto comprimido del proyecto
├── TASK.md                  # Tarea actual del agente
├── TODO.md                  # TODO centralizado
├── GIT_WORKFLOW.md          # Flujo de git
├── .github/
│   └── workflows/
│       └── ci.yml           # CI/CD Pipeline
├── scripts/
│   ├── agent-lock.sh        # Sistema de lock para multi-agente
│   ├── setup.sh             # Setup inicial para nuevos agentes
│   ├── doctor.sh            # Diagnóstico del proyecto
│   ├── mcp-setup.sh         # Setup de servidores MCP
│   ├── check-context.sh     # Verificador de contexto
│   └── validate.sh          # Validación pre-commit
├── tests/                   # Tests centralizados
│   ├── setup/
│   ├── mocks/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── testing-agent/           # Documentación del agente de testing
│   ├── GUIDE.md
│   └── CHECKLIST.md
└── nuevo_proyecto/          # Documentación del proyecto
```

---

## 🔌 Configuración MCP

### Servidores MCP Disponibles

| Servidor | Propósito | Herramientas |
|----------|-----------|-------------|
| `@firebase-mcp` | Firebase Auth + Firestore | CRUD usuarios, auth, queries |
| `@github-mcp` | GitHub | Commits, PRs, issues |
| `@filesystem-mcp` | Sistema de archivos | Leer/escribir archivos |

### Configuración Automática

Usa el script de setup MCP para verificar y configurar todo:

```bash
# Verificar configuración MCP
bash scripts/mcp-setup.sh

# Instalar servidores MCP
bash scripts/mcp-setup.sh --install

# Generar archivo .env con template
bash scripts/mcp-setup.sh --env
```

### Configuración Manual

Los servidores MCP se configuran en el IDE (VS Code / Cursor / Windsurf) a través del archivo `.mcp.json`:

```json
{
  "mcpServers": {
    "firebase-mcp": {
      "command": "npx",
      "args": ["@firebase-mcp/server"],
      "env": {
        "FIREBASE_PROJECT_ID": "mallorca-campfit",
        "FIREBASE_CLIENT_EMAIL": "${env:FIREBASE_CLIENT_EMAIL}",
        "FIREBASE_PRIVATE_KEY": "${env:FIREBASE_PRIVATE_KEY}"
      },
      "description": "Firebase Auth + Firestore operations",
      "disabled": false
    },
    "github-mcp": {
      "command": "npx",
      "args": ["@github-mcp/server"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      },
      "description": "GitHub repository management",
      "disabled": false
    },
    "filesystem-mcp": {
      "command": "npx",
      "args": ["@filesystem-mcp/server"],
      "description": "File system operations",
      "disabled": false
    }
  }
}
```

> **Nota:** VS Code usa la sintaxis `${env:VAR_NAME}` para variables de entorno. Asegúrate de tener las variables configuradas en tu shell o en el archivo `.env`.

### Variables de Entorno Requeridas

| Variable | Propósito | Cómo obtenerla |
|----------|-----------|---------------|
| `FIREBASE_CLIENT_EMAIL` | Service Account email | Firebase Console → Project Settings → Service Accounts |
| `FIREBASE_PRIVATE_KEY` | Service Account private key | Firebase Console → Project Settings → Service Accounts |
| `GITHUB_TOKEN` | GitHub personal access token | GitHub → Settings → Developer settings → Personal access tokens |

### Buenas Prácticas MCP

1. **Usar Firebase MCP solo para operaciones seguras** (lecturas, writes simples)
2. **Operaciones sensibles** (cambiar roles, eliminar usuarios) → API Routes de Astro
3. **No exponer secrets** en el código - siempre usar variables de entorno
4. **Preferir queries con filtro** sobre colecciones completas
5. **Verificar conexión** con `bash scripts/mcp-setup.sh` antes de usar

---

## 📚 Contexto del Proyecto

### Stack Resumido

| Capa | Tecnología |
|------|-----------|
| Framework | Astro 7 (SSR con `@astrojs/node`) |
| UI | Vanilla JS (sin React) |
| Estilos | Tailwind CSS 4 (dark mode) |
| Estado | Nanostores |
| DB | Cloud Firestore (NoSQL, 7 colecciones) |
| Storage | Cloudflare R2 |
| Testing | Vitest + Playwright |
| Mobile | Capacitor 6 |

### Estructura de Directorios (src/)

```
src/
├── components/         # Componentes .astro (DecorativeBackground, LanguageSwitcher, PublicPageLayout)
├── layouts/            # Layouts por rol (Base, Admin, Client, Trainer, PublicPage)
├── pages/              # Páginas y API routes
│   ├── admin/          # dashboard, users, clients, trainers, settings
│   ├── client/         # dashboard, workouts, diets, progress, chat, support, settings, medical-profile
│   ├── trainer/        # dashboard, clients, workouts, diets, chat, settings
│   ├── api/            # API routes
│   ├── login.astro, register.astro, recover.astro, onboarding.astro
│   ├── index.astro, 404.astro, 500.astro
│   └── dashboard.astro
├── lib/
│   ├── shared/         # ui.ts, chat.ts, logger.ts, authGuard.ts, i18n.ts, profileService.ts
│   ├── admin/          # Módulo admin modularizado (7 archivos)
│   │   ├── types.ts              # AdminUser, CreateUserPayload
│   │   ├── adminAuth.ts          # requireAdmin, signOutUser
│   │   ├── adminUsers.ts         # CRUD usuarios
│   │   ├── adminSubscriptions.ts # Suscripciones Firestore
│   │   ├── adminRender.ts        # Renderizado HTML
│   │   ├── adminInit.ts          # initGlobalActions
│   │   └── adminUtils.ts         # Barrel (re-export)
│   ├── trainer/        # Módulo trainer modularizado (10 archivos)
│   │   ├── types.ts              # TrainerClient, Workout, Diet, etc.
│   │   ├── trainerAuth.ts        # requireAuth, signOutUser
│   │   ├── trainerClients.ts     # Clientes del trainer
│   │   ├── trainerWorkouts.ts    # CRUD rutinas
│   │   ├── trainerDiets.ts       # CRUD dietas
│   │   ├── trainerProgress.ts    # Progreso de clientes
│   │   ├── trainerChat.ts        # Mensajería
│   │   ├── trainerRender.ts      # Renderizado HTML
│   │   ├── trainerInit.ts        # initGlobalActions
│   │   └── trainerUtils.ts       # Barrel (re-export)
│   ├── client/         # chatService.ts, dietService.ts, progressService.ts, workoutService.ts
│   ├── auth/           # roleRedirect.ts
│   ├── helpers/        # userMappers.ts
│   ├── firebase/       # auth.ts, firestore.ts (wrappers testing)
│   └── debug/          # firestoreDebug.ts
├── services/           # authService.ts, adminService.ts
├── stores/             # authStore.ts (Nanostores)
├── types/              # index.ts (User, MedicalProfile, etc.)
└── i18n/               # translations.ts, client.ts
```

### Roles de Usuario

- `admin` - Administración del sistema
- `trainer` - Entrenadores con clientes asignados
- `client` - Clientes finales

### Colecciones Firestore

- `users` - Perfiles de usuario
- `workouts` - Rutinas de entrenamiento
- `diets` - Planes nutricionales
- `messages` - Mensajes del chat
- `progress_logs` - Registros de progreso
- `exercises_library` - Biblioteca de ejercicios
- `diet_templates` - Plantillas de dietas

---

## 🔄 Flujo de Trabajo para Agentes

### 1. Inicialización

```bash
# 1. Leer el contexto del proyecto
cat CONTEXT.md

# 2. Leer la tarea actual
cat TASK.md

# 3. Verificar el estado del proyecto
npm run doctor
```

### 2. Antes de Modificar Código

```bash
# 1. Verificar que no hay otro agente trabajando
bash scripts/agent-lock.sh check

# 2. Si está libre, adquirir lock
bash scripts/agent-lock.sh acquire "agent-name" "feature"

# 3. Hacer pull de últimos cambios
git pull origin master --allow-unrelated-histories --no-edit
```

### 3. Durante la Implementación

1. **Seguir las GOLDEN RULES** (ver `.clinerules`)
2. **Un cambio a la vez** - commit por cada cambio atómico
3. **Tests primero** para funciones nuevas
4. **JSDoc** en todas las funciones públicas
5. **Logging estructurado** - Usar `logger.info/warn/error` en puntos clave
6. **Límites en Firestore** - Toda consulta debe tener `limit()` (max 100)
7. **No archivos > 300 líneas** - refactorizar si es necesario

### 4. Validación Pre-commit

```bash
# Validación rápida (recomendada)
bash scripts/validate.sh --quick

# Validación completa
bash scripts/validate.sh

# Validación con auto-fix
bash scripts/validate.sh --fix
```

### 5. Commit y Push

```bash
git add -A
git commit -m "tipo: descripción

- Detalle 1
- Detalle 2"
git push origin master
```

### 6. Liberar Lock

```bash
bash scripts/agent-lock.sh release
```

---

## 🛠️ Comandos Disponibles

### Desarrollo

```bash
npm run dev              # Servidor de desarrollo (localhost:4321)
npm run build            # Build de producción
npm run preview          # Preview del build
```

### Testing

```bash
npm test                 # Tests unitarios (Vitest)
npm run test:watch       # Watch mode
npm run test:coverage    # Con cobertura
npm run test:e2e         # E2E (Playwright headless)
npm run test:e2e:ui      # E2E con UI
npm run test:all         # Unit + E2E
npm run test:ci          # Para CI/CD
```

### Calidad

```bash
npm run type-check       # TypeScript check
npm run lint             # ESLint
npm run format           # Prettier
```

### Utilidades para Agentes

```bash
npm run doctor           # Diagnóstico del proyecto
npm run doctor:ci        # Diagnóstico en modo CI (exit code)
npm run mcp:setup        # Verificar/configurar servidores MCP
npm run mcp:install      # Instalar servidores MCP
npm run mcp:env          # Generar .env template
npm run setup            # Setup inicial para nuevos agentes
npm run setup:full       # Setup completo (instalar + pull)
npm run validate         # Validación completa pre-commit
npm run validate:quick   # Solo type-check + tests
npm run validate:fix     # Completa + auto-fix lint
npm run lock:status      # Verificar estado del lock
npm run lock:release     # Liberar lock
```

---

## 🧪 Testing para Agentes

### Estructura de Tests

```
tests/
├── setup/
│   └── vitest.ts        # Setup global (mocks Firebase)
├── mocks/
│   ├── firebase.ts      # Factories de datos mock
│   └── firestore.ts     # Mocks de Firestore
├── unit/
│   ├── services/        # tests/unit/services/*.test.ts
│   ├── stores/          # tests/unit/stores/*.test.ts
│   └── utils/           # tests/unit/utils/*.test.ts
├── integration/         # tests/integration/*.test.ts
└── e2e/                 # tests/e2e/*.spec.ts
```

### Reglas de Testing

1. **Tests centralizados** - Todo en `tests/`, nada en `src/__tests__/`
2. **Un archivo de test por módulo** - Misma estructura que `src/`
3. **3 escenarios por función**: éxito, error, edge case
4. **Sin React** - No usar React Testing Library ni jsdom
5. **Mockear Firebase** - Nunca llamar a Firebase real en unitarios
6. **Logging en tests** - Verificar que los logs se emiten correctamente

### Cobertura Mínima

| Tipo | Cobertura | Qué testear |
|------|-----------|-------------|
| Servicios | 100% funciones públicas | éxito, error, edge case |
| Stores | 100% acciones | set, clear, update, computed |
| Utilidades | 100% | múltiples inputs |
| Páginas Astro | 0% unitario | Se testean en E2E |

---

## 🧪 Agente de Testing Especializado

Para tareas específicas de testing, existe un rol especializado con su propia guía completa:

### Documentación del Agente de Testing
- **Ubicación:** `testing-agent/` (carpeta centralizada)
- **Archivos:**
  - `GUIDE.md` - Golden rules específicas, proceso profesional, estrategias
  - `CHECKLIST.md` - Checklist paso a paso para el agente
- **Propósito:** Golden rules específicas para testing, proceso profesional, estrategias para evitar falsos positivos y lograr alta cobertura

### Cuándo usar el Agente de Testing
- Crear tests unitarios para nuevos módulos
- Mejorar cobertura de tests existentes
- Investigar y reparar tests rotos
- Crear tests de integración para flujos complejos
- Crear tests E2E para flujos de usuario completos
- Refactorizar tests para mejorar calidad y mantenibilidad

### Golden Rules Específicas de Testing
El agente de testing debe seguir reglas adicionales a las generales:
- **AAA Pattern** - Arrange, Act, Assert en cada test
- **3 escenarios por función** - Éxito, error, edge case
- **Tests independientes** - No depender del orden de ejecución
- **Mocks controlados** - No mocks que siempre retornan éxito
- **Assertions significativas** - No pruebas triviales
- **Probar comportamiento, no implementación** - Evitar detalles internos
- **Cleanup consistente** - Limpiar mocks, spies, timers después de cada test

### Objetivos de Calidad del Agente de Testing
- **Cero falsos positivos** - Tests que pasan cuando deben fallar
- **Cero falsos negativos** - Tests que fallan cuando deben pasar
- **Alta cobertura significativa** - >80% statements, >75% branches
- **Tests rápidos** - Unitarios <100ms, integración <1s, E2E <10s
- **Tests mantenibles** - Fáciles de entender, modificar y extender

### Proceso del Agente de Testing
Ver `testing-agent/GUIDE.md` para el proceso completo paso a paso:
1. Análisis del código a testear
2. Preparación del ambiente (lock, pull, doctor)
3. Creación de tests siguiendo AAA pattern
4. Ejecución y validación (coverage, assertions)
5. Integración y validación completa
6. Commit y documentación

### Comandos Específicos del Agente de Testing
```bash
# Ejecutar tests específicos
npm test -- authService.test.ts

# Coverage con reporte detallado
npm run test:coverage -- --reporter=text

# Ver reporte HTML de coverage
open tests/coverage/index.html

# Tests E2E con UI para debugging
npm run test:e2e:ui
```

> **📌 Para más detalles:** Ver `testing-agent/GUIDE.md` - Guía completa del agente de testing

---

## 🌐 Agente de Language Especializado

Para tareas de internacionalización (i18n), existe un rol especializado con su propia guía completa:

### Documentación del Agente de Language
- **Ubicación:** `language-agent/` (carpeta centralizada)
- **Archivos:**
  - `GUIDE.md` - Arquitectura del sistema i18n, convenciones, flujo de trabajo
  - `CHECKLIST.md` - Checklist operativo paso a paso
  - `RULES.md` - Reglas específicas de cumplimiento i18n
  - `SCRIPTS.md` - Documentación de scripts de validación
- **Propósito:** Mantener sistema de traducciones ES/EN completo, detectar textos hardcodeados, eliminar duplicaciones, validar sincronización

### Cuándo usar el Agente de Language
- Añadir nuevas traducciones (ES/EN)
- Corregir textos hardcodeados que deberían usar `t()`
- Detectar y eliminar duplicaciones de traducciones
- Validar que todas las claves existen en ambos idiomas
- Generar reportes de estado del sistema i18n
- Refactorizar estructura de traducciones
- Sincronizar `client.ts` con `translations.ts`

### Golden Rules Específicas de Language Agent
El agente de language debe seguir reglas adicionales a las generales:
- **Cero textos hardcodeados** visibles al usuario
- **Cero claves faltantes** en cualquiera de los dos idiomas
- **Cero duplicación** de valores entre traducciones
- **100% sincronización** ES/EN
- **Convención de nomenclatura** consistente: `[ámbito].[subámbito].[clave]`
- **Sin duplicación de código** - `client.ts` importa de `translations.ts`, no duplica
- **Validación continua** - Ejecutar scripts después de cada cambio

### Objetivos de Calidad del Agente de Language
- **Cobertura total** - >100 claves de traducción en ES y EN
- **Sincronización perfecta** - Mismas claves en ambos idiomas
- **Sin hardcodeados** - 0 textos hardcodeados en páginas públicas
- **Sin duplicados innecesarios** - Valores únicos o consolidados
- **Performance** - Validación completa <5s

### Proceso del Agente de Language
Ver `language-agent/GUIDE.md` para el proceso completo paso a paso:
1. **Diagnóstico** - Ejecutar `npm run i18n:report` para estado actual
2. **Validación** - Ejecutar `npm run i18n:validate` para verificar claves
3. **Detección** - Ejecutar `npm run i18n:find-missing` para hardcodeados
4. **Análisis** - Revisar duplicados con `npm run i18n:dedup`
5. **Implementación** - Añadir traducciones, reemplazar hardcodeados
6. **Sincronización** - Ejecutar `npm run i18n:sync` para actualizar client.ts
7. **Verificación** - Validar todo y ejecutar tests

### Comandos Específicos del Agente de Language
```bash
# Diagnóstico completo
npm run i18n:report

# Validación de traducciones
npm run i18n:validate

# Búsqueda de textos hardcodeados
npm run i18n:find-missing

# Detección de duplicados
npm run i18n:dedup

# Sincronización de client.ts
npm run i18n:sync

# Auto-fix (sync + validate)
npm run i18n:fix
```

### Estructura del Sistema i18n
```
src/i18n/
├── types.ts              # Tipos compartidos (Language, TranslationMap, etc.)
├── translations.ts       # 📦 TODAS las traducciones (server + client)
├── client.ts             # 🌐 Cliente i18n (persistencia localStorage)
└── index.ts              # 📤 Barrel exports

scripts/
├── i18n-validate.sh      # ✅ Valida claves ES/EN
├── i18n-find-missing.sh  # 🔍 Busca hardcodeados
├── i18n-dedup.sh         # ♻️ Detecta duplicados
├── i18n-sync.sh          # 🔄 Sincroniza client.ts
└── i18n-report.sh        # 📊 Reporte completo
```

### Flujo de Datos i18n
```
Usuario selecciona idioma
        │
        ▼
  LanguageSwitcher.astro ───→ ?lang=es|en (URL param)
        │
        ▼
  getLanguage(urlLang) ───→ localStorage (persistencia)
        │
        ▼
  getT(urlLang) ───→ translations[lang][key] → string
        │
        ▼
  client.ts t(key) ───→ translations (sin duplicación)
```

> **📌 Para más detalles:** Ver `language-agent/GUIDE.md` - Guía completa del agente de language

---

## 🐙 Git Workflow Automatizado

### Convención de Commits

| Tipo | Uso |
|------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Refactorización |
| `docs:` | Documentación |
| `test:` | Tests |
| `chore:` | Mantenimiento |
| `merge:` | Merge de ramas |

### Flujo Estándar

```bash
# 1. Pull
git pull origin master --allow-unrelated-histories --no-edit

# 2. Cambios
git add -A

# 3. Commit
git commit -m "tipo: implementar X

- Detalle 1
- Detalle 2"

# 4. Push
git push origin master
```

### Resolución de Conflictos

```bash
# Si hay conflictos, resolver con nuestra versión:
git checkout --ours .
git add -A
git commit -m "merge: resolver conflictos con versión local"
git push origin master
```

---

## ⚙️ CI/CD Pipeline

El pipeline de GitHub Actions (`.github/workflows/ci.yml`) ejecuta:

1. **Quality Gate**: lint + type-check + tests
2. **Build**: Build de producción
3. **Deploy**: A Firebase Hosting (solo en `master`)

### Secrets Requeridos

| Secret | Propósito |
|--------|-----------|
| `FIREBASE_SERVICE_ACCOUNT` | Service account para deploy |
| `FIREBASE_API_KEY` | API Key de Firebase |
| `SENTRY_DSN` | DSN de Sentry |
| `POSTHOG_KEY` | API Key de PostHog |

---

## 🛡️ Seguridad y Límites

### Lo que NUNCA debe hacer un agente

1. ❌ **No exponer secrets** en código, commits o logs
2. ❌ **No modificar reglas de Firestore** sin revisión humana
3. ❌ **No eliminar datos de producción** sin confirmación
4. ❌ **No cambiar roles de usuario** sin autorización explícita
5. ❌ **No hacer deploy a producción** sin pasar CI/CD
6. ❌ **No modificar archivos de configuración** (`firebase.json`, `astro.config.mjs`) sin entender el impacto

### Límites de Operación

| Operación | Límite | Acción si se excede |
|-----------|--------|-------------------|
| Archivos modificados por commit | 10 | Hacer múltiples commits |
| Líneas por archivo | 300 | Refactorizar |
| Tests por archivo de test | 50 | Dividir en múltiples describes |
| Tiempo sin commit | 30 min | Hacer commit parcial |
| Lock de documentación | 30 min | Liberar lock stale |

---

## 🚀 initClientPage() — Inicialización de Páginas Cliente

### ¿Qué es?

`initClientPage()` es un módulo compartido en `src/lib/client/clientInit.ts` que centraliza la autenticación, verificación de rol y control de la pantalla de carga para todas las páginas de la sección cliente.

### ¿Por qué se creó?

Antes de este módulo, cada página de cliente duplicaba el patrón:
```astro
authService.onAuthChange(async (firebaseUser) => {
  // 1. Verificar firebaseUser
  // 2. getDoc(doc(db, 'users', uid))
  // 3. Verificar role
  // 4. setUser()
  // 5. Ocultar loading, mostrar contenido
});
```

Esto causaba:
| Problema | Impacto |
|----------|---------|
| **Múltiples listeners** | Cada página registraba su propio `onAuthStateChanged`, multiplicando conexiones |
| **Sin timeout** | Si Firebase estaba offline, el spinner se quedaba infinitamente |
| **Sin feedback visual** | Los errores solo se logueaban en consola, el usuario no veía nada |
| **Memory leaks** | Las suscripciones no se limpiaban correctamente al navegar (SPA) |

### API

```ts
import { initClientPage } from '@/lib/client/clientInit';

interface InitClientOptions {
  onReady: (firebaseUser: any, userData: any) => Promise<void> | void;
  onError?: (error: Error) => void;
  timeoutMs?: number; // default: 15000 (15s)
}

const cleanup = initClientPage({ onReady, onError, timeoutMs });
```

### Uso en página Astro

```astro
<ClientLayout>
  <div id="loadingScreen">
    <!-- Spinner / Skeleton -->
  </div>
  <div id="contenidoContent" class="hidden">
    <!-- Contenido real -->
  </div>
</ClientLayout>

<script>
  import { initClientPage } from '@/lib/client/clientInit';
  // ... otras imports

  let unsubService: (() => void) | null = null;

  const cleanupInit = initClientPage({
    onReady: async (firebaseUser, userData) => {
      // Ya no necesitas verificar auth, rol, ni setUser
      // ya lo hizo initClientPage

      // Tu lógica específica aquí
      unsubService = subscribeToService(firebaseUser.uid, callback);
    }
  });

  // Cleanup obligatorio
  document.addEventListener('astro:before-swap', () => {
    cleanupInit();
    unsubService?.();
  });
</script>
```

### Páginas que lo usan

| Página | Estado |
|--------|--------|
| `src/pages/client/dashboard.astro` | ✅ Refactorizado |
| `src/pages/client/workouts.astro` | ✅ Refactorizado |
| `src/pages/client/diets.astro` | ✅ Refactorizado |
| `src/pages/client/progress.astro` | ✅ Refactorizado |
| `src/pages/client/settings.astro` | ✅ Refactorizado |
| `src/pages/client/medical-profile.astro` | ✅ Refactorizado |
| `src/pages/client/chat.astro` | ✅ Ya tenía cleanup |
| `src/pages/client/support.astro` | ⚠️ Pendiente |

### Migración desde patrón anterior

1. Eliminar `authService.onAuthChange(...)` → Reemplazar por `initClientPage({ onReady: ... })`
2. Eliminar `getDoc`, role check y `setUser` duplicados (los hace `initClientPage`)
3. Almacenar referencias de limpieza de suscripciones (`let unsubX: (() => void) | null = null`)
4. Agregar cleanup en `astro:before-swap`
5. Opcional: agregar `onError` para manejo específico

---

## 🔍 Troubleshooting

### Error: `Firebase: Error (auth/operation-not-allowed)`
**Solución:** Habilitar Email/Password en Firebase Console.

### Error: `Missing or insufficient permissions`
**Solución:** Verificar reglas de seguridad de Firestore.

### Error: `Cannot find module '@astrojs/node'`
**Solución:** `npm install @astrojs/node`

### Error: `failed to push some refs`
**Solución:** `git pull origin master --allow-unrelated-histories --no-edit`

### Error: Lock stale
**Solución:** `bash scripts/agent-lock.sh release` (fuerza liberación si pasaron más de 30 min)

---

## 📌 Referencias

- `.clinerules` - Golden Rules del proyecto
- `AGENTS.md` - Instrucciones rápidas para agentes
- `CONTEXT.md` - Contexto comprimido del proyecto
- `TASK.md` - Tarea actual
- `TODO.md` - TODO centralizado
- `GIT_WORKFLOW.md` - Flujo de git detallado
- `nuevo_proyecto/00_indice.md` - Índice de documentación completa
- `testing-agent/GUIDE.md` - Guía del agente de testing
- `testing-agent/CHECKLIST.md` - Checklist del agente de testing

---

> **Última actualización:** 2026-07-25  
> **Mantenido por:** Equipo CampFit
