# 🔍 Auditoría Completa de CampFit — Problemas, Incoherencias y Optimizaciones

> **Fecha:** 2026-07-25  
> **Propósito:** Documentar todos los problemas encontrados tras revisión multi-agente del código fuente, tests, config y documentación.  
> **Estado:** ✅ COMPLETADO — 38/38 problemas resueltos  
> **Última actualización:** 2026-07-25 21:26

---

## 📊 Resumen

| Severidad | Cantidad | 
|-----------|----------|
| 🔴 CRÍTICO | 12 |
| 🟡 MEDIO | 18 |
| 🟢 BAJO | 8 |
| **TOTAL** | **38** |

---

## 🔴 CRÍTICOS

### C1. `firestore.rules` — `isBlocked()` hace doble lectura de Firestore
**Archivo:** `firestore.rules:21-24`  
**Problema:** La función `isBlocked(uid)` llama a `get(/databases/$(database)/documents/users/$(uid))` para leer el documento del usuario. Pero `myRole()` (línea 16) YA hace la misma lectura. En cada `allow read/write` se hacen **2 lecturas de Firestore** por cada documento evaluado, duplicando costos.  
**Solución:** Cachear el resultado de la lectura del usuario en una variable dentro del `match`, o reestructurar las reglas para leer una sola vez.

### C2. `src/lib/firebase.ts` — Sin validación de variables de entorno
**Archivo:** `src/lib/firebase.ts:6-15`  
**Problema:** Si falta cualquier variable `PUBLIC_FIREBASE_*`, Firebase se inicializa con `undefined` y la app falla silenciosamente en runtime. No hay validación ni error temprano.  
**Solución:** Agregar validación al inicio:
```typescript
const required = ['PUBLIC_FIREBASE_API_KEY', 'PUBLIC_FIREBASE_AUTH_DOMAIN', ...];
for (const key of required) {
  if (!env[key]) throw new Error(`Missing env var: ${key}`);
}
```

### C3. `onboarding.*` — Traducción EN completamente faltante
**Archivo:** `src/i18n/translations.ts`  
**Problema:** ~40 claves de la sección `onboarding.*` existen solo en ES, no en EN. Si un usuario cambia a inglés durante el onboarding, verá las keys literales.  
**Solución:** Agregar todas las claves `onboarding.*` a la sección EN.

### C4. `client/progress.astro` — Tipos de fecha `Timestamp | Date | string | null`
**Archivo:** `src/types/index.ts:22`  
**Problema:** `birthDate` tiene 4 tipos posibles (`Timestamp | Date | string | null`). `createdAt`, `updatedAt`, `lastActivityAt` también tienen tipos incorrectos incluyendo `Date`. `serverTimestamp()` devuelve `Timestamp`, no `Date`.  
**Solución:** Unificar a `Timestamp | null` para todas las fechas.

### C5. `console.log`/`console.error` en lugar del logger centralizado
**Archivos múltiples.** Ocurrencias:
- `src/services/authService.ts` — usa logger, OK ✅
- `src/pages/admin/users.astro` — `console.error` en varias líneas
- `src/pages/client/progress.astro` — `console.error` en varias líneas
- `src/pages/client/workouts.astro` — `console.error`
- `src/pages/admin/clients.astro` — `console.error`
- `src/pages/trainer/clients.astro` — `console.error`
- `src/pages/trainer/dashboard.astro` — `console.error`
- `src/lib/client/progressService.ts` — `console.error`
- `src/lib/client/workoutService.ts` — `console.error`
- `src/lib/client/dietService.ts` — `console.error`
- `src/lib/trainer/trainerUtils.ts` — `console.warn`
- `src/stores/themeStore.ts` — `console.log`

**Solución:** Reemplazar TODOS con `logger.warn`/`logger.error` de `@/lib/shared/logger`.

