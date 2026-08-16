/**
 * Cliente de servidor para Cloudflare R2 Object Storage.
 * Implementa la API compatible con Amazon S3 utilizando @aws-sdk/client-s3.
 *
 * @module server/r2Client
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@/lib/shared/logger';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
}

let cachedClient: S3Client | null = null;
let cachedConfig: R2Config | null = null;

/**
 * Obtiene la configuración de Cloudflare R2 desde variables de entorno.
 */
export function getR2Config(): R2Config {
  const accountId =
    process.env.R2_ACCOUNT_ID ||
    process.env.PUBLIC_R2_ACCOUNT_ID ||
    import.meta.env.R2_ACCOUNT_ID ||
    '';

  const accessKeyId =
    process.env.R2_ACCESS_KEY_ID ||
    process.env.PUBLIC_R2_ACCESS_KEY_ID ||
    import.meta.env.R2_ACCESS_KEY_ID ||
    '';

  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY ||
    import.meta.env.R2_SECRET_ACCESS_KEY ||
    '';

  const bucketName =
    process.env.R2_BUCKET_NAME ||
    process.env.PUBLIC_R2_BUCKET_NAME ||
    import.meta.env.R2_BUCKET_NAME ||
    'campfit-storage';

  const publicDomain = (
    process.env.R2_PUBLIC_DOMAIN ||
    process.env.PUBLIC_R2_PUBLIC_DOMAIN ||
    import.meta.env.PUBLIC_R2_PUBLIC_DOMAIN ||
    'https://cdn.campfit.app'
  ).replace(/\/$/, '');

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicDomain,
  };
}

/**
 * Comprueba si las credenciales de Cloudflare R2 están configuradas en el entorno.
 */
export function isR2Configured(): boolean {
  const config = getR2Config();
  return Boolean(config.accountId && config.accessKeyId && config.secretAccessKey);
}

/**
 * Inicializa y devuelve una instancia singleton de S3Client conectada al endpoint de R2.
 */
export function getR2Client(): S3Client | null {
  const config = getR2Config();

  if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
    return null;
  }

  if (
    cachedClient &&
    cachedConfig &&
    cachedConfig.accountId === config.accountId &&
    cachedConfig.accessKeyId === config.accessKeyId
  ) {
    return cachedClient;
  }

  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;

  cachedClient = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  cachedConfig = config;
  return cachedClient;
}

export interface UploadOptions {
  key: string;
  body: Buffer | Uint8Array | Blob | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  key: string;
  url: string;
  size?: number;
  contentType?: string;
  bucket: string;
}

/**
 * Sube un archivo directamente a Cloudflare R2 vía S3 PutObjectCommand.
 */
export async function uploadBufferToR2(options: UploadOptions): Promise<UploadResult> {
  const client = getR2Client();
  const config = getR2Config();

  if (!client) {
    throw new Error('Cloudflare R2 no está configurado (faltan R2_ACCOUNT_ID, R2_ACCESS_KEY_ID o R2_SECRET_ACCESS_KEY)');
  }

  const contentType = options.contentType || 'application/octet-stream';

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: options.key,
    Body: options.body,
    ContentType: contentType,
    Metadata: options.metadata,
  });

  await client.send(command);

  const publicUrl = `${config.publicDomain}/${options.key}`;
  logger.info('R2Client', `Archivo subido exitosamente a R2: ${options.key}`);

  return {
    key: options.key,
    url: publicUrl,
    contentType,
    bucket: config.bucketName,
  };
}

export interface PresignedUploadOptions {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

/**
 * Genera una URL prefirmada (PUT) para que el navegador suba directamente a R2 sin consumir memoria del servidor.
 */
export async function generateR2PresignedUploadUrl(
  options: PresignedUploadOptions
): Promise<PresignedUploadResult> {
  const client = getR2Client();
  const config = getR2Config();

  if (!client) {
    throw new Error('Cloudflare R2 no está configurado');
  }

  const expiresIn = options.expiresInSeconds || 300; // 5 minutos por defecto

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: options.key,
    ContentType: options.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  const publicUrl = `${config.publicDomain}/${options.key}`;

  return {
    uploadUrl,
    publicUrl,
    key: options.key,
    expiresIn,
  };
}

/**
 * Genera una URL prefirmada (GET) para descargar o previsualizar un objeto privado.
 */
export async function generateR2PresignedDownloadUrl(
  key: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const client = getR2Client();
  const config = getR2Config();

  if (!client) {
    throw new Error('Cloudflare R2 no está configurado');
  }

  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Elimina un objeto de Cloudflare R2.
 */
export async function deleteR2Object(key: string): Promise<boolean> {
  const client = getR2Client();
  const config = getR2Config();

  if (!client) {
    throw new Error('Cloudflare R2 no está configurado');
  }

  const command = new DeleteObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  await client.send(command);
  logger.info('R2Client', `Archivo eliminado de R2: ${key}`);
  return true;
}

/**
 * Verifica la salud y conectividad del bucket de Cloudflare R2.
 */
export async function checkR2Health(): Promise<{
  configured: boolean;
  connected: boolean;
  bucket: string;
  publicDomain: string;
  error?: string;
}> {
  const config = getR2Config();
  const configured = isR2Configured();

  if (!configured) {
    return {
      configured: false,
      connected: false,
      bucket: config.bucketName,
      publicDomain: config.publicDomain,
      error: 'Credenciales de R2 no configuradas',
    };
  }

  const client = getR2Client();
  if (!client) {
    return {
      configured: false,
      connected: false,
      bucket: config.bucketName,
      publicDomain: config.publicDomain,
      error: 'No se pudo instanciar el cliente S3',
    };
  }

  try {
    const command = new HeadBucketCommand({ Bucket: config.bucketName });
    await client.send(command);
    return {
      configured: true,
      connected: true,
      bucket: config.bucketName,
      publicDomain: config.publicDomain,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.warn('R2Client', `Check de salud R2 falló: ${errorMessage}`);
    return {
      configured: true,
      connected: false,
      bucket: config.bucketName,
      publicDomain: config.publicDomain,
      error: errorMessage,
    };
  }
}
