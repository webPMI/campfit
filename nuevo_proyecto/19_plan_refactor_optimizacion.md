# Plan de Refactorización y Optimización — CampFit 2.0

> **Objetivo**: Eliminar duplicación de código, optimizar peticiones Firestore, unificar servicios y reducir líneas de código.
> **Última actualización**: 7/11/2026

---

## 📊 Diagnóstico Actual

### Problema #1: Duplicación masiva (adminUtils.ts + trainerUtils.ts)

| Archivo | Líneas | Contiene |
|---------|--------|----------|
| `src/lib/admin/adminUtils.ts` | 789 | ICONS, escapeHtml, formatDate, getUserInitial, showToast, renderEmptyState, renderLoadingState, requireAuth, subscribeToUsers, subscribeToUsersByRole, subscribeToRecentUsers, subscribeToCollectionCount, updateUserRole, deleteUser, signOutUser, loadUserProfile, getTrainerClientCount, getUserName, renderUserCard, renderUserCardExtended, renderUserActions, renderTrainerCard, renderClientCard, initGlobalActions, toggleUserBlock, assignTrainer, getSystemStats, chat (sendMessage, subscribeToConversations, markAsRead) |
| `src/lib/trainer/trainerUtils.ts` | 757 | ICONS, escapeHtml, formatDate, getUserInitial, showToast, renderEmptyState, renderLoadingState, requireAuth, subscribeToClients, getClientProfile, subscribeToWorkoutsByTrainer, subscribeToWorkoutsByClient, createWorkout, updateWorkout, deleteWorkout, subscribeToDietsByTrainer, subscribeToDietsByClient, createDiet, updateDiet, deleteDiet, subscribeToConversations, subscribeToConversation, sendMessage, markAsRead, subscribeToClientProgress, renderClientCard, renderWorkoutCard, renderDietCard, renderMessageBubble, initGlobalActions |

**Duplicación exacta**: ~200 líneas de UI utilities (ICONS, escapeHtml, formatDate, getUserInitial, showToast, renderEmptyState, renderLoadingState)
**Duplicación parcial**: Chat (sendMessage, subscribeToConversations, markAsRead) — misma lógica, interfaces diferentes

### Problema #2: Dos servicios de chat incompatibles

| Aspecto | `src/lib/client/chatService.ts` | `src/lib/trainer/trainerUtils.ts` |
|---------|-------------------------------|-----------------------------------|
| Interfaz | `Message` | `TrainerMessage` |
| Función suscripción | `subscribeToMessages(userId, callback)` | `subscribeToConversation(userId1, userId2, callback)` |
| Función envío | `sendMessage(senderId, receiverId, content)` | `sendMessage(senderId, receiverId, content, type)` |
| Filtrado | Server-side (array-contains) | Client-side (filter) |

### Problema #3: Chat del trainer — Solo accesible desde /trainer/chat

**Estado actual**: El trainer SOLO puede enviar mensajes desde la página `/trainer/chat`. No hay botón "Enviar mensaje" directo desde:

| Página | Botón "Enviar mensaje" | Qué hay en su lugar |
|--------|----------------------|---------------------|
| `/trainer/dashboard` (tarjetas de clientes) | ❌ No existe | Solo muestra nombre y alertas. Al hacer clic va a `/trainer/clients` |
| `/trainer/clients` (detalle de cliente) | ❌ No existe | Botón "Ir al Chat" que navega a `/trainer/chat` **sin seleccionar el cliente** |
| `/trainer/clients` (tarjetas de clientes) | ❌ No existe | Al hacer clic abre detalle del cliente |

**Problema**: El botón "Ir al Chat" en clients.astro (línea 162) navega a `/trainer/chat?lang=${lang}` pero **no pasa el clientId como parámetro**. El trainer llega a la página de chat y tiene que buscar manualmente al cliente en la lista.

**Solución propuesta**:
1. Pasar `clientId` como query param: `/trainer/chat?lang=${lang}&clientId=${clientId}`
2. En `chat.astro`, al iniciar, leer `clientId` de la URL y seleccionar automáticamente esa conversación
3. Añadir botón "Enviar mensaje" directo en las tarjetas de cliente del dashboard y clients

### Problema #4: Sin caché ni optimización de lecturas

- `subscribeToUsers` en adminUtils trae **todos** los documentos sin filtro
- `subscribeToCollectionCount` lee documentos completos solo para contar
- Múltiples `onSnapshot` activos simultáneamente en una misma página
- Sin `AbortController` para cancelar peticiones

---

## 🏗️ Arquitectura Objetivo

