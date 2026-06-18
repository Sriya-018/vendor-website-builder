const fs = require('fs');
const path = require('path');

const templatesDir = 'c:/Users/malle/OneDrive/Desktop/vendor/vendor-website-builder/client/src/components/editor/templates';
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Add `website` to props
  content = content.replace(/({ config, business, products, devicePreview })/, '{ config, business, products, devicePreview, website }');
  
  // 2. Add storeName definition right after businessName definition
  content = content.replace(/(const businessName = [^;]+;)/, '$1\n  const storeName = website?.storeName || business?.businessName || \'My Store\';');

  // 3. Replace all {businessName} with {storeName} EXCEPT in the navbar.
  // We split by 'return (' to only affect the JSX returned by the component.
  let parts = content.split('return (');
  if (parts.length > 1) {
    // join all parts after the first one back together in case there are multiple 'return ('
    let jsx = parts.slice(1).join('return (');
    
    // Replace all {businessName} with {storeName}
    let newJsx = jsx.replace(/\{businessName\}/g, '{storeName}');
    
    // Now find the first {storeName} (which is in the navbar) and change it back to {businessName}
    newJsx = newJsx.replace('{storeName}', '{businessName}');
    
    content = parts[0] + 'return (' + newJsx;
  }

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
