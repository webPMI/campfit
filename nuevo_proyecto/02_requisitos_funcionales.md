# 📋 Requisitos Funcionales - CampFit 2.0

## Actores del Sistema

| Actor | Descripción |
|-------|-------------|
| **Admin (Seba)** | Dueño del negocio. Acceso total a todas las funcionalidades. |
| **Trainer** | (Fase futura) Entrenador con clientes asignados. Sin acceso global. |
| **Client (Alumno)** | Usuario final. Ve sus planes, registra progreso, chatea. |
| **Visitante** | Usuario no autenticado. Solo puede acceder a login/register. |

---

## Módulo de Autenticación (RF-01)

| ID | Requisito | Actor | Prioridad |
|----|-----------|-------|-----------|
| RF-01.1 | El sistema debe permitir registro con email y contraseña | Visitante | Alta |
| RF-01.2 | El sistema debe permitir inicio de sesión con email/contraseña | Todos | Alta |
| RF-01.3 | El sistema debe permitir recuperación de contraseña | Todos | Alta |
| RF-01.4 | El sistema debe redirigir al perfil médico en el primer login del cliente | Client | Alta |
| RF-01.5 | El sistema debe redirigir al dashboard según el rol tras login | Todos | Alta |
| RF-01.6 | El sistema debe cerrar sesión y limpiar el estado local | Todos | Alta |
| RF-01.7 | El sistema debe persistir la sesión (token refresh) | Todos | Media |

---

## Módulo de Perfil Médico (RF-02)

| ID | Requisito | Actor | Prioridad |
|----|-----------|-------|-----------|
| RF-02.1 | El cliente debe completar un formulario médico en su primer acceso | Client | Alta |
| RF-02.2 | El formulario debe incluir: alergias, lesiones, condiciones médicas, objetivos | Client | Alta |
| RF-02.3 | El cliente no puede acceder al dashboard hasta completar el perfil | Client | Alta |
| RF-02.4 | El admin puede ver y editar el perfil médico de cualquier cliente | Admin | Alta |
| RF-02.5 | El perfil médico debe ser consultable por el sistema de validación de planes | Sistema | Alta |

---

## Módulo de Dashboard del Cliente (RF-03)

| ID | Requisito | Actor | Prioridad |
|----|-----------|-------|-----------|
| RF-03.1 | El dashboard debe mostrar el progreso de la rutina semanal | Client | Alta |
| RF-03.2 | El dashboard debe mostrar la adherencia a la dieta del día | Client | Alta |
| RF-03.3 | El dashboard debe tener un acceso directo a "Entrenamiento de hoy" | Client | Alta |
| RF-03.4 | El dashboard debe tener un acceso directo a "Próxima comida" | Client | Alta |
| RF-03.5 | El dashboard debe mostrar estadísticas: peso actual, calorías, RPE promedio | Client | Media |
| RF-03.6 | El dashboard debe actualizarse en tiempo real con Firestore streams | Client | Alta |

---

## Módulo de Rutinas (RF-04)

| ID | Requisito | Actor | Prioridad |
|----|-----------|-------|-----------|
| RF-04.1 | El cliente debe poder ver su rutina organizada por días de la semana | Client | Alta |
| RF-04.2 | Cada ejercicio debe mostrar: nombre, series, repeticiones, descanso | Client | Alta |
| RF-04.3 | Cada ejercicio debe tener un video demostrativo (Cloudflare R2) | Client | Alta |
| RF-04.4 | El cliente debe poder marcar la rutina como completada | Client | Alta |
| RF-04.5 | Al completar, debe registrar el RPE (esfuerzo percibido 1-10) | Client | Alta |
| RF-04.6 | El admin debe poder crear rutinas desde una biblioteca de ejercicios | Admin | Alta |
| RF-04.7 | El admin debe poder asignar rutinas a clientes específicos | Admin | Alta |
| RF-04.8 | El admin debe poder editar rutinas existentes | Admin | Alta |
| RF-04.9 | El sistema debe validar conflictos médicos al asignar ejercicios | Sistema | Alta |
| RF-04.10 | El admin debe poder gestionar una biblioteca de ejercicios reutilizable | Admin | Alta |

---

## Módulo de Dietas (RF-05)

| ID | Requisito | Actor | Prioridad |
|----|-----------|-------|-----------|
| RF-05.1 | El cliente debe poder ver su dieta organizada por comidas del día | Client | Alta |
| RF-05.2 | Cada comida debe mostrar: ingredientes, porciones, calorías | Client | Alta |
| RF-05.3 | El cliente debe poder marcar comidas como realizadas | Client | Alta |
| RF-05.4 | El dashboard debe mostrar el desglose de macros (proteinas, carbs, grasas) | Client | Media |
| RF-05.5 | El admin debe poder crear dietas desde plantillas por somatotipo | Admin | Alta |
| RF-05.6 | El admin debe poder asignar dietas a clientes específicos | Admin | Alta |
| RF-05.7 | El admin debe poder personalizar la dieta copiada al cliente sin afectar la plantilla | Admin | Alta |
| RF-05.8 | El sistema debe validar alergias/intolerancias al asignar alimentos | Sistema | Alta |
| RF-05.9 | El admin debe poder gestionar plantillas de dieta reutilizables | Admin | Alta |

