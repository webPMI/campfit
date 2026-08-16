# 🗂️ Índice del Archivo de Documentación (`docs/_archive/`)

> **Qué es esto:** Todos los documentos históricos de CampFit (2024–2026) que ya no son fuente activa
> pero se conservan para referencia y trazabilidad.
>
> **Qué NO es esto:** No es documentación operativa. Para el estado actual del proyecto → lee
> `docs/DOCUMENTATION_MAP.md` y `docs/TASKS_MASTER.md`.
>
> **Fecha de consolidación:** 2026-08-16

---

## 📂 Estructura del Archive

```
docs/_archive/
├── 00-indice-original.md           # Índice del diseño original (2024) — EN DESUSO
├── 01–19-*.md                      # Documentación de diseño original (19 archivos) — EN DESUSO
│   └── Ver tabla "Documentación de Diseño Original (EN DESUSO)" abajo
├── 2024-early/                     # Archivos iniciales de 2024 (repositorios clonados, etc.)
├── nuevo_proyecto/                 # Diseño completo original (2024) — EN DESUSO
│   └── Ver tabla "Documentación de Diseño Original (EN DESUSO)"
├── auditorias/                     # Auditorías y análisis históricos (2024–2026)
│   └── Ver tabla "Auditorías Históricas"
├── CLOUDFLARE_R2_PROGRESS_PHOTOS.md  # Documentación R2 (SERVIDOR SIN IMPLEMENTAR) — Ver docs/CLOUDFLARE_R2.md
├── CLOUDFLARE_R2_APLICACIONES.md    # Integración R2 en aplicaciones — EN PROGRESO (2026)
├── GIT_WORKFLOW.md                  # Flujo de Git — Ver AGENTS.md
├── HARNESS_IMPROVEMENTS.md          # Mejoras del harness — EN DESUSO
├── CLAUDE.md                        # Instrucciones Claude (agentes) — EN DESUSO
├── AGENTS_GUIDE.md                  # Guía de agentes — EN DESUSO (ver AGENTS.md + AGENT_ROLES.md)
├── ANALISIS_*/                     # Análisis históricos (brechas, optimizaciones, i18n, etc.) — EN DESUSO
├── AUDIT_REPORT.md                  # Informe de auditoría (2024)
├── I18N_ANALYSIS.md                 # Análisis i18n (2024) — EN DESUSO
├── MANUAL_ARQUITECTURA_MAESTRO.md  # Manual de arquitectura (EN DESUSO)
├── MASTER.md                        # Documento maestro (EN DESUSO)
├── PROTOCOLO_*/                    # Protocolos (anti-regresión, etc.) — EN DESUSO
├── TASK.md                          # Tarea antigua (EN DESUSO)
├── TASK_PROGRESS.md                 # Progreso de tarea (EN DESUSO)
├── THEME_STATUS.md                  # Estado del theme (EN DESUSO)
├── TODO*.md                         # Listas de tareas (EN DESUSO — usar BACKLOG.md o TASKS_MASTER.md)
├── UI_UX_*.md                       # Planes UI/UX (EN DESUSO)
├── USER_STATUS_MANAGEMENT_ANALYSIS.md  # Análisis gestión de estados de usuarios — EN DESUSO
├── WEEKLY_SCHEDULE_AND_TRACKING.md     # Seguimiento semanal — EN DESUSO
└── AUDITORIA_COMPLETA_PRO           # Auditoría completa PRO (formato alternativo)
```

---

## 📋 Tabla de Contenido Completa

### Documentación de Diseño Original (EN DESUSO — 2024)
> **Nota:** Esta documentación fue creada en la fase inicial de diseño (2024). Está completa pero desactualizada
> respecto al estado actual del proyecto (2026). Conservarla para referencia histórica, pero NO usarla como fuente.

