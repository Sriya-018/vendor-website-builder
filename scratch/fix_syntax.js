const fs = require('fs');
const path = require('path');

const templatesDir = 'c:/Users/malle/OneDrive/Desktop/vendor/vendor-website-builder/client/src/components/editor/templates';
const templates = fs.readdirSync(templatesDir).filter(f => f.startsWith('Template') && f.endsWith('.jsx'));

for (const file of templates) {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the syntax error by adding parentheses
  content = content.replace(
    /const businessName = config\.navbar\?\.logoText \|\| website\?\.storeInfo\?\.businessName \?\? business\?\.businessName \?\? '([^']+)'/g,
    "const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? '$1')"
  );

  fs.writeFileSync(filePath, content);
}

console.log('Templates syntax fixed!');
