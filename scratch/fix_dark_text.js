const fs = require('fs');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix double dark classes that caused text to be invisible in dark mode
    content = content.replace(/dark:text-slate-800 dark:text-slate-200/g, 'dark:text-slate-200');
    
    // Check for any other similar anomalies just in case
    content = content.replace(/dark:text-slate-900 dark:text-slate-200/g, 'dark:text-slate-200');
    content = content.replace(/dark:text-slate-900 dark:text-slate-300/g, 'dark:text-slate-300');
    content = content.replace(/dark:text-slate-900 dark:text-white/g, 'dark:text-white');
    content = content.replace(/dark:text-slate-800 dark:text-white/g, 'dark:text-white');
    content = content.replace(/dark:text-slate-850 dark:text-white/g, 'dark:text-white');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed buggy text classes in ${file}`);
    }
});
