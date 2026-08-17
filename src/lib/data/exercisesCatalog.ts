/**
 * Catálogo Canónico Maestro de Ejercicios — CampFit
 *
 * Fuente de Verdad Única (Single Source of Truth) para el catálogo de ejercicios.
 * Provee datos tipados para seeds, tests, validación, fallback offline y filtros de entrenador.
 *
 * @module data/exercisesCatalog
 */

import type {
  ExerciseItem,
  MuscleGroup,
  ExerciseCategory,
  EquipmentType,
} from '@/lib/shared/exerciseLibrary';
import { generateExerciseSearchIndex } from '@/lib/shared/exerciseLibrary';

function ex(
  id: string,
  translations: { es: string; en: string; ca: string },
  muscleGroups: MuscleGroup[],
  category: ExerciseCategory,
  equipment: EquipmentType[],
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  opts: {
    secondary?: MuscleGroup[];
    sets?: number;
    reps?: number;
    rest?: number;
    duration?: number;
    difficultyLevel?: 1 | 2 | 3 | 4 | 5;
    video?: string;
    thumb?: string;
    instructions?: string;
    contra?: string[];
    tags?: string[];
  } = {},
): ExerciseItem & { difficultyLevel: 1 | 2 | 3 | 4 | 5 } {
  const tags = opts.tags ?? [];
  const defaultDiffLevel = difficulty === 'beginner' ? 2 : difficulty === 'intermediate' ? 3 : 5;
  const difficultyLevel = opts.difficultyLevel ?? defaultDiffLevel;
  const fallbackVideo = opts.video || `https://www.youtube.com/watch?v=exercise_${id}`;

  return {
    id,
    translations,
    searchIndex: generateExerciseSearchIndex(translations, tags, muscleGroups),
    muscleGroups,
    secondaryMuscles: opts.secondary ?? [],
    category,
    equipment,
    difficulty,
    difficultyLevel,
    defaultSets: opts.sets ?? 3,
    defaultReps: opts.reps ?? 10,
    defaultRestSeconds: opts.rest ?? 90,
    ...(opts.duration ? { defaultDurationSeconds: opts.duration } : {}),
    videoUrl: fallbackVideo,
    thumbnailUrl: opts.thumb ?? '',
    instructionsUrl: opts.instructions ?? '',
    contraindications: opts.contra ?? [],
    tags,
    isActive: true,
    createdBy: 'system',
    createdAt: null,
    updatedAt: null,
  };
}

