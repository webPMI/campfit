# Roadmap 01: Auth Login Flow (`/login`, `/recover`)

## 🎯 Objetivo General
Blindar y optimizar el flujo de inicio de sesión con correo/contraseña y Google Sign-in, recuperación de contraseñas y redirección automática según rol y estado de onboarding.

---

## 📋 Lista de Tareas

### 🟢 Tarea 1.1: Validación de Credenciales & Feedback Visual
- **Estado:** `[COMPLETADO]`
- **Descripción:** Validación en tiempo real del formato de correo electrónico (`isValidEmail`), alternancia de visibilidad de contraseña con icono interactivo y mensajes de error amigables i18n.
- **Archivos:** `src/pages/login.astro`, `src/lib/validators.ts`.

### 🟢 Tarea 1.2: Inicio de Sesión con Google & Mapeo de Usuario
- **Estado:** `[COMPLETADO]`
- **Descripción:** Login social con Google Auth Popup (`signInWithGoogle`), creación/verificación de registro en Firestore `users/{uid}` preservando rol y foto de perfil.
- **Archivos:** `src/pages/login.astro`, `src/services/authService.ts`.

### 🟢 Tarea 1.3: Recuperación de Contraseña (`/recover`)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Envío de correo de reseteo mediante Firebase `sendPasswordResetEmail` con feedback claro y botón de retorno al login.
- **Archivos:** `src/pages/recover.astro`.

### 🟢 Tarea 1.4: Gateway de Redirección según Rol y Onboarding
- **Estado:** `[COMPLETADO]`
- **Descripción:** Redirección automática a `/admin/dashboard`, `/trainer/dashboard`, `/onboarding` (si es cliente nuevo) o `/client/dashboard`.
- **Archivos:** `src/pages/login.astro`, `src/lib/auth/roleRedirect.ts`.
