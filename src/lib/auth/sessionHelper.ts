/**
 * 🔐 Helper centralizado de sesión.
 * Un ÚNICO listener de Firebase Auth que resuelve el rol del usuario.
 * Evita duplicar onAuthStateChanged + getDoc en múltiples componentes.
 *
 * Uso:
 *   import { onSessionReady } from '@/lib/auth/sessionHelper';
 *   onSessionReady((ctx) => {
 *     if (ctx.user) { ... }  // usuario autenticado
 *     else { ... }           // no autenticado
 *   });
 */

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

/** Contexto resuelto de sesión */
export interface SessionContext {
  /** null = no autenticado */
  user: FirebaseUser | null;
  /** 'admin' | 'trainer' | 'client' | null */
  role: string | null;
  /** Ruta del dashboard según el rol */
  dashboardPath: string;
  /** Texto amigable para el botón de dashboard según el rol */
  dashboardLabel: string;
  /** Nombre del usuario (display name o email) */
  userName: string | null;
}

// 🗺️ Mapa de roles → rutas
const ROLE_ROUTES: Record<string, string> = {
  admin: '/admin/dashboard',
  trainer: '/trainer/dashboard',
  client: '/client/dashboard',
};

// 🏷️ Etiquetas amigables para el botón de dashboard según el rol
const DASHBOARD_LABELS: Record<string, string> = {
  admin: 'Panel Admin',
  trainer: 'Panel Trainer',
  client: 'Mi Progreso',
};

// 🧠 Cache interno: solo se resuelve una vez
let cachedSession: SessionContext | null = null;
let listeners: Array<(ctx: SessionContext) => void> = [];

/**
 * Resuelve el rol del usuario desde Firestore (o cache).
 * @param user - Usuario Firebase autenticado
 * @returns Contexto de sesión resuelto
 */
async function resolveSession(user: FirebaseUser | null): Promise<SessionContext> {
  if (!user) {
    return { user: null, role: null, dashboardPath: '/login', dashboardLabel: '', userName: null };
  }

  // Si ya tenemos cache y el mismo uid, devolver cache
  if (cachedSession && cachedSession.user?.uid === user.uid) {
    return cachedSession;
  }

  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    const role = snap.exists() ? (snap.data().role || 'client') : 'client';
    const name = snap.exists() ? (snap.data().name || user.displayName || user.email || 'Usuario') : (user.displayName || user.email || 'Usuario');
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

// 🔥 Listener único (singleton): se suscribe una sola vez
let initialized = false;

function initSessionListener(): void {
  if (initialized) return;
  initialized = true;

  onAuthStateChanged(auth, async (user) => {
    const ctx = await resolveSession(user);
    // Notificar a todos los suscriptores
    listeners.forEach(fn => fn(ctx));
  });
}

/**
 * Registra un callback que se ejecuta cada vez que cambia la sesión.
 * Usa un listener único de Firebase (singleton pattern).
 *
 * @param callback - Función que recibe el contexto de sesión resuelto
 * @returns Función para cancelar la suscripción
 */
export function onSessionReady(callback: (ctx: SessionContext) => void): () => void {
  initSessionListener();
  listeners.push(callback);

  // Si ya hay sesión cacheada, notificar inmediatamente
  if (cachedSession) {
    callback(cachedSession);
  }

  return () => {
    listeners = listeners.filter(fn => fn !== callback);
  };
}

/**
 * Redirige al dashboard según el rol del usuario.
 * Útil en páginas públicas (login, register, recover) cuando ya hay sesión.
 *
 * @param role - Rol del usuario
 */
export function redirectToDashboard(role: string | null): void {
  window.location.href = ROLE_ROUTES[role || 'client'] || '/client/dashboard';
}