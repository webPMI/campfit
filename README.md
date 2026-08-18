# CampFit 🏋️

> **Plataforma fitness todo-en-uno.** Entrenamiento personalizado, nutrición inteligente y seguimiento en tiempo real con tu entrenador.

---

## 🚀 Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Astro** | 7.x | Framework web (Static SSG con API endpoints optimizados) |
| **Tailwind CSS** | 4.x | Estilos utilitarios de alto rendimiento con `@tailwindcss/vite` |
| **Firebase** | 11.x | Autenticación + Firestore (base de datos en tiempo real) |
| **Cloudflare R2** | AWS S3 SDK | Almacenamiento multimedia seguro de fotos y vídeos de técnica |
| **Nanostores** | 1.x | Estado global reactivo y sincronización en tiempo real |
| **TypeScript** | 5.x | Tipado estricto en todo el proyecto (0 `any`) |
| **Vitest** | 3.0.9 | Tests unitarios y suites de integración |
| **Playwright** | 1.x | Tests end-to-end (E2E) |

**Arquitectura:** Vanilla JS / TypeScript reactivo sobre Astro (sin frameworks pesados como React/Vue en cliente). Componentes HTML renderizados dinámicamente con streams de Firestore en tiempo real y arquitectura Zero Native Dialogs.

---

## 📁 Estructura del Proyecto

```
campfit-astro/
├── public/                  # Archivos estáticos e iconos PWA
├── src/
│   ├── components/          # Componentes Astro reutilizables
│   │   ├── calendar/        # TimeGrid compacto, TimePicker y radar horario
│   │   └── ...              # Modales, Cards, Botones, Spinners
│   ├── i18n/                # Internacionalización (es / en / ca)
│   │   ├── client.ts        # Traducciones reactivas para el cliente JS
│   │   ├── translations.ts  # Traducciones completas (SSR/SSG)
│   │   └── locales/         # Diccionarios canónicos (es.ts, en.ts, ca.ts)
│   ├── layouts/             # Layouts modulares por rol
│   │   ├── BaseLayout.astro
│   │   ├── AdminLayout.astro
│   │   ├── ClientLayout.astro
│   │   └── TrainerLayout.astro
│   ├── lib/                 # Capa de lógica de negocio y servicios
│   │   ├── admin/           # Servicios y utilidades de administración
│   │   ├── client/          # Rutinas, dietas, progreso y cruce de lesiones
│   │   ├── trainer/         # Asignaciones, plantillas, clientes y feedback
│   │   ├── devtools/        # Gestor de semillas, validadores y autofillers
│   │   ├── storage/         # Cloudflare R2 / S3 y compresión multimedia
│   │   ├── shared/          # Hidratación, logs remotos, chat y utilidades UI
│   │   └── firebase/        # Configuración e inicialización de Firebase
│   ├── pages/               # Páginas y rutas de la aplicación
│   │   ├── index.astro      # Landing page pública
│   │   ├── login.astro      # Inicio de sesión
│   │   ├── register.astro   # Registro y onboarding
│   │   ├── admin/           # Panel de administración y gestión
│   │   ├── client/          # Panel de cliente (dashboard, rutinas, dietas, calendario)
│   │   ├── trainer/         # Panel de entrenador (fichas, rutinas, correcciones)
│   │   └── api/             # Endpoints API de soporte y analítica
│   ├── stores/              # Stores reactivos (Nanostores)
│   │   ├── authStore.ts     # Estado de autenticación
│   │   ├── themeStore.ts    # Control de temas y sabores visuales
│   │   └── dailyScheduleStore.ts # Agenda y sincronización optimista
│   └── types/               # Definiciones y contratos TypeScript
├── tests/                   # Suites de tests unitarios, integración y E2E
├── astro.config.mjs         # Configuración de Astro
├── tsconfig.json            # Configuración de TypeScript
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
- Registro de progreso (peso, medidas)
- Chat directo con el entrenador
- Perfil médico

### 🏋️ Entrenador
- Gestión de clientes asignados
- Creación y asignación de rutinas
- Creación y asignación de planes nutricionales
- Comunicación con clientes vía chat

### ⚙️ Administración
- Dashboard con estadísticas en tiempo real
- Gestión de usuarios (cambiar roles, eliminar)
- Vista de entrenadores y clientes
- Configuración del sistema

### 🌐 Internacionalización
- Español, Inglés y Catalán (`es`, `en`, `ca`)
- Persistencia del idioma en `localStorage` y cookies
- Renderizado multilingüe SSG y client-side translation (`translateDOM`)

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

### PWA (Progressive Web App)
| Comando | Acción |
|---------|--------|
| `npm run pwa:icons` | Generar iconos PWA (192x192, 512x512) |
| `npm run pwa:build` | Build completo + iconos PWA |
| `npm run pwa:audit` | Auditoría Lighthouse PWA |

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

> 📄 Ver `firebase_rules.md` en `docs/_archive/nuevo_proyecto/` para las reglas completas.

---

## 📄 Licencia

Proyecto privado — CampFit © 2026
