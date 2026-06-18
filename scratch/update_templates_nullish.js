const fs = require('fs');
const path = require('path');

const templatesDir = 'c:/Users/malle/OneDrive/Desktop/vendor/vendor-website-builder/client/src/components/editor/templates';
const templates = fs.readdirSync(templatesDir).filter(f => f.startsWith('Template') && f.endsWith('.jsx'));

for (const file of templates) {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace fallback operators
  content = content.replace(
    /const businessName = config\.navbar\?\.logoText \|\| website\?\.storeInfo\?\.businessName \|\| business\?\.businessName \|\| '([^']+)'/g,
    "const businessName = config.navbar?.logoText || website?.storeInfo?.businessName ?? business?.businessName ?? '$1'"
  );
  
  content = content.replace(
    /const phoneNumber = website\?\.storeInfo\?\.contact\?\.phone \|\| business\?\.contact\?\.phone \|\| business\?\.phone \|\| ''/g,
    "const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? ''"
  );
  
  content = content.replace(
    /const email = website\?\.storeInfo\?\.contact\?\.email \|\| business\?\.contact\?\.email \|\| business\?\.email \|\| ''/g,
    "const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? ''"
  );
  
  content = content.replace(
    /const address = website\?\.storeInfo\?\.location\?\.address \|\| business\?\.location\?\.address \|\| business\?\.address \|\| ''/g,
    "const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? ''"
  );

  fs.writeFileSync(filePath, content);
}

console.log('Templates updated with nullish coalescing!');
