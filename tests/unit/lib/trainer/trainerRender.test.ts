/**
 * Tests unitarios para trainerRender.ts
 *
 * @module tests/unit/lib/trainer/trainerRender.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/shared/ui', () => ({
  escapeHtml: (s: string) => s,
  getUserInitial: (name: string) => name.charAt(0).toUpperCase(),
  formatTime: () => '10:30',
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockClient = {
  uid: 'client-123',
  name: 'Ana Martínez',
  email: 'ana@test.com',
  role: 'client' as const,
  assignedTrainerId: 'trainer-123',
  hasActiveAlert: false,
};

const mockWorkout = {
  id: 'w-123',
  clientId: 'client-123',
  trainerId: 'trainer-123',
  name: 'Rutina Push',
  difficulty: 'intermediate',
  description: 'Rutina de empuje con 4 ejercicios',
  exercises: [
    { id: 'ex-1', name: 'Press banca', sets: 4, reps: 8, restTime: '90s', videoUrl: '', description: '', order: 1, dayOfWeek: 1 },
    { id: 'ex-2', name: 'Press militar', sets: 3, reps: 10, restTime: '60s', videoUrl: '', description: '', order: 2, dayOfWeek: 1 },
  ],
};

const mockDiet = {
  id: 'd-123',
  clientId: 'client-123',
  trainerId: 'trainer-123',
  name: 'Dieta volumen',
  type: 'normal' as const,
  totalCalories: 2800,
  meals: [
    { id: 'm-1', name: 'breakfast' as const, description: 'Desayuno', calories: 600, protein: 40, carbs: 70, fat: 15, order: 1 },
  ],
};

const mockMessage = {
  id: 'msg-123',
  senderId: 'trainer-1',
  receiverId: 'client-1',
  content: '¿Cómo vas con la rutina?',
  type: 'text' as const,
  participants: ['trainer-1', 'client-1'],
  isRead: false,
  createdAt: { toDate: () => new Date() },
};

describe('trainerRender', () => {
  describe('renderClientCard', () => {
    it('debería renderizar una tarjeta de cliente', async () => {
      const { renderClientCard } = await import('@/lib/trainer/trainerRender');
      const html = renderClientCard(mockClient);

      expect(html).toContain('Ana Martínez');
      expect(html).toContain('ana@test.com');
      expect(html).toContain('rounded-xl');
    });

    it('debería incluir onclick si se proporciona', async () => {
      const { renderClientCard } = await import('@/lib/trainer/trainerRender');
      const html = renderClientCard(mockClient, "openClient('client-123')");

      expect(html).toContain("onclick=\"openClient('client-123')\"");
      expect(html).toContain('cursor-pointer');
    });

    it('debería mostrar badge de alerta activa', async () => {
      const { renderClientCard } = await import('@/lib/trainer/trainerRender');
      const html = renderClientCard({ ...mockClient, hasActiveAlert: true });

      expect(html).toContain('bg-red-500');
      expect(html).toContain('animate-pulse');
    });

    it('debería mostrar badge de admin si el rol es admin', async () => {
      const { renderClientCard } = await import('@/lib/trainer/trainerRender');
      const html = renderClientCard({ ...mockClient, role: 'admin' });

      expect(html).toContain('Admin');
      expect(html).toContain('bg-purple-500');
    });
  });

  describe('renderWorkoutCard', () => {
    it('debería renderizar una tarjeta de rutina', async () => {
      const { renderWorkoutCard } = await import('@/lib/trainer/trainerRender');
      const html = renderWorkoutCard(mockWorkout);

      expect(html).toContain('Rutina Push');
      expect(html).toContain('2 ejercicios');
      expect(html).toContain('intermediate');
    });

    it('debería mostrar la descripción truncada', async () => {
      const { renderWorkoutCard } = await import('@/lib/trainer/trainerRender');
      const html = renderWorkoutCard(mockWorkout);

      expect(html).toContain('Rutina de empuje');
    });
  });

  describe('renderDietCard', () => {
    it('debería renderizar una tarjeta de dieta', async () => {
      const { renderDietCard } = await import('@/lib/trainer/trainerRender');
      const html = renderDietCard(mockDiet);

      expect(html).toContain('Dieta volumen');
      expect(html).toContain('1 comidas');
      expect(html).toContain('2800 kcal');
      expect(html).toContain('normal');
    });
  });

  describe('renderMessageBubble', () => {
    it('debería renderizar un mensaje propio (alineado derecha)', async () => {
      const { renderMessageBubble } = await import('@/lib/trainer/trainerRender');
      const html = renderMessageBubble(mockMessage, true, 'Yo', true);

      expect(html).toContain('ml-auto');
      expect(html).toContain('bg-emerald-500/20');
      expect(html).toContain('¿Cómo vas con la rutina?');
      expect(html).toContain('10:30');
    });

    it('debería renderizar un mensaje de otro (alineado izquierda)', async () => {
      const { renderMessageBubble } = await import('@/lib/trainer/trainerRender');
      const html = renderMessageBubble(mockMessage, false, 'Cliente', true);

      expect(html).toContain('mr-auto');
      expect(html).toContain('bg-zinc-800/60');
      expect(html).toContain('Cliente');
    });

    it('debería mostrar badge de alerta para mensajes tipo alert', async () => {
      const { renderMessageBubble } = await import('@/lib/trainer/trainerRender');
      const html = renderMessageBubble(
        { ...mockMessage, type: 'alert', content: 'URGENTE' },
        false,
        'Cliente',
        true,
      );

      expect(html).toContain('Llamado de atención');
      expect(html).toContain('text-red-400');
    });

    it('no debería mostrar nombre del remitente si no es el primer mensaje del bloque', async () => {
      const { renderMessageBubble } = await import('@/lib/trainer/trainerRender');
      const html = renderMessageBubble(mockMessage, false, 'Cliente', false);

      expect(html).not.toContain('Cliente');
    });
  });
});
