/**
 * Tests unitarios para trainerAuth.ts
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
    value: { href: '', replace: vi.fn() },
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
      mockOnAuthStateChanged.mockImplementation(((...args: unknown[]) => {
        const callback = args[1] as (u: unknown) => void;
        callback(null); // primera llamada (initialized = true)
        callback(mockUser); // segunda llamada
        return vi.fn();
      }) as never);

      const { requireAuth } = await import('@/lib/trainer/trainerAuth');
      const callback = vi.fn();
      const unsubscribe = requireAuth(callback);

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, expect.any(Function));
      expect(callback).toHaveBeenCalledWith(mockUser);
      expect(unsubscribe).toBeInstanceOf(Function);
    });
  });

  describe('signOutUser', () => {
    it('debería cerrar sesión y redirigir a /login', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const { signOutUser } = await import('@/lib/trainer/trainerAuth');
      await signOutUser();

      expect(mockSignOut).toHaveBeenCalledWith(mockAuth);
      expect((window.location as unknown as { replace: ReturnType<typeof vi.fn> }).replace).toHaveBeenCalledWith('/login');
    });

    it('debería manejar errores al cerrar sesión sin redirigir', async () => {
      mockSignOut.mockRejectedValue(new Error('Network error'));

      const { signOutUser } = await import('@/lib/trainer/trainerAuth');
      await signOutUser();

      expect((window.location as unknown as { replace: ReturnType<typeof vi.fn> }).replace).not.toHaveBeenCalled();
    });
  });
});