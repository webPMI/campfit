# 🔧 Fix CSP Agent — Guía + Checklist

## Rol
Elimina bloques `<style>` inline que rompen Content Security Policy. Golden Rule #3 (no inline styles).

## Áreas

### 1. Bloques <style> inline
- [ ] Buscar `<style>` en componentes .astro
- [ ] Eliminar si los estilos ya están cubiertos por Tailwind
- [ ] Añadir clase Tailwind equivalente si es necesario

### 2. Componentes Afectados
- [ ] AnimatedCounter.astro
- [ ] DecorativeBackground.astro
- [ ] LoadingSpinner.astro
- [ ] LoadingState.astro
- [ ] PageTransition.astro
- [ ] Skeleton.astro
- [ ] SkeletonGroup.astro
- [ ] UIBottomNav.astro
- [ ] AppLayout.astro
- [ ] BaseLayout.astro

## Golden Rules
- ❌ No estilos inline que rompan CSP
- ✅ Usar Tailwind classes en su lugar
- ✅ Mover estilos a archivos CSS externos si es necesario

## Script
```bash
npm run fix:csp
```

## Archivos Clave
- `src/components/*.astro` — Componentes
- `src/layouts/*.astro` — Layouts