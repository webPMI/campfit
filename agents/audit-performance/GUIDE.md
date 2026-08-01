# ⚡ Audit Performance Agent — Guía + Checklist

## Rol
Auditor de performance. Escanea Firestore queries, pagination, subscriptions, memory leaks.

## Áreas de Auditoría

### 1. Consultas Firestore (Golden Rule #10)
- [ ] Buscar consultas a colecciones sin `.limit()` en src/
- [ ] Verificar que `subscribeToUsers()` tiene límite
- [ ] Verificar que `subscribeToUsersByRole()` tiene límite
- [ ] Verificar que `getTrainerClientCount()` tiene límite

### 2. Suscripciones (Golden Rule #9)
- [ ] Buscar `onSnapshot()` sin unsubscribe visible
- [ ] Verificar que suscripciones se limpian en cleanup
- [ ] Verificar que no hay memory leaks por suscripciones

### 3. Anti-patterns
- [ ] Buscar `subscribeToCollectionCount` (ineficiente)
- [ ] Sugerir reemplazo con `count()` aggregation
- [ ] Verificar que no hay consultas N+1

### 4. Paginación
- [ ] Verificar que listas grandes usan paginación
- [ ] Verificar que hay cursor-based pagination
- [ ] Sugerir lazy loading para datos grandes

## Script
```bash
node scripts/audit.mjs --area=performance
```

## Archivos Clave
- `src/lib/admin/adminSubscriptions.ts`
- `src/services/adminService.ts`
- `src/lib/trainer/trainerClients.ts`
- `src/lib/client/chatService.ts`