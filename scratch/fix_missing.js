const fs = require('fs');
let content = fs.readFileSync('server/routes/aiRoutes.js', 'utf8');

// Insert the missing functions before `function generateWebsiteHTML`
const missingFunctions = `
function buildContactBlock(phoneNumber, email, address, formattedPhone, encodedLocation, primaryColor) {
  let html = '';
  if (phoneNumber) html += \`<p style="margin:0.5rem 0;"><i class="fas fa-phone" style="margin-right:0.5rem;color:\${primaryColor};"></i>\${phoneNumber}</p>\`;
  if (email) html += \`<p style="margin:0.5rem 0;"><i class="fas fa-envelope" style="margin-right:0.5rem;color:\${primaryColor};"></i><a href="mailto:\${email}" style="color:inherit;text-decoration:none;">\${email}</a></p>\`;
  if (address) html += \`<p style="margin:0.5rem 0;"><i class="fas fa-map-marker-alt" style="margin-right:0.5rem;color:\${primaryColor};"></i><a href="https://maps.google.com/?q=\${encodedLocation}" target="_blank" style="color:inherit;text-decoration:none;">\${address}</a></p>\`;
  return html;
}

function buildLogoBlock(businessData, primaryColor, accentColor) {
  if (businessData && businessData.logo) {
    const fullLogoUrl = businessData.logo.startsWith('http') ? businessData.logo : \`http://localhost:5000\${businessData.logo}\`;
    return \`<img src="\${fullLogoUrl}" alt="Store Logo" style="width:2.5rem;height:2.5rem;object-fit:contain;border-radius:0.4rem;background:transparent;">\`;
  }
  return \`<div style="width:2.5rem;height:2.5rem;border-radius:0.6rem;background:linear-gradient(135deg,\${primaryColor},\${accentColor});display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fas fa-store"></i></div>\`;
}

function generateWebsiteHTML(businessData, productImages, templateId, templateName, theme, heroImage, products) {
`;

// Replace `function generateWebsiteHTML(` with the functions
content = content.replace(/function generateWebsiteHTML\(businessData, productImages, templateId, templateName, theme, heroImage, products\) \{/, missingFunctions.trim() + ' {');

fs.writeFileSync('server/routes/aiRoutes.js', content, 'utf8');
console.log('Fixed missing functions in aiRoutes.js');
