/**
 * Tests unitarios para adminService.
 *
 * adminService depende de Firestore (getDocs, updateDoc).
 * Usamos vi.mock con factory inline y objeto mockFns compartido.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mocks con vi.hoisted() ──────────────────────────────────────────────────

const { firestoreInstance, mockFns } = vi.hoisted(() => {
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

  return { firestoreInstance, mockFns };
});

vi.mock('firebase/firestore', () => mockFns);

vi.mock('@/lib/firebase', () => ({
  db: firestoreInstance,
  auth: {},
}));

// ─── Servicio REAL a testear ─────────────────────────────────────────────────

import { adminService } from '../../../src/services/adminService';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllUsers', () => {
    it('✅ should return all users with correct structure', async () => {
      const mockUsers = [
        { id: 'user-1', data: () => ({ name: 'Alice', email: 'alice@test.com', role: 'client' }) },
        { id: 'user-2', data: () => ({ name: 'Bob', email: 'bob@test.com', role: 'trainer' }) },
      ];
      mockFns.getDocs.mockResolvedValue({ docs: mockUsers, forEach: (fn: (d: unknown) => void) => mockUsers.forEach(fn) });

      const users = await adminService.getAllUsers();

      expect(users).toHaveLength(2);
      // El servicio usa uid (no id) y añade campos adicionales
      expect(users[0]).toMatchObject({ uid: 'user-1', name: 'Alice', email: 'alice@test.com', role: 'client' });
      expect(users[1]).toMatchObject({ uid: 'user-2', name: 'Bob', email: 'bob@test.com', role: 'trainer' });
      expect(users[0]).toHaveProperty('hasActiveAlert', false);
    });

    it('✅ should handle missing fields gracefully', async () => {
      const mockUsers = [
        { id: 'user-1', data: () => ({ name: 'Alice' }) },
      ];
      mockFns.getDocs.mockResolvedValue({ docs: mockUsers, forEach: (fn: (d: unknown) => void) => mockUsers.forEach(fn) });

      const users = await adminService.getAllUsers();

      expect(users).toHaveLength(1);
      // El servicio asigna defaults: email = '', role = 'client', hasActiveAlert = false
      expect(users[0]).toMatchObject({
        uid: 'user-1',
        name: 'Alice',
        email: '',
        role: 'client',
        hasActiveAlert: false,
      });
    });

    it('✅ should return empty array when no users exist', async () => {
      mockFns.getDocs.mockResolvedValue({ docs: [], forEach: (fn: (d: unknown) => void) => [].forEach(fn) });

      const users = await adminService.getAllUsers();

      expect(users).toEqual([]);
    });

    it('⚠️ should propagate Firestore errors', async () => {
      mockFns.getDocs.mockRejectedValue(new Error('Permission denied'));

      await expect(adminService.getAllUsers()).rejects.toThrow('Permission denied');
    });
  });

  describe('getUsersByRole', () => {
    it('✅ should filter users by role', async () => {
      const mockUsers = [
        { id: 'user-1', data: () => ({ name: 'Alice', email: 'alice@test.com', role: 'client' }) },
      ];
      mockFns.getDocs.mockResolvedValue({ docs: mockUsers, forEach: (fn: (d: unknown) => void) => mockUsers.forEach(fn) });

      const users = await adminService.getUsersByRole('client');

      expect(mockFns.where).toHaveBeenCalledWith('role', '==', 'client');
      expect(users).toHaveLength(1);
      expect(users[0]?.role).toBe('client');
    });

    it('✅ should return empty array when no users of that role exist', async () => {
      mockFns.getDocs.mockResolvedValue({ docs: [], forEach: (fn: (d: unknown) => void) => [].forEach(fn) });

      const users = await adminService.getUsersByRole('client');

      expect(users).toEqual([]);
    });

    it('⚠️ should propagate Firestore errors', async () => {
      mockFns.getDocs.mockRejectedValue(new Error('Permission denied'));

      await expect(adminService.getUsersByRole('client')).rejects.toThrow('Permission denied');
    });
  });

  describe('updateUserRole', () => {
    it('✅ should update user role in Firestore', async () => {
      mockFns.updateDoc.mockResolvedValue(undefined);

      await adminService.updateUserRole('user-1', 'trainer');

      expect(mockFns.doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user-1');
      // El servicio añade updatedAt automáticamente
      expect(mockFns.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ role: 'trainer' }),
      );
      const updateArg = mockFns.updateDoc.mock.calls[0]?.[1] as Record<string, unknown>;
      expect(updateArg).toHaveProperty('updatedAt');
    });

    it('⚠️ should propagate Firestore errors', async () => {
      mockFns.updateDoc.mockRejectedValue(new Error('Update failed'));

      await expect(adminService.updateUserRole('user-1', 'trainer')).rejects.toThrow('Update failed');
    });
  });

  describe('disableUser', () => {
    it('✅ should set hasActiveAlert flag', async () => {
      mockFns.updateDoc.mockResolvedValue(undefined);

      await adminService.disableUser('user-1');

      expect(mockFns.doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user-1');
      // El servicio añade updatedAt automáticamente
      expect(mockFns.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ hasActiveAlert: true }),
      );
      const updateArg = mockFns.updateDoc.mock.calls[0]?.[1] as Record<string, unknown>;
      expect(updateArg).toHaveProperty('updatedAt');
    });

    it('⚠️ should propagate Firestore errors', async () => {
      mockFns.updateDoc.mockRejectedValue(new Error('Disable failed'));

      await expect(adminService.disableUser('user-1')).rejects.toThrow('Disable failed');
    });
  });

  describe('getStats', () => {
    it('✅ should calculate correct stats from user data', async () => {
      const mockUsers = [
        { id: 'u1', data: () => ({ role: 'client' }) },
        { id: 'u2', data: () => ({ role: 'trainer' }) },
        { id: 'u3', data: () => ({ role: 'client', hasActiveAlert: true }) },
      ];
      mockFns.getDocs.mockResolvedValue({ docs: mockUsers, forEach: (fn: (d: unknown) => void) => mockUsers.forEach(fn) });

      const stats = await adminService.getStats();

      // El servicio devuelve activeAlerts (no recentUsers ni totalAdmins)
      expect(stats).toEqual({
        totalUsers: 3,
        totalClients: 2,
        totalTrainers: 1,
        activeAlerts: 1,
      });
    });

    it('✅ should return zeros when no users exist', async () => {
      mockFns.getDocs.mockResolvedValue({ docs: [], forEach: (fn: (d: unknown) => void) => [].forEach(fn) });

      const stats = await adminService.getStats();

      expect(stats).toEqual({
        totalUsers: 0,
        totalClients: 0,
        totalTrainers: 0,
        activeAlerts: 0,
      });
    });

    it('⚠️ should propagate Firestore errors', async () => {
      mockFns.getDocs.mockRejectedValue(new Error('Stats error'));

      await expect(adminService.getStats()).rejects.toThrow('Stats error');
    });
  });
});
