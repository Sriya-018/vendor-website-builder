const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../client/src/components/editor/templates');
const templates = fs.readdirSync(templatesDir).filter(f => f.startsWith('Template') && f.endsWith('.jsx'));

for (const file of templates) {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix scroll container inline styles
  content = content.replace(
    /style=\{\{\s*backgroundColor:\s*['"][^'"]+['"],\s*color:\s*['"][^'"]+['"],\s*fontFamily:\s*['"][^'"]+['"],\s*fontSize:\s*'var\(--base-size\)',\s*lineHeight:\s*'var\(--line-height\)',\s*letterSpacing:\s*'var\(--letter-spacing\)'\s*\}\}/g,
    `style={{
        backgroundColor: config.theme?.background || 'var(--background)',
        color: config.theme?.text || 'var(--text)',
        fontFamily: 'var(--body-font)',
        fontSize: 'var(--base-size)',
        lineHeight: 'var(--line-height)',
        letterSpacing: 'var(--letter-spacing)'
      }}`
  );

  // Fix specific hardcoded fonts like fontFamily: "'Cormorant Garamond', serif" to use config
  content = content.replace(
    /fontFamily:\s*['"]'Cormorant Garamond', serif['"]/g,
    `fontFamily: 'var(--heading-font)'`
  );
  content = content.replace(
    /fontFamily:\s*['"]'Jost', sans-serif['"]/g,
    `fontFamily: 'var(--body-font)'`
  );

  fs.writeFileSync(filePath, content);
}
console.log('Done fixing typography and background in templates.');
