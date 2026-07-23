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

    // Fix the broken hover classes from previous regex
    content = content.replace(/dark:hover:text-slate-900 dark:text-white/g, 'dark:hover:text-white');
    
    // Fix Dashboard.jsx specific
    content = content.replace(/dark:text-slate-600 dark:text-slate-400/g, 'dark:text-slate-400');
    
    // Fix WebsiteEditor.jsx specific
    content = content.replace(/dark:text-slate-600 dark:text-slate-400/g, 'dark:text-slate-400');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed buggy hover classes in ${file}`);
    }
});
