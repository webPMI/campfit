/**
 * Tests unitarios para adminRender.ts
 *
 * @module tests/unit/lib/admin/adminRender.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/shared/ui', () => ({
  escapeHtml: (s: string) => s,
  getUserInitial: (name: string) => name.charAt(0).toUpperCase(),
  formatDate: () => '01/01/2024',
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockUser = {
  uid: 'uid-123',
  name: 'Juan Pérez',
  email: 'juan@test.com',
  role: 'trainer' as const,
  assignedTrainerId: undefined,
  hasActiveAlert: false,
};

const mockClient = {
  uid: 'client-123',
  name: 'María García',
  email: 'maria@test.com',
  role: 'client' as const,
  assignedTrainerId: 'trainer-456',
  hasActiveAlert: false,
};

const mockTrainer = {
  uid: 'trainer-123',
  name: 'Carlos López',
  email: 'carlos@test.com',
  role: 'trainer' as const,
  clientCount: 5,
  hasActiveAlert: false,
};

describe('adminRender', () => {
  describe('renderUserRow', () => {
    it('debería renderizar una fila de usuario', async () => {
      const { renderUserRow } = await import('@/lib/admin/adminRender');
      const html = renderUserRow(mockUser);

      expect(html).toContain('Juan Pérez');
      expect(html).toContain('juan@test.com');
      expect(html).toContain('trainer');
      expect(html).toContain('rounded-xl');
    });

    it('debería incluir el onclick si se proporciona', async () => {
      const { renderUserRow } = await import('@/lib/admin/adminRender');
      const html = renderUserRow(mockUser, "alert('test')");

      expect(html).toContain("onclick=\"alert('test')\"");
      expect(html).toContain('cursor-pointer');
    });

    it('debería mostrar badge de alerta activa', async () => {
      const { renderUserRow } = await import('@/lib/admin/adminRender');
      const html = renderUserRow({ ...mockUser, hasActiveAlert: true });

      expect(html).toContain('bg-red-500');
      expect(html).toContain('animate-pulse');
    });

    it('debería manejar usuario sin nombre', async () => {
      const { renderUserRow } = await import('@/lib/admin/adminRender');
      const html = renderUserRow({ ...mockUser, name: '' });

      expect(html).toContain('Sin nombre');
    });
  });

  describe('renderUserDetail', () => {
    it('debería renderizar el detalle del usuario', async () => {
      const { renderUserDetail } = await import('@/lib/admin/adminRender');
      const html = renderUserDetail(mockUser);

      expect(html).toContain('Juan Pérez');
      expect(html).toContain('juan@test.com');
      expect(html).toContain('trainer');
      expect(html).toContain('Creado:');
    });
  });

  describe('renderUserForm', () => {
    it('debería renderizar el formulario con opciones de trainer', async () => {
      const trainers = [
        { uid: 't1', name: 'Trainer 1', email: 't1@test.com', role: 'trainer' as const, hasActiveAlert: false },
        { uid: 't2', name: 'Trainer 2', email: 't2@test.com', role: 'trainer' as const, hasActiveAlert: false },
      ];

      const { renderUserForm } = await import('@/lib/admin/adminRender');
      const html = renderUserForm(trainers);

      expect(html).toContain('Nombre completo');
      expect(html).toContain('Email');
      expect(html).toContain('Contraseña');
      expect(html).toContain('Trainer 1');
      expect(html).toContain('Trainer 2');
    });

    it('debería preseleccionar rol y trainer', async () => {
      const trainers = [
        { uid: 't1', name: 'Trainer 1', email: 't1@test.com', role: 'trainer' as const, hasActiveAlert: false },
      ];

      const { renderUserForm } = await import('@/lib/admin/adminRender');
      const html = renderUserForm(trainers, 'admin', 't1');

      expect(html).toContain('selected');
    });
  });

  describe('renderUserCard', () => {
    it('debería renderizar una tarjeta de usuario', async () => {
      const { renderUserCard } = await import('@/lib/admin/adminRender');
      const html = renderUserCard(mockUser);

      expect(html).toContain('Juan Pérez');
    });
  });

  describe('renderUserCardExtended', () => {
    it('debería renderizar tarjeta con botón de editar', async () => {
      const { renderUserCardExtended } = await import('@/lib/admin/adminRender');
      const html = renderUserCardExtended(mockUser, true);

      expect(html).toContain('data-edit-user');
      expect(html).toContain('data-uid="uid-123"');
    });

    it('debería renderizar tarjeta sin botón de editar', async () => {
      const { renderUserCardExtended } = await import('@/lib/admin/adminRender');
      const html = renderUserCardExtended(mockUser, false);

      expect(html).not.toContain('data-edit-user');
    });
  });

  describe('renderClientCard', () => {
    it('debería renderizar una tarjeta de cliente', async () => {
      const { renderClientCard } = await import('@/lib/admin/adminRender');
      const html = renderClientCard(mockClient);

      expect(html).toContain('María García');
      expect(html).toContain('maria@test.com');
      expect(html).toContain('trainer-456');
    });
  });

  describe('renderTrainerCard', () => {
    it('debería renderizar una tarjeta de entrenador con conteo', async () => {
      const { renderTrainerCard } = await import('@/lib/admin/adminRender');
      const html = renderTrainerCard(mockTrainer);

      expect(html).toContain('Carlos López');
      expect(html).toContain('carlos@test.com');
      expect(html).toContain('5');
      expect(html).toContain('clientes');
    });

    it('debería mostrar 0 clientes si no se proporciona conteo', async () => {
      const { renderTrainerCard } = await import('@/lib/admin/adminRender');
      const html = renderTrainerCard({ ...mockTrainer, clientCount: undefined });

      expect(html).toContain('0');
    });
  });
});
