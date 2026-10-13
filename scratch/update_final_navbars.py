import os

template_dir = r'd:\Folders\vendor\vendor-website-builder\client\src\components\editor\templates'

# 1. TemplateNexus.jsx
nexus_path = os.path.join(template_dir, 'TemplateNexus.jsx')
with open(nexus_path, 'r', encoding='utf-8') as f:
    nexus = f.read()

old_nexus_block = ''' <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded text-slate-900 dark:text-white flex items-center justify-center text-sm" style={{ backgroundColor: accentColor }}>
 <FaBriefcase />
 </div>'''

new_nexus_block = ''' <div className="flex items-center gap-3">
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt={businessName} className="h-9 w-auto max-w-[140px] object-contain rounded" />
 ) : (
 <div className="w-9 h-9 rounded-lg text-white flex items-center justify-center text-lg font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor || '#2563eb'}, ${accentColor || '#3b82f6'})` }}>
 {config.navbar?.logoIcon || <FaBriefcase />}
 </div>
 )}'''

if old_nexus_block in nexus:
    nexus = nexus.replace(old_nexus_block, new_nexus_block)
    with open(nexus_path, 'w', encoding='utf-8') as f:
        f.write(nexus)
    print('TemplateNexus updated!')
else:
    print('TemplateNexus block not matched')

# 2. TemplateGlow.jsx
glow_path = os.path.join(template_dir, 'TemplateGlow.jsx')
with open(glow_path, 'r', encoding='utf-8') as f:
    glow = f.read()

old_glow_block = ''' {fullLogoUrl ? (
 <img src={fullLogoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
 ) : (
 <>
 <span className="text-[1.4rem]">🌿</span>
 <EditableText
 isEditable={isEditable}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-black text-[1.3rem] cursor-text"
 style={{ color: primaryColor }}
 />
 </>
 )}'''

new_glow_block = ''' {fullLogoUrl ? (
 <img src={fullLogoUrl} alt="Logo" className="h-9 w-auto max-w-[140px] object-contain rounded" />
 ) : (
 <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor || '#059669'}, ${accentColor || '#10b981'})` }}>
 {config.navbar?.logoIcon || '🌿'}
 </div>
 )}
 <EditableText
 isEditable={isEditable}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-black text-[1.3rem] cursor-text"
 style={{ color: primaryColor }}
 />'''

if old_glow_block in glow:
    glow = glow.replace(old_glow_block, new_glow_block)
    with open(glow_path, 'w', encoding='utf-8') as f:
        f.write(glow)
    print('TemplateGlow updated!')
else:
    print('TemplateGlow block not matched')

# 3. TemplatePixel.jsx
pixel_path = os.path.join(template_dir, 'TemplatePixel.jsx')
with open(pixel_path, 'r', encoding='utf-8') as f:
    pixel = f.read()

old_pixel_block = ''' <div className="flex items-center gap-3">
 {isEditable ? (
 fullLogoUrl ? (
 <img src={fullLogoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
 ) : (
 <EditableText
 isEditable={true}
 value={config.navbar?.logoText || businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="text-[1.2rem] font-bold cursor-text"
 style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
 />
 )
 ) : (
 <button 
 onClick={() => changePage('home')}
 className="text-[1.2rem] font-bold focus:outline-none hover:opacity-85 text-left"
 style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
 >
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
 ) : (
 <>
 &gt; {businessName.toUpperCase().replace(/\s+/g, '_')}_
 </>
 )}
 </button>
 )}
 </div>'''

new_pixel_block = ''' <div className="flex items-center gap-3">
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt="Logo" className="w-9 h-9 object-contain rounded" />
 ) : (
 <div className="w-9 h-9 rounded flex items-center justify-center text-white text-base font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor || '#020617'}, ${accentColor || '#38bdf8'})` }}>
 {config.navbar?.logoIcon || <FaStore />}
 </div>
 )}
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={config.navbar?.logoText || businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="text-[1.2rem] font-bold cursor-text"
 style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
 />
 ) : (
 <button 
 onClick={() => changePage('home')}
 className="text-[1.2rem] font-bold focus:outline-none hover:opacity-85 text-left"
 style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
 >
 &gt; {businessName.toUpperCase().replace(/\s+/g, '_')}_
 </button>
 )}
 </div>'''

if old_pixel_block in pixel:
    pixel = pixel.replace(old_pixel_block, new_pixel_block)
    with open(pixel_path, 'w', encoding='utf-8') as f:
        f.write(pixel)
    print('TemplatePixel updated!')
else:
    print('TemplatePixel block not matched')
