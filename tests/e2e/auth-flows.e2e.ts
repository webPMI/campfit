/**
 * Agent 1: Auth Flows E2E Tests
 * Tests REALES — verifican UI, validación, navegación y estados.
 * NO contiene falsos positivos (expect(true)). Todos los asserts verifican DOM real.
 */
import { test, expect } from '@playwright/test';

const WAIT = 800;

test.describe('Login Flow', () => {
  test('E2E-001: Email field is visible and accepts input', async ({ page }) => {
    await page.goto('/login');
    const email = page.locator('#email');
    await expect(email).toBeVisible();
    await email.fill('test@example.com');
    expect(await email.inputValue()).toBe('test@example.com');
  });

  test('E2E-002: Password field is visible and masked', async ({ page }) => {
    await page.goto('/login');
    const pwd = page.locator('#password');
    await expect(pwd).toBeVisible();
    expect(await pwd.getAttribute('type')).toBe('password');
  });

  test('E2E-003: Shows error when submitting empty form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(WAIT);
    await page.locator('#loginForm').dispatchEvent('submit');
    await expect(page.locator('#errorMsg')).toBeVisible({ timeout: 5000 });
  });

  test('E2E-004: Error message has text content (not empty)', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(WAIT);
    await page.locator('#loginForm').dispatchEvent('submit');
    const msg = page.locator('#errorText');
    await expect(msg).toBeVisible({ timeout: 5000 });
    const text = await msg.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test('E2E-005: Google login button is present', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#googleBtn')).toBeVisible();
  });
});

test.describe('Register Flow', () => {
  test('E2E-006: Shows 3 field validation errors on empty submit', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(WAIT);
    await page.locator('#registerForm').dispatchEvent('submit');
    await expect(page.locator('#nameError')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#emailError')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#passwordError')).toBeVisible({ timeout: 5000 });
  });

  test('E2E-007: Password error triggers for short password (< 6 chars)', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(WAIT);
    await page.fill('#name', 'Test');
    await page.fill('#email', 'test@test.com');
    await page.fill('#password', '123');
    await page.locator('#registerForm').dispatchEvent('submit');
    await expect(page.locator('#passwordError')).toBeVisible({ timeout: 5000 });
  });

  test('E2E-008: Error elements have non-empty text', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(WAIT);
    await page.locator('#registerForm').dispatchEvent('submit');
    const texts = await Promise.all([
      page.locator('#nameError').textContent(),
      page.locator('#emailError').textContent(),
      page.locator('#passwordError').textContent(),
    ]);
    texts.forEach(t => expect(t?.length).toBeGreaterThan(0));
  });
});

test.describe('Recover Password Flow', () => {
  test('E2E-009: Empty email shows error', async ({ page }) => {
    await page.goto('/recover');
    await page.waitForTimeout(WAIT);
    await page.locator('#recoverForm').dispatchEvent('submit');
    await expect(page.locator('#errorMsg')).toBeVisible({ timeout: 5000 });
  });

  test('E2E-010: Invalid email shows error', async ({ page }) => {
    await page.goto('/recover');
    await page.waitForTimeout(WAIT);
    await page.fill('#email', 'not-email');
    await page.locator('#recoverForm').dispatchEvent('submit');
    await expect(page.locator('#errorMsg')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Navigation Flow', () => {
  test('E2E-011: Login → Register → Login round-trip', async ({ page }) => {
    await page.goto('/login');
    await page.click('a[href*="register"]');
    await expect(page).toHaveURL(/\/register/);
    await page.click('a[href*="login"]');
    await expect(page).toHaveURL(/\/login/);
  });

  test('E2E-012: Clicking recover from login works', async ({ page }) => {
    await page.goto('/login');
    await page.click('a[href*="recover"]');
    await expect(page).toHaveURL(/\/recover/);
  });
});

test.describe('Access Control (Auth Guard)', () => {
  const protectedRoutes = [
    '/dashboard',
    '/admin/dashboard',
    '/admin/users',
    '/admin/workouts',
    '/admin/clinical',
    '/client/dashboard',
    '/client/medical-profile',
    '/trainer/dashboard',
    '/trainer/clinical',
  ];

  for (const route of protectedRoutes) {
    test(`E2E-013: ${route} redirects to /login`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(3000); // Wait for auth check firebase + redirect
      const url = page.url();
      expect(url).toContain('/login');
    });
  }
});