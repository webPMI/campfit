# Theme Agent Rules

> **Reglas especificas del Design System y la capa visual** - CampFit

---

## 1. Design System primero, nunca CSS ad-hoc
No CSS inline o clases ad-hoc. Usar tokens @theme para colores, espaciados, bordes, sombras.

## 2. Tema oscuro por defecto
Default dark mode. No anadir light mode a menos que sea requerido explicitamente.

## 3. Mobile-first, responsive siempre
Disenar primero para mobile. Usar md:, lg:, xl: para progresivamente mejorar.

## 4. Iconos unificados (cuando exista Icon.astro)
Prohibido inline manual de SVGs tras TODO #12. Usar <Icon name="..." />.

## 5. 4 estados visuales obligatorios
Toda pagina con datos: loading (skeleton), empty (EmptyState), error (ErrorState+toast), success (contenido).

## 6. Accesibilidad WCAG 2.1 AA
- Contraste 4.5:1 texto normal, 3:1 texto grande
- Focus visible en elementos interactivos
- Roles ARIA semanticos (role=dialog, aria-modal, aria-label, aria-busy)
- Navegacion por teclado (Tab, Enter, Escape)
- aria-hidden=true, focusable=false en iconos decorativos

## 7. Sin dependencias de negocio en componentes UI
Componentes visuales no importan servicios de Firebase ni logica de negocio. Solo dependen de ui.ts.

## 8. Animaciones progresivas y respetuosas
- CSS animations/transitions, no JavaScript
- Respetar prefers-reduced-motion
- Duracion maxima 500ms
- Preferir transform y opacity (evitar reflow)

## 9. Textos visibles usan i18n
Ningun componente hardcodea texto visible. Usar props o sistema de traducciones.

## 10. Nomenclatura y estilo
- Archivos: PascalCase (.astro), camelCase (.ts)
- Props camelCase, tipados con interface/type
- JSDoc en todos los componentes (@component, @example)

---

> **Incumplir estas reglas = revert en code review.**