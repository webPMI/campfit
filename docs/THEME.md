# 🎨 CampFit Design System — Sistema de Temas

> **Última actualización:** 2026-07-25  
> **Propietario:** Equipo CampFit  
> **Archivos clave:** `src/styles/theme.css`, `src/stores/themeStore.ts`, `src/components/ThemeToggle.astro`

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
│  CAPA 1: CSS Variables (theme.css)              │
│  Define los tokens de diseño para ambos temas.  │
│  [data-theme="light"] ↔ [data-theme="dark"]    │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  CAPA 2: Nanostores (themeStore.ts)             │
│  Estado reactivo, persistencia en localStorage, │
│  acciones para cambiar/alternar el tema.        │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  CAPA 3: UI Components                          │
│  ThemeToggle.astro, clases utilitarias          │
│  semánticas (.theme-bg, .theme-text, etc.)      │
└─────────────────────────────────────────────────┘
```

### Flujo de Cambio de Tema

```
Usuario hace clic en ThemeToggle
  → toggleTheme() en themeStore.ts
    → $theme.set('light'|'dark')
    → persistTheme() → localStorage
    → applyThemeToDom() → document.documentElement.setAttribute('data-theme', ...)
      → CSS aplica las variables correspondientes
      → Toda la UI se actualiza instantáneamente
