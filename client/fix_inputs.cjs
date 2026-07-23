const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changedFiles = [];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let originalContent = content;

  // Replace text-white and text-slate-200 with appropriate dark-mode aware classes in inputs, textareas, and selects
  // We use a simpler regex and process match by match to avoid complex regex
  const regex = /<(input|textarea|select)[^>]*?className=(["'`\{])([^>]*?)(["'`\}])[^>]*?>/g;
  
  content = content.replace(regex, (match, tag, q1, classes, q2) => {
    let newClasses = classes;
    if (newClasses.includes('text-white') && !newClasses.includes('dark:text-white')) {
        newClasses = newClasses.replace(/\btext-white\b/g, 'text-slate-900 dark:text-white');
    }
    if (newClasses.includes('text-slate-200') && !newClasses.includes('dark:text-slate-200')) {
        newClasses = newClasses.replace(/\btext-slate-200\b/g, 'text-slate-900 dark:text-slate-200');
    }
    if (newClasses.includes('text-slate-300') && !newClasses.includes('dark:text-slate-300')) {
        newClasses = newClasses.replace(/\btext-slate-300\b/g, 'text-slate-900 dark:text-slate-300');
    }
    
    // Some buttons etc.
    return match.replace(classes, newClasses);
  });

  if (content !== originalContent) {
    fs.writeFileSync(f, content);
    changedFiles.push(f);
  }
});

console.log('Changed files:', changedFiles.join(', '));
