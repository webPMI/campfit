# 🌐 Flujos de Navegación - CampFit 2.0

## Estructura de Rutas

```
/                              # Landing / Redirección según auth
│
├── /login                     # 🔐 Inicio de sesión
├── /register                  # Registro de nuevo usuario
├── /recover                   # Recuperación de contraseña
├── /onboarding                # Onboarding post-registro
│
├── /client/                   # 👤 Panel del Cliente
│   ├── /client/dashboard      # Resumen diario del cliente
│   ├── /client/medical-profile # Perfil médico (onboarding obligatorio)
│   ├── /client/workouts       # Visualizador de rutinas
│   ├── /client/diets          # Visualizador de dietas
│   ├── /client/progress       # Progreso (peso + fotos)
│   ├── /client/chat           # Chat 1:1 con entrenador
│   ├── /client/support        # Chatbot de soporte
│   └── /client/settings       # Configuración del cliente
│
├── /admin/                    # ⚙️ Panel del Administrador
│   ├── /admin/dashboard       # Dashboard de administración
│   ├── /admin/users           # Gestión de usuarios
│   ├── /admin/clients         # Lista de clientes
│   ├── /admin/trainers        # Lista de entrenadores
│   └── /admin/settings        # Configuración del sistema
│
└── /trainer/                  # 🏋️ Panel del Entrenador
    ├── /trainer/dashboard     # Dashboard del entrenador
    ├── /trainer/clients       # Gestión de clientes asignados
    ├── /trainer/workouts      # Gestión de rutinas
    ├── /trainer/diets         # Gestión de dietas
    ├── /trainer/chat          # Chat con clientes
    └── /trainer/settings      # Configuración del entrenador
```

---

## Flujo de Autenticación

```
                    ┌─────────────┐
                    │  Visitante  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  /login     │
                    │  /register  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  ¿Auth OK?  │
                    └──┬──────┬───┘
                  No   │      │  Sí
              ┌────────┘      └──────────┐
              │                           │
     ┌────────▼────────┐       ┌─────────▼──────────┐
     │ Redirigir a     │       │  Obtener rol desde  │
     │ /login          │       │  Firestore (users)  │
     └─────────────────┘       └─────────┬───────────┘
                                          │
                              ┌───────────▼───────────┐
                              │   Evaluar rol del     │
                              │   usuario             │
                              └───┬───────┬───────┬───┘
                                  │       │       │
                          admin   │  client│       │ trainer
                          ┌───────┘       │       └────────┐
                          │               │                │
                   ┌──────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐
                   │  /admin/*   │  │ ¿Tiene     │  │  /trainer/*│
                   │             │  │ perfil     │  │            │
                   │             │  │ médico?    │  │            │
                   └─────────────┘  └──┬──────┬──┘  └────────────┘
                                     No│      │Sí
                              ┌────────┘      └──────────┐
                              │                           │
                       ┌──────▼──────┐           ┌───────▼──────┐
                       │  /client/   │           │  /client/    │
                       │  medical-   │           │  dashboard   │
                       │  profile    │           │              │
                       └─────────────┘           └──────────────┘
```

---

## Flujo del Cliente

```
                    ┌─────────────────┐
                    │  /client/       │
                    │  dashboard      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌──────▼──────┐  ┌────▼──────┐
     │ "Entrenar  │  │ "Próxima    │  │ Estadíst. │
     │  hoy"      │  │  comida"    │  │ rápidas   │
     └────────┬───┘  └──────┬──────┘  └────┬──────┘
              │             │              │
     ┌────────▼───┐  ┌──────▼──────┐       │
     │ /client/   │  │ /client/    │       │
     │ workouts   │  │ diets       │       │
     └────────┬───┘  └──────┬──────┘       │
              │             │              │
              └──────┬──────┘              │
                     │                     │
            ┌────────▼────────┐            │
            │  Navegación     │            │
            │  Inferior       │            │
            │  (Bottom Nav)   │            │
            └──┬────┬────┬───┘            │
               │    │    │                │
      ┌────────┘    │    └────────┐       │
      │             │             │       │
┌─────▼─────┐ ┌─────▼─────┐ ┌────▼──────┐│
│ /client/  │ │ /client/  │ │ /client/  ││
│ workouts  │ │ progress  │ │ chat      ││
└───────────┘ └───────────┘ └───────────┘│
                                          │
                              ┌───────────▼───────────┐
                              │  /client/support       │
                              │  (Chatbot FAQ)         │
                              └───────────────────────┘
```

### Bottom Navigation (Cliente)

| Icono | Ruta | Label |
|-------|------|-------|
| 🏠 | `/client/dashboard` | Inicio |
| 💪 | `/client/workouts` | Rutinas |
| 🥗 | `/client/diets` | Dietas |
| 📈 | `/client/progress` | Progreso |
| 💬 | `/client/chat` | Chat |

---

## Flujo del Administrador

```
                    ┌─────────────────┐
                    │  /admin/        │
                    │  dashboard      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│  /admin/users  │  │  /admin/       │  │  /admin/       │
│  Gestión       │  │  clients       │  │  trainers      │
│  usuarios      │  │  (clientes)    │  │  (entrenadores)│
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                   │                    │
        └───────────────────┼────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  /admin/       │
                    │  settings      │
                    │  Configuración │
                    └────────────────┘
```

### Sidebar Navigation (Admin)

| Icono | Ruta | Label |
|-------|------|-------|
| 📊 | `/admin/dashboard` | Dashboard |
| 👥 | `/admin/users` | Usuarios |
| 👤 | `/admin/clients` | Clientes |
| 🏋️ | `/admin/trainers` | Entrenadores |
| ⚙️ | `/admin/settings` | Configuración |

---

## Flujo del Entrenador

```
                    ┌─────────────────┐
                    │  /trainer/      │
                    │  dashboard      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│  /trainer/     │  │  /trainer/     │  │  /trainer/     │
│  clients       │  │  workouts      │  │  diets         │
│  (clientes)    │  │  (rutinas)     │  │  (dietas)      │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                   │                    │
        └───────────────────┼────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  /trainer/     │
                    │  chat          │
                    │  (bandeja)     │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │  /trainer/     │
                    │  settings      │
                    └────────────────┘
```

### Sidebar Navigation (Trainer)

| Icono | Ruta | Label |
|-------|------|-------|
| 📊 | `/trainer/dashboard` | Dashboard |
| 👥 | `/trainer/clients` | Clientes |
| 💪 | `/trainer/workouts` | Rutinas |
| 🥗 | `/trainer/diets` | Dietas |
| 💬 | `/trainer/chat` | Chat |
| ⚙️ | `/trainer/settings` | Configuración |

---

> **📌 Guardias de ruta:** Ver `08_modulo_autenticacion.md` para la implementación de guards (AuthGuard, RoleGuard).
> **📌 Manejo de estados (loading/empty/error/success):** Ver `14_agent_instructions.md` para el patrón de 4 estados en componentes.
