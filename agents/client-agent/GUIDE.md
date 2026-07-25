# 👤 Client Agent Guide

> **Guía optimizada para el Agente de Cliente IA** — Contexto, reglas, páginas, servicios y funcionalidades del módulo Cliente en CampFit.

---

## 🎯 Rol y Responsabilidades

**Encargado del módulo Cliente.** Responsable de mantener, mejorar y testear las páginas, servicios y lógica de negocio del cliente final en la plataforma CampFit.

### Áreas clave
- **Páginas cliente:** Dashboard, workouts, diets, progress, chat, support, settings, medical-profile
- **Servicios cliente:** chatService, dietService, progressService, workoutService, onboardingService, achievementsService, adherenceService, calendarService
- **Layout principal:** ClientLayout.astro
- **Layout compartido:** BaseLayout.astro

---

## 📁 Mapa del Módulo Cliente

```
campfit-astro/
├── src/
│   ├── pages/client/              # Páginas del cliente
│   │   ├── dashboard.astro        # Resumen semanal + widgets
│   │   ├── workouts.astro         # Rutinas de entrenamiento
│   │   ├── diets.astro            # Plan nutricional
│   │   ├── progress.astro         # Progreso (peso, medidas, fotos)
│   │   ├── chat.astro             # Chat con el entrenador
│   │   ├── support.astro          # Soporte / ayuda
│   │   ├── settings.astro         # Configuración del perfil
│   │   └── medical-profile.astro  # Perfil médico
│   ├── lib/client/                # Servicios del módulo cliente
│   │   ├── chatService.ts         # Mensajería en tiempo real
│   │   ├── dietService.ts         # Planes nutricionales
│   │   ├── progressService.ts     # Registro de progreso
│   │   ├── workoutService.ts      # Rutinas de entrenamiento
│   │   ├── clientInit.ts          # Inicialización del módulo
│   │   ├── achievementsService.ts # Logros y badges (TODO próximo)
│   │   ├── adherenceService.ts    # Seguimiento adherencia (TODO próximo)
│   │   ├── onboardingService.ts   # Onboarding inicial
│   │   └── calendarService.ts     # Calendario (TODO próximo)
│   ├── lib/shared/                # Servicios compartidos
│   │   ├── profileService.ts      # Perfil de usuario
│   │   ├── chat.ts                # Utilidades de chat
│   │   ├── authGuard.ts           # Guardia de autenticación
│   │   ├── ui.ts                  # Utilidades de UI
│   │   ├── i18n.ts                # Internacionalización
│   │   └── logger.ts              # Logger
│   └── layouts/
│       └── ClientLayout.astro     # Layout del panel cliente
│
├── tests/unit/lib/client/         # Tests unitarios del módulo
│   ├── chatService.test.ts
│   ├── dietService.test.ts
│   ├── progressService.test.ts
│   └── workoutService.test.ts
└── tests/e2e/                     # Tests E2E
    └── client/                    # Flujos del cliente
```

---

## 🔥 Colecciones Firestore

| Colección | Uso en cliente | Lectura | Escritura |
|-----------|---------------|---------|-----------|
| workouts | Rutinas asignadas | Cliente asignado | Solo lectura |
| diets | Plan nutricional | Cliente asignado | Solo lectura |
| messages | Chat con entrenador | Participantes | Enviar mensajes |
| progress_logs | Registro de progreso | Propio usuario | Propio usuario |
| users | Perfil propio + entrenador | Propio usuario | Propio usuario |
| exercises_library | Biblioteca ejercicios | Autenticados | Solo admin |
| diet_templates | Plantillas dietas | Autenticados | Solo admin |

---

## ✨ Funcionalidades Completadas

- [x] Dashboard personal con progreso semanal
- [x] Rutinas de entrenamiento asignadas por el trainer
- [x] Marcado de entrenamientos como completados
- [x] Plan nutricional con seguimiento de comidas
- [x] Registro de progreso (peso, medidas, fotos)
- [x] Chat directo con el entrenador
- [x] Notificaciones en tiempo real de mensajes nuevos en el chat
- [x] Perfil médico
- [x] Onboarding inicial

### TODO Próximo
- [ ] Sistema de logros y badges (achievementsService.ts)
- [ ] Calendario de entrenamientos (calendarService.ts)
- [ ] Seguimiento de adherencia (adherenceService.ts)

---

## 🧠 Arquitectura y Patrones

### Flujo de datos
```
Página .astro → Servicio (src/lib/client/) → Firestore → Stream reactivo → Render DOM
```

### SSR + Cliente
- Astro renderiza el layout y la shell de la página en SSR
- El JavaScript cliente se encarga de suscribirse a streams Firestore y renderizar datos dinámicos

### Estado de página (4 estados)
Cada página cliente debe manejar obligatoriamente 4 estados:

```typescript
type PageState = "loading" | "empty" | "error" | "success";
```

### Cleanup de suscripciones
Toda suscripción Firestore (onSnapshot) debe guardar su unsubscribe function y llamarla en el cleanup:

```typescript
const unsubscribes: (() => void)[] = [];

const unsub = onSnapshot(query, (snapshot) => {
  // manejar datos
});

unsubscribes.push(unsub);

// Cleanup
return () => unsubscribes.forEach((fn) => fn());
```

---

## 🔌 Referencias Rápidas

| Comando | Acción |
|---------|--------|
| npm run dev | Servidor desarrollo (localhost:4321) |
| npm test | Tests unitarios |
| npm run test:coverage | Tests con cobertura |
| npm run test:e2e | Tests E2E |
| npm run type-check | Verificar tipos TS |
| npm run doctor | Diagnóstico del proyecto |
| npm run validate | Validación completa pre-commit |
| bash scripts/agent-lock.sh acquire "client-agent" "feature-name" | Adquirir lock |

---

## 🤝 Dependencias con otros Agentes

| Agente | Dependencia |
|--------|-------------|
| Trainer Agent | Crea y asigna workouts/diets que el cliente consume |
| Testing Agent | Tests unitarios y E2E del módulo cliente |
| Theme Agent | Componentes UI, colores, estilos |
| Auth Agent | Guards de autenticación, roles |
| Language Agent | Traducciones i18n ES/EN |
| Infra Agent | Firestore rules, scripts, CI/CD |

---

> **Mantenido por:** Client Agent — CampFit
