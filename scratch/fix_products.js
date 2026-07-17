const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../client/src/components/editor/templates');
const templates = fs.readdirSync(templatesDir).filter(f => f.startsWith('Template') && f.endsWith('.jsx'));

for (const file of templates) {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix showPrices
  // Usually looks like:
  // <div className="text-xl font-extrabold text-theme-text mb-2 flex items-center justify-center gap-0.5">
  //   <span>₹</span>
  //   <EditableText ... />
  // </div>
  // Let's use a regex that matches the div containing the price EditableText and wraps it.
  
  // It's safer to replace the `<EditableText\s+isEditable=\{isEditable\}\s+value=\{String\(product\.price\)\}` block
  // Wait, no, we need to wrap the whole price container.
  // In Aurora, Haven, Crave, it's usually inside a `<div>` which has `<span>₹</span>` and `<EditableText ... value={String(product.price)}`

  // Instead of complex regex, let's just find the exact block for each file using a custom replacer script or we can just use `multi_replace_file_content` from the agent since I can see the exact lines.

}
