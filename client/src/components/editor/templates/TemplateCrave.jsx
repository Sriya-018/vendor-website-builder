import React, { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

function TemplateCrave({ config, business, products, devicePreview, website }) {
  const [scrolled, setScrolled] = useState(false);

  const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'My Restaurant');
  const storeName = website?.storeName || business?.businessName || 'My Store';
  const logo = website?.storeInfo?.logo ?? business?.logo ?? null;
  const fullLogoUrl = logo ? (logo.startsWith('http') ? logo : `http://localhost:5000${logo}`) : null;
  const description = config.header.heroHeading || business?.description || 'Fresh flavors, unforgettable taste.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const primaryColor = '#7C2D12'; // Orange 900
  const accentColor = config.themeColor || '#F97316'; // Orange 500
  const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';

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
        backgroundColor: '#fffbeb', // Amber 50
        color: '#451a03', // Amber 900
        fontFamily: "'Inter', sans-serif",
        fontSize: 'var(--base-size)',
        lineHeight: 'var(--line-height)',
        letterSpacing: 'var(--letter-spacing)'
      }}
    >
      {/* NAV */}
      <nav 
        className="sticky top-0 z-50 transition-all px-8 border-b" 
        style={{ 
          backgroundColor: scrolled ? 'rgba(255, 251, 235, 0.95)' : 'transparent',
          borderColor: scrolled ? '#fde68a' : 'transparent',
          backdropFilter: scrolled ? 'blur(8px)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
          <span 
            className="font-extrabold text-3xl tracking-tight"
            style={{ color: scrolled ? primaryColor : 'white', fontFamily: "'Lobster', cursive" }}
          >
            {businessName}
          </span>
          {devicePreview === 'desktop' && (
            <div className={`flex gap-8 font-bold ${scrolled ? 'text-amber-900' : 'text-white'}`}>
              <a href="#home" className="hover:opacity-80 transition-opacity">Menu</a>
              <a href="#contact" className="hover:opacity-80 transition-opacity">Location</a>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header className="relative -mt-20 pt-20 flex items-center justify-center min-h-[70vh] text-center px-8">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} className="w-full h-full object-cover" alt="Hero" />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto py-16">
          <h1 
            className="text-5xl md:text-7xl text-white mb-6"
            style={{ fontFamily: "'Lobster', cursive" }}
          >
            {storeName}
          </h1>
          <p className="text-xl text-amber-50 mb-10 font-medium">
            {description}
          </p>
          <a 
            href="#products" 
            className="inline-block px-10 py-4 text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
            style={{ backgroundColor: accentColor }}
          >
            See Our Menu
          </a>
        </div>
      </header>

      {/* PRODUCTS */}
      <section id="products" className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 
            className="text-5xl mb-4"
            style={{ color: primaryColor, fontFamily: "'Lobster', cursive" }}
          >
            Featured Menu
          </h2>
          <div className="w-24 h-1 mx-auto" style={{ backgroundColor: accentColor }}></div>
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
              className="bg-white rounded-2xl overflow-hidden border hover:scale-[1.02] transition-all duration-300"
              style={{ borderColor: '#fde68a', boxShadow: `0 12px 30px ${accentColor}26` }}
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={product.img || `https://picsum.photos/seed/food${i}/600/600`}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h4 
                  className="text-xl mb-2 truncate"
                  style={{ color: primaryColor, fontFamily: "'Lobster', cursive" }}
                >
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-extrabold text-xl" style={{ color: accentColor }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <button 
                    data-cart-add="true"
                    data-product-name={product.name}
                    data-product-price={product.price}
                    data-product-image={product.img || `https://picsum.photos/seed/food${i}/600/600`}
                    className="text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                  >
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-[#fef3c7] py-20 px-8 text-center border-t border-[#fde68a]">
        <h3 
          className="text-4xl mb-6"
          style={{ color: primaryColor, fontFamily: "'Lobster', cursive" }}
        >
          Visit Us
        </h3>
        <div className="inline-block bg-white rounded-2xl p-8 text-left shadow-sm min-w-[300px] border border-[#fde68a]">
          {phoneNumber && <p className="mb-3 font-medium"><strong style={{ color: accentColor }}>Phone:</strong> {phoneNumber}</p>}
          {email && <p className="mb-3 font-medium"><strong style={{ color: accentColor }}>Email:</strong> {email}</p>}
          {address && <p className="mb-3 font-medium"><strong style={{ color: accentColor }}>Address:</strong> {address}</p>}
        </div>
      </section>

      <footer className="py-10 text-center" style={{ backgroundColor: primaryColor, color: '#fde68a' }}>
        <p className="font-medium text-sm">© 2026 {storeName}. Powered by <span className="text-white font-bold">VendorBuild</span></p>
      </footer>
    </div>
  );
}

export default TemplateCrave;
