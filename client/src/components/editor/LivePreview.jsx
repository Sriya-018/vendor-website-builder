import React from 'react';
import TemplateAurora from './templates/TemplateAurora';
import TemplateSlate from './templates/TemplateSlate';
import TemplateBloom from './templates/TemplateBloom';
import TemplateCrave from './templates/TemplateCrave';
import TemplateHaven from './templates/TemplateHaven';
import TemplateNexus from './templates/TemplateNexus';
import TemplateVogue from './templates/TemplateVogue';
import TemplatePixel from './templates/TemplatePixel';
import TemplateGlow from './templates/TemplateGlow';

function LivePreview({ config, devicePreview, website, business, products }) {
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
    switch (font) {
      case 'serif': return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
      case 'mono': return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
      case 'display': return '"Oswald", "Righteous", sans-serif';
      default: return 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    }
  };

  const cssVariables = {
    '--theme-color': config.themeColor || '#2563eb',
    '--heading-font': getFontFamily('headingFont'),
    '--body-font': getFontFamily('bodyFont'),
    '--base-size': `${config.typography.baseSize || 16}px`,
    '--line-height': config.typography.lineHeight === 'compact' ? 1.4 : config.typography.lineHeight === 'relaxed' ? 1.8 : 1.6,
    '--letter-spacing': config.typography.letterSpacing === 'tight' ? '-0.02em' : config.typography.letterSpacing === 'wide' ? '0.05em' : 'normal',
    '--radius': config.spacing.borderRadius === 'sharp' ? '0px' : config.spacing.borderRadius === 'pill' ? '9999px' : '8px',
  };

  // Real products or fallback dummy products
  const displayProducts = products && products.length > 0 ? products.map((p, i) => ({
    id: p._id || i,
    name: p.name,
    price: p.price,
    img: p.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:5000${p.imageUrl}`) : `https://picsum.photos/seed/${p.name}${i}/600/600`,
    badge: p.category ? 'new' : null
  })) : [
    { id: 1, name: 'Premium Wireless Headphones', price: 199.99, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', badge: 'sale' },
    { id: 2, name: 'Minimalist Wrist Watch', price: 129.50, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', badge: 'new' },
    { id: 3, name: 'Smart Home Speaker', price: 89.99, img: 'https://images.unsplash.com/photo-1589492477829-5e65395b66ea?w=500&q=80' },
    { id: 4, name: 'Leather Messenger Bag', price: 145.00, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80' },
    { id: 5, name: 'Ergonomic Desk Chair', price: 299.00, img: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80' },
    { id: 6, name: 'Ceramic Coffee Mug', price: 18.50, img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80' },
  ];

  const renderTemplate = () => {
    switch (config.template) {
      case 't9':
        return <TemplateGlow config={config} business={business} products={displayProducts} devicePreview={devicePreview} />;
      case 't8':
        return <TemplatePixel config={config} business={business} products={displayProducts} devicePreview={devicePreview} />;
      case 't7':
        return <TemplateVogue config={config} business={business} products={displayProducts} devicePreview={devicePreview} />;
      case 't6':
        return <TemplateNexus config={config} business={business} products={displayProducts} devicePreview={devicePreview} />;
      case 't5':
        return <TemplateHaven config={config} business={business} products={displayProducts} devicePreview={devicePreview} />;
      case 't4':
        return <TemplateCrave config={config} business={business} products={displayProducts} devicePreview={devicePreview} />;
      case 't3':
        return <TemplateBloom config={config} business={business} products={displayProducts} devicePreview={devicePreview} />;
      case 't2':
        return <TemplateSlate config={config} business={business} products={displayProducts} devicePreview={devicePreview} />;
      case 't1':
      default:
        // Fallback to Aurora for templates not yet implemented in React
        return <TemplateAurora config={config} business={business} products={displayProducts} devicePreview={devicePreview} />;
    }
  };

  return (
    <div className={`h-full w-full flex items-center justify-center transition-all duration-300 relative`}>
      {/* Device Frame */}
      <div 
        className={`${getDeviceWidth()} h-full max-h-[800px] w-full bg-white shadow-2xl overflow-hidden flex flex-col transition-all duration-500 rounded-[2rem] border-[12px] border-gray-900 ring-1 ring-gray-200 relative`} 
        style={cssVariables}
      >
        {renderTemplate()}
      </div>
    </div>
  );
}

export default LivePreview;
