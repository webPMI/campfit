#!/usr/bin/env node
/**
 * 🎬 CampFit — Renderizador de Vídeos Luminosos y Multientorno (Gimnasio, Casa, Parque, Nutrición)
 *
 * Genera vídeos cinemáticos fluidos en 1080p con iluminación brillante y cálida,
 * eliminando sombras oscuras y representando los distintos lugares donde entrena la gente.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT_DIR, 'public', 'images', 'landing');
const VIDEOS_DIR = path.join(ROOT_DIR, 'public', 'videos');

if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

const RENDERS = [
  {
    name: 'hero_training.mp4',
    source: 'training_gym.jpg',
    description: 'Entrenamiento en Gimnasio — Luminoso y de Alto Rendimiento',
    filter: "scale=4000:-1,zoompan=z='min(zoom+0.0010,1.18)':d=240:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,eq=brightness=0.03:contrast=1.06:saturation=1.12,format=yuv420p",
  },
  {
    name: 'home_training.mp4',
    source: 'training_home.jpg',
    description: 'Entrenamiento en Casa — Funcional con Luz Natural Matutina',
    filter: "scale=4000:-1,zoompan=z='1.12':d=240:x='(on/240)*(iw-iw/zoom)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,eq=brightness=0.02:contrast=1.05:saturation=1.15,format=yuv420p",
  },
  {
    name: 'outdoor_training.mp4',
    source: 'training_outdoor.jpg',
    description: 'Entrenamiento al Aire Libre / Parque — Calistenia y Running bajo el Sol',
    filter: "scale=4000:-1,zoompan=z='if(lte(zoom,1.0),1.18,max(1.001,zoom-0.0008))':d=240:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,eq=brightness=0.02:contrast=1.08:saturation=1.18,format=yuv420p",
  },
  {
    name: 'smart_nutrition.mp4',
    source: 'smart_nutrition.jpg',
    description: 'Nutrición de Precisión — Comida Gourmet y Macros Saludables',
    filter: "scale=4000:-1,zoompan=z='min(zoom+0.0012,1.20)':d=240:x='(on/240)*(iw-iw/zoom)*0.6':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,eq=brightness=0.02:contrast=1.08:saturation=1.20,format=yuv420p",
  },
];

console.log('🎬 CampFit — Renderizador de Vídeos Luminosos Multientorno');
console.log('===========================================================\n');

for (const item of RENDERS) {
  const inputPath = path.join(IMAGES_DIR, item.source);
  const outputPath = path.join(VIDEOS_DIR, item.name);

  if (!fs.existsSync(inputPath)) {
    console.warn(`⚠️ Imagen no encontrada: ${inputPath}. Saltando...`);
    continue;
  }

  console.log(`🎥 Renderizando: ${item.name}`);
  console.log(`   📸 Origen: ${item.source}`);
  console.log(`   ✨ Escena: ${item.description}`);

  const ffmpegCmd = `ffmpeg -y -loop 1 -i "${inputPath}" -vf "${item.filter}" -c:v libx264 -preset fast -crf 18 -t 8 -pix_fmt yuv420p "${outputPath}"`;

  try {
    execSync(ffmpegCmd, { stdio: 'ignore' });
    const stat = fs.statSync(outputPath);
    const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
    console.log(`   ✅ Generado con éxito: ${item.name} (${sizeMB} MB)\n`);
  } catch (error) {
    console.error(`   ❌ Error renderizando ${item.name}:`, error.message);
  }
}

console.log('🎉 Todos los vídeos luminosos de CampFit han sido renderizados con éxito en public/videos/');
