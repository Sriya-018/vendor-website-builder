import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaShoppingCart, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, 
  FaMapMarkerAlt, FaStore, FaWhatsapp, FaShieldAlt, FaClock, FaPaperPlane,
  FaSearch, FaFilter, FaSortAmountDown, FaLeaf, FaQuestionCircle
} from 'react-icons/fa';
import EditableText from '../EditableText';
import SectionWrapper from '../SectionWrapper';
import CustomPageRenderer from './CustomPageRenderer';

export default function TemplateFlora({ 
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
  const isCustomPage = !['home', 'shop', 'contact'].includes(currentPage);
  const activeCustomPage = (config.customPages || []).find(p => p.id === currentPage);
  const [activeEditProductId, setActiveEditProductId] = useState(null);

  // Custom Flora unique state: Routine Finder Quiz
  const [quizSkinType, setQuizSkinType] = useState('dry');
  const [quizGoal, setQuizGoal] = useState('hydration');
  const [quizResult, setQuizResult] = useState(null);

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

  const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'Flora Organic');
  const storeName = website?.storeName || business?.businessName || 'My Store';
  const logo = website?.storeInfo?.logo ?? business?.logo ?? null;
  const fullLogoUrl = logo ? (logo.startsWith('http') ? logo : `http://localhost:5000${logo}`) : null;
  const description = config.header.heroHeading || 'Organic aromatherapy and botanical cosmetics.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const primaryColor = config.theme?.primary || '#1F2937'; // Heavy dark gray
  const accentColor = config.theme?.accent || '#4B5E52'; // Botanical Sage Green
  const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=80';

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
    if (!imgUrl) return `https://picsum.photos/seed/flora${i}/600/600`;
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

  // Quiz Recommendation Logic
  const handleSolveQuiz = () => {
    let matchIdx = 0;
    if (quizSkinType === 'oily' && quizGoal === 'acne') matchIdx = 1;
    if (quizSkinType === 'sensitive') matchIdx = 2;
    
    const matchedProduct = products[matchIdx] || products[0];
    setQuizResult(matchedProduct);
  };

  const defaultOrder = ['hero', 'routineFinder', 'products', 'gallery', 'faq', 'testimonials', 'hours', 'contact'];
  const order = config.sectionOrder || defaultOrder;
  const sectionsVisible = config.sections || {
    hero: true,
    routineFinder: true,
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
            <header className="relative min-h-[75vh] flex items-center overflow-hidden animate-fade-in bg-[#f5f7f6]">
              <div className="absolute inset-0 z-0">
                <img src={heroImage} className="w-full h-full object-cover opacity-80" alt="Hero background" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(31,41,55,0.7) 35%, rgba(31,41,55,0.15))' }}></div>
              </div>
              
              {isEditable && (
                <button 
                  onClick={() => setShowBgModal(true)}
                  className="absolute bottom-6 right-6 z-20 px-4 py-2 bg-theme-surface/95 border border-theme-border text-theme-text rounded-full font-bold text-xs shadow-theme hover:scale-105 transition-transform flex items-center gap-1.5 font-sans"
                >
                  🎨 Edit Hero Background
                </button>
              )}
              <div className="relative z-10 max-w-7xl mx-auto px-8 w-full text-white">
                <div className="max-w-md animate-fade-in" style={{ textAlign: config.header.heroAlign }}>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-4 text-[#4B5E52] flex items-center gap-1.5" style={{ color: accentColor }}>
                    <FaLeaf size={10} /> 100% Organic Botanical Science
                  </p>
                  <EditableText
                    isEditable={isEditable}
                    value={config.header.heroHeading || storeName}
                    onChange={(val) => onUpdateConfig('header', 'heroHeading', val)}
                    tagName="h1"
                    className="text-4xl md:text-6xl font-bold leading-tight mb-5 tracking-wide"
                  />
                  <EditableText
                    isEditable={isEditable}
                    value={config.header.heroSubheading || description}
                    onChange={(val) => onUpdateConfig('header', 'heroSubheading', val)}
                    tagName="p"
                    className="text-[#f5f7f6]/80 text-sm leading-relaxed mb-10 font-light"
                  />
                  <div className={`flex flex-wrap gap-4 ${config.header.heroAlign === 'center' ? 'justify-center' : config.header.heroAlign === 'right' ? 'justify-end' : ''}`}>
                    <button 
                      onClick={() => changePage('shop')}
                      className="px-8 py-3 bg-[#4B5E52] text-white hover:opacity-95 text-xs font-bold uppercase tracking-wider transition-opacity flex items-center gap-2"
                      style={{ backgroundColor: accentColor }}
                    >
                      <EditableText isEditable={isEditable} value={config.header.ctaLabel || 'Explore Aromatherapy'} onChange={(val) => onUpdateConfig('header', 'ctaLabel', val)} />
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            </header>
          </SectionWrapper>
        );

      case 'routineFinder':
        return (
          <SectionWrapper key="routineFinder" isEditable={isEditable} sectionKey="routineFinder" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="bg-theme-bg py-20 px-8 border-b border-gray-150">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <span className="text-[10px] uppercase tracking-widest text-[#4B5E52] font-bold block mb-2" style={{ color: accentColor }}>Botanical Quiz</span>
                  <h2 className="text-3xl font-bold tracking-wide text-theme-text">Skincare Routine Finder</h2>
                  <p className="text-xs text-theme-muted mt-2 font-light">Identify your skin needs to select a perfectly matched botanical routine.</p>
                </div>

                <div className="bg-theme-surface border border-theme-border p-8 grid md:grid-cols-2 gap-8 items-start">
                  {/* Selectable quiz questions */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted flex items-center gap-2 mb-2">
                      <FaQuestionCircle className="text-[#4B5E52]" style={{ color: accentColor }} /> Select Parameters
                    </h3>
                    
                    {/* Skin Type selector */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">1. Your Skin Profile</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'dry', label: 'Dry' },
                          { val: 'oily', label: 'Oily' },
                          { val: 'sensitive', label: 'Sensitive' }
                        ].map(t => (
                          <button
                            key={t.val}
                            onClick={() => { setQuizSkinType(t.val); setQuizResult(null); }}
                            className={`py-2 text-[10px] uppercase font-bold border transition-colors ${
                              quizSkinType === t.val 
                                ? 'bg-[#4B5E52] text-white border-[#4B5E52]' 
                                : 'bg-theme-bg text-theme-muted border-theme-border hover:bg-gray-100'
                            }`}
                            style={quizSkinType === t.val ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Skin Goal selector */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">2. Your Skin Target</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'hydration', label: 'Hydration' },
                          { val: 'acne', label: 'Clear Acne' },
                          { val: 'antiaging', label: 'Glow/Age' }
                        ].map(g => (
                          <button
                            key={g.val}
                            onClick={() => { setQuizGoal(g.val); setQuizResult(null); }}
                            className={`py-2 text-[10px] uppercase font-bold border transition-colors ${
                              quizGoal === g.val 
                                ? 'bg-[#4B5E52] text-white border-[#4B5E52]' 
                                : 'bg-theme-bg text-theme-muted border-theme-border hover:bg-gray-100'
                            }`}
                            style={quizGoal === g.val ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={handleSolveQuiz}
                      className="w-full py-3 bg-[#4B5E52] text-white text-[10px] uppercase font-bold tracking-wider hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: accentColor }}
                    >
                      Find Recommended Routine
                    </button>
                  </div>

                  {/* Quiz Results display */}
                  <div className="h-full bg-theme-bg border border-gray-150 p-6 flex flex-col justify-between items-center text-center">
                    {quizResult ? (
                      <div className="animate-fade-in w-full space-y-4">
                        <span className="text-[10px] uppercase tracking-widest text-[#4B5E52] font-bold block" style={{ color: accentColor }}>Personalized Match</span>
                        <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-white mx-auto shadow-theme">
                          <img src={getProductImageUrl(quizResult, 0)} className="w-full h-full object-cover" alt="Recommended product" />
                        </div>
                        <h4 className="font-bold text-sm uppercase text-theme-text">{quizResult.name}</h4>
                        <span className="text-[#4B5E52] font-bold text-sm" style={{ color: accentColor }}>₹{quizResult.price}</span>
                        {config.products?.showAddToCart !== false && (
                        <button
                          data-cart-add="true"
                          data-product-name={quizResult.name}
                          data-product-price={quizResult.price}
                          data-product-image={getProductImageUrl(quizResult, 0)}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider"
                        >
                          Add Routine Combo
                        </button>
                        )}
                      </div>
                    ) : (
                      <div className="py-16 text-gray-400 text-xs font-light space-y-2">
                        <FaLeaf size={24} className="mx-auto text-gray-300" />
                        <p>Complete the skincare quiz parameters on the left to display matching routine recommendations.</p>
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
            <section id="products" className="max-w-7xl mx-auto px-8 py-24 text-theme-text bg-theme-surface">
              <div className="text-center mb-16">
                <EditableText
                  isEditable={isEditable}
                  value={config.products.sectionTitle || 'Botanical Apothecary'}
                  onChange={(val) => onUpdateConfig('products', 'sectionTitle', val)}
                  tagName="h2"
                  className="text-3xl font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}
                />
                <div className="w-16 h-[2px] mx-auto mt-4" style={{ backgroundColor: accentColor }}></div>
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
                    className="bg-[#f5f7f6] border border-theme-border overflow-hidden hover:shadow-theme transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square overflow-hidden bg-theme-bg relative">
                        <img 
                          src={getProductImageUrl(product, i)}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                        />
                        {product.inStock === false && (
                          <div className="absolute inset-0 bg-theme-surface/80 flex items-center justify-center">
                            <span className="px-3 py-1.5 border border-[#4B5E52] text-[#4B5E52] text-[10px] uppercase font-bold tracking-wider" style={{ color: accentColor, borderColor: accentColor }}>
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <span className="text-[9px] uppercase font-bold text-[#4B5E52] tracking-widest mb-1.5 block" style={{ color: accentColor }}>Skincare</span>
                        <EditableText
                          isEditable={isEditable}
                          value={product.name}
                          onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                          tagName="h4"
                          className="font-bold text-sm truncate uppercase tracking-wider text-theme-text"
                        />
                        <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <div className="flex items-center justify-between border-t border-theme-border/50 pt-4 mt-2">
                        {config.products?.showPrices !== false && (
                        <div className="font-bold text-md text-[#4B5E52]" style={{ color: accentColor }}>
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
                          data-product-image={getProductImageUrl(product, i)}
                          disabled={product.inStock === false}
                          className="px-3 py-1.5 bg-[#4B5E52] hover:opacity-90 text-white font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-40"
                          style={{ backgroundColor: accentColor }}
                        >
                          Select
                        </button>
                        )}
                      </div>
                      {isEditable && (
                        <button 
                          onClick={() => setActiveEditProductId(product._id || product.id)}
                          className="w-full mt-3 py-1.5 bg-gray-200/60 text-[9px] font-bold text-theme-muted hover:bg-gray-200 uppercase tracking-widest text-center"
                        >
                          ⚙️ Edit Parameters
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-16">
                <button 
                  onClick={() => changePage('shop')}
                  className="px-8 py-3 bg-[#4B5E52] text-white hover:opacity-90 font-bold text-xs uppercase tracking-widest transition-opacity"
                  style={{ backgroundColor: accentColor }}
                >
                  Explore Catalog
                </button>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'gallery':
        const galleryTitle = config.gallery?.title || 'Botanical Gallery';
        const galleryImages = config.gallery?.images || [];
        return (
          <SectionWrapper key="gallery" isEditable={isEditable} sectionKey="gallery" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="max-w-7xl mx-auto px-8 py-20 bg-[#f5f7f6] border-t border-b border-gray-150">
              <div className="text-center mb-12">
                <EditableText
                  isEditable={isEditable}
                  value={galleryTitle}
                  onChange={(val) => onUpdateConfig('gallery', 'title', val)}
                  tagName="h2"
                  className="text-2xl font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}
                />
                <div className="w-12 h-0.5 mx-auto mt-3" style={{ backgroundColor: accentColor }}></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square overflow-hidden group border border-theme-border bg-theme-surface">
                    <img src={img} alt={`Organic Botanical ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350" />
                    {isEditable && (
                      <div className="absolute inset-0 bg-[#1F2937]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
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
                          className="w-full px-3 py-1.5 bg-theme-surface text-theme-text rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
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
        const faqTitle = config.faq?.title || 'Skincare & Ingredients FAQ';
        const faqList = config.faq?.questions || [];
        return (
          <SectionWrapper key="faq" isEditable={isEditable} sectionKey="faq" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="max-w-4xl mx-auto px-8 py-20 text-theme-text bg-theme-surface">
              <div className="text-center mb-12">
                <EditableText
                  isEditable={isEditable}
                  value={faqTitle}
                  onChange={(val) => onUpdateConfig('faq', 'title', val)}
                  tagName="h2"
                  className="text-2xl font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}
                />
                <div className="w-12 h-0.5 mx-auto mt-3" style={{ backgroundColor: accentColor }}></div>
              </div>
              <div className="space-y-4">
                {faqList.map((item, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={item.id || idx} className="bg-theme-surface border border-gray-150 overflow-hidden transition-all">
                      <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full px-6 py-4 text-left uppercase font-semibold text-xs tracking-wider text-theme-text flex items-center justify-between hover:bg-[#f5f7f6] transition-colors">
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
                        <span className="text-theme-muted">{isOpen ? '—' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 pt-1 text-xs text-theme-muted font-light leading-relaxed border-t border-theme-border">
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
        const testTitle = config.testimonials?.title || 'Skincare Reviews';
        const testList = config.testimonials?.items || [];
        return (
          <SectionWrapper key="testimonials" isEditable={isEditable} sectionKey="testimonials" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="bg-gray-100 text-[#1F2937] py-24">
              <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-16">
                  <EditableText
                    isEditable={isEditable}
                    value={testTitle}
                    onChange={(val) => onUpdateConfig('testimonials', 'title', val)}
                    tagName="h2"
                    className="text-2xl font-bold uppercase tracking-wider"
                  />
                  <div className="w-12 h-0.5 mx-auto mt-3" style={{ backgroundColor: accentColor }}></div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {testList.map((item, idx) => (
                    <div key={idx} className="p-8 bg-theme-surface border border-theme-border text-center flex flex-col justify-between">
                      <p className="text-sm font-light italic leading-relaxed text-theme-muted">
                        “
                        <EditableText
                          isEditable={isEditable}
                          value={item.text}
                          onChange={(val) => {
                            const updated = [...testList];
                            updated[idx].text = val;
                            onUpdateConfig('testimonials', 'items', updated);
                          }}
                          tagName="span"
                        />
                        ”
                      </p>
                      <div className="mt-8 border-t border-theme-border pt-6">
                        <EditableText
                          isEditable={isEditable}
                          value={item.author}
                          onChange={(val) => {
                            const updated = [...testList];
                            updated[idx].author = val;
                            onUpdateConfig('testimonials', 'items', updated);
                          }}
                          tagName="h5"
                          className="font-bold text-xs uppercase tracking-wider text-theme-text"
                        />
                        <EditableText
                          isEditable={isEditable}
                          value={item.role || 'Cosmetics Patron'}
                          onChange={(val) => {
                            const updated = [...testList];
                            updated[idx].role = val;
                            onUpdateConfig('testimonials', 'items', updated);
                          }}
                          tagName="span"
                          className="text-[10px] text-gray-400 tracking-wider font-semibold"
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
        const hoursTitle = config.hours?.title || 'Studio Schedule';
        const hoursDays = config.hours?.days || [];
        return (
          <SectionWrapper key="hours" isEditable={isEditable} sectionKey="hours" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="max-w-xl mx-auto px-8 py-20 text-[#1F2937] text-center">
              <div className="text-center mb-8">
                <EditableText
                  isEditable={isEditable}
                  value={hoursTitle}
                  onChange={(val) => onUpdateConfig('hours', 'title', val)}
                  tagName="h2"
                  className="text-xl font-bold uppercase tracking-wider"
                />
                <div className="w-12 h-0.5 mx-auto mt-3" style={{ backgroundColor: accentColor }}></div>
              </div>
              <div className="divide-y divide-gray-100 border-t border-b border-theme-border py-4">
                {hoursDays.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3.5 text-xs tracking-wider">
                    <div className="flex items-center gap-2">
                      {isEditable && (
                        <button
                          onClick={() => {
                            const updated = hoursDays.filter((_, i) => i !== idx);
                            onUpdateConfig('hours', 'days', updated);
                          }}
                          className="text-theme-primary hover:text-theme-primary font-bold mr-1 text-sm leading-none"
                          title="Remove Day"
                        >
                          ×
                        </button>
                      )}
                      <EditableText
                        isEditable={isEditable}
                        value={item.day}
                        onChange={(val) => {
                          const updated = hoursDays.map((d, i) => i === idx ? { ...d, day: val } : d);
                          onUpdateConfig('hours', 'days', updated);
                        }}
                        tagName="span"
                        className="text-gray-400 uppercase font-semibold"
                      />
                    </div>
                    <EditableText
                      isEditable={isEditable}
                      value={item.hours}
                      onChange={(val) => {
                        const updated = hoursDays.map((d, i) => i === idx ? { ...d, hours: val } : d);
                        onUpdateConfig('hours', 'days', updated);
                      }}
                      tagName="span"
                      className="font-bold text-[#1F2937]"
                    />
                  </div>
                ))}
                {isEditable && (
                  <button
                    onClick={() => {
                      const updated = [...hoursDays, { day: 'New Day', hours: '9:00 AM - 5:00 PM' }];
                      onUpdateConfig('hours', 'days', updated);
                    }}
                    className="w-full mt-4 py-2 border border-dashed border-theme-border hover:border-gray-400 text-theme-muted rounded text-xs font-bold transition-all text-center"
                  >
                    + Add Row
                  </button>
                )}
              </div>
            </section>
          </SectionWrapper>
        );

      case 'contact':
        const contactTitle = config.contact?.title || 'Connect Apothecary';
        const contactSubtitle = config.contact?.subtitle || 'Inquire about botanical bulk orders and aromatherapy routines.';
        return (
          <SectionWrapper key="contact" isEditable={isEditable} sectionKey="contact" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section id="contact" className="max-w-4xl mx-auto px-8 py-24 text-[#1F2937]">
              <div className="grid md:grid-cols-2 gap-16 items-start">
                <div className="space-y-8">
                  <div>
                    <EditableText
                      isEditable={isEditable}
                      value={contactTitle}
                      onChange={(val) => onUpdateConfig('contact', 'title', val)}
                      tagName="h2"
                      className="text-2xl font-bold uppercase tracking-wider mb-4"
                    />
                    <EditableText
                      isEditable={isEditable}
                      value={contactSubtitle}
                      onChange={(val) => onUpdateConfig('contact', 'subtitle', val)}
                      tagName="p"
                      className="text-xs text-theme-muted font-light"
                    />
                  </div>
                  <div className="space-y-4 text-xs font-medium text-theme-muted">
                    {phoneNumber && (
                      <div className="flex items-center gap-4">
                        <FaPhoneAlt className="text-theme-muted" />
                        <span>{phoneNumber}</span>
                      </div>
                    )}
                    {email && (
                      <div className="flex items-center gap-4">
                        <FaEnvelope className="text-theme-muted" />
                        <span>{email}</span>
                      </div>
                    )}
                    {address && (
                      <div className="flex items-center gap-4">
                        <FaMapMarkerAlt className="text-theme-muted" />
                        <span>{address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#fcfcfc] p-8 border border-theme-border shadow-theme relative animate-fade-in">
                  {formSubmitted ? (
                    <div className="text-center py-12 text-[#1F2937] space-y-4">
                      <FaPaperPlane size={36} className="mx-auto text-[#4B5E52]" style={{ color: accentColor }} />
                      <h4 className="text-lg font-bold uppercase tracking-wider">Inquiry Sent</h4>
                      <p className="text-xs text-gray-550 font-light font-sans">We will send details on bulk orders and customization soon.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-5">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">Your Name</label>
                        <input 
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          placeholder="e.g. Jane Doe"
                          className="w-full px-4 py-2.5 bg-theme-surface border border-theme-border rounded-none text-xs outline-none focus:border-slate-500 text-theme-text"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">Email Address</label>
                        <input 
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          placeholder="e.g. jane@example.com"
                          className="w-full px-4 py-2.5 bg-theme-surface border border-theme-border rounded-none text-xs outline-none focus:border-slate-500 text-theme-text"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">Your Message / Quiz Results</label>
                        <textarea 
                          rows={3}
                          required
                          value={contactForm.message}
                          onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                          placeholder="Inquire about ingredients, routine builders, or skincare products."
                          className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-xs outline-none focus:border-slate-500 text-slate-805 resize-none font-sans"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-3.5 bg-[#4B5E52] text-white font-bold uppercase tracking-wider text-xs hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: accentColor }}
                      >
                        Submit Apothecary Inquiry
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
        className="w-full h-full overflow-y-auto relative bg-[#ffffff] text-[#1F2937] flex flex-col justify-between font-sans"
      >
        {/* Simple Header */}
        <nav className="py-6 px-8 border-b border-gray-150 flex items-center justify-between">
          {isEditable ? (
            <EditableText
              isEditable={true}
              value={businessName}
              onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
              tagName="span"
              className="font-bold text-xl uppercase tracking-wider text-[#4B5E52] cursor-text"
              style={{
        '--primary': primaryColor,
        '--accent': accentColor, color: accentColor }}
            />
          ) : (
            <button onClick={() => changePage('home')} className="font-bold text-xl uppercase tracking-wider text-[#4B5E52]" style={{ color: accentColor }}>
              {businessName}
            </button>
          )}
          <button 
            onClick={() => changePage('home')}
            className="text-[10px] uppercase tracking-wider font-bold border border-[#1F2937] px-4 py-2 transition-all hover:bg-slate-100"
          >
            ← Back To Store
          </button>
        </nav>

        {/* Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold uppercase tracking-wider">The Catalog</h1>
            <p className="text-xs text-theme-muted mt-2 font-light">Explore our botanically selected aromatherapy products and skincare.</p>
          </div>

          {/* Search, Filter & Sort */}
          <div className="bg-[#f5f7f6] p-6 border border-theme-border mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-theme-surface border border-theme-border rounded-none text-xs outline-none focus:border-slate-500 text-theme-text"
              />
              <FaSearch className="absolute left-3.5 top-3 text-gray-400" size={10} />
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-theme-surface border border-theme-border text-xs rounded-none outline-none focus:border-slate-500 uppercase tracking-widest text-[#1F2937]"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto px-3 py-2 bg-theme-surface border border-theme-border text-xs rounded-none outline-none focus:border-slate-500 uppercase tracking-widest text-[#1F2937]"
              >
                <option value="default">Default Products</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {sortedFilteredProducts.map((product, i) => (
              <div 
                key={product._id || product.id || i}
                className="bg-[#f5f7f6] border border-gray-150 flex flex-col justify-between hover:shadow-theme transition-shadow"
              >
                <div>
                  <div className="aspect-square overflow-hidden bg-theme-bg relative">
                    <img 
                      src={getProductImageUrl(product, i)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.inStock === false && (
                      <div className="absolute inset-0 bg-theme-surface/80 flex items-center justify-center">
                        <span className="px-3 py-1.5 border border-[#4B5E52] text-[#4B5E52] text-[10px] uppercase font-bold tracking-wider" style={{ color: accentColor, borderColor: accentColor }}>
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Skincare</span>
                    <EditableText
                      isEditable={isEditable}
                      value={product.name}
                      onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                      tagName="h4"
                      className="font-bold text-sm truncate uppercase tracking-wider text-slate-805"
                    />
                        <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between border-t border-theme-border/50 pt-4 mt-2">
                    {config.products?.showPrices !== false && (
                    <div className="font-bold text-md text-[#4B5E52]" style={{ color: accentColor }}>
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
                      data-product-image={getProductImageUrl(product, i)}
                      disabled={product.inStock === false}
                      className="px-3 py-1.5 bg-[#4B5E52] text-white hover:opacity-90 font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-40"
                      style={{ backgroundColor: accentColor }}
                    >
                      Select
                    </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-xs text-gray-400 border-t border-gray-150 bg-theme-bg">
          <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div 
      id="preview-scroll-container"
      className="w-full h-full overflow-y-auto relative bg-theme-surface flex flex-col justify-between font-sans text-theme-text"
    >
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-6 px-8 ${(scrolled || currentPage !== 'home') ? 'bg-theme-surface/95 border-b border-theme-border shadow-theme text-theme-text' : 'bg-transparent text-white'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {isEditable ? (
            <EditableText
              isEditable={true}
              value={businessName}
              onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
              tagName="span"
              className={`font-bold text-xl uppercase tracking-widest cursor-text ${(scrolled || currentPage !== 'home') ? 'text-[#1F2937]' : 'text-white'}`}
            />
          ) : (
            <button onClick={() => changePage('home')} className={`font-bold text-xl uppercase tracking-widest focus:outline-none ${(scrolled || currentPage !== 'home') ? 'text-[#1F2937]' : 'text-white'}`}>
              {businessName}
            </button>
          )}
          
          <div className="flex items-center gap-6">
            {[
              { label: 'Home', id: 'home' },
              { label: 'Shop', id: 'shop' },
              { label: 'Contact', id: 'contact' },
              ...(config.customPages || []).map(p => ({ label: p.title, id: p.id }))
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => changePage(item.id)}
                className={`text-xs font-bold uppercase tracking-wider transition-colors hover:opacity-85 ${currentPage === item.id ? 'underline underline-offset-4 font-black' : ''} ${(scrolled || currentPage !== 'home') ? 'text-[#1F2937]' : 'text-white'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Sections */}
      <div className="flex-1">
        {isCustomPage && activeCustomPage ? (
          <CustomPageRenderer 
            page={activeCustomPage} 
            primaryColor={primaryColor} 
            accentColor={accentColor} 
            isEditable={isEditable}
            onUpdateConfig={onUpdateConfig}
            config={config}
          />
        ) : (
          order.map((sectionKey) => renderSection(sectionKey))
        )}
      </div>

      {/* Footer */}
      <footer className="bg-theme-bg py-12 px-8 border-t border-theme-border text-center text-xs text-gray-400 font-light">
        <div className="max-w-7xl mx-auto space-y-4">
          <p className="font-bold text-gray-700 uppercase tracking-widest text-sm">{businessName}</p>
          <p>© {new Date().getFullYear()} {businessName}. Pure Botanical Wellness.</p>
        </div>
      </footer>

      {/* Skincare Parameter Editor Modal */}
      {isEditable && activeEditProductId && (() => {
        const product = products.find(p => (p._id || p.id) === activeEditProductId);
        if (!product) return null;
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-theme-surface rounded-none max-w-lg w-full p-6 border border-theme-border shadow-theme relative text-left">
              <button 
                onClick={() => setActiveEditProductId(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-2xl w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
              
              <h3 className="text-xl font-bold uppercase tracking-wider text-theme-text border-b border-theme-border pb-3 mb-6">
                Skincare Parameters settings
              </h3>

              <div className="space-y-4 font-sans text-xs text-theme-muted">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Skincare Item Name</label>
                    <input 
                      type="text"
                      value={product.name}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'name', e.target.value)}
                      className="w-full px-4 py-2.5 bg-theme-surface border border-theme-border text-sm text-slate-805 outline-none focus:border-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Price (₹)</label>
                    <input 
                      type="number"
                      value={product.price}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-theme-surface border border-theme-border text-sm text-slate-805 outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Category</label>
                    <input 
                      type="text"
                      value={product.category || ''}
                      placeholder="e.g. Cleansers, Toners, Aromatherapy Oils"
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'category', e.target.value)}
                      className="w-full px-4 py-2.5 bg-theme-surface border border-theme-border text-sm text-slate-805 outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Skincare description details</label>
                  <textarea 
                    value={product.description || ''}
                    placeholder="Describe botanical ingredients, skin application details, usage timeline."
                    onChange={(e) => onUpdateProduct(product._id || product.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-theme-surface border border-theme-border text-sm text-slate-805 outline-none focus:border-slate-500 resize-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 py-1.5">
                  <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-theme-border bg-theme-bg transition-all">
                    <input 
                      type="checkbox"
                      checked={!!product.isBestseller}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'isBestseller', e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-850 select-none">
                      ⭐ Highlight Routine Product
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-theme-border bg-theme-bg transition-all">
                    <input 
                      type="checkbox"
                      checked={product.inStock !== false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        onUpdateProduct(product._id || product.id, 'inStock', checked);
                        onUpdateProduct(product._id || product.id, 'stockQuantity', checked ? (product.stockQuantity > 0 ? product.stockQuantity : 10) : 0);
                      }}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-850 select-none">
                      📦 In Stock
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Stock Capacity</label>
                  <input 
                    type="number"
                    min="0"
                    value={product.stockQuantity !== undefined ? product.stockQuantity : 10}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      onUpdateProduct(product._id || product.id, 'stockQuantity', val);
                      onUpdateProduct(product._id || product.id, 'inStock', val > 0);
                    }}
                    className="w-full px-4 py-2.5 bg-theme-surface border border-theme-border text-sm text-slate-805 outline-none focus:border-slate-500"
                    placeholder="Pieces in stock"
                  />
                </div>

                {/* Scoping Image */}
                <div className="p-4 border border-theme-border bg-theme-bg/50 space-y-3">
                  <span className="block text-[10px] uppercase tracking-wider text-gray-400">Skincare presentation image</span>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 border border-theme-border shrink-0 bg-theme-surface">
                      <img 
                        src={getProductImageUrl(product, 0)} 
                        className="w-full h-full object-cover" 
                        alt="Product preview" 
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="inline-block px-4 py-2 bg-theme-surface border border-theme-border hover:bg-gray-100 text-slate-850 font-bold rounded-none text-xs cursor-pointer shadow-theme transition-all text-center">
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
                        className="w-full px-3 py-1.5 bg-theme-surface border border-theme-border text-xs text-slate-850 outline-none focus:border-slate-500" 
                      />
                    </div>
                  </div>
                </div>

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
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-655 border border-red-200 text-[10px] uppercase font-bold tracking-wider"
                  >
                    Delete Skincare Item
                  </button>
                  <button 
                    onClick={() => setActiveEditProductId(null)}
                    className="px-6 py-2.5 bg-[#4B5E52] text-white font-bold uppercase tracking-wider text-xs shadow transition-all animate-pulse"
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
          <div className="bg-theme-surface rounded-none max-w-lg w-full p-6 shadow-theme border border-gray-250 relative text-left">
            <button 
              onClick={() => setShowBgModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-2xl w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            <h3 className="text-xl font-bold uppercase tracking-wider text-theme-text mb-1">
              Flora Background Settings
            </h3>
            <p className="text-xs text-theme-muted mb-6">Select a botanical preset or generate using AI.</p>

            <div className="flex border-b border-gray-250 mb-6 font-semibold">
              <button 
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 font-bold text-xs uppercase tracking-wider text-center border-b-2 transition-colors ${activeTab === 'presets' ? 'border-[#4B5E52] text-[#4B5E52]' : 'border-transparent text-gray-400 hover:text-gray-550'}`}
                style={activeTab === 'presets' ? { color: accentColor, borderColor: accentColor } : {}}
              >
                Presets
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-2 font-bold text-xs uppercase tracking-wider text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-[#4B5E52] text-[#4B5E52]' : 'border-transparent text-gray-400 hover:text-gray-550'}`}
                style={activeTab === 'ai' ? { color: accentColor, borderColor: accentColor } : {}}
              >
                AI Generator
              </button>
            </div>

            {activeTab === 'presets' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
                {[
                  { name: 'Organic Cosmetics Bottles', url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Aromatherapy Leaves Oil', url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Botanical Skincare Setup', url: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Sage Leaf Aromatherapy', url: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Green Essential Extract', url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Organic Herb Potions', url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80' }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      onUpdateConfig('header', 'heroImage', item.url);
                      setShowBgModal(false);
                    }}
                    className="cursor-pointer group relative aspect-video border border-gray-150 hover:border-[#4B5E52] transition-all bg-theme-bg"
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
                  <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Describe your botanical backdrop</label>
                  <textarea 
                    placeholder="e.g. flat lay organic cosmetics sage green leaves and amber bottles, high quality photo banner"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-theme-surface border border-gray-250 rounded-none outline-none focus:border-[#4B5E52] text-sm text-theme-text resize-none font-sans"
                    style={{ focusBorderColor: accentColor }}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Aesthetic Style</label>
                    <select 
                      value={aiStyle} 
                      onChange={(e) => setAiStyle(e.target.value)}
                      className="w-full p-3 bg-theme-surface border border-gray-250 rounded-none outline-none focus:border-slate-500 text-sm text-theme-text font-bold"
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
