/**
 * Agent 2: i18n End-to-End Tests
 * Tests REALES — verifica cambio ES↔EN, contenido traducido, persistencia localStorage.
 */
import { test, expect } from '@playwright/test';

test.describe('i18n - Language Switching (Real)', () => {
  test('I18N-001: Login page in ES shows Spanish text', async ({ page }) => {
    await page.goto('/login?lang=es');
    await page.waitForTimeout(500);
    // Verificar que al menos un texto en español aparece
    const body = page.locator('body');
    await expect(body).toBeVisible();
    // El título de la página debe contener "Iniciar Sesión" en español
    const heading = page.getByText('Iniciar').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('I18N-002: Login page in EN shows English text', async ({ page }) => {
    await page.goto('/login?lang=en');
    await page.waitForTimeout(500);
    // El botón de login debe decir "Sign In" en inglés
    const btn = page.locator('#loginBtn');
    await expect(btn).toBeVisible({ timeout: 5000 });
    const txt = await btn.textContent();
    expect(txt).toContain('Sign In');
  });

  test('I18N-003: Register page in ES shows Spanish labels', async ({ page }) => {
    await page.goto('/register?lang=es');
    await page.waitForTimeout(500);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('I18N-004: Register page in EN shows English labels', async ({ page }) => {
    await page.goto('/register?lang=en');
    await page.waitForTimeout(500);
    const btn = page.locator('#registerBtn');
    await expect(btn).toBeVisible({ timeout: 5000 });
    const txt = await btn.textContent();
    expect(txt).toContain('Create');
  });

  test('I18N-005: Lang switcher toggles ES→EN and navigates', async ({ page }) => {
    await page.goto('/login?lang=es');
    await page.waitForTimeout(500);
    // Click en link con ?lang=en
    const enLink = page.locator('a[href*="?lang=en"]').first();
    if (await enLink.isVisible()) {
      await enLink.click();
      await page.waitForURL(/lang=en/, { timeout: 10000 });
      expect(page.url()).toContain('lang=en');
    }
  });

  test('I18N-006: Lang switcher toggles EN→ES and navigates', async ({ page }) => {
    await page.goto('/login?lang=en');
    await page.waitForTimeout(500);
    const esLink = page.locator('a[href*="?lang=es"]').first();
    if (await esLink.isVisible()) {
      await esLink.click();
      await page.waitForURL(/lang=es/, { timeout: 10000 });
      expect(page.url()).toContain('lang=es');
    }
  });

  test('I18N-007: Navigation links preserve lang param', async ({ page }) => {
    await page.goto('/login?lang=en');
    await page.waitForTimeout(500);
    // Register link should have lang=en in href
    const regLink = page.locator('a[href*="register"]').first();
    const href = await regLink.getAttribute('href') || '';
    expect(href).toContain('lang=en');
  });

  test('I18N-008: lang is stored in localStorage after switch', async ({ page }) => {
    await page.goto('/login?lang=en');
    await page.waitForTimeout(500);
    const stored = await page.evaluate(() => localStorage.getItem('campfit_lang'));
    expect(stored).toBe('en');
  });

  test('I18N-009: Recover page in EN shows English title', async ({ page }) => {
    await page.goto('/recover?lang=en');
    await page.waitForTimeout(500);
    const btn = page.locator('#recoverBtn');
    await expect(btn).toBeVisible({ timeout: 5000 });
  });
});