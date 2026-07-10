# 🤖 Agent Instructions - CampFit 2.0

Instrucciones para que agentes de IA implementen el proyecto de forma autónoma, eficiente y sin desperdiciar tokens.

---

## ⚡ Regla #1: Optimización de Tokens

1. **Lee solo lo necesario** - Usa `start_line`/`end_line` para leer secciones específicas.
2. **No preguntes, decide** - Si hay ambigüedad menor, toma la decisión siguiendo las convenciones.
3. **Batch operations** - Crea múltiples archivos independientes en paralelo.
4. **No re-leas lo que ya escribiste** - Confía en tu contexto.
5. **Usa replace_in_file para cambios pequeños** - No re-escribas archivos completos.

---

## 🏛️ Arquitectura: Monolitos Separados

El proyecto usa **monolitos independientes** en `packages/`. Cada monolito es autocontenido:

```
packages/
├── shared/     # 📦 Dependencia de TODOS - UI kit, Firebase, tipos base
├── auth/       # 🔐 Solo páginas /auth/*
├── client/     # 👤 Solo páginas /client/*
├── trainer/    # 🏋️ Solo páginas /trainer/* (futuro)
└── admin/      # ⚙️ Solo páginas /admin/*
```

### Reglas de Oro para Multi-Agente

1. **Un agente = un monolito** - Cada agente trabaja en UN solo `packages/*` a la vez
2. **shared se construye primero** - shared NO depende de nadie, pero todos dependen de shared
3. **Sin tocar monolitos ajenos** - El agente de `client` NO modifica `admin` ni viceversa
4. **shared es solo lectura para agentes** - Si necesitas algo en shared, créalo al inicio o pídelo
5. **Commits atómicos por monolito** - `feat(client): add workout viewer` (no mezcles monolitos)

---

## 🔒 Protocolo de Concurrencia para Multi-Agente

### ⚠️ El Problema
Dos agentes trabajando en paralelo **NUNCA** deben modificar el mismo archivo simultáneamente. Esto aplica tanto a código como a documentación.

### Reglas de Lock de Archivos

1. **Cada monolito tiene su `LOCK`** - Al empezar a trabajar, el agente crea un archivo de lock:
   ```
   packages/{monolito}/.agent-lock
   ```
   Contenido: `agent-{id}:{timestamp}:{feature-name}`

2. **Verificar antes de escribir** - Antes de modificar cualquier archivo, verificar:
   ```bash
   # ¿Existe lock en este monolito?
   ls packages/{monolito}/.agent-lock 2>/dev/null && echo "LOCKED" || echo "FREE"

   # ¿Existe lock en nuevo_proyecto/?
   ls nuevo_proyecto/.agent-lock 2>/dev/null && echo "LOCKED" || echo "FREE"
   ```

3. **Lock de documentación** - Los archivos en `nuevo_proyecto/` tienen su propio lock:
   ```
   nuevo_proyecto/.agent-lock
   ```
   - Cualquier agente que necesite MODIFICAR documentación debe tomar este lock
   - Si el lock existe, esperar o abortar (nunca sobrescribir)
   - Lectura de documentación NO requiere lock (solo escritura)

4. **Liberar locks al terminar** - Al finalizar el feature, eliminar el lock:
   ```bash
   rm packages/{monolito}/.agent-lock
   rm nuevo_proyecto/.agent-lock  # si se tomó
   ```

### Mapa de Archivos por Agente

| Agente | Monolito | Archivos que MODIFICA | Archivos que SOLO LEE |
|--------|----------|----------------------|----------------------|
| **A** | `shared` | `packages/shared/**` | `nuevo_proyecto/*` |
| **B** | `auth` | `packages/auth/**`, `nuevo_proyecto/08_modulo_autenticacion.md` | `nuevo_proyecto/*` |
| **C** | `client` | `packages/client/**`, `nuevo_proyecto/09_modulo_cliente.md` | `nuevo_proyecto/*` |
| **D** | `admin` | `packages/admin/**`, `nuevo_proyecto/10_modulo_administracion.md` | `nuevo_proyecto/*` |
| **E** | `workers/` | `workers/**`, `nuevo_proyecto/11_integraciones_operaciones.md` | `nuevo_proyecto/*` |

**Regla:** Si dos agentes tienen el mismo archivo en "Archivos que MODIFICA", NUNCA ejecutarlos en paralelo.

### Lock Jerárquico

```
nuevo_proyecto/.agent-lock  ← Lock GLOBAL de documentación
packages/shared/.agent-lock       ← Lock de shared
packages/auth/.agent-lock         ← Lock de auth
packages/client/.agent-lock       ← Lock de client
packages/admin/.agent-lock        ← Lock de admin
```

