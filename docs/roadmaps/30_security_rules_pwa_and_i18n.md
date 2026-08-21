# Roadmap 30: Security Rules, PWA & i18n (`firestore.rules`, PWA, Locales)

## 🎯 Objetivo General
Auditar la seguridad perimetral de datos (reglas Firestore por rol y propiedad), la experiencia PWA (instalabilidad móvil, service worker, offline fallback) y la cobertura completa de traducciones (`es`, `en`, `ca`).

---

## 📋 Lista de Tareas

### 🟢 Tarea 30.1: Matriz de Reglas de Seguridad Firestore
- **Estado:** `[COMPLETADO]`
- **Descripción:** Blindaje de colecciones (`users`, `workouts`, `diets`, `chat_messages`, `support_tickets`, `user_exercise_prefs`) con validación de roles (`isStaff`, `isAdmin`, `isTrainer`).
- **Archivos:** `firestore.rules`.

### 🟢 Tarea 30.2: PWA & Service Worker Offline
- **Estado:** `[COMPLETADO]`
- **Descripción:** Manifiesto web (`manifest.json`), iconos y caché offline para instalación como App nativa en móviles.
- **Archivos:** `public/manifest.json`, `src/pwa/*`.

### 🟢 Tarea 30.3: Cobertura de Internacionalización (i18n)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Diccionarios completos de traducción en Español (`es`), Inglés (`en`) y Catalán (`ca`) sincronizados.
- **Archivos:** `src/i18n/locales/*`.
