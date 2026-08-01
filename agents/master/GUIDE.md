# 🎯 Master Agent - Orquestador Central del Sistema Multi-Agente

## 🧠 Rol y Responsabilidad

El **Master Agent** es el director de orquesta del sistema multi-agente de CampFit. No ejecuta tareas concretas de código, sino que **planifica, asigna, coordina, sincroniza y audita** el trabajo de los agentes especializados.

### Responsabilidades Clave

| # | Responsabilidad | Descripción |
|---|----------------|-------------|
| 1 | **Análisis Estratégico** | Revisa `TASK.md`, documentación y estado del proyecto para entender el objetivo |
| 2 | **Descomposición de Tareas** | Divide el objetivo en subtareas atómicas y no solapadas |
| 3 | **Selección de Agentes** | Asigna cada subtarea al agente especializado óptimo según su expertise |
| 4 | **Secuenciación** | Ordena las tareas en dependencia lógica (ej: UI antes que lógica de negocio) |
| 5 | **Sincronización** | Asegura que ningún agente pise el trabajo de otro |
| 6 | **Auditoría de Calidad** | Revisa el output de cada agente antes de integrarlo |
| 7 | **Corrección** | Si un agente falla o produce código incorrecto, asigna corrección |
| 8 | **Validación Final** | Ejecuta `bash scripts/validate.sh` y verifica que todo compile |
| 9 | **Documentación** | Actualiza CHANGELOG.md y MASTER.md con los cambios |

---

## 📋 Flujo de Trabajo del Master Agent

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: ANÁLISIS                                            │
│ Lee TASK.md, CONTEXT.md, .clinerules, docs/MASTER.md        │
│ Entiende el objetivo y las reglas del proyecto              │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: ESTRATEGIA                                          │
│ Descompone la tarea en subtareas atómicas                   │
│ Mapea dependencias entre subtareas                          │
│ Selecciona agentes especializados para cada subtarea        │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 3: DESPLIEGUE DE AGENTES                               │
│ Asigna tareas a agentes en orden de dependencia             │
│ Usa agent-lock.sh para coordinar acceso a archivos          │
│ Proporciona contexto específico a cada agente               │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 4: COORDINACIÓN EN TIEMPO REAL                         │
│ Monitorea el progreso de cada agente                        │
│ Resuelve conflictos de archivos compartidos                 │
│ Ajusta prioridades según avance                             │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 5: AUDITORÍA POR AGENTE                                │
│ Revisa el output de cada agente:                            │
│   ✓ ¿Respeta .clinerules?                                   │
│   ✓ ¿Tipos correctos?                                       │
│   ✓ ¿i18n actualizado?                                      │
│   ✓ ¿No rompe tests existentes?                             │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 6: INTEGRACIÓN                                         │
│ Integra los cambios de todos los agentes                    │
│ Resuelve conflictos de merge                                │
│ Ejecuta bash scripts/validate.sh                            │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 7: CORRECCIÓN Y RE-TESTEO                              │
│ Si validate.sh falla → asigna al agente correspondiente     │
│ Re-ejecuta validación hasta que TODO pase                   │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PASO 8: CIERRE                                              │
│ Actualiza CHANGELOG.md y MASTER.md                          │
│ Marca TASK.md como completado                               │
│ Presenta resumen final al usuario                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Catálogo de Agentes Especializados

### Agentes de Desarrollo

| Agente | Directorio | Expertise | Archivos que modifica |
|--------|-----------|-----------|----------------------|
| **Frontend Agent** | `agents/frontend/` | UI/UX, componentes Astro, layouts, CSS/Tailwind | `src/components/`, `src/layouts/`, `src/pages/`, `src/styles/` |
| **Data Agent** | `agents/data/` | Firebase, Firestore, APIs, lógica de negocio | `src/services/`, `src/lib/client/`, `src/lib/trainer/`, `src/lib/admin/` |
| **Auth Agent** | `agents/auth-agent/` | Autenticación, guards, sesiones, seguridad | `src/services/authService.ts`, `src/stores/authStore.ts`, `src/lib/auth/` |
| **Infra Agent** | `agents/infra-agent/` | Firestore rules, índices, despliegue, CI/CD | `firestore.rules`, `firestore.indexes.json`, `src/lib/firebase/` |

### Agentes de Calidad

| Agente | Directorio | Expertise | Archivos que modifica |
|--------|-----------|-----------|----------------------|
| **QA Agent** | `agents/qa/` | Testing, cobertura, integración continua | `tests/`, `vitest.config.ts`, `playwright.config.ts` |
| **i18n Agent** | `agents/i18n/` | Traducciones ES/EN, consistencia, claves | `src/i18n/` |
| **Audit Agent** | `agents/audit/` | Revisión de código, mejores prácticas, deuda técnica | Todos (solo lectura y reportes) |
| **Theme Agent** | `agents/theme-agent/` | Sistema de temas, colores, accesibilidad | `src/styles/theme.css`, `src/stores/themeStore.ts`, `src/components/Theme*` |

### Agentes Especializados

| Agente | Directorio | Expertise | Archivos que modifica |
|--------|-----------|-----------|----------------------|
| **Mobile Agent** | `agents/mobile-agent/` | Capacitor, PWA, responsive, offline | `public/sw.js`, `public/manifest.json`, `src/layouts/*` |
| **Planner Agent** | `agents/planner-agent/` | Documentación, planificación, estrategia | `docs/`, `TASK.md`, `TODO.md` |
| **Client Agent** | `agents/client-agent/` | Páginas del cliente, dashboard, rutinas, dietas | `src/pages/client/`, `src/lib/client/` |
| **Trainer Agent** | `agents/trainer-agent/` | Páginas del entrenador, gestión de clientes | `src/pages/trainer/`, `src/lib/trainer/` |
| **Admin Agent** | `agents/admin-agent/` | Panel de administración, gestión de usuarios | `src/pages/admin/`, `src/lib/admin/` |

