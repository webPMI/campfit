# 🛠️ Setup, Desarrollo y Pautas del Proyecto - CampFit

## 1. Configuración del Entorno de Desarrollo (Setup)

### Requisitos Previos
*   **Node.js:** Versión `>= 22.12.0`.
*   **NPM:** Gestor de paquetes incluido con Node.

### Pasos Iniciales
1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/webPMI/campfit.git
    cd campfit-astro
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar Variables de Entorno:**
    Copiar el archivo `.env.example` como `.env` y rellenar las credenciales correspondientes de Firebase:
    ```bash
    cp .env.example .env
    ```

---

## 2. Comandos Útiles

| Comando | Acción |
|---|---|
| `npm run dev` | Iniciar servidor de desarrollo local (`http://localhost:4321`) |
| `npm run build` | Compilar la aplicación estática para producción (en `/dist`) |
| `npm run preview` | Previsualizar localmente la compilación de producción |
| `npm run test` | Ejecutar la suite de pruebas unitarias (Vitest) |
| `npm run test:e2e` | Ejecutar pruebas de integración/E2E (Playwright) |

---

## 3. Pautas de Código e Instrucciones para Agentes (IA)

Cuando trabajes en el código de CampFit, debes respetar las siguientes directrices esenciales:

*   **Páginas Astro Limpias:** No incluyas lógica de bases de datos pesada o validaciones directamente en el frontmatter de las páginas `.astro`. Delega esta lógica a servicios o módulos de utilidad de TypeScript en `src/lib/` o `src/services/`.
*   **Gestión de Suscripciones Firestore:** Siempre que inicies una suscripción en tiempo real (`onSnapshot` o servicios similares de suscripción) en scripts del lado del cliente, **debes capturar la función de desuscripción** (`Unsubscribe`) y llamarla en el evento de desmontaje (`astro:before-swap` o `beforeunload`) para prevenir fugas de memoria.
*   **Traducciones (i18n):** Todo texto visible en el frontend debe estar localizado. Usa la función `t('key')` para traducciones SSR (`src/i18n/translations.ts`) o cliente (`src/i18n/client.ts`).
*   **Logger Centralizado:** No utilices `console.log` o `console.error` en producción de manera indiscriminada. Usa el logger de `@/lib/shared/logger`.
