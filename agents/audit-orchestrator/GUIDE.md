# 🔍 Audit Orchestrator — Guía del Sistema de Auditoría

## Rol

Coordinador del sistema de auditoría multi-agente. Despliega y gestiona los 6 agentes de auditoría especializados, consolida resultados y genera el reporte final.

## Agentes Bajo Su Coordinación

| # | Agente | Área | Directorio |
|---|--------|------|------------|
| 1 | **audit-security** | Seguridad, auth, route guards, firestore rules | `agents/audit-security/` |
| 2 | **audit-quality** | Calidad de código, TypeScript, file sizes | `agents/audit-quality/` |
| 3 | **audit-performance** | Performance, Firestore queries, memory leaks | `agents/audit-performance/` |
| 4 | **audit-uiux** | UI/UX, theme system, accesibilidad, colores | `agents/audit-uiux/` |
| 5 | **audit-testing** | Tests, cobertura, placeholders, E2E | `agents/audit-testing/` |
| 6 | **audit-i18n** | i18n, traducciones, paridad ES/EN | `agents/audit-i18n/` |

## Comandos

```bash
# Auditoría completa (6 agentes en paralelo)
node scripts/audit.mjs

# Auditoría rápida (sin build/test)
node scripts/audit.mjs --quick

# Auditoría de un solo área
node scripts/audit.mjs --area=security
node scripts/audit.mjs --area=quality
node scripts/audit.mjs --area=performance
node scripts/audit.mjs --area=uiux
node scripts/audit.mjs --area=testing
node scripts/audit.mjs --area=i18n
```

## Flujo de Auditoría

1. **Pre-auditoría** (⬅️ NUEVO - obligatorio)
   - [ ] Verificar `git status` limpio o documentar cambios pendientes
   - [ ] Registrar fecha y hora de inicio (formato: `YYYY-MM-DD HH:MM`)
   - [ ] Ejecutar `npm run type-check` y anotar errores preexistentes
   - [ ] Ejecutar `npm test` y anotar tests fallidos preexistentes

2. **Despliegue**: Lanzar los 6 agentes en paralelo con `Promise.all()`
3. **Recolección**: Cada agente escanea sus archivos y reporta findings
4. **Consolidación**: El orchestrator combina todos los findings
5. **Reporte**: Genera/actualiza `docs/AUDITORIA_UNIFICADA.md` con:
   - Fecha y hora de la auditoría
   - Resumen consolidado (críticos/medios/bajos)
   - Detalle por agente
   - Plan de acción priorizado con IDs (ej: SEC-001, DEVTOOLS-001)
   - Comandos de verificación por hallazgo

6. **Post-auditoría** (⬅️ NUEVO - obligatorio)
   - [ ] Registrar fecha y hora de fin
   - [ ] Confirmar que el reporte se guardó en `docs/AUDITORIA_UNIFICADA.md`
   - [ ] Añadir entrada al registro de auditorías del reporte
   - [ ] Actualizar `CHANGELOG.md` con el resultado de la auditoría
   - [ ] Notificar al planificador (`planner-agent`) con los hallazgos pendientes

## Severidades

| Nivel | Icono | Criterio |
|-------|-------|----------|
| CRÍTICO | 🔴 | Impide deploy, seguridad comprometida, data leak |
| MEDIO | 🟡 | Violación de Golden Rules, deuda técnica |
| BAJO | 🟢 | Mejoras de calidad, no bloqueante |

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/audit.mjs` | Script principal de auditoría |
| `docs/AUDITORIA_UNIFICADA.md` | ⚠️ REPORTE PRINCIPAL (fuente de verdad) |
| `docs/11_auditoria_problemas.md` | Auditoría anterior (referencia/histórico) |
