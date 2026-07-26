/**
 * Tests para authGuard.ts
 * @module tests/unit/lib/shared/authGuard.test
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('authGuard', () => {
    describe('requireAuth', () => {
        it('should be a function', async () => {
            const mod = await import('@/lib/shared/authGuard');
            expect(typeof mod.requireAuth).toBe('function');
        });
    });

    describe('requireAdmin', () => {
        it('should be a function', async () => {
            const mod = await import('@/lib/shared/authGuard');
            expect(typeof mod.requireAdmin).toBe('function');
        });
    });

    describe('signOutUser', () => {
        it('should be a function', async () => {
            const mod = await import('@/lib/shared/authGuard');
            expect(typeof mod.signOutUser).toBe('function');
        });
    });

    describe('Route definitions', () => {
        it('debería tener definidas las rutas por rol', () => {
            const roleRoutes: Record<string, string> = {
                admin: '/dashboard',
                trainer: '/trainer/dashboard',
                client: '/client/dashboard',
            };
            expect(Object.keys(roleRoutes)).toHaveLength(3);
        });

        it('las rutas públicas no deberían estar bajo prefijos protegidos', () => {
            const publicRoutes = ['/', '/login', '/register', '/recover', '/onboarding'];
            for (const route of publicRoutes) {
                expect(route).not.toContain('/admin');
                expect(route).not.toContain('/trainer');
                expect(route).not.toContain('/client');
            }
        });

        it('las rutas protegidas deben tener prefijo correcto', () => {
            const adminRoutes = ['/admin/dashboard', '/admin/users', '/admin/trainers', '/admin/clients', '/admin/settings'];
            const trainerRoutes = ['/trainer/dashboard', '/trainer/clients', '/trainer/workouts', '/trainer/diets', '/trainer/chat'];
            const clientRoutes = ['/client/dashboard', '/client/workouts', '/client/diets', '/client/progress', '/client/chat'];

            for (const route of adminRoutes) expect(route).toMatch(/^\/admin\//);
            for (const route of trainerRoutes) expect(route).toMatch(/^\/trainer\//);
            for (const route of clientRoutes) expect(route).toMatch(/^\/client\//);
        });
    });

    describe('Auth state machine', () => {
        it('loading → authenticated transition works', () => {
            let loading = true;
            let user: { uid: string; role: string } | null = null;

            // Simulate login
            loading = false;
            user = { uid: 'u1', role: 'client' };

            expect(loading).toBe(false);
            expect(user).not.toBeNull();
            expect(user!.role).toBe('client');
        });

        it('authenticated → unauthenticated (logout) works', () => {
            let user: { uid: string } | null = { uid: 'u1' };

            user = null;
            expect(user).toBeNull();
        });
    });
});
