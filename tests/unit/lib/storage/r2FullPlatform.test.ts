import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  uploadFileToR2,
  uploadProgressPhotoToR2,
  uploadChatMedia,
  uploadAvatar,
  uploadFoodImage,
  uploadExerciseMedia,
  validateImageFile,
  validateMediaFile,
  generateLocalPreview,
  getR2HealthStatus,
} from '@/lib/storage/r2Service';

describe('R2 Storage - Integración en Toda la Plataforma', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Fotos de Evolución Corporal (/client/progress)', () => {
    it('debería subir foto frontal a Cloudflare R2 con metadatos correctos', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/progress/client-101/front-178000.jpg',
          key: 'progress/client-101/front-178000.jpg',
          bucket: 'campfit',
          provider: 'cloudflare_r2',
        }),
      } as unknown as Response);
      global.fetch = mockFetch;

      const file = new File(['fake-image-bytes'], 'front.jpg', { type: 'image/jpeg' });
      const result = await uploadProgressPhotoToR2(file, 'client-101', 'front');

      expect(result.success).toBe(true);
      expect(result.photoUrl).toContain('progress/client-101');
      expect(result.angle).toBe('front');
      expect(result.clientId).toBe('client-101');
      expect(result.storageProvider).toBe('cloudflare_r2');
    });

    it('debería validar tipos de imagen permitidos para progreso (JPEG, PNG, WebP, HEIC)', () => {
      const validJpg = new File([''], 'photo.jpg', { type: 'image/jpeg' });
      const validPng = new File([''], 'photo.png', { type: 'image/png' });
      const validWebp = new File([''], 'photo.webp', { type: 'image/webp' });
      const invalidExe = new File([''], 'script.exe', { type: 'application/x-msdownload' });

      expect(validateImageFile(validJpg).valid).toBe(true);
      expect(validateImageFile(validPng).valid).toBe(true);
      expect(validateImageFile(validWebp).valid).toBe(true);
      expect(validateImageFile(invalidExe).valid).toBe(false);
    });
  });

  describe('2. Chat Multimedia (/client/chat & /trainer/chat)', () => {
    it('debería subir vídeos de técnica y ejercicios adjuntos al chat', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/chat/trainer-1/squat-technique.mp4',
          key: 'chat/trainer-1/squat-technique.mp4',
          bucket: 'campfit',
          provider: 'cloudflare_r2',
        }),
      } as unknown as Response);
      global.fetch = mockFetch;

      const videoFile = new File(['fake-video-bytes'], 'squat-technique.mp4', { type: 'video/mp4' });
      const result = await uploadChatMedia(videoFile, 'trainer-1');

      expect(result.url).toContain('chat/trainer-1');
      expect(result.type).toBe('video');
      expect(result.provider).toBe('cloudflare_r2');
      expect(validateMediaFile(videoFile).valid).toBe(true);
    });

    it('debería rechazar archivos mayores a 50MB en chat', () => {
      const bigFile = new File([''], 'huge.mp4', { type: 'video/mp4' });
      Object.defineProperty(bigFile, 'size', { value: 60 * 1024 * 1024 });

      const validation = validateMediaFile(bigFile, 50);
      expect(validation.valid).toBe(false);
      expect(validation.message).toContain('supera el límite');
    });
  });

  describe('3. Avatar de Perfil de Usuario (profileService)', () => {
    it('debería subir avatar a R2 y retornar URL pública', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/avatars/user-42/avatar.jpg',
          key: 'avatars/user-42/avatar.jpg',
          provider: 'cloudflare_r2',
        }),
      } as unknown as Response);
      global.fetch = mockFetch;

      const avatarFile = new File(['avatar-bytes'], 'profile.png', { type: 'image/png' });
      const res = await uploadAvatar(avatarFile, 'user-42');

      expect(res.url).toContain('avatars/user-42');
      expect(res.provider).toBe('cloudflare_r2');
    });

    it('debería validar que el avatar no supere 2MB y sea formato compatible (JPG/PNG/WebP)', async () => {
      const { validateAvatarFile } = await import('@/lib/storage/r2Service');
      const validJpg = new File(['small'], 'pic.jpg', { type: 'image/jpeg' });
      const validWebp = new File(['small'], 'pic.webp', { type: 'image/webp' });
      const invalidGif = new File(['small'], 'pic.gif', { type: 'image/gif' });

      const oversizedFile = new File([''], 'big.jpg', { type: 'image/jpeg' });
      Object.defineProperty(oversizedFile, 'size', { value: 3 * 1024 * 1024 });

      expect(validateAvatarFile(validJpg, 2).valid).toBe(true);
      expect(validateAvatarFile(validWebp, 2).valid).toBe(true);
      expect(validateAvatarFile(invalidGif, 2).valid).toBe(false);
      expect(validateAvatarFile(oversizedFile, 2).valid).toBe(false);
    });
  });

  describe('4. Biblioteca Nutricional y Catálogo de Ejercicios', () => {
    it('debería subir imágenes de alimentos con folder foods/', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/foods/food-salmon/salmon.jpg',
          key: 'foods/food-salmon/salmon.jpg',
          provider: 'cloudflare_r2',
        }),
      } as unknown as Response);
      global.fetch = mockFetch;

      const foodFile = new File(['food'], 'salmon.jpg', { type: 'image/jpeg' });
      const res = await uploadFoodImage(foodFile, 'food-salmon');

      expect(res.url).toContain('foods/food-salmon');
      expect(res.provider).toBe('cloudflare_r2');
    });

    it('debería subir vídeos o miniaturas de ejercicios con folder exercises/', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/exercises/ex-bench/press.mp4',
          key: 'exercises/ex-bench/press.mp4',
          provider: 'cloudflare_r2',
        }),
      } as unknown as Response);
      global.fetch = mockFetch;

      const exFile = new File(['ex'], 'press.mp4', { type: 'video/mp4' });
      const res = await uploadExerciseMedia(exFile, 'ex-bench');

      expect(res.url).toContain('exercises/ex-bench');
      expect(res.type).toBe('video');
      expect(res.provider).toBe('cloudflare_r2');
    });
  });

  describe('5. Resiliencia, Fallback y Diagnóstico', () => {
    it('debería activar fallback reactivo si el endpoint de subida falla o no está disponible', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const file = new File(['offline-img'], 'offline.jpg', { type: 'image/jpeg' });
      const result = await uploadFileToR2(file, { folder: 'general', entityId: 'offline-user' });

      expect(result.provider).toBe('local_preview');
      expect(result.url).toContain('data:image/jpeg;base64,');
    });

    it('debería generar previsualizaciones locales síncronas/asíncronas', async () => {
      const file = new File(['sample'], 'sample.png', { type: 'image/png' });
      const preview = await generateLocalPreview(file);

      expect(preview).toContain('data:image/png;base64,');
    });

    it('debería diagnosticar la salud de Cloudflare R2 vía healthcheck', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'ok',
          connected: true,
          configured: true,
          service: 'CampFit R2 Storage Worker',
          bucket: 'campfit',
        }),
      } as unknown as Response);

      const health = await getR2HealthStatus('https://campfit-storage.servicioweb-pmi.workers.dev/health');
      expect(health.connected).toBe(true);
      expect(health.bucket).toBe('campfit');
    });
  });
});
