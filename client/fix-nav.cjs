const fs = require('fs');
const path = require('path');

const filesToFix = [
  path.join(__dirname, 'src', 'pages', 'Landing.jsx'),
  path.join(__dirname, 'src', 'pages', 'Templates.jsx'),
  path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx'),
];

for (const filePath of filesToFix) {
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Fix generic hover text in nav bars and footers
  content = content.replace(/text-slate-600 dark:text-slate-400 hover:text-white/g, 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white');
  
  // Fix mobile menu hover classes
  content = content.replace(/text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-850/g, 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed nav links in: ' + path.basename(filePath));
  }
}
