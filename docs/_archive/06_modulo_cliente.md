# 👤 Módulo del Cliente - CampFit

> **Última actualización:** 2026-07-31  
> **Estado:** Consolidado en `docs/MASTER.md` (sección 8)

---

## 📑 Índice

1. [Descripción General](#1-descripción-general)
2. [Estructura del Módulo](#2-estructura-del-módulo)
3. [Dashboard del Cliente](#3-dashboard-del-cliente)
4. [Perfil Médico](#4-perfil-médico)
5. [Visualizador de Rutinas](#5-visualizador-de-rutinas)
6. [Visualizador de Dietas](#6-visualizador-de-dietas)
7. [Módulo de Progreso](#7-módulo-de-progreso)
8. [Chat 1:1](#8-chat-1-1)
9. [Chatbot de Soporte](#9-chatbot-de-soporte)
10. [Configuración](#10-configuración)

---

## 1. Descripción General

Conjunto de funcionalidades que el alumno (rol `client`) utiliza en su día a día: dashboard, visualización de rutinas y dietas, registro de progreso, chat con el entrenador, soporte automático y configuración.

### 1.1 Características Principales

- **Dashboard Personalizado:** Vista general de progreso y estadísticas
- **Rutinas Interactivas:** Visualización y completado de ejercicios
- **Seguimiento Nutricional:** Plan de comidas con macros
- **Registro de Progreso:** Peso y fotos evolutivas
- **Chat en Tiempo Real:** Comunicación directa con entrenador
- **Soporte Automático:** FAQs y escalación a humano

### 1.2 Flujo de Usuario

```
Registro → Onboarding → Perfil Médico → Dashboard → Uso Diario
```

---

## 2. Estructura del Módulo

### 2.1 Organización de Archivos

```
src/
├── pages/client/
│   ├── dashboard.astro          # /client/dashboard
│   ├── medical-profile.astro    # /client/medical-profile (onboarding)
│   ├── workouts.astro           # /client/workouts
│   ├── diets.astro              # /client/diets
│   ├── progress.astro           # /client/progress
│   ├── chat.astro               # /client/chat
│   ├── support.astro            # /client/support
│   └── settings.astro           # /client/settings
├── layouts/
│   └── ClientLayout.astro       # Layout con Bottom Navigation
└── lib/
    └── client/                  # Servicios del lado cliente
        ├── workoutService.ts    # Rutinas del cliente
        ├── dietService.ts       # Dietas del cliente
        ├── progressService.ts   # Progreso del cliente
        ├── chatService.ts       # Chat (legacy — migrar a shared/chat.ts)
        └── supportService.ts    # Soporte y FAQs
```

### 2.2 Responsabilidades por Capa

**Páginas (pages/client/):**
- Renderizado de vistas específicas
- Captura de eventos de usuario
- Orquestación de servicios
- Gestión de estado local

**Layout (ClientLayout.astro):**
- Navegación inferior (Bottom Nav)
- Estructura común
- Theme toggle
- Logout button

**Servicios (lib/client/):**
- Lógica de negocio específica del cliente
- Comunicación con Firestore
- Procesamiento de datos
- Manejo de errores

---

## 3. Dashboard del Cliente

### 3.1 Descripción

**Ruta:** `/client/dashboard`  
**Layout:** `ClientLayout.astro` (con Bottom Navigation)

Vista principal del cliente que muestra un resumen de su progreso, estadísticas rápidas y accesos directos a las funcionalidades principales.

### 3.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: ¡Hola, [Nombre]!               │
├─────────────────────────────────────────┤
│  AlertBanner (si hasActiveAlert)         │
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ 💪       │ │ 🥗       │ │ 📈       ││
│  │ Rutina   │ │ Dieta    │ │ Progreso ││
│  │ 60%      │ │ 80%      │ │ +2.5 kg  ││
│  └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────┤
│  Quick Actions                          │
│  [🏋️ Entrenar hoy] [🥗 Ver dieta]      │
│  [📊 Registrar peso] [💬 Chat]          │
├─────────────────────────────────────────┤
│  Stats Rápidas                          │
│  ┌─────────────────────────────────┐   │
│  │ Semana actual: 4/5 rutinas      │   │
│  │ Adherencia dieta: 85%           │   │
│  │ Próxima comida: Almuerzo 13:00  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 3.3 Datos Mostrados

**Tarjetas de Progreso:**
- **Rutina Semanal:** Porcentaje de ejercicios completados esta semana
- **Adherencia Dieta:** Porcentaje de comidas marcadas hoy
- **Progreso General:** Cambio de peso desde el inicio

**Estadísticas Rápidas:**
- Último peso registrado
- Calorías consumidas hoy
- RPE promedio de la semana
- Días activos esta semana

**Accesos Rápidos:**
- Entrenar hoy (última rutina asignada)
- Ver dieta de hoy
- Registrar peso
- Chat con entrenador

### 3.4 Implementación

```typescript
// lib/client/dashboardService.ts
export function subscribeToDashboard(clientId: string, callback: (data: DashboardData) => void) {
  // Suscribirse a workouts
  const unsubscribeWorkouts = subscribeToWorkouts(clientId, (workouts) => {
    // Procesar workouts
  });
  
  // Suscribirse a diets
  const unsubscribeDiets = subscribeToDiets(clientId, (diets) => {
    // Procesar diets
  });
  
  // Suscribirse a progress_logs
  const unsubscribeProgress = subscribeToProgress(clientId, (logs) => {
    // Procesar progreso
  });
  
  // Retornar función de cleanup
  return () => {
    unsubscribeWorkouts();
    unsubscribeDiets();
    unsubscribeProgress();
  };
}
```

---

## 4. Perfil Médico

### 4.1 Descripción

**Ruta:** `/client/medical-profile`  
**Layout:** `ClientLayout.astro`

Formulario de onboarding obligatorio que el cliente debe completar después del registro. Recopila información médica y de objetivos fitness.

### 4.2 Formulario

```
┌─────────────────────────────────────────┐
│  Header: Perfil Médico                   │
├─────────────────────────────────────────┤
│  Información Personal                    │
│  ┌─────────────────────────────────┐   │
│  │ Fecha de nacimiento: [📅    ]   │   │
│  │ Altura (cm):        [175    ]   │   │
│  │ Peso inicial (kg):  [75     ]   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Salud                                  │
│  ┌─────────────────────────────────┐   │
│  │ Alergias: [➕ Añadir alergia]   │   │
│  │ Lesiones: [➕ Añadir lesión]    │   │
│  │ Condiciones: [➕ Añadir cond.]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Objetivos                              │
│  ┌─────────────────────────────────┐   │
│  │ Experiencia: [Principiante ▼]   │   │
│  │ Objetivos: [➕ Añadir objetivo]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Guardar Perfil Médico]                │
└─────────────────────────────────────────┘
```

### 4.3 Validaciones

| Campo | Validación | Error |
|-------|-----------|-------|
| Fecha de nacimiento | Mayor de 14 años | "Debes ser mayor de 14 años" |
| Altura | 100-250 cm | "Altura debe estar entre 100 y 250 cm" |
| Peso inicial | 30-300 kg | "Peso debe estar entre 30 y 300 kg" |
| Alergias | Máximo 20 items | "Máximo 20 alergias" |
| Lesiones | Máximo 20 items | "Máximo 20 lesiones" |
| Condiciones | Máximo 20 items | "Máximo 20 condiciones médicas" |
| Experiencia | Requerido | "Selecciona tu nivel de experiencia" |
| Objetivos | Mínimo 1 | "Añade al menos un objetivo" |

### 4.4 Implementación

```typescript
// lib/client/medicalProfileService.ts
export async function saveMedicalProfile(uid: string, profile: MedicalProfile): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    medicalProfile: profile,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function validateMedicalProfile(profile: Partial<MedicalProfile>): ValidationResult {
  const errors: ValidationErrors = {};
  
  // Validar fecha de nacimiento
  if (profile.birthDate) {
    const age = calculateAge(profile.birthDate);
    if (age < 14) {
      errors.birthDate = 'Debes ser mayor de 14 años';
    }
  }
  
  // Validar altura
  if (profile.height && (profile.height < 100 || profile.height > 250)) {
    errors.height = 'Altura debe estar entre 100 y 250 cm';
  }
  
  // Validar peso
  if (profile.initialWeight && (profile.initialWeight < 30 || profile.initialWeight > 300)) {
    errors.initialWeight = 'Peso debe estar entre 30 y 300 kg';
  }
  
  // Validar arrays
  if (profile.allergies && profile.allergies.length > 20) {
    errors.allergies = 'Máximo 20 alergias';
  }
  
  if (profile.goals && profile.goals.length === 0) {
    errors.goals = 'Añade al menos un objetivo';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
```

---

## 5. Visualizador de Rutinas

### 5.1 Descripción

**Ruta:** `/client/workouts`  
**Layout:** `ClientLayout.astro`

Página donde el cliente visualiza su rutina de ejercicios asignada, organizada por día de la semana, y puede marcar ejercicios como completados.

### 5.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Mi Rutina                       │
├─────────────────────────────────────────┤
│  TabBar: [Lun] [Mar] [Mié] [Jue] [Vie] │
├─────────────────────────────────────────┤
│  Ejercicios del día                     │
│  ┌─────────────────────────────────┐   │
│  │ Press de banca                   │   │
│  │ 4x10 @ 60kg · Descanso 90s      │   │
│  │ [✅ Completado]                  │   │
│  ├─────────────────────────────────┤   │
│  │ Sentadilla                       │   │
│  │ 4x12 @ 80kg · Descanso 120s     │   │
│  │ [⬜ Marcar completado]           │   │
│  ├─────────────────────────────────┤   │
│  │ Remo con barra                   │   │
│  │ 3x10 @ 50kg · Descanso 90s      │   │
│  │ [⬜ Marcar completado]           │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  [🏁 Finalizar entrenamiento]           │
└─────────────────────────────────────────┘
```

### 5.3 Flujo de Finalización

```
1. Usuario presiona "Marcar rutina completada"
   ↓
2. Se abre Modal con Slider RPE (1-10)
   ↓
3. Usuario selecciona esfuerzo percibido
   ↓
4. Se crea progress_log:
   {
     clientId: uid,
     type: 'workout',
     date: today,
     value: {
       workoutId: workout.id,
       completed: true,
       rpe: 7
     }
   }
   ↓
5. Se actualiza dashboard en tiempo real
```

### 5.4 Implementación

```typescript
// lib/client/workoutService.ts
export function subscribeToWorkouts(clientId: string, callback: (workouts: Workout[]) => void) {
  const q = query(
    collection(db, 'workouts'),
    where('clientId', '==', clientId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  
  return onSnapshot(q, (snapshot) => {
    const workouts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Workout[];
    callback(workouts);
  });
}

export async function completeWorkout(clientId: string, workoutId: string, rpe: number): Promise<void> {
  await addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'workout',
    date: serverTimestamp(),
    value: {
      workoutId,
      completed: true,
      rpe,
    },
    createdAt: serverTimestamp(),
  });
}
```

---

## 6. Visualizador de Dietas

### 6.1 Descripción

**Ruta:** `/client/diets`  
**Layout:** `ClientLayout.astro`

Página donde el cliente visualiza su plan de comidas diario, con macros nutricionales y la posibilidad de marcar comidas como completadas.

### 6.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Mi Dieta                        │
├─────────────────────────────────────────┤
│  TabBar: [Desayuno] [Almuerzo] [Cena]   │
├─────────────────────────────────────────┤
│  Comida seleccionada                    │
│  ┌─────────────────────────────────┐   │
│  │ 🥗 Almuerzo                      │   │
│  │ Calorías: 650 kcal               │   │
│  │                                   │   │
│  │ • Pechuga de pollo (200g)        │   │
│  │ • Arroz integral (150g)          │   │
│  │ • Brócoli (100g)                 │   │
│  │ • Aceite de oliva (15ml)         │   │
│  │                                   │   │
│  │ Macros: P:45g C:65g G:20g        │   │
│  │                                   │   │
│  │ [✅ Marcar como completado]       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 6.3 Flujo de Marcado de Comida

```
1. Usuario presiona checkbox de una comida
   ↓
2. Se crea progress_log:
   {
     clientId: uid,
     type: 'meal',
     date: today,
     value: {
       mealId: meal.id,
       completed: true
     }
   }
   ↓
3. Se actualiza el progreso del día en tiempo real
```

### 6.4 Implementación

```typescript
// lib/client/dietService.ts
export function subscribeToDiets(clientId: string, callback: (diets: Diet[]) => void) {
  const q = query(
    collection(db, 'diets'),
    where('clientId', '==', clientId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  
  return onSnapshot(q, (snapshot) => {
    const diets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Diet[];
    callback(diets);
  });
}

export async function markMealAsCompleted(clientId: string, mealId: string): Promise<void> {
  await addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'meal',
    date: serverTimestamp(),
    value: {
      mealId,
      completed: true,
    },
    createdAt: serverTimestamp(),
  });
}
```

---

## 7. Módulo de Progreso

### 7.1 Descripción

**Ruta:** `/client/progress`  
**Layout:** `ClientLayout.astro`

Página donde el cliente puede registrar y visualizar su progreso a lo largo del tiempo, incluyendo peso y fotos evolutivas.

### 7.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Mi Progreso                     │
├─────────────────────────────────────────┤
│  Tabs: [📊 Peso] [📸 Fotos]             │
├─────────────────────────────────────────┤
│  Tab: Peso                              │
│  ┌─────────────────────────────────┐   │
│  │ 📈 Evolución de peso            │   │
│  │ 80 ┤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀│   │
│  │ 75 ┤⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀│   │
│  │    └─────────────────────────────    │
│  │    Ene  Feb  Mar  Abr  May  Jun      │
│  │                                      │
│  │  Peso actual: 77.5 kg                │   │
│  │  [📝 Registrar nuevo peso]           │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Tab: Fotos                             │
│  ┌─────────────────────────────────┐   │
│  │ 📸 Galería de progreso          │   │
│  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │   │
│  │ │Ene │ │Feb │ │Mar │ │Abr │   │   │
│  │ │📷  │ │📷  │ │📷  │ │📷  │   │   │
│  │ └────┘ └────┘ └────┘ └────┘   │   │
│  │ [📸 Subir nueva foto]          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 7.3 Características

**Pestaña Peso:**
- Gráfico de línea SVG interactivo
- Auto-scaling de ejes
- Tooltips al hover
- Input para registrar nuevo peso
- Historial completo

**Pestaña Fotos:**
- Galería en grid
- Drag-and-drop para subir
- Preview antes de subir
- Tipos: front, side, back
- Fecha de cada foto

### 7.4 Implementación

```typescript
// lib/client/progressService.ts
export function subscribeToProgress(clientId: string, callback: (logs: ProgressLog[]) => void) {
  const q = query(
    collection(db, 'progress_logs'),
    where('clientId', '==', clientId),
    orderBy('date', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ProgressLog[];
    callback(logs);
  });
}

export async function registerWeight(clientId: string, weight: number): Promise<void> {
  await addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'weight',
    date: serverTimestamp(),
    value: { weight },
    createdAt: serverTimestamp(),
  });
}

export async function uploadProgressPhoto(clientId: string, file: File, type: 'front' | 'side' | 'back'): Promise<string> {
  // Convertir a Base64
  const base64 = await fileToBase64(file);
  
  // Guardar en progress_logs
  await addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'photo',
    date: serverTimestamp(),
    value: {
      photoUrl: base64,
      photoType: type,
    },
    createdAt: serverTimestamp(),
  });
  
  return base64;
}
```

---

## 8. Chat 1:1

### 8.1 Descripción

**Ruta:** `/client/chat`  
**Layout:** `ClientLayout.astro`

Chat en tiempo real entre el cliente y su entrenador asignado. Permite comunicación directa y el envío de alertas.

### 8.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Chat con [Entrenador]           │
├─────────────────────────────────────────┤
│  Mensajes                               │
│  ┌─────────────────────────────────┐   │
│  │ 10:30                            │   │
│  │ ┌──────────────────────────┐    │   │
│  │ │ ¡Buenos días! ¿Cómo      │    │   │
│  │ │ fue tu entrenamiento?    │    │   │
│  │ └──────────────────────────┘    │   │
│  │                          ┌─────┐│   │
│  │                          │¡Bien││   │
│  │                          │💪   ││   │
│  │                          └─────┘│   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  [✏️ Escribe un mensaje...] [Enviar]   │
└─────────────────────────────────────────┘
```

### 8.3 Características

- Stream de mensajes en tiempo real (Firestore onSnapshot)
- Envío de mensajes de texto
- Visualización de alertas del entrenador
- Marcar mensajes como leídos automáticamente
- Timestamp de cada mensaje
- Indicador de "escribiendo..."

### 8.4 Implementación

```typescript
// lib/client/chatService.ts
export function subscribeToMessages(userId: string, callback: (messages: Message[]) => void) {
  const chatQuery = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(chatQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  type: 'text' | 'alert' = 'text'
): Promise<void> {
  await addDoc(collection(db, 'messages'), {
    senderId,
    receiverId,
    participants: [senderId, receiverId],
    content,
    type,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}
```

---

## 9. Chatbot de Soporte

### 9.1 Descripción

**Ruta:** `/client/support`  
**Layout:** `ClientLayout.astro`

Chatbot de soporte automático que responde preguntas frecuentes y escala a humano cuando es necesario.

### 9.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Centro de Ayuda                 │
├─────────────────────────────────────────┤
│  FAQs Predefinidas                      │
│  ┌─────────────────────────────────┐   │
│  │ ❓ ¿Cómo registro mi peso?      │   │
│  ├─────────────────────────────────┤   │
│  │ ❓ ¿Cómo veo mi rutina?         │   │
│  ├─────────────────────────────────┤   │
│  │ ❓ ¿Cómo contacto a mi trainer? │   │
│  ├─────────────────────────────────┤   │
│  │ ❓ ¿Qué hago si no puedo        │   │
│  │    entrenar hoy?                │   │
│  ├─────────────────────────────────┤   │
│  │ ❓ ¿Cómo actualizo mi perfil?   │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  ¿No encuentras lo que buscas?          │
│  [💬 Hablar con Seba]                   │
└─────────────────────────────────────────┘
```

### 9.3 FAQs Predefinidas

| Pregunta | Respuesta |
|----------|-----------|
| ¿Cómo registro mi peso? | Ve a la sección Progreso, presiona 'Registrar peso' e ingresa tu peso actual. |
| ¿Cómo veo mi rutina? | Ve a la sección Rutinas. Allí encontrarás tus ejercicios organizados por día. |
| ¿Cómo contacto a mi trainer? | Usa la sección Chat para enviar un mensaje directo a tu entrenador. |
| ¿Qué hago si no puedo entrenar hoy? | Avísale a tu entrenador por el Chat para que pueda ajustar tu plan. |
| ¿Cómo actualizo mi perfil? | Ve a Configuración para editar tu información personal. |

### 9.4 Flujo de Funcionamiento

```
1. Usuario escribe pregunta en el chat
   ↓
2. Se evalúa si es una FAQ conocida:
   - "¿Cómo registro mi peso?" → Respuesta automática
   - "¿Cómo veo mi rutina?" → Respuesta automática
   - "No encuentro mi dieta" → Respuesta automática
   ↓
3. Si no es FAQ → "No pude resolver tu consulta. ¿Quieres hablar con Seba?"
   ↓
4. Si usuario acepta → Redirigir a /client/chat
```

### 9.5 Implementación

```typescript
// lib/client/supportService.ts
const faqs: Record<string, string> = {
  'cómo registro mi peso': 'Ve a la sección Progreso, presiona "Registrar peso" e ingresa tu peso actual.',
  'cómo veo mi rutina': 'Ve a la sección Rutinas. Allí encontrarás tus ejercicios organizados por día.',
  'no veo mi dieta': 'Si no ves tu dieta, contacta a Seba a través del chat.',
  'cómo subo fotos': 'En la sección Progreso, pestaña Fotos, presiona "Subir nuevas fotos".',
  'qué es rpe': 'RPE es tu esfuerzo percibido del 1 al 10. 1=muy fácil, 10=máximo esfuerzo.',
  'horario de seba': 'Seba está disponible en horario de atención. Si es urgente, envía un llamado de atención.',
};

export function getFAQResponse(question: string): string | null {
  const normalized = question.toLowerCase().trim();
  
  for (const [key, answer] of Object.entries(faqs)) {
    if (normalized.includes(key)) {
      return answer;
    }
  }
  
  return null;
}

export function shouldEscalateToHuman(question: string): boolean {
  const normalized = question.toLowerCase().trim();
  
  // Si no hay respuesta en FAQs, escalar
  return getFAQResponse(normalized) === null;
}
```

---

## 10. Configuración

### 10.1 Descripción

**Ruta:** `/client/settings`  
**Layout:** `ClientLayout.astro`

Página de configuración donde el cliente puede editar su perfil y preferencias.

### 10.2 Componentes

```
┌─────────────────────────────────────────┐
│  Header: Configuración                   │
├─────────────────────────────────────────┤
│  Sección: Perfil                        │
│  ┌─────────────────────────────────┐   │
│  │ Nombre: [Juan Pérez         ]   │   │
│  │ Email:  [juan@email.com     ]   │   │
│  │ [Guardar Cambios]               │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Sección: Preferencias                  │
│  ┌─────────────────────────────────┐   │
│  │ Idioma: [Español ▼]            │   │
│  │ Tema:   [Oscuro ▼]             │   │
│  │ Notificaciones: [🔔 Activadas] │   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 10.3 Características

**Perfil:**
- Editar nombre
- Cambiar email (con verificación)
- Cambiar contraseña

**Preferencias:**
- Idioma (ES/EN)
- Tema (claro/oscuro)
- Notificaciones push

---

## 🔗 Referencias

- **Documentación Maestra:** `docs/MASTER.md` (sección 8)
- **Design System:** `docs/03_design_system.md`
- **Flujos de Navegación:** `docs/04_flujos_navegacion.md`
- **Módulo de Autenticación:** `docs/05_modulo_autenticacion.md`

---

**Documento creado:** 2026-06-13  
**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit