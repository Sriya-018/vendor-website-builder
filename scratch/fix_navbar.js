const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../client/src/components/editor/templates');
const templates = fs.readdirSync(templatesDir).filter(f => f.startsWith('Template') && f.endsWith('.jsx'));

for (const file of templates) {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Fix the logo text color
  // In most templates, it looks like:
  // style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}
  // Or text-theme-text
  
  // We need to inject `color: config.navbar?.textColor || ...` wherever the businessName EditableText is rendered.
  // It's easier to find `<EditableText\s+isEditable=\{true\}\s+value=\{businessName\}` and the corresponding `style={{ ... }}`.
  
  content = content.replace(
    /(<EditableText\s+isEditable=\{true\}\s+value=\{businessName\}[\s\S]*?style=\{\{\s*color:\s*)(primaryColor|'[^']+')/g,
    "$1config.navbar?.textColor || $2"
  );
  
  content = content.replace(
    /(<button\s+onClick=\{\(\) => changePage\('home'\)\}[\s\S]*?<span[\s\S]*?style=\{\{\s*color:\s*)(primaryColor|'[^']+')/g,
    "$1config.navbar?.textColor || $2"
  );
  // For templates like Haven where the button has the style directly:
  content = content.replace(
    /(<button\s+onClick=\{\(\) => changePage\('home'\)\}[\s\S]*?style=\{\{\s*color:\s*)(primaryColor|'[^']+')/g,
    "$1config.navbar?.textColor || $2"
  );

  // 2. Fix Navbar background color
  // We look for `<nav ` and inject `backgroundColor: config.navbar?.backgroundColor` into its style.
  // If it already has style={{ backgroundColor: '#fef3c7', ... }}
  content = content.replace(
    /(<nav[\s\S]*?style=\{\{[\s\S]*?backgroundColor:\s*)('[^']+')/g,
    "$1config.navbar?.backgroundColor || $2"
  );

  // If it doesn't have backgroundColor in style, we can inject it. (e.g. TemplateAurora)
  // `<nav className="... bg-transparent ..."` -> We can just let it be, but wait, if config.navbar.backgroundColor is set, we need it.
  if (file === 'TemplateAurora.jsx' || file === 'TemplateMinimal.jsx') {
    // For Aurora, it uses classes. We can append a style tag.
    content = content.replace(
      /(<nav className=\{`[^`]+`\})(>)/,
      "$1 style={{ backgroundColor: config.navbar?.backgroundColor || (scrolled || currentPage !== 'home' ? 'var(--surface)' : 'transparent') }}$2"
    );
    
    content = content.replace(
      /(<EditableText\s+isEditable=\{true\}\s+value=\{businessName\}[\s\S]*?style=\{\{\s*fontFamily:\s*'var\(--heading-font\)')/g,
      "$1, color: config.navbar?.textColor"
    );
    
    // For the non-editable logo span in Aurora:
    content = content.replace(
      /(<span\s+className=\{`[^`]+`\}\s+style=\{\{\s*fontFamily:\s*'var\(--heading-font\)')/g,
      "$1, color: config.navbar?.textColor"
    );
  }

  // 3. Fix the nav links color
  // `<div className="flex gap-8 text-[0.9rem] font-medium" style={{ color: '#92400e' }}>`
  content = content.replace(
    /(<div className="flex gap-8[^"]*" style=\{\{\s*color:\s*)('[^']+')/g,
    "$1config.navbar?.textColor || $2"
  );
  
  // What about templates where nav links don't have a color style?
  // We can just rely on the CSS variables or add it.

  fs.writeFileSync(filePath, content);
}
console.log('Done mapping navbar controls.');
