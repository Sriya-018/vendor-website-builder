import React, { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

function TemplateGlow({ config, business, products, devicePreview, website }) {
  const [scrolled, setScrolled] = useState(false);

  const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'My Store');
  const storeName = website?.storeName || business?.businessName || 'My Store';
  const logo = website?.storeInfo?.logo ?? business?.logo ?? null;
  const fullLogoUrl = logo ? (logo.startsWith('http') ? logo : `http://localhost:5000${logo}`) : null;
  const description = config.header.heroHeading || business?.description || 'Pure. Natural. Sustainable.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const primaryColor = '#064E3B'; // Emerald 900
  const accentColor = config.themeColor || '#10B981'; // Emerald 500
  const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=80';

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
        backgroundColor: '#f0fdf4',
        color: '#064e3b',
        fontFamily: "'Nunito', sans-serif",
        fontSize: 'var(--base-size)',
        lineHeight: 'var(--line-height)',
        letterSpacing: 'var(--letter-spacing)'
      }}
    >
      {/* NAV */}
      <nav 
        className="sticky top-0 z-50 bg-white border-b-2 border-emerald-100 transition-all px-8" 
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-[1.4rem]">🌿</span>
            <span className="font-black text-[1.3rem]" style={{ color: primaryColor }}>
              {businessName}
            </span>
          </div>
          {devicePreview === 'desktop' && (
            <div className="flex gap-8 text-[0.9rem] font-bold text-emerald-800">
              <a href="#home" className="hover:text-emerald-500 transition-colors">Home</a>
              <a href="#products" className="hover:text-emerald-500 transition-colors">Shop</a>
              <a href="#contact" className="hover:text-emerald-500 transition-colors">Contact</a>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} className="w-full h-full object-cover" alt="Hero" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(6,78,59,0.88) 40%, rgba(16,185,129,0.4))' }}></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full py-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 rounded-full text-[0.75rem] font-bold text-emerald-200 border border-emerald-200/30 mb-6 backdrop-blur-sm">
            🌱 100% Natural & Organic
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-[1.1] mb-5 tracking-[-0.02em] text-white">
            {storeName}
          </h1>
          <p className="text-white/85 text-[1.1rem] max-w-lg leading-[1.7] mb-10">
            {description}
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="#products" 
              className="px-8 py-3.5 bg-white rounded-full font-extrabold hover:scale-105 transition-transform shadow-[0_4px_14px_rgba(255,255,255,0.3)]"
              style={{ color: primaryColor }}
            >
              Shop Natural 🌿
            </a>
            {phoneNumber && (
              <a 
                href="#contact" 
                className="px-8 py-3.5 bg-white/15 border border-white/40 rounded-full font-bold text-white hover:bg-white/25 transition-colors backdrop-blur-sm flex items-center"
              >
                <FaWhatsapp className="mr-2" /> Chat with Us
              </a>
            )}
          </div>
        </div>
      </header>

      {/* PRODUCTS */}
      <section id="products" className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-[2.25rem] font-black mb-2" style={{ color: primaryColor }}>
            Natural Collection
          </h2>
          <p className="text-gray-500">Ethically sourced. Sustainably packaged.</p>
        </div>
        
        <div 
          className="grid gap-7"
          style={{ 
            gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
              : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
              : `repeat(${config.products.columnsDesktop || 3}, minmax(0, 1fr))`
          }}
        >
          {products.slice(0, 6).map((product, i) => (
            <div 
              key={product.id || i}
              className="bg-white rounded-2xl overflow-hidden border border-emerald-100 hover:shadow-[0_16px_36px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-[230px] overflow-hidden bg-emerald-50">
                <img 
                  src={product.img || `https://picsum.photos/seed/organic${i}/600/600`}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="inline-block bg-emerald-100 text-emerald-900 text-[0.65rem] font-bold px-2.5 py-1 rounded-full tracking-[0.08em] uppercase mb-2">
                  🌿 Natural
                </div>
                <h4 className="font-bold text-[1rem] mb-4 truncate" style={{ color: primaryColor }}>
                  {product.name}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[1.1rem]" style={{ color: accentColor }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <button 
                    data-cart-add="true"
                    data-product-name={product.name}
                    data-product-price={product.price}
                    data-product-image={product.img || `https://picsum.photos/seed/organic${i}/600/600`}
                    className="text-white px-5 py-2.5 rounded-full font-bold text-[0.85rem] hover:opacity-90 transition-opacity whitespace-nowrap ml-4 flex-shrink-0"
                    style={{ backgroundColor: accentColor || '#10B981', color: '#ffffff' }}
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
      <section id="contact" className="bg-emerald-50 py-16 px-8 text-center">
        <h3 className="text-[2rem] font-black mb-6" style={{ color: primaryColor }}>
          🌿 Get in Touch
        </h3>
        <div className="inline-block bg-white border border-emerald-100 rounded-2xl p-8 text-left shadow-sm min-w-[300px]">
          {phoneNumber && <p className="mb-2"><strong style={{ color: accentColor }}>Phone:</strong> {phoneNumber}</p>}
          {email && <p className="mb-2"><strong style={{ color: accentColor }}>Email:</strong> {email}</p>}
          {address && <p className="mb-2"><strong style={{ color: accentColor }}>Address:</strong> {address}</p>}
        </div>
      </section>

      <footer className="py-8 text-center text-[0.85rem]" style={{ backgroundColor: primaryColor, color: 'rgba(167,243,208,0.7)' }}>
        <p>© 2026 {storeName}. Powered by <span className="text-emerald-200 font-bold">VendorBuild</span></p>
      </footer>
    </div>
  );
}

export default TemplateGlow;
