/**
 * Tests E2E para el flujo de autenticación con Playwright.
 *
 * REQUISITOS:
 * - Servidor de desarrollo corriendo (npm run dev)
 * - Ejecutar con: npm run test:e2e
 *
 * @see https://playwright.dev/docs/writing-tests
 */

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display login form correctly', async ({ page }) => {
    await page.goto('/login');

    // Verificar elementos principales
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#loginBtn')).toBeVisible();
    await expect(page.locator('#googleBtn')).toBeVisible();
    await expect(page.locator('#loginForm')).toBeVisible();
  });

  test('should show error on empty form submission', async ({ page }) => {
    await page.goto('/login');

    // Submit sin rellenar campos
    await page.click('#loginBtn');

    // Verificar que aparece el mensaje de error
    await expect(page.locator('#errorMsg')).toBeVisible();
    await expect(page.locator('#errorMsg')).not.toHaveClass(/hidden/);
  });

  test('should show error on invalid email format', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', 'invalid-email');
    await page.fill('#password', 'somepassword');
    await page.click('#loginBtn');

    // Debe mostrar error de email inválido
    await expect(page.locator('#errorMsg')).toBeVisible();
    await expect(page.locator('#errorMsg')).not.toHaveClass(/hidden/);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');

    // Hacer clic en enlace de registro
    await page.click('a[href*="register"]');

    await expect(page).toHaveURL(/\/register/);
  });

  test('should navigate to password recovery', async ({ page }) => {
    await page.goto('/login');

    // Hacer clic en enlace de recuperación
    await page.click('a[href*="recover"]');

    await expect(page).toHaveURL(/\/recover/);
  });
});

test.describe('Register Page', () => {
  test('should display registration form correctly', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#registerBtn')).toBeVisible();
    await expect(page.locator('#googleBtn')).toBeVisible();
  });

  test('should show field validation errors on empty submission', async ({ page }) => {
    await page.goto('/register');

    await page.click('#registerBtn');

    // Verificar que aparecen errores de validación en los campos
    await expect(page.locator('#nameError')).toBeVisible();
    await expect(page.locator('#emailError')).toBeVisible();
    await expect(page.locator('#passwordError')).toBeVisible();
  });

  test('should show error for short password', async ({ page }) => {
    await page.goto('/register');

    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', '123');
    await page.click('#registerBtn');

    // Debe mostrar error de contraseña débil
    await expect(page.locator('#passwordError')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/register');

    await page.click('a[href*="login"]');

    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Recover Password Page', () => {
  test('should display recover form correctly', async ({ page }) => {
    await page.goto('/recover');

    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#recoverBtn')).toBeVisible();
    await expect(page.locator('#recoverForm')).toBeVisible();
  });

  test('should show error on empty email', async ({ page }) => {
    await page.goto('/recover');

    await page.click('#recoverBtn');

    await expect(page.locator('#errorMsg')).toBeVisible();
    await expect(page.locator('#errorMsg')).not.toHaveClass(/hidden/);
  });

  test('should show error on invalid email', async ({ page }) => {
    await page.goto('/recover');

    await page.fill('#email', 'not-an-email');
    await page.click('#recoverBtn');

    await expect(page.locator('#errorMsg')).toBeVisible();
  });

  test('should navigate back to login', async ({ page }) => {
    await page.goto('/recover');

    await page.click('a[href*="login"]');

    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Dashboard Access Control', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');

    // Usuario no autenticado debe ser redirigido al login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from admin pages', async ({ page }) => {
    await page.goto('/admin/dashboard');

    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from client pages', async ({ page }) => {
    await page.goto('/client/dashboard');

    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from trainer pages', async ({ page }) => {
    await page.goto('/trainer/dashboard');

    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Public Pages Access', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should display 404 page for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page');

    // Astro dev server muestra 404
    await expect(page.locator('body')).toBeVisible();
  });
});
