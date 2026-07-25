# Theme Agent Checklist

> **Checklist paso a paso para el Agente de Tema IA** - CampFit

---

## Pre-Task Setup

- [ ] Leer GUIDE.md para refrescar contexto del Design System
- [ ] Leer RULES.md para recordar reglas especificas
- [ ] Leer TASKS.md para identificar la tarea actual
- [ ] Verificar lock: bash scripts/agent-lock.sh check
- [ ] Adquirir lock: bash scripts/agent-lock.sh acquire theme-agent feature-name
- [ ] git pull origin master
- [ ] npm run doctor

---

## Analisis del Codigo

- [ ] Revisar componentes existentes en src/components/
  - [ ] ConfirmModal.astro
  - [ ] DecorativeBackground.astro
  - [ ] LanguageSwitcher.astro
  - [ ] Skeleton.astro
- [ ] Revisar layouts: BaseLayout, AdminLayout, ClientLayout, TrainerLayout, PublicPageLayout
- [ ] Revisar tokens @theme en BaseLayout.astro
- [ ] Revisar Design System en nuevo_proyecto/06_design_system.md

---

## Ejecucion de Cambios

### Tokens y Configuracion
- [ ] Migrar paleta completa a @theme: primary, secondary, bg-*, text-*, border-*, success/warning/danger/info
- [ ] Anadir JetBrains Mono como fuente de codigo
- [ ] Anadir prefers-reduced-motion global

### Nuevos Componentes (Alta Prioridad)
- [ ] Crear EmptyState.astro (icon, title, description, actionLabel?)
- [ ] Crear ErrorState.astro (message?, errorCode?, onRetry?)
- [ ] Crear LoadingSpinner.astro (size: sm|md|lg)

### TODO #12: Normalizar Iconos SVG (Icon.astro)
- [ ] Crear Icon.astro con 22+ iconos mapeados
- [ ] Migrar SVGs inline: ClientLayout(6), AdminLayout(8), TrainerLayout(6), PublicPageLayout(2), LanguageSwitcher(1), ConfirmModal(1)

### Mejoras de Accesibilidad
- [ ] role=dialog + aria-modal en ConfirmModal
- [ ] aria-label en LanguageSwitcher
- [ ] aria-busy en Skeleton
- [ ] Focus visible (ring-2) en botones e inputs
- [ ] Skip-to-content link en BaseLayout

### Componentes DS (Media Prioridad)
- [ ] Button.astro, Input.astro, Badge.astro, Select.astro, Switch.astro, Slider.astro
- [ ] StatCard.astro, ProgressBar.astro, AlertBanner.astro, Accordion.astro, TabBar.astro, Modal.astro

---

## Validacion Final

- [ ] npm run type-check sin errores
- [ ] Todos los componentes tienen JSDoc
- [ ] No hay SVGs inline manuales
- [ ] Colores usan tokens @theme
- [ ] Componentes responsive (mobile-first)
- [ ] Pasan WCAG 2.1 AA
- [ ] Textos usan i18n/props
- [ ] Animaciones respetan prefers-reduced-motion

---

## Finalizacion

- [ ] Liberar lock
- [ ] git commit -m feat(theme): ...
- [ ] git push origin master
- [ ] Actualizar TASKS.md

---

> **Mantenido por:** Theme Agent - CampFit