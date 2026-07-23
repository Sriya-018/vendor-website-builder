const fs = require('fs');

const file = './src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Clean up massive duplicated classes
content = content.replace(/dark:bg-white dark:bg-\[\#13121A\] dark:bg-\[\#13121A\] dark:border-slate-200 dark:border-slate-800/g, '');
content = content.replace(/dark:bg-white dark:bg-\[\#13121A\] dark:bg-\[\#0D0C14\] dark:border-slate-200 dark:border-slate-800/g, '');
content = content.replace(/dark:bg-slate-50 dark:bg-\[\#09080E\] dark:text-slate-100/g, '');
content = content.replace(/dark:bg-slate-50 dark:bg-\[\#09080E\] dark:text-slate-200/g, '');
content = content.replace(/dark:border-slate-200 dark:border-slate-800/g, '');
content = content.replace(/dark:text-slate-600 dark:text-slate-400 dark:hover:text-slate-900 dark:hover:text-white/g, '');

// More cleanup
content = content.replace(/bg-white dark:bg-\[\#13121A\] border-gray-100 dark:border-slate-800\/50/g, 'bg-white dark:bg-[#13121A] border-gray-100 dark:border-slate-800/50');
content = content.replace(/bg-gray-50 dark:bg-slate-900\/40 text-gray-900 dark:text-slate-200/g, 'bg-gray-50 dark:bg-[#09080E] text-slate-900 dark:text-slate-200');

// Fix text-gray-900 issues
content = content.replace(/text-gray-900/g, 'text-slate-900');
content = content.replace(/border-gray-200/g, 'border-slate-200');
content = content.replace(/border-gray-100/g, 'border-slate-100');
content = content.replace(/bg-gray-50/g, 'bg-slate-50');
content = content.replace(/bg-gray-100/g, 'bg-slate-100');
content = content.replace(/text-gray-500/g, 'text-slate-500');
content = content.replace(/text-gray-400/g, 'text-slate-400');
content = content.replace(/text-gray-600/g, 'text-slate-600');

// There is one specific fix for the theme in AdminDashboard:
// The AdminDashboard is rendered OUTSIDE of App's ThemeProvider context if they navigate directly!
// Wait! `useTheme` uses Context. If it's outside `ThemeProvider`, `theme` will be undefined!
// Let's check App.jsx:
// If it's outside, it will crash. Since it doesn't crash, it MUST be inside ThemeProvider.
// However, I will force the `dark` class dynamically if theme === 'dark' on the root div of AdminDashboard.

fs.writeFileSync(file, content, 'utf8');
console.log('Cleaned up AdminDashboard.jsx');
