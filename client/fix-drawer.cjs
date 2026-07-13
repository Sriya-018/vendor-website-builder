const fs = require('fs');
const path = require('path');

const templatesPath = path.join(__dirname, 'src', 'pages', 'Templates.jsx');
let content = fs.readFileSync(templatesPath, 'utf8');

// Fix text colors for labels
content = content.replace(/text-slate-700 mb-2/g, 'text-slate-700 dark:text-slate-300 mb-2');

// Fix Store Name input
content = content.replace(/border-slate-300 dark:border-slate-700\/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-slate-200 bg-slate-50 dark:bg-\[\#09080E\] placeholder-slate-700/g, 'border-slate-300 dark:border-slate-700/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white bg-white dark:bg-[#09080E] placeholder-slate-400 dark:placeholder-slate-500');

// Fix Tagline, Phone, Email inputs
content = content.replace(/border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white font-medium/g, 'border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white bg-white dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 font-medium placeholder-slate-400 dark:placeholder-slate-500');

// Fix Store Address textarea (has focus:ring-indigo-500 and resize-none)
content = content.replace(/border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white font-medium resize-none/g, 'border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white bg-white dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 font-medium resize-none placeholder-slate-400 dark:placeholder-slate-500');

// Fix Social Media Section
content = content.replace(/border-t border-gray-200 pt-6 mt-4/g, 'border-t border-slate-200 dark:border-slate-800/60 pt-6 mt-4');
content = content.replace(/font-semibold text-gray-900 mb-4/g, 'font-semibold text-slate-900 dark:text-white mb-4');
content = content.replace(/text-gray-700 mb-2/g, 'text-slate-700 dark:text-slate-300 mb-2');

// Fix Social media input boxes
content = content.replace(/w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 text-sm/g, 'w-full border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 text-sm bg-white dark:bg-[#09080E] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500');

fs.writeFileSync(templatesPath, content, 'utf8');
console.log('Fixed drawer inputs in Templates.jsx');
