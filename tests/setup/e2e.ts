/**
 * Setup para tests E2E con Playwright.
 * Se ejecuta antes de cada suite de tests E2E.
 *
 * Incluye helpers y configuraciones compartidas para Playwright.
 */

import { test as base, expect, type Page } from '@playwright/test';

// ─── Test extendido con fixtures personalizados ──────────────────────────────

interface TestFixtures {
  /** Página ya autenticada como usuario de prueba */
  authenticatedPage: Page;
}

/**
 * Test extendido con fixtures reutilizables.
 * Úsalo importando desde aquí en lugar de @playwright/test directamente.
 */
export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: undefined, // Sin sesión previa
    });
    const page = await context.newPage();
    await page.goto('/login');

    // Rellenar credenciales de prueba
    await page.fill('[name="email"]', 'test@campfit.app');
    await page.fill('[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Esperar redirección al dashboard
    await page.waitForURL(/\/dashboard/);

    await use(page);
    await context.close();
  },
});

export { expect };
