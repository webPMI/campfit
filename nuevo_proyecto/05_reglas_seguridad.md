# 🛡️ Reglas de Seguridad Firestore - CampFit 2.0

> **⚠️ Importante:** Este documento describe las reglas de seguridad planificadas.  
> Para ver las reglas **realmente desplegadas en producción**, consulta `firebase_rules.md`.

---

## Archivo: `firestore.rules`

Este archivo se despliega en Firebase y define quién puede leer/escribir cada colección.

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ==========================================
    // FUNCIONES HELPER
    // ==========================================
    
    // Verifica que el usuario esté autenticado
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Obtiene el rol del usuario desde su documento en Firestore
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Verifica si el usuario es admin (incluye bootstrap por email)
    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email == 'servicioweb.pmi@gmail.com' ||
        getUserRole() == 'admin'
      );
    }
    
    // Verifica si el usuario es trainer
    function isTrainer() {
      return isSignedIn() && getUserRole() == 'trainer';
    }
    
    // Verifica si el usuario es staff (admin o trainer)
    function isStaff() {
      return isAdmin() || isTrainer();
    }
    
    // Verifica si el usuario es el propietario del recurso
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Verifica que solo se modifiquen los campos permitidos
    function onlyChanges(field) {
      return request.resource.data.diff(resource.data).affectedKeys().hasOnly([field]);
    }
    
    // Verifica que el usuario sea el cliente asignado a un plan
    function isAssignedClient(clientId) {
      return isSignedIn() && request.auth.uid == clientId;
    }
    
    
    // ==========================================
    // COLECCIÓN: users
    // ==========================================
    match /users/{userId} {
      // Lectura: propio usuario o admin
      allow read: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      
      // Creación: el usuario crea su propio perfil al registrarse
      allow create: if isSignedIn() && request.auth.uid == userId;
      
      // Actualización:
      // - El propio usuario puede editar su perfil (excepto el campo 'role')
      // - El admin puede editar cualquier campo de cualquier usuario
      allow update: if isSignedIn() && (
        (isOwner(userId) && !('role' in request.resource.data.diff(resource.data).affectedKeys()))
        || isAdmin()
      );
      
      // Eliminación: solo admin
      allow delete: if isAdmin();
    }
    
    
    // ==========================================
    // COLECCIÓN: workouts
    // ==========================================
    match /workouts/{workoutId} {
      // Lectura: el cliente asignado, o admin (plantillas con clientId == '' para todos)
      allow read: if isSignedIn() && (
        resource.data.clientId == '' ||
        resource.data.clientId == request.auth.uid ||
        isAdmin()
      );
      
      // Escritura (crear, actualizar, eliminar): solo admin
      allow create, update, delete: if isAdmin();
    }
    
    
    // ==========================================
    // COLECCIÓN: diets
    // ==========================================
    match /diets/{dietId} {
      // Lectura: el cliente asignado, o admin (plantillas con clientId == '' para todos)
      allow read: if isSignedIn() && (
        resource.data.clientId == '' ||
        resource.data.clientId == request.auth.uid ||
        isAdmin()
      );
      
      // Escritura (crear, actualizar, eliminar): solo admin
      allow create, update, delete: if isAdmin();
    }
    
    
    // ==========================================
    // COLECCIÓN: progress_logs
    // ==========================================
    match /progress_logs/{logId} {
      // Lectura: el propio cliente o staff
      allow read: if isStaff() || isAssignedClient(resource.data.clientId);
      
      // Creación: solo el propio cliente (debe coincidir clientId con su UID)
      allow create: if isAssignedClient(request.resource.data.clientId);
      
      // Actualización: solo el propio cliente
      allow update: if isAssignedClient(resource.data.clientId);
      
      // Eliminación: solo el propio cliente
      allow delete: if isAssignedClient(resource.data.clientId);
    }
    
    
    // ==========================================
    // COLECCIÓN: messages
    // ==========================================
    match /messages/{messageId} {
      // Lectura: solo los participantes directos del mensaje
      allow read: if isSignedIn() && 
        (resource.data.senderId == request.auth.uid || 
         resource.data.receiverId == request.auth.uid);
      
      // Creación: solo si eres el remitente
      // Los clientes solo pueden chatear con su assignedTrainerId o con admin
      // Los staff (admin/trainer) pueden chatear con cualquier cliente
      // Validación: participants debe contener exactamente [senderId, receiverId]
      allow create: if isSignedIn() && 
        request.resource.data.senderId == request.auth.uid && 
        request.resource.data.participants.hasAll([request.auth.uid, request.resource.data.receiverId]) &&
        request.resource.data.participants.size() == 2 && (
          isStaff() || 
          (isSignedIn() && request.resource.data.receiverId == 
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.assignedTrainerId
          ) ||
          (isSignedIn() && get(
            /databases/$(database)/documents/users/$(request.resource.data.receiverId)
          ).data.role == 'admin')
        );
      
      // Actualización: solo el receptor puede marcar como leído
      allow update: if isSignedIn() && 
        request.resource.data.receiverId == request.auth.uid && 
        onlyChanges('isRead');
      
      // Eliminación: no permitida (los mensajes son permanentes)
      allow delete: if false;
    }
    
    
    // ==========================================
    // COLECCIÓN: exercises_library
    // ==========================================
    match /exercises_library/{exerciseId} {
      // Lectura: cualquier usuario autenticado
      allow read: if isSignedIn();
      
      // Escritura: solo staff
      allow write: if isStaff();
    }
    
    
    // ==========================================
    // COLECCIÓN: diet_templates
    // ==========================================
    match /diet_templates/{templateId} {
      // Lectura: cualquier usuario autenticado
      allow read: if isSignedIn();
      
      // Escritura: solo staff
      allow write: if isStaff();
    }
  }
}
```

---

## Resumen de Políticas

| Colección | Lectura | Creación | Actualización | Eliminación |
|-----------|---------|----------|---------------|-------------|
| `users` | Propio usuario / Admin | Propio usuario | Propio usuario (sin role) / Admin | Solo Admin |
| `workouts` | Cliente asignado / Admin (plantillas: todos) | Solo Admin | Solo Admin | Solo Admin |
| `diets` | Cliente asignado / Admin (plantillas: todos) | Solo Admin | Solo Admin | Solo Admin |
| `progress_logs` | Propio cliente / Staff | Solo cliente | Solo cliente | Solo cliente |
| `messages` | Solo participantes | Solo sender (validación) | Solo receiver (isRead) | ❌ No permitido |
| `exercises_library` | Todos auth | Solo Staff | Solo Staff | Solo Staff |
| `diet_templates` | Todos auth | Solo Staff | Solo Staff | Solo Staff |

---

## Diferencias con las Reglas Desplegadas (`firebase_rules.md`)

Las reglas **realmente desplegadas** en producción (`firebase_rules.md`) tienen diferencias significativas:

1. **Colección `progress`** en lugar de `progress_logs` (estructura plana por usuario)
2. **Colección `chat_rooms/{chatId}/messages`** en lugar de `messages` plana (chats con subcolección)
3. **Bootstrap admin** por email (`servicioweb.pmi@gmail.com`) como respaldo
4. **Reglas más restrictivas** en chat (solo participantes, mensajes inmutables)

> 📌 **Ver `firebase_rules.md`** para las reglas actualmente desplegadas en Firebase.

---

## Validaciones Adicionales (App Layer)

Además de las reglas de Firestore, la aplicación debe validar:

1. **Perfil médico obligatorio**: Un cliente no puede acceder al dashboard sin completar `medicalProfile`
2. **Asignación de planes**: Solo se pueden asignar planes a usuarios con rol `client`
3. **Chat 1:1**: Los clientes solo pueden chatear con su `assignedTrainerId` o con admin
4. **Llamados de atención**: Solo staff puede enviar mensajes con `type: 'alert'`
5. **Subida de archivos**: Validar tipo MIME y tamaño antes de subir a R2
