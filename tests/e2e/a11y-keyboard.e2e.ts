/**
 * Agent 4: Accessibility E2E Tests
 */
import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('A11Y-001: Login form inputs have labels', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(500);
    const labels = page.locator('label');
    const count = await labels.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('A11Y-002: Login button is keyboard focusable', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(500);
    const loginBtn = page.locator('#loginBtn');
    await expect(loginBtn).toBeVisible();
    await loginBtn.focus();
    const focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toBe('loginBtn');
  });

  test('A11Y-003: Email input has autocomplete attribute', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(500);
    const email = page.locator('#email');
    const ac = await email.getAttribute('autocomplete');
    expect(ac).toBe('email');
  });

  test('A11Y-004: Password input has autocomplete', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(500);
    const pwd = page.locator('#password');
    const ac = await pwd.getAttribute('autocomplete');
    expect(ac).toBeTruthy();
  });

  test('A11Y-005: HTML lang attribute is set', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(300);
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });
});