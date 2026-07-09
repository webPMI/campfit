/**
 * Tests unitarios para authStore (Nanostores).
 *
 * Los stores de Nanostores son síncronos y fáciles de testear.
 * No requieren mocks de Firebase porque solo manejan estado local.
 *
 * Patrón: beforeEach → resetear estado → testear comportamiento
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMockUserProfile } from '../../mocks/firebase';

// ─── Store de ejemplo ────────────────────────────────────────────────────────
// NOTA: Implementación inline para demostración. Reemplazar con import real
// cuando el store exista en src/stores/authStore.ts

import { atom, computed } from 'nanostores';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
}

// Store base
export const $user = atom<User | null>(null);
export const $authLoading = atom<boolean>(true);
export const $authError = atom<string | null>(null);

// Stores computados
export const $isAuthenticated = computed($user, (user) => user !== null);
export const $userRole = computed($user, (user) => user?.role ?? null);
export const $userName = computed($user, (user) => user?.name ?? null);

// Acciones
export function setUser(user: User | null): void {
  $user.set(user);
}

export function setAuthLoading(loading: boolean): void {
  $authLoading.set(loading);
}

export function setAuthError(error: string | null): void {
  $authError.set(error);
}

export function clearAuth(): void {
  $user.set(null);
  $authLoading.set(false);
  $authError.set(null);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('authStore', () => {
  beforeEach(() => {
    // Resetear todos los stores a estado inicial
    $user.set(null);
    $authLoading.set(true);
    $authError.set(null);
  });

  // ── $user ────────────────────────────────────────────────────────────────

  describe('$user', () => {
    it('✅ should start with null', () => {
      expect($user.get()).toBeNull();
    });

    it('✅ should set user correctly', () => {
      const mockUser = createMockUserProfile() as unknown as User;
      setUser(mockUser);
      expect($user.get()).toEqual(mockUser);
    });

    it('✅ should clear user on null set', () => {
      const mockUser = createMockUserProfile() as unknown as User;
      setUser(mockUser);
      expect($user.get()).not.toBeNull();

      setUser(null);
      expect($user.get()).toBeNull();
    });

    it('⚠️ should handle undefined gracefully', () => {
      setUser(undefined as unknown as User);
      expect($user.get()).toBeUndefined();
    });
  });

  // ── $authLoading ─────────────────────────────────────────────────────────

  describe('$authLoading', () => {
    it('✅ should start as true', () => {
      expect($authLoading.get()).toBe(true);
    });

    it('✅ should update loading state', () => {
      setAuthLoading(false);
      expect($authLoading.get()).toBe(false);

      setAuthLoading(true);
      expect($authLoading.get()).toBe(true);
    });
  });

  // ── $authError ───────────────────────────────────────────────────────────

  describe('$authError', () => {
    it('✅ should start as null', () => {
      expect($authError.get()).toBeNull();
    });

    it('✅ should set error message', () => {
      setAuthError('Credenciales inválidas');
      expect($authError.get()).toBe('Credenciales inválidas');
    });

    it('✅ should clear error on null set', () => {
      setAuthError('Error temporal');
      setAuthError(null);
      expect($authError.get()).toBeNull();
    });
  });

  // ── $isAuthenticated (computed) ──────────────────────────────────────────

  describe('$isAuthenticated (computed)', () => {
    it('✅ should be false when user is null', () => {
      expect($isAuthenticated.get()).toBe(false);
    });

    it('✅ should be true when user is set', () => {
      setUser({ uid: '123', name: 'Test', email: 'test@test.com', role: 'client' });
      expect($isAuthenticated.get()).toBe(true);
    });

    it('✅ should reactively update when user changes', () => {
      expect($isAuthenticated.get()).toBe(false);

      setUser({ uid: '123', name: 'Test', email: 'test@test.com', role: 'client' });
      expect($isAuthenticated.get()).toBe(true);

      setUser(null);
      expect($isAuthenticated.get()).toBe(false);
    });
  });

  // ── $userRole (computed) ─────────────────────────────────────────────────

  describe('$userRole (computed)', () => {
    it('✅ should return null when no user', () => {
      expect($userRole.get()).toBeNull();
    });

    it('✅ should return user role', () => {
      setUser({ uid: '123', name: 'Admin', email: 'admin@test.com', role: 'admin' });
      expect($userRole.get()).toBe('admin');
    });

    it('✅ should return client role', () => {
      setUser({ uid: '456', name: 'Client', email: 'client@test.com', role: 'client' });
      expect($userRole.get()).toBe('client');
    });
  });

  // ── clearAuth ────────────────────────────────────────────────────────────

  describe('clearAuth', () => {
    it('✅ should reset all auth state to defaults', () => {
      // Primero establecer estado
      setUser({ uid: '123', name: 'Test', email: 'test@test.com', role: 'client' });
      setAuthLoading(true);
      setAuthError('Algo salió mal');

      // Luego limpiar
      clearAuth();

      expect($user.get()).toBeNull();
      expect($authLoading.get()).toBe(false);
      expect($authError.get()).toBeNull();
    });
  });
});
