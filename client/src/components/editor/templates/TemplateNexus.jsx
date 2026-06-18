import React, { useEffect, useState } from 'react';
import { FaPhoneAlt, FaBriefcase } from 'react-icons/fa';

function TemplateNexus({ config, business, products, devicePreview, website }) {
  const [scrolled, setScrolled] = useState(false);

  const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'My Business');
  const storeName = website?.storeName || business?.businessName || 'My Store';
  const description = config.header.heroHeading || business?.description || 'Professional services you can trust.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const primaryColor = '#1E3A8A'; // Blue 900
  const accentColor = config.themeColor || '#2563EB'; // Blue 600
  const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80';

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
        backgroundColor: '#f8fafc',
        color: '#1e3a8a',
        fontFamily: "'Manrope', sans-serif",
        fontSize: 'var(--base-size)',
        lineHeight: 'var(--line-height)',
        letterSpacing: 'var(--letter-spacing)'
      }}
    >
      {/* NAV */}
      <nav 
        className="sticky top-0 z-50 bg-white border-b border-blue-50 transition-shadow px-8" 
        style={{ boxShadow: scrolled ? '0 4px 12px rgba(37,99,235,0.08)' : 'none' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded text-white flex items-center justify-center text-sm"
              style={{ backgroundColor: accentColor }}
            >
              <FaBriefcase />
            </div>
            <span className="font-extrabold text-xl tracking-tight" style={{ color: primaryColor }}>
              {businessName}
            </span>
          </div>
          {devicePreview === 'desktop' && (
            <div className="flex gap-8 text-sm font-bold text-slate-500">
              <a href="#home" className="hover:text-blue-600 transition-colors">Home</a>
              <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
              <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
          )}
          {phoneNumber && devicePreview === 'desktop' && (
            <a 
              href="#contact" 
              className="px-5 py-2.5 text-white rounded font-bold text-sm hover:opacity-85 transition-opacity flex items-center"
              style={{ backgroundColor: accentColor }}
            >
              <FaPhoneAlt className="mr-2" /> {phoneNumber}
            </a>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header 
        className="py-24 px-8 text-white"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` }}
      >
        <div className={`max-w-7xl mx-auto grid ${devicePreview === 'desktop' ? 'grid-cols-2' : 'grid-cols-1'} gap-16 items-center`}>
          <div>
            <div className="inline-block px-3.5 py-1 bg-white/15 border border-white/25 rounded-full text-xs font-bold tracking-[0.1em] uppercase mb-6 backdrop-blur-sm">
              Trusted Business
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] mb-5">
              {storeName}
            </h1>
            <p className="text-white/85 text-lg leading-relaxed mb-10 max-w-md">
              {description}
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#services" 
                className="px-7 py-3.5 bg-white rounded-lg font-extrabold hover:opacity-90 transition-opacity"
                style={{ color: primaryColor }}
              >
                Our Services
              </a>
              <a 
                href="#contact" 
                className="px-7 py-3.5 bg-white/15 border border-white/35 rounded-lg font-bold hover:bg-white/25 transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-white/10 border border-white/20 p-2">
              <img src={heroImage} className="w-full h-full object-cover rounded-xl" alt="Hero" />
            </div>
          </div>
        </div>
      </header>

      {/* SERVICES */}
      <section id="services" className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold mb-2" style={{ color: primaryColor }}>
            Our Services
          </h2>
          <div className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: accentColor }}></div>
        </div>
        
        <div 
          className="grid gap-8"
          style={{ 
            gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
              : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
              : `repeat(${config.products.columnsDesktop || 3}, minmax(0, 1fr))`
          }}
        >
          {products.slice(0, 6).map((product, i) => (
            <div 
              key={product.id || i}
              className="bg-white rounded-xl overflow-hidden border border-blue-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-48 overflow-hidden bg-blue-50">
                <img 
                  src={product.img || `https://picsum.photos/seed/service${i}/600/600`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="text-[0.65rem] font-bold tracking-[0.1em] uppercase mb-1.5" style={{ color: accentColor }}>
                  Service
                </div>
                <h4 className="font-extrabold text-lg mb-4 truncate" style={{ color: primaryColor }}>
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-extrabold text-xl" style={{ color: accentColor }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <button 
                    data-cart-add="true"
                    data-product-name={product.name}
                    data-product-price={product.price}
                    data-product-image={product.img || `https://picsum.photos/seed/service${i}/600/600`}
                    className="text-white px-4 py-2 rounded-md font-bold text-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                  >
                    Get Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-blue-50 py-16 px-8 text-center border-t border-blue-100">
        <h3 className="text-3xl font-extrabold mb-8" style={{ color: primaryColor }}>
          Contact Us
        </h3>
        <div className="inline-block bg-white rounded-xl p-8 text-left shadow-[0_4px_16px_rgba(37,99,235,0.07)] border border-blue-50 min-w-[300px]">
          {phoneNumber && <p className="mb-3 font-medium text-slate-700"><strong style={{ color: accentColor }}>Phone:</strong> {phoneNumber}</p>}
          {email && <p className="mb-3 font-medium text-slate-700"><strong style={{ color: accentColor }}>Email:</strong> {email}</p>}
          {address && <p className="mb-3 font-medium text-slate-700"><strong style={{ color: accentColor }}>Address:</strong> {address}</p>}
        </div>
      </section>

      <footer className="py-8 text-center" style={{ backgroundColor: primaryColor, color: 'rgba(255,255,255,0.6)' }}>
        <p className="font-medium text-sm">© 2026 {storeName}. Powered by <span className="text-blue-300 font-bold">VendorBuild</span></p>
      </footer>
    </div>
  );
}

export default TemplateNexus;
