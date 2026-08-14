# 🔧 Fix Theme Agent — Guía + Checklist

## Rol
Sincroniza variables CSS entre :root (light) y .dark mode. Golden Rule #3 (design system).

## Áreas

### 1. Variables Light/Dark
- [ ] Verificar :root tiene variables CSS
  - [ ] Subpaso: `grep -c "^\s*--" public/theme-tokens.css | head -1` o contar manualmente en la sección `:root`
  - [ ] Subpaso: `awk '/:root/{flag=1;next}/\.dark/{flag=0}flag' public/theme-tokens.css | grep -c "^\s*--"`
- [ ] Verificar .dark tiene las mismas variables
  - [ ] Subpaso: `awk '/\.dark/{flag=1;next}/^\}/{flag=0}flag' public/theme-tokens.css | grep -c "^\s*--"`
  - [ ] Subpaso: Comparar los dos conteos — deben ser iguales
- [ ] Sincronizar si están asimétricas (95 vs 0)
  - [ ] Subpaso: Extraer nombres de variables: `grep -oP "^\s*--[a-z0-9-]+" public/theme-tokens.css | sort -u`
  - [ ] Subpaso: Comparar nombres en `:root` vs `.dark`: `comm -3 <(root_vars) <(dark_vars)`
  - [ ] Subpaso: Añadir las variables faltantes en `.dark` con valores apropiados para dark mode

### 2. Theme Tokens
- [ ] Verificar que `theme-tokens.css` tiene variables simétricas
  - [ ] Subpaso: Verificar que cada variable en `:root` tiene su contraparte en `.dark`
  - [ ] Subpaso: Verificar que los valores dark son realmente más oscuros (contraste adecuado)
- [ ] Añadir variables faltantes en .dark
  - [ ] Subpaso: Añadir la variable con el valor correspondiente al tema dark
  - [ ] Subpaso: Verificar: `npm run build` — el CSS debe compilar sin errores

### 3. Casos límite (⬅️ NUEVO)
- [ ] **Flavors**: Verificar que los flavors (`emerald/ocean/sunset/onyx`) también tienen vars symétricas
- [ ] **NO eliminar variables**: Solo añadir las faltantes — NUNCA eliminar variables existentes
- [ ] **NO renombrar tokens**: Mantener nombres existentes para no romper componentes
- [ ] **NO cambiar valores :root**: Solo añadir o corregir valores en `.dark`
- [ ] **Verificación visual**: Probar dark mode con `astro dev` y verificar contraste

## Golden Rules
- ❌ No temas asimétricos
- ✅ :root y .dark deben tener misma cantidad de variables
- ✅ Usar CSS custom properties para el theme

## Script
```bash
npm run fix:theme
```

## Archivos Clave
- `public/theme-tokens.css` — Tokens del theme