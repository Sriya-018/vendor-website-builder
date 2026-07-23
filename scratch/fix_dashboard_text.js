const fs = require('fs');

function processFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace text-slate-400 with text-slate-600 dark:text-slate-400 if it doesn't already have dark:
    content = content.replace(/\btext-slate-400\b(?!\s*dark:)/g, 'text-slate-600 dark:text-slate-400');
    // Replace text-slate-300
    content = content.replace(/\btext-slate-300\b(?!\s*dark:)/g, 'text-slate-700 dark:text-slate-300');
    // Replace text-slate-200
    content = content.replace(/\btext-slate-200\b(?!\s*dark:)/g, 'text-slate-800 dark:text-slate-200');
    
    // We should be careful about text-white because it's often on primary buttons (bg-indigo-600 text-white).
    // So we'll skip text-white here to be safe.

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}

const files = [
    './src/pages/WebsiteEditor.jsx',
    './src/components/editor/EditorControls.jsx',
    './src/components/dashboard/AnalyticsTab.jsx',
    './src/components/dashboard/AccountSettingsTab.jsx',
    './src/components/dashboard/OrdersTab.jsx',
    './src/components/dashboard/ProductsTab.jsx'
];

files.forEach(f => {
    if (fs.existsSync(f)) {
        processFile(f);
    }
});
