/**
 * Tests unitarios para profileService.
 *
 * Patrón: Una función = un describe
 * Escenarios por función: éxito, error, edge case
 * Usamos vi.mock con factory inline y objeto mockFns compartido.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mocks con vi.hoisted() ──────────────────────────────────────────────────

const { firestoreInstance, mockFns, authMockFns } = vi.hoisted(() => {
  const firestoreInstance = {
    type: 'firestore',
    app: { name: '[DEFAULT]', options: {} },
    _initialized: true,
    _settings: {},
    _settingsFrozen: false,
    _terminated: false,
    _terminateTask: Promise.resolve(),
    _getSettings: vi.fn(() => ({ host: 'firestore.googleapis.com', ssl: true, ignoreUndefinedProperties: false })),
    _setSettings: vi.fn(),
    _setLanguageCode: vi.fn(),
    _getLanguageCode: vi.fn(() => 'es'),
    _getDatabaseId: vi.fn(() => '(default)'),
    _getAppCheckToken: vi.fn().mockResolvedValue(undefined),
    _getCredentials: vi.fn().mockResolvedValue(undefined),
    toJSON: vi.fn(() => ({})),
  };

  const mockFns = {
    collection: vi.fn(() => ({
      id: 'unknown',
      path: 'firestore/unknown',
      firestore: firestoreInstance,
      type: 'collection',
      withConverter: vi.fn(() => ({})),
    })),
    doc: vi.fn(() => ({
      id: 'mock-doc-ref',
      path: 'users/mock-doc-ref',
      firestore: firestoreInstance,
      type: 'document',
      withConverter: vi.fn(() => ({})),
    })),
    addDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn(() => vi.fn()),
    query: vi.fn(() => ({
      type: 'query',
      firestore: firestoreInstance,
      withConverter: vi.fn(() => ({})),
    })),
    where: vi.fn(() => ({})),
    orderBy: vi.fn(() => ({})),
    limit: vi.fn(() => ({})),
    serverTimestamp: vi.fn(() => new Date('2024-01-01')),
    getFirestore: vi.fn(() => firestoreInstance),
  };

  const authMockFns = {
    getAuth: vi.fn(() => ({})),
    sendPasswordResetEmail: vi.fn(),
    updatePassword: vi.fn(),
  };

  return { firestoreInstance, mockFns, authMockFns };
});

vi.mock('firebase/firestore', () => mockFns);
vi.mock('firebase/auth', () => authMockFns);

vi.mock('@/lib/firebase', () => ({
  db: firestoreInstance,
  auth: {},
}));

// Mock shared modules
vi.mock('@/lib/shared/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/shared/ui', () => ({
  escapeHtml: (text: string) => text,
  showToast: vi.fn(),
  getUserInitial: (name: string) => (name || '?').charAt(0).toUpperCase(),
  getRoleBadge: (role: string) => {
    switch (role) {
      case 'admin': return { label: 'Admin', class: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
      case 'trainer': return { label: 'Trainer', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
      case 'client': return { label: 'Client', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
      default: return { label: role, class: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' };
    }
  },
  ICONS: {},
  formatDate: () => '-',
  formatTime: () => '',
  renderEmptyState: () => '',
  renderLoadingState: () => '',
}));

// ─── Servicio a testear ──────────────────────────────────────────────────────

import {
  loadProfile,
  updateProfile,
  sendPasswordReset,
  changePassword,
  getProfileInitial,
  getRoleBadgeClass,
} from '../../../src/lib/shared/profileService';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── loadProfile ──────────────────────────────────────────────────────────

  describe('loadProfile', () => {
    it('✅ should load profile successfully', async () => {
      const mockData = {
        name: 'Juan Pérez',
        email: 'juan@test.com',
        role: 'client',
        createdAt: new Date('2024-01-01'),
      };

      mockFns.getDoc.mockResolvedValue({
        exists: () => true,
        id: 'user123',
        data: () => mockData,
      });

      const profile = await loadProfile('user123');

      expect(profile).not.toBeNull();
      expect(profile).toMatchObject({
        name: 'Juan Pérez',
        email: 'juan@test.com',
        role: 'client',
      });
    });

    it('✅ should load profile with assigned trainer', async () => {
      const mockData = {
        name: 'Juan Pérez',
        email: 'juan@test.com',
        role: 'client',
        assignedTrainerId: 'trainer-1',
      };

      mockFns.getDoc
        .mockResolvedValueOnce({
          exists: () => true,
          id: 'user123',
          data: () => mockData,
        })
        .mockResolvedValueOnce({
          exists: () => true,
          id: 'trainer-1',
          data: () => ({ name: 'Trainer Uno' }),
        });

      const profile = await loadProfile('user123');

      expect(profile).not.toBeNull();
      expect(profile).toMatchObject({
        name: 'Juan Pérez',
        assignedTrainerName: 'Trainer Uno',
      });
    });

    it('✅ should return null when document does not exist', async () => {
      mockFns.getDoc.mockResolvedValue({
        exists: () => false,
        data: () => undefined,
      });

      const profile = await loadProfile('nonexistent');
      expect(profile).toBeNull();
    });

    it('⚠️ should return null on Firestore errors (no throw)', async () => {
      mockFns.getDoc.mockRejectedValue(new Error('Firestore error'));

      const profile = await loadProfile('user123');
      expect(profile).toBeNull();
    });
  });

  // ── updateProfile ────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('✅ should update profile successfully', async () => {
      mockFns.updateDoc.mockResolvedValue(undefined);

      const result = await updateProfile('user123', { name: 'Nuevo Nombre' });

      expect(result).toEqual({ success: true, message: 'Perfil actualizado correctamente' });
      expect(mockFns.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Nuevo Nombre',
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('⚠️ should return error result on Firestore errors (no throw)', async () => {
      mockFns.updateDoc.mockRejectedValue(new Error('Update failed'));

      const result = await updateProfile('user123', { name: 'Test' });
      expect(result).toEqual({ success: false, message: 'Error al actualizar el perfil' });
    });
  });

  // ── sendPasswordReset ────────────────────────────────────────────────────

  describe('sendPasswordReset', () => {
    it('✅ should send password reset email', async () => {
      authMockFns.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await sendPasswordReset('user@test.com');

      expect(result).toEqual({ success: true, message: 'Email de recuperación enviado a user@test.com' });
      expect(authMockFns.sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'user@test.com');
    });

    it('⚠️ should return error result on auth errors (no throw)', async () => {
      authMockFns.sendPasswordResetEmail.mockRejectedValue(new Error('User not found'));

      const result = await sendPasswordReset('invalid@test.com');
      expect(result).toEqual({ success: false, message: 'Error al enviar el email de recuperación' });
    });
  });

  // ── changePassword ───────────────────────────────────────────────────────

  describe('changePassword', () => {
    it('✅ should change password successfully', async () => {
      authMockFns.updatePassword.mockResolvedValue(undefined);

      const mockUser = { uid: 'user123' } as any;
      const result = await changePassword(mockUser, 'newPassword123');

      expect(result).toEqual({ success: true, message: 'Contraseña cambiada correctamente' });
      expect(authMockFns.updatePassword).toHaveBeenCalledWith(mockUser, 'newPassword123');
    });

    it('⚠️ should return error result on auth errors (no throw)', async () => {
      authMockFns.updatePassword.mockRejectedValue(new Error('Requires recent login'));

      const mockUser = { uid: 'user123' } as any;
      const result = await changePassword(mockUser, 'newPassword123');
      expect(result).toEqual({ success: false, message: 'Error al cambiar la contraseña' });
    });
  });

  // ── getProfileInitial ────────────────────────────────────────────────────

  describe('getProfileInitial', () => {
    it('✅ should return first letter of name', () => {
      expect(getProfileInitial('Juan')).toBe('J');
    });

    it('✅ should return uppercase letter', () => {
      expect(getProfileInitial('maría')).toBe('M');
    });

    it('✅ should return ? for empty name', () => {
      expect(getProfileInitial('')).toBe('?');
    });

    it('✅ should return ? for undefined', () => {
      expect(getProfileInitial(undefined as unknown as string)).toBe('?');
    });
  });

  // ── getRoleBadgeClass ────────────────────────────────────────────────────

  describe('getRoleBadgeClass', () => {
    it('✅ should return admin badge class', () => {
      const result = getRoleBadgeClass('admin');
      expect(result).toHaveProperty('class');
      expect(result.class).toContain('bg-purple');
    });

    it('✅ should return trainer badge class', () => {
      const result = getRoleBadgeClass('trainer');
      expect(result).toHaveProperty('class');
      expect(result.class).toContain('bg-blue');
    });

    it('✅ should return client badge class', () => {
      const result = getRoleBadgeClass('client');
      expect(result).toHaveProperty('class');
      expect(result.class).toContain('bg-emerald');
    });

    it('✅ should return default badge class for unknown role', () => {
      const result = getRoleBadgeClass('unknown');
      expect(result).toHaveProperty('class');
      expect(result.class).toContain('bg-zinc');
    });
  });
});
