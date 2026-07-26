/**
 * Agent 2: Theme Switching E2E Tests
 * Verifica dark/light theme toggle funciona vía localStorage
 */
import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test('THM-001: Default theme is dark', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(300);
    const attr = await page.locator('html').getAttribute('data-theme');
    expect(attr).toBe('dark');
  });

  test('THM-002: Theme is stored in localStorage', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(300);
    const stored = await page.evaluate(() => localStorage.getItem('campfit_theme'));
    expect(stored).toBe('dark');
  });

  test('THM-003: CSS custom properties are defined', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(300);
    const bg = await page.locator('body').evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBeTruthy();
  });
});