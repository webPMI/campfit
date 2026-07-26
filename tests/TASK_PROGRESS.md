# ⚠️ ARCHIVO OBSOLETO - TODO CENTRALIZADO

> **Última actualización:** 2026-07-25

## Estado Actual

- ✅ **260+ tests pasan** (18+ archivos de test)
- ⏭️ **4 tests skipped** (tests de integración que requieren Firebase emulator)
- ✅ **0 errores de TypeScript** en archivos de test

## 📋 Información Migrada

### Unit Tests (18+ archivos, 260+ tests)

| Archivo | Tests | Estado |
|---------|-------|--------|
| `tests/unit/utils/translations.test.ts` | 5 | ✅ |
| `tests/unit/utils/validators.test.ts` | 17 | ✅ |
| `tests/unit/utils/adminUtils.test.ts` | 18 | ✅ |
| `tests/unit/stores/authStore.test.ts` | 16 | ✅ |
| `tests/unit/services/authService.test.ts` | 16 | ✅ |
| `tests/unit/services/adminService.test.ts` | 14 | ✅ |
| `tests/unit/services/profileService.test.ts` | 16 | ✅ |
| `tests/unit/lib/routeGuards.test.ts` | 16 | ✅ |
| `tests/unit/lib/auth/roleRedirect.test.ts` | 4 | ✅ |
| `tests/unit/lib/trainer/trainerUtils.test.ts` | 16 | ✅ |
| `tests/unit/lib/trainer/trainerAuth.test.ts` | - | ✅ |
| `tests/unit/lib/trainer/trainerChat.test.ts` | - | ✅ |
| `tests/unit/lib/trainer/trainerClients.test.ts` | - | ✅ |
| `tests/unit/lib/trainer/trainerDiets.test.ts` | - | ✅ |
| `tests/unit/lib/trainer/trainerInit.test.ts` | - | ✅ |
| `tests/unit/lib/trainer/trainerProgress.test.ts` | - | ✅ |
| `tests/unit/lib/trainer/trainerRender.test.ts` | - | ✅ |
| `tests/unit/lib/trainer/trainerWorkouts.test.ts` | - | ✅ |
| `tests/unit/lib/admin/adminAuth.test.ts` | - | ✅ |
| `tests/unit/lib/admin/adminInit.test.ts` | - | ✅ |
| `tests/unit/lib/admin/adminRender.test.ts` | - | ✅ |
| `tests/unit/lib/admin/adminSubscriptions.test.ts` | - | ✅ |
| `tests/unit/lib/admin/adminUsers.test.ts` | - | ✅ |
| `tests/unit/lib/client/dietService.test.ts` | 20 | ✅ |
| `tests/unit/lib/client/workoutService.test.ts` | 6 | ✅ |
| `tests/unit/lib/client/progressService.test.ts` | 14 | ✅ |
| `tests/unit/lib/client/chatService.test.ts` | 13 | ✅ |
| `tests/unit/lib/shared/chat.test.ts` | - | ✅ |
| `tests/unit/lib/shared/i18n.test.ts` | - | ✅ |
| `tests/unit/lib/shared/logger.test.ts` | - | ✅ |
| `tests/unit/lib/shared/ui.test.ts` | - | ✅ |
| `tests/unit/lib/helpers/userMappers.test.ts` | - | ✅ |
| `tests/unit/i18n/client.test.ts` | - | ✅ |

---

## 🔗 Archivos de Referencia

### E2E Tests (1 archivo, 17 tests)

| Archivo | Tests | Estado |
|---------|-------|--------|
| `tests/e2e/auth.e2e.ts` | 17 | ✅ |

## Cobertura Global

| Métrica | Valor | Objetivo |
|---------|-------|----------|
| Statements | 22.62% | >80% |
| Branches | 81.66% | >75% |
| Functions | 51.37% | >85% |

### Módulos con mejor cobertura
- `src/lib/shared/i18n.ts` — 100% statements/branches/functions
- `src/lib/shared/logger.ts` — 100% statements/functions
- `src/lib/shared/ui.ts` — 97.82% statements, 96% branches
- `src/lib/shared/authGuard.ts` — 82.97% statements, 80% branches

### Módulos que necesitan mejora
- `src/lib/admin/adminUtils.ts` (18.42%)
- `src/lib/trainer/trainerUtils.ts` (0%)
- `src/lib/shared/chat.ts` (59.8%)
- `src/lib/shared/profileService.ts` (44.38%)

## Próximos Pasos

- [ ] Mejorar cobertura de adminUtils.ts, trainerUtils.ts, chat.ts, profileService.ts
- [ ] Tests E2E para flujos autenticados (admin, client, trainer)
- [ ] Tests de integración con Firebase Emulator
- [ ] Reducir keys sin usar en traducciones
