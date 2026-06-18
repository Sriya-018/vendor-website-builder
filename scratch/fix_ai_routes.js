const fs = require('fs');
const path = require('path');

const targetFile = 'c:/Users/malle/OneDrive/Desktop/vendor/vendor-website-builder/server/routes/aiRoutes.js';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Insert `const storeName = businessData.storeName || businessName;`
content = content.replace(/(const businessName = businessData\.businessName \|\| [^;]+;)/g, '$1\n  const storeName = businessData.storeName || businessName;');

// 2. We need to replace `${businessName}` with `${storeName}` in the HTML, but keep the navbar.
let newContent = '';
let index = 0;
while(true) {
  let nextReturn = content.indexOf('return `<!DOCTYPE html>', index);
  if (nextReturn === -1) {
    newContent += content.slice(index);
    break;
  }
  
  // Add everything up to the template start
  newContent += content.slice(index, nextReturn + 23); // length of 'return `<!DOCTYPE html>'
  index = nextReturn + 23;
  
  let templateEnd = content.indexOf('`;', index);
  if (templateEnd === -1) {
    newContent += content.slice(index);
    break;
  }
  
  let templateBody = content.slice(index, templateEnd);
  
  // Replace all ${businessName} with ${storeName}
  templateBody = templateBody.replace(/\$\{businessName\}/g, '${storeName}');
  
  // Replace the first ${storeName} back to ${businessName}
  templateBody = templateBody.replace('${storeName}', '${businessName}');
  
  newContent += templateBody;
  index = templateEnd;
}

fs.writeFileSync(targetFile, newContent);
console.log('Fixed aiRoutes.js');
