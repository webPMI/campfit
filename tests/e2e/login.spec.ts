import { test, expect } from '@playwright/test';

test('login page loads and shows form', async ({ page }) => {
    await page.goto('/login');
    // Verificar que el título de login se renderiza
    await expect(page.locator('h1')).toBeVisible();
    // Verificar que el formulario tiene campo de email
    await expect(page.locator('input[type="email"]')).toBeVisible();
    // Verificar que el formulario tiene campo de password
    await expect(page.locator('input[type="password"]')).toBeVisible();
});

test('login page has Google sign-in button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Google')).toBeVisible();
});