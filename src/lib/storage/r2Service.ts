/**
 * Servicio de almacenamiento para Cloudflare R2 Object Storage.
 * Permite subir fotos de evolución física (Frontal, Perfil, Espalda)
 * con soporte para Cloudflare Workers / R2 API y vista previa local.
 *
 * @module r2Service
 */

import { logger } from '@/lib/shared/logger';

export interface R2UploadConfig {
  accountHash?: string;
  bucketName?: string;
  customDomain?: string;
  r2Endpoint?: string;
}

export interface ProgressPhotoUpload {
  id: string;
  clientId: string;
  photoUrl: string;
  angle: 'front' | 'side' | 'back';
  notes?: string;
  storageProvider: 'cloudflare_r2' | 'firebase_storage' | 'local_preview';
  createdAt: string;
}

const defaultConfig: R2UploadConfig = {
  bucketName: 'campfit-progress-photos',
  customDomain: 'https://cdn.campfit.app',
};

/**
 * Valida que el archivo seleccionado sea una imagen válida (PNG, JPEG, WebP, HEIC).
 */
export function validateImageFile(file: File): { valid: boolean; message?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'Formato no soportado. Por favor utiliza JPG, PNG o WebP.',
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      message: 'El tamaño de la imagen no puede superar los 10MB.',
    };
  }

  return { valid: true };
}

/**
 * Genera una URL de previsualización local (Data URL / Object URL) para respuesta inmediata en la UI.
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
 * Sube una foto de progreso a Cloudflare R2.
 * Si las credenciales o la API de Cloudflare R2 están configuradas, realiza la petición HTTP PUT/POST;
 * de lo contrario, utiliza la previsualización local segura.
 */
export async function uploadProgressPhotoToR2(
  file: File,
  clientId: string,
  angle: 'front' | 'side' | 'back',
  config: R2UploadConfig = defaultConfig
): Promise<ProgressPhotoUpload | null> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    logger.error('R2Service', validation.message || 'Archivo no válido');
    throw new Error(validation.message);
  }

  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const objectKey = `clients/${clientId}/progress/${angle}_${timestamp}.${fileExt}`;

  try {
    // Si existe endpoint API de Cloudflare R2 o Worker
    if (config.r2Endpoint) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', objectKey);
      formData.append('clientId', clientId);
      formData.append('angle', angle);

      const response = await fetch(config.r2Endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error HTTP R2: ${response.statusText}`);
      }

      const data = await response.json();
      const publicUrl = data.url || `${config.customDomain}/${objectKey}`;

      logger.info('R2Service', `Foto subida a Cloudflare R2: ${publicUrl}`);

      return {
        id: `r2-${timestamp}`,
        clientId,
        photoUrl: publicUrl,
        angle,
        storageProvider: 'cloudflare_r2',
        createdAt: new Date().toISOString(),
      };
    }

    // Fallback reactivo local con Data URL para previsualización instantánea
    const previewUrl = await generateLocalPreview(file);
    logger.info('R2Service', 'Foto procesada con vista previa local segura (Cloudflare R2 listo)');

    return {
      id: `preview-${timestamp}`,
      clientId,
      photoUrl: previewUrl,
      angle,
      storageProvider: 'local_preview',
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('R2Service', 'Error durante la subida a R2:', error);
    throw error;
  }
}
