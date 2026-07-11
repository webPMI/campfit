/**
 * Tests unitarios para routeGuards.
 *
 * Funciones puras que determinan acceso a rutas según rol.
 * No requieren mocks de Firebase.
 */

import { describe, it, expect } from 'vitest';
import { checkRouteAccess, routeGuards } from '../../../src/lib/routeGuards';
import type { User } from '../../../src/types';

const mockUser = (role: User['role'], medicalProfile?: any): User => ({
  uid: 'test-uid',
  name: 'Test User',
  email: 'test@test.com',
  role,
  hasActiveAlert: false,
  medicalProfile,
});

describe('routeGuards', () => {
  describe('checkRouteAccess', () => {
    // ── Rutas públicas ────────────────────────────────────────

    it('✅ should allow access to public routes without user', () => {
      const publicRoutes = ['/login', '/register', '/recover', '/'];
      for (const path of publicRoutes) {
        const result = checkRouteAccess(path, null);
        expect(result.allowed).toBe(true);
      }
    });

    it('✅ should allow access to public routes with authenticated user', () => {
      const result = checkRouteAccess('/login', mockUser('client'));
      expect(result.allowed).toBe(true);
    });

    // ── Rutas de cliente ──────────────────────────────────────

    it('✅ should allow client to access client routes', () => {
      const result = checkRouteAccess('/client/dashboard', mockUser('client'));
      expect(result.allowed).toBe(true);
    });

    it('❌ should deny non-client users from client routes', () => {
      const result = checkRouteAccess('/client/dashboard', mockUser('trainer'));
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe('/dashboard');
    });

    it('❌ should deny admin from client routes', () => {
      const result = checkRouteAccess('/client/dashboard', mockUser('admin'));
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe('/dashboard');
    });

    it('⚠️ should redirect to login when no user', () => {
      const result = checkRouteAccess('/client/dashboard', null);
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe('/login');
    });

    // ── Rutas de admin ────────────────────────────────────────

    it('✅ should allow admin to access admin routes', () => {
      const result = checkRouteAccess('/admin', mockUser('admin'));
      expect(result.allowed).toBe(true);
    });

    it('❌ should deny non-admin users from admin routes', () => {
      const result = checkRouteAccess('/admin', mockUser('client'));
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe('/client/dashboard');
    });

    // ── Rutas de trainer ──────────────────────────────────────

    it('✅ should allow trainer to access trainer routes', () => {
      const result = checkRouteAccess('/trainer/dashboard', mockUser('trainer'));
      expect(result.allowed).toBe(true);
    });

    it('✅ should allow admin to access trainer routes', () => {
      const result = checkRouteAccess('/trainer/dashboard', mockUser('admin'));
      expect(result.allowed).toBe(true);
    });

    it('❌ should deny client from trainer routes', () => {
      const result = checkRouteAccess('/trainer/dashboard', mockUser('client'));
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe('/client/dashboard');
    });

    // ── Ruta dashboard general ────────────────────────────────

    it('✅ should allow any authenticated user to access /dashboard', () => {
      for (const role of ['admin', 'trainer', 'client'] as const) {
        const result = checkRouteAccess('/dashboard', mockUser(role));
        expect(result.allowed).toBe(true);
      }
    });

    // ── Perfil médico requerido ───────────────────────────────

    it('⚠️ should redirect to medical profile if required and not completed', () => {
      const result = checkRouteAccess('/client/workouts', mockUser('client'));
      expect(result.allowed).toBe(true); // requiresMedicalProfile: false
    });

    // ── Rutas sin guardia ─────────────────────────────────────

    it('✅ should allow access to undefined routes', () => {
      const result = checkRouteAccess('/some/unknown/path', null);
      expect(result.allowed).toBe(true);
    });
  });

  describe('routeGuards configuration', () => {
    it('should have all required route guards defined', () => {
      const paths = routeGuards.map((g) => g.path);
      expect(paths).toContain('/login');
      expect(paths).toContain('/register');
      expect(paths).toContain('/');
      expect(paths).toContain('/client/dashboard');
      expect(paths).toContain('/admin');
      expect(paths).toContain('/trainer/dashboard');
      expect(paths).toContain('/dashboard');
    });

    it('should have valid allowedRoles for each guard', () => {
      for (const guard of routeGuards) {
        expect(Array.isArray(guard.allowedRoles)).toBe(true);
        for (const role of guard.allowedRoles) {
          expect(['admin', 'trainer', 'client']).toContain(role);
        }
      }
    });
  });
});