---

## 📋 Protocolo de Coordinación Multi-Agente

### 🔒 Sistema de Bloqueo de Archivos

Para evitar que dos agentes modifiquen el mismo archivo simultáneamente:

```bash
# Antes de modificar un archivo
bash scripts/agent-lock.sh acquire src/pages/login.astro

# Después de terminar
bash scripts/agent-lock.sh release src/pages/login.astro

# Verificar estado
bash scripts/agent-lock.sh status
```

### 📝 Matriz de Responsabilidad de Archivos

| Archivo | Agente Primario | Agentes Secundarios (consulta) |
|---------|----------------|-------------------------------|
| `src/pages/login.astro` | Auth Agent | Frontend Agent, i18n Agent |
| `src/pages/register.astro` | Auth Agent | Frontend Agent, i18n Agent |
| `src/pages/client/dashboard.astro` | Client Agent | Data Agent, Frontend Agent |
| `src/layouts/BaseLayout.astro` | Frontend Agent | Theme Agent, Infra Agent |
| `src/services/authService.ts` | Auth Agent | Data Agent |
| `src/lib/client/onboardingService.ts` | Client Agent | Data Agent |
| `src/stores/themeStore.ts` | Theme Agent | Frontend Agent |
| `src/i18n/*` | i18n Agent | Todos (añaden claves) |
| `firestore.rules` | Infra Agent | Data Agent |
| `tests/*` | QA Agent | Todos (mantienen tests) |

### 🔄 Flujo de Trabajo Colaborativo

```
AGENTE A (Frontend)
    │
    │  "Voy a modificar login.astro"
    │  agent-lock.sh acquire src/pages/login.astro
    │
    ├── Modifica UI → emailError, passwordError, toggle
    │
    │  "Necesito nuevas claves i18n"
    │  ──→ Notifica a i18n Agent
    │
    │  agent-lock.sh release src/pages/login.astro
    │
    ▼

AGENTE B (i18n)
    │
    │  "Recibida solicitud de nuevas claves"
    │  agent-lock.sh acquire src/i18n/client.ts
    │
    ├── Añade auth.password.show, auth.password.hide, etc.
    │
    │  agent-lock.sh release src/i18n/client.ts
    │
    ▼

AGENTE C (QA)
    │
    │  "Verifico que login.astro y client.ts son consistentes"
    │  npm test
    │
    ├── Si falla → notifica al Master Agent
    │  Si pasa → confirma completado
    │
    ▼

MASTER AGENT
    │
    │  "Todos los agentes completaron. Integrando y validando."
    │  bash scripts/validate.sh
    │
    ├── ✅ Éxito → Commit + CHANGELOG + Done
    │   ❌ Fallo → Reasignar al agente correspondiente
    │
    ▼
```

---

## 🎯 Prompt Template para Desplegar Agentes

Cuando el Master Agent necesita desplegar un agente especializado, usa este template:

```
🤖 **Master Agent → [NOMBRE DEL AGENTE]**

## Tarea Asignada
[Descripción clara y concisa de la tarea]

## Contexto Específico
- Archivos que DEBES modificar: [lista]
- Archivos que puedes CONSULTAR: [lista]
- Archivos que NO debes tocar: [lista]

## Reglas Específicas para esta Tarea
1. [Regla 1]
2. [Regla 2]

## Criterios de Aceptación
- [ ] [Criterio 1]
- [ ] [Criterio 2]

## Dependencias
- Espera a que [AGENTE X] complete [TAREA Y]
- Notifica a [AGENTE Z] cuando termines

## Deadline
Completa antes de [siguiente paso en el pipeline].
```

---

## 📊 Métricas de Calidad por Agente

Cada agente debe reportar estas métricas al Master Agent:

| Métrica | Descripción |
|---------|-------------|
| **Cobertura de tipos** | 0 `any` en el código modificado |
| **i18n completo** | 0 textos hardcodeados en UI |
| **Logger usado** | 0 `console.log` en producción |
| **Tests pasando** | 100% de tests existentes pasan |
| **Lint pasando** | 0 errores de ESLint |
| **Build OK** | `npm run build` sin errores |
| **Archivos ≤ 300 líneas** | Sin archivos nuevos que excedan el límite |

---

## 🚨 Protocolo de Corrección de Errores

Si un agente produce código con errores:

1. **Master Agent detecta el error** (validate.sh falla)
2. **Identifica el agente responsable** (por el archivo que falló)
3. **Crea un issue específico** con el error exacto
4. **Reasigna al mismo agente** con el contexto del error
5. **El agente corrige** y vuelve a commitear
6. **Master Agent re-valida** hasta que TODO pase

---

## 📋 Checklist de Cierre del Master Agent

Antes de marcar una tarea como completada:

- [ ] Todos los agentes reportaron éxito
- [ ] `bash scripts/validate.sh` pasa sin errores
- [ ] `npm run type-check` sin errores
- [ ] `npm test` todos los tests pasan
- [ ] `npm run build` compila correctamente
- [ ] CHANGELOG.md actualizado
- [ ] MASTER.md actualizado (si hay cambios estructurales)
- [ ] TASK.md marcado como completado
- [ ] Resumen presentado al usuario
- [ ] Sin archivos bloqueados (`agent-lock.sh status`)