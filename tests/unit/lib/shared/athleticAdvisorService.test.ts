import { describe, it, expect } from 'vitest';
import {
  getAthleticRecommendation,
  suggestExercisesForRecommendation,
  FOCUS_OPTIONS,
  SPORTS_OPTIONS,
  MUSCLE_SPANISH_LABELS,
} from '@/lib/shared/athleticAdvisorService';
import type { ExerciseItem } from '@/lib/shared/exerciseLibrary';

describe('Athletic Advisor Service', () => {
  it('debe devolver opciones válidas de enfoques atléticos', () => {
    expect(FOCUS_OPTIONS.length).toBe(3);
    const ids = FOCUS_OPTIONS.map((f) => f.id);
    expect(ids).toContain('balanced');
    expect(ids).toContain('sport_performance');
    expect(ids).toContain('hybrid');
  });

  it('debe devolver catálogo completo de deportes', () => {
    expect(SPORTS_OPTIONS.length).toBeGreaterThanOrEqual(7);
    const sportIds = SPORTS_OPTIONS.map((s) => s.id);
    expect(sportIds).toContain('football');
    expect(sportIds).toContain('running');
    expect(sportIds).toContain('padel_tennis');
    expect(sportIds).toContain('swimming');
  });

  it('debe generar recomendación correcta para cuerpo equilibrado', () => {
    const rec = getAthleticRecommendation('balanced');
    expect(rec.focusType).toBe('balanced');
    expect(rec.priorityMuscles).toContain('core');
    expect(rec.priorityMuscles).toContain('back');
    expect(rec.priorityMuscles).toContain('glutes');
    expect(rec.keyBenefits.length).toBeGreaterThan(0);
    expect(rec.biomechanicalAdvice).toBeTruthy();
  });

  it('debe generar recomendación correcta para deportes específicos (fútbol y running)', () => {
    const footballRec = getAthleticRecommendation('sport_performance', 'football');
    expect(footballRec.sport).toBe('football');
    expect(footballRec.priorityMuscles).toContain('hamstrings');
    expect(footballRec.priorityMuscles).toContain('glutes');

    const runningRec = getAthleticRecommendation('sport_performance', 'running');
    expect(runningRec.sport).toBe('running');
    expect(runningRec.priorityMuscles).toContain('calves');
    expect(runningRec.priorityMuscles).toContain('glutes');
  });

  it('debe generar recomendación correcta para enfoque híbrido', () => {
    const hybridRec = getAthleticRecommendation('hybrid');
    expect(hybridRec.focusType).toBe('hybrid');
    expect(hybridRec.priorityMuscles).toContain('chest');
    expect(hybridRec.priorityMuscles).toContain('back');
    expect(hybridRec.priorityMuscles).toContain('quadriceps');
  });

  it('debe sugerir ejercicios del catálogo filtrados por músculos prioritarios', () => {
    const mockCatalog: ExerciseItem[] = [
      {
        id: 'ex-1',
        name: { es: 'Curl Nórdico', en: 'Nordic Curl', ca: 'Curl Nòrdic' },
        description: { es: '', en: '', ca: '' },
        muscleGroups: ['hamstrings'],
        category: 'strength',
        difficulty: 'intermediate',
      },
      {
        id: 'ex-2',
        name: { es: 'Plancha Lateral', en: 'Side Plank', ca: 'Planxa Lateral' },
        description: { es: '', en: '', ca: '' },
        muscleGroups: ['core'],
        category: 'functional',
        difficulty: 'beginner',
      },
      {
        id: 'ex-3',
        name: { es: 'Curl Bíceps', en: 'Bicep Curl', ca: 'Curl Bíceps' },
        description: { es: '', en: '', ca: '' },
        muscleGroups: ['biceps'],
        category: 'strength',
        difficulty: 'beginner',
      },
    ];

    const footballRec = getAthleticRecommendation('sport_performance', 'football');
    const suggestions = suggestExercisesForRecommendation(footballRec, mockCatalog);

    expect(suggestions.length).toBe(2);
    expect(suggestions.some((s) => s.id === 'ex-1')).toBe(true);
    expect(suggestions.some((s) => s.id === 'ex-2')).toBe(true);
    expect(suggestions.some((s) => s.id === 'ex-3')).toBe(false);
  });
});
