/**
 * Tests unitarios para shared/profileService.ts
 * Verifica las funciones de carga, actualización y renderizado de perfil.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  renderProfileView,
  renderMedicalGeneralInfo,
  renderMedicalTagSection,
  renderMedicalProfile,
  renderFormField,
  renderProfileLoadingState,
} from '../../../../src/lib/shared/profileService';
import type { ProfileData, MedicalProfileData } from '../../../../src/lib/shared/profileService';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  updatePassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

vi.mock('@/lib/shared/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock UI functions
vi.mock('../../../../src/lib/shared/ui', () => ({
  escapeHtml: (s: string) => s,
  getUserInitial: (name: string) => name.charAt(0) || '?',
  getRoleBadge: (role: string) => ({
    class: `role-${role}-badge`,
    label: role,
  }),
}));

describe('shared/profileService - render functions', () => {
  describe('renderProfileView', () => {
    it('✅ should render profile with name and email', () => {
      const profile: ProfileData = {
        uid: 'user-123',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'client',
      };
      const html = renderProfileView(profile);
      expect(html).toContain('Juan Pérez');
      expect(html).toContain('juan@example.com');
      expect(html).toContain('role-client-badge');
    });

    it('✅ should show trainer name when assigned', () => {
      const profile: ProfileData = {
        uid: 'user-123',
        name: 'Client User',
        email: 'client@example.com',
        role: 'client',
        assignedTrainerName: 'Trainer Name',
      };
      const html = renderProfileView(profile);
      expect(html).toContain('Trainer: Trainer Name');
    });

    it('✅ should show active alert indicator when hasActiveAlert is true', () => {
      const profile: ProfileData = {
        uid: 'user-123',
        name: 'User',
        email: 'user@example.com',
        role: 'client',
        hasActiveAlert: true,
      };
      const html = renderProfileView(profile);
      expect(html).toContain('Alerta activa');
      expect(html).toContain('var(--danger)');
    });

    it('✅ should not show trainer name when not assigned', () => {
      const profile: ProfileData = {
        uid: 'user-123',
        name: 'Client User',
        email: 'client@example.com',
        role: 'client',
      };
      const html = renderProfileView(profile);
      expect(html).not.toContain('Trainer:');
    });
  });

  describe('renderMedicalGeneralInfo', () => {
    it('✅ should return empty string when no fields provided', () => {
      const mp: MedicalProfileData = {};
      const html = renderMedicalGeneralInfo(mp);
      expect(html).toBe('');
    });

    it('✅ should render birth date and calculate age', () => {
      const mp: MedicalProfileData = {
        birthDate: { toDate: () => new Date('1990-01-01') } as unknown as Date,
      };
      const html = renderMedicalGeneralInfo(mp);
      expect(html).toContain('Edad:');
      expect(html).toContain('años');
    });

    it('✅ should render height when provided', () => {
      const mp: MedicalProfileData = {
        height: 180,
      };
      const html = renderMedicalGeneralInfo(mp);
      expect(html).toContain('Altura:');
      expect(html).toContain('180 cm');
    });

    it('✅ should render initial weight when provided', () => {
      const mp: MedicalProfileData = {
        initialWeight: 75,
      };
      const html = renderMedicalGeneralInfo(mp);
      expect(html).toContain('Peso inicial:');
      expect(html).toContain('75 kg');
    });

    it('✅ should render experience when provided', () => {
      const mp: MedicalProfileData = {
        experience: 'intermediate',
      };
      const html = renderMedicalGeneralInfo(mp);
      expect(html).toContain('Experiencia:');
      expect(html).toContain('intermediate');
    });

    it('✅ should render goals when provided', () => {
      const mp: MedicalProfileData = {
        goals: ['Perder peso', 'Ganar músculo'],
      };
      const html = renderMedicalGeneralInfo(mp);
      expect(html).toContain('Objetivos:');
      expect(html).toContain('Perder peso');
      expect(html).toContain('Ganar músculo');
    });
  });

  describe('renderMedicalTagSection', () => {
    it('✅ should return empty string when items is empty', () => {
      const html = renderMedicalTagSection('Alergias', [], 'amber');
      expect(html).toBe('');
    });

    it('✅ should return empty string when items is undefined', () => {
      const html = renderMedicalTagSection('Alergias', undefined, 'amber');
      expect(html).toBe('');
    });

    it('✅ should render amber color section', () => {
      const html = renderMedicalTagSection('Alergias', ['Lactosa'], 'amber');
      expect(html).toContain('Alergias');
      expect(html).toContain('Lactosa');
      expect(html).toContain('var(--warning)');
    });

    it('✅ should render red color section', () => {
      const html = renderMedicalTagSection('Lesiones', ['Tobillo'], 'red');
      expect(html).toContain('Lesiones');
      expect(html).toContain('Tobillo');
      expect(html).toContain('var(--danger)');
    });

    it('✅ should render orange color section', () => {
      const html = renderMedicalTagSection('Condiciones', ['Diabetes'], 'orange');
      expect(html).toContain('Condiciones');
      expect(html).toContain('Diabetes');
      expect(html).toContain('var(--warning)');
    });

    it('✅ should render emerald color section', () => {
      const html = renderMedicalTagSection('Medicamentos', ['Ibuprofeno'], 'emerald');
      expect(html).toContain('Medicamentos');
      expect(html).toContain('Ibuprofeno');
      expect(html).toContain('var(--brand)');
    });
  });

  describe('renderMedicalProfile', () => {
    it('✅ should return empty state when no medical profile data', () => {
      const html = renderMedicalProfile({});
      expect(html).toContain('Perfil médico no completado');
    });

    it('✅ should return empty state when medical profile is null', () => {
      const html = renderMedicalProfile(null as unknown as MedicalProfileData);
      expect(html).toContain('Perfil médico no completado');
    });

    it('✅ should render "No hay alertas médicas registradas" when no medical tags and no general info', () => {
      const mp: MedicalProfileData = {};
      const html = renderMedicalProfile(mp);
      expect(html).toContain('Perfil médico no completado');
    });

    it('✅ should render general info section when present', () => {
      const mp: MedicalProfileData = {
        height: 180,
      };
      const html = renderMedicalProfile(mp);
      expect(html).toContain('Información General');
      expect(html).toContain('180 cm');
    });

    it('✅ should render medical tags when present', () => {
      const mp: MedicalProfileData = {
        allergies: ['Lactosa'],
      };
      const html = renderMedicalProfile(mp);
      expect(html).toContain('Alergias');
      expect(html).toContain('Lactosa');
    });
  });

  describe('renderFormField', () => {
    it('✅ should render form field with value', () => {
      const html = renderFormField('field-id', 'Label', 'value', 'text');
      expect(html).toContain('field-id');
      expect(html).toContain('Label');
      expect(html).toContain('value');
    });

    it('✅ should render form field with placeholder', () => {
      const html = renderFormField('field-id', 'Label', '', 'text', 'Placeholder text');
      expect(html).toContain('placeholder="Placeholder text"');
    });

    it('✅ should render form field without placeholder when not provided', () => {
      const html = renderFormField('field-id', 'Label', 'value', 'email');
      expect(html).not.toContain('placeholder=');
    });

    it('✅ should render password type field', () => {
      const html = renderFormField('pwd', 'Password', '', 'password');
      expect(html).toContain('type="password"');
    });
  });

  describe('renderProfileLoadingState', () => {
    it('✅ should render loading state', () => {
      const html = renderProfileLoadingState();
      expect(html).toContain('Cargando perfil...');
      expect(html).toContain('animate-spin');
    });
  });
});