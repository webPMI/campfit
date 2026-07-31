# 📱 Mobile Agent — Reglas

> Reglas específicas para el agente multiplataforma. Deben cumplirse además de las GOLDEN RULES de `.clinerules`.

---

## 📏 Reglas de Operación

### 1. No registrar el Service Worker en desarrollo
El SW solo debe registrarse en producción (`import.meta.env.PROD`). En desarrollo, el SW puede causar problemas de caché y dificultar el debugging.

### 2. No interceptar peticiones a Firebase
El Service Worker NUNCA debe interceptar peticiones a Firebase, Google APIs o Google Fonts. Estas ya tienen su propio manejo de caché y auth.

### 3. Versionar el cache del Service Worker
Cada vez que se modifique `sw.js`, incrementar `CACHE_VERSION`. Esto asegura que los usuarios reciban la nueva versión al activar el SW.

### 4. No hardcodear URLs en el manifest
Las URLs en `manifest.json` deben ser relativas (`/dashboard`, no `https://campfit.com/dashboard`). Firebase Hosting se encarga del dominio.

### 5. Tests antes de push
Siempre ejecutar `npx vitest run tests/unit/pwa/pwa.test.ts` antes de commitear cambios en PWA.

### 6. Un cambio atómico a la vez
No mezclar cambios de manifest con cambios de service worker. Cada commit debe contener un único cambio.

### 7. Iconos siempre en PNG
Los iconos PWA deben ser PNG (no SVG) para máxima compatibilidad con Android e iOS. Usar `npm run pwa:icons` para regenerarlos.

### 8. No modificar BaseLayout sin necesidad
Los meta tags PWA en `BaseLayout.astro` son críticos. Solo modificar si es estrictamente necesario y verificar que no se duplican.

### 9. Headers HTTP correctos en firebase.json
El `sw.js` debe tener `Cache-Control: no-cache` para que los usuarios siempre reciban la última versión. Los assets estáticos deben tener cache inmutable.

### 10. Documentar cambios en GUIDE.md
Cualquier cambio en la configuración PWA o Capacitor debe reflejarse en `agents/mobile-agent/GUIDE.md`.

---

## 📱 Reglas de Capacitor (fase 2)

### 11. Build web antes de cap sync
Siempre ejecutar `npm run build` antes de `npx cap sync`. Capacitor copia los archivos de `dist/` a las plataformas nativas.

### 12. No commitear plataformas nativas
Los directorios `android/` y `ios/` no deben commitearse al repo. Se generan con `npx cap add android|ios`.

### 13. Plugins en package.json
Los plugins de Capacitor deben estar en `dependencies` (no `devDependencies`) porque se necesitan en producción.

---

> **Última actualización:** 2026-07-30