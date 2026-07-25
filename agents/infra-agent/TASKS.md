# 📋 Infra Agent — Backlog de Tareas

> Backlog priorizado para infraestructura. Actualizado: 2026-07-25

---

## 🔴 Prioridad Alta

### INFRA-001: Instalar ESLint y plugins
- **Descripción:** ESLint no está en package.json. Instalar `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-astro`
- **Archivos afectados:** `package.json`, `.eslintrc.cjs`
- **Criterios:** `npm run lint` funciona sin errores

### INFRA-002: Arreglar script test:ci
- **Descripción:** `test:ci` ejecuta Playwright sin servidor. Añadir `start` script o usar el webServer de playwright.config.ts
- **Archivos afectados:** `package.json` (script test:ci)
- **Criterios:** `npm run test:ci` funciona localmente

---

## 🟡 Prioridad Media

### INFRA-003: Actualizar .clinerules (Astro 5 → Astro 7)
- **Archivos afectados:** `.clinerules`
- **Criterios:** Stack correcto: Astro 7, no Astro 5

### INFRA-004: Completar .env.example
- **Añadir:** `ASTRO_SITE`, `ASTRO_BASE_URL`, `PUBLIC_API_URL`, `SENTRY_DSN`, `POSTHOG_KEY`
- **Archivos afectados:** `.env.example`

### INFRA-005: Endurecer firestore.rules
- **Descripción:** Reemplazar reglas "if true" temporales por reglas basadas en roles
- **Archivos afectados:** `firestore.rules`
- **Criterios:** Solo usuarios autenticados pueden leer/escribir según su rol

---

## 🟢 Prioridad Baja

### INFRA-006: Revisar scripts .sh
- **Descripción:** Verificar que agent-lock.sh, validate.sh, doctor.sh, etc. funcionan correctamente

### INFRA-007: Verificar CI/CD pipeline
- **Descripción:** Revisar .github/workflows/ci.yml para asegurar que deploy funciona

### INFRA-008: Verificar .mcp.json
- **Descripción:** Confirmar que los 3 MCP servers (firebase, github, filesystem) están bien configurados

---

> **Ver también:** `TODO.md` para contexto global