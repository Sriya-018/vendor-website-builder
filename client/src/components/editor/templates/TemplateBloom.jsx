import React, { useEffect, useState } from 'react';
import { FaWhatsapp, FaStore } from 'react-icons/fa';

function TemplateBloom({ config, business, products, devicePreview, website }) {
  const [scrolled, setScrolled] = useState(false);

  const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'My Store');
  const storeName = website?.storeName || business?.businessName || 'My Store';
  const description = config.header.heroHeading || business?.description || 'Radiant beauty, naturally curated.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const primaryColor = '#831843'; // Rose 900
  const accentColor = config.themeColor || '#EC4899'; // Pink 500

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
        backgroundColor: '#fff0f6',
        color: '#3d1a27',
        fontFamily: "'Lato', sans-serif",
        fontSize: 'var(--base-size)',
        lineHeight: 'var(--line-height)',
        letterSpacing: 'var(--letter-spacing)'
      }}
    >
      {/* NAV */}
      <nav 
        className="sticky top-0 z-50 border-b transition-all px-8" 
        style={{ 
          backgroundColor: 'rgba(255,240,246,0.95)', 
          backdropFilter: 'blur(10px)', 
          borderColor: '#fbcfe8',
          boxShadow: scrolled ? '0 2px 10px rgba(236,72,153,0.1)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <span 
            className="font-extrabold text-2xl tracking-tight"
            style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
          >
            {businessName}
          </span>
          {devicePreview === 'desktop' && (
            <div className="flex gap-8 text-sm font-bold" style={{ color: primaryColor }}>
              <a href="#home" className="hover:opacity-70 transition-opacity">Home</a>
              <a href="#products" className="hover:opacity-70 transition-opacity">Shop</a>
              <a href="#contact" className="hover:opacity-70 transition-opacity">Contact</a>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header 
        className="py-20 px-8 text-center"
        style={{ background: 'linear-gradient(180deg, #fff0f6, #fce7f3)' }}
      >
        <div className="max-w-3xl mx-auto">
          <p 
            className="text-xs font-bold tracking-[0.15em] uppercase mb-4"
            style={{ color: accentColor }}
          >
            ✦ Beauty & Wellness ✦
          </p>
          <h1 
            className="text-5xl md:text-6xl font-extrabold leading-tight mb-5"
            style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
          >
            {storeName}
          </h1>
          <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: '#9d8189' }}>
            {description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#products" 
              className="px-8 py-3.5 text-white rounded-full font-bold shadow-md hover:scale-105 transition-transform"
              style={{ backgroundColor: accentColor, boxShadow: `0 4px 14px ${accentColor}59` }}
            >
              Explore Collection
            </a>
            {phoneNumber && (
              <a 
                href="#contact" 
                className="px-8 py-3.5 bg-white rounded-full font-bold border-2 hover:text-white transition-colors flex items-center"
                style={{ color: primaryColor, borderColor: accentColor }}
              >
                <FaWhatsapp className="mr-2 text-green-500" /> Chat with Us
              </a>
            )}
          </div>
        </div>
      </header>

      {/* PRODUCTS */}
      <section id="products" className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 
            className="text-4xl font-extrabold mb-2"
            style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
          >
            Our Collection
          </h2>
          <p style={{ color: '#9d8189' }}>Handpicked with love, just for you</p>
        </div>
        
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
              className="bg-white rounded-3xl overflow-hidden hover:-translate-y-1.5 transition-transform group"
              style={{ boxShadow: `0 2px 12px ${accentColor}14` }}
            >
              <div className="h-60 overflow-hidden bg-[#fce7f3]">
                <img 
                  src={product.img || `https://picsum.photos/seed/beauty${i}/600/600`}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 text-center">
                <h4 
                  className="text-lg font-bold mb-1 truncate"
                  style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
                >
                  {product.name}
                </h4>
                <p className="font-bold text-lg mb-4" style={{ color: accentColor }}>
                  ${product.price.toFixed(2)}
                </p>
                <button 
                  data-cart-add="true"
                  data-product-name={product.name}
                  data-product-price={product.price}
                  data-product-image={product.img || `https://picsum.photos/seed/beauty${i}/600/600`}
                  className="px-6 py-2.5 text-white rounded-full font-bold text-sm hover:opacity-85 transition-opacity"
                  style={{ backgroundColor: accentColor }}
                >
                  Add to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-[#fce7f3] py-16 px-8 text-center">
        <h3 
          className="text-3xl font-bold mb-6"
          style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
        >
          Say Hello 👋
        </h3>
        <div className="inline-block bg-white rounded-2xl p-8 text-left shadow-sm min-w-[300px]">
          {phoneNumber && <p className="mb-2"><strong style={{ color: accentColor }}>Phone:</strong> {phoneNumber}</p>}
          {email && <p className="mb-2"><strong style={{ color: accentColor }}>Email:</strong> {email}</p>}
          {address && <p><strong style={{ color: accentColor }}>Address:</strong> {address}</p>}
        </div>
      </section>

      <footer className="py-8 text-center text-sm" style={{ backgroundColor: primaryColor, color: 'rgba(255,255,255,0.7)' }}>
        <p>© 2026 {storeName}. Powered by <span style={{ color: '#fbcfe8', fontWeight: 'bold' }}>VendorBuild</span></p>
      </footer>
    </div>
  );
}

export default TemplateBloom;
