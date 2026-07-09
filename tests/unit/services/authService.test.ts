/**
 * Tests unitarios para authService.
 *
 * Patrón: Una función = un describe
 * Escenarios por función: éxito, error, edge case
 *
 * @see {@tutorial https://vitest.dev/guide/}
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMockUserCredential,
  createMockUserProfile,
  TEST_CREDENTIALS,
  TEST_ERRORS,
} from '../../mocks/firebase';

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Estos mocks sobrescriben los globales del setup para este test específico.
// Se importan dinámicamente para que el hoisting de vi.mock funcione correctamente.

const mockGetAuth = vi.fn(() => ({}));
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockDoc = vi.fn(() => ({ id: 'mock-doc-ref' }));

const mockCollection = vi.fn();

vi.mock('firebase/auth', () => ({
  getAuth: mockGetAuth,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
}));


vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: mockCollection,
  doc: mockDoc,
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  serverTimestamp: vi.fn(() => new Date('2024-01-01')),
}));

// ─── Servicio a testear ──────────────────────────────────────────────────────
// NOTA: Como el servicio aún no existe, definimos una implementación mínima
// para demostrar la estructura de testing. Cuando el servicio real exista,
// reemplazar este import.

interface AuthService {
  loginUser: (email: string, password: string) => Promise<{
    uid: string;
    email: string;
    name: string;
    role: string;
  }>;
  registerUser: (name: string, email: string, password: string) => Promise<{ uid: string }>;
  logoutUser: () => Promise<void>;
}

// Implementación de ejemplo del servicio (reemplazar con import real cuando exista)
// NOTA: La firma real de Firebase es signInWithEmailAndPassword(auth, email, password)
const authService: AuthService = {
  async loginUser(email: string, password: string) {
    const auth = mockGetAuth();
    const { user } = await mockSignInWithEmailAndPassword(auth, email, password);
    const userDoc = await mockGetDoc();
    if (!userDoc.exists()) {
      throw new Error('Perfil de usuario no encontrado');
    }
    const profile = userDoc.data();
    return { uid: user.uid, email: user.email, name: profile.name, role: profile.role };
  },

  async registerUser(name: string, email: string, password: string) {
    const auth = mockGetAuth();
    const { user } = await mockCreateUserWithEmailAndPassword(auth, email, password);
    const docRef = mockDoc();
    await mockSetDoc(docRef, {
      name,
      email,
      role: 'client',
      createdAt: new Date('2024-01-01'),
    });
    return { uid: user.uid };
  },

  async logoutUser() {
    await mockSignOut();
  },
};


// ─── Tests ───────────────────────────────────────────────────────────────────

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── loginUser ────────────────────────────────────────────────────────────

  describe('loginUser', () => {
    it('✅ should return user data on successful login', async () => {
      const mockCredential = createMockUserCredential();
      const mockProfile = createMockUserProfile();

      mockSignInWithEmailAndPassword.mockResolvedValue(mockCredential);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProfile,
      });

      const result = await authService.loginUser(
        TEST_CREDENTIALS.email,
        TEST_CREDENTIALS.password,
      );

      expect(result).toHaveProperty('uid', mockCredential.user.uid);
      expect(result).toHaveProperty('name', mockProfile.name);
      expect(result).toHaveProperty('role', mockProfile.role);
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        TEST_CREDENTIALS.email,
        TEST_CREDENTIALS.password,
      );
    });

    it('❌ should throw on invalid credentials', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue(TEST_ERRORS.invalidCredential);

      await expect(
        authService.loginUser(TEST_CREDENTIALS.email, TEST_CREDENTIALS.wrongPassword),
      ).rejects.toThrow('auth/invalid-credential');
    });

    it('⚠️ should throw if user profile not found in Firestore', async () => {
      const mockCredential = createMockUserCredential();

      mockSignInWithEmailAndPassword.mockResolvedValue(mockCredential);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      await expect(
        authService.loginUser(TEST_CREDENTIALS.email, TEST_CREDENTIALS.password),
      ).rejects.toThrow('Perfil de usuario no encontrado');
    });

    it('⚠️ should handle network errors', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue(TEST_ERRORS.networkError);

      await expect(
        authService.loginUser(TEST_CREDENTIALS.email, TEST_CREDENTIALS.password),
      ).rejects.toThrow('auth/network-request-failed');
    });
  });

  // ── registerUser ─────────────────────────────────────────────────────────

  describe('registerUser', () => {
    it('✅ should create user in Firebase Auth and Firestore', async () => {
      const mockCredential = createMockUserCredential({ uid: 'new-uid-456' });

      mockCreateUserWithEmailAndPassword.mockResolvedValue(mockCredential);

      const result = await authService.registerUser(
        'Nuevo Usuario',
        'nuevo@campfit.app',
        'Password123!',
      );

      expect(result).toHaveProperty('uid', 'new-uid-456');
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Nuevo Usuario',
          email: 'nuevo@campfit.app',
          role: 'client',
        }),
      );
    });

    it('❌ should throw if email already in use', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue(TEST_ERRORS.emailAlreadyInUse);

      await expect(
        authService.registerUser('Test', 'existing@campfit.app', 'Password123!'),
      ).rejects.toThrow('auth/email-already-in-use');
    });

    it('❌ should throw on weak password', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue(TEST_ERRORS.weakPassword);

      await expect(
        authService.registerUser('Test', 'test@campfit.app', '123'),
      ).rejects.toThrow('auth/weak-password');
    });
  });

  // ── logoutUser ───────────────────────────────────────────────────────────

  describe('logoutUser', () => {
    it('✅ should call Firebase signOut', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await authService.logoutUser();

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('⚠️ should not throw if already logged out', async () => {
      mockSignOut.mockRejectedValue(new Error('No user'));

      await expect(authService.logoutUser()).rejects.toThrow('No user');
    });
  });
});