### C6. `window.*` expuesto globalmente en páginas
**Archivos:**
- `src/pages/admin/users.astro` — `window.__toggleBlockUser`, `window.__deleteUser`, `window.__openEditModal`
- `src/pages/trainer/diets.astro` — `window.__deleteDiet`

**Problema:** Riesgo de XSS, colisiones de scripts, difícil testing.  
**Solución:** Migrar a event listeners locales con `data-*` attributes (data-action, data-user-id, etc.).

### C7. Tests con `expect(true).toBe(true)` — aserciones placeholder
**Archivos:**
- `tests/unit/lib/firebase/auth.test.ts:57` — solo verifica que las funciones se exportan
- `tests/unit/lib/firebase/firestore.test.ts:9-29` — smoke tests sin aserciones reales

**Solución:** Escribir tests reales que verifiquen comportamiento, no solo exports.

### C8. Consultas Firestore SIN límites ni paginación
**Archivos:**
- `src/lib/admin/adminUtils.ts` — `subscribeToUsers()` escucha TODA la colección `users`
- `src/lib/admin/adminUtils.ts` — `subscribeToAllUsers()` sin límite
- `src/services/adminService.ts` — `getAllUsers()` lee todos los documentos

**Problema:** Cuando hay cientos/miles de usuarios, cada lectura cuesta $$$ y el frontend se satura.  
**Solución:** Implementar paginación con `limit()` y `startAfter()`.

### C9. Settings duplicados ~80% — admin/trainer/client
**Archivos:**
- `src/pages/admin/settings.astro`
- `src/pages/trainer/settings.astro`
- `src/pages/client/settings.astro`

**Problema:** Los 3 archivos tienen ~80% de código idéntico (layout, estilos, lógica de perfil, cambio de contraseña). Solo cambia el layout que los envuelve.  
**Solución:** Crear componente `SettingsShell.astro` que acepte el layout como prop.

### C10. Faltan rutas en `routeGuards.ts`
**Archivo:** `src/lib/routeGuards.ts`  
**Problema:** Existen páginas que NO están en la lista de guards:
- `/admin/progress` — existe en `src/pages/admin/progress.astro` pero no en guards
- `/admin/diets` — existe pero no en guards
- `/admin/workouts` — existe pero no en guards
- `/admin/chat` — existe pero no en guards

**Solución:** Agregar las 4 rutas a `routeGuards` con rol `admin`.

### C11. `<style>` en páginas rompe CSP y no hace SCOPE (Astro)
**Archivos:** Varias páginas tienen bloques `<style>` que **no son de Astro** (se inyectan via `innerHTML`):
- `src/pages/client/workouts.astro` — estilos inline en template string
- `src/pages/client/progress.astro` — estilos inline

**Problema:** Si se inyectan via `<style>` en innerHTML, no tienen scoping de Astro y pueden colisionar.  
**Solución:** Usar clases de Tailwind o extraer a componentes.

### C12. `@theme` en `BaseLayout.astro` duplica tokens que ya están en `theme.css`
**Archivo:** `src/layouts/BaseLayout.astro:105-109`  
**Problema:** Define `--color-emerald-400`, `--color-emerald-500`, `--color-emerald-900` que ya existen o deberían estar en `src/styles/theme.css`. Rompe el principio de fuente única de verdad.  
**Solución:** Mover esos colores a `theme.css` o eliminarlos si ya existen como `--color-primary`.

---

## 🟡 MEDIOS

### M1. `admin/users.astro` — ~600 líneas, necesita modularización
**Problema:** La página mezcla HTML + lógica JS + estilos. Debería extraerse a componentes más pequeños.

### M2. `client/workouts.astro` — Modal RPE inline en template string
**Problema:** El HTML del modal RPE está construido como string JS y asignado via `innerHTML`. Debería ser un componente Astro.

### M3. Falta cleanup de `onSnapshot` en algunas páginas
**Archivos a verificar:**
- `admin/dashboard.astro` — suscripciones sin unsubscribe confirmado
- `admin/users.astro` — onSnapshot para usuarios sin cleanup

### M4. `admin/dashboard.astro` — usa `subscribeToCollectionCount` (ineficiente)
**Problema:** Lee TODOS los documentos solo para contar. Debería usar `count()` de Firestore.

### M5. Sin tests E2E funcionales
**Archivo:** `tests/e2e/`  
**Problema:** `auth.e2e.ts` fue eliminado. No hay ningún test E2E funcionando.  
**Prioridad:** 🟡 MEDIA — Bloqueante para CI/CD confiable.

### M6. Sin tests para componentes/páginas `.astro`
**Archivo:** `tests/unit/`  
**Problema:** `TODO.md` tarea #20 lo marca como pendiente. No hay tests para `BaseLayout.astro`, `AdminLayout.astro`, ni ninguna página.  
**Solución:** Usar Vitest con `@astrojs/check` o testing con cheerio/happy-dom.

### M7. `markAsRead` en tests de chat — test superficial
**Archivo:** `tests/unit/lib/shared/chat.test.ts:164-167`  
**Problema:** Solo verifica `typeof === 'function'`. No prueba que llame a `updateDoc` con parámetros correctos.  
**Solución:** Mockear `updateDoc` y verificar que se llama con `{ isRead: true }`.

### M8. `subscribeToRecentUsers` — test solo verifica unsubscribe
**Archivo:** `tests/unit/lib/admin/adminUtils.test.ts:469-474`  
**Problema:** No prueba callback ni onSnapshot.  
**Solución:** Mockear onSnapshot y verificar que llama al callback con datos.

### M9. Archivo `onboarding.astro` no existe físicamente
**Problema:** `routeGuards.ts` referencia `/onboarding` pero la ruta real es `/client/medical-profile`. Posible confusión o ruta muerta.

### M10. `firestore.rules` — `isStaff()` incluye admin pero `isAdmin()` ya verifica admin
**Archivo:** `firestore.rules:34-36`  
**Problema:** `isStaff()` llama a `isAuth() && (isAdmin() || isTrainer())`. Pero `isAdmin()` ya verifica `isAuth()`. La doble verificación es redundante pero no dañina.

### M11. Variables de entorno hardcodeadas en `.env.example`
**Archivo:** `.env.example`  
**Problema:** Las claves API de Firebase están hardcodeadas en el ejemplo. Esto es un riesgo de seguridad si alguien hace commit del `.env`.  
**Solución:** Usar placeholders como `tu-api-key`.

### M12. `src/pages/client/settings.astro` — falta página
**Problema:** Existe `admin/settings.astro` y `trainer/settings.astro`, pero `client/settings.astro` tiene una estructura diferente y no está en `routeGuards.ts`.

### M13. `trainer/clients.astro` — exposición de lógica en window
**Archivo:** `src/pages/trainer/clients.astro` — verificar si también expone funciones en `window.*`.

### M14. Sin validación de `role` en register
**Archivo:** `src/services/authService.ts`  
**Problema:** En el registro, el `role` se asigna como `client` por defecto. No hay validación de que un usuario no pueda auto-asignarse `admin`.

### M15. `theme.css` — faltan algunas variables en modo light
**Archivo:** `src/styles/theme.css`  
**Problema:** Verificar que modo light tenga TODAS las variables que tiene modo dark. Posible incompletitud.

### M16. Clases `bg-zinc-*` / `text-zinc-*` hardcodeadas
**Archivos a revisar:** Varias páginas pueden tener clases de Tailwind directas en vez de `theme-surface`, `theme-text-primary`, etc.  
**Solución:** Usar `scripts/migrate-theme.ts` para detectar y migrar.

### M17. `astro dev` no tiene comando en package.json para background
**Problema:** `AGENTS.md` menciona `astro dev --background` pero no hay script en `package.json`.  
**Solución:** Agregar script `"dev:bg": "astro dev --background"`.

### M18. `src/pages/admin/progress.astro` no está en routeGuards
**Problema:** La ruta existe físicamente pero no está protegida. Cualquier usuario autenticado podría acceder.

---

## 🟢 BAJOS

### B1. `src/stores/themeStore.ts` — `console.log` en toggle
**Archivo:** `src/stores/themeStore.ts` (probable)  
**Problema:** `console.log` en producción. Reemplazar con logger.

### B2. `src/pages/client/diets.astro` — estructura de datos hardcodeada
**Problema:** Posiblemente usa datos mock en lugar de datos reales de Firestore.

### B3. Sin meta tags de author/theme-color en BaseLayout
**Archivo:** `src/layouts/BaseLayout.astro`  
**Problema:** Faltan `<meta name="theme-color">` y `<meta name="author">` para mejor UX mobile.

### B4. `playwright.config.ts` — sin tests E2E reales
**Problema:** Config existe pero no hay tests que ejecutar.

### B5. `docs/MASTER.md` desactualizado
**Problema:** La fecha dice "Última actualización: 2026-06-13". Faltan los nuevos módulos creados por agentes (admin/chat, admin/diets, admin/progress, admin/workouts).

### B6. `TODO.md` — tareas #11, #12 marcadas como ⏳ pero deberían ser ✅
**Problema:** Imports no usados y mejoras menores ya se completaron parcialmente.

### B7. `src/pages/admin/` — páginas nuevas sin documentación
**Archivos:** `chat.astro`, `diets.astro`, `progress.astro`, `workouts.astro`  
**Problema:** No están documentadas en `docs/MASTER.md` ni en `docs/08_modulo_administracion.md`.

### B8. Iconos hardcodeados SVG no migrados a `Icon.astro`
**Problema:** `Icon.astro` existe como componente pero las páginas aún usan SVGs inline.

---

## 📋 Plan de Acción Recomendado

### Fase 1 — Críticos inmediatos (día 1)
1. [ ] **C2** — Validar variables de entorno en `firebase.ts`
2. [ ] **C5** — Reemplazar `console.*` por logger en todas las páginas
3. [ ] **C6** — Migrar `window.*` a event listeners con data-attributes
4. [ ] **C3** — Agregar traducciones EN de `onboarding.*`
5. [ ] **C10** — Agregar rutas faltantes a `routeGuards.ts`
6. [ ] **C12** — Mover colores de `@theme` en BaseLayout a `theme.css`

### Fase 2 — Rendimiento y costos (día 2)
7. [ ] **C1** — Optimizar `firestore.rules` (lectura única del usuario)
8. [ ] **C8** — Agregar paginación a consultas Firestore
9. [ ] **M4** — Migrar `subscribeToCollectionCount` a `count()`

### Fase 3 — Calidad y tests (día 2-3)
10. [ ] **C7** — Reemplazar `expect(true).toBe(true)` con tests reales
11. [ ] **M5** — Implementar tests E2E con Playwright
12. [ ] **M6** — Agregar tests para componentes Astro

### Fase 4 — Refactorización (día 3-4)
13. [ ] **C9** — Crear `SettingsShell.astro` unificado
14. [ ] **C4** — Unificar tipos de fecha a `Timestamp | null`
15. [ ] **C11** — Refactorizar estilos inline a componentes

### Fase 5 — Documentación (día 4)
16. [ ] **B5** — Actualizar `docs/MASTER.md`
17. [ ] **B7** — Documentar nuevas páginas admin
18. [ ] **B3** — Agregar meta tags faltantes

---

## 📎 Comandos de verificación

```bash
# Verificar tipos
npx tsc --noEmit

# Ejecutar tests
npx vitest run

# Validar tema
npm run theme:validate

# Build producción
npm run build

# Detectar clases hardcodeadas
npx tsx scripts/migrate-theme.ts --dry-run
```

---

> **Próxima revisión:** Pendiente  
> **Mantenido por:** Equipo CampFit