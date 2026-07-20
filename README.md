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
│   ├── i18n/                # Internacionalización (es/en)
│   │   ├── client.ts        # Traducciones para el cliente JS
│   │   └── translations.ts  # Traducciones completas (SSR)
│   ├── layouts/             # Layouts por rol
│   │   ├── BaseLayout.astro
│   │   ├── AdminLayout.astro
│   │   ├── ClientLayout.astro
│   │   └── TrainerLayout.astro
│   ├── lib/                 # Utilidades compartidas
│   │   ├── admin/           # Utilidades específicas del panel admin
│   │   │   └── adminUtils.ts
│   │   ├── firebase.ts      # Configuración de Firebase
│   │   ├── routeGuards.ts   # Guardias de ruta por rol
│   │   └── validators.ts    # Validación de formularios
│   ├── pages/               # Páginas (rutas)
│   │   ├── index.astro      # Landing page
│   │   ├── login.astro      # Inicio de sesión
│   │   ├── register.astro   # Registro
│   │   ├── recover.astro    # Recuperar contraseña
│   │   ├── dashboard.astro  # Dashboard post-login
│   │   ├── admin/           # Panel de administración
│   │   ├── client/          # Panel de cliente
│   │   ├── trainer/         # Panel de entrenador
│   │   └── api/             # Endpoints API
│   ├── services/            # Servicios (Firebase)
│   │   ├── authService.ts   # Autenticación
│   │   └── adminService.ts  # Administración
│   ├── stores/              # Stores reactivos
│   │   └── authStore.ts     # Estado de autenticación (Nanostores)
│   └── types/               # Tipos TypeScript
│       └── index.ts
├── tests/                   # Tests
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
