/**
 * Store de autenticación (Nanostores).
 * Maneja el estado global del usuario autenticado.
 *
 * Uso:
 *   import { $user, $isAuthenticated, setUser, clearAuth } from '@/stores/authStore';
 *   $user.subscribe((user) => console.log(user));
 */

import { atom, computed } from 'nanostores';
import type { User } from '@/types';

// ─── Stores base ────────────────────────────────────────────────────────────

/** Usuario autenticado (null si no hay sesión) */
export const $user = atom<User | null>(null);

/** Estado de carga inicial (verificando sesión) */
export const $authLoading = atom<boolean>(true);

/** Mensaje de error de autenticación */
export const $authError = atom<string | null>(null);

// ─── Stores computados ──────────────────────────────────────────────────────

/** ¿Está el usuario autenticado? */
export const $isAuthenticated = computed($user, (user) => user !== null);

/** Rol del usuario autenticado (null si no hay sesión) */
export const $userRole = computed($user, (user) => user?.role ?? null);

/** Nombre del usuario autenticado */
export const $userName = computed($user, (user) => user?.name ?? null);

/** ¿Es admin? */
export const $isAdmin = computed($userRole, (role) => role === 'admin');

/** ¿Es trainer? */
export const $isTrainer = computed($userRole, (role) => role === 'trainer');

/** ¿Es cliente? */
export const $isClient = computed($userRole, (role) => role === 'client');

// ─── Acciones ───────────────────────────────────────────────────────────────

/** Establecer el usuario autenticado */
export function setUser(user: User | null): void {
  $user.set(user);
}

/** Establecer estado de carga */
export function setAuthLoading(loading: boolean): void {
  $authLoading.set(loading);
}

/** Establecer mensaje de error */
export function setAuthError(error: string | null): void {
  $authError.set(error);
}

/** Limpiar todo el estado de autenticación */
export function clearAuth(): void {
  $user.set(null);
  $authLoading.set(false);
  $authError.set(null);
}
