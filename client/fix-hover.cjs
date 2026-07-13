const fs = require('fs');
const path = require('path');

const dirs = ['src/components/dashboard', 'src/pages'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Fix duplicate borders created by previous script
  content = content.replace(/border-slate-200 dark:border-slate-200 dark:border-slate-800\/60/g, 'border-slate-200 dark:border-slate-800/60');
  content = content.replace(/border-slate-200 dark:border-slate-200 dark:border-slate-800/g, 'border-slate-200 dark:border-slate-800');
  content = content.replace(/border-slate-300 dark:border-slate-300 dark:border-slate-700\/60/g, 'border-slate-300 dark:border-slate-700/60');
  content = content.replace(/border-slate-300 dark:border-slate-300 dark:border-slate-700/g, 'border-slate-300 dark:border-slate-700');

  // Fix table headers and hovers
  content = content.replace(/bg-slate-900\/60/g, 'bg-slate-100 dark:bg-slate-900/60');
  content = content.replace(/hover:bg-slate-800\/20/g, 'hover:bg-slate-50 dark:hover:bg-slate-800/20');
  content = content.replace(/hover:bg-slate-800\/60/g, 'hover:bg-slate-100 dark:hover:bg-slate-800/60');
  content = content.replace(/hover:bg-slate-800/g, 'hover:bg-slate-100 dark:hover:bg-slate-800');
  content = content.replace(/bg-slate-800/g, 'bg-slate-100 dark:bg-slate-800');
  // Avoid replacing bg-slate-100 dark:bg-slate-800 when we just created it
  
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

dirs.forEach(walkDir);
