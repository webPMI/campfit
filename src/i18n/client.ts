import { type Language } from './types';
import { translations } from './translations';

const STORAGE_KEY = 'campfit_lang';

/**
 * Obtiene el idioma almacenado en localStorage.
 * @returns Idioma detectado ('es' por defecto)
 */
export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'es';
  return (localStorage.getItem(STORAGE_KEY) as Language) || 'es';
}

/**
 * Guarda el idioma en localStorage y actualiza el atributo lang del HTML.
 * @param lang - Idioma a guardar
 */
export function setStoredLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

/**
 * Alterna entre español e inglés.
 * @returns Nuevo idioma
 */
export function toggleLanguage(): Language {
  const current = getStoredLanguage();
  const next = current === 'es' ? 'en' : 'es';
  setStoredLanguage(next);
  return next;
}

<<<<<<< HEAD
/**
 * Función de traducción para client-side.
 * Usa el idioma almacenado en localStorage.
 * @param key - Clave de traducción
 * @returns Texto traducido o la key si no existe
 */
=======
// Mapa de traducciones para el cliente (solo las que se usan en JS)
const clientTranslations: Record<Language, Record<string, string>> = {
  es: {
    // Auth
    'auth.google.login': 'Continuar con Google',
    'auth.google.register': 'Registrarse con Google',
    'auth.login.btn': 'Iniciar Sesión',
    'auth.register.btn': 'Crear Cuenta',
    'auth.loading.login': 'Entrando...',
    'auth.loading.register': 'Creando cuenta...',
    'auth.loading.google': 'Conectando...',
    'error.required': 'Completa todos los campos',
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

    // Dashboard
    'dashboard.loading': 'Verificando sesión...',

    // Client Dashboard
    'client.greeting': '¡Hola',
    'client.stats.kg': 'kg',
    'client.stats.kcal': 'kcal',
    'client.no.workout': 'Sin rutina asignada',
    'client.no.diet': 'Sin dieta asignada',
    'client.no.weight': 'Sin registros',
    'app.name': 'CampFit',
    'app.tagline': 'Tu entrenador personal',

    // Medical
    'client.medical.save': 'Guardar Perfil',
    'client.medical.saving': 'Guardando...',

    // Onboarding
    'onboarding.next': 'Continuar',
    'onboarding.finish': 'Finalizar',
    'onboarding.saving': 'Guardando...',
    'onboarding.error': 'Error al guardar el perfil',

    // Support FAQ
    'client.support.faq.workouts': '¿Cómo funcionan las rutinas?',
    'client.support.faq.workouts.answer': 'Tu entrenador asigna rutinas personalizadas según tu nivel y objetivos. Puedes verlas en la sección Rutinas y marcarlas como completadas.',
    'client.support.faq.diets': '¿Cómo sigo mi plan nutricional?',
    'client.support.faq.diets.answer': 'En la sección Dietas encontrarás tu plan de comidas con macros detallados. Marca las comidas como completadas para llevar registro.',
    'client.support.faq.progress': '¿Cómo registro mi progreso?',
    'client.support.faq.progress.answer': 'Puedes registrar tu peso diario en la sección Progreso. Pronto podrás también subir fotos de progreso.',
    'client.support.faq.chat': '¿Cómo contacto a mi entrenador?',
    'client.support.faq.chat.answer': 'Usa la sección Chat para enviar mensajes directos a tu entrenador. Te responderá en horario de atención.',
    'client.support.faq.medical': '¿Para qué sirve el perfil médico?',
    'client.support.faq.medical.answer': 'El perfil médico ayuda a tu entrenador a conocer tu estado de salud y adaptar los planes de entrenamiento y nutrición a tus necesidades.',
  },
  en: {
    // Auth
    'auth.google.login': 'Continue with Google',
    'auth.google.register': 'Sign up with Google',
    'auth.login.btn': 'Sign In',
    'auth.register.btn': 'Create Account',
    'auth.loading.login': 'Signing in...',
    'auth.loading.register': 'Creating account...',
    'auth.loading.google': 'Connecting...',
    'error.required': 'Please fill in all fields',
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

    // Dashboard
    'dashboard.loading': 'Verifying session...',

    // Client Dashboard
    'client.greeting': 'Hello',
    'client.stats.kg': 'kg',
    'client.stats.kcal': 'kcal',
    'client.no.workout': 'No workout assigned',
    'client.no.diet': 'No diet assigned',
    'client.no.weight': 'No records',
    'app.name': 'CampFit',
    'app.tagline': 'Your personal trainer',

    // Medical
    'client.medical.save': 'Save Profile',
    'client.medical.saving': 'Saving...',

    // Onboarding
    'onboarding.next': 'Continue',
    'onboarding.finish': 'Finish',
    'onboarding.saving': 'Saving...',
    'onboarding.error': 'Error saving profile',

    // Support FAQ
    'client.support.faq.workouts': 'How do workouts work?',
    'client.support.faq.workouts.answer': 'Your trainer assigns personalized workouts based on your level and goals. You can view them in the Workouts section and mark them as completed.',
    'client.support.faq.diets': 'How do I follow my meal plan?',
    'client.support.faq.diets.answer': 'In the Diets section you will find your meal plan with detailed macros. Mark meals as completed to keep track.',
    'client.support.faq.progress': 'How do I track my progress?',
    'client.support.faq.progress.answer': 'You can log your daily weight in the Progress section. Soon you will also be able to upload progress photos.',
    'client.support.faq.chat': 'How do I contact my trainer?',
    'client.support.faq.chat.answer': 'Use the Chat section to send direct messages to your trainer. They will respond during business hours.',
    'client.support.faq.medical': 'What is the medical profile for?',
    'client.support.faq.medical.answer': 'The medical profile helps your trainer understand your health status and adapt training and nutrition plans to your needs.',
  },
};

>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
export function t(key: string): string {
  const lang = getStoredLanguage();
  return translations[lang]?.[key] || translations['es']?.[key] || key;
}
