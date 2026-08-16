import fs from 'fs';

function dedupLocale(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');

  const header = content.slice(0, firstBrace + 1);
  const body = content.slice(firstBrace + 1, lastBrace);
  const footer = content.slice(lastBrace);

  const lines = body.split('\n');
  const seen = new Set();
  const cleanLines = [];

  for (const line of lines) {
    const match = line.match(/^\s*["']([^"']+)["']\s*:/);
    if (match) {
      const key = match[1];
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
    }
    cleanLines.push(line);
  }

  const newContent = `${header}\n${cleanLines.join('\n')}\n${footer}`;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Deduplicated ${filePath}, total unique keys: ${seen.size}`);
}

dedupLocale('src/i18n/locales/es.ts');
dedupLocale('src/i18n/locales/en.ts');
dedupLocale('src/i18n/locales/ca.ts');
