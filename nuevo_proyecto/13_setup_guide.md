# 🔧 Setup Guide - CampFit

Guía paso a paso para inicializar el proyecto desde cero.

---

## 1. Crear Proyecto Astro

```bash
npm create astro@latest campfit-astro -- --template basics --typescript strict
cd campfit-astro
```

## 2. Instalar Dependencias

### Producción
```bash
npm install firebase@11
npm install nanostores@1
```

### Desarrollo
```bash
npm install @tailwindcss/vite@4 @astrojs/node
npm install -D vitest@4 @testing-library/jest-dom@6 jsdom
npm install -D @playwright/test@1
npm install -D prettier@3 prettier-plugin-astro@0.14
npm install -D @astrojs/check@0.9 typescript@5
```

---

## 3. Archivos de Configuración

### `astro.config.mjs`
```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: { plugins: [tailwindcss()] },
});
```

### `src/styles/global.css`
```css
@import "tailwindcss";

@theme {
  --color-emerald-400: #34d399;
  --color-emerald-500: #10b981;
  --color-emerald-900: #064e3b;
}

:root { color-scheme: dark; }

@layer base {
  html {
    background-color: #09090b;
    color: #f4f4f5;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  body { min-height: 100vh; }
}
```

### `tsconfig.json`
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@features/*": ["./src/features/*"],
      "@core/*": ["./src/core/*"],
      "@layouts/*": ["./src/layouts/*"],
      "@mockData/*": ["./src/mockData/*"],
      "@tests/*": ["./tests/*"]
    },
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "types": ["vitest/globals"]
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

### `.env`
```env
# Firebase
PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudflare R2 (pendiente)
PUBLIC_R2_UPLOAD_URL=https://your-worker.workers.dev/api/upload-url

# Sentry (pendiente)
PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# PostHog (pendiente)
PUBLIC_POSTHOG_KEY=phc_your_posthog_key
PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

> ⚠️ **Importante:** El `.env` con credenciales reales NO debe subirse al repositorio. Usa `.env.example` como plantilla.

### `.gitignore`
```
# build output
dist/

# generated types
.astro/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment variables
.env
.env.production

# macOS-specific files
.DS_Store

# jetbrains setting folder
.idea/

# git disabled (old repo)
.git_disabled/

# vscode settings (personal)
.vscode/
```

---

## 4. Estructura Inicial de Directorios

```bash
mkdir -p src/{layouts,lib/admin,lib/auth,lib/client,pages/{admin,client,trainer,api},services,stores,types,i18n}
mkdir -p tests
mkdir -p public
```

---

## 5. Archivos Base del Proyecto

### `src/env.d.ts`
```typescript
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_FIREBASE_API_KEY: string;
  readonly PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  readonly PUBLIC_FIREBASE_PROJECT_ID: string;
  readonly PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly PUBLIC_FIREBASE_APP_ID: string;
  readonly PUBLIC_R2_UPLOAD_URL: string;
  readonly PUBLIC_SENTRY_DSN: string;
  readonly PUBLIC_POSTHOG_KEY: string;
  readonly PUBLIC_POSTHOG_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### `src/lib/firebase.ts`
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Persistencia local segura (IndexedDB)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error('Error setting auth persistence:', err);
});

export default app;
```

---

## 6. Verificar que todo funciona

```bash
npm install
npm run dev
npm run build
npm test
```

---

## 7. Scripts package.json

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:integration": "vitest --config vitest.config.ts tests/integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run test && npm run test:e2e",
    "test:ci": "vitest run --coverage && playwright test"
  }
}
```

---

> **📌 Nota:** Este proyecto usa **Vanilla JS** (sin React, sin librerías de UI). Los componentes se renderizan como HTML desde JavaScript puro, con streams en tiempo real de Firestore (`onSnapshot`).
