# Roadmap 02: Auth Register Flow (`/register`, `/terms`)

## 🎯 Objetivo General
Auditar y perfeccionar el registro de nuevos usuarios, selector interactivo de rol (Cliente / Entrenador), medidor en tiempo real de fortaleza de contraseña, aceptación de términos de servicio y bootstrapping seguro en Firestore.

---

## 📋 Lista de Tareas

### 🟢 Tarea 2.1: Medidor de Seguridad de Contraseña & Confirmación
- **Estado:** `[COMPLETADO]`
- **Descripción:** Barra interactiva de entropía/fuerza de contraseña con validación de mayúsculas, números y longitud mínima (>= 6 caracteres).
- **Archivos:** `src/pages/register.astro`, `src/lib/validators.ts`.

### 🟢 Tarea 2.2: Selector de Rol (Cliente / Entrenador)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Toggle interactivo para registrarse como cliente (`role: 'client'`) o solicitar alta como entrenador (`role: 'trainer'`).
- **Archivos:** `src/pages/register.astro`, `src/services/authService.ts`.

### 🟢 Tarea 2.3: Términos Legales & Consentimiento (`/terms`)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Checkbox de aceptación de términos y condiciones de uso y privacidad con enlace a `/terms`.
- **Archivos:** `src/pages/register.astro`, `src/pages/terms.astro`.

### 🟢 Tarea 2.4: Registro con Google & Firestore Bootstrapping
- **Estado:** `[COMPLETADO]`
- **Descripción:** Alta inmediata vía Google Popup vinculando rol y redirigiendo al asistente de Onboarding.
- **Archivos:** `src/pages/register.astro`, `src/services/authService.ts`.