```
src/lib/
├── shared/                    # 📁 Código compartido (sin duplicación)
│   ├── ui.ts                  #    Iconos, showToast, renderEmptyState, etc.
│   ├── chat.ts                #    ChatService unificado
│   ├── logger.ts              #    Sistema de logging global
│   ├── profileService.ts      #    ✅ Ya existe (474 líneas)
│   └── firestore.ts           #    Helpers Firestore (count, pagination, etc.)
│
├── admin/
│   └── adminUtils.ts          #    Solo lógica específica de admin (200 líneas)
│
├── trainer/
│   └── trainerUtils.ts        #    Solo lógica específica de trainer (300 líneas)
│
├── client/
│   ├── chatService.ts         #    → ELIMINAR (usar shared/chat.ts)
│   ├── dietService.ts         #    ✅ Mantener (lógica específica)
│   ├── progressService.ts     #    ✅ Mantener (lógica específica)
│   └── workoutService.ts      #    ✅ Mantener (lógica específica)
│
└── firebase.ts                #    ✅ Mantener (inicialización)
```

---

## 📋 Plan de Implementación por Fases

### Fase 1: Crear shared/ui.ts (Eliminar duplicación UI)

**Qué hacer**: Extraer de adminUtils.ts y trainerUtils.ts todo lo que es UI genérica.

```typescript
// src/lib/shared/ui.ts — Propuesta de API
export const ICONS = { ... };  // Iconos SVG unificados

export function escapeHtml(text: string): string;
export function formatDate(timestamp: any): string;
export function formatTime(timestamp: any): string;
export function getUserInitial(name: string): string;

// Toast único con configuración
export function showToast(options: {
  message: string;
  type: 'success' | 'error' | 'info';
  id?: string;        // default: 'app-toast'
  duration?: number;  // default: 3000
  position?: 'bottom' | 'top'; // default: 'bottom'
}): void;

// Estados
export function renderEmptyState(icon: string, message: string): string;
export function renderLoadingState(message?: string): string;

// Badge de rol
export function getRoleBadge(role: string): { label: string; class: string };
```

**Archivos a modificar**:
- Crear: `src/lib/shared/ui.ts`
- Modificar: `src/lib/admin/adminUtils.ts` — eliminar funciones duplicadas, importar de shared
- Modificar: `src/lib/trainer/trainerUtils.ts` — eliminar funciones duplicadas, importar de shared
- Modificar: `src/lib/shared/profileService.ts` — eliminar escapeHtml local, importar de shared

**Líneas eliminadas**: ~200

---

### Fase 2: Crear shared/chat.ts (Unificar chat)

**Qué hacer**: Crear un único servicio de chat que usen cliente, trainer y admin.

```typescript
// src/lib/shared/chat.ts — Propuesta de API
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  participants: string[];
  content: string;
  type: 'text' | 'alert';
  isRead: boolean;
  createdAt: any;
}

// Suscripción a TODOS los mensajes de un usuario (para lista de conversaciones)
export function subscribeToUserMessages(
  userId: string,
  callback: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe;

// Suscripción a conversación entre 2 usuarios
export function subscribeToConversation(
  userId1: string,
  userId2: string,
  callback: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe;

// Enviar mensaje
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  type?: 'text' | 'alert'
): Promise<string | null>;

// Marcar como leído
export async function markAsRead(messageId: string): Promise<void>;
```

**Archivos a modificar**:
- Crear: `src/lib/shared/chat.ts`
- Eliminar: `src/lib/client/chatService.ts`
- Modificar: `src/lib/admin/adminUtils.ts` — eliminar funciones chat, importar de shared
- Modificar: `src/lib/trainer/trainerUtils.ts` — eliminar funciones chat, importar de shared
- Modificar: páginas que importan chatService (client/chat.astro, trainer/chat.astro, admin/users.astro)

**Líneas eliminadas**: ~100

---

### Fase 3: Crear shared/logger.ts (Logging global)

**Qué hacer**: Unificar todos los loggers dispersos.

```typescript
// src/lib/shared/logger.ts
export const logger = {
  info: (module: string, message: string, ...args: unknown[]) => {
    if (import.meta.env.DEV) console.info(`[${module}] ${message}`, ...args);
  },
  warn: (module: string, message: string, ...args: unknown[]) => {
    if (import.meta.env.DEV) console.warn(`[${module}] ${message}`, ...args);
  },
  error: (module: string, message: string, error?: unknown) => {
    console.error(`[${module}] ${message}`, error || '');
    // En producción: enviar a Sentry o similar
  },
};
```

**Archivos a modificar**:
- Crear: `src/lib/shared/logger.ts`
- Modificar: adminUtils.ts, trainerUtils.ts, profileService.ts, client services

**Líneas eliminadas**: ~60 (cada archivo tiene su propio logger)

---

### Fase 4: Optimizar peticiones Firestore

