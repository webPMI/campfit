/**
 * Tests unitarios para roleRedirect.
 *
 * getDashboardPath es una función pura → fácil de testear.
 * getUserRole y redirectByRole dependen de Firebase → requieren mock.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de @/lib/firebase para que roleRedirect pueda importarlo
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
}));

import { getDashboardPath } from '../../../../src/lib/auth/roleRedirect';
import type { UserRole } from '../../../../src/lib/auth/roleRedirect';

// ─── Tests: getDashboardPath (función pura) ────────────────────────────────

describe('getDashboardPath', () => {
  it('✅ should return /trainer/dashboard for trainer role', () => {
    expect(getDashboardPath('trainer')).toBe('/trainer/dashboard');
  });

  it('✅ should return /admin/dashboard for admin role', () => {
    expect(getDashboardPath('admin')).toBe('/admin/dashboard');
  });

  it('✅ should return /client/dashboard for client role', () => {
    expect(getDashboardPath('client')).toBe('/client/dashboard');
  });

  it('⚠️ should return /client/dashboard for unknown role (default)', () => {
    expect(getDashboardPath('unknown' as UserRole)).toBe('/client/dashboard');
  });
});
