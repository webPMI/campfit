## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## 🎨 Theme System (CRÍTICO — Leer antes de tocar estilos)

**Regla de oro: NUNCA uses clases de color hardcodeadas de Tailwind en componentes Astro.**

```astro
<!-- ❌ PROHIBIDO — Rompe el tema oscuro/claro -->
<div class="bg-zinc-900 text-zinc-100 border-zinc-800">

<!-- ✅ CORRECTO — Usa las clases semánticas del tema -->
<div class="theme-surface theme-text-primary theme-border">
```

### Clases semánticas disponibles (definidas en `src/styles/theme.css`):

| Clase | Cuándo usarla |
|---|---|
| `theme-bg-primary` / `theme-bg-secondary` / `theme-bg-elevated` | Fondos de página/cards |
| `theme-bg-gradient` | Gradiente de fondo principal |
| `theme-surface` / `theme-surface-secondary` / `theme-surface-hover` | Cards, paneles, inputs |
| `theme-text-primary` / `theme-text-secondary` / `theme-text-tertiary` | Jerarquía de texto |
| `theme-text-brand` / `theme-text-error` / `theme-text-success` | Texto de marca/estado |
| `theme-border` / `theme-border-strong` / `theme-border-focus` | Bordes |
| `theme-brand` | Botones/fondos con color de marca |
| `theme-scrollbar` | Scrollbars personalizadas |

### Cómo verificar que todo está bien:

```bash
npm run theme:validate   # Valida integridad del sistema (100% = OK)
npm run theme:test       # 25 tests unitarios del theme store
npm run theme:check      # Validación + tests (útil antes de commit)
```

### Si necesitas un color que no existe:

1. **NUNCA** pongas `bg-zinc-800` o `text-white` en un componente
2. Ve a `src/styles/theme.css` y añade el token en AMBOS temas (light y dark)
3. Si es nuevo, crea una clase utilitaria `.theme-mi-color`
4. Ejecuta `npm run theme:validate` para verificar que los tokens están sincronizados
5. Si no estás seguro, consulta `docs/THEME.md`

### Si encuentras hardcodeos:

```bash
npx tsx scripts/migrate-theme.ts --dry-run   # Ver hardcodeos sin modificar
npx tsx scripts/migrate-theme.ts             # Migrar automáticamente
```

### Estructura de archivos del tema:

| Archivo | Propósito |
|---|---|
| `src/styles/theme.css` | Fuente única de verdad — tokens CSS |
| `src/stores/themeStore.ts` | Estado reactivo (Nanostores) |
| `src/components/ThemeToggle.astro` | Botón toggle + Ctrl+Shift+T |
| `docs/THEME.md` | Documentación completa |

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)