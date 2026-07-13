const fs = require('fs');
const path = require('path');

const dirs = ['src/components/dashboard', 'src/pages'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Backgrounds
  content = content.replace(/bg-\[\#13121A\]/g, 'bg-white dark:bg-[#13121A]');
  content = content.replace(/bg-\[\#0D0C14\]/g, 'bg-white dark:bg-[#0D0C14]');
  content = content.replace(/bg-\[\#09080E\]/g, 'bg-slate-50 dark:bg-[#09080E]');
  content = content.replace(/bg-\[\#161424\]/g, 'bg-slate-50 dark:bg-[#161424]');
  content = content.replace(/bg-\[\#181720\]/g, 'bg-slate-100 dark:bg-[#181720]');

  // Borders
  content = content.replace(/border-slate-800\/60/g, 'border-slate-200 dark:border-slate-800/60');
  content = content.replace(/border-slate-800\/80/g, 'border-slate-200 dark:border-slate-800/80');
  content = content.replace(/border-slate-800/g, 'border-slate-200 dark:border-slate-800');
  content = content.replace(/border-slate-700\/60/g, 'border-slate-300 dark:border-slate-700/60');
  content = content.replace(/border-slate-700/g, 'border-slate-300 dark:border-slate-700');
  content = content.replace(/border-slate-850/g, 'border-slate-200 dark:border-slate-850');
  
  // Text colors
  content = content.replace(/text-slate-300/g, 'text-slate-700 dark:text-slate-300');
  content = content.replace(/text-slate-400/g, 'text-slate-600 dark:text-slate-400');
  content = content.replace(/text-slate-450/g, 'text-slate-600 dark:text-slate-450');
  content = content.replace(/text-slate-500/g, 'text-slate-600 dark:text-slate-500');

  // Some common text-white replacements outside of buttons
  // text-white mb-
  content = content.replace(/text-white mb-/g, 'text-slate-900 dark:text-white mb-');
  // text-white mt-
  content = content.replace(/text-white mt-/g, 'text-slate-900 dark:text-white mt-');
  // font-bold text-white
  content = content.replace(/font-bold text-white/g, 'font-bold text-slate-900 dark:text-white');
  // font-extrabold text-white
  content = content.replace(/font-extrabold text-white/g, 'font-extrabold text-slate-900 dark:text-white');
  
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
