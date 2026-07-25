# 🛠️ Infra Agent Guide

> **Guía para el Agente de Infraestructura IA** — Configuración, scripts, CI/CD y Firebase en CampFit.

---

## 🎯 Rol y Responsabilidades

**Rol:** Encargado de infraestructura, configuración, scripts, CI/CD, Firebase y calidad del proyecto.

**Responsabilidades:**
- Mantener archivos de configuración (package.json, tsconfig, astro.config, ESLint, Prettier)
- Gestionar Firebase (firebase.json, firestore.rules, firestore.indexes.json)
- Desarrollar y mantener scripts de automatización (scripts/*.sh)
- Configurar y mantener CI/CD (GitHub Actions)
- Asegurar que las configuraciones de testing funcionan (Vitest, Playwright)
- Gestionar servidores MCP (.mcp.json)
- Mantener .env.example actualizado

---

## 📁 Archivos Bajo su Responsabilidad

| Archivo | Propósito |
|---------|-----------|
| `package.json` | Dependencias y scripts |
| `tsconfig.json` | TypeScript config |
| `astro.config.mjs` | Astro config |
| `.eslintrc.cjs` | Linting rules |
| `.prettierrc` | Formato |
| `.gitignore` | Ignorados |
| `.mcp.json` | MCP servers |
| `.env.example` | Variables de entorno |
| `firebase.json` | Firebase hosting/firestore |
| `firestore.rules` | Reglas de seguridad |
| `firestore.indexes.json` | Índices compuestos |
| `.firebaserc` | Proyecto Firebase |
| `.github/workflows/ci.yml` | CI/CD pipeline |
| `vitest.config.ts` | Vitest config |
| `playwright.config.ts` | Playwright config |
| `scripts/*.sh` | Scripts de automatización |

---

## 🚨 Problemas Conocidos

| ID | Problema | Prioridad |
|----|----------|-----------|
| INFRA-001 | ESLint no instalado en package.json | 🔴 Alta |
| INFRA-002 | test:ci roto (Playwright sin servidor) | 🔴 Alta |
| INFRA-003 | .clinerules dice Astro 5 (debe ser 7) | 🟡 Media |
| INFRA-004 | .env.example incompleto | 🟡 Media |
| INFRA-005 | firestore.rules permisivo ("if true") | 🟡 Media |
| INFRA-006 | Scripts .sh sin test automático | 🟢 Baja |

---

## 🔄 Flujo de Trabajo

```bash
# Diagnóstico
npm run doctor
cat agents/__master.md
cat agents/infra-agent/TASKS.md

# Desarrollo
# 1. Implementar cambios en config
# 2. npm run type-check
# 3. npm test
# 4. npm run build
# 5. Commit
```

---

> **Stack:** Astro 7, Firebase 11, Vitest 3, Playwright 1.61, Tailwind CSS 4  
> **Proyecto Firebase:** mallorca-campfit  
> **Última actualización:** 2026-07-25