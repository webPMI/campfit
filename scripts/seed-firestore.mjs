/**
 * CampFit Seed Data Generator — Enhanced
 * ==========================================
 * Popula Firestore con datos realistas que coinciden con los tipos TS.
 *
 * Uso:
 *   1. set FIREBASE_EMULATOR=true (para desarrollo local)
 *   2. node scripts/seed-firestore.mjs
 *
 * ADVERTENCIA: Este script CREA datos en Firestore.
 * Usar solo en entornos de desarrollo/demo.
 *
 * @module seed-firestore
 */

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'campfit-dev';
const USE_EMULATOR = process.env.FIREBASE_EMULATOR === 'true';
const EMULATOR_HOST = process.env.FIREBASE_EMULATOR_HOST || 'localhost:8080';

const SEED_CONFIG = {
    admins: 1,
    trainers: 5,
    clientsPerTrainer: 6,
    workoutsPerClient: 4,
    dietsPerClient: 3,
    progressLogsPerClient: 12,
    forceClean: false,
};

// ══════════════════════════════════════════════════════
// Credenciales
// ══════════════════════════════════════════════════════
const ADMIN_EMAIL = 'admin@campfit.com';
const ADMIN_PASSWORD = 'Admin123!';
const TRAINER_NAMES = ['Carlos Martínez', 'María López', 'Javier Rodríguez'];
const TRAINER_EMAILS = [
    'carlos.trainer@campfit.com',
    'maria.trainer@campfit.com',
    'javier.trainer@campfit.com',
];
const CLIENT_NAMES = [
    'Ana García', 'Pedro Sánchez', 'Laura Fernández', 'Diego Torres', 'Sofía Ruiz',
    'Miguel Ángel Díaz', 'Valentina Herrera', 'Andrés Morales', 'Camila Ortiz', 'Lucas Ramírez',
    'Isabella Vargas', 'Mateo Castillo', 'Elena Muñoz', 'Roberto Iglesias', 'Carmen Vega',
];
const CLIENT_EMAILS = CLIENT_NAMES.map(n => n.toLowerCase().replace(/\s+/g, '.') + '@example.com');

