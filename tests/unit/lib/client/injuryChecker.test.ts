import { describe, it, expect } from 'vitest';
import { checkExerciseInjuryConflicts } from '@/lib/client/injuryChecker';
import type { MedicalProfile } from '@/types';

describe('injuryChecker — Detección de Conflictos y Riesgos de Lesión', () => {
  const sampleMedicalProfile: MedicalProfile = {
    height: 180,
    initialWeight: 75,
    birthDate: '1995-05-10',
    allergies: [],
    injuries: ['Hombro derecho (tendinitis)', 'Lesión de rodilla izquierda'],
    conditions: ['Molestia lumbar crónica'],
    medications: [],
    surgery: '',
  };

  it('debe detectar conflicto de hombro en Press Militar con barra', () => {
    const exercise = {
      name: 'Press militar con barra',
      muscleGroups: ['shoulders'] as any,
      contraindications: ['shoulder_impingement', 'shoulder'],
    };

    const result = checkExerciseInjuryConflicts(exercise, sampleMedicalProfile);
    expect(result.hasConflict).toBe(true);
    expect(result.conflicts.length).toBeGreaterThan(0);
    expect(result.conflicts[0].affectedZone).toBe('Hombro');
    expect(result.conflicts[0].severity).toBe('high');
  });

  it('debe detectar conflicto de rodilla en Sentadilla con barra', () => {
    const exercise = {
      name: 'Sentadilla trasera con barra',
      muscleGroups: ['quadriceps', 'glutes'] as any,
      contraindications: ['knee_pain', 'lumbar_pain'],
    };

    const result = checkExerciseInjuryConflicts(exercise, sampleMedicalProfile);
    expect(result.hasConflict).toBe(true);
    const kneeConflict = result.conflicts.find((c) => c.affectedZone === 'Rodilla');
    expect(kneeConflict).toBeDefined();
  });

  it('debe detectar conflicto lumbar en Peso muerto', () => {
    const exercise = {
      name: 'Peso muerto tradicional',
      muscleGroups: ['back'] as any,
      contraindications: ['lumbar_herniation', 'lumbar_pain', 'lower_back'],
    };

    const result = checkExerciseInjuryConflicts(exercise, sampleMedicalProfile);
    expect(result.hasConflict).toBe(true);
    const lumbarConflict = result.conflicts.find((c) => c.affectedZone.includes('Lumbar'));
    expect(lumbarConflict).toBeDefined();
  });

  it('no debe detectar conflictos en un ejercicio sin zonas comprometidas (ej. Curl de bíceps)', () => {
    const exercise = {
      name: 'Curl de bíceps con mancuernas',
      muscleGroups: ['biceps'] as any,
      contraindications: ['elbow_pain'],
    };

    const result = checkExerciseInjuryConflicts(exercise, sampleMedicalProfile);
    expect(result.hasConflict).toBe(false);
    expect(result.conflicts.length).toBe(0);
  });

  it('debe manejar perfiles médicos nulos o sin lesiones de forma segura', () => {
    const exercise = {
      name: 'Press de banca',
      muscleGroups: ['chest'] as any,
      contraindications: ['shoulder_impingement'],
    };

    const resultNull = checkExerciseInjuryConflicts(exercise, null);
    expect(resultNull.hasConflict).toBe(false);

    const resultEmpty = checkExerciseInjuryConflicts(exercise, {
      height: 170,
      initialWeight: 65,
      birthDate: '1990-01-01',
      allergies: [],
      injuries: [],
      conditions: [],
      medications: [],
      surgery: '',
    });
    expect(resultEmpty.hasConflict).toBe(false);
  });
});
