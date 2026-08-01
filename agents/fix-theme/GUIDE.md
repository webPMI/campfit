# 🔧 Fix Theme Agent — Guía + Checklist

## Rol
Sincroniza variables CSS entre :root (light) y .dark mode. Golden Rule #3 (design system).

## Áreas

### 1. Variables Light/Dark
- [ ] Verificar :root tiene variables CSS
- [ ] Verificar .dark tiene las mismas variables
- [ ] Sincronizar si están asimétricas (95 vs 0)

### 2. Theme Tokens
- [ ] Verificar que `theme-tokens.css` tiene variables simétricas
- [ ] Añadir variables faltantes en .dark

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