# Roadmap 16: Client Settings & Profile (`/client/settings`, `UnifiedSettingsView.astro`)

## 🎯 Objetivo General
Auditar la gestión de perfil de usuario, subida de foto de perfil (avatar) a Cloudflare R2 con previsualización, cambio de contraseña y personalización de preferencias visuales.

---

## 📋 Lista de Tareas

### 🟢 Tarea 16.1: Subida de Avatar a Cloudflare R2
- **Estado:** `[COMPLETADO]`
- **Descripción:** Carga de imagen de perfil con validación de peso (<=2MB), subida a R2 y actualización inmediata en el header/dropdown.
- **Archivos:** `src/components/settings/UnifiedSettingsView.astro`, `src/lib/storage/r2Service.ts`.

### 🟢 Tarea 16.2: Cambio de Contraseña & Seguridad
- **Estado:** `[COMPLETADO]`
- **Descripción:** Formulario seguro para actualizar contraseña mediante Firebase Auth `updatePassword` con re-autenticación si es requerida.
- **Archivos:** `src/components/settings/UnifiedSettingsView.astro`, `src/lib/shared/profileService.ts`.

### 🟢 Tarea 16.3: Preferencias de Notificaciones & Idioma
- **Estado:** `[COMPLETADO]`
- **Descripción:** Ajustes de notificaciones push/email y selección de idioma (`es`, `en`, `ca`).
- **Archivos:** `src/components/settings/UnifiedSettingsView.astro`.
