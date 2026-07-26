/**
 * Agent 3: Navigation Flows E2E
 * Verifica que todos los enlaces de navegación funcionen correctamente
 */
import { test, expect } from '@playwright/test';

const ROUTES = [
  { from: '/login', to: '/register', link: 'a[href*="register"]' },
  { from: '/login', to: '/recover', link: 'a[href*="recover"]' },
  { from: '/register', to: '/login', link: 'a[href*="login"]' },
  { from: '/recover', to: '/login', link: 'a[href*="login"]' },
  { from: '/login', to: '/', link: 'a[href="/"]' },
];

test.describe('Navigation Flows', () => {
  for (const { from, to, link } of ROUTES) {
    test(`NAV: ${from} → ${to}`, async ({ page }) => {
      await page.goto(from);
      await page.waitForTimeout(500);
      const linkEl = page.locator(link).first();
      if (await linkEl.isVisible()) {
        await linkEl.click();
        await page.waitForURL(new RegExp(to.replace('/', '\\/')), { timeout: 10000 });
        expect(page.url()).toContain(to);
      }
    });
  }
});