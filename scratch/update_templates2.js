const fs = require('fs');
const path = require('path');

const templatesDir = 'c:/Users/malle/OneDrive/Desktop/vendor/vendor-website-builder/client/src/components/editor/templates';

const templates = fs.readdirSync(templatesDir).filter(f => f.startsWith('Template') && f.endsWith('.jsx'));

for (const file of templates) {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    /const businessName = config\.navbar\.logoText \|\| business\?\.businessName \|\| 'My Store';/g,
    "const businessName = config.navbar?.logoText || website?.storeInfo?.businessName || business?.businessName || 'My Store';"
  );
  
  content = content.replace(
    /const businessName = config\.navbar\?\.logoText \|\| business\?\.businessName \|\| 'My Store';/g,
    "const businessName = config.navbar?.logoText || website?.storeInfo?.businessName || business?.businessName || 'My Store';"
  );

  fs.writeFileSync(filePath, content);
}

console.log('Templates updated successfully!');
