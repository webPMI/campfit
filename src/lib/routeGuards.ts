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

  // Cliente
  // 🔒 CRÍTICO: Los trainers también pueden acceder a /client/* porque un entrenador
  // puede tener su propio entrenador asignado (assignedTrainerId) y necesita ver
  // sus propias rutinas, dietas y evolución como cliente. NUNCA eliminar 'trainer' de estas rutas.
  { path: '/client/medical-profile', allowedRoles: ['client', 'trainer'] },
  { path: '/client/dashboard', allowedRoles: ['client', 'trainer'], requiresMedicalProfile: false },
  { path: '/client/workouts', allowedRoles: ['client', 'trainer'], requiresMedicalProfile: false },
  { path: '/client/diets', allowedRoles: ['client', 'trainer'], requiresMedicalProfile: false },
  { path: '/client/progress', allowedRoles: ['client', 'trainer'], requiresMedicalProfile: false },
  { path: '/client/chat', allowedRoles: ['client', 'trainer'], requiresMedicalProfile: false },
  { path: '/client/support', allowedRoles: ['client', 'trainer'], requiresMedicalProfile: false },
  { path: '/client/settings', allowedRoles: ['client', 'trainer'], requiresMedicalProfile: false },

  // Dashboard general (post-login)
  { path: '/dashboard', allowedRoles: ['admin', 'trainer', 'client'] },

  // Admin
  { path: '/admin', allowedRoles: ['admin'] },
  { path: '/admin/dashboard', allowedRoles: ['admin'] },
  { path: '/admin/users', allowedRoles: ['admin'] },
  { path: '/admin/trainers', allowedRoles: ['admin'] },
  { path: '/admin/clients', allowedRoles: ['admin'] },
  { path: '/admin/clinical', allowedRoles: ['admin'] },
  { path: '/admin/workouts', allowedRoles: ['admin'] },
  { path: '/admin/diets', allowedRoles: ['admin'] },
  { path: '/admin/progress', allowedRoles: ['admin'] },
  { path: '/admin/chat', allowedRoles: ['admin'] },
  { path: '/admin/foods', allowedRoles: ['admin'] },
  { path: '/admin/exercises', allowedRoles: ['admin'] },
  { path: '/admin/settings', allowedRoles: ['admin'] },

  // Trainer (también accesible por admin)
  { path: '/trainer/dashboard', allowedRoles: ['trainer', 'admin'] },
  { path: '/trainer/clients', allowedRoles: ['trainer', 'admin'] },
  { path: '/trainer/workouts', allowedRoles: ['trainer', 'admin'] },
  { path: '/trainer/diets', allowedRoles: ['trainer', 'admin'] },
  { path: '/trainer/clinical', allowedRoles: ['trainer', 'admin'] },
  { path: '/trainer/chat', allowedRoles: ['trainer', 'admin'] },
  { path: '/trainer/settings', allowedRoles: ['trainer', 'admin'] },

  // Raíz (público) - debe ir al final para no interceptar rutas más específicas
  { path: '/', allowedRoles: [] },
];

export function checkRouteAccess(
  path: string,
  user: User | null,
): { allowed: boolean; redirectTo?: string } {
  // Buscar el guard más específico (el que tenga el path más largo que coincida)
  const guard = routeGuards
    .filter((g) => path.startsWith(g.path))
    .sort((a, b) => b.path.length - a.path.length)[0];

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
