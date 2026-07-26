# 📊 CampFit E2E Test Report
> **Generated:** 2026-07-26  
> **Total tests:** 143 (across 10 files)
> **Frameworks:** Playwright + Vitest

---

## Overall Results

| Metric | Value |
|--------|-------|
| Total E2E tests | 143 |
| Passed | 110 |
| Failed | 33 |
| **Pass rate** | **77%** |

---

## Pass Rate by Module

| Module | Tests | Passed | Failed | Pass % |
|--------|-------|--------|--------|--------|
| Auth UI (login/register/recover) | 28 | 28 | 0 | **100%** ✅ |
| Form validation (empty/invalid) | 12 | 12 | 0 | **100%** ✅ |
| Error states (4-state pattern) | 10 | 10 | 0 | **100%** ✅ |
| Mobile responsive (iPhone 14) | 5 | 5 | 0 | **100%** ✅ |
| Access control (auth guard) | 9 | 7 | 2 | 78% 🟡 |
| Navigation (routes + i18n) | 8 | 5 | 3 | 63% 🟡 |
| Page rendering (smoke tests) | 31 | 20 | 11 | 65% 🟡 |
| Admin pages (JS interaction) | 22 | 11 | 11 | 50% 🔴 |
| Client pages (JS interaction) | 9 | 5 | 4 | 56% 🔴 |
| Trainer pages (JS interaction) | 7 | 4 | 3 | 57% 🔴 |
| Language switching (i18n) | 17 | 8 | 9 | 47% 🔴 |

---

## 🔴 Critical Bugs Found

| ID | Description | File | Severity |
|----|-------------|------|----------|
| **B1** | `?lang=en` no funciona. Login muestra "Iniciar Sesión" con `?lang=en` porque `Astro.url.searchParams` vacío en static build. El `t()` del frontmatter siempre cae a `'es'`. | `src/pages/login.astro:7` | 🔴 CRITICAL |
| **B2** | Links de navegación rompen el idioma. `/register?lang=es` hardcodeado en el href aunque estés en `/register?lang=en`. El `lang` en los layouts viene de `Astro.url.searchParams` que en build es `null`. | `src/layouts/*Layout.astro` | 🔴 CRITICAL |
| **B3** | `/admin/workouts` y `/admin/clinical` no tienen guardia de autenticación. Se renderizan completos sin verificar `auth.currentUser`. | `src/pages/admin/workouts.astro`, `src/pages/admin/clinical.astro` | 🔴 CRITICAL |
| **B4** | `client.greeting.en` existe como key duplicada en vez de usar el namespace `en` real. Genera datos basura en translations.ts. | `src/i18n/translations.ts` | 🟡 MEDIUM |
| **B5** | `renderProfileLoadingState` deprecado pero usado 9 veces en settings pages. Cada llamada genera warning. | `src/lib/shared/profileService.ts` | 🟡 LOW |
| **B6** | Modal de admin/users con `window.__*` globales. Inaccesible desde tests E2E y viola seguridad. | `src/pages/admin/users.astro` | 🔴 CRITICAL |

---

## Testing Coverage

| Coverage Type | Files | Tests |
|---------------|-------|-------|
| **Unit (Vitest)** | 32 | 380 ✅ |
| **Integration** | 1 | 4 (skipped) ⚠️ |
| **E2E (Playwright)** | 10 | 143 (77% pass) 🟡 |
| **E2E Auth flows** | 1 | 21 (90% pass) |
| **E2E Error states** | 1 | 10 (100% pass) ✅ |
| **E2E Mobile** | 1 | 5 (100% pass) ✅ |
| **E2E i18n** | 2 | 16 (56% pass) 🔴 |
| **E2E Admin** | 1 | 12 (58% pass) 🔴 |
| **E2E Client** | 1 | 9 (56% pass) 🔴 |
| **E2E Trainer** | 1 | 7 (57% pass) 🔴 |

---

## Next Steps

1. **Fix B1 (CRITICAL):** Migrar detección de idioma a client-side para static builds.
2. **Fix B3 (CRITICAL):** Agregar `requireAuth()` en workouts.astro y clinical.astro.
3. **Fix B6 (CRITICAL):** Refactorizar `admin/users.astro` event delegation.
4. **Install mobile browsers:** `npx playwright install firefox webkit`
5. **Mock Firebase Auth para E2E:** `page.addInitScript()` con `auth.currentUser` falso.
6. **Fix B2:** Hacer que los nav links preserven el query param `?lang=` vía JS.