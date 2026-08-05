# 🏋️ Módulo del Entrenador - CampFit

> **Última actualización:** 2026-07-31  
> **Estado:** Consolidado en `docs/MASTER.md` (sección 9)

---

## 📑 Índice

1. [Descripción General](#1-descripción-general)
2. [Estructura del Módulo](#2-estructura-del-módulo)
3. [Dashboard del Entrenador](#3-dashboard-del-entrenador)
4. [Gestión de Clientes](#4-gestión-de-clientes)
5. [Gestor de Rutinas](#5-gestor-de-rutinas)
6. [Planificador Nutricional](#6-planificador-nutricional)
7. [Chat con Clientes](#7-chat-con-clientes)
8. [Configuración](#8-configuración)

---

## 1. Descripción General

El panel del Entrenador (`/trainer/`) optimiza la gestión del coach deportivo. Le permite monitorear a sus alumnos asignados, crear y administrar sus entrenamientos y dietas en tiempo real, enviar llamados de atención mediante el chat, y auditar el progreso diario de cada cliente.

### 1.1 Características Principales

- **Dashboard Personalizado:** Métricas clave y alertas activas
- **Gestión de Clientes:** Listado con búsqueda y ficha médica
- **Creador de Rutinas:** CRUD completo de ejercicios
- **Planificador de Dietas:** Macros por somatotipo
- **Chat en Tiempo Real:** Comunicación con alumnos
- **Seguimiento:** Progreso y adherencia de cada cliente

### 1.2 Flujo de Usuario

```
Login → Dashboard → Gestión Diaria (Clientes/Rutinas/Dietas/Chat)
```

---

## 2. Estructura del Módulo

### 2.1 Organización de Archivos

```
src/
├── pages/trainer/
│   ├── dashboard.astro          # /trainer/dashboard (Resumen del coach)
│   ├── clients.astro            # /trainer/clients (Buscador y visor de alumnos)
│   ├── workouts.astro           # /trainer/workouts (Diseño y CRUD de rutinas)
│   ├── diets.astro              # /trainer/diets (Diseño y CRUD de dietas por somatotipo)
│   ├── chat.astro               # /trainer/chat (Bandeja de mensajería bidireccional)
│   └── settings.astro           # /trainer/settings (Configuración de perfil)
├── layouts/
│   └── TrainerLayout.astro      # Layout base con navegación inferior responsiva
└── lib/
    └── trainer/
        └── trainerUtils.ts      # Utilidades, servicios Firestore, tipos y renderizadores
```

### 2.2 Responsabilidades por Capa

**Páginas (pages/trainer/):**
- Renderizado de vistas específicas
- Captura de eventos de usuario
- Orquestación de servicios
- Gestión de estado local

**Layout (TrainerLayout.astro):**
- Navegación inferior (Bottom Nav)
- Estructura común
- Theme toggle
- Logout button

**Servicios (lib/trainer/):**
- Lógica de negocio específica del trainer
- Comunicación con Firestore
- Procesamiento de datos
- Manejo de errores

---

## 3. Dashboard del Entrenador

### 3.1 Descripción

**Ruta:** `/trainer/dashboard`  
**Layout:** `TrainerLayout.astro` (con Bottom Navigation)

Panel principal con estadísticas clave y notificaciones urgentes del entrenador.

### 3.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Dashboard del Entrenador        │
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ 👥       │ │ 💪       │ │ 🥗       ││
│  │ Alumnos  │ │ Rutinas  │ │ Dietas   ││
│  │ 12       │ │ 8        │ │ 5        ││
│  └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ 💬       │ │ ⚠️       │ │ 📊       ││
│  │ Chats    │ │ Alertas  │ │ RPE      ││
│  │ 3        │ │ 2        │ │ 7.5      ││
│  │ nuevos   │ │ activas  │ │ prom     ││
│  └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────┤
│  Alertas Activas                        │
│  ┌─────────────────────────────────┐   │
│  │ ⚠️ Juan Pérez - 3 días sin     │   │
│  │    registrar peso               │   │
│  │ ⚠️ María García - Alerta       │   │
│  │    enviada                      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 3.3 Datos Mostrados

**Tarjetas de Estadísticas:**
- **Total de Alumnos:** Cantidad de usuarios `client` vinculados al ID del entrenador
- **Rutinas Creadas:** Total de entrenamientos registrados por el entrenador
- **Dietas Creadas:** Total de planes nutricionales registrados por el entrenador
- **Chats Activos / Mensajes No Leídos:** Notificación visual de conversaciones pendientes
- **Alertas Activas:** Lista prioritaria de clientes con estados de inactividad o llamados de atención activos
- **RPE Promedio:** Esfuerzo percibido promedio de la semana

### 3.4 Implementación

```typescript
// lib/trainer/trainerUtils.ts
export function subscribeToTrainerDashboard(trainerId: string, callback: (data: TrainerDashboard) => void) {
  // Suscribirse a clientes
  const unsubscribeClients = subscribeToClients(trainerId, (clients) => {
    // Procesar clientes
  });
  
  // Suscribirse a workouts
  const unsubscribeWorkouts = subscribeToWorkoutsByTrainer(trainerId, (workouts) => {
    // Procesar workouts
  });
  
  // Suscribirse a diets
  const unsubscribeDiets = subscribeToDietsByTrainer(trainerId, (diets) => {
    // Procesar diets
  });
  
  // Suscribirse a alertas
  const unsubscribeAlerts = subscribeToAlerts(trainerId, (alerts) => {
    // Procesar alertas
  });
  
  // Retornar función de cleanup
  return () => {
    unsubscribeClients();
    unsubscribeWorkouts();
    unsubscribeDiets();
    unsubscribeAlerts();
  };
}
```

---

## 4. Gestión de Clientes

### 4.1 Descripción

**Ruta:** `/trainer/clients`  
**Layout:** `TrainerLayout.astro`

Listado interactivo que permite al entrenador auditar a sus alumnos asignados.

### 4.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Mis Clientes                    │
├─────────────────────────────────────────┤
│  🔍 Buscar cliente...                   │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Juan Pérez              ⚠️ 3 días│   │
│  │ juan@email.com                    │   │
│  │ RPE: 7.5 | Adherencia: 85%       │   │
│  │ [Ver Perfil] [Chat]               │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ María García           ✅ Activo │   │
│  │ maria@email.com                  │   │
│  │ RPE: 8.0 | Adherencia: 92%       │   │
│  │ [Ver Perfil] [Chat]               │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 4.3 Características

**Buscador:**
- Filtrado en tiempo real por el nombre del cliente
- Búsqueda por email
- Filtro por estado (activo/inactivo)

**Visualización de Ficha Médica:**
Al hacer clic en un alumno, se expande su información clínica:
- Objetivos fitness
- Experiencia (principiante, intermedio, avanzado)
- Alergias alimenticias
- Lesiones
- Peso inicial

**Acciones por Cliente:**
- Ver perfil completo
- Enviar mensaje (chat)
- Ver progreso
- Enviar alerta

### 4.4 Implementación

```typescript
// lib/trainer/trainerUtils.ts
export function subscribeToClients(trainerId: string, callback: (clients: Client[]) => void) {
  const q = query(
    collection(db, 'users'),
    where('assignedTrainerId', '==', trainerId),
    where('role', '==', 'client'),
    orderBy('name', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const clients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Client[];
    callback(clients);
  });
}

export async function getClientProfile(clientId: string): Promise<ClientProfile> {
  const docSnap = await getDoc(doc(db, 'users', clientId));
  return {
    id: docSnap.id,
    ...docSnap.data()
  } as ClientProfile;
}
```

---

## 5. Gestor de Rutinas

### 5.1 Descripción

**Ruta:** `/trainer/workouts`  
**Layout:** `TrainerLayout.astro`

Herramienta CRUD interactiva para planificar ejercicios individuales.

### 5.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Mis Rutinas                     │
├─────────────────────────────────────────┤
│  [+ Nueva Rutina]                        │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Rutina de Fuerza - Juan Pérez   │   │
│  │ Dificultad: Intermedio          │   │
│  │ Ejercicios: 8                   │   │
│  │ [Editar] [Asignar] [Eliminar]   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Rutina de Cardio - María        │   │
│  │ Dificultad: Principiante        │   │
│  │ Ejercicios: 5                   │   │
│  │ [Editar] [Asignar] [Eliminar]   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 5.3 Formulario de Ejercicios

```
┌─────────────────────────────────────────┐
│  Nueva Rutina                            │
├─────────────────────────────────────────┤
│  Nombre: [Rutina de Fuerza      ]       │
│  Dificultad: [Intermedio ▼]             │
│  Descripción: [Descripción...   ]       │
├─────────────────────────────────────────┤
│  Ejercicios                             │
│  ┌─────────────────────────────────┐   │
│  │ Ejercicio 1                      │   │
│  │ Nombre: [Press de banca    ]    │   │
│  │ Series: [4] Reps: [10]          │   │
│  │ Descanso: [90s]                 │   │
│  │ Video: [URL opcional]           │   │
│  │ [🗑️ Eliminar]                   │   │
│  └─────────────────────────────────┘   │
│  [+ Añadir Ejercicio]                   │
├─────────────────────────────────────────┤
│  [Guardar Rutina] [Cancelar]            │
└─────────────────────────────────────────┘
```

### 5.4 Implementación

```typescript
// lib/trainer/trainerUtils.ts
export function subscribeToWorkoutsByTrainer(trainerId: string, callback: (workouts: Workout[]) => void) {
  const q = query(
    collection(db, 'workouts'),
    where('trainerId', '==', trainerId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const workouts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Workout[];
    callback(workouts);
  });
}

export async function createWorkout(data: CreateWorkoutData): Promise<string> {
  const docRef = await addDoc(collection(db, 'workouts'), {
    ...data,
    trainerId: data.trainerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
  });
  
  return docRef.id;
}

export async function updateWorkout(workoutId: string, data: Partial<Workout>): Promise<void> {
  await updateDoc(doc(db, 'workouts', workoutId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteWorkout(workoutId: string): Promise<void> {
  await deleteDoc(doc(db, 'workouts', workoutId));
}
```

---

## 6. Planificador Nutricional

### 6.1 Descripción

**Ruta:** `/trainer/diets`  
**Layout:** `TrainerLayout.astro`

Creador de dietas y macros por comidas.

### 6.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Mis Dietas                      │
├─────────────────────────────────────────┤
│  Filtro: [Todos ▼] | Somatotipo: [Todos]│
├─────────────────────────────────────────┤
│  [+ Nueva Dieta]                         │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Dieta Volumen - Juan Pérez      │   │
│  │ Somatotipo: Mesomorph           │   │
│  │ Calorías: 2500 kcal             │   │
│  │ Comidas: 4                      │   │
│  │ [Editar] [Asignar] [Eliminar]   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 6.3 Formulario de Dieta

```
┌─────────────────────────────────────────┐
│  Nueva Dieta                             │
├─────────────────────────────────────────┤
│  Nombre: [Dieta de Volumen      ]       │
│  Cliente: [Juan Pérez ▼]                │
│  Somatotipo: [Mesomorph ▼]              │
│  Calorías Totales: [2500] kcal          │
├─────────────────────────────────────────┤
│  Comidas                                 │
│  ┌─────────────────────────────────┐   │
│  │ Desayuno (07:00)                │   │
│  │ Calorías: 600                   │   │
│  │ Macros: P:30g C:80g G:15g       │   │
│  │ [Editar] [Eliminar]             │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Almuerzo (13:00)                │   │
│  │ Calorías: 800                   │   │
│  │ Macros: P:50g C:100g G:25g      │   │
│  │ [Editar] [Eliminar]             │   │
│  └─────────────────────────────────┘   │
│  [+ Añadir Comida]                       │
├─────────────────────────────────────────┤
│  [Guardar Dieta] [Cancelar]             │
└─────────────────────────────────────────┘
```

### 6.4 Características

**Filtro por Somatotipo:**
- Clasifica y asiste la asignación basándose en el tipo de cuerpo del cliente
- `ectomorph` - Delgado, metabolismo rápido
- `mesomorph` - Musculoso, metabolismo normal
- `endomorph` - Ancho, metabolismo lento

**Macros por Comida:**
- Desglose interactivo para desayuno, almuerzo, merienda y cena
- Cálculo calórico automático
- Distribución de macronutrientes (proteínas, carbohidratos, grasas)

### 6.5 Implementación

```typescript
// lib/trainer/trainerUtils.ts
export function subscribeToDietsByTrainer(trainerId: string, callback: (diets: Diet[]) => void) {
  const q = query(
    collection(db, 'diets'),
    where('trainerId', '==', trainerId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const diets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Diet[];
    callback(diets);
  });
}

export async function createDiet(data: CreateDietData): Promise<string> {
  const docRef = await addDoc(collection(db, 'diets'), {
    ...data,
    trainerId: data.trainerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
  });
  
  return docRef.id;
}

export async function updateDiet(dietId: string, data: Partial<Diet>): Promise<void> {
  await updateDoc(doc(db, 'diets', dietId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDiet(dietId: string): Promise<void> {
  await deleteDoc(doc(db, 'diets', dietId));
}
```

---

## 7. Chat con Clientes

### 7.1 Descripción

**Ruta:** `/trainer/chat`  
**Layout:** `TrainerLayout.astro`

Bandeja de mensajería bidireccional con todos los clientes asignados.

### 7.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Chat con Clientes               │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Juan Pérez                 ● 2   │   │
│  │ "¿Cómo va el entrenamiento?"    │   │
│  │ Hace 5 min                      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ María García               ● 0   │   │
│  │ "Gracias por la dieta"          │   │
│  │ Hace 1 hora                     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 7.3 Características

- Lista de conversaciones ordenadas por último mensaje
- Indicador de mensajes no leídos
- Búsqueda de conversaciones por nombre de cliente
- Envío de alertas (llamados de atención)
- Stream en tiempo real

### 7.4 Implementación

```typescript
// lib/trainer/trainerUtils.ts
export function subscribeToTrainerChats(trainerId: string, callback: (chats: Chat[]) => void) {
  const q = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', trainerId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    
    // Agrupar por cliente
    const chats = groupMessagesByClient(messages, trainerId);
    callback(chats);
  });
}

export async function sendAlertToClient(
  trainerId: string,
  clientId: string,
  message: string
): Promise<void> {
  await addDoc(collection(db, 'messages'), {
    senderId: trainerId,
    receiverId: clientId,
    participants: [trainerId, clientId],
    content: message,
    type: 'alert',
    isRead: false,
    createdAt: serverTimestamp(),
  });
}
```

---

## 8. Configuración

### 8.1 Descripción

**Ruta:** `/trainer/settings`  
**Layout:** `TrainerLayout.astro`

Página de configuración donde el entrenador puede editar su perfil y preferencias.

### 8.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Configuración                   │
├─────────────────────────────────────────┤
│  Sección: Perfil                        │
│  ┌─────────────────────────────────┐   │
│  │ Nombre: [Coach Juan        ]    │   │
│  │ Email:  [juan@email.com    ]    │   │
│  │ [Guardar Cambios]               │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Sección: Preferencias                  │
│  ┌─────────────────────────────────┐   │
│  │ Idioma: [Español ▼]            │   │
│  │ Tema:   [Oscuro ▼]             │   │
│  │ Notificaciones: [🔔 Activadas] │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 8.3 Características

**Perfil:**
- Editar nombre
- Cambiar email (con verificación)
- Cambiar contraseña

**Preferencias:**
- Idioma (ES/EN)
- Tema (claro/oscuro)
- Notificaciones push

---

## 9. Seguridad y Permisos

### 9.1 Reglas de Firestore

El acceso del rol `trainer` está configurado en `firestore.rules`:

- Un entrenador **solo puede leer** los documentos de la colección `users` que tengan `assignedTrainerId` igual a su UID.
- Un entrenador **puede crear y modificar** las rutinas (`workouts`) y dietas (`diets`) donde el campo `trainerId` coincida con su propio identificador.
- Un entrenador **no puede** cambiar su rol a `admin` ni modificar datos de otros entrenadores.

### 9.2 Validaciones

**En Cliente:**
- Verificar que el cliente esté asignado al trainer
- No acceder a datos de otros clientes

**En Workouts/Diets:**
- Verificar que el trainerId coincida
- No modificar rutinas/dietas de otros trainers

**En Mensajes:**
- Verificar que el trainer sea participante del chat
- No enviar alertas a usuarios no asignados

---

## 🔗 Referencias

- **Documentación Maestra:** `docs/MASTER.md` (sección 9)
- **Design System:** `docs/03_design_system.md`
- **Flujos de Navegación:** `docs/04_flujos_navegacion.md`
- **Módulo de Autenticación:** `docs/05_modulo_autenticacion.md`

---

**Documento creado:** 2026-06-13  
**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit