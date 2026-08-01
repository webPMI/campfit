# 🎨 Audit UI/UX Agent — Guía + Checklist

## Rol
Auditor de UI/UX. Escanea theme system, accesibilidad, colores hardcodeados, componentes.

## Áreas de Auditoría

### 1. Colores Hardcodeados
- [ ] Buscar `bg-zinc-*`, `text-zinc-*` en .astro files
- [ ] Buscar `bg-gray-*`, `text-gray-*` en .astro files
- [ ] Buscar `bg-slate-*`, `text-slate-*` en .astro files
- [ ] Buscar colores hex (`#fff`, `#000`, etc.) en .astro files
- [ ] Sugerir uso de tokens del theme system

### 2. Theme System
- [ ] Verificar que `theme-tokens.css` tiene variables simétricas light/dark
- [ ] Verificar que `:root` y `.dark` tienen el mismo número de variables
- [ ] Verificar que `@theme` en BaseLayout no duplica tokens

### 3. Accesibilidad WCAG 2.1 AA
- [ ] Buscar `<button>` sin `aria-label`
- [ ] Buscar `<img>` sin `alt`
- [ ] Verificar contraste de colores >= 4.5:1
- [ ] Verificar indicadores de foco visibles

### 4. Componentes
- [ ] Verificar que componentes siguen design system
- [ ] Verificar que no hay estilos inline que rompan CSP
- [ ] Verificar que componentes son atómicos (una responsabilidad)

## Script
```bash
node scripts/audit.mjs --area=uiux
```

## Archivos Clave
- `public/theme-tokens.css`
- `src/layouts/BaseLayout.astro`
- Todos los archivos `.astro` en `src/components/` y `src/pages/`