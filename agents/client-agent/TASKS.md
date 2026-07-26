# 📋 Client Agent TASKS

> **Backlog de tareas del módulo Cliente** — CampFit
>
> Última actualización: 2026-07-25

---

## 🥇 Alta Prioridad

### Tests

- [ ] Tests E2E flujo completo cliente (dashboard → workouts → diets → progress → chat)
- [ ] Tests unitarios chatService.ts (cobertura actual: 59.8% → objetivo: 100%)
- [ ] Tests unitarios profileService.ts (cobertura actual: 44.38% → objetivo: 100%)
- [ ] Tests unitarios onboardingService.ts (cobertura actual: 0% → objetivo: 80%+)
- [ ] Tests unitarios achievementsService.ts
- [ ] Tests unitarios adherenceService.ts
- [ ] Tests unitarios calendarService.ts

### Validaciones pendientes

- [ ] Verificar que medical-profile.astro existe y funciona correctamente
- [ ] Verificar que todas las páginas cliente manejan los 4 estados (loading, empty, error, success)
- [ ] Verificar que todas las suscripciones Firestore tienen cleanup
- [ ] Verificar que todas las consultas Firestore tienen limit(100)
- [ ] Verificar JSDoc completo en todas las funciones públicas de servicios

---

## 🥈 Media Prioridad

### Funcionalidades nuevas

- [ ] Sistema de logros y badges — TODO próximo (achievementsService.ts)
  - [ ] Definir tipos de logros
  - [ ] Implementar lógica de desbloqueo
  - [ ] UI de visualización en dashboard
  - [ ] Tests unitarios
- [ ] Calendario de entrenamientos — TODO próximo (calendarService.ts)
  - [ ] Vista calendario de workouts
  - [ ] Integración con workoutService
  - [ ] Tests unitarios
- [ ] Seguimiento de adherencia — TODO próximo (adherenceService.ts)
  - [ ] Métricas de cumplimiento
  - [ ] Estadísticas semanales/mensuales
  - [ ] Tests unitarios

---

## 🥉 Baja Prioridad

### Deuda técnica

- [ ] Revisar dependencias circulares entre servicios cliente
- [ ] Estandarizar nombres de funciones entre servicios
- [ ] Documentar flujos complejos en GUIDE.md
- [ ] Simplificar lógica repetitiva en páginas .astro

---

## 📊 Progreso General del Módulo Cliente

| Área | Estado | Cobertura Tests |
|------|--------|----------------|
| Páginas cliente (8 páginas) | ✅ Completado | — |
| chatService.ts | ✅ Implementado | ⚠️ 59.8% |
| dietService.ts | ✅ Implementado | ✅ 100% |
| progressService.ts | ✅ Implementado | ✅ 100% |
| workoutService.ts | ✅ Implementado | ✅ 100% |
| clientInit.ts | ✅ Implementado | — |
| onboardingService.ts | ✅ Implementado | ❌ 0% |
| achievementsService.ts | 🟠 Implementado (esqueleto) | ❌ Sin tests |
| adherenceService.ts | 🟠 Implementado (esqueleto) | ❌ Sin tests |
| calendarService.ts | 🟠 Implementado (esqueleto) | ❌ Sin tests |
| profileService.ts | ✅ Implementado (compartido) | ⚠️ 44.38% |

---

## 🔗 Referencias

- GUIDE.md — Contexto completo del módulo cliente
- RULES.md — Reglas específicas a seguir
- CHECKLIST.md — Checklist paso a paso para cada tarea
- __master.md — Registro maestro de agentes

---

> **Mantenido por:** Client Agent — CampFit
