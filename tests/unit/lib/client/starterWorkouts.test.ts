import { describe, it, expect } from 'vitest';
import {
  STARTER_WORKOUT_PROGRAMS,
  getStarterWorkouts,
  getStarterWorkoutById,
  convertStarterToClientWorkout,
} from '@/lib/client/starterWorkouts';

describe('StarterWorkouts Unit Tests', () => {
  it('debe tener exactamente 3 programas de inicio canónicos', () => {
    const workouts = getStarterWorkouts();
    expect(workouts).toHaveLength(3);
    const ids = workouts.map((w) => w.id);
    expect(ids).toContain('starter-fullbody-3d');
    expect(ids).toContain('starter-torsopierna-4d');
    expect(ids).toContain('starter-movilidad-core');
  });

  it('cada programa debe tener días estructurados con ejercicios válidos', () => {
    STARTER_WORKOUT_PROGRAMS.forEach((prog) => {
      expect(prog.name).toBeTruthy();
      expect(prog.description).toBeTruthy();
      expect(prog.days.length).toBeGreaterThanOrEqual(3);

      prog.days.forEach((day) => {
        expect(day.dayOfWeek).toBeGreaterThanOrEqual(1);
        expect(day.dayOfWeek).toBeLessThanOrEqual(7);
        expect(day.exercises.length).toBeGreaterThan(0);

        day.exercises.forEach((ex) => {
          expect(ex.id).toBeTruthy();
          expect(ex.name).toBeTruthy();
          expect(ex.sets).toBeGreaterThan(0);
          expect(ex.reps).toBeGreaterThan(0);
          expect(ex.restTime).toBeTruthy();
        });
      });
    });
  });

  it('getStarterWorkoutById debe retornar el programa correcto', () => {
    const fb = getStarterWorkoutById('starter-fullbody-3d');
    expect(fb).toBeDefined();
    expect(fb?.name).toContain('Full Body 3 Días');

    const nonExistent = getStarterWorkoutById('invalid-id');
    expect(nonExistent).toBeUndefined();
  });

  it('convertStarterToClientWorkout debe convertir el programa a formato Workout', () => {
    const prog = STARTER_WORKOUT_PROGRAMS[0];
    const clientWorkout = convertStarterToClientWorkout(prog, 'test-user-123');

    expect(clientWorkout.id).toBe(prog.id);
    expect(clientWorkout.clientId).toBe('test-user-123');
    expect(clientWorkout.name).toBe(prog.name);
    expect(clientWorkout.exercises.length).toBeGreaterThan(5);
    expect(clientWorkout.clientFlexibility?.allowReschedule).toBe(true);
  });
});
