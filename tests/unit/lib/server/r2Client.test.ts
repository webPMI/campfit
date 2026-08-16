/**
 * Tests para el cliente de servidor Cloudflare R2 (r2Client.ts)
 *
 * @module tests/unit/lib/server/r2Client.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getR2Config,
  isR2Configured,
  getR2Client,
  checkR2Health,
} from '@/lib/server/r2Client';

describe('r2Client', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('isR2Configured y getR2Config', () => {
    it('debería retornar false si faltan variables de entorno', () => {
      delete process.env.R2_ACCOUNT_ID;
      delete process.env.R2_ACCESS_KEY_ID;
      delete process.env.R2_SECRET_ACCESS_KEY;

      expect(isR2Configured()).toBe(false);
      expect(getR2Client()).toBeNull();
    });

    it('debería retornar true si todas las credenciales están presentes', () => {
      process.env.R2_ACCOUNT_ID = 'test-account-id-1234567890abcdef';
      process.env.R2_ACCESS_KEY_ID = 'test-access-key-id';
      process.env.R2_SECRET_ACCESS_KEY = 'test-secret-access-key';
      process.env.R2_BUCKET_NAME = 'my-custom-bucket';
      process.env.R2_PUBLIC_DOMAIN = 'https://media.campfit.com';

      expect(isR2Configured()).toBe(true);

      const config = getR2Config();
      expect(config.accountId).toBe('test-account-id-1234567890abcdef');
      expect(config.bucketName).toBe('my-custom-bucket');
      expect(config.publicDomain).toBe('https://media.campfit.com');
    });
  });

  describe('checkR2Health', () => {
    it('debería reportar no configurado cuando no hay credenciales', async () => {
      delete process.env.R2_ACCOUNT_ID;
      delete process.env.R2_ACCESS_KEY_ID;
      delete process.env.R2_SECRET_ACCESS_KEY;

      const health = await checkR2Health();
      expect(health.configured).toBe(false);
      expect(health.connected).toBe(false);
    });
  });
});
