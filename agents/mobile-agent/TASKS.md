# 📋 Mobile Agent — Backlog de Tareas

> Backlog priorizado para multiplataforma. Actualizado: 2026-07-30

---

## 🔴 Prioridad Alta

### MOBILE-001: Verificar PWA en producción
- **Descripción:** Desplegar a Firebase Hosting y verificar que la app es instalable desde Chrome móvil
- **Archivos afectados:** Ninguno (verificación manual)
- **Criterios:**
  - Chrome móvil muestra banner "Instalar CampFit"
  - La app se instala con icono correcto
  - La app abre en pantalla completa (sin barra de direcciones)
  - Funciona offline básico (páginas ya visitadas cargan sin red)

### MOBILE-002: Auditoría Lighthouse PWA
- **Descripción:** Ejecutar auditoría Lighthouse y asegurar score PWA > 90
- **Archivos afectados:** Posibles ajustes en `manifest.json` o `sw.js`
- **Criterios:**
  - Lighthouse PWA score > 90
  - Sin errores críticos en la auditoría
  - Todos los checks de "Installable" pasan

---

## 🟡 Prioridad Media

### MOBILE-003: Instalar Capacitor 6
- **Descripción:** Instalar Capacitor y configurar para Android e iOS
- **Archivos afectados:** `package.json`, `capacitor.config.ts` (nuevo)
- **Comandos:**
  ```bash
  npm install @capacitor/core @capacitor/cli
  npx cap init CampFit com.campfit.app
  npm install @capacitor/android @capacitor/ios
  npx cap add android
  npx cap add ios
  ```
- **Criterios:**
  - `capacitor.config.ts` creado con webDir: 'dist'
  - `npx cap sync` funciona sin errores
  - `npx cap open android` abre Android Studio

### MOBILE-004: Instalar plugins de Capacitor
- **Descripción:** Instalar plugins esenciales para funcionalidades nativas
- **Plugins:**
  - `@capacitor/camera` — Fotos de progreso
  - `@capacitor/filesystem` — Acceso a galería
  - `@capacitor/push-notifications` — Notificaciones push
  - `@capacitor/status-bar` — Control de barra de estado
  - `@capacitor/splash-screen` — Pantalla de splash
  - `@capacitor/app` — Eventos de ciclo de vida
- **Criterios:** Todos los plugins instalados y sincronizados

### MOBILE-005: Generar splash screens
- **Descripción:** Crear splash screens para Android e iOS
- **Archivos afectados:** `public/splash-*.png`, `scripts/generate-pwa-icons.mjs`
- **Criterios:**
  - Splash screen Android (varias densidades)
  - Splash screen iOS (varias resoluciones)
  - Configurado en `capacitor.config.ts`

### MOBILE-006: Notificaciones push con FCM
- **Descripción:** Configurar Firebase Cloud Messaging para notificaciones push
- **Archivos afectados:** `src/lib/pushNotifications.ts` (nuevo), `capacitor.config.ts`
- **Criterios:**
  - Permisos de notificaciones solicitados al instalar
  - Token FCM registrado en Firestore
  - Notificación de prueba recibida en Android e iOS

---

## 🟢 Prioridad Baja

### MOBILE-007: Tests E2E de PWA
- **Descripción:** Crear test E2E que verifique que la PWA es instalable
- **Archivos afectados:** `tests/e2e/pwa.spec.ts` (nuevo)
- **Criterios:**
  - Test verifica que `manifest.json` es accesible
  - Test verifica que `sw.js` es accesible
  - Test verifica meta tags en HTML

### MOBILE-008: Iconos adaptativos Android
- **Descripción:** Generar iconos adaptativos para Android (foreground + background)
- **Archivos afectados:** `public/`, `scripts/generate-pwa-icons.mjs`
- **Criterios:** Iconos adaptativos generados y configurados

### MOBILE-009: Configuración de stores
- **Descripción:** Preparar metadatos para Google Play y App Store
- **Archivos afectados:** `docs/store-metadata.md` (nuevo)
- **Criterios:**
  - Descripción corta y larga
  - Screenshots en múltiples resoluciones
  - Política de privacidad
  - Clasificación de edad

### MOBILE-010: CI/CD para Capacitor
- **Descripción:** Añadir step de Capacitor sync al pipeline de CI/CD
- **Archivos afectados:** `.github/workflows/deploy.yml`
- **Criterios:**
  - Build web → cap sync → cap build android
  - APK subido como artifact

---

## ✅ Completado

### MOBILE-000: PWA base ✅
- [x] Web App Manifest creado
- [x] Service Worker con 3 estrategias de caché
- [x] Iconos PWA 192x192 y 512x512 generados
- [x] Meta tags en BaseLayout.astro
- [x] Headers HTTP en firebase.json
- [x] Tests unitarios (14 tests)
- [x] Script de generación de iconos
- [x] Documentación en 11_integraciones_operaciones.md

---

> **Ver también:** `agents/mobile-agent/GUIDE.md` para arquitectura y `agents/mobile-agent/RULES.md` para reglas