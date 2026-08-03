# 🎨 CampFit Design System — Sistema de Temas (v2.0)

> **Última actualización:** 2026-08-03  
> **Propietario:** Equipo CampFit  
> **Archivos clave:** `src/styles/theme.css`, `src/stores/themeStore.ts`, `src/components/ThemeToggle.astro`, `src/layouts/BaseLayout.astro`  
> **Estado:** ✅ Theme v2.0 implementado (modos + flavors + auto-theme)

---

## 📋 Índice

1. [Arquitectura](#arquitectura)
2. [Archivos del Sistema](#archivos-del-sistema)
3. [Cómo Usar el Tema en Componentes](#cómo-usar-el-tema-en-componentes)
4. [Tokens de Diseño](#tokens-de-diseño)
5. [API del Theme Store](#api-del-theme-store)
6. [Scripts y Testing](#scripts-y-testing)
7. [Guía para Agentes (AI)](#guía-para-agentes-ai)
8. [FAQ y Troubleshooting](#faq-y-troubleshooting)
9. [Roadmap](#roadmap)

---

## Arquitectura

El sistema de temas de CampFit sigue una arquitectura en **3 capas**:

```
┌─────────────────────────────────────────────────┐
│  CAPA 1: CSS Variables (theme.css + BaseLayout) │
│  Define los tokens de diseño para ambos temas.  │
│  [data-theme-mode="light"] ↔ [data-theme-mode="dark"] │
│  [data-theme-flavor="emerald|ocean|sunset|onyx"]│
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  CAPA 2: Nanostores (themeStore.ts)             │
│  Estado reactivo (modo + flavor), persistencia  │
│  en localStorage, watch del sistema, acciones.  │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  CAPA 3: UI Components                          │
│  ThemeToggle.astro, clases utilitarias          │
│  semánticas (.theme-bg, .theme-text, etc.)      │
└─────────────────────────────────────────────────┘
```

### Conceptos Clave (v2.0)

- **Modo (`ThemeMode`)**: `'light' | 'dark' | 'auto'` — la preferencia de brillo del usuario.
- **Flavor (`ThemeFlavor`)**: `'emerald' | 'ocean' | 'sunset' | 'onyx'` — la paleta de color de acento.
- **Modo resuelto (`$resolvedMode`)**: siempre `'light' | 'dark'` concreto. Cuando el modo es `'auto'`, se resuelve contra `$systemPreference`.

### Flujo de Cambio de Tema

```
Usuario hace clic en ThemeToggle
  → toggleThemeMode() en themeStore.ts
    → $themeMode.set('light'|'dark'|'auto')
    → persistMode() → localStorage (campfit_theme_mode)
    → applyThemeToDom(mode, flavor)
      → document.documentElement.setAttribute('data-theme-mode', ...)
      → document.documentElement.setAttribute('data-theme-flavor', ...)
      → CSS aplica las variables correspondientes
      → Toda la UI se actualiza instantáneamente
```

### Anti-Flash-of-Wrong-Theme (AFOWT)

Para prevenir el "flash" del tema incorrecto al cargar la página, se ejecuta un script **inline y síncrono** en `<body>` de `BaseLayout.astro` que lee `localStorage` y aplica `data-theme-mode`/`data-theme-flavor` **antes** de que el navegador renderice cualquier contenido. También migra la key legacy `campfit_theme` (v1) a las nuevas keys.

```html
<script is:inline>
  (function () {
    try {
      var oldKey = localStorage.getItem("campfit_theme");
      var mode, flavor;
      if (oldKey) {
        mode = oldKey;
        flavor = "emerald";
        localStorage.removeItem("campfit_theme");
        localStorage.setItem("campfit_theme_mode", mode);
        localStorage.setItem("campfit_theme_flavor", flavor);
      } else {
        mode = localStorage.getItem("campfit_theme_mode") || "dark";
        flavor = localStorage.getItem("campfit_theme_flavor") || "onyx";
      }
      document.documentElement.setAttribute("data-theme-mode", mode);
      document.documentElement.setAttribute("data-theme-flavor", flavor);
      document.documentElement.style.colorScheme = mode;
    } catch (e) {
      document.documentElement.setAttribute("data-theme-mode", "dark");
      document.documentElement.setAttribute("data-theme-flavor", "emerald");
    }
  })();
</script>
```

---

## Archivos del Sistema

| Archivo | Propósito | Tipo |
|---------|-----------|------|
| `src/styles/theme.css` | **Fuente de verdad** para tokens de color por flavor (light/dark). | CSS |
| `src/layouts/BaseLayout.astro` | Importa `theme.css`, define tokens v2 (`--brand`, `--surface-*`, `--accent-*`, motion system) y contiene el script AFOWT. | Astro |
| `src/stores/themeStore.ts` | Estado reactivo del tema (modo + flavor) con Nanostores. Persistencia, watch del sistema, acciones. | TypeScript |
| `src/components/ThemeToggle.astro` | Botón accesible de toggle tema (role="switch", Ctrl+Shift+T). | Astro |
| `tests/unit/stores/themeStore.test.ts` | Tests unitarios exhaustivos para themeStore (32+ tests). | TypeScript/Vitest |
| `scripts/validate-theme.ts` | Script de validación de integridad del sistema de temas. | TypeScript |
| `docs/THEME.md` | Esta documentación. | Markdown |
| `docs/THEME_STATUS.md` | Estado de migración de archivos (41/44 migrados). | Markdown |
| `docs/ACCESIBILIDAD.md` | Guía de cumplimiento WCAG 2.1 AA. | Markdown |

### Dependencias

- **nanostores** (`^1.4.0`): Para el estado reactivo del tema.
- **Tailwind CSS v4**: Las clases utilitarias de Tailwind se usan **solo para layout/espaciado**. Para **colores**, siempre usar tokens CSS.
- **TypeScript**: Todo el código del store está tipado estrictamente.

---

## Cómo Usar el Tema en Componentes

### ✅ Correcto: Usar variables CSS del tema

```astro
<!-- En un componente Astro -->
<div class="theme-surface rounded-lg p-4 theme-border">
  <h2 class="theme-text-primary text-lg font-bold">Título</h2>
  <p class="theme-text-secondary text-sm">Descripción</p>
</div>
```

```css
/* En CSS */
.my-component {
  background-color: var(--color-surface-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
}
```

### ❌ Incorrecto: Hardcodear colores

```astro
<!-- ❌ NUNCA HAGAS ESTO para colores que dependen del tema -->
<div class="bg-zinc-900 text-zinc-100">
  <!-- Esto no cambiará con el tema -->
</div>
```

### Clases Utilitarias Semánticas Disponibles

| Clase | Descripción |
|-------|-------------|
| `theme-bg-primary` | Fondo principal |
| `theme-bg-secondary` | Fondo secundario |
| `theme-bg-elevated` | Fondo elevado (cards, modales) |
| `theme-bg-gradient` | Gradiente de fondo |
| `theme-surface` | Superficie con borde |
| `theme-surface-secondary` | Superficie secundaria |
| `theme-surface-hover` | Hover de superficie |
| `theme-text-primary` | Texto principal |
| `theme-text-secondary` | Texto secundario |
| `theme-text-tertiary` | Texto terciario |
| `theme-text-brand` | Texto con color de marca |
| `theme-text-error` | Texto de error |
| `theme-text-success` | Texto de éxito |
| `theme-border` | Borde por defecto |
| `theme-border-strong` | Borde fuerte |
| `theme-border-focus` | Borde de foco |
| `theme-brand` | Botón/fondo con color de marca |
| `theme-scrollbar` | Scrollbar con colores del tema |

### Usar el Store en JS/TS

```typescript
import {
  $themeMode, $themeFlavor, $resolvedMode, $isDark, $isLight,
  $systemPreference, $flavorName, $themeDisplayName,
  setThemeMode, toggleThemeMode, followSystemTheme,
  setThemeFlavor, cycleThemeFlavor,
  watchSystemTheme, unwatchSystemTheme, initTheme,
} from '@/stores/themeStore';

// Leer el modo actual
console.log($themeMode.get()); // 'dark' | 'light' | 'auto'

// Leer el flavor actual
console.log($themeFlavor.get()); // 'emerald' | 'ocean' | 'sunset' | 'onyx'

// Leer el modo resuelto (nunca 'auto')
console.log($resolvedMode.get()); // 'dark' | 'light'

// Reaccionar a cambios
$themeMode.subscribe((mode) => {
  console.log('Modo cambiado a:', mode);
});

// Cambiar modo
setThemeMode('light');
setThemeMode('auto'); // sigue la preferencia del sistema
toggleThemeMode(); // cicla: auto → light → dark → light → ...
followSystemTheme(); // equivalente a setThemeMode('auto')

// Cambiar flavor
setThemeFlavor('ocean');
cycleThemeFlavor(); // emerald → ocean → sunset → onyx → emerald → ...

// Verificar si es oscuro
if ($isDark.get()) {
  // lógica para tema oscuro
}

// Inicializar (una vez en startup)
initTheme();
```

---

## Tokens de Diseño

### Convención de Nombres

```
--{categoría}-{grupo}-{variante}
```

Ejemplos:
- `--color-bg-primary` → Color, fondo, principal
- `--color-text-secondary` → Color, texto, secundario
- `--space-4` → Espaciado, tamaño 4
- `--radius-lg` → Radio, grande
- `--anim-duration-normal` → Animación, duración, normal

### Categorías de Tokens

#### Tokens v2 (definidos en `BaseLayout.astro`)

| Token | Descripción |
|-------|-------------|
| `--brand`, `--brand-hover`, `--brand-dim`, `--brand-glow` | Color de marca (flavor-aware) |
| `--brand-gradient`, `--brand-gradient-subtle` | Gradientes de marca |
| `--surface-0` a `--surface-5` | Superficies (fondo, cards, elevados) |
| `--surface-glass` | Superficie glassmorphism |
| `--accent-blue`, `--accent-purple`, `--accent-amber` (+ `-hover`, `-dim`) | Colores de acento |
| `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-disabled`, `--text-on-brand` | Texto |
| `--border-default`, `--border-subtle`, `--border-strong`, `--border-brand` | Bordes |
| `--success`, `--warning`, `--danger`, `--info` (+ `-dim`) | Estados |
| `--shadow-xs` a `--shadow-xl`, `--shadow-glow-*` | Sombras |
| `--radius-xs` a `--radius-full` | Radios |
| `--transition-fast/base/slow/spring` | Transiciones |
| `--glass-bg`, `--glass-border`, `--glass-blur` | Glassmorphism |

#### Motion System (definido en `BaseLayout.astro`)

| Token | Descripción |
|-------|-------------|
| `--duration-instant/fast/normal/slow/slower` | Duraciones |
| `--ease-out-expo`, `--ease-spring`, `--ease-soft` | Easing |
| `--stagger-1` a `--stagger-8` | Delays escalonados |
| `--slide-offset-sm/md/lg` | Desplazamientos |

#### Colores de Fondo (`--color-bg-*`)

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `--color-bg-primary` | `#fafafa` | `#09090b` | Fondo de página |
| `--color-bg-secondary` | `#f4f4f5` | `#18181b` | Fondo secundario |
| `--color-bg-elevated` | `#ffffff` | `#1c1c1f` | Cards, modales |

#### Colores de Texto (`--color-text-*`)

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `--color-text-primary` | `#18181b` | `#fafafa` | Texto principal |
| `--color-text-secondary` | `#52525b` | `#a1a1aa` | Texto secundario |
| `--color-text-link` | `#059669` | `#34d399` | Enlaces |

#### Bordes (`--color-border-*`)

| Token | Light | Dark |
|-------|-------|------|
| `--color-border-default` | `#e4e4e7` | `#27272a` |
| `--color-border-focus` | `#10b981` | `#34d399` |

#### Brand (`--color-brand-*`)

Los colores de marca usan la paleta esmeralda de Tailwind adaptada a cada tema para mantener contraste adecuado. Con los flavors, `--brand` cambia según `data-theme-flavor`.

#### Estados (`--color-status-*`)

Success, warning, error, info — cada uno con su variante de fondo (`-bg`).

#### Scrollbar (`--color-scrollbar-*`)

Personalización completa del scrollbar que respeta el tema activo.

---

## API del Theme Store

### Tipos

```typescript
type ThemeMode = 'light' | 'dark' | 'auto';
type ThemeFlavor = 'emerald' | 'ocean' | 'sunset' | 'onyx';
```

### Atoms

| Atom | Tipo | Descripción |
|------|------|-------------|
| `$themeMode` | `Atom<ThemeMode>` | Modo actual (persistido) |
| `$themeFlavor` | `Atom<ThemeFlavor>` | Flavor actual (persistido) |
| `$systemPreference` | `Atom<'light' \| 'dark'>` | Preferencia del sistema (reactiva) |

### Computed

| Computed | Tipo | Descripción |
|----------|------|-------------|
| `$resolvedMode` | `Computed<'light' \| 'dark'>` | Modo resuelto (nunca 'auto') |
| `$isDark` | `Computed<boolean>` | `true` si el modo resuelto es dark |
| `$isLight` | `Computed<boolean>` | `true` si el modo resuelto es light |
| `$flavorName` | `Computed<string>` | Nombre legible del flavor (ej. "Esmeralda") |
| `$themeDisplayName` | `Computed<string>` | Nombre combinado (ej. "Océano (Oscuro)") |

### Acciones

| Función | Firma | Descripción |
|---------|-------|-------------|
| `setThemeMode(mode)` | `(mode: ThemeMode) => void` | Establece el modo, persiste y aplica al DOM |
| `toggleThemeMode()` | `() => void` | Cicla: auto → light → dark → light → ... |
| `followSystemTheme()` | `() => void` | Equivale a `setThemeMode('auto')` |
| `setThemeFlavor(flavor)` | `(flavor: ThemeFlavor) => void` | Establece el flavor, persiste y aplica al DOM |
| `cycleThemeFlavor()` | `() => void` | Cicla: emerald → ocean → sunset → onyx → emerald → ... |
| `applyThemeToDom(mode, flavor)` | `(mode: ThemeMode, flavor: ThemeFlavor) => void` | Aplica el tema al DOM |
| `initTheme()` | `() => void` | Inicializa el sistema (leer stored, aplicar, watch, shortcut) |
| `watchSystemTheme()` | `() => void` | Escucha cambios de `prefers-color-scheme` |
| `unwatchSystemTheme()` | `() => void` | Detiene la escucha |
| `registerFlavorShortcut()` | `() => void` | Registra Ctrl+Shift+F para ciclar flavors |

### Persistencia

- **Keys en localStorage:** `campfit_theme_mode` y `campfit_theme_flavor`
- **Key legacy (v1):** `campfit_theme` — se migra automáticamente en `readStoredMode()` y en el script AFOWT
- **Valores válidos modo:** `'light' | 'dark' | 'auto'`
- **Valores válidos flavor:** `'emerald' | 'ocean' | 'sunset' | 'onyx'`
- **Default modo:** `'dark'` (si no hay valor almacenado)
- **Default flavor:** `'onyx'` (Fénix Dorado)
- **SSR Safety:** Todas las funciones verifican `typeof window !== 'undefined'`
- **Error handling:** Si localStorage falla (cuota excedida, privacidad), el tema sigue funcionando en memoria.

### Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl+Shift+T` | Alterna el modo de tema (ThemeToggle) |
| `Ctrl+Shift+F` | Cicla los flavors (registerFlavorShortcut) |

### Aliases Backward-compatibles (deprecados)

| Alias | Reemplazo |
|-------|-----------|
| `$theme` | `$themeMode` |
| `$resolvedTheme` | `$resolvedMode` |
| `setTheme()` | `setThemeMode()` |
| `toggleTheme()` | `toggleThemeMode()` |
| `type Theme` | `ThemeMode` |

---

## Scripts y Testing

### Validación del Sistema

```bash
# Validar integridad del sistema de temas
npm run theme:validate
```

El script verifica:
1. ✅ Todos los archivos del sistema existen
2. ✅ Cada token de color está definido en ambos temas
3. ✅ No hay tokens "huérfanos" (solo en un tema)
4. ✅ BaseLayout.astro importa theme.css correctamente
5. ✅ Las clases semánticas se usan en BaseLayout
6. ✅ El store exporta todas las funciones esperadas

### Tests Unitarios

```bash
# Ejecutar tests del theme store
npm test -- tests/unit/stores/themeStore.test.ts

# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

**Cobertura de tests del themeStore (32+ tests):**
- Atoms y valores por defecto
- Computed stores ($isDark, $isLight, $resolvedMode, $flavorName, $themeDisplayName)
- setThemeMode() con persistencia y DOM
- toggleThemeMode() y su idempotencia
- setThemeFlavor() y cycleThemeFlavor()
- followSystemTheme() / modo 'auto'
- watchSystemTheme() / unwatchSystemTheme()
- initTheme()
- applyThemeToDom()
- Migración de key legacy (campfit_theme → campfit_theme_mode)
- Edge cases (localStorage no disponible, errores de cuota)
- Type safety

### CI/CD

```bash
# Validación completa para CI
npm run test:ci && npm run theme:validate
```

---

## Guía para Agentes (AI)

> **Esta sección está diseñada para agentes de IA que trabajen en el proyecto CampFit.**

### Cuando recibas una tarea relacionada con "theme", "tema", "oscuro", "claro", "dark mode", "light mode", "flavor", "auto-theme"...

### Paso 1: Evaluar el estado actual

```bash
npm run theme:validate
```

Esto te dará una puntuación del 0-100% sobre la salud del sistema de temas.

### Paso 2: Revisar los archivos clave

1. **`src/styles/theme.css`** — El source of truth de los tokens de color por flavor. Cualquier cambio en colores DEBE hacerse aquí.
2. **`src/layouts/BaseLayout.astro`** — Define los tokens v2 (`--brand`, `--surface-*`, `--accent-*`, motion system) y el script AFOWT.
3. **`src/stores/themeStore.ts`** — La lógica de negocio del tema (modo + flavor). Cambios en comportamiento van aquí.
4. **`src/components/ThemeToggle.astro`** — El botón de toggle. Cambios en UI del toggle van aquí.

### Paso 3: Reglas de oro

1. **NUNCA hardcodees colores en componentes.** Usa siempre `var(--color-*)` o las clases semánticas `.theme-*`.
2. **Si añades un nuevo token de color**, debe definirse en **ambos temas** (light y dark) y para **todos los flavors** si es de marca.
3. **Después de cualquier cambio en el tema**, ejecuta `npm run theme:validate` para verificar consistencia.
4. **Si modificas `themeStore.ts`**, actualiza también `tests/unit/stores/themeStore.test.ts`.
5. **Si añades nuevos tokens**, documéntalos en este archivo (`docs/THEME.md`).
6. **NUNCA elimines** los aliases backward-compatibles (`$theme`, `setTheme`, etc.) sin migrar todos los usos.

### Paso 4: Checklist para cambios en el tema

- [ ] ¿El cambio está en `theme.css` o `BaseLayout.astro` (tokens CSS)?
- [ ] ¿Está definido el token tanto en light como en dark?
- [ ] ¿Usa contraste suficiente (WCAG AA mínimo)?
- [ ] ¿Se ha ejecutado `npm run theme:validate`? ¿Pasa al 100%?
- [ ] ¿Se han actualizado/creado tests unitarios?
- [ ] ¿Se ha actualizado esta documentación?
- [ ] ¿Los componentes existentes siguen funcionando en ambos temas y flavors?

### Cómo añadir un nuevo color al tema

```css
/* 1. Añadir en :root/[data-theme-mode="light"] */
:root,
[data-theme-mode='light'] {
  --color-mi-nuevo-color: #valor-light;
}

/* 2. Añadir en [data-theme-mode="dark"] */
[data-theme-mode='dark'] {
  --color-mi-nuevo-color: #valor-dark;
}

/* 3. (Opcional) Crear clase utilitaria */
.theme-mi-nuevo-color {
  color: var(--color-mi-nuevo-color);
}
```

---

## FAQ y Troubleshooting

### ¿Por qué no se aplica el tema al cambiar?

1. Verifica que `BaseLayout.astro` importa `theme.css` con `@import '../styles/theme.css';`
2. Verifica que el script AFOWT está presente en `<body>`.
3. Abre DevTools: ¿`<html>` tiene los atributos `data-theme-mode` y `data-theme-flavor`?
4. Revisa localStorage: ¿existen las keys `campfit_theme_mode` y `campfit_theme_flavor`?

### ¿Por qué hay un "flash" del tema incorrecto al cargar?

El script AFOWT debe ser **inline** y debe ejecutarse **antes** de cualquier renderizado. Si lo moviste a un archivo externo o usas `defer`/`async`, ocurrirá el flash.

### ¿Cómo cambio el tema por defecto?

En `src/stores/themeStore.ts`, cambia el fallback en `readStoredMode()`:
```typescript
function readStoredMode(): ThemeMode {
  // ...
  return 'dark'; // ← cambia a 'light' si quieres light por defecto
}
```

### ¿Cómo funciona el modo "auto"?

El modo `'auto'` sigue la preferencia del sistema (`prefers-color-scheme`). `$systemPreference` se actualiza reactivamente y `watchSystemTheme()` escucha cambios. Cuando el modo es `'auto'`, `$resolvedMode` devuelve la preferencia del sistema.

### ¿Cómo añado un nuevo flavor?

1. Añadir el valor al tipo `ThemeFlavor` en `themeStore.ts`
2. Añadir entradas en `FLAVOR_NAMES` y `FLAVOR_COLORS`
3. Añadir los colores del flavor en `theme.css` (light y dark)
4. Añadir el flavor al array en `cycleThemeFlavor()`
5. Añadir colores dark/light en `applyThemeToDom()` (meta theme-color)
6. Actualizar tests y esta documentación

---

## Roadmap

- [x] Sistema base de temas light/dark con CSS variables
- [x] Store reactiva con Nanostores
- [x] Componente ThemeToggle accesible
- [x] Script de validación automatizado
- [x] Tests unitarios completos
- [x] Documentación centralizada
- [x] Auto Theme (preferencia del sistema)
- [x] Transiciones suaves entre temas
- [x] prefers-reduced-motion global
- [x] Skip-to-content link
- [x] Focus trap en modales
- [x] Atajo de teclado Ctrl+Shift+T
- [x] role="switch" en ThemeToggle
- [x] Accesibilidad WCAG 2.1 AA
- [x] **Flavors de color** (emerald, ocean, sunset, onyx)
- [x] **Atajo Ctrl+Shift+F** para ciclar flavors
- [ ] Tests e2e con Playwright para el toggle
- [ ] Paleta de colores ampliada (más variantes)
- [ ] Más flavors (ej. violet, rose)

---

## 📊 Métricas del Sistema

| Métrica | Valor |
|---------|-------|
| Total archivos Astro | 44 |
| Archivos migrados | **41** |
| Archivos sin hardcodeos | 3 (Icon, BaseLayout meta, etc.) |
| Hardcodeos detectados | **0** |
| Tests totales | **400+** ✅ |
| Tests theme store | **32+** ✅ |
| Tests nuevos componentes | **32** ✅ |
| Validación | **7/7 (100%)** |
| Accesibilidad | ✅ docs/ACCESIBILIDAD.md |
| Modos soportados | light, dark, auto |
| Flavors soportados | emerald, ocean, sunset, onyx |

---

## 🛠️ Cómo verificar

```bash
npm run theme:validate   # 7 checks de integridad
npm run theme:test       # 32+ tests del theme store (incluye auto-theme y flavors)
npm run theme:check      # Validación + tests
npm test                 # Tests unitarios completos
```

Si algún agente introduce nuevas clases hardcodeadas, el validador las detectará y mostrará:
```
❌ Detección de hardcodeos en Astro
   N clases hardcodeadas encontradas. Ejecuta: npx tsx scripts/migrate-theme.ts
```

---

**Documento creado:** 2026-07-25  
**Última actualización:** 2026-08-03  
**Mantenido por:** Equipo CampFit