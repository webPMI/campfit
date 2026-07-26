# Theme Agent TASKS

> **Backlog de tareas del Design System y capa visual** - CampFit
> Ultima actualizacion: 2026-07-25

---

## Alta Prioridad

### TODO #12: Normalizar Iconos SVG (Icon.astro)
- [ ] Crear Icon.astro con mapeo de 22+ iconos
- [ ] Props: name, size(20), class. aria-hidden, focusable=false
- [ ] Migrar SVGs inline: ClientLayout(6), AdminLayout(8), TrainerLayout(6), PublicPageLayout(2), LanguageSwitcher(1), ConfirmModal(1)
- [ ] Tests: renderizado, props size y class

### Componentes Faltantes (4 Estados Visuales)
- [ ] EmptyState.astro: icon, title, description, actionLabel?, onAction?
- [ ] ErrorState.astro: message?, errorCode?, onRetry?, role=alert
- [ ] LoadingSpinner.astro: size(sm|md|lg), aria-busy, CSS puro

---

## Media Prioridad

### Tokens del Design System
- [ ] Migrar paleta completa a @theme
- [ ] Anadir JetBrains Mono
- [ ] Anadir prefers-reduced-motion

### Mejoras de Accesibilidad
- [ ] role=dialog + aria-modal en ConfirmModal
- [ ] aria-label en LanguageSwitcher
- [ ] aria-busy en Skeleton
- [ ] Skip-to-content link en BaseLayout
- [ ] Focus visible en botones e inputs
- [ ] Auditoria contraste WCAG 2.1 AA

### Componentes DS (Catalogo completo)
- [ ] Button.astro (5 variantes), Input.astro (4 estados)
- [ ] Badge.astro, Select.astro, Switch.astro, Slider.astro
- [ ] StatCard.astro, ProgressBar.astro, AlertBanner.astro
- [ ] Accordion.astro, TabBar.astro, Modal.astro, DataTable.astro

---

## Baja Prioridad

### Deuda Tecnica
- [ ] Limpiar SVGs inline residuales
- [ ] Estandarizar clases Tailwind entre componentes
- [ ] Documentar animaciones en GUIDE.md
- [ ] Crear catalogo visual de componentes
- [ ] Simplificar bottom nav bars en layouts

---

## Progreso General

| Area | Estado | Notas |
|-------|--------|-------|
| Skeleton.astro | Completado | 4 variantes |
| ConfirmModal.astro | Completado | Sin role=dialog |
| DecorativeBackground.astro | Completado | - |
| LanguageSwitcher.astro | Completado | Sin aria-label |
| EmptyState.astro | Pendiente | Alta prioridad |
| ErrorState.astro | Pendiente | Alta prioridad |
| LoadingSpinner.astro | Pendiente | Alta prioridad |
| Icon.astro (TODO #12) | Pendiente | Normalizar SVG |
| Tokens @theme completos | Pendiente | Solo emerald |
| Componentes DS (13) | Pendiente | Catalogo completo |
| Accesibilidad WCAG 2.1 AA | Parcial | ConfirmModal, LanguageSwitcher |
| Responsividad | Completado | Mobile-first |

---

## Referencias

- GUIDE.md - Contexto completo
- RULES.md - Reglas especificas
- CHECKLIST.md - Checklist paso a paso
- nuevo_proyecto/06_design_system.md - Documentacion DS original
- __master.md - Registro maestro de agentes

---

> **Mantenido por:** Theme Agent - CampFit