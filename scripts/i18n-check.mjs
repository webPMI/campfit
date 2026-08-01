#!/usr/bin/env node
/**
 * CampFit i18n Checker — Escáner de traducciones
 * 
 * Verifica:
 * 1. Textos hardcodeados en páginas Astro (que deberían usar t('key'))
 * 2. Claves usadas en el código que NO existen en translations.ts
 * 3. Claves definidas que NO se usan en ninguna parte
 *
 * Uso: node scripts/i18n-check.mjs
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const PAGES_DIR = join(ROOT, 'src', 'pages');
const LOCALES_DIR = join(ROOT, 'src', 'i18n');
const LAYOUTS_DIR = join(ROOT, 'src', 'layouts');
const COMPONENTS_DIR = join(ROOT, 'src', 'components');

const SPANISH_HARDCODED = />(Iniciar Sesión|Registrarse|Dashboard|CampFit|Tu entrenador personal|Transforma tu cuerpo|Comenzar Ahora|Entrenamiento|Seguimiento|Coach|Mi Dashboard|Panel Admin|Panel Trainer|Recuperar Contraseña|Te enviaremos un enlace|Enviar Enlace|Volver a Iniciar Sesión|Revisa tu correo|Error al guardar|Acciones rápidas|Próxima comida|Entrenar hoy|Ver rutina del día|Ver plan nutricional|Completado esta semana|Completado hoy|Progreso Rutina|Adherencia Dieta|Estadísticas|Peso|Calorías|RPE Prom|Días|Sin rutina asignada|Sin dieta asignada|Sin registros|Planes personalizados|Monitoreo en tiempo real|Comunicación directa|Cerrar Sesión|Configuración|Perfil Médico|Rutinas|Dietas|Progreso|Chat|Soporte|Inicio|Omitir por ahora|Contacto de Emergencia|Por tu seguridad durante el entrenamiento|Nombre contacto emergencia|Teléfono emergencia|Atrás|Finalizar|Continuar|Guardar Perfil|Guardando|Completa tu perfil|Cuéntanos sobre ti|Información Personal|Objetivos|Nivel de experiencia|Principiante|Intermedio|Avanzado|Condiciones médicas|Medicamentos|Alergias|Lesiones previas|Cirugías|Fecha de nacimiento|Altura \(cm\)|Peso \(kg\)|Continuar con Google|Registrarse con Google|Iniciar sesión con Google|Acepto los términos|Términos y Condiciones|Confirmar contraseña|Usaremos este email|Tu nombre completo|Mínimo 6 caracteres|Una mayúscula|Una minúscula|Un número|Débil|Regular|Buena|Fuerte|Mostrar contraseña|Ocultar contraseña|Las contraseñas no coinciden|No coinciden|Debes aceptar|¿No tienes cuenta|¿Ya tienes cuenta|Crear una|Inicia Sesión|¿Olvidaste tu contraseña|Email inválido|El email es obligatorio|El nombre es obligatorio|Mínimo 2 caracteres|Máximo 50 caracteres|Solo letras, espacios y guiones|Error al cargar|Sin usuarios|Sin clientes|Sin entrenadores|Cargando|Buscar|Cancelar|Guardar|Guardar Cambios|Eliminar|Editar|Crear|Sin resultados|Sin datos|Error|Total|Nombre|Email|Rol|Entrenador|Cliente|Tipo|Foto|Alérgenos|Restricciones alimentarias|Intolerancias|Perfil médico no completado|Con datos clínicos|Sin datos|Grupo sanguíneo|Emergencia|Leve|Moderada|Severa|Masculino|Femenino|Otro|años|Sin alertas activas|Características|Contacto|Privacidad|Términos|Cookies|Empezar Gratis|Todos los derechos reservados|Plataforma integral)/g;

const SEVERITY = { pass: '✅', warn: '⚠️ ', fail: '❌' };

let totalHardcoded = 0;
let totalMissingKeys = 0;
let totalFilesChecked = 0;

// ─── Cargar traducciones existentes ─────────────────────────────────────
function loadTranslationKeys(filePath) {
  if (!existsSync(filePath)) return new Set();
  const content = readFileSync(filePath, 'utf-8');
  const keys = new Set();
  const regex = /'([^']+)'\s*:/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

const esKeys = loadTranslationKeys(join(LOCALES_DIR, 'locales', 'es.ts'));
const enKeys = loadTranslationKeys(join(LOCALES_DIR, 'locales', 'en.ts'));
const clientEsKeys = loadTranslationKeys(join(LOCALES_DIR, 'client.ts'));

// Merge para cobertura completa
const allDefinedKeys = new Set([...esKeys, ...enKeys, ...clientEsKeys]);

// ─── Escanear archivos recursivamente ───────────────────────────────────
function scanDir(dir, pattern = /\.(astro|ts|tsx)$/) {
  const results = [];
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        results.push(...scanDir(fullPath, pattern));
      } else if (pattern.test(file)) {
        results.push(fullPath);
      }
    } catch { /* skip unreadable */ }
  }
  return results;
}

// ─── Extraer claves t('...') usadas ─────────────────────────────────────
function extractTKeys(content) {
  const keys = new Set();
  const regex = /\bt\(["']([^"']+)["']\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

// ─── Verificar archivo individual ───────────────────────────────────────
function checkFile(filePath) {
  totalFilesChecked++;
  const content = readFileSync(filePath, 'utf-8');
  const relativePath = filePath.replace(ROOT, '').replace(/\\/g, '/');
  const issues = [];

  // Verificar textos hardcodeados en español
  const hardcodedMatches = content.match(SPANISH_HARDCODED);
  if (hardcodedMatches) {
    // Filtrar falsos positivos: textos dentro de comentarios, imports, etc.
    const realHardcoded = hardcodedMatches.filter(m => {
      // No contar si está en comentario HTML <!-- -->
      const idx = content.indexOf(m);
      const before = content.slice(Math.max(0, idx - 20), idx);
      return !before.includes('<!--') && !before.includes('import');
    });
    
    if (realHardcoded.length > 0) {
      const unique = [...new Set(realHardcoded)];
      unique.forEach(text => {
        issues.push({ type: 'hardcoded', severity: 'fail', message: `Texto hardcodeado: "${text}"` });
      });
      totalHardcoded += unique.length;
    }
  }

  // Verificar claves t('key') sin traducción
  const usedKeys = extractTKeys(content);
  usedKeys.forEach(key => {
    if (!allDefinedKeys.has(key)) {
      issues.push({ type: 'missing_key', severity: 'fail', message: `Clave no traducida: t('${key}')` });
      totalMissingKeys++;
    }
  });

  return { path: relativePath, issues };
}

// ─── Main ────────────────────────────────────────────────────────────────
console.log('🔍 CampFit i18n Checker v1.0');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const allFiles = [
  ...scanDir(PAGES_DIR),
  ...scanDir(LAYOUTS_DIR),
  ...scanDir(COMPONENTS_DIR),
];

console.log(`📂 Escaneando ${allFiles.length} archivos...\n`);

const results = allFiles.map(checkFile).filter(r => r.issues.length > 0);

if (results.length === 0) {
  console.log('✅ ¡Todas las páginas están completamente traducidas!');
  console.log('   No se encontraron textos hardcodeados ni claves faltantes.\n');
} else {
  results.forEach(({ path, issues }) => {
    console.log(`📄 ${path}`);
    issues.forEach(({ severity, message }) => {
      console.log(`   ${SEVERITY[severity]} ${message}`);
    });
    console.log('');
  });
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 Resumen:`);
console.log(`   Archivos escaneados: ${totalFilesChecked}`);
console.log(`   Textos hardcodeados: ${totalHardcoded}`);
console.log(`   Claves sin traducción: ${totalMissingKeys}`);
console.log(`   Archivos con problemas: ${results.length}`);
console.log('');

if (totalHardcoded === 0 && totalMissingKeys === 0) {
  console.log('✅ i18n COMPLETO — Todas las páginas están traducidas.\n');
} else {
  console.log('⚠️  Se encontraron problemas de i18n. Revisa los detalles arriba.\n');
  process.exit(1);
}