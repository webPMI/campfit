# 🪜 Estrategia de Implementación Incremental - CampFit 2.0

## Filosofía: Pasos de Bebé 🚶

Cada paso debe:
1. **Dejar el proyecto en un estado funcional** (`npm run dev` funciona)
2. **Ser verificable** (puedes ver el resultado en el navegador)
3. **Ser testeable** (tests unitarios pasan)
4. **Ser reversible** (si algo falla, sabes exactamente qué lo causó)
5. **Tener un commit atómico** (un solo cambio por commit)

---

## 🔵 Fase 0: Setup (Micro-pasos)

### Paso 0.1: Crear proyecto Astro vacío
```bash
npm create astro@latest campfit-astro -- --template basics --typescript strict
cd campfit-astro
npm run dev
```
✅ **Verificar:** Abrir `http://localhost:4321` → Ver página en blanco de Astro

### Paso 0.2: Instalar dependencias base
```bash
# Instalar dependencias de producción
npm install react@19 react-dom@19 nanostores@1 @nanostores/react@1 lucide-react@1 date-fns@4 firebase@11 firebase-admin@13 @astrojs/react@4 @tailwindcss/vite@4

# Instalar dependencias de desarrollo
npm install -D vitest@3 @testing-library/react@16 @testing-library/jest-dom@6 eslint@9 prettier@3 prettier-plugin-astro@0.14 @types/react@19 @types/react-dom@19 @astrojs/check@0.9 typescript@5
```
✅ **Verificar:** `npm ls react` → Muestra react@19

### Paso 0.3: Configurar Tailwind CSS 4
Crear `astro.config.mjs` con `@tailwindcss/vite` y `output: 'hybrid'`
Crear `src/styles/global.css` con `@import "tailwindcss"` y tokens `@theme`
✅ **Verificar:** Poner `className="text-primary"` en un elemento → Ver color verde neón

### Paso 0.4: Configurar TypeScript paths
Actualizar `tsconfig.json` con paths `@/*`, `@components/*`, etc.
✅ **Verificar:** `npm run type-check` → Sin errores

### Paso 0.5: Crear estructura de directorios
```bash
mkdir -p src/{components/{ui,common},core/{firebase,stores,services},features/{auth,client,admin,chat},layouts,pages/{api,client,admin,auth},types,styles}
mkdir -p workers public
```
✅ **Verificar:** `ls src/` → Ver todos los directorios

### Paso 0.6: Configurar Firebase
Crear `src/core/firebase/config.ts` con `initializeApp`
Crear `src/env.d.ts` con tipos de `ImportMetaEnv`
✅ **Verificar:** `npm run dev` → Sin errores de import

### Paso 0.7: Configurar ESLint + Prettier
Crear `.eslintrc.cjs` y `.prettierrc`
✅ **Verificar:** `npm run lint` → Sin errores

### Paso 0.8: Verificar build de producción
```bash
npm run build
npm run preview
```
✅ **Verificar:** `npm run build` → Sin errores. `npm run preview` → App funcionando en producción

### Paso 0.9: Commit inicial
```bash
git init
git add .
git commit -m "feat(setup): initialize project with Astro + React + Tailwind CSS 4"
```

---

## 🟢 Fase 1: Design System (Micro-pasos)

### Paso 1.1: Componente Button
Crear `src/components/ui/Button.tsx` con variantes (primary, secondary, outline, ghost, danger) y tamaños (sm, md, lg)
✅ **Verificar:** Importar Button en una página y ver que se renderiza correctamente

### Paso 1.2: Componente Input
Crear `src/components/ui/Input.tsx` con label, error, icon
✅ **Verificar:** Ver Input con label y estado de error

### Paso 1.3: Componente Spinner + Badge
Crear ambos componentes atómicos
✅ **Verificar:** Ver Spinner animado y Badge con variantes de color

### Paso 1.4: Componente Card + Modal
Crear Card (contenedor reutilizable) y Modal (con overlay, animación)
✅ **Verificar:** Abrir Modal con botón y cerrar con overlay click

### Paso 1.5: Componente Select + Switch + Slider
Crear componentes de formulario restantes
✅ **Verificar:** Interactuar con cada uno en el navegador

### Paso 1.6: Componentes moleculares (StatCard, ProgressBar, AlertBanner, EmptyState)
Crear componentes compuestos
✅ **Verificar:** Ver StatCard con icono y ProgressBar animada

