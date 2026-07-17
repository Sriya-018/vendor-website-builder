const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../client/src/components/editor/templates');
const templates = fs.readdirSync(templatesDir).filter(f => f.startsWith('Template') && f.endsWith('.jsx'));

for (const file of templates) {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace primaryColor = '#xxxxxx'; or similar hardcoded values, and config.themeColor fallback
  // Example matches: 
  // const primaryColor = '#111827';
  // const accentColor = config.themeColor || '#3B82F6';
  
  content = content.replace(/const primaryColor\s*=\s*(?:'[^']+'|"[^"]+");/g, "const primaryColor = config.theme?.primary || 'var(--primary)';");
  content = content.replace(/const accentColor\s*=\s*config\.themeColor\s*\|\|\s*(?:'[^']+'|"[^"]+");/g, "const accentColor = config.theme?.accent || 'var(--accent)';");

  // In some templates, they might just have const primaryColor = ...
  // Let's just blindly replace them if they don't use config.theme?.primary
  
  if (!content.includes('config.theme?.primary')) {
    content = content.replace(/const primaryColor\s*=\s*.*?;\n/, "const primaryColor = config.theme?.primary || 'var(--primary)';\n");
  }
  if (!content.includes('config.theme?.accent')) {
    content = content.replace(/const accentColor\s*=\s*.*?;\n/, "const accentColor = config.theme?.accent || 'var(--accent)';\n");
  }

  // Same for secondary if it exists
  if (content.includes('const secondaryColor')) {
    if (!content.includes('config.theme?.secondary')) {
      content = content.replace(/const secondaryColor\s*=\s*.*?;\n/, "const secondaryColor = config.theme?.secondary || 'var(--secondary)';\n");
    }
  }

  fs.writeFileSync(filePath, content);
}
console.log('Done replacing colors in templates.');
