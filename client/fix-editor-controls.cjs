const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'editor', 'EditorControls.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// A helper to safely replace classes within strings
function replaceClass(source, target, replacement) {
  // Regex to match target as a whole word (so we don't replace inside another word)
  // And avoid replacing if the dark: variant is already there
  const regex = new RegExp(`(?<!dark:)\\b${target}\\b`, 'g');
  return source.replace(regex, replacement);
}

// Backgrounds
content = replaceClass(content, 'bg-white', 'bg-white dark:bg-[#09080E]');
content = replaceClass(content, 'bg-gray-50', 'bg-gray-50 dark:bg-[#13121A]');
content = replaceClass(content, 'bg-gray-100', 'bg-gray-100 dark:bg-[#1A1924]');

// Text colors
content = replaceClass(content, 'text-gray-900', 'text-gray-900 dark:text-white');
content = replaceClass(content, 'text-gray-800', 'text-gray-800 dark:text-slate-200');
content = replaceClass(content, 'text-gray-700', 'text-gray-700 dark:text-slate-300');
content = replaceClass(content, 'text-gray-600', 'text-gray-600 dark:text-slate-400');
content = replaceClass(content, 'text-gray-500', 'text-gray-500 dark:text-slate-400');
content = replaceClass(content, 'text-gray-400', 'text-gray-400 dark:text-slate-500');

// Borders
content = replaceClass(content, 'border-gray-100', 'border-gray-100 dark:border-slate-800/60');
content = replaceClass(content, 'border-gray-150', 'border-gray-150 dark:border-slate-700/60');
content = replaceClass(content, 'border-gray-200', 'border-gray-200 dark:border-slate-700/60');
content = replaceClass(content, 'border-gray-300', 'border-gray-300 dark:border-slate-600/60');

// Hovers
content = replaceClass(content, 'hover:bg-gray-50', 'hover:bg-gray-50 dark:hover:bg-[#13121A]');
content = replaceClass(content, 'hover:bg-gray-100', 'hover:bg-gray-100 dark:hover:bg-[#1A1924]');
content = replaceClass(content, 'hover:bg-gray-200', 'hover:bg-gray-200 dark:hover:bg-slate-800');
content = replaceClass(content, 'hover:border-gray-300', 'hover:border-gray-300 dark:hover:border-slate-500');

// Specific text colors
content = replaceClass(content, 'text-pink-900', 'text-pink-900 dark:text-pink-100');

// Input and Select specific background colors when they have bg-white or bg-gray-50.
// They've already been matched by the above background replacements.
// But we might need to add dark mode placeholder or focus colors.
content = replaceClass(content, 'focus:border-pink-500', 'focus:border-pink-500 dark:focus:border-pink-400');
content = replaceClass(content, 'focus:border-blue-500', 'focus:border-blue-500 dark:focus:border-blue-400');

// Fix specific bg gradient to white
content = replaceClass(content, 'to-white', 'to-white dark:to-[#09080E]');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed dark mode classes in EditorControls.jsx');
