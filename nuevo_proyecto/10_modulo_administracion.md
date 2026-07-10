# ⚙️ Módulo de Administración - CampFit 2.0

> **Monolito:** `packages/admin/` — Dependencia: solo `@campfit/shared`

## Descripción General

Panel de control para el administrador (Seba). Proporciona herramientas para gestionar usuarios, crear y asignar planes de entrenamiento y nutrición, supervisar el progreso de los alumnos y gestionar la comunicación. Es un monolito independiente en `packages/admin/`.

---

## Estructura del Monolito

```
packages/admin/
├── src/
│   ├── components/
│   │   ├── DashboardCards.tsx       # StatCards del panel (alumnos, rutinas, dietas, adherencia)
│   │   ├── AdherenceTrafficLight.tsx # Semáforo de adherencia por alumno
│   │   ├── AlertList.tsx            # Lista de alertas recientes
│   │   ├── UserTable.tsx            # Tabla de gestión de usuarios
│   │   ├── UserEditModal.tsx        # Modal de edición de usuario
│   │   ├── WorkoutList.tsx          # Listado de rutinas
│   │   ├── WorkoutEditor.tsx        # Editor de rutinas con ejercicios
│   │   ├── DietList.tsx             # Listado de dietas
│   │   ├── DietEditor.tsx           # Editor de dietas con comidas
│   │   ├── ChatInbox.tsx            # Bandeja de chat con alumnos
│   │   ├── ChatConversation.tsx     # Conversación individual
│   │   ├── ProgressViewer.tsx       # Visor de progreso del alumno
│   │   └── PhotoComparer.tsx        # Comparador side-by-side de fotos
│   ├── services/
│   │   ├── userService.ts           # CRUD usuarios, cambio de rol, asignación
│   │   ├── workoutService.ts        # CRUD rutinas, validación médica
│   │   ├── dietService.ts           # CRUD dietas, validación alergias
│   │   ├── chatService.ts           # Mensajes 1:1, envío de alertas
│   │   └── progressService.ts       # Visor de progreso de cualquier cliente
│   ├── stores/
│   │   ├── $users.ts                # Lista de usuarios
│   │   ├── $workouts.ts             # Rutinas de todos los clientes
│   │   ├── $diets.ts                # Dietas de todos los clientes
│   │   └── $messages.ts             # Mensajes del chat
│   ├── pages/
│   │   ├── panel.astro              # /admin/panel
│   │   ├── users.astro              # /admin/users
│   │   ├── workouts.astro           # /admin/workouts
│   │   ├── workouts-editor.astro    # /admin/workouts/editor
│   │   ├── diets.astro              # /admin/diets
│   │   ├── diets-editor.astro       # /admin/diets/editor
│   │   ├── chat.astro               # /admin/chat
│   │   └── progress.astro           # /admin/progress
│   └── types.ts                     # Interfaces específicas del admin
├── package.json                     # name: "@campfit/admin"
└── tsconfig.json
```

### Reglas de Importación
- ✅ `import { Button, Card } from '@campfit/shared'` → Componentes UI
- ✅ `import { db } from '@campfit/shared'` → Firebase config
- ✅ `import { $user } from '@campfit/shared'` → Stores base
- ✅ `import { User, Workout, Diet } from '@campfit/shared'` → Tipos base
- ✅ `import { userService } from '../services/userService'` → Local
- ❌ `import { something } from '@campfit/client'` → Prohibido

---

## 1. Dashboard de Administración

**Ruta:** `/admin/panel`  
**Layout:** `AdminLayout.astro` (con Sidebar)

### Componentes

