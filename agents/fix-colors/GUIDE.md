# 🔧 Fix Colors Agent — Guía + Checklist

## Rol
Reemplaza colores hardcodeados con tokens del theme system. Golden Rule #3.

## Áreas

### 1. Google Brand Colors
- [ ] `#4285F4` → `bg-blue-500`
  - [ ] Subpaso: Buscar: `grep -rn "#4285F4\|#4285f4" src/ --include="*.astro" --include="*.ts"`
  - [ ] Subpaso: ⚠️ Solo reemplazar en botones de login Google (NO en otros contextos)
- [ ] `#34A853` → `bg-green-500`
  - [ ] Subpaso: Buscar: `grep -rn "#34A853\|#34a853" src/ --include="*.astro"`
- [ ] `#FBBC05` → `bg-yellow-500`
  - [ ] Subpaso: Buscar: `grep -rn "#FBBC05\|#fbbc05" src/ --include="*.astro"`
- [ ] `#EA4335` → `bg-red-500`
  - [ ] Subpaso: Buscar: `grep -rn "#EA4335\|#ea4335" src/ --include="*.astro"`

### 2. Hex Colors Genéricos
- [ ] `#0a0f0d` → `bg-surface`
  - [ ] Subpaso: Buscar: `grep -rn "#0a0f0d" src/ --include="*.astro" --include="*.ts"`
- [ ] `#00e676` → `text-green-400`
  - [ ] Subpaso: Buscar: `grep -rn "#00e676" src/ --include="*.astro"`
- [ ] `#1a1a1a` → `bg-surface`
  - [ ] Subpaso: Buscar: `grep -rn "#1a1a1a" src/ --include="*.astro"`
- [ ] `#ffffff` → `text-white`
  - [ ] Subpaso: Buscar: `grep -rn "#ffffff\|#fff" src/ --include="*.astro"`
  - [ ] Subpaso: ⚠️ Verificar contexto — `#fff` puede ser parte de gradientes
- [ ] `#10b981` → `text-emerald-400`
  - [ ] Subpaso: Buscar: `grep -rn "#10b981" src/ --include="*.astro"`
- [ ] `#06b6d4` → `text-cyan-400`
  - [ ] Subpaso: Buscar: `grep -rn "#06b6d4" src/ --include="*.astro"`
- [ ] `#0f1117` → `bg-surface`
  - [ ] Subpaso: Buscar: `grep -rn "#0f1117" src/ --include="*.astro"`

### 3. Zinc Classes
- [ ] `bg-zinc-900` → `bg-surface`
  - [ ] Subpaso: Buscar: `grep -rn "bg-zinc-900" src/ --include="*.astro"`
- [ ] `text-zinc-400` → `text-content-secondary`
  - [ ] Subpaso: Buscar: `grep -rn "text-zinc-400" src/ --include="*.astro"`
- [ ] `text-zinc-100` → `text-content`
  - [ ] Subpaso: Buscar: `grep -rn "text-zinc-100" src/ --include="*.astro"`

### 4. Verificación final (⬅️ NUEVO)
- [ ] Buscar colores restantes: `grep -rn "#[0-9a-fA-F]\{3,8\}" src/ --include="*.astro" | grep -v "var(--"`
- [ ] Verificar que los tokens usados existen en `public/theme-tokens.css`
- [ ] Verificar: `npm run type-check` — no debe introducir errores
- [ ] Verificar: `npm run build` — el CSS debe compilar sin errores

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