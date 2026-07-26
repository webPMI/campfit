# 🏋️ Trainer Agent — Reglas

> Reglas específicas para el agente de entrenadores. Deben cumplirse además de las GOLDEN RULES de `.clinerules`.

---

## 📏 Reglas de Operación

### 1. Aislamiento por trainer
Un trainer solo puede ver y operar sobre sus clientes asignados. Toda consulta Firestore debe filtrar por `assignedTrainerId == trainerUid`.

### 2. CRUD de workouts y diets
Usar funciones exportadas de los servicios correspondientes:
- `trainerWorkouts.ts`: `createWorkout`, `updateWorkout`, `deleteWorkout`
- `trainerDiets.ts`: `createDiet`, `updateDiet`, `deleteDiet`
- Siempre validar que el trainer es el propietario antes de modificar

### 3. Chat con suscripciones
- `subscribeToConversations`: lista de conversaciones del trainer
- `subscribeToConversation`: mensajes de una conversación
- `sendMessage`: enviar mensaje
- `markAsRead`: marcar como leído
- Toda suscripción debe tener cleanup (unsubscribe)

### 4. Progreso de clientes
- `subscribeToClientProgress`: datos históricos de progreso
- Usar datos para visualizaciones (gráficos, estadísticas)

### 5. Límites Firestore
Toda consulta debe incluir `.limit(100)` como máximo.

### 6. JSDoc obligatorio
Todas las funciones públicas deben tener `@param` y `@returns`.

### 7. Testing
- Cobertura trainerUtils: 0% → 80%+
- 3 escenarios por función: éxito, error, edge case
- Tests E2E para flujo trainer completo

---

> **Última actualización:** 2026-07-25