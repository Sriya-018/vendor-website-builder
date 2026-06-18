import React, { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

function TemplateHaven({ config, business, products, devicePreview, website }) {
  const [scrolled, setScrolled] = useState(false);

  const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'My Store');
  const storeName = website?.storeName || business?.businessName || 'My Store';
  const logo = website?.storeInfo?.logo ?? business?.logo ?? null;
  const fullLogoUrl = logo ? (logo.startsWith('http') ? logo : `http://localhost:5000${logo}`) : null;
  const description = config.header.heroHeading || business?.description || 'Warm, inviting spaces for the modern home.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const primaryColor = '#451A03'; // Amber 900
  const accentColor = config.themeColor || '#D97706'; // Amber 600
  const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80';

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
        backgroundColor: '#fefce8',
        color: '#451a03',
        fontFamily: "'Jost', sans-serif",
        fontSize: 'var(--base-size)',
        lineHeight: 'var(--line-height)',
        letterSpacing: 'var(--letter-spacing)'
      }}
    >
      {/* NAV */}
      <nav 
        className="sticky top-0 z-50 transition-all px-8 border-b-2" 
        style={{ 
          backgroundColor: '#fef3c7',
          borderColor: '#fde68a',
          boxShadow: scrolled ? '0 4px 12px rgba(69,26,3,0.05)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-[4.5rem]">
          <span 
            className="font-bold text-[1.6rem]"
            style={{ color: primaryColor, fontFamily: "'Cormorant Garamond', serif" }}
          >
            {businessName}
          </span>
          {devicePreview === 'desktop' && (
            <div className="flex gap-8 text-[0.9rem] font-medium" style={{ color: '#92400e' }}>
              <a href="#home" className="hover:text-amber-900 transition-colors">Home</a>
              <a href="#products" className="hover:text-amber-900 transition-colors">Shop</a>
              <a href="#contact" className="hover:text-amber-900 transition-colors">Contact</a>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} className="w-full h-full object-cover" alt="Hero" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(69,26,3,0.85) 40%, rgba(69,26,3,0.3))' }}></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-lg">
            <p 
              className="text-xs font-semibold tracking-[0.15em] uppercase mb-4"
              style={{ color: accentColor }}
            >
              Home & Living
            </p>
            <h1 
              className="text-5xl md:text-7xl font-bold leading-[1.15] mb-5 text-[#fef3c7]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {storeName}
            </h1>
            <p className="text-lg text-[#fef3c7]/85 mb-10 leading-relaxed">
              {description}
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#products" 
                className="px-8 py-3.5 text-white rounded font-semibold hover:opacity-85 transition-opacity"
                style={{ backgroundColor: accentColor }}
              >
                Browse Collection
              </a>
              {phoneNumber && (
                <a 
                  href="#contact" 
                  className="px-8 py-3.5 rounded font-semibold border hover:bg-[#fef3c7]/25 transition-colors flex items-center"
                  style={{ backgroundColor: 'rgba(254,243,199,0.15)', color: '#fef3c7', borderColor: 'rgba(254,243,199,0.4)' }}
                >
                  <FaWhatsapp className="mr-2" /> WhatsApp Us
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* PRODUCTS */}
      <section id="products" className="max-w-7xl mx-auto px-8 py-24">
        <h2 
          className="text-[2.5rem] font-bold mb-2 text-center"
          style={{ color: primaryColor, fontFamily: "'Cormorant Garamond', serif" }}
        >
          Our Collection
        </h2>
        <div className="w-16 h-0.5 mx-auto mb-12" style={{ backgroundColor: accentColor }}></div>
        
        <div 
          className="grid gap-8"
          style={{ 
            gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
              : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
              : `repeat(${config.products.columnsDesktop || 4}, minmax(0, 1fr))`
          }}
        >
          {products.slice(0, 8).map((product, i) => (
            <div 
              key={product.id || i}
              className="bg-[#fefce8] rounded-lg overflow-hidden border border-[#fef08a] hover:shadow-[0_16px_40px_rgba(217,119,6,0.2)] transition-shadow"
            >
              <div className="h-60 overflow-hidden">
                <img 
                  src={product.img || `https://picsum.photos/seed/home${i}/600/600`}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h4 
                  className="text-lg font-bold mb-1 truncate"
                  style={{ color: primaryColor, fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold text-[1.1rem]" style={{ color: accentColor }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <button 
                    data-cart-add="true"
                    data-product-name={product.name}
                    data-product-price={product.price}
                    data-product-image={product.img || `https://picsum.photos/seed/home${i}/600/600`}
                    className="text-[#fef3c7] px-4 py-2 rounded font-bold text-sm hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-[#fef3c7] py-16 px-8 text-center">
        <h3 
          className="text-[2rem] font-bold mb-6"
          style={{ color: primaryColor, fontFamily: "'Cormorant Garamond', serif" }}
        >
          Get in Touch
        </h3>
        <div className="inline-block bg-[#fffbf0] rounded-xl p-8 text-left shadow-sm min-w-[300px] border border-[#fde68a]">
          {phoneNumber && <p className="mb-2"><strong style={{ color: accentColor }}>Phone:</strong> {phoneNumber}</p>}
          {email && <p className="mb-2"><strong style={{ color: accentColor }}>Email:</strong> {email}</p>}
          {address && <p className="mb-2"><strong style={{ color: accentColor }}>Address:</strong> {address}</p>}
        </div>
      </section>

      <footer className="py-8 text-center text-[0.85rem]" style={{ backgroundColor: primaryColor, color: 'rgba(254,243,199,0.65)' }}>
        <p>© 2026 {storeName}. Powered by <span style={{ color: accentColor, fontWeight: 'bold' }}>VendorBuild</span></p>
      </footer>
    </div>
  );
}

export default TemplateHaven;
