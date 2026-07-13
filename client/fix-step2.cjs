const fs = require('fs');
const path = require('path');

const templatesPath = path.join(__dirname, 'src', 'pages', 'Templates.jsx');
let content = fs.readFileSync(templatesPath, 'utf8');

// Step 2 Header
content = content.replace(/text-gray-900">Add Products<\/h3>/g, 'text-slate-900 dark:text-white">Add Products</h3>');
content = content.replace(/text-gray-500 mt-1 text-sm">Add products to your catalog/g, 'text-slate-600 dark:text-slate-400 mt-1 text-sm">Add products to your catalog');

// Add Product Box
content = content.replace(/bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-0/g, 'bg-gradient-to-br from-slate-50 to-white dark:from-[#09080E] dark:to-[#13121A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm sticky top-0');
content = content.replace(/font-bold text-slate-900 mb-4 flex items-center gap-2/g, 'font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2');

// Voice / Camera / Upload Buttons
content = content.replace(/bg-white border-2 border-dashed border-slate-250/g, 'bg-white dark:bg-[#13121A] border-2 border-dashed border-slate-250 dark:border-slate-700/60');
content = content.replace(/text-gray-400 mx-auto mb-1/g, 'text-slate-400 dark:text-slate-500 mx-auto mb-1');

// Form Inputs
// They all use 'border border-slate-200 bg-slate-50'
const inputTargetStr1 = 'w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold';
const inputTargetStr2 = 'w-full border border-slate-200 bg-slate-50 rounded-xl pl-7 pr-3 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold';
const inputTargetStr3 = 'w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold';
const inputTargetStr4 = 'w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold resize-none';

const inputReplacement1 = 'w-full border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#13121A] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500';
const inputReplacement2 = 'w-full border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#13121A] rounded-xl pl-7 pr-3 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500';
const inputReplacement3 = 'w-full border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#13121A] rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500';
const inputReplacement4 = 'w-full border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#13121A] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold resize-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500';

content = content.replace(inputTargetStr1, inputReplacement1);
content = content.replace(inputTargetStr2, inputReplacement2);
content = content.replace(inputTargetStr3, inputReplacement3);
content = content.replace(inputTargetStr4, inputReplacement4);

content = content.replace(/bg-gray-900 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-colors/g, 'bg-slate-900 dark:bg-purple-600 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-purple-700 disabled:opacity-50 transition-colors');

// Right Column - Your Products Box
content = content.replace(/bg-slate-50 rounded-2xl p-5 border border-slate-200/g, 'bg-slate-50 dark:bg-[#09080E] rounded-2xl p-5 border border-slate-200 dark:border-slate-800/60');
content = content.replace(/border-b border-slate-200">/g, 'border-b border-slate-200 dark:border-slate-800/60">');
content = content.replace(/font-bold text-slate-900">Your Products<\/h4>/g, 'font-bold text-slate-900 dark:text-white">Your Products</h4>');

content = content.replace(/bg-purple-50 text-purple-750 px-3 py-1 rounded-full font-bold/g, 'bg-purple-50 dark:bg-purple-500/10 text-purple-750 dark:text-purple-400 px-3 py-1 rounded-full font-bold');

// Empty State
content = content.replace(/border-dashed border-slate-200 rounded-2xl bg-white/g, 'border-dashed border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white dark:bg-[#13121A]');

fs.writeFileSync(templatesPath, content, 'utf8');
console.log('Fixed Step 2 inputs in Templates.jsx');
