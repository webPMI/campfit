# Plan de Refactorización y Optimización — CampFit 2.0

> **Objetivo**: Eliminar duplicación de código, optimizar peticiones Firestore, unificar servicios y reducir líneas de código.
> **Última actualización**: 7/20/2026

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

**Problema**: El botón "Ir al Chat" en clients.astro navega a `/trainer/chat?lang=${lang}` pero **no pasa el clientId como parámetro**. El trainer llega a la página de chat y tiene que buscar manualmente al cliente en la lista.

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

## 🏗️ Estado Actual de la Refactorización

### ✅ Completado (Fases 1-3 parcialmente)

| Archivo | Estado | Líneas |
|---------|--------|--------|
| `src/lib/shared/ui.ts` | ✅ Creado | 207 |
| `src/lib/shared/chat.ts` | ✅ Creado | 173 |
| `src/lib/shared/logger.ts` | ✅ Creado | 57 |
| `src/lib/shared/authGuard.ts` | ✅ Creado | 95 |
| `src/lib/shared/i18n.ts` | ✅ Creado | 91 |
| `src/lib/shared/profileService.ts` | ✅ Ya existía | 474 |
| `src/lib/firebase/auth.ts` | ✅ Creado (wrapper testing) | 29 |
| `src/lib/firebase/firestore.ts` | ✅ Creado (wrapper testing) | 21 |

### ❌ Pendiente

| Archivo | Estado | Acción |
|---------|--------|--------|
| `src/lib/client/chatService.ts` | ❌ No eliminado | Eliminar (usar shared/chat.ts) |
| `src/lib/admin/adminUtils.ts` | ❌ No refactorizado | Eliminar duplicación UI, importar de shared |
| `src/lib/trainer/trainerUtils.ts` | ❌ No refactorizado | Eliminar duplicación UI, importar de shared |
| Optimización Firestore | ❌ No implementado | count(), caché, cleanup suscripciones |

---

## 📋 Plan de Implementación Restante

### Fase 1.5: Integrar shared/ui.ts en adminUtils y trainerUtils

**Qué hacer**: Reemplazar funciones duplicadas en adminUtils.ts y trainerUtils.ts por imports de shared/ui.ts.

**Archivos a modificar**:
- `src/lib/admin/adminUtils.ts` — eliminar ICONS, escapeHtml, formatDate, getUserInitial, showToast, renderEmptyState, renderLoadingState; importar de shared/ui
- `src/lib/trainer/trainerUtils.ts` — eliminar ICONS, escapeHtml, formatDate, getUserInitial, showToast, renderEmptyState, renderLoadingState; importar de shared/ui
- `src/lib/shared/profileService.ts` — eliminar escapeHtml local, importar de shared/ui

**Líneas eliminadas**: ~200

---

### Fase 2.5: Integrar shared/chat.ts y eliminar chatService legacy

**Qué hacer**: Reemplazar funciones de chat en adminUtils, trainerUtils y eliminar client/chatService.ts.

**Archivos a modificar**:
- Eliminar: `src/lib/client/chatService.ts`
- Modificar: `src/lib/admin/adminUtils.ts` — eliminar funciones chat, importar de shared/chat
- Modificar: `src/lib/trainer/trainerUtils.ts` — eliminar funciones chat, importar de shared/chat
- Modificar: páginas que importan chatService (client/chat.astro, trainer/chat.astro, admin/users.astro)

**Líneas eliminadas**: ~100

---

### Fase 3.5: Integrar shared/logger.ts

**Qué hacer**: Reemplazar loggers dispersos por shared/logger.ts.

**Archivos a modificar**:
- adminUtils.ts, trainerUtils.ts, profileService.ts, client services

**Líneas eliminadas**: ~60

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

#### 4.2. Cancelar suscripciones al navegar

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

#### 4.3. Evitar queries sin filtro

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

### Fase 1.5: Integrar shared/ui.ts
- [ ] Actualizar `adminUtils.ts` para importar de shared/ui (ICONS, escapeHtml, formatDate, getUserInitial, showToast, renderEmptyState, renderLoadingState)
- [ ] Actualizar `trainerUtils.ts` para importar de shared/ui
- [ ] Actualizar `profileService.ts` para importar escapeHtml de shared/ui
- [ ] Verificar que todas las páginas siguen funcionando
- [ ] Ejecutar tests

### Fase 2.5: Integrar shared/chat.ts
- [ ] Eliminar `src/lib/client/chatService.ts`
- [ ] Actualizar `adminUtils.ts` para importar chat de shared
- [ ] Actualizar `trainerUtils.ts` para importar chat de shared
- [ ] Actualizar páginas que usan chat (client/chat.astro, trainer/chat.astro)
- [ ] Actualizar tests de chatService
- [ ] Ejecutar tests

### Fase 3.5: Integrar shared/logger.ts
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
1. **Fase 1.5** (shared/ui) — Más impacto, menos riesgo
2. **Fase 2.5** (shared/chat) — Crítico para eliminar duplicación
3. **Fase 3.5** (shared/logger) — Bajo riesgo, mejora debugging
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
| `src/lib/shared/ui.ts` | 207 (creado) | ~150 |
| `src/lib/shared/chat.ts` | 173 (creado) | ~80 |
| `src/lib/shared/logger.ts` | 57 (creado) | ~20 |
| `src/lib/shared/profileService.ts` | 474 | ~400 (importar de shared) |
| `src/lib/admin/adminUtils.ts` | 789 | ~200 |
| `src/lib/trainer/trainerUtils.ts` | 757 | ~300 |
| `src/lib/client/chatService.ts` | 63 | 0 (eliminado) |
| **Total** | **~2520** | **~1150** (-54%) |
