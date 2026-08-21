# Roadmap 05: Error Pages & Design System (`/404`, `/500`, `BaseLayout.astro`, `ThemeFlavors`)

## 🎯 Objetivo General
Garantizar la consistencia estética del sistema de diseño oscuro de CampFit, gestión de errores HTTP 404/500 y personalización de temas (Gold, Emerald, Amber, Purple, Cyan) con persistencia en `localStorage`.

---

## 📋 Lista de Tareas

### 🟢 Tarea 5.1: Página de Error 404 (No Encontrado)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Visualización de error 404 estilizada con tokens de diseño, i18n y botones de retorno a Inicio y Login.
- **Archivos:** `src/pages/404.astro`.

### 🟢 Tarea 5.2: Página de Error 500 (Error del Servidor)
- **Estado:** `[COMPLETADO]`
- **Descripción:** Pantalla de contingencia para fallos críticos o excepciones del servidor.
- **Archivos:** `src/pages/500.astro`.

### 🟢 Tarea 5.3: Sistema de Theme Flavors & CSS Tokens
- **Estado:** `[COMPLETADO]`
- **Descripción:** Selector reactivo de paletas de color con variables CSS dinámicas (`--brand`, `--brand-hover`, `--brand-dim`, `--border-brand`).
- **Archivos:** `src/stores/themeStore.ts`, `src/components/ThemeFlavorSelector.astro`.
