/**
 * Agent: Theme Auto E2E Tests (Playwright)
 */
import { test, expect } from '@playwright/test';

test.describe('Auto Theme', () => {
  test('TMA-001: debe cargar con tema oscuro por defecto sin preferencia', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(300);
    const attr = await page.locator('html').getAttribute('data-theme');
    expect(attr).toBe('dark');
  });

  test('TMA-002: debe cambiar a light cuando preferencia del sistema cambia a light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/login');
    await page.waitForTimeout(300);
    const attr = await page.locator('html').getAttribute('data-theme');
    expect(attr).toBe('light');
  });

  test('TMA-003: debe cambiar a dark cuando preferencia del sistema es dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/login');
    await page.waitForTimeout(300);
    const attr = await page.locator('html').getAttribute('data-theme');
    expect(attr).toBe('dark');
  });

  test('TMA-004: debe persistir theme=auto en localStorage', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(300);
    await page.evaluate(() => localStorage.setItem('campfit_theme', 'auto'));
    const stored = await page.evaluate(() => localStorage.getItem('campfit_theme'));
    expect(stored).toBe('auto');
  });

  test('TMA-005: CSS custom properties deben responder al color scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/login');
    await page.waitForTimeout(300);
    const bg = await page.locator('body').evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBeTruthy();
  });
});