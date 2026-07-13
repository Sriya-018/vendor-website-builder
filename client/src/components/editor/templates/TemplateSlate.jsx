import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaShoppingCart, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, 
  FaMapMarkerAlt, FaStore, FaWhatsapp, FaShieldAlt, FaClock, FaPaperPlane,
  FaSearch, FaFilter, FaSortAmountDown
} from 'react-icons/fa';
import EditableText from '../EditableText';
import SectionWrapper from '../SectionWrapper';

export default function TemplateSlate({ 
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
  const description = config.header.heroHeading || 'Next-gen products for a modern world.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const accentColor = config.themeColor || '#38BDF8';
  const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80';

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
            <header className="min-h-[90vh] flex items-center px-8 py-16 animate-fade-in" style={{ background: 'linear-gradient(135deg, #0f172a 50%, #1e293b)' }}>
              <div className={`max-w-7xl mx-auto grid ${devicePreview === 'desktop' ? 'grid-cols-2' : 'grid-cols-1 text-center'} gap-16 items-center w-full`}>
                <div style={{ textAlign: config.header.heroAlign }}>
                  <div className="inline-block px-3 py-1 rounded text-xs font-bold tracking-widest uppercase mb-6" style={{ backgroundColor: `${accentColor}26`, border: `1px solid ${accentColor}4D`, color: accentColor }}>
                    Next-Gen Store
                  </div>
                  <EditableText
                    isEditable={isEditable}
                    value={config.header.heroHeading || description}
                    onChange={(val) => onUpdateConfig('header', 'heroHeading', val)}
                    tagName="h1"
                    className="text-4xl md:text-6xl font-extrabold text-slate-100 leading-tight mb-5 tracking-tight"
                  />
                  <EditableText
                    isEditable={isEditable}
                    value={config.header.heroSubheading || 'Next-gen products for a modern world.'}
                    onChange={(val) => onUpdateConfig('header', 'heroSubheading', val)}
                    tagName="p"
                    className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md"
                    style={{ marginInline: config.header.heroAlign === 'center' ? 'auto' : config.header.heroAlign === 'right' ? '0 0 0 auto' : '0' }}
                  />
                  <div className={`flex flex-wrap gap-4 ${config.header.heroAlign === 'center' ? 'justify-center' : config.header.heroAlign === 'right' ? 'justify-end' : ''}`}>
                    <button 
                      onClick={() => changePage('shop')}
                      className="px-7 py-3 rounded-theme font-extrabold text-[#0f172a] hover:opacity-85 transition-opacity flex items-center gap-2"
                      style={{ backgroundColor: accentColor }}
                    >
                      <EditableText isEditable={isEditable} value={config.header.ctaLabel || 'Browse Catalog'} onChange={(val) => onUpdateConfig('header', 'ctaLabel', val)} />
                      <FaArrowRight />
                    </button>
                    {phoneNumber && (
                      <a 
                        href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-7 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-theme font-bold hover:border-slate-500 transition-colors flex items-center"
                      >
                        <FaWhatsapp className="mr-2 text-theme-primary" /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex justify-center relative">
                  <div className="w-full max-w-sm aspect-square rounded-theme overflow-hidden border-2 border-slate-800" style={{ boxShadow: `0 0 60px ${accentColor}26` }}>
                    <img src={heroImage} className="w-full h-full object-cover" alt="Hero" />
                  </div>
                  {isEditable && (
                    <button 
                      onClick={() => setShowBgModal(true)}
                      className="absolute bottom-4 right-4 z-20 px-3.5 py-2 bg-slate-900 border border-slate-700 text-slate-100 hover:text-white rounded font-bold text-[10px] shadow-theme transition-all font-mono"
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
            <section id="products" className="max-w-7xl mx-auto px-8 py-24">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <EditableText
                    isEditable={isEditable}
                    value={config.products.sectionTitle || 'Product Catalog'}
                    onChange={(val) => onUpdateConfig('products', 'sectionTitle', val)}
                    tagName="h2"
                    className="text-3xl font-extrabold text-slate-100 mb-1"
                  />
                  <div className="w-12 h-[3px] rounded-full" style={{ backgroundColor: accentColor }}></div>
                </div>
                <span className="text-sm text-theme-muted font-bold">{products.length} items</span>
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
                    className="bg-slate-800 border border-slate-700 rounded-theme overflow-hidden group hover:-translate-y-1.5 transition-transform flex flex-col justify-between"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <div>
                      <div className="h-56 overflow-hidden bg-slate-900">
                        <img 
                          src={product.img || `https://picsum.photos/seed/${product.name}${i}/600/600`}
                          alt={product.name}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div className="p-5">
                        <div className="text-[0.65rem] font-bold tracking-[0.12em] uppercase mb-1.5" style={{ color: accentColor }}>Product</div>
                        <EditableText
                          isEditable={isEditable}
                          value={product.name}
                          onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                          tagName="h4"
                          className="font-extrabold text-slate-100 text-base mb-1 truncate"
                        />
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <div className="flex items-center justify-between mt-4">
                        <div className="font-extrabold text-lg flex items-center gap-0.5" style={{ color: accentColor }}>
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
                          data-product-image={product.img || `https://picsum.photos/seed/${product.name}${i}/600/600`}
                          className="text-[#0f172a] px-4 py-2 rounded-theme font-bold text-xs hover:opacity-85 transition-opacity"
                          style={{ backgroundColor: accentColor }}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <button 
                  onClick={() => changePage('shop')}
                  className="px-8 py-3 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-200 rounded-theme font-bold transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'gallery':
        const galleryTitle = config.gallery?.title || 'Our Photo Gallery';
        const galleryImages = config.gallery?.images || [];
        return (
          <SectionWrapper key="gallery" isEditable={isEditable} sectionKey="gallery" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="max-w-7xl mx-auto px-8 py-20 bg-slate-900/50 border-t border-b border-slate-800">
              <div className="text-center mb-12">
                <EditableText
                  isEditable={isEditable}
                  value={galleryTitle}
                  onChange={(val) => onUpdateConfig('gallery', 'title', val)}
                  tagName="h2"
                  className="text-3xl font-extrabold text-slate-100 mb-2"
                />
                <div className="w-12 h-[3px] rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-theme overflow-hidden group shadow-theme border border-slate-800 bg-slate-950">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                    {isEditable && (
                      <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
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
                          className="w-full px-3 py-1.5 bg-slate-800 text-slate-100 rounded text-xs border border-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
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
        const faqTitle = config.faq?.title || 'Frequently Asked Questions';
        const faqList = config.faq?.questions || [];
        return (
          <SectionWrapper key="faq" isEditable={isEditable} sectionKey="faq" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="max-w-4xl mx-auto px-8 py-20">
              <div className="text-center mb-12">
                <EditableText
                  isEditable={isEditable}
                  value={faqTitle}
                  onChange={(val) => onUpdateConfig('faq', 'title', val)}
                  tagName="h2"
                  className="text-3xl font-extrabold text-slate-100 mb-2"
                />
                <div className="w-12 h-[3px] rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
              </div>
              <div className="space-y-4">
                {faqList.map((item, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={item.id || idx} className="bg-slate-800 border border-slate-700 rounded-theme overflow-hidden shadow-theme transition-all">
                      <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full px-6 py-4 text-left font-bold text-slate-200 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
                        <EditableText
                          isEditable={isEditable}
                          value={item.question}
                          onChange={(val) => {
                            const updated = faqList.map(q => q.id === item.id ? { ...q, question: val } : q);
                            onUpdateConfig('faq', 'questions', updated);
                          }}
                          tagName="span"
                          className="flex-1 mr-4"
                        />
                        <span className="text-xl text-slate-400" style={{ color: accentColor }}>{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700 text-slate-400 leading-relaxed text-sm">
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
        const testimonialTitle = config.testimonials?.title || 'What Our Customers Say';
        const testimonialList = config.testimonials?.list || [];
        return (
          <SectionWrapper key="testimonials" isEditable={isEditable} sectionKey="testimonials" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="bg-slate-900/70 border-t border-b border-slate-800 py-20 px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <EditableText
                    isEditable={isEditable}
                    value={testimonialTitle}
                    onChange={(val) => onUpdateConfig('testimonials', 'title', val)}
                    tagName="h2"
                    className="text-3xl font-extrabold text-slate-100 mb-2"
                  />
                  <div className="w-12 h-[3px] rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {testimonialList.map((item, idx) => (
                    <div key={item.id || idx} className="bg-slate-800 border border-slate-700 rounded-theme p-6 shadow-theme flex flex-col justify-between">
                      <div>
                        <div className="flex gap-1 mb-4">
                          {[...Array(5)].map((_, starIdx) => (
                            <button
                              key={starIdx}
                              disabled={!isEditable}
                              onClick={() => {
                                const updated = testimonialList.map(t => t.id === item.id ? { ...t, rating: starIdx + 1 } : t);
                                onUpdateConfig('testimonials', 'list', updated);
                              }}
                              className={`text-lg transition-colors ${starIdx < item.rating ? 'text-amber-400' : 'text-theme-muted'}`}
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
                          className="text-slate-400 text-sm italic leading-relaxed mb-6"
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
                          className="font-bold text-slate-200 text-sm"
                        />
                        <EditableText
                          isEditable={isEditable}
                          value={item.role}
                          onChange={(val) => {
                            const updated = testimonialList.map(t => t.id === item.id ? { ...t, role: val } : t);
                            onUpdateConfig('testimonials', 'list', updated);
                          }}
                          tagName="span"
                          className="text-theme-muted text-xs font-semibold block mt-0.5"
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
        const hoursTitle = config.hours?.title || 'Business Hours';
        const hoursDays = config.hours?.days || [];
        return (
          <SectionWrapper key="hours" isEditable={isEditable} sectionKey="hours" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="bg-slate-950/20 py-20 px-8">
              <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-theme p-8 md:p-12 shadow-theme">
                <div className="text-center mb-8">
                  <EditableText
                    isEditable={isEditable}
                    value={hoursTitle}
                    onChange={(val) => onUpdateConfig('hours', 'title', val)}
                    tagName="h3"
                    className="text-2xl font-extrabold text-slate-100 mb-2"
                  />
                  <div className="w-12 h-[3px] rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
                </div>
                <div className="space-y-4">
                  {hoursDays.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-slate-700 pb-3 last:border-b-0 last:pb-0">
                      <span className="font-bold text-slate-400">{item.day}</span>
                      <EditableText
                        isEditable={isEditable}
                        value={item.hours}
                        onChange={(val) => {
                          const updated = hoursDays.map(d => d.day === item.day ? { ...d, hours: val } : d);
                          onUpdateConfig('hours', 'days', updated);
                        }}
                        tagName="span"
                        className="font-bold text-slate-200 text-sm"
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
        const countdownTitle = config.countdown?.title || 'Mega Summer Sale Ending Soon!';
        return (
          <SectionWrapper key="countdown" isEditable={isEditable} sectionKey="countdown" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="w-full py-12 px-8 text-slate-100 text-center relative overflow-hidden border-t border-b border-slate-800" style={{ backgroundColor: config.countdown?.bgColor || '#0f172a' }}>
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="text-left md:max-w-md">
                  <EditableText
                    isEditable={isEditable}
                    value={countdownTitle}
                    onChange={(val) => onUpdateConfig('countdown', 'title', val)}
                    tagName="h3"
                    className="text-2xl md:text-3xl font-extrabold mb-2"
                    style={{ color: accentColor }}
                  />
                  <p className="text-slate-400 text-sm">Hurry up! Take advantage of our exclusive offers before the timer hits zero.</p>
                </div>
                
                <div className="flex gap-4">
                  {[
                    { label: 'Days', val: timeLeft.days },
                    { label: 'Hours', val: timeLeft.hours },
                    { label: 'Min', val: timeLeft.minutes },
                    { label: 'Sec', val: timeLeft.seconds }
                  ].map((col, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-slate-800 px-4 py-3 rounded-theme min-w-[70px] border border-slate-700 shadow-theme">
                      <span className="text-2xl font-black text-slate-100">{String(col.val).padStart(2, '0')}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-theme-muted mt-1">{col.label}</span>
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
            <section id="contact" className="bg-[#020617] py-16 px-8 mt-16">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-2xl font-extrabold text-slate-100 mb-2">Get in Touch</h3>
                <p className="text-theme-muted mb-8">Questions? We're always online.</p>
                
                <div className="bg-slate-800 border border-slate-700 rounded-theme p-8 text-left leading-loose max-w-md mx-auto">
                  <div className="space-y-4">
                    {phoneNumber && (
                      <p className="flex items-center gap-3">
                        <FaPhoneAlt style={{ color: accentColor }} />
                        <span className="font-bold text-slate-200">{phoneNumber}</span>
                      </p>
                    )}
                    {email && (
                      <p className="flex items-center gap-3">
                        <FaEnvelope style={{ color: accentColor }} />
                        <span className="font-bold text-slate-200">{email}</span>
                      </p>
                    )}
                    {address && (
                      <p className="flex items-center gap-3">
                        <FaMapMarkerAlt style={{ color: accentColor }} />
                        <span className="font-bold text-slate-200">{address}</span>
                      </p>
                    )}
                  </div>
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
      className="w-full h-full overflow-y-auto text-slate-200 relative"
      style={{
        backgroundColor: '#0f172a',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 'var(--base-size)',
        lineHeight: 'var(--line-height)',
        letterSpacing: 'var(--letter-spacing)'
      }}
    >
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#0f172a] border-b border-slate-800 px-8 transition-shadow" style={{ boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.5)' : 'none' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {isEditable ? (
            <EditableText
              isEditable={true}
              value={businessName}
              onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
              tagName="span"
              className="font-extrabold text-xl tracking-tight cursor-text"
              style={{ color: accentColor }}
            />
          ) : (
            <button 
              onClick={() => changePage('home')}
              className="font-extrabold text-xl tracking-tight text-left focus:outline-none hover:opacity-85"
              style={{ color: accentColor }}
            >
              {businessName}
            </button>
          )}
          {devicePreview === 'desktop' && (
            <div className="flex gap-8 text-sm font-bold text-slate-400">
              {['Home', 'Shop', 'Contact'].map(page => (
                <button 
                  key={page} 
                  onClick={() => changePage(page.toLowerCase())}
                  className={`font-semibold hover:text-slate-100 transition-colors ${currentPage === page.toLowerCase() ? 'text-slate-100 underline underline-offset-4' : 'text-slate-400'}`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* RENDER ACTIVE PAGE CONTENT */}
      {currentPage === 'home' && (
        <div className="animate-fade-in">
          {order.map(key => renderSection(key))}
        </div>
      )}

      {currentPage === 'shop' && (
        <div className="max-w-7xl mx-auto px-8 py-24 animate-fade-in">
          {/* Catalog Filters Header */}
          <div className="bg-slate-800 border border-slate-700 rounded-theme p-8 shadow-theme mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-100" style={{ color: accentColor }}>Products Catalog</h2>
              <p className="text-slate-400 text-sm mt-1">Explore all premium products available in our shop</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-xl md:justify-end">
              {/* Search */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-theme outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-100 transition-all"
                />
              </div>

              {/* Sorting */}
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-4 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-theme outline-none focus:ring-2 focus:ring-sky-500 text-sm cursor-pointer appearance-none font-semibold text-slate-300"
                >
                  <option value="default">Bestselling</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <FaSortAmountDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Categories Filter Row */}
          <div className="flex flex-wrap gap-2.5 mb-10">
            {categoriesList.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full font-bold text-xs capitalize transition-all ${selectedCategory === cat ? 'bg-sky-500 text-theme-text shadow-theme' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                style={{ backgroundColor: selectedCategory === cat ? accentColor : '' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          {sortedFilteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-slate-800 rounded-theme border border-slate-700 shadow-theme">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-extrabold text-slate-200 text-lg">No products found</h3>
              <p className="text-theme-muted text-sm mt-1">Try matching another search query or category filter</p>
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
                  className="bg-slate-800 border border-slate-700 rounded-theme overflow-hidden group hover:-translate-y-1.5 transition-transform flex flex-col justify-between animate-fade-in relative"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <div>
                    <div className="h-56 overflow-hidden bg-slate-900 relative">
                      <img 
                        src={getProductImageUrl(product, i)}
                        alt={product.name}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                      {product.inStock === false ? (
                        <span className="absolute top-3 left-3 bg-theme-primary text-white/90 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
                          Out of Stock
                        </span>
                      ) : product.isBestseller ? (
                        <span className="absolute top-3 left-3 bg-sky-500 text-theme-text text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20" style={{ backgroundColor: accentColor, color: '#0f172a' }}>
                          ⭐ Bestseller
                        </span>
                      ) : null}
                      {isEditable && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveEditProductId(product._id || product.id);
                          }}
                          className="absolute top-3 right-3 bg-slate-800/95 border border-slate-700 hover:bg-theme-surface hover:text-black p-2 rounded-full shadow-theme transition-all duration-300 z-20 hover:scale-110 flex items-center justify-center text-sm"
                          title="Edit Product Settings"
                        >
                          ⚙️
                        </button>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="text-[0.65rem] font-bold tracking-[0.12em] uppercase mb-1.5" style={{ color: accentColor }}>
                        {product.category || 'Electronics'}
                      </div>
                      <EditableText
                        isEditable={isEditable}
                        value={product.name}
                        onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                        tagName="h4"
                        className="font-extrabold text-slate-100 text-base mb-1 truncate"
                      />
                      {product.specs && product.specs.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {product.specs.map((sp, idx) => (
                            <span key={idx} className="text-[9px] font-semibold bg-slate-900 border border-slate-750 px-1.5 py-0.5 rounded text-slate-300">
                              {sp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between mt-4">
                      <div className="font-extrabold text-lg flex items-center gap-0.5" style={{ color: accentColor }}>
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
                      <div className="flex flex-col items-end gap-1.5">
                        <button 
                          data-cart-add={product.inStock !== false ? "true" : undefined}
                          data-product-id={product._id || product.id}
                          data-product-name={product.name}
                          data-product-price={product.price}
                          data-product-image={getProductImageUrl(product, i)}
                          disabled={product.inStock === false}
                          className={`px-4 py-2 rounded-theme font-bold text-xs transition-opacity ${
                            product.inStock === false 
                              ? 'bg-slate-700 text-theme-muted cursor-not-allowed' 
                              : 'text-[#0f172a] hover:opacity-85'
                          }`}
                          style={{ backgroundColor: product.inStock !== false ? accentColor : undefined }}
                        >
                          {product.inStock === false ? 'Sold Out' : 'Buy Now'}
                        </button>
                        {product.specs && product.specs.length > 0 && (
                          <button 
                            onClick={() => setActiveSpecsProduct(product)}
                            className="text-[10px] font-semibold text-slate-400 hover:text-white transition-colors underline"
                          >
                            Specs Sheet
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
                  className="bg-slate-800/40 border-2 border-dashed border-slate-700 rounded-theme p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-sky-500 hover:bg-sky-500/5 transition-all duration-300 min-h-[300px]"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-sky-400 border border-slate-700 flex items-center justify-center text-xl font-bold mb-3">+</div>
                  <h4 className="font-extrabold text-slate-300">Add New Product</h4>
                  <p className="text-xs text-theme-muted mt-1 max-w-[180px]">Quickly create a new product card in your catalog</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {currentPage === 'contact' && (
        <div className="max-w-7xl mx-auto px-8 py-24 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Details & Hours */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-100" style={{ color: accentColor }}>Contact Information</h2>
                <p className="text-slate-400 text-sm mt-1">Have any questions? Drop us a message.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {phoneNumber && (
                  <div className="bg-slate-800 border border-slate-700 rounded-theme p-6 shadow-theme flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-theme flex items-center justify-center text-xl shrink-0" style={{ color: accentColor }}><FaPhoneAlt /></div>
                    <div>
                      <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Call Us</div>
                      <div className="font-bold text-slate-200 text-sm break-all">{phoneNumber}</div>
                    </div>
                  </div>
                )}
                {email && (
                  <div className="bg-slate-800 border border-slate-700 rounded-theme p-6 shadow-theme flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-theme flex items-center justify-center text-xl shrink-0" style={{ color: accentColor }}><FaEnvelope /></div>
                    <div>
                      <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Email Us</div>
                      <div className="font-bold text-slate-200 text-sm break-all">{email}</div>
                    </div>
                  </div>
                )}
                {address && (
                  <div className="bg-slate-800 border border-slate-700 rounded-theme p-6 shadow-theme flex items-center gap-4 sm:col-span-2">
                    <div className="w-12 h-12 bg-slate-900 rounded-theme flex items-center justify-center text-xl shrink-0" style={{ color: accentColor }}><FaMapMarkerAlt /></div>
                    <div>
                      <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Visit Store</div>
                      <div className="font-bold text-slate-200 text-sm">{address}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hours panel */}
              <div className="bg-slate-800 border border-slate-700 rounded-theme p-8 shadow-theme">
                <h3 className="font-extrabold text-slate-100 text-xl mb-4">{config.hours?.title || 'Business Hours'}</h3>
                <div className="space-y-3">
                  {(config.hours?.days || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-slate-700 pb-2.5 last:border-b-0 last:pb-0">
                      <span className="font-bold text-slate-400 text-sm">{item.day}</span>
                      <span className="font-extrabold text-slate-200 text-sm">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Inquiry Form */}
            <div className="bg-slate-800 border border-slate-700 rounded-theme p-8 md:p-10 shadow-theme relative overflow-hidden">
              <h3 className="text-2xl font-extrabold text-slate-100 mb-6">Send an Inquiry</h3>
              
              {formSubmitted ? (
                <div className="absolute inset-0 bg-slate-800/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
                  <div className="w-16 h-16 bg-slate-700 text-sky-400 border border-slate-600 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce"><FaPaperPlane /></div>
                  <h4 className="font-extrabold text-slate-250 text-xl">Inquiry Submitted!</h4>
                  <p className="text-slate-400 text-sm mt-1 max-w-[280px]">Thank you for reaching out. We will get back to you shortly.</p>
                </div>
              ) : null}

              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-theme outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Email</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-theme outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message</label>
                  <textarea 
                    placeholder="How can we help you?" 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-theme outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-200 transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 rounded-theme text-[#0f172a] font-extrabold shadow-theme hover:opacity-95 transition-opacity"
                  style={{ backgroundColor: accentColor }}
                >
                  Submit Form
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#020617] border-t border-slate-800 p-8 text-center text-theme-muted text-sm">
        <p>© 2026 {storeName}. Powered by <span style={{ color: accentColor, fontWeight: 'bold' }}>VendorBuild</span></p>
      </footer>

      {/* Tech Specs Modal */}
      {activeSpecsProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-theme max-w-md w-full p-8 shadow-theme border border-slate-800 relative font-sans text-slate-200 text-left animate-fade-in">
            <button 
              onClick={() => setActiveSpecsProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-light text-3xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800"
            >
              ×
            </button>
            <h3 className="text-xl font-extrabold text-slate-100 mb-1">
              📊 Technical Specifications
            </h3>
            <p className="text-xs text-theme-muted mb-6">{activeSpecsProduct.name}</p>
            
            <div className="border border-slate-800 rounded-theme overflow-hidden mb-6">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                    <th className="p-3">Parameter</th>
                    <th className="p-3">Specification</th>
                  </tr>
                </thead>
                <tbody className="text-slate-350 divide-y divide-slate-800">
                  {(activeSpecsProduct.specs || []).map((sp, idx) => {
                    const parts = sp.split(':');
                    const key = parts[0] || '';
                    const val = parts.slice(1).join(':') || '';
                    return (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-400">{key.trim()}</td>
                        <td className="p-3 font-mono text-slate-200">{val.trim() || 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-950 rounded-theme border border-slate-850 text-xs leading-relaxed text-slate-400">
              <strong className="text-slate-300 block mb-1">📦 What's in the Box:</strong>
              {activeSpecsProduct.material || "Main unit, User manual, and charging accessories."}
            </div>
            
            <button 
              onClick={() => setActiveSpecsProduct(null)}
              className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-theme transition-colors text-sm text-center border border-slate-700"
            >
              Close Specs Sheet
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
            <div className="bg-slate-900 rounded-theme max-w-lg w-full p-8 shadow-theme relative border border-slate-800 font-sans text-slate-200 text-left animate-fade-in">
              <button 
                onClick={() => setActiveEditProductId(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white font-light text-3xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800"
              >
                ×
              </button>
              <h3 className="text-xl font-extrabold text-slate-100 mb-1">
                Edit Product Settings
              </h3>
              <p className="text-xs text-theme-muted mb-6">Modify details, configure technical specifications, or upload custom images.</p>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Product Name</label>
                  <input 
                    type="text"
                    value={product.name}
                    onChange={(e) => onUpdateProduct(product._id || product.id, 'name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-theme outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Price (₹)</label>
                    <input 
                      type="number"
                      value={product.price}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-theme outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Category</label>
                    <input 
                      type="text"
                      value={product.category || ''}
                      placeholder="e.g. Laptops, Mobiles"
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'category', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-theme outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Description</label>
                  <textarea 
                    value={product.description || ''}
                    placeholder="Provide overview of key product highlights, benefits, and components."
                    onChange={(e) => onUpdateProduct(product._id || product.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-theme outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-100 resize-none"
                  />
                </div>

                {/* Technical Specifications */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Technical Specifications (Format: Key: Value)</label>
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
                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-theme text-xs text-slate-200 outline-none focus:border-slate-700"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const updated = (product.specs || []).filter((_, sIdx) => sIdx !== idx);
                            onUpdateProduct(product._id || product.id, 'specs', updated);
                          }}
                          className="px-2.5 py-1.5 bg-red-950/65 text-red-400 hover:bg-red-950 border border-red-900 rounded-theme text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(product.specs || []), 'Processor: Quad-Core i5'];
                        onUpdateProduct(product._id || product.id, 'specs', updated);
                      }}
                      className="w-full py-2 bg-slate-950 border border-dashed border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-400 rounded-theme transition-colors"
                    >
                      + Add Specification Row
                    </button>
                  </div>
                </div>

                {/* What's in the Box (maps to material) */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">What's in the Box</label>
                  <input 
                    type="text"
                    value={product.material || ''}
                    placeholder="e.g. Device, Charging Adapter, USB-C Cable"
                    onChange={(e) => onUpdateProduct(product._id || product.id, 'material', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-theme outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 py-1.5">
                  <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-slate-800 bg-slate-950 rounded-theme transition-all">
                    <input 
                      type="checkbox"
                      checked={!!product.isBestseller}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'isBestseller', e.target.checked)}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                    <div className="text-xs font-bold text-slate-350 select-none">
                      ⭐ Mark as Bestseller
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-slate-800 bg-slate-950 rounded-theme transition-all">
                    <input 
                      type="checkbox"
                      checked={product.inStock !== false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        onUpdateProduct(product._id || product.id, 'inStock', checked);
                        onUpdateProduct(product._id || product.id, 'stockQuantity', checked ? (product.stockQuantity > 0 ? product.stockQuantity : 10) : 0);
                      }}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                    <div className="text-xs font-bold text-slate-350 select-none">
                      📦 Product In Stock
                    </div>
                  </label>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Stock Quantity (Items Left)</label>
                  <input 
                    type="number"
                    min="0"
                    value={product.stockQuantity !== undefined ? product.stockQuantity : 10}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      onUpdateProduct(product._id || product.id, 'stockQuantity', val);
                      onUpdateProduct(product._id || product.id, 'inStock', val > 0);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-theme outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium text-slate-100"
                    placeholder="Quantity in Stock"
                  />
                </div>

                {/* Product Image Section */}
                <div className="p-4 border border-slate-800 rounded-theme bg-slate-950/40 space-y-3">
                  <span className="block text-xs font-bold text-slate-300 uppercase">Product Image</span>
                  
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-theme overflow-hidden bg-slate-950 border border-slate-850 shrink-0">
                      <img 
                        src={getProductImageUrl(product, 0)} 
                        className="w-full h-full object-cover" 
                        alt="Product preview" 
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-theme text-xs cursor-pointer shadow-theme transition-all text-center border border-slate-700">
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
                        placeholder="Or paste external Image URL" 
                        onChange={(e) => onUpdateProduct(product._id || product.id, 'img', e.target.value)} 
                        className="w-full px-3 py-1.5 bg-[#0f172a] border border-slate-800 rounded-theme text-xs outline-none focus:ring-1 focus:ring-sky-500 text-slate-200" 
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-800 justify-between items-center">
                  <button 
                    onClick={() => {
                      if (onDeleteProduct) {
                        onDeleteProduct(product._id || product.id);
                        setActiveEditProductId(null);
                      } else {
                        alert("Delete callback not registered.");
                      }
                    }}
                    className="px-4 py-2.5 bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-900 rounded-full font-bold text-xs shadow-theme transition-all"
                  >
                    Delete Product
                  </button>
                  <button 
                    onClick={() => setActiveEditProductId(null)}
                    className="px-6 py-2.5 bg-theme-surface hover:bg-slate-100 text-theme-text rounded-full font-bold text-xs shadow transition-all"
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
          <div className="bg-[#0f172a] rounded-theme max-w-lg w-full p-6 shadow-theme relative font-sans text-slate-200 border border-slate-800 text-left animate-fade-in">
            <button 
              onClick={() => setShowBgModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-2xl w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800"
             >
              ×
            </button>
            <h3 className="text-xl font-extrabold text-slate-100 mb-1 font-mono">
              // HERO_IMAGE_SETTINGS
            </h3>
            <p className="text-xs text-theme-muted mb-6 font-mono">Select a tech preset or generate using AI.</p>

            <div className="flex border-b border-slate-800 mb-6 font-semibold font-mono text-xs">
              <button 
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors ${activeTab === 'presets' ? 'border-sky-500 text-sky-400' : 'border-transparent text-theme-muted hover:text-slate-300'}`}
              >
                Presets
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-sky-500 text-sky-400' : 'border-transparent text-theme-muted hover:text-slate-300'}`}
              >
                AI Generator
              </button>
            </div>

            {activeTab === 'presets' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1 font-mono">
                {[
                  { name: 'Sleek Laptop & Workspace', url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Tech Hardware Close-up', url: 'https://images.unsplash.com/photo-1550009158-9ffff6ab31c1?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Dark Studio Setup', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Modern Desktop Interface', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Clean Workspace Desk', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Mechanical Keyboards', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80' }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      onUpdateConfig('header', 'heroImage', item.url);
                      setShowBgModal(false);
                    }}
                    className="cursor-pointer group relative aspect-video rounded-theme overflow-hidden border border-transparent hover:border-sky-500 transition-all bg-slate-900"
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
                    placeholder="e.g. sleek cyber design laptop, dark clean server room backdrop"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded outline-none focus:ring-1 focus:ring-sky-500 text-xs text-white resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Aesthetic Style</label>
                    <select 
                      value={aiStyle} 
                      onChange={(e) => setAiStyle(e.target.value)}
                      className="w-full p-3 bg-[#020617] border border-slate-800 rounded outline-none focus:ring-1 focus:ring-sky-500 text-xs font-bold text-white bg-slate-900"
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
                  className="w-full py-3.5 hover:opacity-90 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 rounded"
                  style={{ backgroundColor: accentColor }}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
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
