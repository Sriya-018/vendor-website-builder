import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
 FaShoppingCart, FaBars, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, 
 FaMapMarkerAlt, FaStore, FaWhatsapp, FaShieldAlt, FaClock, FaPaperPlane,
 FaSearch, FaFilter, FaSortAmountDown
} from 'react-icons/fa';
import EditableText from '../EditableText';
import SectionWrapper from '../SectionWrapper';

export default function TemplateGlow({ 
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
 const [selectedSkinType, setSelectedSkinType] = useState('All');

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
 const description = config.header.heroHeading || business?.description || 'Pure. Natural. Sustainable.';
 const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
 const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
 const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
 
 const primaryColor = config.theme?.primary || '#064E3B'; // Emerald 900
 const accentColor = config.theme?.accent || '#10B981'; // Emerald 500
 const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=80';

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
 if (!imgUrl) return `https://picsum.photos/seed/glow${i}/600/600`;
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
 .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
 .filter(p => selectedCategory === 'All' || (p.category || 'general') === selectedCategory)
 .filter(p => {
 if (selectedSkinType === 'All') return true;
 const term = selectedSkinType.toLowerCase().replace(' skin', '');
 return p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term);
 })
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
 <header className="relative min-h-[80vh] flex items-center overflow-hidden">
 <div className="absolute inset-0 z-0">
 <img src={heroImage} className="w-full h-full object-cover" alt="Hero Background" />
 <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(6,78,59,0.9) 35%, rgba(16,185,129,0.3))' }}></div>
 </div>
 
 {isEditable && (
 <button 
 onClick={() => setShowBgModal(true)}
 className="absolute bottom-6 right-6 z-20 px-4 py-2 bg-theme-surface/95 backdrop-blur border border-emerald-200 text-emerald-900 rounded-full font-bold text-xs shadow-theme hover:scale-105 transition-transform flex items-center gap-1.5 font-sans"
 >
 🎨 Edit Hero Background
 </button>
 )}
 <div className="relative z-10 max-w-7xl mx-auto px-8 w-full py-20" style={{ textAlign: config.header.heroAlign }}>
 <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-theme-surface/15 rounded-full text-xs font-bold text-emerald-200 border border-emerald-200/30 mb-6 backdrop-blur-sm">
 🌿 🌱 100% Natural & Organic
 </span>
 <EditableText
 isEditable={isEditable}
 value={config.header.heroHeading || description}
 onChange={(val) => onUpdateConfig('header', 'heroHeading', val)}
 tagName="h1"
 className="text-4xl md:text-6xl font-black leading-[1.1] mb-6 tracking-[-0.02em] text-slate-900 dark:text-white"
 />
 <EditableText
 isEditable={isEditable}
 value={config.header.heroSubheading || 'Ethically sourced botanical products custom-tailored for conscious consumers.'}
 onChange={(val) => onUpdateConfig('header', 'heroSubheading', val)}
 tagName="p"
 className="text-slate-900 dark:text-white/85 text-[1.1rem] leading-[1.7] mb-10 max-w-xl"
 style={{ marginInline: config.header.heroAlign === 'center' ? 'auto' : config.header.heroAlign === 'right' ? '0 0 0 auto' : '0' }}
 />
 <div className={`flex flex-wrap gap-4 ${config.header.heroAlign === 'center' ? 'justify-center' : config.header.heroAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
 <button 
 onClick={() => changePage('shop')}
 className="px-8 py-4 bg-theme-surface rounded-full font-extrabold hover:scale-105 transition-transform shadow-[0_4px_14px_rgba(255,255,255,0.3)] flex items-center gap-2"
 style={{ color: primaryColor }}
 >
 <EditableText isEditable={isEditable} value={config.header.ctaLabel || 'Shop Natural'} onChange={(val) => onUpdateConfig('header', 'ctaLabel', val)} />
 <FaArrowRight />
 </button>
 {phoneNumber && (
 <a 
 href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`}
 target="_blank"
 rel="noopener noreferrer"
 className="px-8 py-4 bg-theme-surface/15 border border-slate-900/40 dark:border-white/40 rounded-full font-bold text-slate-900 dark:text-white hover:bg-theme-surface/25 transition-all backdrop-blur-sm flex items-center"
 >
 <FaWhatsapp className="mr-2 text-lg text-emerald-300" /> Chat with Us
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
 <section id="products" className="max-w-7xl mx-auto px-8 py-20">
 <div className="text-center mb-16">
 <EditableText
 isEditable={isEditable}
 value={config.products.sectionTitle || 'Natural Collection'}
 onChange={(val) => onUpdateConfig('products', 'sectionTitle', val)}
 tagName="h2"
 className="text-3xl md:text-4xl font-black mb-3"
 style={{ color: primaryColor }}
 />
 <p className="text-emerald-700/60 font-semibold">Ethically sourced. Sustainably packaged.</p>
 <div className="w-12 h-1 rounded-full mx-auto mt-4" style={{ backgroundColor: accentColor }}></div>
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
 className="bg-theme-surface rounded-theme overflow-hidden border border-emerald-100/60 hover:shadow-[0_16px_36px_rgba(16,185,129,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
 style={{ borderRadius: 'var(--radius)' }}
 >
 <div>
 <div className="h-[230px] overflow-hidden bg-emerald-50 relative">
 <img 
 src={getProductImageUrl(product, i)}
 alt={product.name}
 className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
 />
 {product.inStock === false ? (
 <span className="absolute top-3 left-3 bg-gray-900/80 text-slate-900 dark:text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
 Out of Stock
 </span>
 ) : product.isBestseller ? (
 <span className="absolute top-3 left-3 bg-emerald-600 text-slate-900 dark:text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
 ⭐ Bestseller
 </span>
 ) : null}
 {isEditable && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 setActiveEditProductId(product._id || product.id);
 }}
 className="absolute top-3 right-3 bg-theme-surface/95 backdrop-blur border border-emerald-200 hover:bg-emerald-900 hover:text-slate-900 dark:text-white p-2 rounded-full shadow-theme transition-all duration-300 z-20 hover:scale-110 flex items-center justify-center text-sm"
 title="Edit Product Settings"
 >
 ⚙️
 </button>
 )}
 </div>
 <div className="p-6">
 <div className="inline-block bg-emerald-50 text-emerald-800 text-[0.65rem] font-black px-3 py-1 rounded-full tracking-[0.08em] uppercase mb-3">
 🌿 {product.category || 'Natural'}
 </div>
 <EditableText
 isEditable={isEditable}
 value={product.name}
 onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
 tagName="h4"
 className="font-bold text-lg mb-4 truncate"
 style={{ color: primaryColor }}
 />
 <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
 </div>
 </div>

 <div className="p-6 pt-0">
 <div className="flex items-center justify-between">
 {config.products?.showPrices !== false && (
 <div className="font-extrabold text-xl flex items-center gap-0.5" style={{ color: accentColor }}>
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
 data-cart-add={product.inStock !== false ? "true" : undefined}
 data-product-id={product._id || product.id}
 data-product-name={product.name}
 data-product-price={product.price}
 data-product-image={getProductImageUrl(product, i)}
 disabled={product.inStock === false}
 className={`px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap ml-4 ${
 product.inStock === false 
 ? 'opacity-60 cursor-not-allowed bg-gray-400 text-white' 
 : 'text-white hover:opacity-90 hover:scale-105'
 }`}
 style={product.inStock !== false ? { backgroundColor: accentColor } : {}}
 >
 {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
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
 className="px-8 py-3.5 border-2 rounded-full font-bold hover:bg-emerald-50 transition-colors"
 style={{ color: primaryColor, borderColor: primaryColor }}
 >
 Explore Collection
 </button>
 </div>
 </section>
 </SectionWrapper>
 );

 case 'gallery':
 const galleryTitle = config.gallery?.title || 'Our Organic Farm';
 const galleryImages = config.gallery?.images || [];
 return (
 <SectionWrapper key="gallery" isEditable={isEditable} sectionKey="gallery" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="max-w-7xl mx-auto px-8 py-16">
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={galleryTitle}
 onChange={(val) => onUpdateConfig('gallery', 'title', val)}
 tagName="h2"
 className="text-3xl font-black mb-3"
 style={{ color: primaryColor }}
 />
 <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
 {galleryImages.map((img, idx) => (
 <div key={idx} className="relative aspect-square rounded-theme overflow-hidden group shadow-theme border border-emerald-100/50 bg-theme-surface">
 <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
 {isEditable && (
 <div className="absolute inset-0 bg-[#064E3B]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
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
 className="w-full px-3 py-2 bg-theme-surface rounded-full text-xs text-emerald-900 border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500"
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
 <section className="max-w-4xl mx-auto px-8 py-16">
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={faqTitle}
 onChange={(val) => onUpdateConfig('faq', 'title', val)}
 tagName="h2"
 className="text-3xl font-black mb-3"
 style={{ color: primaryColor }}
 />
 <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
 </div>
 <div className="space-y-4">
 {faqList.map((item, idx) => {
 const isOpen = activeFaq === idx;
 return (
 <div key={item.id || idx} className="bg-theme-surface border border-emerald-100 rounded-theme overflow-hidden shadow-theme">
 <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full px-6 py-4 text-left font-bold text-emerald-900 flex items-center justify-between hover:bg-emerald-50/50 transition-colors">
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
 <span className="text-xl text-emerald-400">{isOpen ? '−' : '+'}</span>
 </button>
 {isOpen && (
 <div className="px-6 py-4 bg-emerald-50/20 border-t border-emerald-100 text-emerald-800 text-sm leading-relaxed">
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
 const testimonialTitle = config.testimonials?.title || 'What People Say';
 const testimonialList = config.testimonials?.list || [];
 return (
 <SectionWrapper key="testimonials" isEditable={isEditable} sectionKey="testimonials" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="bg-emerald-50/60 border-t border-b border-emerald-100 py-16 px-8">
 <div className="max-w-7xl mx-auto">
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={testimonialTitle}
 onChange={(val) => onUpdateConfig('testimonials', 'title', val)}
 tagName="h2"
 className="text-3xl font-black mb-3"
 style={{ color: primaryColor }}
 />
 <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {testimonialList.map((item, idx) => (
 <div key={item.id || idx} className="bg-theme-surface rounded-theme p-6 shadow-theme border border-emerald-100 flex flex-col justify-between">
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
 className={`text-lg transition-colors ${starIdx < item.rating ? 'text-amber-400' : 'text-slate-200'}`}
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
 className="text-emerald-800 text-sm italic leading-relaxed mb-6"
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
 className="font-bold text-emerald-950 text-sm"
 />
 <EditableText
 isEditable={isEditable}
 value={item.role}
 onChange={(val) => {
 const updated = testimonialList.map(t => t.id === item.id ? { ...t, role: val } : t);
 onUpdateConfig('testimonials', 'list', updated);
 }}
 tagName="span"
 className="text-emerald-700/60 text-xs font-semibold block mt-0.5"
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
 const hoursTitle = config.hours?.title || 'Store Working Hours';
 const hoursDays = config.hours?.days || [];
 return (
 <SectionWrapper key="hours" isEditable={isEditable} sectionKey="hours" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="bg-theme-surface py-16 px-8">
 <div className="max-w-xl mx-auto bg-emerald-50/50 border border-emerald-100 rounded-theme p-8 shadow-theme">
 <div className="text-center mb-8">
 <EditableText
 isEditable={isEditable}
 value={hoursTitle}
 onChange={(val) => onUpdateConfig('hours', 'title', val)}
 tagName="h3"
 className="text-xl font-bold mb-2"
 style={{ color: primaryColor }}
 />
 <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
 </div>
 <div className="space-y-4">
 {hoursDays.map((item, idx) => (
 <div key={idx} className="flex justify-between items-center border-b border-emerald-100 pb-3 last:border-b-0 last:pb-0">
 <span className="font-bold text-emerald-800 text-sm">{item.day}</span>
 <EditableText
 isEditable={isEditable}
 value={item.hours}
 onChange={(val) => {
 const updated = hoursDays.map(d => d.day === item.day ? { ...d, hours: val } : d);
 onUpdateConfig('hours', 'days', updated);
 }}
 tagName="span"
 className="font-bold text-emerald-950 text-sm"
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
 const countdownTitle = config.countdown?.title || 'Flash Organic Discount Event!';
 return (
 <SectionWrapper key="countdown" isEditable={isEditable} sectionKey="countdown" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="w-full py-12 px-6 text-slate-900 dark:text-white text-center relative overflow-hidden" style={{ backgroundColor: accentColor }}>
 <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
 <div className="text-left">
 <EditableText
 isEditable={isEditable}
 value={countdownTitle}
 onChange={(val) => onUpdateConfig('countdown', 'title', val)}
 tagName="h3"
 className="text-2xl font-black mb-2"
 />
 <p className="text-emerald-50 text-xs">Unlock time-restricted benefits before they dry up.</p>
 </div>
 
 <div className="flex gap-4">
 {[
 { label: 'Days', val: timeLeft.days },
 { label: 'Hours', val: timeLeft.hours },
 { label: 'Mins', val: timeLeft.minutes },
 { label: 'Secs', val: timeLeft.seconds }
 ].map((col, idx) => (
 <div key={idx} className="flex flex-col items-center bg-black/15 px-4 py-3 rounded-theme min-w-[70px] border border-slate-900/20 dark:border-white/20 backdrop-blur-sm">
 <span className="text-2xl font-black">{String(col.val).padStart(2, '0')}</span>
 <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 mt-1">{col.label}</span>
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
 <section id="contact" className="bg-emerald-50 py-16 px-8 text-center">
 <h3 className="text-2xl font-black mb-6" style={{ color: primaryColor }}>🌿 Get in Touch</h3>
 <div className="inline-block bg-theme-surface border border-emerald-100 rounded-theme p-8 text-left shadow-theme min-w-[300px] space-y-4">
 {phoneNumber && <p><strong style={{ color: accentColor }}>Phone:</strong> {phoneNumber}</p>}
 {email && <p><strong style={{ color: accentColor }}>Email:</strong> {email}</p>}
 {address && <p><strong style={{ color: accentColor }}>Address:</strong> {address}</p>}
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
 backgroundColor: '#f0fdf4',
 color: '#064e3b',
 fontFamily: "'Nunito', sans-serif",
 fontSize: 'var(--base-size)',
 lineHeight: 'var(--line-height)',
 letterSpacing: 'var(--letter-spacing)'
 }}
 >
 {/* Announcement Bar */}
 {config.header?.announcement?.show && (
 <div className="px-4 py-2 text-center text-xs font-bold text-slate-900 dark:text-white relative z-50" style={{ backgroundColor: config.header.announcement.color || accentColor }}>
 {config.header.announcement.text}
 </div>
 )}

 {/* NAV */}
 <nav className={`sticky top-0 z-50 w-full transition-all duration-300 border-b-2 border-emerald-100 ${scrolled ? 'bg-theme-surface shadow-theme' : 'bg-theme-surface'}`}>
 <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
 <div 
 className="flex items-center gap-2 cursor-pointer"
 onClick={() => !isEditable && changePage('home')}
 >
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
 ) : (
 <>
 <span className="text-[1.4rem]">🌿</span>
 <EditableText
 isEditable={isEditable}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-black text-[1.3rem] cursor-text"
 style={{ color: primaryColor }}
 />
 </>
 )}
 </div>

 {devicePreview === 'desktop' ? (
 <div className="flex gap-8 text-[0.9rem] font-bold text-emerald-800">
 {['Home', 'Shop', 'Contact'].map(page => (
 <button 
 key={page} 
 onClick={() => changePage(page.toLowerCase())}
 className={`transition-colors py-1 border-b-2 ${currentPage === page.toLowerCase() ? 'text-emerald-500 border-emerald-500' : 'border-transparent hover:text-emerald-500'}`}
 >
 {page}
 </button>
 ))}
 </div>
 ) : (
 <button onClick={() => setMenuOpen(!menuOpen)} className="text-xl text-emerald-800"><FaBars /></button>
 )}
 </div>

 {/* Mobile Menu */}
 {devicePreview !== 'desktop' && (
 <div className={`overflow-hidden transition-all bg-theme-surface border-b-2 border-emerald-100 ${menuOpen ? 'max-h-64' : 'max-h-0'}`}>
 <div className="p-4 flex flex-col gap-2 font-bold text-emerald-800">
 {['Home', 'Shop', 'Contact'].map(page => (
 <button 
 key={page} 
 onClick={() => changePage(page.toLowerCase())}
 className="p-3 hover:bg-emerald-50 rounded-theme text-left w-full"
 >
 {page}
 </button>
 ))}
 </div>
 </div>
 )}
 </nav>

 {/* RENDER PAGES */}
 {currentPage === 'home' && (
 <div className="animate-fade-in">
 {order.map(key => renderSection(key))}
 </div>
 )}

 {currentPage === 'shop' && (
 <div className="max-w-7xl mx-auto px-8 py-20 animate-fade-in">
 {/* Filter Row */}
 <div className="bg-theme-surface border border-emerald-100/80 rounded-theme p-6 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-theme">
 <div>
 <h2 className="text-2xl font-black" style={{ color: primaryColor }}>Botanical Catalog</h2>
 <p className="text-emerald-700/60 text-xs mt-1">Ethical, time-tested extracts and remedies.</p>
 </div>
 
 <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-xl md:justify-end">
 <div className="relative flex-1">
 <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
 <input 
 type="text" 
 placeholder="Search botanical items..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-950 rounded-full outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 <div className="relative">
 <select 
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value)}
 className="pl-4 pr-8 py-2.5 bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-900 rounded-full outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none font-bold"
 >
 <option value="default">Bestselling</option>
 <option value="price-low">Price: Low to High</option>
 <option value="price-high">Price: High to Low</option>
 </select>
 <FaSortAmountDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
 </div>
 </div>
 </div>

 {/* Skin Type Filters */}
 <div className="mb-8 bg-theme-surface border border-emerald-100 p-5 rounded-theme shadow-theme">
 <span className="block text-xs font-bold text-emerald-800/60 uppercase tracking-widest mb-3">Skin Type Target:</span>
 <div className="flex flex-wrap gap-2.5">
 {['All', 'Dry Skin', 'Oily Skin', 'Sensitive', 'Normal'].map(type => (
 <button 
 key={type}
 onClick={() => setSelectedSkinType(type)}
 className={`px-5 py-2 rounded-full font-bold text-xs transition-all ${selectedSkinType === type ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/50'}`}
 >
 {type}
 </button>
 ))}
 </div>
 </div>

 {/* Categories Selector */}
 <div className="flex flex-wrap gap-2.5 mb-8">
 {categoriesList.map(cat => (
 <button 
 key={cat}
 onClick={() => setSelectedCategory(cat)}
 className={`px-5 py-2 rounded-full text-xs font-bold capitalize transition-all ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-theme' : 'bg-theme-surface border border-emerald-100 text-emerald-800 hover:bg-emerald-50'}`}
 >
 {cat}
 </button>
 ))}
 </div>

 {/* Catalog Grid */}
 {sortedFilteredProducts.length === 0 ? (
 <div className="text-center py-20 bg-theme-surface border border-emerald-100 rounded-theme shadow-theme">
 <div className="text-4xl mb-3">🍃</div>
 <h3 className="font-bold text-emerald-900 text-lg">No organic items found</h3>
 <p className="text-emerald-600/60 text-xs mt-1">Try refining search parameters or filters.</p>
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
 className="bg-theme-surface rounded-theme overflow-hidden border border-emerald-100/60 hover:shadow-[0_16px_36px_rgba(16,185,129,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
 style={{ borderRadius: 'var(--radius)' }}
 >
 <div>
 <div className="h-[230px] overflow-hidden bg-emerald-50 relative">
 <img 
 src={getProductImageUrl(product, i)}
 alt={product.name}
 className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
 />
 {product.inStock === false ? (
 <span className="absolute top-3 left-3 bg-gray-900/80 text-slate-900 dark:text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
 Out of Stock
 </span>
 ) : product.isBestseller ? (
 <span className="absolute top-3 left-3 bg-emerald-600 text-slate-900 dark:text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
 ⭐ Bestseller
 </span>
 ) : null}
 {isEditable && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 setActiveEditProductId(product._id || product.id);
 }}
 className="absolute top-3 right-3 bg-theme-surface/95 backdrop-blur border border-emerald-200 hover:bg-emerald-900 hover:text-slate-900 dark:text-white p-2 rounded-full shadow-theme transition-all duration-300 z-20 hover:scale-110 flex items-center justify-center text-sm"
 title="Edit Product Settings"
 >
 ⚙️
 </button>
 )}
 </div>
 <div className="p-6">
 <div className="inline-block bg-emerald-50 text-emerald-800 text-[0.65rem] font-black px-3 py-1 rounded-full tracking-[0.08em] uppercase mb-3">
 🌿 {product.category || 'Natural'}
 </div>
 <EditableText
 isEditable={isEditable}
 value={product.name}
 onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
 tagName="h4"
 className="font-bold text-lg mb-4 truncate"
 style={{ color: primaryColor }}
 />
 <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
 </div>
 </div>

 <div className="p-6 pt-0">
 <div className="flex items-center justify-between">
 {config.products?.showPrices !== false && (
 <div className="font-extrabold text-xl flex items-center gap-0.5" style={{ color: accentColor }}>
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
 data-cart-add={product.inStock !== false ? "true" : undefined}
 data-product-id={product._id || product.id}
 data-product-name={product.name}
 data-product-price={product.price}
 data-product-image={getProductImageUrl(product, i)}
 disabled={product.inStock === false}
 className={`px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap ml-4 ${
 product.inStock === false 
 ? 'opacity-60 cursor-not-allowed bg-gray-400 text-white' 
 : 'text-white hover:opacity-90 hover:scale-105'
 }`}
 style={product.inStock !== false ? { backgroundColor: accentColor } : {}}
 >
 {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
 </button>
 )}
 </div>
 </div>
 </div>
 ))}

 {isEditable && (
 <div 
 onClick={onAddProduct}
 className="bg-theme-surface border-2 border-dashed border-emerald-200 rounded-theme p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all min-h-[300px]"
 style={{ borderRadius: 'var(--radius)' }}
 >
 <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold mb-3">+</div>
 <h4 className="font-bold text-emerald-950">Add Organic Item</h4>
 <p className="text-xs text-emerald-700/60 mt-1 max-w-[180px]">Insert a new product record card.</p>
 </div>
 )}
 </div>
 )}
 </div>
 )}

 {currentPage === 'contact' && (
 <div className="max-w-7xl mx-auto px-8 py-20 animate-fade-in text-emerald-900">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 {/* Info cards */}
 <div className="space-y-6">
 <div>
 <h2 className="text-3xl font-black" style={{ color: primaryColor }}>Get in Touch</h2>
 <p className="text-emerald-700/60 text-sm mt-1">Reach out directly regarding wholesale or private consulting.</p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 {phoneNumber && (
 <div className="bg-theme-surface border border-emerald-100 rounded-theme p-6 shadow-theme flex items-center gap-4">
 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-theme flex items-center justify-center text-xl shrink-0"><FaPhoneAlt /></div>
 <div>
 <div className="text-[10px] font-bold text-emerald-700/40 uppercase tracking-widest">Call Us</div>
 <div className="font-bold text-emerald-950 text-sm break-all">{phoneNumber}</div>
 </div>
 </div>
 )}
 {email && (
 <div className="bg-theme-surface border border-emerald-100 rounded-theme p-6 shadow-theme flex items-center gap-4">
 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-theme flex items-center justify-center text-xl shrink-0"><FaEnvelope /></div>
 <div>
 <div className="text-[10px] font-bold text-emerald-700/40 uppercase tracking-widest">Email Us</div>
 <div className="font-bold text-emerald-950 text-sm break-all">{email}</div>
 </div>
 </div>
 )}
 {address && (
 <div className="bg-theme-surface border border-emerald-100 rounded-theme p-6 shadow-theme flex items-center gap-4 sm:col-span-2">
 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-theme flex items-center justify-center text-xl shrink-0"><FaMapMarkerAlt /></div>
 <div>
 <div className="text-[10px] font-bold text-emerald-700/40 uppercase tracking-widest">Store Address</div>
 <div className="font-bold text-emerald-950 text-sm">{address}</div>
 </div>
 </div>
 )}
 </div>

 {/* Hours Card */}
 <div className="bg-theme-surface border border-emerald-100 rounded-theme p-8 shadow-theme">
 <h3 className="font-bold text-xl mb-4" style={{ color: primaryColor }}>{config.hours?.title || 'Business Hours'}</h3>
 <div className="space-y-3">
 {(config.hours?.days || []).map((item, idx) => (
 <div key={idx} className="flex justify-between items-center border-b border-emerald-50 pb-2.5 last:border-b-0 last:pb-0">
 <span className="font-semibold text-emerald-800 text-sm">{item.day}</span>
 <span className="font-bold text-emerald-950 text-sm">{item.hours}</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Form */}
 <div className="bg-theme-surface border border-emerald-100 rounded-theme p-8 md:p-10 shadow-theme relative overflow-hidden">
 <h3 className="text-2xl font-black mb-6" style={{ color: primaryColor }}>Send Inquiry</h3>
 
 {formSubmitted && (
 <div className="absolute inset-0 bg-theme-surface/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
 <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce"><FaPaperPlane /></div>
 <h4 className="font-bold text-emerald-950 text-xl">Inquiry Sent Successfully</h4>
 <p className="text-emerald-700/60 text-sm mt-1 max-w-[280px]">Our botanical experts will examine your inquiry post-haste.</p>
 </div>
 )}

 <form onSubmit={handleContactSubmit} className="space-y-5 text-left">
 <div>
 <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Full Name</label>
 <input 
 type="text" 
 placeholder="Jane Doe" 
 value={contactForm.name}
 onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
 className="w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-theme outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Email Address</label>
 <input 
 type="email" 
 placeholder="jane@example.com" 
 value={contactForm.email}
 onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
 className="w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-theme outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Inquiry Details</label>
 <textarea 
 placeholder="How may we assist you today?" 
 value={contactForm.message}
 onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
 rows={4}
 className="w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-theme outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
 />
 </div>

 <button 
 type="submit"
 className="w-full py-4 rounded-full text-slate-900 dark:text-white font-extrabold shadow hover:opacity-95 transition-opacity"
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
 <footer className="pt-16 pb-8 px-6 text-emerald-200" style={{ backgroundColor: primaryColor }}>
 <div className="max-w-7xl mx-auto">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
 <div className="md:col-span-2">
 <div className="flex items-center gap-2 mb-6">
 <span className="text-[1.4rem]">🌿</span>
 <span className="font-black text-[1.3rem] text-slate-900 dark:text-white">{storeName}</span>
 </div>
 <EditableText
 isEditable={isEditable}
 value={config.footer?.tagline || '100% natural, ethically sourced and handcrafted products.'}
 onChange={(val) => onUpdateConfig('footer', 'tagline', val)}
 tagName="p"
 className="leading-relaxed max-w-sm mb-6 text-emerald-200/70 text-sm"
 />
 {phoneNumber && (
 <p className="flex items-center text-slate-900 dark:text-white font-medium">
 <FaPhoneAlt className="mr-2" style={{ color: accentColor }} /> {phoneNumber}
 </p>
 )}
 </div>
 
 <div>
 <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-6">Quick Links</h4>
 <ul className="space-y-3 text-sm text-emerald-200/80">
 <li><button onClick={() => changePage('home')} className="hover:text-slate-900 dark:text-white transition-colors">Home</button></li>
 <li><button onClick={() => changePage('shop')} className="hover:text-slate-900 dark:text-white transition-colors">Shop</button></li>
 <li><button onClick={() => changePage('contact')} className="hover:text-slate-900 dark:text-white transition-colors">Contact</button></li>
 </ul>
 </div>
 
 <div>
 <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-6">Newsletter</h4>
 <div className="flex">
 <input type="email" placeholder="Your email" className="bg-emerald-950 text-slate-900 dark:text-white px-4 py-3 rounded-l-full outline-none focus:ring-1 focus:ring-emerald-200 border-none flex-1 text-sm" style={{ border: 'none' }} />
 <button className="text-slate-900 dark:text-white px-5 py-3 rounded-r-full font-bold text-sm" style={{ backgroundColor: accentColor }}><FaPaperPlane /></button>
 </div>
 </div>
 </div>
 
 <div className="border-t border-emerald-800 pt-8 flex flex-wrap justify-between items-center gap-4 text-emerald-200/50 text-sm">
 <p>© 2026 {storeName}. All rights reserved.</p>
 
 <div className="flex gap-6 opacity-80">
 {config.trust?.badges?.secure && <span className="flex items-center"><FaShieldAlt className="mr-1" /> Secure</span>}
 {config.trust?.badges?.returns && <span className="flex items-center"><FaClock className="mr-1" /> 30 Days</span>}
 </div>

 <p>Powered by <span className="text-slate-900 dark:text-white font-bold">VendorBuild</span></p>
 </div>
 </div>
 </footer>

 {/* Inline Product Settings Modal Overlay */}
 {isEditable && activeEditProductId && (() => {
 const product = products.find(p => (p._id || p.id) === activeEditProductId);
 if (!product) return null;
 return (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
 <div className="bg-theme-surface rounded-theme max-w-lg w-full p-6 shadow-theme relative font-sans text-theme-text text-left animate-fade-in border border-emerald-100">
 <button 
 onClick={() => setActiveEditProductId(null)}
 className="absolute top-4 right-4 text-gray-400 hover:text-theme-muted font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
 >
 ×
 </button>
 <h3 className="text-xl font-extrabold text-emerald-900 mb-1">
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
 className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
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
 className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
 />
 </div>

 {/* Category */}
 <div>
 <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Category</label>
 <input 
 type="text"
 value={product.category || ''}
 placeholder="e.g. Skincare, Spa, Herbal"
 onChange={(e) => onUpdateProduct(product._id || product.id, 'category', e.target.value)}
 className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
 />
 </div>
 </div>

 {/* Description */}
 <div>
 <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Description & Target Skin Type</label>
 <textarea 
 value={product.description || ''}
 placeholder="Describe product benefits. Include terms like 'Dry Skin', 'Oily Skin', 'Sensitive' or 'Normal' so customers can filter products on the page!"
 onChange={(e) => onUpdateProduct(product._id || product.id, 'description', e.target.value)}
 rows={3}
 className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
 />
 </div>

 <div className="grid grid-cols-2 gap-4 py-1.5">
 {/* Bestseller Badge */}
 <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-emerald-50/20 hover:bg-emerald-50/45 border border-emerald-100/60 rounded-theme transition-all">
 <input 
 type="checkbox"
 checked={!!product.isBestseller}
 onChange={(e) => onUpdateProduct(product._id || product.id, 'isBestseller', e.target.checked)}
 className="w-4 h-4 accent-emerald-600 cursor-pointer"
 />
 <div className="text-xs font-bold text-gray-700 select-none">
 ⭐ Mark as Bestseller
 </div>
 </label>

 {/* In Stock Toggle */}
 <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-emerald-50/20 hover:bg-emerald-50/45 border border-emerald-100/60 rounded-theme transition-all">
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
 className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
 placeholder="Quantity in Stock"
 />
 </div>

 {/* Product Image Section */}
 <div className="p-4 border border-emerald-100 rounded-theme bg-emerald-50/20 space-y-3">
 <span className="block text-xs font-bold text-emerald-900 uppercase">Product Image</span>
 
 <div className="flex gap-4 items-center">
 <div className="w-20 h-20 rounded-theme overflow-hidden bg-emerald-50 border border-emerald-200 shrink-0">
 <img 
 src={getProductImageUrl(product, 0)} 
 className="w-full h-full object-cover" 
 alt="Product preview" 
 />
 </div>

 <div className="flex-1 space-y-2">
 {/* Local File Upload */}
 <div>
 <label className="inline-block px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-theme text-xs cursor-pointer shadow-theme transition-all text-center">
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
 className="w-full px-3 py-1.5 bg-[#ffffff] border border-theme-border rounded-theme text-xs outline-none focus:ring-1 focus:ring-emerald-500" 
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
 className="px-6 py-2.5 bg-emerald-900 hover:opacity-90 text-slate-900 dark:text-white rounded-full font-bold text-xs shadow transition-all"
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
 <div className="bg-theme-surface rounded-theme max-w-lg w-full p-6 shadow-theme relative font-sans text-theme-text text-left animate-fade-in border border-emerald-100">
 <button 
 onClick={() => setShowBgModal(false)}
 className="absolute top-4 right-4 text-gray-400 hover:text-gray-650 font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
 >
 ×
 </button>
 <h3 className="text-xl font-extrabold text-emerald-950 mb-1">
 Header Background Settings
 </h3>
 <p className="text-xs text-theme-muted mb-6">Select a hand-picked wellness preset or generate an image using AI.</p>

 <div className="flex border-b border-theme-border mb-6 font-semibold">
 <button 
 onClick={() => setActiveTab('presets')}
 className={`flex-1 py-2 font-bold text-sm text-center border-b-2 transition-colors ${activeTab === 'presets' ? 'border-emerald-600 text-emerald-650' : 'border-transparent text-gray-450 hover:text-theme-muted'}`}
 >
 Curated Presets
 </button>
 <button 
 onClick={() => setActiveTab('ai')}
 className={`flex-1 py-2 font-bold text-sm text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-emerald-600 text-emerald-650' : 'border-transparent text-gray-455 hover:text-theme-muted'}`}
 >
 AI Background Generator
 </button>
 </div>

 {activeTab === 'presets' ? (
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
 {[
 { name: 'Organic Herb Leaves', url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Green Tea & Droplets', url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Fresh Botanical Garden', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Moisturizer & Aloe', url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Misty Woods Nature', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Pure White Soap', url: 'https://images.unsplash.com/photo-1607006342411-9a3363e6394e?auto=format&fit=crop&w=1200&q=80' }
 ].map((item, idx) => (
 <div 
 key={idx}
 onClick={() => {
 onUpdateConfig('header', 'heroImage', item.url);
 setShowBgModal(false);
 }}
 className="cursor-pointer group relative aspect-video rounded-theme overflow-hidden border-2 border-transparent hover:border-emerald-600 transition-all bg-gray-100"
 >
 <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name} />
 <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
 <span className="text-[10px] text-slate-900 dark:text-white font-bold leading-tight truncate">{item.name}</span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Describe your background image</label>
 <textarea 
 placeholder="e.g. green botanical leaves, luxury spa wellness setup, fresh natural tea background"
 value={aiPrompt}
 onChange={(e) => setAiPrompt(e.target.value)}
 rows={3}
 className="w-full px-4 py-3 bg-emerald-50/20 border border-emerald-100 rounded-theme outline-none focus:ring-2 focus:ring-emerald-600 text-sm resize-none"
 />
 </div>

 <div className="flex gap-4">
 <div className="flex-1">
 <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Aesthetic Style</label>
 <select 
 value={aiStyle} 
 onChange={(e) => setAiStyle(e.target.value)}
 className="w-full p-3 bg-emerald-50/20 border border-emerald-100 rounded-theme outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-bold bg-theme-surface"
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
 className="w-full py-3.5 hover:opacity-90 text-slate-900 dark:text-white font-bold rounded-full shadow transition-colors flex items-center justify-center gap-2"
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
