# 📋 Admin Agent — Backlog de Tareas

> Backlog priorizado para el módulo de Administración. Actualizado: 2026-07-25

---

## 🔴 Prioridad Alta

### #1 Tests unitarios adminUtils.ts (18.42% → 80%+)
- **Descripción:** Aumentar cobertura del barrel y módulos admin
- **Archivos afectados:** `tests/unit/lib/admin/`, `src/lib/admin/*.ts`
- **Criterios:** Cobertura >80% statements, >75% branches, 3 escenarios por función
- **Dependencias:** Ninguna

### #2 Tests E2E flujo admin
- **Descripción:** Crear tests E2E para flujo completo admin
- **Archivos afectados:** `tests/e2e/admin.spec.ts`
- **Criterios:** Dashboard carga stats, CRUD usuarios funciona, navegación completa
- **Dependencias:** #1

---

## 🟡 Prioridad Media

### #3 Verificar legacy adminService.ts
- **Descripción:** Revisar si `src/services/adminService.ts` sigue en uso o puede eliminarse
- **Archivos afectados:** `src/services/adminService.ts`, páginas que lo importan
- **Criterios:** Cero imports rotos tras eliminar, funcionalidad migrada a `src/lib/admin/`

### #4 Optimizar consultas Firestore
- **Descripción:** Añadir índices compuestos y optimizar queries
- **Archivos afectados:** `firestore.indexes.json`, `src/lib/admin/adminSubscriptions.ts`
- **Criterios:** Consultas <200ms, índices documentados

### #5 Paginación en listas de usuarios
- **Descripción:** Añadir paginación (infinite scroll o páginas) a listas admin
- **Archivos afectados:** `src/pages/admin/users.astro`, `adminRender.ts`
- **Criterios:** Scroll infinito o paginación funcional, <100 usuarios por carga

### #6-#9 Tests unitarios por submódulo
- Tests para `adminUsers.ts`, `adminAuth.ts`, `adminSubscriptions.ts`, `adminRender.ts`, `adminInit.ts`
- **Criterios:** 3 escenarios por función, cobertura >80%

---

> **Ver también:** `TODO.md` para contexto global del proyecto