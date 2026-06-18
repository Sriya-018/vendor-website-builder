const fs = require('fs');
const content = fs.readFileSync('server/routes/aiRoutes.js', 'utf8');
const lines = content.split('\n');

let inNav = false;
let replacedCount = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<nav')) {
    inNav = true;
  }
  if (lines[i].includes('</nav>')) {
    inNav = false;
  }
  
  if (inNav && lines[i].includes('${storeName}') && !lines[i].includes('buildLogoBlock')) {
    const match = lines[i].match(/^(\s*)/);
    const indent = match ? match[1] : '';
    
    lines[i] = `${indent}<div style="display:flex;align-items:center;gap:0.75rem;">\n${indent}  \${buildLogoBlock(businessData, primaryColor, accentColor)}\n${lines[i]}\n${indent}</div>`;
    replacedCount++;
  }
}

fs.writeFileSync('server/routes/aiRoutes.js', lines.join('\n'), 'utf8');
console.log(`Replaced ${replacedCount} storeName occurrences with logo block.`);
