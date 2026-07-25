#!/usr/bin/env node

/**
 * i18n-find-missing.js - Busca textos hardcodeados que deberían usar t()
 * Versión Node.js multiplataforma
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Buscando textos hardcodeados...\n');

const PROJECT_ROOT = process.cwd();
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

let found = 0;

// Función para verificar si un texto es UI válido
function isUIText(text) {
  // Exclusiones
  if (text.length <= 2) return false;
  if (/^(console|debug|log|Debug|Log)/.test(text)) return false;
  if (/^(https?:\/\/|\/|#)/.test(text)) return false;
  if (/^[0-9]+$/.test(text)) return false;
  if (/^\{.*\}$/.test(text)) return false;
  if (/^(type|autocomplete|placeholder|name|id|class|href|src)=/.test(text)) return false;
  
  return true;
}

// Buscar en archivos .astro
console.log('📂 Buscando en archivos .astro...');
const astroFiles = findFiles(SRC_DIR, '.astro');

astroFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    // Buscar texto entre >text< que no usa t()
    if (line.includes('t(') || line.includes('// ')) return;
    
    const matches = line.match(/>[A-Za-z][A-Za-z0-9\s.,!?¿¡()'-]{3,}</g);
    if (matches) {
      matches.forEach(match => {
        const text = match.slice(1, -1);
        if (isUIText(text)) {
          const relativePath = path.relative(PROJECT_ROOT, file);
          console.log(`⚠️  ${relativePath}:${idx + 1}`);
          console.log(`   "${text}"\n`);
          found++;
        }
      });
    }
  });
});

// Buscar en archivos .ts (excluyendo tests)
console.log('📂 Buscando en archivos .ts...');
const tsFiles = findFiles(SRC_DIR, '.ts').filter(f => !f.includes('.test.ts'));

tsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    // Excluir imports, console.log, logger, t()
    if (line.includes('import ') || 
        line.includes('console.') || 
        line.includes('logger.') || 
        line.includes('t(') ||
        line.includes('// ')) {
      return;
    }
    
    // Buscar strings literales
    const matches = line.match(/['"][A-Za-z][A-Za-z0-9\s.,!?¿¡()'-]{3,}['"]/g);
    if (matches) {
      matches.forEach(match => {
        const text = match.slice(1, -1);
        if (isUIText(text)) {
          const relativePath = path.relative(PROJECT_ROOT, file);
          console.log(`⚠️  ${relativePath}:${idx + 1}`);
          console.log(`   "${text}"\n`);
          found++;
        }
      });
    }
  });
});

// Resumen
console.log('════════════════════════════════════════');
if (found === 0) {
  console.log('✅ No se encontraron textos hardcodeados');
  console.log('\n💡 Tip: Si encuentras falsos positivos, añade exclusiones en este script');
  process.exit(0);
} else {
  console.log(`⚠️  Textos hardcodeados detectados: ${found}`);
  console.log('\n📝 Acción requerida:');
  console.log('   1. Añadir traducción en src/i18n/translations.ts');
  console.log('   2. Reemplazar texto hardcodeado con {t(\'clave\')} o t(\'clave\')');
  console.log('   3. Ejecutar npm run i18n:validate para verificar');
  process.exit(1);
}

// Función auxiliar para encontrar archivos
function findFiles(dir, extension) {
  let results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
      results = results.concat(findFiles(fullPath, extension));
    } else if (stat.isFile() && item.endsWith(extension)) {
      results.push(fullPath);
    }
  });
  
  return results;
}