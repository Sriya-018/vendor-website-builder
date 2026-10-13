import os

template_dir = r'd:\Folders\vendor\vendor-website-builder\client\src\components\editor\templates'

# 1. Update TemplateBistro.jsx
bistro_path = os.path.join(template_dir, 'TemplateBistro.jsx')
with open(bistro_path, 'r', encoding='utf-8') as f:
    bistro = f.read()

# Update Home nav
bistro = bistro.replace(
''' ) : config.navbar?.logoIcon ? (
 <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm transition-transform hover:scale-105" style={{ background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`, color: accentColor, border: `1.5px solid ${accentColor}50` }}>
 {config.navbar.logoIcon}
 </span>
 ) : null}''',
''' ) : (
 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
 {config.navbar?.logoIcon || <FaStore />}
 </div>
 )}'''
)

# Update Shop nav
bistro = bistro.replace(
''' ) : config.navbar?.logoIcon ? (
 <span className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`, color: accentColor, border: `1.5px solid ${accentColor}50` }}>
 {config.navbar.logoIcon}
 </span>
 ) : null}''',
''' ) : (
 <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
 {config.navbar?.logoIcon || <FaStore />}
 </div>
 )}'''
)

with open(bistro_path, 'w', encoding='utf-8') as f:
    f.write(bistro)
print('TemplateBistro.jsx updated!')
