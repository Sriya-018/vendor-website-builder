import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaShoppingCart, FaBars, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, 
  FaMapMarkerAlt, FaStore, FaWhatsapp, FaShieldAlt, FaClock, FaPaperPlane,
  FaSearch, FaFilter, FaSortAmountDown
} from 'react-icons/fa';
import EditableText from '../EditableText';
import SectionWrapper from '../SectionWrapper';
import CustomPageRenderer from './CustomPageRenderer';

export default function TemplateAurora({ 
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
  const isCustomPage = !['home', 'shop', 'contact'].includes(currentPage);
  const activeCustomPage = (config.customPages || []).find(p => p.id === currentPage);
  const [activeEditProductId, setActiveEditProductId] = useState(null);
  const [activeSizeGuideProduct, setActiveSizeGuideProduct] = useState(null);

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
  const description = config.header.heroHeading || 'Welcome to our store';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const primaryColor = config.theme?.primary || '#111827';
  const accentColor = config.theme?.accent || '#3B82F6';
  const heroBg = config.header.heroImage || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80';

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
    if (!imgUrl) return `https://picsum.photos/seed/apparel${i}/600/600`;
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

  // Filtering & sorting logic
  const sortedFilteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => selectedCategory === 'All' || (p.category || 'general') === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      const orderA = a.orderCount || 0;
      const orderB = b.orderCount || 0;
      if (orderB !== orderA) return orderB - orderA;
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
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
            <header className="relative min-h-[80vh] flex items-center overflow-hidden -mt-16 pt-16 animate-fade-in">
              <div className="absolute inset-0">
                <img src={heroBg} className="w-full h-full object-cover" alt="Hero" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/75 to-black/45"></div>
              </div>
              
              {isEditable && (
                <button 
                  onClick={() => setShowBgModal(true)}
                  className="absolute bottom-6 right-6 z-20 px-4 py-2 bg-theme-surface/95 backdrop-blur border border-theme-border text-theme-text rounded-full font-bold text-xs shadow-theme hover:scale-105 transition-transform flex items-center gap-1.5 font-sans"
                >
                  🎨 Edit Hero Background
                </button>
              )}
              <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full" style={{ textAlign: config.header.heroAlign }}>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-theme-surface/15 border border-white/30 text-white text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
                  <FaStar className="mr-2" style={{ color: accentColor }} /> Welcome
                </span>
                <EditableText
                  isEditable={isEditable}
                  value={config.header.heroHeading || description}
                  onChange={(val) => onUpdateConfig('header', 'heroHeading', val)}
                  tagName="h1"
                  className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight"
                />
                <EditableText
                  isEditable={isEditable}
                  value={config.header.heroSubheading || 'Experience unparalleled quality and style. We bring the best directly to you.'}
                  onChange={(val) => onUpdateConfig('header', 'heroSubheading', val)}
                  tagName="p"
                  className="text-lg text-white/85 mb-10 max-w-xl leading-relaxed"
                  style={{ marginInline: config.header.heroAlign === 'center' ? 'auto' : config.header.heroAlign === 'right' ? '0 0 0 auto' : '0' }}
                />
                <div className="flex flex-wrap gap-4" style={{ justifyContent: config.header.heroAlign === 'center' ? 'center' : config.header.heroAlign === 'right' ? 'flex-end' : 'flex-start' }}>
                  <button 
                    onClick={() => changePage('shop')}
                    className="px-8 py-4 bg-theme-surface text-theme-text rounded-theme font-extrabold shadow-theme hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <EditableText isEditable={isEditable} value={config.header.ctaLabel || 'Shop Now'} onChange={(val) => onUpdateConfig('header', 'ctaLabel', val)} />
                    <FaArrowRight />
                  </button>
                  {phoneNumber && (
                    <a 
                      href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-theme-primary text-white text-white rounded-theme font-extrabold shadow-theme hover:scale-105 transition-transform flex items-center"
                    >
                      <FaWhatsapp className="mr-2 text-lg" /> Chat on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </header>
          </SectionWrapper>
        );

      case 'products':
        return (
          <SectionWrapper key="products" isEditable={isEditable} sectionKey="products" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section id="shop" className="max-w-7xl mx-auto px-6 py-24">
              <div className="text-center mb-16">
                <EditableText
                  isEditable={isEditable}
                  value={config.products.sectionTitle || 'Featured Products'}
                  onChange={(val) => onUpdateConfig('products', 'sectionTitle', val)}
                  tagName="h2"
                  className="text-3xl md:text-4xl font-extrabold text-theme-text mb-3"
                />
                <div className="w-20 h-1.5 rounded-full mx-auto mb-4" style={{ backgroundColor: accentColor }}></div>
                <p className="text-theme-muted text-lg">Handpicked selections guaranteed to elevate your lifestyle.</p>
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
                    key={product._id || product.id || i}
                    className="bg-theme-surface rounded-theme overflow-hidden border border-theme-border shadow-theme hover:shadow-theme hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <div>
                      <div className="relative aspect-square overflow-hidden bg-theme-bg">
                        <img 
                          src={getProductImageUrl(product, i)}
                          alt={product.name}
                          className={`w-full h-full object-${config.media.fitMode || 'cover'} transition-transform duration-700 ${config.products.hoverEffect === 'zoom' ? 'group-hover:scale-110' : ''}`}
                        />
                        {product.inStock === false ? (
                          <span className="absolute top-3 left-3 bg-gray-900/80 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
                            Out of Stock
                          </span>
                        ) : product.isBestseller ? (
                          <span className="absolute top-3 left-3 bg-theme-primary text-white text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
                            ⭐ Bestseller
                          </span>
                        ) : null}
                        {isEditable && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveEditProductId(product._id || product.id);
                            }}
                            className="absolute top-3 right-3 bg-theme-surface/95 backdrop-blur border border-theme-border hover:bg-gray-900 hover:text-white p-2 rounded-full shadow-theme transition-all duration-300 z-20 hover:scale-110 flex items-center justify-center text-sm"
                            title="Edit Product Settings"
                          >
                            ⚙️
                          </button>
                        )}
                      </div>
                      <div className="p-6 text-center">
                        <div className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: accentColor }}>
                          {product.category || 'Apparel'}
                        </div>
                        <EditableText
                          isEditable={isEditable}
                          value={product.name}
                          onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                          tagName="h4"
                          className="text-lg font-extrabold text-theme-text mb-1 truncate"
                        />
                        <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
                        {product.sizes && product.sizes.length > 0 && (
                          <div className="flex justify-center gap-1.5 mb-3 flex-wrap">
                            {product.sizes.map(sz => (
                              <span key={sz} className="text-[9px] font-bold border border-theme-border px-1.5 py-0.5 rounded bg-theme-bg text-theme-muted uppercase">
                                {sz}
                              </span>
                            ))}
                          </div>
                        )}
                        {config.products?.showPrices !== false && (
                        <div className="text-xl font-extrabold text-theme-text mb-2 flex items-center justify-center gap-0.5">
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
                        {product.sizes && product.sizes.length > 0 && (
                          <button 
                            onClick={() => setActiveSizeGuideProduct(product)}
                            className="text-[10px] font-bold text-gray-400 hover:text-theme-muted transition-colors underline flex items-center gap-1 justify-center mx-auto mb-2"
                          >
                            📏 View Size Guide
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-6 pt-0">
                      {config.products?.showAddToCart !== false && (
                      <button 
                        data-cart-add={product.inStock !== false ? "true" : undefined}
                        data-product-id={product._id || product.id}
                        data-product-name={product.name}
                        data-product-price={product.price}
                        data-product-image={getProductImageUrl(product, i)}
                        disabled={product.inStock === false}
                        className={`w-full py-3 rounded-theme font-extrabold text-white flex items-center justify-center transition-all ${
                          product.inStock === false 
                            ? 'opacity-60 cursor-not-allowed bg-gray-400 text-white' 
                            : 'hover:opacity-90 active:scale-[0.98]'
                        }`}
                        style={{ backgroundColor: product.inStock !== false ? primaryColor : undefined, borderRadius: 'var(--radius)' }}
                      >
                        <FaShoppingCart className="mr-2" /> {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <button 
                  onClick={() => changePage('shop')}
                  className="px-8 py-3.5 border-2 rounded-theme font-extrabold hover:bg-gray-100 transition-colors"
                  style={{ color: primaryColor, borderColor: primaryColor }}
                >
                  View All Products
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
            <section className="max-w-7xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <EditableText
                  isEditable={isEditable}
                  value={galleryTitle}
                  onChange={(val) => onUpdateConfig('gallery', 'title', val)}
                  tagName="h2"
                  className="text-3xl font-extrabold text-theme-text mb-3"
                />
                <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: accentColor }}></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-theme overflow-hidden group shadow-theme">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {isEditable && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
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
                          className="w-full px-3 py-1.5 bg-theme-surface/90 backdrop-blur rounded text-xs text-theme-text outline-none focus:ring-2 focus:ring-blue-500"
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
            <section className="max-w-4xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <EditableText
                  isEditable={isEditable}
                  value={faqTitle}
                  onChange={(val) => onUpdateConfig('faq', 'title', val)}
                  tagName="h2"
                  className="text-3xl font-extrabold text-theme-text mb-3"
                />
                <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: accentColor }}></div>
              </div>
              <div className="space-y-4">
                {faqList.map((item, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={item.id || idx} className="bg-theme-surface border border-theme-border rounded-theme overflow-hidden shadow-theme transition-all">
                      <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full px-6 py-4 text-left font-bold text-theme-text flex items-center justify-between hover:bg-theme-bg/50 transition-colors">
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
                        <span className="text-xl text-gray-400">{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-6 py-4 bg-theme-bg/30 border-t border-theme-border text-theme-muted leading-relaxed text-sm">
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
            <section className="bg-gray-100 py-20 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <EditableText
                    isEditable={isEditable}
                    value={testimonialTitle}
                    onChange={(val) => onUpdateConfig('testimonials', 'title', val)}
                    tagName="h2"
                    className="text-3xl font-extrabold text-theme-text mb-3"
                  />
                  <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: accentColor }}></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {testimonialList.map((item, idx) => (
                    <div key={item.id || idx} className="bg-theme-surface rounded-theme p-6 shadow-theme border border-theme-border flex flex-col justify-between">
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
                              className={`text-lg transition-colors ${starIdx < item.rating ? 'text-amber-400' : 'text-gray-200'}`}
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
                          className="text-theme-muted text-sm italic leading-relaxed mb-6"
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
                          className="font-bold text-theme-text text-sm"
                        />
                        <EditableText
                          isEditable={isEditable}
                          value={item.role}
                          onChange={(val) => {
                            const updated = testimonialList.map(t => t.id === item.id ? { ...t, role: val } : t);
                            onUpdateConfig('testimonials', 'list', updated);
                          }}
                          tagName="span"
                          className="text-gray-400 text-xs font-semibold block mt-0.5"
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
            <section className="bg-theme-surface border-t border-b border-theme-border py-20 px-6">
              <div className="max-w-2xl mx-auto bg-theme-bg border border-theme-border rounded-theme p-8 md:p-12 shadow-theme">
                <div className="text-center mb-8">
                  <EditableText
                    isEditable={isEditable}
                    value={hoursTitle}
                    onChange={(val) => onUpdateConfig('hours', 'title', val)}
                    tagName="h3"
                    className="text-2xl font-extrabold text-theme-text mb-2"
                  />
                  <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
                </div>
                <div className="space-y-4">
                  {hoursDays.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-theme-border/60 pb-3 last:border-b-0 last:pb-0">
                      <span className="font-bold text-gray-700">{item.day}</span>
                      <EditableText
                        isEditable={isEditable}
                        value={item.hours}
                        onChange={(val) => {
                          const updated = hoursDays.map(d => d.day === item.day ? { ...d, hours: val } : d);
                          onUpdateConfig('hours', 'days', updated);
                        }}
                        tagName="span"
                        className="font-bold text-theme-text text-sm"
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
            <section className="w-full py-12 px-6 text-white text-center relative overflow-hidden" style={{ backgroundColor: config.countdown?.bgColor || accentColor }}>
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="text-left md:max-w-md">
                  <EditableText
                    isEditable={isEditable}
                    value={countdownTitle}
                    onChange={(val) => onUpdateConfig('countdown', 'title', val)}
                    tagName="h3"
                    className="text-2xl md:text-3xl font-extrabold mb-2"
                  />
                  <p className="text-white/80 text-sm">Hurry up! Take advantage of our exclusive offers before the timer hits zero.</p>
                </div>
                
                <div className="flex gap-4">
                  {[
                    { label: 'Days', val: timeLeft.days },
                    { label: 'Hours', val: timeLeft.hours },
                    { label: 'Min', val: timeLeft.minutes },
                    { label: 'Sec', val: timeLeft.seconds }
                  ].map((col, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-black/25 px-4 py-3 rounded-theme min-w-[70px] backdrop-blur-sm border border-white/10">
                      <span className="text-2xl font-black">{String(col.val).padStart(2, '0')}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 mt-1">{col.label}</span>
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
            <section id="contact" className="bg-gray-100 py-24 px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-3xl font-extrabold text-theme-text mb-2" style={{ fontFamily: 'var(--heading-font)' }}>Get in Touch</h3>
                <p className="text-theme-muted text-lg mb-10">We'd love to hear from you. Reach out anytime!</p>
                
                <div className="bg-theme-surface rounded-theme p-10 shadow-theme border border-theme-border">
                  <div className="flex flex-wrap gap-8 justify-center items-start">
                    {phoneNumber && (
                      <div className="flex flex-col items-center gap-3 min-w-[140px]">
                        <div className="w-14 h-14 bg-green-50 text-theme-primary rounded-full flex items-center justify-center text-2xl"><FaPhoneAlt /></div>
                        <div>
                          <div className="text-[0.65rem] font-bold tracking-widest text-gray-400 uppercase">Call Us</div>
                          <div className="font-bold text-theme-text">{phoneNumber}</div>
                        </div>
                      </div>
                    )}
                    {email && (
                      <div className="flex flex-col items-center gap-3 min-w-[140px]">
                        <div className="w-14 h-14 bg-blue-50 text-theme-primary rounded-full flex items-center justify-center text-2xl"><FaEnvelope /></div>
                        <div>
                          <div className="text-[0.65rem] font-bold tracking-widest text-gray-400 uppercase">Email Us</div>
                          <div className="font-bold text-theme-text">{email}</div>
                        </div>
                      </div>
                    )}
                    {address && (
                      <div className="flex flex-col items-center gap-3 min-w-[140px]">
                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-2xl"><FaMapMarkerAlt /></div>
                        <div>
                          <div className="text-[0.65rem] font-bold tracking-widest text-gray-400 uppercase">Visit Us</div>
                          <div className="font-bold text-theme-text">{address}</div>
                        </div>
                      </div>
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
      className="w-full h-full overflow-y-auto bg-theme-bg text-theme-text relative"
      style={{
        '--primary': primaryColor,
        '--accent': accentColor,
        fontFamily: 'var(--body-font)',
        fontSize: 'var(--base-size)',
        lineHeight: 'var(--line-height)',
        letterSpacing: 'var(--letter-spacing)'
      }}
    >
      {/* Announcement Bar */}
      {config.header.announcement.show && (
        <div className="px-4 py-2 text-center text-xs font-bold text-white relative z-50 animate-fade-in" style={{ backgroundColor: config.header.announcement.color }}>
          {config.header.announcement.text}
        </div>
      )}

      {/* NAV */}
      <nav className={`sticky top-0 z-40 w-full transition-all duration-300 border-b border-transparent ${(scrolled || currentPage !== 'home') ? 'bg-theme-surface/95 backdrop-blur-md shadow-theme border-theme-border' : 'bg-transparent'}`} style={{ backgroundColor: config.navbar?.backgroundColor || (scrolled || currentPage !== 'home' ? 'var(--surface)' : 'transparent') }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditable ? (
              <>
                {fullLogoUrl ? (
                  <img src={fullLogoUrl} alt="Store Logo" className="w-10 h-10 object-contain rounded-theme" style={{background:'transparent'}} />
                ) : (
                  <div className="w-10 h-10 rounded-theme flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}><FaStore /></div>
                )}
                <EditableText
                  isEditable={true}
                  value={businessName}
                  onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
                  tagName="span"
                  className={`font-extrabold text-xl tracking-tight transition-colors cursor-text ${(scrolled || currentPage !== 'home') ? 'text-theme-text' : 'text-white'}`}
                  style={{ fontFamily: 'var(--heading-font)', color: config.navbar?.textColor }}
                />
              </>
            ) : (
              <button 
                onClick={() => changePage('home')}
                className="flex items-center gap-3 text-left focus:outline-none hover:opacity-85 transition-opacity"
              >
                {fullLogoUrl ? (
                  <img src={fullLogoUrl} alt="Store Logo" className="w-10 h-10 object-contain rounded-theme" style={{background:'transparent'}} />
                ) : (
                  <div className="w-10 h-10 rounded-theme flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}><FaStore /></div>
                )}
                <span 
                  className={`font-extrabold text-xl tracking-tight transition-colors ${(scrolled || currentPage !== 'home') ? 'text-theme-text' : 'text-white'}`}
                  style={{ fontFamily: 'var(--heading-font)', color: config.navbar?.textColor }}
                >
                  {businessName}
                </span>
              </button>
            )}
          </div>

          {devicePreview === 'desktop' ? (
            <div className="flex gap-8">
              {[
                { label: 'Home', id: 'home' },
                { label: 'Shop', id: 'shop' },
                { label: 'Contact', id: 'contact' },
                ...(config.customPages || []).map(p => ({ label: p.title, id: p.id }))
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => changePage(item.id)}
                  className={`font-bold transition-all border-b-2 hover:opacity-100 ${currentPage === item.id ? 'opacity-100 border-blue-500 scale-105' : 'opacity-60 border-transparent hover:border-theme-border'} ${(scrolled || currentPage !== 'home') ? 'text-theme-text' : 'text-white'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : (
            <button onClick={() => setMenuOpen(!menuOpen)} className={`text-xl ${(scrolled || currentPage !== 'home') ? 'text-theme-text' : 'text-white'}`}><FaBars /></button>
          )}
        </div>

        {/* Mobile Menu */}
        {devicePreview !== 'desktop' && (
          <div className={`overflow-hidden transition-all bg-theme-surface border-t border-theme-border ${menuOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
            <div className="p-4 flex flex-col gap-2">
              {[
                { label: 'Home', id: 'home' },
                { label: 'Shop', id: 'shop' },
                { label: 'Contact', id: 'contact' },
                ...(config.customPages || []).map(p => ({ label: p.title, id: p.id }))
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => {
                    changePage(item.id);
                    setMenuOpen(false);
                  }}
                  className="p-3 text-theme-text font-bold hover:bg-theme-bg rounded-theme text-left w-full"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* RENDER ACTIVE PAGE CONTENT */}
      {isCustomPage && activeCustomPage && (
        <CustomPageRenderer 
          page={activeCustomPage} 
          primaryColor={primaryColor} 
          accentColor={accentColor} 
          isEditable={isEditable}
          onUpdateConfig={onUpdateConfig}
          config={config}
        />
      )}

      {currentPage === 'home' && (
        <div className="animate-fade-in">
          {order.map(key => renderSection(key))}
        </div>
      )}

      {currentPage === 'shop' && (
        <div className="max-w-7xl mx-auto px-6 py-24 animate-fade-in">
          {/* Catalog Search & Filters Header */}
          <div className="bg-theme-surface rounded-theme p-8 border border-theme-border shadow-theme mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-theme-text" style={{ fontFamily: 'var(--heading-font)' }}>Products Catalog</h2>
              <p className="text-theme-muted text-sm mt-1">Explore all premium products available in our shop</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-xl md:justify-end">
              {/* Search */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                />
              </div>

              {/* Sorting */}
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-4 pr-10 py-3 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer appearance-none font-semibold text-gray-700"
                >
                  <option value="default">Bestselling</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <FaSortAmountDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Categories Filter Row */}
          <div className="flex flex-wrap gap-2.5 mb-10">
            {categoriesList.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full font-bold text-xs capitalize transition-all ${selectedCategory === cat ? 'bg-theme-primary text-white text-white shadow-theme' : 'bg-theme-surface border border-theme-border text-gray-700 hover:bg-theme-bg'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          {sortedFilteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-theme-surface rounded-theme border border-theme-border shadow-theme">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-extrabold text-theme-text text-lg">No products found</h3>
              <p className="text-gray-400 text-sm mt-1">Try matching another search query or category filter</p>
            </div>
          ) : (
            <div 
              className="grid gap-8"
              style={{ 
                gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
                  : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
                  : `repeat(${config.products.columnsDesktop || 3}, minmax(0, 1fr))`
              }}
            >
              {sortedFilteredProducts.map((product, i) => (
                <div 
                  key={product._id || product.id || i}
                  className="bg-theme-surface rounded-theme overflow-hidden border border-theme-border shadow-theme hover:shadow-theme hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between animate-fade-in"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <div>
                    <div className="relative aspect-square overflow-hidden bg-theme-bg">
                      <img 
                        src={getProductImageUrl(product, i)}
                        alt={product.name}
                        className={`w-full h-full object-${config.media.fitMode || 'cover'} transition-transform duration-700 ${config.products.hoverEffect === 'zoom' ? 'group-hover:scale-110' : ''}`}
                      />
                      {product.inStock === false ? (
                        <span className="absolute top-3 left-3 bg-gray-900/80 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
                          Out of Stock
                        </span>
                      ) : product.isBestseller ? (
                        <span className="absolute top-3 left-3 bg-theme-primary text-white text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
                          ⭐ Bestseller
                        </span>
                      ) : null}
                      {isEditable && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveEditProductId(product._id || product.id);
                          }}
                          className="absolute top-3 right-3 bg-theme-surface/95 backdrop-blur border border-theme-border hover:bg-gray-900 hover:text-white p-2 rounded-full shadow-theme transition-all duration-300 z-20 hover:scale-110 flex items-center justify-center text-sm"
                          title="Edit Product Settings"
                        >
                          ⚙️
                        </button>
                      )}
                    </div>
                    <div className="p-6 text-center">
                      <div className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: accentColor }}>
                        {product.category || 'Apparel'}
                      </div>
                      <EditableText
                        isEditable={isEditable}
                        value={product.name}
                        onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                        tagName="h4"
                        className="text-lg font-extrabold text-theme-text mb-1 truncate"
                      />
                        <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="flex justify-center gap-1.5 mb-3 flex-wrap">
                          {product.sizes.map(sz => (
                            <span key={sz} className="text-[9px] font-bold border border-theme-border px-1.5 py-0.5 rounded bg-theme-bg text-theme-muted uppercase">
                              {sz}
                            </span>
                          ))}
                        </div>
                      )}
                      {config.products?.showPrices !== false && (
                      <div className="text-xl font-extrabold text-theme-text mb-2 flex items-center justify-center gap-0.5">
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
                      {product.sizes && product.sizes.length > 0 && (
                        <button 
                          onClick={() => setActiveSizeGuideProduct(product)}
                          className="text-[10px] font-bold text-gray-400 hover:text-theme-muted transition-colors underline flex items-center gap-1 justify-center mx-auto mb-2"
                        >
                          📏 View Size Guide
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    {config.products?.showAddToCart !== false && (
                    <button 
                      data-cart-add={product.inStock !== false ? "true" : undefined}
                      data-product-id={product._id || product.id}
                      data-product-name={product.name}
                      data-product-price={product.price}
                      data-product-image={getProductImageUrl(product, i)}
                      disabled={product.inStock === false}
                      className={`w-full py-3 rounded-theme font-extrabold text-white flex items-center justify-center transition-all ${
                        product.inStock === false 
                          ? 'opacity-60 cursor-not-allowed bg-gray-400 text-white' 
                          : 'hover:opacity-90 active:scale-[0.98]'
                      }`}
                      style={{ backgroundColor: product.inStock !== false ? primaryColor : undefined, borderRadius: 'var(--radius)' }}
                    >
                      <FaShoppingCart className="mr-2" /> {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    )}
                  </div>
                </div>
              ))}

              {isEditable && (
                <div 
                  onClick={onAddProduct}
                  className="bg-theme-surface border-2 border-dashed border-theme-border rounded-theme p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/10 transition-all duration-300 min-h-[300px]"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-theme-primary flex items-center justify-center text-xl font-bold mb-3">+</div>
                  <h4 className="font-extrabold text-gray-700">Add New Product</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-[180px]">Quickly create a new product card in your catalog</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {currentPage === 'contact' && (
        <div className="max-w-7xl mx-auto px-6 py-24 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Details & Hours */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-extrabold text-theme-text" style={{ fontFamily: 'var(--heading-font)' }}>Contact Information</h2>
                <p className="text-theme-muted text-sm mt-1">Have any questions or need custom arrangements? Contact our team.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {phoneNumber && (
                  <div className="bg-theme-surface border border-theme-border rounded-theme p-6 shadow-theme flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-theme-primary rounded-theme flex items-center justify-center text-xl shrink-0"><FaPhoneAlt /></div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Call Us</div>
                      <div className="font-bold text-theme-text text-sm break-all">{phoneNumber}</div>
                    </div>
                  </div>
                )}
                {email && (
                  <div className="bg-theme-surface border border-theme-border rounded-theme p-6 shadow-theme flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-theme-primary rounded-theme flex items-center justify-center text-xl shrink-0"><FaEnvelope /></div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Us</div>
                      <div className="font-bold text-theme-text text-sm break-all">{email}</div>
                    </div>
                  </div>
                )}
                {address && (
                  <div className="bg-theme-surface border border-theme-border rounded-theme p-6 shadow-theme flex items-center gap-4 sm:col-span-2">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-theme flex items-center justify-center text-xl shrink-0"><FaMapMarkerAlt /></div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visit Store</div>
                      <div className="font-bold text-theme-text text-sm">{address}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hours panel inside contact page */}
              <div className="bg-theme-surface border border-theme-border rounded-theme p-8 shadow-theme">
                <h3 className="font-extrabold text-theme-text text-xl mb-4" style={{ fontFamily: 'var(--heading-font)' }}>{config.hours?.title || 'Business Hours'}</h3>
                <div className="space-y-3">
                  {(config.hours?.days || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-theme-border pb-2.5 last:border-b-0 last:pb-0">
                      <span className="font-bold text-theme-muted text-sm">{item.day}</span>
                      <span className="font-extrabold text-theme-text text-sm">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Inquiry Form */}
            <div className="bg-theme-surface border border-theme-border rounded-theme p-8 md:p-10 shadow-theme relative overflow-hidden">
              <h3 className="text-2xl font-extrabold text-theme-text mb-6" style={{ fontFamily: 'var(--heading-font)' }}>Send an Inquiry</h3>
              
              {formSubmitted ? (
                <div className="absolute inset-0 bg-theme-surface/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
                  <div className="w-16 h-16 bg-green-50 text-theme-primary rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce"><FaPaperPlane /></div>
                  <h4 className="font-extrabold text-theme-text text-xl">Inquiry Submitted!</h4>
                  <p className="text-gray-400 text-sm mt-1 max-w-[280px]">Thank you for reaching out. We will get back to you shortly.</p>
                </div>
              ) : null}

              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Your Email</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Message</label>
                  <textarea 
                    placeholder="How can we help you?" 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 rounded-theme text-white font-extrabold shadow-theme hover:opacity-95 transition-opacity"
                  style={{ backgroundColor: accentColor }}
                >
                  Submit Form
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="pt-16 pb-8 px-6 transition-all duration-300" style={{ backgroundColor: config.footer.bgColor || '#111827', color: config.footer.textColor || '#9CA3AF' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                {fullLogoUrl ? (
                  <img src={fullLogoUrl} alt="Store Logo" className="w-10 h-10 object-contain rounded-theme" style={{background:'transparent'}} />
                ) : (
                  <div className="w-10 h-10 rounded-theme flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}><FaStore /></div>
                )}
                <span className="font-extrabold text-xl text-white tracking-tight" style={{ fontFamily: 'var(--heading-font)' }}>{storeName}</span>
              </div>
              <EditableText
                isEditable={isEditable}
                value={config.footer.tagline || 'Providing top-tier products and service.'}
                onChange={(val) => onUpdateConfig('footer', 'tagline', val)}
                tagName="p"
                className="leading-relaxed max-w-sm mb-6 text-sm"
              />
              {phoneNumber && (
                <p className="flex items-center text-white font-medium">
                  <FaPhoneAlt className="mr-2" style={{ color: accentColor }} /> {phoneNumber}
                </p>
              )}
            </div>
            
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><button onClick={() => changePage('home')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => changePage('shop')} className="hover:text-white transition-colors">Shop</button></li>
                <li><button onClick={() => changePage('contact')} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Newsletter</h4>
              <div className="flex">
                <input type="email" placeholder="Your email" className="bg-gray-800 border-none text-white px-4 py-3 rounded-l-lg flex-1 outline-none focus:ring-1 focus:ring-white" />
                <button className="text-white px-4 py-3 rounded-r-lg" style={{ backgroundColor: accentColor }}><FaPaperPlane /></button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-wrap justify-between items-center gap-4 text-sm">
            <p>© 2026 {storeName}. All rights reserved.</p>
            
            <div className="flex gap-6 opacity-60">
              {config.trust?.badges?.secure && <span className="flex items-center"><FaShieldAlt className="mr-1" /> Secure</span>}
              {config.trust?.badges?.returns && <span className="flex items-center"><FaClock className="mr-1" /> 30 Days</span>}
            </div>

            <p>Powered by <span className="text-white font-bold">VendorBuild</span></p>
          </div>
        </div>
      </footer>

      {/* Size Guide Modal */}
      {activeSizeGuideProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
          <div className="bg-theme-surface rounded-theme max-w-md w-full p-6 shadow-theme relative font-sans text-theme-text text-left">
            <button 
              onClick={() => setActiveSizeGuideProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-theme-muted font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>
            <h3 className="text-xl font-extrabold text-theme-text mb-1">
              📏 Fit & Size Guide
            </h3>
            <p className="text-xs text-theme-muted mb-6">{activeSizeGuideProduct.name}</p>
            
            <div className="border border-theme-border rounded-theme overflow-hidden mb-6">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-theme-bg text-gray-700 font-bold text-xs uppercase border-b border-theme-border">
                    <th className="p-3">Size</th>
                    <th className="p-3">Chest (in)</th>
                    <th className="p-3">Waist (in)</th>
                    <th className="p-3">Hips (in)</th>
                  </tr>
                </thead>
                <tbody className="text-theme-muted divide-y divide-gray-100">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz, idx) => (
                    <tr key={sz} className={activeSizeGuideProduct.sizes?.includes(sz) ? 'bg-blue-50/30 font-semibold text-blue-900' : ''}>
                      <td className="p-3">{sz}</td>
                      <td className="p-3">{34 + idx * 2}-{36 + idx * 2}</td>
                      <td className="p-3">{28 + idx * 2}-{30 + idx * 2}</td>
                      <td className="p-3">{36 + idx * 2}-{38 + idx * 2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-theme-bg rounded-theme border border-theme-border text-xs leading-relaxed text-theme-muted">
              <strong className="text-gray-700 block mb-1">Fabric & Care Notes:</strong>
              {activeSizeGuideProduct.material || "Refer to description: " + activeSizeGuideProduct.description}
            </div>
            
            <button 
              onClick={() => setActiveSizeGuideProduct(null)}
              className="w-full mt-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-theme shadow-theme transition-colors text-sm text-center"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* Inline Product Settings Modal Overlay */}
      {isEditable && activeEditProductId && (() => {
        const product = products.find(p => (p._id || p.id) === activeEditProductId);
        if (!product) return null;
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-theme-surface rounded-theme max-w-lg w-full p-6 shadow-theme relative font-sans text-theme-text text-left animate-fade-in border border-theme-border">
              <button 
                onClick={() => setActiveEditProductId(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-theme-muted font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ×
              </button>
              <h3 className="text-xl font-extrabold text-theme-text mb-1">
                Edit Product Settings
              </h3>
              <p className="text-xs text-theme-muted mb-6">Modify product details, upload/change local image, or delete this product.</p>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Product Name</label>
                  <input 
                    type="text"
                    value={product.name}
                    onChange={(e) => onUpdateProduct(product._id || product.id, 'name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Price (₹)</label>
                    <input 
                      type="number"
                      value={product.price}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Category</label>
                    <input 
                      type="text"
                      value={product.category || ''}
                      placeholder="e.g. Shirts, Tops, Accessories"
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'category', e.target.value)}
                      className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Description</label>
                  <textarea 
                    value={product.description || ''}
                    placeholder="Describe product materials, fitting details, style, etc."
                    onChange={(e) => onUpdateProduct(product._id || product.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  />
                </div>

                {/* Sizes Selection (Fashion specific) */}
                <div>
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Available Sizes</label>
                  <div className="flex gap-2 flex-wrap">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(sz => {
                      const hasSize = (product.sizes || []).includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            const currentSizes = product.sizes || [];
                            const newSizes = hasSize 
                              ? currentSizes.filter(s => s !== sz) 
                              : [...currentSizes, sz];
                            onUpdateProduct(product._id || product.id, 'sizes', newSizes);
                          }}
                          className={`px-4 py-2 rounded-theme text-xs font-bold transition-all border ${
                            hasSize 
                              ? 'bg-theme-primary text-white border-blue-600 text-white shadow-theme' 
                              : 'bg-theme-surface border-theme-border text-gray-700 hover:bg-theme-bg'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fabric Care Notes (mapped to material field in product model) */}
                <div>
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Fabric & Care Instructions</label>
                  <input 
                    type="text"
                    value={product.material || ''}
                    placeholder="e.g. 100% Linen. Gentle hand wash only."
                    onChange={(e) => onUpdateProduct(product._id || product.id, 'material', e.target.value)}
                    className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 py-1.5">
                  {/* Bestseller Badge */}
                  <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-blue-50/20 hover:bg-blue-50/45 border border-blue-100/60 rounded-theme transition-all">
                    <input 
                      type="checkbox"
                      checked={!!product.isBestseller}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'isBestseller', e.target.checked)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <div className="text-xs font-bold text-gray-700 select-none">
                      ⭐ Mark as Bestseller
                    </div>
                  </label>

                  {/* In Stock Toggle */}
                  <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-blue-50/20 hover:bg-blue-50/45 border border-blue-100/60 rounded-theme transition-all">
                    <input 
                      type="checkbox"
                      checked={product.inStock !== false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        onUpdateProduct(product._id || product.id, 'inStock', checked);
                        onUpdateProduct(product._id || product.id, 'stockQuantity', checked ? (product.stockQuantity > 0 ? product.stockQuantity : 10) : 0);
                      }}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <div className="text-xs font-bold text-gray-700 select-none">
                      📦 Product In Stock
                    </div>
                  </label>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Stock Quantity (Items Left)</label>
                  <input 
                    type="number"
                    min="0"
                    value={product.stockQuantity !== undefined ? product.stockQuantity : 10}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      onUpdateProduct(product._id || product.id, 'stockQuantity', val);
                      onUpdateProduct(product._id || product.id, 'inStock', val > 0);
                    }}
                    className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    placeholder="Quantity in Stock"
                  />
                </div>

                {/* Product Image Section */}
                <div className="p-4 border border-blue-100 rounded-theme bg-blue-50/20 space-y-3">
                  <span className="block text-xs font-bold text-blue-900 uppercase">Product Image</span>
                  
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-theme overflow-hidden bg-theme-bg border border-theme-border shrink-0">
                      <img 
                        src={getProductImageUrl(product, 0)} 
                        className="w-full h-full object-cover" 
                        alt="Product preview" 
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      {/* Local File Upload */}
                      <div>
                        <label className="inline-block px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded-theme text-xs cursor-pointer shadow-theme transition-all text-center">
                          📁 Upload Image from PC
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleProductImageUpload(product._id || product.id, e)} 
                            className="hidden" 
                          />
                        </label>
                      </div>

                      {/* URL input fallback */}
                      <input 
                        type="text" 
                        value={product.img || ''} 
                        placeholder="Or paste external Image URL" 
                        onChange={(e) => onUpdateProduct(product._id || product.id, 'img', e.target.value)} 
                        className="w-full px-3 py-1.5 bg-[#ffffff] border border-theme-border rounded-theme text-xs outline-none focus:ring-1 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-theme-border justify-between items-center">
                  <button 
                    onClick={() => {
                      if (onDeleteProduct) {
                        onDeleteProduct(product._id || product.id);
                        setActiveEditProductId(null);
                      } else {
                        alert("Delete callback not registered.");
                      }
                    }}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-theme-primary rounded-full font-bold text-xs shadow-theme transition-all"
                  >
                    Delete Product
                  </button>
                  <button 
                    onClick={() => setActiveEditProductId(null)}
                    className="px-6 py-2.5 bg-gray-900 hover:opacity-90 text-white rounded-full font-bold text-xs shadow transition-all"
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
          <div className="bg-theme-surface rounded-theme max-w-lg w-full p-6 shadow-theme relative font-sans text-theme-text text-left animate-fade-in border border-theme-border">
            <button 
              onClick={() => setShowBgModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-650 font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
             >
              ×
            </button>
            <h3 className="text-xl font-extrabold text-slate-955 mb-1">
              Header Background Settings
            </h3>
            <p className="text-xs text-theme-muted mb-6">Select a hand-picked fashion preset or generate an image using AI.</p>

            <div className="flex border-b border-theme-border mb-6 font-semibold">
              <button 
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 font-bold text-sm text-center border-b-2 transition-colors ${activeTab === 'presets' ? 'border-gray-900 text-theme-text' : 'border-transparent text-gray-400 hover:text-theme-muted'}`}
              >
                Curated Presets
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-2 font-bold text-sm text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-gray-900 text-theme-text' : 'border-transparent text-gray-400 hover:text-theme-muted'}`}
              >
                AI Background Generator
              </button>
            </div>

            {activeTab === 'presets' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
                {[
                  { name: 'Classic Clothing Rack', url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Modern Fashion Boutique', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Apparel Studio Lighting', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Minimalist Wardrobe Hangers', url: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Summer Fabric Textile', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Boutique Storefront Window', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80' }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      onUpdateConfig('header', 'heroImage', item.url);
                      setShowBgModal(false);
                    }}
                    className="cursor-pointer group relative aspect-video rounded-theme overflow-hidden border-2 border-transparent hover:border-gray-900 transition-all bg-gray-100"
                  >
                    <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name} />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-white font-bold leading-tight truncate">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Describe your background image</label>
                  <textarea 
                    placeholder="e.g. minimalist clothes rack backdrop, fashion boutique shop interior, apparel textures"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-theme-bg border border-gray-250 rounded-theme outline-none focus:ring-2 focus:ring-gray-900 text-sm resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Aesthetic Style</label>
                    <select 
                      value={aiStyle} 
                      onChange={(e) => setAiStyle(e.target.value)}
                      className="w-full p-3 bg-theme-bg border border-gray-250 rounded-theme outline-none focus:ring-2 focus:ring-gray-900 text-sm font-bold bg-theme-surface"
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
                  className="w-full py-3.5 hover:opacity-90 text-white font-bold rounded-full shadow transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: accentColor }}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating image...
                    </>
                  ) : 'Generate & Apply Background'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
