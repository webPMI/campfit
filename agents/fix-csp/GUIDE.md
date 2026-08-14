# 🔧 Fix CSP Agent — Guía + Checklist

## Rol
Elimina bloques `<style>` inline que rompen Content Security Policy. Golden Rule #3 (no inline styles).

## Áreas

### 1. Bloques <style> inline
- [ ] Buscar `<style>` en componentes .astro
  - [ ] Subpaso: `grep -rn "<style" src/ --include="*.astro"`
  - [ ] Subpaso: Anotar archivo y líneas de cada bloque `<style>`
  - [ ] Subpaso: Verificar si el bloque es `is:global` (permite estilos globales de Astro)
- [ ] Eliminar si los estilos ya están cubiertos por Tailwind
  - [ ] Subpaso: Verificar que las clases Tailwind equivalentes existen en el componente
  - [ ] Subpaso: Si existe equivalencia, eliminar el bloque `<style>` y usar las clases
- [ ] Añadir clase Tailwind equivalente si es necesario
  - [ ] Subpaso: Convertir cada regla CSS a clases Tailwind equivalentes
  - [ ] Subpaso: Añadir las clases al componente
  - [ ] Subpaso: Verificar visualmente que no cambia el diseño

### 2. Componentes Afectados
- [ ] AnimatedCounter.astro
  - [ ] Subpaso: Verificar si tiene `<style>` — si no, marcar como OK
- [ ] DecorativeBackground.astro
  - [ ] Subpaso: Verificar si tiene `<style>` — si no, marcar como OK
- [ ] LoadingSpinner.astro
  - [ ] Subpaso: Verificar si tiene `<style>` — si no, marcar como OK
- [ ] LoadingState.astro
  - [ ] Subpaso: Verificar si tiene `<style>` — si no, marcar como OK
- [ ] PageTransition.astro
  - [ ] Subpaso: Verificar si tiene `<style>` — si no, marcar como OK
- [ ] Skeleton.astro
  - [ ] Subpaso: Verificar si tiene `<style>` — si no, marcar como OK
- [ ] SkeletonGroup.astro
  - [ ] Subpaso: Verificar si tiene `<style>` — si no, marcar como OK
- [ ] UIBottomNav.astro
  - [ ] Subpaso: Verificar si tiene `<style>` — si no, marcar como OK
- [ ] AppLayout.astro
  - [ ] Subpaso: Verificar si tiene `<style>` — si no, marcar como OK
- [ ] BaseLayout.astro
  - [ ] Subpaso: Verificar si tiene `<style>` — si no, marcar como OK

### 3. Casos límite (⬅️ NUEVO)
- [ ] **Estilos con `is:global`**: Son aceptables — Astro los procesa y los extrae a CSS externo
- [ ] **Estilos con animaciones/keyframes**: Mover a archivo CSS externo en `src/styles/`
- [ ] **Estilos con pseudo-elementos**: Verificar si Tailwind cubre (`before:`, `after:`)
- [ ] **NO eliminar estilos funcionales**: Si una animación no tiene equivalente Tailwind, moverla a CSS externo
- [ ] **Verificación final**: `grep -rn "<style" src/ --include="*.astro"` — solo deben quedar `is:global` o ninguno

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