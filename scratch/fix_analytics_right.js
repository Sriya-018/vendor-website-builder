const fs = require('fs');
const file = './src/components/dashboard/AnalyticsTab.jsx';

let content = fs.readFileSync(file, 'utf8');

// 1. Chart Toggles (Emerald & Indigo)
content = content.replace(
    /'bg-emerald-600\/20 border border-emerald-500\/30 text-emerald-300'/g,
    "'bg-emerald-100 dark:bg-emerald-600/20 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'"
);
content = content.replace(
    /'bg-indigo-600\/20 border border-indigo-500\/30 text-indigo-300'/g,
    "'bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300'"
);

// 2. Chart Tooltips & Values
content = content.replace(/\btext-emerald-400\b/g, 'text-emerald-700 dark:text-emerald-400');
content = content.replace(/absolute bg-slate-900 border border-slate-300/g, 'absolute bg-white dark:bg-slate-900 border border-slate-300');

// 3. Map & Chart Backgrounds (dirty grey in light mode)
content = content.replace(/\bbg-slate-950\/20\b/g, 'bg-slate-50 dark:bg-slate-950/20');

// 4. Map List Items active/inactive
// Active: 'border-indigo-600 bg-indigo-50/10 text-white shadow-sm'
content = content.replace(
    /'border-indigo-600 bg-indigo-50\/10 text-white shadow-sm'/g,
    "'border-indigo-400 dark:border-indigo-600 bg-indigo-100 dark:bg-indigo-50/10 text-indigo-700 dark:text-white shadow-sm'"
);

// Inactive: bg-slate-900/40
content = content.replace(
    /'border-slate-200 dark:border-slate-800 hover:border-slate-750 bg-slate-900\/40 /g,
    "'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-100 dark:bg-slate-900/40 "
);

// 5. Funnel Insight Alert
content = content.replace(
    /bg-indigo-100 dark:bg-indigo-950\/20 border border-indigo-900\/30 rounded-xl text-\[11px\] text-indigo-300/g,
    "bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 rounded-xl text-[11px] text-indigo-700 dark:text-indigo-300"
);

// 6. Fix any duplicated dark:text-slate-600 dark:text-slate-400
content = content.replace(/text-slate-700 dark:text-slate-700 dark:text-slate-300/g, 'text-slate-700 dark:text-slate-300');
content = content.replace(/text-slate-600 dark:text-slate-600 dark:text-slate-400/g, 'text-slate-600 dark:text-slate-400');
content = content.replace(/hover:border-slate-750/g, 'hover:border-slate-300 dark:hover:border-slate-700');


fs.writeFileSync(file, content, 'utf8');
console.log('AnalyticsTab.jsx fixed for right side.');
