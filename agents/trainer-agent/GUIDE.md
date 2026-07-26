# 🏋️ Trainer Agent Guide

> **Guía para el Agente de Entrenadores IA** — Rol, alcance, contexto y operaciones del módulo de entrenadores de CampFit.

---

## 🎯 Rol y Responsabilidades

**Rol:** Encargado del módulo de Entrenadores del sistema CampFit. Responsable de páginas, servicios y lógica de trainers.

**Responsabilidades:**
- Mantener y evolucionar las páginas del panel trainer (`src/pages/trainer/`)
- Desarrollar y mantener los servicios modulares (`src/lib/trainer/`)
- Gestionar CRUD de workouts y diets con validación
- Chat trainer ↔ client con suscripción a conversaciones
- Visualizar progreso de clientes con datos históricos
- Asegurar que un trainer solo vea sus clientes asignados
- Escribir tests unitarios (cobertura >80%) y E2E

---

## 📁 Estructura del Módulo Trainer

```
src/
├── pages/trainer/
│   ├── dashboard.astro      # Vista general del trainer
│   ├── clients.astro        # Lista de clientes asignados
│   ├── workouts.astro       # Gestión de rutinas
│   ├── diets.astro          # Gestión de dietas
│   ├── chat.astro           # Chat con clientes
│   └── settings.astro       # Configuración del trainer
├── lib/trainer/
│   ├── types.ts             # TrainerClient, Workout, Diet, etc.
│   ├── trainerAuth.ts       # requireAuth, signOutUser
│   ├── trainerClients.ts    # Clientes del trainer
│   ├── trainerWorkouts.ts   # CRUD rutinas
│   ├── trainerDiets.ts      # CRUD dietas
│   ├── trainerProgress.ts   # Progreso de clientes
│   ├── trainerChat.ts       # Mensajería
│   ├── trainerRender.ts     # Renderizado HTML
│   ├── trainerInit.ts       # initGlobalActions
│   └── trainerUtils.ts      # Barrel (re-exporta todo)
├── layouts/
│   └── TrainerLayout.astro  # Layout con bottom nav
```

---

## 🗄️ Colecciones Firestore

| Colección | Operaciones | Filtro |
|-----------|-------------|--------|
| `users` | Lectura | `assignedTrainerId == trainerUid` |
| `workouts` | CRUD | `trainerId` o `clientId` |
| `diets` | CRUD | `trainerId` o `clientId` |
| `messages` | Lectura/escritura | `conversationId` |
| `progress_logs` | Lectura | `clientId` |

---

## 🔄 Flujo de Trabajo

```bash
# Diagnóstico
npm run doctor
cat agents/__master.md
cat agents/trainer-agent/TASKS.md

# Desarrollo
# 1. Implementar cambios
# 2. Tests: npm test
# 3. Validar: npm run type-check
# 4. Commit
```

---

> **Última actualización:** 2026-07-25