#### 4.1. Usar `count()` en lugar de leer documentos para contar

```typescript
// En lugar de:
export function subscribeToCollectionCount(name: string, callback: (n: number) => void) {
  return onSnapshot(collection(db, name), (snap) => callback(snap.size));
}

// Usar:
import { count, getAggregateFromServer } from 'firebase/firestore';
export async function getCollectionCount(name: string): Promise<number> {
  const snapshot = await getAggregateFromServer(collection(db, name), { count: count() });
  return snapshot.data().count;
}
```

**Beneficio**: No descarga documentos completos solo para contar.

#### 4.2. Limitar campos en suscripciones

```typescript
// En lugar de traer todo el documento:
const data = doc.data();

// Usar proyección (Firestore no soporta proyección en tiempo real, pero sí en getDocs):
// Para onSnapshot, minimizar datos en el documento
```

#### 4.3. Cancelar suscripciones al navegar

```typescript
// Patrón recomendado para páginas Astro:
const unsubscribers: Unsubscribe[] = [];

function subscribe( fn: () => Unsubscribe ) {
  const unsub = fn();
  unsubscribers.push(unsub);
  return unsub;
}

// Al salir de la página:
document.addEventListener('astro:before-swap', () => {
  unsubscribers.forEach(fn => fn());
  unsubscribers.length = 0;
});
```

#### 4.4. Evitar queries sin filtro

**Problema**: `subscribeToUsers()` en adminUtils trae TODOS los usuarios.
**Solución**: Usar `subscribeToUsersByRole` cuando sea posible, o paginar.

---

### Fase 5: Limpiar adminUtils.ts y trainerUtils.ts

Después de las fases 1-3, los archivos quedarán:

**adminUtils.ts** (~200 líneas):
- `subscribeToUsers(callback)` — trae todos (necesario para admin)
- `subscribeToUsersByRole(role, callback)` — filtrado por rol
- `subscribeToRecentUsers(max, callback)` — últimos N
- `updateUserRole(uid, role)` — cambiar rol
- `deleteUser(uid)` — eliminar usuario
- `signOutUser()` — cerrar sesión
- `loadUserProfile(uid)` — cargar perfil
- `getTrainerClientCount(trainerId)` — contar clientes
- `getUserName(uid)` — obtener nombre
- `toggleUserBlock(uid, blocked)` — bloquear/desbloquear
- `assignTrainer(uid, trainerId)` — asignar trainer
- `getSystemStats()` — estadísticas
- `renderUserCard(user, showActions)` — tarjeta usuario
- `renderUserCardExtended(user, showActions)` — tarjeta extendida
- `renderUserActions(uid)` — botones acción
- `renderTrainerCard(trainer)` — tarjeta trainer
- `renderClientCard(client)` — tarjeta cliente
- `initGlobalActions()` — inicializar eventos

**trainerUtils.ts** (~300 líneas):
- `subscribeToClients(trainerId, callback)` — clientes asignados
- `getClientProfile(clientId)` — perfil cliente
- `subscribeToWorkoutsByTrainer(trainerId, callback)` — rutinas del trainer
- `subscribeToWorkoutsByClient(clientId, callback)` — rutinas del cliente
- `createWorkout(data)` — crear rutina
- `updateWorkout(id, data)` — actualizar rutina
- `deleteWorkout(id)` — eliminar rutina
- `subscribeToDietsByTrainer(trainerId, callback)` — dietas del trainer
- `subscribeToDietsByClient(clientId, callback)` — dietas del cliente
- `createDiet(data)` — crear dieta
- `updateDiet(id, data)` — actualizar dieta
- `deleteDiet(id)` — eliminar dieta
- `subscribeToClientProgress(clientId, callback)` — progreso cliente
- `renderClientCard(client, onclick)` — tarjeta cliente
- `renderWorkoutCard(workout)` — tarjeta rutina
- `renderDietCard(diet)` — tarjeta dieta
- `renderMessageBubble(message, isOwn, senderName, isFirst)` — burbuja chat
- `initGlobalActions(trainerId)` — inicializar

---

## 📊 Impacto Estimado

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Líneas adminUtils.ts | 789 | ~200 | -75% |
| Líneas trainerUtils.ts | 757 | ~300 | -60% |
| Archivos de chat | 2 (incompatibles) | 1 (unificado) | -50% |
| Loggers dispersos | 5+ | 1 | -80% |
| Código duplicado | ~300 líneas | ~0 | -100% |
| Peticiones Firestore | Sin optimizar | Count + caché | Variable |

---

## 🚀 Optimizaciones Adicionales

### O1. Implementar AbortController para fetch

```typescript
// En páginas que hacen fetch a APIs externas
const controller = new AbortController();

document.addEventListener('astro:before-swap', () => {
  controller.abort();
});
```

### O2. Cachear datos de usuario en localStorage

```typescript
// Para evitar leer Firestore en cada carga de página
const CACHE_KEY = 'campfit_user_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function getCachedUser(): User | null {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
  return data;
}

export function setCachedUser(user: User): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data: user,
    timestamp: Date.now(),
  }));
}
```

### O3. Debounce en búsquedas

```typescript
// Para búsqueda de usuarios en admin
export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
```

### O4. Lazy loading de datos

- Cargar primero los datos esenciales (dashboard stats)
- Cargar después los detalles (perfiles, historial)
- Usar `Promise.all` para cargas paralelas

---

## 📋 Checklist de Implementación

### Fase 1: shared/ui.ts
- [ ] Crear `src/lib/shared/ui.ts` con ICONS, escapeHtml, formatDate, getUserInitial, showToast, renderEmptyState, renderLoadingState, getRoleBadge
- [ ] Actualizar `adminUtils.ts` para importar de shared/ui
- [ ] Actualizar `trainerUtils.ts` para importar de shared/ui
- [ ] Actualizar `profileService.ts` para importar escapeHtml de shared/ui
- [ ] Verificar que todas las páginas siguen funcionando
- [ ] Ejecutar tests (215 deben seguir pasando)

### Fase 2: shared/chat.ts
- [ ] Crear `src/lib/shared/chat.ts` con ChatMessage, subscribeToUserMessages, subscribeToConversation, sendMessage, markAsRead
- [ ] Eliminar `src/lib/client/chatService.ts`
- [ ] Actualizar `adminUtils.ts` para importar chat de shared
- [ ] Actualizar `trainerUtils.ts` para importar chat de shared
- [ ] Actualizar páginas que usan chat (client/chat.astro, trainer/chat.astro)
- [ ] Actualizar tests de chatService
- [ ] Ejecutar tests

### Fase 3: shared/logger.ts
- [ ] Crear `src/lib/shared/logger.ts`
- [ ] Reemplazar loggers en adminUtils.ts, trainerUtils.ts, profileService.ts, client services
- [ ] Ejecutar tests

### Fase 4: Optimizar Firestore
- [ ] Implementar `getCollectionCount` con `count()`
- [ ] Implementar patrón de cleanup de suscripciones en páginas
- [ ] Revisar queries sin filtro y optimizar
- [ ] Verificar índices en firestore.indexes.json

### Fase 5: Limpiar archivos
- [ ] Reducir adminUtils.ts a solo lógica admin
- [ ] Reducir trainerUtils.ts a solo lógica trainer
- [ ] Verificar que no hay imports rotos

---

## 🔍 Notas para Agentes

### Prioridad de implementación
1. **Fase 1** (shared/ui) — Más impacto, menos riesgo
2. **Fase 2** (shared/chat) — Crítico para eliminar duplicación
3. **Fase 3** (shared/logger) — Bajo riesgo, mejora debugging
4. **Fase 4** (Firestore) — Optimización, no bloqueante
5. **Fase 5** (limpieza) — Depende de fases 1-3

### Reglas para no romper nada
1. **Nunca cambiar la firma de funciones públicas** sin actualizar todos los callers
2. **Mantener compatibilidad hacia atrás** — si una función cambia de nombre, mantener la vieja como alias
3. **Tests primero** — escribir tests antes de refactorizar
4. **Un cambio a la vez** — no mezclar refactor UI con refactor chat

### Archivos que NO tocar
- `src/lib/firebase.ts` — Inicialización Firebase
- `src/stores/authStore.ts` — Store de autenticación
- `src/services/authService.ts` — Servicio de auth
- `src/types/index.ts` — Tipos globales
- `src/lib/routeGuards.ts` — Guardias de ruta
- `firestore.rules` — Reglas de seguridad
- `firestore.indexes.json` — Índices

---

## 📊 Estado Final Esperado

| Archivo | Líneas (actual) | Líneas (objetivo) |
|---------|----------------|-------------------|
| `src/lib/shared/ui.ts` | 0 (nuevo) | ~150 |
| `src/lib/shared/chat.ts` | 0 (nuevo) | ~80 |
| `src/lib/shared/logger.ts` | 0 (nuevo) | ~20 |
| `src/lib/shared/profileService.ts` | 474 | ~400 (importar de shared) |
| `src/lib/admin/adminUtils.ts` | 789 | ~200 |
| `src/lib/trainer/trainerUtils.ts` | 757 | ~300 |
| `src/lib/client/chatService.ts` | 63 | 0 (eliminado) |
| **Total** | **~2083** | **~1150** (-45%) |
