const fs = require('fs');
const path = require('path');

const dir = './src/components/dashboard';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Tab.jsx')).map(f => path.join(dir, f));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix bg-slate-900/40 that doesn't have dark:
    content = content.replace(/\bbg-slate-900\/40\b(?!\s*dark:)/g, 'bg-slate-100 dark:bg-slate-900/40');
    
    // Some lines might now have 'dark:bg-slate-100 dark:bg-slate-900/40' if I ran it carelessly, let's fix that just in case:
    content = content.replace(/bg-slate-100 dark:bg-slate-100 dark:bg-slate-900\/40/g, 'bg-slate-100 dark:bg-slate-900/40');

    // Also fix the duplicate dark:bg-slate-100 dark:bg-slate-900/60 in BrandAssetsTab
    content = content.replace(/dark:bg-slate-100 dark:bg-slate-900\/60/g, 'dark:bg-slate-900/60');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
});
