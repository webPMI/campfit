import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/admin/adminAuth', () => ({
  requireAdmin: vi.fn(),
  signOutUser: vi.fn(),
}));
vi.mock('@/lib/admin/adminUsers', () => ({
  createUser: vi.fn(),
  updateUserRole: vi.fn(),
  assignTrainer: vi.fn(),
  deleteUser: vi.fn(),
  toggleUserBlock: vi.fn(),
  getUserName: vi.fn(),
  getUserProfile: vi.fn(),
}));
vi.mock('@/lib/admin/adminSubscriptions', () => ({
  subscribeToUsers: vi.fn(),
  subscribeToUsersByRole: vi.fn(),
  subscribeToCollectionCount: vi.fn(),
  subscribeToRecentUsers: vi.fn(),
  getTrainerClientCount: vi.fn(),
  getPaginatedUsers: vi.fn(),
}));
vi.mock('@/lib/admin/adminRender', () => ({
  renderUserRow: vi.fn(),
  renderUserDetail: vi.fn(),
  renderUserForm: vi.fn(),
  renderUserCard: vi.fn(),
  renderUserCardExtended: vi.fn(),
  renderClientCard: vi.fn(),
  renderTrainerCard: vi.fn(),
}));
vi.mock('@/lib/admin/adminInit', () => ({
  initGlobalActions: vi.fn(),
  initAdminActions: vi.fn(),
}));

import * as adminUtils from '@/lib/admin/adminUtils';

describe('adminUtils barrel', () => {
  it('should export requireAdmin and signOutUser from adminAuth', () => {
    expect(adminUtils).toHaveProperty('requireAdmin');
    expect(adminUtils).toHaveProperty('signOutUser');
  });

  it('should export CRUD functions from adminUsers', () => {
    expect(adminUtils).toHaveProperty('createUser');
    expect(adminUtils).toHaveProperty('updateUserRole');
    expect(adminUtils).toHaveProperty('assignTrainer');
    expect(adminUtils).toHaveProperty('deleteUser');
    expect(adminUtils).toHaveProperty('toggleUserBlock');
    expect(adminUtils).toHaveProperty('getUserName');
    expect(adminUtils).toHaveProperty('getUserProfile');
  });

  it('should export subscription functions from adminSubscriptions', () => {
    expect(adminUtils).toHaveProperty('subscribeToUsers');
    expect(adminUtils).toHaveProperty('subscribeToUsersByRole');
    expect(adminUtils).toHaveProperty('subscribeToCollectionCount');
    expect(adminUtils).toHaveProperty('subscribeToRecentUsers');
    expect(adminUtils).toHaveProperty('getTrainerClientCount');
    expect(adminUtils).toHaveProperty('getPaginatedUsers');
  });

  it('should export render functions from adminRender', () => {
    expect(adminUtils).toHaveProperty('renderUserRow');
    expect(adminUtils).toHaveProperty('renderUserDetail');
    expect(adminUtils).toHaveProperty('renderUserForm');
    expect(adminUtils).toHaveProperty('renderUserCard');
    expect(adminUtils).toHaveProperty('renderUserCardExtended');
    expect(adminUtils).toHaveProperty('renderClientCard');
    expect(adminUtils).toHaveProperty('renderTrainerCard');
  });

  it('should export init functions from adminInit', () => {
    expect(adminUtils).toHaveProperty('initGlobalActions');
    expect(adminUtils).toHaveProperty('initAdminActions');
  });

  it('should export types', () => {
    expect(adminUtils).toHaveProperty('AdminUser');
    expect(adminUtils).toHaveProperty('CreateUserPayload');
  });

  it('should have the correct total number of exports', () => {
    const exports = Object.keys(adminUtils);
    expect(exports.length).toBeGreaterThanOrEqual(24);
  });
});
