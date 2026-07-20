/**
 * Tests para userMappers.ts
 *
 * @module tests/unit/lib/helpers/userMappers.test
 */

import { describe, it, expect } from 'vitest';
import { mapDocToUser } from '@/lib/helpers/userMappers';

describe('userMappers', () => {
  describe('mapDocToUser', () => {
    it('debería mapear un documento completo correctamente', () => {
      const doc = {
        id: 'user-123',
        data: () => ({
          name: 'Juan Pérez',
          email: 'juan@example.com',
          role: 'client',
          hasActiveAlert: true,
          assignedTrainerId: 'trainer-456',
          medicalProfile: { age: 30 },
          lastActivityAt: { toDate: () => new Date('2024-01-01') },
          createdAt: { toDate: () => new Date('2023-06-01') },
          updatedAt: { toDate: () => new Date('2024-01-15') },
        }),
      };

      const user = mapDocToUser(doc);

      expect(user).toEqual({
        uid: 'user-123',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'client',
        hasActiveAlert: true,
        assignedTrainerId: 'trainer-456',
        medicalProfile: { age: 30 },
        lastActivityAt: { toDate: expect.any(Function) },
        createdAt: { toDate: expect.any(Function) },
        updatedAt: { toDate: expect.any(Function) },
      });
    });

    it('debería usar fallbackName cuando no hay name en el documento', () => {
      const doc = {
        id: 'user-789',
        data: () => ({
          email: 'anon@example.com',
          role: 'trainer',
        }),
      };

      const user = mapDocToUser(doc, 'Invitado');

      expect(user.name).toBe('Invitado');
      expect(user.uid).toBe('user-789');
    });

    it('debería usar "Sin nombre" como fallback por defecto', () => {
      const doc = {
        id: 'user-000',
        data: () => ({}),
      };

      const user = mapDocToUser(doc);

      expect(user.name).toBe('Sin nombre');
    });

    it('debería asignar role "client" por defecto', () => {
      const doc = {
        id: 'user-111',
        data: () => ({
          name: 'Test User',
        }),
      };

      const user = mapDocToUser(doc);

      expect(user.role).toBe('client');
    });

    it('debería asignar email vacío por defecto', () => {
      const doc = {
        id: 'user-222',
        data: () => ({
          name: 'No Email',
        }),
      };

      const user = mapDocToUser(doc);

      expect(user.email).toBe('');
    });

    it('debería asignar hasActiveAlert como false por defecto', () => {
      const doc = {
        id: 'user-333',
        data: () => ({
          name: 'Test',
        }),
      };

      const user = mapDocToUser(doc);

      expect(user.hasActiveAlert).toBe(false);
    });

    it('debería manejar assignedTrainerId como undefined cuando no existe', () => {
      const doc = {
        id: 'user-444',
        data: () => ({
          name: 'Solo',
        }),
      };

      const user = mapDocToUser(doc);

      expect(user.assignedTrainerId).toBeUndefined();
    });

    it('debería preservar el valor de hasActiveAlert cuando es false explícitamente', () => {
      const doc = {
        id: 'user-555',
        data: () => ({
          name: 'Test',
          hasActiveAlert: false,
        }),
      };

      const user = mapDocToUser(doc);

      expect(user.hasActiveAlert).toBe(false);
    });
  });
});
