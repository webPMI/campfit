/**
 * Tests unitarios para adminUsers.ts
 *
 * @module tests/unit/lib/admin/adminUsers.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreateUserWithEmailAndPassword = vi.fn();
const mockAuth = { currentUser: null };

// Mocks inline de Firestore
const mockCollection = vi.fn();
const mockDoc = vi.fn();
const mockAddDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockOnSnapshot = vi.fn(() => vi.fn());
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockServerTimestamp = vi.fn(() => new Date('2024-01-01'));

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

const firestoreExports = {
  getFirestore: vi.fn(() => firestoreInstance),
  collection: vi.fn((...args: unknown[]) => {
    mockCollection(...args);
    return { id: typeof args[1] === 'string' ? args[1] : 'unknown', path: `firestore/${args[1] || 'unknown'}`, firestore: firestoreInstance, type: 'collection', withConverter: vi.fn(() => ({})) };
  }),
  doc: vi.fn((...args: unknown[]) => {
    mockDoc(...args);
    return { id: typeof args[2] === 'string' ? args[2] : 'mock-doc-ref', path: `firestore/${args[1] || 'unknown'}/${args[2] || 'mock-doc-ref'}`, firestore: firestoreInstance, type: 'document', withConverter: vi.fn(() => ({})) };
  }),
  addDoc: mockAddDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  onSnapshot: mockOnSnapshot,
  query: vi.fn((...args: unknown[]) => { mockQuery(...args); return { type: 'query', firestore: firestoreInstance, withConverter: vi.fn(() => ({})) }; }),
  where: vi.fn((...args: unknown[]) => { mockWhere(...args); return { field: args[0], op: args[1], value: args[2] }; }),
  orderBy: vi.fn((...args: unknown[]) => { mockOrderBy(...args); return { field: args[0], direction: args[1] }; }),
  limit: vi.fn((...args: unknown[]) => { mockLimit(...args); return { type: 'limit', value: args[0] }; }),
  serverTimestamp: mockServerTimestamp,
  Timestamp: class {
    static now() { return new Date('2024-01-01'); }
    static fromDate(date: Date) { return date; }
    toDate() { return new Date('2024-01-01'); }
    toMillis() { return 1704067200000; }
  },
};

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
}));

vi.mock('firebase/firestore', () => firestoreExports);

vi.mock('@/lib/firebase', () => ({
  auth: mockAuth,
  db: firestoreInstance,
}));

vi.mock('@/lib/shared/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/shared/ui', () => ({
  showToast: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('adminUsers', () => {
  describe('createUser', () => {
    const validPayload = {
      email: 'newuser@test.com',
      password: 'Test1234!',
      name: 'Nuevo Usuario',
      role: 'client' as const,
    };

    it('debería crear un usuario exitosamente', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'new-uid-123' },
      });
      mockSetDoc.mockResolvedValue(undefined);

      const { createUser } = await import('@/lib/admin/adminUsers');
      const result = await createUser(validPayload);

      expect(result.success).toBe(true);
      expect(result.uid).toBe('new-uid-123');
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        validPayload.email,
        validPayload.password,
      );
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
    });

    it('debería crear usuario con trainer asignado', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'new-uid-456' },
      });
      mockSetDoc.mockResolvedValue(undefined);

      const { createUser } = await import('@/lib/admin/adminUsers');
      const result = await createUser({
        ...validPayload,
        assignedTrainerId: 'trainer-123',
      });

      expect(result.success).toBe(true);
      expect(result.uid).toBe('new-uid-456');
    });

    it('debería fallar con email ya registrado', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue({
        code: 'auth/email-already-in-use',
      });

      const { createUser } = await import('@/lib/admin/adminUsers');
      const result = await createUser(validPayload);

      expect(result.success).toBe(false);
      expect(result.message).toBe('El email ya está registrado');
    });

    it('debería fallar con contraseña débil', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue({
        code: 'auth/weak-password',
      });

      const { createUser } = await import('@/lib/admin/adminUsers');
      const result = await createUser(validPayload);

      expect(result.success).toBe(false);
      expect(result.message).toBe('La contraseña debe tener al menos 6 caracteres');
    });

    it('debería manejar errores genéricos', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue(
        new Error('Network error'),
      );

      const { createUser } = await import('@/lib/admin/adminUsers');
      const result = await createUser(validPayload);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Error al crear el usuario');
    });
  });

  describe('updateUserRole', () => {
    it('debería actualizar el rol exitosamente', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const { updateUserRole } = await import('@/lib/admin/adminUsers');
      const result = await updateUserRole('uid-123', 'trainer');

      expect(result).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('debería retornar false si falla la actualización', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

      const { updateUserRole } = await import('@/lib/admin/adminUsers');
      const result = await updateUserRole('uid-123', 'trainer');

      expect(result).toBe(false);
    });
  });

  describe('assignTrainer', () => {
    it('debería asignar un trainer a un cliente', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const { assignTrainer } = await import('@/lib/admin/adminUsers');
      const result = await assignTrainer('client-123', 'trainer-456');

      expect(result).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('debería desasignar un trainer', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const { assignTrainer } = await import('@/lib/admin/adminUsers');
      const result = await assignTrainer('client-123', null);

      expect(result).toBe(true);
    });

    it('debería retornar false si falla', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Error'));

      const { assignTrainer } = await import('@/lib/admin/adminUsers');
      const result = await assignTrainer('client-123', 'trainer-456');

      expect(result).toBe(false);
    });
  });

  describe('deleteUser', () => {
    it('debería eliminar un usuario exitosamente', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      const { deleteUser } = await import('@/lib/admin/adminUsers');
      const result = await deleteUser('uid-123');

      expect(result).toBe(true);
      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it('debería retornar false si falla', async () => {
      mockDeleteDoc.mockRejectedValue(new Error('Error'));

      const { deleteUser } = await import('@/lib/admin/adminUsers');
      const result = await deleteUser('uid-123');

      expect(result).toBe(false);
    });
  });

  describe('toggleUserBlock', () => {
    it('debería bloquear un usuario', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const { toggleUserBlock } = await import('@/lib/admin/adminUsers');
      const result = await toggleUserBlock('uid-123', true);

      expect(result).toBe(true);
    });

    it('debería desbloquear un usuario', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const { toggleUserBlock } = await import('@/lib/admin/adminUsers');
      const result = await toggleUserBlock('uid-123', false);

      expect(result).toBe(true);
    });

    it('debería retornar false si falla', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Error'));

      const { toggleUserBlock } = await import('@/lib/admin/adminUsers');
      const result = await toggleUserBlock('uid-123', true);

      expect(result).toBe(false);
    });
  });

  describe('getUserName', () => {
    it('debería retornar el nombre del usuario', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ name: 'Juan Pérez' }),
        id: 'uid-123',
      });

      const { getUserName } = await import('@/lib/admin/adminUsers');
      const name = await getUserName('uid-123');

      expect(name).toBe('Juan Pérez');
    });

    it('debería retornar "Usuario desconocido" si no existe', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
        id: 'uid-123',
      });

      const { getUserName } = await import('@/lib/admin/adminUsers');
      const name = await getUserName('uid-123');

      expect(name).toBe('Usuario desconocido');
    });

    it('debería retornar "Error" si falla la consulta', async () => {
      mockGetDoc.mockRejectedValue(new Error('Error'));

      const { getUserName } = await import('@/lib/admin/adminUsers');
      const name = await getUserName('uid-123');

      expect(name).toBe('Error');
    });
  });

  describe('getUserProfile', () => {
    it('debería retornar el perfil completo del usuario', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          name: 'Juan Pérez',
          email: 'juan@test.com',
          role: 'trainer',
          assignedTrainerId: null,
          hasActiveAlert: false,
        }),
        id: 'uid-123',
      });

      const { getUserProfile } = await import('@/lib/admin/adminUsers');
      const profile = await getUserProfile('uid-123');

      expect(profile).not.toBeNull();
      expect(profile!.uid).toBe('uid-123');
      expect(profile!.name).toBe('Juan Pérez');
      expect(profile!.role).toBe('trainer');
    });

    it('debería retornar null si el usuario no existe', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
        id: 'uid-123',
      });

      const { getUserProfile } = await import('@/lib/admin/adminUsers');
      const profile = await getUserProfile('uid-123');

      expect(profile).toBeNull();
    });

    it('debería retornar null si falla la consulta', async () => {
      mockGetDoc.mockRejectedValue(new Error('Error'));

      const { getUserProfile } = await import('@/lib/admin/adminUsers');
      const profile = await getUserProfile('uid-123');

      expect(profile).toBeNull();
    });
  });
});
