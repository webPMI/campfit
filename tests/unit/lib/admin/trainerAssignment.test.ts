import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assignTrainer, updateUserProfile, updateUserRole, toggleUserBlock } from '@/lib/admin/adminUsers';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, coll, id) => ({ path: `${coll}/${id}`, id })),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  getDoc: vi.fn().mockResolvedValue({ exists: () => true, data: () => ({ name: 'Test User' }) }),
  serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
  collection: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'admin-1' } },
}));

vi.mock('@/lib/shared/ui', () => ({
  showToast: vi.fn(),
  showConfirm: vi.fn(),
  escapeHtml: vi.fn((s) => s),
  formatDate: vi.fn(() => '2026-08-17'),
  getRoleBadge: vi.fn(() => ({ label: 'Admin', class: 'bg-blue-500' })),
  renderEmptyState: vi.fn(() => '<div>Empty</div>'),
  ICONS: {},
}));

vi.mock('@/lib/shared/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Admin — Asignación de Entrenadores y Gestión de Perfiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('assignTrainer debe asociar un nuevo entrenador al cliente en Firestore', async () => {
    const res = await assignTrainer('client-123', 'trainer-999');
    expect(res).toBe(true);
    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/client-123' }),
      expect.objectContaining({
        assignedTrainerId: 'trainer-999',
      })
    );
  });

  it('assignTrainer debe desasignar el entrenador pasando null', async () => {
    const res = await assignTrainer('client-123', null);
    expect(res).toBe(true);
    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/client-123' }),
      expect.objectContaining({
        assignedTrainerId: null,
      })
    );
  });

  it('updateUserProfile debe limpiar assignedTrainerId si el nuevo rol es trainer', async () => {
    const res = await updateUserProfile('user-456', {
      name: 'Nuevo Trainer',
      email: 'trainer@campfit.com',
      role: 'trainer',
      assignedTrainerId: 'trainer-999', // Debe ignorarse y setearse a null
    });
    expect(res).toBe(true);
    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/user-456' }),
      expect.objectContaining({
        role: 'trainer',
        assignedTrainerId: null,
      })
    );
  });

  it('updateUserProfile debe permitir asignar entrenador si el rol es client', async () => {
    const res = await updateUserProfile('client-789', {
      name: 'Cliente Activo',
      email: 'client@campfit.com',
      role: 'client',
      assignedTrainerId: 'trainer-100',
    });
    expect(res).toBe(true);
    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/client-789' }),
      expect.objectContaining({
        role: 'client',
        assignedTrainerId: 'trainer-100',
      })
    );
  });

  it('toggleUserBlock debe registrar la fecha de bloqueo con serverTimestamp', async () => {
    const res = await toggleUserBlock('user-bad', true);
    expect(res).toBe(true);
    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/user-bad' }),
      expect.objectContaining({
        isBlocked: true,
        blockedAt: expect.any(Object),
      })
    );
  });

  it('toggleUserBlock debe limpiar blockedAt al desbloquear', async () => {
    const res = await toggleUserBlock('user-bad', false);
    expect(res).toBe(true);
    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/user-bad' }),
      expect.objectContaining({
        isBlocked: false,
        blockedAt: null,
      })
    );
  });
});
