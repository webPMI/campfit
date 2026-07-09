/**
 * Guardias de ruta para proteger páginas según rol.
 * Se usan en los scripts del cliente para redireccionar.
 *
 * Uso:
 *   import { checkRouteAccess } from '@/lib/routeGuards';
 *   const { allowed, redirectTo } = checkRouteAccess('/client/dashboard', user);
 */

import type { User } from '@/types';

export type RouteGuard = {
  path: string;
  allowedRoles: ('admin' | 'trainer' | 'client')[];
  requiresMedicalProfile?: boolean;
};

export const routeGuards: RouteGuard[] = [
  // Públicas
  { path: '/login', allowedRoles: [] },
  { path: '/register', allowedRoles: [] },
  { path: '/recover', allowedRoles: [] },
  { path: '/', allowedRoles: [] },

  // Cliente
  { path: '/client/medical-profile', allowedRoles: ['client'] },
  { path: '/client/dashboard', allowedRoles: ['client'], requiresMedicalProfile: false },
  { path: '/client/workouts', allowedRoles: ['client'], requiresMedicalProfile: false },
  { path: '/client/diets', allowedRoles: ['client'], requiresMedicalProfile: false },
  { path: '/client/progress', allowedRoles: ['client'], requiresMedicalProfile: false },
  { path: '/client/chat', allowedRoles: ['client'], requiresMedicalProfile: false },

  // Dashboard general (post-login)
  { path: '/dashboard', allowedRoles: ['admin', 'trainer', 'client'] },

  // Admin
  { path: '/admin', allowedRoles: ['admin'] },
];

export function checkRouteAccess(
  path: string,
  user: User | null,
): { allowed: boolean; redirectTo?: string } {
  const guard = routeGuards.find((g) => path.startsWith(g.path));

  if (!guard) {
    return { allowed: true }; // Ruta sin guardia definida
  }

  // Rutas públicas (sin autenticación requerida)
  if (guard.allowedRoles.length === 0) {
    return { allowed: true };
  }

  // No autenticado
  if (!user) {
    return { allowed: false, redirectTo: '/login' };
  }

  // Rol no permitido
  if (!guard.allowedRoles.includes(user.role)) {
    const redirectMap: Record<string, string> = {
      admin: '/dashboard',
      client: '/client/dashboard',
      trainer: '/dashboard',
    };
    return { allowed: false, redirectTo: redirectMap[user.role] ?? '/login' };
  }

  // Perfil médico requerido pero no completado
  if (guard.requiresMedicalProfile && !user.medicalProfile) {
    return { allowed: false, redirectTo: '/client/medical-profile' };
  }

  return { allowed: true };
}
