const fs = require('fs');
const path = require('path');

const dirsToScan = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'components', 'dashboard')
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Function to inject dark classes into a class string
  const injectDarkClasses = (classStr) => {
    let newStr = classStr;
    
    // Backgrounds
    if (newStr.includes('bg-slate-50') && !newStr.includes('dark:bg-')) {
      newStr = newStr.replace(/bg-slate-50/g, 'bg-slate-50 dark:bg-[#09080E]');
    }
    if (newStr.includes('bg-white') && !newStr.includes('dark:bg-')) {
      newStr = newStr.replace(/bg-white/g, 'bg-white dark:bg-[#09080E]');
    }

    // Focus Backgrounds
    if (newStr.includes('focus:bg-white') && !newStr.includes('dark:focus:bg-')) {
      newStr = newStr.replace(/focus:bg-white/g, 'focus:bg-white dark:focus:bg-slate-900');
    }

    // Text colors
    if (newStr.includes('text-slate-900') && !newStr.includes('dark:text-')) {
      newStr = newStr.replace(/text-slate-900/g, 'text-slate-900 dark:text-white');
    }
    if (newStr.includes('text-slate-700') && !newStr.includes('dark:text-')) {
      newStr = newStr.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-300');
    }

    // Borders
    if (newStr.includes('border-slate-200') && !newStr.includes('dark:border-')) {
      newStr = newStr.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-700/60');
    }
    if (newStr.includes('border-slate-300') && !newStr.includes('dark:border-')) {
      newStr = newStr.replace(/border-slate-300/g, 'border-slate-300 dark:border-slate-700/60');
    }

    // Placeholders
    if (newStr.includes('placeholder-slate-400') && !newStr.includes('dark:placeholder-')) {
      newStr = newStr.replace(/placeholder-slate-400/g, 'placeholder-slate-400 dark:placeholder-slate-500');
    }

    // Fix bug where text-slate-200 was hardcoded for light mode
    newStr = newStr.replace(/text-slate-200(?!\s*dark:)/g, 'text-slate-900 dark:text-slate-200');

    return newStr;
  };

  // Regex to find className="..." inside input, textarea, select
  const tagRegex = /<(input|textarea|select)([^>]+)className=["']([^"']+)["']/g;
  
  content = content.replace(tagRegex, (match, tag, before, classStr) => {
    const newClassStr = injectDarkClasses(classStr);
    return `<${tag}${before}className="${newClassStr}"`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed inputs in: ' + path.basename(filePath));
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

dirsToScan.forEach(walkDir);
