const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../client/src/components/editor/templates');
const templates = fs.readdirSync(templatesDir).filter(f => f.startsWith('Template') && f.endsWith('.jsx'));

for (const file of templates) {
  const filePath = path.join(templatesDir, file);
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');

  let newLines = [];
  let i = 0;
  
  while (i < lines.length) {
    // Check if this line has the price value
    if (lines[i].includes('value={String(product.price)}')) {
      // Find the start of this block by going backwards
      let startIdx = i;
      while (startIdx >= 0 && !lines[startIdx].includes('<div') && !lines[startIdx].includes('<p')) {
        startIdx--;
      }
      
      // If we haven't wrapped it already
      if (startIdx >= 0 && !newLines[newLines.length - (i - startIdx)].includes('config.products?.showPrices !== false')) {
        // Insert wrapper start
        newLines.splice(newLines.length - (i - startIdx), 0, lines[startIdx].replace(/<[A-Za-z]+.*/, '') + '{config.products?.showPrices !== false && (');
        
        // Find the matching closing tag
        let openCount = 0;
        let endIdx = startIdx;
        let tagType = lines[startIdx].includes('<div') ? 'div' : 'p';
        
        while (endIdx < lines.length) {
          const lineStr = lines[endIdx];
          const opens = (lineStr.match(new RegExp(`<${tagType}[\\s>]`, 'g')) || []).length;
          const closes = (lineStr.match(new RegExp(`</${tagType}>`, 'g')) || []).length;
          openCount += (opens - closes);
          
          if (openCount === 0) {
            break;
          }
          endIdx++;
        }
        
        // We will push lines until endIdx
        while (i <= endIdx) {
          newLines.push(lines[i]);
          i++;
        }
        
        // Insert wrapper end
        newLines.push(lines[endIdx].replace(/<\/[A-Za-z]+>.*/, '') + ')}');
        continue;
      }
    }
    
    // Check for add to cart
    if (lines[i].includes('data-cart-add')) {
      let startIdx = i;
      while (startIdx >= 0 && !lines[startIdx].includes('<button') && !lines[startIdx].includes('<a')) {
        startIdx--;
      }
      
      if (startIdx >= 0 && !newLines[newLines.length - (i - startIdx)].includes('config.products?.showAddToCart !== false')) {
        // Insert wrapper start
        newLines.splice(newLines.length - (i - startIdx), 0, lines[startIdx].replace(/<[A-Za-z]+.*/, '') + '{config.products?.showAddToCart !== false && (');
        
        let tagType = lines[startIdx].includes('<button') ? 'button' : 'a';
        let openCount = 0;
        let endIdx = startIdx;
        
        while (endIdx < lines.length) {
          const lineStr = lines[endIdx];
          const opens = (lineStr.match(new RegExp(`<${tagType}[\\s>]`, 'g')) || []).length;
          const closes = (lineStr.match(new RegExp(`</${tagType}>`, 'g')) || []).length;
          openCount += (opens - closes);
          
          if (openCount === 0) {
            break;
          }
          endIdx++;
        }
        
        while (i <= endIdx) {
          newLines.push(lines[i]);
          i++;
        }
        
        newLines.push(lines[endIdx].replace(/<\/[A-Za-z]+>.*/, '') + ')}');
        continue;
      }
    }
    
    newLines.push(lines[i]);
    i++;
  }

  // Also replace object-cover with config.products?.hoverEffect
  let finalContent = newLines.join('\n');
  
  fs.writeFileSync(filePath, finalContent);
}

console.log('Product cards updated successfully!');
