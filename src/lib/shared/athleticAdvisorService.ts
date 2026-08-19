/**
 * Servicio de Asesoramiento y Recomendaciones Atléticas — CampFit
 *
 * Proporciona diagnósticos y recomendaciones biomecánicas para orientar el fortalecimiento
 * según los objetivos del alumno:
 * 1. ⚖️ Cuerpo Equilibrado (Armonía funcional, postura y balance)
 * 2. ⚡ Potenciación Deportiva Máxima (Rendimiento específico por deporte: fútbol, running, pádel, etc.)
 * 3. 🔥 Híbrido Atlético (Combinación de rendimiento deportivo y estética/hipertrofia equilibrada)
 *
 * @module shared/athleticAdvisorService
 */

import type {
  AthleticFocusType,
  AthleticSport,
  AthleticRecommendation,
} from '@/types';
import type { ExerciseItem, MuscleGroup } from '@/lib/shared/exerciseLibrary';

export type {
  AthleticFocusType,
  AthleticSport,
  AthleticRecommendation,
};

export const MUSCLE_SPANISH_LABELS: Record<string, string> = {
  core: 'Core y Abdomen Profundo',
  glutes: 'Glúteos y Estabilizadores de Cadera',
  hamstrings: 'Isquiotibiales y Cadena Posterior',
  quadriceps: 'Cuádriceps y Extensores de Rodilla',
  calves: 'Gemelos, Sóleo y Tendón de Aquiles',
  back: 'Espalda Media, Dorsal y Trapecio',
  chest: 'Pectorales',
  shoulders: 'Hombros y Manguito Rotador',
  biceps: 'Bíceps y Flexores de Brazo',
  triceps: 'Tríceps y Extensores de Codo',
  forearms: 'Antebrazos y Agarre',
  full_body: 'Cuerpo Completo',
  cardio: 'Capacidad Cardiovascular',
};

export interface FocusOption {
  id: AthleticFocusType;
  name: string;
  icon: string;
  badge: string;
  description: string;
}

export interface SportOption {
  id: AthleticSport;
  name: string;
  icon: string;
  description: string;
}

export const FOCUS_OPTIONS: FocusOption[] = [
  {
    id: 'balanced',
    name: 'Cuerpo Equilibrado y Salud Funcional',
    icon: '⚖️',
    badge: 'Armonía & Postura',
    description:
      'Fortalece cadenas musculares simétricas, corrige desbalances posturales y previene dolores lumbares y articulares.',
  },
  {
    id: 'sport_performance',
    name: 'Potenciación Deportiva Máxima',
    icon: '⚡',
    badge: 'Máximo Rendimiento',
    description:
      'Enfocado en la potencia explosiva, velocidad, agilidad y cadenas biomecánicas críticas para tu disciplina deportiva.',
  },
  {
    id: 'hybrid',
    name: 'Híbrido Atlético (Fuerza + Estética)',
    icon: '🔥',
    badge: 'Rendimiento & Estética',
    description:
      'Combina acondicionamiento atlético con hipertrofia proporcionada para rendir como un deportista y verte fuerte.',
  },
];

export const SPORTS_OPTIONS: SportOption[] = [
  {
    id: 'football',
    name: 'Fútbol / Futsal',
    icon: '⚽',
    description: 'Aceleración, golpeo, cambios de ritmo y estabilidad en giros.',
  },
  {
    id: 'running',
    name: 'Running / Trail',
    icon: '🏃',
    description: 'Economía de carrera, reactividad del pie y resistencia del tren inferior.',
  },
  {
    id: 'padel_tennis',
    name: 'Pádel / Tenis',
    icon: '🎾',
    description: 'Fuerza rotacional, desaceleraciones laterales y salud del hombro/codo.',
  },
  {
    id: 'basketball',
    name: 'Baloncesto / Vóley',
    icon: '🏀',
    description: 'Salto vertical, aterrizajes seguros y potencia de tren superior.',
  },
  {
    id: 'swimming',
    name: 'Natación',
    icon: '🏊',
    description: 'Tracción dorsal, estabilidad escapular y core hidrodinámico.',
  },
  {
    id: 'cycling',
    name: 'Ciclismo / Triatlón',
    icon: '🚴',
    description: 'Fuerza en pedalada, resistencia de cuádriceps y sostén lumbar.',
  },
  {
    id: 'martial_arts',
    name: 'Artes Marciales / Boxeo',
    icon: '🥊',
    description: 'Transferencia de fuerza desde cadera, pegada explosiva y agilidad.',
  },
  {
    id: 'strength',
    name: 'Fuerza / Levantamiento',
    icon: '🏋️',
    description: 'Levantamientos pesados (sentadilla, peso muerto, press) y densidad ósea.',
  },
];

/**
 * Genera la recomendación completa según el enfoque y deporte seleccionado.
 */
export function getAthleticRecommendation(
  focus: AthleticFocusType,
  sport: AthleticSport = 'football'
): AthleticRecommendation {
  if (focus === 'balanced') {
    return {
      focusType: 'balanced',
      title: 'Plan de Armonía Funcional y Simetría',
      subtitle: 'Enfoque integral en equilibrio muscular, postura y prevención articular',
      priorityMuscles: ['core', 'back', 'glutes', 'shoulders'],
      muscleLabels: MUSCLE_SPANISH_LABELS,
      keyBenefits: [
        'Distribución simétrica de volumen entre empujes (pecho) y tirones (espalda).',
        'Estabilización de cadera y pelvis mediante activación glútea.',
        'Fortalecimiento del core anti-rotación y anti-extensión para proteger la columna.',
      ],
      biomechanicalAdvice:
        'Prioriza ejercicios bilaterales compuestos (sentadillas, dominadas asistidas, peso muerto rumano) combinados con trabajo unilateral para corregir asimetrías de fuerza entre lados izquierdo y derecho.',
      suggestedCategories: ['strength', 'mobility', 'functional'],
      preventiveTips: [
        'No descuides la movilidad de tobillo y cadera antes de las series pesadas.',
        'Mantén un ratio 1:1 entre ejercicios de empuje y tirón para prevenir hombros adelantados.',
      ],
    };
  }

  if (focus === 'hybrid') {
    return {
      focusType: 'hybrid',
      title: 'Plan Híbrido: Rendimiento Atlético + Estética Proporcionada',
      subtitle: 'El punto óptimo entre fuerza explosiva, capacidad cardiovascular y desarrollo muscular',
      priorityMuscles: ['chest', 'back', 'quadriceps', 'hamstrings', 'shoulders', 'core'],
      muscleLabels: MUSCLE_SPANISH_LABELS,
      keyBenefits: [
        'Incremento de masa muscular limpia y estética en torso y piernas.',
        'Alta capacidad de trabajo y acondicionamiento metabólico.',
        'Mantenimiento de agilidad y velocidad sin perder flexibilidad.',
      ],
      biomechanicalAdvice:
        'Estructura la sesión con un ejercicio principal de fuerza pura (3-5 reps), seguido de bloques de hipertrofia funcional (8-12 reps) y remata con intervalos de alta intensidad o core.',
      suggestedCategories: ['strength', 'hiit', 'plyometrics'],
      preventiveTips: [
        'Monitorea el volumen semanal total para no sobrecargar el sistema nervioso central.',
        'Asegura una ingesta de hidratación y proteínas adecuada para soportar el doble estímulo.',
      ],
    };
  }

  // Sport-specific performance
  switch (sport) {
    case 'football':
      return {
        focusType: 'sport_performance',
        sport: 'football',
        title: 'Optimización para Fútbol y Deportes de Equipo',
        subtitle: 'Fuerza excéntrica, prevención de roturas de fibras y potencia de salto/arrancada',
        priorityMuscles: ['hamstrings', 'quadriceps', 'glutes', 'calves', 'core'],
        muscleLabels: MUSCLE_SPANISH_LABELS,
        keyBenefits: [
          'Prevención de lesiones de isquiotibiales mediante curls nórdicos y peso muerto a una pierna.',
          'Mayor aceleración en los primeros 5 metros gracias a la potencia de glúteos y gemelos.',
          'Estabilidad del core rotacional para soportar cargas y choques cuerpo a cuerpo.',
        ],
        biomechanicalAdvice:
          'Incluye ejercicios de aceleración y desaceleración, pliometría lateral y fortalecimiento específico de aductores (Copenhagen plank).',
        suggestedCategories: ['plyometrics', 'functional', 'speed'],
        preventiveTips: [
          'Dedica 10 minutos post-partido al trabajo de descarga de flexores de cadera e isquiotibiales.',
        ],
      };

    case 'running':
      return {
        focusType: 'sport_performance',
        sport: 'running',
        title: 'Optimización para Running y Trail',
        subtitle: 'Economía de zancada, reactividad tendinosa y resistencia a la fatiga',
        priorityMuscles: ['glutes', 'calves', 'hamstrings', 'core'],
        muscleLabels: MUSCLE_SPANISH_LABELS,
        keyBenefits: [
          'Fortalecimiento del sóleo y tendón de Aquiles para disipar el impacto contra el asfalto.',
          'Glúteo medio fuerte para evitar que la rodilla colapse hacia adentro (valgo de rodilla).',
          'Core compacto que evita la oscilación del tronco y ahorra oxígeno.',
        ],
        biomechanicalAdvice:
          'Trabaja fuerza máxima (bajas repeticiones, alta carga) para mejorar la rigidez del tendón sin añadir peso muscular excesivo.',
        suggestedCategories: ['strength', 'isometric', 'stability'],
        preventiveTips: [
          'Fortalece el tibial anterior para prevenir periostitis tibial.',
          'Incluye zancadas búlgaras para estabilidad unipodal.',
        ],
      };

    case 'padel_tennis':
      return {
        focusType: 'sport_performance',
        sport: 'padel_tennis',
        title: 'Optimización para Pádel y Deportes de Raqueta',
        subtitle: 'Fuerza rotacional, salud del hombro y velocidad de reacción en pista',
        priorityMuscles: ['shoulders', 'forearms', 'core', 'calves', 'quadriceps'],
        muscleLabels: MUSCLE_SPANISH_LABELS,
        keyBenefits: [
          'Blindaje del manguito rotador y deltoides para smash y bandejas potentes sin dolor.',
          'Fortalecimiento de muñeca y antebrazo para prevenir epicondilitis (codo de tenista).',
          'Desplazamientos laterales rápidos y frenadas controladas en pista.',
        ],
        biomechanicalAdvice:
          'Incorpora trabajo rotacional con poleas/bandas (press Pallof, lanzamientos de balón medicinal) y rotadores externos de hombro.',
        suggestedCategories: ['rotational', 'power', 'injury_prevention'],
        preventiveTips: [
          'Calienta siempre los rotadores de hombro con banda elástica antes de entrar a pista.',
        ],
      };

    case 'basketball':
      return {
        focusType: 'sport_performance',
        sport: 'basketball',
        title: 'Optimización para Baloncesto y Vóley',
        subtitle: 'Triple extensión explosiva, salto vertical y recepción de impactos',
        priorityMuscles: ['glutes', 'quadriceps', 'calves', 'core', 'shoulders'],
        muscleLabels: MUSCLE_SPANISH_LABELS,
        keyBenefits: [
          'Potenciación de la triple extensión (tobillo-rodilla-cadera) para elevar el salto vertical.',
          'Fortalecimiento del tendón rotuliano con sentadillas búlgaras y trabajo isométrico.',
          'Estabilidad de tobillo para aterrizajes seguros en rebotes.',
        ],
        biomechanicalAdvice:
          'Combina saltos pliométricos en cajón con sentadillas profundas explosivas y trap bar deadlifts.',
        suggestedCategories: ['plyometrics', 'explosive', 'strength'],
        preventiveTips: [
          'Enfócate en la técnica de aterrizaje (flexión de cadera y rodillas alineadas).',
        ],
      };

    case 'swimming':
      return {
        focusType: 'sport_performance',
        sport: 'swimming',
        title: 'Optimización para Natación',
        subtitle: 'Tracción dorsal potente, movilidad torácica y core hidrodinámico',
        priorityMuscles: ['back', 'shoulders', 'triceps', 'core'],
        muscleLabels: MUSCLE_SPANISH_LABELS,
        keyBenefits: [
          'Mayor propulsión por brazada mediante dominadas y jalones dorsales.',
          'Salud escapular para evitar el hombro de nadador.',
          'Cuerpo alineado en el agua gracias al fortalecimiento del transverso abdominal.',
        ],
        biomechanicalAdvice:
          'Enfócate en tirones en todos los ángulos (vertical y horizontal) y rotación torácica.',
        suggestedCategories: ['pull', 'stability', 'core'],
        preventiveTips: [
          'Realiza estiramientos de pectoral y fortalecimiento de trapecio inferior/medio.',
        ],
      };

    case 'cycling':
      return {
        focusType: 'sport_performance',
        sport: 'cycling',
        title: 'Optimización para Ciclismo y Triatlón',
        subtitle: 'Fuerza en punto muerto de pedalada y resistencia postural en manillar',
        priorityMuscles: ['quadriceps', 'glutes', 'hamstrings', 'back', 'core'],
        muscleLabels: MUSCLE_SPANISH_LABELS,
        keyBenefits: [
          'Vatios superiores en sprints y subidas gracias a la potencia de cuádriceps y glúteos.',
          'Resistencia de la espalda baja y cuello durante largas tiradas en bicicleta.',
        ],
        biomechanicalAdvice:
          'Utiliza sentadilla pesada y empuje de cadera (hip thrust) para transferir potencia directa al pedal.',
        suggestedCategories: ['strength', 'endurance', 'core'],
        preventiveTips: [
          'Estira los flexores de cadera (psoas) que suelen acortarse en la posición aerodinámica.',
        ],
      };

    case 'martial_arts':
      return {
        focusType: 'sport_performance',
        sport: 'martial_arts',
        title: 'Optimización para Artes Marciales y Boxeo',
        subtitle: 'Pegada explosiva desde la cadena cinética del suelo hasta el puño/patada',
        priorityMuscles: ['core', 'shoulders', 'back', 'glutes', 'forearms'],
        muscleLabels: MUSCLE_SPANISH_LABELS,
        keyBenefits: [
          'Golpes con más pegada gracias a la rotación de cadera y transferencia por el core.',
          'Capacidad de absorción de impactos y solidez en combate.',
        ],
        biomechanicalAdvice:
          'Ejercicios balísticos (kettlebell swings, lanzamientos de balón, push press).',
        suggestedCategories: ['power', 'ballistic', 'functional'],
        preventiveTips: [
          'Fortalece los extensores de cuello y muñecas para absorber golpes.',
        ],
      };

    case 'strength':
    default:
      return {
        focusType: 'sport_performance',
        sport: 'strength',
        title: 'Optimización para Deportes de Fuerza y Powerlifting',
        subtitle: 'Máxima tensión mecánica, densidad muscular y técnica en levantamientos pesados',
        priorityMuscles: ['back', 'quadriceps', 'hamstrings', 'glutes', 'chest', 'triceps'],
        muscleLabels: MUSCLE_SPANISH_LABELS,
        keyBenefits: [
          'Superación de puntos de estancamiento en press de banca, sentadilla y peso muerto.',
          'Densidad ósea e hipertrofia miofibrilar sólida.',
        ],
        biomechanicalAdvice:
          'Ciclos de sobrecarga progresiva con descansos completos de 2 a 3 minutos entre series pesadas.',
        suggestedCategories: ['heavy_strength', 'compound', 'hypertrophy'],
        preventiveTips: [
          'Cuida la técnica de bracing (maniobra de Valsalva) para proteger las vértebras lumbares.',
        ],
      };
  }
}

/**
 * Filtra y sugiere ejercicios del catálogo que coinciden con los músculos prioritarios de la recomendación.
 */
export function suggestExercisesForRecommendation(
  recommendation: AthleticRecommendation,
  catalog: ExerciseItem[],
  maxCount: number = 6
): ExerciseItem[] {
  if (!catalog || catalog.length === 0) return [];

  const prioritySet = new Set(recommendation.priorityMuscles);

  // Filtrar ejercicios que tengan alguno de los músculos prioritarios en sus muscleGroups
  const matching = catalog.filter((ex) => {
    if (!ex.muscleGroups || ex.muscleGroups.length === 0) return false;
    return ex.muscleGroups.some((mg) => prioritySet.has(mg));
  });

  // Ordenar dando prioridad a los que tengan más músculos prioritarios y dificultad adecuada
  matching.sort((a, b) => {
    const aPriorityCount = (a.muscleGroups || []).filter((mg) => prioritySet.has(mg)).length;
    const bPriorityCount = (b.muscleGroups || []).filter((mg) => prioritySet.has(mg)).length;
    return bPriorityCount - aPriorityCount;
  });

  return matching.slice(0, maxCount);
}
