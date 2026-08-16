import type { APIRoute } from 'astro';
import { isR2Configured, uploadBufferToR2 } from '@/lib/server/r2Client';
import { logger } from '@/lib/shared/logger';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'application/pdf',
]);

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be multipart/form-data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';
    const entityId = (formData.get('entityId') as string) || 'anonymous';
    const customKey = formData.get('key') as string | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No se envió ningún archivo' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return new Response(
        JSON.stringify({ error: `Tipo de archivo no permitido: ${file.type}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ error: 'El archivo excede el límite máximo de 50MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'bin';
    const cleanFolder = folder.replace(/[^a-zA-Z0-9-_/]/g, '');
    const cleanEntityId = entityId.replace(/[^a-zA-Z0-9-_]/g, '');
    const objectKey = customKey || `${cleanFolder}/${cleanEntityId}/${timestamp}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Si Cloudflare R2 está configurado en producción / entorno
    if (isR2Configured()) {
      const result = await uploadBufferToR2({
        key: objectKey,
        body: buffer,
        contentType: file.type,
        metadata: {
          originalName: encodeURIComponent(file.name),
          uploadedAt: new Date().toISOString(),
          folder: cleanFolder,
          entityId: cleanEntityId,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          url: result.url,
          key: result.key,
          bucket: result.bucket,
          size: file.size,
          contentType: file.type,
          provider: 'cloudflare_r2',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fallback reactivo de previsualización en entorno local sin credenciales R2
    logger.info('StorageAPI', 'R2 no configurado, generando Data URL para previsualización local');
    const base64Data = buffer.toString('base64');
    const previewUrl = `data:${file.type};base64,${base64Data}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: previewUrl,
        key: objectKey,
        size: file.size,
        contentType: file.type,
        provider: 'local_preview',
        message: 'Modo local: subida a Cloudflare R2 lista para cuando se añadan credenciales',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('StorageAPI', 'Error al procesar subida de archivo:', error);
    return new Response(
      JSON.stringify({ error: `Error al procesar subida: ${errorMsg}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      service: 'Cloudflare R2 Storage Upload API',
      configured: isR2Configured(),
      methods: ['POST'],
      supportedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
      maxSizeBytes: MAX_FILE_SIZE_BYTES,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
