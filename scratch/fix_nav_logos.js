const fs = require('fs');
let content = fs.readFileSync('server/routes/aiRoutes.js', 'utf8');

content = content.replace(
  /\$\{buildLogoBlock\(businessData, primaryColor, accentColor\)\}\s*<div style="display:flex;align-items:center;gap:0\.75rem;">\s*\$\{buildLogoBlock\(businessData, primaryColor, accentColor\)\}\s*(<span[^>]*>\$\{storeName\}<\/span>)\s*<\/div>/g,
  "${buildLogoBlock(businessData, primaryColor, accentColor)}\n        $1"
);

fs.writeFileSync('server/routes/aiRoutes.js', content, 'utf8');
console.log('Fixed double logo block.');
