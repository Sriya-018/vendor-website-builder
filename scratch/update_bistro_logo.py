import os

template_dir = r'd:\Folders\vendor\vendor-website-builder\client\src\components\editor\templates'
bistro_path = os.path.join(template_dir, 'TemplateBistro.jsx')

with open(bistro_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update accentColor fallback
content = content.replace(
    "const accentColor = config.theme?.accent || '#C5A880';",
    "const accentColor = config.theme?.accent || config.themeColor || '#C5A880';"
)

old_home_nav = ''' <div className="max-w-7xl mx-auto flex items-center justify-between">
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-serif text-2xl uppercase tracking-widest text-[#C5A880] cursor-text"
 />
 ) : (
 <button onClick={() => changePage('home')} className="font-serif text-2xl uppercase tracking-widest text-[#C5A880] focus:outline-none">
 {businessName}
 </button>
 )}'''

new_home_nav = ''' <div className="max-w-7xl mx-auto flex items-center justify-between">
 <div className="flex items-center gap-3">
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt={businessName} className="h-10 w-auto max-w-[150px] object-contain rounded" />
 ) : config.navbar?.logoIcon ? (
 <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm transition-transform hover:scale-105" style={{ background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`, color: accentColor, border: `1.5px solid ${accentColor}50` }}>
 {config.navbar.logoIcon}
 </span>
 ) : null}
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-serif text-2xl uppercase tracking-widest cursor-text"
 style={{ fontFamily: config.typography?.headingFont ? `'${config.typography.headingFont}', serif` : undefined, color: accentColor }}
 />
 ) : (
 <button onClick={() => changePage('home')} className="font-serif text-2xl uppercase tracking-widest focus:outline-none text-left transition-opacity hover:opacity-90" style={{ fontFamily: config.typography?.headingFont ? `'${config.typography.headingFont}', serif` : undefined, color: accentColor }}>
 {businessName}
 </button>
 )}
 </div>'''

old_shop_nav = ''' <nav className="py-6 px-8 border-b border-[#C5A880]/10 flex items-center justify-between">
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-serif text-xl uppercase tracking-wider text-[#C5A880] cursor-text"
 />
 ) : (
 <button onClick={() => changePage('home')} className="font-serif text-xl uppercase tracking-wider text-[#C5A880]">
 {businessName}
 </button>
 )}'''

new_shop_nav = ''' <nav className="py-6 px-8 border-b border-[#C5A880]/10 flex items-center justify-between">
 <div className="flex items-center gap-3">
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt={businessName} className="h-9 w-auto max-w-[140px] object-contain rounded" />
 ) : config.navbar?.logoIcon ? (
 <span className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`, color: accentColor, border: `1.5px solid ${accentColor}50` }}>
 {config.navbar.logoIcon}
 </span>
 ) : null}
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-serif text-xl uppercase tracking-wider cursor-text"
 style={{ fontFamily: config.typography?.headingFont ? `'${config.typography.headingFont}', serif` : undefined, color: accentColor }}
 />
 ) : (
 <button onClick={() => changePage('home')} className="font-serif text-xl uppercase tracking-wider text-left" style={{ fontFamily: config.typography?.headingFont ? `'${config.typography.headingFont}', serif` : undefined, color: accentColor }}>
 {businessName}
 </button>
 )}
 </div>'''

if old_home_nav in content:
    content = content.replace(old_home_nav, new_home_nav)
    print('Home nav updated in TemplateBistro.jsx')
else:
    print('Warning: old_home_nav not found')

if old_shop_nav in content:
    content = content.replace(old_shop_nav, new_shop_nav)
    print('Shop nav updated in TemplateBistro.jsx')
else:
    print('Warning: old_shop_nav not found')

with open(bistro_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
