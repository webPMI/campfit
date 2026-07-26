# Theme Agent Guide

> **Guia optimizada para el Agente de Tema IA** - Contexto, reglas, componentes, tokens de diseno y responsabilidades del Design System en CampFit.

---

## Rol y Responsabilidades

**Encargado del Design System y la capa visual de CampFit.** Responsable de mantener, crear y auditar todos los componentes visuales, tokens de diseno, Tailwind CSS 4, normalizacion SVG, accesibilidad WCAG 2.1 AA y responsividad mobile-first.

### Areas clave

- Design System: Tokens CSS (@theme), paleta, tipografia, espaciado, bordes, sombras
- Tailwind CSS 4: Configuracion centralizada, tema oscuro por defecto
- Componentes: Skeleton, ConfirmModal, EmptyState, ErrorState, LoadingSpinner
- Iconos: Normalizacion SVG (TODO #12), Lucide standalone
- Layouts: BaseLayout, AdminLayout, ClientLayout, TrainerLayout, PublicPageLayout
- Accesibilidad: WCAG 2.1 AA, roles ARIA, contraste, teclado
- Responsividad: Mobile-first, breakpoints Tailwind
- Animaciones: CSS keyframes, micro-interacciones

---

## Mapa del Modulo de Tema

src/components/: ConfirmModal, DecorativeBackground, LanguageSwitcher, Skeleton, [Icon] TODO #12, [EmptyState], [ErrorState], [LoadingSpinner]
src/layouts/: BaseLayout, AdminLayout, ClientLayout, TrainerLayout, PublicPageLayout
src/lib/shared/: ui.ts

---

## Tokens de Diseno (Tailwind CSS 4 - @theme)

Actual: emerald-400, emerald-500, emerald-900.
Pendiente: primary(#00E676), secondary(#2979FF), bg-*(#0A0A0A,#1A1A1A,#2A2A2A), text-*(#FFFFFF,#B0B0B0,#666666), border(#333333), success/warning/danger/info.

Tipografia: Inter (texto), JetBrains Mono (codigo, pendiente).
Tamanos: xs(0.75rem) a 3xl(1.875rem).

---

## Inventario de Componentes

Implementados: Skeleton(4 vars), ConfirmModal(3 vars), DecorativeBackground, LanguageSwitcher.
FALTANTES: EmptyState, ErrorState, LoadingSpinner.
TODO #12: Icon.astro - 22 iconos, props name/size/class, aria-hidden.

---

## 4 Estados Visuales: loading->Skeleton | empty->EmptyState | error->ErrorState+Toast | success->Contenido
## Accesibilidad: Contraste 4.5:1, focus visible, roles ARIA, teclado, targets 44x44px
## Responsividad: sm(640) md(768) lg(1024) xl(1280) 2xl(1536). Mobile-first.
## Referencias: npm run dev, npm run type-check, npm run doctor

---

## Dependencias: Client, Admin, Trainer, Language, Testing, Planner Agents.

---

> **Mantenido por:** Theme Agent - CampFit