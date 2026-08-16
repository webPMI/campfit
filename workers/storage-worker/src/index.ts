/**
 * Cloudflare Worker: CampFit R2 Storage Service
 * Handles multipart & binary file uploads directly into Cloudflare R2 bucket `campfit`.
 */

export interface Env {
  STORAGE_BUCKET: R2Bucket;
}

const PUBLIC_R2_DEV_URL = 'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 1. Manejo de Preflight CORS OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 2. Health check
    if (path === '/' || path === '/health' || path === '/api/health') {
      return jsonResponse({
        status: 'ok',
        service: 'CampFit R2 Storage Worker',
        bucket: 'campfit',
        publicDomain: PUBLIC_R2_DEV_URL,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Subida multipart vía POST /upload o /api/upload
    if (request.method === 'POST' && (path === '/upload' || path === '/api/upload')) {
      try {
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          const file = formData.get('file') as File | null;
          const folder = (formData.get('folder') as string) || 'general';
          const entityId = (formData.get('entityId') as string) || 'anonymous';
          const customKey = formData.get('key') as string | null;

          if (!file) {
            return jsonResponse({ error: 'No se encontró archivo en form-data (campo "file")' }, 400);
          }

          const timestamp = Date.now();
          const ext = file.name.split('.').pop() || 'bin';
          const cleanFolder = folder.replace(/[^a-zA-Z0-9-_/]/g, '');
          const cleanEntityId = entityId.replace(/[^a-zA-Z0-9-_]/g, '');
          const objectKey = customKey || `${cleanFolder}/${cleanEntityId}/${timestamp}.${ext}`;

          const arrayBuffer = await file.arrayBuffer();

          await env.STORAGE_BUCKET.put(objectKey, arrayBuffer, {
            httpMetadata: {
              contentType: file.type || 'application/octet-stream',
            },
            customMetadata: {
              originalName: encodeURIComponent(file.name),
              uploadedAt: new Date().toISOString(),
              folder: cleanFolder,
              entityId: cleanEntityId,
            },
          });

          const publicUrl = `${PUBLIC_R2_DEV_URL}/${objectKey}`;

          return jsonResponse({
            success: true,
            url: publicUrl,
            key: objectKey,
            bucket: 'campfit',
            size: file.size,
            contentType: file.type,
            provider: 'cloudflare_r2',
          });
        }

        // Subida directa de payload binario
        const key = url.searchParams.get('key') || `direct/${Date.now()}.bin`;
        const bodyBuffer = await request.arrayBuffer();

        await env.STORAGE_BUCKET.put(key, bodyBuffer, {
          httpMetadata: {
            contentType,
          },
        });

        return jsonResponse({
          success: true,
          url: `${PUBLIC_R2_DEV_URL}/${key}`,
          key,
          bucket: 'campfit',
          size: bodyBuffer.byteLength,
          contentType,
          provider: 'cloudflare_r2',
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: `Error durante la subida a R2: ${message}` }, 500);
      }
    }

    // 4. Subida binaria PUT /upload/:key o /api/upload/:key
    if (request.method === 'PUT') {
      try {
        let objectKey = path.replace(/^\/(?:api\/)?(?:upload\/)?/, '');
        if (!objectKey) {
          objectKey = url.searchParams.get('key') || `uploads/${Date.now()}.bin`;
        }

        const contentType = request.headers.get('content-type') || 'application/octet-stream';
        const bodyBuffer = await request.arrayBuffer();

        await env.STORAGE_BUCKET.put(objectKey, bodyBuffer, {
          httpMetadata: {
            contentType,
          },
        });

        const publicUrl = `${PUBLIC_R2_DEV_URL}/${objectKey}`;

        return jsonResponse({
          success: true,
          url: publicUrl,
          key: objectKey,
          bucket: 'campfit',
          size: bodyBuffer.byteLength,
          contentType,
          provider: 'cloudflare_r2',
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: `Error en PUT R2: ${message}` }, 500);
      }
    }

    // 5. Eliminación de archivo DELETE /api/delete
    if (request.method === 'DELETE') {
      try {
        const key = url.searchParams.get('key') || path.replace(/^\/(?:api\/)?(?:delete\/)?/, '');
        if (!key) {
          return jsonResponse({ error: 'Parámetro "key" es requerido' }, 400);
        }

        await env.STORAGE_BUCKET.delete(key);
        return jsonResponse({ success: true, deletedKey: key });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: `Error eliminando objeto: ${message}` }, 500);
      }
    }

    return jsonResponse({ error: 'Ruta no encontrada' }, 404);
  },
};