**Flujo correcto:**
1. Agente C (client) necesita modificar `09_modulo_cliente.md`
2. Verifica: `ls nuevo_proyecto/.agent-lock` → no existe → FREE
3. Verifica: `ls packages/client/.agent-lock` → no existe → FREE
4. Crea ambos locks
5. Trabaja en client y su documentación
6. Al terminar: elimina ambos locks

**Flujo incorrecto (EVITAR):**
1. Agente C y Agente D intentan modificar documentación al mismo tiempo
2. Ambos verifican → FREE (porque ninguno ha creado el lock aún)
3. ❌ **RACE CONDITION** - Ambos escriben, uno sobrescribe al otro

**Solución:** El lock de documentación es GLOBAL. Solo un agente puede modificar docs a la vez. Los demás deben esperar o trabajar en código primero.

### Timeout de Locks
- Un lock no debe durar más de 30 minutos sin actividad
- Si un lock tiene más de 30 minutos, se considera "stale" y puede ser eliminado por otro agente
- El timestamp en el lock permite detectar locks stale


---

## 1. Orden de Lectura (IMPORTANTE)

Lee SOLO estos documentos en este orden:

```
1. nuevo_proyecto/00_indice.md        → 30s - Visión general
2. nuevo_proyecto/02_requisitos_funcionales.md → 2min - Qué construir
3. nuevo_proyecto/03_arquitectura_tecnica.md   → 2min - Cómo está organizado
4. nuevo_proyecto/04_modelo_datos_firestore.md → 3min - Estructura de datos
5. nuevo_proyecto/06_design_system.md → 2min - Componentes UI
6. nuevo_proyecto/07_flujos_navegacion.md → 2min - Rutas
7. nuevo_proyecto/13_setup_guide.md   → 3min - Configuración inicial
8. nuevo_proyecto/15_api_contracts.md → 2min - APIs
9. [Módulo específico a implementar]       → 3min
```

**Total estimado: ~20 minutos de lectura antes de escribir código.**

---

## 2. Pipeline de Trabajo Multi-Agente

### Fase 0: shared (Agente A - ~1h)
```
1. Crear workspace raíz con npm workspaces
2. Crear packages/shared/ con package.json (@campfit/shared)
3. Implementar componentes UI desde 06_design_system.md:
   - Button, Input, Card, Badge, Modal, Avatar, Spinner
4. Configurar Firebase (firebase/config.ts)
5. Crear stores base ($user, $authLoading, $theme)
6. Crear servicios compartidos (logger, r2, chatbot)
7. Crear tipos globales (User, Workout, Diet, Message, ProgressLog)
8. Crear layouts base (AuthLayout, ClientLayout, AdminLayout)
9. Configurar Tailwind, CSS global, tokens
10. Commit: "feat(shared): add UI kit, Firebase config, base stores and types"
```

### Fase 1: auth (Agente B - ~1.5h) ← Paralelo con Fase 2
```
1. Crear packages/auth/ con package.json (@campfit/auth)
2. Implementar authService (login, register, recover, logout)
3. Implementar authStore ($user, $authLoading, $authError)
4. Implementar guards (AuthGuard, RoleGuard, routeGuards)
5. Crear páginas: /auth/login, /auth/register, /auth/recover
6. Tests unitarios
7. Commit: "feat(auth): implement login, register, and password recovery"
```

### Fase 2: client (Agente C - ~4h) ← Paralelo con Fase 1
```
1. Crear packages/client/ con package.json (@campfit/client)
2. Implementar servicios: workoutService, dietService, progressService,
   chatService, supportService
3. Implementar stores: $workouts, $diets, $progress, $messages
4. Crear páginas:
   - /client/medical-profile (onboarding)
   - /client/dashboard (resumen diario)
   - /client/workouts (visor de rutinas)
   - /client/diets (visor de dietas)
   - /client/progress (peso + fotos)
   - /client/chat (chat 1:1)
   - /client/support (chatbot FAQ)
5. Tests unitarios
6. Commit: "feat(client): implement dashboard, workouts, diets, progress, and chat"
```

### Fase 3: admin (Agente D - ~3h) ← Paralelo con Fase 2
```
1. Crear packages/admin/ con package.json (@campfit/admin)
2. Implementar servicios: userService, workoutAdminService,
   dietAdminService, chatAdminService
3. Implementar stores: $users, $allWorkouts, $allDiets, $inbox
4. Crear páginas:
   - /admin/panel (dashboard admin)
   - /admin/users (gestión usuarios)
   - /admin/workouts/index (listado rutinas)
   - /admin/workouts/editor (editor rutinas)
   - /admin/diets/index (listado dietas)
   - /admin/diets/editor (editor dietas)
   - /admin/chat/inbox (bandeja mensajes)
   - /admin/progress/view (visor progreso)
5. Tests unitarios
6. Commit: "feat(admin): implement admin panel, user management, and chat inbox"
```

