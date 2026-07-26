/**
 * Tests unitarios para initPage (src/lib/shared/initPage.ts).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { capturedCallback, mockGetDoc } = vi.hoisted(() => {
    let _cb: ((user: any) => void) | null = null;
    return {
        capturedCallback: {
            set: (cb: (user: any) => void) => { _cb = cb; },
            get: () => _cb,
            clear: () => { _cb = null; },
        },
        mockGetDoc: vi.fn(),
    };
});

vi.mock('@/services/authService', () => ({
    authService: {
        onAuthChange: vi.fn((cb: (user: any) => void) => { capturedCallback.set(cb); return vi.fn(); }),
    },
}));
vi.mock('@/lib/firebase', () => ({ db: {}, auth: {} }));
vi.mock('firebase/firestore', () => ({ doc: vi.fn(), getDoc: (...a: any[]) => mockGetDoc(...a) }));
vi.mock('@/stores/authStore', () => ({ setUser: vi.fn(), $user: { set: vi.fn() } }));
vi.mock('@/lib/shared/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

describe('initPage', () => {
    beforeEach(() => { capturedCallback.clear(); vi.clearAllMocks(); document.body.innerHTML = '<div id="loadingScreen">Cargando</div><div id="adminContent" class="hidden">Admin</div>'; });

    it('debe funcionar con admin', async () => {
        mockGetDoc.mockResolvedValue({ data: () => ({ name: 'Admin', role: 'admin' }), exists: () => true });
        const { initPage } = await import('@/lib/shared/initPage');
        initPage({ onReady: vi.fn(), allowedRoles: ['admin'] });
        const cb = capturedCallback.get();
        await cb!({ uid: 'a1', email: 'a@a.com' });
        expect(document.getElementById('loadingScreen')?.classList.contains('hidden')).toBe(true);
    });

    it('debe redirigir si rol no está en allowedRoles', async () => {
        mockGetDoc.mockResolvedValue({ data: () => ({ role: 'client' }), exists: () => true });
        const orig = window.location.href;
        delete (window as any).location;
        window.location = { href: '' } as any;
        const { initPage } = await import('@/lib/shared/initPage');
        initPage({ onReady: vi.fn(), allowedRoles: ['admin'] });
        const cb = capturedCallback.get();
        await cb!({ uid: 'c1', email: 'c@c.com' });
        expect(window.location.href).toBe('/client/dashboard');
        window.location.href = orig;
    });
});