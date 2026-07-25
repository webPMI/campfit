# ⚙️ Arquitectura Técnica y Modelo de Datos - CampFit

## 1. Stack de Tecnologías
*   **Frontend:** Astro 7.x (Compilación y enrutado estático, renderizado de layouts base en servidor, lógica de negocio client-side).
*   **Estilos:** Tailwind CSS 4.x mediante `@tailwindcss/vite`.
*   **Base de Datos / Realtime:** Firebase 11.x (Firestore) para persistencia de datos y sincronizaciones en tiempo real mediante streams (`onSnapshot`).
*   **Autenticación:** Firebase Auth (Email/Contraseña + Google Sign-In con IndexedDB para persistencia).
*   **Estado Reactivo:** Nanostores 1.x (`authStore.ts`) para sincronizar el estado del usuario en el navegador de manera liviana.

---

## 2. Modelo de Datos Firestore

Firestore es una base de datos NoSQL basada en colecciones y documentos. A continuación se detallan las colecciones clave utilizadas por la aplicación:

### A. Colección `users`
Contiene los perfiles de todos los usuarios registrados (administradores, entrenadores y clientes).
*   `uid` (ID de documento): String.
*   `name`: String.
*   `email`: String.
*   `role`: `'admin' | 'trainer' | 'client'`.
*   `assignedTrainerId`: String (opcional, para clientes).
*   `hasActiveAlert`: Boolean.
*   `createdAt`: Timestamp.
*   `updatedAt`: Timestamp.
*   `medicalProfile`: Objeto (opcional, para clientes):
    *   `height`: Number.
    *   `initialWeight`: Number.
    *   `birthDate`: String.
    *   `experience`: `'beginner' | 'intermediate' | 'advanced'`.
    *   `goals`: Array de Strings.

### B. Colección `workouts`
Almacena las rutinas de entrenamiento activas y las plantillas.
*   `id` (ID de documento): String.
*   `clientId`: String (Vacío si es plantilla global).
*   `trainerId`: String (Creador de la rutina).
*   `name`: String.
*   `difficulty`: `'beginner' | 'intermediate' | 'advanced'`.
*   `description`: String.
*   `exercises`: Array de objetos:
    *   `name`: String.
    *   `sets`: Number.
    *   `reps`: Number.
    *   `restTime`: String.
    *   `completed`: Boolean (para control local de sesión de entrenamiento).

### C. Colección `diets`
Contiene los planes alimenticios y plantillas.
*   `id` (ID de documento): String.
*   `clientId`: String (Vacío si es plantilla global).
*   `trainerId`: String.
*   `name`: String.
*   `totalCalories`: Number.
*   `somatotype`: `'ectomorph' | 'mesomorph' | 'endomorph'`.
*   `meals`: Array de objetos:
    *   `id`: String.
    *   `name`: String.
    *   `time`: String (hora de ingesta).
    *   `calories`: Number.
    *   `macros`: `{ protein: number, carbs: number, fat: number }`.

### D. Colección `messages`
Mensajes individuales de los chats del sistema.
*   `id` (ID de documento): String.
*   `senderId`: String.
*   `receiverId`: String.
*   `participants`: Array de Strings (ej. `[clientId, trainerId]`).
*   `content`: String.
*   `type`: `'text' | 'alert'`.
*   `isRead`: Boolean.
*   `createdAt`: Timestamp.

### E. Colección `progress_logs`
Historial de medidas y pesos de los clientes.
*   `id` (ID de documento): String.
*   `clientId`: String.
*   `type`: `'weight' | 'photo'`.
*   `value`: Objeto (ej. `{ weight: 75.5 }`).
*   `date`: Timestamp.

---

## 3. Reglas de Seguridad Clave (Firestore Rules)
El acceso de lectura y escritura está estrictamente validado a nivel de base de datos para impedir accesos no autorizados:
*   Un usuario de rol `client` solo puede leer las colecciones de `workouts`, `diets` y `progress_logs` que tengan su propio `clientId`.
*   La colección `users` es de solo lectura y escritura propia. **El campo `role` solo es escribible por administradores.**
*   Los entrenadores y administradores tienen acceso de escritura para asignar planes, crear rutinas/dietas y enviar mensajes.
