# ☁️ Cloudflare R2 Object Storage — CampFit

> **Estado actual:** Backend funcionando vía Cloudflare Worker externo + librería S3 lista para SSR.
> **Client:** `r2Service.ts` hace `fetch POST` al Worker de subida, con fallback a DataURL local si falla.
> **Proyecto:** Astro `output: 'static'` desplegado en Firebase Hosting — NO hay endpoints SSR locales. La única ruta de subida funcional es el Worker externo. Los archivos en `dist/api/storage/*` son estáticos y no son endpoints funcionales.

## 1. Arquitectura real

```
Cliente (navegador, Astro SSG)
  │
  ├─ uploadProgressPhotoToR2() / uploadChatMedia() / etc.
  │     │
  │     ▼
  │  POST https://campfit-storage.servicioweb-pmi.workers.dev/upload
  │     (FormData: file + folder + entityId + key)
  │     │
  │     ▼
  │  Cloudflare Worker ──▶ PutObjectCommand ──▶ R2 bucket 'campfit'
  │     │
  │     ▼
  │  { url, key, size, contentType, provider } ← r2Service.ts
  │     │
  │     ▼
  │  registerProgressPhoto() ← guarda photoUrl + storageProvider en progress_logs
  │
  └─ (fallback local si Worker no responde) ──▶ DataURL (local_preview)
```

**Nota:** Firebase Hosting hace `rewrite: { source: "**", destination: "/index.html" }`. Los archivos en `dist/api/storage/*` son estáticos y no son endpoints funcionales — cualquier petición HTTP a `/api/storage/*` será redirigida a `index.html` (la SPA). El Worker externo es necesario.

## 2. ¿Qué existe y funciona

### Servicio cliente (`src/lib/storage/r2Service.ts`)

- `uploadProgressPhotoToR2(file, clientId, angle)` — foto de progreso
- `uploadChatMedia(file, senderId)` — adjunto de chat (imagen/vídeo)
- `uploadAvatar(file, userId)` — avatar de usuario
- `uploadFoodImage(file, foodId)` — imagen de alimento
- `uploadExerciseMedia(file, exerciseId)` — media de ejercicio
- `getR2HealthStatus()` — consulta health endpoint (actualmente `/api/storage/health` estático, no funcional)
- `validateImageFile(file, maxSizeMb)` — valida formato y tamaño
- `validateMediaFile(file, maxSizeMb)` — valida imagen/vídeo
- `generateLocalPreview(file)` — DataURL local como fallback

### Worker externo de subida

- **URL:** `https://campfit-storage.servicioweb-pmi.workers.dev/upload`
- **Método:** `POST` con `multipart/form-data`
- **Body:** `file` (File/Blob), `folder` (progress|chat|avatars|exercises|foods), `entityId` (id del usuario), `key` (opcional, clave completa en bucket)
- **Response:** `{ success: true, url: string, key: string, size: number, contentType: string, provider: 'cloudflare_r2' }`
- **Fallback si no configurado:** `local_preview` (DataURL)

### Bucket y dominio público

- **Bucket:** `campfit`
- **Dominio público:** `https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev`
- **Key pattern:**
  ```
  progress/{clientId}/{angle}_{timestamp}.{ext}
  chat/{senderId}/{timestamp}.{ext}
  avatars/{userId}/avatar.{ext}
  foods/{foodId}/{filename}.{ext}
  exercises/{exerciseId}/{filename}.{ext}
  ```

### Librería S3 (`src/lib/server/r2Client.ts`)

- `getR2Config()` — lee vars de entorno
- `isR2Configured()` — chequea credenciales
- `getR2Client()` — singleton S3Client
- `uploadBufferToR2(options)` — PutObjectCommand
- `generateR2PresignedUploadUrl(options)` — presigned PUT URL (5 min)
- `generateR2PresignedDownloadUrl(key)` — presigned GET URL (1h)
- `deleteR2Object(key)` — DeleteObjectCommand
- `checkR2Health()` — HeadBucketCommand

**Esta librería solo se usa en SSR/nuestro propio backend.** En Astro static no tiene server runtime, así que solo el Worker externo permite usar estas funciones en este momento.

## 3. Flujo de subida (comportamiento actual)

1. Usuario selecciona archivo en UI (progreso o chat)
2. `validateImageFile` / `validateMediaFile` valida formato y tamaño
3. UI muestra previsualización local (`URL.createObjectURL`)
4. Usuario hace clic en "Subir a Cloudflare R2"
5. `r2Service.ts` hace `POST` al Worker externo con FormData
6. Worker guarda en R2 y devuelve `{ url, ... }`
7. `registerProgressPhoto` / mensaje de chat guarda `photoUrl` + `storageProvider: 'cloudflare_r2'`
8. Si el Worker falla → fallback a `generateLocalPreview` (DataURL, `storageProvider: 'local_preview'`)

## 4. Configuración de entorno

No se exponen al frontend las credenciales S3 — el Worker las maneja internamente.Variables de entorno usadas:

