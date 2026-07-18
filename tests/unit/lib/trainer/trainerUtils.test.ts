/**
 * Tests unitarios para lib/trainer/trainerUtils.ts
 * Verifica las funciones de renderizado y utilidades del trainer.
 */

import { describe, it, expect } from 'vitest';
import {
  renderClientCard,
  renderWorkoutCard,
  renderDietCard,
  renderMessageBubble,
} from '../../../../src/lib/trainer/trainerUtils';

describe('lib/trainer/trainerUtils', () => {
  describe('renderClientCard', () => {
    it('✅ should render client card with name and email', () => {
      const client = {
        uid: '123',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'client' as const,
      };
      const html = renderClientCard(client);
      expect(html).toContain('Juan Pérez');
      expect(html).toContain('juan@example.com');
      expect(html).toContain('rounded-xl');
    });

    it('✅ should render "Sin nombre" when name is empty', () => {
      const client = {
        uid: '123',
        name: '',
        email: 'test@example.com',
        role: 'client' as const,
      };
      const html = renderClientCard(client);
      expect(html).toContain('Sin nombre');
    });

    it('✅ should show admin badge for admin users', () => {
      const client = {
        uid: '123',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin' as const,
      };
      const html = renderClientCard(client);
      expect(html).toContain('Admin');
      expect(html).toContain('bg-purple-500');
    });

    it('✅ should show alert indicator when hasActiveAlert is true', () => {
      const client = {
        uid: '123',
        name: 'Client',
        email: 'client@example.com',
        role: 'client' as const,
        hasActiveAlert: true,
      };
      const html = renderClientCard(client);
      expect(html).toContain('animate-pulse');
      expect(html).toContain('Alerta activa');
    });

    it('✅ should include onclick attribute when provided', () => {
      const client = {
        uid: '123',
        name: 'Client',
        email: 'client@example.com',
        role: 'client' as const,
      };
      const html = renderClientCard(client, "window.location='/client/123'");
      expect(html).toContain('onclick="window.location=\'/client/123\'"');
      expect(html).toContain('cursor-pointer');
    });
  });

  describe('renderWorkoutCard', () => {
    it('✅ should render workout card with name and exercises count', () => {
      const workout = {
        id: 'w1',
        clientId: 'c1',
        trainerId: 't1',
        name: 'Rutina de Fuerza',
        exercises: [
          { id: 'e1', name: 'Sentadillas', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: '', order: 1, dayOfWeek: 1 },
        ],
        difficulty: 'intermediate',
        description: 'Rutina enfocada en fuerza',
      };
      const html = renderWorkoutCard(workout);
      expect(html).toContain('Rutina de Fuerza');
      expect(html).toContain('1 ejercicios');
      expect(html).toContain('intermediate');
    });

    it('✅ should show 0 exercises when exercises array is empty', () => {
      const workout = {
        id: 'w1',
        clientId: 'c1',
        trainerId: 't1',
        name: 'Rutina Vacía',
        exercises: [],
        difficulty: 'beginner',
        description: 'Test',
      };
      const html = renderWorkoutCard(workout);
      expect(html).toContain('0 ejercicios');
    });

    it('✅ should show "custom" when difficulty is not provided', () => {
       const workout = {
         id: 'w1',
         clientId: 'c1',
         trainerId: 't1',
         name: 'Custom Workout',
         exercises: [],
         description: 'Test',
         difficulty: 'custom',
       };
       const html = renderWorkoutCard(workout);
       expect(html).toContain('custom');
    });

     it('✅ should truncate long descriptions', () => {
       const workout = {
         id: 'w1',
         clientId: 'c1',
         trainerId: 't1',
         name: 'Test',
         exercises: [],
         description: 'A'.repeat(100),
         difficulty: 'beginner',
       };
       const html = renderWorkoutCard(workout);
       expect(html).toContain('...');
     });
  });

  describe('renderDietCard', () => {
    it('✅ should render diet card with name and calories', () => {
       const diet = {
         id: 'd1',
         clientId: 'c1',
         trainerId: 't1',
         name: 'Dieta Proteica',
         type: 'normal' as const,
         totalCalories: 2500,
         meals: [
           { id: 'm1', name: 'breakfast' as const, description: 'Avena', calories: 400, protein: 20, carbs: 50, fat: 10, order: 1 },
         ],
       };
       const html = renderDietCard(diet);
       expect(html).toContain('Dieta Proteica');
       expect(html).toContain('1 comidas');
       expect(html).toContain('2500 kcal');
    });

    it('✅ should show 0 meals when meals array is empty', () => {
      const diet = {
        id: 'd1',
        clientId: 'c1',
        trainerId: 't1',
        name: 'Dieta Vacía',
        type: 'normal' as const,
        totalCalories: 0,
        meals: [],
      };
      const html = renderDietCard(diet);
      expect(html).toContain('0 comidas');
      expect(html).toContain('0 kcal');
    });

    it('✅ should show diet type', () => {
      const diet = {
        id: 'd1',
        clientId: 'c1',
        trainerId: 't1',
        name: 'Advanced Diet',
        type: 'advanced' as const,
        totalCalories: 3000,
        meals: [],
      };
      const html = renderDietCard(diet);
      expect(html).toContain('advanced');
    });
  });

  describe('renderMessageBubble', () => {
    const message = {
      id: 'msg1',
      senderId: 'user1',
      receiverId: 'user2',
      content: 'Hola, ¿cómo estás?',
      type: 'text' as const,
      participants: ['user1', 'user2'],
      isRead: false,
    };

    it('✅ should render message content', () => {
      const html = renderMessageBubble(message, true, 'Juan', true);
      expect(html).toContain('Hola, ¿cómo estás?');
    });

    it('✅ should show sender name for received messages', () => {
      const html = renderMessageBubble(message, false, 'Juan', true);
      expect(html).toContain('Juan');
    });

    it('✅ should not show sender name for own messages', () => {
      const html = renderMessageBubble(message, true, 'Juan', true);
      expect(html).not.toContain('<p class="mb-1 text-xs text-zinc-500">Juan</p>');
    });

    it('✅ should show alert badge for alert messages', () => {
      const alertMessage = { ...message, type: 'alert' as const };
      const html = renderMessageBubble(alertMessage, false, 'Trainer', true);
      expect(html).toContain('Llamado de atención');
      expect(html).toContain('text-red-400');
    });

    it('✅ should not show alert badge for normal messages', () => {
      const html = renderMessageBubble(message, false, 'Juan', true);
      expect(html).not.toContain('Llamado de atención');
    });

    it('✅ should apply correct alignment for own messages', () => {
      const html = renderMessageBubble(message, true, 'Juan', true);
      expect(html).toContain('ml-auto');
      expect(html).not.toContain('mr-auto');
    });

    it('✅ should apply correct alignment for received messages', () => {
      const html = renderMessageBubble(message, false, 'Juan', true);
      expect(html).toContain('mr-auto');
      expect(html).not.toContain('ml-auto');
    });
  });
});