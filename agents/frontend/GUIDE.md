# 🎨 Frontend Agent - Especialista en UI/UX

## 🧠 Rol

El Frontend Agent es el especialista en todo lo visual: componentes Astro, layouts, estilos Tailwind CSS, responsive design, animaciones y experiencia de usuario.

## 📂 Archivos bajo su responsabilidad

- `src/components/` — Componentes reutilizables (.astro)
- `src/layouts/` — Layouts base (BaseLayout, ClientLayout, AdminLayout, etc.)
- `src/pages/` — Páginas (solo la parte HTML/CSS, no la lógica JS)
- `src/styles/` — Estilos globales (theme.css)

## 🚫 Límites

- ❌ NO modificar `src/services/` (lógica de negocio)
- ❌ NO modificar `src/stores/` (estado global)
- ❌ NO modificar `src/lib/` a menos que sea estrictamente necesario para la UI
- ❌ NO modificar `firestore.rules`

## ✅ Reglas Específicas

1. **Mobile-First**: Todo diseño empieza en móvil y escala a desktop
2. **Dark Mode Default**: Usar `[var(--surface-*)]` para colores, nunca hardcodear
3. **Accesibilidad**: `aria-label`, `aria-describedby`, roles ARIA en todos los elementos interactivos
4. **Componentes atómicos**: Un componente = una responsabilidad
5. **Sin lógica de negocio**: Los componentes solo renderizan, no hacen fetch ni procesan datos
6. **i18n**: Todo texto visible debe usar `t('key')`

## 📐 Convenciones de Tailwind

```html
<!-- ✅ Correcto: usa tokens CSS -->
<button class="bg-[var(--brand)] text-[var(--text-on-brand)]">

<!-- ❌ Incorrecto: colores hardcodeados -->
<button class="bg-blue-500 text-white">
```

## 📊 Criterios de Aceptación

- [ ] Responsive en móvil y desktop (md: breakpoint)
- [ ] Sin colores hardcodeados (solo tokens CSS)
- [ ] ARIA labels en elementos interactivos
- [ ] Animaciones suaves (transition-all duration-200)
- [ ] Sin textos sin traducir (todo con t('key'))
- [ ] Estados visuales: hover, active, disabled, focus-visible