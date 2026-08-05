# CampFit Motion System — Plan de Migración Completo

> **Última actualización:** 2026-07-31  
> **Estado Actual:** 7/34 páginas mejoradas (21%)

---

## 📊 Resumen

El Motion System de CampFit estandariza las animaciones y estados de carga mediante componentes reutilizables, eliminando código duplicado y mejorando la consistencia visual.

### Métricas

| Métrica | Valor |
|---------|-------|
| Total páginas | 34 |
| Páginas migradas | **7 (21%)** |
| Páginas pendientes | **27 (79%)** |
| Componentes creados | 5 |
| Tests unitarios | 32 ✅ |

---

## Prioridades de Migración

### 🔴 ALTA — Tienen `animate-pulse` manual

Estas páginas requieren migración inmediata porque usan animaciones hardcodeadas que deben reemplazarse por componentes del sistema.

| Página | `animate-pulse` | Acción |
|--------|----------------|--------|
| `admin/workouts.astro` | 3 | Reemplazar con `<Skeleton>` o `<SkeletonGroup variant="card-grid">` |
| `admin/chat.astro` | 2 | Reemplazar con `<Skeleton>` |
| `admin/clinical.astro` | 2 | Reemplazar con `<Skeleton>` |
| `admin/diets.astro` | 2 | Reemplazar con `<Skeleton>` |
| `admin/progress.astro` | 2 | Reemplazar con `<Skeleton>` |
| `auth/register.astro` | 1 | Reemplazar con `<Skeleton>`, añadir `<PageTransition>` |
| `client/chat.astro` | ~2 | Reemplazar con `<Skeleton>` |
| `trainer/chat.astro` | ~2 | Reemplazar con `<Skeleton>` |

### 🟡 MEDIA — Tienen `animate-spin` o texto "Cargando..."

| Página | Patrón | Acción |
|--------|--------|--------|
| `auth/recover.astro` | `animate-spin` | Añadir `<PageTransition>` |
| `admin/clients.astro` | "Cargando..." | Reemplazar con `<LoadingState variant="inline" type="skeleton">` |
| `admin/trainers.astro` | "Cargando..." | Reemplazar con `<LoadingState variant="inline" type="skeleton">` |
| `client/support.astro` | spinner | Reemplazar con `<LoadingState>` |
| `client/workouts.astro` | spinner | Reemplazar con `<LoadingState>` |
| `client/diets.astro` | spinner | Reemplazar con `<LoadingState>` |
| `client/progress.astro` | spinner | Reemplazar con `<LoadingState>` |
| `trainer/clients.astro` | spinner | Reemplazar con `<LoadingState>` |
| `trainer/diets.astro` | spinner | Reemplazar con `<LoadingState>` |
| `trainer/workouts.astro` | spinner | Reemplazar con `<LoadingState>` |

### 🟢 BAJA — Ya ok o sin loading evidente

| Página | Nota |
|--------|------|
| `admin/settings.astro` | Componente unificado |
| `client/medical-profile.astro` | Se puede mejorar pero no crítico |
| `client/settings.astro` | Componente unificado |
| `trainer/settings.astro` | Componente unificado |
| `client/dashboard.astro` | ✅ Ya mejorado |
| `admin/users.astro` | ✅ Ya mejorado |
| `login.astro` | ✅ Ya mejorado |
| `admin/dashboard.astro` | ✅ Ya mejorado |
| `trainer/dashboard.astro` | ✅ Ya mejorado |

---

## Patrón de Migración

### Paso 1: Añadir imports

```astro
---
import PageTransition from '@/components/PageTransition.astro';
import SkeletonGroup from '@/components/SkeletonGroup.astro';
import LoadingState from '@/components/LoadingState.astro';
import Skeleton from '@/components/Skeleton.astro';
---
```

### Paso 2: Envolver contenido

```astro
<PageTransition animation="fade-up">
  <!-- contenido existente -->
</PageTransition>
```

### Paso 3: Reemplazar animate-pulse manual

```astro
<!-- ANTES -->
<div class="animate-pulse rounded bg-[var(--surface-3)] h-4 w-24"></div>

<!-- DESPUÉS -->
<Skeleton variant="text" width="96px" height="16px" />
```

### Paso 4: Reemplazar spinners inline

```astro
<!-- ANTES -->
<svg class="h-5 w-5 animate-spin"><circle .../></svg>

<!-- DESPUÉS -->
<LoadingState variant="inline" type="spinner" size="sm" />
```

### Paso 5: Reemplazar textos "Cargando..."

```astro
<!-- ANTES -->
<p class="text-sm text-[var(--text-tertiary)]">{t('admin.loading')}</p>

<!-- DESPUÉS -->
<LoadingState variant="inline" type="skeleton" />
```

---

## Componentes Disponibles

### Skeleton

Componente para placeholders de contenido.

