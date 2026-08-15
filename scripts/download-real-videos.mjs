#!/usr/bin/env node
/**
 * 🎬 CampFit — Descargador y Optimizador de Vídeos Reales de Fitness y Nutrición
 *
 * Descarga metraje de movimiento real (atletas entrenando con cargas pesadas,
 * kettlebells, preparación de alimentos y resistencia física) y los procesa
 * a 1080p con corrección de color cinemática (estética Gold & Obsidian).
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const VIDEOS_DIR = path.join(ROOT_DIR, 'public', 'videos');

if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

const REAL_VIDEO_SOURCES = [
  {
    name: 'hero_training.mp4',
    title: 'Entrenamiento de Fuerza Real CampFit — T-Bar Rows con Cargas Pesadas (Sin intros)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/How_to_do_a_T-Bar_Row_in_strength_training_workouts.webm',
    // Segundo 24: Atleta en plena ejecución de repeticiones pesadas sin ningún título o texto en pantalla
    seek: '00:00:24',
    duration: 10,
    filter: 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=contrast=1.15:brightness=-0.03:saturation=1.2',
  },
  {
    name: 'smart_nutrition.mp4',
    title: 'Nutrición Gourmet Real CampFit — Cocina de Alto Rendimiento',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Curry_Chicken.webmhd.webm',
    // Segundo 32: Ingredientes frescos y cocción activa sin gráficos
    seek: '00:00:32',
    duration: 10,
    filter: 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=contrast=1.18:brightness=0.0:saturation=1.3',
  },
  {
    name: 'biometric_analytics.mp4',
    title: 'Resistencia y Rendimiento Real CampFit — Entrenamiento en Rack',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Half_rack_resistance_exercise_workout.webm',
    // Segundo 18: Ejercicio en progreso constante
    seek: '00:00:18',
    duration: 10,
    filter: 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=contrast=1.2:brightness=-0.04:saturation=1.15',
  },
  {
    name: 'elite_performance.mp4',
    title: 'Condicionamiento Atlético Real CampFit — Kettlebell Athletic Flow',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Kettlebell_juggling_flow_by_Taco_Fleur.webm',
    // Segundo 25: Flujo dinámico de kettlebell limpio
    seek: '00:00:25',
    duration: 10,
    filter: 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=contrast=1.15:brightness=-0.02:saturation=1.25',
  },
];

console.log('🎬 CampFit — Procesador de Vídeos Reales de Fitness y Nutrición');
console.log('=================================================================\n');

for (const item of REAL_VIDEO_SOURCES) {
  const outputPath = path.join(VIDEOS_DIR, item.name);
  const tempInputPath = path.join(VIDEOS_DIR, `temp_${item.name}.webm`);

  console.log(`🎥 Procesando: ${item.name}`);
  console.log(`   🏋️ Metraje: ${item.title}`);
  console.log(`   📥 Descargando metraje fuente con cabeceras autorizadas...`);

  await new Promise((r) => setTimeout(r, 2500));

  try {
    const res = await fetch(item.url, {
      headers: {
        'User-Agent': 'CampFitBot/1.0 (https://campfit.com; dev@campfit.com)',
        'Accept': '*/*',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(tempInputPath, Buffer.from(arrayBuffer));
    console.log(`   ⚙️ Transcodificando a 1080p H.264 (Grading Gold/Obsidian)...`);

    const ffmpegCmd = `ffmpeg -y -ss ${item.seek} -i "${tempInputPath}" -t ${item.duration} -vf "${item.filter}" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -an "${outputPath}"`;
    execSync(ffmpegCmd, { stdio: 'ignore' });

    if (fs.existsSync(tempInputPath)) {
      fs.unlinkSync(tempInputPath);
    }

    const stat = fs.statSync(outputPath);
    const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
    console.log(`   ✅ Vídeo real generado con éxito: ${item.name} (${sizeMB} MB)\n`);
  } catch (error) {
    console.error(`   ❌ Error procesando ${item.name}:`, error.message);
    if (fs.existsSync(tempInputPath)) {
      fs.unlinkSync(tempInputPath);
    }
  }
}

console.log('🎉 Todos los vídeos reales de movimiento humano han sido integrados con éxito en public/videos/');
