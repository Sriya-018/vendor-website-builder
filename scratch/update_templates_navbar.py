import os
import re

template_dir = r'd:\Folders\vendor\vendor-website-builder\client\src\components\editor\templates'

templates = [
    'TemplateCrave.jsx', 'TemplateHaven.jsx', 'TemplateNexus.jsx', 
    'TemplateSlate.jsx', 'TemplateSpark.jsx', 'TemplateTrend.jsx', 
    'TemplateVogue.jsx', 'TemplateZenith.jsx', 'TemplateLoft.jsx', 
    'TemplateFlora.jsx', 'TemplateBloom.jsx', 'TemplateGlow.jsx', 
    'TemplatePixel.jsx', 'TemplateLayoutBase.jsx'
]

for name in templates:
    path = os.path.join(template_dir, name)
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    # Ensure FaStore is imported
    if 'FaStore' not in code:
        code = re.sub(r"from 'react-icons/fa';", ", FaStore } from 'react-icons/fa';", code)
        code = re.sub(r'from "react-icons/fa";', ', FaStore } from "react-icons/fa";', code)

    print(f'Checked {name}: FaStore present? {"FaStore" in code}')

    # In TemplateCrave.jsx
    if name == 'TemplateCrave.jsx':
        old = ''' <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-extrabold text-3xl tracking-tight cursor-text"
 style={{ color: (scrolled || currentPage !== 'home') ? primaryColor : 'white', fontFamily: "'Lobster', cursive" }}
 />
 ) : (
 <button 
 onClick={() => changePage('home')}
 className="font-extrabold text-3xl tracking-tight text-left focus:outline-none hover:opacity-85"
 style={{ color: (scrolled || currentPage !== 'home') ? primaryColor : 'white', fontFamily: "'Lobster', cursive" }}
 >
 {businessName}
 </button>
 )}'''
        new = ''' <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
 <div className="flex items-center gap-3">
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt={businessName} className="h-10 w-auto max-w-[150px] object-contain rounded-lg" />
 ) : (
 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
 {config.navbar?.logoIcon || <FaStore />}
 </div>
 )}
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-extrabold text-3xl tracking-tight cursor-text"
 style={{ color: (scrolled || currentPage !== 'home') ? primaryColor : 'white', fontFamily: "'Lobster', cursive" }}
 />
 ) : (
 <button 
 onClick={() => changePage('home')}
 className="font-extrabold text-3xl tracking-tight text-left focus:outline-none hover:opacity-85"
 style={{ color: (scrolled || currentPage !== 'home') ? primaryColor : 'white', fontFamily: "'Lobster', cursive" }}
 >
 {businessName}
 </button>
 )}
 </div>'''
        if old in code:
            code = code.replace(old, new)
            print('  -> Updated TemplateCrave nav')

    # In TemplateHaven.jsx
    if name == 'TemplateHaven.jsx':
        old = ''' <div className="max-w-7xl mx-auto flex items-center justify-between h-[4.5rem]">
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-bold text-[1.6rem] cursor-text"
 style={{ color: config.navbar?.textColor || primaryColor, fontFamily: 'var(--heading-font)' }}
 />
 ) : (
 <button 
 onClick={() => changePage('home')}
 className="font-bold text-[1.6rem] text-left focus:outline-none hover:opacity-85"
 style={{ color: config.navbar?.textColor || primaryColor, fontFamily: 'var(--heading-font)' }}
 >
 {businessName}
 </button>
 )}'''
        new = ''' <div className="max-w-7xl mx-auto flex items-center justify-between h-[4.5rem]">
 <div className="flex items-center gap-3">
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt={businessName} className="h-10 w-auto max-w-[150px] object-contain rounded-lg" />
 ) : (
 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
 {config.navbar?.logoIcon || <FaStore />}
 </div>
 )}
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-bold text-[1.6rem] cursor-text"
 style={{ color: config.navbar?.textColor || primaryColor, fontFamily: 'var(--heading-font)' }}
 />
 ) : (
 <button 
 onClick={() => changePage('home')}
 className="font-bold text-[1.6rem] text-left focus:outline-none hover:opacity-85"
 style={{ color: config.navbar?.textColor || primaryColor, fontFamily: 'var(--heading-font)' }}
 >
 {businessName}
 </button>
 )}
 </div>'''
        if old in code:
            code = code.replace(old, new)
            print('  -> Updated TemplateHaven nav')

    # In TemplateSlate.jsx
    if name == 'TemplateSlate.jsx':
        old = ''' <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-extrabold text-xl tracking-tight cursor-text"
 style={{ color: accentColor }}
 />
 ) : (
 <button 
 onClick={() => changePage('home')}
 className="font-extrabold text-xl tracking-tight text-left focus:outline-none hover:opacity-85"
 style={{ color: accentColor }}
 >
 {businessName}
 </button>
 )}'''
        new = ''' <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
 <div className="flex items-center gap-3">
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt={businessName} className="h-10 w-auto max-w-[150px] object-contain rounded-lg" />
 ) : (
 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor || '#0f172a'}, ${accentColor})` }}>
 {config.navbar?.logoIcon || <FaStore />}
 </div>
 )}
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-extrabold text-xl tracking-tight cursor-text"
 style={{ color: accentColor }}
 />
 ) : (
 <button 
 onClick={() => changePage('home')}
 className="font-extrabold text-xl tracking-tight text-left focus:outline-none hover:opacity-85"
 style={{ color: accentColor }}
 >
 {businessName}
 </button>
 )}
 </div>'''
        if old in code:
            code = code.replace(old, new)
            print('  -> Updated TemplateSlate nav')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)

print('Templates navbar update batch 1 completed!')
