# 👑 Admin Agent — Reglas

> Reglas específicas para el agente de administración. Deben cumplirse además de las GOLDEN RULES de `.clinerules`.

---

## 📏 Reglas de Operación

### 1. API Routes para operaciones sensibles
Toda operación que modifique datos de usuarios debe ir por API Routes (Astro endpoints), no Firestore directo desde el cliente. Esto incluye: crear usuario, cambiar rol, eliminar, bloquear.

### 2. CRUD de usuarios
Usar funciones exportadas de `adminUsers.ts`:
- `createUser(email, password, name, role, assignedTrainerId?)`
- `updateUserRole(uid, newRole)`
- `assignTrainer(clientUid, trainerUid)`
- `deleteUser(uid)`
- `toggleUserBlock(uid, isBlocked)`

### 3. Suscripciones con cleanup
Toda suscripción Firestore (`subscribeToUsers`, `subscribeToCollectionCount`, etc.) debe devolver la función `unsubscribe` y llamarse en el lifecycle adecuado.

### 4. Renderizado en adminRender.ts
Todo HTML generado para admin (tarjetas, tablas, formularios) debe estar en `adminRender.ts`. Las páginas .astro solo importan y llaman las funciones de render.

### 5. JSDoc obligatorio
Todas las funciones públicas deben tener `@param` y `@returns` documentados.

### 6. Límite Firestore
Toda consulta debe incluir `.limit(100)` como máximo.

### 7. Legacy adminService.ts
`src/services/adminService.ts` es candidato a legacy. Verificar imports antes de eliminar. Priorizar el uso del módulo `src/lib/admin/`.

### 8. Testing
- Tests unitarios: cobertura >80% en adminUtils (actual 18.42%)
- 3 escenarios por función: éxito, error, edge case
- Tests E2E para flujo completo admin

---

> **Última actualización:** 2026-07-25