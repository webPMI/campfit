# ⚡ Audit Performance Agent — Guía + Checklist

## Rol
Auditor de performance. Escanea Firestore queries, pagination, subscriptions, memory leaks.

## Áreas de Auditoría

### 1. Consultas Firestore (Golden Rule #10)
- [ ] Buscar consultas a colecciones sin `.limit()` en src/
  - [ ] Subpaso: `grep -rn "collection(db" src/ --include="*.ts" | grep -v "limit("`
  - [ ] Subpaso: Anotar archivo, línea y colección de cada consulta sin limit
  - [ ] Subpaso: ⚠️ NO eliminar `where`/`orderBy` — solo verificar si falta `limit`
- [ ] Verificar que `subscribeToUsers()` tiene límite
  - [ ] Subpaso: `grep -n "subscribeToUsers" src/lib/admin/adminSubscriptions.ts`
  - [ ] Subpaso: Verificar que la query tiene `limit(...)`
- [ ] Verificar que `subscribeToUsersByRole()` tiene límite
  - [ ] Subpaso: `grep -n "subscribeToUsersByRole" src/lib/admin/adminSubscriptions.ts`
  - [ ] Subpaso: Verificar que la query tiene `limit(...)`
- [ ] Verificar que `getTrainerClientCount()` tiene límite
  - [ ] Subpaso: `grep -n "getTrainerClientCount" src/lib/admin/adminUtils.ts`
  - [ ] Subpaso: Verificar que usa `count()` aggregation en lugar de leer todos los docs

### 2. Suscripciones (Golden Rule #9)
- [ ] Buscar `onSnapshot()` sin unsubscribe visible
  - [ ] Subpaso: `grep -rn "onSnapshot" src/ --include="*.ts" | grep -v "return onSnapshot\|const unsub\|let unsub"`
  - [ ] Subpaso: Anotar archivo, línea y función de cada onSnapshot sin cleanup
- [ ] Verificar que suscripciones se limpian en cleanup
  - [ ] Subpaso: `grep -rn "unsub.*?.()" src/ --include="*.ts" --include="*.astro"`
  - [ ] Subpaso: Verificar que cada `unsub` se llama en `beforeunload`, `onCleanup` o return de useEffect
- [ ] Verificar que no hay memory leaks por suscripciones
  - [ ] Subpaso: Verificar que las suscripciones en páginas .astro se limpian en `beforeunload`
  - [ ] Subpaso: Verificar que las suscripciones en stores se limpian con `destroy()` o `unsubscribe()`

### 3. Anti-patterns
- [ ] Buscar `subscribeToCollectionCount` (ineficiente)
  - [ ] Subpaso: `grep -rn "subscribeToCollectionCount" src/ --include="*.ts"`
  - [ ] Subpaso: Anotar archivo, línea y colección de cada uso
- [ ] Sugerir reemplazo con `count()` aggregation
  - [ ] Subpaso: Sugerir: `getCountFromServer(query(collection(db, 'x'), where('y', '==', z)))`
  - [ ] Subpaso: Documentar el filtro exacto que debe mantener el count
- [ ] Verificar que no hay consultas N+1
  - [ ] Subpaso: Buscar loops que llaman `getDoc`/`getDocs` dentro de `forEach`/`map`
  - [ ] Subpaso: Sugerir `Promise.all()` o queries compuestas

### 4. Paginación
- [ ] Verificar que listas grandes usan paginación
  - [ ] Subpaso: Buscar listas que renderizan > 50 items sin paginación
  - [ ] Subpaso: Anotar archivo y componente
- [ ] Verificar que hay cursor-based pagination
  - [ ] Subpaso: Buscar `startAfter`/`endBefore` en queries
  - [ ] Subpaso: Verificar que las listas paginadas usan cursor
- [ ] Sugerir lazy loading para datos grandes
  - [ ] Subpaso: Sugerir `IntersectionObserver` para cargar más items
  - [ ] Subpaso: Sugerir `limit` + `startAfter` para paginación Firestore

## Script
```bash
node scripts/audit.mjs --area=performance
```

## Archivos Clave
- `src/lib/admin/adminSubscriptions.ts`
- `src/services/adminService.ts`
- `src/lib/trainer/trainerClients.ts`
- `src/lib/client/chatService.ts`