/**
 * CampFit Seed Data — Workouts & Diets Only
 * ============================================
 * Genera rutinas y dietas de ejemplo en Firestore.
 * Asume que ya existen usuarios (admins, trainers, clients).
 *
 * Uso:
 *   1. set FIREBASE_EMULATOR=true
 *   2. node scripts/seed-firestore.mjs
 */

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'campfit-dev';
const USE_EMULATOR = process.env.FIREBASE_EMULATOR === 'true';
const EMULATOR_HOST = process.env.FIREBASE_EMULATOR_HOST || 'localhost:8080';

// IDs de usuarios existentes (ajustar según tu base de datos)
const TRAINER_IDS = process.env.SEED_TRAINER_IDS
    ? process.env.SEED_TRAINER_IDS.split(',')
    : ['trainer-id-1', 'trainer-id-2', 'trainer-id-3'];

const CLIENT_IDS = process.env.SEED_CLIENT_IDS
    ? process.env.SEED_CLIENT_IDS.split(',')
    : ['client-id-1', 'client-id-2', 'client-id-3', 'client-id-4', 'client-id-5',
        'client-id-6', 'client-id-7', 'client-id-8', 'client-id-9', 'client-id-10',
        'client-id-11', 'client-id-12', 'client-id-13', 'client-id-14', 'client-id-15'];

const SEED_CONFIG = {
    workoutsPerTrainer: 10,
    dietsPerTrainer: 10,
    forceClean: false,
};

// ═══════════════════════════════════════════════
// WORKOUT TEMPLATES
// ═══════════════════════════════════════════════
const WORKOUT_TEMPLATES = [
    // ─── EASY ───
    {
        name: 'Full Body Principiante A', difficulty: 'easy',
        description: 'Rutina de cuerpo completo ideal para quienes empiezan.',
        exercises: [
            { name: 'Sentadilla con peso corporal', sets: 3, reps: 15, restTime: '45s', videoUrl: '', description: 'Bajar hasta que los muslos estén paralelos al suelo', order: 0, dayOfWeek: 1 },
            { name: 'Press de pecho con mancuernas', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Banco plano, controlar la bajada', order: 1, dayOfWeek: 1 },
            { name: 'Remo con mancuerna a una mano', sets: 3, reps: 12, restTime: '45s', videoUrl: '', description: 'Apoyar rodilla en banco, espalda recta', order: 2, dayOfWeek: 1 },
            { name: 'Plancha abdominal', sets: 3, reps: 1, restTime: '30s', videoUrl: '', description: 'Mantener 30 segundos', order: 3, dayOfWeek: 1 },
            { name: 'Puente de glúteos', sets: 3, reps: 15, restTime: '30s', videoUrl: '', description: 'Elevar cadera apretando glúteos', order: 4, dayOfWeek: 1 },
        ],
    },
    {
        name: 'Full Body Principiante B', difficulty: 'easy',
        description: 'Segunda rutina de iniciación. Introduce variantes.',
        exercises: [
            { name: 'Zancadas alternas', sets: 3, reps: 10, restTime: '45s', videoUrl: '', description: 'Por pierna', order: 0, dayOfWeek: 3 },
            { name: 'Press de hombro con mancuernas', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Sentado, sin arquear espalda', order: 1, dayOfWeek: 3 },
            { name: 'Jalón al pecho en polea', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Agarrre ancho', order: 2, dayOfWeek: 3 },
            { name: 'Curl de bíceps con mancuernas', sets: 3, reps: 12, restTime: '45s', videoUrl: '', description: 'Codos pegados al cuerpo', order: 3, dayOfWeek: 3 },
            { name: 'Extensiones de tríceps en polea', sets: 3, reps: 12, restTime: '45s', videoUrl: '', description: 'Solo mover antebrazo', order: 4, dayOfWeek: 3 },
        ],
    },
    {
        name: 'Cardio Principiante', difficulty: 'easy',
        description: 'Circuito cardiovascular de baja intensidad.',
        exercises: [
            { name: 'Caminata rápida en cinta', sets: 1, reps: 1, restTime: '0s', videoUrl: '', description: '20 min a 5-6 km/h', order: 0, dayOfWeek: 2 },
            { name: 'Bicicleta estática', sets: 1, reps: 1, restTime: '0s', videoUrl: '', description: '15 min, resistencia baja-media', order: 1, dayOfWeek: 2 },
            { name: 'Elíptica', sets: 1, reps: 1, restTime: '0s', videoUrl: '', description: '10 min, sin resistencia', order: 2, dayOfWeek: 2 },
        ],
    },
    {
        name: 'Core & Estabilidad', difficulty: 'easy',
        description: 'Fortalece la zona media y mejora la postura.',
        exercises: [
            { name: 'Plancha frontal', sets: 3, reps: 1, restTime: '30s', videoUrl: '', description: '30 segundos', order: 0, dayOfWeek: 5 },
            { name: 'Plancha lateral', sets: 2, reps: 1, restTime: '30s', videoUrl: '', description: '20 segundos por lado', order: 1, dayOfWeek: 5 },
            { name: 'Crunches', sets: 3, reps: 20, restTime: '30s', videoUrl: '', description: 'Elevar solo hombros', order: 2, dayOfWeek: 5 },
            { name: 'Superman', sets: 3, reps: 12, restTime: '30s', videoUrl: '', description: 'Boca abajo, elevar brazos y piernas', order: 3, dayOfWeek: 5 },
            { name: 'Bird Dog', sets: 3, reps: 10, restTime: '30s', videoUrl: '', description: 'Alternar brazo/pierna contraria', order: 4, dayOfWeek: 5 },
        ],
    },
    // ─── MEDIUM ───
    {
        name: 'Push Day (Empuje)', difficulty: 'medium',
        description: 'Pecho, hombros y tríceps. Hipertrofia progresiva.',
        exercises: [
            { name: 'Press de banca con barra', sets: 4, reps: 10, restTime: '90s', videoUrl: '', description: 'Agarre medio, tocar pecho', order: 0, dayOfWeek: 1 },
            { name: 'Press inclinado con mancuernas', sets: 4, reps: 10, restTime: '90s', videoUrl: '', description: 'Banco a 30°', order: 1, dayOfWeek: 1 },
            { name: 'Aperturas con mancuernas', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Ligera flexión de codos', order: 2, dayOfWeek: 1 },
            { name: 'Press militar', sets: 3, reps: 10, restTime: '90s', videoUrl: '', description: 'Sin impulso de piernas', order: 3, dayOfWeek: 1 },
            { name: 'Elevaciones laterales', sets: 4, reps: 15, restTime: '45s', videoUrl: '', description: 'Hasta altura de hombros', order: 4, dayOfWeek: 1 },
            { name: 'Fondos en paralelas', sets: 3, reps: 8, restTime: '90s', videoUrl: '', description: 'Bajar hasta 90°', order: 5, dayOfWeek: 1 },
        ],
    },
    {
        name: 'Pull Day (Tracción)', difficulty: 'medium',
        description: 'Espalda y bíceps. Enfoque en grosor y anchura.',
        exercises: [
            { name: 'Peso muerto convencional', sets: 3, reps: 8, restTime: '120s', videoUrl: '', description: 'Espalda neutra', order: 0, dayOfWeek: 3 },
            { name: 'Dominadas (o jalón)', sets: 4, reps: 8, restTime: '90s', videoUrl: '', description: 'Agarrre prono ancho', order: 1, dayOfWeek: 3 },
            { name: 'Remo con barra', sets: 4, reps: 10, restTime: '90s', videoUrl: '', description: 'Torso a 45°', order: 2, dayOfWeek: 3 },
            { name: 'Remo en polea baja', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Apretar escápulas', order: 3, dayOfWeek: 3 },
            { name: 'Curl de bíceps con barra Z', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Sin balanceo', order: 4, dayOfWeek: 3 },
            { name: 'Curl martillo', sets: 3, reps: 12, restTime: '45s', videoUrl: '', description: 'Palmas enfrentadas', order: 5, dayOfWeek: 3 },
        ],
    },
    {
        name: 'Leg Day Completo', difficulty: 'medium',
        description: 'Cuádriceps, isquios y gemelos.',
        exercises: [
            { name: 'Sentadilla con barra', sets: 4, reps: 10, restTime: '120s', videoUrl: '', description: 'Barra alta, profundidad completa', order: 0, dayOfWeek: 5 },
            { name: 'Prensa inclinada', sets: 4, reps: 12, restTime: '90s', videoUrl: '', description: 'Pies anchos', order: 1, dayOfWeek: 5 },
            { name: 'Peso muerto rumano', sets: 3, reps: 10, restTime: '90s', videoUrl: '', description: 'Flexión de cadera', order: 2, dayOfWeek: 5 },
            { name: 'Zancadas caminando', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Con mancuernas', order: 3, dayOfWeek: 5 },
            { name: 'Curl femoral en máquina', sets: 3, reps: 15, restTime: '45s', videoUrl: '', description: 'Controlar excéntrica', order: 4, dayOfWeek: 5 },
            { name: 'Elevación de talones', sets: 4, reps: 20, restTime: '45s', videoUrl: '', description: 'Rango completo', order: 5, dayOfWeek: 5 },
        ],
    },
    {
        name: 'Hipertrofia Upper Body', difficulty: 'medium',
        description: 'Volumen alto para tren superior.',
        exercises: [
            { name: 'Press inclinado con barra', sets: 4, reps: 10, restTime: '90s', videoUrl: '', description: '30° de inclinación', order: 0, dayOfWeek: 2 },
            { name: 'Remo Pendlay', sets: 4, reps: 8, restTime: '90s', videoUrl: '', description: 'Desde el suelo', order: 1, dayOfWeek: 2 },
            { name: 'Press Arnold', sets: 4, reps: 10, restTime: '90s', videoUrl: '', description: 'Rotación completa', order: 2, dayOfWeek: 2 },
            { name: 'Pull-over con mancuerna', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Estirar dorsal', order: 3, dayOfWeek: 2 },
            { name: 'Face Pull', sets: 4, reps: 15, restTime: '45s', videoUrl: '', description: 'Rotación externa', order: 4, dayOfWeek: 2 },
        ],
    },
    // ─── HARD ───
    {
        name: 'Powerlifting Push', difficulty: 'hard',
        description: 'Fuerza máxima en press de banca.',
        exercises: [
            { name: 'Press de banca (fuerza)', sets: 5, reps: 5, restTime: '150s', videoUrl: '', description: '80-85% 1RM', order: 0, dayOfWeek: 1 },
            { name: 'Press de banca con pausa', sets: 3, reps: 3, restTime: '120s', videoUrl: '', description: 'Pausa 2s en pecho', order: 1, dayOfWeek: 1 },
            { name: 'Press inclinado pesado', sets: 4, reps: 6, restTime: '120s', videoUrl: '', description: '75% 1RM', order: 2, dayOfWeek: 1 },
            { name: 'Fondos lastrados', sets: 4, reps: 6, restTime: '90s', videoUrl: '', description: 'Lastre progresivo', order: 3, dayOfWeek: 1 },
            { name: 'Press cerrado', sets: 3, reps: 8, restTime: '90s', videoUrl: '', description: 'Manos a anchura de hombros', order: 4, dayOfWeek: 1 },
        ],
    },
    {
        name: 'Powerlifting Pull', difficulty: 'hard',
        description: 'Peso muerto pesado y accesorios.',
        exercises: [
            { name: 'Peso muerto (fuerza)', sets: 5, reps: 3, restTime: '180s', videoUrl: '', description: '85-90% 1RM', order: 0, dayOfWeek: 3 },
            { name: 'Peso muerto con déficit', sets: 3, reps: 5, restTime: '150s', videoUrl: '', description: 'Sobre discos de 5cm', order: 1, dayOfWeek: 3 },
            { name: 'Dominadas lastradas', sets: 4, reps: 5, restTime: '120s', videoUrl: '', description: '+5-10kg', order: 2, dayOfWeek: 3 },
            { name: 'Remo con barra T', sets: 4, reps: 8, restTime: '90s', videoUrl: '', description: 'Carga pesada', order: 3, dayOfWeek: 3 },
            { name: 'Encogimientos con barra', sets: 4, reps: 10, restTime: '60s', videoUrl: '', description: 'Trapecio', order: 4, dayOfWeek: 3 },
        ],
    },
    {
        name: 'Squat Day (Fuerza)', difficulty: 'hard',
        description: 'Sentadilla pesada + accesorios.',
        exercises: [
            { name: 'Sentadilla (fuerza)', sets: 5, reps: 5, restTime: '180s', videoUrl: '', description: '80-85% 1RM', order: 0, dayOfWeek: 5 },
            { name: 'Sentadilla frontal', sets: 3, reps: 8, restTime: '120s', videoUrl: '', description: 'Barra en clavículas', order: 1, dayOfWeek: 5 },
            { name: 'Peso muerto sumo', sets: 3, reps: 6, restTime: '150s', videoUrl: '', description: 'Postura ancha', order: 2, dayOfWeek: 5 },
            { name: 'Hip Thrust con barra', sets: 4, reps: 10, restTime: '90s', videoUrl: '', description: 'Carga en cadera', order: 3, dayOfWeek: 5 },
            { name: 'Sentadilla búlgara', sets: 3, reps: 8, restTime: '90s', videoUrl: '', description: 'Pie trasero elevado', order: 4, dayOfWeek: 5 },
        ],
    },
    {
        name: 'Full Body Avanzado', difficulty: 'hard',
        description: 'Cuerpo completo para atletas experimentados.',
        exercises: [
            { name: 'Clean & Press', sets: 4, reps: 5, restTime: '120s', videoUrl: '', description: 'Movimiento olímpico', order: 0, dayOfWeek: 4 },
            { name: 'Snatch grip deadlift', sets: 4, reps: 6, restTime: '120s', videoUrl: '', description: 'Agarrre ancho', order: 1, dayOfWeek: 4 },
            { name: 'Pull-ups explosivas', sets: 4, reps: 5, restTime: '90s', videoUrl: '', description: 'Soltar barra arriba', order: 2, dayOfWeek: 4 },
            { name: 'Dips lastrados', sets: 4, reps: 8, restTime: '90s', videoUrl: '', description: 'Carga progresiva', order: 3, dayOfWeek: 4 },
            { name: 'Kettlebell swings', sets: 4, reps: 20, restTime: '60s', videoUrl: '', description: '24-32kg', order: 4, dayOfWeek: 4 },
            { name: 'Farmer walks', sets: 3, reps: 1, restTime: '60s', videoUrl: '', description: '40m con mancuernas pesadas', order: 5, dayOfWeek: 4 },
        ],
    },
    // ─── SPECIALIZED ───
    {
        name: 'Movilidad & Flexibilidad', difficulty: 'easy',
        description: 'Recuperación activa y movilidad articular.',
        exercises: [
            { name: 'Cat-Cow', sets: 2, reps: 10, restTime: '0s', videoUrl: '', description: 'Articulación vertebral', order: 0, dayOfWeek: 6 },
            { name: 'World greatest stretch', sets: 2, reps: 5, restTime: '0s', videoUrl: '', description: '5s por posición', order: 1, dayOfWeek: 6 },
            { name: 'Círculos de cadera', sets: 2, reps: 10, restTime: '0s', videoUrl: '', description: 'Por sentido', order: 2, dayOfWeek: 6 },
            { name: 'Estiramiento de isquios', sets: 2, reps: 1, restTime: '0s', videoUrl: '', description: '30s por pierna', order: 3, dayOfWeek: 6 },
            { name: 'Apertura de pecho en pared', sets: 2, reps: 1, restTime: '0s', videoUrl: '', description: 'Rotación torácica', order: 4, dayOfWeek: 6 },
        ],
    },
    {
        name: 'HIIT 30 Minutos', difficulty: 'medium',
        description: '30s on / 15s off. Alta intensidad.',
        exercises: [
            { name: 'Burpees', sets: 3, reps: 15, restTime: '15s', videoUrl: '', description: 'Con salto y palmada', order: 0, dayOfWeek: 4 },
            { name: 'Mountain climbers', sets: 3, reps: 25, restTime: '15s', videoUrl: '', description: 'Ritmo rápido', order: 1, dayOfWeek: 4 },
            { name: 'Jump squats', sets: 3, reps: 15, restTime: '15s', videoUrl: '', description: 'Explosivo arriba', order: 2, dayOfWeek: 4 },
            { name: 'Battle ropes', sets: 3, reps: 1, restTime: '15s', videoUrl: '', description: '30 segundos', order: 3, dayOfWeek: 4 },
            { name: 'Box jumps', sets: 3, reps: 10, restTime: '15s', videoUrl: '', description: 'Caja 50-60cm', order: 4, dayOfWeek: 4 },
        ],
    },
    {
        name: 'Glúteo Focus', difficulty: 'medium',
        description: 'Rutina específica para desarrollo de glúteos.',
        exercises: [
            { name: 'Hip thrust', sets: 4, reps: 12, restTime: '90s', videoUrl: '', description: 'Pausa 2s en contracción', order: 0, dayOfWeek: 2 },
            { name: 'Sentadilla sumo', sets: 3, reps: 12, restTime: '90s', videoUrl: '', description: 'Puntas hacia fuera', order: 1, dayOfWeek: 2 },
            { name: 'Puente de glúteos a una pierna', sets: 3, reps: 15, restTime: '60s', videoUrl: '', description: 'Cadera elevada', order: 2, dayOfWeek: 2 },
            { name: 'Patada de glúteo en polea', sets: 3, reps: 15, restTime: '45s', videoUrl: '', description: 'Solo cadera', order: 3, dayOfWeek: 2 },
            { name: 'Abducción en máquina', sets: 4, reps: 20, restTime: '45s', videoUrl: '', description: 'Pausa en apertura', order: 4, dayOfWeek: 2 },
        ],
    },
    {
        name: 'CrossFit WOD - Cindy', difficulty: 'hard',
        description: 'AMRAP 20 min: 5 dominadas + 10 flexiones + 15 sentadillas.',
        exercises: [
            { name: 'Dominadas', sets: 1, reps: 5, restTime: '0s', videoUrl: '', description: 'Kipping permitido', order: 0, dayOfWeek: 3 },
            { name: 'Flexiones', sets: 1, reps: 10, restTime: '0s', videoUrl: '', description: 'Pecho al suelo', order: 1, dayOfWeek: 3 },
            { name: 'Air Squats', sets: 1, reps: 15, restTime: '0s', videoUrl: '', description: 'Bajo paralelo', order: 2, dayOfWeek: 3 },
        ],
    },
];

// ═══════════════════════════════════════════════
// DIET TEMPLATES
// ═══════════════════════════════════════════════
const DIET_TEMPLATES = [
    {
        name: 'Volumen Limpio 3200kcal', type: 'normal', somatotype: 'ectomorph', totalCalories: 3200,
        description: 'Hipercalórico para ganancia de masa muscular con alimentos limpios.',
        meals: [
            { name: 'breakfast', description: 'Avena 80g + leche 300ml + plátano + 30g whey + 3 huevos', calories: 650, protein: 45, carbs: 70, fat: 20, order: 0 },
            { name: 'snack', description: 'Yogur griego 200g + 30g frutos secos + miel', calories: 350, protein: 20, carbs: 35, fat: 15, order: 1 },
            { name: 'lunch', description: 'Pollo 200g + arroz integral 150g + brócoli + aceite oliva', calories: 700, protein: 55, carbs: 80, fat: 15, order: 2 },
            { name: 'pre-workout', description: 'Arroz inflado 40g + 25g whey + plátano', calories: 450, protein: 35, carbs: 55, fat: 5, order: 3 },
            { name: 'dinner', description: 'Salmón 200g + boniato 200g + espárragos', calories: 650, protein: 40, carbs: 55, fat: 25, order: 4 },
            { name: 'snack', description: 'Requesón 200g + almendras 20g', calories: 300, protein: 25, carbs: 10, fat: 18, order: 5 },
        ],
    },
    {
        name: 'Definición 2100kcal', type: 'normal', somatotype: 'endomorph', totalCalories: 2100,
        description: 'Déficit moderado para pérdida de grasa. Alto en proteína.',
        meals: [
            { name: 'breakfast', description: '6 claras + 1 huevo + espinacas + tostada integral', calories: 350, protein: 35, carbs: 25, fat: 10, order: 0 },
            { name: 'snack', description: 'Manzana verde + 15g almendras', calories: 200, protein: 5, carbs: 30, fat: 12, order: 1 },
            { name: 'lunch', description: 'Pavo 150g + ensalada + quinoa 80g + vinagreta limón', calories: 450, protein: 40, carbs: 40, fat: 12, order: 2 },
            { name: 'snack', description: 'Batido whey 30g con agua', calories: 150, protein: 30, carbs: 3, fat: 2, order: 3 },
            { name: 'dinner', description: 'Merluza 180g al vapor + brócoli + coliflor', calories: 400, protein: 35, carbs: 20, fat: 12, order: 4 },
        ],
    },
    {
        name: 'Cetogénica 2400kcal', type: 'keto', somatotype: 'endomorph', totalCalories: 2400,
        description: '<20g carbs netos. Grasas saludables como energía principal.',
        meals: [
            { name: 'breakfast', description: '3 huevos fritos en mantequilla + aguacate + bacon 50g', calories: 550, protein: 30, carbs: 5, fat: 48, order: 0 },
            { name: 'lunch', description: 'Ensalada César con pollo 180g + aceite oliva + parmesano', calories: 600, protein: 40, carbs: 8, fat: 48, order: 1 },
            { name: 'snack', description: 'Queso curado 50g + nueces macadamia 30g', calories: 350, protein: 15, carbs: 4, fat: 32, order: 2 },
            { name: 'dinner', description: 'Chuletón de cerdo 200g + espárragos en mantequilla', calories: 650, protein: 45, carbs: 6, fat: 52, order: 3 },
        ],
    },
    {
        name: 'Vegana Fitness 2800kcal', type: 'vegan', somatotype: 'mesomorph', totalCalories: 2800,
        description: 'Basado en plantas, alta proteína vegetal.',
        meals: [
            { name: 'breakfast', description: 'Smoothie: proteína guisante 30g + espinacas + plátano + leche almendras + chía', calories: 500, protein: 35, carbs: 60, fat: 15, order: 0 },
            { name: 'snack', description: 'Hummus 100g + zanahoria y apio + pan pita integral', calories: 280, protein: 12, carbs: 30, fat: 12, order: 1 },
            { name: 'lunch', description: 'Buddha bowl: quinoa + garbanzos + tofu 150g + aguacate + kale', calories: 700, protein: 35, carbs: 75, fat: 28, order: 2 },
            { name: 'pre-workout', description: 'Batido proteína vegana 30g + frutos rojos + plátano', calories: 320, protein: 28, carbs: 40, fat: 6, order: 3 },
            { name: 'dinner', description: 'Lentejas 200g + boniato asado + espinacas', calories: 600, protein: 30, carbs: 80, fat: 12, order: 4 },
            { name: 'snack', description: 'Nueces 30g + dátiles 30g', calories: 250, protein: 5, carbs: 35, fat: 14, order: 5 },
        ],
    },
    {
        name: 'Ayuno Intermitente 2500kcal (16:8)', type: 'intermittent', somatotype: 'mesomorph', totalCalories: 2500,
        description: 'Protocolo 16:8. Primera comida 12:00, última 20:00.',
        meals: [
            { name: 'lunch', description: 'Arroz integral 180g + pollo teriyaki 200g + verduras wok + huevo', calories: 950, protein: 55, carbs: 95, fat: 28, order: 0 },
            { name: 'snack', description: 'Batido proteína 40g + mantequilla almendra 20g + plátano', calories: 450, protein: 38, carbs: 45, fat: 18, order: 1 },
            { name: 'dinner', description: 'Salmón salvaje 200g + puré coliflor + ensalada rúcula', calories: 800, protein: 45, carbs: 35, fat: 45, order: 2 },
        ],
    },
    {
        name: 'Paleo 2600kcal', type: 'paleo', somatotype: 'ectomorph', totalCalories: 2600,
        description: 'Sin cereales, lácteos ni legumbres.',
        meals: [
            { name: 'breakfast', description: '3 huevos revueltos + boniato 200g + aguacate medio', calories: 550, protein: 25, carbs: 50, fat: 28, order: 0 },
            { name: 'lunch', description: 'Salmón 200g + batata al horno + ensalada verde + frutos secos', calories: 700, protein: 40, carbs: 55, fat: 30, order: 1 },
            { name: 'snack', description: 'Carne seca 50g + frutos del bosque + nueces', calories: 350, protein: 25, carbs: 20, fat: 18, order: 2 },
            { name: 'dinner', description: 'Pollo asado 200g + calabacín, pimiento y berenjena al horno', calories: 600, protein: 45, carbs: 30, fat: 25, order: 3 },
        ],
    },
    {
        name: 'Mediterránea 2400kcal', type: 'normal', somatotype: 'mesomorph', totalCalories: 2400,
        description: 'Alta en aceite de oliva, pescado y verduras.',
        meals: [
            { name: 'breakfast', description: 'Tostada integral + tomate rallado + aceite oliva + 2 huevos duros', calories: 400, protein: 20, carbs: 35, fat: 20, order: 0 },
            { name: 'lunch', description: 'Ensalada de lentejas + pimiento asado + atún + cebolla + aceite oliva', calories: 550, protein: 35, carbs: 55, fat: 18, order: 1 },
            { name: 'snack', description: 'Almendras + yogur natural', calories: 250, protein: 12, carbs: 15, fat: 15, order: 2 },
            { name: 'dinner', description: 'Pescado blanco al horno + verduras asadas + patata pequeña', calories: 550, protein: 35, carbs: 45, fat: 20, order: 3 },
        ],
    },
    {
        name: 'Alto Proteico 3000kcal', type: 'advanced', somatotype: 'ectomorph', totalCalories: 3000,
        description: '>2.2g proteína/kg. Enfoque hipertrofia máxima.',
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
        description: 'Ovo-lacto-vegetariana equilibrada para rendimiento.',
        meals: [
            { name: 'breakfast', description: 'Porridge de avena + proteína whey + frutos rojos + semillas', calories: 500, protein: 30, carbs: 65, fat: 12, order: 0 },
            { name: 'snack', description: 'Yogur griego 250g + granola casera + miel', calories: 350, protein: 18, carbs: 40, fat: 10, order: 1 },
            { name: 'lunch', description: 'Wrap integral: falafel + hummus + verduras asadas + queso feta', calories: 650, protein: 28, carbs: 70, fat: 25, order: 2 },
            { name: 'snack', description: 'Batido: leche + whey + plátano + crema cacahuete', calories: 400, protein: 32, carbs: 40, fat: 14, order: 3 },
            { name: 'dinner', description: 'Tortilla 3 huevos + queso + champiñones + ensalada + pan integral', calories: 550, protein: 30, carbs: 40, fat: 22, order: 4 },
        ],
    },
    {
        name: 'Recomposición Corporal 2200kcal', type: 'normal', somatotype: 'endomorph', totalCalories: 2200,
        description: 'Mantenimiento con ciclado de carbohidratos.',
        meals: [
            { name: 'breakfast', description: 'Tortitas de avena y clara de huevo + fruta', calories: 400, protein: 30, carbs: 45, fat: 10, order: 0 },
            { name: 'lunch', description: 'Pollo al curry con arroz basmati y verduras / Ensalada de pollo', calories: 550, protein: 45, carbs: 50, fat: 15, order: 1 },
            { name: 'snack', description: 'Batido de proteína + bayas congeladas', calories: 200, protein: 30, carbs: 15, fat: 3, order: 2 },
            { name: 'dinner', description: 'Pescado blanco + verduras al vapor + aceite oliva', calories: 450, protein: 35, carbs: 25, fat: 20, order: 3 },
            { name: 'snack', description: 'Caseína 30g con agua', calories: 120, protein: 25, carbs: 2, fat: 1, order: 4 },
        ],
    },
];

// ═══════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════
async function main() {
    console.log('🏋️ CampFit Seed — Workouts & Diets\n');

    let admin;
    try { admin = await import('firebase-admin'); } catch {
        console.log('❌ firebase-admin no instalado. npm install firebase-admin');
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
        console.log('🔥 Conectado\n');

        // ── Clean ──
        if (SEED_CONFIG.forceClean) {
            console.log('🧹 Limpiando...');
            for (const col of ['workouts', 'diets']) {
                const snap = await db.collection(col).limit(500).get();
                if (snap.size > 0) {
                    const batch = db.batch();
                    snap.docs.forEach(d => batch.delete(d.ref));
                    await batch.commit();
                }
                console.log(`   ✅ ${col}: ${snap.size} docs`);
            }
            console.log('');
        }

        let totalWorkouts = 0, totalDiets = 0;

        for (const trainerId of TRAINER_IDS) {
            // Workouts para este trainer (distribuidos entre sus clientes)
            for (let w = 0; w < SEED_CONFIG.workoutsPerTrainer; w++) {
                const clientId = CLIENT_IDS[(w * SCALE + Math.floor(Math.random() * CLIENT_IDS.length)) % CLIENT_IDS.length];
                const tmpl = WORKOUT_TEMPLATES[w % WORKOUT_TEMPLATES.length];
                const exercises = tmpl.exercises.map((ex, i) => ({
                    id: `ex-${trainerId}-${w}-${i}`,
                    name: ex.name, sets: ex.sets, reps: ex.reps, restTime: ex.restTime,
                    videoUrl: ex.videoUrl || '', description: ex.description,
                    order: ex.order || i, dayOfWeek: ex.dayOfWeek || 1,
                }));
                await db.collection('workouts').add({
                    name: tmpl.name, description: tmpl.description, difficulty: tmpl.difficulty,
                    trainerId, clientId, exercises,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                totalWorkouts++;
            }
            console.log(`🏋️ Trainer ${trainerId.slice(0, 8)}... → ${SEED_CONFIG.workoutsPerTrainer} workouts`);

            // Diets para este trainer
            for (let d = 0; d < SEED_CONFIG.dietsPerTrainer; d++) {
                const clientId = CLIENT_IDS[(d * SCALE + Math.floor(Math.random() * CLIENT_IDS.length)) % CLIENT_IDS.length];
                const tmpl = DIET_TEMPLATES[d % DIET_TEMPLATES.length];
                const meals = tmpl.meals.map((m, i) => ({
                    id: `meal-${trainerId}-${d}-${i}`,
                    name: m.name, description: m.description,
                    calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat,
                    order: m.order || i,
                }));
                const dietType = ['vegan', 'vegetarian', 'keto', 'paleo', 'intermittent'].includes(tmpl.type) ? 'advanced' : tmpl.type;
                await db.collection('diets').add({
                    name: tmpl.name, description: tmpl.description, type: dietType,
                    somatotype: tmpl.somatotype, totalCalories: tmpl.totalCalories, meals,
                    trainerId, clientId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                totalDiets++;
            }
            console.log(`🍽️ Trainer ${trainerId.slice(0, 8)}... → ${SEED_CONFIG.dietsPerTrainer} diets`);
        }

        console.log(`\n✅ ${totalWorkouts} workouts + ${totalDiets} diets creados\n`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('Could not load the default credentials')) {
            console.log('\n💡 set GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json');
            console.log('   o usa emulador: set FIREBASE_EMULATOR=true');
        }
        process.exit(1);
    }
}

main();