### Paso 1.7: Layouts base
Crear `AuthLayout.astro`, `ClientLayout.astro` (con BottomNav), `AdminLayout.astro` (con Sidebar)
✅ **Verificar:** Navegar entre layouts en el navegador

### Paso 1.8: Tests de componentes UI
Crear tests para Button, Input, Modal
✅ **Verificar:** `npm run test` → Tests pasando

### Paso 1.9: Commit
```bash
git add .
git commit -m "feat(ui): add design system components and layouts"
```

---

## 🟡 Fase 2: Auth (Micro-pasos)

### Paso 2.1: Store de auth
Crear `src/core/stores/authStore.ts` con `$user`, `$authLoading`, `$authError`
✅ **Verificar:** Test unitario del store (`$user.get()` → null inicialmente)

### Paso 2.2: Servicio de Firebase Auth
Crear `src/features/auth/services/authService.ts` con `loginUser`, `registerUser`, `logoutUser`
✅ **Verificar:** Test unitario del servicio (mockeando Firebase)

### Paso 2.3: Página de Login
Crear `src/pages/auth/login.astro` con formulario de email + password
Integrar con authStore y authService
✅ **Verificar:** `http://localhost:4321/auth/login` → Ver formulario de login

### Paso 2.4: Página de Register
Crear `src/pages/auth/register.astro` con formulario de registro
✅ **Verificar:** `http://localhost:4321/auth/register` → Ver formulario de registro

### Paso 2.5: Página de Recover Password
Crear `src/pages/auth/recover.astro`
✅ **Verificar:** `http://localhost:4321/auth/recover` → Ver formulario de recuperación

### Paso 2.6: AuthGuard + RoleGuard
Crear componentes de protección de rutas
✅ **Verificar:** Intentar acceder a `/client/dashboard` sin auth → Redirige a `/auth/login`

### Paso 2.7: Redirección post-login
Implementar lógica de redirección según rol (admin → /admin/panel, client → /client/dashboard)
✅ **Verificar:** Login con usuario admin → Redirige a /admin/panel

### Paso 2.8: Tests de auth
Tests unitarios para authStore y authService
✅ **Verificar:** `npm run test` → Tests de auth pasando

### Paso 2.9: Commit
```bash
git add .
git commit -m "feat(auth): implement login, register, and password recovery"
```

---

## 🟠 Fase 3: Cliente - Dashboard (Micro-pasos)

### Paso 3.1: Store de dashboard
Crear `src/core/stores/dashboardStore.ts`
✅ **Verificar:** Test unitario del store

### Paso 3.2: Servicio de dashboard
Crear `src/features/client/services/dashboardService.ts` con queries a Firestore
✅ **Verificar:** Test unitario del servicio

### Paso 3.3: Página de Dashboard (estructura vacía)
Crear `src/pages/client/dashboard.astro` con layout ClientLayout
✅ **Verificar:** `http://localhost:4321/client/dashboard` → Ver layout con BottomNav

### Paso 3.4: StatCards en dashboard
Agregar StatCard de progreso de rutina y adherencia de dieta
✅ **Verificar:** Ver cards con datos mockeados

### Paso 3.5: Quick Actions
Agregar botones "Entrenar hoy" y "Próxima comida"
✅ **Verificar:** Click en "Entrenar hoy" → Navega a /client/workouts

### Paso 3.6: AlertBanner
Agregar AlertBanner para llamados de atención activos
✅ **Verificar:** Ver banner rojo si hay alertas

### Paso 3.7: Streams en tiempo real
Conectar dashboard a Firestore con `onSnapshot`
✅ **Verificar:** Datos se actualizan en tiempo real al cambiar Firestore

### Paso 3.8: Manejo de 4 estados
Implementar loading, empty, error, success en dashboard
✅ **Verificar:** Probar cada estado (desconectar Firestore para ver error state)

### Paso 3.9: Tests + Commit
```bash
git add .
git commit -m "feat(client): implement dashboard with real-time data"
```

---

## 🟣 Fase 4: Cliente - Rutinas, Dietas, Progreso (Micro-pasos)

### Paso 4.1: Visualizador de Rutinas (estructura)
Crear página `/client/workouts` con TabBar de días
✅ **Verificar:** Ver tabs de días de la semana

