# Roadmap 25: Admin Users & Role Management (`/admin/users`)

## 🎯 Objetivo General
Auditar la gestión centralizada de usuarios: asignación de roles (client, trainer, admin), asignación y reasignación de entrenadores a clientes, y bloqueo/desbloqueo de cuentas.

---

## 📋 Lista de Tareas

### 🟢 Tarea 25.1: Tabla de Usuarios con Filtros & Búsqueda
- **Estado:** `[COMPLETADO]`
- **Descripción:** Búsqueda por email o nombre, filtrado por rol y estado de cuenta.
- **Archivos:** `src/pages/admin/users.astro`.

### 🟢 Tarea 25.2: Asignación de Entrenador a Alumno
- **Estado:** `[COMPLETADO]`
- **Descripción:** Modal para vincular a un cliente con un entrenador disponible, actualizando `assignedTrainerId` en Firestore.
- **Archivos:** `src/pages/admin/users.astro`, `src/lib/admin/trainerAssignment.ts`.

### 🟢 Tarea 25.3: Bloqueo & Cambio de Rol Seguro
- **Estado:** `[COMPLETADO]`
- **Descripción:** Gestión de permisos con prevención de auto-despromoción del administrador bootstrap.
- **Archivos:** `src/pages/admin/users.astro`, `src/lib/admin/adminUtils.ts`.
