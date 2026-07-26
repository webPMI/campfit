# CampFit - Agent Instructions

## Development
When starting the dev server, use background mode:
```
astro dev --background
```
Manage with: `astro dev stop`, `astro dev status`, `astro dev logs`

## Quick Start for Agents
1. Read `CONTEXT.md` - Project context
2. Read `TASK.md` - Current task
3. Read `.clinerules` - Golden Rules
4. Read `AGENTS_GUIDE.md` - Complete agent guide

## Before Making Changes
```bash
bash scripts/agent-lock.sh check  # Check if another agent is working
git pull origin master --allow-unrelated-histories --no-edit
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
