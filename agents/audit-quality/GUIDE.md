# 📏 Audit Quality Agent — Guía + Checklist

## Rol
Auditor de calidad de código. Escanea TypeScript types, file sizes, console.*, window.__, any.

## Áreas de Auditoría

### 1. Tipado TypeScript (Golden Rule #1)
- [ ] Buscar uso de `any` en src/ (excluyendo tests y .d.ts)
- [ ] Verificar que props de componentes están tipadas
- [ ] Verificar que returns de funciones están tipados
- [ ] Verificar que eventos están tipados

### 2. Tamaño de Archivos (Golden Rule #9)
- [ ] Buscar archivos > 300 líneas en src/
- [ ] Marcar archivos > 500 líneas como críticos
- [ ] Sugerir refactorización de archivos grandes

### 3. Logging (Golden Rule #7)
- [ ] Buscar `console.log/error/warn` en src/ (no en logger files)
- [ ] Verificar que se usa logger estructurado
- [ ] Verificar que logger tiene contexto

### 4. Estado Global (Golden Rule #6)
- [ ] Buscar `window.__*` asignaciones en src/
- [ ] Verificar que stores no se mutan directamente
- [ ] Sugerir event delegation con data-attributes

### 5. CSP y Styles
- [ ] Buscar `<style>` inline en .astro files
- [ ] Verificar que no hay estilos que rompan CSP
- [ ] Sugerir mover estilos a CSS externos

## Script
```bash
node scripts/audit.mjs --area=quality
```

## Archivos Clave
- Todos los archivos `.ts` y `.astro` en `src/`
- `src/lib/debug/consoleFileLogger.ts` (excluido del scan de console.*)