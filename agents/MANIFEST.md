# 🤖 CampFit Multi-Agent System - Manifiesto

## 🏗️ Arquitectura del Sistema

```
                         ┌─────────────────┐
                         │   👤 USUARIO    │
                         │  (Tarea/TASK)   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  🎯 MASTER      │
                         │  AGENT          │
                         │  (Orquestador)   │
                         └──┬──┬──┬──┬──┬──┘
                            │  │  │  │  │
            ┌───────────────┘  │  │  │  └───────────────┐
            ▼                  ▼  ▼  ▼                  ▼
    ┌──────────────┐  ┌─────────────────────┐  ┌──────────────────┐
    │ 🎨 FRONTEND  │  │ 🔧 DATA / AUTH      │  │ 📊 QA / i18n     │
    │   Agent      │  │    Agents            │  │   Agents          │
    └──────────────┘  └─────────────────────┘  └──────────────────┘
```

## 📋 Objetivo del Sistema

Crear un ecosistema de **agentes IA especializados** que trabajen de forma coordinada, sin pisarse, bajo la supervisión de un Master Agent que orquesta, audita y garantiza la calidad del código producido.

## 🔑 Principios Fundamentales

| # | Principio | Descripción |
|---|-----------|-------------|
| 1 | **Especialización** | Cada agente tiene un dominio claro y no invade el de otros |
| 2 | **Coordinación** | El Master Agent secuencia y sincroniza el trabajo |
| 3 | **No Solapamiento** | Sistema de locks impide que dos agentes toquen el mismo archivo |
| 4 | **Calidad Garantizada** | Auditoría por agente + validación final centralizada |
| 5 | **Trazabilidad** | Cada cambio está documentado en CHANGELOG.md |
| 6 | **Golden Rules** | Todos los agentes respetan .clinerules sin excepción |

## 📊 Métricas de Calidad del Sistema

Cada iteración del sistema multi-agente debe cumplir:

```yaml
quality_gates:
  typescript: "0 errores, 0 any en nuevo código"
  i18n: "0 textos hardcodeados"
  tests: "100% tests existentes pasan"
  build: "npm run build exit 0"
  lint: "0 errores ESLint"
  accessibility: "ARIA labels en todos los elementos interactivos"
  performance: "Sin console.log en producción"
  documentation: "CHANGELOG.md actualizado"
```

## 🚀 Cómo Desplegar el Sistema

### Desde el Master Agent

```
1. Master Agent lee TASK.md
2. Descompone en subtareas
3. Para cada subtarea:
   a. Selecciona el agente óptimo
   b. Escribe el prompt con AGENT_NAME, tarea, contexto, criterios
   c. El agente ejecuta: agent-lock.sh acquire → modifica → release
4. Auditoría por agente
5. Integración y validación final
6. CHANGELOG + Commit