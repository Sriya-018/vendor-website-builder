import os
import re

template_dir = r'd:\Folders\vendor\vendor-website-builder\client\src\components\editor\templates'

for name in ['TemplateCrave.jsx', 'TemplateHaven.jsx', 'TemplateNexus.jsx', 'TemplateSlate.jsx', 'TemplateSpark.jsx', 'TemplateTrend.jsx', 'TemplateVogue.jsx', 'TemplateZenith.jsx', 'TemplateLoft.jsx', 'TemplateFlora.jsx', 'TemplateGlow.jsx', 'TemplatePixel.jsx', 'TemplateLayoutBase.jsx']:
    path = os.path.join(template_dir, name)
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    print(f'=== {name} ===')
    for i, line in enumerate(lines):
        if 'businessName' in line and ('EditableText' in line or '<button' in line or '<span' in line or '<h1' in line or '<a' in line):
            print(f'Line {i+1}: {line.strip()[:90]}')
