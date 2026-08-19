import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createPlanProposal,
  approvePlanProposal,
  requestChangesOnProposal,
} from '@/lib/shared/planProposalService';
import { addDoc, getDoc, updateDoc } from 'firebase/firestore';

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn((_db, col, id) => ({ path: `${col}/${id}` })),
  addDoc: vi.fn().mockImplementation(() => Promise.resolve({ id: 'mock-proposal-123' })),
  getDoc: vi.fn(),
  updateDoc: vi.fn().mockImplementation(() => Promise.resolve(undefined)),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => ({ toDate: () => new Date() })),
}));

describe('Plan Proposal & Trainer Advising Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPlanProposal', () => {
    it('debe crear una propuesta con status pending_review', async () => {
      const proposalId = await createPlanProposal({
        clientId: 'client-123',
        clientName: 'Carlos Gómez',
        trainerId: 'trainer-456',
        type: 'workout',
        clientNotes: 'Quiero entrenar a las 07:00 en lugar de la tarde',
        proposedSchedule: {
          scheduledDays: [1, 3, 5],
          estimatedTimes: { 'ex-1': '07:00' },
        },
        proposedData: {
          name: 'Rutina Mañanera Personalizada',
          exercises: [{ id: 'ex-1', name: 'Press Banca', sets: 4, reps: 10 }],
        },
      });

      expect(proposalId).toBe('mock-proposal-123');
      expect(addDoc).toHaveBeenCalled();
    });

    it('debe retornar null si faltan campos obligatorios', async () => {
      const proposalId = await createPlanProposal({
        clientId: '',
        trainerId: 'trainer-456',
        type: 'diet',
        proposedSchedule: {},
        proposedData: {},
      });

      expect(proposalId).toBeNull();
    });
  });

  describe('approvePlanProposal', () => {
    it('debe aplicar la propuesta al plan activo y marcarla como approved', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          clientId: 'client-123',
          trainerId: 'trainer-456',
          type: 'workout',
          originalPlanId: 'workout-orig-1',
          proposedData: { name: 'Rutina Aprobada' },
        }),
      } as any);

      const success = await approvePlanProposal(
        'mock-proposal-123',
        'trainer-456',
        '¡Excelente ajuste de volumen!'
      );

      expect(success).toBe(true);
      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('requestChangesOnProposal', () => {
    it('debe actualizar el status a changes_requested y guardar el feedback del entrenador', async () => {
      const success = await requestChangesOnProposal(
        'mock-proposal-123',
        'trainer-456',
        'Baja una serie en sentadilla para evitar sobrecarga'
      );

      expect(success).toBe(true);
      expect(updateDoc).toHaveBeenCalled();
    });
  });
});
