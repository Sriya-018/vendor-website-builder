const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../client/src/components/editor/templates');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add logo extraction if missing
  if (!content.includes('const logo = website?.storeInfo?.logo')) {
    content = content.replace(/(const storeName = .*?;)/, "$1\n  const logo = website?.storeInfo?.logo ?? business?.logo ?? null;\n  const fullLogoUrl = logo ? (logo.startsWith('http') ? logo : `http://localhost:5000${logo}`) : null;");
  }

  // Find all <div ...> <FaStore /> </div>
  // Because the JSX can span multiple lines, we can use a more robust regex:
  // /<div[^>]*>\s*<FaStore \/>\s*<\/div>/g
  const faStoreRegex = /<div[^>]*>\s*<FaStore \/>\s*<\/div>/g;
  
  content = content.replace(faStoreRegex, (match) => {
    return `{fullLogoUrl ? (
              <img src={fullLogoUrl} alt="Store Logo" className="w-10 h-10 object-contain rounded-md" style={{background:'transparent'}} />
            ) : (
              ${match.trim()}
            )}`;
  });

  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
});