| # | Documento | Descripción | Estado actual |
|---|-----------|-------------|---------------|
| 00 | `00_indice.md` | Índice general del diseño | EN DESUSO — ver `docs/DOCUMENTATION_MAP.md` |
| 01 | `01_vision_y_requisitos.md` | Visión del producto, objetivos de negocio y KPIs | EN DESUSO |
| 02 | `02_requisitos_funcionales.md` | Requisitos detallados por módulo y actor | EN DESUSO |
| 03 | `03_arquitectura_tecnica.md` | Stack tecnológico, estructura del proyecto, patrones | EN DESUSO — ver `docs/architecture/FIRESTORE_SCHEMA.md` |
| 04 | `04_modelo_datos_firestore.md` | Modelo de datos NoSQL (7 colecciones) | EN DESUSO — ver `firestore.rules` + `firestore.indexes.json` |
| 05 | `05_reglas_seguridad.md` | Reglas de Firestore, políticas de acceso por rol | EN DESUSO — ver `firestore.rules` |
| 06 | `06_design_system.md` | Catálogo de componentes UI (Atomic Design) | EN DESUSO — ver `docs/THEME.md` + `docs/REFERENCIA_RAPIDA.md` |
| 07 | `07_flujos_navegacion.md` | Flujos de usuario, rutas y navegación | EN DESUSO — ver `docs/architecture/FIRESTORE_SCHEMA.md` |
| 08 | `08_modulo_autenticacion.md` | Auth: login, registro, roles, guardias | EN DESUSO — ver `src/lib/routeGuards.ts` |
| 09 | `09_modulo_cliente.md` | Dashboard, rutinas, dietas, progreso, chat del cliente | EN DESUSO — ver páginas `src/pages/client/*` |
| 10 | `10_modulo_administracion.md` | Panel admin, gestión usuarios, editores, bandeja chat | EN DESUSO — ver páginas `src/pages/admin/*` |
| 11 | `11_integraciones_operaciones.md` | Integraciones + Operaciones (CI/CD, deploy, monitoreo) | EN DESUSO — ver `CONTEXT.md` + `docs/DESIGN_logging_firebase.md` |
| 12 | `12_guia_desarrollo_testing.md` | Guía de desarrollo + testing | EN DESUSO — ver `AGENTS.md` + `docs/_archive/AGENTS_GUIDE.md` |
| 13 | `13_setup_guide.md` | Configuración inicial del proyecto paso a paso | EN DESUSO |
| 14 | `14_agent_instructions.md` | Instrucciones para agentes de IA | EN DESUSO — ver `AGENTS.md` + `docs/AGENT_ROLES.md` |
| 15 | `15_api_contracts.md` | Contratos de API, Firestore streams e índices | EN DESUSO — ver `src/pages/api/*` |
| 16 | `16_implementacion_incremental.md` | Estrategia de implementación en micro-pasos seguros | EN DESUSO |
| 17 | `17_glosario.md` | Glosario de términos del dominio | EN DESUSO |
| 18 | `18_protocolo_documentacion.md` | Protocolo de documentación del proyecto | EN DESUSO — ver este archivo `INDEX.md` + `docs/DOCUMENTATION_UPDATE_LOG.md` |
| 19 | `19_plan_refactor_optimizacion.md` | Plan de refactorización y optimización | EN DESUSO |
| — | `firebase_rules.md` | Reglas de Firebase (formato alternativo) | EN DESUSO — ver `firestore.rules` |

### Auditorías Históricas (conservar para referencia)
> Estas auditorías son hitos de verificación del proyecto en diferentes momentos. Conservar para trazabilidad.

