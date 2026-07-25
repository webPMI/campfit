# CampFit 🏋️

> **Plataforma fitness todo-en-uno.** Entrenamiento personalizado, nutrición inteligente y seguimiento en tiempo real con tu entrenador.

---

## 🚀 Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Astro** | 7.x | Framework web (SSR con `@astrojs/node` standalone) |
| **Tailwind CSS** | 4.x | Estilos utilitarios con `@tailwindcss/vite` |
| **Firebase** | 11.x | Autenticación + Firestore (base de datos en tiempo real) |
| **Nanostores** | 1.x | Estado global reactivo (auth store) |
| **TypeScript** | 5.x | Tipado estricto en todo el proyecto |
| **Vitest** | 4.x | Tests unitarios |
| **Playwright** | 1.x | Tests end-to-end |

**Arquitectura:** Vanilla JS (sin React, sin librerías de UI). Componentes HTML renderizados desde JavaScript puro con streams en tiempo real de Firestore.

---

## 📁 Estructura del Proyecto

```
campfit-astro/
├── public/                  # Archivos estáticos
├── src/
│   ├── components/          # Componentes .astro reutilizables
│   │   ├── DecorativeBackground.astro
│   │   ├── LanguageSwitcher.astro
│   │   └── PublicPageLayout.astro
│   ├── layouts/             # Layouts por rol
│   │   ├── BaseLayout.astro
│   │   ├── AdminLayout.astro
│   │   ├── ClientLayout.astro
│   │   └── TrainerLayout.astro
│   ├── lib/                 # Utilidades compartidas (modularizadas)
│   │   ├── shared/          # ui, chat, logger, authGuard, i18n, profileService
│   │   ├── admin/           # Módulo admin (7 archivos modulares)
│   │   ├── trainer/         # Módulo trainer (10 archivos modulares)
│   │   ├── client/          # chatService, dietService, progressService, workoutService
│   │   ├── auth/            # roleRedirect
│   │   ├── helpers/         # userMappers
│   │   ├── firebase/        # auth, firestore (wrappers testing)
│   │   └── debug/           # firestoreDebug
│   ├── pages/               # Páginas (rutas)
│   │   ├── index.astro      # Landing page
│   │   ├── login.astro      # Inicio de sesión
│   │   ├── register.astro   # Registro
│   │   ├── recover.astro    # Recuperar contraseña
│   │   ├── dashboard.astro  # Dashboard post-login
│   │   ├── onboarding.astro # Onboarding inicial
│   │   ├── 404.astro        # Página no encontrada
│   │   ├── 500.astro        # Error del servidor
│   │   ├── admin/           # Panel de administración
│   │   │   ├── dashboard.astro
│   │   │   ├── users.astro
│   │   │   ├── clients.astro
│   │   │   ├── trainers.astro
│   │   │   └── settings.astro
│   │   ├── client/          # Panel de cliente
│   │   │   ├── dashboard.astro
│   │   │   ├── workouts.astro
│   │   │   ├── diets.astro
│   │   │   ├── progress.astro
│   │   │   ├── chat.astro
│   │   │   ├── support.astro
│   │   │   ├── settings.astro
│   │   │   └── medical-profile.astro
│   │   ├── trainer/         # Panel de entrenador
│   │   │   ├── dashboard.astro
│   │   │   ├── clients.astro
│   │   │   ├── workouts.astro
│   │   │   ├── diets.astro
│   │   │   ├── chat.astro
│   │   │   └── settings.astro
│   │   └── api/             # Endpoints API
│   ├── services/            # Servicios (Firebase)
│   │   ├── authService.ts   # Autenticación
│   │   └── adminService.ts  # Administración
│   ├── stores/              # Stores reactivos
│   │   └── authStore.ts     # Estado de autenticación (Nanostores)
│   ├── types/               # Tipos TypeScript
│   │   └── index.ts
│   └── i18n/                # Internacionalización (es/en)
│       ├── translations.ts
│       └── client.ts
├── tests/                   # Tests centralizados
│   ├── setup/               # Setup global (vitest, e2e)
│   ├── mocks/               # Mocks de Firebase (firebase, firestore)
│   ├── unit/                # Tests unitarios
│   │   ├── services/
│   │   ├── stores/
│   │   ├── lib/             # admin, auth, client, helpers, shared, trainer
│   │   └── utils/
│   ├── integration/         # Tests de integración
│   └── e2e/                 # Tests E2E (Playwright)
├── testing-agent/           # Documentación del agente de testing
│   ├── GUIDE.md
│   └── CHECKLIST.md
├── nuevo_proyecto/          # Documentación del proyecto
├── scripts/                 # Scripts para agentes IA
│   ├── agent-lock.sh
│   ├── setup.sh
│   ├── doctor.sh
│   ├── mcp-setup.sh
│   ├── check-context.sh
│   └── validate.sh
├── astro.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## ✨ Funcionalidades

### 🔐 Autenticación
- Login con email/contraseña
- Registro de nuevos usuarios
- Login con Google (popup)
- Recuperación de contraseña
- Persistencia de sesión (IndexedDB)
- Roles: `client`, `trainer`, `admin`

### 👤 Cliente
- Dashboard personal con progreso semanal
- Rutinas de entrenamiento asignadas por el trainer
- Plan nutricional con seguimiento de comidas
- Registro de progreso (peso, medidas, fotos)
- Chat directo con el entrenador
- Perfil médico
- Notificaciones en tiempo real de mensajes nuevos en el chat
- Marcado de entrenamientos como completados

### 🏋️ Entrenador
- Gestión de clientes asignados
- Creación y asignación de rutinas
- Creación y asignación de planes nutricionales
- Seguimiento de progreso de clientes
- Comunicación con clientes vía chat
- Notificaciones en tiempo real de mensajes nuevos
- Indicadores de mensajes no leídos por cliente

### ⚙️ Administración
- Dashboard con estadísticas en tiempo real
- Gestión de usuarios (cambiar roles, eliminar)
- Chat directo con cualquier usuario de la plataforma
- Notificaciones en tiempo real de mensajes nuevos
- Indicadores de mensajes no leídos por usuario en la lista
- Configuración del sistema

### 🌐 Internacionalización
- Español e inglés
- Persistencia del idioma en localStorage
- Cambio de idioma vía query param `?lang=es|en`

---

## 🛠️ Comandos

### Desarrollo
| Comando | Acción |
|---------|--------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Iniciar servidor de desarrollo (`localhost:4321`) |
| `npm run build` | Compilar para producción (`dist/`) |
| `npm run preview` | Vista previa de la build |

### Testing
| Comando | Acción |
|---------|--------|
| `npm test` | Tests unitarios (Vitest) |
| `npm run test:watch` | Tests en watch mode |
| `npm run test:coverage` | Tests con cobertura |
| `npm run test:e2e` | Tests E2E (Playwright) |
| `npm run test:all` | Unitarios + E2E |

### Calidad
| Comando | Acción |
|---------|--------|
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run lint` | ESLint |
| `npm run format` | Formatear con Prettier |
| `npm run validate` | Validación completa pre-commit |

