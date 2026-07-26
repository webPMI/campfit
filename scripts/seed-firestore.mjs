/**
 * CampFit Seed Data Generator
 * ====================================
 * Script para poblar Firestore con datos de ejemplo.
 * Útil para desarrollo, demos, y testing.
 *
 * Uso:
 *   1. Configurar credenciales de Firebase Admin SDK
 *   2. Ejecutar: node scripts/seed-firestore.mjs
 *
 * ADVERTENCIA: Este script CREA datos en Firestore.
 * Solo usar en entornos de desarrollo/demo.
 *
 * Documentación: ver SEED_DATA.md
 *
 * @module seed-firestore
 */

// ═══════════════════════════════════════════════════════════════
// Configuración
// ═══════════════════════════════════════════════════════════════

// IMPORTANTE: Ajusta estas variables antes de ejecutar
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'campfit-dev';
const USE_EMULATOR = process.env.FIREBASE_EMULATOR === 'true';
const EMULATOR_HOST = process.env.FIREBASE_EMULATOR_HOST || 'localhost:8080';

const SEED_CONFIG = {
    admins: 1,
    trainers: 3,
    clientsPerTrainer: 4,
    workoutsPerClient: 2,
    dietsPerClient: 2,
    progressLogsPerClient: 5,
    forceClean: false, // Si true, elimina datos existentes primero
};

// ═══════════════════════════════════════════════════════════════
// Datos de ejemplo
// ═══════════════════════════════════════════════════════════════

const ADMIN_EMAIL = 'admin@campfit.com';
const ADMIN_PASSWORD = 'Admin123!';

const TRAINER_NAMES = [
    'Carlos Martínez',
    'María López',
    'Javier Rodríguez',
];

const TRAINER_EMAILS = [
    'carlos.trainer@campfit.com',
    'maria.trainer@campfit.com',
    'javier.trainer@campfit.com',
];

const CLIENT_NAMES = [
    'Ana García', 'Pedro Sánchez', 'Laura Fernández', 'Diego Torres',
    'Sofía Ruiz', 'Miguel Ángel Díaz', 'Valentina Herrera', 'Andrés Morales',
    'Camila Ortiz', 'Lucas Ramírez', 'Isabella Vargas', 'Mateo Castillo',
];

const CLIENT_EMAILS = CLIENT_NAMES.map((n) =>
    n.toLowerCase().replace(/\s+/g, '.') + '@example.com'
);

// ═══════════════════════════════════════════════════════════════
// Datos de workouts (rutinas)
// ═══════════════════════════════════════════════════════════════

const WORKOUT_TEMPLATES = [
    {
        name: 'Full Body A',
        description: 'Entrenamiento de cuerpo completo enfocado en fuerza. Ideal para principiantes e intermedios.',
        difficulty: 'easy',
        exercises: [
            { name: 'Sentadillas', sets: 4, reps: 12, restTime: '60s', description: 'Con barra, profundidad controlada' },
            { name: 'Press de Banca', sets: 4, reps: 10, restTime: '90s', description: 'Agarre medio, tocar pecho' },
            { name: 'Peso Muerto', sets: 3, reps: 8, restTime: '120s', description: 'Espalda recta, activar core' },
            { name: 'Remo con Barra', sets: 3, reps: 10, restTime: '60s', description: 'Tirar hacia el ombligo' },
            { name: 'Press Militar', sets: 3, reps: 10, restTime: '60s', description: 'De pie, sin impulso' },
        ],
    },
    {
        name: 'Full Body B',
        description: 'Variante de cuerpo completo con énfasis en hipertrofia.',
        difficulty: 'medium',
        exercises: [
            { name: 'Peso Muerto Rumano', sets: 3, reps: 10, restTime: '90s', description: 'Piernas semi-extendidas' },
            { name: 'Press Inclinado', sets: 4, reps: 10, restTime: '90s', description: 'Banco a 30-45 grados' },
            { name: 'Sentadilla Frontal', sets: 3, reps: 10, restTime: '90s', description: 'Barra en clavículas' },
            { name: 'Dominadas', sets: 3, reps: 8, restTime: '90s', description: 'Usar banda si es necesario' },
            { name: 'Curl de Bíceps', sets: 3, reps: 12, restTime: '45s', description: 'Controlar excéntrica' },
        ],
    },
    {
        name: 'Pierna & Core',
        description: 'Rutina específica de tren inferior y zona media.',
        difficulty: 'medium',
        exercises: [
            { name: 'Sentadilla Búlgara', sets: 3, reps: 10, restTime: '60s', description: 'Por pierna' },
            { name: 'Prensa', sets: 4, reps: 12, restTime: '60s', description: 'Rango completo' },
            { name: 'Zancadas', sets: 3, reps: 12, restTime: '60s', description: 'Con mancuernas' },
            { name: 'Plancha', sets: 3, reps: 1, restTime: '30s', description: 'Mantener 45-60 segundos' },
            { name: 'Elevación de Talones', sets: 4, reps: 15, restTime: '45s', description: 'Gemelos' },
        ],
    },
    {
        name: 'Upper Body Power',
        description: 'Rutina de tren superior para ganancia de fuerza.',
        difficulty: 'hard',
        exercises: [
            { name: 'Press de Banca', sets: 5, reps: 5, restTime: '120s', description: 'Carga pesada' },
            { name: 'Press Militar', sets: 4, reps: 6, restTime: '90s', description: 'Estricto' },
            { name: 'Remo Pendlay', sets: 4, reps: 6, restTime: '90s', description: 'Desde el suelo' },
            { name: 'Fondos', sets: 3, reps: 8, restTime: '90s', description: 'Con lastre si es posible' },
            { name: 'Face Pull', sets: 3, reps: 15, restTime: '45s', description: 'Salud de hombro' },
        ],
    },
    {
        name: 'Cardio & Resistencia',
        description: 'Circuito de alta intensidad para mejorar resistencia cardiovascular.',
        difficulty: 'easy',
        exercises: [
            { name: 'Burpees', sets: 4, reps: 10, restTime: '30s', description: 'Ritmo constante' },
            { name: 'Mountain Climbers', sets: 3, reps: 20, restTime: '30s', description: 'Por pierna' },
            { name: 'Jump Squats', sets: 3, reps: 15, restTime: '45s', description: 'Aterrizar suave' },
            { name: 'Kettlebell Swing', sets: 4, reps: 15, restTime: '45s', description: 'Impulso de cadera' },
            { name: 'Battle Ropes', sets: 3, reps: 1, restTime: '30s', description: '30 segundos on / 30 off' },
        ],
    },
    {
        name: 'Flexibilidad & Movilidad',
        description: 'Rutina de estiramientos y movilidad articular para recuperación.',
        difficulty: 'easy',
        exercises: [
            { name: 'Estiramiento de Isquios', sets: 2, reps: 1, restTime: '0s', description: 'Mantener 30s por pierna' },
            { name: 'Movilidad de Cadera', sets: 2, reps: 10, restTime: '15s', description: 'Círculos controlados' },
            { name: 'Rotación Torácica', sets: 2, reps: 8, restTime: '15s', description: 'Por lado, sentado' },
            { name: 'Estiramiento de Cuádriceps', sets: 2, reps: 1, restTime: '0s', description: '30 segundos por lado' },
            { name: 'Yoga Flow', sets: 1, reps: 1, restTime: '0s', description: '5 minutos de saludo al sol' },
        ],
    },
];

// ═══════════════════════════════════════════════════════════════
// Datos de diets (dietas)
// ═══════════════════════════════════════════════════════════════

const DIET_TEMPLATES = [
    {
        name: 'Dieta Volumen Limpio',
        description: 'Plan nutricional para ganancia de masa muscular con alimentos limpios.',
        type: 'normal',
        somatotype: 'ectomorph',
        totalCalories: 3200,
        meals: [
            { name: 'breakfast', description: 'Avena con plátano y proteína whey + 3 huevos revueltos', calories: 650, protein: 45, carbs: 70, fat: 20, completed: false },
            { name: 'snack', description: 'Yogur griego con frutos secos y miel', calories: 350, protein: 20, carbs: 35, fat: 15, completed: false },
            { name: 'lunch', description: 'Pechuga de pollo (200g) con arroz integral y verduras', calories: 700, protein: 55, carbs: 80, fat: 15, completed: false },
            { name: 'snack', description: 'Batido de proteína + plátano + crema de cacahuete', calories: 450, protein: 35, carbs: 45, fat: 18, completed: false },
            { name: 'dinner', description: 'Salmón al horno con boniato y espárragos', calories: 650, protein: 40, carbs: 55, fat: 25, completed: false },
            { name: 'snack', description: 'Requesón con almendras', calories: 300, protein: 25, carbs: 10, fat: 18, completed: false },
        ],
    },
    {
        name: 'Dieta Definición',
        description: 'Plan hipocalórico para pérdida de grasa preservando masa muscular.',
        type: 'normal',
        somatotype: 'endomorph',
        totalCalories: 2100,
        meals: [
            { name: 'breakfast', description: 'Claras de huevo (6) + espinacas + tostada integral', calories: 350, protein: 35, carbs: 25, fat: 10, completed: false },
            { name: 'snack', description: 'Manzana + puñado de almendras', calories: 200, protein: 5, carbs: 30, fat: 10, completed: false },
            { name: 'lunch', description: 'Pechuga de pavo (150g) con ensalada verde y quinoa', calories: 450, protein: 40, carbs: 40, fat: 12, completed: false },
            { name: 'snack', description: 'Batido de proteína con agua', calories: 150, protein: 30, carbs: 3, fat: 2, completed: false },
            { name: 'dinner', description: 'Merluza al vapor con brócoli y coliflor', calories: 400, protein: 35, carbs: 20, fat: 15, completed: false },
        ],
    },
    {
        name: 'Dieta Cetogénica',
        description: 'Plan muy bajo en carbohidratos, alto en grasas saludables.',
        type: 'keto',
        somatotype: 'endomorph',
        totalCalories: 2400,
        meals: [
            { name: 'breakfast', description: 'Huevos fritos en mantequilla + aguacate + bacon', calories: 550, protein: 30, carbs: 5, fat: 48, completed: false },
            { name: 'lunch', description: 'Ensalada César con pollo (sin croutons) + aceite de oliva', calories: 600, protein: 40, carbs: 8, fat: 48, completed: false },
            { name: 'snack', description: 'Queso curado + nueces de macadamia', calories: 350, protein: 15, carbs: 4, fat: 32, completed: false },
            { name: 'dinner', description: 'Chuletón de cerdo con espárragos salteados en mantequilla', calories: 650, protein: 45, carbs: 6, fat: 52, completed: false },
        ],
    },
    {
        name: 'Dieta Vegana Fitness',
        description: 'Plan basado en plantas para deportistas. Alto en proteína vegetal.',
        type: 'vegan',
        somatotype: 'mesomorph',
        totalCalories: 2800,
        meals: [
            { name: 'breakfast', description: 'Smoothie bowl: proteína de guisante + espinacas + plátano + leche de almendras + semillas de chía', calories: 500, protein: 35, carbs: 60, fat: 15, completed: false },
            { name: 'snack', description: 'Hummus con palitos de zanahoria y apio', calories: 250, protein: 10, carbs: 25, fat: 12, completed: false },
            { name: 'lunch', description: 'Buddha bowl: quinoa + garbanzos + tofu marinado + aguacate + kale', calories: 700, protein: 35, carbs: 75, fat: 28, completed: false },
            { name: 'snack', description: 'Batido de proteína vegana + frutos rojos', calories: 300, protein: 25, carbs: 30, fat: 8, completed: false },
            { name: 'dinner', description: 'Lentejas estofadas con boniato y espinacas', calories: 600, protein: 30, carbs: 80, fat: 12, completed: false },
            { name: 'snack', description: 'Puñado de nueces + dátiles', calories: 250, protein: 5, carbs: 35, fat: 12, completed: false },
        ],
    },
    {
        name: 'Dieta Ayuno Intermitente',
        description: 'Plan 16:8. Dos comidas grandes + un snack.',
        type: 'intermittent',
        somatotype: 'mesomorph',
        totalCalories: 2500,
        meals: [
            { name: 'lunch', description: 'Bol de arroz integral + pollo teriyaki + verduras wok + huevo', calories: 900, protein: 55, carbs: 95, fat: 25, completed: false },
            { name: 'snack', description: 'Batido de proteína + mantequilla de almendra + plátano', calories: 450, protein: 35, carbs: 45, fat: 18, completed: false },
            { name: 'dinner', description: 'Salmón salvaje + puré de coliflor + ensalada de rúcula y tomate', calories: 750, protein: 45, carbs: 35, fat: 40, completed: false },
        ],
    },
];

// ═══════════════════════════════════════════════════════════════
// Medical Profiles de ejemplo
// ═══════════════════════════════════════════════════════════════

const MEDICAL_PROFILES = [
    {
        height: 165, initialWeight: 62, birthDate: '1995-03-15', gender: 'female', age: 31,
        bloodType: 'A+', allergies: ['Polen'], injuries: [], conditions: [], medications: [],
        surgery: '', goals: ['lose_weight', 'endurance'],
        experience: 'intermediate', emergencyName: 'María García', emergencyPhone: '+34 600 111 222',
        dietaryRestrictions: { glutenFree: false, lactoseFree: true, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] },
        intolerances: [{ substance: 'Lactosa', severity: 'mild', symptoms: 'Hinchazón' }],
    },
    {
        height: 178, initialWeight: 85, birthDate: '1990-07-22', gender: 'male', age: 36,
        bloodType: 'O+', allergies: [], injuries: ['Esguince tobillo derecho'], conditions: ['Asma leve'],
        medications: ['Salbutamol (ocasional)'], surgery: '', goals: ['gain_muscle', 'strength'],
        experience: 'advanced', emergencyName: 'Pedro Sánchez', emergencyPhone: '+34 600 222 333',
        dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] },
        intolerances: [],
    },
    {
        height: 172, initialWeight: 70, birthDate: '1988-11-08', gender: 'male', age: 37,
        bloodType: 'B-', allergies: ['Mariscos', 'Frutos secos'], injuries: [], conditions: ['Hipertensión controlada'],
        medications: ['Enalapril 10mg'], surgery: 'Apendicectomía (2015)',
        goals: ['lose_weight', 'health'], experience: 'beginner',
        emergencyName: 'Laura Fernández', emergencyPhone: '+34 600 333 444',
        dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: true, shellfishFree: true, other: [] },
        intolerances: [{ substance: 'Frutos secos', severity: 'severe', symptoms: 'Anafilaxia' }, { substance: 'Mariscos', severity: 'severe', symptoms: 'Urticaria, dificultad respiratoria' }],
    },
    {
        height: 168, initialWeight: 58, birthDate: '1998-05-30', gender: 'female', age: 28,
        bloodType: 'AB+', allergies: [], injuries: [], conditions: [], medications: [],
        surgery: '', goals: ['gain_muscle', 'endurance'], experience: 'beginner',
        emergencyName: 'Diego Torres', emergencyPhone: '+34 600 444 555',
        dietaryRestrictions: { glutenFree: true, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: ['Bajo en FODMAPs'] },
        intolerances: [{ substance: 'Gluten', severity: 'moderate', symptoms: 'Distensión abdominal, fatiga' }],
    },
    {
        height: 183, initialWeight: 95, birthDate: '1985-01-14', gender: 'male', age: 41,
        bloodType: 'A-', allergies: ['Penicilina'], injuries: ['Hernia discal L4-L5'], conditions: [],
        medications: [], surgery: 'Cirugía de hernia discal (2020)',
        goals: ['lose_weight', 'health'], experience: 'intermediate',
        emergencyName: 'Sofía Ruiz', emergencyPhone: '+34 600 555 666',
        dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] },
        intolerances: [],
    },
    {
        height: 175, initialWeight: 72, birthDate: '1993-09-20', gender: 'male', age: 33,
        bloodType: 'O-', allergies: [], injuries: [], conditions: [], medications: [],
        surgery: '', goals: ['strength', 'gain_muscle'], experience: 'advanced',
        emergencyName: 'Miguel Díaz', emergencyPhone: '+34 600 666 777',
        dietaryRestrictions: { glutenFree: false, lactoseFree: false, vegan: false, vegetarian: false, nutFree: false, shellfishFree: false, other: [] },
        intolerances: [],
    },
];

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
    console.log('🌱 CampFit Seed Data Generator');
    console.log('═══════════════════════════════');
    console.log('');

    // Verificar si Firebase Admin está instalado
    let admin;
    try {
        admin = await import('firebase-admin');
    } catch {
        console.log('❌ firebase-admin no está instalado.');
        console.log('   Ejecuta: npm install firebase-admin');
        console.log('');
        console.log('📋 Para usar este script necesitas:');
        console.log('   1. Instalar firebase-admin: npm install firebase-admin');
        console.log('   2. Configurar credenciales de Firebase Admin SDK');
        console.log('   3. Alternativa: usar Firestore Emulator');
        console.log('      set FIREBASE_EMULATOR=true');
        console.log('      set FIRESTORE_EMULATOR_HOST=localhost:8080');
        console.log('');
        console.log('📄 Ver documentación completa en SEED_DATA.md');
        process.exit(1);
    }

    try {
        // Inicializar Firebase Admin
        if (!admin.apps.length) {
            if (USE_EMULATOR) {
                process.env.FIRESTORE_EMULATOR_HOST = EMULATOR_HOST;
                admin.initializeApp({ projectId: FIREBASE_PROJECT_ID });
                console.log('🔧 Usando Firestore Emulator en', EMULATOR_HOST);
            } else {
                admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                    projectId: FIREBASE_PROJECT_ID,
                });
            }
        }

        const db = admin.firestore();
        console.log('🔥 Conectado a Firestore');
        console.log('');

        // Opción: limpiar datos existentes
        if (SEED_CONFIG.forceClean) {
            console.log('🧹 Limpiando datos existentes...');
            const collections = ['users', 'workouts', 'diets', 'messages', 'progress_logs'];
            for (const col of collections) {
                const snapshot = await db.collection(col).limit(500).get();
                const batch = db.batch();
                snapshot.docs.forEach((doc) => batch.delete(doc.ref));
                await batch.commit();
                console.log(`   ✅ Colección '${col}' limpiada (${snapshot.size} docs)`);
            }
            console.log('');
        }

        // ═══════════════════════════════════════════════
        // 1. Crear admin
        // ═══════════════════════════════════════════════
        console.log('👤 Creando admin...');
        const adminUser = await admin.auth().createUser({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            displayName: 'Admin CampFit',
        });
        await db.collection('users').doc(adminUser.uid).set({
            uid: adminUser.uid,
            name: 'Admin CampFit',
            email: ADMIN_EMAIL,
            role: 'admin',
            hasActiveAlert: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`   ✅ Admin creado: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
        console.log('');

        // ═══════════════════════════════════════════════
        // 2. Crear trainers y sus clientes
        // ═══════════════════════════════════════════════
        console.log(`👥 Creando ${SEED_CONFIG.trainers} trainers con ${SEED_CONFIG.clientsPerTrainer} clientes cada uno...`);
        const trainerIds = [];
        const clientIds = [];
        let clientIndex = 0;

        for (let t = 0; t < SEED_CONFIG.trainers; t++) {
            const trainerName = TRAINER_NAMES[t];
            const trainerEmail = TRAINER_EMAILS[t];

            // Crear trainer en Auth
            const trainerUser = await admin.auth().createUser({
                email: trainerEmail,
                password: 'Trainer123!',
                displayName: trainerName,
            });

            // Guardar en Firestore
            await db.collection('users').doc(trainerUser.uid).set({
                uid: trainerUser.uid,
                name: trainerName,
                email: trainerEmail,
                role: 'trainer',
                hasActiveAlert: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            trainerIds.push(trainerUser.uid);
            console.log(`   🏋️ Trainer: ${trainerName}`);

            // Crear clientes para este trainer
            for (let c = 0; c < SEED_CONFIG.clientsPerTrainer; c++) {
                const clientName = CLIENT_NAMES[clientIndex];
                const clientEmail = CLIENT_EMAILS[clientIndex];
                const medicalProfile = MEDICAL_PROFILES[clientIndex % MEDICAL_PROFILES.length];

                // Crear cliente en Auth
                const clientUser = await admin.auth().createUser({
                    email: clientEmail,
                    password: 'Client123!',
                    displayName: clientName,
                });

                // Guardar en Firestore con perfil médico
                await db.collection('users').doc(clientUser.uid).set({
                    uid: clientUser.uid,
                    name: clientName,
                    email: clientEmail,
                    role: 'client',
                    assignedTrainerId: trainerUser.uid,
                    hasActiveAlert: false,
                    medicalProfile: {
                        ...medicalProfile,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    },
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                clientIds.push(clientUser.uid);
                console.log(`      👤 Cliente: ${clientName} (trainer: ${trainerName})`);

                // ═════════════════════════════════════════
                // Crear workouts para este cliente
                // ═════════════════════════════════════════
                for (let w = 0; w < SEED_CONFIG.workoutsPerClient; w++) {
                    const template = WORKOUT_TEMPLATES[(clientIndex * SEED_CONFIG.workoutsPerClient + w) % WORKOUT_TEMPLATES.length];
                    await db.collection('workouts').add({
                        name: template.name,
                        description: template.description,
                        difficulty: template.difficulty,
                        trainerId: trainerUser.uid,
                        clientId: clientUser.uid,
                        exercises: template.exercises.map(ex => ({ ...ex, completed: false })),
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }
                console.log(`         📋 ${SEED_CONFIG.workoutsPerClient} rutinas creadas`);

                // ═════════════════════════════════════════
                // Crear diets para este cliente
                // ═════════════════════════════════════════
                for (let d = 0; d < SEED_CONFIG.dietsPerClient; d++) {
                    const template = DIET_TEMPLATES[(clientIndex * SEED_CONFIG.dietsPerClient + d) % DIET_TEMPLATES.length];
                    await db.collection('diets').add({
                        ...template,
                        trainerId: trainerUser.uid,
                        clientId: clientUser.uid,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }
                console.log(`         🍽️ ${SEED_CONFIG.dietsPerClient} dietas creadas`);

                // ═════════════════════════════════════════
                // Crear progress logs para este cliente
                // ═════════════════════════════════════════
                const types = ['weight', 'measurement', 'photo'];
                for (let p = 0; p < SEED_CONFIG.progressLogsPerClient; p++) {
                    const type = types[p % types.length];
                    const daysAgo = (SEED_CONFIG.progressLogsPerClient - p) * 7;
                    const date = new Date();
                    date.setDate(date.getDate() - daysAgo);

                    const logData = {
                        clientId: clientUser.uid,
                        type,
                        createdAt: admin.firestore.Timestamp.fromDate(date),
                    };

                    if (type === 'weight') {
                        logData.weight = medicalProfile.initialWeight - Math.round(p * 0.8 * 10) / 10;
                    } else if (type === 'measurement') {
                        logData.measurements = {
                            chest: 95 + Math.round(p * 1.5),
                            waist: 82 - Math.round(p * 1.2),
                            biceps: 35 + Math.round(p * 0.8),
                        };
                    } else if (type === 'photo') {
                        logData.note = 'Foto de progreso frontal';
                    }

                    await db.collection('progress_logs').add(logData);
                }
                console.log(`         📊 ${SEED_CONFIG.progressLogsPerClient} registros de progreso`);

                clientIndex++;
            }
        }

        console.log('');
        console.log('═══════════════════════════════');
        console.log('✅ Seed data generado exitosamente');
        console.log('');
        console.log('📊 Resumen:');
        console.log(`   👑 Admins: ${SEED_CONFIG.admins}`);
        console.log(`   🏋️ Trainers: ${trainerIds.length}`);
        console.log(`   👤 Clients: ${clientIds.length}`);
        console.log(`   📋 Workouts: ${SEED_CONFIG.trainers * SEED_CONFIG.clientsPerTrainer * SEED_CONFIG.workoutsPerClient}`);
        console.log(`   🍽️ Diets: ${SEED_CONFIG.trainers * SEED_CONFIG.clientsPerTrainer * SEED_CONFIG.dietsPerClient}`);
        console.log(`   📊 Progress Logs: ${SEED_CONFIG.trainers * SEED_CONFIG.clientsPerTrainer * SEED_CONFIG.progressLogsPerClient}`);
        console.log('');
        console.log('🔑 Credenciales de acceso:');
        console.log(`   Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
        for (let i = 0; i < trainerIds.length; i++) {
            console.log(`   Trainer ${i + 1}: ${TRAINER_EMAILS[i]} / Trainer123!`);
        }
        for (let i = 0; i < 3; i++) {
            console.log(`   Client ${i + 1}: ${CLIENT_EMAILS[i]} / Client123!`);
        }
        console.log(`   ... (${clientIds.length - 3} más clientes con contraseña Client123!)`);
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('Could not load the default credentials')) {
            console.log('');
            console.log('💡 Solución: Configura las credenciales de Firebase Admin SDK:');
            console.log('   Opción 1: set GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json');
            console.log('   Opción 2: Usa el emulador: set FIREBASE_EMULATOR=true');
        }
        process.exit(1);
    }
}

main();