```astro
<Skeleton variant="text" width="96px" height="16px" />
<Skeleton variant="rect" width="100%" height="200px" />
<Skeleton variant="circle" width="40px" height="40px" />
```

**Variantes:**
- `text` — Línea de texto
- `rect` — Rectángulo
- `circle` — Círculo

**Props:**
- `width` — Ancho (px o %)
- `height` — Alto (px o %)
- `className` — Clases adicionales

### SkeletonGroup

Grupo de skeletons para layouts complejos.

```astro
<SkeletonGroup variant="card-grid" count={6} />
<SkeletonGroup variant="list" count={4} />
<SkeletonGroup variant="table" rows={5} cols={4} />
```

**Variantes:**
- `card-grid` — Grid de cards
- `list` — Lista de items
- `table` — Tabla de datos

**Props:**
- `count` — Número de items (para card-grid y list)
- `rows` — Número de filas (para table)
- `cols` — Número de columnas (para table)

### LoadingState

Estado de carga con spinner o skeleton.

```astro
<LoadingState variant="inline" type="spinner" size="sm" />
<LoadingState variant="centered" type="spinner" size="lg" />
<LoadingState variant="inline" type="skeleton" />
```

**Variantes:**
- `inline` — En línea con texto
- `centered` — Centrado en contenedor

**Tipos:**
- `spinner` — Spinner animado
- `skeleton` — Placeholder skeleton

**Tamaños:**
- `sm` — Pequeño (16px)
- `md` — Mediano (24px)
- `lg` — Grande (40px)

### PageTransition

Transiciones de página suaves.

```astro
<PageTransition animation="fade-up">
  <!-- contenido -->
</PageTransition>
```

**Animaciones:**
- `fade-up` — Fade in con movimiento hacia arriba
- `fade-in` — Fade in simple
- `scale` — Escala desde 0.95 a 1
- `slide` — Deslizamiento desde la derecha

**Props:**
- `animation` — Tipo de animación
- `duration` — Duración en ms (default: 300)

### AnimatedCounter

Contador animado para números.

```astro
<AnimatedCounter value={75} duration={1000} />
```

**Props:**
- `value` — Valor final
- `duration` — Duración en ms (default: 1000)
- `easing` — Función de easing (default: ease-out)

---

## Despliegue por Agentes

### Agente 1: Admin Pages
- `admin/workouts.astro`
- `admin/chat.astro`
- `admin/clinical.astro`

### Agente 2: Admin Pages (resto)
- `admin/diets.astro`
- `admin/progress.astro`
- `admin/clients.astro`
- `admin/trainers.astro`

### Agente 3: Auth Pages
- `register.astro`
- `recover.astro`

### Agente 4: Client Pages
- `client/chat.astro`
- `client/support.astro`
- `client/workouts.astro`
- `client/diets.astro`
- `client/progress.astro`

### Agente 5: Trainer Pages
- `trainer/chat.astro`
- `trainer/clients.astro`
- `trainer/diets.astro`
- `trainer/workouts.astro`

---

## Checklist por Página

Cada agente debe:

1. ✅ `read_file` de la página objetivo
2. ✅ `replace_in_file`: añadir imports de componentes
3. ✅ `replace_in_file`: reemplazar animate-pulse con `<Skeleton>`
4. ✅ `replace_in_file`: reemplazar spinners con `<LoadingState>`
5. ✅ `replace_in_file`: envolver con `<PageTransition>`
6. ✅ `replace_in_file`: optimizar transition-all, active:scale, focus:shadow
7. ✅ Verificar con `npx astro check` → 0 errors
8. ✅ Ejecutar tests: `npm test`

---

## Verificación

### Comandos

```bash
# Verificar compilación
npx astro check

# Tests unitarios
npm test

# Tests e2e
npm run test:e2e

# Validación completa
npm run test:ci
```

### Criterios de Éxito

- ✅ No hay errores de compilación
- ✅ Todos los tests pasan
- ✅ No hay clases hardcodeadas de animación
- ✅ Todos los estados de carga usan componentes del sistema
- ✅ Las transiciones son suaves y respetan prefers-reduced-motion

---

## 📈 Próximos Pasos

1. **Corto plazo (1-2 semanas):** Completar Grupo 1 (Admin Pages)
2. **Mediano plazo (2-4 semanas):** Completar Grupo 2 (Client Pages)
3. **Largo plazo (1-2 meses):** Completar Grupo 3 y 4, añadir tests e2e

---

## 🔗 Recursos

- **Documentación completa:** Ver `docs/UI_UX_FINAL_PLAN.md`
- **Design System:** Ver `docs/03_design_system.md`
- **Guía de desarrollo:** Ver `docs/09_desarrollo_y_workflow.md`
- **Tests de componentes:** `tests/unit/components/`
- **Ejemplos de uso:** Ver páginas ya migradas (login, dashboard)

---

**Documento creado:** 2026-07-25  
**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit