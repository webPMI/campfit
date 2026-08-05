# ⚙️ Arquitectura Técnica y Modelo de Datos - CampFit

> **Última actualización:** 2026-07-31  
> **Estado:** Consolidado en `docs/MASTER.md` (secciones 2 y 3)

---

## 📑 Índice

1. [Stack de Tecnologías](#1-stack-de-tecnologías)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Modelo de Datos Firestore](#3-modelo-de-datos-firestore)
4. [Reglas de Seguridad](#4-reglas-de-seguridad)
5. [Flujo de Datos](#5-flujo-de-datos)

---

## 1. Stack de Tecnologías

### 1.1 Tecnologías Principales

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Astro** | 7.x | Framework web con compilación estática y enrutado automático |
| **Tailwind CSS** | 4.x | Framework de estilos con utilidades CSS |
| **Firebase** | 11.x | Backend como servicio (Auth + Firestore) |
| **Nanostores** | 1.x | Estado reactivo minimalista |

### 1.2 Tecnologías de Desarrollo

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **TypeScript** | 5.x | Tipado estático y seguridad de tipos |
| **Vitest** | Latest | Testing unitario y de integración |
| **Playwright** | Latest | Testing end-to-end |
| **ESLint** | Latest | Linting y calidad de código |
| **Prettier** | Latest | Formateo de código |

### 1.3 Características del Stack

**Astro 7.x:**
- ✅ Compilación estática (SSG) por defecto
- ✅ Renderizado híbrido (SSR cuando sea necesario)
- ✅ Zero JavaScript por defecto (hidratación selectiva)
- ✅ Enrutado basado en sistema de archivos
- ✅ Integración nativa con Tailwind CSS 4

**Firebase 11.x:**
- ✅ Firestore: Base de datos NoSQL en tiempo real
- ✅ Auth: Autenticación con email/contraseña y Google
- ✅ Hosting: Despliegue estático
- ✅ IndexedDB: Persistencia local de sesión

**Nanostores 1.x:**
- ✅ Estado reactivo sin dependencias
- ✅ Persistencia automática en localStorage
- ✅ Computed atoms para estado derivado
- ✅ Sin boilerplate, API minimalista

---

## 2. Arquitectura del Sistema

### 2.1 Patrón Arquitectónico

CampFit utiliza una arquitectura **híbrida** que combina:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Astro (SSG) + Componentes Hidratados             │  │
│  │  - Páginas estáticas generadas en build           │  │
│  │  - Lógica interactiva con vanilla JS              │  │
│  │  - Nanostores para estado reactivo                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│              FIREBASE (Backend as a Service)             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Auth       │  │   Firestore  │  │   Hosting     │  │
│  │ - Email/Pass │  │   (NoSQL)    │  │   (Static)    │  │
│  │ - Google     │  │ - Realtime   │  │               │  │
│  │ - IndexedDB  │  │ - Offline    │  │               │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Capas de la Aplicación

#### Capa 1: Presentación (Astro Components)
- **Responsabilidad:** Renderizado de UI
- **Tecnología:** Componentes `.astro` (HTML + CSS + JS)
- **Hidratación:** Selectiva (solo donde se necesita interactividad)

#### Capa 2: Lógica de Negocio (Services)
- **Responsabilidad:** Lógica de negocio y orquestación
- **Tecnología:** TypeScript puro (sin frameworks)
- **Ejemplos:** `authService.ts`, `workoutService.ts`, `dietService.ts`

#### Capa 3: Datos (Firebase SDK)
- **Responsabilidad:** Acceso a datos y sincronización
- **Tecnología:** Firebase Client SDK (Firestore, Auth)
- **Patrón:** Repositorio + Streams (onSnapshot)

#### Capa 4: Estado (Nanostores)
- **Responsabilidad:** Estado global reactivo
- **Tecnología:** Nanostores atoms y computed
- **Persistencia:** localStorage automática

### 2.3 Flujo de Datos

```
Usuario interactúa con UI
    ↓
Componente Astro (evento)
    ↓
Service (lógica de negocio)
    ↓
Firebase SDK (operación)
    ↓
Firestore (persistencia)
    ↓
onSnapshot (stream)
    ↓
Service (callback)
    ↓
Nanostore (actualización)
    ↓
Componente Astro (re-render)
```

### 2.4 Principios de Diseño

1. **Separación de Responsabilidades:**
   - Componentes: Solo renderizan
   - Services: Contienen lógica
   - Stores: Manejan estado global

2. **Inmutabilidad:**
   - No mutar objetos de Firestore directamente
   - Usar operaciones atómicas de Firestore

3. **Reactividad:**
   - Streams de Firestore para datos en tiempo real
   - Nanostores para estado derivado
   - Unsubscribe en cleanup para evitar memory leaks

4. **Type Safety:**
   - TypeScript estricto en todo el código
   - Interfaces para todos los modelos de datos
   - No usar `any` (ver Golden Rules)

---

## 3. Modelo de Datos Firestore

### 3.1 Colección `users`

**Descripción:** Perfiles de todos los usuarios (admin, trainer, client)

```typescript
{
  uid: string;                    // ID del documento (igual al UID de Firebase Auth)
  name: string;                   // Nombre completo
  email: string;                  // Email único
  role: 'admin' | 'trainer' | 'client';  // Rol del usuario
  assignedTrainerId?: string;     // ID del entrenador asignado (solo para clientes)
  hasActiveAlert: boolean;        // Alerta activa
  createdAt: Timestamp;           // Fecha de creación
  updatedAt: Timestamp;           // Última actualización
  lastActivityAt?: Timestamp;     // Última actividad (para detectar inactividad)
  
  // Subcolección: medicalProfile (solo para clientes)
  medicalProfile?: {
    height: number;               // Altura en cm
    initialWeight: number;        // Peso inicial en kg
    birthDate: Timestamp | Date | string | null;  // Fecha de nacimiento
    experience: 'beginner' | 'intermediate' | 'advanced';  // Nivel
    goals: string[];              // Objetivos fitness
    allergies: string[];          // Alergias alimenticias
    injuries: string[];           // Lesiones
    conditions: string[];         // Condiciones médicas
  }
}
```

**Índices recomendados:**
- `role` (para filtrar por rol)
- `assignedTrainerId` (para buscar clientes de un trainer)
- `hasActiveAlert` (para filtrar alertas)
- `createdAt` (para ordenar por fecha)

### 3.2 Colección `workouts`

**Descripción:** Rutinas de entrenamiento (activas y plantillas)

```typescript
{
  id: string;                     // ID del documento
  clientId: string;               // ID del cliente (vacío si es plantilla global)
  trainerId: string;              // ID del entrenador creador
  name: string;                   // Nombre de la rutina
  difficulty: 'beginner' | 'intermediate' | 'advanced';  // Nivel
  description: string;            // Descripción detallada
  exercises: Array<{
    name: string;                 // Nombre del ejercicio
    sets: number;                 // Número de series
    reps: number;                 // Repeticiones por serie
    restTime: string;             // Tiempo de descanso (ej: "90s")
    videoUrl?: string;            // URL de video demostrativo
    completed: boolean;           // Estado local de completado
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;              // Si está activa actualmente
}
```

**Índices recomendados:**
- `clientId` + `createdAt` (para obtener rutina activa de un cliente)
- `trainerId` (para ver rutinas creadas por un trainer)
- `isActive` (para filtrar rutinas activas)

### 3.3 Colección `diets`

**Descripción:** Planes alimenticios y plantillas

```typescript
{
  id: string;                     // ID del documento
  clientId: string;               // ID del cliente (vacío si es plantilla global)
  trainerId: string;              // ID del entrenador creador
  name: string;                   // Nombre de la dieta
  totalCalories: number;          // Calorías totales diarias
  somatotype: 'ectomorph' | 'mesomorph' | 'endomorph';  // Tipo de cuerpo
  meals: Array<{
    id: string;                   // ID único de la comida
    name: string;                 // Nombre (ej: "Almuerzo")
    time: string;                 // Hora de ingesta (ej: "13:00")
    calories: number;             // Calorías de la comida
    macros: {
      protein: number;            // Proteínas en gramos
      carbs: number;              // Carbohidratos en gramos
      fat: number;                // Grasas en gramos
    };
    foods: Array<{                // Alimentos específicos
      name: string;
      quantity: string;
      calories: number;
    }>;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;              // Si está activa actualmente
}
```

**Índices recomendados:**
- `clientId` + `createdAt` (para obtener dieta activa)
- `trainerId` (para ver dietas creadas por un trainer)
- `somatotype` (para filtrar por tipo de cuerpo)

### 3.4 Colección `messages`

**Descripción:** Mensajes individuales de chats

```typescript
{
  id: string;                     // ID del documento
  senderId: string;               // ID del remitente
  receiverId: string;             // ID del destinatario
  participants: string[];         // Array de participantes [clientId, trainerId]
  content: string;                // Contenido del mensaje
  type: 'text' | 'alert';         // Tipo: mensaje normal o alerta
  isRead: boolean;                // Si fue leído
  createdAt: Timestamp;           // Fecha de envío
}
```

**Índices recomendados:**
- `participants` (array-contains) + `createdAt` (para obtener chat entre dos usuarios)
- `senderId` (para ver mensajes enviados)
- `receiverId` + `isRead` (para ver mensajes no leídos)

### 3.5 Colección `progress_logs`

**Descripción:** Historial de medidas y fotos de progreso

```typescript
{
  id: string;                     // ID del documento
  clientId: string;               // ID del cliente
  type: 'weight' | 'photo' | 'workout' | 'meal';  // Tipo de registro
  date: Timestamp;                // Fecha del registro
  value: {
    // Para type='weight'
    weight?: number;              // Peso en kg
    
    // Para type='photo'
    photoUrl?: string;            // URL de la foto (Base64 o R2)
    photoType?: 'front' | 'side' | 'back';  // Tipo de foto
    
    // Para type='workout'
    workoutId?: string;           // ID de la rutina
    completed?: boolean;          // Si completó la rutina
    rpe?: number;                 // Esfuerzo percibido (1-10)
    
    // Para type='meal'
    mealId?: string;              // ID de la comida
    completed?: boolean;          // Si completó la comida
  };
  createdAt: Timestamp;
}
```

**Índices recomendados:**
- `clientId` + `date` (para obtener historial de un cliente)
- `clientId` + `type` + `date` (para filtrar por tipo)
- `type` (para ver todos los registros de un tipo)

---

## 4. Reglas de Seguridad

### 4.1 Principios Generales

1. **Mínimo Privilegio:** Cada rol solo accede a lo que necesita
2. **Validación en Servidor:** Firestore Rules son la última línea de defensa
3. **No Confiar en el Cliente:** Todo se valida en backend
4. **Auditoría:** Cambios críticos se registran

### 4.2 Reglas por Rol

#### Cliente (`client`)
- ✅ **Leer:** Sus propios workouts, diets, progress_logs
- ✅ **Escribir:** Sus propios progress_logs (peso, fotos, completados)
- ❌ **Leer:** Datos de otros usuarios
- ❌ **Escribir:** workouts, diets, messages de otros

#### Entrenador (`trainer`)
- ✅ **Leer:** Sus propios workouts, diets
- ✅ **Leer:** Clientes asignados (users con assignedTrainerId = su UID)
- ✅ **Escribir:** workouts, diets donde trainerId = su UID
- ✅ **Escribir:** messages donde participants incluya su UID
- ❌ **Leer:** Usuarios no asignados
- ❌ **Escribir:** Modificar role de usuarios

#### Administrador (`admin`)
- ✅ **Leer:** Todas las colecciones
- ✅ **Escribir:** Todas las colecciones (excepto role sin validación)
- ✅ **Escribir:** role en users (solo admins)
- ❌ **Eliminar:** Colecciones completas (solo por consola)

### 4.3 Implementación en Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: solo lectura propia, escritura de role solo para admins
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId 
                   || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // El campo role solo lo pueden modificar admins
      allow update: if request.resource.data.role == resource.data.role
                    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Workouts: cliente ve los suyos, trainer ve los que crea
    match /workouts/{workoutId} {
      allow read: if request.auth != null 
                  && (resource.data.clientId == request.auth.uid 
                      || resource.data.trainerId == request.auth.uid);
      allow write: if request.auth != null 
                   && resource.data.trainerId == request.auth.uid;
    }
    
    // Diets: misma lógica que workouts
    match /diets/{dietId} {
      allow read: if request.auth != null 
                  && (resource.data.clientId == request.auth.uid 
                      || resource.data.trainerId == request.auth.uid);
      allow write: if request.auth != null 
                   && resource.data.trainerId == request.auth.uid;
    }
    
    // Messages: participantes del chat
    match /messages/{messageId} {
      allow read: if request.auth != null 
                  && request.auth.uid in resource.data.participants;
      allow create: if request.auth != null 
                    && request.auth.uid in request.resource.data.participants;
    }
    
    // Progress logs: cliente ve los suyos, trainer ve los de sus clientes
    match /progress_logs/{logId} {
      allow read: if request.auth != null 
                  && (resource.data.clientId == request.auth.uid
                      || get(/databases/$(database)/documents/users/$(resource.data.clientId)).data.assignedTrainerId == request.auth.uid);
      allow create: if request.auth != null 
                    && request.auth.uid == request.resource.data.clientId;
    }
  }
}
```

---

## 5. Flujo de Datos

### 5.1 Autenticación

```
1. Usuario ingresa credenciales
   ↓
2. Firebase Auth Client SDK
   - signInWithEmailAndPassword() o signInWithPopup(Google)
   ↓
3. Auth State Change
   - onAuthStateChanged() detecta cambio
   ↓
4. Obtener perfil de Firestore
   - getDoc(users/{uid})
   ↓
5. Inicializar Nanostore
   - $user.set(userData)
   ↓
6. Redirigir según rol
   - admin → /admin/dashboard
   - client → /client/dashboard (o /client/medical-profile)
   - trainer → /trainer/dashboard
```

### 5.2 Lectura de Datos en Tiempo Real

```
1. Componente Astro se monta
   ↓
2. Llamar a servicio
   - subscribeToWorkouts(clientId, callback)
   ↓
3. Servicio crea query de Firestore
   - query(collection(db, 'workouts'), where(...), orderBy(...))
   ↓
4. onSnapshot() escucha cambios
   - Retorna función de desuscripción
   ↓
5. Firestore envía datos iniciales
   ↓
6. Callback procesa datos
   - snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
   ↓
7. Actualizar Nanostore
   - $workouts.set(workouts)
   ↓
8. Componente se re-renderiza
   - Astro detecta cambio en store
   ↓
9. Cleanup al desmontar
   - unsubscribe() en beforeunload o astro:before-swap
```

### 5.3 Escritura de Datos

```
1. Usuario ejecuta acción
   - Click en "Guardar"
   ↓
2. Componente llama a servicio
   - saveWorkout(workoutData)
   ↓
3. Servicio valida datos
   - Validación de tipos
   - Validación de negocio
   ↓
4. Servicio escribe en Firestore
   - setDoc() o updateDoc()
   ↓
5. Firestore actualiza documento
   ↓
6. onSnapshot() detecta cambio
   ↓
7. Callback actualiza Nanostore
   ↓
8. UI se actualiza automáticamente
```

---

## 🔗 Referencias

- **Documentación Maestra:** `docs/MASTER.md` (secciones 2 y 3)
- **Stack Tecnológico:** `docs/MASTER.md` (sección 2)
- **Modelo de Datos:** `docs/MASTER.md` (sección 3)
- **Reglas de Desarrollo:** `docs/MASTER.md` (sección 11)

---

**Documento creado:** 2026-06-13  
**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit