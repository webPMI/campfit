# 🌐 API Contracts - CampFit 2.0

Especificación de endpoints de API Routes (Astro) y Cloudflare Workers.

**Nota:** El registro e inicio de sesión se manejan desde el Client SDK de Firebase directamente. Las API Routes aquí definidas usan el Firebase Admin SDK y son exclusivamente para operaciones administrativas.

---

## 1. API Routes (Astro - Server-side)

Todas las rutas API usan el Firebase Admin SDK y requieren autenticación mediante token de Firebase en el header `Authorization`.

### 1.1 `GET /api/users`

Listar usuarios (solo admin).

**Headers:** `Authorization: Bearer <firebase-token>`

**Query params:**
- `role` (opcional): `client` | `admin` | `trainer`
- `search` (opcional): búsqueda por nombre o email

**Response 200:**
```json
{
  "success": true,
  "users": [
    {
      "uid": "abc123",
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "role": "client",
      "hasActiveAlert": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### 1.2 `PUT /api/users/:uid`

Actualizar usuario (solo admin).

**Headers:** `Authorization: Bearer <firebase-token>`

**Request:**
```json
{
  "name": "Juan Pérez Actualizado",
  "role": "client",
  "assignedTrainerId": "trainer123"
}
```

**Response 200:**
```json
{
  "success": true,
  "user": { "...datos actualizados..." }
}
```

---

### 1.3 `DELETE /api/users/:uid`

Eliminar usuario (solo admin).

**Headers:** `Authorization: Bearer <firebase-token>`

**Response 200:**
```json
{
  "success": true,
  "message": "Usuario eliminado"
}
```

---

### 1.4 `POST /api/users/:uid/reset-password`

Resetear contraseña de usuario (solo admin).

**Headers:** `Authorization: Bearer <firebase-token>`

**Response 200:**
```json
{
  "success": true,
  "message": "Email de recuperación enviado"
}
```

---

### 1.5 `POST /api/validate-medical`

Validar datos del perfil médico de un cliente (solo admin/trainer).

**Headers:** `Authorization: Bearer <firebase-token>`

**Request:**
```json
{
  "uid": "client123",
  "medicalData": {
    "age": 28,
    "weight": 75,
    "height": 175,
    "medicalConditions": ["asma"],
    "medications": ["salbutamol"],
    "injuries": ["hombro derecho"],
    "surgeryHistory": [],
    "contraindications": []
  }
}
```

**Validaciones:**
- `age`: 14-100
- `weight`: 30-300 (kg)
- `height`: 100-250 (cm)
- `medicalConditions`: array de strings, max 20 items
- `medications`: array de strings, max 20 items
- `injuries`: array de strings, max 20 items

**Response 200:**
```json
{
  "success": true,
  "valid": true,
  "warnings": ["Asma puede requerir precaución en ejercicios de alta intensidad"],
  "restrictedExercises": ["HIIT", "Carrera continua > 5km"]
}
```

**Response 200 (datos inválidos):**
```json
{
  "success": true,
  "valid": false,
  "errors": [
    "La edad debe estar entre 14 y 100 años",
    "El peso debe estar entre 30 y 300 kg"
  ]
}
```

---

## 2. Cloudflare Workers

### 2.1 `POST /api/upload-url`

Generar URL pre-firmada para subir archivo a R2.

**Headers:** `Authorization: Bearer <firebase-token>`

**Request:**
```json
{
  "fileName": "progreso-enero-2024.jpg",
  "contentType": "image/jpeg",
  "type": "progress"
}
```

**Validaciones:**
- `type`: `"progress"` (fotos cliente) | `"exercise"` (videos biblioteca)
- `contentType`: `image/jpeg` | `image/png` | `image/webp` | `video/mp4`
- `fileName`: string, max 100 chars, solo alfanumérico + guiones + puntos
- Max file size: 100MB (validado en cliente antes de subir)

**Response 200:**
```json
{
  "success": true,
  "uploadUrl": "https://r2.cloudflare.com/presigned-url...",
  "publicUrl": "https://r2.campfit.app/uploads/abc123/progreso-enero-2024.jpg",
  "key": "uploads/abc123/progreso-enero-2024.jpg"
}
```

**Response 401:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

### 2.2 `POST /api/chatbot`

Consultar chatbot de FAQs.

**Request:**
```json
{
  "message": "¿Cómo registro mi peso?"
}
```

**Response 200 (FAQ encontrada):**
```json
{
  "success": true,
  "answer": "Ve a la sección Progreso, presiona 'Registrar peso' e ingresa tu peso actual.",
  "type": "faq"
}
```

**Response 200 (FAQ no encontrada):**
```json
{
  "success": true,
  "answer": "No pude resolver tu consulta. ¿Quieres hablar con Seba?",
  "type": "escalation"
}
```

> **📌 FAQs completas:** Ver `09_modulo_cliente.md` para la lista completa de FAQs del chatbot.

---

## 3. Firestore Streams (Client-side)

### 3.1 Chat en tiempo real
```typescript
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@core/firebase/config';

export function subscribeToChat(
  userId: string,
  trainerId: string,
  onMessages: (messages: Message[]) => void
) {
  const q = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Message))
      .filter(msg => 
        (msg.senderId === userId && msg.receiverId === trainerId) ||
        (msg.senderId === trainerId && msg.receiverId === userId)
      );
    onMessages(messages);
  });
}
```

### 3.2 Dashboard del cliente
```typescript
// Última rutina asignada
const workoutsQuery = query(
  collection(db, 'workouts'),
  where('clientId', '==', user.uid),
  orderBy('createdAt', 'desc'),
  limit(1)
);

// Logs de hoy
const todayStart = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));
const todayEnd = Timestamp.fromDate(new Date(new Date().setHours(23, 59, 59, 999)));

const todayLogsQuery = query(
  collection(db, 'progress_logs'),
  where('clientId', '==', user.uid),
  where('date', '>=', todayStart),
  where('date', '<=', todayEnd)
);

// Últimos 7 registros de peso
const weightLogsQuery = query(
  collection(db, 'progress_logs'),
  where('clientId', '==', user.uid),
  where('type', '==', 'weight'),
  orderBy('date', 'desc'),
  limit(7)
);
```

### 3.3 Bandeja de admin
```typescript
const inboxQuery = query(
  collection(db, 'messages'),
  where('participants', 'array-contains', adminUid),
  orderBy('createdAt', 'desc')
);
```

---

## 4. Índices Compuestos de Firestore

Estos índices deben crearse en Firebase Console para que las consultas funcionen.

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "participants", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "receiverId", "order": "ASCENDING" },
        { "fieldPath": "isRead", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "progress_logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "clientId", "order": "ASCENDING" },
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "progress_logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "clientId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "type", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "workouts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "clientId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "diets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "clientId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```
