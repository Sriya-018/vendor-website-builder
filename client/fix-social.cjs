const fs = require('fs');
const path = require('path');

const templatesPath = path.join(__dirname, 'src', 'pages', 'Templates.jsx');
let content = fs.readFileSync(templatesPath, 'utf8');

// Fix the exact string used in WhatsApp, Instagram, Facebook, Twitter
const targetStr = 'w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none';
const replacementStr = 'w-full border border-slate-300 dark:border-slate-700/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white dark:bg-[#09080E] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500';

content = content.split(targetStr).join(replacementStr);

// Also fix the Store Logo input which might be different
// Let's also do a regex just in case
content = content.replace(/border-gray-300 rounded-xl px-4 py-3/g, 'border-slate-300 dark:border-slate-700/60 rounded-xl px-4 py-3 bg-white dark:bg-[#09080E] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500');

// Fix text-gray-500 helper texts
content = content.replace(/text-xs text-gray-500/g, 'text-xs text-slate-600 dark:text-slate-500');

fs.writeFileSync(templatesPath, content, 'utf8');
console.log('Fixed social inputs in Templates.jsx');