### Agentes IA
| Comando | Acción |
|---------|--------|
| `npm run context` | Ver contexto del proyecto |
| `npm run doctor` | Diagnóstico del proyecto |
| `npm run doctor:ci` | Diagnóstico en modo CI |
| `npm run mcp:setup` | Verificar/configurar servidores MCP |
| `npm run mcp:install` | Instalar servidores MCP |
| `npm run mcp:env` | Generar .env template |
| `npm run setup` | Setup inicial para nuevos agentes |
| `npm run setup:full` | Setup completo (instalar + pull) |
| `npm run validate` | Validación completa pre-commit |
| `npm run validate:quick` | Solo type-check + tests |
| `npm run validate:fix` | Completa + auto-fix lint |
| `npm run lock:status` | Verificar estado del lock |
| `npm run lock:release` | Liberar lock |
| `bash scripts/agent-lock.sh check` | Verificar lock de agente |
| `bash scripts/agent-lock.sh acquire` | Adquirir lock |
| `bash scripts/agent-lock.sh release` | Liberar lock |


---

## 🔧 Configuración Inicial

### 1. Clonar el repositorio
```bash
git clone https://github.com/webPMI/campfit.git
cd campfit-astro
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia `.env.example` a `.env` y completa las credenciales de Firebase:

```bash
cp .env.example .env
```

### 4. Iniciar desarrollo
```bash
npm run dev
```

---

## 🔥 Firebase

El proyecto usa Firebase para:
- **Authentication**: Email/contraseña + Google provider
- **Firestore**: Colección `users` con perfiles por rol

### Colecciones en Firestore
- `users` — Perfiles de usuario con rol y datos personales
- `workouts` — Rutinas de entrenamiento
- `diets` — Planes nutricionales
- `messages` — Mensajes del chat
- `progress_logs` — Registros de progreso
- `exercises_library` — Biblioteca de ejercicios
- `diet_templates` — Plantillas de dietas

### Reglas de seguridad (Firestore)

Las reglas de seguridad desplegadas actualmente en Firebase siguen estos principios:

| Colección | Lectura | Escritura |
|-----------|---------|-----------|
| `users` | Propio usuario o admin | Propio usuario (excepto `role`) o admin |
| `workouts` | Cliente asignado o admin | Solo admin |
| `diets` | Cliente asignado o admin | Solo admin |
| `progress` | Propio usuario o admin | Propio usuario o admin |
| `chat_rooms` | Solo participantes | Solo participantes (crear/actualizar) |
| `chat_rooms/{id}/messages` | Solo participantes del chat | Solo participantes (crear) |

**Reglas clave:**
- El email `servicioweb.pmi@gmail.com` tiene rol de bootstrap admin automático
- Los usuarios pueden actualizar su perfil pero **no pueden cambiarse el rol a sí mismos**
- Los mensajes del chat no se pueden editar ni eliminar una vez enviados
- Las rutinas y dietas con `clientId == ''` son plantillas visibles para todos los autenticados

> 📄 Ver `firebase_rules.md` en `nuevo_proyecto/` para las reglas completas.

---

## 📄 Licencia

Proyecto privado — CampFit © 2026