export const EXERCISES_CATALOG: ExerciseItem[] = [
  // ── PECHO ─────────────────────────────────────────────────────────────────
  ex('bench_press_barbell',
    { es: 'Press de banca con barra', en: 'Barbell Bench Press', ca: 'Press de banc amb barra' },
    ['chest'], 'strength', ['barbell', 'bench', 'rack'], 'intermediate',
    { secondary: ['triceps', 'shoulders'], sets: 4, reps: 8, rest: 120, difficultyLevel: 3,
      video: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
      tags: ['compound', 'powerlifting', 'chest'], contra: ['shoulder_impingement', 'wrist_pain', 'shoulder'] }),

  ex('bench_press_dumbbell',
    { es: 'Press de pecho con mancuernas', en: 'Dumbbell Bench Press', ca: 'Press de pit amb mancuernes' },
    ['chest'], 'strength', ['dumbbell', 'bench'], 'beginner',
    { secondary: ['triceps', 'shoulders'], sets: 3, reps: 10, rest: 90, difficultyLevel: 2,
      video: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
      tags: ['compound', 'chest'], contra: ['shoulder_impingement', 'shoulder'] }),

  ex('push_up',
    { es: 'Flexiones de brazos', en: 'Push-up', ca: 'Flexions de braços' },
    ['chest'], 'strength', ['bodyweight'], 'beginner',
    { secondary: ['triceps', 'shoulders', 'core'], sets: 3, reps: 15, rest: 60, difficultyLevel: 1,
      video: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
      tags: ['compound', 'bodyweight', 'no_equipment', 'chest'], contra: ['wrist_pain'] }),

  ex('incline_bench_press',
    { es: 'Press inclinado con barra', en: 'Incline Barbell Press', ca: 'Press inclinat amb barra' },
    ['chest'], 'strength', ['barbell', 'bench', 'rack'], 'intermediate',
    { secondary: ['shoulders', 'triceps'], sets: 3, reps: 10, rest: 120, difficultyLevel: 3,
      video: 'https://www.youtube.com/watch?v=SrqOu55lrYU',
      tags: ['compound', 'upper-chest'], contra: ['shoulder_impingement', 'shoulder'] }),

  ex('cable_crossover',
    { es: 'Cruce de poleas', en: 'Cable Crossover', ca: 'Creuament de politges' },
    ['chest'], 'strength', ['cable'], 'intermediate',
    { sets: 3, reps: 12, rest: 60, difficultyLevel: 3,
      video: 'https://www.youtube.com/watch?v=taI4XduLpTk',
      tags: ['isolation', 'chest'], contra: ['shoulder_impingement', 'shoulder'] }),

  ex('dips_chest',
    { es: 'Fondos en paralelas (pecho)', en: 'Chest Dips', ca: 'Fons a paral·leles (pit)' },
    ['chest'], 'strength', ['pull_up_bar'], 'intermediate',
    { secondary: ['triceps', 'shoulders'], sets: 3, reps: 10, rest: 90, difficultyLevel: 3,
      video: 'https://www.youtube.com/watch?v=2z8JmcrW-As',
      tags: ['compound', 'bodyweight'], contra: ['shoulder_impingement', 'elbow_pain', 'shoulder'] }),

  // ── ESPALDA ───────────────────────────────────────────────────────────────
  ex('deadlift',
    { es: 'Peso muerto tradicional', en: 'Conventional Deadlift', ca: 'Pes mort tradicional' },
    ['back'], 'strength', ['barbell', 'rack'], 'advanced',
    { secondary: ['hamstrings', 'glutes', 'core', 'forearms'], sets: 4, reps: 5, rest: 180, difficultyLevel: 5,
      video: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
      tags: ['compound', 'powerlifting', 'posterior-chain'], contra: ['lumbar_herniation', 'lumbar_pain', 'lower_back'] }),

  ex('pull_up',
    { es: 'Dominadas pronas', en: 'Pull-up', ca: 'Dominades' },
    ['back'], 'strength', ['pull_up_bar'], 'intermediate',
    { secondary: ['biceps', 'forearms', 'core'], sets: 3, reps: 8, rest: 120, difficultyLevel: 4,
      video: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
      tags: ['compound', 'bodyweight', 'lats'], contra: ['shoulder_impingement', 'elbow_pain', 'shoulder'] }),

  ex('lat_pulldown',
    { es: 'Jalón al pecho en polea', en: 'Lat Pulldown', ca: 'Jaló al pit en politja' },
    ['back'], 'strength', ['cable', 'machine'], 'beginner',
    { secondary: ['biceps', 'forearms'], sets: 3, reps: 12, rest: 90, difficultyLevel: 2,
      video: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
      tags: ['compound', 'lats'], contra: ['shoulder_impingement', 'shoulder'] }),

  ex('barbell_row',
    { es: 'Remo con barra inclinado', en: 'Bent-Over Barbell Row', ca: 'Rem amb barra' },
    ['back'], 'strength', ['barbell'], 'intermediate',
    { secondary: ['biceps', 'forearms', 'core'], sets: 4, reps: 8, rest: 120, difficultyLevel: 3,
      video: 'https://www.youtube.com/watch?v=FWJR5Ve8gkQ',
      tags: ['compound', 'back'], contra: ['lumbar_pain', 'lumbar_herniation', 'lower_back'] }),

  ex('dumbbell_row_single',
    { es: 'Remo con mancuerna a una mano', en: 'Single-Arm Dumbbell Row', ca: 'Rem amb mancuerna a una mà' },
    ['back'], 'strength', ['dumbbell', 'bench'], 'beginner',
    { secondary: ['biceps'], sets: 3, reps: 10, rest: 90, difficultyLevel: 2,
      video: 'https://www.youtube.com/watch?v=roCP6wCXPqo',
      tags: ['unilateral', 'back'], contra: ['lumbar_pain'] }),

  ex('seated_cable_row',
    { es: 'Remo en polea baja sentado', en: 'Seated Cable Row', ca: 'Rem assegut en politja' },
    ['back'], 'strength', ['cable'], 'beginner',
    { secondary: ['biceps'], sets: 3, reps: 12, rest: 90, difficultyLevel: 2,
      video: 'https://www.youtube.com/watch?v=GZbfZ033fbo',
      tags: ['back', 'safe-lumbar'], contra: [] }),

  // ── HOMBROS ───────────────────────────────────────────────────────────────
  ex('overhead_press_barbell',
    { es: 'Press militar con barra', en: 'Overhead Barbell Press', ca: 'Press militar amb barra' },
    ['shoulders'], 'strength', ['barbell', 'rack'], 'intermediate',
    { secondary: ['triceps', 'core'], sets: 4, reps: 8, rest: 120, difficultyLevel: 4,
      video: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
      tags: ['compound', 'shoulders'], contra: ['shoulder_impingement', 'lumbar_pain', 'shoulder'] }),

  ex('lateral_raise_dumbbell',
    { es: 'Elevaciones laterales con mancuernas', en: 'Dumbbell Lateral Raise', ca: 'Elevacions laterals amb mancuernes' },
    ['shoulders'], 'strength', ['dumbbell'], 'beginner',
    { sets: 4, reps: 15, rest: 60, difficultyLevel: 2,
      video: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
      tags: ['isolation', 'side-delts'], contra: ['shoulder_impingement', 'shoulder'] }),

  ex('face_pull',
    { es: 'Face Pull en polea con cuerda', en: 'Cable Face Pull', ca: 'Face Pull en politja' },
    ['shoulders'], 'functional', ['cable'], 'beginner',
    { secondary: ['back'], sets: 3, reps: 15, rest: 60, difficultyLevel: 2,
      video: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
      tags: ['rear-delts', 'posture', 'rotator-cuff'], contra: [] }),

  // ── PIERNAS & GLÚTEOS ─────────────────────────────────────────────────────
  ex('squat_barbell',
    { es: 'Sentadilla trasera con barra', en: 'Barbell Back Squat', ca: 'Sentadeta amb barra' },
    ['quadriceps', 'glutes'], 'strength', ['barbell', 'rack'], 'intermediate',
    { secondary: ['hamstrings', 'calves', 'core'], sets: 4, reps: 8, rest: 150, difficultyLevel: 4,
      video: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
      tags: ['compound', 'legs', 'powerlifting'], contra: ['knee_pain', 'lumbar_pain', 'knee', 'lower_back'] }),

  ex('goblet_squat',
    { es: 'Sentadilla Goblet con mancuerna', en: 'Goblet Squat', ca: 'Sentadeta Goblet' },
    ['quadriceps', 'glutes'], 'strength', ['dumbbell', 'kettlebell'], 'beginner',
    { secondary: ['core'], sets: 3, reps: 12, rest: 90, difficultyLevel: 2,
      video: 'https://www.youtube.com/watch?v=MeIiIdhvXT4',
      tags: ['compound', 'legs', 'beginner-friendly'], contra: ['knee_pain'] }),

  ex('leg_press',
    { es: 'Prensa de piernas 45°', en: '45° Leg Press', ca: 'Premsa de cames 45°' },
    ['quadriceps', 'glutes'], 'strength', ['machine'], 'beginner',
    { secondary: ['hamstrings'], sets: 4, reps: 10, rest: 120, difficultyLevel: 2,
      video: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
      tags: ['machine', 'legs', 'hypertrophy'], contra: ['knee_pain', 'knee'] }),

  ex('romanian_deadlift_barbell',
    { es: 'Peso muerto rumano con barra', en: 'Barbell Romanian Deadlift', ca: 'Pes mort romanès' },
    ['hamstrings', 'glutes'], 'strength', ['barbell'], 'intermediate',
    { secondary: ['back', 'core'], sets: 4, reps: 10, rest: 120, difficultyLevel: 3,
      video: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
      tags: ['posterior-chain', 'hamstrings'], contra: ['lumbar_pain', 'lumbar_herniation', 'lower_back'] }),

  ex('hip_thrust_barbell',
    { es: 'Hip Thrust con barra', en: 'Barbell Hip Thrust', ca: 'Hip Thrust amb barra' },
    ['glutes'], 'strength', ['barbell', 'bench'], 'intermediate',
    { secondary: ['hamstrings'], sets: 4, reps: 10, rest: 120, difficultyLevel: 3,
      video: 'https://www.youtube.com/watch?v=SEdqd1n01G4',
      tags: ['glute-isolation', 'hypertrophy'], contra: ['lower_back'] }),

  ex('bulgarian_split_squat',
    { es: 'Sentadilla búlgara con mancuernas', en: 'Bulgarian Split Squat', ca: 'Sentadeta búlgara' },
    ['quadriceps', 'glutes'], 'strength', ['dumbbell', 'bench'], 'intermediate',
    { secondary: ['hamstrings', 'core'], sets: 3, reps: 10, rest: 90, difficultyLevel: 4,
      video: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
      tags: ['unilateral', 'legs'], contra: ['knee_pain', 'knee'] }),

  ex('leg_extension',
    { es: 'Extensiones de cuádriceps en máquina', en: 'Leg Extension Machine', ca: 'Extensions de quàdriceps' },
    ['quadriceps'], 'strength', ['machine'], 'beginner',
    { sets: 3, reps: 15, rest: 60, difficultyLevel: 1,
      video: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
      tags: ['isolation', 'quads'], contra: ['patellar_tendinitis', 'knee_pain', 'knee'] }),

  ex('leg_curl_lying',
    { es: 'Curl femoral tumbado en máquina', en: 'Lying Leg Curl', ca: 'Curl femoral estirat' },
    ['hamstrings'], 'strength', ['machine'], 'beginner',
    { sets: 3, reps: 12, rest: 60, difficultyLevel: 1,
      video: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
      tags: ['isolation', 'hamstrings'], contra: ['knee_pain'] }),

  ex('calf_raise_standing',
    { es: 'Elevación de talones de pie', en: 'Standing Calf Raise', ca: 'Elevació de talons dempeus' },
    ['calves'], 'strength', ['machine', 'bodyweight'], 'beginner',
    { sets: 4, reps: 15, rest: 60, difficultyLevel: 1,
      video: 'https://www.youtube.com/watch?v=-M4-G8p8fmc',
      tags: ['calves', 'isolation'], contra: ['achilles_tendinitis'] }),

  // ── BRAZOS & CORE ─────────────────────────────────────────────────────────
  ex('bicep_curl_dumbbell',
    { es: 'Curl de bíceps con mancuernas alterno', en: 'Alternating Dumbbell Bicep Curl', ca: 'Curl de bíceps altern' },
    ['biceps'], 'strength', ['dumbbell'], 'beginner',
    { sets: 3, reps: 12, rest: 60, difficultyLevel: 1,
      video: 'https://www.youtube.com/watch?v=sAq_ocpRh_I',
      tags: ['arms', 'isolation'], contra: ['elbow_pain', 'wrist_pain'] }),

  ex('tricep_pushdown_rope',
    { es: 'Extensión de tríceps en polea con cuerda', en: 'Cable Rope Tricep Pushdown', ca: 'Extensió de tríceps en politja' },
    ['triceps'], 'strength', ['cable'], 'beginner',
    { sets: 3, reps: 12, rest: 60, difficultyLevel: 1,
      video: 'https://www.youtube.com/watch?v=vB5OHsJ3EME',
      tags: ['arms', 'isolation'], contra: ['elbow_pain'] }),

  ex('plank_standard',
    { es: 'Plancha abdominal isométrica', en: 'Standard Isometric Plank', ca: 'Planxa abdominal isomètrica' },
    ['core'], 'functional', ['bodyweight'], 'beginner',
    { duration: 45, sets: 3, reps: 1, rest: 60, difficultyLevel: 2,
      video: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
      tags: ['core', 'isometric', 'stability'], contra: ['shoulder_pain', 'lower_back'] }),

  ex('ab_wheel_rollout',
    { es: 'Rueda abdominal (Ab Wheel)', en: 'Ab Wheel Rollout', ca: 'Roda abdominal' },
    ['core'], 'strength', ['other', 'bodyweight'], 'advanced',
    { sets: 3, reps: 10, rest: 90, difficultyLevel: 5,
      video: 'https://www.youtube.com/watch?v=rqiTPdK1c_I',
      tags: ['core', 'advanced'], contra: ['lumbar_pain', 'lumbar_herniation', 'lower_back'] }),
];

/**
 * Mapa O(1) de ID a Ejercicio.
 */
export const EXERCISES_MAP = new Map<string, ExerciseItem>(
  EXERCISES_CATALOG.map((item) => [item.id, item]),
);
