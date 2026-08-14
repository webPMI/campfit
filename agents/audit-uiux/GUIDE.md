# 🎨 Audit UI/UX Agent — Guía + Checklist

## Rol
Auditor de UI/UX. Escanea theme system, accesibilidad, colores hardcodeados, componentes.

## Áreas de Auditoría

### 1. Colores Hardcodeados
- [ ] Buscar `bg-zinc-*`, `text-zinc-*` en .astro files
  - [ ] Subpaso: `grep -rn "bg-zinc-\|text-zinc-" src/ --include="*.astro"`
  - [ ] Subpaso: Anotar archivo, línea y clase
- [ ] Buscar `bg-gray-*`, `text-gray-*` en .astro files
  - [ ] Subpaso: `grep -rn "bg-gray-\|text-gray-" src/ --include="*.astro"`
  - [ ] Subpaso: Anotar archivo, línea y clase
- [ ] Buscar `bg-slate-*`, `text-slate-*` en .astro files
  - [ ] Subpaso: `grep -rn "bg-slate-\|text-slate-" src/ --include="*.astro"`
  - [ ] Subpaso: Anotar archivo, línea y clase
- [ ] Buscar colores hex (`#fff`, `#000`, etc.) en .astro files
  - [ ] Subpaso: `grep -rn "#[0-9a-fA-F]\{3,8\}" src/ --include="*.astro" | grep -v "var(--"`
  - [ ] Subpaso: Anotar archivo, línea y color
- [ ] Sugerir uso de tokens del theme system
  - [ ] Subpaso: Para cada color, sugerir el token equivalente (`--brand`, `--surface-*`, `--text-*`)
  - [ ] Subpaso: Verificar que el token existe en `public/theme-tokens.css`

### 2. Theme System
- [ ] Verificar que `theme-tokens.css` tiene variables simétricas light/dark
  - [ ] Subpaso: `awk '/:root/{flag=1;next}/\.dark/{flag=0}flag' public/theme-tokens.css | grep -c "^\s*--"`
  - [ ] Subpaso: `awk '/\.dark/{flag=1;next}/^\}/{flag=0}flag' public/theme-tokens.css | grep -c "^\s*--"`
  - [ ] Subpaso: Comparar conteos — deben ser iguales
- [ ] Verificar que `:root` y `.dark` tienen el mismo número de variables
  - [ ] Subpaso: `comm -3 <(grep -oP "^\s*--[a-z0-9-]+" public/theme-tokens.css | sort -u) <(grep -oP "^\s*--[a-z0-9-]+" public/theme-tokens.css | sort -u)` — verificar asimetrías
- [ ] Verificar que `@theme` en BaseLayout no duplica tokens
  - [ ] Subpaso: `grep -n "@theme" src/layouts/BaseLayout.astro`
  - [ ] Subpaso: Verificar que no redefine tokens ya definidos en `theme-tokens.css`

### 3. Accesibilidad WCAG 2.1 AA
- [ ] Buscar `<button>` sin `aria-label`
  - [ ] Subpaso: `grep -rn "<button" src/ --include="*.astro" | grep -v "aria-label"`
  - [ ] Subpaso: Anotar botones sin aria-label (especialmente icon-only)
- [ ] Buscar `<img>` sin `alt`
  - [ ] Subpaso: `grep -rn "<img" src/ --include="*.astro" | grep -v "alt="`
  - [ ] Subpaso: Anotar imágenes sin alt
- [ ] Verificar contraste de colores >= 4.5:1
  - [ ] Subpaso: Verificar que `--text-primary` vs `--surface-1` tienen contraste suficiente
  - [ ] Subpaso: Verificar que `--text-tertiary` no es demasiado claro en dark mode
- [ ] Verificar indicadores de foco visibles
  - [ ] Subpaso: `grep -rn "focus:" src/ --include="*.astro" | head -20`
  - [ ] Subpaso: Verificar que los elementos interactivos tienen `focus:ring` o `focus:outline`

### 4. Componentes
- [ ] Verificar que componentes siguen design system
  - [ ] Subpaso: Verificar que usan tokens (`var(--...)`) en lugar de colores hardcodeados
  - [ ] Subpaso: Verificar que usan clases Tailwind consistentes
- [ ] Verificar que no hay estilos inline que rompan CSP
  - [ ] Subpaso: `grep -rn "<style" src/ --include="*.astro" | grep -v "is:global"`
  - [ ] Subpaso: Anotar bloques `<style>` no-global
- [ ] Verificar que componentes son atómicos (una responsabilidad)
  - [ ] Subpaso: Verificar que cada componente en `src/components/` tiene una sola responsabilidad
  - [ ] Subpaso: Anotar componentes que mezclan lógica de negocio con renderizado

## Script
```bash
node scripts/audit.mjs --area=uiux
```

## Archivos Clave
- `public/theme-tokens.css`
- `src/layouts/BaseLayout.astro`
- Todos los archivos `.astro` en `src/components/` y `src/pages/`