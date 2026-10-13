import os
import re

template_dir = r'd:\Folders\vendor\vendor-website-builder\client\src\components\editor\templates'

# 1. TemplateBloom.jsx
bloom_path = os.path.join(template_dir, 'TemplateBloom.jsx')
with open(bloom_path, 'r', encoding='utf-8') as f:
    bloom = f.read()

old_bloom = ''' <div 
 className="flex items-center gap-2 cursor-pointer"
 onClick={() => !isEditable && changePage('home')}
 >
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
 ) : (
 <EditableText
 isEditable={isEditable}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-extrabold text-[1.4rem] cursor-text"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 )}
 </div>'''

new_bloom = ''' <div 
 className="flex items-center gap-3 cursor-pointer"
 onClick={() => !isEditable && changePage('home')}
 >
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt="Logo" className="h-9 w-auto max-w-[140px] object-contain rounded" />
 ) : (
 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor || '#be185d'}, ${accentColor || '#ec4899'})` }}>
 {config.navbar?.logoIcon || <FaStore />}
 </div>
 )}
 <EditableText
 isEditable={isEditable}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-extrabold text-[1.4rem] cursor-text"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 </div>'''

if old_bloom in bloom:
    bloom = bloom.replace(old_bloom, new_bloom)
    with open(bloom_path, 'w', encoding='utf-8') as f:
        f.write(bloom)
    print("TemplateBloom updated!")
else:
    print("TemplateBloom old block not matched")

# 2. TemplateNexus.jsx
nexus_path = os.path.join(template_dir, 'TemplateNexus.jsx')
with open(nexus_path, 'r', encoding='utf-8') as f:
    nexus = f.read()

old_nexus = ''' <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center text-xl shadow-inner">
 <FaBriefcase />
 </div>
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-extrabold text-xl tracking-tight cursor-text"
 style={{ color: config.navbar?.textColor || primaryColor }}
 />
 ) : (
 <button 
 onClick={() => changePage('home')}
 className="font-extrabold text-xl tracking-tight text-left focus:outline-none hover:opacity-85"
 style={{ color: config.navbar?.textColor || primaryColor }}
 >
 {businessName}
 </button>
 )}'''

new_nexus = ''' <div className="flex items-center gap-3">
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt={businessName} className="h-10 w-auto max-w-[150px] object-contain rounded-lg" />
 ) : (
 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor || '#2563eb'}, ${accentColor || '#3b82f6'})` }}>
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
 style={{ color: config.navbar?.textColor || primaryColor }}
 />
 ) : (
 <button 
 onClick={() => changePage('home')}
 className="font-extrabold text-xl tracking-tight text-left focus:outline-none hover:opacity-85"
 style={{ color: config.navbar?.textColor || primaryColor }}
 >
 {businessName}
 </button>
 )}
 </div>'''

if old_nexus in nexus:
    nexus = nexus.replace(old_nexus, new_nexus)
    with open(nexus_path, 'w', encoding='utf-8') as f:
        f.write(nexus)
    print("TemplateNexus updated!")
else:
    print("TemplateNexus old block not matched")

# 3. TemplateZenith.jsx
zenith_path = os.path.join(template_dir, 'TemplateZenith.jsx')
with open(zenith_path, 'r', encoding='utf-8') as f:
    zenith = f.read()

old_zenith = ''' <nav className="py-6 px-8 border-b border-slate-900/5 dark:border-white/5 flex items-center justify-between">
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-black text-xl uppercase tracking-wider text-[#6366F1] cursor-text"
 />
 ) : (
 <button onClick={() => changePage('home')} className="font-black text-xl uppercase tracking-wider text-[#6366F1]">
 {businessName}
 </button>
 )}'''

new_zenith = ''' <nav className="py-6 px-8 border-b border-slate-900/5 dark:border-white/5 flex items-center justify-between">
 <div className="flex items-center gap-3">
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt={businessName} className="h-9 w-auto max-w-[140px] object-contain rounded" />
 ) : (
 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor || '#6366f1'}, ${accentColor || '#8b5cf6'})` }}>
 {config.navbar?.logoIcon || <FaStore />}
 </div>
 )}
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-black text-xl uppercase tracking-wider text-[#6366F1] cursor-text"
 />
 ) : (
 <button onClick={() => changePage('home')} className="font-black text-xl uppercase tracking-wider text-[#6366F1]">
 {businessName}
 </button>
 )}
 </div>'''

if old_zenith in zenith:
    zenith = zenith.replace(old_zenith, new_zenith, 2)
    with open(zenith_path, 'w', encoding='utf-8') as f:
        f.write(zenith)
    print("TemplateZenith updated!")
else:
    print("TemplateZenith old block not matched")
