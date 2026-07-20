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
│   ├── clients.astro            # /admin/clients
│   ├── trainers.astro           # /admin/trainers
│   └── settings.astro           # /admin/settings
├── layouts/
│   └── AdminLayout.astro        # Layout con Sidebar Navigation
├── lib/
│   └── admin/
│       └── adminUtils.ts        # Utilidades de admin (iconos, tipos, renderizado, servicios)
├── services/
│   └── adminService.ts          # CRUD usuarios, estadísticas
└── types/
    └── index.ts                 # User, AdminStats, Alert
```

---

## 1. Dashboard de Administración

**Ruta:** `/admin/dashboard`  
**Layout:** `AdminLayout.astro` (con Sidebar Navigation)

### Componentes

```
┌─────────────────────────────────────────┐
│  Header: Panel de Administración        │
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ 👥       │ │ 💪       │ │ 🥗       ││
│  │ Usuarios │ │ Rutinas  │ │ Dietas   ││
│  │ 45       │ │ 12       │ │ 8        ││
│  └──────────┘ └──────────┘ └──────────┘│
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ 💬       │ │ 📈       │ │ ⚠️       ││
│  │ Mensajes │ │ Progreso │ │ Alertas  ││
│  │ 23       │ │ 78%      │ │ 3        ││
│  └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────┤
│  Últimos Mensajes                       │
│  ┌─────────────────────────────────┐   │
│  │ Juan: "¿Cómo va mi rutina?"     │   │
│  │ María: "No encuentro mi dieta"  │   │
│  │ Pedro: "¿Puedo cambiar mi      │   │
│  │        horario?"                │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Alertas Activas                        │
│  ┌─────────────────────────────────┐   │
│  │ ⚠️ Juan Pérez - Inasistencia   │   │
│  │ ⚠️ María García - Peso estanc. │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Datos (Firestore streams)

```typescript
// src/services/adminService.ts
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function subscribeToUsers(callback: (users: any[]) => void) {
  const q = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
  });
}

export function subscribeToAlerts(callback: (alerts: any[]) => void) {
  const q = query(
    collection(db, 'users'),
    where('hasActiveAlert', '==', true)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
  });
}
```

---

## 2. Gestión de Usuarios

**Ruta:** `/admin/users`  
**Layout:** `AdminLayout.astro`

### Componentes

```
┌─────────────────────────────────────────┐
│  Header: Gestión de Usuarios            │
│  [Buscar...] [Filtrar por rol]         │
├─────────────────────────────────────────┤
│  DataTable                              │
│  ┌────┬──────┬──────┬──────┬──────┬──┐ │
│  │Nombre│Email│Rol  │Alertas│Acción│  │ │
│  ├────┼──────┼──────┼──────┼──────┼──┤ │
│  │Juan │j@e.co│client│  ⚠️  │[✏️] │  │ │
│  │María│m@e.co│client│  ✅  │[✏️] │  │ │
│  │Admin│a@e.co│admin │  ✅  │[✏️] │  │ │
│  └────┴──────┴──────┴──────┴──────┴──┘ │
├─────────────────────────────────────────┤
│  Paginación: < 1 2 3 ... 10 >          │
└─────────────────────────────────────────┘
```

### Acciones por Usuario

| Acción | Descripción |
|--------|-------------|
| ✏️ Editar | Abre modal para editar nombre, email, rol |
| ⚠️ Alerta | Enviar llamado de atención al cliente |
| 🔄 Reset | Enviar email de restablecimiento de contraseña |
| ❌ Eliminar | Eliminar usuario (requiere confirmación) |

### Modal de Edición

```
┌─────────────────────────────────┐
│  ✏️ Editar Usuario              │
│                                 │
│  Nombre: [Juan Pérez        ]  │
│  Email:  [juan@email.com    ]  │
│  Rol:    [client ▼          ]  │
│                                 │
│  [Cancelar] [Guardar Cambios]  │
└─────────────────────────────────┘
```

---

## 3. Lista de Clientes

**Ruta:** `/admin/clients`  
**Layout:** `AdminLayout.astro`

Lista filtrada de usuarios con rol `client`. Muestra tarjetas con información básica, alertas y entrenador asignado.

---

## 4. Lista de Entrenadores

**Ruta:** `/admin/trainers`  
**Layout:** `AdminLayout.astro`

Lista filtrada de usuarios con rol `trainer`. Muestra tarjetas con información y cantidad de clientes asignados.

---

## 5. Configuración del Sistema

**Ruta:** `/admin/settings`  
**Layout:** `AdminLayout.astro`

### Componentes

```
┌─────────────────────────────────────────┐
│  Header: Configuración del Sistema      │
├─────────────────────────────────────────┤
│  Sección: Perfil de Administrador       │
│  ┌─────────────────────────────────┐   │
│  │ Nombre: [Admin Name         ]   │   │
│  │ Email:  [admin@campfit.com  ]   │   │
│  │ [Guardar Cambios]               │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Sección: Preferencias del Sistema      │
│  ┌─────────────────────────────────┐   │
│  │ Idioma: [Español ▼]            │   │
│  │ Tema:   [Oscuro ▼]             │   │
│  │ Notificaciones: [🔔 Activadas] │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Sección: Gestión de la Aplicación      │
│  ┌─────────────────────────────────┐   │
│  │ Versión: 2.0.0                  │   │
│  │ Última actualización: 15/03/25 │   │
│  │ [Exportar datos] [Limpiar caché]│   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Páginas Pendientes (Futuras)

Las siguientes páginas están planificadas pero aún no implementadas:
- `/admin/workouts` — CRUD de rutinas
- `/admin/diets` — CRUD de dietas
- `/admin/chat` — Bandeja de chat con clientes
- `/admin/progress` — Visor de progreso de alumnos

---

> **📌 Convenciones de código:** Ver `12_guia_desarrollo_testing.md`
> **📌 Golden Rules:** Ver `.clinerules`
> **📌 Componentes UI:** Ver `06_design_system.md`
> **📌 Guards de ruta:** Ver `08_modulo_autenticacion.md`
