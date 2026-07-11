# 🚀 Guía de Configuración - CampFit 2.0

## Requisitos Previos

- Node.js 20+
- npm 10+
- Cuenta de Firebase (plan Blaze para Cloud Functions)
- Cuenta de Cloudflare (para R2 + Workers)
- Git

---

## 1. Clonar e Instalar

```bash
git clone <repo-url> campfit-astro
cd campfit-astro
npm install
```

---

## 2. Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# === Firebase (Client SDK) ===
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# === Cloudflare R2 ===
PUBLIC_R2_PUBLIC_URL=https://r2.your-domain.com
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=campfit-media
R2_ACCOUNT_ID=your-cloudflare-account-id

# === Cloudflare Worker (URLs prefirmadas) ===
PUBLIC_R2_WORKER_URL=https://r2-worker.your-domain.workers.dev
R2_WORKER_SECRET=your-worker-secret

# === Firebase Admin SDK (solo para API Routes) ===
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> **Nota:** Las variables con prefijo `PUBLIC_` son accesibles desde el cliente. Las demás son solo para SSR/API Routes.

---

## 3. Configurar Firebase

### 3.1 Crear Proyecto

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Crear nuevo proyecto (o usar existente)
3. Habilitar **Authentication** con método **Email/Password**
4. Habilitar **Cloud Firestore** en modo de prueba (luego aplicar reglas)

### 3.2 Configurar Firestore

1. Crear índices compuestos necesarios (ver `15_api_contracts.md`)
2. Aplicar reglas de seguridad de `firebase_rules.md`

### 3.3 Obtener Credenciales

1. En Configuración del proyecto → General → Tus apps → Web
2. Copiar el objeto `firebaseConfig`
3. Mapear a las variables `PUBLIC_FIREBASE_*` en `.env`

---

## 4. Configurar Cloudflare R2

### 4.1 Crear Bucket

1. Ir a [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Crear bucket: `campfit-media`
3. Configurar acceso público (opcional)

### 4.2 Obtener Credenciales

1. En R2 → Tokens de API → Crear token
2. Permisos: Admin Read/Write
3. Copiar Access Key ID y Secret Access Key a `.env`

### 4.3 Desplegar Worker

1. Crear Worker en Cloudflare Workers
2. Implementar endpoint para URLs prefirmadas
3. Configurar secretos del Worker

---

## 5. Iniciar Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# El servidor estará en http://localhost:4321
```

---

## 6. Comandos Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Vista previa del build
npm run test         # Ejecutar tests unitarios (Vitest)
npm run test:e2e     # Ejecutar tests E2E (Playwright)
npm run lint         # Lint (ESLint)
npm run format       # Formatear código (Prettier)
```

---

## 7. Estructura de Tests

```
tests/
├── setup/
│   └── setup.ts           # Setup global (mocks Firebase)
├── mocks/
│   ├── factories.ts       # Factories de datos mock
│   └── firebase.ts        # Mocks de Firebase
├── unit/
│   ├── services/          # Tests de servicios
│   ├── stores/            # Tests de stores
│   └── utils/             # Tests de utilidades
├── integration/           # Tests de integración
└── e2e/                   # Tests E2E (Playwright)
```

---

## 8. Troubleshooting

### Error: `Firebase: Error (auth/operation-not-allowed)`
**Solución:** Habilitar Email/Password en Firebase Console → Authentication → Sign-in method

### Error: `Missing or insufficient permissions`
**Solución:** Verificar reglas de seguridad de Firestore en `firebase_rules.md`

### Error: `Cannot find module '@astrojs/node'`
**Solución:** `npm install @astrojs/node`

### Error: `R2: Access Denied`
**Solución:** Verificar credenciales de R2 en `.env` y permisos del Worker

---

> **📌 Variables de entorno completas:** Ver `.env.example` en la raíz del proyecto.
> **📌 Reglas de Firestore:** Ver `firebase_rules.md` para las reglas de producción.
> **📌 API Contracts:** Ver `15_api_contracts.md` para índices y streams.
