/**
 * Tests unitarios para authService.
 *
 * Patrón: Una función = un describe
 * Escenarios por función: éxito, error, edge case
 *
 * NOTA: Importamos el servicio REAL desde src/services/authService.ts
 * y mockeamos los wrappers @/lib/firebase/auth y @/lib/firebase/firestore
 * para aislar las pruebas.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMockUserCredential,
  createMockUserProfile,
  TEST_CREDENTIALS,
  TEST_ERRORS,
} from '../../mocks/firebase';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const {
  mockSignInWithEmailAndPassword,
  mockCreateUserWithEmailAndPassword,
  mockSignOut,
  mockSendPasswordResetEmail,
  mockOnAuthStateChanged,
  mockSignInWithPopup,
  mockGetDoc,
  mockSetDoc,
  mockDoc,
} = vi.hoisted(() => {
  const mockSignInWithEmailAndPassword = vi.fn();
  const mockCreateUserWithEmailAndPassword = vi.fn();
  const mockSignOut = vi.fn();
  const mockSendPasswordResetEmail = vi.fn();
  const mockOnAuthStateChanged = vi.fn(() => () => {});
  const mockSignInWithPopup = vi.fn();
  const mockGetDoc = vi.fn();
  const mockSetDoc = vi.fn();
  const mockDoc = vi.fn(() => ({ id: 'mock-doc-ref', path: 'users/mock-doc-ref' }));

  return {
    mockSignInWithEmailAndPassword,
    mockCreateUserWithEmailAndPassword,
    mockSignOut,
    mockSendPasswordResetEmail,
    mockOnAuthStateChanged,
    mockSignInWithPopup,
    mockGetDoc,
    mockSetDoc,
    mockDoc,
  };
});

// Mock de @/lib/firebase (auth y db)
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
}));

// Mock de @/types
vi.mock('@/types', () => ({
  User: {},
}));

// Mock del wrapper @/lib/firebase/auth
vi.mock('@/lib/firebase/auth', () => ({
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  onAuthStateChanged: mockOnAuthStateChanged,
  GoogleAuthProvider: vi.fn(function GoogleAuthProvider() { return {}; }),
  signInWithPopup: mockSignInWithPopup,
}));

// Mock del wrapper @/lib/firebase/firestore
vi.mock('@/lib/firebase/firestore', () => ({
  doc: mockDoc,
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  serverTimestamp: vi.fn(() => new Date('2024-01-01')),
}));

// ─── Servicio REAL a testear ─────────────────────────────────────────────────

import { authService } from '../../../src/services/authService';

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
      ).rejects.toThrow('profile/not-found');
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

    it('⚠️ should propagate signOut errors', async () => {
      mockSignOut.mockRejectedValue(new Error('No user'));

      await expect(authService.logoutUser()).rejects.toThrow('No user');
    });
  });

  // ── recoverPassword ──────────────────────────────────────────────────────

  describe('recoverPassword', () => {
    it('✅ should send password reset email', async () => {
      mockSendPasswordResetEmail.mockResolvedValue(undefined);

      await authService.recoverPassword('user@test.com');

      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'user@test.com',
      );
    });

    it('❌ should propagate errors', async () => {
      mockSendPasswordResetEmail.mockRejectedValue(TEST_ERRORS.userNotFound);

      await expect(
        authService.recoverPassword('invalid@test.com'),
      ).rejects.toThrow('auth/user-not-found');
    });
  });

  // ── loginWithGoogle ──────────────────────────────────────────────────────

  describe('loginWithGoogle', () => {
    it('✅ should login with Google and return existing user', async () => {
      const mockCredential = createMockUserCredential();
      const mockProfile = createMockUserProfile();

      mockSignInWithPopup.mockResolvedValue(mockCredential);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProfile,
      });

      const result = await authService.loginWithGoogle();

      expect(result).toHaveProperty('uid', mockCredential.user.uid);
      expect(result).toHaveProperty('name', mockProfile.name);
      expect(result).toHaveProperty('role', mockProfile.role);
      expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
    });

    it('✅ should create new profile if user does not exist in Firestore', async () => {
      const mockCredential = createMockUserCredential({ uid: 'new-google-uid', displayName: 'Google User' });

      mockSignInWithPopup.mockResolvedValue(mockCredential);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const result = await authService.loginWithGoogle();

      expect(result).toHaveProperty('uid', 'new-google-uid');
      expect(result).toHaveProperty('name', 'Google User');
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Google User',
          email: mockCredential.user.email || '',
          role: 'client',
          onboardingCompleted: false,
        }),
      );
    });

    it('❌ should propagate Google auth errors', async () => {
      mockSignInWithPopup.mockRejectedValue(TEST_ERRORS.popupClosed);

      await expect(authService.loginWithGoogle()).rejects.toThrow('auth/popup-closed-by-user');
    });
  });

  // ── onAuthChange ─────────────────────────────────────────────────────────

  describe('onAuthChange', () => {
    it('✅ should subscribe to auth state changes', () => {
      const callback = vi.fn();
      const unsubscribe = authService.onAuthChange(callback);

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(expect.anything(), callback);
      expect(typeof unsubscribe).toBe('function');
    });

    it('✅ should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = authService.onAuthChange(callback);

      // Llamar al unsubscribe no debería lanzar error
      expect(() => unsubscribe()).not.toThrow();
    });
  });
});
