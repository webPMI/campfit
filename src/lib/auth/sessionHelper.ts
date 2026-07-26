/**
 * 🔐 Helper centralizado de sesión.
 * NO crea su propio listener de Firebase — usa `auth.currentUser` + cache.
 * El listener único está en `authGuard.ts` (requireAuth/requireAdmin).
 *
 * Uso:
 *   import { onSessionReady } from '@/lib/auth/sessionHelper';
 *   onSessionReady((ctx) => {
 *     if (ctx.user) { ... }
 *     else { ... }
 *   });
 */

import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

/** Contexto resuelto de sesión */
export interface SessionContext {
  user: FirebaseUser | null;
  role: string | null;
  dashboardPath: string;
  dashboardLabel: string;
  userName: string | null;
}

const ROLE_ROUTES: Record<string, string> = {
  admin: '/admin/dashboard',
  trainer: '/trainer/dashboard',
  client: '/client/dashboard',
};

const DASHBOARD_LABELS: Record<string, string> = {
  admin: 'Panel Admin',
  trainer: 'Panel Trainer',
  client: 'Mi Progreso',
};

let cachedSession: SessionContext | null = null;

/**
 * Resuelve la sesión actual usando auth.currentUser (síncrono) + Firestore.
 * NO crea listeners — solo consulta una vez.
 */
export async function resolveSessionNow(): Promise<SessionContext> {
  const user = auth.currentUser;
  if (!user) {
    return { user: null, role: null, dashboardPath: '/login', dashboardLabel: '', userName: null };
  }

  if (cachedSession && cachedSession.user?.uid === user.uid) {
    return cachedSession;
  }

  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    const role = snap.exists() ? (snap.data().role || 'client') : 'client';
    const name = snap.exists()
      ? (snap.data().name || user.displayName || user.email || 'Usuario')
      : (user.displayName || user.email || 'Usuario');
    cachedSession = {
      user,
      role,
      dashboardPath: ROLE_ROUTES[role] || '/client/dashboard',
      dashboardLabel: DASHBOARD_LABELS[role] || 'Mi Panel',
      userName: name,
    };
  } catch {
    cachedSession = {
      user,
      role: 'client',
      dashboardPath: '/client/dashboard',
      dashboardLabel: 'Mi Progreso',
      userName: user.displayName || user.email || 'Usuario',
    };
  }

  return cachedSession;
}

/**
 * Ejecuta un callback cuando la sesión esté lista.
 * NO crea listener — usa resolveSessionNow() inmediatamente.
 * Para cambios en tiempo real, usar requireAuth/requireAdmin de authGuard.ts.
 */
export function onSessionReady(callback: (ctx: SessionContext) => void): void {
  resolveSessionNow().then(callback);
}

/**
 * Redirige al dashboard según el rol.
 */
export function redirectToDashboard(role: string | null): void {
  window.location.href = ROLE_ROUTES[role || 'client'] || '/client/dashboard';
}