import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',

    setupFiles: ['./tests/setup/vitest.ts'],

    // ─── Firebase como dependencias inline ─────────────────────────────────
    // vitest 4.x necesita que @firebase/firestore y @firebase/auth estén en inline
    // para que vi.mock('firebase/firestore') y vi.mock('firebase/auth') funcionen
    // correctamente. Sin inline, vitest no procesa estos módulos y los mocks
    // no interceptan la cadena de re-export firebase/* → @firebase/*.
    server: {
      deps: {
        inline: [
          '@firebase/firestore',
          '@firebase/auth',
          '@firebase/app',
          '@firebase/util',
          '@firebase/logger',
          'firebase',
        ],
      },
    },

    // ─── Tests centralizados en tests/ ─────────────────────────────────────
    include: [
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      '.astro',
      'tests/e2e',
      'tests/e2e/**',
      'tests/e2e/*.spec.ts',
      'tests/**/*.spec.ts',
      'tests/**/*.spec.ts',
      'tests/e2e/**/*.spec.ts',
      'tests/e2e/**/*.test.ts',
    ],

    // ─── Cobertura ─────────────────────────────────────────────────────────
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './tests/coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'dist/',
        '.astro/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'tests/**',
      ],
    },

    // ─── Alias de módulos ───────────────────────────────────────────────────
    // NOTA: En vitest 4.x, los alias que empiezan con @ pueden no resolverse
    // correctamente en test.alias. Los ponemos en resolve.alias para asegurar
    // que funcionen tanto en producción como en tests.
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
      '@mockData': path.resolve(__dirname, 'src/mockData'),
      '@tests': path.resolve(__dirname, 'tests'),
    },
  },

  // ─── Variables de entorno mock ───────────────────────────────────────────
  define: {
    'import.meta.env.PUBLIC_FIREBASE_API_KEY': JSON.stringify('test-key'),
    'import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN': JSON.stringify('test.firebaseapp.com'),
    'import.meta.env.PUBLIC_FIREBASE_PROJECT_ID': JSON.stringify('test-project'),
    'import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET': JSON.stringify('test-bucket'),
    'import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify('123456'),
    'import.meta.env.PUBLIC_FIREBASE_APP_ID': JSON.stringify('1:123456:web:abc123'),
    'import.meta.env.PUBLIC_R2_UPLOAD_URL': JSON.stringify('https://test.workers.dev/api/upload-url'),
    'import.meta.env.PUBLIC_SENTRY_DSN': JSON.stringify('https://test@sentry.io/123'),
    'import.meta.env.PUBLIC_POSTHOG_KEY': JSON.stringify('phc_test'),
    'import.meta.env.PUBLIC_POSTHOG_HOST': JSON.stringify('https://app.posthog.com'),
  },
});




