<<<<<<< HEAD
# CampFit - Sistema de Agentes Especializados
=======
# CampFit - Guía para Agentes IA

## 🚀 Comandos Rápidos

```bash
npm run build            # Build producción (8-10s)
npx vitest run           # Tests unitarios (388 tests, ~8s)
npx vitest run --reporter=verbose  # Tests con detalle
npx vitest run tests/unit/services/authService.test.ts  # Test específico
npm run dev              # Dev server
```

## 🔥 Deploy (Firebase)

```bash
npm run build                                    # Build local
npx firebase deploy --only firestore:rules,hosting # Deploy
npx firebase deploy --only hosting              # Solo hosting
npx firebase deploy --only firestore:rules      # Solo reglas
```

**Proyecto:** `mallorca-campfit`  
**URL:** https://mallorca-campfit.web.app

## 🧪 Testing Rápido para Agentes Paralelos

### Regla #1: NO ejecutes la suite completa salvo que sea necesario

Usa test targeting en su lugar:

```bash
# Después de cambiar un servicio
npx vitest run tests/unit/services/authService.test.ts

# Después de cambiar un store
npx vitest run tests/unit/stores/authStore.test.ts

# Después de cambiar utilidades i18n
npx vitest run tests/unit/utils/translations.test.ts tests/unit/i18n/
```

### Regla #2: Tests por módulo (~2-5s cada uno)

| Módulo | Comando | Tests |
|--------|---------|-------|
| Auth Service | `npx vitest run tests/unit/services/authService.test.ts` | 16 |
| Admin Service | `npx vitest run tests/unit/services/adminService.test.ts` | 14 |
| Profile Service | `npx vitest run tests/unit/services/profileService.test.ts` | 10 |
| Auth Store | `npx vitest run tests/unit/stores/authStore.test.ts` | 16 |
| Theme Store | `npx vitest run tests/unit/stores/themeStore.test.ts` | 25 |
| Admin Utils | `npx vitest run tests/unit/lib/admin/adminUtils.test.ts` | 38 |
| Trainer Utils | `npx vitest run tests/unit/lib/trainer/trainerUtils.test.ts` | 19 |
| Chat Service | `npx vitest run tests/unit/lib/client/chatService.test.ts` | 12 |
| Diet Service | `npx vitest run tests/unit/lib/client/dietService.test.ts` | 21 |
| i18n/Translations | `npx vitest run tests/unit/utils/translations.test.ts` | 4 |
| Validators | `npx vitest run tests/unit/utils/validators.test.ts` | 17 |
| UI/shared | `npx vitest run tests/unit/lib/shared/ui.test.ts` | 35 |
| i18n/shared | `npx vitest run tests/unit/lib/shared/i18n.test.ts` | 22 |

### Regla #3: Verificación pre-commit (rápida, <15s)

```bash
npx vitest run tests/unit/services/ tests/unit/stores/ tests/unit/utils/ && npm run build
```

### Regla #4: Build check (siempre hacerlo)

```bash
npm run build
# Debe salir: "✓ Completed" sin errores
# Build exitoso genera /dist con todas las rutas
```

### Regla #5: Tags en mensajes de commit

Usa estos prefixes para que otros agentes sepan qué cambió:
- `[auth]` - Cambios en autenticación
- `[admin]` - Panel admin
- `[client]` - Panel cliente
- `[trainer]` - Panel entrenador
- `[theme]` - Sistema de tema
- `[i18n]` - Traducciones
- `[test]` - Tests
- `[docs]` - Documentación
- `[ci]` - CI/CD, deploy
- `[refactor]` - Refactorización

## 🎨 Sistema de Tema (CRÍTICO)

**NUNCA uses clases de color hardcodeadas de Tailwind.** Usa siempre las clases semánticas:

