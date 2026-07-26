/**
 * Tests unitarios para trainerInit.ts
 *
 * @module tests/unit/lib/trainer/trainerInit.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
  delete (window as unknown as Record<string, unknown>).__trainerId;
});

describe('trainerInit', () => {
  describe('initGlobalActions', () => {
    it('debería establecer __trainerId en window', async () => {
      const { initGlobalActions } = await import('@/lib/trainer/trainerInit');
      initGlobalActions('trainer-123');

      expect((window as unknown as Record<string, unknown>).__trainerId).toBe('trainer-123');
    });
  });
});