```
┌──────────────────────────────────────────────────┐
│  📊 Dashboard CampFit                             │
├──────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐│
│  │ 👥       │ │ 💪       │ │ 🥗       │ │ 📈  ││
│  │ 25       │ │ 18       │ │ 15       │ │ 72% ││
│  │ Alumnos  │ │ Rutinas  │ │ Dietas   │ │ Adh. ││
│  └──────────┘ └──────────┘ └──────────┘ └──────┘│
├──────────────────────────────────────────────────┤
│  Semáforo de Adherencia                          │
│  ┌──────────────────────────────────────────┐   │
│  │ 🟢 Juan Pérez          92% ██████████   │   │
│  │ 🟢 María García        95% ██████████   │   │
│  │ 🟡 Carlos López        78% ████████░░   │   │
│  │ 🟡 Ana Martínez        72% ███████░░░   │   │
│  │ 🔴 Pedro Sánchez       45% ████░░░░░░   │   │
│  └──────────────────────────────────────────┘   │
├──────────────────────────────────────────────────┤
│  Alertas Recientes                               │
│  ┌──────────────────────────────────────────┐   │
│  │ ⚠️ Pedro Sánchez - Llamado de atención  │   │
│  │   Hace 2 horas                           │   │
│  │ 💬 Ana Martínez - Mensaje sin leer      │   │
│  │   Hace 30 min                           │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

### Datos (Firestore streams)

```typescript
// packages/admin/src/services/progressService.ts
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@campfit/shared';

export function subscribeToAdherence(callback: (data: any[]) => void) {
  const q = query(
    collection(db, 'progress_logs'),
    where('date', '>=', getWeekStart())
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}
```

### Cálculo de Adherencia

```typescript
// packages/admin/src/services/progressService.ts
function calculateAdherence(clientId: string): number {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  
  const expectedWorkouts = 5; // Lun-Vie
  const expectedMeals = 15;   // 3 comidas × 5 días
  
  const logs = getLogs(clientId, weekStart, weekEnd);
  const completedWorkouts = logs.filter(l => l.type === 'workout' && l.value.completed).length;
  const completedMeals = logs.filter(l => l.type === 'meal' && l.value.completed).length;
  
  const totalExpected = expectedWorkouts + expectedMeals;
  const totalCompleted = completedWorkouts + completedMeals;
  
  return Math.round((totalCompleted / totalExpected) * 100);
}

function getTrafficLight(adherence: number): 'green' | 'yellow' | 'red' {
  if (adherence >= 90) return 'green';
  if (adherence >= 70) return 'yellow';
  return 'red';
}
```

---

## 2. Gestión de Usuarios

**Ruta:** `/admin/users`  
**Layout:** `AdminLayout.astro`

### Componentes

```
┌──────────────────────────────────────────────────┐
│  👥 Gestión de Usuarios                          │
│  [🔍 Buscar...] [Filtro: Todos │ Clientes │ ...]│
├──────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐   │
│  │ Nombre     │ Email          │ Rol   │ 🛠️ │   │
│  ├──────────────────────────────────────────┤   │
│  │ Seba       │ seba@...       │ Admin │ 📝 │   │
│  │ Juan Pérez │ juan@...       │ Client│ 📝 │   │
│  │ María García│ maria@...     │ Client│ 📝 │   │
│  │ Carlos López│ carlos@...    │ Client│ 📝 │   │
│  └──────────────────────────────────────────┘   │
├──────────────────────────────────────────────────┤
│  Modal: Editar Usuario                           │
│  ┌──────────────────────────────────────────┐   │
│  │ Nombre: [Juan Pérez                    ] │   │
│  │ Email: [juan@email.com                 ] │   │
│  │ Rol: [Client ▼]                         │   │
│  │ Trainer Asignado: [Seba ▼]              │   │
│  │ [Ver perfil médico] [Guardar] [Cancelar]│   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

### Servicio de Usuarios

```typescript
// packages/admin/src/services/userService.ts
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@campfit/shared';
import type { User } from '@campfit/shared';

export async function getAllUsers(): Promise<User[]> {
  const q = query(collection(db, 'users'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
}

export async function updateUserRole(uid: string, role: 'admin' | 'client' | 'trainer'): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() });
}

export async function deleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
  // Nota: El usuario de Firebase Auth se elimina vía Admin SDK (API Route)
}
```

### Acciones Disponibles

| Acción | Descripción |
|--------|-------------|
| Ver perfil médico | Modal con datos médicos del cliente |
| Cambiar rol | Solo admin puede cambiar roles |
| Asignar trainer | Asignar un trainer a un cliente |
| Eliminar usuario | Confirmación requerida |
| Resetear contraseña | Enviar email de recuperación |

---

## 3. Editor de Rutinas

**Ruta:** `/admin/workouts` (listado) | `/admin/workouts/editor` (editor)  
**Layout:** `AdminLayout.astro`

### Listado de Rutinas

```
┌──────────────────────────────────────────────────┐
│  💪 Rutinas                                      │
│  [➕ Nueva rutina]                                │
├──────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐   │
│  │ Rutina        │ Cliente     │ Estado │ 🛠️ │   │
│  ├──────────────────────────────────────────┤   │
│  │ Full Body A   │ Juan Pérez  │ Activa │ 📝 │   │
│  │ Push Pull Legs│ María García│ Activa │ 📝 │   │
│  │ Upper Lower   │ Carlos López│ Activa │ 📝 │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

### Editor de Rutinas

```
┌──────────────────────────────────────────────────┐
│  ✏️ Editor de Rutina                             │
│  Nombre: [Full Body A                        ]   │
│  Cliente: [Juan Pérez ▼]                        │
│  Dificultad: [Intermedio ▼]                     │
├──────────────────────────────────────────────────┤
│  Día: [Lunes ▼]                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Ejercicio           │ Series│ Reps│ 🗑️  │   │
│  │ Press Banca         │ 4     │ 10  │ 🗑️  │   │
│  │ Sentadilla          │ 4     │ 12  │ 🗑️  │   │
│  │ Remo con Barra      │ 4     │ 10  │ 🗑️  │   │
│  │ [➕ Agregar ejercicio]                    │   │
│  └──────────────────────────────────────────┘   │
│  [📋 Copiar desde biblioteca]                   │
├──────────────────────────────────────────────────┤
│  ⚠️ Validación Médica                           │
│  ✅ Sin conflictos detectados                    │
│  ────────────────────────────────────────        │
│  [💾 Guardar rutina]                             │
└──────────────────────────────────────────────────┘
```

### Servicio de Rutinas

```typescript
// packages/admin/src/services/workoutService.ts
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db, serverTimestamp } from '@campfit/shared';
import type { Workout, Exercise } from '@campfit/shared';

