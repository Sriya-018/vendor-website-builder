import React, { useEffect } from 'react';
import TemplateAurora from './templates/TemplateAurora';
import TemplateSlate from './templates/TemplateSlate';
import TemplateBloom from './templates/TemplateBloom';
import TemplateCrave from './templates/TemplateCrave';
import TemplateHaven from './templates/TemplateHaven';
import TemplateNexus from './templates/TemplateNexus';
import TemplateVogue from './templates/TemplateVogue';
import TemplatePixel from './templates/TemplatePixel';
import TemplateGlow from './templates/TemplateGlow';
import TemplateBistro from './templates/TemplateBistro';
import TemplateLoft from './templates/TemplateLoft';
import TemplateZenith from './templates/TemplateZenith';
import TemplateTrend from './templates/TemplateTrend';
import TemplateSpark from './templates/TemplateSpark';
import TemplateFlora from './templates/TemplateFlora';
import TemplateFashionNew from './templates/TemplateFashionNew';
import TemplateElectronicsNew from './templates/TemplateElectronicsNew';
import TemplateBeautyNew from './templates/TemplateBeautyNew';
import TemplateFoodNew from './templates/TemplateFoodNew';
import TemplateDecorNew from './templates/TemplateDecorNew';
import TemplateServicesNew from './templates/TemplateServicesNew';

