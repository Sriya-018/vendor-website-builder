const fs = require('fs');

const file = './src/components/chatbot/AIChatModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Main wrapper
content = content.replace('bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-800', 'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200 dark:border-gray-800');

// 2. Header elements
content = content.replace('bg-slate-900/20 dark:bg-white/20', 'bg-white/20');
content = content.replace('text-slate-900 dark:text-white hover:bg-slate-900/20 dark:bg-white/20', 'text-white hover:bg-white/20');

// 3. Messages area
content = content.replace('flex-1 overflow-y-auto p-4 bg-gray-900 flex flex-col gap-4', 'flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-gray-900 flex flex-col gap-4');

// 4. Icons
content = content.replace("msg.role === 'user' ? 'bg-purple-900/50 text-purple-400' : 'bg-gray-800 text-purple-400'", "msg.role === 'user' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' : 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-transparent'");

// 5. Robot bubble
content = content.replace("'bg-gray-800 text-gray-100 border border-gray-700 rounded-tl-sm'", "'bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-100 border border-slate-200 dark:border-gray-700 rounded-tl-sm'");

// 6. Loading dots area
content = content.replace('w-8 h-8 rounded-full bg-gray-800 text-purple-400 flex items-center justify-center shrink-0', 'w-8 h-8 rounded-full bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-transparent flex items-center justify-center shrink-0');
content = content.replace('bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2', 'bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2');
content = content.replace(/bg-gray-400 rounded-full animate-bounce/g, 'bg-slate-400 dark:bg-gray-400 rounded-full animate-bounce');

// 7. Input area
content = content.replace('p-4 bg-gray-900 border-t border-gray-800 shrink-0', 'p-4 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 shrink-0');

// 8. Voice buttons
content = content.replace("'bg-red-900/50 text-red-400 animate-pulse'", "'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 animate-pulse'");
content = content.replace("'bg-gray-800 text-gray-400 hover:bg-gray-700'", "'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700'");

// 9. Input field
content = content.replace('flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-400', 'flex-1 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400');

fs.writeFileSync(file, content, 'utf8');
console.log('AIChatModal.jsx updated to support both light and dark themes.');
