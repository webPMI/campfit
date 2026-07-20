/**
 * Tests unitarios para trainerAuth.ts
 *
 * @module tests/unit/lib/trainer/trainerAuth.test
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

describe('trainerAuth', () => {
  describe('requireAuth', () => {
    it('debería llamar al callback cuando el usuario está autenticado', async () => {
      const mockUser = { uid: 'trainer-123', email: 'trainer@test.com' };
      mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: (u: unknown) => void) => {
        callback(mockUser);
        return vi.fn();
      });

      const { requireAuth } = await import('@/lib/trainer/trainerAuth');
      const callback = vi.fn();
      const unsubscribe = requireAuth(callback);

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, expect.any(Function));
      expect(callback).toHaveBeenCalledWith(mockUser);
      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it('debería redirigir a /login cuando el usuario NO está autenticado', async () => {
      mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: (u: unknown) => void) => {
        callback(null);
        return vi.fn();
      });

      const { requireAuth } = await import('@/lib/trainer/trainerAuth');
      const callback = vi.fn();
      requireAuth(callback);

      expect(callback).not.toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });
  });

  describe('signOutUser', () => {
    it('debería cerrar sesión y redirigir a /login', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const { signOutUser } = await import('@/lib/trainer/trainerAuth');
      await signOutUser();

      expect(mockSignOut).toHaveBeenCalledWith(mockAuth);
      expect(window.location.href).toBe('/login');
    });

    it('debería manejar errores al cerrar sesión sin redirigir', async () => {
      mockSignOut.mockRejectedValue(new Error('Network error'));

      const { signOutUser } = await import('@/lib/trainer/trainerAuth');
      await signOutUser();

      expect(window.location.href).not.toBe('/login');
    });
  });
});
