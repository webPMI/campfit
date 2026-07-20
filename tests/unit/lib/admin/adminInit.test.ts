/**
 * Tests unitarios para adminInit.ts
 *
 * @module tests/unit/lib/admin/adminInit.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
  delete (window as unknown as Record<string, unknown>).__adminId;
});

describe('adminInit', () => {
  describe('initGlobalActions', () => {
    it('debería establecer __adminId en window', async () => {
      const { initGlobalActions } = await import('@/lib/admin/adminInit');
      initGlobalActions('admin-123');

      expect((window as unknown as Record<string, unknown>).__adminId).toBe('admin-123');
    });
  });

  describe('initAdminActions', () => {
    it('debería establecer __adminId en window', async () => {
      const { initAdminActions } = await import('@/lib/admin/adminInit');
      initAdminActions('admin-456');

      expect((window as unknown as Record<string, unknown>).__adminId).toBe('admin-456');
    });
  });
});
