const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const templatesDir = path.join(__dirname, '../client/src/components/editor/templates');
const templates = fs.readdirSync(templatesDir).filter(f => f.startsWith('Template') && f.endsWith('.jsx'));

for (const file of templates) {
  const filePath = path.join(templatesDir, file);
  
  // Get original file content from git
  let originalContent;
  try {
    originalContent = execSync(`git show origin/main:client/src/components/editor/templates/${file}`).toString();
  } catch (e) {
    console.error('Error fetching git content for', file);
    continue;
  }
  
  let currentContent = fs.readFileSync(filePath, 'utf8');

  // Extract original primaryColor
  const primaryMatch = originalContent.match(/const primaryColor\s*=\s*(['"][^'"]+['"]);/);
  if (primaryMatch) {
    const origPrimary = primaryMatch[1];
    currentContent = currentContent.replace(
      /const primaryColor = config\.theme\?\.primary \|\| 'var\(--primary\)';/,
      `const primaryColor = config.theme?.primary || ${origPrimary};`
    );
    // Also if it doesn't have var(--primary) but was replaced previously:
    currentContent = currentContent.replace(
      /const primaryColor = config\.theme\?\.primary \|\| '[^']+';/,
      `const primaryColor = config.theme?.primary || ${origPrimary};`
    );
  }

  // Extract original accentColor
  const accentMatch = originalContent.match(/const accentColor\s*=\s*(?:config\.themeColor\s*\|\|\s*)?(['"][^'"]+['"]);/);
  if (accentMatch) {
    const origAccent = accentMatch[1];
    currentContent = currentContent.replace(
      /const accentColor = config\.theme\?\.accent \|\| 'var\(--accent\)';/,
      `const accentColor = config.theme?.accent || ${origAccent};`
    );
    currentContent = currentContent.replace(
      /const accentColor = config\.theme\?\.accent \|\| '[^']+';/,
      `const accentColor = config.theme?.accent || ${origAccent};`
    );
  }

  // Extract original background and color for the scroll container
  // style={{ backgroundColor: '#fefce8', color: '#451a03', ... }}
  const styleMatch = originalContent.match(/style=\{\{\s*backgroundColor:\s*('[^']+')\s*,\s*color:\s*('[^']+')/);
  if (styleMatch) {
    const origBg = styleMatch[1];
    const origColor = styleMatch[2];
    
    // In our modified file, we have:
    // backgroundColor: config.theme?.background || 'var(--background)',
    // color: config.theme?.text || 'var(--text)',
    currentContent = currentContent.replace(
      /backgroundColor:\s*config\.theme\?\.background\s*\|\|\s*'var\(--background\)'/,
      `backgroundColor: config.theme?.background || ${origBg}`
    );
    currentContent = currentContent.replace(
      /color:\s*config\.theme\?\.text\s*\|\|\s*'var\(--text\)'/,
      `color: config.theme?.text || ${origColor}`
    );
  }

  // Extract original navbar background color
  const navStyleMatch = originalContent.match(/<nav[\s\S]*?style=\{\{\s*backgroundColor:\s*('[^']+')/);
  if (navStyleMatch) {
    const origNavBg = navStyleMatch[1];
    currentContent = currentContent.replace(
      /backgroundColor:\s*config\.navbar\?\.backgroundColor\s*\|\|\s*'var\(--background\)'/,
      `backgroundColor: config.navbar?.backgroundColor || ${origNavBg}`
    );
    currentContent = currentContent.replace(
      /backgroundColor:\s*config\.navbar\?\.backgroundColor\s*\|\|\s*'(?:#[a-fA-F0-9]+|transparent)'/,
      `backgroundColor: config.navbar?.backgroundColor || ${origNavBg}`
    );
  }

  fs.writeFileSync(filePath, currentContent);
}

console.log('Done restoring fallbacks.');
