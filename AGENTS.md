# CampFit - Sistema de Agentes Especializados

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

### 📚 Documentación de Referencia
- `AGENTS_GUIDE.md` — Guía completa del harness
- `CONTEXT.md` — Contexto del proyecto
- `TODO.md` — TODO centralizado
- `.clinerules` — Golden Rules
- `GIT_WORKFLOW.md` — Flujo de git
