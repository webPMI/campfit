# Roadmap 03: Onboarding Wizard (`/onboarding`)

## 🎯 Objetivo General
Auditar y perfeccionar el asistente de incorporación paso a paso para nuevos clientes, asegurando la captura precisa de datos biométricos, objetivos y nivel de actividad, con guardado atómico en Firestore y cálculo inicial de metabolismo.

---

## 📋 Lista de Tareas

### 🟢 Tarea 3.1: Paso 1 - Datos Antropométricos & Biológicos
- **Estado:** `[COMPLETADO]`
- **Descripción:** Captura de peso, altura, fecha de nacimiento y género biológico con validación de rangos fisiológicos coherentes.
- **Archivos:** `src/pages/onboarding.astro`, `src/types/index.ts`.

### 🟢 Tarea 3.2: Paso 2 - Nivel de Actividad & Frecuencia
- **Estado:** `[COMPLETADO]`
- **Descripción:** Selección de nivel de actividad diaria (sedentario, ligero, moderado, intenso) para el cálculo de TDEE base.
- **Archivos:** `src/pages/onboarding.astro`, `src/lib/client/metabolicCalculator.ts`.

### 🟢 Tarea 3.3: Paso 3 - Metas Atléticas & Somatotipo
- **Estado:** `[COMPLETADO]`
- **Descripción:** Definición del objetivo prioritario (definición, hipertrofia, salud articular, rendimiento deportivo).
- **Archivos:** `src/pages/onboarding.astro`.

### 🟢 Tarea 3.4: Paso 4 - Finalización & Activación de Cuenta
- **Estado:** `[COMPLETADO]`
- **Descripción:** Marcado de `onboardingCompleted: true`, almacenamiento de perfil inicial en Firestore y redirección inmediata a `/client/dashboard`.
- **Archivos:** `src/pages/onboarding.astro`, `src/lib/auth/roleRedirect.ts`.