| Clase | Uso |
|-------|-----|
| `theme-surface` / `theme-surface-secondary` | Cards, paneles |
| `theme-bg-primary` / `theme-bg-secondary` | Fondos |
| `theme-text-primary` / `theme-text-secondary` | Texto |
| `theme-border` / `theme-border-strong` | Bordes |
| `theme-brand` | Botones principales |

### Verificación de tema:
```bash
npm run theme:validate   # Valida tokens (100% = OK)
```

## ⚠️ Conflictos entre Agentes

Si haces `git pull` y hay conflictos:

1. **NO hagas `git rebase`** si hay múltiples agentes tocando los mismos archivos
2. Usa `git merge origin/master` en su lugar
3. Resuelve conflictos con:
   ```bash
   git mergetool   # Si tienes herramienta configurada
   # O manualmente: editar archivos, luego:
   git add <archivo-resuelto>
   git commit -m "merge: resolver conflictos con origin/master"
   ```

## 📋 Estado Actual del Proyecto

- **Tests:** 26/26 files, 388/388 tests ✅
- **Build:** 31 rutas generadas ✅
- **Deploy:** Firebase `mallorca-campfit` (rules + hosting) ✅
- **Docs:** Documentación completa en `docs/` (MASTER.md + 10 módulos)
- **TODO:** 22/22 tareas completadas (100%)
- **Pendiente multi-agente:** Ver `docs/10_todo_y_problemas.md` sección 2

### Archivos clave:
- `docs/MASTER.md` - Documentación maestra
- `TODO.md` - TODO centralizado (fuente única de verdad)
- `docs/10_todo_y_problemas.md` - Checklist multi-agente
- `src/lib/firebase.ts` - Config Firebase
- `.env.example` - Variables de entorno (copiar a `.env`)
- `src/styles/theme.css` - Tokens del tema
- `src/stores/themeStore.ts` - Estado reactivo del tema
- `src/components/ThemeToggle.astro` - Botón toggle tema

## Development
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a

> **Este archivo es el punto de entrada para agentes IA.**

---

## Sistema de Agentes

CampFit tiene un sistema de **9 agentes especializados** con roles fijos, cada uno con su propio contexto, reglas, checklist y backlog de tareas.

### 🎯 Registro Maestro
**`agents/__master.md`** — LEER PRIMERO. Contiene:
- Lista completa de todos los agentes disponibles
- Cómo delegar tareas entre agentes
- Estado general del proyecto
- Estructura del sistema

### 👤 Agentes Disponibles

| # | Agente | Área | Directorio |
|---|--------|------|------------|
| 1 | **Planner** | Coordinación, roadmap | `agents/planner-agent/` |
| 2 | **Theme** | UI/UX, Design System | `agents/theme-agent/` |
| 3 | **Language** | i18n, traducciones ES/EN | `language-agent/` |
| 4 | **Testing** | Tests, cobertura | `testing-agent/` |
| 5 | **Client** | Módulo cliente | `agents/client-agent/` |
| 6 | **Admin** | Módulo admin | `agents/admin-agent/` |
| 7 | **Trainer** | Módulo trainer | `agents/trainer-agent/` |
| 8 | **Auth** | Autenticación, roles | `agents/auth-agent/` |
| 9 | **Infra** | Firebase, scripts, CI/CD | `agents/infra-agent/` |

### 📋 Quick Start para Agentes

```bash
# 1. Leer registro maestro
cat agents/__master.md

# 2. Leer guía de tu rol
cat agents/[tu-rol]/GUIDE.md

# 3. Revisar tareas pendientes
cat agents/[tu-rol]/TASKS.md
```

<<<<<<< HEAD
### 📚 Documentación de Referencia
- `AGENTS_GUIDE.md` — Guía completa del harness
- `CONTEXT.md` — Contexto del proyecto
- `TODO.md` — TODO centralizado
- `.clinerules` — Golden Rules
- `GIT_WORKFLOW.md` — Flujo de git
=======
Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
