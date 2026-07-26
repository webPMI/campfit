# 🔌 Integraciones y Operaciones - CampFit 2.0

## 1. Firebase

### Firebase Auth
- **Propósito:** Autenticación de usuarios (email/contraseña)
- **SDK:** `firebase/auth`
- **Configuración:** Variables de entorno en `.env` (ver `13_setup_guide.md`)

### Cloud Firestore
- **Propósito:** Base de datos NoSQL en tiempo real
- **SDK:** `firebase/firestore`
- **7 colecciones:** users, workouts, diets, messages, progress_logs, exercises_library, diet_templates
- **Reglas de seguridad:** Ver `05_reglas_seguridad.md`

### Firebase Hosting
- **Propósito:** Hosting de la aplicación web
- **Comando deploy:** `firebase deploy --only hosting`

---

## 2. Cloudflare R2

### Propósito
Almacenamiento de archivos multimedia (videos de ejercicios, fotos de progreso) con costo cero de egress.

### Arquitectura

```
[Cliente] → Solicita URL pre-firmada → [Cloudflare Worker]
                                              ↓
[Cliente] ← Recibe URL pre-firmada ← [Cloudflare Worker]
     ↓
[Cliente] → Sube archivo directamente → [Cloudflare R2 Bucket]
```

### Buckets

| Bucket | Propósito | Acceso |
|--------|-----------|--------|
| `campfit-exercises` | Videos de ejercicios | Público (lectura) |
| `campfit-progress` | Fotos de progreso | Privado (solo owner + staff) |

### Costos
- **Storage:** $0.015/GB/mes
- **Egress:** $0 (sin costo de transferencia)
- **Operaciones Clase A:** $4.50/millón (writes)
- **Operaciones Clase B:** $0.36/millón (reads)

---

## 3. Capacitor

### Propósito
Wrapper nativo para convertir la web app en aplicaciones Android e iOS.

### Instalación
```bash
npm install @capacitor/core @capacitor/cli
npx cap init CampFit com.campfit.app
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

### Plugins Necesarios
| Plugin | Propósito |
|--------|-----------|
| `@capacitor/camera` | Tomar fotos de progreso |
| `@capacitor/filesystem` | Acceso a galería |
| `@capacitor/push-notifications` | Notificaciones push |
| `@capacitor/status-bar` | Control de barra de estado |

### Build y Deploy
```bash
# Build web
npm run build

# Sincronizar con Capacitor
npx cap sync

# Abrir en Android Studio
npx cap open android

# Abrir en Xcode
npx cap open ios

# Build APK/IPA
npx cap build android
npx cap build ios
```

---

## 4. Cloudflare Workers

### Propósito
Funciones serverless para operaciones que requieren lógica de backend.

### Workers Necesarios

| Worker | Propósito | Endpoint |
|--------|-----------|----------|
| `generate-upload-url` | Generar URLs pre-firmadas para R2 | `POST /api/upload-url` |
| `validate-medical` | Validación avanzada de perfil médico | `POST /api/validate-medical` |
| `chatbot-faq` | Chatbot de preguntas frecuentes | `POST /api/chatbot` |

### Comandos
```bash
npx wrangler deploy      # Deploy workers
npx wrangler dev         # Desarrollo local de workers
```

---

## 5. GitHub Actions (CI/CD)

### Pipeline de Calidad y Deploy

```yaml
# .github/workflows/deploy.yml
name: CI/CD

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          expires: 7d

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
        env:
          PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          # ... otras variables
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
      - name: Sync Capacitor
        run: npx cap sync
```

---

## 6. Sentry (Monitoreo de Errores)

### Instalación
```bash
npm install @sentry/react @sentry/astro
```

### Configuración
```typescript
// src/core/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1, // 10% de transacciones
});
```

---

## 7. PostHog (Analytics)

### Instalación
```bash
npm install posthog-js
```

### Configuración
```typescript
// src/core/analytics.ts
import posthog from 'posthog-js';

posthog.init(import.meta.env.PUBLIC_POSTHOG_KEY, {
  api_host: import.meta.env.PUBLIC_POSTHOG_HOST,
  capture_pageview: true,
});
```

### Eventos a Trackear

| Evento | Cuándo |
|--------|--------|
| `user_signed_up` | Registro completado |
| `user_logged_in` | Inicio de sesión |
| `workout_completed` | Rutina marcada como completada |
| `meal_logged` | Comida marcada como realizada |
| `weight_logged` | Nuevo peso registrado |
| `photo_uploaded` | Foto de progreso subida |
| `message_sent` | Mensaje enviado en chat |
| `alert_sent` | Llamado de atención enviado |
| `plan_assigned` | Plan asignado a cliente |

---

## 8. Checklist de Release

### Pre-Release
- [ ] Todos los tests pasan (unitarios + E2E)
- [ ] Lint sin errores
- [ ] TypeScript sin errores
- [ ] Lighthouse > 80 en móvil y desktop
- [ ] Auditoría de accesibilidad (a11y) pasa
- [ ] Reglas de Firestore desplegadas
- [ ] Índices compuestos creados en Firestore
- [ ] Variables de entorno configuradas en producción
- [ ] Sentry configurado y probado
- [ ] PostHog configurado y probado

### Release
- [ ] Tag semántico creado (`v1.0.0`)
- [ ] Release notes generadas
- [ ] Deploy a Firebase Hosting
- [ ] APK generada y probada
- [ ] TestFlight actualizado
- [ ] Cloudflare Workers desplegados

### Post-Release
- [ ] Monitoreo de errores en Sentry (24h)
- [ ] Verificar analytics en PostHog
- [ ] Backup de Firestore configurado
- [ ] Documentación actualizada
