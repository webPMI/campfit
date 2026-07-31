# 📱 Mobile Agent Guide

> **Guía para el Agente Multiplataforma IA** — PWA, Capacitor, Service Worker y experiencia móvil en CampFit.

---

## 🎯 Rol y Responsabilidades

**Rol:** Encargado de que CampFit funcione como app instalable (PWA) y como app nativa (Capacitor) en Android e iOS.

**Responsabilidades:**
- Mantener la configuración PWA (manifest, service worker, iconos)
- Gestionar Capacitor cuando se implemente (plugins, build, sync)
- Asegurar que la app funcione offline (caché, fallback)
- Optimizar la experiencia móvil (viewport, safe areas, touch)
- Mantener los tests PWA actualizados
- Asegurar que el build web se sincroniza con Capacitor
- Gestionar iconos y splash screens para todas las plataformas

---

## 📁 Archivos Bajo su Responsabilidad

### PWA (implementado)
| Archivo | Propósito |
|---------|-----------|
| `public/manifest.json` | Web App Manifest (nombre, iconos, colores, shortcuts) |
| `public/sw.js` | Service Worker (caché offline, estrategias de red) |
| `public/pwa-icon-192.png` | Icono PWA 192x192 |
| `public/pwa-icon-512.png` | Icono PWA 512x512 |
| `scripts/generate-pwa-icons.mjs` | Script para regenerar iconos desde SVG |
| `tests/unit/pwa/pwa.test.ts` | Tests unitarios del manifest y SW |
| `src/layouts/BaseLayout.astro` | Meta tags PWA y registro de SW |

### Capacitor (pendiente)
| Archivo | Propósito |
|---------|-----------|
| `capacitor.config.ts` | Configuración de Capacitor (appId, appName, webDir) |
| `android/` | Proyecto Android nativo |
| `ios/` | Proyecto iOS nativo |
| `public/splash-*.png` | Splash screens para Android/iOS |

### Configuración
| Archivo | Propósito |
|---------|-----------|
| `firebase.json` | Headers HTTP para SW, manifest y assets |
| `package.json` | Scripts PWA (`pwa:icons`, `pwa:build`, `pwa:audit`) |

---

## 🏗️ Arquitectura Multiplataforma

```
Código fuente (Astro)
        │
        ├── npm run build ──► dist/ ──► Firebase Hosting (Web + PWA) 🌐
        │
        └── npm run build + npx cap sync ──► android/ + ios/ ──► Stores 📱
```

### PWA (ya implementada)
- **Instalación:** Desde Chrome/Firefox/Safari → "Añadir a pantalla de inicio"
- **Offline:** Service Worker con 3 estrategias de caché
- **Actualización:** Automática (siempre la última versión al recargar)
- **Backend:** Firebase Auth + Firestore funcionan igual que en web

### Capacitor (pendiente)
- **Instalación:** Desde Google Play / App Store
- **Plugins:** Cámara, filesystem, push notifications, status bar
- **Build:** `npm run build && npx cap sync && npx cap build android|ios`

---

## 📱 Estrategias de Caché del Service Worker

| Tipo de recurso | Estrategia | Razón |
|-----------------|-----------|-------|
| Assets estáticos (CSS, JS, PNG, SVG) | Cache-first | Inmutables (tienen hash de Astro) |
| Navegación (HTML) | Network-first | Siempre la última versión, fallback offline |
| Otras peticiones del mismo origen | Stale-while-revalidate | Balance entre velocidad y frescura |
| Firebase / Google APIs | Excluidas | Ya tienen su propio manejo de caché |

---

## 🚨 Problemas Conocidos

| ID | Problema | Prioridad |
|----|----------|-----------|
| MOBILE-001 | Capacitor no instalado | 🟡 Media (fase 2) |
| MOBILE-002 | Sin splash screen | 🟡 Media (fase 2) |
| MOBILE-003 | Sin notificaciones push | 🟡 Media (fase 2) |
| MOBILE-004 | Sin tests E2E de PWA | 🟢 Baja |

---

## 🔄 Flujo de Trabajo

```bash
# Diagnóstico
npm run doctor
cat agents/__master.md
cat agents/mobile-agent/TASKS.md

# Desarrollo PWA
# 1. Modificar manifest.json o sw.js
# 2. npm run type-check
# 3. npx vitest run tests/unit/pwa/pwa.test.ts
# 4. npm run build
# 5. Commit

# Regenerar iconos
npm run pwa:icons

# Build completo PWA
npm run pwa:build

# Auditoría Lighthouse (requiere deploy previo)
npm run pwa:audit
```

---

## 📋 Checklist de Verificación PWA

Antes de cada release, verificar:

- [ ] `manifest.json` tiene iconos 192x192 y 512x512
- [ ] `manifest.json` tiene al menos un icono maskable
- [ ] `sw.js` tiene eventos install, activate y fetch
- [ ] `sw.js` excluye dominios de Firebase y Google
- [ ] `BaseLayout.astro` registra el SW solo en producción
- [ ] `firebase.json` tiene headers para `sw.js` (no-cache)
- [ ] Tests PWA pasan: `npx vitest run tests/unit/pwa/pwa.test.ts`
- [ ] Build exitoso: `npm run build`
- [ ] Iconos actualizados: `npm run pwa:icons`

---

## 🔮 Roadmap Multiplataforma

### Fase 1: PWA ✅ (Completado)
- [x] Web App Manifest
- [x] Service Worker con estrategias de caché
- [x] Iconos PWA (192x192, 512x512)
- [x] Meta tags en BaseLayout
- [x] Headers HTTP en firebase.json
- [x] Tests unitarios

### Fase 2: Capacitor (Pendiente)
- [ ] Instalar Capacitor 6
- [ ] Configurar capacitor.config.ts
- [ ] Añadir plataformas Android e iOS
- [ ] Instalar plugins (camera, filesystem, push, status-bar)
- [ ] Generar splash screens
- [ ] Configurar build pipeline
- [ ] Tests E2E en dispositivo

### Fase 3: Stores (Pendiente)
- [ ] Google Play Store (APK/AAB)
- [ ] Apple App Store (IPA)
- [ ] Iconos adaptativos Android
- [ ] Metadatos de store (descripción, screenshots)
- [ ] Política de privacidad

---

> **Stack:** PWA (manifest + service worker), Capacitor 6 (pendiente)  
> **Hosting:** Firebase Hosting (PWA) + Google Play / App Store (Capacitor)  
> **Última actualización:** 2026-07-30