/**
 * Agent 3: Error States & 4-State Pattern E2E Tests
 * Verifica loading → empty → error → success en cada página
 */
import { test, expect } from '@playwright/test';

test.describe('4-State Pattern - Admin Pages', () => {
  test('ERR-001: Admin workouts shows loading state on page load', async ({ page }) => {
    await page.goto('/admin/workouts');
    const loading = page.locator('#loadingState');
    await expect(loading).toBeVisible({ timeout: 5000 });
  });

  test('ERR-002: Admin workouts has empty state element', async ({ page }) => {
    await page.goto('/admin/workouts');
    await expect(page.locator('#emptyState')).toBeVisible({ timeout: 5000 });
  });

  test('ERR-003: Admin workouts has error toast element', async ({ page }) => {
    await page.goto('/admin/workouts');
    await expect(page.locator('#errorToast')).toBeVisible({ timeout: 5000 });
  });

  test('ERR-004: Admin diets shows loading state', async ({ page }) => {
    await page.goto('/admin/diets');
    await expect(page.locator('#loadingState')).toBeVisible({ timeout: 5000 });
  });

  test('ERR-005: Admin chat has empty state', async ({ page }) => {
    await page.goto('/admin/chat');
    await expect(page.locator('#emptyState')).toBeVisible({ timeout: 5000 });
  });

  test('ERR-006: Admin progress has type filter dropdown', async ({ page }) => {
    await page.goto('/admin/progress');
    const filter = page.locator('#filterType');
    await expect(filter).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Error Handling - Auth Pages', () => {
  test('ERR-007: Login error message is not empty', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(800);
    await page.locator('#loginForm').dispatchEvent('submit');
    await expect(page.locator('#errorMsg')).toBeVisible({ timeout: 5000 });
    const text = await page.locator('#errorText').textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('ERR-008: Recover error shows correct structure', async ({ page }) => {
    await page.goto('/recover');
    await page.waitForTimeout(800);
    await page.locator('#recoverForm').dispatchEvent('submit');
    await expect(page.locator('#errorMsg')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#errorText')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Empty States', () => {
  test('ERR-009: Admin clinical has empty state element rendered', async ({ page }) => {
    await page.goto('/admin/clinical');
    await expect(page.locator('#emptyState')).toBeVisible({ timeout: 5000 });
  });

  test('ERR-010: Admin clinical has loading state element', async ({ page }) => {
    await page.goto('/admin/clinical');
    await expect(page.locator('#loadingState')).toBeVisible({ timeout: 5000 });
  });
});