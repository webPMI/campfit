/**
 * Programas Canónicos de Inicio y Modo Autonomía (Starter Workouts) — CampFit
 * Provee rutinas estructuradas listas para entrenar y registrar en vivo para alumnos
 * que aún no tienen un entrenador asignado o prefieren entrenar de forma autónoma.
 *
 * @module client/starterWorkouts
 */

import type { Workout, Exercise } from '@/lib/client/workoutService';

export interface StarterWorkoutProgram {
  id: string;
  name: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'all-levels';
  daysPerWeek: 3 | 4;
  scheduledDays: number[]; // 1=Lunes, 2=Martes... 7=Domingo
  targetGoal: string;
  description: string;
  icon: string;
  badge: string;
  days: {
    dayOfWeek: number;
    dayName: string;
    focus: string;
    exercises: Exercise[];
  }[];
}

export const STARTER_WORKOUT_PROGRAMS: StarterWorkoutProgram[] = [
  {
    id: 'starter-fullbody-3d',
    name: 'Full Body 3 Días — Fuerza & Activación',
    category: 'Fuerza / Acondicionamiento',
    difficulty: 'beginner',
    daysPerWeek: 3,
    scheduledDays: [1, 3, 5], // Lunes, Miércoles, Viernes
    targetGoal: 'Fuerza global, tonificación muscular y adaptación anatómica',
    description: 'Programa equilibrado de cuerpo completo ideal para empezar a ganar fuerza y masa muscular con descansos óptimos.',
    icon: '🏋️',
    badge: 'Recomendado para empezar',
    days: [
      {
        dayOfWeek: 1, // Lunes
        dayName: 'Lunes — Empuje & Pierna (Full Body A)',
        focus: 'Sentadilla, Pecho, Hombro y Tríceps',
        exercises: [
          {
            id: 'ex-fb-sq',
            name: 'Sentadilla Goblet con Mancuerna / Barra',
            sets: 3,
            reps: 10,
            restTime: '90s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_squat_goblet',
            description: 'Mantén el pecho erguido, core firme y rompe el paralelo suavemente.',
            order: 1,
            dayOfWeek: 1,
          },
          {
            id: 'ex-fb-bp',
            name: 'Press de Banca Plano con Mancuernas',
            sets: 3,
            reps: 10,
            restTime: '90s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_db_bench_press',
            description: 'Retrae escápulas, apoya los pies firmes y empuja con control.',
            order: 2,
            dayOfWeek: 1,
          },
          {
            id: 'ex-fb-ohp',
            name: 'Press Militar de Hombro Sentado',
            sets: 3,
            reps: 12,
            restTime: '75s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_db_shoulder_press',
            description: 'Empuja vertical sin arquear la espalda baja.',
            order: 3,
            dayOfWeek: 1,
          },
          {
            id: 'ex-fb-plk',
            name: 'Plancha Abdominal Frontal Isométrica',
            sets: 3,
            reps: 45, // 45 segundos
            restTime: '60s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_plank_hold',
            description: 'Glúteos y abdomen en tensión constante, respiración controlada.',
            order: 4,
            dayOfWeek: 1,
          },
        ],
      },
      {
        dayOfWeek: 3, // Miércoles
        dayName: 'Miércoles — Tracción & Posterior (Full Body B)',
        focus: 'Espalda, Isquiosurales, Bíceps y Core',
        exercises: [
          {
            id: 'ex-fb-rdl',
            name: 'Peso Muerto Rumano con Mancuernas',
            sets: 3,
            reps: 10,
            restTime: '90s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_romanian_deadlift',
            description: 'Bisagra de cadera hacia atrás manteniendo la columna neutra.',
            order: 1,
            dayOfWeek: 3,
          },
          {
            id: 'ex-fb-row',
            name: 'Remo con Mancuerna a 1 Brazo en Banco',
            sets: 3,
            reps: 10,
            restTime: '75s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_db_single_arm_row',
            description: 'Tira con el codo pegado al torso sintiendo el dorsal ancho.',
            order: 2,
            dayOfWeek: 3,
          },
          {
            id: 'ex-fb-lat',
            name: 'Jalón al Pecho en Polea',
            sets: 3,
            reps: 12,
            restTime: '75s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_lat_pulldown',
            description: 'Agarre prono al ancho de hombros, desciende hacia la clavícula.',
            order: 3,
            dayOfWeek: 3,
          },
          {
            id: 'ex-fb-curl',
            name: 'Curl de Bíceps con Mancuernas en Supinación',
            sets: 3,
            reps: 12,
            restTime: '60s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_db_biceps_curl',
            description: 'Codos estables pegados al costado durante todo el recorrido.',
            order: 4,
            dayOfWeek: 3,
          },
        ],
      },
      {
        dayOfWeek: 5, // Viernes
        dayName: 'Viernes — Circuito Global & Potencia (Full Body C)',
        focus: 'Pierna Unilateral, Empuje Inclinado, Core y Cardio Funcional',
        exercises: [
          {
            id: 'ex-fb-lunge',
            name: 'Zancadas / Desplantes Caminando con Mancuernas',
            sets: 3,
            reps: 12,
            restTime: '75s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_walking_lunges',
            description: 'Paso firme manteniendo la rodilla alineada con la punta del pie.',
            order: 1,
            dayOfWeek: 5,
          },
          {
            id: 'ex-fb-inc',
            name: 'Press Inclinado con Mancuernas (30°)',
            sets: 3,
            reps: 10,
            restTime: '90s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_db_incline_press',
            description: 'Enfocado en el haz clavicular del pectoral superior.',
            order: 2,
            dayOfWeek: 5,
          },
          {
            id: 'ex-fb-face',
            name: 'Face Pulls en Polea con Cuerda',
            sets: 3,
            reps: 15,
            restTime: '60s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_cable_face_pull',
            description: 'Salud escapular y hombro posterior con rotación externa.',
            order: 3,
            dayOfWeek: 5,
          },
          {
            id: 'ex-fb-abw',
            name: 'Rueda Abdominal o Deadbug Controlado',
            sets: 3,
            reps: 12,
            restTime: '60s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_deadbug',
            description: 'Control lumbo-pélvico estricto sin curvar la zona lumbar.',
            order: 4,
            dayOfWeek: 5,
          },
        ],
      },
    ],
  },
  {
    id: 'starter-torsopierna-4d',
    name: 'Torso / Pierna 4 Días — Hipertrofia & Tono',
    category: 'Hipertrofia / Desarrollo Muscular',
    difficulty: 'intermediate',
    daysPerWeek: 4,
    scheduledDays: [1, 2, 4, 5], // Lunes, Martes, Jueves, Viernes
    targetGoal: 'Mayor volumen de entrenamiento por grupo muscular y ganancia de masa magra',
    description: 'División clásica y efectiva que separa el trabajo de tren superior y tren inferior dos veces por semana.',
    icon: '🔥',
    badge: 'Máximo Desarrollo',
    days: [
      {
        dayOfWeek: 1, // Lunes
        dayName: 'Lunes — Torso Fuerza A',
        focus: 'Pecho, Espalda Densidad y Hombro',
        exercises: [
          {
            id: 'ex-tp-bp',
            name: 'Press de Banca con Barra / Mancuernas',
            sets: 4,
            reps: 8,
            restTime: '120s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_bench_press',
            description: 'Series de fuerza pesada con técnica sólida y arco natural.',
            order: 1,
            dayOfWeek: 1,
          },
          {
            id: 'ex-tp-rowb',
            name: 'Remo con Barra Prono / Supino',
            sets: 4,
            reps: 8,
            restTime: '90s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_barbell_row',
            description: 'Tronco a 45 grados y tirón explosivo controlado al ombligo.',
            order: 2,
            dayOfWeek: 1,
          },
          {
            id: 'ex-tp-ohp',
            name: 'Press Militar de Pie con Barra',
            sets: 3,
            reps: 10,
            restTime: '90s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_standing_ohp',
            description: 'Core bloqueado y glúteos en tensión para transferir fuerza.',
            order: 3,
            dayOfWeek: 1,
          },
          {
            id: 'ex-tp-lat',
            name: 'Jalón al Pecho Agarre Neutro',
            sets: 3,
            reps: 10,
            restTime: '75s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_neutral_lat_pull',
            description: 'Enfoca la contracción en los dorsales inferiores.',
            order: 4,
            dayOfWeek: 1,
          },
        ],
      },
      {
        dayOfWeek: 2, // Martes
        dayName: 'Martes — Pierna & Glúteo A',
        focus: 'Cuádriceps, Isquiosurales y Gemelos',
        exercises: [
          {
            id: 'ex-tp-sq',
            name: 'Sentadilla Trasera con Barra / Prensa 45°',
            sets: 4,
            reps: 8,
            restTime: '120s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_back_squat',
            description: 'Control excéntrico de 2 segundos en la bajada.',
            order: 1,
            dayOfWeek: 2,
          },
          {
            id: 'ex-tp-rdl',
            name: 'Peso Muerto Rumano con Barra',
            sets: 3,
            reps: 10,
            restTime: '90s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_romanian_deadlift',
            description: 'Estiramiento profundo de isquiotibiales con espalda recta.',
            order: 2,
            dayOfWeek: 2,
          },
          {
            id: 'ex-tp-ext',
            name: 'Extensiones de Cuádriceps en Máquina',
            sets: 3,
            reps: 12,
            restTime: '60s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_quad_extensions',
            description: 'Pausa de 1 segundo arriba en máxima contracción.',
            order: 3,
            dayOfWeek: 2,
          },
          {
            id: 'ex-tp-calf',
            name: 'Elevación de Talones de Pie (Gemelos)',
            sets: 4,
            reps: 15,
            restTime: '60s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_standing_calf_raise',
            description: 'Rango completo desde estiramiento hasta flexión plantar.',
            order: 4,
            dayOfWeek: 2,
          },
        ],
      },
      {
        dayOfWeek: 4, // Jueves
        dayName: 'Jueves — Torso Hipertrofia B',
        focus: 'Pecho Inclinado, Espalda Amplitud y Brazos',
        exercises: [
          {
            id: 'ex-tp-incdb',
            name: 'Press Inclinado con Mancuernas',
            sets: 4,
            reps: 10,
            restTime: '90s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_db_incline_press',
            description: 'Recorrido profundo sintiendo el estiramiento del pectoral.',
            order: 1,
            dayOfWeek: 4,
          },
          {
            id: 'ex-tp-cable-row',
            name: 'Remo en Polea Baja con Agarre Estrecho',
            sets: 4,
            reps: 10,
            restTime: '75s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_seated_cable_row',
            description: 'Extiende hombros adelante y aprieta escápulas al final.',
            order: 2,
            dayOfWeek: 4,
          },
          {
            id: 'ex-tp-lat-raise',
            name: 'Elevaciones Laterales con Mancuerna / Polea',
            sets: 4,
            reps: 15,
            restTime: '60s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_lateral_raises',
            description: 'Eleva en el plano escapular sin usar balanceo.',
            order: 3,
            dayOfWeek: 4,
          },
          {
            id: 'ex-tp-arms-ss',
            name: 'Biserie: Curl Martillo + Extensión Tríceps Polea',
            sets: 3,
            reps: 12,
            restTime: '60s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_triceps_pushdown',
            description: 'Bombas musculares para brazos completos con tensión continua.',
            order: 4,
            dayOfWeek: 4,
          },
        ],
      },
      {
        dayOfWeek: 5, // Viernes
        dayName: 'Viernes — Pierna & Cadena Posterior B',
        focus: 'Sentadilla Búlgara, Hip Thrust y Abdominales',
        exercises: [
          {
            id: 'ex-tp-ht',
            name: 'Hip Thrust con Barra / Máquina',
            sets: 4,
            reps: 10,
            restTime: '90s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_hip_thrust',
            description: 'Bloqueo arriba con retroversión pélvica durante 1 segundo.',
            order: 1,
            dayOfWeek: 5,
          },
          {
            id: 'ex-tp-bulgarian',
            name: 'Sentadilla Búlgara con Mancuerna',
            sets: 3,
            reps: 10,
            restTime: '75s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_bulgarian_split_squat',
            description: 'Torso ligeramente inclinado para mayor reclutamiento de glúteo.',
            order: 2,
            dayOfWeek: 5,
          },
          {
            id: 'ex-tp-curl-femoral',
            name: 'Curl Femoral Tumbado / Sentado',
            sets: 3,
            reps: 12,
            restTime: '60s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_lying_leg_curl',
            description: 'Aislamiento de la flexión de rodilla.',
            order: 3,
            dayOfWeek: 5,
          },
          {
            id: 'ex-tp-ab-crunches',
            name: 'Elevaciones de Piernas Colgado / Banco',
            sets: 3,
            reps: 15,
            restTime: '60s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_hanging_leg_raise',
            description: 'Sube las rodillas/pies hacia el pecho controlando la oscilación.',
            order: 4,
            dayOfWeek: 5,
          },
        ],
      },
    ],
  },
  {
    id: 'starter-movilidad-core',
    name: 'Movilidad, Core & Postura 3 Días',
    category: 'Salud, Flexibilidad & Postura',
    difficulty: 'all-levels',
    daysPerWeek: 3,
    scheduledDays: [1, 3, 5],
    targetGoal: 'Mejora del rango de movimiento, alivio de dolores articulares y postura',
    description: 'Enfocado en desbloquear cadera, columna torácica y hombros, fortaleciendo el core profundo y la estabilidad.',
    icon: '🧘',
    badge: 'Salud Articular & Longevidad',
    days: [
      {
        dayOfWeek: 1,
        dayName: 'Lunes — Desbloqueo de Cadera & Cadena Posterior',
        focus: 'Movilidad de Cadera, Glúteo Medio y Lumbares',
        exercises: [
          {
            id: 'ex-mov-9090',
            name: 'Transiciones 90/90 de Cadera',
            sets: 3,
            reps: 10,
            restTime: '45s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_90_90_hip',
            description: 'Rotación interna y externa fluida sin arquear la espalda.',
            order: 1,
            dayOfWeek: 1,
          },
          {
            id: 'ex-mov-catcow',
            name: 'Cat-Cow (Gato-Camello) con Respiración Diafragmática',
            sets: 3,
            reps: 12,
            restTime: '45s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_cat_cow',
            description: 'Moviliza vértebra por vértebra coordinando con la inhalación y exhalación.',
            order: 2,
            dayOfWeek: 1,
          },
          {
            id: 'ex-mov-bird',
            name: 'Bird-Dog con Isometría 3s',
            sets: 3,
            reps: 10,
            restTime: '45s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_bird_dog',
            description: 'Extiende brazo y pierna opuesta manteniendo la pelvis fija.',
            order: 3,
            dayOfWeek: 1,
          },
          {
            id: 'ex-mov-pigeon',
            name: 'Estiramiento Paloma Activa',
            sets: 3,
            reps: 8,
            restTime: '45s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_pigeon_pose',
            description: 'Alivio del piramidal y apertura de glúteo.',
            order: 4,
            dayOfWeek: 1,
          },
        ],
      },
      {
        dayOfWeek: 3,
        dayName: 'Miércoles — Apertura Torácica & Hombros',
        focus: 'Cintura Escapular, Espalda Alta y Cuello',
        exercises: [
          {
            id: 'ex-mov-thoracic',
            name: 'Rotaciones Torácicas en Cuadrupedia',
            sets: 3,
            reps: 10,
            restTime: '45s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_thoracic_rotations',
            description: 'Gira el pecho hacia el techo manteniendo la cadera alineada.',
            order: 1,
            dayOfWeek: 3,
          },
          {
            id: 'ex-mov-wallslide',
            name: 'Deslizamientos Escapulares en Pared (Wall Slides)',
            sets: 3,
            reps: 12,
            restTime: '45s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_wall_slides',
            description: 'Mantén muñecas y codos en contacto con la pared.',
            order: 2,
            dayOfWeek: 3,
          },
          {
            id: 'ex-mov-deadbug',
            name: 'Deadbug Controlado con Presión Contra Suelo',
            sets: 3,
            reps: 12,
            restTime: '45s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_deadbug',
            description: 'Zona lumbar completamente pegada al suelo.',
            order: 3,
            dayOfWeek: 3,
          },
        ],
      },
      {
        dayOfWeek: 5,
        dayName: 'Viernes — Estabilidad Lumbo-Pélvica & Full Body Flow',
        focus: 'Core 360°, Tobillos y Flexibilidad Global',
        exercises: [
          {
            id: 'ex-mov-worlds',
            name: "World's Greatest Stretch (El Mayor Estiramiento del Mundo)",
            sets: 3,
            reps: 6,
            restTime: '45s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_worlds_greatest_stretch',
            description: 'Paso largo, codo al suelo y apertura hacia el cielo.',
            order: 1,
            dayOfWeek: 5,
          },
          {
            id: 'ex-mov-sideplank',
            name: 'Plancha Lateral con Elevación de Pierna',
            sets: 3,
            reps: 30, // 30s por lado
            restTime: '45s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_side_plank',
            description: 'Activación del cuadrado lumbar y glúteo medio.',
            order: 2,
            dayOfWeek: 5,
          },
          {
            id: 'ex-mov-cossack',
            name: 'Sentadilla Cossack Suave (Movilidad de Aductores)',
            sets: 3,
            reps: 8,
            restTime: '45s',
            videoUrl: 'https://www.youtube.com/watch?v=exercise_cossack_squat',
            description: 'Flexión lateral profunda con talón opuesto anclado.',
            order: 3,
            dayOfWeek: 5,
          },
        ],
      },
    ],
  },
];

/**
 * Retorna todos los programas de inicio disponibles.
 */
export function getStarterWorkouts(): StarterWorkoutProgram[] {
  return STARTER_WORKOUT_PROGRAMS;
}

/**
 * Obtiene un programa de inicio por su ID.
 */
export function getStarterWorkoutById(id: string): StarterWorkoutProgram | undefined {
  return STARTER_WORKOUT_PROGRAMS.find((p) => p.id === id);
}

/**
 * Convierte un programa de inicio a la estructura estándar Workout para el logger interactivo.
 */
export function convertStarterToClientWorkout(
  program: StarterWorkoutProgram,
  clientId: string = 'autonomous-client',
): Workout {
  const allExercises: Exercise[] = [];
  program.days.forEach((day) => {
    day.exercises.forEach((ex) => {
      allExercises.push({
        ...ex,
        dayOfWeek: day.dayOfWeek,
      });
    });
  });

  return {
    id: program.id,
    clientId,
    trainerId: 'starter-coach',
    name: program.name,
    difficulty: program.difficulty,
    description: program.description,
    exercises: allExercises,
    daysPerWeek: program.daysPerWeek,
    scheduledDays: program.scheduledDays,
    clientFlexibility: {
      allowReschedule: true,
      allowSkip: true,
    },
    createdAt: null as any,
    updatedAt: null as any,
  };
}
