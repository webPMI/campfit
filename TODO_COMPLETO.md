# 📋 CampFit 2.0 — TODO Completo: Documentación vs Realidad + Checklist para Agentes

> **Propósito:** Documento maestro que compara la documentación planificada con el código real, identifica brechas, y proporciona checklists detallados para que los agentes implementen lo que falta.
>
> **Última revisión:** 11/07/2026

---

## 📑 Índice

1. [Resumen de Brechas](#1-resumen-de-brechas)
2. [Módulo de Autenticación](#2-módulo-de-autenticación)
3. [Módulo del Cliente](#3-módulo-del-cliente)
4. [Módulo de Administración](#4-módulo-de-administración)
5. [Módulo del Trainer](#5-módulo-del-trainer)
6. [Arquitectura y Shared](#6-arquitectura-y-shared)
7. [Testing](#7-testing)
8. [Integraciones](#8-integraciones)
9. [Checklist Consolidado para Agentes](#9-checklist-consolidado-para-agentes)

---

## 1. Resumen de Brechas

### 1.1 Documentación Desactualizada vs Código Real

| Documento | Estado | Brechas detectadas |
|-----------|--------|-------------------|
| `03_arquitectura_tecnica.md` | ⚠️ Desactualizado | No refleja `src/lib/shared/`, `src/lib/auth/`, `src/lib/firebase/`, `src/lib/debug/` |
| `04_modelo_datos_firestore.md` | ⚠️ Desactualizado | `isRead` vs `read` no documentado; `progress` vs `progress_logs` |
| `05_reglas_seguridad.md` | ⚠️ Desactualizado | Difiere de `firebase_rules.md` (producción) |
| `06_design_system.md` | ⚠️ Desactualizado | Componentes documentados no existen como funciones JS reales |
| `07_flujos_navegacion.md` | ⚠️ Desactualizado | Faltan rutas reales: `/onboarding`, `/admin/clients`, `/admin/trainers`, `/trainer/*` |
| `08_modulo_autenticacion.md` | ⚠️ Desactualizado | No refleja `src/lib/auth/roleRedirect.ts`, `src/lib/firebase/auth.ts` |
| `09_modulo_cliente.md` | ⚠️ Desactualizado | No refleja `client/settings.astro` real |
| `10_modulo_administracion.md` | ⚠️ Desactualizado | No refleja `admin/clients.astro`, `admin/trainers.astro` reales |
| `15_api_contracts.md` | ⚠️ Desactualizado | API Routes no implementadas; índices no coinciden con `firestore.indexes.json` |
| `16_implementacion_incremental.md` | ⚠️ Desactualizado | Items marcados como pendientes que ya están implementados y viceversa |

### 1.2 Funcionalidades Documentadas NO Implementadas

| Funcionalidad | Documentado en | Prioridad |
|--------------|---------------|-----------|
| `admin/workouts.astro` (CRUD rutinas) | `10_modulo_administracion.md` | 🔴 Alta |
| `admin/diets.astro` (CRUD dietas) | `10_modulo_administracion.md` | 🔴 Alta |
| `admin/chat.astro` (bandeja de chat) | `10_modulo_administracion.md` | 🔴 Alta |
| `admin/progress.astro` (visor progreso) | `10_modulo_administracion.md` | 🔴 Alta |
| `client/dashboard.astro` | `09_modulo_cliente.md` | 🔴 Alta |
| `client/workouts.astro` | `09_modulo_cliente.md` | 🔴 Alta |
| `client/diets.astro` | `09_modulo_cliente.md` | 🔴 Alta |
| `client/progress.astro` | `09_modulo_cliente.md` | 🔴 Alta |
| `client/chat.astro` | `09_modulo_cliente.md` | 🔴 Alta |
| `client/support.astro` | `09_modulo_cliente.md` | 🟡 Media |
| Cloudflare R2 integration | `11_integraciones_operaciones.md` | 🟡 Media |
| Cloudflare Workers | `11_integraciones_operaciones.md` | 🟡 Media |
| Capacitor mobile | `11_integraciones_operaciones.md` | 🟢 Baja |
| Sentry | `11_integraciones_operaciones.md` | 🟢 Baja |
| PostHog | `11_integraciones_operaciones.md` | 🟢 Baja |
| GitHub Actions CI/CD | `11_integraciones_operaciones.md` | 🟢 Baja |
| API Routes (`/api/users`, etc.) | `15_api_contracts.md` | 🟡 Media |

### 1.3 Funcionalidades Implementadas NO Documentadas

| Funcionalidad | Archivo real | Debería estar en |
|--------------|-------------|-----------------|
| `src/lib/shared/` (chat, logger, ui, profileService) | Existe | `03_arquitectura_tecnica.md` |
| `src/lib/auth/roleRedirect.ts` | Existe | `08_modulo_autenticacion.md` |
| `src/lib/firebase/auth.ts`, `firestore.ts` | Existe | `03_arquitectura_tecnica.md` |
| `src/lib/debug/firestoreDebug.ts` | Existe | `03_arquitectura_tecnica.md` |
| `src/pages/onboarding.astro` | Existe | `07_flujos_navegacion.md` |
| `src/pages/admin/clients.astro` | Existe | `10_modulo_administracion.md` |
| `src/pages/admin/trainers.astro` | Existe | `10_modulo_administracion.md` |
| `src/pages/trainer/*` (dashboard, clients, chat, diets, workouts, settings) | Existe | `07_flujos_navegacion.md` |
| `src/pages/client/settings.astro` | Existe | `09_modulo_cliente.md` |
| `src/pages/404.astro`, `500.astro` | Existe | `07_flujos_navegacion.md` |

---

## 2. Módulo de Autenticación

### 2.1 Documentación vs Realidad

| Aspecto | Documentado (08_modulo_autenticacion.md) | Realidad (código) | Gap |
|---------|------------------------------------------|-------------------|-----|
| `authService.ts` | En `services/` | ✅ En `services/authService.ts` | ✅ OK |
| `authStore.ts` | En `stores/` | ✅ En `stores/authStore.ts` | ✅ OK |
| `routeGuards.ts` | En `lib/` | ✅ En `lib/routeGuards.ts` | ✅ OK |
| `roleRedirect.ts` | ❌ No mencionado | ✅ En `lib/auth/roleRedirect.ts` | 📝 Documentar |
| `firebase/auth.ts` | ❌ No mencionado | ✅ En `lib/firebase/auth.ts` | 📝 Documentar |
| `firebase/firestore.ts` | ❌ No mencionado | ✅ En `lib/firebase/firestore.ts` | 📝 Documentar |
| `onboarding.astro` | ❌ No mencionado | ✅ En `pages/onboarding.astro` | 📝 Documentar |
| `404.astro`, `500.astro` | ❌ No mencionado | ✅ En `pages/` | 📝 Documentar |
| `client/medical-profile.astro` | ✅ Mencionado | ✅ Existe | ✅ OK |
| `client/settings.astro` | ❌ No mencionado | ✅ Existe | 📝 Documentar |

### 2.2 Checklist para Agentes — Auth

- [ ] **A2.1** Actualizar `08_modulo_autenticacion.md` para incluir `roleRedirect.ts`, `firebase/auth.ts`, `firebase/firestore.ts`
- [ ] **A2.2** Actualizar `07_flujos_navegacion.md` para incluir `/onboarding`, `/404`, `/500`
- [ ] **A2.3** Verificar que `routeGuards.ts` tenga todas las rutas reales (incluye `/trainer/*`, `/admin/clients`, `/admin/trainers`)
- [ ] **A2.4** Verificar que `requiresMedicalProfile` esté correcto en `routeGuards.ts` (actualmente `false` para todas las rutas client)
- [ ] **A2.5** Agregar tests para `roleRedirect.ts` si no existen

---

## 3. Módulo del Cliente

### 3.1 Documentación vs Realidad

| Página | Documentado (09_modulo_cliente.md) | Realidad | Gap |
|--------|-------------------------------------|----------|-----|
| `client/dashboard.astro` | ✅ Diagrama + streams | ✅ Existe | ⚠️ Verificar contenido |
| `client/workouts.astro` | ✅ Diagrama + flujo | ✅ Existe | ⚠️ Verificar contenido |
| `client/diets.astro` | ✅ Diagrama + flujo | ✅ Existe | ⚠️ Verificar contenido |
| `client/progress.astro` | ✅ Diagrama + R2 | ✅ Existe | ⚠️ Verificar contenido |
| `client/chat.astro` | ✅ Diagrama + stream | ✅ Existe | ⚠️ Verificar contenido |
| `client/support.astro` | ✅ FAQs + flujo | ✅ Existe | ⚠️ Verificar contenido |
| `client/settings.astro` | ❌ No documentado | ✅ Existe | 📝 Documentar |
| `client/medical-profile.astro` | ✅ Mencionado | ✅ Existe | ✅ OK |

### 3.2 Servicios Cliente

| Servicio | Documentado | Realidad | Gap |
|----------|-------------|----------|-----|
| `workoutService.ts` | ✅ Código ejemplo | ✅ Existe | ✅ OK |
| `dietService.ts` | ✅ Mencionado | ✅ Existe | ✅ OK |
| `progressService.ts` | ✅ Mencionado | ✅ Existe | ✅ OK |
| `chatService.ts` | ✅ Código ejemplo | ✅ Existe (wrapper) | ⚠️ Es solo re-export |
| `supportService.ts` | ✅ Mencionado | ❌ No existe | 🔴 Crear |

### 3.3 Checklist para Agentes — Cliente

- [ ] **A3.1** Crear `src/lib/client/supportService.ts` con lógica de FAQs
- [ ] **A3.2** Actualizar `09_modulo_cliente.md` para incluir `client/settings.astro`
- [ ] **A3.3** Verificar que `client/dashboard.astro` tenga los 4 estados (loading, empty, error, success)
- [ ] **A3.4** Verificar que `client/workouts.astro` tenga modal RPE funcional
- [ ] **A3.5** Verificar que `client/diets.astro` tenga checkbox de completado funcional
- [ ] **A3.6** Verificar que `client/progress.astro` tenga LineChart y subida de fotos
- [ ] **A3.7** Verificar que `client/chat.astro` tenga stream de mensajes en tiempo real
- [ ] **A3.8** Verificar que `client/support.astro` tenga FAQs funcionales
- [ ] **A3.9** Agregar tests para `supportService.ts`

---

## 4. Módulo de Administración

### 4.1 Documentación vs Realidad

| Página | Documentado (10_modulo_administracion.md) | Realidad | Gap |
|--------|--------------------------------------------|----------|-----|
| `admin/dashboard.astro` | ✅ Diagrama + streams | ✅ Existe | ⚠️ Verificar contenido |
| `admin/users.astro` | ✅ DataTable + modal | ✅ Existe | ⚠️ Verificar contenido |
| `admin/workouts.astro` | ✅ Diagrama | ❌ No existe | 🔴 Crear |
| `admin/diets.astro` | ✅ Diagrama | ❌ No existe | 🔴 Crear |
| `admin/chat.astro` | ✅ Diagrama + funcionalidades | ❌ No existe | 🔴 Crear |
| `admin/progress.astro` | ✅ Diagrama | ❌ No existe | 🔴 Crear |
| `admin/settings.astro` | ✅ Diagrama | ✅ Existe | ✅ OK |
| `admin/clients.astro` | ❌ No documentado | ✅ Existe | 📝 Documentar |
| `admin/trainers.astro` | ❌ No documentado | ✅ Existe | 📝 Documentar |

### 4.2 Servicios Admin

| Servicio | Documentado | Realidad | Gap |
|----------|-------------|----------|-----|
| `adminUtils.ts` | ✅ Mencionado | ✅ Existe (373 líneas) | ✅ OK |
| `adminService.ts` | ✅ Mencionado | ✅ Existe | ✅ OK |

### 4.3 Análisis Profundo del Módulo Admin

#### `admin/dashboard.astro`
- **Estado:** ✅ Implementado
- **Problemas detectados:**
  - No hay error states para suscripciones (ver ANALISIS_OPTIMIZACION.md #2.13)
  - 3 suscripciones separadas que podrían combinarse
  - Lógica de renderizado inline (violación regla #2)

#### `admin/users.astro`
- **Estado:** ✅ Implementado (596 líneas)
- **Problemas detectados:**
  - Violación regla #9 (>300 líneas)
  - `window.__*` funciones globales (seguridad)
  - `confirm()` para acciones destructivas
  - No hay spinner en botones durante operaciones async
  - `console.error` en producción
  - `sendPasswordResetEmail` desde cliente

#### `admin/settings.astro`
- **Estado:** ✅ Implementado (225 líneas)
- **Problemas detectados:**
  - Textos hardcodeados en español (no i18n)
  - `requireAuth` importado de adminUtils en lugar de routeGuards
  - Casi idéntico a trainer/settings.astro y client/settings.astro

#### `admin/clients.astro` (NO documentado)
- **Estado:** ✅ Implementado pero no documentado
- **Acción:** Documentar en `10_modulo_administracion.md`

#### `admin/trainers.astro` (NO documentado)
- **Estado:** ✅ Implementado pero no documentado
- **Acción:** Documentar en `10_modulo_administracion.md`

### 4.4 Checklist para Agentes — Admin

#### Crítico (Crear páginas faltantes)
- [ ] **A4.1** Crear `src/pages/admin/workouts.astro` con CRUD de rutinas
- [ ] **A4.2** Crear `src/pages/admin/diets.astro` con CRUD de dietas
- [ ] **A4.3** Crear `src/pages/admin/chat.astro` con bandeja de chat
- [ ] **A4.4** Crear `src/pages/admin/progress.astro` con visor de progreso

#### Alto (Mejorar páginas existentes)
- [ ] **A4.5** Refactorizar `adminUtils.ts` (373 líneas) en módulos más pequeños si es necesario
- [ ] **A4.6** Refactorizar `admin/users.astro` (>596 líneas) extrayendo lógica de modales
- [ ] **A4.7** Migrar `window.__*` a event delegation con `data-*` en admin/users.astro
- [ ] **A4.8** Reemplazar `confirm()` con `ConfirmModal.astro` en admin/users.astro
- [ ] **A4.9** Agregar spinner en botones de modal durante operaciones async
- [ ] **A4.10** Reemplazar `console.error` con logger en admin/users.astro
- [ ] **A4.11** Agregar error states en admin/dashboard.astro
- [ ] **A4.12** Mover `sendPasswordResetEmail` a API Route de Astro

#### Medio (Documentación)
- [ ] **A4.13** Actualizar `10_modulo_administracion.md` para incluir `admin/clients.astro` y `admin/trainers.astro`
- [ ] **A4.14** Agregar keys de traducción para textos hardcodeados en admin/settings.astro
- [ ] **A4.15** Corregir `requireAuth` en admin/settings.astro para usar routeGuards.ts

---

## 5. Módulo del Trainer

### 5.1 Documentación vs Realidad

| Página | Documentado | Realidad | Gap |
|--------|-------------|----------|-----|
| `trainer/dashboard.astro` | ❌ No documentado | ✅ Existe | 📝 Documentar |
| `trainer/clients.astro` | ❌ No documentado | ✅ Existe | 📝 Documentar |
| `trainer/chat.astro` | ❌ No documentado | ✅ Existe | 📝 Documentar |
| `trainer/diets.astro` | ❌ No documentado | ✅ Existe | 📝 Documentar |
| `trainer/workouts.astro` | ❌ No documentado | ✅ Existe | 📝 Documentar |
| `trainer/settings.astro` | ❌ No documentado | ✅ Existe | 📝 Documentar |

### 5.2 Servicios Trainer

| Servicio | Documentado | Realidad | Gap |
|----------|-------------|----------|-----|
| `trainerUtils.ts` | ❌ No documentado | ✅ Existe | 📝 Documentar |

### 5.3 Checklist para Agentes — Trainer

- [ ] **A5.1** Crear documento `nuevo_proyecto/20_modulo_trainer.md` con toda la documentación del módulo trainer
- [ ] **A5.2** Actualizar `00_indice.md` para incluir el nuevo documento
- [ ] **A5.3** Actualizar `07_flujos_navegacion.md` para incluir todas las rutas `/trainer/*`
- [ ] **A5.4** Verificar que `trainer/dashboard.astro` tenga los 4 estados
- [ ] **A5.5** Verificar que `trainer/clients.astro` tenga cleanup de suscripciones
- [ ] **A5.6** Verificar que `trainer/chat.astro` tenga stream de mensajes en tiempo real
- [ ] **A5.7** Verificar que `trainer/diets.astro` tenga editor funcional
- [ ] **A5.8** Verificar que `trainer/workouts.astro` tenga editor funcional

---

## 6. Arquitectura y Shared

### 6.1 Documentación vs Realidad

| Directorio/Archivo | Documentado (03_arquitectura_tecnica.md) | Realidad | Gap |
|-------------------|-------------------------------------------|----------|-----|
| `src/lib/shared/` | ❌ No mencionado | ✅ Existe (chat, logger, ui, profileService) | 📝 Documentar |
| `src/lib/auth/` | ❌ No mencionado | ✅ Existe (roleRedirect) | 📝 Documentar |
| `src/lib/firebase/` | ❌ No mencionado | ✅ Existe (auth, firestore) | 📝 Documentar |
| `src/lib/debug/` | ❌ No mencionado | ✅ Existe (firestoreDebug) | 📝 Documentar |
| `src/lib/admin/` | ✅ Mencionado | ✅ Existe | ✅ OK |
| `src/lib/client/` | ✅ Mencionado | ✅ Existe | ✅ OK |
| `src/lib/trainer/` | ❌ No mencionado | ✅ Existe | 📝 Documentar |
| `src/services/` | ✅ Mencionado | ✅ Existe | ✅ OK |
| `src/stores/` | ✅ Mencionado | ✅ Existe | ✅ OK |
| `src/types/` | ✅ Mencionado | ✅ Existe | ✅ OK |
| `src/i18n/` | ✅ Mencionado | ✅ Existe | ✅ OK |
| `src/components/` | ✅ Mencionado | ✅ Existe (vacío?) | ⚠️ Verificar |

### 6.2 Checklist para Agentes — Arquitectura

- [ ] **A6.1** Actualizar `03_arquitectura_tecnica.md` para reflejar la estructura real del proyecto
- [ ] **A6.2** Documentar `src/lib/shared/` (chat, logger, ui, profileService)
- [ ] **A6.3** Documentar `src/lib/auth/roleRedirect.ts`
- [ ] **A6.4** Documentar `src/lib/firebase/auth.ts`, `firestore.ts`
- [ ] **A6.5** Documentar `src/lib/debug/firestoreDebug.ts`
- [ ] **A6.6** Documentar `src/lib/trainer/trainerUtils.ts`
- [ ] **A6.7** Verificar si `src/components/` tiene componentes y documentarlos

---

## 7. Testing

### 7.1 Estado Actual

| Aspecto | Documentado (12_guia_desarrollo_testing.md) | Realidad | Gap |
|---------|----------------------------------------------|----------|-----|
| Tests unitarios | ✅ 195 tests | ✅ 195 tests pasando | ✅ OK |
| Tests E2E | ✅ Mencionados | ❌ No implementados | 🔴 Crear |
| Tests integración | ✅ Mencionados | ❌ No implementados | 🟡 Crear |
| Cobertura servicios | 100% | ⚠️ Parcial | 🟡 Mejorar |
| Cobertura stores | 100% | ✅ authStore.test.ts | ✅ OK |
| Cobertura utils | 100% | ⚠️ Parcial | 🟡 Mejorar |

### 7.2 Tests Faltantes vs Documentación

| Módulo | Documentado en 12_guia | Realidad |
|--------|------------------------|----------|
| `validators.test.ts` | ✅ 16 tests | ✅ 17 tests |
| `authStore.test.ts` | ✅ 16 tests | ✅ 16 tests |
| `authService.test.ts` | ✅ 9 tests | ✅ 16 tests |
| `routeGuards.test.ts` | ❌ No mencionado | ✅ 15 tests |
| `roleRedirect.test.ts` | ❌ No mencionado | ✅ 4 tests |
| `translations.test.ts` | ❌ No mencionado | ✅ 5 tests |
| `adminUtils.test.ts` | ❌ No mencionado | ✅ 18 tests |
| `adminService.test.ts` | ❌ No mencionado | ✅ 14 tests |
| `profileService.test.ts` | ❌ No mencionado | ✅ 16 tests |
| `progressService.test.ts` | ❌ No mencionado | ✅ 14 tests |
| `workoutService.test.ts` | ❌ No mencionado | ✅ 7 tests |
| `dietService.test.ts` | ❌ No mencionado | ✅ 20 tests |
| `chatService.test.ts` | ❌ No mencionado | ✅ 12 tests |
| `trainerUtils.test.ts` | ❌ No mencionado | ✅ 17 tests |

### 7.3 Checklist para Agentes — Testing

- [ ] **A7.1** Actualizar `12_guia_desarrollo_testing.md` con la lista real de tests
- [ ] **A7.2** Crear tests E2E con Playwright para flujos principales (login, register, admin dashboard, users)
- [ ] **A7.3** Crear tests de integración con Firebase Emulator
- [ ] **A7.4** Agregar tests para `roleRedirect.ts`
- [ ] **A7.5** Agregar tests para `supportService.ts` (cuando se cree)
- [ ] **A7.6** Agregar tests para páginas admin faltantes (workouts, diets, chat, progress)

---

## 8. Integraciones

### 8.1 Documentación vs Realidad

| Integración | Documentado (11_integraciones_operaciones.md) | Realidad | Gap |
|-------------|-----------------------------------------------|----------|-----|
| Firebase Auth | ✅ | ✅ Implementado | ✅ OK |
| Cloud Firestore | ✅ | ✅ Implementado | ✅ OK |
| Firebase Hosting | ✅ | ❌ No configurado | 🟡 Pendiente |
| Cloudflare R2 | ✅ | ❌ No implementado | 🟡 Pendiente |
| Cloudflare Workers | ✅ | ❌ No implementados | 🟡 Pendiente |
| Capacitor | ✅ | ❌ No configurado | 🟢 Baja |
| GitHub Actions | ✅ | ❌ No configurado | 🟢 Baja |
| Sentry | ✅ | ❌ No configurado | 🟢 Baja |
| PostHog | ✅ | ❌ No configurado | 🟢 Baja |

### 8.2 Checklist para Agentes — Integraciones

- [ ] **A8.1** Configurar Firebase Hosting y deploy
- [ ] **A8.2** Implementar Cloudflare Worker para URLs pre-firmadas de R2
- [ ] **A8.3** Integrar subida de fotos a R2 en `client/progress.astro`
- [ ] **A8.4** Configurar GitHub Actions (lint + test + build + deploy)
- [ ] **A8.5** Configurar Sentry para monitoreo de errores
- [ ] **A8.6** Configurar PostHog para analytics
- [ ] **A8.7** Actualizar `11_integraciones_operaciones.md` con estado real

---

## 9. Checklist Consolidado para Agentes

### 🚨 Fase 1 — Crítico (Hacer ahora)

#### Admin — Páginas faltantes
- [ ] **1.1** Crear `admin/workouts.astro` (CRUD rutinas)
- [ ] **1.2** Crear `admin/diets.astro` (CRUD dietas)
- [ ] **1.3** Crear `admin/chat.astro` (bandeja de chat)
- [ ] **1.4** Crear `admin/progress.astro` (visor progreso)

#### Cliente — Servicio faltante
- [ ] **1.5** Crear `src/lib/client/supportService.ts`

#### Bugs críticos (de ANALISIS_OPTIMIZACION.md)
- [ ] **1.6** Reemplazar `console.error` con logger en todas las páginas
- [ ] **1.7** Optimizar `subscribeToUsers()` con filtros Firestore
- [ ] **1.8** Optimizar `subscribeToCollectionCount()` con `count()`
- [ ] **1.9** Corregir `registerWeight()` para usar `serverTimestamp()`
- [ ] **1.10** Mejorar `registerMealComplete()` para propagar errores

#### Documentación
- [ ] **1.11** Actualizar `03_arquitectura_tecnica.md` con estructura real
- [ ] **1.12** Actualizar `07_flujos_navegacion.md` con rutas reales
- [ ] **1.13** Actualizar `16_implementacion_incremental.md` con estado real

### 🟡 Fase 2 — Alto (Siguiente sprint)

#### Refactor Admin
- [ ] **2.1** Refactorizar `adminUtils.ts` (373 líneas) en módulos más pequeños si es necesario
- [ ] **2.2** Refactorizar `admin/users.astro` (>596 líneas)
- [ ] **2.3** Migrar `window.__*` a event delegation
- [ ] **2.4** Reemplazar `confirm()` con `ConfirmModal.astro`
- [ ] **2.5** Agregar spinner en botones de modal

#### Shared Utilities
- [ ] **2.6** Crear `src/lib/shared/escapeHtml.ts`
- [ ] **2.7** Crear `src/lib/shared/toast.ts` con API unificada
- [ ] **2.8** Crear `src/lib/shared/authGuard.ts`
- [ ] **2.9** Crear `src/lib/shared/logger.ts`
- [ ] **2.10** Unificar `getRoleBadge()`, `getUserInitial()`, `formatDate()`, `renderLoadingState()`

#### Documentación Trainer
- [ ] **2.11** Crear `nuevo_proyecto/20_modulo_trainer.md`
- [ ] **2.12** Actualizar `00_indice.md` con nuevo documento
- [ ] **2.13** Actualizar `08_modulo_autenticacion.md` con archivos reales
- [ ] **2.14** Actualizar `09_modulo_cliente.md` con `client/settings.astro`
- [ ] **2.15** Actualizar `10_modulo_administracion.md` con `admin/clients.astro`, `admin/trainers.astro`

#### Testing
- [ ] **2.16** Actualizar `12_guia_desarrollo_testing.md` con lista real de tests
- [ ] **2.17** Crear tests E2E básicos (login, register)

### 🟢 Fase 3 — Medio (Backlog)

#### UI/UX
- [ ] **3.1** Crear `EmptyState.astro`, `LoadingSpinner.astro`, `LoadingScreen.astro`
- [ ] **3.2** Crear `ConfirmModal.astro`
- [ ] **3.3** Crear `Icon.astro` para SVGs reutilizables
- [ ] **3.4** Unificar settings pages con `SettingsShell.astro`
- [ ] **3.5** Simplificar layouts con layout base

#### Integraciones
- [ ] **3.6** Configurar Firebase Hosting
- [ ] **3.7** Implementar Cloudflare R2 + Worker
- [ ] **3.8** Configurar GitHub Actions
- [ ] **3.9** Configurar Sentry
- [ ] **3.10** Configurar PostHog

#### Testing avanzado
- [ ] **3.11** Tests E2E completos (todos los flujos)
- [ ] **3.12** Tests de integración con Firebase Emulator
- [ ] **3.13** Tests para todas las páginas admin nuevas

#### Limpieza
- [ ] **3.14** Eliminar `src/lib/client/chatService.ts` (wrapper innecesario)
- [ ] **3.15** Hacer `firestoreDebug.ts` condicional con `import.meta.env.DEV`
- [ ] **3.16** Migrar cleanup de `beforeunload` a `astro:before-swap`

---

## 📊 Resumen de Métricas

| Categoría | 🚨 Crítico | 🟡 Alto | 🟢 Medio | Total |
|-----------|-----------|---------|---------|-------|
| Páginas faltantes | 4 | 0 | 0 | 4 |
| Servicios faltantes | 1 | 0 | 0 | 1 |
| Bugs (de ANALISIS) | 12 | 4 | 0 | 16 |
| Deuda Técnica | 0 | 4 | 9 | 13 |
| Documentación | 3 | 6 | 0 | 9 |
| UI/UX | 0 | 3 | 7 | 10 |
| Testing | 0 | 2 | 3 | 5 |
| Integraciones | 0 | 0 | 5 | 5 |
| **Total** | **20** | **19** | **24** | **63** |

> **Última actualización:** 11/07/2026
> **Próximo paso:** Los agentes deben comenzar con la Fase 1 (Crítico) y marcar los items como completados.
