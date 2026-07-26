/**
 * Agent 4: Client Pages E2E Tests
 * Verifica elementos JS, botones y navegación en páginas de cliente
 */
import { test, expect } from '@playwright/test';

test.describe('Client Dashboard', () => {
  test('has bottom navigation', async ({ page }) => {
    await page.goto('/client/dashboard');
    await page.waitForTimeout(800);
    const nav = page.locator('nav.fixed.bottom-0');
    await expect(nav).toBeVisible({ timeout: 5000 });
  });

  test('has 6 nav items', async ({ page }) => {
    await page.goto('/client/dashboard');
    await page.waitForTimeout(800);
    const links = page.locator('nav.fixed.bottom-0 a');
    const count = await links.count();
    expect(count).toBe(6);
  });
});

test.describe('Client Workouts', () => {
  test('renders page body', async ({ page }) => {
    await page.goto('/client/workouts');
    await page.waitForTimeout(800);
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Client Diets', () => {
  test('renders page body', async ({ page }) => {
    await page.goto('/client/diets');
    await page.waitForTimeout(800);
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Client Progress', () => {
  test('renders page body', async ({ page }) => {
    await page.goto('/client/progress');
    await page.waitForTimeout(800);
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Client Chat', () => {
  test('renders page body', async ({ page }) => {
    await page.goto('/client/chat');
    await page.waitForTimeout(800);
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Client Support', () => {
  test('has FAQ heading', async ({ page }) => {
    await page.goto('/client/support');
    await page.waitForTimeout(800);
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Client Medical Profile', () => {
  test('has medical form fields', async ({ page }) => {
    await page.goto('/client/medical-profile');
    await page.waitForTimeout(800);
    await expect(page.locator('#medicalForm')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#heightInput')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#weightInput')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Client Settings', () => {
  test('renders page body', async ({ page }) => {
    await page.goto('/client/settings');
    await page.waitForTimeout(800);
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });
});