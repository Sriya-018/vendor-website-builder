import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaShoppingCart, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, 
  FaMapMarkerAlt, FaStore, FaWhatsapp, FaShieldAlt, FaClock, FaPaperPlane,
  FaSearch, FaFilter, FaSortAmountDown, FaBriefcase, FaCalculator
} from 'react-icons/fa';
import EditableText from '../EditableText';
import SectionWrapper from '../SectionWrapper';

export default function TemplateZenith({ 
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
  const [activeFeaturesProduct, setActiveFeaturesProduct] = useState(null);

  // Custom Zenith unique state: Cost Estimator
  const [calcService, setCalcService] = useState('development');
  const [calcDuration, setCalcDuration] = useState(3); // in months
  const [calcFeatures, setCalcFeatures] = useState({ design: true, seo: false, support: false });

  // Catalog Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  // Contact / Appointment Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [appointmentDetails, setAppointmentDetails] = useState({ date: '', time: '', serviceType: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Background Editor Modal State
  const [showBgModal, setShowBgModal] = useState(false);
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'ai'
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('realistic');
  const [isGenerating, setIsGenerating] = useState(false);

  const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'Zenith Agency');
  const storeName = website?.storeName || business?.businessName || 'My Store';
  const logo = website?.storeInfo?.logo ?? business?.logo ?? null;
  const fullLogoUrl = logo ? (logo.startsWith('http') ? logo : `http://localhost:5000${logo}`) : null;
  const description = config.header.heroHeading || 'Exquisite high-performance digital services.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const primaryColor = '#0B0F19'; // Luxury dark space
  const accentColor = config.themeColor || '#6366F1'; // Cyber Indigo
  const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80';

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
    if (!imgUrl) return `https://picsum.photos/seed/zenith${i}/600/600`;
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
    
    // Combine message with appointment details if set
    let submissionMessage = contactForm.message;
    if (appointmentDetails.date || appointmentDetails.time) {
      submissionMessage = `APPOINTMENT BOOKING REQUEST:\n` +
                          `Date: ${appointmentDetails.date || 'Not specified'}\n` +
                          `Time: ${appointmentDetails.time || 'Not specified'}\n` +
                          `Service Area: ${appointmentDetails.serviceType || 'General Consultation'}\n` +
                          `---------------------------------\n` +
                          `Customer Notes: ${contactForm.message}`;
    }

    if (!businessId || !websiteId) {
      setFormSubmitted(true);
      setContactForm({ name: '', email: '', message: '' });
      setAppointmentDetails({ date: '', time: '', serviceType: '' });
      setTimeout(() => setFormSubmitted(false), 5000);
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/business/${businessId}/inquiries`, {
        name: contactForm.name,
        email: contactForm.email,
        message: submissionMessage,
        websiteId
      });
      setFormSubmitted(true);
      setContactForm({ name: '', email: '', message: '' });
      setAppointmentDetails({ date: '', time: '', serviceType: '' });
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

  // Calculate dynamic estimated budget
  const getEstimatedBudget = () => {
    let baseRate = 12000; // base monthly developer rate
    if (calcService === 'design') baseRate = 8000;
    if (calcService === 'marketing') baseRate = 6000;
    
    let total = baseRate * calcDuration;
    if (calcFeatures.design) total += 5000;
    if (calcFeatures.seo) total += 3000 * calcDuration;
    if (calcFeatures.support) total += 2000 * calcDuration;
    
    return total;
  };

  const defaultOrder = ['hero', 'estimator', 'products', 'gallery', 'faq', 'testimonials', 'hours', 'contact'];
  const order = config.sectionOrder || defaultOrder;
  const sectionsVisible = config.sections || {
    hero: true,
    estimator: true,
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
            <header className="py-28 px-8 text-white animate-fade-in bg-[#0B0F19] border-b border-white/5">
              <div className={`max-w-7xl mx-auto grid ${devicePreview === 'desktop' ? 'grid-cols-2' : 'grid-cols-1'} gap-16 items-center`}>
                <div style={{ textAlign: config.header.heroAlign }}>
                  <div className="inline-block px-3 py-1 bg-theme-primary text-white/10 border border-indigo-500/30 rounded text-xs font-bold uppercase tracking-widest text-[#6366F1] mb-6">
                    Aviation & Space Digital Era
                  </div>
                  <EditableText
                    isEditable={isEditable}
                    value={config.header.heroHeading || storeName}
                    onChange={(val) => onUpdateConfig('header', 'heroHeading', val)}
                    tagName="h1"
                    className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-5 uppercase tracking-wide"
                  />
                  <EditableText
                    isEditable={isEditable}
                    value={config.header.heroSubheading || description}
                    onChange={(val) => onUpdateConfig('header', 'heroSubheading', val)}
                    tagName="p"
                    className="text-gray-400 text-md leading-relaxed mb-10 max-w-md"
                    style={{ marginInline: config.header.heroAlign === 'center' ? 'auto' : config.header.heroAlign === 'right' ? '0 0 0 auto' : '0' }}
                  />
                  <div className={`flex flex-wrap gap-4 ${config.header.heroAlign === 'center' ? 'justify-center' : config.header.heroAlign === 'right' ? 'justify-end' : ''}`}>
                    <button 
                      onClick={() => changePage('shop')}
                      className="px-8 py-3.5 bg-theme-primary text-white rounded text-white font-bold hover:bg-theme-primary text-white transition-colors uppercase tracking-wider text-xs shadow-theme shadow-indigo-600/30 flex items-center gap-2"
                      style={{ backgroundColor: accentColor }}
                    >
                      <EditableText isEditable={isEditable} value={config.header.ctaLabel || 'Explore Packages'} onChange={(val) => onUpdateConfig('header', 'ctaLabel', val)} />
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-full max-w-sm aspect-square rounded overflow-hidden bg-theme-surface/5 border border-white/10 p-1.5 relative group">
                    <img src={heroImage} className="w-full h-full object-cover" alt="Hero" />
                    {isEditable && (
                      <button 
                        onClick={() => setShowBgModal(true)}
                        className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-[#0B0F19]/90 border border-white/10 text-white rounded font-bold text-[10px] uppercase tracking-wider hover:scale-105 transition-transform flex items-center gap-1 font-sans"
                      >
                        🎨 Edit Hero Graphic
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </header>
          </SectionWrapper>
        );

      case 'estimator':
        return (
          <SectionWrapper key="estimator" isEditable={isEditable} sectionKey="estimator" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="bg-slate-950 text-white py-20 px-8 border-b border-white/5">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <span className="text-[10px] uppercase tracking-widest text-[#6366F1] font-bold block mb-2">Estimator</span>
                  <h2 className="text-3xl font-black uppercase tracking-wide">Interactive Budget Calculator</h2>
                  <p className="text-xs text-gray-400 mt-2 font-light">Estimate your project cost instantly based on service parameters.</p>
                </div>

                <div className="bg-[#0B0F19] border border-white/5 p-8 grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-6">
                    {/* Service Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Service Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'development', label: 'Tech Dev' },
                          { val: 'design', label: 'Design' },
                          { val: 'marketing', label: 'SEO/Ads' }
                        ].map(s => (
                          <button
                            key={s.val}
                            onClick={() => setCalcService(s.val)}
                            className={`py-2 text-[10px] uppercase tracking-wider font-bold border transition-colors ${
                              calcService === s.val 
                                ? 'bg-theme-primary text-white text-white border-indigo-600' 
                                : 'bg-black/30 text-gray-400 border-white/10 hover:border-indigo-600'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration Scope</label>
                        <span className="text-xs font-bold text-indigo-400">{calcDuration} Months</span>
                      </div>
                      <input 
                        type="range"
                        min="1"
                        max="12"
                        value={calcDuration}
                        onChange={(e) => setCalcDuration(parseInt(e.target.value))}
                        className="w-full h-1 bg-black/40 rounded-theme appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Addons Selection</label>
                      <label className="flex items-center gap-3 text-xs text-gray-300 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={calcFeatures.design}
                          onChange={(e) => setCalcFeatures({...calcFeatures, design: e.target.checked})}
                          className="accent-indigo-500 rounded"
                        />
                        <span>UI/UX Custom Design Mockup (+₹5,000)</span>
                      </label>
                      <label className="flex items-center gap-3 text-xs text-gray-300 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={calcFeatures.seo}
                          onChange={(e) => setCalcFeatures({...calcFeatures, seo: e.target.checked})}
                          className="accent-indigo-500 rounded"
                        />
                        <span>Monthly SEO & Audit Operations (+₹3,000/mo)</span>
                      </label>
                      <label className="flex items-center gap-3 text-xs text-gray-300 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={calcFeatures.support}
                          onChange={(e) => setCalcFeatures({...calcFeatures, support: e.target.checked})}
                          className="accent-indigo-500 rounded"
                        />
                        <span>24/7 Dedicated Tech Support SLA (+₹2,000/mo)</span>
                      </label>
                    </div>
                  </div>

                  <div className="h-full bg-black/40 border border-white/5 p-8 flex flex-col justify-between items-center text-center">
                    <div>
                      <FaCalculator className="text-theme-muted mb-4 mx-auto" size={24} />
                      <span className="text-[10px] uppercase tracking-widest text-gray-400">Total Estimate</span>
                      <div className="text-4xl font-black text-indigo-400 mt-2 tracking-wider">
                        ₹{getEstimatedBudget().toLocaleString()}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setContactForm({
                          ...contactForm,
                          message: `Hi, I estimated my budget using the Dynamic Calculator:
- Service: ${calcService}
- Scope Duration: ${calcDuration} Month(s)
- UI/UX Mockups: ${calcFeatures.design ? 'Yes' : 'No'}
- SEO Strategy: ${calcFeatures.seo ? 'Yes' : 'No'}
- Tech Support SLA: ${calcFeatures.support ? 'Yes' : 'No'}
Total Estimated: ₹${getEstimatedBudget().toLocaleString()}
Please reach out to discuss implementation.`
                        });
                        const section = document.getElementById('contact');
                        if (section) section.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="mt-6 w-full py-3 bg-theme-primary text-white text-white font-bold uppercase tracking-wider text-[10px] hover:bg-theme-primary text-white transition-colors"
                    >
                      Lock In Estimate & Inquire
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'products':
        return (
          <SectionWrapper key="products" isEditable={isEditable} sectionKey="products" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section id="services" className="max-w-7xl mx-auto px-8 py-24 bg-[#0B0F19] text-white">
              <div className="text-center mb-16">
                <EditableText
                  isEditable={isEditable}
                  value={config.products.sectionTitle || 'Service Capabilities'}
                  onChange={(val) => onUpdateConfig('products', 'sectionTitle', val)}
                  tagName="h2"
                  className="text-3xl font-black uppercase tracking-wider"
                  style={{ color: accentColor }}
                />
                <div className="w-16 h-[2px] mx-auto mt-4 bg-theme-primary text-white"></div>
              </div>
              
              <div 
                className="grid gap-8"
                style={{ 
                  gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
                    : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
                    : `repeat(${config.products.columnsDesktop || 3}, minmax(0, 1fr))`
                }}
              >
                {products.slice(0, 3).map((product, i) => (
                  <div 
                    key={product._id || product.id || i}
                    className="bg-slate-950 border border-white/5 overflow-hidden hover:border-indigo-600/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-48 overflow-hidden bg-slate-900 relative">
                        <img 
                          src={product.img || `https://picsum.photos/seed/service${i}/600/600`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.inStock === false && (
                          <div className="absolute inset-0 bg-black/85 flex items-center justify-center">
                            <span className="px-3 py-1.5 border border-red-500 text-theme-primary font-bold text-[10px] uppercase tracking-wider bg-red-950/20">
                              Fully Booked
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="text-[9px] font-bold tracking-widest uppercase text-indigo-400 mb-1.5">Capabilities Pack</div>
                        <EditableText
                          isEditable={isEditable}
                          value={product.name}
                          onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                          tagName="h4"
                          className="font-black text-lg mb-4 truncate uppercase tracking-wider"
                        />
                      </div>
                    </div>
                    <div className="p-6 pt-0">
                      <div className="flex items-center justify-between mt-2">
                        <div className="font-extrabold text-xl flex items-center gap-0.5 text-indigo-400">
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
                          data-product-image={product.img || `https://picsum.photos/seed/service${i}/600/600`}
                          disabled={product.inStock === false}
                          className="text-white px-4 py-2 bg-theme-primary text-white hover:bg-theme-primary text-white font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-40"
                        >
                          Enquire
                        </button>
                      </div>
                      {isEditable && (
                        <button 
                          onClick={() => setActiveEditProductId(product._id || product.id)}
                          className="w-full mt-3 py-1.5 bg-theme-surface/5 text-[9px] font-bold text-theme-muted hover:text-white uppercase tracking-widest"
                        >
                          ⚙️ Setup Details
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-16">
                <button 
                  onClick={() => changePage('shop')}
                  className="px-8 py-3.5 border border-indigo-600 text-indigo-400 hover:bg-theme-primary text-white hover:text-white font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Explore All Capabilities
                </button>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'gallery':
        const galleryTitle = config.gallery?.title || 'Case Studies Portfolio';
        const galleryImages = config.gallery?.images || [];
        return (
          <SectionWrapper key="gallery" isEditable={isEditable} sectionKey="gallery" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="max-w-7xl mx-auto px-8 py-20 bg-slate-950 text-white border-t border-b border-white/5">
              <div className="text-center mb-12">
                <EditableText
                  isEditable={isEditable}
                  value={galleryTitle}
                  onChange={(val) => onUpdateConfig('gallery', 'title', val)}
                  tagName="h2"
                  className="text-3xl font-black uppercase tracking-wider"
                  style={{ color: accentColor }}
                />
                <div className="w-12 h-[2px] mx-auto mt-4 bg-theme-primary text-white"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square overflow-hidden group border border-white/5 bg-[#0B0F19]">
                    <img src={img} alt={`Case Study ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {isEditable && (
                      <div className="absolute inset-0 bg-[#0B0F19]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
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
                          className="w-full px-3 py-1.5 bg-[#0B0F19] border border-indigo-600/30 text-white rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500"
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
            <section className="max-w-4xl mx-auto px-8 py-20 text-white">
              <div className="text-center mb-12">
                <EditableText
                  isEditable={isEditable}
                  value={faqTitle}
                  onChange={(val) => onUpdateConfig('faq', 'title', val)}
                  tagName="h2"
                  className="text-3xl font-black uppercase tracking-wider"
                  style={{ color: accentColor }}
                />
                <div className="w-12 h-[2px] mx-auto mt-4 bg-theme-primary text-white"></div>
              </div>
              <div className="space-y-4">
                {faqList.map((item, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={item.id || idx} className="bg-slate-950 border border-white/5 overflow-hidden transition-all animate-fade-in">
                      <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full px-6 py-4 text-left font-bold text-gray-250 flex items-center justify-between hover:bg-[#0B0F19] transition-colors text-xs uppercase tracking-wider">
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
                        <span className="text-[#6366F1]">{isOpen ? '—' : '+'}</span>
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
        const testTitle = config.testimonials?.title || 'Client Success Notes';
        const testList = config.testimonials?.items || [];
        return (
          <SectionWrapper key="testimonials" isEditable={isEditable} sectionKey="testimonials" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="bg-slate-950 py-24 text-white">
              <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-16">
                  <EditableText
                    isEditable={isEditable}
                    value={testTitle}
                    onChange={(val) => onUpdateConfig('testimonials', 'title', val)}
                    tagName="h2"
                    className="text-3xl font-black uppercase tracking-wider"
                    style={{ color: accentColor }}
                  />
                  <div className="w-12 h-[2px] mx-auto mt-4 bg-theme-primary text-white"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {testList.map((item, idx) => (
                    <div key={idx} className="p-8 border border-white/5 bg-[#0B0F19] text-center flex flex-col justify-between">
                      <div className="text-indigo-400 text-3xl font-black leading-none mb-6">“</div>
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
                          className="font-bold text-xs uppercase tracking-widest text-[#6366F1]"
                        />
                        <EditableText
                          isEditable={isEditable}
                          value={item.role || 'Executive Partner'}
                          onChange={(val) => {
                            const updated = [...testList];
                            updated[idx].role = val;
                            onUpdateConfig('testimonials', 'items', updated);
                          }}
                          tagName="span"
                          className="text-[9px] text-theme-muted tracking-wider font-semibold"
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
        const hoursTitle = config.hours?.title || 'Operational Availability';
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
                <div className="w-12 h-[2px] mx-auto mt-4 bg-theme-primary text-white"></div>
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
        const contactTitle = config.contact?.title || 'Project Boarding';
        const contactSubtitle = config.contact?.subtitle || 'Get in touch for custom agency scoping.';
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
                      className="text-3xl font-black uppercase tracking-wider mb-4"
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
                        <FaPhoneAlt className="text-indigo-400" />
                        <span>{phoneNumber}</span>
                      </div>
                    )}
                    {email && (
                      <div className="flex items-center gap-4">
                        <FaEnvelope className="text-indigo-400" />
                        <span>{email}</span>
                      </div>
                    )}
                    {address && (
                      <div className="flex items-center gap-4">
                        <FaMapMarkerAlt className="text-indigo-400" />
                        <span>{address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#0B0F19] p-8 border border-white/5 shadow-theme relative">
                  {formSubmitted ? (
                    <div className="text-center py-12 text-indigo-400 space-y-4 font-sans">
                      <FaPaperPlane size={36} className="mx-auto" />
                      <h4 className="text-xl font-bold uppercase tracking-wider">Inquiry Scoped</h4>
                      <p className="text-xs text-theme-muted font-light">Our lead scoping engineer will reach out shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#6366F1] border-b border-white/5 pb-3 mb-6">Briefing Scoping Document</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-theme-muted mb-1.5">Launch Date</label>
                          <input 
                            type="date"
                            value={appointmentDetails.date}
                            onChange={(e) => setAppointmentDetails({...appointmentDetails, date: e.target.value})}
                            className="w-full px-3 py-2.5 bg-black/30 border border-white/10 text-xs text-white outline-none focus:border-indigo-500 font-sans"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-theme-muted mb-1.5">Scope Area</label>
                          <select 
                            value={appointmentDetails.serviceType}
                            onChange={(e) => setAppointmentDetails({...appointmentDetails, serviceType: e.target.value})}
                            className="w-full px-3 py-2.5 bg-black/30 border border-white/10 text-xs text-white outline-none focus:border-indigo-500 font-sans"
                          >
                            <option value="General Consultation" className="bg-[#0B0F19]">Consultation</option>
                            <option value="Web & App Development" className="bg-[#0B0F19]">Tech Dev</option>
                            <option value="UI/UX Visual Design" className="bg-[#0B0F19]">Visual Brand</option>
                            <option value="Monthly SEO Growth" className="bg-[#0B0F19]">SEO Growth</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-theme-muted mb-1.5">Business Name / Name</label>
                        <input 
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          placeholder="e.g. John Doe"
                          className="w-full px-4 py-2.5 bg-black/30 border border-white/10 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-theme-muted mb-1.5">Contact Email Address</label>
                        <input 
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          placeholder="e.g. john@example.com"
                          className="w-full px-4 py-2.5 bg-black/30 border border-white/10 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-theme-muted mb-1.5">Project Scope Summary</label>
                        <textarea 
                          rows={3}
                          required
                          value={contactForm.message}
                          onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                          placeholder="Please note timeline constraints, required deliverables, budget parameters, etc."
                          className="w-full px-4 py-3 bg-black/30 border border-white/10 text-xs text-white outline-none focus:border-indigo-500 resize-none font-sans"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-3.5 bg-theme-primary text-white text-white font-bold uppercase tracking-wider text-xs hover:bg-theme-primary text-white transition-colors"
                      >
                        Request Project Scope Scrutiny
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
        className="w-full h-full overflow-y-auto relative bg-[#0B0F19] text-white flex flex-col justify-between font-sans"
      >
        {/* Simple Header */}
        <nav className="py-6 px-8 border-b border-white/5 flex items-center justify-between">
          {isEditable ? (
            <EditableText
              isEditable={true}
              value={businessName}
              onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
              tagName="span"
              className="font-black text-xl uppercase tracking-wider text-[#6366F1] cursor-text"
            />
          ) : (
            <button onClick={() => changePage('home')} className="font-black text-xl uppercase tracking-wider text-[#6366F1]">
              {businessName}
            </button>
          )}
          <button 
            onClick={() => changePage('home')}
            className="text-[10px] uppercase tracking-widest font-bold border border-white/15 px-4 py-2 transition-all hover:bg-theme-surface/5"
          >
            ← Back To Agency
          </button>
        </nav>

        {/* Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-black uppercase tracking-wider">Scoping Packages</h1>
            <p className="text-xs text-gray-400 mt-2 font-light">Select from our standard capability configurations and project modules.</p>
          </div>

          {/* Search, Filter & Sort */}
          <div className="bg-[#0B0F19] p-6 border border-white/5 mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <input 
                type="text" 
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/30 border border-white/10 text-xs text-white outline-none focus:border-indigo-500"
              />
              <FaSearch className="absolute left-3.5 top-3 text-gray-550" size={10} />
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-black/30 border border-white/10 text-xs text-white rounded-none outline-none focus:border-indigo-500 uppercase tracking-widest text-white shrink-0"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat} className="bg-[#0B0F19]">{cat}</option>
                ))}
              </select>

              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto px-3 py-2 bg-black/30 border border-white/10 text-xs text-white rounded-none outline-none focus:border-indigo-500 uppercase tracking-widest text-white"
              >
                <option value="default" className="bg-[#0B0F19]">Featured Scopes</option>
                <option value="price-low" className="bg-[#0B0F19]">Cost: Low to High</option>
                <option value="price-high" className="bg-[#0B0F19]">Cost: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {sortedFilteredProducts.map((product, i) => (
              <div 
                key={product._id || product.id || i}
                className="bg-slate-950 border border-white/5 flex flex-col justify-between hover:border-indigo-500/20 transition-all"
              >
                <div>
                  <div className="h-56 overflow-hidden relative bg-[#0B0F19]">
                    <img 
                      src={getProductImageUrl(product, i)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.isBestseller && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-theme-primary text-white text-white font-bold text-[9px] uppercase tracking-widest">
                        Most Popular
                      </span>
                    )}
                    {product.inStock === false && (
                      <div className="absolute inset-0 bg-black/85 flex items-center justify-center">
                        <span className="px-3 py-1.5 border border-red-500 text-theme-primary font-bold text-[10px] uppercase tracking-wider bg-red-950/20">
                          Fully Booked
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-[9px] uppercase tracking-widest text-indigo-400 mb-2 block">{product.category || 'Capability'}</span>
                    <EditableText
                      isEditable={isEditable}
                      value={product.name}
                      onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                      tagName="h4"
                      className="text-lg font-black uppercase tracking-wide truncate group-hover:text-indigo-400 transition-colors"
                    />
                    <p className="text-xs text-theme-muted mt-2 font-light leading-relaxed">
                      {product.description || "Indulge in this beautifully presented signature dish prepared by our master chef."}
                    </p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="font-extrabold text-lg text-indigo-400">
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
                      className="px-4 py-2 bg-theme-primary text-white hover:bg-theme-primary text-white text-white font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-40"
                    >
                      Enquire
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-xs text-gray-550 border-t border-white/5 bg-slate-950">
          <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div 
      id="preview-scroll-container"
      className="w-full h-full overflow-y-auto relative bg-[#0B0F19] flex flex-col justify-between font-sans text-gray-200"
    >
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-6 px-8 ${scrolled ? 'bg-[#0B0F19]/95 border-b border-white/5 shadow-theme' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {isEditable ? (
            <EditableText
              isEditable={true}
              value={businessName}
              onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
              tagName="span"
              className="font-black text-2xl uppercase tracking-widest text-[#6366F1] cursor-text"
            />
          ) : (
            <button onClick={() => changePage('home')} className="font-black text-2xl uppercase tracking-widest text-[#6366F1] focus:outline-none">
              {businessName}
            </button>
          )}
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => changePage('shop')} 
              className="px-5 py-2 border border-indigo-500/40 hover:bg-theme-primary text-white text-xs font-bold uppercase tracking-wider text-white transition-colors"
            >
              Get Scoped
            </button>
          </div>
        </div>
      </nav>

      {/* Main Sections */}
      <div className="flex-1">
        {order.map((sectionKey) => renderSection(sectionKey))}
      </div>

      {/* Footer */}
      <footer className="bg-black/60 py-12 px-8 border-t border-white/5 text-center text-xs text-theme-muted font-light">
        <div className="max-w-7xl mx-auto space-y-4">
          <p className="font-black text-[#6366F1] uppercase tracking-widest text-sm">{businessName}</p>
          <p>© {new Date().getFullYear()} {businessName}. High-Performance Creative Scoping.</p>
        </div>
      </footer>

      {/* Scoping Parameter Editor Modal */}
      {isEditable && activeEditProductId && (() => {
        const product = products.find(p => (p._id || p.id) === activeEditProductId);
        if (!product) return null;
        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-[#0B0F19] rounded-none max-w-lg w-full p-6 border border-indigo-600/30 shadow-theme relative text-left">
              <button 
                onClick={() => setActiveEditProductId(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-2xl w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
              
              <h3 className="text-xl font-bold uppercase tracking-wider text-[#6366F1] border-b border-white/5 pb-3 mb-6">
                Scoping Settings & Deliverables
              </h3>

              <div className="space-y-4 font-sans text-xs text-gray-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Package Name</label>
                    <input 
                      type="text"
                      value={product.name}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'name', e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Price (₹)</label>
                    <input 
                      type="number"
                      value={product.price}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Category</label>
                    <input 
                      type="text"
                      value={product.category || ''}
                      placeholder="e.g. Design Services, Development Packages"
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'category', e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Deliverables Scope Details</label>
                  <textarea 
                    value={product.description || ''}
                    placeholder="Describe scope, mockups timeline and hours of engagement included."
                    onChange={(e) => onUpdateProduct(product._id || product.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-indigo-500 resize-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 py-1.5">
                  <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-white/10 bg-black/20 transition-all">
                    <input 
                      type="checkbox"
                      checked={!!product.isBestseller}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'isBestseller', e.target.checked)}
                      className="w-4 h-4 accent-indigo-500 cursor-pointer"
                    />
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 select-none">
                      ⭐ Bestseller Option
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
                      className="w-4 h-4 accent-indigo-500 cursor-pointer"
                    />
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white select-none">
                      📦 Slots Available
                    </div>
                  </label>
                </div>

                {/* Slots Quantity */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Available Slots</label>
                  <input 
                    type="number"
                    min="0"
                    value={product.stockQuantity !== undefined ? product.stockQuantity : 10}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      onUpdateProduct(product._id || product.id, 'stockQuantity', val);
                      onUpdateProduct(product._id || product.id, 'inStock', val > 0);
                    }}
                    className="w-full px-4 py-2.5 bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-indigo-500"
                    placeholder="Available portion"
                  />
                </div>

                {/* Scoping Image */}
                <div className="p-4 border border-white/10 bg-black/25 space-y-3">
                  <span className="block text-[10px] uppercase tracking-wider text-theme-muted">Package graphic</span>
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
                        className="w-full px-3 py-1.5 bg-black/30 border border-white/10 text-xs text-white outline-none focus:border-indigo-500" 
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
                    className="px-4 py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900 rounded-none text-[10px] uppercase font-bold tracking-wider font-sans"
                  >
                    Delete Package
                  </button>
                  <button 
                    onClick={() => setActiveEditProductId(null)}
                    className="px-6 py-2.5 text-white font-bold uppercase tracking-wider text-xs shadow transition-all"
                    style={{ backgroundColor: accentColor }}
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
          <div className="bg-[#0B0F19] rounded-none max-w-lg w-full p-6 shadow-theme border border-white/10 relative text-left">
            <button 
              onClick={() => setShowBgModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-2xl w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-1">
              Zenith Background Settings
            </h3>
            <p className="text-xs text-theme-muted mb-6">Select a digital agency preset or generate using AI.</p>

            <div className="flex border-b border-white/10 mb-6 font-semibold">
              <button 
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 font-bold text-xs uppercase tracking-widest text-center border-b-2 transition-colors ${activeTab === 'presets' ? 'border-[#6366F1] text-indigo-400' : 'border-transparent text-theme-muted hover:text-gray-400'}`}
              >
                Presets
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-2 font-bold text-xs uppercase tracking-widest text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-[#6366F1] text-indigo-400' : 'border-transparent text-theme-muted hover:text-gray-400'}`}
              >
                AI Generator
              </button>
            </div>

            {activeTab === 'presets' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
                {[
                  { name: 'Modern Digital Office', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' },
                  { name: 'Tech Scoping Session', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80' },
                  { name: 'Creative Agency Workspace', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
                  { name: 'Consulting Collaboration', url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80' },
                  { name: 'Agency Meeting Space', url: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80' },
                  { name: 'Modern Tech Station', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80' }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      onUpdateConfig('header', 'heroImage', item.url);
                      setShowBgModal(false);
                    }}
                    className="cursor-pointer group relative aspect-video border border-white/5 hover:border-indigo-650 transition-all bg-black"
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
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Describe your scoping backdrop</label>
                  <textarea 
                    placeholder="e.g. futuristic digital agency tech workspace, high performance developer station 3D mockup"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-none outline-none focus:border-indigo-500 text-sm text-white resize-none"
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
                  className="w-full py-3.5 hover:opacity-90 text-white font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: accentColor }}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
