# 🎨 Diseño de UX: Calendario de Rutinas y Comidas

> **Estado:** 🔍 Análisis de Diseño (Fase de Definición)
> **Objetivo:** Definir la experiencia de usuario de alta calidad para la nueva funcionalidad de calendario.

---

## 🎯 Filosofía de Diseño
El calendario no es solo una lista; es la **hoja de ruta del éxito** del cliente. Debe sentirse como un "asistente personal" que le dice qué hacer a continuación, en lugar de una base de datos estática.

## 📍 1. Ubicación y Navegación (Arquitectura de Información)

### 1.1 Punto de Entrada
- **Dashboard**: El widget principal de "Progreso Diario" debe tener un botón de acción directo: *"Ver mi agenda de hoy"*.
- **Navegación**: Una nueva ruta `/client/calendar` dedicada, accesible desde la barra lateral principal.

### 1.2 Jerarquía Visual
- **Vista de Hoy**: Es la vista por defecto. Debe mostrar los bloques de tiempo de forma clara.
- **Vista de Semana**: Opción secundaria para planificación a largo plazo.

---

## 🎨 2. Interfaz de Usuario (UI) y Experiencia (UX)

### 2.1 La "Grilla de Tiempo" (Time Grid)
- **Eje Y (Tiempo)**: Bloques de 30 minutos (ej: 08:00, 08:30, 09:00...).
- **Eje X (Actividad)**: Los bloques de comida y entrenamiento se "anclan" a la hora estimada.
- **Bloques Huérfanos**: Si una comida no tiene hora, aparecerá en una sección inferior llamada *"Pendientes del día"* con un icono de reloj 🕒.

### 2.2 Interacciones Clave (Simplicidad)
- **Selección de Hora**: Al hacer clic en una comida "huérfana", aparece un selector de hora minimalista. Al seleccionar, el bloque se desliza automáticamente a su posición en la grilla.
- **Marcado de Completado**: Cada bloque tendrá un icono de "check". Al pulsarlo, el bloque debe cambiar de opacidad y color (ej. de 60% a 100% de intensidad) para dar sensación de logro.
- **Drag & Drop (Opcional/V2)**: Permitir arrastrar bloques de comida para cambiar su orden o tiempo estimado.

### 2.3 Estética y Feedback
- **Colores**:
  - 🟢 **Comidas**: Verde suave / Ámbar.
  - 🔵 **Entrenamientos**: Azul cobalto.
  - ⚪ **Completado**: Gris neutro con un check verde.
- **Micro-interacciones**: Animaciones de entrada suave (fade-in) para los bloques cuando se cargan por primera vez.

---

## ⚙️ 3. Especificaciones Técnicas Profesionales

### 3.1 Rendimiento (Percepción de Velocidad)
- **Optimistic Updates**: El frontend debe actualizar el estado local de `isCompleted` inmediatamente después del clic del usuario, sin esperar la respuesta de `updateDoc`.
- **SWR (Stale-While-Revalidate)**: Usar nanostores para mantener el estado en memoria y evitar múltiples llamadas a la DB para el mismo objeto.

### 3.2 Manejo de Errores
- Si una actualización falla, el bloque debe "parpadear" en rojo y mostrar un pequeño banner de error: *"No se pudo guardar el cambio, intenta de nuevo"*.

### 3.3 Accesibilidad (WCAG 2.1 AA)
- **Contraste**: Asegurar que el texto sobre los bloques de color cumpla con el ratio de contraste.
- **Lectores de pantalla**: Cada bloque debe tener un `aria-label` descriptivo (ej: *"Almuerzo - Pollo con quinua - 13:30 horas"*).

---

## 🗺️ Mapa de Flujo de Usuario
1. Cliente entra a `/client/calendar`.
2. El sistema carga los datos de `diets` y `workouts` para el día actual.
3. El usuario ve su agenda organizada por hora.
4. El usuario selecciona una hora para la "Merienda" -> El bloque se mueve a las 17:00.
5. El usuario termina su almuerzo -> Pulsa el check -> El bloque se marca como completado.
6. El entrenador ve en tiempo real el progreso del cliente.
