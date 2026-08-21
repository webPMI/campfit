import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAddDoc, mockUpdateDoc, mockOnSnapshot } = vi.hoisted(() => ({
  mockAddDoc: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockOnSnapshot: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ id: name })),
  doc: vi.fn((_db, coll, id) => ({ id: `${coll}-${id}` })),
  query: vi.fn((...args) => ({ queryArgs: args })),
  where: vi.fn((f, op, v) => ({ field: f, op, value: v })),
  orderBy: vi.fn((f, dir) => ({ field: f, dir })),
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  onSnapshot: mockOnSnapshot,
  serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('@/lib/shared/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import {
  createSupportTicket,
  subscribeToUserSupportTickets,
  subscribeToAllSupportTickets,
  updateSupportTicketStatus,
  sendAdminContactMessage,
} from '@/lib/support/supportTicketService';

describe('SupportTicketService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSupportTicket', () => {
    it('debería crear un ticket de soporte correctamente', async () => {
      mockAddDoc.mockResolvedValue({ id: 'ticket-123' });

      const result = await createSupportTicket({
        reporterUid: 'user-001',
        reporterEmail: 'user@campfit.com',
        reporterName: 'Carlos Gómez',
        title: 'Error en gráfica de peso',
        description: 'La gráfica no actualiza al ingresar nuevos pesos.',
        category: 'bug',
        severity: 'high',
      });

      expect(result.success).toBe(true);
      expect(result.ticketId).toBe('ticket-123');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          reporterUid: 'user-001',
          title: 'Error en gráfica de peso',
          category: 'bug',
          severity: 'high',
          status: 'open',
          isAnonymous: false,
        }),
      );
    });

    it('debería soportar creación de tickets anónimos ocultando datos de contacto', async () => {
      mockAddDoc.mockResolvedValue({ id: 'ticket-anon' });

      const result = await createSupportTicket({
        reporterUid: 'user-anon',
        reporterEmail: 'hidden@secret.com',
        reporterName: 'Secret User',
        title: 'Sugerencia para el gimnasio',
        description: 'Sería genial añadir más discos de 5kg.',
        category: 'suggestion',
        isAnonymous: true,
      });

      expect(result.success).toBe(true);
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          reporterEmail: '',
          reporterName: 'Anónimo',
          isAnonymous: true,
        }),
      );
    });

    it('debería rechazar si falta título o descripción', async () => {
      const resEmptyTitle = await createSupportTicket({
        reporterUid: 'u-1',
        title: '',
        description: 'desc',
        category: 'bug',
      });
      expect(resEmptyTitle.success).toBe(false);

      const resEmptyDesc = await createSupportTicket({
        reporterUid: 'u-1',
        title: 'Title',
        description: '   ',
        category: 'bug',
      });
      expect(resEmptyDesc.success).toBe(false);
    });
  });

  describe('updateSupportTicketStatus & sendAdminContactMessage', () => {
    it('debería actualizar el estado del ticket y añadir nota interna', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const ok = await updateSupportTicketStatus(
        'ticket-123',
        'resolved',
        'Se verificó y corrigió el fallo',
        [],
      );

      expect(ok).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'resolved',
          adminNotes: [
            expect.objectContaining({ content: 'Se verificó y corrigió el fallo' }),
          ],
        }),
      );
    });

    it('debería enviar mensaje de contacto del admin', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const ok = await sendAdminContactMessage(
        'ticket-123',
        'Hola, ¿nos puedes dar más detalles?',
        'admin@campfit.com',
        [],
      );

      expect(ok).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'awaiting_response',
          adminContactMessages: [
            expect.objectContaining({
              message: 'Hola, ¿nos puedes dar más detalles?',
              senderRole: 'admin',
              senderEmail: 'admin@campfit.com',
            }),
          ],
        }),
      );
    });
  });

  describe('subscribeToUserSupportTickets & subscribeToAllSupportTickets', () => {
    it('debería configurar la query para el usuario específico', () => {
      mockOnSnapshot.mockImplementation((_q, cb) => {
        cb({ docs: [{ id: 't-1', data: () => ({ title: 'Ticket 1' }) }] });
        return vi.fn();
      });

      const callback = vi.fn();
      const unsub = subscribeToUserSupportTickets('user-001', callback);

      expect(callback).toHaveBeenCalledWith([expect.objectContaining({ id: 't-1', title: 'Ticket 1' })]);
      expect(unsub).toBeInstanceOf(Function);
    });

    it('debería permitir a admins suscribirse a todos los tickets', () => {
      mockOnSnapshot.mockImplementation((_q, cb) => {
        cb({ docs: [{ id: 't-global', data: () => ({ title: 'Ticket Global' }) }] });
        return vi.fn();
      });

      const callback = vi.fn();
      const unsub = subscribeToAllSupportTickets(callback);

      expect(callback).toHaveBeenCalledWith([expect.objectContaining({ id: 't-global' })]);
      expect(unsub).toBeInstanceOf(Function);
    });
  });
});
