import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaShoppingCart, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, 
  FaMapMarkerAlt, FaStore, FaWhatsapp, FaShieldAlt, FaClock, FaPaperPlane,
  FaSearch, FaFilter, FaSortAmountDown
} from 'react-icons/fa';
import EditableText from '../EditableText';
import SectionWrapper from '../SectionWrapper';

export default function TemplateLayoutBase({
  templateId,
  config,
  business,
  products,
  devicePreview,
  website,
  isEditable = false,
  onUpdateConfig,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  
  // Theme Config overrides
  theme = {},
  presets = [],
  nicheSectionKey = 'nicheWidget',
  renderNicheWidget = () => null
}) {
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [activeEditProductId, setActiveEditProductId] = useState(null);

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

  const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'Organic Store');
  const storeName = website?.storeName || business?.businessName || 'My Store';
  const logo = website?.storeInfo?.logo ?? business?.logo ?? null;
  const fullLogoUrl = logo ? (logo.startsWith('http') ? logo : `http://localhost:5000${logo}`) : null;
  const description = config.header?.heroSubheading || 'Discover our premium selection.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';

  const primaryColor = theme.primaryColor || '#1F2937';
  const accentColor = config.themeColor || theme.accentColor || '#3B82F6';
  const heroImage = config.header?.heroImage || theme.defaultHeroImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80';

  const defaultOrder = ['hero', nicheSectionKey, 'products', 'gallery', 'faq', 'testimonials', 'hours', 'contact'];
  const order = config.sectionOrder || defaultOrder;
  const sectionsVisible = config.sections || {
    hero: true,
    [nicheSectionKey]: true,
    products: true,
    gallery: true,
    faq: true,
    testimonials: true,
    hours: true,
    contact: true
  };

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getProductImageUrl = (product, i) => {
    const imgUrl = product.img || product.imageUrl;
    if (!imgUrl) return `https://picsum.photos/seed/${templateId}_${i}/600/600`;
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

  // Filtering & sorting for catalog page
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

  const renderSection = (key) => {
    if (sectionsVisible[key] === false) return null;

    switch (key) {
      case 'hero':
        return (
          <SectionWrapper key="hero" isEditable={isEditable} sectionKey="hero" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <header className={`relative flex items-center overflow-hidden transition-all ${theme.heroClass || 'min-h-[80vh] bg-slate-900 text-white'}`}>
              <div className="absolute inset-0 z-0">
                <img src={heroImage} className="w-full h-full object-cover opacity-60" alt="Hero background" />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
              
              {isEditable && (
                <button 
                  onClick={() => setShowBgModal(true)}
                  className="absolute bottom-6 right-6 z-20 px-4 py-2 bg-theme-surface text-theme-text rounded-full font-bold text-xs shadow-theme hover:scale-105 transition-transform flex items-center gap-1.5 font-sans"
                >
                  🎨 Edit Hero Background
                </button>
              )}

              <div className="relative z-10 max-w-7xl mx-auto px-8 py-24 w-full">
                <div className="max-w-2xl" style={{ textAlign: config.header?.heroAlign || 'left' }}>
                  <EditableText
                    isEditable={isEditable}
                    value={config.header?.heroHeading || storeName}
                    onChange={(val) => onUpdateConfig('header', 'heroHeading', val)}
                    tagName="h1"
                    className={`font-black tracking-tight mb-6 text-white ${theme.heroHeadingClass || 'text-5xl md:text-7xl leading-none'}`}
                  />
                  <EditableText
                    isEditable={isEditable}
                    value={config.header?.heroSubheading || description}
                    onChange={(val) => onUpdateConfig('header', 'heroSubheading', val)}
                    tagName="p"
                    className={`text-lg text-slate-200 mb-10 leading-relaxed font-light ${theme.heroSubheadingClass || ''}`}
                  />
                  <div className={`flex flex-wrap gap-4 ${config.header?.heroAlign === 'center' ? 'justify-center' : config.header?.heroAlign === 'right' ? 'justify-end' : ''}`}>
                    <button 
                      onClick={() => changePage('shop')}
                      className={`px-8 py-4 font-bold hover:opacity-90 transition-opacity flex items-center gap-2 text-sm uppercase tracking-wider ${theme.ctaButtonClass || 'bg-theme-primary text-white text-white rounded-theme'}`}
                      style={{ backgroundColor: !theme.ctaButtonClass ? accentColor : undefined }}
                    >
                      <EditableText isEditable={isEditable} value={config.header?.ctaLabel || 'Explore Store'} onChange={(val) => onUpdateConfig('header', 'ctaLabel', val)} />
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            </header>
          </SectionWrapper>
        );

      case nicheSectionKey:
        return (
          <SectionWrapper key={nicheSectionKey} isEditable={isEditable} sectionKey={nicheSectionKey} sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            {renderNicheWidget({ primaryColor, accentColor })}
          </SectionWrapper>
        );

      case 'products':
        return (
          <SectionWrapper key="products" isEditable={isEditable} sectionKey="products" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className={`py-24 px-8 ${theme.catalogSectionClass || 'bg-theme-surface text-theme-text'}`}>
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className={`font-black tracking-tight ${theme.sectionHeadingClass || 'text-3xl md:text-4xl text-theme-text'}`}>
                    {config.products?.sectionTitle || 'Featured Collection'}
                  </h2>
                  <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ backgroundColor: accentColor }}></div>
                </div>

                <div className="grid md:grid-cols-4 gap-8">
                  {products.slice(0, 4).map((p, i) => (
                    <div key={p.id} className={`group flex flex-col justify-between h-full p-4 border transition-all ${theme.productCardClass || 'bg-theme-surface rounded-theme border-theme-border shadow-theme hover:shadow-theme'}`}>
                      <div className="relative aspect-square overflow-hidden rounded-theme bg-slate-100 mb-4">
                        <img src={getProductImageUrl(p, i)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={p.name} />
                        {p.isBestseller && (
                          <span className="absolute top-2 left-2 bg-theme-primary text-white text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">Bestseller</span>
                        )}
                        {!p.inStock && (
                          <span className="absolute top-2 right-2 bg-theme-primary text-white text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">Sold Out</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-bold text-base mb-1 line-clamp-1">{p.name}</h3>
                        <p className="text-sm text-theme-muted line-clamp-2 leading-relaxed flex-1 mb-3">{p.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-black text-lg text-theme-text">₹{p.price}</span>
                          <span className="text-xs text-slate-400 font-medium">Qty: {p.stockQuantity}</span>
                        </div>
                        <button
                          className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-theme transition-colors flex items-center justify-center gap-2 ${
                            p.inStock 
                              ? 'bg-slate-900 text-white hover:bg-slate-800' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                          disabled={!p.inStock}
                          data-product-name={p.name}
                          data-product-price={p.price}
                          data-product-image={getProductImageUrl(p, i)}
                          data-product-id={p._id || p.id}
                        >
                          <FaShoppingCart size={12} />
                          {p.inStock ? 'Add to Bag' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-12">
                  <button 
                    onClick={() => changePage('shop')}
                    className="inline-flex items-center gap-2 font-bold text-sm tracking-widest uppercase hover:underline"
                    style={{ color: accentColor }}
                  >
                    View All Products <FaArrowRight size={10} />
                  </button>
                </div>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'gallery':
        const galleryTitle = config.gallery?.title || 'Gallery';
        const galleryImages = config.gallery?.images || [];
        return (
          <SectionWrapper key="gallery" isEditable={isEditable} sectionKey="gallery" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className={`py-24 px-8 ${theme.gallerySectionClass || 'bg-theme-bg'}`}>
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className={`font-black tracking-tight ${theme.sectionHeadingClass || 'text-3xl text-theme-text'}`}>{galleryTitle}</h2>
                  <div className="w-12 h-0.5 mx-auto mt-4" style={{ backgroundColor: accentColor }}></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="aspect-square overflow-hidden rounded-theme bg-slate-200 shadow-theme border border-theme-border">
                      <img src={img} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt={`Gallery item ${idx}`} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'faq':
        const faqTitle = config.faq?.title || 'FAQ';
        const faqList = config.faq?.questions || [];
        return (
          <SectionWrapper key="faq" isEditable={isEditable} sectionKey="faq" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className={`py-24 px-8 ${theme.faqSectionClass || 'bg-theme-surface'}`}>
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className={`font-black tracking-tight ${theme.sectionHeadingClass || 'text-3xl text-theme-text'}`}>{faqTitle}</h2>
                  <div className="w-12 h-0.5 mx-auto mt-4" style={{ backgroundColor: accentColor }}></div>
                </div>
                <div className="space-y-4">
                  {faqList.map((faq, idx) => (
                    <div key={faq.id} className="border border-theme-border rounded-theme overflow-hidden shadow-theme bg-theme-surface">
                      <button
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-700 hover:text-theme-text transition-colors"
                      >
                        <span>{faq.question}</span>
                        <span className="text-xl">{activeFaq === idx ? '−' : '+'}</span>
                      </button>
                      {activeFaq === idx && (
                        <div className="px-6 pb-5 text-sm text-theme-muted leading-relaxed border-t border-slate-50 pt-4">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'testimonials':
        const testTitle = config.testimonials?.title || 'Testimonials';
        const testList = config.testimonials?.list || config.testimonials?.items || [];
        return (
          <SectionWrapper key="testimonials" isEditable={isEditable} sectionKey="testimonials" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className={`py-24 px-8 ${theme.testimonialsSectionClass || 'bg-theme-bg'}`}>
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className={`font-black tracking-tight ${theme.sectionHeadingClass || 'text-3xl text-theme-text'}`}>{testTitle}</h2>
                  <div className="w-12 h-0.5 mx-auto mt-4" style={{ backgroundColor: accentColor }}></div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {testList.map((item, idx) => (
                    <div key={item.id || idx} className={`p-8 bg-theme-surface border border-theme-border rounded-theme shadow-theme flex flex-col justify-between ${theme.testimonialCardClass || ''}`}>
                      <p className="text-theme-muted text-sm leading-relaxed italic mb-6">“{item.review || item.text}”</p>
                      <div className="border-t border-slate-50 pt-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-theme-text text-sm">{item.name || item.author}</h4>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.role || 'Verified Customer'}</span>
                        </div>
                        <div className="flex text-amber-400 text-xs">
                          {Array.from({ length: item.rating || 5 }).map((_, i) => (
                            <FaStar key={i} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'hours':
        const hoursTitle = config.hours?.title || 'Opening Hours';
        const hoursDays = config.hours?.days || [];
        return (
          <SectionWrapper key="hours" isEditable={isEditable} sectionKey="hours" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className={`py-24 px-8 ${theme.hoursSectionClass || 'bg-theme-surface'}`}>
              <div className="max-w-xl mx-auto text-center">
                <h2 className={`font-black tracking-tight mb-8 ${theme.sectionHeadingClass || 'text-3xl text-theme-text'}`}>{hoursTitle}</h2>
                <div className="divide-y divide-slate-100 border-t border-b border-theme-border py-4 text-sm">
                  {hoursDays.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-3.5">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider">{item.day}</span>
                      <span className="font-bold text-theme-text">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'contact':
        const contactTitle = config.contact?.title || 'Get In Touch';
        return (
          <SectionWrapper key="contact" isEditable={isEditable} sectionKey="contact" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className={`py-24 px-8 ${theme.contactSectionClass || 'bg-theme-bg'}`}>
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-16">
                  <div>
                    <h2 className={`font-black tracking-tight mb-6 ${theme.sectionHeadingClass || 'text-3xl text-theme-text'}`}>{contactTitle}</h2>
                    <p className="text-theme-muted mb-8 leading-relaxed">Have questions or want custom orders? Message us directly using the form, or reach out using the contact details below.</p>
                    <div className="space-y-4">
                      {phoneNumber && (
                        <div className="flex items-center gap-3.5 text-sm text-theme-muted">
                          <FaPhoneAlt style={{ color: accentColor }} />
                          <span>{phoneNumber}</span>
                        </div>
                      )}
                      {email && (
                        <div className="flex items-center gap-3.5 text-sm text-theme-muted">
                          <FaEnvelope style={{ color: accentColor }} />
                          <span>{email}</span>
                        </div>
                      )}
                      {address && (
                        <div className="flex items-center gap-3.5 text-sm text-theme-muted">
                          <FaMapMarkerAlt style={{ color: accentColor }} />
                          <span>{address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleContactSubmit} className="bg-theme-surface p-8 border border-theme-border rounded-theme shadow-theme space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Name</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-4 py-3 border border-theme-border rounded-theme text-sm focus:outline-none focus:border-slate-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Email</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-4 py-3 border border-theme-border rounded-theme text-sm focus:outline-none focus:border-slate-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Message</label>
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        rows="4"
                        className="w-full px-4 py-3 border border-theme-border rounded-theme text-sm focus:outline-none focus:border-slate-400"
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 font-bold uppercase tracking-wider text-xs rounded-theme text-white shadow-theme flex items-center justify-center gap-2"
                      style={{ backgroundColor: accentColor }}
                    >
                      <FaPaperPlane size={10} /> Send Message
                    </button>
                    {formSubmitted && (
                      <p className="text-xs text-theme-primary font-bold text-center">Thank you! Your message was submitted successfully.</p>
                    )}
                  </form>
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
        className={`w-full h-full overflow-y-auto relative ${theme.layoutClass || 'bg-theme-surface text-theme-text'} ${theme.fontClass || 'font-sans'}`}
      >
        {/* Navigation */}
        <nav className={`sticky top-0 left-0 right-0 z-50 transition-all py-5 px-8 ${theme.navbarClass || 'bg-theme-surface border-b border-theme-border shadow-theme'}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {isEditable ? (
              fullLogoUrl ? (
                <div className={`font-black uppercase tracking-tight text-xl ${theme.logoTextClass || 'text-theme-text'}`}>
                  <img src={fullLogoUrl} className="h-8 object-contain" alt="logo" />
                </div>
              ) : (
                <EditableText
                  isEditable={true}
                  value={config.navbar?.logoText || businessName}
                  onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
                  tagName="span"
                  className={`font-black focus:outline-none uppercase tracking-tight text-xl cursor-text ${theme.logoTextClass || 'text-theme-text'}`}
                />
              )
            ) : (
              <button onClick={() => changePage('home')} className={`font-black focus:outline-none uppercase tracking-tight text-xl ${theme.logoTextClass || 'text-theme-text'}`}>
                {fullLogoUrl ? <img src={fullLogoUrl} className="h-8 object-contain" alt="logo" /> : businessName}
              </button>
            )}
            <div className="flex items-center gap-6">
              <button onClick={() => changePage('home')} className="text-xs font-bold uppercase tracking-wider hover:opacity-80">Home</button>
              <button onClick={() => changePage('shop')} className="text-xs font-bold uppercase tracking-wider hover:opacity-80 border-b-2 pb-1" style={{
        '--primary': primaryColor,
        '--accent': accentColor, borderColor: accentColor }}>Catalog</button>
            </div>
          </div>
        </nav>

        {/* Catalog Section */}
        <section className="py-20 px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-theme-border pb-8">
              <div>
                <h1 className={`font-black text-3xl md:text-5xl ${theme.logoTextClass || ''}`}>Product Catalog</h1>
                <p className="text-theme-muted text-sm mt-2">Browse our high-quality inventory.</p>
              </div>
              
              {/* Search & Sort Panel */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 text-xs border border-theme-border rounded-theme focus:outline-none w-64"
                  />
                  <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                </div>
                
                <div className="flex items-center gap-2">
                  <FaSortAmountDown className="text-slate-400 text-xs" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-theme-border rounded-theme py-2 px-3 text-xs bg-theme-surface text-slate-700 focus:outline-none"
                  >
                    <option value="default">Default Sort</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            {categoriesList.length > 2 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                      selectedCategory === cat 
                        ? 'text-white' 
                        : 'bg-theme-bg text-theme-muted hover:bg-slate-100 border border-theme-border'
                    }`}
                    style={{ backgroundColor: selectedCategory === cat ? accentColor : undefined }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Product Grid */}
            {sortedFilteredProducts.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-medium">No products match your filters.</div>
            ) : (
              <div className="grid md:grid-cols-4 gap-8">
                {sortedFilteredProducts.map((p, i) => (
                  <div key={p.id} className={`group flex flex-col justify-between h-full p-4 border transition-all ${theme.productCardClass || 'bg-theme-surface rounded-theme border-theme-border shadow-theme hover:shadow-theme'}`}>
                    <div className="relative aspect-square overflow-hidden rounded-theme bg-slate-100 mb-4">
                      <img src={getProductImageUrl(p, i)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={p.name} />
                      {p.isBestseller && (
                        <span className="absolute top-2 left-2 bg-theme-primary text-white text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">Bestseller</span>
                      )}
                      {!p.inStock && (
                        <span className="absolute top-2 right-2 bg-theme-primary text-white text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">Sold Out</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-bold text-base mb-1 line-clamp-1">{p.name}</h3>
                      <p className="text-sm text-theme-muted line-clamp-2 leading-relaxed flex-1 mb-3">{p.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-black text-lg text-theme-text">₹{p.price}</span>
                        <span className="text-xs text-slate-400 font-medium">Qty: {p.stockQuantity}</span>
                      </div>
                      <button
                        className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-theme transition-colors flex items-center justify-center gap-2 ${
                          p.inStock 
                            ? 'bg-slate-900 text-white hover:bg-slate-800' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                        disabled={!p.inStock}
                        data-product-name={p.name}
                        data-product-price={p.price}
                        data-product-image={getProductImageUrl(p, i)}
                        data-product-id={p._id || p.id}
                      >
                        <FaShoppingCart size={12} />
                        {p.inStock ? 'Add to Bag' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-12 border-t border-theme-border text-center text-xs text-slate-400 font-light ${theme.footerClass || 'bg-theme-surface'}`}>
          <p className="font-bold text-slate-700 uppercase tracking-widest mb-2">{businessName}</p>
          <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div 
      id="preview-scroll-container"
      className={`w-full h-full overflow-y-auto relative ${theme.layoutClass || 'bg-theme-surface text-theme-text'} ${theme.fontClass || 'font-sans'}`}
    >
      {/* Navigation */}
      <nav className={`sticky top-0 left-0 right-0 z-50 transition-all py-5 px-8 ${theme.navbarClass || 'bg-theme-surface border-b border-theme-border shadow-theme'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {isEditable ? (
            fullLogoUrl ? (
              <div className={`font-black uppercase tracking-tight text-xl ${theme.logoTextClass || 'text-theme-text'}`}>
                <img src={fullLogoUrl} className="h-8 object-contain" alt="logo" />
              </div>
            ) : (
              <EditableText
                isEditable={true}
                value={config.navbar?.logoText || businessName}
                onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
                tagName="span"
                className={`font-black focus:outline-none uppercase tracking-tight text-xl cursor-text ${theme.logoTextClass || 'text-theme-text'}`}
              />
            )
          ) : (
            <button onClick={() => changePage('home')} className={`font-black focus:outline-none uppercase tracking-tight text-xl ${theme.logoTextClass || 'text-theme-text'}`}>
              {fullLogoUrl ? <img src={fullLogoUrl} className="h-8 object-contain" alt="logo" /> : businessName}
            </button>
          )}
          <div className="flex items-center gap-6">
            <button onClick={() => changePage('home')} className="text-xs font-bold uppercase tracking-wider hover:opacity-80 border-b-2 pb-1" style={{ borderColor: accentColor }}>Home</button>
            <button onClick={() => changePage('shop')} className="text-xs font-bold uppercase tracking-wider hover:opacity-80">Catalog</button>
          </div>
        </div>
      </nav>

      {/* Main Sections */}
      <div>
        {order.map((key) => renderSection(key))}
      </div>

      {/* Footer */}
      <footer className={`py-12 border-t border-theme-border text-center text-xs text-slate-400 font-light ${theme.footerClass || 'bg-theme-surface'}`}>
        <p className="font-bold text-slate-700 uppercase tracking-widest mb-2">{businessName}</p>
        <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
      </footer>

      {/* AI BACKGROUND EDITOR MODAL */}
      {showBgModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-theme-surface rounded-theme max-w-lg w-full p-6 shadow-theme relative text-left text-theme-text border border-slate-150">
            <button 
              onClick={() => setShowBgModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-theme-muted font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              ×
            </button>
            
            <h3 className="text-xl font-bold tracking-tight text-theme-text mb-6 flex items-center gap-2">
              <span>🖼️ Customize Hero Background</span>
            </h3>

            {/* Tabs */}
            <div className="flex border-b border-theme-border mb-6">
              <button 
                onClick={() => setActiveTab('presets')}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'presets' ? 'border-slate-900 text-theme-text' : 'border-transparent text-slate-400 hover:text-theme-muted'}`}
              >
                Category Presets
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ai' ? 'border-slate-900 text-theme-text' : 'border-transparent text-slate-400 hover:text-theme-muted'}`}
              >
                AI Generator
              </button>
            </div>

            {activeTab === 'presets' ? (
              <div className="space-y-4">
                <p className="text-xs text-theme-muted mb-4">Choose a curated, high-resolution aesthetic background preset for your niche:</p>
                <div className="grid grid-cols-2 gap-4 max-h-[250px] overflow-y-auto pr-1">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onUpdateConfig('header', 'heroImage', preset.url);
                        setShowBgModal(false);
                      }}
                      className="group relative aspect-video rounded-theme overflow-hidden bg-slate-100 border border-theme-border hover:scale-[1.02] transition-transform duration-200 text-left"
                    >
                      <img src={preset.url} className="w-full h-full object-cover" alt={preset.name} />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-end p-2.5">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-2">AI Generation Prompt</label>
                  <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. A gorgeous luxury cosmetics counter with glowing lights and serum bottles, photo realistic..."
                    className="w-full px-4 py-3 border border-theme-border rounded-theme text-sm focus:outline-none focus:border-slate-400 bg-theme-bg/50"
                    rows="3"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Artistic Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'realistic', label: '📸 Real Photo' },
                      { id: 'watercolor', label: '🎨 Watercolor' },
                      { id: 'flat_vector', label: '📐 Vector Flat' },
                      { id: 'pixel_art', label: '👾 Retro Pixel' },
                      { id: 'cyberpunk', label: '🌌 Cyber Neon' }
                    ].map(style => (
                      <button
                        key={style.id}
                        onClick={() => setAiStyle(style.id)}
                        className={`py-2 px-1 text-center rounded-theme text-xs font-semibold border transition-all ${
                          aiStyle === style.id 
                            ? 'border-slate-900 bg-slate-900 text-white font-bold' 
                            : 'border-theme-border hover:bg-theme-bg text-theme-muted'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleGenerateAiBg}
                  className="w-full mt-4 py-3.5 font-bold uppercase tracking-wider text-xs bg-slate-900 text-white rounded-theme hover:bg-slate-800 shadow-theme flex items-center justify-center gap-2"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating Background...
                    </>
                  ) : (
                    '🪄 Run AI Generator'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
