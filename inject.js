const fs = require('fs');
let content = fs.readFileSync('server/routes/aiRoutes.js', 'utf8');

const regex = /<button([^>]*?)>([\s\S]*?)<\/button>/gi;

let replaced = 0;
content = content.replace(regex, (match, attrs, innerText) => {
  if (attrs.includes('data-cart-add')) return match;
  
  const textMatch = innerText.toLowerCase();
  if (textMatch.includes('add to cart') || 
      textMatch.includes('add to bag') || 
      textMatch.includes('buy now') || 
      textMatch.includes('order now') || 
      textMatch.includes('shop now') ||
      textMatch.includes('get quote')) {
      
      replaced++;
      return `<button data-cart-add="true" data-product-name="\${name}" data-product-price="\${price}" data-product-image="\${img}"${attrs}>${innerText}</button>`;
  }
  return match;
});

console.log('Replaced', replaced, 'buttons');
fs.writeFileSync('server/routes/aiRoutes.js', content, 'utf8');
