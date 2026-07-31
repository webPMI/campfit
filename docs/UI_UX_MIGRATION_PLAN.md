# CampFit Motion System — Plan de Migración Completo

## Estado Actual: 7/34 páginas mejoradas (21%)

### Prioridades

#### 🔴 ALTA (tienen `animate-pulse` manual)
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

#### 🟡 MEDIA (tienen `animate-spin` o texto "Cargando...")
| Página | Patrón | Acción |
|--------|--------|--------|
| `auth/recover.astro` | `animate-spin` | añadir `<PageTransition>` |
| `admin/clients.astro` | "Cargando..." | Reemplazar con `<LoadingState variant="inline" type="skeleton">` |
| `admin/trainers.astro` | "Cargando..." | Reemplazar con `<LoadingState variant="inline" type="skeleton">` |
| `client/support.astro` | spinner | Reemplazar con `<LoadingState>` |
| `client/workouts.astro` | spinner | Reemplazar con `<LoadingState>` |
| `client/diets.astro` | spinner | Reemplazar con `<LoadingState>` |
| `client/progress.astro` | spinner | Reemplazar con `<LoadingState>` |
| `trainer/clients.astro` | spinner | Reemplazar con `<LoadingState>` |
| `trainer/diets.astro` | spinner | Reemplazar con `<LoadingState>` |
| `trainer/workouts.astro` | spinner | Reemplazar con `<LoadingState>` |

#### 🟢 BAJA (ya ok o sin loading evidente)
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

### Patrón de Migración (1 línea cada cambio)

```astro
---
// 1. Añadir import
import PageTransition from '@/components/PageTransition.astro';
import SkeletonGroup from '@/components/SkeletonGroup.astro';
import LoadingState from '@/components/LoadingState.astro';
import Skeleton from '@/components/Skeleton.astro';
---

// 2. Envolver contenido
<PageTransition animation="fade-up">
  <!-- contenido existente -->
</PageTransition>

// 3. Reemplazar animate-pulse manual
// ANTES:
<div class="animate-pulse rounded bg-[var(--surface-3)] h-4 w-24"></div>
// DESPUÉS:
<Skeleton variant="text" width="96px" height="16px" />

// 4. Reemplazar spinners inline
// ANTES:
<svg class="h-5 w-5 animate-spin"><circle .../></svg>
// DESPUÉS:
<LoadingState variant="inline" type="spinner" size="sm" />

// 5. Reemplazar textos "Cargando..."
// ANTES:
<p class="text-sm text-[var(--text-tertiary)]">{t('admin.loading')}</p>
// DESPUÉS:
<LoadingState variant="inline" type="skeleton" />
```

### Agentes Desplegados

Ver `agents/__master.md` para coordinar agentes paralelos.
</write_to_file>
</write_to_file>