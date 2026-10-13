import os
import re

template_dir = r'd:\Folders\vendor\vendor-website-builder\client\src\components\editor\templates'

# 1. Update TemplateLayoutBase.jsx
layout_path = os.path.join(template_dir, 'TemplateLayoutBase.jsx')
with open(layout_path, 'r', encoding='utf-8') as f:
    layout = f.read()

# Home nav in TemplateLayoutBase
old_layout_home = ''' {isEditable ? (
 fullLogoUrl ? (
 <div className={`font-black uppercase tracking-tight text-xl ${theme.logoTextClass || 'text-theme-text'}`}>
 <img src={fullLogoUrl} className="h-8 object-contain" alt="logo" />
 </div>
 ) : (
 <EditableText
 isEditable={true}
 value={config.navbar?.logoText || businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className={`font-black focus:outline-none uppercase tracking-tight text-xl cursor-text ${theme.logoTextClass || 'text-theme-text'}`}
 />
 )
 ) : (
 <button onClick={() => changePage('home')} className={`font-black focus:outline-none uppercase tracking-tight text-xl ${theme.logoTextClass || 'text-theme-text'}`}>
 {fullLogoUrl ? <img src={fullLogoUrl} className="h-8 object-contain" alt="logo" /> : businessName}
 </button>
 )}'''

new_layout_home = ''' <div className="flex items-center gap-3">
 {fullLogoUrl ? (
 <img src={fullLogoUrl} className="h-9 object-contain rounded" alt="logo" />
 ) : (
 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor || '#2563eb'}, ${accentColor || '#3b82f6'})` }}>
 {config.navbar?.logoIcon || <FaStore />}
 </div>
 )}
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={config.navbar?.logoText || businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className={`font-black focus:outline-none uppercase tracking-tight text-xl cursor-text ${theme.logoTextClass || 'text-theme-text'}`}
 />
 ) : (
 <button onClick={() => changePage('home')} className={`font-black focus:outline-none uppercase tracking-tight text-xl ${theme.logoTextClass || 'text-theme-text'}`}>
 {config.navbar?.logoText || businessName}
 </button>
 )}
 </div>'''

if old_layout_home in layout:
    layout = layout.replace(old_layout_home, new_layout_home, 2)
    with open(layout_path, 'w', encoding='utf-8') as f:
        f.write(layout)
    print("TemplateLayoutBase.jsx updated successfully!")
else:
    print("old_layout_home not matched")
