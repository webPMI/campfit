# 🚀 CampFit - Plan de Mejora del Harness para Agentes IA

> **Propósito:** Plan integral para mejorar el harness, documentación, MCP y herramientas para que los agentes de IA trabajen de forma automática, segura y optimizada.

---

## 📊 Diagnóstico Actual

### ✅ Lo que ya funciona bien
- Harness básico: AGENTS.md, AGENTS_GUIDE.md, CONTEXT.md, TASK.md, CLAUDE.md
- Sistema de lock multi-agente (`scripts/agent-lock.sh`)
- Validación pre-commit (`scripts/validate.sh`)
- CI/CD pipeline (`.github/workflows/ci.yml`)
- Tests centralizados en `tests/`
- Mocks de Firebase para testing
- Modularización de adminUtils y trainerUtils completada

### ❌ Lo que falta o está incompleto

#### 1. MCP - Configuración incompleta
- `.mcp.json` existe pero usa placeholders `${VAR}` que no se resuelven
- No hay servidor MCP de testing (Firestore Emulator)
- No hay servidor MCP de documentación
- No hay scripts de setup de MCP

#### 2. Documentación desactualizada
- `03_arquitectura_tecnica.md` - No refleja estructura real
- `07_flujos_navegacion.md` - Faltan rutas reales
- `08_modulo_autenticacion.md` - No incluye archivos reales
- `09_modulo_cliente.md` - No incluye settings
- `10_modulo_administracion.md` - No incluye clients/trainers
- `15_api_contracts.md` - API Routes no implementadas
- `16_implementacion_incremental.md` - Estado desactualizado

#### 3. Scripts del harness mejorables
- `validate.sh` usa `npx astro check` que puede fallar
- `check-context.sh` no verifica cobertura real
- No hay script de `setup.sh` para nuevos agentes
- No hay script de `doctor.sh` para diagnosticar problemas

#### 4. Tests - Cobertura insuficiente
- No hay tests E2E implementados
- No hay tests de integración con Firebase Emulator
- Faltan tests para páginas Astro
- Cobertura general baja (~22%)

#### 5. CI/CD - Mejorable
- No hay cache de node_modules optimizado
- No hay matrix de testing (varios Node versions)
- No hay notificaciones (Slack/Discord)
- No hay análisis de cobertura con umbrales

#### 6. Seguridad y calidad
- `console.error` en producción en múltiples archivos
- `window.__*` funciones globales inseguras
- `confirm()` para acciones destructivas
- `any` en tipos de servicios cliente
- No hay sistema de logging centralizado

---

## 🎯 Plan de Implementación

### Fase 1: Harness Core (Prioridad 🔴) ✅ COMPLETADA
- [x] **1.1** Crear `scripts/setup.sh` - Setup inicial para nuevos agentes
- [x] **1.2** Crear `scripts/doctor.sh` - Diagnóstico del proyecto
- [x] **1.3** Mejorar `validate.sh` - Más robusto, con --quick y --full
- [x] **1.4** Mejorar `check-context.sh` - Más información útil
- [x] **1.5** Actualizar `.mcp.json` - Config MCP completa y funcional
- [x] **1.6** Crear `scripts/mcp-setup.sh` - Setup de servidores MCP
- [x] **1.7** Actualizar `package.json` con nuevos scripts (validate:quick, validate:fix, doctor, mcp:setup, setup, lock:status, lock:release)
- [x] **1.8** Actualizar `.gitignore` con nuevos lock files
- [x] **1.9** Actualizar `AGENTS.md` con nuevos comandos
- [x] **1.10** Actualizar `AGENTS_GUIDE.md` con nuevos scripts y MCP
- [x] **1.11** Actualizar `README.md` con tabla de comandos de agente
- [x] **1.12** Actualizar `.clinerules` con nuevos comandos npm

### Fase 2: Documentación (Prioridad 🔴)
- [ ] **2.1** Actualizar `03_arquitectura_tecnica.md` con estructura real
- [ ] **2.2** Actualizar `07_flujos_navegacion.md` con rutas reales
- [ ] **2.3** Actualizar `08_modulo_autenticacion.md` con archivos reales
- [ ] **2.4** Actualizar `09_modulo_cliente.md` con settings
- [ ] **2.5** Actualizar `10_modulo_administracion.md` con clients/trainers
- [ ] **2.6** Actualizar `16_implementacion_incremental.md` con estado real
- [ ] **2.7** Actualizar `AGENTS_GUIDE.md` con mejoras del harness

### Fase 3: Testing (Prioridad 🟡)
- [ ] **3.1** Crear tests E2E básicos (login, register, dashboard)
- [ ] **3.2** Crear tests de integración con Firebase Emulator
- [ ] **3.3** Agregar tests para páginas admin faltantes
- [ ] **3.4** Mejorar cobertura de servicios cliente

### Fase 4: CI/CD y Calidad (Prioridad 🟡)
- [ ] **4.1** Optimizar CI/CD con caching y matrix
- [ ] **4.2** Agregar notificaciones al pipeline
- [ ] **4.3** Reemplazar `console.error` con logger
- [ ] **4.4** Migrar `window.__*` a event delegation
- [ ] **4.5** Reemplazar `confirm()` con modal
- [ ] **4.6** Eliminar `any` en servicios cliente

### Fase 5: Refactor y Limpieza (Prioridad 🟢)
- [ ] **5.1** Refactorizar `profileService.ts` (>400 líneas)
- [ ] **5.2** Refactorizar `admin/users.astro` (>596 líneas)
- [ ] **5.3** Refactorizar `trainer/diets.astro` (>477 líneas)
- [ ] **5.4** Crear componentes UI compartidos (EmptyState, LoadingSpinner, ConfirmModal)
- [ ] **5.5** Unificar settings pages con SettingsShell
- [ ] **5.6** Eliminar `client/chatService.ts` (wrapper innecesario)
