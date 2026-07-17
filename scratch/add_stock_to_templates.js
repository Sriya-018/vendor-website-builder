const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../client/src/components/editor/templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    const filePath = path.join(templatesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // We want to find occurrences of `onUpdateProduct(product._id || product.id, 'name', val)}`
    // Then find the NEXT `/>` and insert the stock div after it.
    
    const searchStr = "onUpdateProduct(product._id || product.id, 'name', val)}";
    let startIndex = 0;
    
    while (true) {
        const idx = content.indexOf(searchStr, startIndex);
        if (idx === -1) break;
        
        const closeIdx = content.indexOf('/>', idx);
        if (closeIdx !== -1) {
            // Check if we already injected stock right after this
            const insertPos = closeIdx + 2;
            const nextChars = content.substring(insertPos, insertPos + 100);
            if (!nextChars.includes('Stock:')) {
                const stockDiv = `\n                        <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>`;
                content = content.substring(0, insertPos) + stockDiv + content.substring(insertPos);
                changed = true;
                startIndex = insertPos + stockDiv.length;
            } else {
                startIndex = closeIdx + 2;
            }
        } else {
            startIndex = idx + searchStr.length;
        }
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});
console.log('Finished injecting stock display.');
