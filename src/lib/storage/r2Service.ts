/**
 * Servicio de almacenamiento para Cloudflare R2 Object Storage.
 * Proporciona subida directa y segura de archivos multimedia:
 * - Fotos de evolución corporal (Frontal, Perfil, Espalda)
 * - Adjuntos multimedia de chat (Imágenes, Vídeos de postura)
 * - Avatares de usuario y fotos de perfil
 * - Fotos del catálogo nutricional y vídeos de ejercicios
 *
 * Integración compatible con S3 Presigned URLs, API Route serverless y Worker de Cloudflare.
 *
 * @module storage/r2Service
 */

import { logger } from '@/lib/shared/logger';

export interface R2UploadConfig {
  bucketName?: string;
  customDomain?: string;
  r2Endpoint?: string;
  apiUploadEndpoint?: string;
  presignedUrlEndpoint?: string;
}

export interface ProgressPhotoUpload {
  id: string;
  clientId: string;
  photoUrl: string;
  angle: 'front' | 'side' | 'back';
  notes?: string;
  storageProvider: 'cloudflare_r2' | 'firebase_storage' | 'local_preview';
  createdAt: string;
  success?: boolean;
}

export interface UploadResult {
  url: string;
  key: string;
  size?: number;
  contentType?: string;
  provider: 'cloudflare_r2' | 'local_preview';
}

const defaultConfig: R2UploadConfig = {
  bucketName: 'campfit',
  customDomain:
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_R2_PUBLIC_DOMAIN) ||
    'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev',
  apiUploadEndpoint:
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_R2_UPLOAD_URL) ||
    'https://campfit-storage.servicioweb-pmi.workers.dev/upload',
  presignedUrlEndpoint: '/api/storage/presigned-url',
};

/**
 * Valida que el archivo seleccionado sea una imagen válida (PNG, JPEG, WebP, HEIC).
 */
export function validateImageFile(
  file: File,
  maxSizeMb: number = 15
): { valid: boolean; message?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'Formato no soportado. Por favor utiliza JPG, PNG o WebP.',
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      message: `El tamaño de la imagen no puede superar los ${maxSizeMb}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Valida que el archivo sea un contenido multimedia admitido (imagen o vídeo).
 */
export function validateMediaFile(
  file: File,
  maxSizeMb: number = 50
): { valid: boolean; message?: string; mediaType: 'image' | 'video' } {
  const isVideo = file.type.startsWith('video/');
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];

  if (isVideo) {
    if (!allowedVideoTypes.includes(file.type)) {
      return {
        valid: false,
        message: 'Formato de vídeo no soportado. Utiliza MP4 o WebM.',
        mediaType: 'video',
      };
    }
  } else {
    if (!allowedImageTypes.includes(file.type)) {
      return {
        valid: false,
        message: 'Formato de imagen no soportado. Utiliza JPG, PNG o WebP.',
        mediaType: 'image',
      };
    }
  }

  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      message: `El archivo supera el límite de ${maxSizeMb}MB.`,
      mediaType: isVideo ? 'video' : 'image',
    };
  }

  return { valid: true, mediaType: isVideo ? 'video' : 'image' };
}

/**
 * Genera una URL de previsualización local (Data URL) para respuesta reactiva inmediata en la UI.
 */
export function generateLocalPreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Función principal para subir cualquier archivo a Cloudflare R2.
 */
export async function uploadFileToR2(
  file: File,
  options: {
    folder: 'progress' | 'chat' | 'avatars' | 'exercises' | 'foods' | 'general';
    entityId: string;
    key?: string;
    config?: R2UploadConfig;
  }
): Promise<UploadResult> {
  const config = { ...defaultConfig, ...options.config };
  const primaryEndpoint = config.apiUploadEndpoint || '/api/storage/upload';
  const fallbackEndpoint = '/api/storage/upload';

  console.log('📤 [Almacenamiento] Iniciando subida de archivo:', {
    nombre: file.name,
    tamaño: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    tipo: file.type,
    carpeta: options.folder,
    entidad: options.entityId,
    endpointPrincipal: primaryEndpoint,
  });

  const uploadAttempt = async (endpoint: string): Promise<UploadResult | null> => {
    try {
      console.log(`🌐 [Almacenamiento] Conectando a ${endpoint}...`);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', options.folder);
      formData.append('entityId', options.entityId);
      if (options.key) formData.append('key', options.key);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout máx

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [Almacenamiento] Subida exitosa:', data.url);
        logger.info('StorageService', `Subida exitosa: ${data.url}`);
        return {
          url: data.url,
          key: data.key || `${options.folder}/${options.entityId}/${file.name}`,
          size: data.size || file.size,
          contentType: data.contentType || file.type,
          provider: data.provider || 'cloudflare_r2',
        };
      }
      console.warn(`⚠️ [Almacenamiento] Endpoint ${endpoint} respondió con status ${response.status}`);
      return null;
    } catch (err: unknown) {
      console.warn(`⚠️ [Almacenamiento] Error conectando con ${endpoint}:`, err);
      return null;
    }
  };

  // 1. Intentar endpoint principal
  let result = await uploadAttempt(primaryEndpoint);

  // 2. Si el principal falló y es distinto al endpoint local, intentar el local
  if (!result && primaryEndpoint !== fallbackEndpoint) {
    console.log('🔄 [Almacenamiento] Reintentando con endpoint local /api/storage/upload...');
    result = await uploadAttempt(fallbackEndpoint);
  }

  // 3. Si ambos fallan, usar fallback reactivo inmediato
  if (result) {
    return result;
  }

  console.warn('⚠️ [Almacenamiento] Usando fallback reactivo de previsualización local');
  logger.warn('StorageService', 'Fallo en servidores de subida, usando fallback reactivo local');
  const previewUrl = await generateLocalPreview(file);
  return {
    url: previewUrl,
    key: `${options.folder}/${options.entityId}/${Date.now()}_preview`,
    size: file.size,
    contentType: file.type,
    provider: 'local_preview',
  };
}

/**
 * Sube una foto de progreso corporal a Cloudflare R2.
 */
export async function uploadProgressPhotoToR2(
  file: File,
  clientId: string,
  angle: 'front' | 'side' | 'back',
  config: R2UploadConfig = defaultConfig
): Promise<ProgressPhotoUpload> {
  const validation = validateImageFile(file, 20);
  if (!validation.valid) {
    logger.error('R2Service', validation.message || 'Archivo no válido');
    throw new Error(validation.message);
  }

  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const objectKey = `progress/${clientId}/${angle}_${timestamp}.${fileExt}`;

  const result = await uploadFileToR2(file, {
    folder: 'progress',
    entityId: clientId,
    key: objectKey,
    config,
  });

  return {
    id: `r2-${timestamp}`,
    clientId,
    photoUrl: result.url,
    angle,
    storageProvider: result.provider === 'cloudflare_r2' ? 'cloudflare_r2' : 'local_preview',
    createdAt: new Date().toISOString(),
    success: true,
  };
}

/**
 * Sube una imagen o vídeo de postura/técnica para adjuntarlo al chat.
 */
export async function uploadChatMedia(
  file: File,
  senderId: string,
  config: R2UploadConfig = defaultConfig
): Promise<{ url: string; type: 'image' | 'video'; provider?: 'cloudflare_r2' | 'local_preview' }> {
  const validation = validateMediaFile(file, 50);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const result = await uploadFileToR2(file, {
    folder: 'chat',
    entityId: senderId,
    config,
  });

  return {
    url: result.url,
    type: validation.mediaType,
    provider: result.provider,
  };
}

/**
 * Valida un archivo de avatar de usuario (máximo 2MB, JPG/PNG/WebP).
 */
export function validateAvatarFile(
  file: File,
  maxSizeMb: number = 2
): { valid: boolean; message?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'Formato no soportado. Por favor utiliza JPG, PNG o WebP.',
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      message: `El avatar no puede superar los ${maxSizeMb}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Sube un avatar de usuario a Cloudflare R2 con validación estricta de 2MB.
 */
export async function uploadAvatarToR2(
  file: File,
  userId: string,
  config: R2UploadConfig = defaultConfig
): Promise<{ url: string; provider?: 'cloudflare_r2' | 'local_preview' }> {
  const validation = validateAvatarFile(file, 2);
  if (!validation.valid) {
    logger.error('R2Service', validation.message || 'Avatar no válido');
    throw new Error(validation.message);
  }

  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const objectKey = `avatars/${userId}/avatar_${timestamp}.${fileExt}`;

  const result = await uploadFileToR2(file, {
    folder: 'avatars',
    entityId: userId,
    key: objectKey,
    config,
  });

  return {
    url: result.url,
    provider: result.provider,
  };
}

/**
 * Sube un avatar de usuario a Cloudflare R2 (alias retrocompatible).
 */
export async function uploadAvatar(
  file: File,
  userId: string,
  config: R2UploadConfig = defaultConfig
): Promise<{ url: string; provider?: 'cloudflare_r2' | 'local_preview' }> {
  return uploadAvatarToR2(file, userId, config);
}

/**
 * Sube una imagen de alimento para la biblioteca nutricional a Cloudflare R2.
 */
export async function uploadFoodImage(
  file: File,
  foodId: string,
  config: R2UploadConfig = defaultConfig
): Promise<{ url: string; provider?: 'cloudflare_r2' | 'local_preview' }> {
  const validation = validateImageFile(file, 10);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const result = await uploadFileToR2(file, {
    folder: 'foods',
    entityId: foodId,
    config,
  });

  return {
    url: result.url,
    provider: result.provider,
  };
}

/**
 * Sube un vídeo o miniatura de ejercicio a Cloudflare R2.
 */
export async function uploadExerciseMedia(
  file: File,
  exerciseId: string,
  config: R2UploadConfig = defaultConfig
): Promise<{ url: string; type: 'image' | 'video'; provider?: 'cloudflare_r2' | 'local_preview' }> {
  const validation = validateMediaFile(file, 100);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const result = await uploadFileToR2(file, {
    folder: 'exercises',
    entityId: exerciseId,
    config,
  });

  return {
    url: result.url,
    type: validation.mediaType,
    provider: result.provider,
  };
}

/**
 * Consulta el estado de conectividad con Cloudflare R2.
 */
export async function getR2HealthStatus(healthUrl = '/api/storage/health'): Promise<{
  configured: boolean;
  connected: boolean;
  bucket?: string;
  publicDomain?: string;
  error?: string;
}> {
  try {
    const res = await fetch(healthUrl);
    if (!res.ok) throw new Error('Error al conectar con healthcheck de storage');
    const data = await res.json();
    return {
      configured: data.configured ?? (data.status === 'ok'),
      connected: data.connected ?? (data.status === 'ok'),
      bucket: data.bucket,
      publicDomain: data.publicDomain,
    };
  } catch (err) {
    return {
      configured: false,
      connected: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