| Documento | Fecha aprox. | Descripción | Uso actual |
|-----------|-------------|-------------|------------|
| `AUDIT_REPORT.md` | 2024 | Informe de auditoría inicial | Referencia histórica |
| `AUDITORIA_2026-08-10.md` | 2026-08-10 | Auditoría del 10 de agosto | Referencia histórica |
| `AUDITORIA_COMPLETA_CAMPFIT.md` | 2026-08-02 | Auditoría completa de CampFit | Referencia histórica |
| `AUDITORIA_COMPLETA_PRO` | 2024 | Auditoría completa PRO (formato alternativo) | Referencia histórica |
| `AUDITORIA_DIETAS_TRAINER.md` | 2026-08-02 | Auditoría de dietas del entrenador | Referencia histórica |
| `AUDITORIA_DOCUMENTACION.md` | 2026-08-06 | Auditoría de documentación | Referencia histórica |
| `AUDITORIA_PROFUNDA_TRAINER.md` | 2026-08-14 | Auditoría profunda del entrenador | Referencia histórica |
| `AUDITORIA_TRAINER_CHAT.md` | 2026-08-14 | Auditoría del chat del entrenador | Referencia histórica |
| `AUDITORIA_TRAINER_CLIENTES.md` | 2026-08-14 | Auditoría de clientes del entrenador | Referencia histórica |
| `CLOUDFLARE_R2_PROGRESS_PHOTOS.md` | 2026-08-02 | Documentación R2 (SERVIDOR SIN IMPLEMENTAR) | Ver `docs/CLOUDFLARE_R2.md` |
| `CLOUDFLARE_R2_APLICACIONES.md` | 2026-08-16 | Integración R2 en aplicaciones | Ver `docs/CLOUDFLARE_R2.md` |
| `I18N_ANALYSIS.md` | 2024 | Análisis de internacionalización | Referencia histórica |
| `MANUAL_ARQUITECTURA_MAESTRO.md` | 2026-08-06 | Manual de arquitectura maestro | Referencia histórica |
| `USER_STATUS_MANAGEMENT_ANALYSIS.md` | 2024 | Análisis de gestión de estados de usuarios | Referencia histórica |

### Protocolos y Procedimientos (EN DESUSO)
| Documento | Descripción | Uso actual |
|-----------|-------------|------------|
| `PROTOCOLO_ANTI_REGRESION_Y_ARQUITECTURA.md` | Protocolo anti-regresión y arquitectura | Ver `AGENTS.md` (reglas 11-27) |
| `WEEKLY_SCHEDULE_AND_TRACKING.md` | Seguimiento semanal | EN DESUSO — usar `TASK.md` + `docs/TASKS_MASTER.md` |

### Listas de Tareas (EN DESUSO — usar BACKLOG.md o TASKS_MASTER.md)
> **Nota importante:** Estos archivos son versiones antiguas de listas de tareas. La fuente única actual
> de tareas pendientes es `docs/BACKLOG.md` (usando checkboxes con estado) o `docs/TASKS_MASTER.md`
> (usando tablas de estado por prioridad).

| Documento | Descripción | Uso actual |
|-----------|-------------|------------|
| `TODO.md` | Lista de tareas (formato simple) | EN DESUSO |
| `TODO_COMPLETO.md` | Lista de tareas completa | EN DESUSO |
| `TODO_OPTIMIZACIONES.md` | Lista de optimizaciones | EN DESUSO |
| `TASK.md` | Tarea individual (formato simple) | EN DESUSO — ver `TASK.md` en raíz del proyecto |
| `TASK_PROGRESS.md` | Progreso de tarea | EN DESUSO |
| `10_todo_y_problemas.md` | TODO y problemas (diseño original) | EN DESUSO |
| `11_auditoria_problemas.md` | Auditoría de problemas | EN DESUSO |
| `MASTER.md` | Documento maestro | EN DESUSO — ver `TASK.md` + `docs/TASKS_MASTER.md` |
| `THEME_STATUS.md` | Estado del theme | EN DESUSO |

### Planes UI/UX (EN DESUSO)
| Documento | Descripción | Uso actual |
|-----------|-------------|------------|
| `UI_UX_FINAL_PLAN.md` | Plan UI/UX final | EN DESUSO |
| `UI_UX_MIGRATION_PLAN.md` | Plan de migración UI/UX | EN DESUSO |
| `ACCESIBILIDAD.md` | Plan de accesibilidad | EN DESUSO |
| `ANALISIS_BRECHAS_CLINICO.md` | Análisis de brechas clínicas | EN DESUSO |
| `ANALISIS_OPTIMIZACION.md` | Análisis de optimizaciones | EN DESUSO |

