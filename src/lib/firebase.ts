import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';

// Usamos process.env como fallback para compatibilidad con tests (Vitest)
const env = typeof import.meta !== 'undefined' ? import.meta.env : process.env;

// Validación de variables de entorno requeridas
const required = ['PUBLIC_FIREBASE_API_KEY', 'PUBLIC_FIREBASE_AUTH_DOMAIN', 'PUBLIC_FIREBASE_PROJECT_ID', 'PUBLIC_FIREBASE_STORAGE_BUCKET', 'PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'PUBLIC_FIREBASE_APP_ID'];
for (const key of required) {
  if (!env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const firebaseConfig = {
  apiKey: env.PUBLIC_FIREBASE_API_KEY,
  authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configurar persistencia local segura (IndexedDB)
// Esto mantiene la sesión activa aunque el usuario cierre el navegador
setPersistence(auth, browserLocalPersistence).catch((err) => {
  logger.error('Firebase', 'Error setting auth persistence', err);
});

export default app;
