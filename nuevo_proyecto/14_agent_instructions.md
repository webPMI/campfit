# 🤖 Instrucciones para Agentes IA - CampFit 2.0

## Stack

- **Framework:** Astro 5 (SSR + islands)
- **UI:** Astro components + Vanilla JS (sin React)
- **Estilos:** Tailwind CSS 4 (dark mode default)
- **Estado:** Nanostores
- **Base de datos:** Cloud Firestore (NoSQL)
- **Storage:** Cloudflare R2
- **Testing:** Vitest (unitarios) + Playwright (E2E) — centralizados en `tests/`

---

## Reglas de Código

### ❌ NUNCA HACER

1. **No usar `any`** - Siempre tipar explícitamente. Crear interfaces si es necesario.
2. **No lógica de negocio en UI** - Los componentes solo renderizan. Services hacen lógica.
3. **No hardcodear URLs/keys** - Todo por `import.meta.env` o variables de entorno.
4. **No ignorar estados** - Toda página/componente maneja: loading, empty, error, success.
5. **No Firebase Client SDK para ops sensibles** - Usar API Routes (Astro endpoints) con Admin SDK.
6. **No mutar stores directamente** - Siempre usar funciones setter exportadas.
7. **No console.log en producción** - Usar sistema de logging.
8. **No try/catch genéricos** - Siempre tipar el error y mostrar mensaje al usuario.
9. **No archivos > 300 líneas** - Refactorizar en componentes más pequeños.
10. **No commits sin formato** - Seguir conventional commits.

### ✅ SIEMPRE HACER

1. **Tipar todo** - Props, returns, variables, eventos. Sin excepciones.
2. **4 estados por página** - loading skeleton → empty state → error toast → success data.
3. **Tests unitarios** - Para servicios y stores. Mínimo 1 test por función pública.
4. **JSDoc en funciones públicas** - `@param` y `@returns`.
5. **Componentes atómicos** - Un componente = una responsabilidad.
6. **Error boundaries** - Wrap cada feature con ErrorBoundary.
7. **Logging estructurado** - Usar logger.info/warn/error con contexto.
8. **Validación de props** - Props requeridas marcadas, opcionales con defaults.
9. **Cleanup de suscripciones** - onSnapshot unsubscribe en cleanup.
10. **Manejo de concurrencia** - AbortController para fetch, race conditions en stores.

---

## Patrón de 4 Estados

Toda página/componente debe manejar estos 4 estados:

```typescript
// 1. LOADING - Skeleton/spinner mientras se cargan datos
function LoadingSkeleton() {
  return `<div class="skeleton"><div class="skeleton-line"></div>...</div>`;
}

// 2. EMPTY - Mensaje cuando no hay datos
function EmptyState({ title, description, actionLabel }) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <h3>${title}</h3>
      <p>${description}</p>
      ${actionLabel ? `<button class="btn btn-primary">${actionLabel}</button>` : ''}
    </div>
  `;
}

// 3. ERROR - Toast/mensaje de error
function ErrorToast({ message, onRetry }) {
  return `
    <div class="toast toast-error">
      <span>⚠️ ${message}</span>
      ${onRetry ? '<button class="toast-retry">Reintentar</button>' : ''}
    </div>
  `;
}

// 4. SUCCESS - Datos renderizados
function DataView({ data }) {
  return `<div>${data.map(item => `<div>${item}</div>`).join('')}</div>`;
}
```

---

## Estructura de Archivos

```
src/
├── components/     # Componentes .astro reutilizables
├── layouts/        # Layouts .astro (BaseLayout, AdminLayout, ClientLayout, TrainerLayout)
├── pages/          # Páginas y API routes
├── lib/            # Utilidades y helpers
│   ├── firebase.ts
│   ├── validators.ts
│   ├── routeGuards.ts
│   └── client/     # Servicios del lado cliente
├── services/       # Servicios (Firebase)
├── stores/         # Nanostores
├── types/          # Tipos globales
└── i18n/           # Internacionalización
```

---

## Testing

- **Tests centralizados** en `tests/` (nada en `src/__tests__/`)
- **Un archivo de test por módulo** - misma estructura que `src/`
- **Sin React** - No usar React Testing Library. jsdom solo si es estrictamente necesario

---

## Documentación

Antes de implementar, leer en orden:
1. `00_indice.md`
2. `01_vision_objetivos.md`
3. `02_requisitos_funcionales.md`
4. `03_arquitectura_tecnica.md`
5. `04_modelo_datos_firestore.md`
6. `05_reglas_seguridad.md`
7. `06_design_system.md`
8. `07_flujos_navegacion.md`
9. `13_setup_guide.md`
10. `14_agent_instructions.md` (este archivo)
11. `15_api_contracts.md`
12. `16_implementacion_incremental.md`
13. Documento del módulo específico

---

## Convenciones de Git

- **Commits:** `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- **Branches:** `feature/`, `fix/`, `refactor/`
- **PRs:** Título descriptivo + descripción de cambios

---

> **📌 Guía completa de desarrollo y testing:** Ver `12_guia_desarrollo_testing.md`
> **📌 Golden Rules completas:** Ver `.clinerules`
> **📌 Protocolo de documentación:** Ver `18_protocolo_documentacion.md`
