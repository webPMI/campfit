import fs from 'node:fs';
import path from 'node:path';

function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.astro') continue;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getFiles(filePath, fileList);
        } else if (
            filePath.endsWith('.ts') ||
            filePath.endsWith('.tsx') ||
            filePath.endsWith('.js') ||
            filePath.endsWith('.jsx') ||
            filePath.endsWith('.mjs') ||
            filePath.endsWith('.astro') ||
            filePath.endsWith('.md') ||
            filePath.endsWith('.css') ||
            filePath.endsWith('.json')
        ) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const rootDir = process.cwd();
const files = getFiles(rootDir);
let fixedCount = 0;

for (const filePath of files) {
    if (filePath.endsWith('fix-merge-conflicts.mjs')) continue;
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('<<<<<<<')) {
        console.log(`Fixing conflict in: ${path.relative(rootDir, filePath)}`);
        // Generic git conflict block replacement: keep top block before =======
        const regex = /<<<<<<<[^\n]*\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>>[^\n]*\r?\n?/g;
        const newContent = content.replace(regex, '$1');
        fs.writeFileSync(filePath, newContent, 'utf-8');
        fixedCount++;
    }
}

console.log(`✅ Cleaned remaining merge conflict markers in ${fixedCount} files.`);
