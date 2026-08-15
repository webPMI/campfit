# 📅 Auditoría de Implementación: Calendario de Rutinas y Comidas

> **Estado:** 🔍 Análisis y Diseño (Fase Pre-Código)
> **Responsable:** Documentator Agent / Backend Agent / Frontend Agent

Este documento detalla la estrategia para implementar el calendario profesional de CampFit. El objetivo es permitir que el cliente visualice su día, asigne horas estimadas a sus comidas y marque progresos con una fluidez superior.

---

## 🎯 Objetivos del Usuario (User Stories)
1. **Visualización**: "Como cliente, quiero ver mi día completo (comidas y entrenamientos) en una vista de calendario tipo 'Time Grid' para planificar mis actividades."
2. **Personalización**: "Como cliente, quiero asignar una hora aproximada a cada comida, en caso de que deba cambiarlas."
3. **Flexibilidad**: "Si no asigno una hora, quiero que la comida aparezca en el bloque correspondiente pero solo debe marcarse como completada."
4. **Seguimiento**: "Como cliente, quiero marcar una comida o entrenamiento como 'Completado' para ver mi progreso diario."

---

## 🏗️ Arquitectura Técnica Propuesta

### 1. Modelo de Datos (Firestore)
Para mantener la integridad del plan del entrenador mientras permitimos la personalización del cliente, utilizaremos una estructura de **"Marcadores de Sesión"**.

**Propuesta de Schema (Actualización de `docs/architecture/FIRESTORE_SCHEMA.md`):**

- **Colección `diets/{dietId}`**:
  - `meals: Meal[]`
    - `id: string`
    - `name: string`
    - `estimatedTime: string | null` (Formato HH:mm, opcional)
    - `isCompleted: boolean`
    - `completionTime: Timestamp | null`
- **Colección `workouts/{workoutId}`**:
  - `exercises: Exercise[]`
    - `id: string`
    - `estimatedTime: string | null` (Formato HH:mm, opcional)
    - `isCompleted: boolean`
    - `completionTime: Timestamp | null`

> **Decisión de Diseño**: No guardaremos la hora en el documento maestro del entrenador si es "modificable", sino que el cliente podrá tener una "vista de agenda" personalizada. Sin embargo, para simplificar el MVP, permitiremos el campo `estimatedTime` en el documento compartido con la condición de que el cliente no pueda modificar el contenido nutricional (calorías, macros, alimentos).

### 2. Estrategia de Frontend (UI/UX)
- **Componente de Calendario**: Implementar un componente `TimeGrid` que renderice bloques de 30 minutos.
- **Interactividad**:
  - **Selección de Hora**: Al hacer clic en una comida/ejercicio sin hora, se abrirá un `TimePicker` minimalista.
  - **Visualización**: Las comidas con hora fija aparecerán en su posición correcta. Las sin hora aparecerán en un bloque "Pendiente" o al final de la lista diaria.
  - **Responsividad**: En dispositivos móviles, el calendario se convertirá en una "Lista de Agenda" vertical para asegurar la fluidez de navegación.
- **Fluidez**: Uso de transiciones suaves (Framer Motion o CSS Transitions) para el despliegue de detalles de cada bloque.

### 3. Flujos de Trabajo (Workflows)
1. **Carga Inicial**: El cliente entra a `/client/calendar`. El sistema filtra las dietas y rutinas del día actual (Hoy).
2. **Actualización en Tiempo Real**: Cualquier cambio en `estimatedTime` o `isCompleted` se refleja instantáneamente en la vista del cliente gracias a `onSnapshot`.
3. **Sincronización con el Entrenador**: El entrenador podrá ver las horas que el cliente ha "planificado" en su dashboard, permitiéndole validar la viabilidad del plan.

---

## 🛡️ Auditoría de Riesgos y Seguridad

