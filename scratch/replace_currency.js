const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/malle/OneDrive/Desktop/vendor/vendor-website-builder');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    // Replace ₹${...}
    if (content.includes('$$'+'{')) {
        content = content.replace(/\$\$\{/g, '₹${');
        changed = true;
    }
    
    // Replace $ followed by digits
    if (/\$(\d+)/.test(content)) {
        content = content.replace(/\$(\d+)/g, '₹₹1');
        changed = true;
    }
    
    // Extra case: ₹{product.price.toFixed(2)} - in some templates like TemplateVogue.jsx
    // Sometimes it's like `₹{product.price...}` without the leading $.
    // Wait, let's look at TemplateVogue.jsx:
    //  ₹{product.price.toFixed(2)}
    // Wait, the $ was the currency symbol, but if it is inside template literal, it doesn't print $.
    // Let me check TemplateVogue.jsx: it had "                    ₹{product.price.toFixed(2)}"
    // If it's literally ₹{product.price.toFixed(2)} (with leading space), wait: template literals format is `${var}`.
    // If it wants to print `$` followed by the price, it would be `₹₹{product.price.toFixed(2)}`.
    // Let's replace `₹${` with `₹${`! That is already covered.
    
    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Updated', file);
    }
});
