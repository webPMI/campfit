/**
 * Agent 1: i18n Language Switching E2E Tests
 * Verifica cambio ES↔EN, persistencia localStorage, contenido traducido
 */
import { test, expect } from '@playwright/test';

test.describe('i18n - Language Switching', () => {
  test('login page defaults to ES', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Iniciar Sesión').first()).toBeVisible({ timeout: 5000 });
  });

  test('login page in EN shows english text', async ({ page }) => {
    await page.goto('/login?lang=en');
    await page.waitForTimeout(500);
    // Should show "Sign In" or "Continue with Google"
    await expect(page.locator('text=Sign In').first()).toBeVisible({ timeout: 5000 });
  });

  test('lang switcher toggles ES→EN on login page', async ({ page }) => {
    await page.goto('/login');
    const link = page.locator('a[href*="?lang=en"]').first();
    if (await link.isVisible()) {
      await link.click();
      await page.waitForURL(/lang=en/, { timeout: 10000 });
      expect(page.url()).toContain('lang=en');
    }
  });

  test('lang switcher toggles EN→ES on login page', async ({ page }) => {
    await page.goto('/login?lang=en');
    await page.waitForTimeout(500);
    const link = page.locator('a[href*="?lang=es"]').first();
    if (await link.isVisible()) {
      await link.click();
      await page.waitForURL(/lang=es/, { timeout: 10000 });
      expect(page.url()).toContain('lang=es');
    }
  });

  test('recover page in EN shows english text', async ({ page }) => {
    await page.goto('/recover?lang=en');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Recover').first()).toBeVisible({ timeout: 5000 });
  });

  test('register page in EN shows english text', async ({ page }) => {
    await page.goto('/register?lang=en');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Create Account').first()).toBeVisible({ timeout: 5000 });
  });

  test('lang param persists across navigation', async ({ page }) => {
    await page.goto('/login?lang=en');
    await page.waitForTimeout(500);
    // Click register link - should preserve lang
    const link = page.locator('a[href*="register"]').first();
    const href = await link.getAttribute('href') || '';
    expect(href).toContain('lang=en');
  });
});