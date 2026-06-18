const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../client/src/pages/Templates.jsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "storeName: storeDetails.name || 'My Awesome Store',",
  "storeName: storeDetails.name || 'My Awesome Store',\n        logo: storeDetails.logoPreview || storeDetails.logo || businessData?.logo || '',"
);

fs.writeFileSync(file, content);
console.log('Fixed Templates.jsx');
