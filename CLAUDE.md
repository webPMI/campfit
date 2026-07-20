# CampFit - Claude Instructions

## Stack
- **Framework:** Astro 7 (SSR con `@astrojs/node`)
- **UI:** Vanilla JS (sin React)
- **Estilos:** Tailwind CSS 4 (dark mode)
- **Estado:** Nanostores
- **DB:** Cloud Firestore (NoSQL)
- **Testing:** Vitest + Playwright

## Golden Rules
1. ❌ No usar `any` - Siempre tipar explícitamente
2. ❌ No lógica de negocio en UI - Solo renderizan
3. ❌ No hardcodear URLs/keys - Usar `import.meta.env`
4. ❌ No ignorar estados - loading, empty, error, success
5. ❌ No Firebase Client SDK para ops sensibles - Usar API Routes
6. ✅ Tipar todo - Props, returns, variables, eventos
7. ✅ 4 estados por página - loading → empty → error → success
8. ✅ Tests unitarios - Mínimo 1 test por función pública
9. ✅ JSDoc en funciones públicas - @param y @returns
10. ✅ Componentes atómicos - Una responsabilidad

## Before Coding
1. Read `CONTEXT.md` for project context
2. Read `TASK.md` for current task
3. Read `.clinerules` for complete rules
4. Check lock: `bash scripts/agent-lock.sh check`
5. Pull latest: `git pull origin master --allow-unrelated-histories --no-edit`

## Before Commit
```bash
bash scripts/validate.sh
```

## Commands
```bash
npm run dev              # Dev server
npm test                 # Unit tests
npm run test:e2e         # E2E tests
npm run type-check       # TypeScript check
npm run build            # Build producción
npm run context          # Project context
```

## Documentation
- `nuevo_proyecto/00_indice.md` - Full index
- `AGENTS_GUIDE.md` - Complete agent guide
- `GIT_WORKFLOW.md` - Git workflow
- `TODO.md` - Pending tasks
