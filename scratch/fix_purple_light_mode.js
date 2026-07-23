const fs = require('fs');

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix light text/bg combinations in active tabs and badges
    
    // Dashboard sidebar active tab
    content = content.replace(
        /'bg-purple-600\/20 text-purple-300 border border-purple-500\/30 shadow-sm shadow-purple-500\/10'/g,
        "'bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 shadow-sm shadow-purple-500/10'"
    );

    // Text purple 300, 400, indigo 400
    content = content.replace(/\btext-purple-300\b(?!\s*dark:)/g, 'text-purple-700 dark:text-purple-300');
    content = content.replace(/\btext-purple-400\b(?!\s*dark:)/g, 'text-purple-700 dark:text-purple-400');
    content = content.replace(/\btext-indigo-400\b(?!\s*dark:)/g, 'text-indigo-700 dark:text-indigo-400');
    content = content.replace(/\btext-amber-400\b(?!\s*dark:)/g, 'text-amber-600 dark:text-amber-400');
    
    // Fix Landing.jsx badges like bg-purple-950/50
    content = content.replace(/\bbg-purple-950\/[0-9]+\b/g, (match) => {
        return 'bg-purple-100 dark:' + match;
    });
    content = content.replace(/\bbg-indigo-950\/[0-9]+\b/g, (match) => {
        return 'bg-indigo-100 dark:' + match;
    });

    // Fix borders on badges
    content = content.replace(/\bborder-purple-500\/20\b/g, 'border-purple-300 dark:border-purple-500/20');
    content = content.replace(/\bborder-indigo-500\/20\b/g, 'border-indigo-300 dark:border-indigo-500/20');
    
    // Fix background of cards if they have a white bg in light mode but white text inside
    // Look for text-slate-450 which doesn't exist and make it text-slate-600 dark:text-slate-400
    content = content.replace(/\btext-slate-450\b/g, 'text-slate-600 dark:text-slate-400');
    
    // Fix hover texts
    content = content.replace(/\bhover:text-indigo-400\b/g, 'hover:text-indigo-700 dark:hover:text-indigo-400');
    content = content.replace(/\bhover:text-purple-400\b/g, 'hover:text-purple-700 dark:hover:text-purple-400');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
}

const files = [
    './src/pages/Dashboard.jsx',
    './src/pages/Landing.jsx',
    './src/pages/Templates.jsx',
    './src/pages/WebsiteEditor.jsx',
    './src/components/editor/EditorControls.jsx',
    './src/components/dashboard/AnalyticsTab.jsx',
    './src/components/dashboard/ProductsTab.jsx'
];

files.forEach(fixFile);
