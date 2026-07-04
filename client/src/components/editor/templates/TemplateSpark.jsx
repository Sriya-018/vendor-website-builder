import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaShoppingCart, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, 
  FaMapMarkerAlt, FaStore, FaWhatsapp, FaShieldAlt, FaClock, FaPaperPlane,
  FaSearch, FaFilter, FaSortAmountDown, FaMicrochip, FaCheckSquare
} from 'react-icons/fa';
import EditableText from '../EditableText';
import SectionWrapper from '../SectionWrapper';

export default function TemplateSpark({ 
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

  // Custom Spark unique state: Setup Builder checklist
  const [setupSelections, setSetupSelections] = useState({});

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

  const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'Spark Gear');
  const storeName = website?.storeName || business?.businessName || 'My Store';
  const logo = website?.storeInfo?.logo ?? business?.logo ?? null;
  const fullLogoUrl = logo ? (logo.startsWith('http') ? logo : `http://localhost:5000${logo}`) : null;
  const description = config.header.heroHeading || 'High-performance gaming setups and computing components.';
  const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
  const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
  const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
  
  const primaryColor = '#090D16'; // Deep space obsidian
  const accentColor = config.themeColor || '#10B981'; // Cyber Emerald Neon Green
  const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';

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
    if (!imgUrl) return `https://picsum.photos/seed/spark${i}/600/600`;
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

  // Calculate Aggregated PC Setup Cost
  const getAggregatedSetupCost = () => {
    let sum = 0;
    products.slice(0, 5).forEach((p, idx) => {
      if (setupSelections[idx]) {
        sum += p.price;
      }
    });
    return sum;
  };

  const defaultOrder = ['hero', 'configurator', 'products', 'gallery', 'faq', 'testimonials', 'hours', 'contact'];
  const order = config.sectionOrder || defaultOrder;
  const sectionsVisible = config.sections || {
    hero: true,
    configurator: true,
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
            <header className="relative min-h-[75vh] flex items-center overflow-hidden animate-fade-in bg-slate-950">
              <div className="absolute inset-0 z-0">
                <img src={heroImage} className="w-full h-full object-cover opacity-60" alt="Hero Background" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
              </div>
              
              {isEditable && (
                <button 
                  onClick={() => setShowBgModal(true)}
                  className="absolute bottom-6 right-6 z-20 px-4 py-2 bg-neutral-900 border border-[#10B981]/40 text-[#10B981] rounded font-bold text-xs shadow-md hover:scale-105 transition-transform flex items-center gap-1.5 font-sans"
                >
                  🎨 Edit Hero Graphic
                </button>
              )}
              <div className="relative z-10 max-w-7xl mx-auto px-8 w-full text-white">
                <div className="max-w-xl" style={{ textAlign: config.header.heroAlign }}>
                  <span className="inline-block px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/30 rounded text-[10px] uppercase font-bold tracking-widest text-[#10B981] mb-6">
                    Cyber Hardware Drop
                  </span>
                  <EditableText
                    isEditable={isEditable}
                    value={config.header.heroHeading || storeName}
                    onChange={(val) => onUpdateConfig('header', 'heroHeading', val)}
                    tagName="h1"
                    className="text-4xl md:text-6xl font-black leading-tight mb-5 uppercase tracking-wide"
                  />
                  <EditableText
                    isEditable={isEditable}
                    value={config.header.heroSubheading || description}
                    onChange={(val) => onUpdateConfig('header', 'heroSubheading', val)}
                    tagName="p"
                    className="text-gray-400 text-sm leading-relaxed mb-10 max-w-md font-light"
                    style={{ marginInline: config.header.heroAlign === 'center' ? 'auto' : config.header.heroAlign === 'right' ? '0 0 0 auto' : '0' }}
                  />
                  <div className={`flex flex-wrap gap-4 ${config.header.heroAlign === 'center' ? 'justify-center' : config.header.heroAlign === 'right' ? 'justify-end' : ''}`}>
                    <button 
                      onClick={() => changePage('shop')}
                      className="px-8 py-3.5 bg-emerald-600 rounded text-white font-bold hover:bg-emerald-700 transition-colors uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                      style={{ backgroundColor: accentColor }}
                    >
                      <EditableText isEditable={isEditable} value={config.header.ctaLabel || 'Shop Gear'} onChange={(val) => onUpdateConfig('header', 'ctaLabel', val)} />
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            </header>
          </SectionWrapper>
        );

      case 'configurator':
        return (
          <SectionWrapper key="configurator" isEditable={isEditable} sectionKey="configurator" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
            <section className="bg-slate-950 text-white py-20 px-8 border-b border-white/5">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <span className="text-[10px] uppercase tracking-widest text-[#10B981] font-bold block mb-2">Configuration Builder</span>
                  <h2 className="text-3xl font-black uppercase tracking-wide">Build Your Setup</h2>
                  <p className="text-xs text-gray-400 mt-2 font-light">Check items to configure your dream station and calculate total pricing.</p>
                </div>

                <div className="bg-[#090D16] border border-[#10B981]/20 p-8 grid md:grid-cols-2 gap-8 items-start">
                  {/* Selectable checklist */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2 mb-4">
                      <FaCheckSquare className="text-[#10B981]" /> Hardware Checkboxes
                    </h3>
                    {products.slice(0, 5).map((p, idx) => (
                      <label 
                        key={p._id || p.id || idx}
                        className="flex items-center justify-between p-3 border border-white/5 bg-slate-950/40 hover:border-[#10B981]/20 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            checked={!!setupSelections[idx]}
                            onChange={(e) => setSetupSelections({
                              ...setupSelections,
                              [idx]: e.target.checked
                            })}
                            className="accent-emerald-500 rounded h-4.5 w-4.5"
                          />
                          <div className="text-xs">
                            <span className="font-bold uppercase tracking-wider text-slate-200 block">{p.name}</span>
                            <span className="text-[10px] text-gray-500">{p.category || 'Component'}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#10B981]">₹{p.price}</span>
                      </label>
                    ))}
                  </div>

                  {/* Calculations box */}
                  <div className="h-full bg-slate-950 border border-white/5 p-8 flex flex-col justify-between items-center text-center">
                    <div>
                      <FaMicrochip className="text-gray-500 mb-4 mx-auto animate-pulse" size={28} />
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Rig Configuration Value</span>
                      <div className="text-4xl font-black text-[#10B981] mt-2 tracking-wider">
                        ₹{getAggregatedSetupCost().toLocaleString()}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const selectedNames = [];
                        products.slice(0, 5).forEach((p, idx) => {
                          if (setupSelections[idx]) selectedNames.push(`${p.name} (₹${p.price})`);
                        });
                        setContactForm({
                          ...contactForm,
                          message: `Hi, I selected the following PC Gear Configuration:
${selectedNames.map(n => `- ${n}`).join('\n')}
Total Configuration Price: ₹${getAggregatedSetupCost().toLocaleString()}
Please contact me to discuss setup assembly.`
                        });
                        const section = document.getElementById('contact');
                        if (section) section.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="mt-6 w-full py-3 bg-[#10B981] text-black font-bold uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity"
                    >
                      Lock Setup & Order Inquiry
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
            <section id="products" className="max-w-7xl mx-auto px-8 py-24 bg-slate-950 text-white">
              <div className="text-center mb-16">
                <EditableText
                  isEditable={isEditable}
                  value={config.products.sectionTitle || 'Hardware Drops'}
                  onChange={(val) => onUpdateConfig('products', 'sectionTitle', val)}
                  tagName="h2"
                  className="text-3xl font-black uppercase tracking-wider"
                  style={{ color: accentColor }}
                />
                <div className="w-16 h-[2px] mx-auto mt-4 bg-emerald-500"></div>
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
                    className="bg-[#090D16] border border-white/5 overflow-hidden hover:border-[#10B981]/25 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-48 overflow-hidden bg-slate-900 relative">
                        <img 
                          src={getProductImageUrl(product, i)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.inStock === false && (
                          <div className="absolute inset-0 bg-black/85 flex items-center justify-center">
                            <span className="px-3 py-1.5 border border-red-500 text-red-500 font-bold text-[10px] uppercase tracking-wider bg-red-950/20">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="text-[9px] font-bold tracking-widest uppercase text-[#10B981] mb-1">Gear Component</div>
                        <EditableText
                          isEditable={isEditable}
                          value={product.name}
                          onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                          tagName="h4"
                          className="font-bold text-sm truncate uppercase tracking-wider"
                        />
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <div className="font-bold text-md text-[#10B981]">
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
                          data-product-image={product.img || `https://picsum.photos/seed/spark${i}/600/600`}
                          disabled={product.inStock === false}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40"
                        >
                          Buy
                        </button>
                      </div>
                      {isEditable && (
                        <button 
                          onClick={() => setActiveEditProductId(product._id || product.id)}
                          className="w-full mt-3 py-1.5 bg-white/5 text-[9px] font-bold text-gray-500 hover:text-white uppercase tracking-widest"
                        >
                          ⚙️ Tech Specs
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-16">
                <button 
                  onClick={() => changePage('shop')}
                  className="px-8 py-3.5 border border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-black font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Explore All Hardware
                </button>
              </div>
            </section>
          </SectionWrapper>
        );

      case 'gallery':
        const galleryTitle = config.gallery?.title || 'User PC Battlestations';
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
                <div className="w-12 h-[2px] mx-auto mt-4 bg-emerald-500"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square overflow-hidden group border border-white/5 bg-[#090D16]">
                    <img src={img} alt={`Battlestation ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {isEditable && (
                      <div className="absolute inset-0 bg-[#090D16]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
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
                          className="w-full px-3 py-1.5 bg-[#090D16] border border-[#10B981]/30 text-white rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
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
        const faqTitle = config.faq?.title || 'Warranty & Tech Questions';
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
                <div className="w-12 h-[2px] mx-auto mt-4 bg-emerald-500"></div>
              </div>
              <div className="space-y-4">
                {faqList.map((item, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={item.id || idx} className="bg-[#090D16] border border-white/5 overflow-hidden transition-all animate-fade-in">
                      <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full px-6 py-4 text-left font-bold text-gray-250 flex items-center justify-between hover:bg-slate-900 transition-colors text-xs uppercase tracking-wider">
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
                        <span className="text-[#10B981]">{isOpen ? '—' : '+'}</span>
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
        const testTitle = config.testimonials?.title || 'Tech Reviews';
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
                  <div className="w-12 h-[2px] mx-auto mt-4 bg-emerald-500"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {testList.map((item, idx) => (
                    <div key={idx} className="p-8 border border-white/5 bg-[#090D16] text-center flex flex-col justify-between">
                      <div className="text-[#10B981] text-3xl font-black leading-none mb-6">“</div>
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
                          className="font-bold text-xs uppercase tracking-widest text-[#10B981]"
                        />
                        <EditableText
                          isEditable={isEditable}
                          value={item.role || 'Gamer Enthusiast'}
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
                <div className="w-12 h-[2px] mx-auto mt-4 bg-emerald-500"></div>
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
        const contactTitle = config.contact?.title || 'Custom Rig Support';
        const contactSubtitle = config.contact?.subtitle || 'Get in touch for custom setups and compatibility queries.';
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
                        <FaPhoneAlt className="text-[#10B981]" />
                        <span>{phoneNumber}</span>
                      </div>
                    )}
                    {email && (
                      <div className="flex items-center gap-4">
                        <FaEnvelope className="text-[#10B981]" />
                        <span>{email}</span>
                      </div>
                    )}
                    {address && (
                      <div className="flex items-center gap-4">
                        <FaMapMarkerAlt className="text-[#10B981]" />
                        <span>{address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#090D16] p-8 border border-[#10B981]/20 shadow-2xl relative animate-fade-in">
                  {formSubmitted ? (
                    <div className="text-center py-12 text-[#10B981] space-y-4 font-sans">
                      <FaPaperPlane size={36} className="mx-auto" />
                      <h4 className="text-xl font-bold uppercase tracking-wider">Rig Config Dropped</h4>
                      <p className="text-xs text-gray-500 font-light">We will check compatibility and send aggregate quotes.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-5 font-sans">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1.5">Your Name</label>
                        <input 
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          placeholder="e.g. John Doe"
                          className="w-full px-4 py-2.5 bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#10B981]"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1.5">Email Address</label>
                        <input 
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          placeholder="e.g. john@example.com"
                          className="w-full px-4 py-2.5 bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#10B981]"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1.5">Spec Details Request</label>
                        <textarea 
                          rows={3}
                          required
                          value={contactForm.message}
                          onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                          placeholder="Please note configuration modifications, parts compatibility questions, etc."
                          className="w-full px-4 py-3 bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#10B981] resize-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-3.5 bg-[#10B981] text-black font-bold uppercase tracking-wider text-xs hover:opacity-90 transition-opacity"
                      >
                        Submit Config Inquiry
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
        className="w-full h-full overflow-y-auto relative bg-[#090D16] text-white flex flex-col justify-between font-sans"
      >
        {/* Simple Header */}
        <nav className="py-6 px-8 border-b border-white/5 flex items-center justify-between">
          {isEditable ? (
            <EditableText
              isEditable={true}
              value={businessName}
              onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
              tagName="span"
              className="font-black text-xl uppercase tracking-wider text-[#10B981] cursor-text"
            />
          ) : (
            <button onClick={() => changePage('home')} className="font-black text-xl uppercase tracking-wider text-[#10B981]">
              {businessName}
            </button>
          )}
          <button 
            onClick={() => changePage('home')}
            className="text-[10px] uppercase tracking-widest font-bold border border-white/15 px-4 py-2 transition-all hover:bg-white/5"
          >
            ← Back To Store
          </button>
        </nav>

        {/* Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-black uppercase tracking-wider">Rig Catalog</h1>
            <p className="text-xs text-gray-400 mt-2 font-light">Browse our selected list of graphic cards, chassis, and custom hardware peripherals.</p>
          </div>

          {/* Search, Filter & Sort */}
          <div className="bg-[#090D16] p-6 border border-white/5 mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <input 
                type="text" 
                placeholder="Search gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#10B981]"
              />
              <FaSearch className="absolute left-3.5 top-3 text-gray-550" size={10} />
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-black/40 border border-white/10 text-xs text-white rounded-none outline-none focus:border-[#10B981] uppercase tracking-widest text-white shrink-0"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                ))}
              </select>

              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto px-3 py-2 bg-black/40 border border-white/10 text-xs text-white rounded-none outline-none focus:border-[#10B981] uppercase tracking-widest text-white"
              >
                <option value="default" className="bg-slate-900">Featured Gear</option>
                <option value="price-low" className="bg-slate-900">Price: Low to High</option>
                <option value="price-high" className="bg-slate-900">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {sortedFilteredProducts.map((product, i) => (
              <div 
                key={product._id || product.id || i}
                className="bg-slate-950 border border-white/5 flex flex-col justify-between hover:border-[#10B981]/20 transition-all"
              >
                <div>
                  <div className="h-56 overflow-hidden relative bg-[#090D16]">
                    <img 
                      src={getProductImageUrl(product, i)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.isBestseller && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-white text-black font-bold text-[9px] uppercase tracking-widest">
                        Hot Drop
                      </span>
                    )}
                    {product.inStock === false && (
                      <div className="absolute inset-0 bg-black/85 flex items-center justify-center">
                        <span className="px-3 py-1.5 border border-red-500 text-red-500 font-bold text-[10px] uppercase tracking-wider bg-red-950/20">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-[9px] uppercase tracking-widest text-indigo-400 mb-2 block">{product.category || 'Gear'}</span>
                    <EditableText
                      isEditable={isEditable}
                      value={product.name}
                      onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
                      tagName="h4"
                      className="text-sm font-bold truncate uppercase tracking-wider"
                    />
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="font-bold text-md text-[#10B981]">
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
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-40"
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
      className="w-full h-full overflow-y-auto relative bg-[#090D16] flex flex-col justify-between font-sans text-gray-200"
    >
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-6 px-8 ${scrolled ? 'bg-[#090D16]/95 border-b border-white/5 shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {isEditable ? (
            <EditableText
              isEditable={true}
              value={businessName}
              onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
              tagName="span"
              className="font-black text-2xl uppercase tracking-widest text-[#10B981] cursor-text"
            />
          ) : (
            <button onClick={() => changePage('home')} className="font-black text-2xl uppercase tracking-widest text-[#10B981] focus:outline-none">
              {businessName}
            </button>
          )}
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => changePage('shop')} 
              className="px-5 py-2 border border-[#10B981]/40 hover:bg-[#10B981] text-xs font-bold uppercase tracking-wider text-[#10B981] hover:text-black transition-colors"
            >
              Hardware Shop
            </button>
          </div>
        </div>
      </nav>

      {/* Main Sections */}
      <div className="flex-1">
        {order.map((sectionKey) => renderSection(sectionKey))}
      </div>

      {/* Footer */}
      <footer className="bg-black/60 py-12 px-8 border-t border-white/5 text-center text-xs text-gray-500 font-light">
        <div className="max-w-7xl mx-auto space-y-4">
          <p className="font-black text-[#10B981] uppercase tracking-widest text-sm">{businessName}</p>
          <p>© {new Date().getFullYear()} {businessName}. High-Performance Gaming Rig Scoping.</p>
        </div>
      </footer>

      {/* Gear Parameter Editor Modal */}
      {isEditable && activeEditProductId && (() => {
        const product = products.find(p => (p._id || p.id) === activeEditProductId);
        if (!product) return null;
        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-[#090D16] rounded-none max-w-lg w-full p-6 border border-[#10B981]/30 shadow-2xl relative text-left">
              <button 
                onClick={() => setActiveEditProductId(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-2xl w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
              
              <h3 className="text-xl font-bold uppercase tracking-wider text-[#10B981] border-b border-white/5 pb-3 mb-6">
                Gear Settings & Custom Specs
              </h3>

              <div className="space-y-4 font-sans text-xs text-gray-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Component Name</label>
                    <input 
                      type="text"
                      value={product.name}
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'name', e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Component Price (₹)</label>
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
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Category</label>
                    <input 
                      type="text"
                      value={product.category || ''}
                      placeholder="e.g. Graphic Cards, Gaming Rig, Keyboards"
                      onChange={(e) => onUpdateProduct(product._id || product.id, 'category', e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Tech Specifications</label>
                  <textarea 
                    value={product.description || ''}
                    placeholder="Describe technical specs, clock speeds, warranty timeline."
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
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#10B981] select-none">
                      ⚡ Hardware Drop Highlight
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
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white select-none">
                      📦 In Stock
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Stock Capacity</label>
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
                    placeholder="Pieces in stock"
                  />
                </div>

                {/* Scoping Image */}
                <div className="p-4 border border-white/10 bg-black/25 space-y-3">
                  <span className="block text-[10px] uppercase tracking-wider text-gray-500">Component Presentation Image</span>
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
                        <label className="inline-block px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-none text-xs cursor-pointer shadow-sm transition-all text-center">
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
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-indigo-500" 
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
                    className="px-4 py-2.5 bg-red-955/20 hover:bg-red-955/40 text-red-400 border border-red-900 rounded-none text-[10px] uppercase font-bold tracking-wider font-sans"
                  >
                    Delete Component
                  </button>
                  <button 
                    onClick={() => setActiveEditProductId(null)}
                    className="px-6 py-2.5 text-black font-bold uppercase tracking-wider text-xs shadow transition-all bg-white hover:bg-emerald-500 hover:text-white"
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
          <div className="bg-neutral-950 rounded-none max-w-lg w-full p-6 shadow-2xl border border-white/10 relative text-left">
            <button 
              onClick={() => setShowBgModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-2xl w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-1">
              Spark Background Settings
            </h3>
            <p className="text-xs text-gray-500 mb-6">Select a cyberpunk hardware preset or generate using AI.</p>

            <div className="flex border-b border-white/10 mb-6 font-semibold">
              <button 
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 font-bold text-xs uppercase tracking-widest text-center border-b-2 transition-colors ${activeTab === 'presets' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-500 hover:text-gray-400'}`}
              >
                Presets
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-2 font-bold text-xs uppercase tracking-widest text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-500 hover:text-gray-400'}`}
              >
                AI Generator
              </button>
            </div>

            {activeTab === 'presets' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
                {[
                  { name: 'Neon Cyberpunk Desk Setup', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Futuristic PC Component', url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Glowing Liquid cooling Rig', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Cyan Highlighted Gamer Room', url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Cyber Chassis Hardware', url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80' },
                  { name: 'Bright Neon Computer Station', url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=1200&q=80' }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      onUpdateConfig('header', 'heroImage', item.url);
                      setShowBgModal(false);
                    }}
                    className="cursor-pointer group relative aspect-video border border-white/5 hover:border-[#10B981] transition-all bg-black"
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
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Describe your hardware backdrop</label>
                  <textarea 
                    placeholder="e.g. cyber desk gaming rig setup with glowing liquid cooling components and green led"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-none outline-none focus:border-[#10B981] text-sm text-white resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Aesthetic Style</label>
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
                  className="w-full py-3.5 hover:opacity-90 text-black font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 bg-white hover:bg-[#10B981] hover:text-black"
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
