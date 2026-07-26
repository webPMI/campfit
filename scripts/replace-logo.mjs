import { readFileSync, writeFileSync, globSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..', 'src');
const files = globSync('**/*.astro', { cwd: ROOT });

let totalReplaced = 0;

for (const file of files) {
  if (file.includes('UILogoIcon')) continue;
  const fullPath = join(ROOT, file);
  let content = readFileSync(fullPath, 'utf-8');
  if (!content.includes('M15.59 14.37a6')) continue;

  const svgRegex = /<svg\s+([^>]*?)class="([^"]*?)"\s*([^>]*)>\s*<path[^>]*M15\.59[^>]*\/>\s*<\/svg>/gs;
  let replaced = false;

  content = content.replace(svgRegex, (match, beforeClass, cls) => {
    replaced = true;
    const sizeMatch = cls.match(/h-\d+\s+w-\d+/);
    const size = sizeMatch ? sizeMatch[0] : 'h-7 w-7';
    return `<UILogoIcon size="${size}" />`;
  });

  if (replaced) {
    if (!content.includes('UILogoIcon')) {
      content = `import UILogoIcon from '@/components/UILogoIcon.astro';\n` + content;
    }
    writeFileSync(fullPath, content, 'utf-8');
    totalReplaced++;
  }
}

console.log(`Replaced logo SVG in ${totalReplaced} files.`);