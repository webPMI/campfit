# Roadmap 29: API Endpoints & Storage R2 (`/api/*`, `r2Service.ts`)

## 🎯 Objetivo General
Auditar los endpoints API de backend y el servicio de almacenamiento en Cloudflare R2: presigned URLs, subida directa de archivos (fotos, avatares, vídeos de técnica) y health checks.

---

## 📋 Lista de Tareas

### 🟢 Tarea 29.1: Endpoints de Presigned URLs & Upload
- **Estado:** `[COMPLETADO]`
- **Descripción:** Endpoints `/api/storage/presigned-url` y `/api/storage/upload` con validación de tipo MIME y límites de tamaño.
- **Archivos:** `src/pages/api/storage/*`, `src/lib/server/r2Client.ts`.

### 🟢 Tarea 29.2: Servicio Cliente de Cloudflare R2
- **Estado:** `[COMPLETADO]`
- **Descripción:** Subida directa con feedback de progreso y generación de URLs públicas seguras.
- **Archivos:** `src/lib/storage/r2Service.ts`.
