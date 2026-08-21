/**
 * Tests unitarios para settingsService.ts
 *
 * @module tests/unit/lib/shared/settingsService.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocks para dependencias externas
vi.mock('@/lib/shared/ui', () => ({
    showToast: vi.fn(),
    renderLoadingState: vi.fn((label?: string) => `<div id="loading">${label || 'Cargando...'}</div>`),
}));

vi.mock('@/lib/shared/profileService', () => ({
    loadProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    renderProfileView: vi.fn(() => '<div id="profile-view">Profile View</div>'),
    renderProfileLoadingState: vi.fn(() => '<div id="profile-loading">Loading...</div>'),
}));

import {
    initProfileSection,
    renderProfileEmptyState,
    setupProfileForm,
    setupPasswordForm,
    setupThemeToggle,
    setupLanguageSwitcher,
} from '@/lib/shared/settingsService';
import { loadProfile, updateProfile, changePassword } from '@/lib/shared/profileService';
import { showToast } from '@/lib/shared/ui';

describe('settingsService', () => {
    let mockContainer: HTMLElement;
    let mockNameInput: HTMLInputElement;
    let mockEmailInput: HTMLInputElement;
    let storageMock: Record<string, string>;

    const mockTr = (key: string) => key;

    beforeEach(() => {
        vi.clearAllMocks();
        storageMock = {};
        mockContainer = document.createElement('div');
        mockNameInput = document.createElement('input');
        mockEmailInput = document.createElement('input');

        vi.stubGlobal('localStorage', {
            getItem: (key: string) => storageMock[key] ?? null,
            setItem: (key: string, value: string) => { storageMock[key] = value; },
            removeItem: (key: string) => { delete storageMock[key]; },
            clear: () => { storageMock = {}; },
            length: 0,
            key: (_: number) => null,
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('initProfileSection', () => {
        it('debería renderizar la vista de perfil si el perfil existe', async () => {
            const mockProfile = {
                uid: 'user123',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'client' as const,
                createdAt: null,
                updatedAt: null,
            };

            vi.mocked(loadProfile).mockResolvedValue(mockProfile);

            await initProfileSection(mockContainer, 'user123', mockNameInput, mockEmailInput, mockTr);

            expect(loadProfile).toHaveBeenCalledWith('user123');
            expect(mockNameInput.value).toBe('John Doe');
            expect(mockEmailInput.value).toBe('john@example.com');
            expect(mockContainer.innerHTML).toContain('Profile View');
        });

        it('debería renderizar el estado vacío si el perfil no existe', async () => {
            vi.mocked(loadProfile).mockResolvedValue(null);

            await initProfileSection(mockContainer, 'user123', mockNameInput, mockEmailInput, mockTr);

            expect(loadProfile).toHaveBeenCalledWith('user123');
            expect(mockContainer.innerHTML).toContain('btn-retry-profile');
        });
    });

    describe('renderProfileEmptyState', () => {
        it('debería renderizar el contenedor de error y botón de reintento', () => {
            renderProfileEmptyState(mockContainer, 'user123', mockNameInput, mockEmailInput, mockTr);
            expect(mockContainer.innerHTML).toContain('btn-retry-profile');
            expect(mockContainer.innerHTML).toContain('admin.settings.profile.error');
        });
    });

    describe('setupProfileForm', () => {
        it('debería enviar el formulario de perfil correctamente', async () => {
            document.body.innerHTML = `
        <form id="profile-form">
          <button id="save-profile-btn">Guardar</button>
        </form>
        <div id="profile-section"></div>
      `;

            mockNameInput.value = 'New Name';
            mockEmailInput.value = 'new@example.com';

            vi.mocked(updateProfile).mockResolvedValue({
                success: true,
                message: 'Perfil actualizado',
            });
            vi.mocked(loadProfile).mockResolvedValue({
                uid: 'u1',
                name: 'New Name',
                email: 'new@example.com',
                role: 'client' as const,
                createdAt: null,
                updatedAt: null,
            });

            setupProfileForm('u1', mockNameInput, mockEmailInput, mockTr);

            const form = document.getElementById('profile-form') as HTMLFormElement;
            form.dispatchEvent(new Event('submit', { cancelable: true }));

            await new Promise((r) => setTimeout(r, 10));

            expect(updateProfile).toHaveBeenCalledWith('u1', {
                name: 'New Name',
                email: 'new@example.com',
            });
            expect(showToast).toHaveBeenCalledWith({
                message: 'Perfil actualizado',
                type: 'success',
            });
        });

        it('debería mostrar error si el nombre está vacío', async () => {
            document.body.innerHTML = `
        <form id="profile-form">
          <button id="save-profile-btn">Guardar</button>
        </form>
      `;

            mockNameInput.value = '   ';
            mockEmailInput.value = 'test@example.com';

            setupProfileForm('u1', mockNameInput, mockEmailInput, mockTr);

            const form = document.getElementById('profile-form') as HTMLFormElement;
            form.dispatchEvent(new Event('submit', { cancelable: true }));

            expect(showToast).toHaveBeenCalledWith({
                message: 'admin.settings.profile.name.required',
                type: 'error',
            });
            expect(updateProfile).not.toHaveBeenCalled();
        });
    });

    describe('setupPasswordForm', () => {
        it('debería cambiar la contraseña correctamente', async () => {
            document.body.innerHTML = `
        <form id="password-form">
          <input id="new-password" value="12345678" />
          <input id="confirm-password" value="12345678" />
          <button id="save-password-btn">Cambiar</button>
        </form>
      `;

            vi.mocked(changePassword).mockResolvedValue({
                success: true,
                message: 'Contraseña cambiada',
            });

            setupPasswordForm({ uid: 'u1' } as any, mockTr);

            const form = document.getElementById('password-form') as HTMLFormElement;
            form.dispatchEvent(new Event('submit', { cancelable: true }));

            await new Promise((r) => setTimeout(r, 10));

            expect(changePassword).toHaveBeenCalled();
            expect(showToast).toHaveBeenCalledWith({
                message: 'Contraseña cambiada',
                type: 'success',
            });
        });

        it('debería mostrar error si las contraseñas no coinciden', async () => {
            document.body.innerHTML = `
        <form id="password-form">
          <input id="new-password" value="12345678" />
          <input id="confirm-password" value="87654321" />
          <button id="save-password-btn">Cambiar</button>
        </form>
      `;

            setupPasswordForm({ uid: 'u1' } as any, mockTr);

            const form = document.getElementById('password-form') as HTMLFormElement;
            form.dispatchEvent(new Event('submit', { cancelable: true }));

            expect(showToast).toHaveBeenCalledWith({
                message: 'admin.settings.password.mismatch',
                type: 'error',
            });
            expect(changePassword).not.toHaveBeenCalled();
        });
    });

    describe('setupThemeToggle', () => {
        it('debería alternar el tema al hacer clic', () => {
            const btn = document.createElement('button');
            btn.id = 'btn-toggle-theme';
            document.body.appendChild(btn);

            storageMock['campfit_theme'] = 'dark';

            setupThemeToggle(mockTr);

            btn.click();

            expect(storageMock['campfit_theme']).toBe('light');
            expect(showToast).toHaveBeenCalled();
        });
    });

    describe('setupLanguageSwitcher', () => {
        it('debería configurar el listener del selector de idioma', () => {
            const btn = document.createElement('button');
            btn.id = 'btn-switch-language';
            document.body.appendChild(btn);

            storageMock['campfit_lang'] = 'es';

            setupLanguageSwitcher(mockTr);

            expect(btn.textContent).toContain('English');
        });
    });
});
