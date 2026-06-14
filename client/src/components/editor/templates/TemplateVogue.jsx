import React, { useEffect, useState } from 'react';
import { FaShoppingBag, FaArrowRight } from 'react-icons/fa';

function TemplateVogue({ config, business, products, devicePreview }) {
  const [scrolled, setScrolled] = useState(false);

  const businessName = config.navbar.logoText || business?.businessName || 'My Store';
  const description = config.header.heroHeading || business?.description || 'Curated fashion for the bold.';
  const phoneNumber = business?.contact?.phone || '';
  const email = business?.contact?.email || '';
  const address = business?.location?.address || '';
  
  const primaryColor = '#000000'; 
  const accentColor = config.themeColor || '#6B7280'; // Gray 500
  const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80';

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
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 'var(--base-size)',
        lineHeight: 'var(--line-height)',
        letterSpacing: 'var(--letter-spacing)'
      }}
    >
      {/* TOP BAR */}
      <div className="bg-black text-white text-center py-2 text-[0.75rem] tracking-[0.1em] uppercase">
        Free shipping on orders over $100
      </div>

      {/* NAV */}
      <nav 
        className="sticky top-0 z-50 bg-white border-b-2 border-black transition-all px-8" 
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-[4.5rem]">
          <span 
            className="font-bold text-[1.8rem] tracking-[-0.02em]"
            style={{ fontFamily: "'Bodoni Moda', serif" }}
          >
            {businessName}
          </span>
          {devicePreview === 'desktop' && (
            <div className="flex gap-10 text-[0.8rem] font-medium tracking-[0.08em] uppercase">
              <a href="#home" className="hover:border-b border-black pb-0.5 transition-all">Home</a>
              <a href="#collection" className="hover:border-b border-black pb-0.5 transition-all">Collection</a>
              <a href="#contact" className="hover:border-b border-black pb-0.5 transition-all">Contact</a>
            </div>
          )}
          <FaShoppingBag className="text-xl cursor-pointer" />
        </div>
      </nav>

      {/* HERO */}
      <header className="relative h-[90vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gray-100">
          <img src={heroImage} className="w-full h-full object-cover grayscale-[30%]" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full pb-16">
          <div className="max-w-2xl">
            <p className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-white/65 mb-3">
              New Season
            </p>
            <h1 
              className="text-5xl md:text-7xl font-bold leading-[1.05] text-white mb-6 tracking-[-0.02em]"
              style={{ fontFamily: "'Bodoni Moda', serif" }}
            >
              {description}
            </h1>
            <a 
              href="#collection" 
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold text-[0.85rem] tracking-[0.08em] uppercase hover:bg-gray-100 transition-colors"
            >
              Shop Collection <FaArrowRight />
            </a>
          </div>
        </div>
      </header>

      {/* COLLECTION */}
      <section id="collection" className="py-16">
        <div className="max-w-7xl mx-auto px-8 mb-8 border-b border-gray-200 pb-4 flex items-center justify-between">
          <h2 className="text-[1.75rem] font-semibold" style={{ fontFamily: "'Bodoni Moda', serif" }}>
            The Collection
          </h2>
          <span className="text-[0.8rem] text-gray-500">{products.length} pieces</span>
        </div>
        
        <div className="max-w-7xl mx-auto px-8">
          <div 
            className="grid gap-[1px] bg-gray-200 border border-gray-200"
            style={{ 
              gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
                : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
                : `repeat(${config.products.columnsDesktop || 4}, minmax(0, 1fr))`
            }}
          >
            {products.slice(0, 8).map((product, i) => (
              <div 
                key={product.id || i}
                className="bg-white border-b-2 border-transparent hover:border-black transition-colors group relative"
              >
                <div className="h-[300px] overflow-hidden bg-gray-100 relative">
                  <img 
                    src={product.img || `https://picsum.photos/seed/fashion${i}/600/800`}
                    alt={product.name}
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-black text-white text-[0.65rem] font-bold tracking-[0.12em] uppercase px-2.5 py-1">
                    New
                  </div>
                </div>
                <div className="p-5">
                  <h4 
                    className="text-[1.05rem] font-semibold mb-3 truncate tracking-[0.02em]"
                    style={{ fontFamily: "'Bodoni Moda', serif" }}
                  >
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[1rem]">
                      ${product.price.toFixed(2)}
                    </span>
                    <button 
                      data-cart-add="true"
                      data-product-name={product.name}
                      data-product-price={product.price}
                      data-product-image={product.img || `https://picsum.photos/seed/fashion${i}/600/800`}
                      className="bg-black text-white px-3.5 py-1.5 text-[0.78rem] font-bold tracking-[0.05em] uppercase hover:bg-gray-800 transition-colors"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-gray-50 py-16 px-8 text-center border-t border-gray-200 mt-8">
        <h3 className="text-[2rem] font-bold mb-6" style={{ fontFamily: "'Bodoni Moda', serif" }}>
          Contact & Stockists
        </h3>
        <div className="inline-block text-left min-w-[280px] leading-[2.2] text-gray-700">
          {phoneNumber && <p className="mb-1"><strong className="text-black">Phone:</strong> {phoneNumber}</p>}
          {email && <p className="mb-1"><strong className="text-black">Email:</strong> {email}</p>}
          {address && <p className="mb-1"><strong className="text-black">Address:</strong> {address}</p>}
        </div>
      </section>

      <footer className="bg-black py-8 text-center text-white/50 text-[0.8rem] tracking-[0.06em] uppercase">
        <p>© 2026 {businessName}. Powered by <span className="text-white font-bold">VendorBuild</span></p>
      </footer>
    </div>
  );
}

export default TemplateVogue;