---

## Módulo de Progreso (RF-06)

| ID | Requisito | Actor | Prioridad |
|----|-----------|-------|-----------|
| RF-06.1 | El cliente debe poder registrar su peso corporal manualmente | Client | Alta |
| RF-06.2 | El sistema debe mostrar un gráfico de evolución del peso | Client | Alta |
| RF-06.3 | El cliente debe poder subir fotos de progreso (frontal, perfil, espalda) | Client | Alta |
| RF-06.4 | Las fotos deben almacenarse en Cloudflare R2 | Sistema | Alta |
| RF-06.5 | El cliente debe poder ver su galería de fotos de progreso | Client | Media |
| RF-06.6 | El admin debe poder ver el historial de peso de cualquier cliente | Admin | Alta |
| RF-06.7 | El admin debe poder ver la comparativa de fotos de cualquier cliente | Admin | Alta |
| RF-06.8 | El sistema debe calcular el % de adherencia semanal (rutinas + comidas) | Sistema | Alta |

---

## Módulo de Chat (RF-07)

| ID | Requisito | Actor | Prioridad |
|----|-----------|-------|-----------|
| RF-07.1 | El cliente debe poder chatear 1:1 con el entrenador | Client | Alta |
| RF-07.2 | El admin debe tener una bandeja de entrada con todos los chats | Admin | Alta |
| RF-07.3 | Los mensajes deben ser en tiempo real (Firestore streams) | Todos | Alta |
| RF-07.4 | El admin debe poder enviar "Llamados de Atención" (alertas) | Admin | Alta |
| RF-07.5 | El cliente debe ver un banner rojo persistente cuando hay una alerta activa | Client | Alta |
| RF-07.6 | El cliente debe poder marcar la alerta como leída | Client | Alta |
| RF-07.7 | La bandeja del admin debe mostrar badges de mensajes no leídos | Admin | Alta |
| RF-07.8 | La bandeja del admin debe tener filtros: todos, no leídos, con alertas | Admin | Media |

---

## Módulo de Soporte Automático (RF-08)

| ID | Requisito | Actor | Prioridad |
|----|-----------|-------|-----------|
| RF-08.1 | El cliente debe tener acceso a un chatbot de soporte | Client | Media |
| RF-08.2 | El chatbot debe responder FAQs sobre uso de la app | Client | Media |
| RF-08.3 | El chatbot debe responder preguntas básicas de fitness/nutrición | Client | Media |
| RF-08.4 | Si el chatbot no resuelve, debe escalar al chat con el entrenador | Client | Media |

---

## Módulo de Administración (RF-09)

| ID | Requisito | Actor | Prioridad |
|----|-----------|-------|-----------|
| RF-09.1 | El admin debe tener un panel con resumen de la plataforma | Admin | Alta |
| RF-09.2 | El admin debe poder ver y gestionar todos los usuarios | Admin | Alta |
| RF-09.3 | El admin debe poder cambiar roles de usuarios | Admin | Alta |
| RF-09.4 | El admin debe poder asignar entrenadores a clientes | Admin | Alta |
| RF-09.5 | El admin debe tener un dashboard tipo semáforo de adherencia | Admin | Alta |
| RF-09.6 | El admin debe poder ver el progreso de cualquier cliente | Admin | Alta |
| RF-09.7 | El admin debe tener acceso a todos los chats | Admin | Alta |

---

## Matriz de Cobertura por Rol

| Funcionalidad | Visitante | Client | Trainer | Admin |
|--------------|-----------|--------|---------|-------|
| Login/Register | ✅ | ❌ | ❌ | ❌ |
| Perfil Médico | ❌ | ✅ | ❌ | ✅ |
| Dashboard | ❌ | ✅ | ✅ | ✅ |
| Ver Rutinas | ❌ | ✅ | ✅ | ✅ |
| Ver Dietas | ❌ | ✅ | ✅ | ✅ |
| Registrar Progreso | ❌ | ✅ | ❌ | ❌ |
| Chat 1:1 | ❌ | ✅ | ✅ | ✅ |
| Chatbot Soporte | ❌ | ✅ | ❌ | ❌ |
| Crear/Editar Planes | ❌ | ❌ | ✅ | ✅ |
| Gestionar Usuarios | ❌ | ❌ | ❌ | ✅ |
| Ver Progreso Ajeno | ❌ | ❌ | ✅ | ✅ |
| Gestionar Biblioteca | ❌ | ❌ | ❌ | ✅ |
