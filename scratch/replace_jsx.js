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
    
    // Replace ₹{product.price}
    if (/\$\{product\.price/.test(content)) {
        content = content.replace(/\$\{product\.price/g, '₹{product.price');
        changed = true;
    }
    
    // Replace ₹{total}
    if (/\$\{total/.test(content)) {
        content = content.replace(/\$\{total/g, '₹{total');
        changed = true;
    }
    
    // Replace ₹{cartTotal}
    if (/\$\{cartTotal/.test(content)) {
        content = content.replace(/\$\{cartTotal/g, '₹{cartTotal');
        changed = true;
    }
    
    // Replace ₹{item.price}
    if (/\$\{item\.price/.test(content)) {
        content = content.replace(/\$\{item\.price/g, '₹{item.price');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Updated', file);
    }
});
