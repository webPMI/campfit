# 📋 Plan de Trabajo, Checklist y Problemas Detectados - CampFit

## 1. Problemas y Deuda Técnica Detectada

### A. Rendimiento y Escalabilidad en Firestore
*   **Lectura masiva sin límites:** Funciones de tiempo real como `subscribeToUsers` escuchan toda la colección `users` sin límites ni paginación, lo que resultará costoso cuando el número de usuarios crezca.
*   **Recuentos globales ineficientes:** La función `subscribeToCollectionCount` lee todos los documentos de una colección solo para contarlos en la interfaz del panel de administración. Se debe migrar al uso de funciones de agregación como `count()` de Firestore.
*   **Falta de cleanup en listeners:** [Resuelto] Se identificó que varios paneles no limpiaban sus escuchadores al navegar, provocando fugas de memoria. Esto fue solucionado implementando desuscripciones en los eventos `beforeunload` y `astro:before-swap` (SPA).

### B. Seguridad y Calidad de Código
*   **Exposición en el objeto global:** Vistas como `admin/users.astro` y `trainer/diets.astro` exponen funciones al objeto `window` (ej. `window.__toggleBlockUser`). Esto puede acarrear problemas de XSS o colisiones de scripts. Se debe migrar al uso de delegación de eventos (`data-*` attributes).
*   **Mensajes de consola en producción:** Se detectaron múltiples llamadas a `console.error` en archivos de UI en producción. Deben reemplazarse con el logger unificado.
*   **Duplicidad de Código en Vistas de Configuración:** Las páginas de settings (`admin/settings.astro`, `trainer/settings.astro`, `client/settings.astro`) tienen un 80% de lógica y maquetación idéntica. Deberían unificarse mediante un componente base o shell.
*   **Abuso de tipos `any` en TypeScript:** [Resuelto] Campos críticos de fechas y marcas de tiempo (`createdAt`, `updatedAt`, `birthDate`, `lastActivityAt`) en `src/types/index.ts` y utilidades de entrenadores fueron tipados correctamente, aprovechando las validaciones de tipo estricto de TypeScript.
*   **Claves de traducción no utilizadas (i18n):** [Resuelto] Depuramos y redujimos las claves huérfanas en `translations.ts` y `client.ts` para silenciar las advertencias de la suite de pruebas unitarias.
*   **Archivos de componentes sobredimensionados:** Varias páginas de Astro superan el límite óptimo de líneas (ej. `admin/users.astro` tiene ~600 líneas) debido a scripts JS inline muy complejos mezclados con la maquetación HTML.
*   **Ausencia de Metadatos SEO Profesionales (`BaseLayout.astro`):** [Resuelto] La plantilla base de HTML ahora cuenta con etiquetas meta SEO dinámicas (`description`, `keywords`, `robots`) y etiquetas Open Graph/Twitter para que el sitio se visualice de forma profesional en motores de búsqueda y redes sociales.

### C. Brechas Funcionales en el Módulo de Cliente
*   **Falta de Gráficos de Evolución (`client/progress.astro`):** [Resuelto] Implementamos un gráfico LineChart nativo vectorial SVG interactivo y auto-escala cronológica de peso en tiempo real.
*   **Subida de Fotos Inexistente:** [Resuelto] Implementamos el mosaico y soporte completo de drag-and-drop para almacenar y previsualizar imágenes evolutivas en formato Base64 en Firestore.
*   **Botón de Completado Inoperativo y RPE Desactivado (`client/workouts.astro`):** [Resuelto] Activamos el botón para registrar el completado del entrenamiento e integramos el modal interactivo de RPE (esfuerzo percibido del 1 al 10) y guardado seguro en Firestore.

---

## 2. Checklist de Tareas por Perfil de Agente (Roadmap para Multi-Agentes)

### 🎨 Perfil 1: Agente Frontend (Especialista en UI/UX, Layouts y Componentes)
*   [x] **Astro Layout SEO:** Inyectar en `BaseLayout.astro` los metadatos SEO profesionales y etiquetas Open Graph/Twitter.
*   [x] **Admin Page - Workouts UI:** Diseñar la maquetación responsiva para `src/pages/admin/workouts.astro` (CRUD de rutinas).
*   [x] **Admin Page - Diets UI:** Diseñar la maquetación responsiva para `src/pages/admin/diets.astro` (CRUD de dietas).
*   [x] **Admin Page - Chat UI:** Diseñar la bandeja de mensajes interactiva para `src/pages/admin/chat.astro`.
*   [x] **Admin Page - Progress UI:** Diseñar la vista de progreso `src/pages/admin/progress.astro` con gráfico vectorial interactivo SVG.
*   [x] **Client - RPE Modal:** Crear el modal interactivo de feedback RPE (Rate of Perceived Exertion) en `client/workouts.astro`.
*   [x] **Client - LineChart Peso:** Reemplazar el listado de texto plano en `client/progress.astro` por un componente de gráfico interactivo.
*   [x] **Client - Photo Gallery:** Diseñar el cargador de imágenes y visor de fotos en la pestaña correspondiente de `client/progress.astro`.
*   [ ] **Shared - Shell de Configuración:** Crear un componente unificado para las vistas de settings de admin, entrenador y cliente, reduciendo la duplicación.

### ⚙️ Perfil 2: Agente Integración y Datos (Especialista en Firebase, Firestore y Lógica de Negocio)
*   [x] **Client - Persistencia de Rutina completada:** Programar la lógica del botón en `client/workouts.astro` para guardar la rutina finalizada y el valor RPE en Firestore.
*   [x] **Client - Photo Upload Lógica:** Implementar el servicio de subida y almacenamiento de imágenes para fotos de progreso.
*   [x] **Client - Support Service:** Crear `src/lib/client/supportService.ts` para gestionar FAQs y búsqueda de soporte dinámicamente.
*   [x] **TS Strict Types:** Reemplazar los tipos `any` en `src/types/index.ts` por marcas de tiempo estrictas (`Timestamp`) o `Date`.
*   [ ] **Clean Global Context:** Refactorizar la exposición al objeto `window` en `admin/users.astro` y `trainer/diets.astro` mediante data attributes y event listeners locales.
*   [ ] **Admin - DB Pagination:** Implementar límites y paginación en consultas en tiempo real y síncronas en `adminUtils.ts`.
*   [ ] **Admin - Firestore Count:** Migrar los recuentos totales de colecciones a la función de agregación `count()` de Firestore para reducir costos de lectura.
*   [ ] **Refactor - Modularizar Vistas:** Extraer los controladores de JavaScript inline pesados de `admin/users.astro` y `trainer/diets.astro` a archivos TS independientes.

### 🧪 Perfil 3: Agente Calidad y Mantenimiento (Especialista en QA, i18n y Testing)
*   [x] **i18n Cleanup:** Depurar y eliminar del código las claves de traducción sin utilizar en `translations.ts` y `client.ts` detectadas en los tests.
*   [ ] **Logger Production:** Eliminar llamadas directas a `console.error` y configurar el logger centralizado en todas las vistas de UI.
*   [x] **Unit Testing:** Corregir y expandir las pruebas unitarias en Vitest para que la cobertura sea del 100% en éxito.
*   [ ] **E2E Playwright Flows:** Habilitar y codificar las pruebas de integración en Playwright para flujos críticos (Onboarding, Login y registro de peso).
