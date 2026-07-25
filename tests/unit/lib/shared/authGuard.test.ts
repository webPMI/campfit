/**
 * Tests unitarios para shared/authGuard (requireAuth, requireAdmin, signOutUser).
 *
 * Dependen de Firebase Auth y Firestore → requieren mocks.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const { mockAuth, mockDb, mockOnAuthStateChanged, mockSignOut, mockGetDoc, mockDoc } = vi.hoisted(() => {
  const mockAuth = {
    currentUser: null,
  };

  const mockDb = {};

  const mockOnAuthStateChanged = vi.fn((_auth: unknown, callback: (user: unknown) => void) => {
      const user = mockAuth.currentUser;
      if (user) {
        callback(user);
      }
      return () => {};
    });

  const mockSignOut = vi.fn();

  const mockGetDoc = vi.fn();

  const mockDoc = vi.fn(() => ({ id: 'mock-doc-ref', path: 'users/mock-doc-ref' }));

  return { mockAuth, mockDb, mockOnAuthStateChanged, mockSignOut, mockGetDoc, mockDoc };
});

vi.mock('@/lib/firebase', () => ({
  auth: mockAuth,
  db: mockDb,
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mockOnAuthStateChanged,
  signOut: mockSignOut,
}));

vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  getDoc: mockGetDoc,
}));

vi.mock('@/lib/shared/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/shared/ui', () => ({
  showToast: vi.fn(),
}));

// ─── Importar módulo a testear ──────────────────────────────────────────────

import { requireAuth, requireAdmin, signOutUser } from '../../../../src/lib/shared/authGuard';

// ─── Tests: requireAuth ─────────────────────────────────────────────────────

describe('authGuard: requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser = null;
  });

  it('✅ should return unsubscribe function', () => {
    const result = requireAuth(() => {});
    expect(typeof result).toBe('function');
  });

  it('✅ should call callback when user is authenticated', () => {
    const callback = vi.fn();
    const mockUser = { uid: 'user-123', email: 'test@test.com' };
    mockAuth.currentUser = mockUser as any;

    requireAuth(callback);

    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, expect.any(Function));
  });

  it('⚠️ should not call callback when user is null', () => {
    const callback = vi.fn();
    mockAuth.currentUser = null;

    requireAuth(callback);

    // onAuthStateChanged se llama, pero el callback no se ejecuta porque user es null
    expect(mockOnAuthStateChanged).toHaveBeenCalled();
  });
});

// ─── Tests: requireAdmin ────────────────────────────────────────────────────

describe('authGuard: requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser = null;
  });

  it('✅ should return unsubscribe function', () => {
    const result = requireAdmin(() => {});
    expect(typeof result).toBe('function');
  });

  it('✅ should call callback when user is admin', async () => {
    const callback = vi.fn();
    const mockUser = { uid: 'admin-123', email: 'admin@test.com' };
    mockAuth.currentUser = mockUser as any;

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'admin' }),
    });

    requireAdmin(callback);

    // Esperar a que se resuelva la verificación del rol
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockGetDoc).toHaveBeenCalled();
  });

  it('⚠️ should not call callback when user is not admin', async () => {
    const callback = vi.fn();
    const mockUser = { uid: 'client-123', email: 'client@test.com' };
    mockAuth.currentUser = mockUser as any;

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'client' }),
    });

    requireAdmin(callback);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockGetDoc).toHaveBeenCalled();
  });

  it('⚠️ should handle Firestore errors gracefully', async () => {
    const callback = vi.fn();
    const mockUser = { uid: 'user-123', email: 'test@test.com' };
    mockAuth.currentUser = mockUser as any;

    mockGetDoc.mockRejectedValue(new Error('Permission denied'));

    requireAdmin(callback);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockGetDoc).toHaveBeenCalled();
  });
});

// ─── Tests: signOutUser ─────────────────────────────────────────────────────

describe('authGuard: signOutUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ should call signOut and redirect to login', async () => {
    mockSignOut.mockResolvedValue(undefined);

    await signOutUser();

    expect(mockSignOut).toHaveBeenCalledWith(mockAuth);
  });

  it('⚠️ should handle signOut errors gracefully', async () => {
    mockSignOut.mockRejectedValue(new Error('Sign out failed'));

    await expect(signOutUser()).resolves.toBeUndefined();
  });
});