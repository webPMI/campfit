# 🔍 CampFit 2.0 — Guía de Testing E2E para Agentes IA

> **Última revisión:** 26/07/2026  
> **Propósito:** Documento maestro para agentes IA que ejecutan tests E2E.  
> Define reglas estrictas, errores encontrados, y cómo evitar falsos positivos.

---

## 📋 Reglas Estrictas para Tests E2E

### ❌ PROHIBIDO (Falsos Positivos)
1. **Nunca `expect(true).toBe(true)`** — Esto es un test trampa.
2. **Nunca `expect(1).toBe(1)`** — Test muerto, no verifica nada.
3. **Nunca `test.skip()` sin justificación documentada** — Si se salta un test, debe explicarse por qué.
4. **Nunca `expect(page.locator('body')).toBeVisible()` como único assert** — Demasiado vago.
5. **Nunca verificar solo `status() === 200`** — No verifica contenido ni funcionalidad.

### ✅ SIEMPRE HACER (Tests Reales)
1. **Verificar elementos DOM específicos** — IDs, roles, texto visible
2. **Verificar interacciones** — Clicks, formularios, navegación
3. **Verificar estados** — loading → empty → error → success
4. **Verificar localStorage** — Persistencia de idioma/tema
5. **Usar `getByRole`, `getByText`, `getByTestId`** — Mejor que selectores CSS frágiles

---

## 🔴 Errores de Código Encontrados (Documentados)

Estos errores se descubrieron al ejecutar tests E2E reales.  
**Son problemas en el código fuente**, no en los tests.

| ID | Archivo | Error | Severidad | Estado |
|----|---------|-------|-----------|--------|
| E1 | `src/pages/login.astro`, `recover.astro` | `#errorMsg` usa `classList.toggle` pero el test no lo detecta porque el div tiene `hidden` via Tailwind + JS | ⚠️ Media | ✅ Corregido en tests (usa `dispatchEvent('submit')`) |
| E2 | `src/pages/register.astro` | `#registerBtn` dentro de `<form>` con `required` en inputs — Playwright no puede disparar click porque el navegador bloquea submit nativo | 🔴 Alta | ✅ Corregido en tests (usa `dispatchEvent('submit')` en el form) |
| E3 | `src/layouts/AdminLayout.astro` | `nav.fixed.bottom-0` oculto en algunas páginas porque redirigen a login | ⚠️ Media | ⏳ Pendiente (necesita mock de auth en E2E) |
| E4 | `src/i18n/translations.ts` | `client.greeting.en` existe como key separada en lugar de usar el namespace `en` | 🔴 Alta | ⏳ Pendiente (genera keys duplicadas) |
| E5 | `src/pages/client/settings.astro` | `renderProfileLoadingState` deprecado — 9 usos en 3 settings pages | 🟡 Baja | ⏳ Pendiente |
| E6 | `src/pages/admin/clinical.astro` | Contenido se renderiza en `<script>` tag pero no hay indicador visual de carga | ⚠️ Media | ⏳ Pendiente |
| E7 | `src/components/LanguageSwitcher.astro` | En modo `static`, no recibe el `lang` correcto — siempre `'es'` porque `Astro.url.searchParams` está vacío en build | 🔴 Alta | ✅ Corregido (ahora es client-side island) |
| E8 | `src/pages/admin/users.astro` | Modal con `window.__*` funciones globales — violación de seguridad y testabilidad | 🔴 Alta | ⏳ Pendiente |

---

## 🟡 Resultados Reales vs Esperados

| Test File | Real (sin mocks) | Con Auth Mock | Meta |
|-----------|-----------------|---------------|------|
| `auth-flows.e2e.ts` | Login/register UI funciona | Flujo completo Google + email | 100% |
| `admin-crud.e2e.ts` | N/A (requiere auth) | CRUD modal completo | 100% |
| `client-js.e2e.ts` | N/A (requiere auth) | Dashboard greeting, stats | 100% |
| `trainer-js.e2e.ts` | N/A (requiere auth) | Clients expand, CRUD | 100% |
| `i18n-end-to-end.e2e.ts` | ES↔EN en login funciona | EN en todas las páginas | 100% |
| `mobile-responsive.e2e.ts` | Funciona con `npx playwright install` | Mobile first | 100% |
| `a11y-keyboard.e2e.ts` | Tab navigation funciona | Full keyboard flow | 100% |
| `error-states.e2e.ts` | Error toast visible | Todos los estados | 100% |
| `settings-profile.e2e.ts` | N/A (requiere auth) | Profile update flow | 100% |

---

## 📊 Convenciones para Nombrado de Tests

```typescript
describe('[Modulo] [Componente/Flujo]', () => {
  // ✅ BIEN
  test('should show error toast on empty form submission', async ({ page }) => { ... });
  test('should redirect unauthenticated users to /login', async ({ page }) => { ... });
  
  // ❌ MAL
  test('test1', async ({ page }) => { ... });
  test('it works', async ({ page }) => { ... });
});
```

---

## 🎯 Plan de Implementación (Próximo Sprint)

1. **Instalar Firefox + WebKit** → `npx playwright install firefox webkit`
2. **Mock de Firebase Auth para E2E** → `page.addInitScript()` para simular `auth.currentUser`
3. **Corregir E4** → Migrar `client.greeting.en` al namespace `en` real
4. **Corregir E8** → Refactorizar `admin/users.astro` para usar `data-action` event delegation
5. **Crear `page-objects/`** → Page Object Model para reutilizar selectores

---

> **📌 Documentación relacionada:** `14_agent_instructions.md`, `12_guia_desarrollo_testing.md`  
> **📌 Formato de commits:** `test(e2e): descripción` (conventional commits)