import os

template_dir = r'd:\Folders\vendor\vendor-website-builder\client\src\components\editor\templates'

for name in os.listdir(template_dir):
    if not name.endswith('.jsx'): continue
    path = os.path.join(template_dir, name)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "onUpdateConfig('navbar', 'logoText'" in content:
        print(f'{name} has onUpdateConfig logoText')
