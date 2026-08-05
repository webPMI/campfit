# 🚀 CampFit Motion System — Plan de Acción Final

> **Última actualización:** 2026-07-31  
> **Estado:** 34 páginas analizadas | 7 mejoradas | 27 pendientes

---

## 📊 Resumen Ejecutivo

El Motion System de CampFit tiene como objetivo estandarizar las animaciones y estados de carga en todas las páginas de la aplicación, mejorando la experiencia de usuario y reduciendo la deuda técnica.

### Métricas Actuales

| Métrica | Valor |
|---------|-------|
| Total páginas analizadas | 34 |
| Páginas mejoradas | **7 (21%)** |
| Páginas pendientes | **27 (79%)** |
| Componentes creados | 5 (Skeleton, SkeletonGroup, LoadingState, PageTransition, AnimatedCounter) |
| Tests de componentes | 32 ✅ |

---

## Estado de Migración por Grupo

### GRUPO 1 — Admin Pages (8 páginas)

| Página | Estado | Acción Requerida |
|--------|--------|------------------|
| `admin/dashboard.astro` | ✅ LISTO | - |
| `admin/users.astro` | ✅ LISTO | - |
| `admin/workouts.astro` | 🔄 PENDIENTE | 3 animate-pulse + 2 transition-all → cf-transition |
| `admin/chat.astro` | 🔄 PENDIENTE | 2 animate-pulse + 1 hover → cf-hover-lift |
| `admin/clinical.astro` | 🔄 PENDIENTE | 2 animate-pulse + focus:shadow → cf-focus-ring |
| `admin/diets.astro` | 🔄 PENDIENTE | 2 animate-pulse + 2 inputs → cf-focus-ring |
| `admin/progress.astro` | 🔄 PENDIENTE | 2 animate-pulse + 2 inputs → cf-focus-ring |
| `admin/clients.astro` | 🔄 PENDIENTE | "Cargando..." → LoadingState skeleton |
| `admin/trainers.astro` | 🔄 PENDIENTE | "Cargando..." → LoadingState skeleton |

### GRUPO 2 — Client Pages (8 páginas)

| Página | Estado | Acción Requerida |
|--------|--------|------------------|
| `client/dashboard.astro` | ✅ LISTO | 87 líneas animate-pulse eliminadas |
| `client/chat.astro` | 🔄 PENDIENTE | 2 animate-pulse + spinner → LoadingState |
| `client/support.astro` | 🔄 PENDIENTE | spinner → LoadingState |
| `client/workouts.astro` | 🔄 PENDIENTE | spinner + animate-pulse → LoadingState |
| `client/diets.astro` | 🔄 PENDIENTE | spinner → LoadingState |
| `client/progress.astro` | 🔄 PENDIENTE | spinner → LoadingState |
| `client/medical-profile.astro` | 🟢 BAJA | Se puede mejorar pero no crítico |
| `client/settings.astro` | 🟢 BAJA | Componente unificado |

### GRUPO 3 — Trainer Pages (6 páginas)

| Página | Estado | Acción Requerida |
|--------|--------|------------------|
| `trainer/dashboard.astro` | ✅ LISTO | 3 spinners eliminados |
| `trainer/chat.astro` | 🔄 PENDIENTE | 2 animate-pulse → Skeleton |
| `trainer/clients.astro` | 🔄 PENDIENTE | spinner → LoadingState |
| `trainer/diets.astro` | 🔄 PENDIENTE | spinner → LoadingState |
| `trainer/workouts.astro` | 🔄 PENDIENTE | spinner → LoadingState |
| `trainer/settings.astro` | 🟢 BAJA | Componente unificado |

### GRUPO 4 — Auth Pages (3 páginas)

| Página | Estado | Acción Requerida |
|--------|--------|------------------|
| `login.astro` | ✅ LISTO | PageTransition scale |
| `register.astro` | 🔄 PENDIENTE | 1 animate-pulse + 5 transition-all → cf-transition |
| `recover.astro` | 🔄 PENDIENTE | 1 spinner + PageTransition |

---

## Optimizaciones a Aplicar

### Patrones a Reemplazar

