/**
 * Tests para el servicio de almacenamiento Cloudflare R2 (r2Service.ts)
 *
 * @module tests/unit/lib/storage/r2Service.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateImageFile,
  validateMediaFile,
  uploadProgressPhotoToR2,
  uploadChatMedia,
  uploadAvatar,
  uploadFoodImage,
  uploadExerciseMedia,
  generateLocalPreview,
} from '@/lib/storage/r2Service';

describe('r2Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateImageFile', () => {
    it('debería validar correctamente imágenes JPG, PNG, WebP', () => {
      const jpg = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });
      const png = new File(['dummy content'], 'photo.png', { type: 'image/png' });
      const webp = new File(['dummy content'], 'photo.webp', { type: 'image/webp' });

      expect(validateImageFile(jpg).valid).toBe(true);
      expect(validateImageFile(png).valid).toBe(true);
      expect(validateImageFile(webp).valid).toBe(true);
    });

    it('debería rechazar formatos no permitidos como PDF o EXE', () => {
      const pdf = new File(['dummy content'], 'doc.pdf', { type: 'application/pdf' });
      const res = validateImageFile(pdf);

      expect(res.valid).toBe(false);
      expect(res.message).toContain('Formato no soportado');
    });

    it('debería rechazar imágenes que superen el límite de tamaño', () => {
      const bigFile = new File([''], 'big.jpg', { type: 'image/jpeg' });
      Object.defineProperty(bigFile, 'size', { value: 25 * 1024 * 1024 });

      const res = validateImageFile(bigFile, 15);
      expect(res.valid).toBe(false);
      expect(res.message).toContain('no puede superar los 15MB');
    });
  });

  describe('validateMediaFile', () => {
    it('debería aceptar vídeos MP4 y WebM', () => {
      const mp4 = new File(['dummy video'], 'clip.mp4', { type: 'video/mp4' });
      const webm = new File(['dummy video'], 'clip.webm', { type: 'video/webm' });

      const resMp4 = validateMediaFile(mp4);
      const resWebm = validateMediaFile(webm);

      expect(resMp4.valid).toBe(true);
      expect(resMp4.mediaType).toBe('video');
      expect(resWebm.valid).toBe(true);
      expect(resWebm.mediaType).toBe('video');
    });

    it('debería rechazar vídeos no soportados como AVI', () => {
      const avi = new File(['dummy video'], 'clip.avi', { type: 'video/x-msvideo' });
      const res = validateMediaFile(avi);

      expect(res.valid).toBe(false);
      expect(res.message).toContain('Formato de vídeo no soportado');
    });
  });

  describe('generateLocalPreview', () => {
    it('debería generar una Data URL para un archivo', async () => {
      const file = new File(['test-image-content'], 'test.png', { type: 'image/png' });
      const preview = await generateLocalPreview(file);

      expect(typeof preview).toBe('string');
      expect(preview.startsWith('data:image/png')).toBe(true);
    });
  });

  describe('uploadProgressPhotoToR2', () => {
    it('debería procesar la subida vía API exitosa', async () => {
      const file = new File(['image-bytes'], 'progress_front.jpg', { type: 'image/jpeg' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/progress/client-123/front_123.jpg',
          key: 'progress/client-123/front_123.jpg',
          provider: 'cloudflare_r2',
        }),
      } as unknown as Response);

      const result = await uploadProgressPhotoToR2(file, 'client-123', 'front');

      expect(result.clientId).toBe('client-123');
      expect(result.angle).toBe('front');
      expect(result.photoUrl).toBe('https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/progress/client-123/front_123.jpg');
      expect(result.storageProvider).toBe('cloudflare_r2');
      expect(result.success).toBe(true);
    });

    it('debería utilizar fallback local si el endpoint falla', async () => {
      const file = new File(['image-bytes'], 'progress_side.jpg', { type: 'image/jpeg' });

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await uploadProgressPhotoToR2(file, 'client-123', 'side');

      expect(result.clientId).toBe('client-123');
      expect(result.angle).toBe('side');
      expect(result.storageProvider).toBe('local_preview');
      expect(result.photoUrl.startsWith('data:image/jpeg')).toBe(true);
    });
  });

  describe('uploadChatMedia', () => {
    it('debería procesar imagen para chat', async () => {
      const file = new File(['image-bytes'], 'chat_img.png', { type: 'image/png' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/chat/user-1/123.png',
          provider: 'cloudflare_r2',
        }),
      } as unknown as Response);

      const result = await uploadChatMedia(file, 'user-1');

      expect(result.type).toBe('image');
      expect(result.url).toBe('https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/chat/user-1/123.png');
    });

    it('debería procesar vídeo para chat', async () => {
      const file = new File(['video-bytes'], 'squat.mp4', { type: 'video/mp4' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/chat/user-1/squat.mp4',
          provider: 'cloudflare_r2',
        }),
      } as unknown as Response);

      const result = await uploadChatMedia(file, 'user-1');

      expect(result.type).toBe('video');
      expect(result.url).toBe('https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/chat/user-1/squat.mp4');
    });
  });

  describe('uploadAvatar y uploadFoodImage', () => {
    it('debería subir avatar de usuario', async () => {
      const file = new File(['avatar-bytes'], 'avatar.jpg', { type: 'image/jpeg' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/avatars/u-99/avatar.jpg',
          provider: 'cloudflare_r2',
        }),
      } as unknown as Response);

      const res = await uploadAvatar(file, 'u-99');
      expect(res.url).toBe('https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/avatars/u-99/avatar.jpg');
      expect(res.provider).toBe('cloudflare_r2');
    });

    it('debería subir imagen de alimento', async () => {
      const file = new File(['food-bytes'], 'apple.jpg', { type: 'image/jpeg' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/foods/food-1/apple.jpg',
          provider: 'cloudflare_r2',
        }),
      } as unknown as Response);

      const res = await uploadFoodImage(file, 'food-1');
      expect(res.url).toBe('https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/foods/food-1/apple.jpg');
      expect(res.provider).toBe('cloudflare_r2');
    });

    it('debería subir vídeo de ejercicio', async () => {
      const file = new File(['exercise-bytes'], 'bench_press.mp4', { type: 'video/mp4' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/exercises/ex-1/bench_press.mp4',
          provider: 'cloudflare_r2',
        }),
      } as unknown as Response);

      const result = await uploadExerciseMedia(file, 'ex-1');
      expect(result.type).toBe('video');
      expect(result.url).toBe('https://pub-9d70aa72011f493aa3b1848e9c6f60a0.r2.dev/exercises/ex-1/bench_press.mp4');
    });
  });
});
