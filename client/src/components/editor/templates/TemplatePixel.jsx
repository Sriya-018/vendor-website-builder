import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaShoppingCart, FaBars, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, 
  FaMapMarkerAlt, FaStore, FaWhatsapp, FaShieldAlt, FaClock, FaPaperPlane,
  FaSearch, FaFilter, FaSortAmountDown
} from 'react-icons/fa';
import EditableText from '../EditableText';
import SectionWrapper from '../SectionWrapper';

export default function TemplatePixel({ 
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
  const [activeSpecsProduct, setActiveSpecsProduct] = useState(null);

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
  const [aiStyle, setAiStyle] = useState('watercolor');
  const [isGenerating, setIsGenerating] = useState(false);

  const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'My Store');
  const storeName = website?.storeName || business?.businessName || 'My Store';
  const logo = website?.storeInfo?.logo ?? business?.logo ?? null;
  const fullLogoUrl = logo ? (logo.startsWith('http') ? logo : `http://localhost:5000${logo}`) : null;
  const description = config.header.heroHeading || 'High-performance gear for every setup.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const accentColor = config.theme?.accent || '#10B981'; // Emerald/Retro Green
  const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';

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
    if (!imgUrl) return `https://picsum.photos/seed/${product.name}${i}/600/600`;
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

  const defaultOrder = ['hero', 'products', 'gallery', 'faq', 'testimonials', 'hours', 'contact'];
  const order = config.sectionOrder || defaultOrder;
  const sectionsVisible = config.sections || {
    hero: true,
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
            <header className="py-20 px-8 border-b border-[#1e293b]" style={{ background: 'linear-gradient(180deg, #020617, #0f172a)', textAlign: config.header.heroAlign }}>
              <div className={`max-w-7xl mx-auto grid ${devicePreview === 'desktop' ? 'grid-cols-2' : 'grid-cols-1'} gap-12 items-center`}>
                <div style={{ textAlign: config.header.heroAlign }}>
                  <div 
                    className="text-[0.75rem] mb-4 tracking-[0.1em]"
                    style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    // WELCOME_TO_{businessName.toUpperCase().replace(/\s+/g, '_')}_SYSTEM
                  </div>
                  <EditableText
                    isEditable={isEditable}
                    value={config.header.heroHeading || description}
                    onChange={(val) => onUpdateConfig('header', 'heroHeading', val)}
                    tagName="h1"
                    className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-5 tracking-[-0.03em] text-[#f8fafc]"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  />
                  <EditableText
                    isEditable={isEditable}
                    value={config.header.heroSubheading || 'Experience high-fidelity hardware custom-engineered for your setup.'}
                    onChange={(val) => onUpdateConfig('header', 'heroSubheading', val)}
                    tagName="p"
                    className="text-[#94a3b8] text-[1rem] leading-[1.7] mb-10 max-w-[500px]"
                    style={{ marginInline: config.header.heroAlign === 'center' ? 'auto' : config.header.heroAlign === 'right' ? '0 0 0 auto' : '0' }}
                  />
                  <div className={`flex flex-wrap gap-4 ${config.header.heroAlign === 'center' ? 'justify-center' : config.header.heroAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                    <button 
                      onClick={() => changePage('shop')}
                      className="px-7 py-3 rounded text-[#020617] font-extrabold text-[0.9rem] hover:opacity-85 transition-opacity flex items-center gap-2"
                      style={{ backgroundColor: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
                    >
                      <EditableText isEditable={isEditable} value={config.header.ctaLabel || 'INITIALIZE SHOP'} onChange={(val) => onUpdateConfig('header', 'ctaLabel', val)} />
                      <FaArrowRight />
                    </button>
                    {phoneNumber && (
                      <a 
                        href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-7 py-3 rounded bg-transparent border font-bold text-[0.9rem] hover:bg-emerald-500 hover:text-[#020617] transition-all flex items-center gap-2"
                        style={{ borderColor: accentColor, color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
                      >
                        <FaWhatsapp className="text-lg" /> WHATSAPP
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex justify-center relative">
                  <div className="w-full max-w-md aspect-video rounded-theme overflow-hidden border-2 border-[#1e293b] bg-[#020617] p-2">
                    <img src={heroImage} className="w-full h-full object-cover rounded border border-[#1e293b]" alt="Hero Setup" />
                  </div>
                  {isEditable && (
                    <button 
                      onClick={() => setShowBgModal(true)}
                      className="absolute bottom-4 right-4 z-20 px-3.5 py-2 bg-[#020617] border border-[#1e293b] text-slate-100 hover:text-white rounded font-bold text-[10px] shadow-theme transition-all font-mono"
                    >
                      🤖 Edit Hero Image / AI
                    </button>
                  )}
                </div>
              </div>
            </header>
          </SectionWrapper>
        );

      case 'products':
        return (
          <SectionWrapper key="products" isEditable={isEditable} sectionKey="products" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section id="products" className="max-w-7xl mx-auto px-8 py-20">
              <div className="flex items-center gap-4 mb-10">
                <div>
                  <EditableText
                    isEditable={isEditable}
                    value={config.products.sectionTitle || 'FEATURED_PRODUCTS'}
                    onChange={(val) => onUpdateConfig('products', 'sectionTitle', val)}
                    tagName="h2"
                    className="text-2xl font-bold tracking-wider text-slate-100"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  />
                </div>
                <div className="flex-1 h-[1px] bg-[#1e293b]"></div>
                <span className="text-[0.78rem] text-[#475569]" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  [{products.length} units detected]
                </span>
              </div>
              
              <div 
                className="grid gap-6"
                style={{ 
                  gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
                    : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
                    : `repeat(${config.products.columnsDesktop || 4}, minmax(0, 1fr))`
                }}
              >
                {products.slice(0, 4).map((product, i) => (
                  <div 
                    key={product._id || product.id || i}
                    className="bg-[#0f172a] border border-[#1e293b] rounded-theme overflow-hidden hover:border-emerald-500 transition-colors group flex flex-col justify-between"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <div>
                      <div className="h-[200px] overflow-hidden bg-[#020617] relative">
                        <img 
                          src={product.img || `https://picsum.photos/seed/${product.name}${i}/600/600`}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div 
                          className="absolute top-2.5 right-2.5 bg-emerald-500/20 border px-2.5 py-0.5 rounded text-[0.65rem] font-bold tracking-[0.08em]"
                          style={{ color: accentColor, borderColor: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
                        >
                          ONLINE
                        </div>
                      </div>
                      <div className="p-4">
                        <EditableText
                          isEditable={isEditable}
                          value={product.name}
                          onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                          tagName="h4"
                          className="font-bold text-[#e2e8f0] text-[0.95rem] mb-1 truncate"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        />
                        <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="flex items-center justify-between mt-2">
                        {config.products?.showPrices !== false && (
                        <div className="font-extrabold text-[1.1rem] flex items-center gap-0.5" style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}>
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
                        )}
                        {config.products?.showAddToCart !== false && (
                        <button 
                          data-cart-add="true"
                          data-product-name={product.name}
                          data-product-price={product.price}
                          data-product-image={product.img || `https://picsum.photos/seed/${product.name}${i}/600/600`}
                          className="bg-transparent border px-3 py-1.5 rounded text-[0.78rem] font-bold hover:bg-emerald-500 hover:text-[#020617] transition-colors"
                          style={{ color: accentColor, borderColor: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
                        >
                          BUY_NOW
                        </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <button 
                  onClick={() => changePage('shop')}
                  className="px-8 py-3.5 border rounded font-bold hover:bg-slate-800 transition-colors text-sm"
                  style={{ color: accentColor, borderColor: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
                >
                  LOAD_FULL_CATALOG
                </button>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'gallery':
        const galleryTitle = config.gallery?.title || 'GALLERY_LOGS';
        const galleryImages = config.gallery?.images || [];
        return (
          <SectionWrapper key="gallery" isEditable={isEditable} sectionKey="gallery" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="max-w-7xl mx-auto px-8 py-16 border-t border-b border-[#1e293b]">
              <div className="flex items-center gap-4 mb-10">
                <EditableText
                  isEditable={isEditable}
                  value={galleryTitle}
                  onChange={(val) => onUpdateConfig('gallery', 'title', val)}
                  tagName="h2"
                  className="text-2xl font-bold tracking-wider text-slate-100"
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                />
                <div className="flex-1 h-[1px] bg-[#1e293b]"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded overflow-hidden group border border-[#1e293b] bg-[#0f172a]">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {isEditable && (
                      <div className="absolute inset-0 bg-[#020617]/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                        <input
                          type="text"
                          defaultValue={img}
                          placeholder="Image URL"
                          onBlur={(e) => {
                            const newUrl = e.target.value.trim();
                            if (newUrl && newUrl !== img) {
                              const updated = [...galleryImages];
                              updated[idx] = newUrl;
                              onUpdateConfig('gallery', 'images', updated);
                            }
                          }}
                          className="w-full px-2 py-1 bg-[#0f172a] text-xs text-white border border-[#1e293b] rounded outline-none focus:ring-1 focus:ring-emerald-500"
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
        const faqTitle = config.faq?.title || 'FAQ_MODULE';
        const faqList = config.faq?.questions || [];
        return (
          <SectionWrapper key="faq" isEditable={isEditable} sectionKey="faq" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="max-w-4xl mx-auto px-8 py-16">
              <div className="text-center mb-10">
                <EditableText
                  isEditable={isEditable}
                  value={faqTitle}
                  onChange={(val) => onUpdateConfig('faq', 'title', val)}
                  tagName="h2"
                  className="text-2xl font-bold tracking-wider text-slate-100"
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                />
                <div className="w-12 h-1 mx-auto mt-2" style={{ backgroundColor: accentColor }}></div>
              </div>
              <div className="space-y-3">
                {faqList.map((item, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={item.id || idx} className="bg-[#0f172a] border border-[#1e293b] rounded">
                      <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full px-5 py-4 text-left font-bold text-slate-200 flex items-center justify-between hover:bg-slate-800 transition-colors">
                        <EditableText
                          isEditable={isEditable}
                          value={item.question}
                          onChange={(val) => {
                            const updated = faqList.map(q => q.id === item.id ? { ...q, question: val } : q);
                            onUpdateConfig('faq', 'questions', updated);
                          }}
                          tagName="span"
                          className="flex-1 mr-4"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        />
                        <span className="text-[1.2rem]" style={{ color: accentColor }}>{isOpen ? '[-]' : '[+]'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-5 py-4 bg-[#020617] border-t border-[#1e293b] text-slate-400 text-sm leading-relaxed">
                          <EditableText
                            isEditable={isEditable}
                            value={item.answer}
                            onChange={(val) => {
                              const updated = faqList.map(q => q.id === item.id ? { ...q, answer: val } : q);
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
        const testimonialTitle = config.testimonials?.title || 'USER_REVIEWS';
        const testimonialList = config.testimonials?.list || [];
        return (
          <SectionWrapper key="testimonials" isEditable={isEditable} sectionKey="testimonials" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="bg-[#0f172a] border-t border-b border-[#1e293b] py-16 px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                  <EditableText
                    isEditable={isEditable}
                    value={testimonialTitle}
                    onChange={(val) => onUpdateConfig('testimonials', 'title', val)}
                    tagName="h2"
                    className="text-2xl font-bold tracking-wider text-slate-100"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  />
                  <div className="w-12 h-1 mx-auto mt-2" style={{ backgroundColor: accentColor }}></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {testimonialList.map((item, idx) => (
                    <div key={item.id || idx} className="bg-[#020617] border border-[#1e293b] rounded-theme p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex gap-1 mb-3">
                          {[...Array(5)].map((_, starIdx) => (
                            <button
                              key={starIdx}
                              disabled={!isEditable}
                              onClick={() => {
                                const updated = testimonialList.map(t => t.id === item.id ? { ...t, rating: starIdx + 1 } : t);
                                onUpdateConfig('testimonials', 'list', updated);
                              }}
                              className={`text-sm transition-colors ${starIdx < item.rating ? 'text-amber-400' : 'text-slate-700'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <EditableText
                          isEditable={isEditable}
                          value={item.review}
                          onChange={(val) => {
                            const updated = testimonialList.map(t => t.id === item.id ? { ...t, review: val } : t);
                            onUpdateConfig('testimonials', 'list', updated);
                          }}
                          tagName="p"
                          className="text-slate-400 text-xs italic leading-relaxed mb-5"
                        />
                      </div>
                      <div>
                        <EditableText
                          isEditable={isEditable}
                          value={item.name}
                          onChange={(val) => {
                            const updated = testimonialList.map(t => t.id === item.id ? { ...t, name: val } : t);
                            onUpdateConfig('testimonials', 'list', updated);
                          }}
                          tagName="h5"
                          className="font-bold text-slate-200 text-xs"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        />
                        <EditableText
                          isEditable={isEditable}
                          value={item.role}
                          onChange={(val) => {
                            const updated = testimonialList.map(t => t.id === item.id ? { ...t, role: val } : t);
                            onUpdateConfig('testimonials', 'list', updated);
                          }}
                          tagName="span"
                          className="text-[#64748b] text-[10px] block mt-0.5"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
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
        const hoursTitle = config.hours?.title || 'OPERATIONAL_HOURS';
        const hoursDays = config.hours?.days || [];
        return (
          <SectionWrapper key="hours" isEditable={isEditable} sectionKey="hours" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="bg-[#020617] py-16 px-8">
              <div className="max-w-xl mx-auto bg-[#0f172a] border border-[#1e293b] rounded-theme p-8">
                <div className="text-center mb-6">
                  <EditableText
                    isEditable={isEditable}
                    value={hoursTitle}
                    onChange={(val) => onUpdateConfig('hours', 'title', val)}
                    tagName="h3"
                    className="text-lg font-bold tracking-wider text-slate-200"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  />
                  <div className="w-10 h-0.5 mx-auto mt-2" style={{ backgroundColor: accentColor }}></div>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  {hoursDays.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-[#1e293b]/60 pb-2 last:border-b-0 last:pb-0">
                      <span className="font-bold text-slate-400">{item.day}</span>
                      <EditableText
                        isEditable={isEditable}
                        value={item.hours}
                        onChange={(val) => {
                          const updated = hoursDays.map(d => d.day === item.day ? { ...d, hours: val } : d);
                          onUpdateConfig('hours', 'days', updated);
                        }}
                        tagName="span"
                        className="font-bold text-[#e2e8f0]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'countdown':
        if (!config.countdown?.show) return null;
        const countdownTitle = config.countdown?.title || 'PROMOTIONAL_SALE_ACTIVE';
        return (
          <SectionWrapper key="countdown" isEditable={isEditable} sectionKey="countdown" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="w-full py-8 px-6 text-white text-center border-b border-t border-[#1e293b]" style={{ backgroundColor: '#020617', borderColor: accentColor }}>
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-left">
                  <EditableText
                    isEditable={isEditable}
                    value={countdownTitle}
                    onChange={(val) => onUpdateConfig('countdown', 'title', val)}
                    tagName="h3"
                    className="text-lg font-bold text-slate-100 tracking-wider uppercase mb-1"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  />
                  <p className="text-slate-400 text-xs">// TERMINAL DISCOUNTS END IN:</p>
                </div>
                
                <div className="flex gap-3 font-mono">
                  {[
                    { label: 'D', val: timeLeft.days },
                    { label: 'H', val: timeLeft.hours },
                    { label: 'M', val: timeLeft.minutes },
                    { label: 'S', val: timeLeft.seconds }
                  ].map((col, idx) => (
                    <div key={idx} className="flex items-center bg-[#0f172a] border border-[#1e293b] px-3.5 py-2 rounded">
                      <span className="text-lg font-bold" style={{ color: accentColor }}>{String(col.val).padStart(2, '0')}</span>
                      <span className="text-[9px] text-[#475569] ml-1.5">{col.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'contact':
        return (
          <SectionWrapper key="contact" isEditable={isEditable} sectionKey="contact" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section id="contact" className="bg-[#0f172a] border-t border-[#1e293b] py-16 px-8">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-2xl font-bold tracking-wider text-slate-100 mb-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>GET_IN_TOUCH</h3>
                <p className="text-slate-400 text-xs mb-10">// PING_VENDORS_FOR_MORE_INFO</p>
                
                <div className="bg-[#020617] border border-[#1e293b] rounded-theme p-6 leading-[2.2] text-[#94a3b8] font-mono text-xs text-left max-w-md mx-auto space-y-2">
                  {phoneNumber && <p><strong style={{ color: accentColor }}>PHONE:</strong> "{phoneNumber}"</p>}
                  {email && <p><strong style={{ color: accentColor }}>EMAIL:</strong> "{email}"</p>}
                  {address && <p><strong style={{ color: accentColor }}>LOCATION:</strong> "{address}"</p>}
                </div>
              </div>
            </section>
          </SectionWrapper>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      id="preview-scroll-container"
      className="w-full h-full overflow-y-auto"
      style={{
        '--primary': primaryColor,
        '--accent': accentColor,
        backgroundColor: '#020617',
        color: '#e2e8f0',
        fontFamily: "'Sora', sans-serif",
        fontSize: 'var(--base-size)',
        lineHeight: 'var(--line-height)',
        letterSpacing: 'var(--letter-spacing)'
      }}
    >
      {/* Announcement Bar */}
      {config.header?.announcement?.show && (
        <div className="px-4 py-1.5 text-center text-xs font-bold text-[#020617] relative z-50 font-mono" style={{ backgroundColor: config.header.announcement.color || accentColor }}>
          {config.header.announcement.text}
        </div>
      )}

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur border-b border-[#0f172a] px-8 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-[3.75rem]">
          <div className="flex items-center gap-3">
            {isEditable ? (
              fullLogoUrl ? (
                <img src={fullLogoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
              ) : (
                <EditableText
                  isEditable={true}
                  value={config.navbar?.logoText || businessName}
                  onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
                  tagName="span"
                  className="text-[1.2rem] font-bold cursor-text"
                  style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
                />
              )
            ) : (
              <button 
                onClick={() => changePage('home')}
                className="text-[1.2rem] font-bold focus:outline-none hover:opacity-85 text-left"
                style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
              >
                {fullLogoUrl ? (
                  <img src={fullLogoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
                ) : (
                  <>
                    &gt; {businessName.toUpperCase().replace(/\s+/g, '_')}_
                  </>
                )}
              </button>
            )}
          </div>
          
          {devicePreview === 'desktop' ? (
            <div className="flex gap-8 text-[0.82rem] font-semibold tracking-[0.06em] uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              {['Home', 'Shop', 'Contact'].map(page => (
                <button 
                  key={page} 
                  onClick={() => changePage(page.toLowerCase())}
                  className={`transition-colors py-1 border-b ${currentPage === page.toLowerCase() ? 'text-[#10B981] border-[#10B981]' : 'text-theme-muted border-transparent hover:text-emerald-500'}`}
                >
                  {page}
                </button>
              ))}
            </div>
          ) : (
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-xl text-slate-100" style={{ color: accentColor }}><FaBars /></button>
          )}
        </div>

        {/* Mobile Menu */}
        {devicePreview !== 'desktop' && (
          <div className={`overflow-hidden transition-all bg-[#0f172a] border-t border-[#1e293b] ${menuOpen ? 'max-h-64' : 'max-h-0'}`}>
            <div className="p-4 flex flex-col gap-2 font-mono text-xs">
              {['Home', 'Shop', 'Contact'].map(page => (
                <button 
                  key={page} 
                  onClick={() => changePage(page.toLowerCase())}
                  className="p-3 text-slate-300 font-bold hover:bg-[#020617] rounded text-left w-full"
                >
                  &gt; {page.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ACTIVE PAGE CONTENT */}
      {currentPage === 'home' && (
        <div className="animate-fade-in">
          {order.map(key => renderSection(key))}
        </div>
      )}

      {currentPage === 'shop' && (
        <div className="max-w-7xl mx-auto px-8 py-20 animate-fade-in">
          {/* Catalog Filter Panel */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-theme p-6 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100" style={{ fontFamily: "'Share Tech Mono', monospace" }}>// STORE_CATALOG</h2>
              <p className="text-slate-400 text-xs mt-1">High-performance custom inventory modules.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-xl md:justify-end font-mono">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input 
                  type="text" 
                  placeholder="QUERY_ITEMS..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#020617] border border-[#1e293b] text-xs text-white rounded outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-3 pr-8 py-2.5 bg-[#020617] border border-[#1e293b] text-xs text-slate-300 rounded outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none font-semibold"
                >
                  <option value="default">DEFAULT_SORT</option>
                  <option value="price-low">PRICE: ASCENDING</option>
                  <option value="price-high">PRICE: DESCENDING</option>
                </select>
                <FaSortAmountDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Categories Selector */}
          <div className="flex flex-wrap gap-2 mb-8 font-mono">
            {categoriesList.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 border rounded text-[10px] uppercase font-bold transition-all ${selectedCategory === cat ? 'bg-emerald-500 text-[#020617] border-emerald-500' : 'bg-transparent border-[#1e293b] text-slate-400 hover:border-emerald-500/50'}`}
              >
                [{cat}]
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          {sortedFilteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#0f172a] border border-[#1e293b] rounded-theme">
              <div className="text-3xl mb-2">👾</div>
              <h3 className="font-bold text-[#e2e8f0] text-sm" style={{ fontFamily: "'Share Tech Mono', monospace" }}>[!] NO_RESULTS_FOUND</h3>
              <p className="text-[#64748b] text-xs mt-1">Refine your search queries or category filters.</p>
            </div>
          ) : (
            <div 
              className="grid gap-6"
              style={{ 
                gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
                  : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
                  : `repeat(${config.products.columnsDesktop || 4}, minmax(0, 1fr))`
              }}
            >
              {sortedFilteredProducts.map((product, i) => (
                <div 
                  key={product._id || product.id || i}
                  className="bg-[#0f172a] border border-[#1e293b] rounded-theme overflow-hidden hover:border-emerald-500 transition-colors group flex flex-col justify-between relative"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <div>
                    <div className="h-[200px] overflow-hidden bg-[#020617] relative">
                      <img 
                        src={getProductImageUrl(product, i)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.inStock === false ? (
                        <span className="absolute top-3 left-3 bg-theme-primary text-white/90 text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded shadow-theme z-20 font-mono">
                          OUT_OF_STOCK
                        </span>
                      ) : product.isBestseller ? (
                        <span className="absolute top-3 left-3 bg-emerald-500 text-[#020617] text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded shadow-theme z-20 font-mono" style={{ backgroundColor: accentColor }}>
                          ⭐ BESTSELLER
                        </span>
                      ) : null}
                      {isEditable && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveEditProductId(product._id || product.id);
                          }}
                          className="absolute top-3 right-3 bg-[#0f172a]/95 border border-[#1e293b] hover:bg-theme-surface hover:text-black p-1.5 rounded shadow-theme transition-all duration-300 z-20 hover:scale-110 flex items-center justify-center text-xs"
                          title="Edit Product Settings"
                        >
                          ⚙️
                        </button>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] font-mono font-bold tracking-[0.1em] mb-1 text-theme-muted uppercase">
                        {product.category || 'Hardware'}
                      </div>
                      <EditableText
                        isEditable={isEditable}
                        value={product.name}
                        onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                        tagName="h4"
                        className="font-bold text-[#e2e8f0] text-[0.95rem] mb-1 truncate"
                        style={{ fontFamily: "'Share Tech Mono', monospace" }}
                      />
                        <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
                      {product.specs && product.specs.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap font-mono">
                          {product.specs.map((sp, idx) => (
                            <span key={idx} className="text-[8px] border border-[#1e293b] px-1 py-0.5 rounded bg-[#020617] text-slate-400">
                              {sp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="flex items-center justify-between mt-2">
                      {config.products?.showPrices !== false && (
                      <div className="font-extrabold text-[1.1rem] flex items-center gap-0.5" style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}>
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
                      )}
                      <div className="flex flex-col items-end gap-1 font-mono">
                        {config.products?.showAddToCart !== false && (
                        <button 
                          data-cart-add={product.inStock !== false ? "true" : undefined}
                          data-product-id={product._id || product.id}
                          data-product-name={product.name}
                          data-product-price={product.price}
                          data-product-image={getProductImageUrl(product, i)}
                          disabled={product.inStock === false}
                          className={`border px-3 py-1.5 rounded text-[0.78rem] font-bold transition-all ${
                            product.inStock === false 
                              ? 'bg-slate-900 border-[#1e293b] text-theme-muted cursor-not-allowed' 
                              : 'bg-transparent hover:bg-emerald-500 hover:text-[#020617]'
                          }`}
                          style={{ 
                            color: product.inStock !== false ? accentColor : undefined, 
                            borderColor: product.inStock !== false ? accentColor : '#1e293b', 
                            fontFamily: "'Share Tech Mono', monospace" 
                          }}
                        >
                          {product.inStock === false ? 'SOLD_OUT' : 'BUY_NOW'}
                        </button>
                        )}
                        {product.specs && product.specs.length > 0 && (
                          <button 
                            onClick={() => setActiveSpecsProduct(product)}
                            className="text-[9px] text-theme-muted hover:text-white transition-colors underline"
                          >
                            [view_specs]
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isEditable && (
                <div 
                  onClick={onAddProduct}
                  className="bg-[#020617] border border-dashed border-[#1e293b] rounded-theme p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 hover:bg-[#0f172a]/50 transition-all min-h-[250px]"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <div className="w-10 h-10 rounded-full border border-dashed border-[#1e293b] text-emerald-500 flex items-center justify-center font-bold mb-3">+</div>
                  <h4 className="font-bold text-[#e2e8f0] text-xs uppercase tracking-wider" style={{ fontFamily: "'Share Tech Mono', monospace" }}>ADD_PRODUCT</h4>
                  <p className="text-[10px] text-[#475569] mt-1">Insert hardware data block</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {currentPage === 'contact' && (
        <div className="max-w-7xl mx-auto px-8 py-20 animate-fade-in font-mono text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Info panel */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100" style={{ fontFamily: "'Share Tech Mono', monospace" }}>// ENVIRONMENT_VARIABLES</h2>
                <p className="text-slate-400 text-xs mt-1">Global contact records and system operating hours.</p>
              </div>

              <div className="bg-[#0f172a] border border-[#1e293b] rounded-theme p-6 space-y-4">
                {phoneNumber && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-[#1e293b] rounded flex items-center justify-center text-emerald-500 shrink-0"><FaPhoneAlt /></div>
                    <div>
                      <div className="text-[9px] text-[#475569]">CONTACT_PHONE:</div>
                      <div className="text-slate-200 font-bold">{phoneNumber}</div>
                    </div>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-[#1e293b] rounded flex items-center justify-center text-emerald-500 shrink-0"><FaEnvelope /></div>
                    <div>
                      <div className="text-[9px] text-[#475569]">CONTACT_EMAIL:</div>
                      <div className="text-slate-200 font-bold break-all">{email}</div>
                    </div>
                  </div>
                )}
                {address && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-[#1e293b] rounded flex items-center justify-center text-emerald-500 shrink-0"><FaMapMarkerAlt /></div>
                    <div>
                      <div className="text-[9px] text-[#475569]">CONTACT_ADDRESS:</div>
                      <div className="text-slate-200 font-bold">{address}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Operating hours */}
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-theme p-6">
                <h3 className="font-bold text-slate-200 mb-4" style={{ fontFamily: "'Share Tech Mono', monospace" }}>// OPERATIONAL_SHEDULE</h3>
                <div className="space-y-2">
                  {(config.hours?.days || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-[#1e293b]/30 pb-2 last:border-b-0 last:pb-0">
                      <span className="text-slate-400 font-bold">{item.day}</span>
                      <span className="text-slate-200 font-bold">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-theme p-6 md:p-8 relative overflow-hidden">
              <h3 className="text-lg font-bold text-slate-100 mb-6" style={{ fontFamily: "'Share Tech Mono', monospace" }}>// SUBMIT_INQUIRY_SHEET</h3>
              
              {formSubmitted && (
                <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                  <div className="w-12 h-12 border border-emerald-500 rounded text-emerald-500 flex items-center justify-center text-xl mb-4 animate-pulse"><FaPaperPlane /></div>
                  <h4 className="font-bold text-[#e2e8f0] text-sm" style={{ fontFamily: "'Share Tech Mono', monospace" }}>INQUIRY_SENT_SUCCESSFULLY</h4>
                  <p className="text-theme-muted text-[10px] mt-1">Remote host queue received contact payload.</p>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[#475569] mb-1.5 uppercase font-bold tracking-wider">Sender Name</label>
                  <input 
                    type="text" 
                    placeholder="NAME_STRING" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#020617] border border-[#1e293b] text-white rounded outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] mb-1.5 uppercase font-bold tracking-wider">Sender Email</label>
                  <input 
                    type="email" 
                    placeholder="EMAIL_STRING" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#020617] border border-[#1e293b] text-white rounded outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] mb-1.5 uppercase font-bold tracking-wider">Message Payload</label>
                  <textarea 
                    placeholder="CONTENT_STRING" 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-[#020617] border border-[#1e293b] text-white rounded outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 rounded text-[#020617] font-extrabold shadow hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
                >
                  EXECUTE_SEND
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="pt-16 pb-8 px-6 bg-[#020617] border-t border-[#0f172a] text-[#334155] text-xs font-mono">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                {fullLogoUrl ? (
                  <img src={fullLogoUrl} alt="Logo" className="w-6 h-6 object-contain rounded" />
                ) : (
                  <span className="font-bold text-sm" style={{ color: accentColor }}>&gt; {businessName.toUpperCase().replace(/\s+/g, '_')}</span>
                )}
              </div>
              <EditableText
                isEditable={isEditable}
                value={config.footer?.tagline || 'High-fidelity vendor portal configuration active.'}
                onChange={(val) => onUpdateConfig('footer', 'tagline', val)}
                tagName="p"
                className="leading-relaxed max-w-sm mb-4 text-[#64748b]"
              />
              {phoneNumber && (
                <p className="flex items-center text-slate-400">
                  <FaPhoneAlt className="mr-2" style={{ color: accentColor }} /> {phoneNumber}
                </p>
              )}
            </div>
            
            <div>
              <h4 className="text-slate-300 font-bold uppercase tracking-wider mb-4">// QUICK_LINKS</h4>
              <ul className="space-y-2">
                <li><button onClick={() => changePage('home')} className="hover:text-emerald-500 transition-colors">&gt; Home</button></li>
                <li><button onClick={() => changePage('shop')} className="hover:text-emerald-500 transition-colors">&gt; Shop Catalog</button></li>
                <li><button onClick={() => changePage('contact')} className="hover:text-emerald-500 transition-colors">&gt; Contact Channel</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-slate-300 font-bold uppercase tracking-wider mb-4">// NEWSLETTER_SYS</h4>
              <div className="flex">
                <input type="email" placeholder="ADDR..." className="bg-[#0f172a] border border-[#1e293b] text-white px-3 py-2 text-xs rounded-l outline-none focus:ring-1 focus:ring-emerald-500 flex-1" />
                <button className="text-[#020617] px-3.5 py-2 rounded-r font-bold text-xs" style={{ backgroundColor: accentColor }}><FaPaperPlane /></button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#0f172a] pt-8 flex flex-wrap justify-between items-center gap-4 text-[#475569]">
            <p>// © 2026 {storeName}. Powered by VendorBuild</p>
            
            <div className="flex gap-4">
              {config.trust?.badges?.secure && <span className="flex items-center border border-[#1e293b] px-2 py-0.5 rounded text-[10px]">[SECURE_LOCK]</span>}
              {config.trust?.badges?.returns && <span className="flex items-center border border-[#1e293b] px-2 py-0.5 rounded text-[10px]">[30D_WARR]</span>}
            </div>
          </div>
        </div>
      </footer>

      {/* Tech Specs Modal */}
      {activeSpecsProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-theme max-w-md w-full p-8 shadow-theme border border-emerald-500/30 relative font-mono text-slate-200 text-left animate-fade-in">
            <button 
              onClick={() => setActiveSpecsProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-light text-2xl w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800"
            >
              ×
            </button>
            <h3 className="text-lg font-bold text-emerald-500 mb-1" style={{ color: accentColor }}>
              // TECHNICAL_SPECIFICATION_SHEET
            </h3>
            <p className="text-[10px] text-theme-muted mb-6">&gt; Item: {activeSpecsProduct.name}</p>
            
            <div className="border border-[#1e293b] rounded overflow-hidden mb-6">
              <table className="w-full text-[10px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#020617] text-slate-400 font-bold uppercase border-b border-[#1e293b]">
                    <th className="p-3">Parameter</th>
                    <th className="p-3">Data Value</th>
                  </tr>
                </thead>
                <tbody className="text-slate-350 divide-y divide-[#1e293b]/50">
                  {(activeSpecsProduct.specs || []).map((sp, idx) => {
                    const parts = sp.split(':');
                    const key = parts[0] || '';
                    const val = parts.slice(1).join(':') || '';
                    return (
                      <tr key={idx} className="hover:bg-[#020617]/50">
                        <td className="p-3 font-semibold text-slate-400">{key.trim()}</td>
                        <td className="p-3 text-emerald-400">{val.trim() || 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#020617] rounded border border-[#1e293b] text-[10px] leading-relaxed text-slate-400">
              <strong className="text-slate-300 block mb-1">📦 PACKAGE_CONTENTS:</strong>
              {activeSpecsProduct.material || "Main unit, quick-start setup guide, and interface cable."}
            </div>
            
            <button 
              onClick={() => setActiveSpecsProduct(null)}
              className="w-full mt-6 py-3 bg-[#020617] hover:bg-slate-800 text-slate-200 font-bold rounded transition-colors text-xs text-center border border-emerald-500/30"
              style={{ color: accentColor, borderColor: accentColor }}
            >
              TERMINATE_INSPECTION
            </button>
          </div>
        </div>
      )}

      {/* Product Settings Edit Modal */}
      {isEditable && activeEditProductId && (() => {
        const product = products.find(p => (p._id || p.id) === activeEditProductId);
        if (!product) return null;
        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-[#0f172a] rounded-theme max-w-lg w-full p-8 shadow-theme border border-[#1e293b] relative font-mono text-slate-200 text-left animate-fade-in">
              <button 
                onClick={() => setActiveEditProductId(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white font-light text-2xl w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800"
              >
                ×
              </button>
              <h3 className="text-lg font-bold text-slate-100 mb-1" style={{ color: accentColor }}>
                // EDIT_HARDWARE_PARAMETERS
              </h3>
              <p className="text-[10px] text-theme-muted mb-6">Modify local inventory record payload values.</p>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Product Name</label>
                  <input 
                    type="text"
                    value={product.name}
                    onChange={(e) => onUpdateProduct(product._id || product.id, 'name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#020617] border border-[#1e293b] rounded outline-none focus:ring-1 focus:ring-emerald-500 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Price (₹)</label>
                    <input 
                      type="number"
                      value={product.price}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-[#020617] border border-[#1e293b] rounded outline-none focus:ring-1 focus:ring-emerald-500 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Category</label>
                    <input 
                      type="text"
                      value={product.category || ''}
                      placeholder="e.g. Components, Peripherals"
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'category', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#020617] border border-[#1e293b] rounded outline-none focus:ring-1 focus:ring-emerald-500 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Description</label>
                  <textarea 
                    value={product.description || ''}
                    placeholder="Enter main hardware specifications highlights overview summary."
                    onChange={(e) => onUpdateProduct(product._id || product.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#020617] border border-[#1e293b] rounded outline-none focus:ring-1 focus:ring-emerald-500 text-xs text-white resize-none"
                  />
                </div>

                {/* Technical Specifications */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Technical Specifications (Format: Key: Value)</label>
                  <div className="space-y-2">
                    {(product.specs || []).map((sp, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input 
                          type="text"
                          value={sp}
                          onChange={(e) => {
                            const updated = [...(product.specs || [])];
                            updated[idx] = e.target.value;
                            onUpdateProduct(product._id || product.id, 'specs', updated);
                          }}
                          className="flex-1 px-3 py-1.5 bg-[#020617] border border-[#1e293b] rounded text-xs text-slate-200 outline-none focus:border-slate-500"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const updated = (product.specs || []).filter((_, sIdx) => sIdx !== idx);
                            onUpdateProduct(product._id || product.id, 'specs', updated);
                          }}
                          className="px-2.5 py-1.5 bg-red-950/65 text-red-400 hover:bg-red-950 border border-red-900 rounded text-xs font-bold font-mono"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(product.specs || []), 'Latency: 1ms'];
                        onUpdateProduct(product._id || product.id, 'specs', updated);
                      }}
                      className="w-full py-2 bg-[#020617] border border-dashed border-[#1e293b] hover:border-slate-700 text-xs font-bold text-slate-400 rounded transition-colors"
                    >
                      + ADD SPECIFICATION REGISTER
                    </button>
                  </div>
                </div>

                {/* What's in the Box */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Package Contents (What's in the box)</label>
                  <input 
                    type="text"
                    value={product.material || ''}
                    placeholder="e.g. Mechanical Keyboard, Keycap Puller, USB Cable"
                    onChange={(e) => onUpdateProduct(product._id || product.id, 'material', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#020617] border border-[#1e293b] rounded outline-none focus:ring-1 focus:ring-emerald-500 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 py-1.5">
                  <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-[#1e293b] bg-[#020617] rounded transition-all">
                    <input 
                      type="checkbox"
                      checked={!!product.isBestseller}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'isBestseller', e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                    <div className="text-[10px] font-bold text-slate-350 select-none">
                      ⭐ BESTSELLER_FLAG
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-[#1e293b] bg-[#020617] rounded transition-all">
                    <input 
                      type="checkbox"
                      checked={product.inStock !== false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        onUpdateProduct(product._id || product.id, 'inStock', checked);
                        onUpdateProduct(product._id || product.id, 'stockQuantity', checked ? (product.stockQuantity > 0 ? product.stockQuantity : 10) : 0);
                      }}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                    <div className="text-[10px] font-bold text-slate-350 select-none">
                      📦 IN_STOCK_FLAG
                    </div>
                  </label>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Stock Quantity (Items Left)</label>
                  <input 
                    type="number"
                    min="0"
                    value={product.stockQuantity !== undefined ? product.stockQuantity : 10}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      onUpdateProduct(product._id || product.id, 'stockQuantity', val);
                      onUpdateProduct(product._id || product.id, 'inStock', val > 0);
                    }}
                    className="w-full px-4 py-2.5 bg-[#020617] border border-[#1e293b] rounded outline-none focus:ring-1 focus:ring-emerald-500 text-xs text-white"
                    placeholder="Quantity in Stock"
                  />
                </div>

                {/* Product Image Section */}
                <div className="p-4 border border-[#1e293b] rounded bg-[#020617]/50 space-y-3">
                  <span className="block text-[10px] font-bold text-slate-300 uppercase">Product Image</span>
                  
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded bg-[#020617] border border-[#1e293b] shrink-0">
                      <img 
                        src={getProductImageUrl(product, 0)} 
                        className="w-full h-full object-cover" 
                        alt="Product preview" 
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="inline-block px-4 py-2 bg-[#020617] hover:bg-slate-800 text-slate-200 font-bold rounded text-xs cursor-pointer shadow-theme transition-all text-center border border-[#1e293b]">
                          📁 LOAD_FILE
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
                        placeholder="Paste image URL source" 
                        onChange={(e) => onUpdateProduct(product._id || product.id, 'img', e.target.value)} 
                        className="w-full px-3 py-1.5 bg-[#020617] border border-[#1e293b] rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500 text-white font-mono" 
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-[#1e293b] justify-between items-center">
                  <button 
                    onClick={() => {
                      if (onDeleteProduct) {
                        onDeleteProduct(product._id || product.id);
                        setActiveEditProductId(null);
                      } else {
                        alert("Delete callback not registered.");
                      }
                    }}
                    className="px-4 py-2.5 bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-900 rounded font-bold text-xs shadow-theme transition-all"
                  >
                    DELETE_RECORD
                  </button>
                  <button 
                    onClick={() => setActiveEditProductId(null)}
                    className="px-6 py-2.5 bg-emerald-500 hover:opacity-90 text-[#020617] rounded font-bold text-xs shadow transition-all"
                    style={{ backgroundColor: accentColor }}
                  >
                    WRITE_CHANGES
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
          <div className="bg-[#0f172a] rounded-theme max-w-lg w-full p-6 shadow-theme relative font-sans text-slate-200 border border-[#1e293b] text-left animate-fade-in">
            <button 
              onClick={() => setShowBgModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-2xl w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800"
             >
              ×
            </button>
            <h3 className="text-xl font-extrabold text-slate-100 mb-1 font-mono">
              // HERO_IMAGE_SETTINGS
            </h3>
            <p className="text-xs text-theme-muted mb-6 font-mono">Select a gamer tech preset or generate using AI.</p>

            <div className="flex border-b border-slate-800 mb-6 font-semibold font-mono text-xs">
              <button 
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors ${activeTab === 'presets' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-theme-muted hover:text-slate-300'}`}
              >
                Presets
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-theme-muted hover:text-slate-300'}`}
              >
                AI Generator
              </button>
            </div>

            {activeTab === 'presets' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1 font-mono">
                {[
                  { name: 'Glowing Cyberpunk Neon', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Dark Gaming Desk Setup', url: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Gamer PC Rig Glow', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Neon Arcade Keyboard', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Custom Liquid Cooling', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Retro Gamepad Console', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80' }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      onUpdateConfig('header', 'heroImage', item.url);
                      setShowBgModal(false);
                    }}
                    className="cursor-pointer group relative aspect-video rounded-theme overflow-hidden border border-transparent hover:border-emerald-500 transition-all bg-[#020617]"
                  >
                    <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name} />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-white font-bold leading-tight truncate">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 font-mono">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Describe your image prompt</label>
                  <textarea 
                    placeholder="e.g. glowing rgb mechanical keyboard cyberpunk aesthetic, neon game console closer-up"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-xs text-white resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Aesthetic Style</label>
                    <select 
                      value={aiStyle} 
                      onChange={(e) => setAiStyle(e.target.value)}
                      className="w-full p-3 bg-[#020617] border border-slate-800 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-bold text-white bg-slate-900"
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
                  className="w-full py-3.5 hover:opacity-90 text-[#020617] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 rounded animate-pulse"
                  style={{ backgroundColor: accentColor }}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#020617] border-t-transparent rounded-full animate-spin"></div>
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
