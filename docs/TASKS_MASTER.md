# 🎯 CampFit — Lista Maestra de Tareas Pendientes (Single Source of Truth)

> **Propósito:** Este archivo es el ÚNICO registro autoritativo de lo que FALTA por hacer en la plataforma.
> No decimos "100% completado" si hay work pendiente. Cada tarea tiene estado verificable.
>
> **Última actualización:** `2026-08-16 00:10 CEST`
> **Estado de verificación automática:** Tests `684 passed / 4 skipped` · Build `39 páginas` · Deploy live ✅

---

## 📊 Leyenda de Estados

| Badge | Significado |
| :--- | :--- |
| 🔴 `[PENDIENTE]` | No empezado / bloqueado |
| 🟡 `[EN PROGRESO]` | Parcialmente hecho, requiere continuación |
| 🟢 `[COMPLETADO]` | Hecho y verificado (tests/build/deploy) |
| ⚪ `[BACKLOG]` | Idea futura, sin prioridad asignada |

---

## 🔥 P0 — Logging & Observabilidad (Fase 2 del sistema de logs)

| # | Tarea | Archivos / Área | Estado | Notas |
| :--- | :--- | :--- | :---: | :--- |
| L1 | **Integrar `logService` en `logger.error()`** | `src/lib/shared/logger.ts` | 🟡 | `warn()` ya enchufado (fire-and-forget). Falta `error()` para capturar excepciones no manejadas en cliente. |
| L2 | **Cloud Function de retención 90/30/7 días** | `functions/` (nuevo) | 🔴 | Requiere crear `functions/`, instalar `firebase-functions`, escribir scheduled function que borre `app_logs` según `level`/`timestamp`. No hay dir actualmente. |
| L3 | **UI de gestión de tokens rotativos para IA** | `src/pages/admin/logs.astro` | 🔴 | Endpoint `/api/admin/logs/token` existe. Falta pantalla para generar/revocar/copiar tokens con alcance `logs:read`. |
| L4 | **Panel `/admin/logs`: paginación real + filtro por fecha** | `src/pages/admin/logs.astro` | 🟡 | Query básica OK; falta cursor `startAfter` en el cliente y rango de fechas. |
| L5 | **Alertas por email en `critical`** | `src/lib/shared/logService.ts` | 🔴 | Diseño definido en `docs/DESIGN_logging_firebase.md`; falta trigger (Cloud Function o API route con SMTP). |

---

## 🎨 P1 — Navegación Admin & UX

| # | Tarea | Archivos / Área | Estado | Notas |
| :--- | :--- | :--- | :---: | :--- |
| N1 | **Rediseño navbar admin: `Tools` como contenedor con sub-tabs (Logs, Deploy, DevTools)** | `src/layouts/AdminLayout.astro` | 🟡 | `/admin/dashboard` ya es hub con tabs. Falta mover el bottom-nav a un patrón superior/lateral responsive con `Tools` agrupando Logs/Deploy/DevTools. |
| N2 | **Responsividad del navbar admin** | `src/layouts/AdminLayout.astro` | 🟡 | Bottom-nav de 7+ ítems en móvil es apretado. Evaluar collapse a menú lateral/burger en <640px. |
| N3 | **Unificar `Settings` dentro de `Tools` o mantener separado** | `src/layouts/AdminLayout.astro` | ⚪ | Decisión de diseño pendiente tras N1. |

---

## 🏗️ P2 — Backend & Infraestructura

| # | Tarea | Archivos / Área | Estado | Notas |
| :--- | :--- | :--- | :---: | :--- |
| B1 | **Configurar `functions/` y CI de deploy de Functions** | `firebase.json`, `functions/` | 🔴 | Necesario para L2 y L5. |
| B2 | **Limpiar errores de type-check preexistentes** | `src/pages/trainer/workouts.astro` y otros (~50 err globales) | 🔴 | No bloquean runtime ni tests, pero ensucian el pipeline. Reportados en auditorías previas. |
| B3 | **Resolver duplicados TS1117 en i18n** | `src/i18n/locales/*.ts` | 🔴 | Hay claves repetidas (líneas 445, 687, etc. en es.ts). El build las resuelve por última, pero es frágil. |
| B4 | **Variables muertas reportadas** | `admin/dashboard.astro`, `admin/users.astro`, `client/diets.astro`, `progress.astro`, `support.astro` | 🟡 | No rompen, pero hay `statTotalWorkouts`, `medicalProfileData` sin uso. Limpieza cosmética. |

---

## 🧪 P3 — Calidad & Testing

| # | Tarea | Archivos / Área | Estado | Notas |
| :--- | :--- | :--- | :---: | :--- |
| Q1 | **Activar 4 tests skipped de `auth.flow.test.ts`** | `tests/` | 🔴 | Placeholders; requieren entorno de auth real o mocks. |
| Q2 | **Aumentar cobertura de `logService` / APIs de logs** | `tests/unit/lib/shared/logService.test.ts` | 🟢 | Tests unitarios añadidos en Fase 2. |
| Q3 | **Tests E2E de la fusión users/clients** | `tests/e2e/` (nuevo) | 🔴 | Verificar redirección `/admin/clients` → `/admin/users` y chips en CI. |

---

## 🚀 P4 — Backlog de Oportunidades (sin prioridad)

1. 🔔 **Notificaciones Push (FCM/PWA)** — avisar al cliente al asignarse rutina/dieta.
2. ⌚ **Sync Wearables** — Apple Health / Google Fit (pasos, HR, kcal).
3. 🤖 **Asistente IA para entrenadores** — sugerencias de recetas/ejercicios por perfil médico.
4. 💬 **Mensajería multimedia en chat** — notas de voz y fotos de ejecución.
5. 📊 **Dashboard de analytics para admin** — retención, activos diarios, churn.

---

## 🔗 Cómo actualizar este archivo

Toda tarea nueva se añade aquí con su `#` y estado. Al completarse, cambiar badge a 🟢 y
registrar en `TASK.md` (historial de agentes) + `CHANGELOG.md`.

> ⚠️ **Regla:** Si una tarea está en 🔴/🟡, el estado global NUNCA debe decir "100% completado".
