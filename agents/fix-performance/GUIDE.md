# 🔧 Fix Performance Agent — Guía + Checklist

## Rol
Corrige anti-patterns de rendimiento: subscribeToCollectionCount, onSnapshot sin cleanup.

## Áreas

### 1. subscribeToCollectionCount (anti-pattern)
- [ ] Buscar `subscribeToCollectionCount` en src/
- [ ] Añadir TODO comment para reemplazar con `count()` aggregation
- [ ] Sugerir: `firestore().collection().count().get()`

### 2. onSnapshot sin unsubscribe
- [ ] Buscar `onSnapshot` sin unsubscribe visible
- [ ] Añadir TODO comment para cleanup
- [ ] Sugerir: guardar return y llamar unsubscribe

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