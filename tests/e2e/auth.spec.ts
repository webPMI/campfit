/**
 * Tests E2E para el flujo de autenticación con Playwright.
 *
 * Estos tests prueban la aplicación desde la perspectiva del usuario real,
 * interactuando con el navegador como lo haría un usuario.
 *
 * REQUISITOS:
 * - Servidor de desarrollo corriendo (npm run dev)
 * - Ejecutar con: npm run test:e2e
 *
 * @see https://playwright.dev/docs/writing-tests
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication E2E', () => {
  test('✅ should display login page correctly', async ({ page }) => {
    await page.goto('/login');

    // Verificar elementos principales de la página
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('✅ should show validation errors on empty form submission', async ({ page }) => {
    await page.goto('/login');

    // Hacer clic en submit sin rellenar campos
    await page.click('button[type="submit"]');

    // Verificar mensajes de validación
    await expect(page.locator('text=requerido').first()).toBeVisible();
  });

  test('❌ should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Verificar mensaje de error
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('✅ should navigate to register page', async ({ page }) => {
    await page.goto('/login');

    // Hacer clic en enlace de registro
    await page.click('a[href*="register"], a:has-text("registr")');

    await expect(page).toHaveURL(/\/register/);
  });

  test('✅ should navigate to password recovery', async ({ page }) => {
    await page.goto('/login');

    // Hacer clic en enlace de recuperación
    await page.click('a[href*="forgot"], a[href*="reset"], a:has-text("olvid")');

    await expect(page).toHaveURL(/forgot|reset/);
  });
});

test.describe('Registration E2E', () => {
  test('✅ should display registration form correctly', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('[name="name"]')).toBeVisible();
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('✅ should show validation errors on registration form', async ({ page }) => {
    await page.goto('/register');

    await page.click('button[type="submit"]');

    // Verificar que aparecen errores de validación
    const errorCount = await page.locator('[role="alert"], .error, .text-red').count();
    expect(errorCount).toBeGreaterThan(0);
  });
});

test.describe('Dashboard Access', () => {
  test('❌ should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');

    // Usuario no autenticado debe ser redirigido al login
    await expect(page).toHaveURL(/\/login/);
  });
});
