# 🤖 CampFit AI Agents Guide

> **Guía completa para que agentes de IA trabajen de forma autónoma, segura y optimizada en el proyecto CampFit.**

---

## 📋 Índice

1. [Arquitectura del Harness](#-arquitectura-del-harness)
2. [Configuración MCP](#-configuración-mcp)
3. [Contexto del Proyecto](#-contexto-del-proyecto)
4. [Flujo de Trabajo para Agentes](#-flujo-de-trabajo-para-agentes)
5. [Comandos Disponibles](#-comandos-disponibles)
6. [Testing para Agentes](#-testing-para-agentes)
7. [Git Workflow Automatizado](#-git-workflow-automatizado)
8. [CI/CD Pipeline](#-cicd-pipeline)
9. [Seguridad y Límites](#-seguridad-y-límites)
10. [Troubleshooting](#-troubleshooting)

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
│   ├── check-context.sh     # Verificador de contexto
│   └── validate.sh          # Validación pre-commit
├── tests/                   # Tests centralizados
│   ├── setup/
│   ├── mocks/
│   ├── unit/
│   ├── integration/
│   └── e2e/
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

### Configuración Local

Los servidores MCP se configuran en el IDE (VS Code / Cursor / Windsurf):

```json
{
  "mcpServers": {
    "firebase-mcp": {
      "command": "npx",
      "args": ["@firebase-mcp/server"],
      "env": {
        "FIREBASE_PROJECT_ID": "mallorca-campfit",
        "FIREBASE_CLIENT_EMAIL": "...",
        "FIREBASE_PRIVATE_KEY": "..."
      }
    },
    "github-mcp": {
      "command": "npx",
      "args": ["@github-mcp/server"],
      "env": {
        "GITHUB_TOKEN": "ghp_..."
      }
    }
  }
}
```

### Buenas Prácticas MCP

1. **Usar Firebase MCP solo para operaciones seguras** (lecturas, writes simples)
2. **Operaciones sensibles** (cambiar roles, eliminar usuarios) → API Routes de Astro
3. **No exponer secrets** en el código - siempre usar variables de entorno
4. **Preferir queries con filtro** sobre colecciones completas

---

## 📚 Contexto del Proyecto

### Stack Resumido

| Capa | Tecnología |
|------|-----------|
| Framework | Astro 7 (SSR con `@astrojs/node`) |
| UI | Vanilla JS (sin React) |
| Estilos | Tailwind CSS 4 (dark mode) |
| Estado | Nanostores |
| DB | Cloud Firestore (NoSQL) |
| Storage | Cloudflare R2 |
| Testing | Vitest + Playwright |
| Mobile | Capacitor 6 |

### Estructura de Directorios (src/)

```
src/
├── components/     # Componentes .astro
├── layouts/        # Layouts por rol
├── pages/          # Páginas y API routes
│   ├── admin/      # Panel admin
│   ├── client/     # Panel cliente
│   └── trainer/    # Panel entrenador
├── lib/
│   ├── shared/     # Código compartido (UI, chat, logger, authGuard, i18n)
│   ├── admin/      # Módulo admin (modularizado)
│   │   ├── types.ts              # AdminUser, CreateUserPayload
│   │   ├── adminAuth.ts          # requireAdmin, signOutUser
│   │   ├── adminUsers.ts         # CRUD usuarios
│   │   ├── adminSubscriptions.ts # Suscripciones Firestore
│   │   ├── adminRender.ts        # Renderizado HTML
│   │   ├── adminInit.ts          # initGlobalActions
│   │   └── adminUtils.ts         # Barrel (re-export)
│   ├── trainer/   # Módulo trainer (modularizado)
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
│   ├── client/     # Servicios del lado cliente
│   ├── helpers/    # Utilidades puras
│   └── firebase/   # Wrappers de Firebase para testing
├── services/       # Servicios Firebase (auth, admin)
├── stores/         # Nanostores (auth)
├── types/          # Tipos TypeScript
└── i18n/           # Internacionalización ES/EN
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
npm run astro check
npm test
```

### 2. Antes de Modificar Código

```bash
# 1. Verificar que no hay otro agente trabajando
ls scripts/.agent-lock 2>/dev/null && echo "LOCKED" || echo "FREE"

# 2. Si está libre, crear lock
echo "agent-$(whoami):$(date +%s):$(cat TASK.md | head -1)" > scripts/.agent-lock

# 3. Hacer pull de últimos cambios
git pull origin master --allow-unrelated-histories --no-edit
```

### 3. Durante la Implementación

1. **Seguir las GOLDEN RULES** (ver `.clinerules`)
2. **Un cambio a la vez** - commit por cada cambio atómico
3. **Tests primero** para funciones nuevas
4. **JSDoc** en todas las funciones públicas
5. **No archivos > 300 líneas** - refactorizar si es necesario

### 4. Validación Pre-commit

```bash
# Ejecutar validación completa
bash scripts/validate.sh

# O manualmente:
npm run astro check    # TypeScript check
npm test               # Tests unitarios
npm run lint           # ESLint
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
rm scripts/.agent-lock
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
npm run astro check      # TypeScript check
npm run lint             # ESLint
npm run format           # Prettier
```

### Utilidades

```bash
bash scripts/validate.sh     # Validación completa pre-commit
bash scripts/check-context.sh # Verificar contexto del proyecto
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
4. **Sin React** - No usar React Testing Library
5. **Mockear Firebase** - Nunca llamar a Firebase real en unitarios

### Cobertura Mínima

| Tipo | Cobertura | Qué testear |
|------|-----------|-------------|
| Servicios | 100% funciones públicas | éxito, error, edge case |
| Stores | 100% acciones | set, clear, update, computed |
| Utilidades | 100% | múltiples inputs |
| Páginas Astro | 0% unitario | Se testean en E2E |

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
git commit -m "feat: implementar X

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
**Solución:** `rm scripts/.agent-lock` (si pasaron más de 30 min)

---

## 📌 Referencias

- `.clinerules` - Golden Rules del proyecto
- `AGENTS.md` - Instrucciones rápidas para agentes
- `CONTEXT.md` - Contexto comprimido del proyecto
- `TASK.md` - Tarea actual
- `TODO.md` - TODO centralizado
- `GIT_WORKFLOW.md` - Flujo de git detallado
- `nuevo_proyecto/00_indice.md` - Índice de documentación completa

---

> **Última actualización:** 2026-07-20  
> **Mantenido por:** Equipo CampFit
