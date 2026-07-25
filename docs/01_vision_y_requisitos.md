# 🎯 Visión y Requisitos del Sistema - CampFit

## 1. Visión del Producto
CampFit es una plataforma fitness todo-en-uno que conecta de manera directa a clientes con entrenadores personales. Facilita la asignación, seguimiento y optimización de planes de entrenamiento y nutrición inteligente en tiempo real, mejorando la adherencia y los resultados mediante una interfaz limpia, interactiva y reactiva.

## 2. Objetivos Estratégicos
*   **Adherencia:** Facilitar que el cliente registre su peso, comidas y rutinas con pocos clics para mantener la consistencia.
*   **Eficiencia:** Permitir que un solo entrenador funcione con decenas de clientes mediante plantillas de dietas y rutinas.
*   **Seguimiento:** Alertar al administrador y al entrenador de forma proactiva si hay inactividad o desvíos del plan de un cliente.

---

## 3. Requisitos Funcionales por Rol

### A. Cliente (`client`)
*   **Onboarding:** Formulario obligatorio al registrarse para crear su perfil médico básico (edad, altura, peso inicial, experiencia, objetivos, alergias, lesiones).
*   **Dashboard:** Visualización del progreso de la rutina semanal, adherencia a la dieta diaria, estadísticas rápidas (último peso, calorías, RPE promedio, días activos) y accesos rápidos.
*   **Rutinas:** Visualizar la rutina actual asignada por su entrenador y marcar cada ejercicio como completado.
*   **Nutrición:** Visualizar su plan de comidas diario con macros y marcar comidas individuales como ingeridas.
*   **Progreso:** Historial de registros de peso diario.
*   **Chat:** Canal de comunicación directa con su entrenador asignado.

### B. Entrenador (`trainer`)
*   **Gestión de Clientes:** Listado de clientes asignados con estado de alertas y accesos rápidos a sus perfiles.
*   **Creador de Planes:** Interfaces para crear y asignar rutinas de ejercicios detalladas y planes de alimentación por comidas.
*   **Chat de Clientes:** Bandeja de mensajería con soporte de "Llamados de atención" (alertas manuales).

### C. Administrador (`admin`)
*   **Dashboard Global:** Estadísticas consolidadas de usuarios, rutinas, dietas y alertas activas en el sistema.
*   **Control de Usuarios:** DataTable para buscar, filtrar por rol, editar perfiles, enviar emails de recuperación, bloquear/desbloquear accesos y eliminar cuentas.
*   **Asignación de Roles:** Permisos únicos para promover usuarios a entrenadores o administradores.