| Riesgo | Impacto | Mitigación |
|---------|---------|------------|
| **Sobrescritura de Datos** | Alto | Regla de seguridad: El cliente solo tiene permiso de `update` en los campos `estimatedTime`, `isCompleted` y `completionTime`. |
| **Rendimiento de Queries** | Medio | Usar `limit()` y `where()` para traer solo los elementos del día actual, evitando cargar el historial completo en el calendario. |
| **Inconsistencia de Datos** | Bajo | Si una comida es eliminada del plan maestro por el entrenador, el calendario del cliente se actualizará automáticamente mediante el listener de Firestore. |

---

## 🚀 Plan de Ejecución Detallado (Roadmap)

### Fase 1: Backend & Schema (Backend Agent)
- [ ] **Schema Update**: Modificar `docs/architecture/FIRESTORE_SCHEMA.md` añadiendo `estimatedTime: string | null` y `isCompleted: boolean` a los objetos `Meal` y `Exercise`.
- [ ] **Type Definitions**: Crear/Actualizar interfaces en `src/types/index.ts` para reflejar los nuevos campos en `Diet` y `Workout`.
- [ ] **Firestore Rules**: Modificar `firestore.rules` para permitir que el usuario autenticado (`request.auth.uid == resource.data.clientId`) realice `update` solo en los campos específicos de agenda.
- [ ] **Validation Logic**: Implementar validadores en `src/lib/validators.ts` para asegurar que el formato de `estimatedTime` sea siempre `HH:mm`.
- [ ] **Audit**: Verificar que ninguna regla de seguridad existente se vea comprometida por la nueva permisividad de actualización de agenda.

### Fase 2: Componentes Base (Frontend Agent)
- [ ] **TimeGrid Component**: Crear `src/components/calendar/TimeGrid.astro` que renderice una grilla de 24h (o 12h) dividida en bloques de 30min.
- [ ] **MealBlock UI**: Crear `src/components/calendar/MealBlock.astro` con soporte para estados: `pending`, `scheduled`, `completed`.
- [ ] **WorkoutBlock UI**: Crear `src/components/calendar/WorkoutBlock.astro` con similar lógica.
- [ ] **TimePicker Component**: Crear un componente de selección de hora minimalista y accesible (`src/components/ui/TimePicker.astro`).
- [ ] **Animation**: Implementar transiciones de entrada/salida para los bloques de la grilla usando CSS/Astro.
- [ ] **Responsive Design**: Asegurar que el calendario sea usable en pantallas < 768px (vista de lista vs vista de grilla).

### Fase 3: Integración y Estado (Frontend/Backend)
- [ ] **Data Fetching**: Implementar `subscribeToDailySchedule` en `src/lib/client/` usando `onSnapshot` para obtener los datos del día actual.
- [ ] **State Management**: Crear un nanostore `dailyScheduleStore` para manejar la selección de hora local antes de persistir.
- [ ] **Calendar Page**: Desarrollar `src/pages/client/calendar.astro` integrando la grilla, el selector y el manejo de errores.
- [ ] **Update Action**: Crear la función de actualización de hora/estado que llame a la API de Firestore.
- [ ] **Optimistic Updates**: Implementar actualizaciones optimistas en la UI para que el cambio de hora se sienta instantáneo mientras la DB procesa.

### Fase 4: Pulido y QA (Security/QA Agent)
- [ ] **Accessibility Audit**: Verificar contraste de colores y navegación por teclado en la grilla de calendario.
- [ ] **Unit Tests**: Escribir tests en `tests/unit/` para la lógica de conversión de horas y filtrado de día actual.
- [ ] **E2E Tests**: Crear tests en `tests/e2e/` para el flujo completo: "Abrir calendario -> Seleccionar hora -> Verificar cambio en DB -> Verificar reflejo en UI".
- [ ] **Documentation**: Actualizar `docs/DOCUMENTATION_MAP.md` y `docs/SPECIFICATIONS.md` con las nuevas rutas y contratos.
- [ ] **Final Audit**: Revisar que todas las funcionalidades críticas protegidas en `docs/FUNCIONALIDADES_CRITICAS_PROTEGIDAS.md` sigan intactas.


