import os

template_dir = r'd:\Folders\vendor\vendor-website-builder\client\src\components\editor\templates'

for name in ['TemplateCrave.jsx', 'TemplateHaven.jsx', 'TemplateNexus.jsx', 'TemplateSlate.jsx', 'TemplateVogue.jsx', 'TemplateZenith.jsx', 'TemplateLoft.jsx', 'TemplateFlora.jsx', 'TemplateSpark.jsx', 'TemplateTrend.jsx']:
    path = os.path.join(template_dir, name)
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f'*** {name} ***')
    for i, line in enumerate(lines):
        if "onUpdateConfig('navbar', 'logoText'" in line:
            start = max(0, i - 6)
            end = min(len(lines), i + 12)
            print(f'-- around line {i+1} --')
            for j in range(start, end):
                print(f'{j+1}: {repr(lines[j])}')
            break