| Optimización | Afecta a | Reemplazar por |
|-------------|----------|----------------|
| `transition-all duration-200` | 12 inputs/botones | `cf-transition` |
| `active:scale-[0.98]` | 8 botones | `cf-press` |
| `focus:shadow-[0_0_0_3px_var(--brand-dim)]` | 10 inputs | `cf-focus-ring` |
| `hover:scale-[1.02]` en cards | 5 cards | `cf-hover-lift` |
| `animate-fade-in` redundante | 8 wrappers | Quitar (PageTransition lo reemplaza) |

---

## Patrón de Migración

### 1. Añadir imports

```astro
---
import PageTransition from '@/components/PageTransition.astro';
import SkeletonGroup from '@/components/SkeletonGroup.astro';
import LoadingState from '@/components/LoadingState.astro';
import Skeleton from '@/components/Skeleton.astro';
---
```

### 2. Envolver contenido

```astro
<PageTransition animation="fade-up">
  <!-- contenido existente -->
</PageTransition>
```

### 3. Reemplazar animate-pulse manual

```astro
<!-- ANTES -->
<div class="animate-pulse rounded bg-[var(--surface-3)] h-4 w-24"></div>

<!-- DESPUÉS -->
<Skeleton variant="text" width="96px" height="16px" />
```

### 4. Reemplazar spinners inline

```astro
<!-- ANTES -->
<svg class="h-5 w-5 animate-spin"><circle .../></svg>

<!-- DESPUÉS -->
<LoadingState variant="inline" type="spinner" size="sm" />
```

### 5. Reemplazar textos "Cargando..."

```astro
<!-- ANTES -->
<p class="text-sm text-[var(--text-tertiary)]">{t('admin.loading')}</p>

<!-- DESPUÉS -->
<LoadingState variant="inline" type="skeleton" />
```

---

## Componentes Disponibles

### Skeleton

```astro
<Skeleton variant="text" width="96px" height="16px" />
<Skeleton variant="rect" width="100%" height="200px" />
<Skeleton variant="circle" width="40px" height="40px" />
```

**Variantes:** `text`, `rect`, `circle`  
**Props:** `width`, `height`, `className`

### SkeletonGroup

```astro
<SkeletonGroup variant="card-grid" count={6} />
<SkeletonGroup variant="list" count={4} />
<SkeletonGroup variant="table" rows={5} cols={4} />
```

**Variantes:** `card-grid`, `list`, `table`  
**Props:** `count`, `rows`, `cols`

### LoadingState

```astro
<LoadingState variant="inline" type="spinner" size="sm" />
<LoadingState variant="centered" type="spinner" size="lg" />
<LoadingState variant="inline" type="skeleton" />
```

**Variantes:** `inline`, `centered`  
**Tipos:** `spinner`, `skeleton`  
**Tamaños:** `sm`, `md`, `lg`

### PageTransition

```astro
<PageTransition animation="fade-up">
  <!-- contenido -->
</PageTransition>
```

**Animaciones:** `fade-up`, `fade-in`, `scale`, `slide`  
**Duración:** Configurable via props

### AnimatedCounter

```astro
<AnimatedCounter value={75} duration={1000} />
```

**Props:** `value`, `duration`, `easing`

---

## Instrucciones para Desplegar

### Agentes Paralelos

5 agentes pueden ejecutarse en paralelo:

- **Agente 1:** admin/workouts, admin/chat, admin/clinical
- **Agente 2:** admin/diets, admin/progress, admin/clients, admin/trainers
- **Agente 3:** register, recover
- **Agente 4:** client/chat, client/support, client/workouts, client/diets, client/progress
- **Agente 5:** trainer/chat, trainer/clients, trainer/diets, trainer/workouts

### Checklist por Página

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

### Comandos de Validación

```bash
# Verificar que no hay errores de compilación
npx astro check

# Ejecutar tests unitarios
npm test

# Ejecutar tests e2e
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

- **Documentación de componentes:** Ver `docs/03_design_system.md`
- **Guía de desarrollo:** Ver `docs/09_desarrollo_y_workflow.md`
- **Tests de componentes:** `tests/unit/components/`
- **Ejemplos de uso:** Ver páginas ya migradas (login, dashboard)

---

**Documento creado:** 2026-07-25  
**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit