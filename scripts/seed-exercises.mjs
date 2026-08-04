/**
 * Seed de la Biblioteca de Ejercicios — CampFit
 *
 * Pobla la colección `exercises_library` con ~70 ejercicios clasificados.
 * Usa IDs semánticos fijos para que los arrays `contraindications` y
 * futuras referencias sean estables.
 *
 * Uso:
 *   node scripts/seed-exercises.mjs
 *   node scripts/seed-exercises.mjs --force   # Re-seed completo
 *
 * @module scripts/seed-exercises
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ── Firebase Admin init ───────────────────────────────────────────────────────

const serviceAccountPath = resolve(process.cwd(), 'firebase-service-account.json');
if (!existsSync(serviceAccountPath)) {
  console.error('❌ No se encontró firebase-service-account.json');
  console.error('   Descárgalo de Firebase Console → Configuración del proyecto → Cuentas de servicio');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(readFileSync(serviceAccountPath, 'utf8'))) });
}

const db = getFirestore();
const COLLECTION = 'exercises_library';
const FORCE_CLEAN = process.argv.includes('--force');

// ── Helper de generación de searchIndex ──────────────────────────────────────

function generateSearchIndex(translations, tags, muscleGroups) {
  const normalize = (s) => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 1);

  const tokens = new Set();
  [...Object.values(translations), ...tags, ...muscleGroups].forEach(s =>
    normalize(s).forEach(t => tokens.add(t))
  );
  return Array.from(tokens);
}

// ── Helper factory ────────────────────────────────────────────────────────────

function ex(id, translations, muscleGroups, category, equipment, difficulty, opts = {}) {
  const tags = opts.tags ?? [];
  return {
    id,
    translations,
    searchIndex: generateSearchIndex(translations, tags, muscleGroups),
    muscleGroups,
    secondaryMuscles: opts.secondary ?? [],
    category,
    equipment,
    difficulty,
    defaultSets: opts.sets ?? 3,
    defaultReps: opts.reps ?? 10,
    defaultRestSeconds: opts.rest ?? 90,
    ...(opts.duration ? { defaultDurationSeconds: opts.duration } : {}),
    videoUrl: opts.video ?? '',
    thumbnailUrl: opts.thumb ?? '',
    instructionsUrl: opts.instructions ?? '',
    contraindications: opts.contra ?? [],
    tags,
    isActive: true,
    createdBy: 'system',
  };
}

// ── Catálogo de ejercicios ────────────────────────────────────────────────────

const exercises = [
  // ── PECHO ─────────────────────────────────────────────────────────────────
  ex('bench_press_barbell', { es: 'Press de banca con barra', en: 'Barbell Bench Press', ca: 'Press de banc amb barra' },
    ['chest'], 'strength', ['barbell', 'bench', 'rack'], 'intermediate',
    { secondary: ['triceps', 'shoulders'], sets: 4, reps: 8, rest: 120,
      tags: ['compound', 'powerlifting'], contra: ['shoulder_impingement', 'wrist_pain'] }),

  ex('bench_press_dumbbell', { es: 'Press de pecho con mancuernas', en: 'Dumbbell Bench Press', ca: 'Press de pit amb mancuernes' },
    ['chest'], 'strength', ['dumbbell', 'bench'], 'beginner',
    { secondary: ['triceps', 'shoulders'], tags: ['compound'],
      contra: ['shoulder_impingement'] }),

  ex('push_up', { es: 'Flexiones', en: 'Push-up', ca: 'Flexions' },
    ['chest'], 'strength', ['bodyweight'], 'beginner',
    { secondary: ['triceps', 'shoulders', 'core'], sets: 3, reps: 15, rest: 60,
      tags: ['compound', 'bodyweight', 'no_equipment'] }),

  ex('incline_bench_press', { es: 'Press inclinado con barra', en: 'Incline Barbell Press', ca: 'Press inclinat amb barra' },
    ['chest'], 'strength', ['barbell', 'bench', 'rack'], 'intermediate',
    { secondary: ['shoulders', 'triceps'], sets: 3, reps: 10, rest: 120,
      tags: ['compound'], contra: ['shoulder_impingement'] }),

  ex('cable_crossover', { es: 'Cruce de poleas', en: 'Cable Crossover', ca: 'Creuament de politges' },
    ['chest'], 'strength', ['cable'], 'intermediate',
    { tags: ['isolation'], contra: ['shoulder_impingement'] }),

  ex('dips_chest', { es: 'Fondos en paralelas (pecho)', en: 'Chest Dips', ca: 'Fons a paral·leles (pit)' },
    ['chest'], 'strength', ['pull_up_bar'], 'intermediate',
    { secondary: ['triceps', 'shoulders'], tags: ['compound', 'bodyweight'],
      contra: ['shoulder_impingement', 'elbow_pain'] }),

  // ── ESPALDA ───────────────────────────────────────────────────────────────
  ex('deadlift', { es: 'Peso muerto', en: 'Deadlift', ca: 'Pes mort' },
    ['back'], 'strength', ['barbell', 'rack'], 'advanced',
    { secondary: ['hamstrings', 'glutes', 'core', 'forearms'], sets: 4, reps: 5, rest: 180,
      tags: ['compound', 'powerlifting'], contra: ['lumbar_herniation', 'lumbar_pain'] }),

  ex('pull_up', { es: 'Dominadas', en: 'Pull-up', ca: 'Dominades' },
    ['back'], 'strength', ['pull_up_bar'], 'intermediate',
    { secondary: ['biceps', 'forearms', 'core'], sets: 4, reps: 8, rest: 120,
      tags: ['compound', 'bodyweight'], contra: ['shoulder_impingement', 'elbow_pain'] }),

  ex('lat_pulldown', { es: 'Jalón al pecho', en: 'Lat Pulldown', ca: 'Jalons al pit' },
    ['back'], 'strength', ['cable', 'machine'], 'beginner',
    { secondary: ['biceps'], tags: ['compound'] }),

  ex('seated_row', { es: 'Remo sentado en polea', en: 'Seated Cable Row', ca: 'Rem assegut a politja' },
    ['back'], 'strength', ['cable'], 'beginner',
    { secondary: ['biceps', 'core'], tags: ['compound'] }),

  ex('barbell_row', { es: 'Remo con barra', en: 'Barbell Row', ca: 'Rem amb barra' },
    ['back'], 'strength', ['barbell'], 'intermediate',
    { secondary: ['biceps', 'core'], tags: ['compound'],
      contra: ['lumbar_herniation', 'lumbar_pain'] }),

  ex('face_pull', { es: 'Face pull en polea', en: 'Face Pull', ca: 'Face pull a politja' },
    ['shoulders'], 'strength', ['cable'], 'beginner',
    { secondary: ['back'], tags: ['isolation', 'shoulder_health'] }),

  // ── HOMBROS ───────────────────────────────────────────────────────────────
  ex('overhead_press', { es: 'Press militar con barra', en: 'Overhead Press', ca: 'Press militar amb barra' },
    ['shoulders'], 'strength', ['barbell', 'rack'], 'intermediate',
    { secondary: ['triceps', 'core'], sets: 4, reps: 8, rest: 120,
      tags: ['compound', 'powerlifting'], contra: ['shoulder_impingement', 'cervical_pain'] }),

  ex('dumbbell_shoulder_press', { es: 'Press hombro con mancuernas', en: 'Dumbbell Shoulder Press', ca: 'Press espatlla amb mancuernes' },
    ['shoulders'], 'strength', ['dumbbell', 'bench'], 'beginner',
    { secondary: ['triceps'], tags: ['compound'] }),

  ex('lateral_raise', { es: 'Elevaciones laterales', en: 'Lateral Raise', ca: 'Elevacions laterals' },
    ['shoulders'], 'strength', ['dumbbell'], 'beginner',
    { tags: ['isolation'], contra: ['shoulder_impingement'] }),

  ex('front_raise', { es: 'Elevaciones frontales', en: 'Front Raise', ca: 'Elevacions frontals' },
    ['shoulders'], 'strength', ['dumbbell'], 'beginner',
    { tags: ['isolation'] }),

  // ── BÍCEPS ────────────────────────────────────────────────────────────────
  ex('barbell_curl', { es: 'Curl de bíceps con barra', en: 'Barbell Curl', ca: 'Curl de bíceps amb barra' },
    ['biceps'], 'strength', ['barbell'], 'beginner',
    { secondary: ['forearms'], tags: ['isolation'] }),

  ex('dumbbell_curl', { es: 'Curl de bíceps con mancuernas', en: 'Dumbbell Curl', ca: 'Curl de bíceps amb mancuernes' },
    ['biceps'], 'strength', ['dumbbell'], 'beginner',
    { secondary: ['forearms'], tags: ['isolation', 'unilateral'] }),

  ex('hammer_curl', { es: 'Curl martillo', en: 'Hammer Curl', ca: 'Curl martell' },
    ['biceps'], 'strength', ['dumbbell'], 'beginner',
    { secondary: ['forearms'], tags: ['isolation'] }),

  ex('cable_curl', { es: 'Curl en polea baja', en: 'Cable Curl', ca: 'Curl a politja baixa' },
    ['biceps'], 'strength', ['cable'], 'beginner',
    { tags: ['isolation'] }),

  // ── TRÍCEPS ───────────────────────────────────────────────────────────────
  ex('tricep_pushdown', { es: 'Extensión de tríceps en polea', en: 'Tricep Pushdown', ca: 'Extensió de tríceps a politja' },
    ['triceps'], 'strength', ['cable'], 'beginner',
    { tags: ['isolation'] }),

  ex('overhead_tricep_extension', { es: 'Extensión tríceps sobre la cabeza', en: 'Overhead Tricep Extension', ca: 'Extensió tríceps sobre el cap' },
    ['triceps'], 'strength', ['dumbbell'], 'beginner',
    { tags: ['isolation'], contra: ['elbow_pain'] }),

  ex('skull_crusher', { es: 'Press francés (rompe cráneos)', en: 'Skull Crusher', ca: 'Premsa francesa (trenca cranis)' },
    ['triceps'], 'strength', ['barbell', 'bench'], 'intermediate',
    { tags: ['isolation'], contra: ['elbow_pain'] }),

  ex('dips_tricep', { es: 'Fondos en banco (tríceps)', en: 'Bench Dips (Triceps)', ca: 'Fons al banc (tríceps)' },
    ['triceps'], 'strength', ['bench', 'bodyweight'], 'beginner',
    { secondary: ['chest', 'shoulders'], tags: ['compound', 'bodyweight'] }),

  // ── CORE ──────────────────────────────────────────────────────────────────
  ex('plank', { es: 'Plancha isométrica', en: 'Plank', ca: 'Planxa isomètrica' },
    ['core'], 'strength', ['bodyweight'], 'beginner',
    { sets: 3, reps: 1, duration: 45, rest: 60, tags: ['isometric', 'bodyweight', 'no_equipment'] }),

  ex('crunch', { es: 'Crunch abdominal', en: 'Crunch', ca: 'Crunch abdominal' },
    ['core'], 'strength', ['bodyweight'], 'beginner',
    { sets: 3, reps: 20, rest: 60, tags: ['isolation', 'bodyweight', 'no_equipment'] }),

  ex('leg_raise', { es: 'Elevación de piernas', en: 'Leg Raise', ca: 'Elevació de cames' },
    ['core'], 'strength', ['bodyweight', 'pull_up_bar'], 'intermediate',
    { tags: ['isolation', 'bodyweight'], contra: ['lumbar_pain'] }),

  ex('russian_twist', { es: 'Rotación rusa', en: 'Russian Twist', ca: 'Rotació russa' },
    ['core'], 'strength', ['bodyweight'], 'beginner',
    { tags: ['isolation', 'bodyweight'], contra: ['lumbar_pain'] }),

  ex('mountain_climber', { es: 'Escalador', en: 'Mountain Climber', ca: 'Escalador' },
    ['core'], 'cardio', ['bodyweight'], 'intermediate',
    { tags: ['cardio', 'bodyweight', 'no_equipment'], contra: ['wrist_pain'] }),

  ex('dead_bug', { es: 'Insecto muerto (Dead Bug)', en: 'Dead Bug', ca: 'Insecte mort (Dead Bug)' },
    ['core'], 'rehabilitation', ['bodyweight'], 'beginner',
    { tags: ['rehabilitation', 'stability', 'no_equipment'] }),

  // ── CUÁDRICEPS ────────────────────────────────────────────────────────────
  ex('squat', { es: 'Sentadilla con barra', en: 'Barbell Back Squat', ca: 'Esquat amb barra' },
    ['quadriceps'], 'strength', ['barbell', 'rack'], 'intermediate',
    { secondary: ['glutes', 'hamstrings', 'core'], sets: 4, reps: 8, rest: 180,
      tags: ['compound', 'powerlifting'], contra: ['knee_pain', 'lumbar_herniation'] }),

  ex('goblet_squat', { es: 'Sentadilla goblet', en: 'Goblet Squat', ca: 'Esquat goblet' },
    ['quadriceps'], 'strength', ['kettlebell', 'dumbbell'], 'beginner',
    { secondary: ['glutes', 'core'], tags: ['compound'] }),

  ex('leg_press', { es: 'Prensa de piernas', en: 'Leg Press', ca: 'Premsa de cames' },
    ['quadriceps'], 'strength', ['machine'], 'beginner',
    { secondary: ['glutes', 'hamstrings'], tags: ['compound'],
      contra: ['knee_replacement'] }),

  ex('leg_extension', { es: 'Extensión de cuádriceps en máquina', en: 'Leg Extension', ca: 'Extensió de quàdriceps a màquina' },
    ['quadriceps'], 'strength', ['machine'], 'beginner',
    { tags: ['isolation'], contra: ['knee_pain', 'knee_replacement'] }),

  ex('lunge', { es: 'Zancada', en: 'Lunge', ca: 'Estocada' },
    ['quadriceps'], 'strength', ['dumbbell', 'bodyweight'], 'beginner',
    { secondary: ['glutes', 'hamstrings'], tags: ['unilateral', 'compound'],
      contra: ['knee_pain'] }),

  ex('split_squat', { es: 'Sentadilla búlgara', en: 'Bulgarian Split Squat', ca: 'Esquat búlgar' },
    ['quadriceps'], 'strength', ['dumbbell', 'bench'], 'advanced',
    { secondary: ['glutes', 'hamstrings'], tags: ['unilateral', 'compound'],
      contra: ['knee_pain'] }),

  // ── ISQUIOTIBIALES ────────────────────────────────────────────────────────
  ex('romanian_deadlift', { es: 'Peso muerto rumano', en: 'Romanian Deadlift', ca: 'Pes mort romanès' },
    ['hamstrings'], 'strength', ['barbell', 'dumbbell'], 'intermediate',
    { secondary: ['glutes', 'back'], tags: ['compound'],
      contra: ['lumbar_herniation', 'lumbar_pain'] }),

  ex('leg_curl', { es: 'Curl de femorales tumbado', en: 'Lying Leg Curl', ca: 'Curl de femorals estirat' },
    ['hamstrings'], 'strength', ['machine'], 'beginner',
    { tags: ['isolation'] }),

  ex('nordic_curl', { es: 'Curl nórdico de femorales', en: 'Nordic Hamstring Curl', ca: 'Curl nòrdic de femorals' },
    ['hamstrings'], 'strength', ['bodyweight'], 'advanced',
    { tags: ['isolation', 'injury_prevention'], contra: ['knee_pain'] }),

  ex('good_morning', { es: 'Buenos días con barra', en: 'Good Morning', ca: 'Bons dies amb barra' },
    ['hamstrings'], 'strength', ['barbell'], 'intermediate',
    { secondary: ['back', 'glutes'], tags: ['compound'],
      contra: ['lumbar_herniation', 'lumbar_pain'] }),

  // ── GLÚTEOS ───────────────────────────────────────────────────────────────
  ex('hip_thrust', { es: 'Empuje de cadera con barra', en: 'Barbell Hip Thrust', ca: 'Impulsió de maluca amb barra' },
    ['glutes'], 'strength', ['barbell', 'bench'], 'intermediate',
    { secondary: ['hamstrings'], sets: 4, reps: 12, rest: 120, tags: ['isolation', 'compound'] }),

  ex('glute_bridge', { es: 'Puente de glúteos', en: 'Glute Bridge', ca: 'Pont de glutis' },
    ['glutes'], 'strength', ['bodyweight'], 'beginner',
    { tags: ['isolation', 'bodyweight', 'rehabilitation', 'no_equipment'] }),

  ex('cable_kickback', { es: 'Patada de glúteo en polea', en: 'Cable Glute Kickback', ca: 'Puntada de glutis a politja' },
    ['glutes'], 'strength', ['cable'], 'beginner',
    { tags: ['isolation', 'unilateral'] }),

  // ── GEMELOS ───────────────────────────────────────────────────────────────
  ex('standing_calf_raise', { es: 'Elevación de talones de pie', en: 'Standing Calf Raise', ca: 'Elevació de talons dret' },
    ['calves'], 'strength', ['machine', 'bodyweight'], 'beginner',
    { tags: ['isolation'] }),

  ex('seated_calf_raise', { es: 'Elevación de talones sentado', en: 'Seated Calf Raise', ca: 'Elevació de talons assegut' },
    ['calves'], 'strength', ['machine'], 'beginner',
    { tags: ['isolation'] }),

  // ── CARDIO ────────────────────────────────────────────────────────────────
  ex('running_treadmill', { es: 'Carrera en cinta', en: 'Treadmill Running', ca: 'Córrer a la cinta' },
    ['cardio'], 'cardio', ['machine'], 'beginner',
    { sets: 1, reps: 1, duration: 1200, rest: 0, tags: ['liss', 'cardio'],
      contra: ['knee_replacement', 'ankle_sprain'] }),

  ex('stationary_bike', { es: 'Bicicleta estática', en: 'Stationary Bike', ca: 'Bicicleta estàtica' },
    ['cardio'], 'cardio', ['machine'], 'beginner',
    { sets: 1, reps: 1, duration: 1200, rest: 0, tags: ['liss', 'cardio', 'low_impact'] }),

  ex('jump_rope', { es: 'Salto a la comba', en: 'Jump Rope', ca: 'Salt a la corda' },
    ['cardio'], 'cardio', ['other'], 'intermediate',
    { sets: 5, reps: 1, duration: 60, rest: 60, tags: ['hiit', 'cardio', 'plyometric'],
      contra: ['ankle_sprain', 'knee_pain'] }),

  ex('burpee', { es: 'Burpee', en: 'Burpee', ca: 'Burpee' },
    ['cardio'], 'plyometric', ['bodyweight'], 'intermediate',
    { secondary: ['chest', 'shoulders', 'core'], sets: 4, reps: 12, rest: 90,
      tags: ['hiit', 'full_body', 'bodyweight'], contra: ['shoulder_impingement', 'wrist_pain'] }),

  ex('box_jump', { es: 'Salto al cajón', en: 'Box Jump', ca: 'Salt al caixó' },
    ['cardio'], 'plyometric', ['other'], 'intermediate',
    { secondary: ['quadriceps', 'glutes'], sets: 4, reps: 8, rest: 120,
      tags: ['plyometric', 'power'], contra: ['knee_pain', 'ankle_sprain'] }),

  // ── FLEXIBILIDAD / MOVILIDAD ──────────────────────────────────────────────
  ex('hip_flexor_stretch', { es: 'Estiramiento de psoas', en: 'Hip Flexor Stretch', ca: 'Estirament del psoes' },
    ['core'], 'flexibility', ['bodyweight'], 'beginner',
    { sets: 3, reps: 1, duration: 30, rest: 30, tags: ['stretching', 'flexibility', 'no_equipment'] }),

  ex('hamstring_stretch', { es: 'Estiramiento de isquiotibiales', en: 'Hamstring Stretch', ca: 'Estirament dels isquiotibials' },
    ['hamstrings'], 'flexibility', ['bodyweight'], 'beginner',
    { sets: 3, reps: 1, duration: 30, rest: 30, tags: ['stretching', 'flexibility', 'no_equipment'] }),

  ex('pigeon_pose', { es: 'Postura de la paloma (glúteo)', en: 'Pigeon Pose', ca: 'Postura del colom (glutis)' },
    ['glutes'], 'flexibility', ['bodyweight'], 'beginner',
    { sets: 2, reps: 1, duration: 45, rest: 15, tags: ['yoga', 'flexibility', 'no_equipment'] }),

  ex('thoracic_rotation', { es: 'Rotación torácica', en: 'Thoracic Rotation', ca: 'Rotació toràcica' },
    ['back'], 'flexibility', ['bodyweight'], 'beginner',
    { sets: 3, reps: 10, rest: 30, tags: ['mobility', 'rehabilitation', 'no_equipment'] }),

  // ── REHABILITACIÓN ────────────────────────────────────────────────────────
  ex('band_pull_apart', { es: 'Separación de banda elástica', en: 'Band Pull Apart', ca: 'Separació de banda elàstica' },
    ['shoulders'], 'rehabilitation', ['resistance_band'], 'beginner',
    { sets: 3, reps: 15, rest: 60, tags: ['shoulder_health', 'rehabilitation', 'prehab'] }),

  ex('bird_dog', { es: 'Perro pájaro', en: 'Bird Dog', ca: 'Gos ocell' },
    ['core'], 'rehabilitation', ['bodyweight'], 'beginner',
    { secondary: ['back'], sets: 3, reps: 10, rest: 60,
      tags: ['rehabilitation', 'stability', 'no_equipment'] }),

  ex('clamshell', { es: 'Almeja (abductor cadera)', en: 'Clamshell', ca: 'Almeja (abductor maluca)' },
    ['glutes'], 'rehabilitation', ['bodyweight', 'resistance_band'], 'beginner',
    { sets: 3, reps: 15, rest: 60, tags: ['rehabilitation', 'hip_health', 'unilateral'] }),

  ex('wall_sit', { es: 'Sentadilla en pared', en: 'Wall Sit', ca: 'Esquat a la paret' },
    ['quadriceps'], 'rehabilitation', ['bodyweight'], 'beginner',
    { sets: 3, reps: 1, duration: 40, rest: 60, tags: ['isometric', 'rehabilitation', 'no_equipment'] }),

  // ── FUNCIONAL / CUERPO COMPLETO ───────────────────────────────────────────
  ex('kettlebell_swing', { es: 'Swing con kettlebell', en: 'Kettlebell Swing', ca: 'Swing amb kettlebell' },
    ['full_body'], 'functional', ['kettlebell'], 'intermediate',
    { secondary: ['glutes', 'hamstrings', 'core'], sets: 4, reps: 15, rest: 90,
      tags: ['functional', 'power', 'cardio'], contra: ['lumbar_herniation'] }),

  ex('thrusters', { es: 'Thruster con mancuernas', en: 'Dumbbell Thrusters', ca: 'Thruster amb mancuernes' },
    ['full_body'], 'functional', ['dumbbell'], 'intermediate',
    { secondary: ['quadriceps', 'shoulders'], sets: 4, reps: 10, rest: 120,
      tags: ['functional', 'hiit', 'compound'], contra: ['shoulder_impingement', 'knee_pain'] }),

  ex('farmers_carry', { es: 'Caminata del granjero', en: 'Farmer\'s Carry', ca: 'Caminada del pagès' },
    ['full_body'], 'functional', ['dumbbell', 'kettlebell'], 'beginner',
    { secondary: ['core', 'forearms', 'shoulders'], sets: 4, reps: 1, rest: 90,
      tags: ['functional', 'grip_strength'], contra: ['shoulder_impingement'] }),

  ex('turkish_get_up', { es: 'Turkish Get-Up', en: 'Turkish Get-Up', ca: 'Turkish Get-Up' },
    ['full_body'], 'functional', ['kettlebell'], 'advanced',
    { secondary: ['shoulders', 'core', 'glutes'], sets: 3, reps: 5, rest: 120,
      tags: ['functional', 'stability', 'unilateral'], contra: ['shoulder_impingement', 'wrist_pain'] }),

  // ── TRX ──────────────────────────────────────────────────────────────────
  ex('trx_row', { es: 'Remo en TRX', en: 'TRX Row', ca: 'Rem en TRX' },
    ['back'], 'strength', ['trx'], 'beginner',
    { secondary: ['biceps', 'core'], tags: ['compound', 'bodyweight'] }),

  ex('trx_chest_press', { es: 'Press de pecho en TRX', en: 'TRX Chest Press', ca: 'Press de pit en TRX' },
    ['chest'], 'strength', ['trx'], 'beginner',
    { secondary: ['triceps', 'core'], tags: ['compound', 'bodyweight'] }),

  ex('trx_squat', { es: 'Sentadilla en TRX', en: 'TRX Squat', ca: 'Esquat en TRX' },
    ['quadriceps'], 'strength', ['trx'], 'beginner',
    { secondary: ['glutes', 'core'], tags: ['compound', 'bodyweight'] }),
];

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`\n🏋️  CampFit — Seed de Biblioteca de Ejercicios`);
  console.log(`📦 Ejercicios a sembrar: ${exercises.length}`);
  console.log(`🔥 Colección: ${COLLECTION}`);
  console.log(`💥 Modo: ${FORCE_CLEAN ? 'FORCE CLEAN' : 'skip existentes'}\n`);

  const now = Timestamp.now();
  let created = 0;
  let skipped = 0;
  let errors = 0;

  if (FORCE_CLEAN) {
    console.log('🧹 Eliminando documentos existentes...');
    const existing = await db.collection(COLLECTION).get();
    const batch = db.batch();
    existing.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`   ✅ ${existing.size} documentos eliminados\n`);
  }

  for (const exercise of exercises) {
    const { id, ...data } = exercise;
    const ref = db.collection(COLLECTION).doc(id);

    try {
      if (!FORCE_CLEAN) {
        const snap = await ref.get();
        if (snap.exists) {
          console.log(`   ⏭️  Skip: ${exercise.translations.es}`);
          skipped++;
          continue;
        }
      }

      await ref.set({ ...data, createdAt: now, updatedAt: now });
      console.log(`   ✅ ${exercise.translations.es} (${exercise.category})`);
      created++;
    } catch (err) {
      console.error(`   ❌ Error: ${exercise.translations.es}:`, err.message);
      errors++;
    }
  }

  console.log(`\n🎉 Seed completado:`);
  console.log(`   ✅ Creados: ${created}`);
  console.log(`   ⏭️  Omitidos: ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📦 Total catálogo: ${created + skipped} ejercicios\n`);
}

seed().catch(err => {
  console.error('❌ Error crítico en seed:', err);
  process.exit(1);
});
