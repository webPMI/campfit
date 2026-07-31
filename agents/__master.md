# 🎯 CampFit - Sistema de Agentes Especializados

> **Registro maestro de agentes IA.** Última actualización: 2026-07-30
> 
> Cada agente tiene un rol fijo con contexto, reglas, checklist y backlog de tareas.
> Un agente nuevo debe leer **este archivo primero** para saber qué rol es y a quién delegar.

---

## 📋 Agentes Disponibles

| # | Agente | Área | Estado | Prioridad Actual |
|---|--------|------|--------|-----------------|
| 1 | **Planner** | Coordinación, roadmap, planificación | 🟢 Activo | Revisar backlog general |
| 2 | **Theme** | Design System, UI, Tailwind, componentes visuales | 🟢 Activo | Normalizar iconos SVG (#12) |
| 3 | **Language** | i18n, traducciones ES/EN | 🟢 Activo | Añadir ~38 claves onboarding EN |
| 4 | **Testing** | Tests unitarios, integración, E2E, cobertura | 🟢 Activo | Cubrir adminUtils, trainerUtils |
| 5 | **Client** | Módulo cliente (workouts, diets, progress, chat) | 🟢 Activo | Tests E2E flujo cliente |
| 6 | **Admin** | Módulo admin (usuarios, roles, suscripciones) | 🟢 Activo | Tests unitarios adminUtils (18%) |
| 7 | **Trainer** | Módulo trainer (clientes, rutinas, dietas) | 🟢 Activo | Tests unitarios trainerUtils (0%) |
| 8 | **Auth** | Autenticación, roles, guardias, sesiones | 🟢 Activo | AuthError type (#13) |
| 9 | **Infra** | Firebase, Firestore, R2, CI/CD, scripts, config | 🟢 Activo | Instalar ESLint (INFRA-001) |
| 10 | **Mobile** | PWA, Capacitor, Service Worker, app móvil | 🟢 Activo | Verificar PWA en producción (MOBILE-001) |

---

## 🚀 Cómo usar este sistema

### Si eres un agente nuevo:

```bash
# 1. Lee este archivo para saber qué rol eres
cat agents/__master.md

# 2. Lee el GUIDE de tu rol
cat agents/[tu-rol]/GUIDE.md

# 3. Revisa tu CHECKLIST y TASKS
cat agents/[tu-rol]/CHECKLIST.md
cat agents/[tu-rol]/TASKS.md

# 4. Diagnóstico rápido del proyecto
npm run doctor
```

### Si necesitas delegar a otro agente:

| Necesitas... | Llama al agente | Directorio |
|-------------|-----------------|------------|
| Añadir/arreglar traducciones | `language-agent` | `language-agent/` |
| Crear/mejorar tests | `testing-agent` | `testing-agent/` |
| Diseño UI, colores, componentes | `theme-agent` | `agents/theme-agent/` |
| Feature del módulo cliente | `client-agent` | `agents/client-agent/` |
| Feature del módulo admin | `admin-agent` | `agents/admin-agent/` |
| Feature del módulo trainer | `trainer-agent` | `agents/trainer-agent/` |
| Cambios en auth/login/roles | `auth-agent` | `agents/auth-agent/` |
| Scripts, CI/CD, Firebase, config | `infra-agent` | `agents/infra-agent/` |
| PWA, Capacitor, app móvil | `mobile-agent` | `agents/mobile-agent/` |
| Coordinar tareas, roadmap | `planner-agent` | `agents/planner-agent/` |

---

## 📊 Estado General del Proyecto

| Métrica | Valor |
|---------|-------|
| Tests totales | ~290+ |
| Cobertura statements | ~22.62% |
| Cobertura branches | ~81.66% |
| Claves i18n ES | ~165-170 |
| Claves i18n EN | ~130 |
| Archivos src/ | ~65+ |
| Archivos test/ | 32 |

---

## 🔗 Referencias Rápidas

- `AGENTS_GUIDE.md` - Guía completa del harness para agentes
- `CONTEXT.md` - Contexto comprimido del proyecto
- `TODO.md` - TODO centralizado del proyecto
- `TASK.md` - Tarea actual (si está definida)
- `.clinerules` - Golden Rules del proyecto
- `GIT_WORKFLOW.md` - Flujo de git

---

## 📁 Estructura de agents/

```
agents/
├── __master.md             # 👈 ESTE ARCHIVO (registro maestro)
├── planner-agent/          # Coordinación y roadmap
│   ├── GUIDE.md
│   ├── RULES.md
│   ├── CHECKLIST.md
│   └── TASKS.md
├── theme-agent/            # UI/UX, Design System
│   ├── GUIDE.md
│   ├── RULES.md
│   ├── CHECKLIST.md
│   └── TASKS.md
├── client-agent/           # Módulo cliente
│   ├── GUIDE.md
│   ├── RULES.md
│   ├── CHECKLIST.md
│   └── TASKS.md
├── admin-agent/            # Módulo admin
│   ├── GUIDE.md
│   ├── RULES.md
│   ├── CHECKLIST.md
│   └── TASKS.md
├── trainer-agent/          # Módulo trainer
│   ├── GUIDE.md
│   ├── RULES.md
│   ├── CHECKLIST.md
│   └── TASKS.md
├── auth-agent/             # Autenticación
│   ├── GUIDE.md
│   ├── RULES.md
│   ├── CHECKLIST.md
│   └── TASKS.md
├── mobile-agent/           # PWA, Capacitor, app móvil
│   ├── GUIDE.md
│   ├── RULES.md
│   ├── CHECKLIST.md
│   └── TASKS.md
└── infra-agent/            # Firebase, scripts, CI/CD
    ├── GUIDE.md
    ├── RULES.md
    ├── CHECKLIST.md
    └── TASKS.md
```

> **Nota:** `language-agent/` y `testing-agent/` están en la raíz del proyecto (por ahora). Los agentes nuevos se crean dentro de `agents/`.

---

> **Mantenido por:** Equipo CampFit  
> **Versión:** 1.1 - Sistema de Agentes Especializados