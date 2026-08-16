# 🏗️ Arquitectura de Datos y Schemas Firestore — CampFit

> **Documentación Oficial de Modelo NoSQL y Reglas de Seguridad**
> **Última actualización:** 2026-08-16 (añadida colección `support_tickets`)

---

## 📊 Visión General del Modelo NoSQL

CampFit utiliza Google Cloud Firestore como base de datos principal orientada a documentos. Se organiza en **colecciones**:

```
cloud.firestore/
├── users/{userId}                  # Perfiles de usuario y asignaciones de rol
├── workouts/{workoutId}            # Rutinas de entrenamiento activas por cliente
├── diets/{dietId}                  # Planes nutricionales activos por cliente
├── messages/{messageId}            # Mensajes del chat cliente-entrenador
├── progress_logs/{logId}           # Registros de peso, adherencia y rpe
├── foods_library/{foodId}          # Catálogo central de alimentos (multilenguaje, macros, alérgenos)
├── exercises_library/{exerciseId}  # Catálogo central de ejercicios (multilenguaje, músculos, equipamiento)
├── user_exercise_prefs/{userId}    # Preferencias de cliente (ratings 1-5, favoritos, exclusiones, solicitudes)
├── workout_templates/{templateId}  # Plantillas de rutinas predeterminadas
├── diet_templates/{templateId}     # Plantillas de dietas predeterminadas
├── exercise_templates/{templateId} # Plantillas auxiliares de ejercicios
├── support_tickets/{ticketId}      # TICKETS DE SOPORTE (reportes de usuarios, gestión admin)
├── app_logs/{logId}                # Logs de aplicación (solo admins leen)
├── app_logs_dedup/{dedupId}        # Deduplicación de logs (interno, no accesible)
└── ia_log_tokens/{tokenId}         # Tokens rotativos IA (solo admins)
```

---

## 📑 Especificaciones de Colecciones y Schemas

### 1. `users/{userId}`
- **Descripción:** Perfil de usuario, rol y ficha médica.
- **Campos principales:**
  - `uid: string`
  - `email: string`
  - `name: string`
  - `role: 'admin' | 'trainer' | 'client'`
  - `assignedTrainerId?: string` (si es cliente)
  - `isBlocked?: boolean`
  - `medicalProfile?: MedicalProfile` (alergias, intolerancias, lesión, dietaryRestrictions, excludedFoods, excludedFoodCategories)

### 2. `support_tickets/{ticketId}`
- **Descripción:** Tickets de soporte creados por cualquier usuario autenticado. Permiten reportar errores, hechos indebidos, posibles vulnerabilidades o cualquier situación que necesite atención del equipo admin. Los admins gestionan, contactan y resuelven los tickets.
- **Campos principales:**
  - `reporterUid: string` — UID del usuario que reporta (obligatorio)
  - `reporterEmail?: string` — email copiado al momento del reporte (para contacto, si no es anónimo)
  - `reporterName?: string` — nombre copiado al momento del reporte
  - `title: string` — título breve del reporte (max ~100 caracteres)
  - `description: string` — descripción del reporte (texto libre, puede ser largo)
  - `category: TicketCategory` — tipo de reporte: `'bug' | 'misconduct' | 'vulnerability' | 'inquiry' | 'suggestion' | 'other'`
  - `severity: TicketSeverity` — gravedad percibida: `'low' | 'medium' | 'high' | 'critical'`
  - `relatedUserId?: string` — si el reporte es sobre un usuario específico (entrenador/cliente/admin)
  - `relatedEntityType?: string` — tipo de entidad relacionada: `'trainer' | 'client' | 'admin' | 'system'`
  - `relatedEntityName?: string` — nombre del sujeto para contexto del admin
  - `attachments: AttachmentInfo[]` — URLs de imágenes subidas vía R2 (si aplica)
  - `status: TicketStatus` — estado del ticket: `'open' | 'in_review' | 'awaiting_response' | 'resolved' | 'closed'`
  - `adminNotes: AdminNote[]` — notas internas del admin (no visibles al reporter)
  - `adminContactMessages: ContactMessage[]` — mensajes del admin al reporter
  - `createdAt: Timestamp` — fecha de creación
  - `updatedAt: Timestamp` — última actualización
  - `lastActivityAt: Timestamp` — última actividad (creación o actualización)
  - `assignedAdminId?: string` — admin encargado del ticket
  - `resolvedAt?: Timestamp` — fecha de resolución (opcional)
  - `reportHash?: string` — hash de title+description+reporterUid para detección de duplicados
  - `isAnonymous: boolean` — si es true, el admin NO puede contactar al reporter

- **Enums:**
  ```typescript
  type TicketCategory = 'bug' | 'misconduct' | 'vulnerability' | 'inquiry' | 'suggestion' | 'other';
  type TicketSeverity = 'low' | 'medium' | 'high' | 'critical';
  type TicketStatus = 'open' | 'in_review' | 'awaiting_response' | 'resolved' | 'closed';
  ```

- **Interfaces auxiliares:**
  ```typescript
  interface AttachmentInfo {
    url: string;
    filename: string;
    uploadedBy: string;
    uploadedAt: Timestamp;
  }

  interface AdminNote {
    adminId: string;
    adminName: string;
    content: string;
    createdAt: Timestamp;
    isInternal: boolean; // si es true, solo visible para admins
  }

  interface ContactMessage {
    adminId: string;
    adminName: string;
    content: string;
    sentAt: Timestamp;
  }
  ```

### 3. `workouts/{workoutId}`
- **Descripción:** Rutina de entrenamiento asignada a un cliente.
- **Campos principales:**
  - `clientId: string`
  - `trainerId: string`
  - `name: string`
  - `difficulty: string`
  - `exercises: Exercise[]` (`id`, `exerciseId?`, `name`, `sets`, `reps`, `restTime`, `videoUrl`, `description`, `order`, `dayOfWeek`, `estimatedTime?: string | null`, `isCompleted?: boolean`, `completionTime?: Timestamp | null`)

### 4. `diets/{dietId}`
- **Descripción:** Plan nutricional asignado a un cliente.
- **Campos principales:**
  - `clientId: string`
  - `trainerId: string`
  - `name: string`
  - `type: 'normal' | 'definition' | 'volume' | 'keto' | 'vegan' | 'custom'`
  - `totalCalories: number`, `totalProtein: number`, `totalCarbs: number`, `totalFat: number`
  - `meals: Meal[]` (`id`, `name`, `foodId?`, `portionGrams?`, `calories`, `protein`, `carbs`, `fat`, `allergens?`, `order`, `estimatedTime?: string | null`, `isCompleted?: boolean`, `completionTime?: Timestamp | null`)

### 5. `messages/{messageId}`
- **Descripción:** Mensajes del sistema de chat directo.
- **Campos principales:**
  - `senderId: string`
  - `receiverId: string`
  - `participants: string[]` (array de uids)
  - `content: string`
  - `type: 'text' | 'alert'`
  - `isRead: boolean`
  - `createdAt: Timestamp`

### 6. `foods_library/{foodId}`
- **Descripción:** Catálogo central de alimentos.
- **Ver detalle completo:** [`BIBLIOTECA_ALIMENTOS.md`](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/features/BIBLIOTECA_ALIMENTOS.md)

### 7. `exercises_library/{exerciseId}`
- **Descripción:** Catálogo central de ejercicios.
- **Ver detalle completo:** [`BIBLIOTECA_EJERCICIOS.md`](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/features/BIBLIOTECA_EJERCICIOS.md)

### 8. `user_exercise_prefs/{userId}`
- **Descripción:** Ratings (1-5), favoritos, exclusiones y solicitudes enviadas al entrenador.
- **Ver detalle completo:** [`BIBLIOTECA_EJERCICIOS.md`](file:///c:/Users/ink.enzo/Desktop/p/campfit/docs/features/BIBLIOTECA_EJERCICIOS.md)

---

## 🛡️ Resumen de Reglas de Seguridad (`firestore.rules`)

1. **Usuarios (`/users/{userId}`):** Cada usuario lee y actualiza su documento. Admins editan cualquier campo (incluyendo `role` e `isBlocked`). Al crear, el rol debe ser `'client'`.
2. **Tickets de Soporte (`/support_tickets/{ticketId}`):** Cualquier usuario autenticado puede crear tickets (con reporterUid = auth.uid). Solo el reporter puede leer su propio ticket. Solo admins pueden leer todos, actualizar cualquier ticket, y añadir notas/mensajes de contacto. No existe borrado físico (`delete: if false`). Ver detalle completo en `firestore.rules`.
3. **Rutinas y Dietas (`/workouts`, `/diets`):** El cliente asignado lee su rutina/dieta. Solo el entrenador propietario (`trainerId == auth.uid`) o un admin pueden crear/editar/eliminar.
4. **Chat (`/messages`):** Los mensajes requieren que el `auth.uid` sea emisor, receptor o pertenezca al array `participants`.
5. **Librerías (`/foods_library`, `/exercises_library`):** Lectura para todo usuario autenticado. Creación y edición restrictiva solo para Staff (`isStaff()`). Eliminación física denegada (`delete: if false`).
6. **Preferencias Ejercicios (`/user_exercise_prefs`):** El cliente edita su propio documento. El entrenador asignado puede leer y marcar solicitudes como leídas (`acknowledged`).
