# 🚀 CampFit Motion System — Plan de Acción Final

## Estado: 34 páginas analizadas | 7 mejoradas | 27 pendientes

### Resumen de Cambios por Grupo

```
GRUPO 1 — Admin Pages (8 páginas)
├── admin/dashboard.astro ✅ LISTO
├── admin/users.astro ✅ LISTO
├── admin/workouts.astro 🔄 3 animate-pulse + 2 transition-all → cf-transition
├── admin/chat.astro 🔄 2 animate-pulse + 1 hover → cf-hover-lift
├── admin/clinical.astro 🔄 2 animate-pulse + focus:shadow → cf-focus-ring
├── admin/diets.astro 🔄 2 animate-pulse + 2 inputs → cf-focus-ring
├── admin/progress.astro 🔄 2 animate-pulse + 2 inputs → cf-focus-ring
├── admin/clients.astro 🔄 "Cargando..." → LoadingState skeleton
└── admin/trainers.astro 🔄 "Cargando..." → LoadingState skeleton

GRUPO 2 — Client Pages (8 páginas)
├── client/dashboard.astro ✅ LISTO (87 líneas animate-pulse eliminadas)
├── client/chat.astro 🔄 2 animate-pulse + spinner → LoadingState
├── client/support.astro 🔄 spinner → LoadingState
├── client/workouts.astro 🔄 spinner + animate-pulse → LoadingState
├── client/diets.astro 🔄 spinner → LoadingState
├── client/progress.astro 🔄 spinner → LoadingState
├── client/medical-profile.astro 🟢 BAJA
└── client/settings.astro 🟢 BAJA

GRUPO 3 — Trainer Pages (6 páginas)
├── trainer/dashboard.astro ✅ LISTO (3 spinners eliminados)
├── trainer/chat.astro 🔄 2 animate-pulse → Skeleton
├── trainer/clients.astro 🔄 spinner → LoadingState
├── trainer/diets.astro 🔄 spinner → LoadingState
└── trainer/workouts.astro 🔄 spinner → LoadingState

GRUPO 4 — Auth Pages (3 páginas)
├── login.astro ✅ LISTO (PageTransition scale)
├── register.astro 🔄 1 animate-pulse + 5 transition-all → cf-transition
└── recover.astro 🔄 1 spinner + PageTransition
```

### Optimizaciones a Aplicar (además de migración)

| Optimización | Afecta a | Reemplazar por |
|-------------|----------|----------------|
| `transition-all duration-200` | 12 inputs/botones | `cf-transition` |
| `active:scale-[0.98]` | 8 botones | `cf-press` |
| `focus:shadow-[0_0_0_3px_var(--brand-dim)]` | 10 inputs | `cf-focus-ring` |
| `hover:scale-[1.02]` en cards | 5 cards | `cf-hover-lift` |
| `animate-fade-in` redundante | 8 wrappers | Quitar (PageTransition lo reemplaza) |

### Instrucciones para Desplegar

```bash
# 5 agentes pueden ejecutarse en paralelo:
# Agente 1: admin/workouts, admin/chat, admin/clinical
# Agente 2: admin/diets, admin/progress, admin/clients, admin/trainers
# Agente 3: register, recover
# Agente 4: client/chat, client/support, client/workouts, client/diets, client/progress
# Agente 5: trainer/chat, trainer/clients, trainer/diets, trainer/workouts

# Cada agente debe:
# 1. read_file de la página
# 2. replace_in_file: añadir imports
# 3. replace_in_file: reemplazar animate-pulse con <Skeleton>
# 4. replace_in_file: reemplazar spinners con <LoadingState>
# 5. replace_in_file: envolver con <PageTransition>
# 6. replace_in_file: optimizar transition-all, active:scale, focus:shadow

# Verificar: npx astro check → 0 errors