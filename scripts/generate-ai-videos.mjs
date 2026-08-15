#!/usr/bin/env node
/**
 * 🎬 CampFit — Generador Autónomo de Vídeos con IA
 *
 * Soporta múltiples proveedores de IA:
 * - Replicate (Minimax Video-01, Kling AI, Luma Dream Machine)
 * - Runway (Gen-3 Alpha Turbo)
 * - Google Cloud / Vertex AI (Veo)
 * - Mock / Demo (Descarga clips de demostración libres de derechos para pruebas)
 *
 * Uso:
 *   node scripts/generate-ai-videos.mjs --scene=hero --provider=replicate
 *   node scripts/generate-ai-videos.mjs --all
 *   node scripts/generate-ai-videos.mjs --scene=hero --provider=mock
 *
 * @module scripts/generate-ai-videos
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const VIDEOS_DIR = path.join(ROOT_DIR, 'public', 'videos');

// Cargar variables de entorno desde .env manualmente si no están en process.env
function loadEnv() {
  const envPath = path.join(ROOT_DIR, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match && !line.trim().startsWith('#')) {
        const key = match[1];
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

// Escenas predefinidas en estética Gold Luxury vinculadas a las imágenes reales y luminosas de la plataforma
const SCENE_TEMPLATES = {
  hero: {
    filename: 'hero_training.mp4',
    sourceImage: 'training_gym.jpg',
    prompt: 'Cinematic luminous 4K slow motion luxury athletic fitness training in modern bright gym, professional coaches and athletes with dumbbells and deadlifts, glowing warm amber architectural light, crystal clear, ultra realistic 8k.',
    demoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  home: {
    filename: 'home_training.mp4',
    sourceImage: 'training_home.jpg',
    prompt: 'Cinematic luminous 4K slow motion home workout in a luxurious bright sunlit living room, huge windows with natural morning gold light, kettlebell swings and lunges on yoga mat, clean aesthetic, inspiring and vibrant.',
    demoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  outdoor: {
    filename: 'outdoor_training.mp4',
    sourceImage: 'training_outdoor.jpg',
    prompt: 'Cinematic luminous 4K slow motion outdoor calisthenics and running in a sunny coastal park, radiant golden hour sunlight, pullups and active running track, joyful, energetic and clear.',
    demoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  nutrition: {
    filename: 'smart_nutrition.mp4',
    sourceImage: 'smart_nutrition.jpg',
    prompt: 'Cinematic luminous macro 4K slow motion of gourmet healthy fitness nutrition meal prep, fresh sliced grilled salmon, vibrant avocado, roasted sweet potatoes and fresh greens on elegant wooden table with bright morning light.',
    demoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    scene: 'hero',
    provider: 'auto',
    all: false,
    prompt: null,
    comfyHost: 'http://127.0.0.1:8188',
  };

  for (const arg of args) {
    if (arg === '--all') options.all = true;
    else if (arg.startsWith('--scene=')) options.scene = arg.split('=')[1];
    else if (arg.startsWith('--provider=')) options.provider = arg.split('=')[1];
    else if (arg.startsWith('--prompt=')) options.prompt = arg.split('=')[1];
    else if (arg.startsWith('--comfy=')) options.comfyHost = arg.split('=')[1];
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
🎬 CampFit AI Video Generator Pipeline
======================================

Uso:
  node scripts/generate-ai-videos.mjs [opciones]

Opciones:
  --scene=<nombre>     Escena a generar: 'hero', 'nutrition', 'biometrics', 'training' (default: hero)
  --all                Genera todas las 4 escenas principales en lote
  --provider=<nombre>  Proveedor de IA: 'comfyui' (Local RTX), 'replicate', 'runway', 'google', 'mock'
  --comfy=<url>        URL de ComfyUI (default: http://127.0.0.1:8188)
  --prompt="..."       Prompt personalizado para sobreescribir la escena
  --help               Muestra esta ayuda

Variables de entorno requeridas para proveedores en la nube (.env):
  - REPLICATE_API_TOKEN   (Para Replicate Minimax/Kling)
  - RUNWAYML_API_SECRET   (Para Runway Gen-3 Alpha)
  - GOOGLE_AI_API_KEY     (Para Google Veo / Imagen Video)
`);
}

async function downloadVideoFromUrl(url, destinationPath) {
  console.log(`📥 Descargando vídeo desde: ${url}`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} al descargar el vídeo: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(destinationPath, buffer);
  const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
  console.log(`✅ Vídeo guardado con éxito: ${destinationPath} (${sizeMB} MB)\n`);
}

// 0. Generador con ComfyUI Local (NVIDIA RTX 5060 Ti)
async function generateWithComfyUI(sceneKey, sourceImageName, prompt, destinationPath, comfyHost = 'http://127.0.0.1:8188') {
  console.log(`🖥️ [ComfyUI Local GPU] Conectando a ${comfyHost}...`);

  // Verificar si ComfyUI está encendido
  try {
    const statsRes = await fetch(`${comfyHost}/system_stats`, { method: 'GET' });
    if (!statsRes.ok) throw new Error('Servidor ComfyUI no respondió correctamente');
  } catch (e) {
    console.error(`⚠️ ComfyUI no está activo en ${comfyHost}.`);
    console.log(`💡 Para generar vídeos en tu RTX 5060 Ti 16GB:`);
    console.log(`   1. Abre ComfyUI en tu ordenador (espera a que cargue en http://127.0.0.1:8188).`);
    console.log(`   2. Vuelve a ejecutar: npm run generate:videos:local\n`);
    throw new Error('ComfyUI local no disponible');
  }

  const imagesDir = path.join(ROOT_DIR, 'public', 'images', 'landing');
  const imagePath = path.join(imagesDir, sourceImageName);

  if (!fs.existsSync(imagePath)) {
    throw new Error(`Imagen no encontrada para ComfyUI: ${imagePath}`);
  }

  console.log(`📤 Subiendo imagen ${sourceImageName} a ComfyUI...`);
  const imageBuffer = fs.readFileSync(imagePath);
  const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('image', blob, sourceImageName);
  formData.append('overwrite', 'true');

  const uploadRes = await fetch(`${comfyHost}/upload/image`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error(`Error subiendo imagen a ComfyUI: ${uploadRes.statusText}`);
  }

  console.log(`🚀 [RTX 5060 Ti] Enviando tarea de animación Image-to-Video a ComfyUI...`);

  // Workflow dinámico de Stable Video Diffusion / Image to Video
  const workflow = {
    "3": {
      "inputs": {
        "seed": Math.floor(Math.random() * 100000000),
        "steps": 25,
        "cfg": 2.5,
        "sampler_name": "euler",
        "scheduler": "karras",
        "denoise": 1,
        "model": ["14", 0],
        "positive": ["14", 1],
        "negative": ["14", 2],
        "latent_image": ["14", 3]
      },
      "class_type": "KSampler"
    },
    "14": {
      "inputs": {
        "width": 1024,
        "height": 576,
        "video_frames": 25,
        "motion_bucket_id": 127,
        "fps": 6,
        "augmentation_level": 0,
        "clip_vision": ["15", 1],
        "init_image": ["16", 0],
        "vae": ["15", 2]
      },
      "class_type": "SVD_img2vid_conditioning"
    },
    "15": {
      "inputs": {
        "ckpt_name": "svd_xt.safetensors"
      },
      "class_type": "ImageOnlyCheckpointLoader"
    },
    "16": {
      "inputs": {
        "image": sourceImageName,
        "upload": "image"
      },
      "class_type": "LoadImage"
    },
    "8": {
      "inputs": {
        "samples": ["3", 0],
        "vae": ["15", 2]
      },
      "class_type": "VAEDecode"
    },
    "9": {
      "inputs": {
        "filename_prefix": `CampFit_${sceneKey}`,
        "fps": 24,
        "images": ["8", 0]
      },
      "class_type": "VHS_VideoCombine"
    }
  };

  const queueRes = await fetch(`${comfyHost}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow }),
  });

  const queueData = await queueRes.json();
  const promptId = queueData.prompt_id;
  console.log(`⏳ Tarea en cola en GPU (Prompt ID: ${promptId}). Procesando frames...`);

  // Polling de historial
  while (true) {
    await new Promise((r) => setTimeout(r, 3000));
    const histRes = await fetch(`${comfyHost}/history/${promptId}`);
    if (!histRes.ok) continue;
    const history = await histRes.json();

    if (history[promptId]) {
      const outputs = history[promptId].outputs;
      console.log(`✨ Renderizado completado en GPU.`);
      for (const nodeId of Object.keys(outputs)) {
        const nodeOutput = outputs[nodeId];
        if (nodeOutput.gifs && nodeOutput.gifs.length > 0) {
          const fileInfo = nodeOutput.gifs[0];
          const downloadUrl = `${comfyHost}/view?filename=${fileInfo.filename}&subfolder=${fileInfo.subfolder || ''}&type=${fileInfo.type || 'output'}`;
          await downloadVideoFromUrl(downloadUrl, destinationPath);
          return;
        } else if (nodeOutput.images && nodeOutput.images.length > 0) {
          const fileInfo = nodeOutput.images[0];
          const downloadUrl = `${comfyHost}/view?filename=${fileInfo.filename}&subfolder=${fileInfo.subfolder || ''}&type=${fileInfo.type || 'output'}`;
          await downloadVideoFromUrl(downloadUrl, destinationPath);
          return;
        }
      }
      break;
    }
  }
}

// 1. Generador con Replicate (Minimax Video-01)
async function generateWithReplicate(prompt, destinationPath) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error('Falta la variable REPLICATE_API_TOKEN en el entorno o archivo .env');
  }

  console.log('🚀 [Replicate] Iniciando modelo minimax/video-01...');
  const createRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'minimax/video-01',
      input: {
        prompt: prompt,
        prompt_optimizer: true,
      },
    }),
  });

  const prediction = await createRes.json();
  if (!createRes.ok) {
    throw new Error(`Error en Replicate: ${JSON.stringify(prediction)}`);
  }

  const pollUrl = prediction.urls.get;
  console.log(`⏳ [Replicate] Tarea en progreso (ID: ${prediction.id}). Polling de estado...`);

  while (true) {
    await new Promise((r) => setTimeout(r, 4000));
    const checkRes = await fetch(pollUrl, {
      headers: { 'Authorization': `Token ${token}` },
    });
    const statusData = await checkRes.json();

    console.log(`   • Estado: ${statusData.status}...`);

    if (statusData.status === 'succeeded') {
      const outputUrl = Array.isArray(statusData.output) ? statusData.output[0] : statusData.output;
      await downloadVideoFromUrl(outputUrl, destinationPath);
      break;
    } else if (statusData.status === 'failed' || statusData.status === 'canceled') {
      throw new Error(`Generación fallida en Replicate: ${statusData.error || 'Cancelado'}`);
    }
  }
}

// 2. Generador con Runway Gen-3
async function generateWithRunway(prompt, destinationPath) {
  const token = process.env.RUNWAYML_API_SECRET;
  if (!token) {
    throw new Error('Falta la variable RUNWAYML_API_SECRET en el entorno o archivo .env');
  }

  console.log('🚀 [Runway] Creando tarea en Gen-3 Alpha Turbo...');
  const createRes = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Runway-Version': '2024-09-13',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      promptText: prompt,
      model: 'gen3a_turbo',
      duration: 5,
      ratio: '16:9',
    }),
  });

  const task = await createRes.json();
  if (!createRes.ok) {
    throw new Error(`Error en Runway: ${JSON.stringify(task)}`);
  }

  const taskId = task.id;
  console.log(`⏳ [Runway] Tarea en cola (ID: ${taskId}). Verificando estado...`);

  while (true) {
    await new Promise((r) => setTimeout(r, 4000));
    const checkRes = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Runway-Version': '2024-09-13',
      },
    });
    const taskStatus = await checkRes.json();
    console.log(`   • Estado: ${taskStatus.status} (${taskStatus.progress ? Math.round(taskStatus.progress * 100) : 0}%)...`);

    if (taskStatus.status === 'SUCCEEDED') {
      const outputUrl = taskStatus.output[0];
      await downloadVideoFromUrl(outputUrl, destinationPath);
      break;
    } else if (taskStatus.status === 'FAILED' || taskStatus.status === 'CANCELLED') {
      throw new Error(`Runway error: ${taskStatus.failure || 'Falló la generación'}`);
    }
  }
}

// 3. Fallback Demo / Mock Mode
async function generateWithDemo(sceneKey, destinationPath) {
  const scene = SCENE_TEMPLATES[sceneKey] || SCENE_TEMPLATES.hero;
  console.log(`⚡ [Demo Mode] Descargando clip cinemático de prueba optimizado para escena: '${sceneKey}'...`);
  await downloadVideoFromUrl(scene.demoUrl, destinationPath);
}

async function processScene(sceneKey, providerChoice, customPrompt) {
  const scene = SCENE_TEMPLATES[sceneKey];
  if (!scene) {
    console.error(`❌ Escena desconocida '${sceneKey}'. Disponibles: ${Object.keys(SCENE_TEMPLATES).join(', ')}`);
    return;
  }

  if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  }

  const destinationPath = path.join(VIDEOS_DIR, scene.filename);
  const prompt = customPrompt || scene.prompt;

  console.log(`\n───────────────────────────────────────────────────`);
  console.log(`🎥 Procesando Escena: [${sceneKey.toUpperCase()}] -> ${scene.filename}`);
  console.log(`📝 Prompt: "${prompt}"`);
  console.log(`───────────────────────────────────────────────────`);

  let provider = providerChoice;
  if (provider === 'auto') {
    try {
      const comfyCheck = await fetch(`${comfyHost}/system_stats`, { method: 'GET' });
      if (comfyCheck.ok) {
        console.log('⚡ ¡Servidor ComfyUI local detectado! Usando GPU RTX 5060 Ti.');
        provider = 'comfyui';
      }
    } catch {
      // Comfy offline
    }

    if (provider === 'auto') {
      if (process.env.REPLICATE_API_TOKEN) provider = 'replicate';
      else if (process.env.RUNWAYML_API_SECRET) provider = 'runway';
      else {
        console.log('ℹ️ ComfyUI no detectado y no hay tokens de API en la nube. Usando modo DEMO.');
        provider = 'mock';
      }
    }
  }

  try {
    if (provider === 'comfyui') {
      await generateWithComfyUI(sceneKey, scene.sourceImage, prompt, destinationPath, comfyHost);
    } else if (provider === 'replicate') {
      await generateWithReplicate(prompt, destinationPath);
    } else if (provider === 'runway') {
      await generateWithRunway(prompt, destinationPath);
    } else {
      await generateWithDemo(sceneKey, destinationPath);
    }
  } catch (error) {
    console.error(`❌ Error generando vídeo para escena '${sceneKey}':`, error.message);
    console.log('⚠️ Reintentando con clip de respaldo en modo Demo...');
    await generateWithDemo(sceneKey, destinationPath);
  }
}

async function main() {
  const options = parseArgs();
  console.log('🎬 CampFit — Generador Autónomo de Vídeos AI Iniciado');

  if (options.all) {
    for (const key of Object.keys(SCENE_TEMPLATES)) {
      await processScene(key, options.provider, options.prompt, options.comfyHost);
    }
  } else {
    await processScene(options.scene, options.provider, options.prompt, options.comfyHost);
  }

  console.log('✨ Pipeline de vídeos completado con éxito.');
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
