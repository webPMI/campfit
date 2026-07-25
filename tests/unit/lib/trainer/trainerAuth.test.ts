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
    it('should call callback when user is authenticated', async () => {
      const mockUser = { uid: 'trainer-123', email: 'trainer@test.com' };
      mockOnAuthStateChanged.mockImplementation(((...args: unknown[]) => {
        const callback = args[1] as (u: unknown) => void;
        callback(mockUser);
        return vi.fn();
      }) as never);

      const { requireAuth } = await import('@/lib/trainer/trainerAuth');
      const callback = vi.fn();
      const unsubscribe = requireAuth(callback);

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, expect.any(Function));
      expect(callback).toHaveBeenCalledWith(mockUser);
      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it('should redirect to /login when user is NOT authenticated', async () => {
      mockOnAuthStateChanged.mockImplementation(((...args: unknown[]) => {
        const callback = args[1] as (u: unknown) => void;
        callback(null);
        return vi.fn();
      }) as never);

      const { requireAuth } = await import('@/lib/trainer/trainerAuth');
      const callback = vi.fn();
      requireAuth(callback);

      expect(callback).not.toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });

    it('should return unsubscribe function to cleanup listener', async () => {
      const mockUnsubscribe = vi.fn();
      mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);

      const { requireAuth } = await import('@/lib/trainer/trainerAuth');
      const callback = vi.fn();
      const unsubscribe = requireAuth(callback);

      expect(unsubscribe).toBe(mockUnsubscribe);
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('signOutUser', () => {
    it('should sign out and redirect to /login on success', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const { signOutUser } = await import('@/lib/trainer/trainerAuth');
      await signOutUser();

      expect(mockSignOut).toHaveBeenCalledWith(mockAuth);
      expect(window.location.href).toBe('/login');
    });

    it('should handle sign out error without redirecting', async () => {
      mockSignOut.mockRejectedValue(new Error('Network error'));

      const { signOutUser } = await import('@/lib/trainer/trainerAuth');
      await signOutUser();

      expect(window.location.href).not.toBe('/login');
    });

    it('should show toast error message when sign out fails', async () => {
      const { showToast } = await import('@/lib/shared/ui');
      mockSignOut.mockRejectedValue(new Error('Auth error'));

      const { signOutUser } = await import('@/lib/trainer/trainerAuth');
      await signOutUser();

      expect(showToast).toHaveBeenCalledWith({
        message: 'Error al cerrar sesión',
        type: 'error',
      });
    });
  });
});
