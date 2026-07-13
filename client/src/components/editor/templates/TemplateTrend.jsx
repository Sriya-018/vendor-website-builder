import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaShoppingCart, FaBars, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, 
  FaMapMarkerAlt, FaStore, FaWhatsapp, FaShieldAlt, FaClock, FaPaperPlane,
  FaSearch, FaFilter, FaSortAmountDown, FaTshirt, FaEye
} from 'react-icons/fa';
import EditableText from '../EditableText';
import SectionWrapper from '../SectionWrapper';

export default function TemplateTrend({ 
  config, 
  business, 
  products, 
  devicePreview, 
  website, 
  isEditable = false, 
  onUpdateConfig, 
  onUpdateProduct, 
  onAddProduct,
  onDeleteProduct
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [activeEditProductId, setActiveEditProductId] = useState(null);

  // Custom Trend unique state: Shop the Look Hotspots
  const [activeHotspot, setActiveHotspot] = useState(null);

  // Catalog Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Background Editor Modal State
  const [showBgModal, setShowBgModal] = useState(false);
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'ai'
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('realistic');
  const [isGenerating, setIsGenerating] = useState(false);

  const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'Trend Apparel');
  const storeName = website?.storeName || business?.businessName || 'My Store';
  const logo = website?.storeInfo?.logo ?? business?.logo ?? null;
  const fullLogoUrl = logo ? (logo.startsWith('http') ? logo : `http://localhost:5000${logo}`) : null;
  const description = config.header.heroHeading || 'Bold streetwear design for trendsetters.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const primaryColor = '#000000'; // High contrast black
  const accentColor = config.themeColor || '#F43F5E'; // Bold rose pink
  const heroBg = config.header.heroImage || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80';

  // Ticking countdown timer logic
  const countdownEndDate = config.countdown?.endDate;
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!countdownEndDate) return;
    const interval = setInterval(() => {
      const difference = +new Date(countdownEndDate) - +new Date();
      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [countdownEndDate]);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('preview-scroll-container');
      const scrollTop = container ? container.scrollTop : window.scrollY;
      setScrolled(scrollTop > 50);
    };
    const container = document.getElementById('preview-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const changePage = (pageName) => {
    setCurrentPage(pageName);
    setMenuOpen(false);
    const container = document.getElementById('preview-scroll-container');
    if (container) {
      container.scrollTop = 0;
    }
  };

  const getProductImageUrl = (product, i) => {
    const imgUrl = product.img || product.imageUrl;
    if (!imgUrl) return `https://picsum.photos/seed/trend${i}/600/600`;
    if (imgUrl.startsWith('http')) return imgUrl;
    return `http://localhost:5000${imgUrl}`;
  };

  const handleProductImageUpload = async (productId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post('http://localhost:5000/api/upload/product-image', formData);
      if (res.data && res.data.url) {
        onUpdateProduct(productId, 'img', res.data.url);
        onUpdateProduct(productId, 'imageUrl', res.data.url);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload product image: ' + err.message);
    }
  };

  const handleGenerateAiBg = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a description prompt.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await axios.post('http://localhost:5000/api/ai/generate-background', {
        prompt: aiPrompt,
        style: aiStyle
      });
      if (res.data && res.data.url) {
        const fullUrl = `http://localhost:5000${res.data.url}`;
        onUpdateConfig('header', 'heroImage', fullUrl);
        setShowBgModal(false);
      } else {
        alert('Could not generate background. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating background: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert('Please fill out all fields.');
      return;
    }
    const websiteId = website?._id || website?.id;
    const businessId = business?._id || business?.id || (typeof website?.businessId === 'object' ? website?.businessId?._id : website?.businessId);
    
    if (!businessId || !websiteId) {
      setFormSubmitted(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setFormSubmitted(false), 5000);
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/business/${businessId}/inquiries`, {
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        websiteId
      });
      setFormSubmitted(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setFormSubmitted(false), 5000);
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      alert('Failed to send message: ' + (err.response?.data?.error || err.message));
    }
  };

  // Categories extraction
  const categoriesList = ['All', ...new Set(products.map(p => p.category || 'general'))];

  // Filtering & sorting
  const sortedFilteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => selectedCategory === 'All' || (p.category || 'general') === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'default') {
        if (a.isBestseller && !b.isBestseller) return -1;
        if (!a.isBestseller && b.isBestseller) return 1;
      }
      return 0;
    });

  // Hotspots definitions linked to first few products
  const hotspotsList = [
    { id: 1, top: '25%', left: '46%', label: 'Cap/Headwear', targetIdx: 0 },
    { id: 2, top: '48%', left: '52%', label: 'Streetwear Tee/Hoodie', targetIdx: 1 },
    { id: 3, top: '75%', left: '49%', label: 'Loose Cargo Pants', targetIdx: 2 }
  ];

  const defaultOrder = ['hero', 'lookbook', 'products', 'gallery', 'faq', 'testimonials', 'hours', 'contact'];
  const order = config.sectionOrder || defaultOrder;
  const sectionsVisible = config.sections || {
    hero: true,
    lookbook: true,
    products: true,
    gallery: true,
    faq: true,
    testimonials: true,
    hours: true,
    contact: true
  };

  const renderSection = (key) => {
    if (sectionsVisible[key] === false) return null;

    switch (key) {
      case 'hero':
        return (
          <SectionWrapper key="hero" isEditable={isEditable} sectionKey="hero" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <header className="relative min-h-[80vh] flex items-center overflow-hidden animate-fade-in bg-black">
              <div className="absolute inset-0 z-0">
                <img src={heroBg} className="w-full h-full object-cover opacity-75" alt="Hero background" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              </div>
              
              {isEditable && (
                <button 
                  onClick={() => setShowBgModal(true)}
                  className="absolute bottom-6 right-6 z-20 px-4 py-2 bg-theme-surface text-black font-black text-xs uppercase tracking-wider shadow-theme hover:scale-105 transition-transform flex items-center gap-1.5 font-sans"
                >
                  🎨 Edit Hero Background
                </button>
              )}
              <div className="relative z-10 max-w-7xl mx-auto px-8 w-full text-white text-left">
                <div className="max-w-xl" style={{ textAlign: config.header.heroAlign }}>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black mb-4 text-[#F43F5E]">Limited Season Drop</p>
                  <EditableText
                    isEditable={isEditable}
                    value={config.header.heroHeading || storeName}
                    onChange={(val) => onUpdateConfig('header', 'heroHeading', val)}
                    tagName="h1"
                    className="text-5xl md:text-7xl font-extrabold leading-none mb-6 uppercase tracking-tight"
                  />
                  <EditableText
                    isEditable={isEditable}
                    value={config.header.heroSubheading || description}
                    onChange={(val) => onUpdateConfig('header', 'heroSubheading', val)}
                    tagName="p"
                    className="text-gray-300 text-md leading-relaxed mb-10 max-w-md font-medium"
                    style={{ marginInline: config.header.heroAlign === 'center' ? 'auto' : config.header.heroAlign === 'right' ? '0 0 0 auto' : '0' }}
                  />
                  <div className={`flex flex-wrap gap-4 ${config.header.heroAlign === 'center' ? 'justify-center' : config.header.heroAlign === 'right' ? 'justify-end' : ''}`}>
                    <button 
                      onClick={() => changePage('shop')}
                      className="px-8 py-4 bg-theme-surface text-black font-black text-xs uppercase tracking-widest hover:bg-[#F43F5E] hover:text-white transition-colors flex items-center gap-2"
                    >
                      <EditableText isEditable={isEditable} value={config.header.ctaLabel || 'Shop Streetwear'} onChange={(val) => onUpdateConfig('header', 'ctaLabel', val)} />
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            </header>
          </SectionWrapper>
        );

      case 'lookbook':
        return (
          <SectionWrapper key="lookbook" isEditable={isEditable} sectionKey="lookbook" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="bg-black text-white py-24 px-8 border-b border-white/5">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <span className="text-[10px] uppercase tracking-widest text-[#F43F5E] font-black block mb-2">Interactive Street Lookbook</span>
                  <h2 className="text-3xl font-extrabold uppercase tracking-wide">Shop The Look</h2>
                  <p className="text-xs text-gray-400 mt-2 font-medium">Click the glowing pins on the outfit to buy pieces instantly.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {/* Hotspot Image Column */}
                  <div className="relative aspect-[3/4] bg-neutral-900 border border-white/10 max-w-sm mx-auto overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                      className="w-full h-full object-cover opacity-90"
                      alt="Streetwear Lookbook model"
                    />
                    
                    {/* Hotspot Pins */}
                    {hotspotsList.map(pin => (
                      <button
                        key={pin.id}
                        onClick={() => setActiveHotspot(pin.id === activeHotspot ? null : pin.id)}
                        className={`absolute w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-theme animate-ping-slow ${
                          activeHotspot === pin.id ? 'bg-[#F43F5E] scale-110' : 'bg-theme-surface'
                        }`}
                        style={{ top: pin.top, left: pin.left }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
                      </button>
                    ))}
                  </div>

                  {/* Hotspot Tooltip/Details Column */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2.5 border-b border-white/10 pb-4 mb-4 text-[#F43F5E] font-bold uppercase tracking-widest text-xs">
                      <FaEye /> Active Hotspot Preview
                    </div>
                    
                    {activeHotspot ? (() => {
                      const activePin = hotspotsList.find(p => p.id === activeHotspot);
                      const product = products[activePin.targetIdx] || products[0];
                      if (!product) return <p className="text-xs text-gray-400">Loading item parameters...</p>;
                      return (
                        <div className="p-6 border border-white/10 bg-neutral-950 space-y-4 animate-fade-in">
                          <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold block">{activePin.label}</span>
                          <h3 className="text-xl font-bold uppercase tracking-wide">{product.name}</h3>
                          <div className="text-2xl font-black text-[#F43F5E]">₹{product.price}</div>
                          <p className="text-xs text-gray-400 leading-relaxed font-light">
                            {product.description || "Premium streetwear piece made of heavy fleece, dropped shoulders, and loose style fit details."}
                          </p>
                          <button
                            data-cart-add="true"
                            data-product-name={product.name}
                            data-product-price={product.price}
                            data-product-image={getProductImageUrl(product, activePin.targetIdx)}
                            className="w-full py-3 bg-theme-surface text-black font-black uppercase text-xs tracking-wider hover:bg-[#F43F5E] hover:text-white transition-colors"
                          >
                            Add This Piece
                          </button>
                        </div>
                      );
                    })() : (
                      <div className="text-center py-16 border border-dashed border-white/10 text-theme-muted text-xs font-light">
                        Select one of the glowing pins on the left photo model to preview and check fit details.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'products':
        return (
          <SectionWrapper key="products" isEditable={isEditable} sectionKey="products" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section id="products" className="max-w-7xl mx-auto px-8 py-24 text-white bg-black">
              <div className="text-center mb-16">
                <EditableText
                  isEditable={isEditable}
                  value={config.products.sectionTitle || 'Latest Drop'}
                  onChange={(val) => onUpdateConfig('products', 'sectionTitle', val)}
                  tagName="h2"
                  className="text-4xl font-extrabold uppercase tracking-widest"
                  style={{ color: accentColor }}
                />
                <div className="w-16 h-1 mx-auto mt-4 bg-theme-surface"></div>
              </div>
              
              <div 
                className="grid gap-8"
                style={{ 
                  gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
                    : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
                    : `repeat(${config.products.columnsDesktop || 4}, minmax(0, 1fr))`
                }}
              >
                {products.slice(0, 4).map((product, i) => (
                  <div 
                    key={product._id || product.id || i}
                    className="bg-neutral-950 border border-white/5 hover:border-[#F43F5E]/30 transition-all flex flex-col justify-between group"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <div>
                      <div className="aspect-[3/4] overflow-hidden bg-neutral-900 relative">
                        <img 
                          src={getProductImageUrl(product, i)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.inStock === false && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <span className="px-3 py-1.5 border border-red-500 text-theme-primary font-black text-[10px] uppercase tracking-wider bg-red-950/20">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <span className="text-[9px] uppercase font-bold text-[#F43F5E] mb-1 block">{product.category || 'Apparel'}</span>
                        <EditableText
                          isEditable={isEditable}
                          value={product.name}
                          onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                          tagName="h4"
                          className="font-extrabold text-sm truncate uppercase tracking-wider group-hover:text-[#F43F5E] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <div className="font-extrabold text-md text-[#F43F5E]">
                          <span>₹</span>
                          <EditableText
                            isEditable={isEditable}
                            value={String(product.price)}
                            onChange={(val) => {
                              const num = parseFloat(val.replace(/[^\d.]/g, '')) || 0;
                              onUpdateProduct(product._id || product.id, 'price', num);
                            }}
                            tagName="span"
                          />
                        </div>
                        <button 
                          data-cart-add="true"
                          data-product-name={product.name}
                          data-product-price={product.price}
                          data-product-image={getProductImageUrl(product, i)}
                          disabled={product.inStock === false}
                          className="px-3 py-1.5 bg-theme-surface text-black hover:bg-[#F43F5E] hover:text-white font-black text-[9px] uppercase tracking-wider transition-colors disabled:opacity-40"
                        >
                          Bag
                        </button>
                      </div>
                      {isEditable && (
                        <button 
                          onClick={() => setActiveEditProductId(product._id || product.id)}
                          className="w-full mt-3 py-1.5 bg-theme-surface/5 text-[9px] font-bold text-theme-muted hover:text-white uppercase tracking-widest text-center"
                        >
                          ⚙️ Edit Apparel Settings
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-16">
                <button 
                  onClick={() => changePage('shop')}
                  className="px-10 py-4 bg-transparent border-2 border-white text-white hover:bg-theme-surface hover:text-black font-black text-xs uppercase tracking-widest transition-colors"
                >
                  See Full Drop
                </button>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'gallery':
        const galleryTitle = config.gallery?.title || 'Street Style Lookbook';
        const galleryImages = config.gallery?.images || [];
        return (
          <SectionWrapper key="gallery" isEditable={isEditable} sectionKey="gallery" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="max-w-7xl mx-auto px-8 py-20 bg-neutral-950 text-white border-t border-b border-white/5">
              <div className="text-center mb-12">
                <EditableText
                  isEditable={isEditable}
                  value={galleryTitle}
                  onChange={(val) => onUpdateConfig('gallery', 'title', val)}
                  tagName="h2"
                  className="text-3xl font-extrabold uppercase tracking-wider"
                  style={{ color: accentColor }}
                />
                <div className="w-12 h-1 mx-auto mt-4 bg-theme-surface"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square overflow-hidden group border border-white/5 bg-black">
                    <img src={img} alt={`Street Look ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350" />
                    {isEditable && (
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                        <input
                          type="text"
                          defaultValue={img}
                          placeholder="Paste Image URL"
                          onBlur={(e) => {
                            const newUrl = e.target.value.trim();
                            if (newUrl && newUrl !== img) {
                              const updated = [...galleryImages];
                              updated[idx] = newUrl;
                              onUpdateConfig('gallery', 'images', updated);
                            }
                          }}
                          className="w-full px-3 py-1.5 bg-[#000000] border border-white/15 text-white rounded text-xs outline-none focus:ring-1 focus:ring-rose-500"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </SectionWrapper>
        );

      case 'faq':
        const faqTitle = config.faq?.title || 'Shipping & Drops Info';
        const faqList = config.faq?.questions || [];
        return (
          <SectionWrapper key="faq" isEditable={isEditable} sectionKey="faq" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="max-w-4xl mx-auto px-8 py-20 text-white bg-black">
              <div className="text-center mb-12">
                <EditableText
                  isEditable={isEditable}
                  value={faqTitle}
                  onChange={(val) => onUpdateConfig('faq', 'title', val)}
                  tagName="h2"
                  className="text-3xl font-extrabold uppercase tracking-wider"
                  style={{ color: accentColor }}
                />
                <div className="w-12 h-1 mx-auto mt-4 bg-theme-surface"></div>
              </div>
              <div className="space-y-4">
                {faqList.map((item, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={item.id || idx} className="bg-neutral-950 border border-white/5 overflow-hidden transition-all">
                      <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full px-6 py-4 text-left font-bold text-gray-250 flex items-center justify-between hover:bg-neutral-900 transition-colors text-xs uppercase tracking-wider">
                        <EditableText
                          isEditable={isEditable}
                          value={item.q}
                          onChange={(val) => {
                            const updated = [...faqList];
                            updated[idx].q = val;
                            onUpdateConfig('faq', 'questions', updated);
                          }}
                          tagName="span"
                        />
                        <span className="text-[#F43F5E]">{isOpen ? '—' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 pt-1 text-xs text-gray-400 font-light leading-relaxed border-t border-white/5">
                          <EditableText
                            isEditable={isEditable}
                            value={item.a}
                            onChange={(val) => {
                              const updated = [...faqList];
                              updated[idx].a = val;
                              onUpdateConfig('faq', 'questions', updated);
                            }}
                            tagName="p"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </SectionWrapper>
        );

      case 'testimonials':
        const testTitle = config.testimonials?.title || 'Trendsetter Reviews';
        const testList = config.testimonials?.items || [];
        return (
          <SectionWrapper key="testimonials" isEditable={isEditable} sectionKey="testimonials" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="bg-neutral-950 py-24 text-white">
              <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-16">
                  <EditableText
                    isEditable={isEditable}
                    value={testTitle}
                    onChange={(val) => onUpdateConfig('testimonials', 'title', val)}
                    tagName="h2"
                    className="text-3xl font-extrabold uppercase tracking-wider"
                    style={{ color: accentColor }}
                  />
                  <div className="w-12 h-1 mx-auto mt-4 bg-theme-surface"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {testList.map((item, idx) => (
                    <div key={idx} className="p-8 border border-white/5 bg-black text-center flex flex-col justify-between">
                      <div className="text-[#F43F5E] text-3xl font-black leading-none mb-6">“</div>
                      <EditableText
                        isEditable={isEditable}
                        value={item.text}
                        onChange={(val) => {
                          const updated = [...testList];
                          updated[idx].text = val;
                          onUpdateConfig('testimonials', 'items', updated);
                        }}
                        tagName="p"
                        className="text-sm font-light italic leading-relaxed text-gray-400"
                      />
                      <div className="mt-8 border-t border-white/5 pt-6">
                        <EditableText
                          isEditable={isEditable}
                          value={item.author}
                          onChange={(val) => {
                            const updated = [...testList];
                            updated[idx].author = val;
                            onUpdateConfig('testimonials', 'items', updated);
                          }}
                          tagName="h5"
                          className="font-bold text-xs uppercase tracking-widest text-[#F43F5E]"
                        />
                        <EditableText
                          isEditable={isEditable}
                          value={item.role || 'Skater / Trendsetter'}
                          onChange={(val) => {
                            const updated = [...testList];
                            updated[idx].role = val;
                            onUpdateConfig('testimonials', 'items', updated);
                          }}
                          tagName="span"
                          className="text-[9px] text-gray-550 tracking-wider font-semibold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'hours':
        const hoursTitle = config.hours?.title || 'Launch Drop Calendar';
        const hoursDays = config.hours?.days || [];
        return (
          <SectionWrapper key="hours" isEditable={isEditable} sectionKey="hours" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="max-w-xl mx-auto px-8 py-20 text-white text-center">
              <div className="text-center mb-8">
                <EditableText
                  isEditable={isEditable}
                  value={hoursTitle}
                  onChange={(val) => onUpdateConfig('hours', 'title', val)}
                  tagName="h2"
                  className="text-xl font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}
                />
                <div className="w-12 h-1 mx-auto mt-4 bg-theme-surface"></div>
              </div>
              <div className="divide-y divide-white/5 border-t border-b border-white/5 py-4">
                {hoursDays.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-3.5 text-xs tracking-wider">
                    <span className="text-gray-400 uppercase font-semibold">{item.day}</span>
                    <span className="font-bold text-white tracking-widest">{item.hours}</span>
                  </div>
                ))}
              </div>
            </section>
          </SectionWrapper>
        );

      case 'contact':
        const contactTitle = config.contact?.title || 'Connect Street';
        const contactSubtitle = config.contact?.subtitle || 'Get in touch for bulk orders and sizing queries.';
        return (
          <SectionWrapper key="contact" isEditable={isEditable} sectionKey="contact" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section id="contact" className="max-w-4xl mx-auto px-8 py-24 text-white">
              <div className="grid md:grid-cols-2 gap-16 items-start">
                <div className="space-y-8">
                  <div>
                    <EditableText
                      isEditable={isEditable}
                      value={contactTitle}
                      onChange={(val) => onUpdateConfig('contact', 'title', val)}
                      tagName="h2"
                      className="text-3xl font-extrabold uppercase tracking-wider mb-4"
                      style={{ color: accentColor }}
                    />
                    <EditableText
                      isEditable={isEditable}
                      value={contactSubtitle}
                      onChange={(val) => onUpdateConfig('contact', 'subtitle', val)}
                      tagName="p"
                      className="text-xs text-gray-400 font-light"
                    />
                  </div>
                  <div className="space-y-4 text-xs font-semibold text-gray-400">
                    {phoneNumber && (
                      <div className="flex items-center gap-4">
                        <FaPhoneAlt className="text-rose-500" />
                        <span>{phoneNumber}</span>
                      </div>
                    )}
                    {email && (
                      <div className="flex items-center gap-4">
                        <FaEnvelope className="text-rose-500" />
                        <span>{email}</span>
                      </div>
                    )}
                    {address && (
                      <div className="flex items-center gap-4">
                        <FaMapMarkerAlt className="text-rose-500" />
                        <span>{address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-neutral-950 p-8 border border-white/5 shadow-theme relative">
                  {formSubmitted ? (
                    <div className="text-center py-12 text-[#F43F5E] space-y-4">
                      <FaPaperPlane size={36} className="mx-auto" />
                      <h4 className="text-xl font-bold uppercase tracking-wider">Inquiry Dropped</h4>
                      <p className="text-xs text-theme-muted font-light font-sans">We will send design details and catalog parameters soon.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-5 font-sans">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">Your Name</label>
                        <input 
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          placeholder="e.g. John Doe"
                          className="w-full px-4 py-2.5 bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">Email Address</label>
                        <input 
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          placeholder="e.g. john@example.com"
                          className="w-full px-4 py-2.5 bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">Your Message</label>
                        <textarea 
                          rows={3}
                          required
                          value={contactForm.message}
                          onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                          placeholder="Please note timeline constraints, required deliverables, etc."
                          className="w-full px-4 py-3 bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-rose-500 resize-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-3.5 bg-theme-surface text-black font-black uppercase tracking-wider text-xs hover:bg-[#F43F5E] hover:text-white transition-colors"
                      >
                        Submit Message Drop
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </section>
          </SectionWrapper>
        );

      default:
        return null;
    }
  };

  if (currentPage === 'shop') {
    return (
      <div 
        id="preview-scroll-container"
        className="w-full h-full overflow-y-auto relative bg-black text-white flex flex-col justify-between font-sans"
      >
        {/* Simple Header */}
        <nav className="py-6 px-8 border-b border-white/5 flex items-center justify-between">
          {isEditable ? (
            <EditableText
              isEditable={true}
              value={businessName}
              onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
              tagName="span"
              className="font-extrabold text-xl uppercase tracking-wider text-[#F43F5E] cursor-text"
            />
          ) : (
            <button onClick={() => changePage('home')} className="font-extrabold text-xl uppercase tracking-wider text-[#F43F5E]">
              {businessName}
            </button>
          )}
          <button 
            onClick={() => changePage('home')}
            className="text-[10px] uppercase tracking-widest font-bold border border-white/15 px-4 py-2 transition-all hover:bg-theme-surface/5"
          >
            ← Back To Drop
          </button>
        </nav>

        {/* Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold uppercase tracking-wider">The Complete Catalog</h1>
            <p className="text-xs text-gray-400 mt-2 font-light">Explore our entire drop selection of hoodies, tees, and caps.</p>
          </div>

          {/* Search, Filter & Sort */}
          <div className="bg-neutral-950 p-6 border border-white/5 mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <input 
                type="text" 
                placeholder="Search drop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-rose-500"
              />
              <FaSearch className="absolute left-3.5 top-3 text-gray-550" size={10} />
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-black/40 border border-white/10 text-xs text-white rounded-none outline-none focus:border-rose-500 uppercase tracking-widest text-white shrink-0"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat} className="bg-neutral-900">{cat}</option>
                ))}
              </select>

              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto px-3 py-2 bg-black/40 border border-white/10 text-xs text-white rounded-none outline-none focus:border-rose-500 uppercase tracking-widest text-white"
              >
                <option value="default" className="bg-neutral-900">Featured Drop</option>
                <option value="price-low" className="bg-neutral-900">Price: Low to High</option>
                <option value="price-high" className="bg-neutral-900">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {sortedFilteredProducts.map((product, i) => (
              <div 
                key={product._id || product.id || i}
                className="bg-neutral-950 border border-white/5 flex flex-col justify-between hover:border-rose-500/20 transition-all"
              >
                <div>
                  <div className="aspect-[3/4] overflow-hidden bg-neutral-900 relative">
                    <img 
                      src={getProductImageUrl(product, i)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.isBestseller && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-theme-surface text-black font-black text-[9px] uppercase tracking-widest">
                        Hot Drop
                      </span>
                    )}
                    {product.inStock === false && (
                      <div className="absolute inset-0 bg-black/85 flex items-center justify-center">
                        <span className="px-3 py-1.5 border border-red-500 text-theme-primary font-black text-[10px] uppercase tracking-wider bg-red-950/20">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-[9px] uppercase font-bold text-theme-muted mb-1 block">{product.category || 'Apparel'}</span>
                    <EditableText
                      isEditable={isEditable}
                      value={product.name}
                      onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                      tagName="h4"
                      className="font-extrabold text-sm truncate uppercase tracking-wider"
                    />
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                    <div className="font-extrabold text-md text-[#F43F5E]">
                      <span>₹</span>
                      <EditableText
                        isEditable={isEditable}
                        value={String(product.price)}
                        onChange={(val) => {
                          const num = parseFloat(val.replace(/[^\d.]/g, '')) || 0;
                          onUpdateProduct(product._id || product.id, 'price', num);
                        }}
                        tagName="span"
                      />
                    </div>
                    <button 
                      data-cart-add="true"
                      data-product-name={product.name}
                      data-product-price={product.price}
                      data-product-image={getProductImageUrl(product, i)}
                      disabled={product.inStock === false}
                      className="px-3 py-1.5 bg-theme-surface text-black hover:bg-[#F43F5E] hover:text-white font-black text-[9px] uppercase tracking-wider transition-colors disabled:opacity-40"
                    >
                      Bag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-xs text-gray-550 border-t border-white/5 bg-neutral-950">
          <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div 
      id="preview-scroll-container"
      className="w-full h-full overflow-y-auto relative bg-black flex flex-col justify-between font-sans text-gray-200"
    >
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-6 px-8 ${scrolled ? 'bg-black/95 border-b border-white/5 shadow-theme' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {isEditable ? (
            <EditableText
              isEditable={true}
              value={businessName}
              onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
              tagName="span"
              className="font-black text-2xl uppercase tracking-widest text-white cursor-text"
            />
          ) : (
            <button onClick={() => changePage('home')} className="font-black text-2xl uppercase tracking-widest text-white focus:outline-none">
              {businessName}
            </button>
          )}
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => changePage('shop')} 
              className="px-5 py-2 border border-white hover:bg-theme-surface hover:text-black text-xs font-black uppercase tracking-wider text-white transition-colors"
            >
              Shop Drop
            </button>
          </div>
        </div>
      </nav>

      {/* Main Sections */}
      <div className="flex-1">
        {order.map((sectionKey) => renderSection(sectionKey))}
      </div>

      {/* Footer */}
      <footer className="bg-[#050505] py-12 px-8 border-t border-white/5 text-center text-xs text-theme-muted font-light">
        <div className="max-w-7xl mx-auto space-y-4">
          <p className="font-black text-[#F43F5E] uppercase tracking-widest text-sm">{businessName}</p>
          <p>© {new Date().getFullYear()} {businessName}. Street Drop Design.</p>
        </div>
      </footer>

      {/* Apparel Parameter Editor Modal */}
      {isEditable && activeEditProductId && (() => {
        const product = products.find(p => (p._id || p.id) === activeEditProductId);
        if (!product) return null;
        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-neutral-950 rounded-none max-w-lg w-full p-6 border border-white/10 shadow-theme relative text-left">
              <button 
                onClick={() => setActiveEditProductId(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-2xl w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
              
              <h3 className="text-xl font-extrabold uppercase tracking-wider text-[#F43F5E] border-b border-white/5 pb-3 mb-6">
                Apparel Settings & Spec Drop
              </h3>

              <div className="space-y-4 font-sans text-xs text-gray-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Apparel Title</label>
                    <input 
                      type="text"
                      value={product.name}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'name', e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[#F43F5E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Drop Price (₹)</label>
                    <input 
                      type="number"
                      value={product.price}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[#F43F5E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Category</label>
                    <input 
                      type="text"
                      value={product.category || ''}
                      placeholder="e.g. Hoodies, Jackets, Cargo Pants"
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'category', e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[#F43F5E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Design Specification Description</label>
                  <textarea 
                    value={product.description || ''}
                    placeholder="Describe streetwear specifics, fabric composition, GSM parameters."
                    onChange={(e) => onUpdateProduct(product._id || product.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[#F43F5E] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 py-1.5">
                  <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-white/10 bg-black/20 transition-all">
                    <input 
                      type="checkbox"
                      checked={!!product.isBestseller}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'isBestseller', e.target.checked)}
                      className="w-4 h-4 accent-[#F43F5E] cursor-pointer"
                    />
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#F43F5E] select-none">
                      🔥 Hot Drop
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-white/10 bg-black/20 transition-all">
                    <input 
                      type="checkbox"
                      checked={product.inStock !== false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        onUpdateProduct(product._id || product.id, 'inStock', checked);
                        onUpdateProduct(product._id || product.id, 'stockQuantity', checked ? (product.stockQuantity > 0 ? product.stockQuantity : 10) : 0);
                      }}
                      className="w-4 h-4 accent-[#F43F5E] cursor-pointer"
                    />
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white select-none">
                      📦 In Stock
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Stock Capacity</label>
                  <input 
                    type="number"
                    min="0"
                    value={product.stockQuantity !== undefined ? product.stockQuantity : 10}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      onUpdateProduct(product._id || product.id, 'stockQuantity', val);
                      onUpdateProduct(product._id || product.id, 'inStock', val > 0);
                    }}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[#F43F5E]"
                    placeholder="Drop pieces count"
                  />
                </div>

                {/* Scoping Image */}
                <div className="p-4 border border-white/10 bg-black/25 space-y-3">
                  <span className="block text-[10px] uppercase tracking-wider text-theme-muted">Apparel Presentation Image</span>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 border border-white/10 shrink-0">
                      <img 
                        src={getProductImageUrl(product, 0)} 
                        className="w-full h-full object-cover" 
                        alt="Product preview" 
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="inline-block px-4 py-2 bg-theme-surface/5 border border-white/10 hover:bg-theme-surface/10 text-white font-bold rounded-none text-xs cursor-pointer shadow-theme transition-all text-center">
                          📁 Upload Image
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleProductImageUpload(product._id || product.id, e)} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                      <input 
                        type="text" 
                        value={product.img || ''} 
                        placeholder="Paste image link" 
                        onChange={(e) => onUpdateProduct(product._id || product.id, 'img', e.target.value)} 
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#F43F5E]" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/5 justify-between items-center">
                  <button 
                    onClick={() => {
                      if (onDeleteProduct) {
                        onDeleteProduct(product._id || product.id);
                        setActiveEditProductId(null);
                      } else {
                        alert("Delete callback not registered.");
                      }
                    }}
                    className="px-4 py-2.5 bg-red-955/20 hover:bg-red-955/40 text-red-400 border border-red-900 rounded-none text-[10px] uppercase font-bold tracking-wider"
                  >
                    Delete Apparel
                  </button>
                  <button 
                    onClick={() => setActiveEditProductId(null)}
                    className="px-6 py-2.5 text-black font-bold uppercase tracking-wider text-xs shadow transition-all bg-theme-surface hover:bg-rose-500 hover:text-white"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Background Editor Modal */}
      {showBgModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-neutral-950 rounded-none max-w-lg w-full p-6 shadow-theme border border-white/10 relative text-left">
            <button 
              onClick={() => setShowBgModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-2xl w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-1">
              Trend Background Settings
            </h3>
            <p className="text-xs text-theme-muted mb-6">Select a streetwear drop preset or generate using AI.</p>

            <div className="flex border-b border-white/10 mb-6 font-semibold">
              <button 
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 font-bold text-xs uppercase tracking-widest text-center border-b-2 transition-colors ${activeTab === 'presets' ? 'border-[#F43F5E] text-[#F43F5E]' : 'border-transparent text-theme-muted hover:text-gray-400'}`}
              >
                Presets
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-2 font-bold text-xs uppercase tracking-widest text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-[#F43F5E] text-[#F43F5E]' : 'border-transparent text-theme-muted hover:text-gray-400'}`}
              >
                AI Generator
              </button>
            </div>

            {activeTab === 'presets' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
                {[
                  { name: 'Urban Skate Street', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Neon Alley Shopfront', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Classic Streetwear Fit', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80' },
                  { name: 'Grafitti Studio Loft', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Streetwear Rack Display', url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Modern Cap Close Up', url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=80' }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      onUpdateConfig('header', 'heroImage', item.url);
                      setShowBgModal(false);
                    }}
                    className="cursor-pointer group relative aspect-video border border-white/5 hover:border-[#F43F5E] transition-all bg-black"
                  >
                    <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name} />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] text-white font-bold uppercase tracking-wider truncate">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 font-sans">
                <div>
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Describe your drop backdrop</label>
                  <textarea 
                    placeholder="e.g. moody urban skate park with street art graffiti, hyper realistic photo banner"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-none outline-none focus:border-[#F43F5E] text-sm text-white resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Aesthetic Style</label>
                    <select 
                      value={aiStyle} 
                      onChange={(e) => setAiStyle(e.target.value)}
                      className="w-full p-3 bg-black/30 border border-white/10 rounded-none outline-none focus:border-indigo-500 text-sm text-white font-bold"
                    >
                      <option value="realistic">Realistic Photo</option>
                      <option value="abstract">Abstract Art</option>
                      <option value="watercolor">Watercolor Painting</option>
                      <option value="minimalist">Minimalist Banner</option>
                      <option value="3D render">3D Mockup Render</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleGenerateAiBg}
                  disabled={isGenerating}
                  className="w-full py-3.5 hover:opacity-90 text-black font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 bg-theme-surface hover:bg-[#F43F5E] hover:text-white"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : 'Generate & Apply'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
