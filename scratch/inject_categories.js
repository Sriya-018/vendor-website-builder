const fs = require('fs');
const path = require('path');

const editorControlsPath = path.join(__dirname, '../client/src/components/editor/EditorControls.jsx');
const templatesPath = path.join(__dirname, '../client/src/pages/Templates.jsx');

let editorControls = fs.readFileSync(editorControlsPath, 'utf8');
const templatesFile = fs.readFileSync(templatesPath, 'utf8');

// Extract categories from Templates.jsx
const categoryMap = {};
const mockTemplatesMatch = templatesFile.match(/const MOCK_TEMPLATES = \[([\s\S]*?)\];/);
if (mockTemplatesMatch) {
  const blocks = mockTemplatesMatch[1].split('},');
  blocks.forEach(block => {
    const idMatch = block.match(/id:\s*'([^']+)'/);
    const catMatch = block.match(/category:\s*'([^']+)'/);
    if (idMatch && catMatch) {
      categoryMap[idMatch[1]] = catMatch[1];
    }
  });
}

// Update TEMPLATES in EditorControls.jsx
const templatesMatch = editorControls.match(/const TEMPLATES = \[([\s\S]*?)\];/);
if (templatesMatch) {
  const newTemplates = templatesMatch[1].split('},').map(block => {
    const idMatch = block.match(/id:\s*'([^']+)'/);
    if (idMatch) {
      const id = idMatch[1];
      const cat = categoryMap[id] || 'General';
      if (!block.includes('category:')) {
        return block.replace(/(id:\s*'[^']+',\s*name:\s*'[^']+',)/, `$1 category: '${cat}',`);
      }
    }
    return block;
  }).join('},');
  
  editorControls = editorControls.replace(templatesMatch[1], newTemplates);
}

// Modify Layout Template rendering
const lockedSectionRegex = /\{website \? \([\s\S]*?\) : \([\s\S]*?<div className="space-y-3">([\s\S]*?TEMPLATES\.map\([\s\S]*?\)[\s\S]*?)<\/div>[\s\S]*?\)\}/;
// Wait, regex might be tricky for JSX. Let me just use string replacement for the specific part.

fs.writeFileSync(editorControlsPath, editorControls);
console.log('Done injecting categories.');
