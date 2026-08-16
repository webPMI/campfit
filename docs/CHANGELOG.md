# 📋 Changelog

## 🚀 Versión 2.4.0 — 2026-08-16 (Cloudflare R2, Vídeo Feedback, Poses de Progreso y Flujo de Eliminación)

### ☁️ Cloudflare R2 Object Storage & Fallback Reactivo
- **Arquitectura de Almacenamiento**: Conexión al bucket S3 `campfit` (`@aws-sdk/client-s3`) y Cloudflare Worker externo (`https://campfit-storage.servicioweb-pmi.workers.dev/upload`) para subidas multimedia seguras.
- **Servicio Unificado (`r2Service.ts`)**: Timeout ordenado (15s con `AbortController`), fallback reactivo transparente a `/api/storage/upload` o DataURL, y logs descriptivos en consola (`📤 [Almacenamiento]...`, `✅ [Almacenamiento]...`).
- **Limpieza de Nombres Técnicos**: Eliminación total de terminología "R2" de la interfaz para clientes y entrenadores (reemplazado por nombres amigables como *"Almacenamiento Seguro"*, *"Fotos de Evolución"*, *"Guardar Foto"*).

### 🎥 Vídeo Feedback Bidireccional de Técnica (`techniqueCorrectionService.ts`)
- **Para Alumnos (`/client/workouts`)**: Subida directa de vídeos de ejecución con notas personales para solicitar corrección al entrenador. Reproductor HD modal con controles.
- **Para Entrenadores (`/trainer/workouts` & `/trainer/clients`)**:
  - Subida de vídeos explicativos vinculados a ejercicios en el editor de rutinas.
  - Bandeja centralizada de correcciones con selector de velocidad de reproducción en cámara lenta (`0.5x`, `1.0x`) y formulario de feedback técnico.

### 🧍 Clasificación Visual de Poses Corporales (`/client/progress`)
- **Selector de Poses 3-Card**:
  - 🧍 **Frontal**: *"De frente, brazos a los costados y postura erguida"* (Esmeralda).
  - 🚶 **Perfil (Lateral 90°)**: *"Giro lateral 90°, postura neutra y hombros alineados"* (Cian).
  - 👤 **Espalda**: *"De espaldas a la cámara, dorsal y hombros relajados"* (Púrpura).
- **Feedback en Tiempo Real**: Badge dinámico de pose en la vista previa y botón descriptivo (`Guardar Foto Frontal 🧍`, etc.).
- **Filtro de Galería**: Pestañas de filtrado (`Todas`, `🧍 Frontal`, `🚶 Perfil`, `👤 Espalda`) con contadores independientes y badges de pose en cada miniatura.

### 🗑️ Flujo de Eliminación con Confirmación Segura (Zero Native Dialogs)
- **Fotos de Evolución**: Botón de papelera en miniatura y en modal a pantalla completa con confirmación mediante `showConfirm` y función `deleteProgressLog(logId)`.
- **Vídeos de Técnica**: Botón de eliminación en *"Mis Vídeos de Técnica"* (cliente) y en la bandeja de correcciones (entrenador) mediante `deleteTechniqueCorrection(corrId)`.
- **Editor de Ejercicios**: Botón `🗑️ Quitar` para desasociar vídeos explicativos en rutinas.

### 🧹 Auditoría de Código Muerto en Sección Admin
- **`/admin/users.astro`**: Eliminadas variables huérfanas (`medicalProfileData`, `getUserName`, `renderLoadingState`).
- **`/api/admin/logs/query.ts`**: Eliminadas variables y módulos huérfanos (`userUid`, `auth`).
- **`AdminLayout.astro`**: Limpieza de enlaces rotos y conexión de accesos directos a `/admin/logs`, `/admin/devtools`, `/admin/exercises` y `/admin/foods`.

---

## 📋 Changelog - 2026-08-01

## 🔐 Autenticación

### Login (`src/pages/login.astro`)
- **Toggle mostrar/ocultar contraseña** con icono SVG dinámico
- **Validación de email en tiempo real** con checkmark verde
- **Help text** (`aria-describedby`) debajo de campos
- **Errores por campo individual** (email inválido, contraseña requerida)
- **ARIA labels** en toggle de contraseña
- **Icono Google SVG** con colores de marca correctos

### Registro (`src/pages/register.astro`)
- **Indicador de fortaleza de contraseña**: 4 niveles (Débil/Regular/Buena/Fuerte)
- **Requisitos visuales**: Mayúscula, minúscula, número con checkmarks en tiempo real
- **Toggle mostrar/ocultar contraseña** (ambos campos)
- **Campo `confirmPassword`** con validación de coincidencia
- **Validación de email en tiempo real**
- **Help text** en todos los campos
- **Checkbox de términos y condiciones**
- **Errores por campo individual** con i18n

### Recuperación (`src/pages/recover.astro`)
- **Traducciones i18n** completas ES/EN

## 🧭 Navbar Público

### PublicPageLayout (`src/layouts/PublicPageLayout.astro`)
- **Responsive**: Desktop (botones en línea) + Mobile (menú hamburguesa)
- **Reactivo a sesión**: `authService.onAuthChange` en lugar de `onSessionReady`
- **Botones dinámicos**: Muestra "Dashboard" si hay sesión, "Login/Register" si no
- **Selector de idioma** integrado
- **Sin selector de tema** (eliminado del navbar)

## 🎨 Tema y Diseño

### Tema por defecto: Fénix Dorado Oscuro
- `themeStore.ts`: `readStoredFlavor()` → `'onyx'` (Fénix Dorado)
- `BaseLayout.astro`: Fallback de localStorage → `'onyx'`
- `--text-on-brand` ahora usa `var(--color-text-inverse)` → negro en tema Onyx (contraste 15.3:1)

### Selectores de tema eliminados
- `PublicPageLayout.astro`: `<UIThemeSwitcher />` eliminado
- `ClientLayout.astro`: `<ThemeSwitcher />` eliminado
- Tema sigue configurable vía `Ctrl+Shift+F`

## 🛠️ DevTools

### Sistema completo de DevTools (solo DEV)
- **Panel flotante** con Shadow DOM (aislamiento total)
- **Detección automática** de página actual (31 rutas)
- **Autocompletado contextual**:
  - Login: Admin (Seba), Cliente Test, Trainer Test
  - Registro: Nuevo Cliente, Cliente Fitness
  - Onboarding: Atleta, Principiante, Avanzado
  - Recuperación: Email Cliente
- **"Último Registro"** en login: botón dinámico con credenciales del último autocompletar
- **Captura de logs** en tiempo real (500 últimos)
- **Preview de logs** con colores por nivel (info/warn/error)
- **Copiar logs al portapapeles** para compartir
- **Utilidades**: Limpiar Storage, Forzar Logout, Recargar

## 🔥 Firestore

### Security Rules (`firestore.rules`)
- **`allow create`**: Simplificado → `isAuth() && request.auth.uid == userId`
- **`allow update`**: Arreglado → solo verifica `role`/`isBlocked` si están en el update
  ```firestore
  (!('role' in request.resource.data.keys()) || resource.data.role == request.resource.data.role)
  ```
- Desplegado en producción (`mallorca-campfit`)

### Onboarding Service (`src/lib/client/onboardingService.ts`)
- Estrategia: `setDoc` (allow create) → catch → `updateDoc` (allow update)
- Con logs detallados de diagnóstico

### Auth Service (`src/services/authService.ts`)
- `loginUser`: Auto-crea perfil Firestore si no existe
- `loginWithGoogle`: Guarda `photoURL` del usuario
- Logs completos en todos los flujos (14 puntos)

## 🌐 i18n

### Traducciones agregadas
- `auth.password.weak/fair/good/strong`
- `auth.password.show/hide`
- `auth.password.confirm/placeholder/mismatch`
- `auth.terms/required/link`
- `auth.help.name/email`
- `auth.forgot.password`
- `auth.email.error.invalid/required`
- `onboarding.error/back/skip`
- `client.ts` sincronizado con `locales/es.ts` y `locales/en.ts`

## 📚 Documentación

- `docs/CHANGELOG.md` - Este archivo (nuevo)
- `docs/MASTER.md` - Actualizado con cambios de esta sesión

## 🐛 Bugs Corregidos

| Bug | Causa | Solución |
|-----|-------|----------|
| Onboarding "Missing permissions" | `allow update` usaba `resource.data.diff()` con doc inexistente | `!('role' in keys())` en reglas |
| Dashboard vacío | Error de sintaxis por ediciones duplicadas | Script limpio |
| Navbar no detecta sesión | `onSessionReady` consulta puntual | `onAuthChange` reactivo |
| Texto blanco sobre dorado | `--text-on-brand` hardcodeado | `var(--color-text-inverse)` |
| DevTools duplicaba botón | `buildLastRegisterProfile` llamada dos veces | Template condicional corregido |
| Flavors no fallback a onyx | `readStoredFlavor` retornaba `'emerald'` | Cambiado a `'onyx'` |

## 📊 Estadísticas de la Sesión

| Métrica | Valor |
|---------|-------|
| Archivos modificados | ~20 |
| Líneas de código añadidas | ~1500 |
| Bugs corregidos | 8 |
| Features nuevas | 15+ |
| Reglas Firestore desplegadas | 1 |