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
│   ├── workouts.astro           # /admin/workouts
│   ├── diets.astro              # /admin/diets
│   ├── chat.astro               # /admin/chat
│   ├── progress.astro           # /admin/progress
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

## 3. Gestión de Rutinas

**Ruta:** `/admin/workouts`  
**Layout:** `AdminLayout.astro`

### Componentes

```
┌─────────────────────────────────────────┐
│  Header: Rutinas                        │
│  [Crear Rutina] [Filtrar por cliente]  │
├─────────────────────────────────────────┤
│  Lista de Rutinas                       │
│  ┌─────────────────────────────────┐   │
│  │ Rutina: Full Body A            │   │
│  │ Cliente: Juan Pérez            │   │
│  │ Ejercicios: 6 | Días: Lun, Mié │   │
│  │ [✏️ Editar] [🗑️ Eliminar]      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Rutina: Push Pull Legs         │   │
│  │ Cliente: María García          │   │
│  │ Ejercicios: 8 | Días: Lun-Vie  │   │
│  │ [✏️ Editar] [🗑️ Eliminar]      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 4. Gestión de Dietas

**Ruta:** `/admin/diets`  
**Layout:** `AdminLayout.astro`

### Componentes

```
┌─────────────────────────────────────────┐
│  Header: Dietas                         │
│  [Crear Dieta] [Filtrar por cliente]   │
├─────────────────────────────────────────┤
│  Lista de Dietas                        │
│  ┌─────────────────────────────────┐   │
│  │ Dieta: Plan Normal 2,200 kcal  │   │
│  │ Cliente: Juan Pérez            │   │
│  │ Comidas: 3 | Tipo: Normal      │   │
│  │ [✏️ Editar] [🗑️ Eliminar]      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Dieta: Plan Ectomorfo 2,800    │   │
│  │ Cliente: Pedro López           │   │
│  │ Comidas: 5 | Tipo: Ectomorfo   │   │
│  │ [✏️ Editar] [🗑️ Eliminar]      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 5. Bandeja de Chat

**Ruta:** `/admin/chat`  
**Layout:** `AdminLayout.astro`

### Componentes

```
┌─────────────────────────────────────────┐
│  Header: Bandeja de Chat                │
├─────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────────┐ │
│  │ Conversaciones│ │ Chat Activo      │ │
│  │              │ │                  │ │
│  │ 💬 Juan      │ │ ┌──────────────┐ │ │
│  │   14:30      │ │ │ Recibido     │ │ │
│  │ 💬 María     │ │ │ ¿Cómo va mi  │ │ │
│  │   14:25      │ │ │ rutina?      │ │ │
│  │ 💬 Pedro     │ │ └──────────────┘ │ │
│  │   13:50      │ │                  │ │
│  │              │ │ ┌──────────────┐ │ │
│  │              │ │ │ Enviado      │ │ │
│  │              │ │ │ ¡Excelente!  │ │ │
│  │              │ │ │ Sigue así    │ │ │
│  │              │ │ └──────────────┘ │ │
│  │              │ │                  │ │
│  │              │ │ [Escribe...] 📎 │ │
│  └──────────────┘ └──────────────────┘ │
└─────────────────────────────────────────┘
```

### Funcionalidades

- Lista de conversaciones ordenadas por último mensaje
- Indicador de mensajes no leídos
- Envío de llamados de atención (alertas)
- Búsqueda de conversaciones por nombre de cliente

---

## 6. Visor de Progreso

**Ruta:** `/admin/progress`  
**Layout:** `AdminLayout.astro`

### Componentes

```
┌─────────────────────────────────────────┐
│  Header: Progreso de Alumnos            │
│  [Seleccionar cliente ▼]               │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │  LineChart: Evolución del Peso │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │  📈 80─╲                │   │   │
│  │  │     75  ╲──╲            │   │   │
│  │  │     70     ╲──          │   │   │
│  │  │     Ene Feb Mar         │   │   │
│  │  └─────────────────────────┘   │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Adherencia                             │
│  Rutina: ████████████░░ 75%             │
│  Dieta:  ██████████░░░░ 60%             │
├─────────────────────────────────────────┤
│  Últimos Registros                      │
│  ┌─────────────────────────────────┐   │
│  │ 15 Mar - Peso: 75.5 kg         │   │
│  │ 14 Mar - Rutina: ✅ RPE 7      │   │
│  │ 14 Mar - Dieta: 3/3 comidas    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 7. Configuración del Sistema

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

## 8. Listado de Clientes
**Ruta:** `/admin/clients`  
**Layout:** `AdminLayout.astro`

Visualiza todos los alumnos/clientes registrados en la plataforma y sus respectivos entrenadores asignados, resolviendo dinámicamente los nombres de los entrenadores en tiempo real.

---

## 9. Listado de Entrenadores
**Ruta:** `/admin/trainers`  
**Layout:** `AdminLayout.astro`

Muestra el listado de todos los entrenadores del sistema junto con la cantidad total de clientes reales que tienen bajo su supervisión.

---

> **📌 Convenciones de código:** Ver `09_setup_y_desarrollo.md`
> **📌 Golden Rules:** Ver `.clinerules`
> **📌 Componentes UI:** Ver `06_design_system.md`
> **📌 Guards de ruta:** Ver `08_modulo_autenticacion.md`

