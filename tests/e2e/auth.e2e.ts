/**
 * Tests E2E para CampFit con Playwright.
 * Ejecutar: npx playwright test --project=chromium
 */

import { test, expect } from '@playwright/test';

const HYDRATION_MS = 800;

test.describe('Login Page', () => {
  test('should display email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('should show error on empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(HYDRATION_MS);
    await page.locator('#loginForm').dispatchEvent('submit');
    await expect(page.locator('#errorMsg')).toBeVisible({ timeout: 5000 });
  });

  test('should show error on invalid email', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(HYDRATION_MS);
    await page.fill('#email', 'bad-email');
    await page.fill('#password', 'somepassword');
    await page.locator('#loginForm').dispatchEvent('submit');
    await expect(page.locator('#errorMsg')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.click('a[href*="register"]');
    await expect(page).toHaveURL(/\/register/);
  });

  test('should navigate to recover page', async ({ page }) => {
    await page.goto('/login');
    await page.click('a[href*="recover"]');
    await expect(page).toHaveURL(/\/recover/);
  });
});

test.describe('Register Page', () => {
  test('should display name and email fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
  });

  test('should show validation errors on empty fields', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(HYDRATION_MS);
    await page.locator('#registerForm').dispatchEvent('submit');
    await expect(page.locator('#nameError')).toBeVisible({ timeout: 5000 });
  });

  test('should show error for short password', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(HYDRATION_MS);
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', '123');
    await page.locator('#registerForm').dispatchEvent('submit');
    await expect(page.locator('#passwordError')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/register');
    await page.click('a[href*="login"]');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Recover Password Page', () => {
  test('should display email field', async ({ page }) => {
    await page.goto('/recover');
    await expect(page.locator('#email')).toBeVisible();
  });

  test('should show error on empty email', async ({ page }) => {
    await page.goto('/recover');
    await page.waitForTimeout(HYDRATION_MS);
    await page.locator('#recoverForm').dispatchEvent('submit');
    await expect(page.locator('#errorMsg')).toBeVisible({ timeout: 5000 });
  });

  test('should show error on invalid email', async ({ page }) => {
    await page.goto('/recover');
    await page.waitForTimeout(HYDRATION_MS);
    await page.fill('#email', 'bad');
    await page.locator('#recoverForm').dispatchEvent('submit');
    await expect(page.locator('#errorMsg')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate back to login', async ({ page }) => {
    await page.goto('/recover');
    await page.click('a[href*="login"]');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Access Control', () => {
  test('/dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
  test('/admin/dashboard redirects to login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
  test('/client/dashboard redirects to login', async ({ page }) => {
    await page.goto('/client/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
  test('/trainer/dashboard redirects to login', async ({ page }) => {
    await page.goto('/trainer/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Public Pages', () => {
  test('landing page renders', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });
  });
  test('404 page renders', async ({ page }) => {
    await page.goto('/nonexistent');
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });
  test('500 page renders', async ({ page }) => {
    await page.goto('/500');
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('All Pages Load Check', () => {
  const publicPaths = ['/', '/login', '/register', '/recover'];

  const authPaths = [
    '/onboarding', '/dashboard',
    '/admin/dashboard', '/admin/users', '/admin/trainers', '/admin/clients',
    '/admin/workouts', '/admin/diets', '/admin/chat', '/admin/progress',
    '/admin/clinical', '/admin/settings',
    '/client/dashboard', '/client/workouts', '/client/diets', '/client/progress',
    '/client/chat', '/client/support', '/client/medical-profile', '/client/settings',
    '/trainer/dashboard', '/trainer/clients', '/trainer/workouts', '/trainer/diets',
    '/trainer/chat', '/trainer/clinical', '/trainer/settings',
  ];

  for (const path of publicPaths) {
    test(`${path} loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
    });
  }

  for (const path of authPaths) {
    test(`${path} loads (redirects)`, async ({ page }) => {
      await page.goto(path);
      // Pages requiring auth should render HTML and then redirect
      await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
    });
  }
});

test.describe('Language Switching', () => {
  test('lang switcher link exists on admin dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1000);
    const link = page.locator('a[href*="?lang="]').first();
    await expect(link).toBeVisible({ timeout: 5000 });
  });
});