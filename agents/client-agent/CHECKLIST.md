# ✅ Client Agent Checklist

> **Checklist paso a paso para el Agente de Cliente IA** — CampFit

---

## 📋 Pre-Task Setup

- [ ] Leer `GUIDE.md` para refrescar contexto del módulo cliente
- [ ] Leer `RULES.md` para recordar reglas específicas
- [ ] Leer `TASKS.md` para identificar la tarea actual
- [ ] Verificar que no hay otro agente trabajando: `bash scripts/agent-lock.sh check`
- [ ] Adquirir lock: `bash scripts/agent-lock.sh acquire "client-agent" "feature-name"`
- [ ] Hacer pull: `git pull origin master --allow-unrelated-histories --no-edit`
- [ ] Verificar estado del proyecto: `npm run doctor`

---

## 🔍 Análisis del Código

- [ ] Revisar páginas cliente existentes en `src/pages/client/`
- [ ] Verificar estructura y contenido de cada página:
  - [ ] `dashboard.astro`
  - [ ] `workouts.astro`
  - [ ] `diets.astro`
  - [ ] `progress.astro`
  - [ ] `chat.astro`
  - [ ] `support.astro`
  - [ ] `settings.astro`
  - [ ] `medical-profile.astro`
- [ ] Verificar servicios existentes en `src/lib/client/`:
  - [ ] `chatService.ts`
  - [ ] `dietService.ts`
  - [ ] `progressService.ts`
  - [ ] `workoutService.ts`
  - [ ] `clientInit.ts`
  - [ ] `achievementsService.ts`
  - [ ] `adherenceService.ts`
  - [ ] `onboardingService.ts`
  - [ ] `calendarService.ts`
- [ ] Verificar `ClientLayout.astro`
- [ ] Revisar tests unitarios existentes en `tests/unit/lib/client/`
- [ ] Revisar tests E2E existentes en `tests/e2e/`
- [ ] Identificar dependencias entre servicios
- [ ] Revisar colecciones Firestore relevantes

---

## 🛠️ Ejecución de Cambios

- [ ] Crear/actualizar servicios en `src/lib/client/`
- [ ] Asegurar JSDoc en todas las funciones públicas
- [ ] Asegurar `limit(100)` en todas las consultas Firestore
- [ ] Asegurar manejo de 4 estados en cada página
- [ ] Asegurar cleanup de suscripciones Firestore
- [ ] Crear/actualizar tests unitarios
- [ ] Crear/actualizar tests E2E
- [ ] Verificar traducciones i18n si se agregó texto nuevo
- [ ] Ejecutar lint: `npm run lint`
- [ ] Ejecutar type-check: `npm run type-check`
- [ ] Ejecutar tests: `npm test`
- [ ] Ejecutar tests E2E si aplica: `npm run test:e2e`
- [ ] Verificar cobertura si aplica: `npm run test:coverage`

---

## ✅ Validación Final

- [ ] `npm run type-check` sin errores
- [ ] `npm test` todos los tests pasan
- [ ] Nuevos tests cubren funciones agregadas/modificadas
- [ ] Código sigue las reglas de `RULES.md`
- [ ] No hay lógica de negocio en páginas .astro
- [ ] Todas las consultas Firestore tienen `limit()`
- [ ] Todas las suscripciones tienen cleanup
- [ ] Todos los textos visibles usan i18n

---

## 📤 Finalización

- [ ] Liberar lock: `bash scripts/agent-lock.sh release "client-agent"`
- [ ] Hacer commit con mensaje descriptivo: `git commit -m "feat(client): descripción"`
- [ ] Push: `git push origin master`
- [ ] Actualizar `TASKS.md` marcando tareas completadas
- [ ] Actualizar `CHECKLIST.md` si se identifican nuevos pasos

---

> **Mantenido por:** Client Agent — CampFit
