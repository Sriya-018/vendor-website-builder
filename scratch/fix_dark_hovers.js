const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, '../client/src');

function fixHoversInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Replace multiple instances of dark:hover:bg-slate-100 with a single dark:hover:bg-slate-700
  // e.g. "dark:hover:bg-slate-100 dark:hover:bg-slate-100" -> "dark:hover:bg-slate-700"
  content = content.replace(/(dark:hover:bg-slate-100\s*)+/g, 'dark:hover:bg-slate-700 ');
  
  // Clean up any double spaces that might have been introduced
  content = content.replace(/  +/g, ' ');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      fixHoversInFile(fullPath);
    }
  }
}

traverse(directory);
console.log('Done fixing hovers.');
