/**
 * Agent 1: Console Error Detection E2E Tests
 * Detecta errores JS en todas las páginas (violación regla #7)
 */
import { test, expect } from '@playwright/test';

const PUBLIC_PAGES = [
  '/', '/login', '/register', '/recover',
  '/admin/dashboard', '/admin/workouts', '/admin/diets', '/admin/chat', '/admin/progress', '/admin/clinical',
  '/client/dashboard', '/client/workouts', '/client/diets', '/client/progress', '/client/chat', '/client/support',
  '/trainer/dashboard', '/trainer/clients', '/trainer/workouts', '/trainer/diets', '/trainer/chat', '/trainer/clinical',
];

for (const path of PUBLIC_PAGES) {
  test(`CONSOLE-${PUBLIC_PAGES.indexOf(path) + 1}: ${path} has no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(path);
    await page.waitForTimeout(2000);

    // Filter out Firebase auth errors (expected when not logged in)
    const realErrors = errors.filter(e => !e.includes('firebase') && !e.includes('auth'));
    expect(realErrors, `Console errors on ${path}: ${realErrors.join(', ')}`).toHaveLength(0);
  });
}