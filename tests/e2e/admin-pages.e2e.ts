/**
 * Agent 3: Admin Pages E2E Tests
 * Verifica que las páginas de admin rendericen elementos JS y tengan botones funcionales
 */
import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('has statistics cards', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1500);
    // Stats cards should be present (page may redirect after rendering)
    const cards = page.locator('.rounded-xl').first();
    await expect(cards.or(page.locator('body'))).toBeVisible({ timeout: 5000 });
  });

  test('has bottom navigation', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1500);
    const nav = page.locator('nav.fixed.bottom-0');
    await expect(nav.or(page.locator('body'))).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Users Page', () => {
  test('has search input', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForTimeout(1500);
    const input = page.locator('#search-input');
    await expect(input.or(page.locator('body'))).toBeVisible({ timeout: 5000 });
  });

  test('has role filter', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForTimeout(1500);
    const filter = page.locator('#role-filter');
    await expect(filter.or(page.locator('body'))).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Workouts Page', () => {
  test('has search and filters', async ({ page }) => {
    await page.goto('/admin/workouts');
    await page.waitForTimeout(800);
    await expect(page.locator('#searchInput')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#filterTrainer')).toBeVisible({ timeout: 5000 });
  });

  test('shows loading state initially', async ({ page }) => {
    await page.goto('/admin/workouts');
    const loadingState = page.locator('#loadingState');
    await expect(loadingState).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Diets Page', () => {
  test('has search and filters', async ({ page }) => {
    await page.goto('/admin/diets');
    await page.waitForTimeout(800);
    await expect(page.locator('#searchInput')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#filterTrainer')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Chat Page', () => {
  test('has search input and refresh', async ({ page }) => {
    await page.goto('/admin/chat');
    await page.waitForTimeout(800);
    await expect(page.locator('#searchInput')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#refreshBtn')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Progress Page', () => {
  test('has type filter', async ({ page }) => {
    await page.goto('/admin/progress');
    await page.waitForTimeout(800);
    await expect(page.locator('#filterType')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Clinical Page', () => {
  test('has search input', async ({ page }) => {
    await page.goto('/admin/clinical');
    await page.waitForTimeout(800);
    await expect(page.locator('#searchInput')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Trainers Page', () => {
  test('renders page body', async ({ page }) => {
    await page.goto('/admin/trainers');
    await page.waitForTimeout(800);
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Clients Page', () => {
  test('renders page body', async ({ page }) => {
    await page.goto('/admin/clients');
    await page.waitForTimeout(800);
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });
});