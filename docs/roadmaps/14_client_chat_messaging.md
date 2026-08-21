# Roadmap 14: Client Chat & Messaging (`/client/chat`)

## 🎯 Objetivo General
Auditar la mensajería directa en tiempo real entre cliente y entrenador, empty states amigables cuando no hay coach asignado y soporte para notificaciones/adjuntos.

---

## 📋 Lista de Tareas

### 🟢 Tarea 14.1: Mensajería en Tiempo Real con Entrenador
- **Estado:** `[COMPLETADO]`
- **Descripción:** Suscripción reactiva mediante `onSnapshot` a `chat_messages` con auto-scroll y burbujas estilizadas.
- **Archivos:** `src/pages/client/chat.astro`, `src/lib/trainer/trainerChat.ts`.

### 🟢 Tarea 14.2: Empty State para Alumnos Sin Coach
- **Estado:** `[COMPLETADO]`
- **Descripción:** Cuando no hay entrenador asignado, muestra un hub informativo con accesos rápidos a la biblioteca técnica y solicitud de soporte.
- **Archivos:** `src/pages/client/chat.astro`.