// ══════════════════════════════════════════════════════
// WORKOUT TEMPLATES (16 templates, 4 por nivel)
// ══════════════════════════════════════════════════════
const WORKOUT_TEMPLATES = [
    // ─── EASY ───
    {
        name: 'Full Body Principiante A', difficulty: 'easy',
        description: 'Rutina de cuerpo completo ideal para quienes empiezan. Movimientos básicos con énfasis en técnica.',
        exercises: [
            { name: 'Sentadilla con peso corporal', sets: 3, reps: 15, restTime: '45s', videoUrl: '', description: 'Bajar hasta que los muslos estén paralelos al suelo', order: 0, dayOfWeek: 1 },
            { name: 'Press de pecho con mancuernas', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Banco plano, controlar la bajada', order: 1, dayOfWeek: 1 },
            { name: 'Remo con mancuerna a una mano', sets: 3, reps: 12, restTime: '45s', videoUrl: '', description: 'Apoyar rodilla en banco, espalda recta', order: 2, dayOfWeek: 1 },
            { name: 'Plancha abdominal', sets: 3, reps: 1, restTime: '30s', videoUrl: '', description: 'Mantener 30 segundos, contraer abdomen', order: 3, dayOfWeek: 1 },
            { name: 'Puente de glúteos', sets: 3, reps: 15, restTime: '30s', videoUrl: '', description: 'Elevar cadera apretando glúteos', order: 4, dayOfWeek: 1 },
        ],
    },
    {
        name: 'Full Body Principiante B', difficulty: 'easy',
        description: 'Segunda rutina de iniciación. Introduce variantes y más volumen.',
        exercises: [
            { name: 'Zancadas alternas', sets: 3, reps: 10, restTime: '45s', videoUrl: '', description: 'Por pierna, rodilla no sobrepasa punta del pie', order: 0, dayOfWeek: 3 },
            { name: 'Press de hombro con mancuernas', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Sentado, sin arquear la espalda', order: 1, dayOfWeek: 3 },
            { name: 'Jalón al pecho en polea', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Agarrre ancho, tirar hacia el pecho', order: 2, dayOfWeek: 3 },
            { name: 'Curl de bíceps con mancuernas', sets: 3, reps: 12, restTime: '45s', videoUrl: '', description: 'Codos pegados al cuerpo', order: 3, dayOfWeek: 3 },
            { name: 'Extensiones de tríceps en polea', sets: 3, reps: 12, restTime: '45s', videoUrl: '', description: 'Solo mover antebrazo', order: 4, dayOfWeek: 3 },
        ],
    },
    {
        name: 'Cardio Principiante', difficulty: 'easy',
        description: 'Circuito cardiovascular de baja intensidad. Ideal para mejorar resistencia.',
        exercises: [
            { name: 'Caminata rápida en cinta', sets: 1, reps: 1, restTime: '0s', videoUrl: '', description: '20 minutos a ritmo moderado (5-6 km/h)', order: 0, dayOfWeek: 2 },
            { name: 'Bicicleta estática', sets: 1, reps: 1, restTime: '0s', videoUrl: '', description: '15 minutos, resistencia baja-media', order: 1, dayOfWeek: 2 },
            { name: 'Elíptica', sets: 1, reps: 1, restTime: '0s', videoUrl: '', description: '10 minutos, sin resistencia', order: 2, dayOfWeek: 2 },
            { name: 'Estiramientos generales', sets: 1, reps: 1, restTime: '0s', videoUrl: '', description: '10 minutos de estiramientos básicos', order: 3, dayOfWeek: 2 },
        ],
    },
    {
        name: 'Core & Estabilidad', difficulty: 'easy',
        description: 'Fortalece la zona media y mejora la estabilidad postural.',
        exercises: [
            { name: 'Plancha frontal', sets: 3, reps: 1, restTime: '30s', videoUrl: '', description: '30 segundos, cuerpo en línea recta', order: 0, dayOfWeek: 5 },
            { name: 'Plancha lateral', sets: 2, reps: 1, restTime: '30s', videoUrl: '', description: '20 segundos por lado', order: 1, dayOfWeek: 5 },
            { name: 'Crunches', sets: 3, reps: 20, restTime: '30s', videoUrl: '', description: 'Elevar solo hombros, no tirar del cuello', order: 2, dayOfWeek: 5 },
            { name: 'Superman', sets: 3, reps: 12, restTime: '30s', videoUrl: '', description: 'Boca abajo, elevar brazos y piernas', order: 3, dayOfWeek: 5 },
            { name: 'Bird Dog', sets: 3, reps: 10, restTime: '30s', videoUrl: '', description: 'Alternar brazo/pierna contraria', order: 4, dayOfWeek: 5 },
        ],
    },

    // ─── MEDIUM ───
    {
        name: 'Push Day (Empuje)', difficulty: 'medium',
        description: 'Día de empuje: pecho, hombros y tríceps. Hipertrofia con sobrecarga progresiva.',
        exercises: [
            { name: 'Press de banca con barra', sets: 4, reps: 10, restTime: '90s', videoUrl: '', description: 'Agarre medio, tocar pecho, explosivo al subir', order: 0, dayOfWeek: 1 },
            { name: 'Press inclinado con mancuernas', sets: 4, reps: 10, restTime: '90s', videoUrl: '', description: 'Banco a 30°, codos a 45°', order: 1, dayOfWeek: 1 },
            { name: 'Aperturas con mancuernas', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Ligera flexión de codos, estirar bien', order: 2, dayOfWeek: 1 },
            { name: 'Press militar', sets: 3, reps: 10, restTime: '90s', videoUrl: '', description: 'Barra al frente, sin impulso de piernas', order: 3, dayOfWeek: 1 },
            { name: 'Elevaciones laterales', sets: 4, reps: 15, restTime: '45s', videoUrl: '', description: 'Subir hasta altura de hombros', order: 4, dayOfWeek: 1 },
            { name: 'Fondos en paralelas', sets: 3, reps: 8, restTime: '90s', videoUrl: '', description: 'Bajar hasta 90° de codo', order: 5, dayOfWeek: 1 },
        ],
    },
    {
        name: 'Pull Day (Tracción)', difficulty: 'medium',
        description: 'Día de tracción: espalda y bíceps. Enfoque en grosor y anchura.',
        exercises: [
            { name: 'Peso muerto convencional', sets: 3, reps: 8, restTime: '120s', videoUrl: '', description: 'Espalda neutra, activar core antes de tirar', order: 0, dayOfWeek: 3 },
            { name: 'Dominadas (o jalón)', sets: 4, reps: 8, restTime: '90s', videoUrl: '', description: 'Agarrre prono ancho, subir hasta barbilla', order: 1, dayOfWeek: 3 },
            { name: 'Remo con barra', sets: 4, reps: 10, restTime: '90s', videoUrl: '', description: 'Torso a 45°, tirar al ombligo', order: 2, dayOfWeek: 3 },
            { name: 'Remo en polea baja', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Agarrre estrecho, apretar escápulas', order: 3, dayOfWeek: 3 },
            { name: 'Curl de bíceps con barra Z', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Sin balanceo, controlar excéntrica', order: 4, dayOfWeek: 3 },
            { name: 'Curl martillo', sets: 3, reps: 12, restTime: '45s', videoUrl: '', description: 'Palmas enfrentadas, apretar en contracción', order: 5, dayOfWeek: 3 },
        ],
    },
    {
        name: 'Leg Day Completo', difficulty: 'medium',
        description: 'Rutina completa de pierna. Cuádriceps, isquios y gemelos.',
        exercises: [
            { name: 'Sentadilla con barra', sets: 4, reps: 10, restTime: '120s', videoUrl: '', description: 'Barra alta, profundidad completa', order: 0, dayOfWeek: 5 },
            { name: 'Prensa inclinada', sets: 4, reps: 12, restTime: '90s', videoUrl: '', description: 'Pies anchos, bajar controlado', order: 1, dayOfWeek: 5 },
            { name: 'Peso muerto rumano', sets: 3, reps: 10, restTime: '90s', videoUrl: '', description: 'Flexión de cadera, espalda recta', order: 2, dayOfWeek: 5 },
            { name: 'Zancadas caminando', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Con mancuernas, 12 pasos por pierna', order: 3, dayOfWeek: 5 },
            { name: 'Curl femoral en máquina', sets: 3, reps: 15, restTime: '45s', videoUrl: '', description: 'Controlar la excéntrica', order: 4, dayOfWeek: 5 },
            { name: 'Elevación de talones de pie', sets: 4, reps: 20, restTime: '45s', videoUrl: '', description: 'Rango completo, pausa arriba', order: 5, dayOfWeek: 5 },
        ],
    },
    {
        name: 'Hipertrofia Upper Body', difficulty: 'medium',
        description: 'Volumen alto para tren superior. Técnicas de intensidad.',
        exercises: [
            { name: 'Press inclinado con barra', sets: 4, reps: 10, restTime: '90s', videoUrl: '', description: '30° de inclinación, tocar parte alta del pecho', order: 0, dayOfWeek: 2 },
            { name: 'Remo Pendlay', sets: 4, reps: 8, restTime: '90s', videoUrl: '', description: 'Desde el suelo cada repetición', order: 1, dayOfWeek: 2 },
            { name: 'Press Arnold', sets: 4, reps: 10, restTime: '90s', videoUrl: '', description: 'Rotación completa, controlado', order: 2, dayOfWeek: 2 },
            { name: 'Pull-over con mancuerna', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Estirar bien dorsal al bajar', order: 3, dayOfWeek: 2 },
            { name: 'Face Pull', sets: 4, reps: 15, restTime: '45s', videoUrl: '', description: 'Tirar hacia la cara, rotación externa', order: 4, dayOfWeek: 2 },
        ],
    },

    // ─── HARD ───
    {
        name: 'Powerlifting Push', difficulty: 'hard',
        description: 'Fuerza máxima en press de banca y ejercicios accesorios.',
        exercises: [
            { name: 'Press de banca (fuerza)', sets: 5, reps: 5, restTime: '150s', videoUrl: '', description: 'Carga al 80-85% 1RM, pausa en pecho', order: 0, dayOfWeek: 1 },
            { name: 'Press de banca con pausa', sets: 3, reps: 3, restTime: '120s', videoUrl: '', description: 'Pausa de 2 segundos en el pecho', order: 1, dayOfWeek: 1 },
            { name: 'Press inclinado pesado', sets: 4, reps: 6, restTime: '120s', videoUrl: '', description: 'Carga al 75% 1RM', order: 2, dayOfWeek: 1 },
            { name: 'Fondos lastrados', sets: 4, reps: 6, restTime: '90s', videoUrl: '', description: 'Añadir lastre progresivo', order: 3, dayOfWeek: 1 },
            { name: 'Press cerrado', sets: 3, reps: 8, restTime: '90s', videoUrl: '', description: 'Manos a anchura de hombros', order: 4, dayOfWeek: 1 },
        ],
    },
    {
        name: 'Powerlifting Pull', difficulty: 'hard',
        description: 'Peso muerto pesado y accesorios de fuerza para espalda.',
        exercises: [
            { name: 'Peso muerto (fuerza)', sets: 5, reps: 3, restTime: '180s', videoUrl: '', description: 'Carga al 85-90% 1RM', order: 0, dayOfWeek: 3 },
            { name: 'Peso muerto con déficit', sets: 3, reps: 5, restTime: '150s', videoUrl: '', description: 'De pie sobre discos de 5cm', order: 1, dayOfWeek: 3 },
            { name: 'Dominadas lastradas', sets: 4, reps: 5, restTime: '120s', videoUrl: '', description: 'Añadir 5-10kg si >8 reps', order: 2, dayOfWeek: 3 },
            { name: 'Remo con barra T', sets: 4, reps: 8, restTime: '90s', videoUrl: '', description: 'Agarrre cerrado, carga pesada', order: 3, dayOfWeek: 3 },
            { name: 'Encogimientos con barra', sets: 4, reps: 10, restTime: '60s', videoUrl: '', description: 'Trapecio, carga pesada', order: 4, dayOfWeek: 3 },
        ],
    },
    {
        name: 'Squat Day (Fuerza)', difficulty: 'hard',
        description: 'Sentadilla pesada + accesorios para desarrollo completo de pierna.',
        exercises: [
            { name: 'Sentadilla (fuerza)', sets: 5, reps: 5, restTime: '180s', videoUrl: '', description: 'Carga al 80-85% 1RM, profundidad completa', order: 0, dayOfWeek: 5 },
            { name: 'Sentadilla frontal', sets: 3, reps: 8, restTime: '120s', videoUrl: '', description: 'Barra en clavículas, torso más vertical', order: 1, dayOfWeek: 5 },
            { name: 'Peso muerto sumo', sets: 3, reps: 6, restTime: '150s', videoUrl: '', description: 'Postura ancha, agarrre interior', order: 2, dayOfWeek: 5 },
            { name: 'Hip Thrust con barra', sets: 4, reps: 10, restTime: '90s', videoUrl: '', description: 'Apoyar escapulas en banco, carga en cadera', order: 3, dayOfWeek: 5 },
            { name: 'Sentadilla búlgara', sets: 3, reps: 8, restTime: '90s', videoUrl: '', description: 'Pie trasero elevado, pierna delantera a 90°', order: 4, dayOfWeek: 5 },
        ],
    },
    {
        name: 'Full Body Avanzado', difficulty: 'hard',
        description: 'Rutina de cuerpo completo para atletas experimentados.',
        exercises: [
            { name: 'Clean & Press', sets: 4, reps: 5, restTime: '120s', videoUrl: '', description: 'Movimiento olímpico completo', order: 0, dayOfWeek: 4 },
            { name: 'Snatch grip deadlift', sets: 4, reps: 6, restTime: '120s', videoUrl: '', description: 'Agarrre ancho, activar dorsales', order: 1, dayOfWeek: 4 },
            { name: 'Pull-ups explosivas', sets: 4, reps: 5, restTime: '90s', videoUrl: '', description: 'Soltar barra arriba si es posible', order: 2, dayOfWeek: 4 },
            { name: 'Dips lastrados', sets: 4, reps: 8, restTime: '90s', videoUrl: '', description: 'Carga progresiva', order: 3, dayOfWeek: 4 },
            { name: 'Kettlebell swings', sets: 4, reps: 20, restTime: '60s', videoUrl: '', description: '24-32kg, potencia de cadera', order: 4, dayOfWeek: 4 },
            { name: 'Farmer walks', sets: 3, reps: 1, restTime: '60s', videoUrl: '', description: '40m con mancuernas pesadas', order: 5, dayOfWeek: 4 },
        ],
    },

    // ─── SPECIALIZED ───
    {
        name: 'Movilidad & Flexibilidad', difficulty: 'easy',
        description: 'Rutina de movilidad articular para recuperación activa.',
        exercises: [
            { name: 'Cat-Cow', sets: 2, reps: 10, restTime: '0s', videoUrl: '', description: 'Articulación vertebral completa', order: 0, dayOfWeek: 6 },
            { name: 'World greatest stretch', sets: 2, reps: 5, restTime: '0s', videoUrl: '', description: 'Por lado, mantener 5 segundos cada posición', order: 1, dayOfWeek: 6 },
            { name: 'Círculos de cadera', sets: 2, reps: 10, restTime: '0s', videoUrl: '', description: 'Controlados, por sentido', order: 2, dayOfWeek: 6 },
            { name: 'Estiramiento de isquios', sets: 2, reps: 1, restTime: '0s', videoUrl: '', description: '30 segundos por pierna', order: 3, dayOfWeek: 6 },
            { name: 'Apertura de pecho en pared', sets: 2, reps: 1, restTime: '0s', videoUrl: '', description: '30 segundos por lado, rotación torácica', order: 4, dayOfWeek: 6 },
            { name: 'Yoga flow (Saludo al sol)', sets: 2, reps: 3, restTime: '0s', videoUrl: '', description: '5 minutos de respiración consciente', order: 5, dayOfWeek: 6 },
        ],
    },
    {
        name: 'CrossFit WOD - Cindy', difficulty: 'hard',
        description: 'AMRAP 20 minutos: 5 dominadas, 10 flexiones, 15 sentadillas.',
        exercises: [
            { name: 'Dominadas', sets: 1, reps: 5, restTime: '0s', videoUrl: '', description: 'Kipping permitido', order: 0, dayOfWeek: 3 },
            { name: 'Flexiones', sets: 1, reps: 10, restTime: '0s', videoUrl: '', description: 'Pecho al suelo', order: 1, dayOfWeek: 3 },
            { name: 'Air Squats', sets: 1, reps: 15, restTime: '0s', videoUrl: '', description: 'Caderas por debajo de paralelo', order: 2, dayOfWeek: 3 },
        ],
    },
    {
        name: 'HIIT 30 Minutos', difficulty: 'medium',
        description: 'Entrenamiento interválico de alta intensidad. 30s on / 15s off.',
        exercises: [
            { name: 'Burpees', sets: 3, reps: 15, restTime: '15s', videoUrl: '', description: 'Con salto y palmada', order: 0, dayOfWeek: 4 },
            { name: 'Mountain climbers', sets: 3, reps: 25, restTime: '15s', videoUrl: '', description: 'Rodillas al pecho, ritmo rápido', order: 1, dayOfWeek: 4 },
            { name: 'Jump squats', sets: 3, reps: 15, restTime: '15s', videoUrl: '', description: 'Bajar controlado, explotar arriba', order: 2, dayOfWeek: 4 },
            { name: 'Battle ropes', sets: 3, reps: 1, restTime: '15s', videoUrl: '', description: 'Ondas durante 30 segundos', order: 3, dayOfWeek: 4 },
            { name: 'Box jumps', sets: 3, reps: 10, restTime: '15s', videoUrl: '', description: 'Caja de 50-60cm, caer suave', order: 4, dayOfWeek: 4 },
        ],
    },
    {
        name: 'Glúteo Focus', difficulty: 'medium',
        description: 'Rutina específica para desarrollo de glúteos.',
        exercises: [
            { name: 'Hip thrust', sets: 4, reps: 12, restTime: '90s', videoUrl: '', description: 'Pausa de 2s en contracción máxima', order: 0, dayOfWeek: 2 },
            { name: 'Sentadilla sumo', sets: 3, reps: 12, restTime: '90s', videoUrl: '', description: 'Pies más anchos que hombros, puntas hacia fuera', order: 1, dayOfWeek: 2 },
            { name: 'Puente de glúteos a una pierna', sets: 3, reps: 15, restTime: '60s', videoUrl: '', description: 'Por pierna, mantener cadera elevada', order: 2, dayOfWeek: 2 },
            { name: 'Patada de glúteo en polea', sets: 3, reps: 15, restTime: '45s', videoUrl: '', description: 'Sin arquear la espalda, solo cadera', order: 3, dayOfWeek: 2 },
            { name: 'Abducción en máquina', sets: 4, reps: 20, restTime: '45s', videoUrl: '', description: 'Rango completo, pausa en apertura', order: 4, dayOfWeek: 2 },
        ],
    },
];

// ══════════════════════════════════════════════════════
// DIET TEMPLATES (10 templates)
// ══════════════════════════════════════════════════════
const DIET_TEMPLATES = [
    {
        name: 'Volumen Limpio 3200kcal', type: 'normal', somatotype: 'ectomorph', totalCalories: 3200,
        description: 'Plan hipercalórico para ganancia de masa muscular con alimentos limpios y alta proteína.',
        meals: [
            { name: 'breakfast', description: 'Avena 80g + leche 300ml + plátano + 30g whey + 3 huevos revueltos', calories: 650, protein: 45, carbs: 70, fat: 20, order: 0 },
            { name: 'snack', description: 'Yogur griego 200g + 30g frutos secos + miel', calories: 350, protein: 20, carbs: 35, fat: 15, order: 1 },
            { name: 'lunch', description: 'Pollo 200g + arroz integral 150g (pesado crudo) + brócoli + aceite oliva', calories: 700, protein: 55, carbs: 80, fat: 15, order: 2 },
            { name: 'pre-workout', description: 'Arroz inflado 40g + 25g whey + plátano', calories: 450, protein: 35, carbs: 55, fat: 5, order: 3 },
            { name: 'dinner', description: 'Salmón 200g + boniato 200g + espárragos al horno', calories: 650, protein: 40, carbs: 55, fat: 25, order: 4 },
            { name: 'snack', description: 'Requesón 200g + almendras 20g', calories: 300, protein: 25, carbs: 10, fat: 18, order: 5 },
        ],
    },
    {
        name: 'Definición 2100kcal', type: 'normal', somatotype: 'endomorph', totalCalories: 2100,
        description: 'Déficit moderado para pérdida de grasa preservando masa muscular. Alto en proteína.',
        meals: [
            { name: 'breakfast', description: '6 claras + 1 huevo entero + espinacas + tostada integral', calories: 350, protein: 35, carbs: 25, fat: 10, order: 0 },
            { name: 'snack', description: 'Manzana verde + 15g almendras', calories: 200, protein: 5, carbs: 30, fat: 12, order: 1 },
            { name: 'lunch', description: 'Pavo 150g + ensalada mixta + quinoa 80g cocida + vinagreta limón', calories: 450, protein: 40, carbs: 40, fat: 12, order: 2 },
            { name: 'snack', description: 'Batido whey 30g con agua + pepino', calories: 150, protein: 30, carbs: 3, fat: 2, order: 3 },
            { name: 'dinner', description: 'Merluza 180g al vapor + brócoli + coliflor + limón', calories: 400, protein: 35, carbs: 20, fat: 12, order: 4 },
        ],
    },
    {
        name: 'Cetogénica 2400kcal', type: 'keto', somatotype: 'endomorph', totalCalories: 2400,
        description: '<20g carbohidratos netos. Grasas saludables como fuente principal de energía.',
        meals: [
            { name: 'breakfast', description: '3 huevos fritos en mantequilla + aguacate entero + bacon 50g', calories: 550, protein: 30, carbs: 5, fat: 48, order: 0 },
            { name: 'lunch', description: 'Ensalada César con pollo 180g (sin croutons) + aceite oliva 30ml + parmesano', calories: 600, protein: 40, carbs: 8, fat: 48, order: 1 },
            { name: 'snack', description: 'Queso curado 50g + nueces macadamia 30g', calories: 350, protein: 15, carbs: 4, fat: 32, order: 2 },
            { name: 'dinner', description: 'Chuletón de cerdo 200g + espárragos salteados en mantequilla', calories: 650, protein: 45, carbs: 6, fat: 52, order: 3 },
        ],
    },
    {
        name: 'Vegana Fitness 2800kcal', type: 'vegan', somatotype: 'mesomorph', totalCalories: 2800,
        description: 'Basado en plantas, alta proteína. Combinaciones completas de aminoácidos.',
        meals: [
            { name: 'breakfast', description: 'Smoothie bowl: proteína guisante 30g + espinacas + plátano + leche almendras + chía', calories: 500, protein: 35, carbs: 60, fat: 15, order: 0 },
            { name: 'snack', description: 'Hummus 100g + palitos zanahoria y apio + pan pita integral', calories: 280, protein: 12, carbs: 30, fat: 12, order: 1 },
            { name: 'lunch', description: 'Buddha bowl: quinoa 150g + garbanzos + tofu 150g + aguacate + kale', calories: 700, protein: 35, carbs: 75, fat: 28, order: 2 },
            { name: 'pre-workout', description: 'Batido proteína vegana 30g + frutos rojos + plátano', calories: 320, protein: 28, carbs: 40, fat: 6, order: 3 },
            { name: 'dinner', description: 'Lentejas 200g cocidas + boniato asado + espinacas salteadas', calories: 600, protein: 30, carbs: 80, fat: 12, order: 4 },
            { name: 'snack', description: 'Nueces 30g + dátiles 30g', calories: 250, protein: 5, carbs: 35, fat: 14, order: 5 },
        ],
    },
    {
        name: 'Ayuno Intermitente 2500kcal (16:8)', type: 'intermittent', somatotype: 'mesomorph', totalCalories: 2500,
        description: 'Protocolo 16:8. Primera comida a las 12:00, última a las 20:00.',
        meals: [
            { name: 'lunch', description: 'Bol grande: arroz integral 180g + pollo teriyaki 200g + verduras wok + huevo', calories: 950, protein: 55, carbs: 95, fat: 28, order: 0 },
            { name: 'snack', description: 'Batido proteína 40g + mantequilla almendra 20g + plátano', calories: 450, protein: 38, carbs: 45, fat: 18, order: 1 },
            { name: 'dinner', description: 'Salmón salvaje 200g + puré coliflor + ensalada rúcula y tomate + aceite oliva', calories: 800, protein: 45, carbs: 35, fat: 45, order: 2 },
        ],
    },
    {
        name: 'Paleo 2600kcal', type: 'paleo', somatotype: 'ectomorph', totalCalories: 2600,
        description: 'Sin cereales, lácteos ni legumbres. Basado en alimentos ancestrales.',
        meals: [
            { name: 'breakfast', description: '3 huevos revueltos + boniato 200g + aguacate medio', calories: 550, protein: 25, carbs: 50, fat: 28, order: 0 },
            { name: 'lunch', description: 'Salmón 200g a la plancha + batata al horno + ensalada verde + frutos secos', calories: 700, protein: 40, carbs: 55, fat: 30, order: 1 },
            { name: 'snack', description: 'Carne seca (jerky) 50g + frutos del bosque + nueces', calories: 350, protein: 25, carbs: 20, fat: 18, order: 2 },
            { name: 'dinner', description: 'Pollo asado 200g + calabacín, pimiento y berenjena al horno', calories: 600, protein: 45, carbs: 30, fat: 25, order: 3 },
        ],
    },
    {
        name: 'Mediterránea 2400kcal', type: 'normal', somatotype: 'mesomorph', totalCalories: 2400,
        description: 'Dieta mediterránea clásica. Alta en aceite de oliva, pescado y verduras.',
        meals: [
            { name: 'breakfast', description: 'Tostada integral + tomate rallado + aceite oliva + café + 2 huevos duros', calories: 400, protein: 20, carbs: 35, fat: 20, order: 0 },
            { name: 'lunch', description: 'Ensalada de lentejas + pimiento asado + atún + cebolla + aceite oliva', calories: 550, protein: 35, carbs: 55, fat: 18, order: 1 },
            { name: 'snack', description: 'Puñado de almendras + yogur natural', calories: 250, protein: 12, carbs: 15, fat: 15, order: 2 },
            { name: 'dinner', description: 'Pescado blanco (dorada/lubina) al horno + verduras asadas + patata pequeña', calories: 550, protein: 35, carbs: 45, fat: 20, order: 3 },
        ],
    },
    {
        name: 'Alto Proteico 3000kcal', type: 'advanced', somatotype: 'ectomorph', totalCalories: 3000,
        description: 'Enfoque en hipertrofia máxima. >2.2g proteína por kg de peso corporal.',
        meals: [
            { name: 'breakfast', description: '100g avena + 40g whey + 4 huevos + mantequilla cacahuete + plátano', calories: 750, protein: 55, carbs: 75, fat: 25, order: 0 },
            { name: 'snack', description: '40g caseína + 250ml leche + 30g almendras', calories: 400, protein: 38, carbs: 15, fat: 20, order: 1 },
            { name: 'lunch', description: 'Pollo 220g + arroz integral 180g + verduras + aceite oliva 15ml', calories: 700, protein: 55, carbs: 75, fat: 15, order: 2 },
            { name: 'pre-workout', description: 'Arroz blanco 120g + atún 150g + aguacate', calories: 500, protein: 35, carbs: 55, fat: 12, order: 3 },
            { name: 'post-workout', description: 'Whey 40g + dextrosa 30g + plátano', calories: 350, protein: 35, carbs: 50, fat: 2, order: 4 },
            { name: 'dinner', description: 'Ternera magra 200g + quinoa 120g + espárragos', calories: 550, protein: 45, carbs: 40, fat: 18, order: 5 },
        ],
    },
    {
        name: 'Vegetariana 2600kcal', type: 'vegetarian', somatotype: 'mesomorph', totalCalories: 2600,
        description: 'Dieta ovo-lacto-vegetariana equilibrada para rendimiento deportivo.',
        meals: [
            { name: 'breakfast', description: 'Porridge de avena + proteína whey + frutos rojos + semillas', calories: 500, protein: 30, carbs: 65, fat: 12, order: 0 },
            { name: 'snack', description: 'Yogur griego 250g + granola casera + miel', calories: 350, protein: 18, carbs: 40, fat: 10, order: 1 },
            { name: 'lunch', description: 'Wrap integral: falafel + hummus + verduras asadas + queso feta', calories: 650, protein: 28, carbs: 70, fat: 25, order: 2 },
            { name: 'snack', description: 'Batido: leche + whey + plátano + crema cacahuete', calories: 400, protein: 32, carbs: 40, fat: 14, order: 3 },
            { name: 'dinner', description: 'Tortilla de 3 huevos + queso + champiñones + ensalada + pan integral', calories: 550, protein: 30, carbs: 40, fat: 22, order: 4 },
        ],
    },
    {
        name: 'Recomposición Corporal 2200kcal', type: 'normal', somatotype: 'endomorph', totalCalories: 2200,
        description: 'Mantenimiento con ciclado de carbohidratos. Días altos/bajos en carbs.',
        meals: [
            { name: 'breakfast', description: 'Tortitas de avena y clara de huevo + fruta', calories: 400, protein: 30, carbs: 45, fat: 10, order: 0 },
            { name: 'lunch', description: 'Pollo al curry con arroz basmati y verduras (día alto) / Ensalada de pollo (día bajo)', calories: 550, protein: 45, carbs: 50, fat: 15, order: 1 },
            { name: 'snack', description: 'Batido de proteína + bayas congeladas', calories: 200, protein: 30, carbs: 15, fat: 3, order: 2 },
            { name: 'dinner', description: 'Pescado blanco + verduras al vapor + aceite oliva (sin arroz en días bajos)', calories: 450, protein: 35, carbs: 25, fat: 20, order: 3 },
            { name: 'snack', description: 'Caseína 30g con agua (antes de dormir)', calories: 120, protein: 25, carbs: 2, fat: 1, order: 4 },
        ],
    },
];

// ══════════════════════════════════════════════════════
// MEDICAL PROFILES (15, uno por cada cliente)
// ══════════════════════════════════════════════════════
const MEDICAL_PROFILES = [
    { height: 165, initialWeight: 62, birthDate: '1995-03-15', gender: 'female', age: 31, bloodType: 'A+', allergies: ['Polen'], injuries: [], conditions: [], medications: [], surgery: '', goals: ['lose_weight', 'endurance'], experience: 'intermediate', emergencyName: 'María García', emergencyPhone: '+34 600 111 222', dietaryRestrictions: { glutenFree: false, lactoseFree: true, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] }, intolerances: [{ substance: 'Lactosa', severity: 'mild', symptoms: 'Hinchazón' }] },
    { height: 178, initialWeight: 85, birthDate: '1990-07-22', gender: 'male', age: 36, bloodType: 'O+', allergies: [], injuries: ['Esguince tobillo derecho'], conditions: ['Asma leve'], medications: ['Salbutamol (ocasional)'], surgery: '', goals: ['gain_muscle', 'strength'], experience: 'advanced', emergencyName: 'Elena Sánchez', emergencyPhone: '+34 600 222 333', dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] }, intolerances: [] },
    { height: 172, initialWeight: 70, birthDate: '1988-11-08', gender: 'male', age: 37, bloodType: 'B-', allergies: ['Mariscos', 'Frutos secos'], injuries: [], conditions: ['Hipertensión controlada'], medications: ['Enalapril 10mg'], surgery: 'Apendicectomía (2015)', goals: ['lose_weight', 'health'], experience: 'beginner', emergencyName: 'Laura Fernández', emergencyPhone: '+34 600 333 444', dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: true, shellfishFree: true, other: [] }, intolerances: [{ substance: 'Frutos secos', severity: 'severe', symptoms: 'Anafilaxia' }, { substance: 'Mariscos', severity: 'severe', symptoms: 'Urticaria' }] },
    { height: 168, initialWeight: 58, birthDate: '1998-05-30', gender: 'female', age: 28, bloodType: 'AB+', allergies: [], injuries: [], conditions: [], medications: [], surgery: '', goals: ['gain_muscle', 'endurance'], experience: 'beginner', emergencyName: 'Diego Torres', emergencyPhone: '+34 600 444 555', dietaryRestrictions: { glutenFree: true, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: ['Bajo en FODMAPs'] }, intolerances: [{ substance: 'Gluten', severity: 'moderate', symptoms: 'Distensión abdominal' }] },
    { height: 183, initialWeight: 95, birthDate: '1985-01-14', gender: 'male', age: 41, bloodType: 'A-', allergies: ['Penicilina'], injuries: ['Hernia discal L4-L5'], conditions: [], medications: [], surgery: 'Cirugía hernia discal (2020)', goals: ['lose_weight', 'health'], experience: 'intermediate', emergencyName: 'Sofía Ruiz', emergencyPhone: '+34 600 555 666', dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] }, intolerances: [] },
    { height: 175, initialWeight: 72, birthDate: '1993-09-20', gender: 'male', age: 33, bloodType: 'O-', allergies: [], injuries: [], conditions: [], medications: [], surgery: '', goals: ['strength', 'gain_muscle'], experience: 'advanced', emergencyName: 'Miguel Díaz', emergencyPhone: '+34 600 666 777', dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] }, intolerances: [] },
    { height: 163, initialWeight: 56, birthDate: '2000-02-28', gender: 'female', age: 26, bloodType: 'B+', allergies: [], injuries: [], conditions: ['Anemia ferropénica'], medications: ['Hierro oral'], surgery: '', goals: ['gain_muscle', 'endurance'], experience: 'beginner', emergencyName: 'Carmen Vega', emergencyPhone: '+34 600 777 888', dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] }, intolerances: [] },
    { height: 180, initialWeight: 88, birthDate: '1987-12-05', gender: 'male', age: 38, bloodType: 'A+', allergies: [], injuries: ['Rotura fibrilar gemelo izq.'], conditions: ['Diabetes tipo 2 controlada'], medications: ['Metformina 850mg'], surgery: '', goals: ['lose_weight', 'health'], experience: 'intermediate', emergencyName: 'Andrés Morales', emergencyPhone: '+34 600 888 999', dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: ['Control de azúcares'] }, intolerances: [] },
    { height: 170, initialWeight: 65, birthDate: '1992-06-18', gender: 'female', age: 34, bloodType: 'AB-', allergies: ['Látex'], injuries: [], conditions: ['Hipotiroidismo'], medications: ['Levotiroxina 50mcg'], surgery: 'Cesárea (2019)', goals: ['lose_weight', 'endurance'], experience: 'beginner', emergencyName: 'Roberto Iglesias', emergencyPhone: '+34 600 999 000', dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] }, intolerances: [] },
    { height: 185, initialWeight: 78, birthDate: '1996-04-23', gender: 'male', age: 30, bloodType: 'O+', allergies: [], injuries: [], conditions: [], medications: [], surgery: '', goals: ['strength', 'gain_muscle'], experience: 'intermediate', emergencyName: 'Lucas Ramírez', emergencyPhone: '+34 600 000 111', dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: true, nutFree: false, shellfishFree: false, other: [] }, intolerances: [] },
    { height: 167, initialWeight: 75, birthDate: '1983-10-12', gender: 'female', age: 42, bloodType: 'A+', allergies: [], injuries: ['Tendinitis hombro derecho'], conditions: ['Artrosis leve rodillas'], medications: ['Condroitina + Glucosamina'], surgery: '', goals: ['health', 'endurance'], experience: 'beginner', emergencyName: 'Isabella Vargas', emergencyPhone: '+34 600 111 222', dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] }, intolerances: [] },
    { height: 176, initialWeight: 68, birthDate: '1999-08-30', gender: 'male', age: 27, bloodType: 'B+', allergies: [], injuries: [], conditions: [], medications: [], surgery: '', goals: ['gain_muscle', 'strength'], experience: 'intermediate', emergencyName: 'Mateo Castillo', emergencyPhone: '+34 600 222 333', dietaryRestrictions: { glutenFree: false, lactoseFree: true, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] }, intolerances: [{ substance: 'Lactosa', severity: 'moderate', symptoms: 'Digestión pesada' }] },
    { height: 173, initialWeight: 81, birthDate: '1986-01-05', gender: 'male', age: 40, bloodType: 'O-', allergies: [], injuries: ['Fractura clavícula (2019)'], conditions: [], medications: [], surgery: 'Placa clavícula (2019)', goals: ['gain_muscle', 'health'], experience: 'intermediate', emergencyName: 'Elena Muñoz', emergencyPhone: '+34 600 333 444', dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] }, intolerances: [] },
    { height: 161, initialWeight: 54, birthDate: '1997-11-20', gender: 'female', age: 29, bloodType: 'A-', allergies: ['Níquel'], injuries: [], conditions: ['Síndrome de ovario poliquístico'], medications: ['Anticonceptivos orales'], surgery: '', goals: ['lose_weight', 'endurance'], experience: 'beginner', emergencyName: 'Juan Carlos Ortiz', emergencyPhone: '+34 600 444 555', dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: ['Bajo índice glucémico'] }, intolerances: [] },
    { height: 189, initialWeight: 92, birthDate: '1991-03-08', gender: 'male', age: 35, bloodType: 'AB+', allergies: [], injuries: [], conditions: [], medications: [], surgery: '', goals: ['strength', 'gain_muscle'], experience: 'advanced', emergencyName: 'Ana García', emergencyPhone: '+34 600 555 666', dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] }, intolerances: [] },
];

// ══════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════
async function main() {
    console.log('🌱 CampFit Seed Data Generator v2\n');

    let admin;
    try {
        admin = await import('firebase-admin');
    } catch {
        console.log('❌ firebase-admin no está instalado. Ejecuta: npm install firebase-admin');
        process.exit(1);
    }

    try {
        if (!admin.apps.length) {
            if (USE_EMULATOR) {
                process.env.FIRESTORE_EMULATOR_HOST = EMULATOR_HOST;
                admin.initializeApp({ projectId: FIREBASE_PROJECT_ID });
                console.log('🔧 Firestore Emulator:', EMULATOR_HOST);
            } else {
                admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                    projectId: FIREBASE_PROJECT_ID,
                });
            }
        }
        const db = admin.firestore();
        console.log('🔥 Conectado a Firestore\n');

        // ── Clean existing data ──
        if (SEED_CONFIG.forceClean) {
            console.log('🧹 Limpiando datos...');
            const collections = ['users', 'workouts', 'diets', 'messages', 'progress_logs'];
            for (const col of collections) {
                const snapshot = await db.collection(col).limit(500).get();
                if (snapshot.size > 0) {
                    const batch = db.batch();
                    snapshot.docs.forEach(d => batch.delete(d.ref));
                    await batch.commit();
                }
                console.log(`   ✅ ${col}: ${snapshot.size} docs eliminados`);
            }
            console.log('');
        }

        // ── 1. Admin ──
        console.log('👤 Creando admin...');
        const adminUser = await admin.auth().createUser({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, displayName: 'Admin CampFit' });
        await db.collection('users').doc(adminUser.uid).set({
            uid: adminUser.uid, name: 'Admin CampFit', email: ADMIN_EMAIL, role: 'admin',
            hasActiveAlert: false, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`   ✅ ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}\n`);

        // ── 2. Trainers + Clients ──
        console.log(`👥 ${SEED_CONFIG.trainers} trainers × ${SEED_CONFIG.clientsPerTrainer} clients = ${SEED_CONFIG.trainers * SEED_CONFIG.clientsPerTrainer} clients\n`);
        const trainerIds = [], clientIds = [];
        let clientIdx = 0;

        for (let t = 0; t < SEED_CONFIG.trainers; t++) {
            const trainerUser = await admin.auth().createUser({ email: TRAINER_EMAILS[t], password: 'Trainer123!', displayName: TRAINER_NAMES[t] });
            await db.collection('users').doc(trainerUser.uid).set({
                uid: trainerUser.uid, name: TRAINER_NAMES[t], email: TRAINER_EMAILS[t], role: 'trainer',
                hasActiveAlert: false, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            trainerIds.push(trainerUser.uid);
            console.log(`🏋️ ${TRAINER_NAMES[t]}`);

            for (let c = 0; c < SEED_CONFIG.clientsPerTrainer; c++) {
                const name = CLIENT_NAMES[clientIdx], email = CLIENT_EMAILS[clientIdx], medical = MEDICAL_PROFILES[clientIdx % MEDICAL_PROFILES.length];
                const clientUser = await admin.auth().createUser({ email, password: 'Client123!', displayName: name });
                await db.collection('users').doc(clientUser.uid).set({
                    uid: clientUser.uid, name, email, role: 'client', assignedTrainerId: trainerUser.uid,
                    hasActiveAlert: false, medicalProfile: { ...medical, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
                    createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                clientIds.push(clientUser.uid);
                console.log(`   👤 ${name} (${medical.gender}, ${medical.age}a, ${medical.goals.join(', ')})`);

                // ── Workouts ──
                const assignedW = new Set();
                let woCount = 0;
                while (assignedW.size < SEED_CONFIG.workoutsPerClient && woCount < 50) {
                    const tmpl = WORKOUT_TEMPLATES[(clientIdx * SEED_CONFIG.workoutsPerClient + woCount) % WORKOUT_TEMPLATES.length];
                    if (!assignedW.has(tmpl.name)) {
                        assignedW.add(tmpl.name);
                        const exercises = tmpl.exercises.map((ex, i) => ({
                            id: `ex-${clientUser.uid}-${woCount}-${i}`,
                            name: ex.name, sets: ex.sets, reps: ex.reps, restTime: ex.restTime,
                            videoUrl: ex.videoUrl || '', description: ex.description, order: ex.order || i, dayOfWeek: ex.dayOfWeek || 1,
                        }));
                        await db.collection('workouts').add({
                            name: tmpl.name, description: tmpl.description, difficulty: tmpl.difficulty,
                            trainerId: trainerUser.uid, clientId: clientUser.uid, exercises,
                            createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                    }
                    woCount++;
                }
                console.log(`      📋 ${SEED_CONFIG.workoutsPerClient} rutinas (${Array.from(assignedW).join(', ')})`);

                // ── Diets ──
                const assignedD = new Set();
                let dietCount = 0;
                while (assignedD.size < SEED_CONFIG.dietsPerClient && dietCount < 50) {
                    const tmpl = DIET_TEMPLATES[(clientIdx * SEED_CONFIG.dietsPerClient + dietCount) % DIET_TEMPLATES.length];
                    if (!assignedD.has(tmpl.name)) {
                        assignedD.add(tmpl.name);
                        const meals = tmpl.meals.map((m, i) => ({
                            id: `meal-${clientUser.uid}-${dietCount}-${i}`,
                            name: m.name, description: m.description, calories: m.calories,
                            protein: m.protein, carbs: m.carbs, fat: m.fat, order: m.order || i,
                        }));
                        const dietType = (tmpl.type === 'vegan' || tmpl.type === 'vegetarian' || tmpl.type === 'keto' || tmpl.type === 'paleo' || tmpl.type === 'intermittent') ? 'advanced' : tmpl.type;
                        await db.collection('diets').add({
                            name: tmpl.name, description: tmpl.description, type: dietType,
                            somatotype: tmpl.somatotype, totalCalories: tmpl.totalCalories, meals,
                            trainerId: trainerUser.uid, clientId: clientUser.uid,
                            createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                    }
                    dietCount++;
                }
                console.log(`      🍽️ ${SEED_CONFIG.dietsPerClient} dietas (${Array.from(assignedD).join(', ')})`);

                // ── Progress Logs ──
                const types = ['weight', 'measurement', 'photo', 'weight', 'measurement', 'photo', 'weight', 'measurement'];
                for (let p = 0; p < SEED_CONFIG.progressLogsPerClient; p++) {
                    const type = types[p % types.length];
                    const daysAgo = (SEED_CONFIG.progressLogsPerClient - p) * 7;
                    const date = new Date();
                    date.setDate(date.getDate() - daysAgo);

                    const logData = {
                        clientId: clientUser.uid, type, date: admin.firestore.Timestamp.fromDate(date),
                        createdAt: admin.firestore.Timestamp.fromDate(date),
                    };

                    if (type === 'weight') {
                        logData.weight = Math.round((medical.initialWeight - (p * 0.6 + Math.random() * 0.4)) * 10) / 10;
                        if (p > 3) logData.notes = 'Peso bajando consistentemente. Buena adherencia.';
                    } else if (type === 'measurement') {
                        logData.measurements = {
                            chest: Math.round((95 + (Math.random() * 4 - 2)) * 10) / 10,
                            waist: Math.round((82 - p * 0.8) * 10) / 10,
                            biceps: Math.round((33 + p * 0.5 + Math.random()) * 10) / 10,
                        };
                        logData.notes = 'Mediciones mensuales de control.';
                    } else {
                        logData.notes = 'Foto de progreso frontal y lateral.';
                    }
                    await db.collection('progress_logs').add(logData);
                }
                console.log(`      📊 ${SEED_CONFIG.progressLogsPerClient} logs de progreso`);

                clientIdx++;
            }
        }

        // ── Summary ──
        console.log('\n═══════════════════════════════');
        console.log('✅ Seed data generado exitosamente');
        console.log('');
        console.log('📊 Resumen:');
        console.log(`   👑 Admins: ${SEED_CONFIG.admins}`);
        console.log(`   🏋️ Trainers: ${trainerIds.length}`);
        console.log(`   👤 Clients: ${clientIds.length}`);
        console.log(`   📋 Workouts: ${SEED_CONFIG.trainers * SEED_CONFIG.clientsPerTrainer * SEED_CONFIG.workoutsPerClient} (${WORKOUT_TEMPLATES.length} templates)`);
        console.log(`   🍽️ Diets: ${SEED_CONFIG.trainers * SEED_CONFIG.clientsPerTrainer * SEED_CONFIG.dietsPerClient} (${DIET_TEMPLATES.length} templates)`);
        console.log(`   📊 Progress Logs: ${SEED_CONFIG.trainers * SEED_CONFIG.clientsPerTrainer * SEED_CONFIG.progressLogsPerClient}`);
        console.log('');
        console.log('🔑 Credenciales:');
        console.log(`   Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
        for (let i = 0; i < trainerIds.length; i++) console.log(`   Trainer ${i + 1}: ${TRAINER_EMAILS[i]} / Trainer123!`);
        for (let i = 0; i < 3; i++) console.log(`   Client ${i + 1}: ${CLIENT_EMAILS[i]} / Client123!`);
        console.log(`   ... (${clientIds.length - 3} clientes más con Client123!)`);
        // Save credentials to a file for easy reference
        const fs = require('fs');
        fs.writeFileSync('.seed-credentials.txt',
            `Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}\n` +
            trainerIds.map((id, i) => `Trainer: ${TRAINER_EMAILS[i]} / Trainer123!`).join('\n') + '\n' +
            clientIds.slice(0, 5).map((id, i) => `Client: ${CLIENT_EMAILS[i]} / Client123!`).join('\n') + '\n'
        );
        console.log('\n📄 Credenciales guardadas en .seed-credentials.txt\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('Could not load the default credentials')) {
            console.log('\n💡 Solución:\n   Opción 1: set GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json\n   Opción 2: Usa emulador: set FIREBASE_EMULATOR=true');
        }
        process.exit(1);
    }
}

main();
