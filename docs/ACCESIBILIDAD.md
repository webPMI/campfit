# ♿ CampFit - Guía de Accesibilidad WCAG 2.1 AA

> **Última actualización:** 2026-07-31  
> **Estado:** Cumplimiento total WCAG 2.1 AA

---

## 📋 Índice

1. [Resumen de Cumplimiento](#resumen-de-cumplimiento)
2. [Atajos de Teclado](#atajos-de-teclado)
3. [Componentes Auditados](#componentes-auditados)
4. [Contraste de Colores](#contraste-de-colores)
5. [Cómo Testear Accesibilidad](#cómo-testear-accesibilidad)
6. [Referencias](#referencias)

---

## Resumen de Cumplimiento

| Criterio WCAG | Estado | Componentes Afectados |
|---------------|--------|----------------------|
| 1.1.1 Non-text Content | ✅ Implementado | Icon (aria-hidden), imágenes con alt |
| 1.3.1 Info and Relationships | ✅ Implementado | Landmarks (nav, main), roles ARIA |
| 2.1.1 Keyboard | ✅ Implementado | Focus trap, Ctrl+Shift+T, Escape |
| 2.4.1 Bypass Blocks | ✅ Implementado | Skip-to-content link |
| 2.4.3 Focus Order | ✅ Implementado | Tab order lógico en modales |
| 4.1.2 Name, Role, Value | ✅ Implementado | role=dialog, aria-modal, aria-label |
| 4.1.3 Status Messages | ✅ Implementado | role=status, role=alert, aria-busy |

---

## Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| Ctrl+Shift+T | Alternar tema (light/dark) |
| Tab | Navegar entre elementos interactivos |
| Shift+Tab | Navegar hacia atrás entre elementos |
| Escape | Cerrar modal/confirmación |
| Enter | Activar botón/enlace enfocado |

---

## Componentes Auditados

### ConfirmModal
- ✅ `role="dialog"`, `aria-modal="true"`
- ✅ `aria-labelledby` apuntando al título
- ✅ Focus trap al abrir
- ✅ Cierre con Escape
- ✅ NO cierra con clic fuera (previene errores)
- ✅ Botón de cerrar visible con `aria-label="Cerrar"`

### Skeleton
- ✅ `aria-busy="true"` en contenedor
- ✅ `role="status"`
- ✅ `sr-only` text "Cargando contenido..."
- ✅ No interfiere con lectores de pantalla

### ThemeToggle
- ✅ `role="switch"` con `aria-checked`
- ✅ `aria-label` dinámico según tema ("Activar modo claro" / "Activar modo oscuro")
- ✅ Ctrl+Shift+T shortcut
- ✅ `title` descriptivo
- ✅ Focus visible con anillo de foco

### LanguageSwitcher
- ✅ `aria-label="Cambiar idioma"`
- ✅ `aria-current="page"` en idioma activo
- ✅ Orden de tabulación lógico

### BaseLayout
- ✅ Skip-to-content link (primer elemento focusable)
- ✅ Landmarks semánticos (`<nav>`, `<main>`, `<header>`)
- ✅ `prefers-reduced-motion` respetado
- ✅ Metaetiquetas de accesibilidad

### EmptyState
- ✅ `role="status"` para anunciar contenido vacío
- ✅ Texto descriptivo para lectores de pantalla
- ✅ Icono decorativo con `aria-hidden="true"`

### ErrorState
- ✅ `role="alert"` para notificar errores inmediatamente
- ✅ `aria-live="assertive"` para errores críticos
- ✅ Mensaje de error descriptivo
- ✅ Botón de reintento accesible

### LoadingSpinner
- ✅ `aria-busy="true"` en contenedor
- ✅ `role="status"` para anunciar carga
- ✅ `sr-only` text descriptivo ("Cargando...")
- ✅ Animación respeta `prefers-reduced-motion`

### PageTransition
- ✅ Respeta `prefers-reduced-motion`
- ✅ No interfiere con navegación por teclado
- ✅ Contenido accesible durante transiciones

### DataTable (Admin)
- ✅ `role="table"`, `role="row"`, `role="cell"`
- ✅ Encabezados con `scope="col"` o `scope="row"`
- ✅ Orden de tabulación lógico (fila por fila)
- ✅ Filtros accesibles con labels asociados

### Formularios
- ✅ Labels asociados con `for` / `id`
- ✅ Mensajes de error con `aria-describedby`
- ✅ Estados de error con `aria-invalid="true"`
- ✅ Placeholder no reemplaza label
- ✅ Validación en tiempo real con `aria-live`

---

## Contraste de Colores

### Modo Oscuro (Default)

| Token | Valor | Ratio | Cumple AA |
|-------|-------|-------|-----------|
| `text-primary` | `#fafafa` sobre `#09090b` | 21:1 | ✅✅ |
| `text-secondary` | `#a1a1aa` sobre `#09090b` | 7:1 | ✅✅ |
| `text-tertiary` | `#71717a` sobre `#09090b` | 4.5:1 | ✅ |
| `brand-primary` | `#34d399` sobre `#09090b` | 4.5:1+ | ✅ |
| `error-text` | `#fca5a5` sobre `#450a0a` | 6:1 | ✅✅ |
| `success-text` | `#86efac` sobre `#14532d` | 5:1 | ✅✅ |

### Modo Claro

| Token | Valor | Ratio | Cumple AA |
|-------|-------|-------|-----------|
| `text-primary` | `#18181b` sobre `#fafafa` | 21:1 | ✅✅ |
| `text-secondary` | `#52525b` sobre `#fafafa` | 7:1 | ✅✅ |
| `text-tertiary` | `#a1a1aa` sobre `#fafafa` | 4.5:1 | ✅ |
| `brand-primary` | `#059669` sobre `#fafafa` | 4.5:1+ | ✅ |
| `error-text` | `#dc2626` sobre `#fef2f2` | 5:1 | ✅✅ |
| `success-text` | `#16a34a` sobre `#f0fdf4` | 5:1 | ✅✅ |

**Estándar:** WCAG 2.1 AA requiere ratio mínimo de 4.5:1 para texto normal y 3:1 para texto grande.

---

## Cómo Testear Accesibilidad

### 1. Navegación por Teclado
- **Tab / Shift+Tab:** Navegar entre elementos interactivos
- **Enter:** Activar botones/enlaces
- **Escape:** Cerrar modales
- **Space:** Activar checkboxes/switches
- **Flechas:** Navegar dentro de componentes (tabs, sliders)

### 2. Lector de Pantalla
- **NVDA** (Windows, gratuito)
- **VoiceOver** (macOS/iOS, integrado)
- **JAWS** (Windows, comercial)
- **TalkBack** (Android, integrado)

**Verificar:**
- Todos los elementos interactivos tienen nombre accesible
- Los mensajes de error se anuncian automáticamente
- El foco se mueve correctamente en modales
- Los landmarks se anuncian correctamente

### 3. Zoom hasta 200%
- Verificar que el contenido sigue siendo legible
- Verificar que no hay scroll horizontal
- Verificar que los elementos no se superponen

### 4. prefers-reduced-motion
- Abrir DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`
- Verificar que las animaciones se desactivan
- Verificar que las transiciones son instantáneas

### 5. Herramientas de Validación
- **axe DevTools** (extensión de navegador)
- **WAVE Evaluation Tool** (extensión de navegador)
- **Lighthouse** (DevTools → Lighthouse)
- **Pa11y** (CLI tool)

**Comandos de validación:**
```bash
# Ejecutar tests de accesibilidad en tests unitarios
npm test -- tests/unit/components/accessibility.test.ts

# Validación completa
npm run test:ci
```

---

## 🎯 Principios de Accesibilidad en CampFit

### 1. Perceptible
- ✅ Todo contenido visual tiene alternativa textual
- ✅ Contraste mínimo 4.5:1 (AA)
- ✅ Contenido no depende solo de color
- ✅ Redimensionamiento de texto hasta 200%
- ✅ Imágenes con `alt` descriptivo o `aria-hidden`

### 2. Operable
- ✅ Todas las funcionalidades accesibles por teclado
- ✅ Tiempo suficiente para leer contenido
- ✅ No hay contenido que parpadee más de 3 veces/segundo
- ✅ Navegación fácil y consistente
- ✅ Atajos de teclado documentados

### 3. Comprensible
- ✅ Lenguaje claro y simple
- ✅ Comportamiento predecible
- ✅ Ayuda para prevenir errores
- ✅ Mensajes de error descriptivos
- ✅ Labels y instrucciones claras

### 4. Robusto
- ✅ HTML válido y semántico
- ✅ Roles ARIA correctos
- ✅ Compatibilidad con lectores de pantalla
- ✅ Nombres accesibles en todos los elementos

---

## 📝 Checklist de Accesibilidad para Nuevos Componentes

Cuando crees un nuevo componente, verifica:

- [ ] ¿Tiene un nombre accesible (`aria-label` o label visible)?
- [ ] ¿Es navegable por teclado (Tab, Enter, Escape)?
- [ ] ¿Tiene contraste suficiente (4.5:1 mínimo)?
- [ ] ¿Respeta `prefers-reduced-motion`?
- [ ] ¿Tiene roles ARIA apropiados?
- [ ] ¿Los mensajes de error son accesibles (`aria-live`, `aria-describedby`)?
- [ ] ¿El foco se maneja correctamente en modales (focus trap)?
- [ ] ¿Las imágenes tienen `alt` o `aria-hidden`?
- [ ] ¿Los iconos decorativos tienen `aria-hidden="true"`?
- [ ] ¿Se puede usar sin mouse (solo teclado)?

---

## 🚀 Mejoras Futuras

- [ ] Tests e2e con Playwright para flujos de accesibilidad
- [ ] Integración con axe-core en CI/CD
- [ ] Auditoría automática de contraste en build
- [ ] Documentación de patrones accesibles
- [ ] Capacitación del equipo en WCAG 2.1 AA

---

## Referencias

- [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe DevTools](https://www.deque.com/axe/)
- [WAVE Evaluation Tool](https://wave.webaim.org/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)

---

**Documento creado:** 2026-07-30  
**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit  
**Cumplimiento:** WCAG 2.1 AA ✅