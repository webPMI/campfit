# 🎯 Visión y Requisitos del Sistema - CampFit

> **Última actualización:** 2026-07-31  
> **Estado:** Consolidado en `docs/MASTER.md` (sección 1)

---

## 📑 Índice

1. [Visión del Producto](#1-visión-del-producto)
2. [Objetivos Estratégicos](#2-objetivos-estratégicos)
3. [Requisitos Funcionales por Rol](#3-requisitos-funcionales-por-rol)

---

## 1. Visión del Producto

CampFit es una plataforma fitness todo-en-uno que conecta de manera directa a clientes con entrenadores personales. Facilita la asignación, seguimiento y optimización de planes de entrenamiento y nutrición inteligente en tiempo real, mejorando la adherencia y los resultados mediante una interfaz limpia, interactiva y reactiva.

### Propuesta de Valor

- **Conexión Directa:** Clientes y entrenadores se comunican sin intermediarios
- **Seguimiento en Tiempo Real:** Actualizaciones instantáneas de rutinas, dietas y progreso
- **Interfaz Intuitiva:** Diseño mobile-first con modo oscuro por defecto
- **Accesibilidad:** Cumplimiento WCAG 2.1 AA

---

## 2. Objetivos Estratégicos

### 2.1 Adherencia
**Meta:** Facilitar que el cliente registre su peso, comidas y rutinas con pocos clics para mantener la consistencia.

**Indicadores:**
- Tiempo de registro de peso < 30 segundos
- Tiempo de marcado de comida < 10 segundos
- Tiempo de completado de rutina < 2 minutos

### 2.2 Eficiencia
**Meta:** Permitir que un solo entrenador funcione con decenas de clientes mediante plantillas de dietas y rutinas.

**Indicadores:**
- Ratio entrenador/clientes: 1/50
- Tiempo de creación de rutina: < 15 minutos
- Reutilización de plantillas: > 70%

### 2.3 Seguimiento
**Meta:** Alertar al administrador y al entrenador de forma proactiva si hay inactividad o desvíos del plan de un cliente.

**Indicadores:**
- Detección de inactividad: 3 días sin registro
- Alertas automáticas por desviación de dieta: > 20%
- Tiempo de respuesta a alertas: < 24 horas

---

## 3. Requisitos Funcionales por Rol

### A. Cliente (`client`)

#### Onboarding y Perfil
- **Registro:** Formulario con name, email, password
- **Perfil Médico:** Edad, altura, peso inicial, experiencia, objetivos, alergias, lesiones
- **Validaciones:** Email válido, password 8+ caracteres con mayúscula y número

#### Dashboard
- **Vista General:** Progreso semanal de rutina, adherencia a dieta
- **Estadísticas Rápidas:** Último peso, calorías consumidas, RPE promedio, días activos
- **Accesos Rápidos:** Entrenar hoy, ver dieta, registrar peso, chat

#### Rutinas
- **Visualización:** Rutina actual asignada por día de la semana
- **Ejercicios:** Nombre, series, repeticiones, tiempo de descanso
- **Completado:** Marcar ejercicios como completados
- **RPE:** Modal de esfuerzo percibido (1-10) al finalizar

#### Nutrición
- **Plan Diario:** Comidas organizadas por horario
- **Macros:** Proteínas, carbohidratos, grasas por comida
- **Adherencia:** Porcentaje de comidas completadas
- **Marcado:** Checkbox por comida para marcar como ingerida

#### Progreso
- **Peso:** Historial con gráfico de evolución temporal
- **Fotos:** Galería con drag-and-drop
- **Registro:** Input de peso con fecha automática

#### Chat
- **Mensajería:** Chat 1:1 con entrenador asignado
- **Alertas:** Llamados de atención del entrenador
- **Historial:** Stream en tiempo real

#### Soporte
- **FAQs:** Preguntas frecuentes predefinidas
- **Escalamiento:** Redirección a chat con entrenador si no hay respuesta

---

### B. Entrenador (`trainer`)

#### Gestión de Clientes
- **Listado:** Clientes asignados con búsqueda en tiempo real
- **Ficha Médica:** Visualización de datos clínicos (alergias, lesiones, objetivos)
- **Estado:** Alertas activas y días sin actividad

#### Creador de Planes
- **Rutinas:**
  - Nombre, dificultad, descripción
  - Ejercicios: nombre, series, reps, descanso, video URL
  - Asignación a cliente específico

- **Dietas:**
  - Nombre, calorías totales, somatotipo
  - Comidas: nombre, hora, calorías, macros (P/C/G)
  - Asignación por tipo de cuerpo

#### Chat
- **Bandeja:** Mensajes de todos los clientes asignados
- **Alertas:** Envío de llamados de atención
- **Historial:** Stream en tiempo real por conversación

#### Dashboard
- **Estadísticas:** Total alumnos, rutinas creadas, dietas creadas
- **Alertas:** Lista de clientes con alertas activas
- **Mensajes:** Chats con mensajes no leídos

---

### C. Administrador (`admin`)

#### Dashboard Global
- **Usuarios:** Total, por rol, activos/inactivos
- **Contenido:** Rutinas, dietas, mensajes, progresos
- **Alertas:** Alertas activas en el sistema

#### Gestión de Usuarios
- **CRUD:** Crear, leer, actualizar, eliminar usuarios
- **Búsqueda:** Por nombre, email, rol
- **Filtros:** Por rol (admin, trainer, client)
- **Acciones:**
  - Editar perfil (nombre, email, rol)
  - Enviar alerta a cliente
  - Resetear contraseña
  - Bloquear/desbloquear acceso
  - Eliminar cuenta

#### Asignación de Roles
- **Promoción:** Cliente → Trainer, Trainer → Admin
- **Validación:** Solo administradores pueden cambiar roles
- **Auditoría:** Registro de cambios de rol

#### Supervisión
- **Rutinas:** Vista global de todas las rutinas del sistema
- **Dietas:** Vista global de todas las dietas
- **Progreso:** Monitoreo de peso y fotos de todos los clientes
- **Chat:** Supervisión de conversaciones

#### Configuración
- **Perfil:** Datos del administrador
- **Preferencias:** Idioma, tema, notificaciones
- **Sistema:** Versión, exportar datos, limpiar caché

---

## 📊 Matriz de Funcionalidades

| Funcionalidad | Cliente | Entrenador | Admin |
|--------------|---------|------------|-------|
| Ver rutina asignada | ✅ | ✅ | ✅ |
| Completar rutina | ✅ | ❌ | ❌ |
| Ver dieta asignada | ✅ | ✅ | ✅ |
| Marcar comida | ✅ | ❌ | ❌ |
| Registrar peso | ✅ | ❌ | ❌ |
| Subir fotos | ✅ | ❌ | ❌ |
| Chat 1:1 | ✅ | ✅ | ❌ |
| Enviar alerta | ❌ | ✅ | ✅ |
| Crear rutina | ❌ | ✅ | ✅ |
| Crear dieta | ❌ | ✅ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |
| Cambiar roles | ❌ | ❌ | ✅ |
| Ver estadísticas globales | ❌ | ❌ | ✅ |

---

## 🎯 Historias de Usuario

### Como Cliente
- Quiero registrar mi peso diariamente para ver mi progreso
- Quiero marcar mis comidas para mantener la adherencia
- Quiero ver mi rutina del día para saber qué ejercicios hacer
- Quiero marcar mi rutina como completada para registrar mi esfuerzo
- Quiero chatear con mi entrenador para resolver dudas
- Quiero ver mi evolución en gráficos para motivarme

### Como Entrenador
- Quiero ver mis clientes asignados para gestionarlos
- Quiero crear rutinas personalizadas para cada cliente
- Quiero crear dietas adaptadas al somatotipo
- Quiero enviar alertas a clientes inactivos
- Quiero ver el progreso de mis clientes para ajustar planes
- Quiero chatear con mis clientes para resolver dudas

### Como Administrador
- Quiero ver estadísticas globales para tomar decisiones
- Quiero gestionar usuarios para mantener el sistema
- Quiero asignar roles para controlar accesos
- Quiero supervisar contenido para asegurar calidad
- Quiero enviar alertas para mantener el orden
- Quiero configurar el sistema para optimizar rendimiento

---

## 📈 Métricas de Éxito

### Técnicas
- **Performance:** Tiempo de carga < 2s en 3G
- **Disponibilidad:** 99.9% uptime
- **Tests:** Cobertura > 80%
- **Accesibilidad:** WCAG 2.1 AA compliance

### Negocio
- **Adherencia:** > 75% de comidas registradas
- **Retención:** > 60% a 3 meses
- **Satisfacción:** NPS > 50
- **Engagement:** > 3 sesiones por semana

---

## 🔗 Referencias

- **Documentación Maestra:** `docs/MASTER.md` (sección 1)
- **Stack Tecnológico:** `docs/MASTER.md` (sección 2)
- **Modelo de Datos:** `docs/MASTER.md` (sección 3)
- **Flujos de Navegación:** `docs/04_flujos_navegacion.md`

---

**Documento creado:** 2026-06-13  
**Última actualización:** 2026-07-31  
**Mantenido por:** Equipo CampFit