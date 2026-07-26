/**
 * Módulo de inicialización genérico para páginas de cualquier rol.
 * Versión generalizada de `initClientPage()` que funciona para
 * admin, trainer y client.
 *
 * Uso:
 *   import { initPage } from '@/lib/shared/initPage';
 *
 *   initPage({
 *     onReady: async (user, userData) => {
 *       // Código específico de la página
 *     },
 *     allowedRoles: ['admin', 'trainer'],
 *   });
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
    /** Roles permitidos para acceder a la página (default: ['admin', 'trainer', 'client']) */
    allowedRoles?: string[];
}

/** Estado compartido para prevenir múltiples inicializaciones */
let isInitializing = false;
let currentUnsubscribe: (() => void) | null = null;

// ─── Cache de userData por sesión ───────────────────────────────────────────
// Evita múltiples lecturas de Firestore al navegar entre páginas
const USER_CACHE_KEY = 'campfit_user_cache';

function getCachedUserData(uid: string): any | null {
    try {
        const raw = sessionStorage.getItem(USER_CACHE_KEY);
        if (!raw) return null;
        const cached = JSON.parse(raw);
        // El cache es válido si corresponde al mismo uid y tiene menos de 5 min
        if (cached.uid === uid && Date.now() - cached.ts < 5 * 60 * 1000) {
            return cached.data;
        }
    } catch { /* ignore */ }
    return null;
}

function setCachedUserData(uid: string, data: any): void {
    try {
        sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify({ uid, data, ts: Date.now() }));
    } catch { /* ignore */ }
}

export function clearUserCache(): void {
    try { sessionStorage.removeItem(USER_CACHE_KEY); } catch { /* ignore */ }
}

/**
 * Crea un elemento de error visual con createElement (sin innerHTML inseguro).
 */
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
 * Versión genérica que reemplaza requireAdmin/requireAuth y proporciona
 * timeout de seguridad, manejo de errores visual, y cleanup automático.
 * Usa cache de sessionStorage para evitar lecturas repetidas de Firestore.
 *
 * @param options - Opciones de inicialización
 * @returns Función de limpieza para usar en astro:before-swap
 */
export function initPage(options: InitPageOptions): () => void {
    const { onReady, onError, timeoutMs = 15000, allowedRoles } = options;

    // Prevenir inicialización duplicada
    if (isInitializing) {
        logger.warn('InitPage', 'Ya hay una inicialización en curso, saltando...');
        return () => { };
    }
    isInitializing = true;

    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
        if (isInitializing) {
            logger.error('InitPage', 'Timeout de inicialización alcanzado');
            const loadingScreens = document.querySelectorAll('#loadingScreen');
            loadingScreens.forEach((screen) => {
                screen.appendChild(
                    createErrorElement(
                        'Error de conexión',
                        'No se pudo cargar la página. Verifica tu conexión a internet e intenta de nuevo.',
                    ),
                );
            });
            isInitializing = false;
            if (onError) onError(new Error('Timeout de inicialización'));
        }
    }, timeoutMs);

    // Limpiar listener anterior si existe
    if (currentUnsubscribe) {
        currentUnsubscribe();
    }

    // Guard: sólo ejecutamos el callback una vez por montaje
    let hasRun = false;

    currentUnsubscribe = authService.onAuthChange(async (firebaseUser) => {
        clearTimeout(timeoutId);

        if (!firebaseUser) {
            isInitializing = false;
            if (!window.location.pathname.startsWith('/login') &&
                !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
            }
            return;
        }

        // Evitar re-ejecución si ya corrimos el callback
        if (hasRun) return;
        hasRun = true;

        try {
            // Intentar usar cache antes de leer Firestore
            let userData = getCachedUserData(firebaseUser.uid);
            if (!userData) {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                userData = userDoc.data() || {};
                setCachedUserData(firebaseUser.uid, userData);
            }

            // Resolver rol (con fallback para bootstrap admins)
            const userEmail = (firebaseUser.email || '').toLowerCase();
            const isBootstrapAdmin =
                userEmail === 'servicioweb.pmi@gmail.com' ||
                userEmail === 'sevicioweb.pmi@gmail.com';
            const userRole = userData.role || (isBootstrapAdmin ? 'admin' : 'client');

            // Verificar rol si se especificaron roles permitidos
            if (allowedRoles && !allowedRoles.includes(userRole)) {
                isInitializing = false;
                // Redirigir al dashboard correcto según el rol, no a /dashboard (genera bucle)
                const roleMap: Record<string, string> = {
                    admin: '/admin/dashboard',
                    trainer: '/trainer/dashboard',
                    client: '/client/dashboard',
                };
                const target = roleMap[userRole] || '/login';
                if (window.location.pathname !== target) {
                    window.location.href = target;
                }
                return;
            }

            // Actualizar authStore
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: userData?.name || firebaseUser.displayName || 'Usuario',
                role: userRole,
                hasActiveAlert: userData?.hasActiveAlert ?? false,
                assignedTrainerId: userData?.assignedTrainerId,
                medicalProfile: userData?.medicalProfile,
            });

            // Ocultar loading screen y mostrar contenido
            const loadingScreens = document.querySelectorAll('#loadingScreen');
            loadingScreens.forEach((screen) => screen.classList.add('hidden'));

            const contentSections = document.querySelectorAll('[id$="Content"]');
            contentSections.forEach((section) => section.classList.remove('hidden'));

            isInitializing = false;

            // Ejecutar callback específico de la página
            await onReady(firebaseUser, userData);
        } catch (error) {
            isInitializing = false;
            logger.error('InitPage', 'Error en inicialización:', error);

            // Mostrar error visual
            const loadingScreens = document.querySelectorAll('#loadingScreen');
            loadingScreens.forEach((screen) => {
                screen.appendChild(
                    createErrorElement(
                        'Error al cargar',
                        'Ocurrió un error al cargar la página. Intenta recargar.',
                    ),
                );
            });

            if (onError) onError(error instanceof Error ? error : new Error(String(error)));
        }
    });

    // Devolver función de limpieza
    return () => {
        clearTimeout(timeoutId);
        if (currentUnsubscribe) {
            currentUnsubscribe();
            currentUnsubscribe = null;
        }
        isInitializing = false;
        hasRun = false;
    };
}