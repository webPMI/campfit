# Roadmap 04: Role Routing Gateway (`/index`, `/dashboard`, `roleRedirect.ts`)

## 🎯 Objetivo General
Auditar y blindar el enrutamiento inteligente de usuarios autenticados y visitantes, garantizando que cada rol acceda exclusivamente a su portal y los nuevos registros completen el onboarding sin bucles de redirección.

---

## 📋 Lista de Tareas

### 🟢 Tarea 4.1: Landing Page Pública (`/index`)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Hero dinámico, bento grid de características y showcase interactivo de portales para visitantes no autenticados.
- **Archivos:** `src/pages/index.astro`, `src/components/landing/*`.

### 🟢 Tarea 4.2: Gateway Central de Autenticación (`/dashboard`)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Detección de estado de sesión vía `onAuthStateChanged` y redirección inmediata mediante `redirectByRole()`.
- **Archivos:** `src/pages/dashboard.astro`, `src/lib/auth/roleRedirect.ts`.

### 🟢 Tarea 4.3: Control de Usuarios Bloqueados
- **Estado:** `[COMPLETADO]`
- **Descripción:** Verificación del campo `isBlocked` en el perfil de Firestore, cerrando sesión forzada y alertando al usuario.
- **Archivos:** `src/lib/auth/roleRedirect.ts`, `src/lib/shared/authGuard.ts`.