function LivePreview({ 
 config, 
 devicePreview, 
 website, 
 business, 
 products,
 isEditable,
 onUpdateConfig,
 onUpdateProduct,
 onAddProduct,
 onDeleteProduct
}) {
 // Load Google Fonts Dynamically
 useEffect(() => {
 const headingFont = config.typography?.headingFont || 'sans';
 const bodyFont = config.typography?.bodyFont || 'sans';
 const fontsToLoad = [];
 
 const googleFontsList = {
 'Outfit': 'Outfit:wght@300;400;600;800',
 'Montserrat': 'Montserrat:wght@300;400;600;800',
 'Plus Jakarta Sans': 'Plus+Jakarta+Sans:wght@300;400;600;800',
 'Playfair Display': 'Playfair+Display:wght@400;600;800',
 'Cormorant Garamond': 'Cormorant+Garamond:wght@400;600;700',
 'Lora': 'Lora:wght@400;600;700',
 'Cabinet Grotesk': 'Cabinet+Grotesk:wght@400;700;800',
 'Bricolage Grotesque': 'Bricolage+Grotesque:wght@400;700;800',
 'Syne': 'Syne:wght@400;700;800',
 'Oswald': 'Oswald:wght@400;700',
 'Space Mono': 'Space+Mono:wght@400;700'
 };

 if (googleFontsList[headingFont]) fontsToLoad.push(googleFontsList[headingFont]);
 if (googleFontsList[bodyFont] && bodyFont !== headingFont) fontsToLoad.push(googleFontsList[bodyFont]);

 if (fontsToLoad.length > 0) {
 const linkId = 'google-fonts-live-preview';
 let linkElement = document.getElementById(linkId);
 if (!linkElement) {
 linkElement = document.createElement('link');
 linkElement.id = linkId;
 linkElement.rel = 'stylesheet';
 document.head.appendChild(linkElement);
 }
 linkElement.href = `https://fonts.googleapis.com/css2?family=${fontsToLoad.join('&family=')}&display=swap`;
 }
 }, [config.typography?.headingFont, config.typography?.bodyFont]);

 // Device width constraints
 const getDeviceWidth = () => {
 switch (devicePreview) {
 case 'mobile': return 'max-w-[375px]';
 case 'tablet': return 'max-w-[768px]';
 default: return 'w-full';
 }
 };

 // Font mapping
 const getFontFamily = (type) => {
 const font = config.typography[type] || 'sans';
 const googleFonts = ['Outfit', 'Montserrat', 'Plus Jakarta Sans', 'Playfair Display', 'Cormorant Garamond', 'Lora', 'Cabinet Grotesk', 'Bricolage Grotesque', 'Syne', 'Oswald', 'Space Mono'];
 if (googleFonts.includes(font)) {
 return `"${font}", sans-serif`;
 }
 switch (font) {
 case 'serif': return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
 case 'mono': return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
 case 'display': return '"Oswald", "Righteous", sans-serif';
 default: return 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
 }
 };

 const cssVariables = {
 '--primary': config.theme?.primary || '#2563eb',
 '--secondary': config.theme?.secondary || '#4f46e5',
 '--accent': config.theme?.accent || '#f59e0b',
 '--background': config.theme?.background || '#ffffff',
 '--surface': config.theme?.surface || '#f9fafb',
 '--text': config.theme?.text || '#111827',
 '--muted': config.theme?.muted || '#6b7280',
 '--border': config.theme?.border || '#e5e7eb',
 '--heading-font': getFontFamily('headingFont'),
 '--body-font': getFontFamily('bodyFont'),
 '--base-size': `${config.typography?.baseSize || 16}px`,
 '--line-height': config.typography?.lineHeight === 'compact' ? 1.4 : config.typography?.lineHeight === 'relaxed' ? 1.8 : 1.6,
 '--letter-spacing': config.typography?.letterSpacing === 'tight' ? '-0.02em' : config.typography?.letterSpacing === 'wide' ? '0.05em' : 'normal',
 '--radius': config.spacing?.borderRadius || '8px',
 '--shadow': config.shadows?.globalStyle === 'none' ? 'none' : config.shadows?.globalStyle === 'light' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : config.shadows?.globalStyle === 'heavy' ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
 };

 // Real products or fallback dummy products
 const displayProducts = products && products.length > 0 ? products.map((p, i) => ({
 id: p._id || i,
 _id: p._id || i,
 name: p.name,
 price: p.price,
 description: p.description || '',
 category: p.category || 'general',
 img: p.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:5000${p.imageUrl}`) : `https://picsum.photos/seed/${encodeURIComponent(p.name || 'product')}${i}/600/600`,
 badge: p.category ? 'new' : null,
 orderCount: p.orderCount || 0,
 isBestseller: p.isBestseller || false,
 inStock: p.inStock !== false,
 stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : 10,
 sizes: p.sizes || [],
 specs: p.specs || '',
 dietary: p.dietary || [],
 material: p.material || ''
 })) : (() => {
    const templateId = config.template;
    const storeCategory = website?.storeInfo?.category?.toLowerCase() || '';

    const fashionTemplates = ['t1', 't7', 't13', 't16', 't17', 't18'];
    const beautyTemplates = ['t3', 't9', 't15', 't22', 't23', 't24'];
    const foodTemplates = ['t4', 't10', 't25', 't26', 't27', 't28'];
    const decorTemplates = ['t5', 't11', 't29', 't30', 't31', 't32'];
    const serviceTemplates = ['t6', 't12', 't33', 't34', 't35', 't36'];

    if (fashionTemplates.includes(templateId) || storeCategory === 'fashion') {
      return [
        { id: 1, _id: 1, name: 'Classic White T-Shirt', price: 1499.00, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', badge: 'sale' },
        { id: 2, _id: 2, name: 'Denim Jacket', price: 3499.00, img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80', badge: 'new' },
        { id: 3, _id: 3, name: 'Leather Sneakers', price: 4599.00, img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80' },
      ];
    }
    
    if (foodTemplates.includes(templateId) || storeCategory === 'food' || storeCategory === 'restaurant' || storeCategory === 'beverage') {
      return [
        { id: 1, _id: 1, name: 'Spicy Avocado Toast', price: 149.00, img: 'https://images.unsplash.com/photo-1588137378733-fc7f0b5d0382?w=600&q=80', badge: 'sale' },
        { id: 2, _id: 2, name: 'Artisan Pasta', price: 399.00, img: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80', badge: 'new' },
        { id: 3, _id: 3, name: 'Matcha Latte', price: 129.50, img: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80' },
      ];
    }
    
    if (decorTemplates.includes(templateId) || storeCategory === 'decor' || storeCategory === 'furniture' || storeCategory === 'home') {
      return [
        { id: 1, _id: 1, name: 'Minimalist Ceramic Vase', price: 799.00, img: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&q=80', badge: 'sale' },
        { id: 2, _id: 2, name: 'Linen Throw Pillow', price: 499.00, img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=600&q=80', badge: 'new' },
        { id: 3, _id: 3, name: 'Nordic Table Lamp', price: 1299.50, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80' },
      ];
    }

    if (serviceTemplates.includes(templateId) || storeCategory === 'services' || storeCategory === 'software') {
      return [
        { id: 1, _id: 1, name: 'Basic Consultation', price: 999.00, img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80', badge: 'sale' },
        { id: 2, _id: 2, name: 'Premium Support Plan', price: 2499.00, img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=600&q=80', badge: 'new' },
        { id: 3, _id: 3, name: 'Full Site Audit', price: 4999.50, img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80' },
      ];
    }

    if (beautyTemplates.includes(templateId) || storeCategory === 'beauty') {
      return [
        { id: 1, _id: 1, name: 'Rosewater Glow Toner', price: 299.00, img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80', badge: 'sale' },
        { id: 2, _id: 2, name: 'Vitamin C Brightening Serum', price: 499.00, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80', badge: 'new' },
        { id: 3, _id: 3, name: 'Hydrating Clay Cleanser', price: 349.50, img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80' },
      ];
    }
    
    // Default / Electronics
    return [
      { id: 1, _id: 1, name: 'Premium Wireless Headphones', price: 199.99, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', badge: 'sale' },
      { id: 2, _id: 2, name: 'Minimalist Wrist Watch', price: 129.50, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', badge: 'new' },
      { id: 3, _id: 3, name: 'Smart Home Speaker', price: 89.99, img: 'https://images.unsplash.com/photo-1589492477829-5e65395b66ea?w=500&q=80' },
    ];
  })();

 const renderTemplate = () => {
 const props = {
 config,
 business,
 products: displayProducts,
 devicePreview,
 website,
 isEditable,
 onUpdateConfig,
 onUpdateProduct,
 onAddProduct,
 onDeleteProduct
 };

 switch (config.template) {
 case 't9': return <TemplateGlow {...props} />;
 case 't8': return <TemplatePixel {...props} />;
 case 't7': return <TemplateVogue {...props} />;
 case 't6': return <TemplateNexus {...props} />;
 case 't12': return <TemplateZenith {...props} />;
 case 't5': return <TemplateHaven {...props} />;
 case 't11': return <TemplateLoft {...props} />;
 case 't4': return <TemplateCrave {...props} />;
 case 't10': return <TemplateBistro {...props} />;
 case 't3': return <TemplateBloom {...props} />;
 case 't15': return <TemplateFlora {...props} />;
 case 't2': return <TemplateSlate {...props} />;
 case 't14': return <TemplateSpark {...props} />;
 case 't13': return <TemplateTrend {...props} />;
 case 't16':
 case 't17':
 case 't18':
 return <TemplateFashionNew {...props} />;
 case 't19':
 case 't20':
 case 't21':
 return <TemplateElectronicsNew {...props} />;
 case 't22':
 case 't23':
 case 't24':
 return <TemplateBeautyNew {...props} />;
 case 't25':
 case 't26':
 case 't27':
 case 't28':
 return <TemplateFoodNew {...props} />;
 case 't29':
 case 't30':
 case 't31':
 case 't32':
 return <TemplateDecorNew {...props} />;
 case 't33':
 case 't34':
 case 't35':
 case 't36':
 return <TemplateServicesNew {...props} />;
 case 't1':
 default: return <TemplateAurora {...props} />;
 }
 };

 return (
 <div className={`h-full w-full flex items-center justify-center transition-all duration-300 relative`}>
 {/* Device Frame */}
 <div 
 className={`${getDeviceWidth()} h-full max-h-[800px] w-full bg-theme-background shadow-2xl overflow-hidden flex flex-col transition-all duration-500 rounded-[2rem] border-[12px] border-gray-900 ring-1 ring-gray-200 relative`} 
 style={{ ...cssVariables, transform: 'translate(0, 0)' }}
 >
 <style dangerouslySetInnerHTML={{ __html: config.customCss || '' }} />
 <div className="flex-1 overflow-y-auto w-full preview-content">
 {renderTemplate()}
 </div>
 </div>
 </div>
 );
}

export default LivePreview;