### Fase 4: Integraciones + Deploy (Agente E - ~2h)
```
1. Cloudflare Workers (R2 upload, chatbot, validate-medical)
2. Reglas de seguridad Firestore
3. CI/CD con GitHub Actions
4. Capacitor build
5. Tests E2E
6. Commit: "feat(infra): add Cloudflare Workers, CI/CD, and E2E tests"
```

---

## 3. División del Trabajo entre Agentes

| Agente | Fase | Monolito | Qué implementa | Docs a leer |
|--------|------|----------|----------------|-------------|
| **A** | 0 | `shared` | UI kit, Firebase, stores base, tipos, layouts | 03, 04, 06, 13 |
| **B** | 1 | `auth` | Login, register, recover, guards | 08, 02 (RF-01) |
| **C** | 2 | `client` | Dashboard, workouts, diets, progress, chat | 09, 02 (RF-03 a RF-08) |
| **D** | 3 | `admin` | Panel, users, editores, inbox, progress view | 10, 02 (RF-09) |
| **E** | 4 | `workers/` | Cloudflare Workers, CI/CD, E2E | 11, 12, 15 |

### Ejecución en el tiempo
```
Tiempo:  0h    1h    2h    3h    4h    5h    6h    7h    8h    9h
Agente A [████████████] (shared)
Agente B        [██████████████████] (auth)
Agente C        [████████████████████████████████████] (client)
Agente D              [████████████████████████████] (admin)
Agente E                                            [████████████] (infra)
```

---

## 4. Estructura de cada Monolito

```
packages/{monolito}/
├── src/
│   ├── components/      # Componentes React del monolito
│   ├── services/        # Lógica de negocio del monolito
│   ├── stores/          # Nanostores del monolito
│   ├── pages/           # Páginas Astro del monolito
│   └── types.ts         # Interfaces específicas del monolito
├── package.json         # name: @campfit/{monolito}
└── tsconfig.json
```

### Reglas de Importación
- ✅ `import { Button } from '@campfit/shared'` → Correcto
- ✅ `import { authService } from '../services/authService'` → Correcto (local)
- ❌ `import { something } from '@campfit/admin'` → Prohibido (desde client)
- ❌ `import { something } from '../../admin/...'` → Prohibido (cross-monolito)

---

## 5. MCP Servers Disponibles

| MCP | Propósito | Cuándo usarlo |
|-----|-----------|---------------|
| **@firebase-mcp** | Firebase Auth + Firestore | Para crear colecciones, índices, reglas de seguridad |
| **@github-mcp** | GitHub | Para crear repo, PRs, issues |
| **@filesystem-mcp** | File system | Operaciones de archivos |

---

## 6. Formato de Commits

```
feat(auth): add login page with form validation
feat(client): add workout viewer with RPE modal
feat(admin): add user management with role change
fix(chat): resolve message ordering issue
refactor(shared): extract Button component
test(auth): add unit tests for auth store
docs: update firestore security rules
```

Cada commit debe ser atómico y referenciar SOLO un monolito.

---

## 7. Checklist de Calidad (Antes de dar por terminado)

- [ ] ¿Tipos explícitos en todas partes? (sin `any`)
- [ ] ¿Los 4 estados cubiertos? (loading, empty, error, success)
- [ ] ¿Sin hardcode de URLs/keys?
- [ ] ¿Tests unitarios para servicios y stores?
- [ ] ¿Componentes UI separados de lógica?
- [ ] ¿Sigue las convenciones de nombrado?
- [ ] ¿Logger usado en lugar de console.log?
- [ ] ¿ErrorBoundary wrapping cada feature?
- [ ] ¿JSDoc en funciones públicas?
- [ ] ¿Cleanup de suscripciones (unsubscribe)?
- [ ] ¿Archivos < 300 líneas?
- [ ] ¿Commit con formato correcto?
- [ ] ¿Importaciones solo desde @campfit/shared o local? (sin cross-monolito)

---

> **📌 Convenciones de código, Git workflow, testing y comandos:** Ver `12_guia_desarrollo_testing.md`
> **📌 Golden Rules:** Ver `.clinerules` para las reglas de oro (nunca usar `any`, 4 estados, error boundaries, etc.)
> **📌 Sistema de logging, Debug Store y Error Boundary:** Ver `.clinerules` para las implementaciones completas con código
> **📌 Integraciones (Firebase, R2, Capacitor, Workers, CI/CD, Sentry, PostHog):** Ver `11_integraciones_operaciones.md`
> **📌 Protocolo de documentación:** Ver `18_protocolo_documentacion.md`
