/**
 * Módulo de inicialización genérico para páginas de cualquier rol.
 * Una sola lectura de Firestore por sesión (cache en sessionStorage).
 * Sin estado de módulo compartido — cada llamada a initPage() es independiente.
 *
 * Uso:
 *   import { initPage } from '@/lib/shared/initPage';
 *
 *   const cleanup = initPage({
 *     allowedRoles: ['admin', 'trainer', 'client'],
 *     onReady: async (user, userData) => { ... },
 *   });
 *   document.addEventListener('astro:before-swap', cleanup);
 */

import { authService } from '@/services/authService';
import { setUser } from '@/stores/authStore';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';

export interface InitPageOptions {
    /** Callback cuando la inicialización es exitosa */
    onReady: (firebaseUser: any, userData: any) => Promise<void> | void;
    /** Callback opcional cuando hay un error */
    onError?: (error: Error) => void;
    /** Timeout en ms para la carga inicial (default: 15000 = 15s) */
    timeoutMs?: number;
    /** Roles permitidos para acceder a la página */
    allowedRoles?: string[];
}

// ─── Cache de userData en sessionStorage ─────────────────────────────────────
const USER_CACHE_KEY = 'cf_user_v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

export function getCachedUserData(uid: string): any | null {
    try {
        const raw = sessionStorage.getItem(USER_CACHE_KEY);
        if (!raw) return null;
        const cached = JSON.parse(raw);
        if (cached.uid === uid && Date.now() - cached.ts < CACHE_TTL_MS) {
            return cached.data;
        }
    } catch { /* ignore */ }
    return null;
}

export function setCachedUserData(uid: string, data: any): void {
    try {
        sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify({ uid, data, ts: Date.now() }));
    } catch { /* ignore */ }
}

export function clearUserCache(): void {
    try { sessionStorage.removeItem(USER_CACHE_KEY); } catch { /* ignore */ }
}

// ─── Destinos de redirección por rol ─────────────────────────────────────────
const ROLE_DASHBOARDS: Record<string, string> = {
    admin: '/admin/dashboard',
    trainer: '/trainer/dashboard',
    client: '/client/dashboard',
};

function createErrorElement(title: string, message: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-sm max-w-md mx-auto';

    const flexDiv = document.createElement('div');
    flexDiv.className = 'flex items-center gap-2 mb-1';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'h-5 w-5 shrink-0');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('d', 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z');
    svg.appendChild(path);

    const titleSpan = document.createElement('span');
    titleSpan.className = 'font-semibold';
    titleSpan.textContent = title;

    flexDiv.appendChild(svg);
    flexDiv.appendChild(titleSpan);
    container.appendChild(flexDiv);

    const msgP = document.createElement('p');
    msgP.textContent = message;
    container.appendChild(msgP);

    const retryBtn = document.createElement('button');
    retryBtn.className = 'mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-500/30 transition-colors';
    retryBtn.textContent = 'Reintentar';
    retryBtn.addEventListener('click', () => window.location.reload());
    container.appendChild(retryBtn);

    return container;
}

/**
 * Inicializa una página con autenticación y verificación de rol.
 * - Una sola lectura de Firestore por sesión (cache 5 min)
 * - Sin estado de módulo — cada llamada es independiente
 * - Redirige directamente al dashboard del rol (sin pasar por /dashboard)
 *
 * @param options - Opciones de inicialización
 * @returns Función de limpieza para usar en `astro:before-swap`
 */
