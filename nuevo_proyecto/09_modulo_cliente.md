# 👤 Módulo del Cliente - CampFit 2.0

## Descripción General

Conjunto de funcionalidades que el alumno (rol `client`) utiliza en su día a día: dashboard, visualización de rutinas y dietas, registro de progreso, chat con el entrenador, soporte automático y configuración.

---

## Estructura

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
├── lib/
│   └── client/                  # Servicios del lado cliente
│       ├── workoutService.ts    # Rutinas del cliente
│       ├── dietService.ts       # Dietas del cliente
│       ├── progressService.ts   # Progreso del cliente
│       └── chatService.ts       # Chat (legacy — migrar a shared/chat.ts)
└── types/
    └── index.ts                 # User, MedicalProfile, etc.
```

---

## 1. Dashboard del Cliente

**Ruta:** `/client/dashboard`  
**Layout:** `ClientLayout.astro` (con Bottom Navigation)

### Componentes

```
┌─────────────────────────────────────────┐
│  Header: ¡Hola, [Nombre]!               │
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

### Bottom Navigation

| Icono | Ruta | Label |
|-------|------|-------|
| 🏠 | `/client/dashboard` | Inicio |
| 💪 | `/client/workouts` | Rutinas |
| 🥗 | `/client/diets` | Dietas |
| 📈 | `/client/progress` | Progreso |
| 💬 | `/client/chat` | Chat |

---

## 2. Perfil Médico (Onboarding)

**Ruta:** `/client/medical-profile`  
**Layout:** `ClientLayout.astro`

### Formulario

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

### Validaciones

- **Fecha de nacimiento:** Debe ser mayor de 14 años
- **Altura:** 100-250 cm
- **Peso:** 30-300 kg
- **Alergias/Lesiones/Condiciones:** Máximo 20 items cada uno
- **Experiencia:** Requerido
- **Objetivos:** Al menos 1 objetivo

---

## 3. Visualizador de Rutinas

**Ruta:** `/client/workouts`  
**Layout:** `ClientLayout.astro`

### Componentes

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

### Modal RPE

```
┌─────────────────────────────────┐
│  💪 ¿Cómo fue tu entrenamiento? │
│                                 │
│  RPE (1-10): [7]               │
│  ═══════════●══════════         │
│  1  2  3  4  5  6  7  8  9  10 │
│                                 │
│  Notas: [Me sentí con energía] │
│                                 │
│  [Guardar]                      │
└─────────────────────────────────┘
```

---

## 4. Visualizador de Dietas

**Ruta:** `/client/diets`  
**Layout:** `ClientLayout.astro`

### Componentes

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

---

## 5. Progreso

**Ruta:** `/client/progress`  
**Layout:** `ClientLayout.astro`

### Componentes

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
│  │  Peso actual: 77.5 kg                │
│  │  [📝 Registrar nuevo peso]           │
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

---

## 6. Chat 1:1 con Entrenador

**Ruta:** `/client/chat`  
**Layout:** `ClientLayout.astro`

### Componentes

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

### Funcionalidades

- Stream de mensajes en tiempo real (Firestore onSnapshot)
- Envío de mensajes de texto
- Visualización de alertas del entrenador
- Marcar mensajes como leídos automáticamente

---

## 7. Chatbot de Soporte

**Ruta:** `/client/support`  
**Layout:** `ClientLayout.astro`

### Componentes

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

### FAQs

| Pregunta | Respuesta |
|----------|-----------|
| ¿Cómo registro mi peso? | Ve a la sección Progreso, presiona 'Registrar peso' e ingresa tu peso actual. |
| ¿Cómo veo mi rutina? | Ve a la sección Rutinas. Ahí verás tu plan de entrenamiento semanal. |
| ¿Cómo contacto a mi trainer? | Usa la sección Chat para enviar un mensaje directo a tu entrenador. |
| ¿Qué hago si no puedo entrenar hoy? | Avísale a tu entrenador por el Chat para que pueda ajustar tu plan. |
| ¿Cómo actualizo mi perfil? | Ve a Configuración para editar tu información personal. |

---

## 8. Configuración del Cliente

**Ruta:** `/client/settings`  
**Layout:** `ClientLayout.astro`

### Componentes

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
│  │ Notificaciones: [🔔 Activadas] │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

> **📌 Convenciones de código:** Ver `12_guia_desarrollo_testing.md`
> **📌 Golden Rules:** Ver `.clinerules`
> **📌 Componentes UI:** Ver `06_design_system.md`
> **📌 Guards de ruta:** Ver `08_modulo_autenticacion.md`
