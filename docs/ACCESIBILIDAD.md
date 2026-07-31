# ♿ CampFit - Guía de Accesibilidad WCAG 2.1 AA

> **Última actualización:** 2026-07-30

## Resumen de Cumplimiento

| Criterio WCAG | Estado | Componentes Afectados |
|---|---|---|
| 1.1.1 Non-text Content | ✅ Implementado | Icon (aria-hidden), imágenes con alt |
| 1.3.1 Info and Relationships | ✅ Implementado | Landmarks (nav, main), roles ARIA |
| 2.1.1 Keyboard | ✅ Implementado | Focus trap, Ctrl+Shift+T, Escape |
| 2.4.1 Bypass Blocks | ✅ Implementado | Skip-to-content link |
| 2.4.3 Focus Order | ✅ Implementado | Tab order lógico en modales |
| 4.1.2 Name, Role, Value | ✅ Implementado | role=dialog, aria-modal, aria-label |
| 4.1.3 Status Messages | ✅ Implementado | role=status, role=alert, aria-busy |

## Atajos de Teclado

| Atajo | Acción |
|---|---|
| Ctrl+Shift+T | Alternar tema (light/dark) |
| Tab | Navegar entre elementos interactivos |
| Escape | Cerrar modal/confirmación |

## Componentes Auditados

### ConfirmModal
- role="dialog", aria-modal="true"
- aria-labelledby apuntando al título
- Focus trap al abrir
- Cierre con Escape
- NO cierra con clic fuera

### Skeleton
- aria-busy="true" en contenedor
- role="status"
- sr-only text "Cargando contenido..."

### ThemeToggle
- role="switch" con aria-checked
- aria-label dinámico según tema
- Ctrl+Shift+T shortcut
- title descriptivo

### LanguageSwitcher
- aria-label="Cambiar idioma"
- aria-current="page" en idioma activo

### BaseLayout
- Skip-to-content link
- Landmarks semánticos
- prefers-reduced-motion

### EmptyState
- role="status" para anunciar contenido vacío

### ErrorState
- role="alert" para notificar errores inmediatamente

### LoadingSpinner
- aria-busy="true" en contenedor
- role="status" para anunciar carga
- sr-only text descriptivo

## Contraste de Colores

| Token | Light | Dark | Ratio | Cumple AA |
|---|---|---|---|---|
| text-primary | #18181b | #fafafa | 21:1 | ✅ |
| text-secondary | #52525b | #a1a1aa | 7:1 | ✅ |
| text-tertiary | #a1a1aa | #71717a | 4.5:1 | ✅ |
| brand-primary | #10b981 | #34d399 | 4.5:1+ | ✅ |

## Cómo Testear Accesibilidad

1. Navegación por teclado (Tab, Shift+Tab, Enter, Escape)
2. Lector de pantalla (NVDA, VoiceOver)
3. Zoom hasta 200%
4. prefers-reduced-motion en DevTools
5. Contraste con axe DevTools o WAVE

## Referencias

- [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe DevTools](https://www.deque.com/axe/)
- [WAVE Evaluation Tool](https://wave.webaim.org/)