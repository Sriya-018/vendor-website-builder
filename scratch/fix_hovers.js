const fs = require('fs');

function fixHover(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Fix hover:text-slate-200 without dark
    content = content.replace(/\bhover:text-slate-200\b(?!\s*dark:)/g, 'hover:text-slate-900 dark:hover:text-slate-200');
    
    // 2. Fix the buggy replacement I made in Dashboard.jsx
    content = content.replace(/text-purple-700 dark:text-purple-700 dark:text-purple-300/g, 'text-purple-700 dark:text-purple-300');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
}

const files = [
    './src/pages/Dashboard.jsx',
    './src/pages/Templates.jsx',
    './src/pages/WebsiteEditor.jsx',
    './src/components/editor/EditorControls.jsx'
];

files.forEach(fixHover);
