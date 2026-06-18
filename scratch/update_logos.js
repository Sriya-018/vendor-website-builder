const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../server/routes/aiRoutes.js');
let content = fs.readFileSync(filePath, 'utf8');

// Insert the helper function before generateWebsiteHTML
if (!content.includes('function buildLogoBlock(')) {
  const helperStr = `
function buildLogoBlock(businessData, primaryColor, accentColor) {
  if (businessData.logo) {
    const fullLogoUrl = businessData.logo.startsWith('http') ? businessData.logo : \\\`http://localhost:5000\\\${businessData.logo}\\\`;
    return \\\`<img src="\\\${fullLogoUrl}" alt="Store Logo" style="width:2.5rem;height:2.5rem;object-fit:contain;border-radius:0.4rem;background:transparent;">\\\`;
  }
  return \\\`<div style="width:2.5rem;height:2.5rem;border-radius:0.6rem;background:linear-gradient(135deg,\\\${primaryColor},\\\${accentColor});display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fas fa-store"></i></div>\\\`;
}

// ─────────────────────────────────────────────
//  MAIN ROUTER  — picks the right template
// ─────────────────────────────────────────────`;

  content = content.replace(/\/\/ ─────────────────────────────────────────────\n\/\/  MAIN ROUTER  — picks the right template\n\/\/ ─────────────────────────────────────────────/, helperStr);
}

// The exact regex pattern to find the div containing fa-store.
// Note: spacing might be slightly different in different templates.
const pattern = /<div style="width:2\.5rem;height:2\.5rem;border-radius:0\.6rem;background:linear-gradient\(135deg,\$\{primaryColor\},\$\{accentColor\}\);display:flex;align-items:center;justify-content:center;color:#fff;">\s*<i class="fas fa-store"><\/i>\s*<\/div>/g;

let count = 0;
content = content.replace(pattern, () => {
  count++;
  return `\${buildLogoBlock(businessData, primaryColor, accentColor)}`;
});

// There is also a one-liner version in the footers:
// <div style="width:2.5rem;height:2.5rem;border-radius:0.6rem;background:linear-gradient(135deg,${primaryColor},${accentColor});display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fas fa-store"></i></div>
const pattern2 = /<div style="width:2\.5rem;height:2\.5rem;border-radius:0\.6rem;background:linear-gradient\(135deg,\$\{primaryColor\},\$\{accentColor\}\);display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fas fa-store"><\/i><\/div>/g;

content = content.replace(pattern2, () => {
  count++;
  return `\${buildLogoBlock(businessData, primaryColor, accentColor)}`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Replaced ${count} occurrences of fa-store logo block.`);
