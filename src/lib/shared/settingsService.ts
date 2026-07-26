/**
 * Settings Service - Shared logic for all settings pages (admin, trainer, client).
 * Centralizes profile editing, password change, and theme/language preferences.
 *
 * @module shared/settingsService
 */
import { showToast } from '@/lib/shared/ui';
import { loadProfile, updateProfile, changePassword, renderProfileView, renderProfileLoadingState } from '@/lib/shared/profileService';

/**
 * Initializes the profile section with loading state, then loads and renders the profile.
 * Falls back to empty state if profile not found.
 */
export async function initProfileSection(
    profileSection: HTMLElement,
    userId: string,
    nameInput: HTMLInputElement,
    emailInput: HTMLInputElement,
    tr: (key: string) => string
): Promise<void> {
    profileSection.innerHTML = renderProfileLoadingState();
    const profile = await loadProfile(userId);

    if (profile) {
        profileSection.innerHTML = `
      <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">${tr('admin.settings.profile')}</h2>
      ${renderProfileView(profile)}
    `;
        nameInput.value = profile.name;
        emailInput.value = profile.email;
    } else {
        renderProfileEmptyState(profileSection, userId, nameInput, emailInput, tr);
    }
}

/**
 * Renders empty state with retry button for profile section.
 */
export function renderProfileEmptyState(
    container: HTMLElement,
    userId: string,
    nameInput: HTMLInputElement,
    emailInput: HTMLInputElement,
    tr: (key: string) => string
): void {
    container.innerHTML = `
    <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">${tr('admin.settings.profile')}</h2>
    <div class="flex flex-col items-center justify-center py-8 text-center">
      <svg class="h-12 w-12 text-[var(--text-disabled)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
      <p class="text-sm text-[var(--text-tertiary)]">${tr('admin.settings.profile.error')}</p>
      <button id="btn-retry-profile" class="mt-3 rounded-xl bg-[var(--surface-3)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-4)] active:scale-[0.98]">
        Reintentar
      </button>
    </div>
  `;
    document.getElementById('btn-retry-profile')?.addEventListener('click', async () => {
        container.innerHTML = renderProfileLoadingState();
        const retryProfile = await loadProfile(userId);
        if (retryProfile) {
            container.innerHTML = `
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">${tr('admin.settings.profile')}</h2>
        ${renderProfileView(retryProfile)}
      `;
            nameInput.value = retryProfile.name;
            emailInput.value = retryProfile.email;
        } else {
            renderProfileEmptyState(container, userId, nameInput, emailInput, tr);
        }
    });
}

/**
 * Sets up the profile edit form submission handler.
 */
export function setupProfileForm(
    userId: string,
    nameInput: HTMLInputElement,
    emailInput: HTMLInputElement,
    tr: (key: string) => string
): void {
    document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name) {
            showToast({ message: tr('admin.settings.profile.name.required'), type: 'error' });
            return;
        }

        const btn = document.getElementById('save-profile-btn');
        if (btn) {
            btn.textContent = tr('admin.settings.profile.saving');
            (btn as HTMLButtonElement).disabled = true;
        }

        const result = await updateProfile(userId, { name, email });
        showToast({ message: result.message, type: result.success ? 'success' : 'error' });

        if (result.success) {
            const refreshed = await loadProfile(userId);
            if (refreshed) {
                const profileSection = document.getElementById('profile-section');
                if (profileSection) {
                    profileSection.innerHTML = `
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">${tr('admin.settings.profile')}</h2>
            ${renderProfileView(refreshed)}
          `;
                }
            }
        }

        if (btn) {
            btn.textContent = tr('admin.settings.profile.save');
            (btn as HTMLButtonElement).disabled = false;
        }
    });
}

/**
 * Sets up the password change form submission handler.
 */
export function setupPasswordForm(
    user: Parameters<typeof changePassword>[0],
    tr: (key: string) => string
): void {
    document.getElementById('password-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPwd = (document.getElementById('new-password') as HTMLInputElement)?.value;
        const confirmPwd = (document.getElementById('confirm-password') as HTMLInputElement)?.value;

        if (!newPwd || newPwd.length < 6) {
            showToast({ message: tr('admin.settings.password.minlength'), type: 'error' });
            return;
        }
        if (newPwd !== confirmPwd) {
            showToast({ message: tr('admin.settings.password.mismatch'), type: 'error' });
            return;
        }

        const btn = document.getElementById('save-password-btn');
        if (btn) {
            btn.textContent = tr('admin.settings.password.saving');
            (btn as HTMLButtonElement).disabled = true;
        }

        const result = await changePassword(user, newPwd);
        showToast({ message: result.message, type: result.success ? 'success' : 'error' });

        if (result.success) {
            const el1 = document.getElementById('new-password') as HTMLInputElement;
            const el2 = document.getElementById('confirm-password') as HTMLInputElement;
            if (el1) el1.value = '';
            if (el2) el2.value = '';
        }

        if (btn) {
            btn.textContent = tr('admin.settings.password.btn');
            (btn as HTMLButtonElement).disabled = false;
        }
    });
}

/**
 * Sets up theme toggle in settings pages.
 */
export function setupThemeToggle(_tr?: (key: string) => string): void {
    const btn = document.getElementById('btn-toggle-theme');
    if (!btn) return;

    const updateLabel = () => {
        const theme = localStorage.getItem('campfit_theme') || 'dark';
        btn.textContent = theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    };

    updateLabel();
    btn.addEventListener('click', () => {
        const current = localStorage.getItem('campfit_theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('campfit_theme', next);
        document.documentElement.setAttribute('data-theme', next);
        document.documentElement.style.colorScheme = next;
        updateLabel();
        showToast({ message: `Tema cambiado a ${next === 'dark' ? 'oscuro' : 'claro'}`, type: 'info' });
    });
}

/**
 * Sets up language switcher in settings pages.
 */
export function setupLanguageSwitcher(_tr?: (key: string) => string): void {
    const btn = document.getElementById('btn-switch-language');
    if (!btn) return;

    const updateLabel = () => {
        const lang = localStorage.getItem('campfit_lang') || 'es';
        btn.textContent = lang === 'es' ? '🇬🇧 English' : '🇪🇸 Español';
    };

    updateLabel();
    btn.addEventListener('click', () => {
        const current = localStorage.getItem('campfit_lang') || 'es';
        const next = current === 'es' ? 'en' : 'es';
        const url = new URL(window.location.href);
        url.searchParams.set('lang', next);
        window.location.href = url.toString();
    });
}
