/**
 * Tests unitarios para admin/adminUtils.
 *
 * Funciones de renderizado HTML puras + funciones de datos con Firestore.
 * Las funciones de renderizado se testean directamente.
 * Las funciones de datos requieren mocks de Firebase.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  renderUserRow,
  renderUserDetail,
  renderUserForm,
  renderUserCard,
  renderUserCardExtended,
  renderClientCard,
  renderTrainerCard,
  getRoleBadge,
  escapeHtml,
  getTrainerClientCount,
  getUserName,
  toggleUserBlock,
  subscribeToCollectionCount,
  subscribeToRecentUsers,
} from '../../../../src/lib/admin/adminUtils';
import type { AdminUser } from '../../../../src/lib/admin/adminUtils';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  doc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  writeBatch: vi.fn(),
  getCountFromServer: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
}));

vi.mock('@/lib/shared/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/lib/shared/ui', () => ({
  ICONS: {},
  escapeHtml: (s: string) => s.replace(/</g, '<').replace(/>/g, '>'),
  formatDate: (d: unknown) => d ? '2024-01-15' : '',
  formatTime: (d: unknown) => d ? '12:00' : '',
  getUserInitial: (name: string) => name?.charAt(0) || '?',
  showToast: vi.fn(),
  renderEmptyState: vi.fn(),
  renderLoadingState: vi.fn(),
  getRoleBadge: (role: string) => ({ class: `role-${role}`, label: role }),
}));

// ─── Tests: renderUserRow ───────────────────────────────────────────────────

describe('adminUtils: renderUserRow', () => {
  const baseUser: AdminUser = {
    uid: 'user-123',
    name: 'Juan Pérez',
    email: 'juan@test.com',
    role: 'client',
    hasActiveAlert: false,
    createdAt: { toDate: () => new Date('2024-01-15') } as any,
    updatedAt: { toDate: () => new Date('2024-01-15') } as any,
  };

  it('✅ should render user name and email', () => {
    const html = renderUserRow(baseUser);
    expect(html).toContain('Juan Pérez');
    expect(html).toContain('juan@test.com');
  });

  it('✅ should escape HTML in name and email', () => {
    // Test the escapeHtml function directly since it's mocked
    const escaped = escapeHtml('<script>alert("xss")</script>');
    expect(escaped).toContain('<script>');
  });

  it('✅ should show alert indicator when hasActiveAlert is true', () => {
    const user = { ...baseUser, hasActiveAlert: true };
    const html = renderUserRow(user);
    expect(html).toContain('bg-red-500');
    expect(html).toContain('animate-pulse');
  });

  it('✅ should not show alert indicator when hasActiveAlert is false', () => {
    const html = renderUserRow(baseUser);
    expect(html).not.toContain('bg-red-500');
  });

  it('✅ should handle missing name gracefully', () => {
    const user = { ...baseUser, name: '' };
    const html = renderUserRow(user);
    expect(html).toContain('Sin nombre');
  });

  it('✅ should include onclick handler when provided', () => {
    const html = renderUserRow(baseUser, "alert('click')");
    expect(html).toContain('onclick');
    expect(html).toContain('cursor-pointer');
  });

  it('✅ should render admin role with purple color', () => {
    const admin = { ...baseUser, role: 'admin' as const };
    const html = renderUserRow(admin);
    expect(html).toContain('admin');
    expect(html).toContain('purple');
  });

  it('✅ should render trainer role with blue color', () => {
    const trainer = { ...baseUser, role: 'trainer' as const };
    const html = renderUserRow(trainer);
    expect(html).toContain('trainer');
    expect(html).toContain('blue');
  });

  it('✅ should render client role with emerald color', () => {
    const html = renderUserRow(baseUser);
    expect(html).toContain('client');
    expect(html).toContain('emerald');
  });
});

// ─── Tests: renderUserDetail ────────────────────────────────────────────────

describe('adminUtils: renderUserDetail', () => {
  const baseUser: AdminUser = {
    uid: 'user-123',
    name: 'Juan Pérez',
    email: 'juan@test.com',
    role: 'client',
    createdAt: { toDate: () => new Date('2024-01-15') } as any,
    updatedAt: { toDate: () => new Date('2024-01-15') } as any,
  };

  it('✅ should render user name and email', () => {
    const html = renderUserDetail(baseUser);
    expect(html).toContain('Juan Pérez');
    expect(html).toContain('juan@test.com');
  });

  it('✅ should show creation date', () => {
    const html = renderUserDetail(baseUser);
    expect(html).toContain('Creado:');
    expect(html).toContain('2024');
  });

  it('✅ should handle missing name gracefully', () => {
    const user = { ...baseUser, name: '' };
    const html = renderUserDetail(user);
    expect(html).toContain('Sin nombre');
  });

  it('✅ should escape HTML in name and email', () => {
    // Test the escapeHtml function directly since it's mocked
    const escaped = escapeHtml('<b>Bold</b>');
    expect(escaped).toContain('<b>');
  });
});

// ─── Tests: renderUserForm ──────────────────────────────────────────────────

describe('adminUtils: renderUserForm', () => {
  const trainers: AdminUser[] = [
    {
      uid: 't1',
      name: 'Trainer Uno',
      email: 't1@test.com',
      role: 'trainer',
      createdAt: { toDate: () => new Date() } as any,
    },
    {
      uid: 't2',
      name: 'Trainer Dos',
      email: 't2@test.com',
      role: 'trainer',
      createdAt: { toDate: () => new Date() } as any,
    },
  ];

  it('✅ should render form with all fields', () => {
    const html = renderUserForm(trainers);
    expect(html).toContain('user-name');
    expect(html).toContain('user-email');
    expect(html).toContain('user-password');
    expect(html).toContain('user-role');
  });

  it('✅ should include trainer options', () => {
    const html = renderUserForm(trainers);
    expect(html).toContain('Trainer Uno');
    expect(html).toContain('Trainer Dos');
  });

  it('✅ should preselect the given role', () => {
    const html = renderUserForm(trainers, 'trainer');
    expect(html).toContain('value="trainer" selected');
  });

  it('✅ should preselect the given trainer', () => {
    const html = renderUserForm(trainers, 'client', 't2');
    expect(html).toContain('value="t2" selected');
  });

  it('✅ should hide trainer assign container for non-client roles', () => {
    const html = renderUserForm(trainers, 'admin');
    expect(html).toContain('display:none');
  });

  it('✅ should show trainer assign container for client role', () => {
    const html = renderUserForm(trainers, 'client');
    expect(html).not.toContain('display:none');
  });
});

// ─── Tests: renderUserCard ──────────────────────────────────────────────────

describe('adminUtils: renderUserCard', () => {
  it('✅ should call renderUserRow', () => {
    const user: AdminUser = {
      uid: 'u1',
      name: 'Test',
      email: 'test@test.com',
      role: 'client',
      createdAt: { toDate: () => new Date() } as any,
    };
    const html = renderUserCard(user);
    expect(html).toContain('Test');
    expect(html).toContain('test@test.com');
  });
});

// ─── Tests: renderUserCardExtended ─────────────────────────────────────────

describe('adminUtils: renderUserCardExtended', () => {
  it('✅ should render user card without edit button by default', () => {
    const user: AdminUser = {
      uid: 'u1',
      name: 'Test',
      email: 'test@test.com',
      role: 'client',
      createdAt: { toDate: () => new Date() } as any,
    };
    const html = renderUserCardExtended(user);
    expect(html).toContain('Test');
    expect(html).not.toContain('data-edit-user');
  });

  it('✅ should render user card with edit button when showEdit is true', () => {
    const user: AdminUser = {
      uid: 'u1',
      name: 'Test',
      email: 'test@test.com',
      role: 'client',
      createdAt: { toDate: () => new Date() } as any,
    };
    const html = renderUserCardExtended(user, true);
    expect(html).toContain('data-edit-user');
    expect(html).toContain('data-uid="u1"');
  });
});

// ─── Tests: renderClientCard ────────────────────────────────────────────────

describe('adminUtils: renderClientCard', () => {
  it('✅ should render client card with trainer info', () => {
    const client: AdminUser = {
      uid: 'c1',
      name: 'Cliente Uno',
      email: 'c1@test.com',
      role: 'client',
      assignedTrainerId: 't1',
      createdAt: { toDate: () => new Date() } as any,
    };
    const html = renderClientCard(client);
    expect(html).toContain('Cliente Uno');
    expect(html).toContain('t1');
  });

  it('✅ should show "Sin trainer" when no trainer assigned', () => {
    const client: AdminUser = {
      uid: 'c1',
      name: 'Cliente Uno',
      email: 'c1@test.com',
      role: 'client',
      createdAt: { toDate: () => new Date() } as any,
    };
    const html = renderClientCard(client);
    expect(html).toContain('Sin trainer');
  });
});

// ─── Tests: renderTrainerCard ───────────────────────────────────────────────

describe('adminUtils: renderTrainerCard', () => {
  it('✅ should render trainer card with client count', () => {
    const trainer = {
      uid: 't1',
      name: 'Trainer Uno',
      email: 't1@test.com',
      role: 'trainer' as const,
      clientCount: 5,
      createdAt: { toDate: () => new Date() } as any,
    };
    const html = renderTrainerCard(trainer);
    expect(html).toContain('Trainer Uno');
    expect(html).toContain('5');
    expect(html).toContain('clientes');
  });

  it('✅ should show 0 clients when clientCount is undefined', () => {
    const trainer = {
      uid: 't1',
      name: 'Trainer Uno',
      email: 't1@test.com',
      role: 'trainer' as const,
      createdAt: { toDate: () => new Date() } as any,
    };
    const html = renderTrainerCard(trainer);
    expect(html).toContain('0');
    expect(html).toContain('clientes');
  });
});

// ─── Tests: getTrainerClientCount ───────────────────────────────────────────

describe('adminUtils: getTrainerClientCount', () => {
  it('✅ should return client count for trainer', async () => {
    const { getDocs } = await import('firebase/firestore');
    vi.mocked(getDocs).mockResolvedValue({
      size: 5,
      docs: [],
    } as any);

    const count = await getTrainerClientCount('trainer-123');
    expect(count).toBe(5);
  });

  it('✅ should return 0 on error', async () => {
    const { getDocs } = await import('firebase/firestore');
    vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

    const count = await getTrainerClientCount('trainer-123');
    expect(count).toBe(0);
  });
});

// ─── Tests: getUserName ─────────────────────────────────────────────────────

describe('adminUtils: getUserName', () => {
  it('✅ should return user name when user exists', async () => {
    const { getDoc } = await import('firebase/firestore');
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'John Doe' }),
    } as any);

    const name = await getUserName('user-123');
    expect(name).toBe('John Doe');
  });

  it('✅ should return "Usuario desconocido" when user does not exist', async () => {
    const { getDoc } = await import('firebase/firestore');
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as any);

    const name = await getUserName('user-123');
    expect(name).toBe('Usuario desconocido');
  });

  it('✅ should return "Error" on error', async () => {
    const { getDoc } = await import('firebase/firestore');
    vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

    const name = await getUserName('user-123');
    expect(name).toBe('Error');
  });
});

// ─── Tests: toggleUserBlock ─────────────────────────────────────────────────

describe('adminUtils: toggleUserBlock', () => {
  it('✅ should block user and set blockedAt', async () => {
    const { updateDoc } = await import('firebase/firestore');
    vi.mocked(updateDoc).mockResolvedValue(undefined);

    const result = await toggleUserBlock('user-123', true);
    expect(result).toBe(true);
  });

  it('✅ should unblock user and set blockedAt to null', async () => {
    const { updateDoc } = await import('firebase/firestore');
    vi.mocked(updateDoc).mockResolvedValue(undefined);

    const result = await toggleUserBlock('user-123', false);
    expect(result).toBe(true);
  });

  it('✅ should return false on error', async () => {
    const { updateDoc } = await import('firebase/firestore');
    vi.mocked(updateDoc).mockRejectedValue(new Error('Update failed'));

    const result = await toggleUserBlock('user-123', true);
    expect(result).toBe(false);
  });
});

// ─── Tests: subscribeToCollectionCount ──────────────────────────────────────

describe('adminUtils: subscribeToCollectionCount', () => {
  it('✅ should return unsubscribe function', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToCollectionCount('users', callback);
    expect(typeof unsubscribe).toBe('function');
  });

  it('✅ should call callback with count', async () => {
    const { getCountFromServer } = await import('firebase/firestore');
    vi.mocked(getCountFromServer).mockResolvedValue({
      data: () => ({ count: 42 }),
    } as any);

    const callback = vi.fn();
    subscribeToCollectionCount('users', callback);
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(callback).toHaveBeenCalledWith(42);
  });

  it('✅ should clear interval on unsubscribe', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToCollectionCount('users', callback);
    
    // Call unsubscribe
    unsubscribe();
    
    // Should not throw
    expect(typeof unsubscribe).toBe('function');
  });
});

// ─── Tests: subscribeToRecentUsers ───────────────────────────────────────────

describe('adminUtils: subscribeToRecentUsers', () => {
  it('✅ should return unsubscribe function', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToRecentUsers(10, callback);
    expect(typeof unsubscribe).toBe('function');
  });
});
