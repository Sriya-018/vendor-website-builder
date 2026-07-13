const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components', 'editor', 'templates');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

let changedFiles = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Backgrounds
  content = content.replace(/(?<!dark:)\bbg-white\b/g, 'bg-theme-surface');
  content = content.replace(/(?<!dark:)\bbg-(gray|slate)-50\b/g, 'bg-theme-bg');
  
  // Text
  content = content.replace(/(?<!dark:)\btext-(gray|slate)-(800|900)\b/g, 'text-theme-text');
  content = content.replace(/(?<!dark:)\btext-(gray|slate)-(500|600)\b/g, 'text-theme-muted');
  
  // Borders
  content = content.replace(/(?<!dark:)\bborder-(gray|slate)-(100|200|300)\b/g, 'border-theme-border');
  
  // Radius and Shadows
  content = content.replace(/\brounded-(sm|md|lg|xl|2xl|3xl)\b/g, 'rounded-theme');
  content = content.replace(/\bshadow-(sm|md|lg|xl|2xl)\b/g, 'shadow-theme');

  // Primary colors
  content = content.replace(/(?<!dark:)\bbg-(blue|indigo|purple|pink|red|green|amber|teal)-(500|600|700)\b/g, 'bg-theme-primary text-white');
  content = content.replace(/(?<!dark:)\btext-(blue|indigo|purple|pink|red|green|amber|teal)-(500|600|700)\b/g, 'text-theme-primary');

  // Dark mode variants (just strip them or map them, but we are using CSS variables now so dark mode is handled by variable switching if needed, though we didn't setup dark mode variables yet. I'll leave dark: alone for now to prevent breakage).

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    changedFiles++;
  }
}

console.log(`Successfully refactored ${changedFiles} templates.`);
