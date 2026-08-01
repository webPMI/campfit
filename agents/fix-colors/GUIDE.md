# 🔧 Fix Colors Agent — Guía + Checklist

## Rol
Reemplaza colores hardcodeados con tokens del theme system. Golden Rule #3.

## Áreas

### 1. Google Brand Colors
- [ ] `#4285F4` → `bg-blue-500`
- [ ] `#34A853` → `bg-green-500`
- [ ] `#FBBC05` → `bg-yellow-500`
- [ ] `#EA4335` → `bg-red-500`

### 2. Hex Colors Genéricos
- [ ] `#0a0f0d` → `bg-surface`
- [ ] `#00e676` → `text-green-400`
- [ ] `#1a1a1a` → `bg-surface`
- [ ] `#ffffff` → `text-white`
- [ ] `#10b981` → `text-emerald-400`
- [ ] `#06b6d4` → `text-cyan-400`
- [ ] `#0f1117` → `bg-surface`

### 3. Zinc Classes
- [ ] `bg-zinc-900` → `bg-surface`
- [ ] `text-zinc-400` → `text-content-secondary`
- [ ] `text-zinc-100` → `text-content`

## Golden Rules
- ❌ No hardcodear colores
- ✅ Usar tokens del theme system
- ✅ Mantener consistencia visual

## Script
```bash
npm run fix:colors
```

## Archivos Clave
- `src/**/*.astro` — Componentes y páginas
- `public/theme-tokens.css` — Tokens del theme