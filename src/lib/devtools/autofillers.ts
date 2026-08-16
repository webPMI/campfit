/**
 * Perfiles de autocompletado para todas las páginas de la aplicación.
 * Cada perfil define campos a rellenar con selectores CSS y valores de prueba.
 *
 * @module devtools/autofillers
 */

import type { AutofillProfile, DevToolsAction } from './types';
import { autofillFields } from './detector';

// ─── Perfiles de Login ─────────────────────────────────────────────────────

export const loginProfiles: AutofillProfile[] = [
  {
    name: '🔑 Admin (Seba)',
    fields: {
      '#email': 'servicioweb.pmi@gmail.com',
      '#password': 'Admin123!',
    },
  },
  {
    name: '👤 Cliente Test',
    fields: {
      '#email': 'cliente@test.com',
      '#password': 'Cliente123!',
    },
  },
  {
    name: '🏋️ Trainer Test',
    fields: {
      '#email': 'trainer@test.com',
      '#password': 'Trainer123!',
    },
  },
];

// ─── Perfiles de Registro ──────────────────────────────────────────────────

export const registerProfiles: AutofillProfile[] = [
  {
    name: '👤 Nuevo Cliente',
    fields: {
      '#name': 'María García López',
      '#email': 'maria.garcia@test.com',
      '#password': 'Maria2024!',
      '#confirmPassword': 'Maria2024!',
      '#terms': 'true',
    },
  },
  {
    name: '👤 Cliente Fitness',
    fields: {
      '#name': 'Carlos Ruiz',
      '#email': 'carlos.ruiz@fitness.com',
      '#password': 'CarlosFit2024!',
      '#confirmPassword': 'CarlosFit2024!',
      '#terms': 'true',
    },
  },
];

// ─── Perfiles de Recuperación ──────────────────────────────────────────────

export const recoverProfiles: AutofillProfile[] = [
  {
    name: '📧 Email Cliente',
    fields: {
      'input[type="email"]': 'cliente@test.com',
    },
  },
];

// ─── Perfiles de Onboarding ────────────────────────────────────────────────

export const onboardingProfiles: AutofillProfile[] = [
  {
    name: '🏃‍♂️ Atleta Completo',
    fields: {
      '#birthdate': '1990-05-15',
      '#height': '178',
      '#weight': '75',
      '#experience': 'intermediate',
      '#conditions': '',
      '#medications': '',
      '#allergies': 'Polen',
      '#injuries': 'Esguince tobillo derecho (2022)',
      '#surgery': '',
      '#emergencyName': 'Elena García',
      '#emergencyPhone': '+34 600 111 222',
    },
  },
  {
    name: '🧘 Principiante',
    fields: {
      '#birthdate': '1995-08-20',
      '#height': '165',
      '#weight': '68',
      '#experience': 'beginner',
      '#conditions': 'Asma leve',
      '#medications': 'Ventolín si necesario',
      '#allergies': 'Mariscos',
      '#injuries': '',
      '#surgery': '',
      '#emergencyName': 'Juan Pérez',
      '#emergencyPhone': '+34 600 333 444',
    },
  },
  {
    name: '🏋️ Avanzado',
    fields: {
      '#birthdate': '1988-03-10',
      '#height': '182',
      '#weight': '85',
      '#experience': 'advanced',
      '#conditions': '',
      '#medications': 'Creatina, Proteína',
      '#allergies': 'Lácteos',
      '#injuries': '',
      '#surgery': 'Apendicectomía (2015)',
      '#emergencyName': 'Ana Martínez',
      '#emergencyPhone': '+34 600 555 666',
    },
  },
];

// ─── Acciones de Onboarding ────────────────────────────────────────────────

export const onboardingActions: DevToolsAction[] = [
  {
    label: '▶️ Avanzar al paso 2 (Médico)',
    icon: '💊',
    handler: () => {
      (document.getElementById('nextBtn') as HTMLButtonElement)?.click();
    },
  },
  {
    label: '▶️ Avanzar al paso 3 (Emergencia)',
    icon: '🚨',
    handler: () => {
      // Dos clicks para ir al paso 3
      const btn = document.getElementById('nextBtn') as HTMLButtonElement;
      btn?.click();
      setTimeout(() => btn?.click(), 100);
    },
  },
  {
    label: '📋 Rellenar y enviar',
    icon: '✅',
    handler: () => {
      autofillFields(onboardingProfiles[0]!.fields);
    },
  },
];

// ─── Perfiles de Ficha Clínica ────────────────────────────────────────────

export const clinicalProfiles: AutofillProfile[] = [
  {
    name: '🏥 Perfil Completo',
    fields: {
      // Estos selectores dependen del diseño específico de la página
      '#birthdate': '1992-07-22',
      '#height': '170',
      '#weight': '72',
    },
  },
];

// ─── Mapa de handlers por PageId ──────────────────────────────────────────

import type { PageId } from './types';

interface PageRegistry {
  label: string;
  profiles?: AutofillProfile[];
  actions?: DevToolsAction[];
}

export const pageRegistry: Record<PageId, PageRegistry> = {
  login: {
    label: 'Login',
    profiles: loginProfiles,
  },
  register: {
    label: 'Registro',
    profiles: registerProfiles,
  },
  recover: {
    label: 'Recuperar Contraseña',
    profiles: recoverProfiles,
  },
  onboarding: {
    label: 'Onboarding',
    profiles: onboardingProfiles,
    actions: onboardingActions,
  },
  index: {
    label: 'Landing Page',
  },
  // Cliente
  'client-dashboard': { label: 'Cliente - Dashboard' },
  'client-workouts': { label: 'Cliente - Rutinas' },
  'client-diets': { label: 'Cliente - Dietas' },
  'client-progress': { label: 'Cliente - Progreso' },
  'client-chat': { label: 'Cliente - Chat' },
  'client-settings': { label: 'Cliente - Configuración' },
  'client-support': { label: 'Cliente - Soporte' },
  'client-medical': { label: 'Cliente - Perfil Médico' },
  // Admin
  'admin-dashboard': { label: 'Admin - Dashboard' },
  'admin-users': { label: 'Admin - Usuarios' },
  'admin-clients': { label: 'Admin - Clientes' },
  'admin-trainers': { label: 'Admin - Entrenadores' },
  'admin-settings': { label: 'Admin - Configuración' },
  'admin-workouts': { label: 'Admin - Rutinas' },
  'admin-diets': { label: 'Admin - Dietas' },
  'admin-exercises': { label: 'Admin - Ejercicios' },
  'admin-foods': { label: 'Admin - Nutrición' },
  'admin-logs': { label: 'Admin - Logs' },
  'admin-devtools': { label: 'Admin - DevTools' },
  'admin-seeds': { label: 'Admin - Gestor de Semillas' },
  'admin-progress': { label: 'Admin - Progreso' },
  'admin-chat': { label: 'Admin - Chat' },
  'admin-clinical': {
    label: 'Admin - Clínico',
    profiles: clinicalProfiles,
  },
  // Trainer
  'trainer-dashboard': { label: 'Trainer - Dashboard' },
  'trainer-clients': { label: 'Trainer - Clientes' },
  'trainer-workouts': { label: 'Trainer - Rutinas' },
  'trainer-diets': { label: 'Trainer - Dietas' },
  'trainer-chat': { label: 'Trainer - Chat' },
  'trainer-settings': { label: 'Trainer - Configuración' },
  'trainer-clinical': {
    label: 'Trainer - Clínico',
    profiles: clinicalProfiles,
  },
  unknown: { label: 'Página Desconocida' },
};