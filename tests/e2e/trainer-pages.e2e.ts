/**
 * Agent 5: Trainer Pages E2E Tests
 */
import { test, expect } from '@playwright/test';

test.describe('Trainer Dashboard', () => {
  test('has bottom navigation', async ({ page }) => {
    await page.goto('/trainer/dashboard');
    await page.waitForTimeout(800);
    const nav = page.locator('nav.fixed.bottom-0');
    await expect(nav).toBeVisible({ timeout: 5000 });
  });

  test('has 6 nav items', async ({ page }) => {
    await page.goto('/trainer/dashboard');
    await page.waitForTimeout(800);
    const links = page.locator('nav.fixed.bottom-0 a');
    const count = await links.count();
    expect(count).toBe(6);
  });
});

test.describe('Trainer Clinical', () => {
  test('has search input', async ({ page }) => {
    await page.goto('/trainer/clinical');
    await page.waitForTimeout(800);
    await expect(page.locator('#searchInput')).toBeVisible({ timeout: 5000 });
  });
});

for (const path of ['/trainer/clients', '/trainer/workouts', '/trainer/diets', '/trainer/chat', '/trainer/settings']) {
  test(`${path} renders`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(800);
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });
}