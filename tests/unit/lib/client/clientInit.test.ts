/**
 * Tests unitarios para initClientPage (src/lib/client/clientInit.ts).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { capturedCallback, mockGetDoc } = vi.hoisted(() => {
    let _capturedCallback: ((user: any) => void) | null = null;

    return {
        capturedCallback: {
            set: (cb: (user: any) => void) => { _capturedCallback = cb; },
            get: () => _capturedCallback,
            clear: () => { _capturedCallback = null; },
        },
        mockGetDoc: vi.fn(),
    };
});

vi.mock('@/services/authService', () => ({
    authService: {
        onAuthChange: vi.fn((callback: (user: any) => void) => {
            capturedCallback.set(callback);
            return vi.fn();
        }),
    },
}));

vi.mock('@/lib/firebase', () => ({
    db: { id: 'mock-db' },
    auth: { id: 'mock-auth' },
}));

vi.mock('firebase/firestore', () => ({
    doc: vi.fn(() => ({ id: 'mock-doc' })),
    getDoc: (...args: any[]) => mockGetDoc(...args),
}));

vi.mock('@/stores/authStore', () => ({
    setUser: vi.fn(),
    $user: { set: vi.fn() },
}));

vi.mock('@/lib/shared/logger', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe('initClientPage', () => {
    beforeEach(() => {
        capturedCallback.clear();
        vi.clearAllMocks();
        document.body.innerHTML = `
      <div id="loadingScreen">
        <p id="loadingText">Cargando...</p>
      </div>
      <div id="dashboardContent" class="hidden">Dashboard</div>
    `;
    });

    it('debe ocultar loading y mostrar contenido en éxito', async () => {
        mockGetDoc.mockResolvedValue({
            data: () => ({
                name: 'Test User',
                role: 'client',
                hasActiveAlert: false,
            }),
            exists: () => true,
        });

        const { initClientPage } = await import('@/lib/client/clientInit');
        const cleanup = initClientPage({ onReady: vi.fn() });
        const callback = capturedCallback.get();
        expect(callback).not.toBeNull();

        await callback!({ uid: 'test-uid', email: 'test@test.com' });

        const loadingScreen = document.getElementById('loadingScreen');
        const dashboardContent = document.getElementById('dashboardContent');
        expect(loadingScreen?.classList.contains('hidden')).toBe(true);
        expect(dashboardContent?.classList.contains('hidden')).toBe(false);
        cleanup();
    });

    it('debe redirigir a /login si no hay usuario', async () => {
        const originalLocation = window.location.href;
        delete (window as any).location;
        window.location = { href: '' } as any;

        const { initClientPage } = await import('@/lib/client/clientInit');
        initClientPage({ onReady: vi.fn() });
        const callback = capturedCallback.get();
        await callback!(null);

        expect(window.location.href).toBe('/login');
        window.location.href = originalLocation;
    });

    it('debe redirigir a /dashboard si el rol no es permitido', async () => {
        mockGetDoc.mockResolvedValue({
            data: () => ({ role: 'unknown', hasActiveAlert: false }),
            exists: () => true,
        });

        const originalLocation = window.location.href;
        delete (window as any).location;
        window.location = { href: '' } as any;

        const { initClientPage } = await import('@/lib/client/clientInit');
        initClientPage({ onReady: vi.fn() });
        const callback = capturedCallback.get();
        await callback!({ uid: 'admin-uid', email: 'admin@test.com' });

        expect(window.location.href).toBe('/dashboard');
        window.location.href = originalLocation;
    });

    it('debe mostrar error visual en caso de excepción en getDoc', async () => {
        mockGetDoc.mockRejectedValue(new Error('Firestore error'));

        const { initClientPage } = await import('@/lib/client/clientInit');
        initClientPage({ onReady: vi.fn(), onError: vi.fn() });
        const callback = capturedCallback.get();
        await callback!({ uid: 'test-uid', email: 'test@test.com' });

        const loadingScreen = document.getElementById('loadingScreen');
        expect(loadingScreen?.querySelector('.text-red-400')).not.toBeNull();
    });
});