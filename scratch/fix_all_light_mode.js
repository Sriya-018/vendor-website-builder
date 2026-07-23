const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Fix "text-white" used without dark: prefix on non-colorful backgrounds.
    // We match className="... text-white ..."
    content = content.replace(/className=["'`{](.*?)["'`}]/gs, (match, classStr) => {
        let newClassStr = classStr;
        
        // If it contains text-white but no dark:text-white
        if (/\btext-white\b/.test(newClassStr) && !/\bdark:text-white\b/.test(newClassStr)) {
            // Check if background is dark in BOTH modes (e.g. bg-indigo-600, bg-purple-600, bg-black, bg-gray-900, bg-red-500)
            const hasDarkBgGlobally = /\bbg-(indigo|purple|pink|blue|green|red|amber|orange|black|slate-900|gray-900)-[56789]00\b/.test(newClassStr) || 
                                      /\bfrom-(indigo|purple|pink|blue|green|red|amber|orange|black|slate-900|gray-900)-[56789]00\b/.test(newClassStr) ||
                                      /\bbg-black\b/.test(newClassStr) ||
                                      /\btext-transparent\b/.test(newClassStr);
                                      
            if (!hasDarkBgGlobally) {
                // It's likely white text on a light background in light mode!
                // Replace text-white with text-slate-900 dark:text-white
                newClassStr = newClassStr.replace(/\btext-white\b/g, 'text-slate-900 dark:text-white');
            }
        }
        
        // 2. Fix text-slate-100 without dark:
        if (/\btext-slate-100\b/.test(newClassStr) && !/\bdark:text-slate-100\b/.test(newClassStr)) {
            newClassStr = newClassStr.replace(/\btext-slate-100\b/g, 'text-slate-800 dark:text-slate-100');
        }
        
        // 3. Fix text-slate-200 without dark:
        if (/\btext-slate-200\b/.test(newClassStr) && !/\bdark:text-slate-200\b/.test(newClassStr)) {
            newClassStr = newClassStr.replace(/\btext-slate-200\b/g, 'text-slate-800 dark:text-slate-200');
        }

        // 4. Fix text-slate-300 without dark:
        if (/\btext-slate-300\b/.test(newClassStr) && !/\bdark:text-slate-300\b/.test(newClassStr)) {
            newClassStr = newClassStr.replace(/\btext-slate-300\b/g, 'text-slate-700 dark:text-slate-300');
        }
        
        // 5. Fix hover:text-white without dark:hover:text-white
        if (/\bhover:text-white\b/.test(newClassStr) && !/\bdark:hover:text-white\b/.test(newClassStr)) {
            const hasDarkBgGlobally = /\bhover:bg-(indigo|purple|pink|blue|green|red|amber|orange|black|slate-900|gray-900)-[56789]00\b/.test(newClassStr);
            if (!hasDarkBgGlobally) {
                newClassStr = newClassStr.replace(/\bhover:text-white\b/g, 'hover:text-slate-900 dark:hover:text-white');
            }
        }
        
        // 6. Fix bg-white/5 or bg-white/10 without dark:
        if (/\bbg-white\/[0-9]+\b/.test(newClassStr) && !/\bdark:bg-white\//.test(newClassStr)) {
            newClassStr = newClassStr.replace(/\bbg-white\/([0-9]+)\b/g, 'bg-slate-900/$1 dark:bg-white/$1');
        }
        
        // 7. Fix border-white/10 without dark:
        if (/\bborder-white\/[0-9]+\b/.test(newClassStr) && !/\bdark:border-white\//.test(newClassStr)) {
            newClassStr = newClassStr.replace(/\bborder-white\/([0-9]+)\b/g, 'border-slate-900/$1 dark:border-white/$1');
        }

        // 8. Fix Map boxes in Dashboard (bg-slate-300 -> bg-slate-100 dark:bg-slate-800)
        if (/\bbg-slate-300\b/.test(newClassStr) && !/\bdark:bg-/.test(newClassStr)) {
            newClassStr = newClassStr.replace(/\bbg-slate-300\b/g, 'bg-slate-100 dark:bg-slate-800');
        }
        
        if (newClassStr !== classStr) {
            return match.replace(classStr, newClassStr);
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
