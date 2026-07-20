/**
 * Tests unitarios para trainerClients.ts
 *
 * @module tests/unit/lib/trainer/trainerClients.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

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

vi.mock('firebase/firestore', () => firestoreExports);

vi.mock('@/lib/firebase', () => ({
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

describe('trainerClients', () => {
  describe('subscribeToClients', () => {
    it('debería suscribirse a los clientes de un entrenador', async () => {
      const mockClients = [
        {
          id: 'client-1',
          data: () => ({
            name: 'Cliente 1',
            email: 'c1@test.com',
            role: 'client',
            assignedTrainerId: 'trainer-123',
            hasActiveAlert: false,
          }),
        },
        {
          id: 'client-2',
          data: () => ({
            name: 'Cliente 2',
            email: 'c2@test.com',
            role: 'client',
            assignedTrainerId: 'trainer-123',
            hasActiveAlert: true,
          }),
        },
      ];

      mockOnSnapshot.mockImplementation(((...args: unknown[]) => {
        const callback = args[1] as (s: unknown) => void;
        callback({ docs: mockClients });
        return vi.fn();
      }) as never);

      const { subscribeToClients } = await import('@/lib/trainer/trainerClients');
      const callback = vi.fn();
      const unsubscribe = subscribeToClients('trainer-123', callback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ uid: 'client-1', name: 'Cliente 1' }),
          expect.objectContaining({ uid: 'client-2', name: 'Cliente 2', hasActiveAlert: true }),
        ]),
      );
      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it('debería manejar errores de suscripción', async () => {
      mockOnSnapshot.mockImplementation(((...args: unknown[]) => {
        const error = args[2] as (e: Error) => void;
        error(new Error('Firestore error'));
        return vi.fn();
      }) as never);

      const { subscribeToClients } = await import('@/lib/trainer/trainerClients');
      const callback = vi.fn();
      subscribeToClients('trainer-123', callback);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getClientProfile', () => {
    it('debería retornar el perfil del cliente', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          name: 'María García',
          email: 'maria@test.com',
          role: 'client',
          assignedTrainerId: 'trainer-123',
          hasActiveAlert: false,
          medicalProfile: { allergies: ['polen'], goals: ['strength'] },
        }),
        id: 'client-123',
      });

      const { getClientProfile } = await import('@/lib/trainer/trainerClients');
      const profile = await getClientProfile('client-123');

      expect(profile).not.toBeNull();
      expect(profile!.name).toBe('María García');
      expect(profile!.medicalProfile?.allergies).toContain('polen');
    });

    it('debería retornar null si el cliente no existe', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
        id: 'client-123',
      });

      const { getClientProfile } = await import('@/lib/trainer/trainerClients');
      const profile = await getClientProfile('client-123');

      expect(profile).toBeNull();
    });

    it('debería retornar null si falla la consulta', async () => {
      mockGetDoc.mockRejectedValue(new Error('Error'));

      const { getClientProfile } = await import('@/lib/trainer/trainerClients');
      const profile = await getClientProfile('client-123');

      expect(profile).toBeNull();
    });
  });
});
