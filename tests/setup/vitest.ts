/**
 * Setup global para tests unitarios con Vitest.
 * Se ejecuta antes de cada archivo de test.
 *
 * Configura variables de entorno mock para Firebase y otros servicios.
 * Esto evita que firebase.ts falle al intentar leer import.meta.env.
 */

// Variables de entorno mock para Firebase
process.env.PUBLIC_FIREBASE_API_KEY = 'test-key';
process.env.PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-bucket';
process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456';
process.env.PUBLIC_FIREBASE_APP_ID = '1:123456:web:abc123';
process.env.PUBLIC_R2_UPLOAD_URL = 'https://test.workers.dev/api/upload-url';
process.env.PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';
process.env.PUBLIC_POSTHOG_KEY = 'phc_test';
process.env.PUBLIC_POSTHOG_HOST = 'https://app.posthog.com';
