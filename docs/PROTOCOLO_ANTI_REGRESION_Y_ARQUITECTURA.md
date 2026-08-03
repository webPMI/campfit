# Protocolo de Anti-Regresión y Documentación de Arquitectura de CampFit

**Última actualización:** 2 de Agosto, 2026  
**Objetivo:** Garantizar que ninguna auditoría, refactorización o cambio futuro elimine o degrade funcionalidades existentes en CampFit.

---

## 1. Reglas de Oro Anti-Regresión

1. **PROHIBIDO Minificar o Simplificar Archivos `.astro`:**
   - Ningún componente o página debe ser reemplazado por versiones contraídas de una línea o stubs minificados (`initW`, `af`, `se`, etc.).
   - Todo el código debe ser legible, modular y mantener el renderizado enriquecido (badges, modales, alertas, toasts y filtros).

2. **PROHIBIDO Eliminar Cláusulas de Consulta en Firestore (`where`, `orderBy`, `limit`):**
   - Las consultas de Firestore reflejan requisitos de negocio. Si una consulta requiere un índice compuesto en desarrollo, se debe usar un manejo defensivo con fallback sin eliminar la cláusula original.

3. **Verificación Antes y Después de Cada Edición:**
   - Antes de modificar un archivo, inspeccionar el contenido completo para comprender la interfaz y los contratos de datos.
   - Después de cada edición, ejecutar la suite de pruebas unitarias (`npx vitest run`) y la compilación estática (`npm run build`).

---

## 2. Mapa de Funcionalidades por Módulo

### A. Módulo del Cliente (`/client/*`)
- **`workouts.astro`**: Programación semanal por días (Lunes a Domingo), autodetección de la jornada actual, registro granular de ejercicios (`100%`, `a medias`, `omitido`), peso en kg, repeticiones reales, RPE (1-10) y notas.
- **`diets.astro`**: Control de hidratación diaria (Water Tracker 💧 con meta de 2.5L), desglose de macronutrientes en tiempo real (Kcal, Proteínas, Carbs, Grasas) y marcas de tomas de comidas.
- **`progress.astro`**: Pestañas de Registro de Peso, Checklist Diario de Hábitos & Bienestar Humano (sueño, pasos, ánimo) y Subida de Fotos de Evolución (Frontal, Perfil, Espalda) preparadas para **Cloudflare R2**.

### B. Módulo del Entrenador (`/trainer/*`)
- **`workouts.astro`**: Editor de rutinas por día, desglose de ejercicios (`data-field`), asignación de clientes, selector de dificultad y confirmación de eliminación.
- **`diets.astro`**: Editor dinámico de comidas por tomas (Desayuno, Almuerzo, Merienda, Cena, Snacks), calculadora de macros en vivo y somatotipos.
- **`chat.astro`**: Chat multi-rol en tiempo real (Cliente <-> Trainer <-> Admin), modal de nueva conversación, lista de contactos con distintivos de rol y alertas sonoras (Web Audio API).

### C. Módulo de Administración (`/admin/*`)
- **`dashboard.astro`**: Rejilla de métricas en vivo (Total Usuarios, Trainers, Clientes, Bloqueados, Alertas Activas), tarjetas de alertas recientes y acceso rápido a usuarios.
- **`users.astro`**: Tabla de gestión de usuarios con cambio de rol, asignación de entrenador, reseteo de contraseña, bloqueo/desbloqueo y consulta médica.

---

## 3. Comandos de Validación Obligatorios

```bash
# 1. Comprobación de tipos TypeScript
npm run type-check

# 2. Ejecución completa de pruebas unitarias
npx vitest run

# 3. Validación de compilación estática de producción (35/35 páginas)
npm run build
```
