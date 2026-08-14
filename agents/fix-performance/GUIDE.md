# 🔧 Fix Performance Agent — Guía + Checklist

## Rol
Corrige anti-patterns de rendimiento: subscribeToCollectionCount, onSnapshot sin cleanup.

## Áreas

### 1. subscribeToCollectionCount (anti-pattern)
- [ ] Buscar `subscribeToCollectionCount` en src/
  - [ ] Subpaso: `grep -rn "subscribeToCollectionCount" src/ --include="*.ts"`
  - [ ] Subpaso: Anotar archivo y línea de cada uso
  - [ ] Subpaso: Verificar si se usa en componentes que se montan/desmontan
- [ ] Añadir TODO comment para reemplazar con `count()` aggregation
  - [ ] Subpaso: Añadir `// TODO: Reemplazar con count() aggregation para evitar leer todos los docs`
  - [ ] Subpaso: Documentar la colección y el filtro del count
- [ ] Sugerir: `firestore().collection().count().get()`
  - [ ] Subpaso: Ejemplo: `const snapshot = await getCountFromServer(query(collection(db, 'x'), where('y', '==', z)));`
  - [ ] Subpaso: Verificar: `npm run type-check` — no debe introducir errores

### 2. onSnapshot sin unsubscribe
- [ ] Buscar `onSnapshot` sin unsubscribe visible
  - [ ] Subpaso: `grep -rn "onSnapshot" src/ --include="*.ts" | grep -v "return onSnapshot\|const unsub\|let unsub"`
  - [ ] Subpaso: Verificar que cada `onSnapshot` retorna la función de cleanup o la guarda en variable
- [ ] Añadir TODO comment para cleanup
  - [ ] Subpaso: Añadir `// TODO: Guardar return de onSnapshot y llamar unsubscribe en cleanup`
  - [ ] Subpaso: Documentar dónde debería llamarse el unsubscribe (useEffect return, beforeunload, etc.)
- [ ] Sugerir: guardar return y llamar unsubscribe
  - [ ] Subpaso: Ejemplo: `const unsub = onSnapshot(q, cb);` + `unsub()` en cleanup
  - [ ] Subpaso: Verificar que las funciones retornan `Unsubscribe` tipo
  - [ ] Subpaso: Verificar: `npm run type-check` — no debe introducir errores

### 3. Casos límite (⬅️ NUEVO)
- [ ] **onSnapshot en páginas .astro**: Verificar que se llama `unsub?.()` en `beforeunload` o `onCleanup`
- [ ] **onSnapshot en stores**: Verificar que el store expone una función `unsubscribe()` o `destroy()`
- [ ] **onSnapshot en listeners globales**: Verificar que se desuscriben al hacer logout
- [ ] **NO eliminar cláusulas**: NUNCA eliminar `where`, `orderBy`, `limit` al "optimizar"
- [ ] **NO cambiar serverTimestamp**: NUNCA eliminar `serverTimestamp()` en `createdAt`/`updatedAt`

## Golden Rules
- ❌ No suscripciones sin cleanup
- ✅ `count()` aggregation > `subscribeToCollectionCount`
- ✅ Siempre unsubscribir en cleanup

## Script
```bash
npm run fix:performance
```

## Archivos Clave
- `src/lib/admin/adminSubscriptions.ts`
- `src/lib/admin/adminUtils.ts`
- `src/lib/client/dietService.ts`
- `src/lib/client/workoutService.ts`
- `src/lib/trainer/templateService.ts`