### Flujos y Procedimientos (EN DESUSO)
| Documento | Descripción | Uso actual |
|-----------|-------------|------------|
| `GIT_WORKFLOW.md` | Flujo de Git | Ver `AGENTS.md` |
| `HARNESS_IMPROVEMENTS.md` | Mejoras del harness | EN DESUSO |
| `CLAUDE.md` | Instrucciones Claude (agentes) | EN DESUSO — ver `AGENTS.md` |
| `AGENTS_GUIDE.md` | Guía de agentes | EN DESUSO — ver `AGENTS.md` + `docs/AGENT_ROLES.md` |
| `TESTS_E2E_GUIDE.md` | Guía de tests E2E | EN DESUSO — ver `AGENTS.md` (ver también `package.json` scripts) |

### Setup y Configuración (EN DESUSO)
| Documento | Descripción | Uso actual |
|-----------|-------------|------------|
| `13_setup_guide.md` | Guía de configuración inicial | EN DESUSO — ver `CONTEXT.md` + `.env.example` |
| `00_indice.md` (en nuevo_proyecto/) | Índice del diseño original | EN DESUSO — ver `docs/DOCUMENTATION_MAP.md` |

---

## ⚠️ Decisiones de Consolidación

### Eliminados / Fusionados (fecha: 2026-08-16)

- **`BACKLOG.md`** → eliminado. Ahora la lista de tareas está en `docs/BACKLOG.md` (checkboxes) y `docs/TASKS_MASTER.md` (tablas de estado). BACKLOG.md se conserva como referencia pero BACKLOG.md en raíz del proyecto es el activo.
- **`LISTA_TAREAS_IMPLEMENTACION_MAESTRA.md`** → eliminado. Contenido fusionado en `docs/TASKS_MASTER.md`.
- **`docs/DOCUMENTATION_UPDATE_LOG.md`** → creado. Registro de cambios en la documentación.

### Conservados (no eliminar)
- `docs/_archive/nuevo_proyecto/` — diseño original completo para referencia histórica
- `docs/_archive/AUDITORIA_*.md` — auditorías históricas para trazabilidad
- `docs/_archive/CLOUDFLARE_R2_*.md` — documentación R2 (futuro, ver `docs/CLOUDFLARE_R2.md`)
- `docs/_archive/PROTOCOLO_ANTI_REGRESION_Y_ARQUITECTURA.md` — protocolo anti-regresión
- `docs/_archive/GIT_WORKFLOW.md` — flujo Git
- `docs/_archive/AGENTS_GUIDE.md` — guía de agentes (histórica)

---

## 🔄 Flujo de Trabajo con el Archive

1. **Nuevo documento operativo** → crearlo en `docs/` (ej. `docs/ALGUN-TEMA.md`)
2. **Documento histórico** → archivarlo en `docs/_archive/` con fecha
3. **Documento obsoleto** → si existe en `docs/`, moverlo a `docs/_archive/` y agregar entrada en `INDEX.md`
4. **Cambio en documentación** → registrar en `docs/DOCUMENTATION_UPDATE_LOG.md`
5. **Tarea nueva** → añadir a `docs/BACKLOG.md` (checkboxes) o `docs/TASKS_MASTER.md` (tablas)
6. **Tarea completada** → marcar en BACKLOG.md/TASKS_MASTER.md + registrar en `docs/DOCUMENTATION_UPDATE_LOG.md`

---

## 📌 Puntos de Entrada Rápidos

- **Estado actual del proyecto** → `docs/DOCUMENTATION_MAP.md`
- **Tareas pendientes** → `docs/BACKLOG.md` (checkboxes) o `docs/TASKS_MASTER.md` (tablas)
- **Registro de agentes activos** → `TASK.md` (raíz del proyecto)
- **Cambios en documentación** → `docs/DOCUMENTATION_UPDATE_LOG.md`
- **Historial de cambios** → `CHANGELOG.md`
- **Documentación R2** → `docs/CLOUDFLARE_R2.md` (si existe) o `docs/_archive/CLOUDFLARE_R2_PROGRESS_PHOTOS.md` (histórica)
