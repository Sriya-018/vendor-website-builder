import os
import re

template_dir = r'd:\Folders\vendor\vendor-website-builder\client\src\components\editor\templates'

templates = [f for f in os.listdir(template_dir) if f.startswith('Template') and f.endswith('.jsx')]

print(f'Checking {len(templates)} templates...')

for t in templates:
    path = os.path.join(template_dir, t)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    has_logo_icon = 'logoIcon' in content
    has_full_logo = 'fullLogoUrl' in content
    print(f'{t}: logoIcon={has_logo_icon}, fullLogoUrl={has_full_logo}')
