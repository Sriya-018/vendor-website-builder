import React, { useEffect, useState } from 'react';
import { FaWhatsapp, FaShoppingCart } from 'react-icons/fa';

function TemplateSlate({ config, business, products, devicePreview, website }) {
  const [scrolled, setScrolled] = useState(false);

  const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'My Store');
  const storeName = website?.storeName || business?.businessName || 'My Store';
  const logo = website?.storeInfo?.logo ?? business?.logo ?? null;
  const fullLogoUrl = logo ? (logo.startsWith('http') ? logo : `http://localhost:5000${logo}`) : null;
  const description = config.header.heroHeading || business?.description || 'Next-gen products for a modern world.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const accentColor = config.themeColor || '#38BDF8';
  const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80';

  useEffect(() => {
    const handleScroll = (e) => {
      setScrolled(e.target.scrollTop > 50);
    };
    const container = document.getElementById('preview-scroll-container');
    if (container) container.addEventListener('scroll', handleScroll);
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div 
      id="preview-scroll-container"
      className="w-full h-full overflow-y-auto text-slate-200"
      style={{
        backgroundColor: '#0f172a',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 'var(--base-size)',
        lineHeight: 'var(--line-height)',
        letterSpacing: 'var(--letter-spacing)'
      }}
    >
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#0f172a] border-b border-slate-800 px-8 transition-shadow" style={{ boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.5)' : 'none' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <span 
            className="font-extrabold text-xl tracking-tight"
            style={{ color: accentColor }}
          >
            {businessName}
          </span>
          {devicePreview === 'desktop' && (
            <div className="flex gap-8 text-sm font-bold text-slate-400">
              <a href="#home" className="hover:text-slate-100 transition-colors">Home</a>
              <a href="#products" className="hover:text-slate-100 transition-colors">Catalog</a>
              <a href="#contact" className="hover:text-slate-100 transition-colors">Contact</a>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header 
        className="min-h-[90vh] flex items-center px-8 py-16"
        style={{ background: 'linear-gradient(135deg, #0f172a 50%, #1e293b)' }}
      >
        <div className={`max-w-7xl mx-auto grid ${devicePreview === 'desktop' ? 'grid-cols-2' : 'grid-cols-1 text-center'} gap-16 items-center w-full`}>
          <div>
            <div 
              className="inline-block px-3 py-1 rounded text-xs font-bold tracking-widest uppercase mb-6"
              style={{ backgroundColor: `${accentColor}26`, border: `1px solid ${accentColor}4D`, color: accentColor }}
            >
              Next-Gen Store
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-100 leading-tight mb-5 tracking-tight">
              {storeName}
            </h1>
            <p className={`text-slate-400 text-lg leading-relaxed mb-10 ${devicePreview === 'desktop' ? 'max-w-md' : 'mx-auto'}`}>
              {description}
            </p>
            <div className={`flex flex-wrap gap-4 ${devicePreview !== 'desktop' ? 'justify-center' : ''}`}>
              <a 
                href="#products" 
                className="px-7 py-3 rounded-lg font-extrabold text-[#0f172a] hover:opacity-85 transition-opacity"
                style={{ backgroundColor: accentColor }}
              >
                Browse Catalog
              </a>
              {phoneNumber && (
                <a 
                  href="#contact" 
                  className="px-7 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg font-bold hover:border-slate-500 transition-colors flex items-center"
                >
                  <FaWhatsapp className="mr-2 text-green-500" /> WhatsApp
                </a>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <div 
              className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden border-2 border-slate-800"
              style={{ boxShadow: `0 0 60px ${accentColor}26` }}
            >
              <img src={heroImage} className="w-full h-full object-cover" alt="Hero" />
            </div>
          </div>
        </div>
      </header>

      {/* PRODUCTS */}
      <section id="products" className="max-w-7xl mx-auto px-8 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-100 mb-1">Product Catalog</h2>
            <div className="w-12 h-[3px] rounded-full" style={{ backgroundColor: accentColor }}></div>
          </div>
          <span className="text-sm text-slate-500 font-bold">{products.length} items</span>
        </div>
        
        <div 
          className="grid gap-6"
          style={{ 
            gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
              : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
              : `repeat(${config.products.columnsDesktop || 4}, minmax(0, 1fr))`
          }}
        >
          {products.slice(0, 8).map((product, i) => (
            <div 
              key={product.id || i}
              className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden group hover:-translate-y-1.5 transition-transform"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <div className="h-56 overflow-hidden bg-slate-900">
                <img 
                  src={product.img || `https://picsum.photos/seed/${product.name}${i}/600/600`}
                  alt={product.name}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="p-5">
                <div 
                  className="text-[0.65rem] font-bold tracking-[0.12em] uppercase mb-1.5"
                  style={{ color: accentColor }}
                >
                  Product
                </div>
                <h4 className="font-extrabold text-slate-100 text-base mb-1 truncate">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-extrabold text-lg" style={{ color: accentColor }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <button 
                    data-cart-add="true"
                    data-product-name={product.name}
                    data-product-price={product.price}
                    data-product-image={product.img || `https://picsum.photos/seed/${product.name}${i}/600/600`}
                    className="text-[#0f172a] px-4 py-2 rounded-md font-bold text-xs hover:opacity-85 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-[#020617] py-16 px-8 mt-16">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-extrabold text-slate-100 mb-2">Get in Touch</h3>
          <p className="text-slate-500 mb-8">Questions? We're always online.</p>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-left leading-loose">
            {phoneNumber && <p><strong style={{ color: accentColor }}>Phone:</strong> {phoneNumber}</p>}
            {email && <p><strong style={{ color: accentColor }}>Email:</strong> {email}</p>}
            {address && <p><strong style={{ color: accentColor }}>Address:</strong> {address}</p>}
          </div>
        </div>
      </section>

      <footer className="bg-[#020617] border-t border-slate-800 p-8 text-center text-slate-500 text-sm">
        <p>© 2026 {storeName}. Powered by <span style={{ color: accentColor, fontWeight: 'bold' }}>VendorBuild</span></p>
      </footer>
    </div>
  );
}

export default TemplateSlate;
