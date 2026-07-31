# ⚙️ Módulo de Administración - CampFit

> **Última actualización:** 2026-07-31  
> **Estado:** Consolidado en `docs/MASTER.md` (sección 10)

---

## 📑 Índice

1. [Descripción General](#1-descripción-general)
2. [Estructura del Módulo](#2-estructura-del-módulo)
3. [Dashboard de Administración](#3-dashboard-de-administración)
4. [Gestión de Usuarios](#4-gestión-de-usuarios)
5. [Gestión de Clientes](#5-gestión-de-clientes)
6. [Gestión de Entrenadores](#6-gestión-de-entrenadores)
7. [Fichas Clínicas](#7-fichas-clínicas)
8. [Supervisión de Rutinas](#8-supervisión-de-rutinas)
9. [Supervisión de Dietas](#9-supervisión-de-dietas)
10. [Visor de Progreso](#10-visor-de-progreso)
11. [Centro de Chat](#11-centro-de-chat)
12. [Configuración del Sistema](#12-configuración-del-sistema)

---

## 1. Descripción General

El panel de Administración (`/admin/`) proporciona control total sobre la plataforma. Permite gestionar usuarios, supervisar contenido, asignar roles y configurar el sistema.

### 1.1 Características Principales

- **Dashboard Global:** Estadísticas consolidadas del sistema
- **Gestión de Usuarios:** CRUD completo con DataTable
- **Asignación de Roles:** Promoción de usuarios
- **Supervisión:** Vista global de rutinas, dietas, progreso y chat
- **Configuración:** Ajustes del sistema

### 1.2 Flujo de Usuario

```
Login → Dashboard → Gestión (Usuarios/Clientes/Trainers/Supervisión)
```

---

## 2. Estructura del Módulo

### 2.1 Organización de Archivos

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
├── lib/
│   └── admin/                   # Módulo admin (modularizado)
│       ├── types.ts             # AdminUser, CreateUserPayload, AdminStats
│       ├── adminAuth.ts         # requireAdmin, signOutUser
│       ├── adminUsers.ts        # CRUD usuarios (Firestore)
│       ├── adminSubscriptions.ts # Suscripciones Firestore (streams)
│       ├── adminRender.ts       # Renderizado HTML (tablas, modales, cards)
│       ├── adminInit.ts         # initGlobalActions (setup de página)
│       └── adminUtils.ts        # Barrel (re-export)
└── services/
    └── adminService.ts          # CRUD usuarios, estadísticas (legacy)
```

### 2.2 Responsabilidades por Capa

**Páginas (pages/admin/):**
- Renderizado de vistas específicas
- Captura de eventos de usuario
- Orquestación de servicios
- Gestión de estado local

**Layout (AdminLayout.astro):**
- Sidebar navigation
- Estructura común
- Theme toggle
- Logout button

**Librerías (lib/admin/):**
- Lógica de negocio específica del admin
- Comunicación con Firestore
- Procesamiento de datos
- Renderizado de componentes complejos

---

## 3. Dashboard de Administración

### 3.1 Descripción

**Ruta:** `/admin/dashboard`  
**Layout:** `AdminLayout.astro` (con Sidebar Navigation)

Panel principal con estadísticas globales del sistema.

### 3.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Dashboard de Administración     │
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ 👥       │ │ 💪       │ │ 🥗       ││
│  │ Usuarios │ │ Rutinas  │ │ Dietas   ││
│  │ 150      │ │ 45       │ │ 38       ││
│  │ +12%     │ │ +8%      │ │ +5%      ││
│  └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ 💬       │ │ ⚠️       │ │ 📊       ││
│  │ Mensajes │ │ Alertas  │ │ Activos  ││
│  │ 1.2k     │ │ 5        │ │ 89%      ││
│  │ sin leer │ │ activas  │ │ usuarios ││
│  └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────┤
│  Actividad Reciente                     │
│  ┌─────────────────────────────────┐   │
│  │ • Nuevo usuario: Juan Pérez     │   │
│  │ • Rutina creada: Fuerza         │   │
│  │ • Alerta resuelta: María García │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 3.3 Datos Mostrados

**Tarjetas de Estadísticas:**
- **Usuarios Totales:** Total, por rol, activos/inactivos
- **Rutinas:** Total, activas esta semana, ejercicios totales
- **Dietas:** Total, activas hoy, comidas totales
- **Mensajes:** No leídos, totales
- **Alertas:** Activas, resueltas hoy
- **Actividad:** Usuarios activos (%)

**Actividad Reciente:**
- Últimos usuarios registrados
- Últimas rutinas creadas
- Últimas alertas resueltas

### 3.4 Implementación

```typescript
// lib/admin/adminSubscriptions.ts
export function subscribeToAdminDashboard(callback: (stats: AdminStats) => void) {
  // Suscribirse a usuarios
  const unsubscribeUsers = subscribeToCollectionCount('users', (count) => {
    // Actualizar conteo
  });
  
  // Suscribirse a workouts
  const unsubscribeWorkouts = subscribeToCollectionCount('workouts', (count) => {
    // Actualizar conteo
  });
  
  // Suscribirse a diets
  const unsubscribeDiets = subscribeToCollectionCount('diets', (count) => {
    // Actualizar conteo
  });
  
  // Suscribirse a mensajes no leídos
  const unsubscribeMessages = subscribeToUnreadMessages((count) => {
    // Actualizar conteo
  });
  
  // Suscribirse a alertas activas
  const unsubscribeAlerts = subscribeToActiveAlerts((count) => {
    // Actualizar conteo
  });
  
  // Retornar función de cleanup
  return () => {
    unsubscribeUsers();
    unsubscribeWorkouts();
    unsubscribeDiets();
    unsubscribeMessages();
    unsubscribeAlerts();
  };
}
```

---

## 4. Gestión de Usuarios

### 4.1 Descripción

**Ruta:** `/admin/users`  
**Layout:** `AdminLayout.astro`

DataTable completo para buscar, filtrar, editar y eliminar usuarios.

### 4.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Gestión de Usuarios             │
├─────────────────────────────────────────┤
│  🔍 Buscar usuario... | Filtro: [Todos ▼]│
├─────────────────────────────────────────┤
│  DataTable                              │
│  ┌──────┬──────────┬──────┬────────┐   │
│  │ Nombre│ Email    │ Rol  │ Acciones│  │
│  ├──────┼──────────┼──────┼────────┤   │
│  │ Juan  │ juan@... │ Client│ ✏️ ⚠️ 🔄 ❌│
│  │ María │ maria@..│ Trainer│ ✏️ ⚠️ 🔄 ❌│
│  │ Admin │ admin@..│ Admin │ ✏️ 🔄 ❌   │
│  └──────┴──────────┴──────┴────────┘   │
└─────────────────────────────────────────┘
```

### 4.3 Acciones por Usuario

| Acción | Descripción | Confirmación |
|--------|-------------|--------------|
| ✏️ Editar | Abre modal para editar nombre, email, rol | No |
| ⚠️ Alerta | Enviar llamado de atención al cliente | Sí |
| 🔄 Reset | Enviar email de restablecimiento de contraseña | Sí |
| ❌ Eliminar | Eliminar usuario (requiere confirmación) | Sí |

### 4.4 Modal de Edición

```
┌─────────────────────────────────────────┐
│  Editar Usuario                          │
├─────────────────────────────────────────┤
│  Nombre: [Juan Pérez              ]     │
│  Email:  [juan@email.com          ]     │
│  Rol:    [Client ▼]                     │
│  Trainer: [María García ▼] (si client)  │
├─────────────────────────────────────────┤
│  [Guardar] [Cancelar]                   │
└─────────────────────────────────────────┘
```

### 4.5 Implementación

```typescript
// lib/admin/adminUsers.ts
export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  await updateDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUser(userId: string): Promise<void> {
  // Eliminar de Firestore
  await deleteDoc(doc(db, 'users', userId));
  
  // Eliminar de Firebase Auth (requiere Admin SDK)
  // Esto se hace en un API route
}

export async function sendPasswordReset(email: string): Promise<void> {
  // Enviar email de reset usando Firebase Admin SDK
  // Esto se hace en un API route
}

export async function sendAlertToUser(userId: string, message: string): Promise<void> {
  await addDoc(collection(db, 'messages'), {
    senderId: 'admin',
    receiverId: userId,
    participants: ['admin', userId],
    content: message,
    type: 'alert',
    isRead: false,
    createdAt: serverTimestamp(),
  });
}
```

---

## 5. Gestión de Clientes

### 5.1 Descripción

**Ruta:** `/admin/clients`  
**Layout:** `AdminLayout.astro`

Visualiza todos los alumnos/clientes registrados en la plataforma y sus respectivos entrenadores asignados.

### 5.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Gestión de Clientes             │
├─────────────────────────────────────────┤
│  🔍 Buscar cliente...                   │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Juan Pérez                        │   │
│  │ Email: juan@email.com             │   │
│  │ Trainer: María García             │   │
│  │ Estado: ✅ Activo                 │   │
│  │ [Ver Perfil] [Ver Progreso]       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 5.3 Características

- Listado de todos los clientes
- Resolución dinámica de nombres de entrenadores
- Filtro por trainer
- Filtro por estado (activo/inactivo)
- Acceso rápido a perfil y progreso

### 5.4 Implementación

```typescript
// lib/admin/adminSubscriptions.ts
export function subscribeToClients(callback: (clients: ClientWithTrainer[]) => void) {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'client'),
    orderBy('name', 'asc')
  );
  
  return onSnapshot(q, async (snapshot) => {
    const clients = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() as User;
        
        // Obtener nombre del trainer
        let trainerName = 'Sin asignar';
        if (data.assignedTrainerId) {
          const trainerDoc = await getDoc(doc(db, 'users', data.assignedTrainerId));
          if (trainerDoc.exists()) {
            trainerName = trainerDoc.data()?.name ?? 'Sin asignar';
          }
        }
        
        return {
          id: doc.id,
          ...data,
          trainerName,
        };
      })
    );
    
    callback(clients);
  });
}
```

---

## 6. Gestión de Entrenadores

### 6.1 Descripción

**Ruta:** `/admin/trainers`  
**Layout:** `AdminLayout.astro`

Muestra el listado de todos los entrenadores del sistema junto con la cantidad total de clientes reales que tienen bajo su supervisión.

### 6.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Gestión de Entrenadores         │
├─────────────────────────────────────────┤
│  🔍 Buscar entrenador...                │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ María García                     │   │
│  │ Email: maria@email.com           │   │
│  │ Clientes: 12                     │   │
│  │ [Ver Clientes] [Ver Rutinas]     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 6.3 Características

- Listado de todos los entrenadores
- Conteo de clientes por trainer
- Filtro por cantidad de clientes
- Acceso rápido a clientes y rutinas

### 6.4 Implementación

```typescript
// lib/admin/adminSubscriptions.ts
export function subscribeToTrainers(callback: (trainers: TrainerWithStats[]) => void) {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'trainer'),
    orderBy('name', 'asc')
  );
  
  return onSnapshot(q, async (snapshot) => {
    const trainers = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() as User;
        
        // Contar clientes asignados
        const clientsQuery = query(
          collection(db, 'users'),
          where('assignedTrainerId', '==', doc.id),
          where('role', '==', 'client')
        );
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientCount = clientsSnapshot.size;
        
        return {
          id: doc.id,
          ...data,
          clientCount,
        };
      })
    );
    
    callback(trainers);
  });
}
```

---

## 7. Fichas Clínicas

### 7.1 Descripción

**Ruta:** `/admin/clinical`  
**Layout:** `AdminLayout.astro`

Panel de supervisión médica global. Muestra datos de salud, alergias, intolerancias, lesiones, condiciones médicas y restricciones alimentarias de todos los clientes.

### 7.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Fichas Clínicas                 │
├─────────────────────────────────────────┤
│  Filtros:                               │
│  [Alergias ▼] [Lesiones ▼] [Condiciones]│
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Juan Pérez                        │   │
│  │ Alergias: Gluten, Lactosa        │   │
│  │ Lesiones: Rodilla izquierda      │   │
│  │ Condiciones: Ninguna             │   │
│  │ Objetivos: Bajar peso, Ganar     │   │
│  │           masa muscular           │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 7.3 Características

- Vista global de todas las fichas clínicas
- Filtros por tipo de condición
- Búsqueda por nombre de cliente
- Exportación de datos (opcional)
- Alertas de condiciones críticas

### 7.4 Implementación

```typescript
// lib/admin/adminSubscriptions.ts
export function subscribeToClinicalData(callback: (clinicalData: ClinicalData[]) => void) {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'client'),
    where('medicalProfile', '!=', null),
    orderBy('name', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const clinicalData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      medicalProfile: doc.data().medicalProfile,
    })) as ClinicalData[];
    
    callback(clinicalData);
  });
}
```

---

## 8. Supervisión de Rutinas

### 8.1 Descripción

**Ruta:** `/admin/workouts`  
**Layout:** `AdminLayout.astro`

Vista global de todas las rutinas de entrenamiento del sistema.

### 8.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Supervisión de Rutinas          │
├─────────────────────────────────────────┤
│  Estadísticas:                           │
│  Total: 45 | Activas: 38 | Ejercicios:  │
│  156 | Tasa completado: 78%             │
├─────────────────────────────────────────┤
│  🔍 Buscar rutina...                    │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Rutina de Fuerza - Juan Pérez   │   │
│  │ Trainer: María García           │   │
│  │ Ejercicios: 8 | Completado: 75% │   │
│  │ [Ver Detalles]                  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 8.3 Características

- Estadísticas globales
- Búsqueda por nombre de rutina o cliente
- Filtro por trainer
- Filtro por dificultad
- Tasa de completado

### 8.4 Implementación

```typescript
// lib/admin/adminSubscriptions.ts
export function subscribeToAllWorkouts(callback: (workouts: WorkoutWithClient[]) => void) {
  const q = query(
    collection(db, 'workouts'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, async (snapshot) => {
    const workouts = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() as Workout;
        
        // Obtener datos del cliente
        const clientDoc = await getDoc(doc(db, 'users', data.clientId));
        const clientName = clientDoc.exists() ? clientDoc.data()?.name : 'Desconocido';
        
        // Obtener datos del trainer
        const trainerDoc = await getDoc(doc(db, 'users', data.trainerId));
        const trainerName = trainerDoc.exists() ? trainerDoc.data()?.name : 'Desconocido';
        
        return {
          id: doc.id,
          ...data,
          clientName,
          trainerName,
        };
      })
    );
    
    callback(workouts);
  });
}
```

---

## 9. Supervisión de Dietas

### 9.1 Descripción

**Ruta:** `/admin/diets`  
**Layout:** `AdminLayout.astro`

Vista global de todos los planes nutricionales.

### 9.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Supervisión de Dietas           │
├─────────────────────────────────────────┤
│  Estadísticas:                           │
│  Total: 38 | Activas: 32 | Comidas: 156 │
│  Adherencia media: 82%                   │
├─────────────────────────────────────────┤
│  🔍 Buscar dieta...                     │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Dieta Volumen - Juan Pérez      │   │
│  │ Trainer: María García           │   │
│  │ Calorías: 2500 | Adherencia: 85%│   │
│  │ [Ver Detalles]                  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 9.3 Características

- Estadísticas globales
- Búsqueda por nombre de dieta o cliente
- Filtro por trainer
- Filtro por somatotipo
- Adherencia media

### 9.4 Implementación

```typescript
// lib/admin/adminSubscriptions.ts
export function subscribeToAllDiets(callback: (diets: DietWithClient[]) => void) {
  const q = query(
    collection(db, 'diets'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, async (snapshot) => {
    const diets = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() as Diet;
        
        // Obtener datos del cliente
        const clientDoc = await getDoc(doc(db, 'users', data.clientId));
        const clientName = clientDoc.exists() ? clientDoc.data()?.name : 'Desconocido';
        
        // Obtener datos del trainer
        const trainerDoc = await getDoc(doc(db, 'users', data.trainerId));
        const trainerName = trainerDoc.exists() ? trainerDoc.data()?.name : 'Desconocido';
        
        return {
          id: doc.id,
          ...data,
          clientName,
          trainerName,
        };
      })
    );
    
    callback(diets);
  });
}
```

---

## 10. Visor de Progreso

### 10.1 Descripción

**Ruta:** `/admin/progress`  
**Layout:** `AdminLayout.astro`

Monitoreo global del progreso de todos los clientes.

### 10.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Visor de Progreso               │
├─────────────────────────────────────────┤
│  Filtros:                               │
│  Tipo: [Todos ▼] | Cliente: [Todos ▼]   │
├─────────────────────────────────────────┤
│  Estadísticas:                           │
│  Clientes con datos: 45 | Registros: 234 │
│  Última semana: 12 | Con fotos: 28       │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Juan Pérez                        │   │
│  │ Peso: 77.5 kg (-2.5 kg)          │   │
│  │ Fotos: 4 | RPE promedio: 7.5     │   │
│  │ [Ver Gráfico] [Ver Fotos]         │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 10.3 Características

- Filtro por tipo (peso, fotos, medidas)
- Filtro por cliente
- Estadísticas globales
- Gráfico de progreso por cliente
- Galería de fotos

### 10.4 Implementación

```typescript
// lib/admin/adminSubscriptions.ts
export function subscribeToAllProgress(callback: (progress: ProgressLog[]) => void) {
  const q = query(
    collection(db, 'progress_logs'),
    orderBy('date', 'desc'),
    limit(100)
  );
  
  return onSnapshot(q, (snapshot) => {
    const progress = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ProgressLog[];
    
    callback(progress);
  });
}
```

---

## 11. Centro de Chat

### 11.1 Descripción

**Ruta:** `/admin/chat`  
**Layout:** `AdminLayout.astro`

Supervisión de todas las conversaciones entre trainers y clientes.

### 11.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Centro de Chat                  │
├─────────────────────────────────────────┤
│  Estadísticas:                           │
│  Conversaciones: 25 | Sin leer: 8       │
│  Activas hoy: 12                         │
├─────────────────────────────────────────┤
│  🔍 Buscar conversación...              │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Juan Pérez ↔ María García       │   │
│  │ "¿Cómo va el entrenamiento?"    │   │
│  │ Hace 5 min | 2 sin leer         │   │
│  │ [Abrir Chat]                    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 11.3 Características

- Estadísticas de conversaciones
- Búsqueda por nombre de participante
- Filtro por mensajes sin leer
- Interfaz para interactuar como cliente
- Filtro por fecha

### 11.4 Implementación

```typescript
// lib/admin/adminSubscriptions.ts
export function subscribeToAllChats(callback: (chats: ChatSummary[]) => void) {
  const q = query(
    collection(db, 'messages'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    
    // Agrupar por participantes
    const chats = groupMessagesByParticipants(messages);
    callback(chats);
  });
}
```

---

## 12. Configuración del Sistema

### 12.1 Descripción

**Ruta:** `/admin/settings`  
**Layout:** `AdminLayout.astro`

Perfil de administrador, preferencias de idioma/tema/notificaciones y gestión de la aplicación.

### 12.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Configuración del Sistema       │
├─────────────────────────────────────────┤
│  Sección: Perfil de Admin               │
│  ┌─────────────────────────────────┐   │
│  │ Nombre: [Admin              ]    │   │
│  │ Email:  [admin@campfit.com  ]    │   │
│  │ [Guardar Cambios]               │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Sección: Preferencias                  │
│  ┌─────────────────────────────────┐   │
│  │ Idioma: [Español ▼]            │   │
│  │ Tema:   [Oscuro ▼]             │   │
│  │ Notificaciones: [🔔 Activadas] │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Sección: Gestión de la App             │
│  ┌─────────────────────────────────┐   │
│  │ Versión: 1.0.0                  │   │
│  │ [📥 Exportar Datos]             │   │
│  │ [🗑️ Limpiar Caché]             │   │
│  │ [🔄 Reiniciar Sistema]          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 12.3 Características

**Perfil:**
- Editar nombre
- Cambiar email
- Cambiar contraseña

**Preferencias:**
- Idioma (ES/EN)
- Tema (claro/oscuro)
- Notificaciones push

**Gestión de la App:**
- Ver versión
- Exportar datos (JSON)
- Limpiar caché
- Reiniciar sistema (solo desarrollo)

---

## 🔗 Referencias

- **Documentación Maestra:** `docs/MASTER.md` (sección 10)
- **Design System:** `docs/03_design_system.md`
- **Flujos de Navegación:** `docs/04_flujos_navegacion.md`
- **Módulo de Autenticación:** `docs/05_modulo_autenticacion.md`

---

**Documento creado:** 2026-06-13  
**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit