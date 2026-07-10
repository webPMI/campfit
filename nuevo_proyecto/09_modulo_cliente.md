# 👤 Módulo del Cliente - CampFit 2.0

> **Monolito:** `packages/client/` — Dependencia: solo `@campfit/shared`

## Descripción General

Conjunto de funcionalidades que el alumno (rol `client`) utiliza en su día a día: dashboard, visualización de rutinas y dietas, registro de progreso, chat con el entrenador y soporte automático. Es un monolito independiente en `packages/client/`.

---

## Estructura del Monolito

```
packages/client/
├── src/
│   ├── components/
│   │   ├── DashboardCards.tsx       # StatCards del dashboard
│   │   ├── WorkoutViewer.tsx        # Visor de rutina del día
│   │   ├── RPEModal.tsx             # Modal de esfuerzo percibido
│   │   ├── DietViewer.tsx           # Visor de dieta del día
│   │   ├── MealCard.tsx             # Card de comida individual
│   │   ├── WeightChart.tsx          # Gráfico de evolución de peso
│   │   ├── PhotoGallery.tsx         # Galería de fotos de progreso
│   │   ├── ChatView.tsx             # Sala de chat 1:1
│   │   ├── AlertBanner.tsx          # Banner de alerta del admin
│   │   └── SupportChat.tsx          # Chatbot de FAQs
│   ├── services/
│   │   ├── workoutService.ts        # CRUD rutinas, marcar completada
│   │   ├── dietService.ts           # CRUD dietas, marcar comida
│   │   ├── progressService.ts       # Peso, fotos, adherencia
│   │   ├── chatService.ts           # Mensajes 1:1, alerts
│   │   └── supportService.ts        # Chatbot FAQs
│   ├── stores/
│   │   ├── $workouts.ts             # Rutinas del cliente
│   │   ├── $diets.ts                # Dietas del cliente
│   │   ├── $progress.ts             # Progreso (peso + fotos)
│   │   └── $messages.ts             # Mensajes del chat
│   ├── pages/
│   │   ├── dashboard.astro          # /client/dashboard
│   │   ├── medical-profile.astro    # /client/medical-profile
│   │   ├── workouts.astro           # /client/workouts
│   │   ├── diets.astro              # /client/diets
│   │   ├── progress.astro           # /client/progress
│   │   ├── chat.astro               # /client/chat
│   │   └── support.astro            # /client/support
│   └── types.ts                     # Interfaces específicas del cliente
├── package.json                     # name: "@campfit/client"
└── tsconfig.json
```

### Reglas de Importación
- ✅ `import { Button, Card } from '@campfit/shared'` → Componentes UI
- ✅ `import { db } from '@campfit/shared'` → Firebase config
- ✅ `import { $user } from '@campfit/shared'` → Stores base
- ✅ `import { User, Workout } from '@campfit/shared'` → Tipos base
- ✅ `import { workoutService } from '../services/workoutService'` → Local
- ❌ `import { something } from '@campfit/admin'` → Prohibido

---

## 1. Dashboard del Cliente

**Ruta:** `/client/dashboard`  
**Layout:** `ClientLayout.astro` (con Bottom Navigation)

### Componentes

```
┌─────────────────────────────────┐
│  Header                          │
│  ¡Hola, [nombre]! 👋            │
│  [AlertBanner si hasActiveAlert] │
├─────────────────────────────────┤
│  StatCard: Progreso Rutina      │
│  ████████████░░░ 75% semanal    │
├─────────────────────────────────┤
│  StatCard: Adherencia Dieta     │
│  ██████████░░░░ 60% hoy         │
├─────────────────────────────────┤
│  Quick Actions                  │
│  ┌──────────┐ ┌──────────┐     │
│  │ 💪       │ │ 🥗       │     │
│  │ Entrenar │ │ Próxima  │     │
│  │ hoy      │ │ comida   │     │
│  └──────────┘ └──────────┘     │
├─────────────────────────────────┤
│  Stats Rápidas                  │
│  Peso: 75 kg  |  Cal: 1,850    │
│  RPE Prom: 7.2 | Días: 12/30   │
└─────────────────────────────────┘
```

### Datos (Firestore streams)

```typescript
// packages/client/src/services/workoutService.ts
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@campfit/shared';

export function subscribeToWorkouts(clientId: string, callback: (workouts: any[]) => void) {
  const q = query(
    collection(db, 'workouts'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}
```

---

## 2. Visualizador de Rutinas

**Ruta:** `/client/workouts`  
**Layout:** `ClientLayout.astro`

### Componentes

```
┌─────────────────────────────────┐
│  TabBar: Días de la semana      │
│  Lun │ Mar │ Mié │ Jue │ Vie   │
├─────────────────────────────────┤
│  Ejercicio 1: Press Banca       │
│  ┌─────────────────────────┐   │
│  │ 4 series × 10 reps      │   │
│  │ Descanso: 90s           │   │
│  │ [▶ Ver demostración]    │   │
│  │ Desc: Mantén los codos  │   │
│  │       a 45 grados...    │   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  [✓ Marcar rutina completada]  │
│  Al marcar → Modal RPE         │
└─────────────────────────────────┘
```

### Flujo de Finalización

```
1. Usuario presiona "Marcar rutina completada"
2. Se abre Modal con Slider RPE (1-10)
3. Usuario selecciona esfuerzo percibido
4. Se crea progress_log:
   {
     clientId: uid,
     type: 'workout',
     date: today,
     value: { workoutId, completed: true, rpe: 7 }
   }
5. Se actualiza dashboard en tiempo real
```

---

## 3. Visualizador de Dietas

**Ruta:** `/client/diets`  
**Layout:** `ClientLayout.astro`

### Componentes

```
┌─────────────────────────────────┐
│  Header: Mi Plan Nutricional    │
│  Tipo: Normal | Ectomorfo       │
│  Calorías: 2,200 kcal           │
├─────────────────────────────────┤
│  TabBar: Comidas del día        │
│  Desayuno │ Almuerzo │ Cena    │
├─────────────────────────────────┤
│  Desayuno (08:00)               │
│  ┌─────────────────────────┐   │
│  │ Avena con proteína      │   │
│  │ Cal: 450 | P: 35g       │   │
│  │ C: 50g | G: 12g         │   │
│  │ [✓] Completado          │   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  Totales del día               │
│  Cal: 1,100/2,200 █████░░ 50%  │
│  P: 90g | C: 120g | G: 20g    │
└─────────────────────────────────┘
```

### Flujo de Marcado de Comida

```
1. Usuario presiona checkbox de una comida
2. Se crea progress_log:
   {
     clientId: uid,
     type: 'meal',
     date: today,
     value: { mealId, completed: true }
   }
3. Se actualiza el progreso del día en tiempo real
```

---

## 4. Módulo de Progreso

**Ruta:** `/client/progress`  
**Layout:** `ClientLayout.astro`

### Componentes

```
┌─────────────────────────────────┐
│  Tabs: Peso │ Fotos             │
├─────────────────────────────────┤
│  [Tab: Peso]                    │
│  ┌─────────────────────────┐   │
│  │  LineChart               │   │
│  │  Evolución del Peso     │   │
│  │  ┌─────────────────┐    │   │
│  │  │  📈 80─╲        │    │   │
│  │  │     75  ╲──╲    │    │   │
│  │  │     70     ╲──  │    │   │
│  │  │     Ene Feb Mar  │    │   │
│  │  └─────────────────┘    │   │
│  └─────────────────────────┘   │
│  [Registrar nuevo peso]        │
│  ┌─Input──────┐ [Guardar]     │
│  │ 75.5 kg    │               │
│  └────────────┘               │
├─────────────────────────────────┤
│  [Tab: Fotos]                   │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 📸   │ │ 📸   │ │ 📸   │   │
│  │ Frontal│ │ Perfil│ │ Espal│   │
│  │ Ene   │ │ Ene   │ │ Ene  │   │
│  └──────┘ └──────┘ └──────┘   │
│  [Subir nuevas fotos]          │
└─────────────────────────────────┘
```

### Subida de Fotos a R2

```
1. Usuario selecciona foto (cámara o galería)
2. Se solicita URL pre-firmada a Cloudflare Worker
3. Se sube la foto directamente a R2
4. Se crea progress_log:
   {
     clientId: uid,
     type: 'photo',
     date: today,
     value: { photoUrl: 'https://r2.url/foto.jpg', type: 'front' }
   }
5. La foto aparece en la galería
```

---

## 5. Chat 1:1

**Ruta:** `/client/chat`  
**Layout:** `ClientLayout.astro`

### Componentes

```
┌─────────────────────────────────┐
│  Header: Chat con Seba          │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ Recibido: ¿Cómo fue tu  │   │
│  │ entrenamiento de hoy?   │   │
│  │ 14:30                   │   │
│  └─────────────────────────┘   │
│                                 │
│       ┌────────────────────┐   │
│       │ ¡Muy bien! 8 RPE   │   │
│       │ 14:35 ✓             │   │
│       └────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ⚠️ ALERTA               │   │
│  │ Recibido: Seba te ha    │   │
│  │ enviado un llamado de   │   │
│  │ atención.               │   │
│  │ 15:00                   │   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  ┌─ChatInput────────────────┐  │
│  │ Escribe un mensaje... 📎 │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

### Stream de Mensajes

```typescript
// packages/client/src/services/chatService.ts
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@campfit/shared';

export function subscribeToMessages(userId: string, callback: (messages: any[]) => void) {
  const chatQuery = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(chatQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
}
```

---

## 6. Chatbot de Soporte

**Ruta:** `/client/support`  
**Layout:** `ClientLayout.astro`

### Funcionamiento

```
1. Usuario escribe pregunta en el chat
2. Se evalúa si es una FAQ conocida:
   - "¿Cómo registro mi peso?" → Respuesta automática
   - "¿Cómo veo mi rutina?" → Respuesta automática
   - "No encuentro mi dieta" → Respuesta automática
3. Si no es FAQ → "No pude resolver tu consulta.
   ¿Quieres hablar con Seba?"
4. Si usuario acepta → Redirigir a /client/chat
```

### FAQs Predefinidas

| Pregunta | Respuesta |
|----------|-----------|
| "Cómo registro mi peso" | "Ve a la sección Progreso, presiona 'Registrar peso' e ingresa tu peso actual." |
| "Cómo veo mi rutina" | "Ve a la sección Rutinas. Allí encontrarás tus ejercicios organizados por día." |
| "No veo mi dieta" | "Si no ves tu dieta, contacta a Seba a través del chat." |
| "Cómo subo fotos" | "En la sección Progreso, pestaña Fotos, presiona 'Subir nuevas fotos'." |
| "Qué es RPE" | "RPE es tu esfuerzo percibido del 1 al 10. 1=muy fácil, 10=máximo esfuerzo." |
| "Horario de Seba" | "Seba está disponible en horario de atención. Si es urgente, envía un llamado de atención." |

---

## Tests

```typescript
// packages/client/src/__tests__/services/workoutService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { markWorkoutComplete } from '../services/workoutService';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}));

describe('workoutService', () => {
  it('should create progress log on workout complete', async () => {
    const result = await markWorkoutComplete('client123', 'workout456', 7);
    expect(result).toBeDefined();
  });
});
```

---

> **📌 Convenciones de código:** Ver `12_guia_desarrollo_testing.md`
> **📌 Golden Rules:** Ver `.clinerules`
> **📌 Componentes UI:** Ver `06_design_system.md` (implementados en `@campfit/shared`)
> **📌 Guards de ruta:** Ver `08_modulo_autenticacion.md`