```

### Anti-Flash-of-Wrong-Theme (AFOWT)

Para prevenir el "flash" del tema incorrecto al cargar la página, se ejecuta un script **inline y síncrono** en `<body>` de `BaseLayout.astro` que lee `localStorage` y aplica `data-theme` **antes** de que el navegador renderice cualquier contenido.

```html
<script is:inline>
  (function() {
    try {
      var theme = localStorage.getItem('campfit_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', theme);
    } catch(e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
</script>
```

---

## Archivos del Sistema

| Archivo | Propósito | Tipo |
|---|---|---|
| `src/styles/theme.css` | **Fuente única de verdad** para todos los tokens de diseño. Define variables CSS para light y dark. | CSS |
| `src/stores/themeStore.ts` | Estado reactivo del tema con Nanostores. Persistencia, acciones, sincronización DOM. | TypeScript |
| `src/components/ThemeToggle.astro` | Botón accesible de toggle tema. Soportado por teclado (Ctrl+Shift+T). | Astro |
| `src/layouts/BaseLayout.astro` | Layout base que importa `theme.css` y contiene el script AFOWT. | Astro |
| `tests/unit/stores/themeStore.test.ts` | Tests unitarios exhaustivos para themeStore. | TypeScript/Vitest |
| `scripts/validate-theme.ts` | Script de validación de integridad del sistema de temas. | TypeScript |
| `docs/THEME.md` | Esta documentación. | Markdown |

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
|---|---|
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
import { $theme, $isDark, setTheme, toggleTheme } from '@/stores/themeStore';

// Leer el tema actual
console.log($theme.get()); // 'dark' | 'light'

// Reaccionar a cambios
$theme.subscribe((theme) => {
  console.log('Tema cambiado a:', theme);
});

// Cambiar tema
setTheme('light');
toggleTheme(); // alterna entre dark/light

// Verificar si es oscuro
if ($isDark.get()) {
  // lógica para tema oscuro
}
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

#### Colores de Fondo (`--color-bg-*`)

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-bg-primary` | `#fafafa` | `#09090b` | Fondo de página |
| `--color-bg-secondary` | `#f4f4f5` | `#18181b` | Fondo secundario |
| `--color-bg-elevated` | `#ffffff` | `#1c1c1f` | Cards, modales |
| `--color-bg-gradient-start/mid/end` | Zinc claros | Zinc oscuros | Gradiente de página |

#### Colores de Texto (`--color-text-*`)

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-text-primary` | `#18181b` | `#fafafa` | Texto principal |
| `--color-text-secondary` | `#52525b` | `#a1a1aa` | Texto secundario |
| `--color-text-link` | `#059669` | `#34d399` | Enlaces |

#### Bordes (`--color-border-*`)

| Token | Light | Dark |
|---|---|---|
| `--color-border-default` | `#e4e4e7` | `#27272a` |
| `--color-border-focus` | `#10b981` | `#34d399` |

#### Brand (`--color-brand-*`)

Los colores de marca usan la paleta esmeralda de Tailwind adaptada a cada tema para mantener contraste adecuado.

#### Estados (`--color-status-*`)

Success, warning, error, info — cada uno con su variante de fondo (`-bg`).

#### Scrollbar (`--color-scrollbar-*`)

Personalización completa del scrollbar que respeta el tema activo.

---

## API del Theme Store

### Tipos

```typescript
type Theme = 'light' | 'dark';
```

### Atoms

| Atom | Tipo | Descripción |
|---|---|---|
| `$theme` | `Atom<Theme>` | Tema actual |
| `$resolvedTheme` | `Computed<Theme>` | Tema resuelto (para futura extensión 'auto') |
| `$isDark` | `Computed<boolean>` | `true` si el tema es dark |
| `$isLight` | `Computed<boolean>` | `true` si el tema es light |

### Acciones

| Función | Firma | Descripción |
|---|---|---|
| `setTheme(theme)` | `(theme: Theme) => void` | Establece el tema, persiste y aplica al DOM |
| `toggleTheme()` | `() => void` | Alterna entre light y dark |
| `initTheme()` | `() => void` | Inicializa el tema desde localStorage |
| `applyThemeToDom(theme)` | `(theme: Theme) => void` | Aplica el tema al DOM |

### Persistencia

- **Key en localStorage:** `campfit_theme`
- **Valores válidos:** `'light'` | `'dark'`
- **Default:** `'dark'` (si no hay valor almacenado)
- **SSR Safety:** Todas las funciones verifican `typeof window !== 'undefined'`
- **Error handling:** Si localStorage falla (cuota excedida, privacidad), el tema sigue funcionando en memoria.

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

**Cobertura de tests del themeStore:**
- Atoms y valores por defecto
- Computed stores ($isDark, $isLight, $resolvedTheme)
- setTheme() con persistencia y DOM
- toggleTheme() y su idempotencia
- initTheme()
- applyThemeToDom()
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

### Cuando recibas una tarea relacionada con "theme", "tema", "oscuro", "claro", "dark mode", "light mode"...

### Paso 1: Evaluar el estado actual

```bash
npm run theme:validate
```

Esto te dará una puntuación del 0-100% sobre la salud del sistema de temas.

### Paso 2: Revisar los archivos clave

1. **`src/styles/theme.css`** — El source of truth de todos los tokens. Cualquier cambio en colores DEBE hacerse aquí.
2. **`src/stores/themeStore.ts`** — La lógica de negocio del tema. Cambios en comportamiento van aquí.
3. **`src/components/ThemeToggle.astro`** — El botón de toggle. Cambios en UI del toggle van aquí.
4. **`src/layouts/BaseLayout.astro`** — El layout base. Asegúrate de que importa `theme.css`.

### Paso 3: Reglas de oro

1. **NUNCA hardcodees colores en componentes.** Usa siempre `var(--color-*)` o las clases semánticas `.theme-*`.
2. **Si añades un nuevo token de color**, debe definirse en **ambos temas** (light y dark).
3. **Después de cualquier cambio en el tema**, ejecuta `npm run theme:validate` para verificar consistencia.
4. **Si modificas `themeStore.ts`**, actualiza también `tests/unit/stores/themeStore.test.ts`.
5. **Si añades nuevos tokens**, documéntalos en este archivo (`docs/THEME.md`).

### Paso 4: Checklist para cambios en el tema

- [ ] ¿El cambio está en `theme.css` (tokens CSS)?
- [ ] ¿Está definido el token tanto en light como en dark?
- [ ] ¿Usa contraste suficiente (WCAG AA mínimo)?
- [ ] ¿Se ha ejecutado `npm run theme:validate`? ¿Pasa al 100%?
- [ ] ¿Se han actualizado/creado tests unitarios?
- [ ] ¿Se ha actualizado esta documentación?
- [ ] ¿Los componentes existentes siguen funcionando en ambos temas?

### Cómo añadir un nuevo color al tema

```css
/* 1. Añadir en :root/[data-theme="light"] */
:root,
[data-theme='light'] {
  --color-mi-nuevo-color: #valor-light;
}

/* 2. Añadir en [data-theme="dark"] */
[data-theme='dark'] {
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

1. Verifica que `BaseLayout.astro` importa `theme.css` con `@import '@/styles/theme.css';`
2. Verifica que el script AFOWT está presente en `<body>`.
3. Abre DevTools: ¿`<html>` tiene el atributo `data-theme`?
4. Revisa localStorage: ¿existe la key `campfit_theme`?

### ¿Por qué hay un "flash" del tema incorrecto al cargar?

El script AFOWT debe ser **inline** y debe ejecutarse **antes** de cualquier renderizado. Si lo moviste a un archivo externo o usas `defer`/`async`, ocurrirá el flash.

### ¿Cómo cambio el tema por defecto?

En `src/stores/themeStore.ts`, cambia el fallback en `readStoredTheme()`:
```typescript
function readStoredTheme(): Theme {
  // ...
  return 'dark'; // ← cambia a 'light' si quieres light por defecto
}
```

### ¿Puedo añadir un tema "auto" que siga la preferencia del sistema?

El store ya está preparado para esto. `$resolvedTheme` y `applyThemeToDom` existen para soportar temas adicionales en el futuro. Se necesitaría:
1. Añadir `'auto'` al tipo `Theme`
2. Usar `window.matchMedia('(prefers-color-scheme: dark)')` en `readStoredTheme()`
3. Escuchar cambios en la media query

---

## Roadmap

- [x] Sistema base de temas light/dark con CSS variables
- [x] Store reactiva con Nanostores
- [x] Componente ThemeToggle accesible
- [x] Script de validación automatizado
- [x] Tests unitarios completos
- [x] Documentación centralizada
- [ ] Tema "auto" (preferencia del sistema)
- [ ] Transiciones suaves entre temas
- [ ] Tests e2e con Playwright para el toggle
- [ ] Paleta de colores ampliada (más variantes)
- [ ] Integración con prefers-reduced-motion