# 📏 Audit Quality Agent — Guía + Checklist

## Rol
Auditor de calidad de código. Escanea TypeScript types, file sizes, console.*, window.__, any.

## Áreas de Auditoría

### 1. Tipado TypeScript (Golden Rule #1)
- [ ] Buscar uso de `any` en src/ (excluyendo tests y .d.ts)
  - [ ] Subpaso: `grep -rn ": any\|as any\|<any>" src/ --include="*.ts" --include="*.astro" | grep -v "\.test\.ts" | grep -v "\.d\.ts"`
  - [ ] Subpaso: Anotar archivo, línea y contexto de cada uso
  - [ ] Subpaso: Clasificar: `: any` (declaración) vs `as any` (cast) vs `<any>` (genérico)
- [ ] Verificar que props de componentes están tipadas
  - [ ] Subpaso: `grep -rn "Astro.props" src/components/ --include="*.astro"`
  - [ ] Subpaso: Verificar que cada componente define `interface Props` o `type Props`
- [ ] Verificar que returns de funciones están tipados
  - [ ] Subpaso: `grep -rn "function.*{" src/lib/ --include="*.ts" | grep -v ":.*{"`
  - [ ] Subpaso: Verificar que cada función pública tiene tipo de retorno explícito
- [ ] Verificar que eventos están tipados
  - [ ] Subpaso: `grep -rn "addEventListener" src/ --include="*.ts" --include="*.astro"`
  - [ ] Subpaso: Verificar que los callbacks tipan el evento (`(e: Event)`, `(e: MouseEvent)`, etc.)

### 2. Tamaño de Archivos (Golden Rule #9)
- [ ] Buscar archivos > 300 líneas en src/
  - [ ] Subpaso: `find src/ -name "*.ts" -o -name "*.astro" | xargs wc -l | sort -rn | head -20`
  - [ ] Subpaso: Anotar archivos > 300 líneas
- [ ] Marcar archivos > 500 líneas como críticos
  - [ ] Subpaso: Priorizar refactorización de archivos > 500 líneas
  - [ ] Subpaso: Sugerir división en módulos más pequeños
- [ ] Sugerir refactorización de archivos grandes
  - [ ] Subpaso: Identificar funciones extraíbles
  - [ ] Subpaso: Sugerir archivos de destino (ej: `types.ts`, `utils.ts`, `render.ts`)

### 3. Logging (Golden Rule #7)
- [ ] Buscar `console.log/error/warn` en src/ (no en logger files)
  - [ ] Subpaso: `grep -rn "console\.\(log\|error\|warn\)" src/ --include="*.ts" --include="*.astro"`
  - [ ] Subpaso: Excluir `src/lib/debug/`, `src/lib/devtools/` y `src/lib/shared/logger.ts`
  - [ ] Subpaso: Anotar archivo, línea y tipo de console.*
- [ ] Verificar que se usa logger estructurado
  - [ ] Subpaso: `grep -rn "logger\.\(info\|warn\|error\)" src/ --include="*.ts" --include="*.astro"`
  - [ ] Subpaso: Verificar que los archivos con console.* importan logger
- [ ] Verificar que logger tiene contexto
  - [ ] Subpaso: Verificar que cada `logger.info/warn/error` tiene un string de contexto como primer argumento

### 4. Estado Global (Golden Rule #6)
- [ ] Buscar `window.__*` asignaciones en src/
  - [ ] Subpaso: `grep -rn "window\.__" src/ --include="*.ts" --include="*.astro"`
  - [ ] Subpaso: Verificar que no contienen datos sensibles
- [ ] Verificar que stores no se mutan directamente
  - [ ] Subpaso: `grep -rn "\.set(" src/stores/ --include="*.ts"`
  - [ ] Subpaso: Verificar que solo se usan setters exportados, no mutación directa
- [ ] Sugerir event delegation con data-attributes
  - [ ] Subpaso: Buscar `addEventListener` repetidos en loops
  - [ ] Subpaso: Sugerir delegación con `data-action` en el contenedor

### 5. CSP y Styles
- [ ] Buscar `<style>` inline en .astro files
  - [ ] Subpaso: `grep -rn "<style" src/ --include="*.astro"`
  - [ ] Subpaso: Verificar si son `is:global` (aceptables) o inline (rompen CSP)
- [ ] Verificar que no hay estilos que rompan CSP
  - [ ] Subpaso: Anotar archivos con `<style>` no-global
- [ ] Sugerir mover estilos a CSS externos
  - [ ] Subpaso: Sugerir `src/styles/` para estilos compartidos
  - [ ] Subpaso: Sugerir clases Tailwind para estilos de un solo uso

## Script
```bash
node scripts/audit.mjs --area=quality
```

## Archivos Clave
- Todos los archivos `.ts` y `.astro` en `src/`
- `src/lib/debug/consoleFileLogger.ts` (excluido del scan de console.*)