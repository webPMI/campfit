# 📖 Glosario de Términos - CampFit 2.0

Términos y conceptos clave del dominio de fitness y la aplicación.

---

## A

### Adherencia
Porcentaje de cumplimiento del plan de entrenamiento y nutrición. Se calcula semanalmente como: (ítems completados / ítems esperados) × 100.
- **Verde:** ≥ 90%
- **Amarillo:** 70-89%
- **Rojo:** < 70%

### Admin
Rol de usuario con acceso total al sistema. Actualmente solo Seba (dueño del negocio). Puede gestionar usuarios, crear planes, ver progreso de todos los clientes, y acceder a todos los chats.

---

## C

### Chat 1:1
Sistema de mensajería directa entre un cliente y su entrenador (admin). Los mensajes son en tiempo real usando Firestore streams.

### Client (Cliente/Alumno)
Rol de usuario que recibe planes de entrenamiento y nutrición. Puede ver sus rutinas, dietas, registrar progreso, y chatear con su entrenador.

### Cloudflare R2
Servicio de almacenamiento de objetos (similar a AWS S3) usado para almacenar videos de ejercicios y fotos de progreso. Ventaja: sin costo de egress (transferencia de datos saliente).

---

## D

### Desnormalización
Práctica de diseño NoSQL donde los datos relacionados se embeben en un mismo documento para evitar consultas múltiples. Ej: los ejercicios se embeben dentro del documento `workout` en lugar de estar en una colección separada.

---

## E

### Ectomorfo
Somatotipo caracterizado por metabolismo rápido, dificultad para ganar peso y masa muscular. Las dietas para ectomorfos suelen ser más altas en calorías y carbohidratos.

### Endomorfo
Somatotipo caracterizado por metabolismo lento, facilidad para ganar peso y grasa. Las dietas para endomorfos suelen ser más controladas en calorías y carbohidratos.

### Error Boundary
Componente de React que captura errores en el árbol de componentes y muestra una UI de fallback en lugar de que la aplicación se rompa por completo.

---

## F

### Firestore Streams
Conexión en tiempo real con Firestore usando `onSnapshot`. Los datos se actualizan automáticamente en la UI cuando cambian en la base de datos, sin necesidad de polling.

---

## I

### Islands (Astro)
Arquitectura de Astro donde los componentes interactivos (React) se renderizan de forma aislada dentro de una página mayormente estática. Solo los componentes que necesitan interactividad se hidratan.

---

## L

### Llamado de Atención (Alerta)
Mensaje especial de tipo `alert` que el admin puede enviar a un cliente. Se muestra como un banner rojo persistente en el dashboard del cliente hasta que este lo marca como leído.

---

## M

### Mesomorfo
Somatotipo caracterizado por metabolismo equilibrado, facilidad para ganar y perder peso, y buena respuesta al entrenamiento de fuerza.

### Medical Profile (Perfil Médico)
Conjunto de datos médicos del cliente que debe completar en su primer login. Incluye: alergias, lesiones, condiciones médicas, objetivos, experiencia, fecha de nacimiento, altura y peso inicial.

---

## N

### Nanostores
Librería de estado reactivo ligera, agnóstica al framework. Se usa en CampFit para compartir estado entre islands de Astro (auth, theme, etc.).

---

## O

### Onboarding
Proceso de primera configuración que un cliente nuevo debe completar antes de acceder al dashboard. Actualmente consiste en llenar el perfil médico.

### onSnapshot
Método de Firestore que establece un listener en tiempo real. Cada vez que los datos cambian, se ejecuta un callback con los nuevos datos.

---

## P

### Pre-signed URL (URL Pre-firmada)
URL temporal generada por Cloudflare Worker que permite a un cliente subir un archivo directamente a R2 sin necesidad de credenciales permanentes. Expira después de 1 hora.

---

## R

### RPE (Rate of Perceived Exertion)
Escala de esfuerzo percibido del 1 al 10 que el cliente registra al completar una rutina. 1 = muy fácil, 10 = esfuerzo máximo.

---

## S

### Semáforo de Adherencia
Dashboard visual para el admin que muestra el nivel de adherencia de cada cliente usando colores de semáforo: verde (≥90%), amarillo (70-89%), rojo (<70%).

### SSR (Server-Side Rendering)
Renderizado de páginas en el servidor en lugar del cliente. Astro usa SSR para páginas públicas (login, register) y estático para el resto.

### Somatotipo
Clasificación del tipo corporal: ectomorfo (delgado), mesomorfo (atlético), endomorfo (robusto). Se usa en CampFit para personalizar las dietas.

---

## T

### Trainer
Rol de usuario futuro (fase 2). Entrenador con clientes asignados. Sin acceso global como el admin. Actualmente no implementado.

---

## V

### Validación Médica
Sistema que verifica conflictos entre los ejercicios/ alimentos asignados y el perfil médico del cliente. Ej: si un cliente tiene lesión de rodilla, el sistema alerta si se le asigna sentadilla.

---

## W

### WCAG 2.1 AA
Estándar de accesibilidad web que CampFit debe cumplir. Incluye: contraste de colores suficiente, soporte de lectores de pantalla, navegación por teclado, etc.
