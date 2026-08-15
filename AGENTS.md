# CampFit - Agent Instructions

## 🚨 CRITICAL: Read Before Any Code Change

**MANDATORY reading order before modifying ANY source file:**
1. `docs/FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md` — Lista de funcionalidades que NUNCA deben eliminarse
2. `docs/MATRIZ_FIRESTORE_QUERIES_Y_REGLAS.md` — Matriz Maestra de Consultas, Permisos y Reglas Firestore (MANDATORIA)
3. `docs/AGENT_ROLES.md` — Definición de roles de agentes
4. `.clinerules` — Golden Rules (especialmente reglas 11-25: Anti-Regression y Firestore Matrix)
5. `CONTEXT.md` — Project context
6. `TASK.md` — Current task (Registro obligatorio antes de comenzar)

### 🛡️ Anti-Deletion Rules (STRICT ENFORCEMENT)

**NEVER delete the following without explicit user approval:**
- Firestore query clauses (`where`, `orderBy`, `limit`) — each exists for a business/performance reason
- Security validations (`isStaff`, `isAdmin`, `isTrainer`, `isBlocked`, `isBootstrapAdminEmail`)
- Ownership checks (`trainerId == request.auth.uid`)
- `serverTimestamp()` in `createdAt`/`updatedAt`
- Error handling (`showToast`, `logger.error`)
- Subscription cleanup (`unsubClients?.()`, `unsubDiets?.()`)
- Strict union types (`type: 'normal' | 'advanced'` NOT `type: string`)
- Critical optional fields (`allergens?: string[]`)
- i18n translation keys
- Validation functions (`isValidEmail`, `isValidPassword`)

**If you detect "duplicate" or "unnecessary" code, ASK FIRST. Better safe than sorry.**

**Add inline comments `// 🔒 CRÍTICO: ...` to sensitive code to warn future agents.**

## Development
When starting the dev server, use background mode:
```
astro dev --background
```
Manage with: `astro dev stop`, `astro dev status`, `astro dev logs`

## Quick Start for Agents
1. Read `docs/FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md` — Critical functionalities (MANDATORY)
2. Read `docs/AGENT_ROLES.md` — Understand your specific role
3. Read `CONTEXT.md` - Project context
4. **Registrar de inmediato al agente en `TASK.md`** con:
   - Nombre: `Antigravity Agent [ID/Nombre]`
   - Fecha y hora exacta: `YYYY-MM-DD HH:mm:ss`
   - Problema / Objetivo en resolución
   - Lista de archivos que modificará
   - Estado: `[EN PROGRESO]`
5. Read `.clinerules` - Golden Rules
6. Read `AGENTS_GUIDE.md` - Complete agent guide

## Before Making Changes
```bash
# 1. Registrar tu agente en TASK.md (MANDATORIO)
# 2. Verificar locks
bash scripts/agent-lock.sh check  # Check if another agent is working
git pull origin master --allow-unrelated-histories --no-edit
```

### After Making Changes (MANDATORY)
```bash
git diff -- src/lib/          # Verify no query clauses/imports/logic were deleted
git diff -- firestore.rules    # Verify security rules weren't weakened
npm run type-check             # TypeScript check
npm test                       # Unit tests
```

## Before Commit
```bash
bash scripts/validate.sh  # TypeScript + Tests + Lint + Build
```

## Commands
```bash
npm run dev              # Dev server
npm test                 # Unit tests
npm run test:e2e         # E2E tests
npm run type-check       # TypeScript check
npm run build            # Build producción
npm run context          # Project context check
npm run doctor           # Project diagnostics
npm run mcp:setup        # MCP server setup
npm run setup            # Initial setup for new agents
npm run lock:status      # Check agent lock status
```

## i18n & Static Build Architecture Rules
1. **No query param hardcoding**: NEVER hardcode `?lang=${lang}` in static `<a href="...">` links inside layouts/pages. In SSG mode (`output: 'static'`), this bakes `?lang=es` into built HTML and overwrites the user's `localStorage` language selection upon navigation.
2. **Clean URLs for internal navigation**: Use clean routes (e.g. `href="/client/workouts"`). The stored language in `localStorage` (`campfit_lang`) and `cookie` (`cf_lang`) persists automatically across page transitions.
3. **Client-side translation**: Place `data-i18n="key.name"` attributes on HTML elements that need client-side translation in SSG pages. `translateDOM()` in `BaseLayout` will auto-hydrate texts when `lang === 'en'`.

## Documentation
Full documentation: https://docs.astro.build
Project docs: `nuevo_proyecto/00_indice.md`

Consult these guides before working on related tasks:
- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
