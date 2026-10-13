import os

tab_path = r'd:\Folders\vendor\vendor-website-builder\client\src\components\dashboard\BrandAssetsTab.jsx'
with open(tab_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """ const updatedConfig = {
 ...config,
 themeColor: accentColor,
 navbar: {
 ...(config.navbar || {}),
 logoText: brandName,
 logoIcon: iconEmoji,
 announcement: {
 ...(config.navbar?.announcement || {}),
 color: accentColor
 }
 },
 typography: {
 ...(config.typography || {}),
 headingFont: selectedPreset.font,
 bodyFont: selectedPreset.font === 'Playfair Display' || selectedPreset.font === 'Cormorant Garamond' ? 'Lora' : 'Outfit'
 }
 };

 // 3. Save website back to server
 await axios.put(`${API_URL}/website/update/${selectedWebsiteId}`, {
 designConfig: updatedConfig,
 theme: {
 primaryColor: site.theme?.primaryColor || accentColor,
 secondaryColor: site.theme?.secondaryColor || '#FFFFFF',
 backgroundColor: site.theme?.backgroundColor || '#FFFFFF'
 }
 });

 setSuccessMsg('Successfully applied logo styling and accent theme to your website!');"""

new_code = """ // 2. Update ONLY navbar logo without altering the site theme colors
 const updatedConfig = {
 ...config,
 navbar: {
 ...(config.navbar || {}),
 logoText: brandName,
 logoIcon: iconEmoji,
 logoColor: accentColor
 }
 };

 // 3. Save website back to server without overwriting general theme colors
 await axios.put(`${API_URL}/website/update/${selectedWebsiteId}`, {
 designConfig: updatedConfig,
 storeName: brandName
 });

 setSuccessMsg('Successfully applied logo to your website!');"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open(tab_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("BrandAssetsTab.jsx updated successfully!")
else:
    print("old_code not matched directly, checking normalized...")
    # Try normalized match
    import re
    pattern = r"const updatedConfig = \{[\s\S]*?setSuccessMsg\('Successfully applied logo styling and accent theme to your website!'\);"
    match = re.search(pattern, content)
    if match:
        content = content[:match.start()] + new_code.strip() + content[match.end():]
        with open(tab_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("BrandAssetsTab.jsx updated via regex!")
    else:
        print("Regex match also failed!")
