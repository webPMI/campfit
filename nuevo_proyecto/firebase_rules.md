# 🔥 Firebase Rules - CampFit

> Reglas de seguridad de Firestore actualmente desplegadas en el proyecto `mallorca-campfit`.
> Última actualización: Julio 2026

---

## Reglas Completas

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Helpers ─────────────────────────────────────────────────────────────
    function isAuth() {
      return request.auth != null;
    }

    function isBootstrapAdminEmail() {
      return isAuth() &&
        request.auth.token.email != null &&
        request.auth.token.email == 'servicioweb.pmi@gmail.com';
    }

    function myRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isAdmin() {
      return isAuth() && (isBootstrapAdminEmail() || myRole() == 'admin');
    }

    // ── Usuarios ─────────────────────────────────────────────────────────────
    // Cada usuario puede leer/escribir su propio perfil.
    // Solo admins pueden leer todos los perfiles.
    // Solo admins pueden cambiar el rol.
    match /users/{userId} {
      allow read: if isAuth() && (request.auth.uid == userId || isAdmin());
      allow create: if isAuth() && request.auth.uid == userId;
      allow update: if isAuth() && (
        // El propio usuario puede actualizar su perfil, excepto el campo role.
        (request.auth.uid == userId &&
          !('role' in request.resource.data.diff(resource.data).affectedKeys())) ||
        // Admins pueden actualizar cualquier campo (incluyendo role)
        isAdmin()
      );
      allow delete: if isAdmin();
    }

    // ── Rutinas ──────────────────────────────────────────────────────────────
    // Plantillas (clientId == ''): cualquier usuario autenticado puede leerlas.
    // Rutinas asignadas (clientId != ''): solo el propio cliente o admin.
    // Solo admin puede crear, editar o eliminar.
    match /workouts/{workoutId} {
      allow read: if isAuth() && (
        resource.data.clientId == '' ||
        resource.data.clientId == request.auth.uid ||
        isAdmin()
      );
      allow create, update, delete: if isAdmin();
    }

    // ── Dietas ───────────────────────────────────────────────────────────────
    // Mismas reglas que rutinas.
    match /diets/{dietId} {
      allow read: if isAuth() && (
        resource.data.clientId == '' ||
        resource.data.clientId == request.auth.uid ||
        isAdmin()
      );
      allow create, update, delete: if isAdmin();
    }

    // ── Progreso (peso / medidas corporales) ─────────────────────────────────
    // Cada usuario puede gestionar su propio progreso.
    // Solo admin puede leer el de cualquier usuario.
    match /progress/{progressId} {
      allow read: if isAuth() && (
        progressId == request.auth.uid ||
        resource.data.clientId == request.auth.uid ||
        isAdmin()
      );
      allow create: if isAuth() && (
        progressId == request.auth.uid ||
        request.resource.data.clientId == request.auth.uid ||
        isAdmin()
      );
      allow update, delete: if isAuth() && (
        progressId == request.auth.uid ||
        resource.data.clientId == request.auth.uid ||
        isAdmin()
      );
    }

    // ── Chat ─────────────────────────────────────────────────────────────────
    // Conversaciones entre cliente y entrenador/admin.
    // Solo los participantes del chat (almacenados en un array `participants`) pueden leer o escribir.
    match /chat_rooms/{chatId} {
      allow read: if isAuth() && request.auth.uid in resource.data.participants;

      allow create: if isAuth() && (
        request.resource.data.clientId is string &&
        request.resource.data.trainerId is string &&
        request.resource.data.participants is list &&
        request.resource.data.participants.size() == 2 &&
        request.resource.data.participants.hasAny([request.auth.uid]) &&
        request.resource.data.participants.hasAll([
          request.resource.data.clientId,
          request.resource.data.trainerId,
        ])
      );

      allow update: if isAuth() &&
        request.auth.uid in resource.data.participants &&
        request.resource.data.clientId == resource.data.clientId &&
        request.resource.data.trainerId == resource.data.trainerId &&
        request.resource.data.participants == resource.data.participants;

      allow delete: if isAdmin();
      
      // Los mensajes heredan la seguridad del chat padre.
      // Solo los participantes pueden leer y escribir mensajes dentro de su chat.
      match /messages/{messageId} {
        allow read: if isAuth() && get(/databases/$(database)/documents/chat_rooms/$(chatId)).data.participants.hasAny([request.auth.uid]);

        allow create: if isAuth() && (
          get(/databases/$(database)/documents/chat_rooms/$(chatId)).data.participants.hasAny([request.auth.uid]) &&
          request.resource.data.senderId == request.auth.uid &&
          get(/databases/$(database)/documents/chat_rooms/$(chatId)).data.participants.hasAny([request.resource.data.receiverId])
        );

        allow update, delete: if false;
      }
    }
  }
}
```

---

## Resumen de Políticas de Acceso

| Colección | Lectura | Creación | Actualización | Eliminación |
|-----------|---------|----------|---------------|-------------|
| `users/{userId}` | Propio usuario o admin | Propio usuario | Propio usuario (sin `role`) o admin | Solo admin |
| `workouts/{workoutId}` | Cliente asignado, o admin (plantillas: todos) | Solo admin | Solo admin | Solo admin |
| `diets/{dietId}` | Cliente asignado, o admin (plantillas: todos) | Solo admin | Solo admin | Solo admin |
| `progress/{progressId}` | Propio usuario o admin | Propio usuario o admin | Propio usuario o admin | Propio usuario o admin |
| `chat_rooms/{chatId}` | Solo participantes | Solo participantes (validación estricta) | Solo participantes (sin cambiar estructura) | Solo admin |
| `chat_rooms/{chatId}/messages/{msgId}` | Solo participantes del chat | Solo participantes (sender = auth) | ❌ Denegado | ❌ Denegado |

---

## Funciones Helper

| Función | Descripción |
|---------|-------------|
| `isAuth()` | Verifica que el usuario esté autenticado |
| `isBootstrapAdminEmail()` | Admin por email fijo (`servicioweb.pmi@gmail.com`) |
| `myRole()` | Obtiene el rol del usuario desde Firestore |
| `isAdmin()` | Admin por email bootstrap o por rol en Firestore |

---

## Notas Importantes

1. **Bootstrap admin**: El email `servicioweb.pmi@gmail.com` tiene acceso admin incluso si su documento `users/{uid}` no existe o no tiene el rol `admin`. Esto asegura que siempre haya al menos un admin en el sistema.

2. **Protección de rol**: Los usuarios NO pueden cambiarse el rol a sí mismos. Solo un admin puede asignar roles. Esto se valida con: `!('role' in request.resource.data.diff(resource.data).affectedKeys())`.

3. **Chat inmutable**: Los mensajes del chat no se pueden editar ni eliminar una vez enviados (`allow update, delete: if false`). Esto garantiza la integridad de las conversaciones.

4. **Chat rooms**: La creación de salas de chat valida estrictamente que:
   - `clientId` y `trainerId` sean strings
   - `participants` sea un array de exactamente 2 elementos
   - El creador sea uno de los participantes
   - Los participantes coincidan con `clientId` y `trainerId`

5. **Plantillas**: Las rutinas y dietas con `clientId == ''` son plantillas visibles para todos los usuarios autenticados. Las asignadas a un cliente específico solo las ve ese cliente o un admin.