```env
# Cloudflare R2 (desplegado y activo)
R2_ACCOUNT_ID=dbd535725cc4f3bc69288909ae46b920
R2_BUCKET_NAME=campfit
PUBLIC_R2_PUBLIC_DOMAIN=https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev
PUBLIC_R2_UPLOAD_URL=https://campfit-storage.servicioweb-pmi.workers.dev/upload
```

- `PUBLIC_R2_UPLOAD_URL` es la URL del Worker de subida — lo usa `r2Service.ts` para el fetch
- `PUBLIC_R2_PUBLIC_DOMAIN` es el dominio desde el cual se sirven las imágenes
- Las credenciales S3 (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) no se exponen al cliente porque el Worker las maneja internamente

## 5. Guía de Configuración en Cloudflare Dashboard

Esta sección documenta los pasos para crear/configurar el bucket R2 desde el panel de Cloudflare. Solo consultar si se necesita recrear o reconfigurar el bucket.

### 5.1 Crear el Bucket en Cloudflare R2

1. Accede al [Panel de Cloudflare](https://dash.cloudflare.com/) y dirígete a **R2 Object Storage**.
2. Pulsa en **Create bucket**.
3. Nómbralo: `campfit-storage` (o el nombre que elijas).
4. Ubicación recomendada: **Automatic** o **WNAM/WEUR** (según tus usuarios).
5. Pulsa **Create Bucket**.

### 5.2 Configurar Reglas CORS en el Bucket

En el bucket creado (`campfit-storage`), ve a **Settings** > **CORS Policy** y añade la siguiente política JSON:

```json
[
  {
    "AllowedOrigins": [
      "https://campfit.com",
      "https://*.campfit.com",
      "http://localhost:4321",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 5.3 Crear el Token de Acceso a la API (S3 Credentials)

1. En la página principal de R2, haz clic en **Manage R2 API Tokens** (a la derecha).
2. Haz clic en **Create API token**.
3. Selecciona permisos: **Object Read & Write**.
4. Ámbito: Puedes restringirlo al bucket `campfit-storage` o a todos los buckets.
5. Haz clic en **Create API Token** y copia los siguientes 3 valores:
   - **Account ID** (cadena hexadecimal de 32 caracteres)
   - **Access Key ID**
   - **Secret Access Key**

### 5.4 Configurar Dominio Público (Public Access)

En la pestaña **Settings** del bucket:
- **Opción A (Recomendada):** Conectar un subdominio personalizado gestionado por Cloudflare, ej: `cdn.campfit.app`.
- **Opción B (Desarrollo rápido):** Activar **R2.dev subdomain** y copiar la URL pública (ej: `https://pub-abcdef123456.r2.dev`).

## 6. Testing

### Cliente (r2Service.ts)

- `validateImageFile` / `validateMediaFile` — tests en `tests/unit/lib/storage/r2Service.test.ts`
- `generateLocalPreview` — genera DataURL para previsualización
- `uploadProgressPhotoToR2` / `uploadChatMedia` — ejecutan fetch al Worker, fallback local en test

### Worker (endpoint externo)

- `POST /upload` con FormData válido → 200 OK + URL del objeto
- Sin credenciales R2 en Worker → fallback (comportamiento definido por Worker)
- CORS: Worker debe permitir `Access-Control-Allow-Origin` desde `mallorca-campfit.web.app` y `localhost`

## 7. Limitaciones conocidas

- **Astro static (no SSR):** No hay endpoints `/api/storage/*` funcionales en producción. Firebase Hosting hace rewrite SPA. Los endpoints solo existen como archivos estáticos en `dist/`.
- **Healthcheck no funcional:** `/api/storage/health` es un archivo JSON estático que devuelve `configured: false` porque no tiene acceso a las credenciales S3. `getR2HealthStatus()` no puede verificar R2 desde el cliente estático.
- **Presigned URLs requieren backend:** `generateR2PresignedUploadUrl` necesita un servidor con las credenciales S3. Sin SSR o Worker propio, no se puede generar presigned URL desde el cliente directamente.

## 8. Alternativas futuras

- **Cloudflare Workers como backend SSR:** Migrar a Astro con `@astrojs/cloudflare` adapter → los endpoints `/api/storage/*` funcionarían nativamente.
- **Cloudflare Worker de presigned URL:** Worker independiente que genera presigned URLs (usa S3 credentials internamente, secreto), frontend hace PUT directo al bucket.
- **Firebase Storage como alternativa:** `firebase/storage` SDK + Firebase Hosting SSR con Cloud Functions.

## 9. Archivos

- `src/lib/storage/r2Service.ts` — servicio cliente (funcional)
- `src/lib/server/r2Client.ts` — librería S3 (para SSR futuro)
- `src/pages/api/storage/` — endpoints estáticos (no funcionales en producción)
- `docs/_archive/CLOUDFLARE_R2_PROGRESS_PHOTOS.md` — diseño antiguo (archivado)
