# Roadmap 11: Client Progress & R2 Photos (`/client/progress`)

## 🎯 Objetivo General
Auditar el registro de evolución física, gráfica histórica de peso, notas de sensaciones y subida de fotos por ángulo (*Frontal, Perfil, Espalda*) a Cloudflare R2 con galería filtrable.

---

## 📋 Lista de Tareas

### 🟢 Tarea 11.1: Registro & Gráfica de Peso Corporal
- **Estado:** `[COMPLETADO]`
- **Descripción:** Entrada rápida de peso diario y renderizado de evolución temporal.
- **Archivos:** `src/pages/client/progress.astro`.

### 🟢 Tarea 11.2: Subida de Fotos por Ángulo a Cloudflare R2
- **Estado:** `[COMPLETADO]`
- **Descripción:** Dropzone con selección de pose (Frontal, Perfil, Espalda), compresión y subida directa a R2 vía `uploadProgressPhotoToR2`.
- **Archivos:** `src/pages/client/progress.astro`, `src/lib/storage/r2Service.ts`.

### 🟢 Tarea 11.3: Galería de Fotos & Filtros
- **Estado:** `[COMPLETADO]`
- **Descripción:** Vista en cuadrícula con filtros por ángulo y visor ampliado.
- **Archivos:** `src/pages/client/progress.astro`.
