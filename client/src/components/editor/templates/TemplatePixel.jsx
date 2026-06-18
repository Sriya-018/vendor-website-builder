import React, { useEffect, useState } from 'react';

function TemplatePixel({ config, business, products, devicePreview, website }) {
  const [scrolled, setScrolled] = useState(false);

  const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'My Store');
  const storeName = website?.storeName || business?.businessName || 'My Store';
  const description = config.header.heroHeading || business?.description || 'High-performance gear for every setup.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const primaryColor = '#020617'; 
  const accentColor = config.themeColor || '#10B981'; // Emerald 500

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
      className="w-full h-full overflow-y-auto"
      style={{
        backgroundColor: '#020617',
        color: '#e2e8f0',
        fontFamily: "'Sora', sans-serif",
        fontSize: 'var(--base-size)',
        lineHeight: 'var(--line-height)',
        letterSpacing: 'var(--letter-spacing)'
      }}
    >
      {/* NAV */}
      <nav 
        className="sticky top-0 z-50 bg-[#020617] border-b border-[#0f172a] px-8" 
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-[3.75rem]">
          <span 
            className="text-[1.2rem]"
            style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
          >
            &gt; {businessName}_
          </span>
          {devicePreview === 'desktop' && (
            <div className="flex gap-8 text-[0.82rem] font-semibold tracking-[0.06em] uppercase" style={{ color: '#64748b' }}>
              <a href="#home" className="hover:text-emerald-500 transition-colors">Home</a>
              <a href="#products" className="hover:text-emerald-500 transition-colors">Store</a>
              <a href="#contact" className="hover:text-emerald-500 transition-colors">Contact</a>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header 
        className="py-20 px-8 border-b border-[#1e293b]"
        style={{ background: 'linear-gradient(180deg, #020617, #0f172a)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div 
            className="text-[0.75rem] mb-4 tracking-[0.1em]"
            style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
          >
            // WELCOME TO {businessName.toUpperCase()}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-5 tracking-[-0.03em] text-[#f8fafc]">
            {storeName}<span style={{ color: accentColor }}>.</span>
          </h1>
          <p className="text-[#94a3b8] text-[1rem] max-w-[500px] leading-[1.7] mb-10">
            {description}
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="#products" 
              className="px-7 py-3 rounded text-[#020617] font-extrabold text-[0.9rem] hover:opacity-85 transition-opacity"
              style={{ backgroundColor: accentColor }}
            >
              Browse Store
            </a>
            {phoneNumber && (
              <a 
                href="#contact" 
                className="px-7 py-3 rounded bg-transparent border font-bold text-[0.9rem] hover:bg-emerald-500 hover:text-[#020617] transition-colors"
                style={{ borderColor: accentColor, color: accentColor }}
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </header>

      {/* PRODUCTS */}
      <section id="products" className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex items-center gap-4 mb-8">
          <div 
            className="text-[0.7rem] tracking-[0.1em]"
            style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
          >
            // PRODUCT_CATALOG
          </div>
          <div className="flex-1 h-[1px] bg-[#1e293b]"></div>
          <span className="text-[0.78rem] text-[#475569]">{products.length} items</span>
        </div>
        
        <div 
          className="grid gap-5"
          style={{ 
            gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
              : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
              : `repeat(${config.products.columnsDesktop || 4}, minmax(0, 1fr))`
          }}
        >
          {products.slice(0, 8).map((product, i) => (
            <div 
              key={product.id || i}
              className="bg-[#0f172a] border border-[#1e293b] rounded-lg overflow-hidden hover:border-emerald-500 transition-colors group"
            >
              <div className="h-[200px] overflow-hidden bg-[#020617] relative">
                <img 
                  src={product.img || `https://picsum.photos/seed/pixel${i}/600/600`}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div 
                  className="absolute top-2.5 right-2.5 bg-emerald-500/20 border px-2 py-0.5 rounded text-[0.65rem] font-bold tracking-[0.08em]"
                  style={{ color: accentColor, borderColor: accentColor }}
                >
                  IN STOCK
                </div>
              </div>
              <div className="p-4">
                <h4 
                  className="font-bold text-[#e2e8f0] text-[0.95rem] mb-1.5 truncate"
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mt-2">
                  <span 
                    className="font-extrabold text-[1.05rem]"
                    style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    ${product.price.toFixed(2)}
                  </span>
                  <button 
                    data-cart-add="true"
                    data-product-name={product.name}
                    data-product-price={product.price}
                    data-product-image={product.img || `https://picsum.photos/seed/pixel${i}/600/600`}
                    className="bg-transparent border px-3.5 py-1.5 rounded text-[0.78rem] font-bold hover:bg-emerald-500 hover:text-[#020617] transition-colors"
                    style={{ color: accentColor, borderColor: accentColor }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-[#0f172a] border-t border-[#1e293b] py-16 px-8">
        <div className="max-w-3xl mx-auto">
          <div 
            className="text-[0.7rem] mb-4"
            style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
          >
            // CONTACT_INFO
          </div>
          <div className="bg-[#020617] border border-[#1e293b] rounded-lg p-8 leading-[2.2] text-[#94a3b8]">
            {phoneNumber && <p><strong style={{ color: accentColor }}>Phone:</strong> {phoneNumber}</p>}
            {email && <p><strong style={{ color: accentColor }}>Email:</strong> {email}</p>}
            {address && <p><strong style={{ color: accentColor }}>Address:</strong> {address}</p>}
          </div>
        </div>
      </section>

      <footer className="bg-[#020617] border-t border-[#0f172a] py-6 text-center text-[#334155] text-[0.78rem]" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
        <p>// © 2026 {storeName}. Powered by VendorBuild</p>
      </footer>
    </div>
  );
}

export default TemplatePixel;
