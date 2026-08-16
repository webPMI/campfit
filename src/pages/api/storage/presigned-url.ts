import type { APIRoute } from 'astro';
import { isR2Configured, generateR2PresignedUploadUrl } from '@/lib/server/r2Client';
import { logger } from '@/lib/shared/logger';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { filename, contentType, folder = 'general', entityId = 'anonymous' } = body;

    if (!filename || !contentType) {
      return new Response(
        JSON.stringify({ error: 'filename y contentType son obligatorios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!isR2Configured()) {
      return new Response(
        JSON.stringify({
          error: 'Cloudflare R2 no está configurado en el servidor',
          configured: false,
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const timestamp = Date.now();
    const ext = filename.split('.').pop() || 'bin';
    const cleanFolder = folder.replace(/[^a-zA-Z0-9-_/]/g, '');
    const cleanEntityId = entityId.replace(/[^a-zA-Z0-9-_]/g, '');
    const key = `${cleanFolder}/${cleanEntityId}/${timestamp}.${ext}`;

    const result = await generateR2PresignedUploadUrl({
      key,
      contentType,
      expiresInSeconds: 600, // 10 minutos
    });

    return new Response(
      JSON.stringify({
        success: true,
        uploadUrl: result.uploadUrl,
        publicUrl: result.publicUrl,
        key: result.key,
        expiresIn: result.expiresIn,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('StorageAPI', 'Error generando presigned URL:', error);
    return new Response(
      JSON.stringify({ error: `Error generando URL prefirmada: ${errorMsg}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      service: 'Cloudflare R2 Presigned URL API',
      configured: isR2Configured(),
      methods: ['POST'],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
