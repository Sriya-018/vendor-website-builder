const fs = require('fs');
const path = require('path');

const templatesDir = 'c:/Users/malle/OneDrive/Desktop/vendor/vendor-website-builder/client/src/components/editor/templates';

const templates = fs.readdirSync(templatesDir).filter(f => f.startsWith('Template') && f.endsWith('.jsx'));

for (let template of templates) {
  const filePath = path.join(templatesDir, template);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace phoneNumber
  content = content.replace(
    /const phoneNumber = [^;]+;/,
    "const phoneNumber = website?.storeInfo?.contact?.phone || business?.contact?.phone || business?.phone || '';"
  );

  // Replace email
  content = content.replace(
    /const email = [^;]+;/,
    "const email = website?.storeInfo?.contact?.email || business?.contact?.email || business?.email || '';"
  );

  // Replace address
  content = content.replace(
    /const address = [^;]+;/,
    "const address = website?.storeInfo?.location?.address || business?.location?.address || business?.address || '';"
  );

  // Replace socialMedia
  content = content.replace(
    /const socialMedia = [^;]+;/,
    "const socialMedia = website?.storeInfo?.socialMedia || business?.socialMedia || {};"
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${template}`);
}
