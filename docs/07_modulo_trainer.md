# 🏋️ Módulo del Entrenador - CampFit

## Descripción General
El panel del Entrenador (`/trainer/`) optimiza la gestión del coach deportivo. Le permite monitorear a sus alumnos asignados, crear y administrar sus entrenamientos y dietas en tiempo real, enviar llamados de atención mediante el chat, y auditar el progreso diario de cada cliente.

---

## Estructura de Archivos

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

---

## 1. Vistas y Componentes

### A. Dashboard del Entrenador
**Ruta:** `/trainer/dashboard`  
Muestra un panel consolidado de métricas clave y notificaciones urgentes del entrenador.

*   **Tarjetas de Estadísticas:**
    *   *Total de Alumnos:* Cantidad de usuarios `client` vinculados al ID del entrenador.
    *   *Rutinas Creadas:* Total de entrenamientos registrados por el entrenador.
    *   *Dietas Creadas:* Total de planes nutricionales registrados por el entrenador.
    *   *Chats Activos / Mensajes No Leídos:* Notificación visual de conversaciones pendientes.
*   **Alertas Activas:** Lista prioritaria de clientes con estados de inactividad o llamados de atención activos.

### B. Gestión de Clientes
**Ruta:** `/trainer/clients`  
Listado interactivo que permite al entrenador auditar a sus alumnos asignados.
*   **Buscador:** Filtrado en tiempo real por el nombre del cliente.
*   **Visualización de Ficha Médica:** Al hacer clic en un alumno, se expande su información clínica: objetivos, experiencia (principiante, intermedio, avanzado), alergias, lesiones y peso inicial.

### C. Gestor de Rutinas (Workouts)
**Ruta:** `/trainer/workouts`  
Herramienta CRUD interactiva para planificar ejercicios individuales.
*   **Formulario de Ejercicios:** Permite añadir ejercicios indicando el nombre, series, repeticiones, tiempo de descanso (ej. `90s`), y un enlace a video demostrativo.

### D. Planificador Nutricional (Diets)
**Ruta:** `/trainer/diets`  
Creador de dietas y macros por comidas.
*   **Filtro por Somatotipo:** Clasifica y asiste la asignación basándose en el tipo de cuerpo del cliente (`ectomorph`, `mesomorph`, `endomorph`).
*   **Macros por Comida:** Desglose interactivo para desayuno, almuerzo, merienda y cena con cálculo calórico automático.

---

## 2. Servicios de Datos y Utilidades (`trainerUtils.ts`)

Las consultas a Firestore se agrupan en `src/lib/trainer/trainerUtils.ts` e interactúan con la base de datos de la siguiente manera:

| Método | Tipo | Descripción |
|---|---|---|
| `subscribeToClients(trainerId, callback)` | Stream | Sincroniza la lista de alumnos asignados al `trainerId` en tiempo real. |
| `getClientProfile(clientId)` | One-off | Obtiene el perfil médico y datos de contacto de un alumno. |
| `subscribeToWorkoutsByTrainer(trainerId, callback)` | Stream | Escucha todas las rutinas creadas por el entrenador. |
| `createWorkout(data)` / `updateWorkout(id, data)` | Escritura | Registra o modifica una rutina en la colección `workouts`. |
| `subscribeToDietsByTrainer(trainerId, callback)` | Stream | Escucha todos los planes de alimentación creados por el entrenador. |
| `createDiet(data)` / `updateDiet(id, data)` | Escritura | Registra o modifica un plan alimenticio en la colección `diets`. |
| `subscribeToClientProgress(clientId, callback)` | Stream | Descarga el historial de progreso de peso y RPE de un alumno. |

---

## 3. Seguridad y Reglas de Firestore

El acceso del rol `trainer` está configurado en `firestore.rules`:
*   Un entrenador **solo puede leer** los documentos de la colección `users` que tengan `assignedTrainerId` igual a su UID.
*   Un entrenador **puede crear y modificar** las rutinas (`workouts`) y dietas (`diets`) donde el campo `trainerId` coincida con su propio identificador.
*   Un entrenador **no puede** cambiar su rol a `admin` ni modificar datos de otros entrenadores.
