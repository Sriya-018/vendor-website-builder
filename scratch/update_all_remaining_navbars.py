import os
import re

template_dir = r'd:\Folders\vendor\vendor-website-builder\client\src\components\editor\templates'

templates = [
    'TemplateSpark.jsx', 'TemplateTrend.jsx', 'TemplateLoft.jsx', 
    'TemplateFlora.jsx', 'TemplateVogue.jsx', 'TemplateGlow.jsx', 
    'TemplatePixel.jsx', 'TemplateNexus.jsx'
]

pattern = re.compile(
    r'(\{\/\*\s*(?:Simple Header|NAV|Navigation)\s*\*\/\}[\s\S]*?<div className="max-w-7xl mx-auto flex items-center justify-between[^"]*">\s*)'
    r'(\{isEditable \? \(\s*<EditableText[\s\S]*?<\/button>\s*\)\})',
    re.MULTILINE
)

for t in templates:
    path = os.path.join(template_dir, t)
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    # Ensure FaStore is imported
    if 'FaStore' not in code:
        code = re.sub(r"from 'react-icons/fa';", ", FaStore } from 'react-icons/fa';", code)
        code = re.sub(r'from "react-icons/fa";', ', FaStore } from "react-icons/fa";', code)

    # Wrap the logo in a flex container with logo icon box
    def replacer(m):
        prefix = m.group(1)
        inner = m.group(2)
        wrapped = f'''{prefix}<div className="flex items-center gap-3">
            {{fullLogoUrl ? (
              <img src={{fullLogoUrl}} alt={{businessName}} className="h-10 w-auto max-w-[150px] object-contain rounded-lg" />
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${{primaryColor || '#2563eb'}}, ${{accentColor || '#3b82f6'}})` }}>
                {{config.navbar?.logoIcon || <FaStore />}}
              </div>
            )}}
            {inner}
          </div>'''
        return wrapped

    new_code, count = pattern.subn(replacer, code)
    if count > 0:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_code)
        print(f'{t}: successfully updated {count} navbars!')
    else:
        print(f'{t}: regex did not match, checking manual pattern...')