### Paso 4.2: Lista de ejercicios
Mostrar ejercicios del día seleccionado con Accordion
✅ **Verificar:** Expandir/colapsar ejercicios

### Paso 4.3: Modal RPE
Implementar flujo de "Marcar rutina completada" → Modal con Slider RPE
✅ **Verificar:** Completar rutina y ver modal

### Paso 4.4: Visualizador de Dietas
Crear página `/client/diets` con TabBar de comidas
✅ **Verificar:** Ver comidas del día con checkboxes

### Paso 4.5: Módulo de Progreso (peso)
Crear página `/client/progress` con pestaña de peso
✅ **Verificar:** Ver LineChart de evolución de peso

### Paso 4.6: Galería de fotos
Implementar pestaña de fotos con galería
✅ **Verificar:** Ver fotos de progreso en grid

### Paso 4.7: Tests + Commit
```bash
git add .
git commit -m "feat(client): add workouts, diets, and progress modules"
```

---

## 🔴 Fase 5: Chat + Chatbot (Micro-pasos)

### Paso 5.1: Store de chat
Crear `src/core/stores/chatStore.ts`
✅ **Verificar:** Test unitario del store

### Paso 5.2: Servicio de chat
Crear `src/features/chat/services/chatService.ts` con queries a Firestore usando `participants` + `array-contains`
✅ **Verificar:** Test unitario del servicio

### Paso 5.3: Página de Chat 1:1
Crear `/client/chat` con ChatBubble y ChatInput
✅ **Verificar:** Ver interfaz de chat con burbujas

### Paso 5.4: Stream de mensajes en tiempo real
Conectar chat a Firestore con `onSnapshot`
✅ **Verificar:** Mensajes aparecen en tiempo real

### Paso 5.5: Sistema de "Llamados de Atención"
Implementar alertas especiales en el chat
✅ **Verificar:** Enviar alerta desde admin → Ver como alerta roja en cliente

### Paso 5.6: Chatbot de Soporte
Crear `/client/support` con FAQs predefinidas
✅ **Verificar:** Preguntar "cómo registro mi peso" → Obtener respuesta automática

### Paso 5.7: Tests + Commit
```bash
git add .
git commit -m "feat(chat): implement 1:1 chat, alerts, and FAQ chatbot"
```

---

## 🟤 Fase 6: Admin (Micro-pasos)

### Paso 6.1: Dashboard de Admin
Crear `/admin/panel` con cards de resumen (clientes activos, alertas, etc.)
✅ **Verificar:** Ver dashboard con datos mockeados

### Paso 6.2: Gestión de Usuarios
Crear `/admin/users` con DataTable, búsqueda, paginación
✅ **Verificar:** Buscar usuario por nombre

### Paso 6.3: Modal de edición de usuario
Implementar cambio de rol, asignación de trainer
✅ **Verificar:** Editar usuario y ver cambios guardados

### Paso 6.4: Editor de Rutinas
Crear `/admin/workouts/editor` con selección de ejercicios
✅ **Verificar:** Crear rutina con ejercicios

### Paso 6.5: Editor de Dietas
Crear `/admin/diets/editor` con plantillas por somatotipo
✅ **Verificar:** Crear dieta desde plantilla

### Paso 6.6: Bandeja de Chat
Crear `/admin/chat/inbox` con filtros (todos, no leídos, alertas)
✅ **Verificar:** Ver mensajes de todos los clientes

### Paso 6.7: Visor de Progreso
Crear `/admin/progress/view` con selector de cliente
✅ **Verificar:** Ver progreso de cualquier cliente

### Paso 6.8: Tests + Commit
```bash
git add .
git commit -m "feat(admin): implement admin panel, user management, and editors"
```

---

## ⚪ Fase 7: Reglas de Seguridad + Índices (Micro-pasos)

### Paso 7.1: Desplegar reglas de seguridad de Firestore
Usar Firebase MCP o Firebase Console para desplegar las reglas definidas en `05_reglas_seguridad.md`
✅ **Verificar:** Verificar en Firebase Console que las reglas están activas

### Paso 7.2: Crear índices compuestos de Firestore
Usar Firebase MCP o Firebase Console para crear los índices definidos en `16_api_contracts.md` (sección 4)
✅ **Verificar:** Las queries con `orderBy` + `where` funcionan sin errores de índice faltante

### Paso 7.3: Tests + Commit
```bash
git add .
git commit -m "feat(firestore): add security rules and composite indexes"
```

---

## ⚪ Fase 8: Multimedia + R2 (Micro-pasos)

### Paso 8.1: Cloudflare Worker para URLs pre-firmadas
Crear worker en `workers/upload-worker.ts`
✅ **Verificar:** `curl` al worker → Obtener URL pre-firmada

### Paso 8.2: FileUploader component
Mejorar FileUploader con barra de progreso
✅ **Verificar:** Subir archivo y ver progreso

### Paso 8.3: Subida de fotos de progreso
Integrar galería con R2
✅ **Verificar:** Subir foto → Ver en galería

### Paso 8.4: Subida de videos de ejercicios
Integrar VideoPlayer con R2
✅ **Verificar:** Ver video de demostración

### Paso 8.5: Tests + Commit
```bash
git add .
git commit -m "feat(media): add R2 upload with Cloudflare Workers"
```

---

## ⚪ Fase 9: Testing + Calidad (Micro-pasos)

### Paso 9.1: Tests unitarios de servicios
### Paso 8.4: Auditoría Lighthouse
✅ **Verificar:** Lighthouse > 80 en móvil y desktop

### Paso 8.5: Commit
```bash
git add .
git commit -m "test: add unit and E2E tests with quality audit"
```

---

## ⚪ Fase 9: Mobile + Deploy (Micro-pasos)

### Paso 9.1: Capacitor setup
```bash
npx cap init CampFit com.campfit.app
npx cap add android
```
✅ **Verificar:** `npx cap open android` → Android Studio abre el proyecto

### Paso 9.2: Firebase Hosting deploy
```bash
firebase init hosting
npm run build
firebase deploy --only hosting
```
✅ **Verificar:** `https://campfit.web.app` → App funcionando

### Paso 9.3: CI/CD con GitHub Actions
Crear `.github/workflows/ci.yml`
✅ **Verificar:** Push a main → GitHub Actions corre lint + test + build

### Paso 9.4: Monitoreo (Sentry + PostHog)
✅ **Verificar:** Error en app → Aparece en Sentry

### Paso 9.5: Commit final
```bash
git add .
git commit -m "feat(infra): add CI/CD, mobile build, and monitoring"
```

---

## 📋 Checklist de Verificación Rápida por Paso

Cada vez que completes un paso, verifica:

```
[ ] npm run dev → Funciona sin errores
[ ] npm run type-check → Sin errores de tipos
[ ] npm run test → Tests pasan (si aplica)
[ ] npm run lint → Sin errores
[ ] Cambio visible en navegador (si aplica)
[ ] Commit con formato conventional
```

---

## 🚨 Regla de Oro: Si algo falla, retrocede

```
Paso N: Implementas feature X
  ↓
❌ npm run dev falla
  ↓
git checkout -- .  # Deshacer cambios
  ↓
Paso N (revisado): Implementas feature X con corrección
  ↓
✅ Todo funciona
  ↓
git commit -m "feat(x): ..."
```

---

## 📊 Progreso Visual

```
Fase 0: Setup          [████████████████████████] 10/10 pasos ✅
Fase 1: Design System  [████████░░░░░░░░░░░░░░░░]  4/9 pasos
Fase 2: Auth           [░░░░░░░░░░░░░░░░░░░░░░░░]  0/9 pasos
Fase 3: Dashboard      [░░░░░░░░░░░░░░░░░░░░░░░░]  0/9 pasos
Fase 4: Cliente        [░░░░░░░░░░░░░░░░░░░░░░░░]  0/7 pasos
Fase 5: Chat           [░░░░░░░░░░░░░░░░░░░░░░░░]  0/7 pasos
Fase 6: Admin          [░░░░░░░░░░░░░░░░░░░░░░░░]  0/8 pasos
Fase 7: Multimedia     [░░░░░░░░░░░░░░░░░░░░░░░░]  0/5 pasos
Fase 8: Testing        [░░░░░░░░░░░░░░░░░░░░░░░░]  0/5 pasos
Fase 9: Mobile/Deploy  [░░░░░░░░░░░░░░░░░░░░░░░░]  0/5 pasos
```

Cada paso completado = 1 cuadrado lleno. ¡Ver el progreso visualmente motiva!
