# 📋 Plan de Trabajo, Checklist y Problemas Detectados - CampFit

> **Última actualización:** 2026-07-31  
> **Estado:** Ver `TODO.md` para el plan de acción actualizado

---

## 📑 Índice

1. [Problemas y Deuda Técnica](#1-problemas-y-deuda-técnica)
2. [Checklist de Tareas por Perfil de Agente](#2-checklist-de-tareas-por-perfil-de-agente)
3. [Referencias](#3-referencias)

---

## 1. Problemas y Deuda Técnica

### A. Rendimiento y Escalabilidad en Firestore

| Problema | Prioridad | Estado | Solución |
|-----------|-----------|--------|----------|
| **Lectura masiva sin límites** | Alta | ⚠️ Pendiente | Implementar paginación en `subscribeToUsers` y otras consultas |
| **Recuentos globales ineficientes** | Media | ⚠️ Pendiente | Migrar a `count()` de Firestore para reducir costos |
| **Falta de cleanup en listeners** | Alta | ✅ Resuelto | Desuscripciones implementadas en `beforeunload` y `astro:before-swap` |

**Detalles:**

- **Lectura masiva sin límites:** Funciones como `subscribeToUsers` escuchan toda la colección `users` sin límites ni paginación. Esto será costoso con crecimiento de usuarios.
  - *Solución:* Implementar paginación con `limit()` y `startAfter()` en consultas Firestore.
  
- **Recuentos globales ineficientes:** `subscribeToCollectionCount` lee todos los documentos solo para contarlos.
  - *Solución:* Usar `getCountFromServer()` o agregaciones de Firestore.

### B. Seguridad y Calidad de Código

| Problema | Prioridad | Estado | Solución |
|-----------|-----------|--------|----------|
| **Exposición en objeto global** | Alta | ⚠️ Pendiente | Migrar a data attributes y event listeners |
| **Mensajes de consola en producción** | Media | ⚠️ Pendiente | Reemplazar con logger centralizado |
| **Duplicidad en Settings** | Baja | ⚠️ Pendiente | Crear componente base unificado |
| **Abuso de tipos `any`** | Alta | ✅ Resuelto | Tipos estrictos implementados |
| **Claves i18n huérfanas** | Media | ✅ Resuelto | Claves depuradas |
| **Archivos sobredimensionados** | Media | ⚠️ Pendiente | Refactorizar en componentes más pequeños |
| **Metadatos SEO** | Alta | ✅ Resuelto | Meta tags dinámicos implementados |

**Detalles:**

- **Exposición en objeto global:** `admin/users.astro` y `trainer/diets.astro` exponen funciones a `window`.
  - *Riesgo:* XSS y colisiones de scripts.
  - *Solución:* Usar `data-*` attributes y delegación de eventos.

- **Mensajes de consola:** Múltiples `console.error` en producción.
  - *Solución:* Implementar logger centralizado en todas las vistas.

- **Duplicidad en Settings:** 80% de código idéntico entre `admin/settings.astro`, `trainer/settings.astro` y `client/settings.astro`.
  - *Solución:* Crear componente `SettingsShell.astro` reutilizable.

### C. Brechas Funcionales en el Módulo de Cliente

| Problema | Prioridad | Estado | Solución |
|-----------|-----------|--------|----------|
| **Gráficos de evolución** | Alta | ✅ Resuelto | LineChart SVG implementado |
| **Subida de fotos** | Alta | ✅ Resuelto | Drag-and-drop con Base64 |
| **Botón completado y RPE** | Alta | ✅ Resuelto | Modal RPE 1-10 implementado |

---

## 2. Checklist de Tareas por Perfil de Agente

### 🎨 Perfil 1: Agente Frontend (UI/UX, Layouts y Componentes)

#### Completadas ✅
- [x] **Astro Layout SEO:** Metadatos SEO y Open Graph/Twitter en `BaseLayout.astro`
- [x] **Admin Page - Workouts UI:** Maquetación responsiva para `admin/workouts.astro`
- [x] **Admin Page - Diets UI:** Maquetación responsiva para `admin/diets.astro`
- [x] **Admin Page - Chat UI:** Bandeja de mensajes interactiva para `admin/chat.astro`
- [x] **Admin Page - Progress UI:** Vista de progreso con gráfico SVG en `admin/progress.astro`
- [x] **Client - RPE Modal:** Modal interactivo de feedback RPE en `client/workouts.astro`
- [x] **Client - LineChart Peso:** Gráfico interactivo en `client/progress.astro`
- [x] **Client - Photo Gallery:** Cargador de imágenes y visor de fotos en `client/progress.astro`

#### Pendientes ⚠️
- [ ] **Shared - Shell de Configuración:** Componente unificado para settings de admin, trainer y cliente
  - *Impacto:* Reduce duplicación de código en ~80%
  - *Esfuerzo:* Medio (2-3 días)
  - *Archivos afectados:* `admin/settings.astro`, `trainer/settings.astro`, `client/settings.astro`

---

### ⚙️ Perfil 2: Agente Integración y Datos (Firebase, Firestore y Lógica)

#### Completadas ✅
- [x] **Client - Persistencia de Rutina:** Lógica de guardado de rutina completada y RPE en Firestore
- [x] **Client - Photo Upload:** Servicio de subida y almacenamiento de imágenes en Base64
- [x] **Client - Support Service:** `supportService.ts` para FAQs y búsqueda dinámica
- [x] **TS Strict Types:** Tipos estrictos para marcas de tiempo en `src/types/index.ts`

#### Pendientes ⚠️
- [ ] **Clean Global Context:** Refactorizar exposición a `window` en `admin/users.astro` y `trainer/diets.astro`
  - *Impacto:* Seguridad (previene XSS)
  - *Esfuerzo:* Bajo (1 día)
  - *Archivos afectados:* `admin/users.astro`, `trainer/diets.astro`

- [ ] **Admin - DB Pagination:** Límites y paginación en consultas Firestore
  - *Impacto:* Rendimiento y costos
  - *Esfuerzo:* Medio (2-3 días)
  - *Archivos afectados:* `lib/admin/adminSubscriptions.ts`, `lib/admin/adminUtils.ts`

- [ ] **Admin - Firestore Count:** Migrar recuentos a función `count()` de Firestore
  - *Impacto:* Reduce costos de lectura en ~90%
  - *Esfuerzo:* Bajo (1 día)
  - *Archivos afectados:* `lib/admin/adminSubscriptions.ts`

- [ ] **Refactor - Modularizar Vistas:** Extraer controladores JS inline a archivos TS
  - *Impacto:* Mantenibilidad y testing
  - *Esfuerzo:* Alto (1 semana)
  - *Archivos afectados:* `admin/users.astro` (~600 líneas), `trainer/diets.astro`

---

### 🧪 Perfil 3: Agente Calidad y Mantenimiento (QA, i18n y Testing)

#### Completadas ✅
- [x] **i18n Cleanup:** Depuración de claves de traducción huérfanas
- [x] **Unit Testing:** Cobertura de tests unitarios al 100%

#### Pendientes ⚠️
- [ ] **Logger Production:** Eliminar `console.error` y configurar logger centralizado
  - *Impacto:* Calidad de código y debugging en producción
  - *Esfuerzo:* Bajo (1 día)
  - *Archivos afectados:* Todos los archivos `.astro` con `console.error`

- [ ] **E2E Playwright Flows:** Pruebas de integración para flujos críticos
  - *Impacto:* Calidad y confianza en deploys
  - *Esfuerzo:* Alto (2-3 semanas)
  - *Flujos a cubrir:*
    1. Onboarding completo (registro → perfil médico → dashboard)
    2. Login y autenticación
    3. Registro de peso y progreso
    4. Creación de rutinas (trainer)
    5. Chat 1:1

---

## 3. Referencias

### Documentación Relacionada

- **`docs/MASTER.md`** - Documentación maestra unificada del proyecto
- **`docs/THEME.md`** - Sistema de temas light/dark
- **`docs/ACCESIBILIDAD.md`** - Guía de cumplimiento WCAG 2.1 AA
- **`docs/UI_UX_FINAL_PLAN.md`** - Plan de optimización de motion system
- **`docs/UI_UX_MIGRATION_PLAN.md`** - Plan de migración de componentes de carga
- **`TODO.md`** - Lista centralizada de tareas pendientes

### Comandos Útiles

```bash
# Ver estado de deuda técnica
npm run lint

# Ejecutar tests unitarios
npm test

# Ejecutar tests e2e
npm run test:e2e

# Validación completa
npm run test:ci

# Validar sistema de temas
npm run theme:validate
```

### Priorización

**Alta (hacer primero):**
1. Clean Global Context (seguridad)
2. DB Pagination (rendimiento)
3. Firestore Count (costos)
4. Logger Production (calidad)

**Media (siguiente sprint):**
5. Shell de Configuración (duplicación)
6. E2E Playwright Flows (calidad)

**Baja (backlog):**
7. Modularizar Vistas (mantenibilidad)

---

**Documento creado:** 2026-06-13  
**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit  
**Próxima revisión:** 2026-08-07