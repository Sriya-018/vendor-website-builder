const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../client/src/components/editor/templates');
const templates = fs.readdirSync(templatesDir).filter(f => f.startsWith('Template') && f.endsWith('.jsx'));

for (const file of templates) {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // We are looking for:
  // id="preview-scroll-container"
  // ...
  // style={{
  //   backgroundColor: ...
  
  // A regex to find the style block of preview-scroll-container
  const regex = /(id="preview-scroll-container"[\s\S]*?style=\{\{)([\s\S]*?)\}\}/;
  
  content = content.replace(regex, (match, p1, p2) => {
    // Check if we already injected it
    if (p2.includes("'--primary': primaryColor")) {
      return match;
    }
    
    return `${p1}
        '--primary': primaryColor,
        '--accent': accentColor,${p2}}}`;
  });

  fs.writeFileSync(filePath, content);
}
console.log('Done injecting css variables to template roots.');
