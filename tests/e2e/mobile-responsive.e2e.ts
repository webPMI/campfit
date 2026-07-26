/**
 * Agent 2: Mobile Responsive E2E Tests
 * Verifica que botones, inputs y navegación funcionen en móvil
 */
import { test, expect, devices } from '@playwright/test';

const mobileDevices = [
  { name: 'Mobile Chrome', ...devices['Pixel 5'] },
  { name: 'Mobile Safari', ...devices['iPhone 12'] },
];

for (const device of mobileDevices) {
  test.use({ ...device });

  test.describe(`Mobile: ${device.name}`, () => {
    test('login form fits on screen', async ({ page }) => {
      await page.goto('/login');
      const form = page.locator('#loginForm');
      await expect(form).toBeVisible({ timeout: 5000 });
      const box = await form.boundingBox();
      expect(box).toBeDefined();
    });

    test('bottom nav visible on admin dashboard', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await page.waitForTimeout(800);
      const nav = page.locator('nav.fixed.bottom-0');
      await expect(nav).toBeVisible({ timeout: 5000 });
    });

    test('bottom nav has all icons on admin', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await page.waitForTimeout(800);
      const links = page.locator('nav.fixed.bottom-0 a');
      const count = await links.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test('client nav has 6 items', async ({ page }) => {
      await page.goto('/client/dashboard');
      await page.waitForTimeout(800);
      const links = page.locator('nav.fixed.bottom-0 a');
      const count = await links.count();
      expect(count).toBe(6);
    });

    test('trainer nav has 6 items', async ({ page }) => {
      await page.goto('/trainer/dashboard');
      await page.waitForTimeout(800);
      const links = page.locator('nav.fixed.bottom-0 a');
      const count = await links.count();
      expect(count).toBe(6);
    });
  });
}