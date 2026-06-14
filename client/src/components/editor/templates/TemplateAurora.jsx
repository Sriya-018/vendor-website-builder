import React, { useEffect, useState } from 'react';
import { FaShoppingCart, FaBars, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaStore, FaWhatsapp, FaInstagram, FaFacebookF, FaTwitter, FaPaperPlane, FaShieldAlt, FaClock } from 'react-icons/fa';

function TemplateAurora({ config, business, products, devicePreview }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const businessName = config.navbar.logoText || business?.businessName || 'My Store';
  const description = config.header.heroHeading || business?.description || 'Welcome to our store';
  const phoneNumber = business?.contact?.phone || '';
  const email = business?.contact?.email || '';
  const address = business?.location?.address || '';
  
  const primaryColor = '#111827';
  const accentColor = config.themeColor || '#3B82F6';
  const heroBg = config.header.heroImage || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80';

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
      className="w-full h-full overflow-y-auto bg-gray-50 text-gray-900 relative"
      style={{
        fontFamily: 'var(--body-font)',
        fontSize: 'var(--base-size)',
        lineHeight: 'var(--line-height)',
        letterSpacing: 'var(--letter-spacing)'
      }}
    >
      {/* Announcement Bar */}
      {config.header.announcement.show && (
        <div 
          className="px-4 py-2 text-center text-xs font-bold text-white relative z-50"
          style={{ backgroundColor: config.header.announcement.color }}
        >
          {config.header.announcement.text}
        </div>
      )}

      {/* NAV */}
      <nav className={`sticky top-0 z-40 w-full transition-all duration-300 border-b border-transparent ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-gray-200' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
            >
              <FaStore />
            </div>
            <span 
              className={`font-extrabold text-xl tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}
              style={{ fontFamily: 'var(--heading-font)' }}
            >
              {businessName}
            </span>
          </div>

          {devicePreview === 'desktop' ? (
            <div className="flex gap-8">
              {['Home', 'Shop', 'Contact'].map(item => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  className={`font-semibold transition-opacity hover:opacity-70 ${scrolled ? 'text-gray-900' : 'text-white'}`}
                >
                  {item}
                </a>
              ))}
            </div>
          ) : (
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className={`text-xl ${scrolled ? 'text-gray-900' : 'text-white'}`}
            >
              <FaBars />
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {devicePreview !== 'desktop' && (
          <div className={`overflow-hidden transition-all bg-white border-t border-gray-100 ${menuOpen ? 'max-h-64' : 'max-h-0'}`}>
            <div className="p-4 flex flex-col gap-2">
              {['Home', 'Shop', 'Contact'].map(item => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  className="p-3 text-gray-900 font-bold hover:bg-gray-50 rounded-lg"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <header className="relative min-h-[80vh] flex items-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          <img src={heroBg} className="w-full h-full object-cover" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 to-black/45"></div>
        </div>
        <div 
          className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full"
          style={{ textAlign: config.header.heroAlign }}
        >
          <span 
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/15 border border-white/30 text-white text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm"
          >
            <FaStar className="mr-2" style={{ color: accentColor }} /> Welcome
          </span>
          <h1 
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight"
            style={{ fontFamily: 'var(--heading-font)' }}
          >
            {description}
          </h1>
          <p 
            className="text-lg text-white/85 mb-10 max-w-xl leading-relaxed"
            style={{ 
              marginInline: config.header.heroAlign === 'center' ? 'auto' : config.header.heroAlign === 'right' ? '0 0 0 auto' : '0' 
            }}
          >
            {config.header.heroSubheading || 'Experience unparalleled quality and style. We bring the best directly to you.'}
          </p>
          <div 
            className="flex flex-wrap gap-4"
            style={{ 
              justifyContent: config.header.heroAlign === 'center' ? 'center' : config.header.heroAlign === 'right' ? 'flex-end' : 'flex-start' 
            }}
          >
            <a 
              href="#shop"
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-extrabold shadow-lg hover:scale-105 transition-transform flex items-center"
            >
              {config.header.ctaLabel} <FaArrowRight className="ml-2" />
            </a>
            {phoneNumber && (
              <a 
                href="#contact"
                className="px-8 py-4 bg-green-600 text-white rounded-xl font-extrabold shadow-lg hover:scale-105 transition-transform flex items-center"
              >
                <FaWhatsapp className="mr-2 text-lg" /> Chat on WhatsApp
              </a>
            )}
          </div>
        </div>
      </header>

      {/* PRODUCTS */}
      <section id="shop" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3"
            style={{ fontFamily: 'var(--heading-font)' }}
          >
            {config.products.sectionTitle}
          </h2>
          <div className="w-20 h-1.5 rounded-full mx-auto mb-4" style={{ backgroundColor: accentColor }}></div>
          <p className="text-gray-500 text-lg">Handpicked selections guaranteed to elevate your lifestyle.</p>
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
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img 
                  src={product.img || `https://picsum.photos/seed/${product.name}${i}/600/600`}
                  alt={product.name}
                  className={`w-full h-full object-${config.media.fitMode || 'cover'} transition-transform duration-700 ${config.products.hoverEffect === 'zoom' ? 'group-hover:scale-110' : ''}`}
                />
              </div>
              <div className="p-6 text-center">
                <div 
                  className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-2"
                  style={{ color: accentColor }}
                >
                  Product
                </div>
                <h4 className="text-lg font-extrabold text-gray-900 mb-2 truncate">
                  {product.name}
                </h4>
                <p className="text-xl font-extrabold text-gray-900 mb-4">
                  ${product.price.toFixed(2)}
                </p>
                <button 
                  data-cart-add="true"
                  data-product-name={product.name}
                  data-product-price={product.price}
                  data-product-image={product.img || `https://picsum.photos/seed/${product.name}${i}/600/600`}
                  className="w-full py-3 rounded-xl font-extrabold text-white flex items-center justify-center transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primaryColor, borderRadius: 'var(--radius)' }}
                >
                  <FaShoppingCart className="mr-2" /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-gray-100 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 
            className="text-3xl font-extrabold text-gray-900 mb-2"
            style={{ fontFamily: 'var(--heading-font)' }}
          >
            Get in Touch
          </h3>
          <p className="text-gray-500 text-lg mb-10">We'd love to hear from you. Reach out anytime!</p>
          
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-8 justify-center items-start">
              {phoneNumber && (
                <div className="flex flex-col items-center gap-3 min-w-[140px]">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-2xl">
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-bold tracking-widest text-gray-400 uppercase">Call Us</div>
                    <div className="font-bold text-gray-900">{phoneNumber}</div>
                  </div>
                </div>
              )}
              {email && (
                <div className="flex flex-col items-center gap-3 min-w-[140px]">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl">
                    <FaEnvelope />
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-bold tracking-widest text-gray-400 uppercase">Email Us</div>
                    <div className="font-bold text-gray-900">{email}</div>
                  </div>
                </div>
              )}
              {address && (
                <div className="flex flex-col items-center gap-3 min-w-[140px]">
                  <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-2xl">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-bold tracking-widest text-gray-400 uppercase">Visit Us</div>
                    <div className="font-bold text-gray-900">{address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 pt-16 pb-8 px-6 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                >
                  <FaStore />
                </div>
                <span 
                  className="font-extrabold text-xl text-white tracking-tight"
                  style={{ fontFamily: 'var(--heading-font)' }}
                >
                  {businessName}
                </span>
              </div>
              <p className="leading-relaxed max-w-sm mb-6">
                {config.footer.tagline || 'Providing top-tier products and exceptional service to customers worldwide.'}
              </p>
              {phoneNumber && (
                <p className="flex items-center text-white font-medium">
                  <FaPhoneAlt className="mr-2" style={{ color: accentColor }} /> {phoneNumber}
                </p>
              )}
            </div>
            
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#shop" className="hover:text-white transition-colors">Shop</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Newsletter</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-gray-800 border-none text-white px-4 py-3 rounded-l-lg flex-1 outline-none focus:ring-1 focus:ring-white"
                />
                <button 
                  className="text-white px-4 py-3 rounded-r-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-wrap justify-between items-center gap-4 text-sm">
            <p>© 2026 {businessName}. All rights reserved.</p>
            
            {/* Trust Badges */}
            <div className="flex gap-6 opacity-60">
              {config.trust.badges.secure && <span className="flex items-center"><FaShieldAlt className="mr-1" /> Secure</span>}
              {config.trust.badges.returns && <span className="flex items-center"><FaClock className="mr-1" /> 30 Days</span>}
            </div>

            <p>Powered by <span className="text-white font-bold">VendorBuild</span></p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default TemplateAurora;
