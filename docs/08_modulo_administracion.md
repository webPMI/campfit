# ⚙️ Módulo de Administración - CampFit 2.0

## Descripción General

Panel de administración para gestionar usuarios, visualizar estadísticas, gestionar contenido (rutinas, dietas), bandeja de chat y configuración del sistema.

---

## Estructura

```
src/
├── pages/admin/
│   ├── dashboard.astro          # /admin/dashboard
│   ├── users.astro              # /admin/users
│   ├── trainers.astro           # /admin/trainers
│   ├── clients.astro            # /admin/clients
│   ├── clinical.astro           # /admin/clinical
│   ├── workouts.astro           # /admin/workouts
│   ├── diets.astro              # /admin/diets
│   ├── progress.astro           # /admin/progress
│   ├── chat.astro               # /admin/chat
│   └── settings.astro           # /admin/settings
├── layouts/
│   └── AdminLayout.astro        # Layout con Sidebar Navigation
├── lib/admin/                   # Módulo admin (modularizado)
│   ├── types.ts                 # AdminUser, CreateUserPayload, AdminStats
│   ├── adminAuth.ts             # requireAdmin, signOutUser
│   ├── adminUsers.ts            # CRUD usuarios (Firestore)
│   ├── adminSubscriptions.ts    # Suscripciones Firestore (streams)
│   ├── adminRender.ts           # Renderizado HTML (tablas, modales, cards)
│   ├── adminInit.ts             # initGlobalActions (setup de página)
│   └── adminUtils.ts            # Barrel (re-export)
├── services/
│   └── adminService.ts          # CRUD usuarios, estadísticas (legacy)
└── types/
    └── index.ts                 # User, AdminStats, Alert
```

---

## 1. Dashboard de Administración

**Ruta:** `/admin/dashboard`  
**Layout:** `AdminLayout.astro` (con Sidebar Navigation)

Panel principal con estadísticas globales del sistema: total de usuarios, rutinas, dietas, mensajes no leídos y alertas activas. Visualización en tiempo real mediante streams de Firestore.

---

## 2. Gestión de Usuarios

**Ruta:** `/admin/users`  
**Layout:** `AdminLayout.astro`

DataTable completo con búsqueda, filtro por rol, edición de perfiles, bloqueo/desbloqueo, envío de emails de recuperación y eliminación de cuentas. Modal de edición con asignación de trainer para clientes.

### Acciones por Usuario

| Acción | Descripción |
|--------|-------------|
| ✏️ Editar | Abre modal para editar nombre, email, rol |
| ⚠️ Alerta | Enviar llamado de atención al cliente |
| 🔄 Reset | Enviar email de restablecimiento de contraseña |
| ❌ Eliminar | Eliminar usuario (requiere confirmación) |

---

## 3. Lista de Clientes

**Ruta:** `/admin/clients`  
**Layout:** `AdminLayout.astro`

Lista filtrada de usuarios con rol `client`. Muestra tarjetas con información básica, alertas y entrenador asignado. Resolución dinámica de nombres de trainers en tiempo real.

---

## 4. Lista de Entrenadores

**Ruta:** `/admin/trainers`  
**Layout:** `AdminLayout.astro`

Lista filtrada de usuarios con rol `trainer`. Muestra tarjetas con información y cantidad de clientes asignados.

---

## 5. Fichas Clínicas

**Ruta:** `/admin/clinical`  
**Layout:** `AdminLayout.astro`

Panel de supervisión médica global. Muestra datos de salud, alergias, intolerancias, lesiones, condiciones médicas y restricciones alimentarias de todos los clientes. Incluye estadísticas de clientes con datos clínicos, intolerancias, restricciones y alergias.

---

## 6. Supervisión de Rutinas

**Ruta:** `/admin/workouts`  
**Layout:** `AdminLayout.astro`

Vista global de todas las rutinas de entrenamiento del sistema. Estadísticas de rutinas totales, activas esta semana, ejercicios totales y tasa de completado. Búsqueda por nombre de rutina o cliente.

---

## 7. Supervisión de Dietas

**Ruta:** `/admin/diets`  
**Layout:** `AdminLayout.astro`

Vista global de todos los planes nutricionales. Estadísticas de dietas totales, activas hoy, comidas totales y adherencia media. Búsqueda por nombre de dieta o cliente.

---

## 8. Visor de Progreso

**Ruta:** `/admin/progress`  
**Layout:** `AdminLayout.astro`

Monitoreo global del progreso de todos los clientes. Filtro por tipo (peso, fotos, medidas). Estadísticas de clientes con datos, registros totales, última semana y clientes con fotos. Búsqueda por nombre de cliente o tipo de progreso.

---

## 9. Centro de Mensajes

**Ruta:** `/admin/chat`  
**Layout:** `AdminLayout.astro`

Supervisión de todas las conversaciones entre trainers y clientes. Estadísticas de conversaciones totales, mensajes sin leer y conversaciones activas hoy. Interfaz para interactuar como cliente. Búsqueda por nombre de participante.

---

## 10. Configuración del Sistema

**Ruta:** `/admin/settings`  
**Layout:** `AdminLayout.astro`

Perfil de administrador, preferencias de idioma/tema/notificaciones y gestión de la aplicación (versión, exportación de datos, limpieza de caché).

---

> **📌 Convenciones de código:** Ver `12_guia_desarrollo_testing.md`
> **📌 Golden Rules:** Ver `.clinerules`
> **📌 Componentes UI:** Ver `06_design_system.md`
> **📌 Guards de ruta:** Ver `08_modulo_autenticacion.md`