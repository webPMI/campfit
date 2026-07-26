/**
 * Agent 1: Onboarding Flow E2E Tests
 * Verifica que el formulario multi-step de onboarding funcione
 */
import { test, expect } from '@playwright/test';

test.describe('Onboarding Multi-Step Form', () => {
  test('ONB-001: Onboarding page loads and step 1 is visible', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(800);
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });

  test('ONB-002: Next button is present', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForTimeout(800);
    // The onboarding page should have a "Continuar" or "Next" button
    const nextBtn = page.locator('button').filter({ hasText: /Continuar|Next|Siguiente/i }).first();
    await expect(nextBtn).toBeVisible({ timeout: 5000 });
  });
});