const fs = require('fs');
const path = require('path');

const dir = 'src/components/dashboard';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/font-medium text-white/g, 'font-medium text-slate-900 dark:text-white');
  content = content.replace(/font-semibold text-white/g, 'font-semibold text-slate-900 dark:text-white');
  content = content.replace(/text-slate-350/g, 'text-slate-600 dark:text-slate-400');
  content = content.replace(/hover:text-slate-350/g, 'hover:text-slate-600 dark:hover:text-slate-400');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(dir);