export function initPage(options: InitPageOptions): () => void {
    const { onReady, onError, timeoutMs = 15000, allowedRoles } = options;

    // Estado LOCAL a esta invocación — sin compartir entre páginas
    let unsubscribe: (() => void) | null = null;
    let done = false;
    let redirecting = false;

    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
        if (!done) {
            logger.error('InitPage', 'Timeout de inicialización alcanzado');
            const screens = document.querySelectorAll('#loadingScreen');
            screens.forEach((s) =>
                s.appendChild(
                    createErrorElement(
                        'Error de conexión',
                        'No se pudo cargar la página. Verifica tu conexión e intenta de nuevo.',
                    ),
                ),
            );
            if (onError) onError(new Error('Timeout'));
        }
    }, timeoutMs);

    unsubscribe = authService.onAuthChange(async (firebaseUser) => {
        // Ignorar re-fires después de que ya procesamos o estamos redirigiendo
        if (done || redirecting) return;
        clearTimeout(timeoutId);

        if (!firebaseUser) {
            redirecting = true;
            const path = window.location.pathname;
            logger.info('InitPage', `No autenticado en ${path}, redirigiendo a login`);
            if (!path.startsWith('/login') && !path.startsWith('/register')) {
                window.location.href = '/login';
            }
            return;
        }
        logger.info('InitPage', `Usuario autenticado UID:${firebaseUser.uid.slice(0, 8)}... en ${window.location.pathname}`);

        try {
            // Leer de cache o Firestore (una sola vez por sesión)
            let userData = getCachedUserData(firebaseUser.uid);
            if (userData) {
                // Ocultar pantalla de carga inmediatamente para evitar parpadeos visuales
                document.querySelectorAll('#loadingScreen').forEach((el) => el.classList.add('hidden'));
                document.querySelectorAll('[id$="Content"]').forEach((el) => el.classList.remove('hidden'));
            } else {
                const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
                userData = snap.data() || {};
                setCachedUserData(firebaseUser.uid, userData);
            }

            // Resolver rol con fallback para bootstrap admins
            const email = (firebaseUser.email || '').toLowerCase();
            const isBootstrap =
                email === 'servicioweb.pmi@gmail.com' ||
                email === 'sevicioweb.pmi@gmail.com';
            const userRole = ((userData.role as string) || (isBootstrap ? 'admin' : 'client')) as 'admin' | 'trainer' | 'client';

            // Comprobar si el cliente necesita realizar el onboarding antes de acceder a /client/*
            const isClientPath = window.location.pathname.startsWith('/client');
            const isOnboardingPath = window.location.pathname.startsWith('/onboarding');
            if (userRole === 'client' && userData.onboardingCompleted !== true && isClientPath && !isOnboardingPath) {
                redirecting = true;
                logger.warn('InitPage', `Cliente UID: ${firebaseUser.uid} sin onboarding completado. Redirigiendo a /onboarding`);
                window.location.href = '/onboarding';
                return;
            }

            // Verificar acceso — redirigir al dashboard propio, no a /dashboard genérico
            if (allowedRoles && !allowedRoles.includes(userRole)) {
                redirecting = true;
                const target = ROLE_DASHBOARDS[userRole] || '/login';
                logger.warn('InitPage', `Rol "${userRole}" no permitido en esta página, redirigiendo a ${target}`);
                if (window.location.pathname !== target) {
                    window.location.href = target;
                }
                return;
            }

            // Actualizar authStore
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: userData.name || firebaseUser.displayName || 'Usuario',
                role: userRole,
                hasActiveAlert: userData.hasActiveAlert ?? false,
                assignedTrainerId: userData.assignedTrainerId,
                medicalProfile: userData.medicalProfile,
            });

            // Mostrar contenido
            document.querySelectorAll('#loadingScreen').forEach((el) => el.classList.add('hidden'));
            document.querySelectorAll('[id$="Content"]').forEach((el) => el.classList.remove('hidden'));

            done = true;
            await onReady(firebaseUser, userData);
        } catch (error) {
            done = true;
            logger.error('InitPage', 'Error en inicialización:', error);
            document.querySelectorAll('#loadingScreen').forEach((s) =>
                s.appendChild(
                    createErrorElement('Error al cargar', 'Ocurrió un error al cargar la página. Intenta recargar.'),
                ),
            );
            if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        }
    });

    // Función de limpieza — llamar en astro:before-swap
    return () => {
        clearTimeout(timeoutId);
        done = true;
        redirecting = false;
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
    };
}