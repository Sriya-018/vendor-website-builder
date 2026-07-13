const fs = require('fs');
const content = fs.readFileSync('src/components/editor/EditorControls.jsx', 'utf8');
const matches = [...content.matchAll(/<Section\s+id="([^"]+)"\s+title="([^"]+)"/g)];
matches.forEach((m, i) => console.log(`${i+1}. ${m[2]} (id: ${m[1]})`));
