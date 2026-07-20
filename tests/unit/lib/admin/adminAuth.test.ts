/**
 * Tests unitarios para adminAuth.ts
 *
 * @module tests/unit/lib/admin/adminAuth.test
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

const mockOnAuthStateChanged = vi.fn();
const mockSignOut = vi.fn();
const mockAuth = { currentUser: null };

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mockOnAuthStateChanged,
  signOut: mockSignOut,
  getAuth: vi.fn(() => mockAuth),
}));

vi.mock('@/lib/firebase', () => ({
  auth: mockAuth,
}));

vi.mock('@/lib/shared/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/shared/ui', () => ({
  showToast: vi.fn(),
}));

const originalLocation = window.location;

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    value: originalLocation,
    writable: true,
  });
});

describe('adminAuth', () => {
  describe('requireAdmin', () => {
    it('debería llamar al callback cuando el usuario está autenticado', async () => {
      const mockUser = { uid: 'admin-123', email: 'admin@test.com' };
      mockOnAuthStateChanged.mockImplementation(((...args: unknown[]) => {
        const callback = args[1] as (u: unknown) => void;
        callback(mockUser);
        return vi.fn();
      }) as never);

      const { requireAdmin } = await import('@/lib/admin/adminAuth');
      const callback = vi.fn();
      const unsubscribe = requireAdmin(callback);

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, expect.any(Function));
      expect(callback).toHaveBeenCalledWith(mockUser);
      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it('debería redirigir a /login cuando el usuario NO está autenticado', async () => {
      mockOnAuthStateChanged.mockImplementation(((...args: unknown[]) => {
        const callback = args[1] as (u: unknown) => void;
        callback(null);
        return vi.fn();
      }) as never);

      const { requireAdmin } = await import('@/lib/admin/adminAuth');
      const callback = vi.fn();
      requireAdmin(callback);

      expect(callback).not.toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });
  });

  describe('signOutUser', () => {
    it('debería cerrar sesión y redirigir a /login', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const { signOutUser } = await import('@/lib/admin/adminAuth');
      await signOutUser();

      expect(mockSignOut).toHaveBeenCalledWith(mockAuth);
      expect(window.location.href).toBe('/login');
    });

    it('debería manejar errores al cerrar sesión sin redirigir', async () => {
      mockSignOut.mockRejectedValue(new Error('Network error'));

      const { signOutUser } = await import('@/lib/admin/adminAuth');
      await signOutUser();

      expect(window.location.href).not.toBe('/login');
    });
  });
});