export async function createWorkout(data: Omit<Workout, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'workouts'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateWorkout(id: string, data: Partial<Workout>): Promise<void> {
  await updateDoc(doc(db, 'workouts', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getClientWorkouts(clientId: string): Promise<Workout[]> {
  const q = query(collection(db, 'workouts'), where('clientId', '==', clientId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout));
}
```

### Validación Médica Automática

```typescript
// packages/admin/src/services/workoutService.ts
function validateWorkoutMedical(exercises: Exercise[], medicalProfile: MedicalProfile): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  if (medicalProfile.injuries.includes('rodilla')) {
    if (exercises.some(e => e.name.toLowerCase().includes('sentadilla'))) {
      warnings.push('Sentadilla puede afectar la rodilla lesionada');
    }
  }
  
  if (medicalProfile.conditions.includes('hipertensión')) {
    if (exercises.some(e => e.name.toLowerCase().includes('press'))) {
      warnings.push('Ejercicios de press pueden elevar la presión');
    }
  }
  
  return { warnings, errors, isValid: errors.length === 0 };
}
```

---

## 4. Editor de Dietas

**Ruta:** `/admin/diets` (listado) | `/admin/diets/editor` (editor)  
**Layout:** `AdminLayout.astro`

### Editor de Dietas

```
┌──────────────────────────────────────────────────┐
│  ✏️ Editor de Dieta                              │
│  Nombre: [Dieta Volumen                      ]   │
│  Cliente: [Juan Pérez ▼]                        │
│  Tipo: [Normal ▼]  Somatotipo: [Ectomorfo ▼]    │
│  Calorías Totales: 2,200 kcal                    │
├──────────────────────────────────────────────────┤
│  Comidas del día                                 │
│  ┌──────────────────────────────────────────┐   │
│  │ Desayuno (08:00)                         │   │
│  │ ┌────────────────────────────────────┐   │   │
│  │ │ Avena con proteína                │   │   │
│  │ │ Cal: 450 | P: 35g | C: 50g | G:12│   │   │
│  │ └────────────────────────────────────┘   │   │
│  │ [➕ Agregar comida]                       │   │
│  └──────────────────────────────────────────┘   │
│  [📋 Copiar desde plantilla]                    │
├──────────────────────────────────────────────────┤
│  ⚠️ Validación de Alergias                      │
│  ⚠️ Cliente tiene alergia a lactosa             │
│  ────────────────────────────────────────        │
│  [💾 Guardar dieta]                              │
└──────────────────────────────────────────────────┘
```

### Servicio de Dietas

```typescript
// packages/admin/src/services/dietService.ts
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db, serverTimestamp } from '@campfit/shared';
import type { Diet, Meal } from '@campfit/shared';

export async function createDiet(data: Omit<Diet, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'diets'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateDiet(id: string, data: Partial<Diet>): Promise<void> {
  await updateDoc(doc(db, 'diets', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
```

### Validación de Alergias

```typescript
// packages/admin/src/services/dietService.ts
function validateDietAllergies(meals: Meal[], medicalProfile: MedicalProfile): ValidationResult {
  const warnings: string[] = [];
  
  if (medicalProfile.allergies.includes('lactosa')) {
    meals.forEach(meal => {
      if (meal.description.toLowerCase().includes('leche') || 
          meal.description.toLowerCase().includes('queso')) {
        warnings.push(`"${meal.name}" contiene lácteos - revisar para alergia a lactosa`);
      }
    });
  }
  
  return { warnings, errors: [], isValid: true };
}
```

---

## 5. Bandeja de Chat

**Ruta:** `/admin/chat`  
**Layout:** `AdminLayout.astro`

### Componentes

```
┌──────────────────────────────────────────────────┐
│  💬 Bandeja de Chat                              │
│  [Filtro: Todos ▼] [🔍 Buscar...]               │
├──────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────────────────┐  │
│  │ Juan Pérez   │ │ ¿Cómo fue mi rutina de   │  │
│  │ 🔴 No leído  │ │ hoy?                     │  │
│  │ 14:30        │ │                           │  │
│  ├──────────────┤ ├──────────────────────────┤  │
│  │ María García │ │ Gracias por la dieta,    │  │
│  │ ✅ Leído     │ │ me gustó                 │  │
│  │ 12:00        │ │                           │  │
│  ├──────────────┤ ├──────────────────────────┤  │
│  │ ⚠️ Pedro     │ │ ⚠️ Llamado de atención   │  │
│  │ Sánchez      │ │ No he podido entrenar... │  │
│  │ 🔴 No leído  │ │                           │  │
│  │ 10:15        │ │                           │  │
│  └──────────────┘ └──────────────────────────┘  │
├──────────────────────────────────────────────────┤
│  [Chat seleccionado]                             │
│  ┌──────────────────────────────────────────┐   │
│  │ Mensajes del chat con Juan Pérez        │   │
│  │ ┌────────────────────────────────────┐   │   │
│  │ │ Juan: ¿Cómo fue mi rutina de hoy?  │   │   │
│  │ └────────────────────────────────────┘   │   │
│  │ ┌────────────────────────────────────┐   │   │
│  │ │ Tú: ¡Excelente! 8 RPE, buen       │   │   │
│  │ │ trabajo                            │   │   │
│  │ └────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────┘   │
│  ┌─ChatInput────────────────────────────────┐  │
│  │ Escribe un mensaje... [🔔 Alerta] [📎]  │  │
│  └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### Servicio de Chat

```typescript
// packages/admin/src/services/chatService.ts
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, serverTimestamp } from '@campfit/shared';
import type { Message } from '@campfit/shared';

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  type: 'normal' | 'alert' = 'normal'
): Promise<void> {
  await addDoc(collection(db, 'messages'), {
    senderId,
    receiverId,
    content,
    type,
    participants: [senderId, receiverId],
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToConversation(
  userId: string,
  adminId: string,
  callback: (messages: Message[]) => void
) {
  const q = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
  });
}
```

### Acciones del Admin en Chat

| Acción | Descripción |
|--------|-------------|
| Enviar mensaje | Chat normal 1:1 |
| Enviar alerta | Marcar mensaje como `type: 'alert'` → banner rojo en cliente |
| Marcar como leído | Automático al abrir el chat |
| Ver historial | Scroll infinito hacia arriba |

---

## 6. Visor de Progreso

**Ruta:** `/admin/progress`  
**Layout:** `AdminLayout.astro`

### Componentes

```
┌──────────────────────────────────────────────────┐
│  📈 Visor de Progreso                            │
│  Cliente: [Juan Pérez ▼]                        │
├──────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐   │
│  │  LineChart: Evolución del Peso           │   │
│  │  ┌────────────────────────────────┐     │   │
│  │  │  📈 80─╲                       │     │   │
│  │  │     75  ╲──╲                   │     │   │
│  │  │     70     ╲──                 │     │   │
│  │  │     Ene Feb Mar Abr            │     │   │
│  │  └────────────────────────────────┘     │   │
│  └──────────────────────────────────────────┘   │
├──────────────────────────────────────────────────┤
│  Adherencia: 72% 🟡                              │
│  ┌──────────────────────────────────────────┐   │
│  │  Semana 1: ██████████ 100% 🟢            │   │
│  │  Semana 2: ████████░░  80% 🟡            │   │
│  │  Semana 3: ██████░░░░  60% 🟡            │   │
│  │  Semana 4: ████░░░░░░  40% 🔴            │   │
│  └──────────────────────────────────────────┘   │
├──────────────────────────────────────────────────┤
│  Galería de Fotos                                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ 📸   │ │ 📸   │ │ 📸   │ │ 📸   │          │
│  │ Ene  │ │ Feb  │ │ Mar  │ │ Abr  │          │
│  └──────┘ └──────┘ └──────┘ └──────┘          │
│  [Comparar fotos] → Modal side-by-side          │
└──────────────────────────────────────────────────┘
```

### Servicio de Progreso

```typescript
// packages/admin/src/services/progressService.ts
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@campfit/shared';
import type { ProgressLog } from '@campfit/shared';

export async function getClientProgress(clientId: string): Promise<ProgressLog[]> {
  const q = query(
    collection(db, 'progress_logs'),
    where('clientId', '==', clientId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgressLog));
}

export async function getClientPhotos(clientId: string): Promise<ProgressLog[]> {
  const q = query(
    collection(db, 'progress_logs'),
    where('clientId', '==', clientId),
    where('type', '==', 'photo'),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgressLog));
}
```

---

## Tests

```typescript
// packages/admin/src/__tests__/services/userService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllUsers, updateUserRole } from '../services/userService';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}));

describe('userService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return all users', async () => {
    const mockUsers = [
      { id: '1', data: () => ({ name: 'Juan', role: 'client' }) },
      { id: '2', data: () => ({ name: 'Seba', role: 'admin' }) },
    ];
    vi.mocked(getDocs).mockResolvedValue({ docs: mockUsers } as any);
    
    const users = await getAllUsers();
    expect(users).toHaveLength(2);
  });

  it('should update user role', async () => {
    await updateUserRole('123', 'trainer');
    expect(updateDoc).toHaveBeenCalled();
  });
});
```

```typescript
// packages/admin/src/__tests__/services/workoutService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWorkout } from '../services/workoutService';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-workout-123' })),
  serverTimestamp: vi.fn(() => new Date()),
}));

describe('workoutService', () => {
  it('should create a new workout', async () => {
    const id = await createWorkout({
      clientId: 'client123',
      name: 'Full Body A',
      exercises: [],
      difficulty: 'intermediate',
    });
    expect(id).toBe('new-workout-123');
  });
});
```

---

> **📌 Convenciones de código:** Ver `12_guia_desarrollo_testing.md`
> **📌 Golden Rules:** Ver `.clinerules`
> **📌 Componentes UI:** Ver `06_design_system.md` (implementados en `@campfit/shared`)
> **📌 Guards de ruta:** Ver `08_modulo_autenticacion.md`
> **📌 API Routes (Admin SDK):** Ver `15_api_contracts.md`
