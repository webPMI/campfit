# 👑 Admin Agent Guide

> **Guía para el Agente de Administración IA** — Rol, alcance, contexto y operaciones del panel de administración de CampFit.

---

## 🎯 Rol y Responsabilidades

**Rol:** Encargado del módulo de Administración del sistema CampFit. Responsable de páginas, servicios y lógica del panel admin.

**Responsabilidades:**
- Mantener y evolucionar las páginas del panel admin (`src/pages/admin/`)
- Desarrollar y mantener los servicios modulares (`src/lib/admin/`)
- Gestionar CRUD completo de usuarios (crear, roles, asignar trainer, bloquear, eliminar)
- Suscripciones en tiempo real a colecciones de usuarios
- Renderizado HTML de componentes admin (tarjetas, tablas, formularios)
- Escribir tests unitarios (cobertura >80%) y E2E para el flujo admin

---

## 📁 Estructura del Módulo Admin

```
src/
├── pages/admin/
│   ├── dashboard.astro      # Panel con estadísticas globales
│   ├── users.astro          # CRUD usuarios (lista global)
│   ├── clients.astro        # Vista filtrada de clientes
│   ├── trainers.astro       # Vista filtrada de entrenadores
│   ├── chat.astro           # Bandeja de chat con usuarios
│   └── settings.astro       # Configuración del sistema
├── lib/admin/               # Servicios modulares
│   ├── types.ts             # AdminUser, CreateUserPayload
│   ├── adminAuth.ts         # requireAdmin, signOutUser
│   ├── adminUsers.ts        # CRUD usuarios
│   ├── adminSubscriptions.ts # Suscripciones Firestore
│   ├── adminRender.ts       # Renderizado HTML
│   ├── adminInit.ts         # initGlobalActions, initAdminActions
│   └── adminUtils.ts        # Barrel (re-exporta todo)
├── layouts/
│   └── AdminLayout.astro    # Layout con guardia admin
```

---

## 🗄️ Colecciones Firestore

| Colección | Operaciones | Permisos |
|-----------|-------------|----------|
| `users` | CRUD completo | Solo admin |

### Campos de `users` relevantes para admin
- `role`: `"admin" | "trainer" | "client"`
- `assignedTrainerId`: string | null (para clientes)
- `isBlocked`: boolean
- `blockedAt`: Timestamp | null
- `createdAt`, `updatedAt`: Timestamp

---

## 🔄 Flujo de Trabajo

### 1. Diagnóstico Inicial
```bash
npm run doctor
cat agents/__master.md
cat agents/admin-agent/TASKS.md
```

### 2. Desarrollo
1. Leer GUIDE.md y TASKS.md
2. Revisar TODO.md items de admin
3. Implementar cambios
4. Tests unitarios (éxito, error, edge case)
5. Validar: `npm run type-check && npm test`
6. Commit siguiendo conventional commits

---

## 📚 Referencias

- `agents/__master.md` - Registro maestro de agentes
- `AGENTS_GUIDE.md` - Guía completa del harness
- `TODO.md` - TODO centralizado
- `tests/unit/lib/admin/` - Tests existentes del módulo admin
- `nuevo_proyecto/10_modulo_administracion.md` - Documentación del módulo

---

> **Última actualización:** 2026-07-25