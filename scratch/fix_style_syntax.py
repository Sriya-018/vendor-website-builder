import os

template_dir = r'd:\Folders\vendor\vendor-website-builder\client\src\components\editor\templates'

for f in os.listdir(template_dir):
    if not f.endswith('.jsx'): continue
    path = os.path.join(template_dir, f)
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Fix style={ background: to style={{ background:
    fixed_content = content.replace("style={ background:", "style={{ background:")
    fixed_content = fixed_content.replace("})` }>", "})` }}>")
    
    if fixed_content != content:
        with open(path, 'w', encoding='utf-8') as file:
            file.write(fixed_content)
        print(f"Fixed double braces in {f}")
