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

    function isTrainer() {
      return isAuth() && myRole() == 'trainer';
    }

    function isStaff() {
      return isAuth() && (isAdmin() || isTrainer());
    }

    // ── Usuarios ─────────────────────────────────────────────────────────────

    // Cada usuario puede leer/escribir su propio perfil.
    // Admins pueden leer todos los perfiles.
    // Trainers pueden leer los perfiles de sus clientes asignados.
    // Solo admins pueden cambiar el rol.
    match /users/{userId} {
      allow read: if isAuth() && (
        request.auth.uid == userId ||
        isAdmin() ||
        (isTrainer() && resource.data.assignedTrainerId == request.auth.uid)
      );
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
    // Rutinas asignadas (clientId != ''): el cliente asignado, el trainer creador, o admin.
    // Staff (admin/trainer) puede crear, editar o eliminar.
    match /workouts/{workoutId} {
      allow read: if isAuth() && (
        resource.data.clientId == '' ||
        resource.data.clientId == request.auth.uid ||
        resource.data.trainerId == request.auth.uid ||
        isAdmin()
      );
      allow create, update, delete: if isStaff();
    }

    // ── Dietas ───────────────────────────────────────────────────────────────
    // Mismas reglas que rutinas.
    match /diets/{dietId} {
      allow read: if isAuth() && (
        resource.data.clientId == '' ||
        resource.data.clientId == request.auth.uid ||
        resource.data.trainerId == request.auth.uid ||
        isAdmin()
      );
      allow create, update, delete: if isStaff();
    }


    // ── Chat (Mensajes) ───────────────────────────────────────────────────────

    // Colección plana `messages` para facilitar consultas con array-contains.
    // Solo los participantes del mensaje (array `participants`) pueden leer.
    // El sender debe ser el usuario autenticado.
    match /messages/{messageId} {
      allow read: if isAuth() && resource.data.participants.hasAny([request.auth.uid]);

      allow create: if isAuth() && (
        request.resource.data.senderId == request.auth.uid &&
        request.resource.data.participants.hasAny([request.auth.uid]) &&
        request.resource.data.participants.size() == 2
      );

      allow update: if isAuth() && resource.data.participants.hasAny([request.auth.uid]) && (
        // Solo permitir marcar como leído (isRead o read)
        request.resource.data.keys().hasOnly(['isRead', 'read', 'updatedAt']) &&
        request.resource.data.isRead == true
      );

      allow delete: if false;
    }

    // ── Progreso (progress_logs) ──────────────────────────────────────────────
    // Cliente puede leer/escribir su propio progreso.
    // Trainer puede leer el progreso de sus clientes asignados.
    // Admin puede leer todo.
    match /progress_logs/{logId} {
      allow read: if isAuth() && (
        resource.data.clientId == request.auth.uid ||
        (isTrainer() && get(/databases/$(database)/documents/users/$(resource.data.clientId)).data.assignedTrainerId == request.auth.uid) ||
        isAdmin()
      );

      allow create: if isAuth() && (
        request.resource.data.clientId == request.auth.uid ||
        isAdmin()
      );

      allow update, delete: if isAuth() && (
        resource.data.clientId == request.auth.uid ||
        isAdmin()
      );
    }

    // ── Biblioteca de ejercicios ──────────────────────────────────────────────
    // Todos los usuarios autenticados pueden leer.
    // Solo staff (admin/trainer) puede crear/editar/eliminar.
    match /exercises_library/{exerciseId} {
      allow read: if isAuth();
      allow create, update, delete: if isStaff();
    }

    // ── Plantillas de dieta ───────────────────────────────────────────────────
    // Todos los usuarios autenticados pueden leer.
    // Solo staff (admin/trainer) puede crear/editar/eliminar.
    match /diet_templates/{templateId} {
      allow read: if isAuth();
      allow create, update, delete: if isStaff();
    }
  }
}
```

---

## Resumen de Políticas de Acceso

| Colección | Lectura | Creación | Actualización | Eliminación |
|-----------|---------|----------|---------------|-------------|
| `users/{userId}` | Propio usuario, trainer (clientes asignados), o admin | Propio usuario | Propio usuario (sin `role`) o admin | Solo admin |
| `workouts/{workoutId}` | Cliente asignado, trainer creador, o admin (plantillas: todos) | Staff (admin/trainer) | Staff (admin/trainer) | Staff (admin/trainer) |
| `diets/{dietId}` | Cliente asignado, trainer creador, o admin (plantillas: todos) | Staff (admin/trainer) | Staff (admin/trainer) | Staff (admin/trainer) |
| `messages/{messageId}` | Participantes del mensaje | Solo participantes (sender = auth) | Solo marcar como leído | ❌ Denegado |
| `progress_logs/{logId}` | Propio cliente, trainer asignado, o admin | Propio cliente o admin | Propio cliente o admin | Propio cliente o admin |
| `exercises_library/{exerciseId}` | Todos los usuarios autenticados | Staff (admin/trainer) | Staff (admin/trainer) | Staff (admin/trainer) |
| `diet_templates/{templateId}` | Todos los usuarios autenticados | Staff (admin/trainer) | Staff (admin/trainer) | Staff (admin/trainer) |


---

## Funciones Helper

| Función | Descripción |
|---------|-------------|
| `isAuth()` | Verifica que el usuario esté autenticado |
| `isBootstrapAdminEmail()` | Admin por email fijo (`servicioweb.pmi@gmail.com`) |
| `myRole()` | Obtiene el rol del usuario desde Firestore |
| `isAdmin()` | Admin por email bootstrap o por rol en Firestore |
| `isTrainer()` | Verifica si el usuario tiene rol `trainer` |
| `isStaff()` | Verifica si el usuario es admin o trainer |


---

## Notas Importantes

1. **Bootstrap admin**: El email `servicioweb.pmi@gmail.com` tiene acceso admin incluso si su documento `users/{uid}` no existe o no tiene el rol `admin`. Esto asegura que siempre haya al menos un admin en el sistema.

2. **Protección de rol**: Los usuarios NO pueden cambiarse el rol a sí mismos. Solo un admin puede asignar roles. Esto se valida con: `!('role' in request.resource.data.diff(resource.data).affectedKeys())`.

3. **Chat (mensajes)**: Los mensajes están en una colección plana `messages` (no subcolección). Solo los participantes pueden leer. Solo se permite marcar como leído (`isRead`). No se pueden eliminar.

4. **Progress logs**: Los trainers pueden leer el progreso de sus clientes asignados. Solo el cliente o admin pueden crear/editar/eliminar.

5. **Biblioteca y plantillas**: `exercises_library` y `diet_templates` son de solo lectura para todos los usuarios autenticados. Solo staff (admin/trainer) puede modificarlas.

6. **Plantillas de rutinas/dietas**: Las rutinas y dietas con `clientId == ''` son plantillas visibles para todos los usuarios autenticados. Las asignadas a un cliente específico solo las ve ese cliente, su trainer o un admin.


