# Guía de Arquitectura: Programación Semanal y Registro Granular de Entrenamientos

Esta guía documenta el funcionamiento de la programación de entrenamientos y dietas por días de la semana y el sistema de seguimiento de ejecuciones para clientes en **CampFit**.

---

## 1. Programación Semanal por Días (Lunes a Domingo)

El sistema de entrenamientos y dietas de CampFit soporta dos modalidades de asignación para los entrenadores:

### A. Modalidad Repetitiva (Diario / General)
- Cuando el parámetro `dayOfWeek` de un ejercicio o comida es `0` o no se especifica, el elemento aplica para **todos los días** de la semana.
- **Caso de uso:** Rutinas de mantenimiento diario o planes nutricionales normocalóricos estables.

### B. Modalidad Variada por Días (Lunes a Domingo)
- Los ejercicios y tomas se asignan a días específicos mediante el índice numérico `dayOfWeek`:
  - `1`: Lunes
  - `2`: Martes
  - `3`: Miércoles
  - `4`: Jueves
  - `5`: Viernes
  - `6`: Sábado
  - `7`: Domingo
- **Días de Descanso Activo / Total:** Si un día no tiene ejercicios asignados en la rutina del cliente, la interfaz muestra automáticamente un estado amigable de recuperación ("Día de Descanso Programado").

---

## 2. Registro de Ejecución Granular del Cliente

En la interfaz del cliente (`/client/workouts`), la finalización de un entrenamiento no es un estado binario, sino un desglose de adherencia real:

### A. Estados de Ejecución por Ejercicio
- `✅ Completado (100%)`: Cumplimiento total de las series y repeticiones prescritas.
- `⚠️ A Medias (Parcial)`: Ejecución parcial debido a fatiga muscular, falta de tiempo o ajuste de peso.
- `❌ Omitido`: El ejercicio no pudo realizarse por lesión o limitación.

### B. Métricas de Carga Real e Intensidad
Para cada ejercicio, el cliente puede registrar:
1. **Peso Real Utilizado (`actualWeight`):** Kilos/libras levantados en la sesión.
2. **Repeticiones Logradas (`actualReps`):** Repeticiones reales alcanzadas.
3. **Escala de Esfuerzo Percibido (`RPE` 1-10):**
   - `5-6`: Esfuerzo moderado
   - `7`: Duro (nivel objetivo estándar)
   - `8-9`: Muy duro (cerca del fallo muscular)
   - `10`: Máximo esfuerzo / Fallo total
4. **Notas del Ejercicio (`notes`):** Observaciones individuales (ej. "Lieve molestia articular").

### C. Almacenamiento en Firestore
Las sesiones completadas se almacenan en la colección `workoutLogs` con la siguiente estructura:
```ts
export interface WorkoutSessionLog {
  id: string;
  clientId: string;
  workoutId: string;
  workoutName: string;
  date: Timestamp;
  dayOfWeek: number; // 1-7
  status: 'completed' | 'partial' | 'skipped';
  overallRpe?: number;
  notes?: string;
  exercises: ExerciseExecutionLog[];
}
```

---

## 3. Consideraciones de Factores Humanos y UX
- **Autodetect Día Actual:** Al cargar la vista de entrenamientos del cliente, la pestaña activa se selecciona automáticamente en función del día actual de la semana.
- **Navegación Fluida:** El cliente puede cambiar entre cualquier día de la semana (Lunes a Domingo) para anticipar los ejercicios de los días siguientes o revisar días pasados.
- **Retroalimentación Inmediata:** Notificaciones Toast al guardar el registro y contadores dinámicos de progreso diario (`✅`, `⚠️`, `❌`).
