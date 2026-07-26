/**
 * Módulo de inicialización compartido para páginas de cliente.
 * Centraliza la autenticación, verificación de rol y control de loading.
 *
 * Uso:
 *   import { initClientPage } from '@/lib/client/clientInit';
 *
 *   initClientPage({
 *     onReady: async (user, userData) => {
 *       // Código específico de la página
 *     },
 *     onError: (error) => {
 *       // Manejo de error opcional
 *     }
 *   });
 */

import { authService } from '@/services/authService';
import { setUser } from '@/stores/authStore';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';

export interface InitClientOptions {
    /** Callback cuando la inicialización es exitosa */
    onReady: (firebaseUser: any, userData: any) => Promise<void> | void;
    /** Callback cuando hay un error */
    onError?: (error: Error) => void;
    /** Timeout en ms para la carga inicial (default: 15000 = 15s) */
    timeoutMs?: number;
}

/** Estado compartido para prevenir múltiples inicializaciones */
let isInitializing = false;
let currentUnsubscribe: (() => void) | null = null;

/**
 * Inicializa una página de cliente con autenticación y verificación de rol.
 * Reemplaza el patrón duplicado de onAuthStateChanged + getDoc + role check.
 *
 * @param options - Opciones de inicialización
 * @returns Función de limpieza
 */
export function initClientPage(options: InitClientOptions): () => void {
    const { onReady, onError, timeoutMs = 15000 } = options;

    // Prevenir inicialización duplicada
    if (isInitializing) {
        logger.warn('ClientInit', 'Ya hay una inicialización en curso, saltando...');
        return () => { };
    }
    isInitializing = true;

    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
        if (isInitializing) {
            logger.error('ClientInit', 'Timeout de inicialización alcanzado');
            const loadingScreens = document.querySelectorAll('#loadingScreen');
            loadingScreens.forEach((screen) => {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-sm';
                errorMsg.innerHTML = `
          <div class="flex items-center gap-2 mb-1">
            <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span class="font-semibold">Error de conexión</span>
          </div>
          <p>No se pudo cargar la página. Verifica tu conexión a internet e intenta de nuevo.</p>
          <button onclick="window.location.reload()" class="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-500/30 transition-colors">
            Reintentar
          </button>
        `;
                screen.appendChild(errorMsg);
            });
            isInitializing = false;
            if (onError) onError(new Error('Timeout de inicialización'));
        }
    }, timeoutMs);

    // Limpiar listener anterior si existe
    if (currentUnsubscribe) {
        currentUnsubscribe();
    }

    currentUnsubscribe = authService.onAuthChange(async (firebaseUser) => {
        clearTimeout(timeoutId);

        if (!firebaseUser) {
            isInitializing = false;
            window.location.href = '/login';
            return;
        }

        try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            const userData = userDoc.data();
            const userEmail = (firebaseUser.email || '').toLowerCase();
            const isBootstrapAdmin =
                userEmail === 'servicioweb.pmi@gmail.com' || userEmail === 'sevicioweb.pmi@gmail.com';

            // Verificar permisos (clientes, trainers y admins pueden ver la vista cliente)
            if (userData && userData.role !== 'client' && userData.role !== 'admin' && userData.role !== 'trainer' && !isBootstrapAdmin) {
                isInitializing = false;
                window.location.href = '/dashboard';
                return;
            }

            // Actualizar authStore
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: userData?.name || firebaseUser.displayName || 'Usuario',
                role: userData?.role || 'client',
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
            logger.error('ClientInit', 'Error en inicialización:', error);

            // Mostrar error visual
            const loadingScreens = document.querySelectorAll('#loadingScreen');
            loadingScreens.forEach((screen) => {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-sm max-w-md mx-auto';
                errorMsg.innerHTML = `
          <div class="flex items-center gap-2 mb-1">
            <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span class="font-semibold">Error al cargar</span>
          </div>
          <p>Ocurrió un error al cargar la página. Intenta recargar.</p>
          <button onclick="window.location.reload()" class="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-500/30 transition-colors">
            Reintentar
          </button>
        `;
                screen.appendChild(errorMsg);
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
    };
}

/**
 * Helper para crear un contenedor de error reutilizable
 */
export function createErrorElement(
    title: string,
    message: string,
    retryFn?: () => void
): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-sm';
    div.innerHTML = `
    <div class="flex items-center gap-2 mb-1">
      <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
      <span class="font-semibold">${title}</span>
    </div>
    <p>${message}</p>
    ${retryFn ? `<button class="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-500/30 transition-colors">Reintentar</button>` : ''}
  `;
    const btn = div.querySelector('button');
    if (btn && retryFn) {
        btn.addEventListener('click', retryFn);
    }
    return div;
}