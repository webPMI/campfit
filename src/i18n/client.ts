export type Language = 'es' | 'en';

const STORAGE_KEY = 'campfit_lang';

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'es';
  return (localStorage.getItem(STORAGE_KEY) as Language) || 'es';
}

export function setStoredLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

export function toggleLanguage(): Language {
  const current = getStoredLanguage();
  const next = current === 'es' ? 'en' : 'es';
  setStoredLanguage(next);
  return next;
}

// Mapa de traducciones para el cliente (solo las que se usan en JS)
const clientTranslations: Record<Language, Record<string, string>> = {
  es: {
    'auth.loading.login': 'Entrando...',
    'auth.loading.register': 'Creando cuenta...',
    'auth.loading.google': 'Conectando...',
    'error.required': 'Completa todos los campos',
    'error.password.length': 'La contraseña debe tener al menos 6 caracteres',
    'error.invalid-credential': 'Email o contraseña incorrectos',
    'error.user-not-found': 'No existe una cuenta con este email',
    'error.wrong-password': 'Contraseña incorrecta',
    'error.invalid-email': 'Email inválido',
    'error.user-disabled': 'Cuenta deshabilitada',
    'error.too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'error.email-in-use': 'Este email ya está registrado',
    'error.weak-password': 'La contraseña es demasiado débil',
    'error.operation-not-allowed': 'El registro no está habilitado',
    'error.google.login': 'Error al iniciar con Google',
    'error.google.register': 'Error al registrarse con Google',
    'error.default.login': 'Error al iniciar sesión',
    'error.default.register': 'Error al registrarse',
    'dashboard.loading': 'Verificando sesión...',
  },
  en: {
    'auth.loading.login': 'Signing in...',
    'auth.loading.register': 'Creating account...',
    'auth.loading.google': 'Connecting...',
    'error.required': 'Please fill in all fields',
    'error.password.length': 'Password must be at least 6 characters',
    'error.invalid-credential': 'Invalid email or password',
    'error.user-not-found': 'No account found with this email',
    'error.wrong-password': 'Incorrect password',
    'error.invalid-email': 'Invalid email',
    'error.user-disabled': 'Account disabled',
    'error.too-many-requests': 'Too many attempts. Try again later',
    'error.email-in-use': 'This email is already registered',
    'error.weak-password': 'Password is too weak',
    'error.operation-not-allowed': 'Registration is not enabled',
    'error.google.login': 'Error signing in with Google',
    'error.google.register': 'Error signing up with Google',
    'error.default.login': 'Error signing in',
    'error.default.register': 'Error signing up',
    'dashboard.loading': 'Verifying session...',
  },
};

export function t(key: string): string {
  const lang = getStoredLanguage();
  return clientTranslations[lang]?.[key] || clientTranslations['es']?.[key] || key;
}
